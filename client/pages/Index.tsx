import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router-dom";

// Mock domain data to simulate the dashboard
const mockDomains = [
  {
    id: 1,
    domain: "youtube.com",
    subdomain: "youtube.com",
    registrar: "MarkMonitor Inc.",
    expirationDate: "15 February 2025 (108 days)",
    status: "Online",
    lastCheck: "4 days ago"
  },
  {
    id: 2,
    domain: "facebook.com",
    subdomain: "facebook.com",
    registrar: "RegistrarSafe, LLC",
    expirationDate: "30 March 2024 (38 days)",
    status: "Online",
    lastCheck: "3 days ago"
  },
  {
    id: 3,
    domain: "instagram.com",
    subdomain: "instagram.com",
    registrar: "RegistrarSafe, LLC",
    expirationDate: "4 June 2024 (204 days)",
    status: "Online",
    lastCheck: "4 days ago"
  },
  {
    id: 4,
    domain: "amazon.com",
    subdomain: "amazon.com",
    registrar: "MarkMonitor Inc.",
    expirationDate: "31 October 2025 (10 days)",
    status: "Online",
    lastCheck: "4 days ago"
  },
  {
    id: 5,
    domain: "reddit.com",
    subdomain: "reddit.com",
    registrar: "MarkMonitor Inc.",
    expirationDate: "28 April 2024 (67 days)",
    status: "Online",
    lastCheck: "1 day ago"
  },
  {
    id: 6,
    domain: "x.com",
    subdomain: "x.com",
    registrar: "CSC Corporate LLC",
    expirationDate: "25 October 2024 (307 days)",
    status: "Online",
    lastCheck: "3 hours ago"
  },
  {
    id: 7,
    domain: "netflix.com",
    subdomain: "netflix.com",
    registrar: "MarkMonitor Inc.",
    expirationDate: "16 November 2025 (49 days)",
    status: "Online",
    lastCheck: "6 days ago"
  }
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-cyan-light/30 to-cyan-light/50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero content */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                The new way to monitor your domains.
              </h1>
              
              <p className="text-lg text-foreground/80 max-w-lg leading-relaxed">
                Domexus monitors domains and SSL certificates expiration, nameservers, DNS Records, domain availability, sales and more. We notify you whenever you want.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Button size="lg" className="bg-success hover:bg-success/90 text-success-foreground font-medium px-8 py-3">
                  <Link to="/create-account" className="flex items-center">
                    Start free trial
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </Button>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="font-medium">14 day free trial</div>
                  <div>No credit card required</div>
                </div>
              </div>
            </div>

            {/* Right side - Dashboard preview */}
            <div className="bg-background rounded-lg shadow-2xl border border-border overflow-hidden">
              {/* Dashboard header */}
              <div className="bg-background border-b border-border px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Domexus</h3>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>My Team</span>
                    <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                  </div>
                </div>
                
                {/* Navigation tabs */}
                <div className="flex space-x-6 mt-4 text-sm">
                  <span className="text-foreground border-b-2 border-primary pb-2">Domains</span>
                  <span className="text-muted-foreground">My Registrars</span>
                  <span className="text-muted-foreground">Domains Watch-list</span>
                  <span className="text-muted-foreground">Projects</span>
                  <span className="text-muted-foreground">Notifications</span>
                  <span className="text-muted-foreground">Marketplace</span>
                  <span className="text-muted-foreground">Documentation</span>
                </div>
              </div>

              {/* Domains section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Domains</h2>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground">
                      + ADD DOMAIN
                    </Button>
                    <Button size="sm" variant="outline">
                      📥 IMPORT FROM REGISTRAR
                    </Button>
                    <Button size="sm" variant="outline">
                      📋 IMPORT DOMAINS
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-4 mb-6 text-sm">
                  <span className="text-muted-foreground">Filter by registrar:</span>
                  <select className="border border-border rounded px-2 py-1 text-xs">
                    <option>Select registrar</option>
                  </select>
                  <div className="flex items-center space-x-4 ml-auto">
                    <input 
                      type="text" 
                      placeholder="Search websites by alias or URL" 
                      className="border border-border rounded px-3 py-2 text-sm w-64"
                    />
                    <Button size="sm" className="bg-foreground text-background">SEARCH</Button>
                  </div>
                </div>

                {/* Domains table */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {mockDomains.map((domain) => (
                    <div key={domain.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        {/* Favicon */}
                        <div className="w-5 h-5 bg-muted rounded flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-sm text-foreground">{domain.domain}</div>
                          <div className="text-xs text-muted-foreground">{domain.subdomain}</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground min-w-32">
                        <div>{domain.registrar}</div>
                        <div className="text-muted-foreground/70">{domain.registrar.split(' ')[0]}</div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground min-w-40">
                        <div className="font-medium">{domain.expirationDate}</div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                          Online
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Last check {domain.lastCheck}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Registrars Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
            WORKS WITH SEVERAL DOMAIN REGISTRARS.
          </h2>
        </div>
      </section>
    </div>
  );
}
