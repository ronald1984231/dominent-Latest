import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

export function InternalHeader() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Domains", path: "/internal/domains" },
    { name: "My Registrars", path: "/internal/registrars" },
    { name: "Domains Watchlist", path: "/internal/watchlist" },
    { name: "Projects", path: "/internal/projects" },
    { name: "Notifications", path: "/internal/notifications" },
    { name: "Monitoring", path: "/internal/monitoring" },
    { name: "Documentation", path: "/internal/documentation" },
  ];

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="text-2xl font-bold text-foreground">
            Domexus
          </Link>

          {/* User info and avatar */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Googleplex Network</span>
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              R
            </div>
          </div>
        </div>

        {/* Internal Navigation */}
        <nav className="mt-4 border-t border-border pt-4">
          <div className="flex space-x-8 overflow-x-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium whitespace-nowrap pb-3 border-b-2 transition-colors ${
                  isActive(item.path)
                    ? 'text-foreground border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
