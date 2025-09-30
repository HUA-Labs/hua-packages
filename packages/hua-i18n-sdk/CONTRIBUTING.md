# Contributing to hua-i18n-sdk

Thank you for your interest in contributing to hua-i18n-sdk! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup

1. Fork the repository

2. Clone your fork:

   ```bash
   git clone https://github.com/HUA-Labs/i18n-sdk.git
   cd i18n-sdk
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development

### Available Scripts

- `npm run dev` - Watch mode for development
- `npm run build` - Build the package
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking

### Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### Testing

- Write unit tests for new features
- Ensure all tests pass before submitting
- Maintain good test coverage
- Test both SSR and CSR scenarios

## Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Add tests for any new functionality
3. Update documentation if needed
4. Make sure all tests pass
5. Update the CHANGELOG.md if your changes are user-facing
6. Submit a pull request with a clear description

### Pull Request Guidelines

- Use a descriptive title
- Provide a clear description of the changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure the PR is ready for review

## Issue Reporting

Before creating an issue, please:

1. Search existing issues to avoid duplicates
2. Use the appropriate issue template
3. Provide a minimal reproduction example
4. Include relevant environment information

## Release Process

Releases are managed through semantic versioning:

- **Patch releases** (1.0.x): Bug fixes and minor improvements
- **Minor releases** (1.x.0): New features, backward compatible
- **Major releases** (x.0.0): Breaking changes

## Code of Conduct

Please be respectful and inclusive in all interactions. We follow the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

## Questions?

If you have questions about contributing, please:

1. Check the documentation
2. Search existing issues
3. Create a new issue with the "question" label

Thank you for contributing to hua-i18n-sdk! 🎉
