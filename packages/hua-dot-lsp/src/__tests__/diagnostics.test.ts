import { describe, expect, it } from "vitest";
import { TextDocument } from "vscode-languageserver-textdocument";
import { buildDotDiagnostics, getCssOnlyPrefix } from "../diagnostics.js";
import { getAllCompletions } from "../completions.js";

function diagnosticsFor(source: string) {
  const doc = TextDocument.create(
    "file:///test.tsx",
    "typescriptreact",
    1,
    source,
  );
  return buildDotDiagnostics(
    source,
    doc.positionAt.bind(doc),
    getAllCompletions(),
  );
}

function targetDiagnosticsFor(
  source: string,
  target: "web" | "native" | "flutter",
) {
  const doc = TextDocument.create(
    "file:///test.tsx",
    "typescriptreact",
    1,
    source,
  );
  return buildDotDiagnostics(
    source,
    doc.positionAt.bind(doc),
    getAllCompletions(),
    { target },
  );
}

describe("getCssOnlyPrefix", () => {
  it("detects CSS-only variants", () => {
    expect(getCssOnlyPrefix("md:hidden")).toBe("md");
    expect(getCssOnlyPrefix("hover:bg-muted")).toBe("hover");
    expect(getCssOnlyPrefix("group-hover:text-white")).toBe("group-hover");
    expect(getCssOnlyPrefix("peer-focus-visible:ring-2")).toBe(
      "peer-focus-visible",
    );
    expect(getCssOnlyPrefix("before:content-['']")).toBe("before");
    expect(getCssOnlyPrefix("dark:bg-neutral-900")).toBe("dark");
  });

  it("ignores ordinary tokens and arbitrary-value colons", () => {
    expect(getCssOnlyPrefix("p-4")).toBeNull();
    expect(getCssOnlyPrefix("bg-white")).toBeNull();
    expect(getCssOnlyPrefix("text-[color:red]")).toBeNull();
    expect(getCssOnlyPrefix("")).toBeNull();
    expect(getCssOnlyPrefix(":leading")).toBeNull();
  });
});

describe("buildDotDiagnostics", () => {
  it("emits no diagnostics for recognized tokens", () => {
    const diagnostics = diagnosticsFor(
      `const style = dot("p-4 flex items-center");`,
    );
    expect(diagnostics).toEqual([]);
  });

  it("emits CSS-only variant diagnostics inside dot regions", () => {
    const diagnostics = diagnosticsFor(
      `const style = dot("p-4 hover:bg-blue-500");`,
    );

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain("hover:bg-blue-500");
    expect(diagnostics[0].message).toContain("variants require dotClass()");
    expect(diagnostics[0].source).toBe("dot-lsp");
  });

  it("emits unknown-token diagnostics inside dot regions", () => {
    const diagnostics = diagnosticsFor(
      `const style = dot("p-4 fake-utility-xyz");`,
    );

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toBe(
      'Unknown dot utility: "fake-utility-xyz"',
    );
    expect(diagnostics[0].source).toBe("dot-lsp");
  });

  it("strips non-CSS-only variant and important prefixes before unknown-token checks", () => {
    const diagnostics = diagnosticsFor(`const style = dot("custom:p-4 !m-2");`);
    expect(diagnostics).toEqual([]);
  });

  it("uses dot engine fallback for tokens outside the completion list", () => {
    const source = `const style = dot("sr-only not-sr-only");`;
    const doc = TextDocument.create(
      "file:///test.tsx",
      "typescriptreact",
      1,
      source,
    );

    const diagnostics = buildDotDiagnostics(
      source,
      doc.positionAt.bind(doc),
      [],
    );

    expect(diagnostics).toEqual([]);
  });

  it("does not inspect tokens outside dot regions", () => {
    const diagnostics = diagnosticsFor(`const className = "fake-utility-xyz";`);
    expect(diagnostics).toEqual([]);
  });

  it("emits no target caveats unless a target is provided", () => {
    const diagnostics = diagnosticsFor(`const style = dot("p-4 blur-md");`);
    expect(diagnostics).toEqual([]);
  });

  it("emits no diagnostics for object-position without a configured target", () => {
    const diagnostics = diagnosticsFor(`const style = dot("object-center");`);
    expect(diagnostics).toEqual([]);
  });

  it("emits no diagnostics for transition utilities without a configured target", () => {
    const diagnostics = diagnosticsFor(
      `const style = dot("transition-all duration-300 ease-in-out");`,
    );
    expect(diagnostics).toEqual([]);
  });

  it("emits native target caveats for recognized dropped tokens", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("p-4 blur-md");`,
      "native",
    );

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('"blur-md"');
    expect(diagnostics[0].message).toContain("native target caveats");
    expect(diagnostics[0].message).toContain("drops filter");
    expect(diagnostics[0].message).toContain("filter=unsupported");
    expect(diagnostics[0].message).toContain(
      "filter=unsupported (Filter, visual-effect)",
    );
    expect(diagnostics[0].source).toBe("dot-lsp");
  });

  it("emits flutter recipe-only target caveats for recognized tokens", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("relative");`,
      "flutter",
    );

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('"relative"');
    expect(diagnostics[0].message).toContain("flutter capability caveats");
    expect(diagnostics[0].message).toContain("position=recipe-only");
    expect(diagnostics[0].message).toContain(
      "position=recipe-only (Positioning, layout)",
    );
  });

  it("emits flutter plugin-backed backdrop filter caveats for recognized tokens", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("backdrop-blur-md");`,
      "flutter",
    );

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('"backdrop-blur-md"');
    expect(diagnostics[0].message).toContain("flutter target caveats");
    expect(diagnostics[0].message).toContain("drops backdropFilter");
    expect(diagnostics[0].message).toContain("backdropFilter=plugin-backed");
    expect(diagnostics[0].message).toContain(
      "backdropFilter=plugin-backed (Backdrop Filter, visual-effect)",
    );
  });

  it("uses ring composition metadata without relabeling shadow caveats", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("shadow-xl ring-2");`,
      "native",
    );

    expect(diagnostics).toHaveLength(2);
    expect(diagnostics[0].message).toContain('"shadow-xl"');
    expect(diagnostics[0].message).toContain(
      "boxShadow=approximate (Shadow, visual-effect)",
    );
    expect(diagnostics[1].message).toContain('"ring-2"');
    expect(diagnostics[1].message).toContain(
      "boxShadow=unsupported (Ring, visual-effect)",
    );
    expect(diagnostics[1].message).not.toContain("(Shadow, visual-effect)");
  });

  it("uses divide composition metadata for class-mode divide caveats", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("divide-y-2 divide-gray-200");`,
      "native",
    );

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('"divide-y-2"');
    expect(diagnostics[0].message).toContain(
      "drops divide-y/x (class-mode-only) (Divide, box-model)",
    );
  });

  it("emits native object-fit approximation caveats for recognized tokens", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("overflow-hidden object-cover");`,
      "native",
    );

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('"object-cover"');
    expect(diagnostics[0].message).toContain("native target caveats");
    expect(diagnostics[0].message).toContain("approximates objectFit");
    expect(diagnostics[0].message).toContain("objectFit=approximate");
  });

  it("emits flutter object-fit recipe-only caveats for recognized tokens", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("object-cover");`,
      "flutter",
    );

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('"object-cover"');
    expect(diagnostics[0].message).toContain("flutter target caveats");
    expect(diagnostics[0].message).toContain("drops objectFit");
    expect(diagnostics[0].message).toContain("objectFit=recipe-only");
  });

  it("emits native object-position unsupported caveats for recognized tokens", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("object-center");`,
      "native",
    );

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('"object-center"');
    expect(diagnostics[0].message).toContain("native target caveats");
    expect(diagnostics[0].message).toContain("drops objectPosition");
    expect(diagnostics[0].message).toContain("objectPosition=unsupported");
  });

  it("emits flutter object-position unsupported caveats for recognized tokens", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("object-center");`,
      "flutter",
    );

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('"object-center"');
    expect(diagnostics[0].message).toContain("flutter target caveats");
    expect(diagnostics[0].message).toContain("drops objectPosition");
    expect(diagnostics[0].message).toContain("objectPosition=unsupported");
  });

  it("emits no web target caveats for overflow axis and scroll utilities", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("overflow-x-auto overflow-y-hidden scroll-smooth scroll-mt-4 scroll-px-2");`,
      "web",
    );

    expect(diagnostics).toEqual([]);
  });

  it("emits native overflow axis and scroll unsupported caveats for recognized tokens", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("overflow-x-auto overflow-y-hidden scroll-smooth scroll-mt-4 scroll-px-2");`,
      "native",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"overflow-x-auto" has native target caveats: drops overflowX; capabilities overflowX=unsupported (Overflow Axis, layout).`,
      `"overflow-y-hidden" has native target caveats: drops overflowY; capabilities overflowY=unsupported (Overflow Axis, layout).`,
      `"scroll-smooth" has native target caveats: drops scrollBehavior; capabilities scrollBehavior=unsupported (Scroll, layout).`,
      `"scroll-mt-4" has native target caveats: drops scrollMarginTop; capabilities scrollMarginTop=unsupported (Scroll, layout).`,
      `"scroll-px-2" has native target caveats: drops scrollPaddingLeft, scrollPaddingRight; capabilities scrollPaddingLeft=unsupported (Scroll, layout), scrollPaddingRight=unsupported (Scroll, layout).`,
    ]);
  });

  it("emits flutter overflow axis and scroll unsupported caveats for recognized tokens", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("overflow-x-auto overflow-y-hidden scroll-smooth scroll-mt-4 scroll-px-2");`,
      "flutter",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"overflow-x-auto" has flutter target caveats: drops overflowX; capabilities overflowX=unsupported (Overflow Axis, layout).`,
      `"overflow-y-hidden" has flutter target caveats: drops overflowY; capabilities overflowY=unsupported (Overflow Axis, layout).`,
      `"scroll-smooth" has flutter target caveats: drops scrollBehavior; capabilities scrollBehavior=unsupported (Scroll, layout).`,
      `"scroll-mt-4" has flutter target caveats: drops scrollMarginTop; capabilities scrollMarginTop=unsupported (Scroll, layout).`,
      `"scroll-px-2" has flutter target caveats: drops scrollPaddingLeft, scrollPaddingRight; capabilities scrollPaddingLeft=unsupported (Scroll, layout), scrollPaddingRight=unsupported (Scroll, layout).`,
    ]);
  });

  it("emits no web target caveats for transition utilities", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("transition-all duration-300 ease-in-out");`,
      "web",
    );

    expect(diagnostics).toEqual([]);
  });

  it("emits native transition unsupported caveats for recognized tokens", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("transition-all duration-300 ease-in-out");`,
      "native",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"transition-all" has native target caveats: drops transitionProperty; capabilities transitionProperty=unsupported (Transition, visual-effect).`,
      `"duration-300" has native target caveats: drops transitionDuration; capabilities transitionDuration=unsupported (Transition, visual-effect).`,
      `"ease-in-out" has native target caveats: drops transitionTimingFunction; capabilities transitionTimingFunction=unsupported (Transition, visual-effect).`,
    ]);
  });

  it("emits flutter transition unsupported caveats for recognized tokens", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("transition-all duration-300 ease-in-out");`,
      "flutter",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"transition-all" has flutter target caveats: drops transitionProperty; capabilities transitionProperty=unsupported (Transition, visual-effect).`,
      `"duration-300" has flutter target caveats: drops transitionDuration; capabilities transitionDuration=unsupported (Transition, visual-effect).`,
      `"ease-in-out" has flutter target caveats: drops transitionTimingFunction; capabilities transitionTimingFunction=unsupported (Transition, visual-effect).`,
    ]);
  });

  it("emits no web target caveats for animation utilities", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("animate-spin");`,
      "web",
    );

    expect(diagnostics).toEqual([]);
  });

  it("emits native animation unsupported caveats for recognized tokens", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("animate-spin");`,
      "native",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"animate-spin" has native target caveats: drops animation; capabilities animation=unsupported (Animation, visual-effect).`,
    ]);
  });

  it("emits flutter animation unsupported caveats for recognized tokens", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("animate-spin");`,
      "flutter",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"animate-spin" has flutter target caveats: drops animation; capabilities animation=unsupported (Animation, visual-effect).`,
    ]);
  });

  it("emits no web target caveats for animation composition utilities", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("animate-in fade-in-50 zoom-in-95");`,
      "web",
    );

    expect(diagnostics).toEqual([]);
  });

  it("emits native animation composition unsupported caveats with animation metadata", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("animate-in fade-in-50 zoom-in-95");`,
      "native",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"animate-in" has native target caveats: drops animationName, animationDuration, animationTimingFunction, animationFillMode; capabilities animationName=unsupported (Animation, visual-effect), animationDuration=unsupported (Animation, visual-effect), animationTimingFunction=unsupported (Animation, visual-effect), animationFillMode=unsupported (Animation, visual-effect).`,
      `"fade-in-50" has native target caveats: drops --tw-enter-opacity; capabilities --tw-enter-opacity=unsupported (Animation, visual-effect).`,
      `"zoom-in-95" has native target caveats: drops --tw-enter-scale; capabilities --tw-enter-scale=unsupported (Animation, visual-effect).`,
    ]);
  });

  it("emits flutter animation composition unsupported caveats with animation metadata", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("animate-in fade-in-50 zoom-in-95");`,
      "flutter",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"animate-in" has flutter target caveats: drops animationName, animationDuration, animationTimingFunction, animationFillMode; capabilities animationName=unsupported (Animation, visual-effect), animationDuration=unsupported (Animation, visual-effect), animationTimingFunction=unsupported (Animation, visual-effect), animationFillMode=unsupported (Animation, visual-effect).`,
      `"fade-in-50" has flutter target caveats: drops --tw-enter-opacity; capabilities --tw-enter-opacity=unsupported (Animation, visual-effect).`,
      `"zoom-in-95" has flutter target caveats: drops --tw-enter-scale; capabilities --tw-enter-scale=unsupported (Animation, visual-effect).`,
    ]);
  });

  it("emits no web target caveats for animation exit composition utilities", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("animate-out fade-out-0 zoom-out-95");`,
      "web",
    );

    expect(diagnostics).toEqual([]);
  });

  it("emits native animation exit composition unsupported caveats with animation metadata", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("animate-out fade-out-0 zoom-out-95");`,
      "native",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"animate-out" has native target caveats: drops animationName, animationDuration, animationTimingFunction, animationFillMode; capabilities animationName=unsupported (Animation, visual-effect), animationDuration=unsupported (Animation, visual-effect), animationTimingFunction=unsupported (Animation, visual-effect), animationFillMode=unsupported (Animation, visual-effect).`,
      `"fade-out-0" has native target caveats: drops --tw-exit-opacity; capabilities --tw-exit-opacity=unsupported (Animation, visual-effect).`,
      `"zoom-out-95" has native target caveats: drops --tw-exit-scale; capabilities --tw-exit-scale=unsupported (Animation, visual-effect).`,
    ]);
  });

  it("emits flutter animation exit composition unsupported caveats with animation metadata", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("animate-out fade-out-0 zoom-out-95");`,
      "flutter",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"animate-out" has flutter target caveats: drops animationName, animationDuration, animationTimingFunction, animationFillMode; capabilities animationName=unsupported (Animation, visual-effect), animationDuration=unsupported (Animation, visual-effect), animationTimingFunction=unsupported (Animation, visual-effect), animationFillMode=unsupported (Animation, visual-effect).`,
      `"fade-out-0" has flutter target caveats: drops --tw-exit-opacity; capabilities --tw-exit-opacity=unsupported (Animation, visual-effect).`,
      `"zoom-out-95" has flutter target caveats: drops --tw-exit-scale; capabilities --tw-exit-scale=unsupported (Animation, visual-effect).`,
    ]);
  });

  it("emits no web target caveats for animation enter slide composition utilities", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("animate-in slide-in-from-top-2");`,
      "web",
    );

    expect(diagnostics).toEqual([]);
  });

  it("emits native animation enter slide composition unsupported caveats with animation metadata", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("animate-in slide-in-from-top-2");`,
      "native",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"animate-in" has native target caveats: drops animationName, animationDuration, animationTimingFunction, animationFillMode; capabilities animationName=unsupported (Animation, visual-effect), animationDuration=unsupported (Animation, visual-effect), animationTimingFunction=unsupported (Animation, visual-effect), animationFillMode=unsupported (Animation, visual-effect).`,
      `"slide-in-from-top-2" has native target caveats: drops --tw-enter-translate-y; capabilities --tw-enter-translate-y=unsupported (Animation, visual-effect).`,
    ]);
  });

  it("emits flutter animation enter slide composition unsupported caveats with animation metadata", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("animate-in slide-in-from-top-2");`,
      "flutter",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"animate-in" has flutter target caveats: drops animationName, animationDuration, animationTimingFunction, animationFillMode; capabilities animationName=unsupported (Animation, visual-effect), animationDuration=unsupported (Animation, visual-effect), animationTimingFunction=unsupported (Animation, visual-effect), animationFillMode=unsupported (Animation, visual-effect).`,
      `"slide-in-from-top-2" has flutter target caveats: drops --tw-enter-translate-y; capabilities --tw-enter-translate-y=unsupported (Animation, visual-effect).`,
    ]);
  });

  it("emits no web target caveats for animation exit slide composition utilities", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("animate-out slide-out-to-right-2");`,
      "web",
    );

    expect(diagnostics).toEqual([]);
  });

  it("emits native animation exit slide composition unsupported caveats with animation metadata", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("animate-out slide-out-to-right-2");`,
      "native",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"animate-out" has native target caveats: drops animationName, animationDuration, animationTimingFunction, animationFillMode; capabilities animationName=unsupported (Animation, visual-effect), animationDuration=unsupported (Animation, visual-effect), animationTimingFunction=unsupported (Animation, visual-effect), animationFillMode=unsupported (Animation, visual-effect).`,
      `"slide-out-to-right-2" has native target caveats: drops --tw-exit-translate-x; capabilities --tw-exit-translate-x=unsupported (Animation, visual-effect).`,
    ]);
  });

  it("emits flutter animation exit slide composition unsupported caveats with animation metadata", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("animate-out slide-out-to-right-2");`,
      "flutter",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"animate-out" has flutter target caveats: drops animationName, animationDuration, animationTimingFunction, animationFillMode; capabilities animationName=unsupported (Animation, visual-effect), animationDuration=unsupported (Animation, visual-effect), animationTimingFunction=unsupported (Animation, visual-effect), animationFillMode=unsupported (Animation, visual-effect).`,
      `"slide-out-to-right-2" has flutter target caveats: drops --tw-exit-translate-x; capabilities --tw-exit-translate-x=unsupported (Animation, visual-effect).`,
    ]);
  });

  it("emits no web target caveats for grid utilities", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("grid grid-cols-3 gap-4");`,
      "web",
    );

    expect(diagnostics).toEqual([]);
  });

  it("emits native grid target caveats for display and columns", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("grid grid-cols-3 gap-4");`,
      "native",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"grid" has native target caveats: approximates display; capabilities display=approximate (Display, layout).`,
      `"grid-cols-3" has native target caveats: drops gridTemplateColumns; capabilities gridTemplateColumns=unsupported (Grid, layout).`,
    ]);
  });

  it("emits native grid placement target caveats for dropped start/end fields", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("grid grid-cols-3 gap-4 col-start-2 row-start-2 col-end-4 row-end-4");`,
      "native",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"grid" has native target caveats: approximates display; capabilities display=approximate (Display, layout).`,
      `"grid-cols-3" has native target caveats: drops gridTemplateColumns; capabilities gridTemplateColumns=unsupported (Grid, layout).`,
      `"col-start-2" has native target caveats: drops gridColumnStart; capabilities gridColumnStart=unsupported (Grid, layout).`,
      `"row-start-2" has native target caveats: drops gridRowStart; capabilities gridRowStart=unsupported (Grid, layout).`,
      `"col-end-4" has native target caveats: drops gridColumnEnd; capabilities gridColumnEnd=unsupported (Grid, layout).`,
      `"row-end-4" has native target caveats: drops gridRowEnd; capabilities gridRowEnd=unsupported (Grid, layout).`,
    ]);
  });

  it("emits native grid auto target caveats for dropped auto fields", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("grid grid-flow-col auto-cols-fr auto-rows-min gap-4");`,
      "native",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"grid" has native target caveats: approximates display; capabilities display=approximate (Display, layout).`,
      `"grid-flow-col" has native target caveats: drops gridAutoFlow; capabilities gridAutoFlow=unsupported (Grid, layout).`,
      `"auto-cols-fr" has native target caveats: drops gridAutoColumns; capabilities gridAutoColumns=unsupported (Grid, layout).`,
      `"auto-rows-min" has native target caveats: drops gridAutoRows; capabilities gridAutoRows=unsupported (Grid, layout).`,
    ]);
  });

  it("emits flutter grid target caveats for display and recipe-only columns", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("grid grid-cols-3 gap-4");`,
      "flutter",
    );

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"grid" has flutter target caveats: approximates display; capabilities display=approximate (Display, layout).`,
      `"grid-cols-3" has flutter target caveats: drops gridTemplateColumns; capabilities gridTemplateColumns=recipe-only (Grid, layout).`,
    ]);
  });

  it("emits one native gradient caveat without internal gradient keys", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("bg-gradient-to-r from-red-500 via-yellow-500 via-30% to-blue-500");`,
      "native",
    );

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('"gradient utilities"');
    expect(diagnostics[0].message).toContain("native target caveats");
    expect(diagnostics[0].message).toContain("drops backgroundImage");
    expect(diagnostics[0].message).toContain("backgroundImage=unsupported");
    expect(diagnostics[0].message).toContain(
      "backgroundImage=unsupported (Gradient, color)",
    );
    expect(diagnostics[0].message).not.toContain("__dot_gradient");
  });

  it("emits one flutter gradient recipe caveat without internal gradient keys", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("bg-gradient-to-r from-red-500 via-yellow-500 via-30% to-blue-500");`,
      "flutter",
    );

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('"gradient utilities"');
    expect(diagnostics[0].message).toContain("flutter capability caveats");
    expect(diagnostics[0].message).toContain("backgroundImage=recipe-only");
    expect(diagnostics[0].message).toContain(
      "backgroundImage=recipe-only (Gradient, color)",
    );
    expect(diagnostics[0].message).not.toContain("__dot_gradient");
  });

  it("emits no native target caveats for supported transform utilities", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("rotate-45 scale-110 translate-x-4");`,
      "native",
    );

    expect(diagnostics).toEqual([]);
  });

  it("emits no flutter target caveats for supported transform origin recipes", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("origin-top-left rotate-45 translate-y-2");`,
      "flutter",
    );

    expect(diagnostics).toEqual([]);
  });

  it.each(["web", "native", "flutter"] as const)(
    "emits no %s target caveats for supported typography utilities",
    (target) => {
      const diagnostics = targetDiagnosticsFor(
        `const style = dot("text-lg font-bold leading-7 tracking-wide italic text-center");`,
        target,
      );

      expect(diagnostics).toEqual([]);
    },
  );

  it.each(["web", "native"] as const)(
    "emits no %s target caveats for supported layout and positioning utilities",
    (target) => {
      const diagnostics = targetDiagnosticsFor(
        `const style = dot("flex flex-col items-center justify-between absolute top-4 left-0");`,
        target,
      );

      expect(diagnostics).toEqual([]);
    },
  );

  it("emits flutter recipe-only caveats for positioning utilities while layout stays quiet", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("flex flex-col items-center justify-between absolute top-4 left-0");`,
      "flutter",
    );

    expect(diagnostics).toHaveLength(3);
    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"absolute" has flutter capability caveats: position=recipe-only (Positioning, layout).`,
      `"top-4" has flutter capability caveats: top=recipe-only (Positioning, layout).`,
      `"left-0" has flutter capability caveats: left=recipe-only (Positioning, layout).`,
    ]);
  });

  it.each(["web", "native", "flutter"] as const)(
    "emits no %s target caveats for supported sizing and dimensions utilities",
    (target) => {
      const diagnostics = targetDiagnosticsFor(
        `const style = dot("w-full h-full max-w-lg min-h-0");`,
        target,
      );

      expect(diagnostics).toEqual([]);
    },
  );

  it.each(["web", "native", "flutter"] as const)(
    "emits no %s target caveats for supported spacing and radius utilities",
    (target) => {
      const diagnostics = targetDiagnosticsFor(
        `const style = dot("p-4 m-2 rounded-lg");`,
        target,
      );

      expect(diagnostics).toEqual([]);
    },
  );

  it.each(["web", "native", "flutter"] as const)(
    "emits no %s target caveats for supported color and background utilities",
    (target) => {
      const diagnostics = targetDiagnosticsFor(
        `const style = dot("bg-red-500 text-white");`,
        target,
      );

      expect(diagnostics).toEqual([]);
    },
  );

  it.each(["web", "native", "flutter"] as const)(
    "emits no %s target caveats for supported border utilities",
    (target) => {
      const diagnostics = targetDiagnosticsFor(
        `const style = dot("border-2 border-solid border-red-500");`,
        target,
      );

      expect(diagnostics).toEqual([]);
    },
  );

  it.each(["web", "native", "flutter"] as const)(
    "emits no %s target caveats for supported aspect-ratio utilities",
    (target) => {
      const diagnostics = targetDiagnosticsFor(
        `const style = dot("aspect-video");`,
        target,
      );

      expect(diagnostics).toEqual([]);
    },
  );

  it.each(["web", "native"] as const)(
    "emits no %s target caveats for opacity and z-index utilities",
    (target) => {
      const diagnostics = targetDiagnosticsFor(
        `const style = dot("opacity-50 z-10");`,
        target,
      );

      expect(diagnostics).toEqual([]);
    },
  );

  it("emits flutter z-index approximation caveat while opacity stays quiet", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("opacity-50 z-10");`,
      "flutter",
    );

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('"z-10"');
    expect(diagnostics[0].message).toContain("flutter target caveats");
    expect(diagnostics[0].message).toContain("approximates zIndex");
    expect(diagnostics[0].message).toContain("zIndex=approximate");
    expect(diagnostics[0].message).toContain(
      "zIndex=approximate (Z Index, layout)",
    );
  });

  it("emits no web target caveats for interactivity utilities", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("cursor-pointer select-none pointer-events-none");`,
      "web",
    );

    expect(diagnostics).toEqual([]);
  });

  it("emits native interactivity caveats for cursor/select while pointer events stay quiet", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("cursor-pointer select-none pointer-events-none");`,
      "native",
    );

    expect(diagnostics).toHaveLength(2);
    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"cursor-pointer" has native target caveats: drops cursor; capabilities cursor=unsupported (Interactivity, interaction).`,
      `"select-none" has native target caveats: drops userSelect; capabilities userSelect=unsupported (Interactivity, interaction).`,
    ]);
  });

  it("emits flutter unsupported interactivity caveats for recognized tokens", () => {
    const diagnostics = targetDiagnosticsFor(
      `const style = dot("cursor-pointer select-none pointer-events-none");`,
      "flutter",
    );

    expect(diagnostics).toHaveLength(3);
    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      `"cursor-pointer" has flutter target caveats: drops cursor; capabilities cursor=unsupported (Interactivity, interaction).`,
      `"select-none" has flutter target caveats: drops userSelect; capabilities userSelect=unsupported (Interactivity, interaction).`,
      `"pointer-events-none" has flutter target caveats: drops pointerEvents; capabilities pointerEvents=unsupported (Pointer Events, interaction).`,
    ]);
  });
});
