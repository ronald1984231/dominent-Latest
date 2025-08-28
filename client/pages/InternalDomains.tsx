import { useState, useEffect } from "react";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { 
  Domain, 
  GetDomainsResponse, 
  AddDomainRequest, 
  AddDomainResponse 
} from "@shared/domain-api";

export default function InternalDomains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegistrar, setSelectedRegistrar] = useState("all");
  const [registrars, setRegistrars] = useState<string[]>([]);
  const { toast } = useToast();

  // Mock domains data to match the screenshot
  const mockDomains = [
    {
      id: "1",
      domain: "affiliateadventures.com",
      subdomain: "affiliateadventures.com",
      registrar: "GoDaddy.com, LLC",
      expirationDate: "Expired",
      status: "Online" as const,
      lastCheck: "Last check 4 hours ago",
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      domain: "elenvet.com",
      subdomain: "elenvet.com", 
      registrar: "GoDaddy.com, LLC",
      expirationDate: "Expired",
      status: "Online" as const,
      lastCheck: "Last check 4 hours ago",
      createdAt: new Date().toISOString()
    },
    {
      id: "3",
      domain: "ducifuenella.com",
      subdomain: "ducifuenella.com",
      registrar: "GoDaddy.com, LLC", 
      expirationDate: "Expired",
      status: "Online" as const,
      lastCheck: "Last check 4 hours ago",
      createdAt: new Date().toISOString()
    },
    {
      id: "4",
      domain: "fingerpaiger.com",
      subdomain: "fingerpaiger.com",
      registrar: "GoDaddy.com, LLC",
      expirationDate: "Expired", 
      status: "Online" as const,
      lastCheck: "Last check 4 hours ago",
      createdAt: new Date().toISOString()
    },
    {
      id: "5",
      domain: "longenez.com",
      subdomain: "longenez.com",
      registrar: "GoDaddy.com, LLC",
      expirationDate: "Expired",
      status: "Online" as const,
      lastCheck: "Last check 4 hours ago", 
      createdAt: new Date().toISOString()
    },
    {
      id: "6",
      domain: "mediekamara.buzz",
      subdomain: "mediekamara.buzz",
      registrar: "GoDaddy.com, LLC",
      expirationDate: "Expired",
      status: "Online" as const,
      lastCheck: "Last check 4 hours ago",
      createdAt: new Date().toISOString()
    },
    {
      id: "7",
      domain: "megalodonlens.com",
      subdomain: "megalodonlens.com",
      registrar: "GoDaddy.com, LLC",
      expirationDate: "Expired",
      status: "Online" as const,
      lastCheck: "Last check 4 hours ago",
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    setDomains(mockDomains);
    setRegistrars(["GoDaddy.com, LLC", "NameCheap, Inc.", "Cloudflare, Inc."]);
    setLoading(false);
  }, []);

  const handleSearch = () => {
    let filteredDomains = mockDomains;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredDomains = filteredDomains.filter(domain =>
        domain.domain.toLowerCase().includes(searchLower) ||
        domain.registrar.toLowerCase().includes(searchLower)
      );
    }

    if (selectedRegistrar !== "all") {
      filteredDomains = filteredDomains.filter(domain =>
        domain.registrar.includes(selectedRegistrar)
      );
    }

    setDomains(filteredDomains);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Online': return 'default';
      case 'Offline': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <InternalHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Domains</h1>
          
          <div className="flex items-center space-x-3">
            <Button className="bg-success hover:bg-success/90 text-success-foreground">
              + ADD DOMAIN
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <span>📥</span>
              <span>IMPORT FROM REGISTRAR</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <span>📋</span>
              <span>UPDATE DOMAINS</span>
            </Button>
            <Button variant="outline" size="icon">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-muted-foreground">Filter by registrar:</span>
            <Select value={selectedRegistrar} onValueChange={setSelectedRegistrar}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select registrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Select registrar</SelectItem>
                {registrars.map(registrar => (
                  <SelectItem key={registrar} value={registrar}>
                    {registrar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-3">
            <Input
              placeholder="Search websites by alias or URL"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-80"
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              SEARCH
            </Button>
          </div>
        </div>

        {/* Domains Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                  Loading domains...
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-6 p-6 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
                  <span className="col-span-2">NAME</span>
                  <span>REGISTRAR</span>
                  <span>EXPIRATION DATE</span>
                  <span className="col-span-2">STATUS</span>
                </div>

                {/* Table Rows */}
                {domains.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No domains found. Try adjusting your search criteria.</p>
                  </div>
                ) : (
                  domains.map((domain, index) => (
                    <div key={domain.id} className={`grid grid-cols-6 gap-6 p-6 hover:bg-muted/30 transition-colors ${index !== domains.length - 1 ? 'border-b' : ''}`}>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 bg-gray-300 rounded"></div>
                          <div>
                            <div className="font-medium text-foreground">{domain.domain}</div>
                            <div className="text-sm text-muted-foreground">{domain.subdomain}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-foreground">{domain.registrar}</span>
                        <span className="text-xs text-success">Connected</span>
                      </div>
                      
                      <div>
                        <Badge variant="destructive" className="text-xs font-medium">
                          {domain.expirationDate}
                        </Badge>
                      </div>
                      
                      <div className="col-span-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <div className="text-success text-sm font-medium">Online</div>
                            <div className="text-xs text-muted-foreground">{domain.lastCheck}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Automated updated
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
