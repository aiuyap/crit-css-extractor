export interface ViewportConfig {
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch?: boolean;
}

export interface CriticalCSSOptions {
  url: string;
  viewport: ViewportConfig;
  timeout?: number;
  includeShadows?: boolean;
  userAgent?: string;
}

export interface ExtractionResult {
  criticalCSS: string;
  mobileCSS?: string;
  desktopCSS?: string;
  size: number;
  extractionTime: number;
  viewport: ViewportConfig;
  url: string;
}

export interface PerformanceMetrics {
  lcpTime: number;
  extractionTime: number;
  totalElements: number;
  aboveFoldElements: number;
  cssRules: number;
  filteredRules: number;
}

export interface CSSRule {
  selector: string;
  declarations: Declaration[];
  mediaQuery?: string;
}

export interface Declaration {
  property: string;
  value: string;
  important: boolean;
}

export interface ElementInfo {
  tagName: string;
  className: string;
  id: string;
  selector: string;
  isAboveFold: boolean;
}
