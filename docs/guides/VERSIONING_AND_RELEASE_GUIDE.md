# Versioning and Release Guide

## Versioning Strategy

### Semantic Versioning (SemVer)

We follow [Semantic Versioning](https://semver.org/) for all packages:

- **MAJOR** (x.0.0): Breaking changes requiring code modifications
- **MINOR** (0.x.0): New backward-compatible features
- **PATCH** (0.0.x): Backward-compatible bug fixes

### Version Bump Decision Tree

#### Major (Breaking Changes)

Bump major version when:
- Public API changes that break existing code
- Removal of public APIs, methods, or properties
- TypeScript type changes that require code updates
- Changes to required peer dependencies
- Changes to default behavior that users rely on

Examples:
- Removing a method from public API
- Changing function signatures (parameter order, required params)
- Changing return types in a way that breaks type inference
- Requiring a new peer dependency version

#### Minor (New Features)

Bump minor version when:
- Adding new features or functionality
- Adding new public APIs
- Adding optional parameters (backward compatible)
- Adding new exports
- Deprecating features (without removal)
- Performance improvements (no API changes)

Examples:
- Adding a new method to Translator class
- Adding a new hook (useTranslation, etc.)
- Adding new configuration options
- Supporting new frameworks or environments

#### Patch (Bug Fixes)

Bump patch version when:
- Fixing bugs
- Fixing type errors
- Documentation updates
- Internal refactoring (no public API changes)
- Dependency updates (non-breaking)
- Improving error messages

Examples:
- Fixing translation key lookup bug
- Fixing hydration mismatch issue
- Updating README with better examples
- Updating dependencies to patch versions

## Changeset Workflow

### Creating a Changeset

1. **After making changes**, create a changeset:

```bash
pnpm changeset
```

2. **Select packages** that changed
3. **Select change type** (major/minor/patch)
4. **Write description** of changes

### Changeset File Format

Changesets are created in `.changeset/` directory:

```markdown
---
"@hua-labs/i18n-core": patch
---

Fix translation key lookup when namespace is missing
```

### Multiple Packages

If multiple packages are affected:

```markdown
---
"@hua-labs/i18n-core": minor
"@hua-labs/i18n-core-zustand": patch
---

Add SSR support to core and update Zustand adapter
```

## Release Process

### Step 1: Create Changesets

Create changesets as you work on features:

```bash
pnpm changeset
```

### Step 2: Version Packages

When ready to release, version all packages:

```bash
pnpm version
```

This will:
- Read all changesets
- Calculate new versions
- Update package.json files
- Generate/update CHANGELOG.md files
- Remove used changesets

### Step 3: Review and Commit

Review the generated changes:

```bash
git status
git diff
```

Commit the version changes:

```bash
git add .
git commit -m "chore: version packages"
git push
```

### Step 4: Publish

Publish to npm:

```bash
pnpm release
```

Or test with dry-run:

```bash
pnpm release:dry
```

## Internal Dependencies

When packages depend on each other:

- Internal dependency updates are automatically handled as `patch` bumps
- If you need `minor` or `major` for internal deps, specify in changeset

Example: If `@hua-labs/i18n-core-zustand` depends on `@hua-labs/i18n-core`:

```markdown
---
"@hua-labs/i18n-core": minor
"@hua-labs/i18n-core-zustand": minor
---

Add new feature to core that Zustand adapter uses
```

## Best Practices

1. **Create changesets early**: Create when starting work, not at the end
2. **Be descriptive**: Write clear summaries for users
3. **Group related changes**: Multiple related changes in one changeset
4. **Breaking changes**: Always mark as `major` and explain migration
5. **Review before versioning**: Review all changesets before `pnpm version`
6. **Test before publishing**: Always test locally before publishing

## Examples

### Patch Release

```markdown
---
"@hua-labs/i18n-core": patch
---

Fix hydration issue when language changes from SSR to client
```

### Minor Release

```markdown
---
"@hua-labs/i18n-core": minor
---

Add getRawValue method to retrieve raw translation data for arrays and nested objects
```

### Major Release

```markdown
---
"@hua-labs/i18n-core": major
---

Remove deprecated autoLanguageSync option. Use @hua-labs/i18n-core-zustand adapter instead.

Migration: Replace createCoreI18n with createZustandI18n from @hua-labs/i18n-core-zustand
```

