import ExtractorForm from '@/components/ExtractorForm';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Critical CSS Extractor</h1>
        <p className="text-lg text-muted-foreground">
          Extract critical CSS above the fold, optimized for Google PageSpeed Insights metrics
        </p>
      </div>
      <ExtractorForm />
    </main>
  );
}