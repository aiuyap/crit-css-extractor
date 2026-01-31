'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Loader2,
  Play,
  Download,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Layers,
  Clock,
  FileCode,
  AlertCircle,
  Info,
} from 'lucide-react';

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

interface FormState {
  url: string;
  viewport: 'mobile' | 'desktop' | 'both';
  includeShadows: boolean;
}

interface ExtractorFormProps {
  initialUrl?: string;
}

export default function ExtractorForm({ initialUrl = '' }: ExtractorFormProps) {
  const [formState, setFormState] = useState<FormState>({
    url: initialUrl,
    viewport: 'both',
    includeShadows: false,
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleInputChange = useCallback(
    (field: keyof FormState, value: string | boolean) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  const formatTime = useCallback((ms: number) => {
    return (ms / 1000).toFixed(2) + 's';
  }, []);

  const copyToClipboard = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const downloadCSS = useCallback((css: string, filename: string) => {
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      new URL(formState.url);
    } catch {
      setError('Please enter a valid URL (including https://)');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setProgressText('Extracting...');

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

      const response = await fetch(`${BACKEND_URL}/api/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Extraction failed');
      }

      setProgress(100);
      setProgressText('Complete!');
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
      if (!result) {
        setProgress(0);
        setProgressText('');
      }
    }
  };

  const getViewportIcon = (viewport: string) => {
    switch (viewport) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const renderCodeBlock = (
    css: string,
    size: number,
    extractionTime: number,
    key: string
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {formatBytes(size)}
          </Badge>
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            {formatTime(extractionTime)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(css, key)}
            className="h-8 px-2"
          >
            {copied === key ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => downloadCSS(css, `critical-${key}.css`)}
            className="h-8 px-2"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <ScrollArea className="h-80">
          <pre className="p-4 text-sm font-mono leading-relaxed">
            <code className="text-foreground/90">{css}</code>
          </pre>
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileCode className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Extract Critical CSS</CardTitle>
              <CardDescription>
                Analyze any URL and extract above-the-fold CSS
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="url" className="text-sm font-medium">
                Target URL
              </Label>
              <div className="relative">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={formState.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  disabled={loading}
                  className="h-11 pl-4 pr-4 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Viewport</Label>
                <Tabs
                  value={formState.viewport}
                  onValueChange={(value) =>
                    handleInputChange('viewport', value)
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 h-11">
                    <TabsTrigger
                      value="mobile"
                      className="h-9"
                      disabled={loading}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Mobile
                    </TabsTrigger>
                    <TabsTrigger
                      value="desktop"
                      className="h-9"
                      disabled={loading}
                    >
                      <Monitor className="w-4 h-4 mr-2" />
                      Desktop
                    </TabsTrigger>
                    <TabsTrigger
                      value="both"
                      className="h-9"
                      disabled={loading}
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Both
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Options</Label>
                <div className="flex items-center gap-3 h-11 px-3 rounded-md border border-border/50 bg-background/50">
                  <Checkbox
                    id="shadows"
                    checked={formState.includeShadows}
                    onCheckedChange={(checked) =>
                      handleInputChange('includeShadows', checked as boolean)
                    }
                    disabled={loading}
                    className="border-primary"
                  />
                  <Label htmlFor="shadows" className="text-sm cursor-pointer">
                    Include box-shadow properties
                  </Label>
                </div>
              </div>
            </div>

            {loading && (
              <div className="space-y-3 animate-scale-in">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{progressText}</span>
                </div>
                <Progress value={50} className="h-2 animate-pulse" />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-base font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Extract Critical CSS
                </>
              )}
            </Button>

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/10 animate-scale-in">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    Extraction Failed
                  </p>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {result && result.success && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <CardTitle>Extraction Complete</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>{result.url}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="flex items-center gap-1">
                      {getViewportIcon(result.viewport)}
                      {result.viewport === 'both'
                        ? 'Mobile + Desktop'
                        : result.viewport}
                    </span>
                  </CardDescription>
                </div>
              </div>
              {result.processingTime && (
                <Badge variant="success" className="font-mono">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(result.processingTime)}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {(result.validation?.errors.length ?? 0) > 0 ||
            (result.validation?.warnings.length ?? 0) > 0 ? (
              <div className="space-y-3 mb-6">
                {result.validation?.errors.map((err, idx) => (
                  <div
                    key={`error-${idx}`}
                    className="flex items-start gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive/80">{err}</p>
                  </div>
                ))}
                {result.validation?.warnings.map((warn, idx) => (
                  <div
                    key={`warning-${idx}`}
                    className="flex items-start gap-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5"
                  >
                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-500/80">{warn}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {formState.viewport === 'both' &&
            result.mobile &&
            result.desktop ? (
              <Tabs defaultValue="combined" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-11 mb-4">
                  <TabsTrigger value="combined" className="h-9">
                    <Layers className="w-4 h-4 mr-2" />
                    Combined
                    <Badge
                      variant="secondary"
                      className="ml-2 font-mono text-xs"
                    >
                      {formatBytes(result.combined?.size ?? 0)}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className="h-9">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Mobile
                    <Badge
                      variant="secondary"
                      className="ml-2 font-mono text-xs"
                    >
                      {formatBytes(result.mobile.size)}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="desktop" className="h-9">
                    <Monitor className="w-4 h-4 mr-2" />
                    Desktop
                    <Badge
                      variant="secondary"
                      className="ml-2 font-mono text-xs"
                    >
                      {formatBytes(result.desktop.size)}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="combined">
                  {result.combined &&
                    renderCodeBlock(
                      result.combined.css,
                      result.combined.size,
                      (result.mobile?.extractionTime ?? 0) +
                        (result.desktop?.extractionTime ?? 0),
                      'combined'
                    )}
                </TabsContent>

                <TabsContent value="mobile">
                  {result.mobile &&
                    renderCodeBlock(
                      result.mobile.css,
                      result.mobile.size,
                      result.mobile.extractionTime,
                      'mobile'
                    )}
                </TabsContent>

                <TabsContent value="desktop">
                  {result.desktop &&
                    renderCodeBlock(
                      result.desktop.css,
                      result.desktop.size,
                      result.desktop.extractionTime,
                      'desktop'
                    )}
                </TabsContent>
              </Tabs>
            ) : (
              result.css &&
              renderCodeBlock(
                result.css,
                result.size ?? 0,
                result.extractionTime ?? 0,
                'single'
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
