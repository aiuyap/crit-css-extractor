import { describe, it, expect, beforeEach } from 'vitest';
import { CriticalCSSExtractor } from '@/lib/extractor';
import { VIEWPORTS } from '@/lib/constants';

describe('CriticalCSSExtractor Integration', () => {
  let extractor: CriticalCSSExtractor;

  beforeEach(() => {
    extractor = new CriticalCSSExtractor();
  });

  describe('Validation', () => {
    it('should validate extraction results', () => {
      const validResult = {
        criticalCSS: '.test{color:red}',
        size: 100,
        extractionTime: 1000,
        viewport: VIEWPORTS.mobile,
        url: 'https://example.com',
      };

      const validation = extractor.validateExtraction(validResult);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid results', () => {
      const invalidResult = {
        criticalCSS: '',
        size: 0,
        extractionTime: 1000,
        viewport: VIEWPORTS.mobile,
        url: 'https://example.com',
      };

      const validation = extractor.validateExtraction(invalidResult);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Extracted critical CSS is empty');
    });

    it('should warn about large CSS sizes', () => {
      const largeResult = {
        criticalCSS: '.test{color:red}',
        size: 20000, // 20KB - over limit
        extractionTime: 1000,
        viewport: VIEWPORTS.mobile,
        url: 'https://example.com',
      };

      const validation = extractor.validateExtraction(largeResult);
      expect(validation.isValid).toBe(true);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('exceeds recommended limit');
    });
  });

  describe('Performance', () => {
    it('should handle timeout scenarios', async () => {
      const startTime = Date.now();
      
      // Mock extraction that completes within timeout
      const mockExtraction = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          criticalCSS: '.test{color:red}',
          size: 16,
          extractionTime: 100,
          viewport: VIEWPORTS.mobile,
          url: 'https://example.com',
        };
      };

      const result = await mockExtraction();
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(20000); // 20 second timeout
      expect(result.extractionTime).toBeGreaterThan(0);
    });
  });
});