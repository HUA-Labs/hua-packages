# create-hua

## 1.3.1

### Patch Changes

- f632e6a: Upgrade default page template to interactive landing page with bento grid showcase, animated stats, glassmorphism cards, scroll-driven motion, and typed CLI demo

## 1.3.0

### Minor Changes

- Add `@hua-labs/ui`, `clsx`, `tailwind-merge` to generated dependencies
- Fix Next.js 16 compatibility: `turbopack: {}` in next.config.ts, `async` headers()
- Exclude `.example.tsx` files from TypeScript checking
- Use `--webpack` for production build (Turbopack SSR chunk collision workaround)
- Auto-generate `UI_VERSION` alongside `HUA_VERSION` at build time

## 1.2.1

### Patch Changes

- fix(create-hua): update next.config.ts template for Next.js 16 Turbopack default

  Replace webpack config with `turbopack: {}` to fix build error on Next.js 16+

## 1.0.0-alpha.15

### Initial Release

- Initial release
