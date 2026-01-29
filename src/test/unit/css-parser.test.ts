import { describe, it, expect, beforeEach } from 'vitest';
import { CSSParser } from '@/lib/css-parser';

describe('CSSParser', () => {
  let parser: CSSParser;

  beforeEach(() => {
    parser = new CSSParser();
  });

  describe('parseCSS', () => {
    it('should parse simple CSS rules', () => {
      const css = `
        .hero { color: red; font-size: 16px; }
        .button { background: blue; }
      `;

      const rules = parser.parseCSS(css);
      expect(rules).toHaveLength(2);
      expect(rules[0].selector).toBe('.hero');
      expect(rules[0].declarations).toHaveLength(2);
    });

    it('should filter excluded properties', () => {
      const css = `
        .element {
          color: red;
          animation: fadeIn 1s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `;

      const rules = parser.parseCSS(css);
      expect(rules[0].declarations).toHaveLength(1);
      expect(rules[0].declarations[0].property).toBe('color');
    });

    it('should handle media queries', () => {
      const css = `
        @media (min-width: 768px) {
          .responsive { font-size: 18px; }
        }
      `;

      const rules = parser.parseCSS(css);
      expect(rules).toHaveLength(1);
      expect(rules[0].mediaQuery).toBe('(min-width:768px)');
    });

    it('should handle @font-face rules', () => {
      const css = `
        @font-face {
          font-family: 'Custom Font';
          src: url('font.woff2') format('woff2');
        }
      `;

      const rules = parser.parseCSS(css);
      expect(rules).toHaveLength(1);
      expect(rules[0].selector).toBe('@font-face');
    });
  });

  describe('filterCSSRules', () => {
    it('should filter rules based on above-fold selectors', () => {
      const rules = [
        { selector: '.hero', declarations: [{ property: 'color', value: 'red', important: false }] },
        { selector: '.footer', declarations: [{ property: 'color', value: 'blue', important: false }] },
      ];

      const aboveFoldSelectors = new Set(['.hero']);

      const filtered = parser.filterCSSRules(rules, aboveFoldSelectors);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].selector).toBe('.hero');
    });

    it('should always include @font-face rules', () => {
      const rules = [
        { selector: '.hero', declarations: [] },
        { selector: '@font-face', declarations: [] },
      ];

      const aboveFoldSelectors = new Set(['.hero']);

      const filtered = parser.filterCSSRules(rules, aboveFoldSelectors);
      expect(filtered).toHaveLength(2);
    });
  });

  describe('generateCSS', () => {
    it('should generate CSS string from rules', () => {
      const rules = [
        {
          selector: '.hero',
          declarations: [
            { property: 'color', value: 'red', important: false },
            { property: 'font-size', value: '16px', important: true },
          ],
          mediaQuery: undefined,
        },
      ];

      const css = parser.generateCSS(rules);
      expect(css).toContain('.hero {');
      expect(css).toContain('color: red;');
      expect(css).toContain('font-size: 16px !important;');
      expect(css).toContain('}');
    });
  });

  describe('deduplicateRules', () => {
    it('should remove duplicate rules', () => {
      const rules = [
        { selector: '.hero', declarations: [], mediaQuery: undefined },
        { selector: '.hero', declarations: [], mediaQuery: undefined },
        { selector: '.button', declarations: [], mediaQuery: undefined },
      ];

      const deduplicated = parser.deduplicateRules(rules);
      expect(deduplicated).toHaveLength(2);
    });
  });

  describe('minifyCSS', () => {
    it('should minify CSS', () => {
      const css = `
        /* Comment */
        .hero {
          color: red;
          font-size: 16px;
        }
      `;

      const minified = parser.minifyCSS(css);
      expect(minified).not.toContain('/* Comment */');
      expect(minified).not.toContain('\n');
      expect(minified).toContain('.hero{color:red;font-size:16px}');
    });
  });
});