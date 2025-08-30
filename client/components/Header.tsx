import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Logo } from "./Logo";

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo size="md" />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/domains-search" 
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                isActive('/domains-search') ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Domains Search
            </Link>
            <a 
              href="/documentation" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
            >
              Documentation
              <svg 
                className="ml-1 h-3 w-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                />
              </svg>
            </a>
            <Link 
              to="/pricing" 
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                isActive('/pricing') ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/login" 
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                isActive('/login') ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Login
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link to="/create-account">Create Account</Link>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
