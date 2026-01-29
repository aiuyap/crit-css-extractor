# Critical CSS Extractor

A production-ready web application that automatically extracts the minimum CSS needed to render above-the-fold content, optimized for improving Google PageSpeed Insights and Lighthouse performance scores.

## What is Critical CSS?

Critical CSS is the subset of styles needed to render the content visible in the initial viewport. By inlining this critical CSS in the `<head>` and deferring the rest, you can significantly reduce render-blocking resources and improve First Contentful Paint (FCP) and Largest Contentful Paint (LCP) metrics.

This tool replicates Lighthouse rendering behavior to ensure accurate, real-world results.

## Features

- **Lighthouse-Compliant Extraction**: Replicates Chrome/Lighthouse rendering behavior for accurate critical CSS detection
- **Multi-Viewport Support**: Optimized for both mobile (360×640) and desktop (1366×768) viewports
- **Comprehensive CSS Support**:
  - Inline `<style>` tags
  - External `<link rel="stylesheet">` stylesheets
  - `@media` queries for responsive styles
  - `@font-face` rules
  - CSS variables and custom properties
- **Smart Deduplication**: Removes duplicate selectors and declarations
- **Automatic Minification**: Outputs production-ready, minified CSS
- **LCP Stabilization**: Waits 500ms after final LCP entry for accurate detection
- **Performance Simulation**: Simulates real-world conditions (CPU throttling ~4×, Slow 4G network)

## Tech Stack

- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Node.js with Playwright (Chromium)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **CSS Parsing**: PostCSS / CSSTree

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

## Usage

### Web Interface

1. Enter the URL of the page you want to analyze
2. Select viewport (Mobile or Desktop)
3. Click "Extract Critical CSS"
4. Copy the generated CSS and inline it in your HTML `<head>`

### API Usage

```typescript
import { extractCriticalCSS } from '@/lib/extractor';

const criticalCSS = await extractCriticalCSS({
  url: 'https://example.com',
  viewport: {
    width: 360,
    height: 640,
    deviceScaleFactor: 2.625,
    isMobile: true,
  },
  timeout: 20000,
});

console.log(criticalCSS);
```

### Viewport Configurations

```typescript
const VIEWPORTS = {
  mobile: {
    width: 360,
    height: 640,
    deviceScaleFactor: 2.625,
    isMobile: true,
  },
  desktop: {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    isMobile: false,
  },
};
```

## API Reference

### `extractCriticalCSS(options)`

Extracts critical CSS for the given URL and viewport.

**Parameters:**

| Parameter  | Type             | Required | Description                              |
| ---------- | ---------------- | -------- | ---------------------------------------- |
| `url`      | `string`         | Yes      | The URL of the page to analyze           |
| `viewport` | `ViewportConfig` | Yes      | Viewport configuration                   |
| `timeout`  | `number`         | No       | Timeout in milliseconds (default: 20000) |

**Returns:** `Promise<string>` - Minified critical CSS

### `ViewportConfig`

```typescript
interface ViewportConfig {
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
}
```

## Configuration

### Environment Variables

| Variable                     | Default          | Description                      |
| ---------------------------- | ---------------- | -------------------------------- |
| `TIMEOUT_MS`                 | 20000            | Maximum extraction time per page |
| `MAX_CONCURRENT_EXTRACTIONS` | 3                | Limit concurrent page processing |
| `ENABLE_PERFORMANCE_LOGGING` | development only | Log timing metrics               |

### Performance Targets

- **Extraction Timeout**: 20 seconds maximum
- **Output Size**: < 14KB gzipped
- **Memory Usage**: No leaks during batch processing
- **Deterministic Output**: Same URL + viewport produces identical results

## Development

### Available Commands

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript checks
npm run test          # Run all tests
npm run test:unit     # Run unit tests only
npm run test:integration  # Run integration tests only
npm run test:watch    # Run tests in watch mode
npm run analyze       # Bundle analysis
npm run lighthouse    # Run Lighthouse audit
npm run validate      # Run lint + type-check + test
```

### File Structure

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

### Running Tests

```bash
# Run all tests
npm run test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run specific test file
npm run test:unit path/to/test.test.ts

# Run tests matching pattern
npm run test:unit -- --testNamePattern="specific test name"
```

## Best Practices

1. **Inline Critical CSS**: Place the extracted CSS directly in `<head>` using `<style>`
2. **Defer Non-Critical CSS**: Load remaining styles asynchronously with `media="print" onload="this.media='all'"`
3. **Test Both Viewports**: Extract critical CSS for both mobile and desktop
4. **Monitor LCP**: The tool waits for LCP stabilization but verify results match your content
5. **Regular Testing**: Re-extract when making significant design changes

## Security

- All URLs are validated before processing
- Resource limits prevent DoS attacks
- Generated CSS is sanitized
- No dynamic code execution (`eval()`) is used

## Contributing

See [AGENTS.md](./AGENTS.md) for development guidelines, code conventions, and contributing standards.

## Instructions for running Locally

# 1. Clone the repository
git clone https://github.com/aiuyap/crit-css-extractor.git
cd crit-css-extractor
# 2. Install dependencies
npm install
# 3. Install Chromium browser (one-time setup)
npx playwright install chromium
# 4. Run the app
npm run dev


## License

MIT License
