import { NextRequest, NextResponse } from 'next/server';
import { CriticalCSSExtractor } from '@/lib/extractor';
import { VIEWPORTS } from '@/lib/constants';
import { ValidationError, CriticalExtractionError } from '@/lib/errors';
import type { CriticalCSSOptions } from '@/lib/types';

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
};

// Simple in-memory rate limiter (production should use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get client IP for rate limiting
    const clientIP = request.ip || 'unknown';
    
    // Check rate limiting
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validationResult = validateExtractionRequest(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.errors },
        { status: 400 }
      );
    }

    const { url, viewport = 'both', includeShadows = false, userAgent } = body;

    // Create extractor instance
    const extractor = new CriticalCSSExtractor();

    try {
      let result;

      if (viewport === 'both') {
        // Extract for both mobile and desktop
        result = await extractor.extractForBothViewports(url, {
          includeShadows,
          userAgent,
        });

        // Log extraction metrics
        const processingTime = Date.now() - startTime;
        console.log(`Extraction completed for ${url} in ${processingTime}ms`);
        console.log(`Mobile CSS: ${result.mobile.size} bytes, Desktop CSS: ${result.desktop.size} bytes`);

        return NextResponse.json({
          success: true,
          url,
          viewport: 'both',
          mobile: {
            css: result.mobile.criticalCSS,
            size: result.mobile.size,
            extractionTime: result.mobile.extractionTime,
          },
          desktop: {
            css: result.desktop.criticalCSS,
            size: result.desktop.size,
            extractionTime: result.desktop.extractionTime,
          },
          combined: {
            css: result.combined,
            size: result.combined.length,
          },
          processingTime,
        });

      } else {
        // Extract for specific viewport
        const viewportConfig = viewport === 'mobile' ? VIEWPORTS.mobile : VIEWPORTS.desktop;
        
        const singleResult = await extractor.extractCriticalCSS({
          url,
          viewport: viewportConfig,
          includeShadows,
          userAgent,
        });

        // Validate extraction result
        const validation = extractor.validateExtraction(singleResult);

        // Log extraction metrics
        const processingTime = Date.now() - startTime;
        console.log(`Extraction completed for ${url} (${viewport}) in ${processingTime}ms`);
        console.log(`CSS size: ${singleResult.size} bytes`);

        return NextResponse.json({
          success: true,
          url,
          viewport,
          css: singleResult.criticalCSS,
          size: singleResult.size,
          extractionTime: singleResult.extractionTime,
          validation,
          processingTime,
        });
      }

    } finally {
      // Clean up extractor resources
      await extractor.close();
    }

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`Extraction failed after ${processingTime}ms:`, error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: 'Validation error', message: error.message, processingTime },
        { status: 400 }
      );
    } else if (error instanceof CriticalExtractionError) {
      return NextResponse.json(
        { error: 'Extraction failed', message: error.message, processingTime },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: 'Internal server error', message: 'An unexpected error occurred', processingTime },
        { status: 500 }
      );
    }
  }
}

export async function GET() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Please use POST to extract critical CSS',
  }, { status: 405 });
}

/**
 * Validate extraction request body
 */
function validateExtractionRequest(body: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!body.url || typeof body.url !== 'string') {
    errors.push('URL is required and must be a string');
  } else {
    // Validate URL format
    try {
      new URL(body.url);
      
      // Check if URL is accessible (http/https)
      const url = new URL(body.url);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push('URL must use HTTP or HTTPS protocol');
      }
    } catch {
      errors.push('URL is not valid');
    }
  }

  // Validate viewport option
  if (body.viewport && !['mobile', 'desktop', 'both'].includes(body.viewport)) {
    errors.push('Viewport must be one of: mobile, desktop, both');
  }

  // Validate boolean options
  if (body.includeShadows !== undefined && typeof body.includeShadows !== 'boolean') {
    errors.push('includeShadows must be a boolean');
  }

  if (body.userAgent !== undefined && typeof body.userAgent !== 'string') {
    errors.push('userAgent must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Simple rate limiting function
 */
function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const existing = requestCounts.get(clientIP);

  if (!existing || now > existing.resetTime) {
    // Reset or initialize counter
    requestCounts.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return true;
  }

  if (existing.count >= RATE_LIMIT.maxRequests) {
    return false;
  }

  existing.count++;
  return true;
}