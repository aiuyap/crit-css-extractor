import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DOMUtils } from '@/lib/dom-utils';
import { VIEWPORTS } from '@/lib/constants';

// Mock Playwright for unit tests
const mockPage = {
  evaluate: vi.fn(),
} as any;

describe('DOMUtils', () => {
  let domUtils: DOMUtils;

  beforeEach(() => {
    domUtils = new DOMUtils(mockPage, VIEWPORTS.mobile);
  });

  describe('constructor', () => {
    it('should initialize with correct viewport', () => {
      expect(domUtils).toBeDefined();
    });
  });

  describe('getAboveFoldElements', () => {
    it('should return above-fold elements', async () => {
      const mockElements = [
        {
          element: { tagName: 'DIV' },
          tagName: 'div',
          className: 'hero',
          id: 'hero-section',
          computedStyle: {},
          isAboveFold: true,
        },
      ];

      mockPage.evaluate.mockResolvedValue(mockElements);

      const result = await domUtils.getAboveFoldElements();
      expect(result).toEqual(mockElements);
      expect(mockPage.evaluate).toHaveBeenCalledWith(
        expect.any(Function),
        VIEWPORTS.mobile,
        expect.any(Number)
      );
    });
  });

  describe('getVisibleTextElements', () => {
    it('should filter elements with visible text', async () => {
      const mockAboveFoldElements = [
        {
          element: { textContent: 'Hello World' },
          computedStyle: { display: 'block', opacity: '1', fontSize: '16px' },
        },
      ];

      mockPage.evaluate
        .mockResolvedValueOnce(mockAboveFoldElements)
        .mockResolvedValueOnce(mockAboveFoldElements);

      const result = await domUtils.getVisibleTextElements();
      expect(result).toHaveLength(1);
    });
  });

  describe('getViewportInfo', () => {
    it('should return viewport information', async () => {
      const mockViewportInfo = {
        width: 360,
        height: 640,
        scrollX: 0,
        scrollY: 0,
        documentHeight: 1200,
      };

      mockPage.evaluate.mockResolvedValue(mockViewportInfo);

      const result = await domUtils.getViewportInfo();
      expect(result).toEqual(mockViewportInfo);
    });
  });
});