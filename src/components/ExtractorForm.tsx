'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Play, Download, Copy } from 'lucide-react';

export interface ExtractionResult {
  success: boolean;
  url: string;
  viewport: 'mobile' | 'desktop' | 'both';
  css?: string;
  size?: number;
  extractionTime?: number;
  mobile?: { css: string; size: number; extractionTime: number };
  desktop?: { css: string; size: number; extractionTime: number };
  combined?: { css: string; size: number };
  processingTime?: number;
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export default function ExtractorForm() {
  const [url, setUrl] = useState('');
  const [viewport, setViewport] = useState<'mobile' | 'desktop' | 'both'>('both');
  const [includeShadows, setIncludeShadows] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop' | 'combined'>('combined');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          viewport,
          includeShadows,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Extraction failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (css: string) => {
    try {
      await navigator.clipboard.writeText(css);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadCSS = (css: string, filename: string) => {
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(2) + 's';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Extraction Form */}
      <Card>
        <CardHeader>
          <CardTitle>Critical CSS Extractor</CardTitle>
          <CardDescription>
            Extract critical CSS above the fold, optimized for Google PageSpeed Insights metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="viewport">Viewport</Label>
                <Select value={viewport} onValueChange={(value: any) => setViewport(value)} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile">Mobile (360x640)</SelectItem>
                    <SelectItem value="desktop">Desktop (1366x768)</SelectItem>
                    <SelectItem value="both">Both (Mobile + Desktop)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="shadows"
                    checked={includeShadows}
                    onCheckedChange={(checked) => setIncludeShadows(checked as boolean)}
                    disabled={loading}
                  />
                  <Label htmlFor="shadows" className="text-sm">
                    Include box shadows
                  </Label>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Extract Critical CSS
                </>
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && result.success && (
        <Card>
          <CardHeader>
            <CardTitle>Extraction Results</CardTitle>
            <CardDescription>
              URL: {result.url} | Viewport: {result.viewport} | 
              Processing time: {result.processingTime ? formatTime(result.processingTime) : 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Validation messages */}
            {result.validation && (result.validation.errors.length > 0 || result.validation.warnings.length > 0) && (
              <div className="mb-4 space-y-2">
                {result.validation.errors.map((error, index) => (
                  <div key={index} className="p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                    {error}
                  </div>
                ))}
                {result.validation.warnings.map((warning, index) => (
                  <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    {warning}
                  </div>
                ))}
              </div>
            )}

            {/* Tab navigation for 'both' viewport */}
            {viewport === 'both' && result.mobile && result.desktop ? (
              <div className="space-y-4">
                <div className="flex space-x-1 bg-muted p-1 rounded-md">
                  <Button
                    variant={activeTab === 'combined' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('combined')}
                  >
                    Combined ({formatBytes(result.combined?.size || 0)})
                  </Button>
                  <Button
                    variant={activeTab === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('mobile')}
                  >
                        Mobile ({formatBytes((result.mobile?.size || 0))})
                      </Button>
                      <Button
                        variant={activeTab === 'desktop' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('desktop')}
                      >
                        Desktop ({formatBytes((result.desktop?.size || 0))})
                  </Button>
                </div>

                {/* Combined CSS */}
                {activeTab === 'combined' && result.combined && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Combined CSS</h3>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(result.combined!.css)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadCSS(result.combined!.css, 'critical-combined.css')}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                        <code>{result.combined.css}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* Mobile CSS */}
                {activeTab === 'mobile' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        Mobile CSS ({formatTime((result.mobile?.extractionTime || 0))})
                      </h3>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(result.mobile!.css)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadCSS(result.mobile!.css, 'critical-mobile.css')}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                        <code>{result.mobile.css}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* Desktop CSS */}
                {activeTab === 'desktop' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        Desktop CSS ({formatTime((result.desktop?.extractionTime || 0))})
                      </h3>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(result.desktop!.css)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadCSS(result.desktop!.css, 'critical-desktop.css')}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                        <code>{result.desktop.css}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Single viewport result */
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    Critical CSS ({result.extractionTime ? formatTime(result.extractionTime) : 'N/A'})
                  </h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.css!)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCSS(result.css!, 'critical.css')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                    <code>{result.css}</code>
                  </pre>
                </div>
                <div className="text-sm text-muted-foreground">
                  Size: {formatBytes(result.size || 0)} | 
                  Extraction time: {result.extractionTime ? formatTime(result.extractionTime) : 'N/A'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}