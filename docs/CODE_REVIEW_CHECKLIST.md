# Code Review Checklist

Based on CodeRabbit feedback for PR: Next.js 16 and Tailwind CSS 4.0 migration

## Review Complexity
- **Estimated effort**: 4 (Complex)
- **Estimated time**: ~60 minutes

## Areas Needing Extra Attention

### 1. Dashboard Components (packages/hua-ui/src/components/dashboard/*)

**Concerns:**
- Large, newly added components with many props
- Accessibility considerations
- Locale/currency formatting

**Checklist:**
- [ ] Verify all dashboard components have proper TypeScript types
- [ ] Check accessibility attributes (ARIA labels, keyboard navigation)
- [ ] Verify locale/currency formatting functions work correctly
- [ ] Test component props with various data scenarios
- [ ] Ensure emptyState handling is consistent
- [ ] Verify responsive design works on different screen sizes

**Files to review:**
- `TransactionsTable.tsx`
- `TransactionDetailDrawer.tsx`
- `SettlementTimeline.tsx`
- `RoutingBreakdownCard.tsx`
- `MerchantList.tsx`
- `TrendChart.tsx`
- `DashboardSidebar.tsx`
- `DashboardToolbar.tsx`

### 2. hua-motion Public Entrypoints

**Concerns:**
- Re-exports correctness
- ESM/CJS mappings
- tsup entry configuration

**Checklist:**
- [ ] Verify all entrypoints (core, page, element, scroll, experiments) are correctly exported
- [ ] Test ESM imports: `import { ... } from '@hua-labs/motion/core'`
- [ ] Test CJS imports: `const { ... } = require('@hua-labs/motion/core')`
- [ ] Verify package.json exports map matches tsup.config.ts entries
- [ ] Test subpath imports work correctly
- [ ] Verify type definitions (.d.ts) are generated correctly

**Files to review:**
- `packages/hua-motion/package.json` (exports field)
- `packages/hua-motion/tsup.config.ts`
- `packages/hua-motion/src/index.ts`
- `packages/hua-motion/src/entries/*.ts`

### 3. Tailwind CSS 4 Migration

**Concerns:**
- CSS import order
- Missing JS theme/plugin entries migrated to CSS
- PostCSS configuration

**Checklist:**
- [ ] Verify CSS import order is correct (tailwindcss before other imports)
- [ ] Check that all theme customizations are migrated to CSS @theme blocks
- [ ] Verify PostCSS config uses @tailwindcss/postcss correctly
- [ ] Test that all Tailwind classes work as expected
- [ ] Verify dark mode configuration (if used)
- [ ] Check plugin imports (@tailwindcss/typography, etc.)

**Files to review:**
- `apps/*/globals.css` (import order)
- `apps/*/postcss.config.*`
- `apps/*/tailwind.config.js` (should be minimal)
- Check for any @theme blocks in CSS files

### 4. CI/Deploy Workflows

**Concerns:**
- Per-app build/deploy steps
- Vercel action arguments correctness

**Checklist:**
- [ ] Verify deploy.yml has correct per-app build steps
- [ ] Check Vercel action arguments (project-id, token, etc.)
- [ ] Verify environment variables are set correctly
- [ ] Test that preview deployments work
- [ ] Test that production deployments work
- [ ] Verify build commands are correct for each app

**Files to review:**
- `.github/workflows/deploy.yml`
- Check for any app-specific deployment configs

### 5. ESLint and New Tooling

**Concerns:**
- ESLint config loads correctly
- Storybook configuration
- Vitest configuration

**Checklist:**
- [ ] Verify eslint.config.mjs loads without errors
- [ ] Test ESLint runs correctly: `pnpm lint`
- [ ] Verify Storybook starts: `pnpm storybook` (in packages)
- [ ] Test Vitest runs: `pnpm test` (in packages)
- [ ] Check that all lint rules are applied correctly
- [ ] Verify test setup files work correctly

**Files to review:**
- `eslint.config.mjs`
- `packages/*/.storybook/*`
- `packages/*/vitest.config.ts`
- `packages/*/vitest.setup.ts`

## General Review Items

### Build System
- [ ] All apps build successfully
- [ ] TypeScript compilation passes
- [ ] No type errors in production builds
- [ ] Bundle sizes are reasonable

### Dependencies
- [ ] All peer dependencies are correctly declared
- [ ] No version conflicts
- [ ] Dev dependencies are in correct location

### Documentation
- [ ] Migration guides are accurate
- [ ] API documentation is up to date
- [ ] Examples in README work correctly

### Testing
- [ ] Existing tests pass
- [ ] New tests are added where appropriate
- [ ] Test coverage is maintained

## Action Items

1. **Immediate**: Review dashboard components for accessibility
2. **High Priority**: Verify hua-motion entrypoints work correctly
3. **High Priority**: Test Tailwind CSS 4 migration in all apps
4. **Medium Priority**: Verify CI/CD workflows
5. **Medium Priority**: Test ESLint and new tooling

## Notes

- Most changes are infrastructure and migration-related
- Dashboard components are new additions - need thorough review
- Tailwind 4 migration affects all apps - test carefully
- Build system changes (tsup) need verification

