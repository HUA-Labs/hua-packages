# Deployment Checklist

Use this checklist before deploying packages to npm.

## Pre-Deployment Checks

### Code Quality

- [ ] All packages build successfully (`pnpm build`)
- [ ] Type checking passes (`pnpm type-check` or `tsc --noEmit`)
- [ ] Linting passes (if applicable)
- [ ] No TypeScript errors
- [ ] No console errors in test builds

### Package Configuration

- [ ] `package.json` has correct `name`, `version`, `description`
- [ ] `package.json` includes `repository`, `bugs`, `homepage` fields
- [ ] `package.json` has correct `main`, `types`, `exports` fields
- [ ] `package.json` `files` field includes only necessary files (dist, src, README)
- [ ] `package.json` `peerDependencies` are correct
- [ ] `package.json` `sideEffects` is set correctly (usually `false`)
- [ ] `package.json` `keywords` are relevant and accurate

### Documentation

- [ ] README.md is complete and accurate
- [ ] README.md is in English (for public packages)
- [ ] README.md includes installation instructions
- [ ] README.md includes usage examples
- [ ] README.md includes API reference or links to it
- [ ] CHANGELOG.md is up to date
- [ ] All code examples in README work correctly

### Build Artifacts

- [ ] `dist/` folder contains compiled files
- [ ] `dist/index.js` exists and is valid
- [ ] `dist/index.d.ts` exists and is valid
- [ ] Source maps are generated (if applicable)
- [ ] No unnecessary files in `dist/` (test files, etc.)

### Changesets

- [ ] Changeset created for this release (`pnpm changeset`)
- [ ] Changeset type is correct (major/minor/patch)
- [ ] Changeset description is clear and user-friendly
- [ ] All affected packages have changesets

### Version Management

- [ ] Version numbers follow SemVer rules
- [ ] Breaking changes are marked as `major`
- [ ] New features are marked as `minor`
- [ ] Bug fixes are marked as `patch`
- [ ] Internal dependencies are handled correctly

### Testing

- [ ] Package works in a test project
- [ ] Import statements work correctly
- [ ] Type definitions are accessible
- [ ] No runtime errors in basic usage
- [ ] SSR/CSR compatibility verified (if applicable)

### Git

- [ ] All changes are committed
- [ ] Changesets are committed
- [ ] Branch is up to date with main
- [ ] No uncommitted changes

## Deployment Process

### Step 1: Version Packages

```bash
pnpm version
```

This will:
- Read changesets
- Calculate new versions
- Update package.json files
- Generate/update CHANGELOG.md files
- Remove used changesets

### Step 2: Review Generated Changes

- [ ] Review updated package.json versions
- [ ] Review generated CHANGELOG.md entries
- [ ] Verify version numbers are correct
- [ ] Check that all changesets were processed

### Step 3: Commit Version Changes

```bash
git add .
git commit -m "chore: version packages"
git push
```

### Step 4: Create Release PR (Optional)

If using branch protection:
- [ ] Create PR for version changes
- [ ] Get approval
- [ ] Merge to main

### Step 5: Publish to npm

```bash
pnpm release
```

Or test first:
```bash
pnpm release:dry
```

### Step 6: Verify Publication

- [ ] Check npm registry for published packages
- [ ] Verify package versions on npm
- [ ] Test installation: `npm install @hua-labs/[package-name]`
- [ ] Verify package works after installation

## Post-Deployment

### Documentation Updates

- [ ] Update main README.md if new packages added
- [ ] Update demo sites if applicable
- [ ] Update any external documentation

### Communication

- [ ] Announce release (if significant)
- [ ] Update release notes on GitHub (if applicable)
- [ ] Notify team members (if applicable)

## Rollback Plan

If issues are found after deployment:

1. **Immediate**: Unpublish problematic version (if within 72 hours)
   ```bash
   npm unpublish @hua-labs/[package-name]@[version]
   ```

2. **Fix**: Create patch release with fix
   ```bash
   pnpm changeset
   # Select patch
   pnpm version
   pnpm release
   ```

3. **Document**: Update CHANGELOG with rollback notice

## Common Issues

### Build Fails

- Check TypeScript errors
- Verify tsconfig.json is correct
- Check for missing dependencies

### Type Errors

- Verify `types` field in package.json
- Check dist/index.d.ts exists
- Verify declaration files are generated

### Import Errors

- Check `exports` field in package.json
- Verify `main` and `types` fields
- Test import in clean project

### Version Conflicts

- Check for existing versions on npm
- Verify version number is incremented
- Check changeset type matches version bump

