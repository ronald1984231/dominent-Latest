import { Header } from "./Header";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">{title}</h1>
          {description && (
            <p className="text-lg text-muted-foreground mb-8">{description}</p>
          )}
          <div className="bg-muted rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4">Page Coming Soon</h2>
            <p className="text-muted-foreground">
              This page is currently under development. Continue prompting to help build out this section!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
