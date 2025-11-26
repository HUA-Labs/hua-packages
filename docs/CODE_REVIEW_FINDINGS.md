# Code Review Findings

Based on CodeRabbit feedback and initial verification.

## Verification Results

### 1. hua-motion Entrypoints

**Status**: Needs verification

**Current state:**
- `package.json` exports: `.`, `./core`, `./page`, `./element`, `./scroll`, `./experiments`
- `tsup.config.ts` entries: `index`, `core`, `page`, `element`, `scroll`, `experiments`
- `src/index.ts` exports: Only `core` and `scroll`

**Issue:**
- Main entry (`index.ts`) only exports `core` and `scroll`
- Other entrypoints (`page`, `element`, `experiments`) are available via subpath imports but not from main entry
- This is likely intentional for code splitting, but needs verification

**Action required:**
- [ ] Test subpath imports: `import { ... } from '@hua-labs/motion/page'`
- [ ] Verify main entry exports are correct for backward compatibility
- [ ] Check if any apps are using main entry and need updates

### 2. Tailwind CSS 4 Migration

**Status**: Verified

**CSS Import Order:**
```
@import "tailwindcss";
@import "@tailwindcss/typography";
@import '@hua-labs/ui/styles/toast.css';
```

**Findings:**
- Import order is correct (tailwindcss first)
- PostCSS config uses `@tailwindcss/postcss` correctly
- tailwind.config.js files are simplified (content only)
- No JS theme entries found (migrated to CSS)

**Action required:**
- [ ] Test dark mode if used
- [ ] Verify all custom theme values are in CSS @theme blocks (if any)

### 3. Dashboard Components Accessibility

**Status**: Partially verified

**TransactionsTable:**
- Uses `"use client"` directive
- Has `Table`, `TableBody`, `TableCell` components
- Needs verification for:
  - [ ] ARIA labels on interactive elements
  - [ ] Keyboard navigation support
  - [ ] Screen reader compatibility
  - [ ] Focus management

**Action required:**
- [ ] Review all dashboard components for ARIA attributes
- [ ] Test keyboard navigation
- [ ] Verify locale/currency formatting functions
- [ ] Check emptyState accessibility

### 4. CI/Deploy Workflows

**Status**: Not verified

**Action required:**
- [ ] Review `.github/workflows/deploy.yml`
- [ ] Verify per-app build steps
- [ ] Check Vercel action arguments
- [ ] Test preview deployments
- [ ] Test production deployments

### 5. ESLint and Tooling

**Status**: Not verified

**Action required:**
- [ ] Run `pnpm lint` and verify no errors
- [ ] Test Storybook: `pnpm storybook` in packages
- [ ] Test Vitest: `pnpm test` in packages
- [ ] Verify eslint.config.mjs loads correctly

## Priority Actions

### High Priority
1. Verify hua-motion entrypoints work correctly
2. Test Tailwind CSS 4 migration in all apps
3. Review dashboard components accessibility

### Medium Priority
4. Verify CI/CD workflows
5. Test ESLint and new tooling

### Low Priority
6. Update documentation if needed
7. Add additional tests

## Next Steps

1. Test hua-motion imports in a sample app
2. Run accessibility audit on dashboard components
3. Verify CI/CD workflows are correct
4. Test all tooling (ESLint, Storybook, Vitest)

