# Pull Request Guide

## Branch Protection Policy

Both `main` and `develop` branches require pull requests for merging.

### develop Branch
- PR required before merging
- Minimum 1 approval required
- Direct push prevented
- Status checks required (type-check, lint, build)

### main Branch
- PR required before merging
- Minimum 1 approval required
- Code owner review required
- Direct push prevented
- Status checks required (type-check, lint, build)

## PR Process

1. Push feature branch to remote
2. Create PR targeting `develop` (or `main` for production)
3. Fill out PR template
4. Wait for CI checks to pass
5. Get at least 1 approval
6. Merge PR

## PR Template

Use the template at `.github/PULL_REQUEST_TEMPLATE.md` which includes:
- Change description
- Branch information
- Breaking changes
- Checklist (code quality, tests, build)
- Test information

## Commit Convention

Follow conventional commits format:
- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation
- `refactor`: code refactoring
- `chore`: build process or auxiliary tools

Example: `feat(ui): upgrade to Next.js 16 and Tailwind CSS 4.0`

