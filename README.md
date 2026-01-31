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

## Architecture

This application is now split into two separate services:

1. **Frontend (Vercel)**: Next.js UI that calls backend API
2. **Backend (Railway)**: Node.js + Playwright API for browser automation

## Quick Start

### Running Locally

1. Clone both repositories:

   ```bash
   git clone https://github.com/aiuyap/crit-css-extractor.git
   git clone https://github.com/aiuyap/crit-css-extractor-backend.git
   ```

2. Start backend server:

   ```bash
   cd crit-css-extractor-backend
   npm install
   npx playwright install chromium
   npm run dev
   ```

3. In a new terminal, start frontend:

   ```bash
   cd crit-css-extractor
   npm install
   npm run dev
   ```

4. Visit http://localhost:3000

### Deployment

#### Frontend (Vercel)

1. Push frontend code to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variable in Vercel dashboard:
   - `NEXT_PUBLIC_BACKEND_URL` = your Railway backend URL

#### Backend (Railway)

1. Push backend code to GitHub
2. Connect GitHub repo to Railway
3. Railway will auto-deploy on push

## API Integration

The frontend calls the backend API:

**POST** `/api/extract` - Extract critical CSS from a URL

Request:

```json
{
  "url": "https://example.com",
  "viewport": "both",
  "includeShadows": false
}
```

Response:

```json
{
  "success": true,
  "url": "https://example.com",
  "viewport": "both",
  "mobile": {
    "css": "/* critical CSS */",
    "size": 1234,
    "extractionTime": 5000
  },
  "desktop": {
    "css": "/* critical CSS */",
    "size": 2345,
    "extractionTime": 6000
  },
  "combined": {
    "css": "/* combined CSS */",
    "size": 3456
  },
  "processingTime": 7000
}
```

## Tech Stack

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Deployment**: Vercel

### Backend

- **Framework**: Express.js
- **Browser Automation**: Playwright (Chromium)
- **CSS Parsing**: css-tree
- **Deployment**: Railway

## Development Commands

### Frontend

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript checks
```

### Backend

```bash
npm run dev        # Start development server
npm run start      # Start production server
```

## Security

- All URLs are validated before processing
- Resource limits prevent DoS attacks
- Generated CSS is sanitized
- No dynamic code execution (`eval()`) is used

## License

MIT License
