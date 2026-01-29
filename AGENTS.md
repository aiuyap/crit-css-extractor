# AGENTS.md - Critical CSS Extractor Development Guide

This guide is for agentic coding agents working on the critical CSS extractor project. Follow these conventions to ensure consistency, performance, and maintainability.

## Project Overview

This is a production-ready web application that extracts critical CSS above-the-fold, optimized for Google PageSpeed Insights/Lighthouse metrics. The tool replicates Lighthouse rendering behavior and generates safe, minimal, stable critical CSS.

**Core Stack:**

- Frontend: Next.js 14+ (App Router)
- Backend: Node.js
- Rendering: Playwright (Chromium)
- Language: TypeScript
- Styling: Tailwind CSS
- CSS Parsing: PostCSS or CSSTree

## Development Commands

### Setup

```bash
npm install                 # Install dependencies
npm run dev                 # Start development server
npm run build               # Build for production
npm run start               # Start production server
npm run lint                # Run ESLint
npm run type-check          # Run TypeScript checks
npm run test                # Run all tests
npm run test:unit           # Run unit tests only
npm run test:integration    # Run integration tests only
npm run test:watch          # Run tests in watch mode
npm run test:single <test>  # Run single test file
```

### Testing Single Tests

```bash
# Jest style
npm run test:unit -- path/to/test.test.ts
npm run test:unit -- --testNamePattern="specific test name"

# Vitest style
npm run test:unit path/to/test.test.ts
npm run test:unit -t "specific test name"
```

### Performance & Quality

```bash
npm run analyze             # Bundle analysis
npm run lighthouse          # Run Lighthouse audit
npm run validate            # Run all validation (lint + type-check + test)
```

## Code Style Guidelines

### TypeScript & Types

- **Strict mode enabled**: All code must pass strict TypeScript checks
- **Interface naming**: PascalCase, descriptive (e.g., `CriticalCSSOptions`, `ViewportConfig`)
- **Type imports**: Use `import type` for type-only imports
- **Prefer interfaces over types** for object shapes that can be extended
- **Explicit return types** for public APIs and complex functions

```typescript
// Good
import type { ViewportConfig } from './types';
interface CriticalCSSOptions {
  url: string;
  viewport: ViewportConfig;
  timeout?: number;
}

export async function extractCriticalCSS(
  options: CriticalCSSOptions
): Promise<string> {
  // implementation
}

// Bad
const extract = (opts: any) => any;
```

### Import Organization

```typescript
// 1. Node.js built-ins
import { promises as fs } from 'fs';
import path from 'path';

// 2. External dependencies (alphabetical)
import { Browser, Page } from 'playwright';
import { parse } from 'postcss';

// 3. Internal modules (absolute imports when possible)
import { ViewportConfig } from '@/lib/types';
import { LCPObserver } from '@/lib/lcp-observer';

// 4. Relative imports (for local components)
import { styles } from './styles.css';
```

### Naming Conventions

- **Files**: kebab-case for everything except React components (`critical-css-extractor.ts`, `HeroComponent.tsx`)
- **Variables**: camelCase, descriptive (`criticalCSSRules`, `viewportConfig`)
- **Functions**: camelCase, verbs (`extractCriticalRules`, `calculateLCP`)
- **Constants**: UPPER_SNAKE_CASE for truly constant values (`DEFAULT_TIMEOUT_MS`, `MOBILE_VIEWPORT`)
- **Classes**: PascalCase (`CSSParser`, `ViewportManager`)
- **React Components**: PascalCase, descriptive (`CriticalCSSExtractor`, `ViewportToggle`)

### Error Handling

```typescript
// Use custom error classes
class CriticalExtractionError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'CriticalExtractionError';
  }
}

// Always handle async errors with try/catch or proper error boundaries
export async function extractCSS(url: string): Promise<string> {
  try {
    const page = await browser.newPage();
    return await performExtraction(page);
  } catch (error) {
    throw new CriticalExtractionError(
      `Failed to extract CSS for ${url}`,
      error
    );
  } finally {
    await page?.close?.();
  }
}
```

## Frontend Design

For UI/UX work, agents should follow the frontend-design skill:

- See `skills/frontend-design/SKILL.md`
- Creates distinctive, production-grade frontend interfaces
- Avoids generic AI aesthetics with bold, memorable designs

## CSS & Styling Guidelines

### Tailwind CSS Usage

- **Utility-first**: Prefer Tailwind utilities over custom CSS
- **Component patterns**: Use `@apply` sparingly, prefer composition
- **Responsive design**: Mobile-first approach (default styles, then `md:`, `lg:`)
- **Dark mode**: Use `dark:` prefix for theme-aware styles

```typescript
// Good
<div className="p-4 md:p-8 bg-white dark:bg-gray-900 rounded-lg">

// Avoid excessive custom CSS unless absolutely necessary
```

### CSS Architecture

- **Critical CSS extraction pipeline** must handle:
  - Inline `<style>` tags
  - External `<link rel="stylesheet">`
  - @media queries (responsive)
  - @font-face rules
  - CSS variables/custom properties

- **Deduplication**: Remove duplicate selectors and declarations
- **Minification**: Final output should be minified
- **Ordering**: Maintain DOM order for specificity consistency

## Performance Requirements

### Viewport Configurations (Lighthouse-compliant)

```typescript
const VIEWPORTS = {
  mobile: { width: 360, height: 640, deviceScaleFactor: 2.625, isMobile: true },
  desktop: { width: 1366, height: 768, deviceScaleFactor: 1, isMobile: false },
};
```

### Performance Simulation

- **CPU throttling**: ~4× slowdown
- **Network throttling**: Slow 4G equivalent
- **Reduced motion**: Enabled by default
- **LCP stabilization**: Wait 500ms after final LCP entry

### Resource Constraints

- **Execution timeout**: 20 seconds maximum
- **Memory usage**: Monitor for leaks during page processing
- **Concurrent processing**: Limit to prevent system overload

## Testing Strategy

### Unit Tests

```typescript
// Test utilities and pure functions
import { calculateAboveFoldElements } from '@/lib/dom-utils';
import { mockDOM } from '@/test/mocks';

describe('DOM Utils', () => {
  it('should identify above-fold elements correctly', () => {
    const mockPage = mockDOM();
    const elements = calculateAboveFoldElements(mockPage, VIEWPORTS.mobile);
    expect(elements).toHaveLength(expected);
  });
});
```

### Integration Tests

```typescript
// Test full pipeline with real browser automation
import { extractCriticalCSS } from '@/lib/extractor';

describe('Critical CSS Extraction', () => {
  it('should extract critical CSS for SPA', async () => {
    const result = await extractCriticalCSS({
      url: 'http://localhost:3000/test-spa',
      viewport: VIEWPORTS.mobile,
    });
    expect(result).toContain('hero');
    expect(result.length).toBeLessThan(14000); // < 14KB gzipped
  }, 30000); // 30s timeout for browser tests
});
```

### Performance Tests

- **Bundle size**: Monitor with `npm run analyze`
- **Extraction speed**: Must complete within 20s timeout
- **Memory usage**: No leaks during batch processing
- **Output size**: < 14KB gzipped target

## File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── lib/
│   ├── extractor.ts       # Main extraction logic
│   ├── lcp-observer.ts    # LCP tracking
│   ├── css-parser.ts      # CSS parsing/filtering
│   ├── viewport.ts        # Viewport management
│   └── types.ts           # TypeScript definitions
├── components/
│   ├── ui/               # Base UI components
│   ├── ExtractorForm.tsx # Main form component
│   └── ResultsView.tsx   # Results display
└── test/
    ├── mocks/           # Test utilities
    └── fixtures/        # Sample HTML/CSS
```

## Git & Commit Conventions

- **Branch naming**: `feature/critical-css-parser`, `fix/lcp-timeout`
- **Commit messages**: Conventional Commits format
  - `feat: add mobile viewport detection`
  - `fix: resolve memory leak in browser cleanup`
  - `test: add integration tests for SPA extraction`

## Security Considerations

- **Input validation**: Sanitize all URLs and CSS input
- **Resource limits**: Enforce timeouts and memory limits
- **CSP compliance**: Generated CSS should not violate content security policies
- **No eval()**: Avoid dynamic code execution

## Debugging Guidelines

- **Verbose logging**: Each pipeline stage should log progress
- **Error context**: Include URL, viewport, and stage in error messages
- **Performance metrics**: Log timing for each extraction phase
- **Deterministic output**: Same URL + viewport should produce identical results

## Environment Configuration

```typescript
// Development defaults
const DEFAULT_CONFIG = {
  TIMEOUT_MS: 20000,
  MAX_CONCURRENT_EXTRACTIONS: 3,
  ENABLE_PERFORMANCE_LOGGING: process.env.NODE_ENV === 'development',
};
```

Remember: This tool must be **deterministic**, **safe**, and **performance-focused**. Prioritize correctness over shortcuts, and always test against real-world scenarios including SPAs, heavy CSS frameworks, and mobile/desktop variations.
