'use client';

import ExtractorForm from '@/components/ExtractorForm';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sparkles, Zap, Target, Gauge } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

      <header className="relative border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-primary/20 animate-pulse-ring" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Critical CSS Extractor
              </h1>
              <p className="text-xs text-muted-foreground">
                PageSpeed Optimization Tool
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <section className="text-center space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Extract Critical CSS for{' '}
                <span className="gradient-text">Perfect Lighthouse Scores</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Automatically extract the minimum CSS needed to render
                above-the-fold content. Optimized for Google PageSpeed Insights
                and Lighthouse metrics.
              </p>
            </div>
          </section>

          <section
            className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="group relative rounded-xl border border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Above-the-Fold Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Accurately identifies CSS needed for initial viewport
                  rendering
                </p>
              </div>
            </div>

            <div className="group relative rounded-xl border border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Lighthouse Optimized</h3>
                <p className="text-sm text-muted-foreground">
                  Replicates Chrome rendering behavior for accurate results
                </p>
              </div>
            </div>

            <div className="group relative rounded-xl border border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Gauge className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Minified Output</h3>
                <p className="text-sm text-muted-foreground">
                  Production-ready, deduplicated, and minified CSS output
                </p>
              </div>
            </div>
          </section>

          <section
            className="animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <ExtractorForm />
          </section>
        </div>
      </main>

      <footer className="relative border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Critical CSS Extractor v1.0.0</p>
            <p className="font-mono text-xs">
              Built with Next.js, Playwright & TypeScript
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
