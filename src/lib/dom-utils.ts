import type { Page } from 'playwright';
import type { ViewportConfig, ElementInfo } from './types';
import { PERFORMANCE_CONFIG } from './constants';

export class DOMUtils {
  private page: Page;
  private viewport: ViewportConfig;

  constructor(page: Page, viewport: ViewportConfig) {
    this.page = page;
    this.viewport = viewport;
  }

  /**
   * Get all elements that are above the fold (visible in viewport with buffer)
   * Returns serializable element info with selectors generated in browser context
   */
  async getAboveFoldElements(): Promise<ElementInfo[]> {
    return await this.page.evaluate(
      ({ viewport, buffer }: { viewport: any; buffer: any }) => {
        const elements: any[] = [];
        const viewportHeight = viewport.height;
        const bufferZone = buffer;

        function isAboveFold(element: Element): boolean {
          const rect = element.getBoundingClientRect();

          // Element is above fold if it intersects with viewport + buffer
          const isVisible =
            rect.bottom > -bufferZone && rect.top < viewportHeight + bufferZone;

          // Exclude elements that are completely hidden
          const isHidden = rect.width === 0 || rect.height === 0;

          return isVisible && !isHidden;
        }

        function generateSelector(element: Element): string {
          // Try ID first (most specific)
          if (element.id) {
            return `#${element.id}`;
          }

          // Try classes
          if (element.className && typeof element.className === 'string') {
            const classes = element.className
              .split(' ')
              .filter((cls: string) => cls.trim() && !cls.includes(':'));
            if (classes.length > 0) {
              return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
            }
          }

          // Fall back to tag name
          return element.tagName.toLowerCase();
        }

        function getElementInfo(element: Element): any {
          return {
            tagName: element.tagName.toLowerCase(),
            className:
              typeof element.className === 'string' ? element.className : '',
            id: element.id || '',
            selector: generateSelector(element),
            isAboveFold: true,
          };
        }

        // Get all elements in the document
        const allElements = Array.from(document.querySelectorAll('*'));

        for (const element of allElements) {
          // Skip script, style, meta, link, and other non-visual elements
          const tagName = element.tagName.toLowerCase();
          if (
            [
              'script',
              'style',
              'meta',
              'link',
              'title',
              'head',
              'noscript',
            ].includes(tagName)
          ) {
            continue;
          }

          if (isAboveFold(element)) {
            elements.push(getElementInfo(element));
          }
        }

        return elements;
      },
      { viewport: this.viewport, buffer: PERFORMANCE_CONFIG.ABOVE_FOLD_BUFFER }
    );
  }

  /**
   * Get elements that have visible text content above the fold
   */
  async getVisibleTextElements(): Promise<ElementInfo[]> {
    const aboveFoldElements = await this.getAboveFoldElements();

    return await this.page.evaluate((elements: any) => {
      return elements.filter((elementInfo: any) => {
        const element = elementInfo.element;
        const textContent = element.textContent?.trim();

        // Check if element has visible text
        if (!textContent) return false;

        const computedStyle = window.getComputedStyle(element);

        // Skip hidden elements
        if (
          computedStyle.display === 'none' ||
          computedStyle.visibility === 'hidden' ||
          computedStyle.opacity === '0'
        ) {
          return false;
        }

        // Check if text is actually visible (not 0px text)
        const fontSize = parseFloat(computedStyle.fontSize);
        if (fontSize <= 0) return false;

        return true;
      });
    }, aboveFoldElements as any);
  }

  /**
   * Get font families used by visible text elements
   */
  async getUsedFontFamilies(): Promise<string[]> {
    const textElements = await this.getVisibleTextElements();

    return await this.page.evaluate((elements: any) => {
      const fontFamilies = new Set<string>();

      elements.forEach((elementInfo: any) => {
        const computedStyle = elementInfo.computedStyle;
        const fontFamily = computedStyle.getPropertyValue('font-family');

        if (fontFamily) {
          // Split and clean up font family names
          const fonts = fontFamily.split(',').map((font: any) => {
            return font.trim().replace(/['"]/g, '');
          });

          fonts.forEach((font: any) => fontFamilies.add(font));
        }
      });

      return Array.from(fontFamilies);
    }, textElements as any);
  }

  /**
   * Get scroll position and viewport dimensions
   */
  async getViewportInfo(): Promise<{
    width: number;
    height: number;
    scrollX: number;
    scrollY: number;
    documentHeight: number;
  }> {
    return await this.page.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        documentHeight: document.documentElement.scrollHeight,
      };
    });
  }

  /**
   * Check if an element would cause layout shift if styled
   */
  async wouldCauseLayoutShift(selector: string): Promise<boolean> {
    return await this.page.evaluate((sel) => {
      try {
        const element = document.querySelector(sel);
        if (!element) return false;

        const rect = element.getBoundingClientRect();

        // Elements with no dimensions won't cause layout shifts
        if (rect.width === 0 || rect.height === 0) return false;

        // Hidden elements
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden')
          return false;

        return true;
      } catch (error) {
        return false;
      }
    }, selector);
  }

  /**
   * Generate a unique selector for an element
   */
  async generateSelector(element: any): Promise<string> {
    return await this.page.evaluate((el) => {
      if (el.id) {
        return `#${el.id}`;
      }

      if (el.className) {
        const classes = el.className
          .split(' ')
          .filter((cls: string) => cls.trim());
        if (classes.length > 0) {
          return `${el.tagName.toLowerCase()}.${classes.join('.')}`;
        }
      }

      // Generate path-based selector as fallback
      const path = [];
      let current = el;

      while (current && current.nodeType === Node.ELEMENT_NODE) {
        let selector = current.tagName.toLowerCase();

        if (current.id) {
          selector = `#${current.id}`;
          path.unshift(selector);
          break;
        }

        if (current.className) {
          const classes = current.className
            .split(' ')
            .filter((cls: string) => cls.trim());
          if (classes.length > 0) {
            selector += `.${classes[0]}`;
          }
        }

        path.unshift(selector);
        current = current.parentNode;
      }

      return path.join(' > ');
    }, element);
  }

  /**
   * Wait for dynamic content to load (basic implementation)
   * Returns true if content settled within timeout, false otherwise.
   * Does not throw on timeout – callers can decide whether to warn or proceed.
   */
  async waitForContentSettle(timeoutMs: number = 2000): Promise<boolean> {
    try {
      const settled = await this.page.evaluate((timeout: number) => {
        return new Promise<boolean>((resolve) => {
          // If document.body doesn't exist, resolve immediately
          if (!document.body) {
            resolve(true);
            return;
          }

          let lastMutationTime = Date.now();
          const quiescentMs = 250; // Period of no mutations to consider settled
          let checkInterval: ReturnType<typeof setInterval> | null = null;

          const observer = new MutationObserver(() => {
            lastMutationTime = Date.now();
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false,
          });

          const cleanup = (result: boolean) => {
            observer.disconnect();
            if (checkInterval) clearInterval(checkInterval);
            resolve(result);
          };

          // Periodically check if we've been quiescent long enough
          checkInterval = setInterval(() => {
            if (Date.now() - lastMutationTime >= quiescentMs) {
              cleanup(true);
            }
          }, 50);

          // Overall timeout – resolve false but don't throw
          setTimeout(() => {
            cleanup(false);
          }, timeout);
        });
      }, timeoutMs);

      return settled;
    } catch (error) {
      // Page may have closed or navigated – treat as non-fatal
      console.warn('waitForContentSettle encountered an error:', error);
      return false;
    }
  }
}
