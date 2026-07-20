import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const repoRoot = new URL("../..", import.meta.url).pathname;

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 180000,
    ...options,
  });
}

function runResult(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 60000,
    ...options,
  });
}

function packPackage(packagePath, destination) {
  const before = new Set(readdirSync(destination));
  run(
    "pnpm",
    [
      "--dir",
      join(repoRoot, packagePath),
      "pack",
      "--pack-destination",
      destination,
    ],
    { cwd: repoRoot },
  );
  const created = readdirSync(destination).filter(
    (file) => file.endsWith(".tgz") && !before.has(file),
  );
  assert.equal(created.length, 1, `${packagePath} should pack one tarball`);
  return join(destination, created[0]);
}

function prepareConsumer(directory, packages) {
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    join(directory, "package.json"),
    JSON.stringify({ private: true, type: "module" }, null, 2),
  );
  run(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--omit=optional",
      ...packages,
    ],
    { cwd: directory },
  );
}

test("packed Kanban route preserves the explicit optional-peer boundary", () => {
  for (const relativePath of [
    "packages/hua-dot/dist/index.mjs",
    "packages/hua-motion-core/dist/index.mjs",
    "packages/hua-ui/dist/index.mjs",
    "packages/hua-ui/dist/interactive.mjs",
    "packages/hua-ui/dist/interactive-kanban.mjs",
    "packages/hua-ui/dist/interactive/kanban.d.ts",
  ]) {
    assert.ok(
      existsSync(join(repoRoot, relativePath)),
      `${relativePath} is required before installed-boundary smoke`,
    );
  }

  const root = mkdtempSync(join(tmpdir(), "hua-ui-kanban-installed-"));
  try {
    const tarballs = join(root, "tarballs");
    mkdirSync(tarballs, { recursive: true });
    const dotTarball = packPackage("packages/hua-dot", tarballs);
    const motionTarball = packPackage("packages/hua-motion-core", tarballs);
    const uiTarball = packPackage("packages/hua-ui", tarballs);

    const entries = run("tar", ["-tzf", uiTarball]).split("\n");
    for (const forbidden of [
      "KanbanBoard.test",
      "hua-ui-kanban-installed-boundary",
      "m768-hua-ui-kanban",
      "해온-m768-hua-ui-kanban",
    ]) {
      assert.equal(
        entries.some((entry) => entry.includes(forbidden)),
        false,
        `${forbidden} must not leak into the tarball`,
      );
    }

    const absentConsumer = join(root, "absent-consumer");
    prepareConsumer(absentConsumer, [
      dotTarball,
      motionTarball,
      uiTarball,
      "react@19.2.4",
    ]);
    run(
      "node",
      [
        "--input-type=module",
        "-e",
        "await import('@hua-labs/ui'); await import('@hua-labs/ui/interactive');",
      ],
      {
        cwd: absentConsumer,
      },
    );
    const absentKanban = runResult(
      "node",
      [
        "--input-type=module",
        "-e",
        "await import('@hua-labs/ui/interactive/kanban');",
      ],
      { cwd: absentConsumer },
    );
    assert.notEqual(absentKanban.status, 0);
    assert.match(
      `${absentKanban.stdout}\n${absentKanban.stderr}`,
      /@dnd-kit\/(core|sortable|utilities)/,
    );

    const presentConsumer = join(root, "present-consumer");
    prepareConsumer(presentConsumer, [
      dotTarball,
      motionTarball,
      uiTarball,
      "react@19.2.4",
      "react-dom@19.2.4",
      "@dnd-kit/core@6.3.1",
      "@dnd-kit/sortable@10.0.0",
      "@dnd-kit/utilities@3.2.2",
      "@types/react@19.2.14",
      "@types/react-dom@19.2.3",
      "typescript@5.9.3",
    ]);

    writeFileSync(
      join(presentConsumer, "positive.tsx"),
      String.raw`
import { KanbanBoard, type KanbanCardType, type KanbanColumnType } from "@hua-labs/ui/interactive/kanban";

const columns: KanbanColumnType[] = [{ id: "todo", title: "Todo" }];
const cards: KanbanCardType[] = [{ id: "a", columnId: "todo", title: "A" }];
export const board = <KanbanBoard columns={columns} cards={cards} />;
`,
    );
    writeFileSync(
      join(presentConsumer, "tsconfig.json"),
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            module: "NodeNext",
            moduleResolution: "NodeNext",
            jsx: "react-jsx",
            strict: true,
            skipLibCheck: true,
            noEmit: true,
          },
          include: ["positive.tsx"],
        },
        2,
      ),
    );
    run("npx", ["tsc", "-p", "tsconfig.json"], { cwd: presentConsumer });

    writeFileSync(
      join(presentConsumer, "probe.mjs"),
      String.raw`
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { KanbanBoard } from "@hua-labs/ui/interactive/kanban";

const columns = [{ id: "todo", title: "Todo" }, { id: "done", title: "Done", limit: 1 }];
const cards = [{ id: "a", columnId: "todo", order: 0, title: "A" }];
const element = createElement(KanbanBoard, { columns, cards, allowAddCard: false });
const first = renderToStaticMarkup(element);
assert.equal(renderToStaticMarkup(element), first);
assert.match(first, /role="region"/);
assert.match(first, /칸반 보드/);
assert.doesNotMatch(first, /touch-action:none/);

const manifest = JSON.parse(await (await import("node:fs/promises")).readFile(new URL("./node_modules/@hua-labs/ui/package.json", import.meta.url), "utf8"));
assert.equal(manifest.peerDependencies["@dnd-kit/core"], "^6.3.1");
assert.equal(manifest.peerDependencies["@dnd-kit/sortable"], "^10.0.0");
assert.equal(manifest.peerDependencies["@dnd-kit/utilities"], "^3.2.2");
assert.deepEqual(manifest.peerDependenciesMeta["@dnd-kit/core"], { optional: true });
assert.deepEqual(manifest.peerDependenciesMeta["@dnd-kit/sortable"], { optional: true });
assert.deepEqual(manifest.peerDependenciesMeta["@dnd-kit/utilities"], { optional: true });
console.log("hua-ui Kanban installed boundary ok");
`,
    );
    assert.match(
      run("node", ["probe.mjs"], { cwd: presentConsumer }),
      /hua-ui Kanban installed boundary ok/,
    );

    const installedManifest = JSON.parse(
      readFileSync(
        join(presentConsumer, "node_modules/@hua-labs/ui/package.json"),
        "utf8",
      ),
    );
    assert.deepEqual(installedManifest.exports["./interactive/kanban"], {
      types: "./dist/interactive/kanban.d.ts",
      import: "./dist/interactive-kanban.mjs",
      default: "./dist/interactive-kanban.mjs",
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
