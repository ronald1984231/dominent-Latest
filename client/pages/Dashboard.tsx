import { useState, useEffect } from "react";
import { Header } from "../components/Header";
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

export default function Dashboard() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegistrar, setSelectedRegistrar] = useState("all");
  const [registrars, setRegistrars] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDomains();
    fetchRegistrars();
  }, []);

  const fetchDomains = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedRegistrar !== 'all') params.append('registrar', selectedRegistrar);

      const response = await fetch(`/api/domains?${params}`);
      const data: GetDomainsResponse = await response.json();
      setDomains(data.domains);
    } catch (error) {
      console.error('Error fetching domains:', error);
      toast({
        title: "Error",
        description: "Failed to fetch domains",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrars = async () => {
    try {
      const response = await fetch('/api/registrars');
      const data = await response.json();
      setRegistrars(data.registrars);
    } catch (error) {
      console.error('Error fetching registrars:', error);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;

    setAddingDomain(true);
    try {
      const request: AddDomainRequest = { domain: newDomain.trim() };
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data: AddDomainResponse = await response.json();

      if (data.success && data.domain) {
        setDomains(prev => [data.domain!, ...prev]);
        setNewDomain("");
        toast({
          title: "Success",
          description: `Domain ${data.domain.domain} added successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add domain",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding domain:', error);
      toast({
        title: "Error",
        description: "Failed to add domain",
        variant: "destructive"
      });
    } finally {
      setAddingDomain(false);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    try {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDomains(prev => prev.filter(d => d.id !== domainId));
        toast({
          title: "Success",
          description: "Domain removed from monitoring",
        });
      }
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast({
        title: "Error",
        description: "Failed to remove domain",
        variant: "destructive"
      });
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchDomains();
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
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Domain Dashboard</h1>
            <p className="text-muted-foreground mt-2">Monitor your domains and SSL certificates</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
            <div className="flex gap-2">
              <Input
                placeholder="Enter domain to add..."
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
                className="w-64"
              />
              <Button 
                onClick={handleAddDomain}
                disabled={addingDomain || !newDomain.trim()}
                className="bg-success hover:bg-success/90"
              >
                {addingDomain ? 'Adding...' : '+ ADD DOMAIN'}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Search domains</label>
                <Input
                  placeholder="Search by domain or registrar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by registrar</label>
                <Select value={selectedRegistrar} onValueChange={setSelectedRegistrar}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select registrar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All registrars</SelectItem>
                    {registrars.map(registrar => (
                      <SelectItem key={registrar} value={registrar}>
                        {registrar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'SEARCH'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Domains table */}
        <Card>
          <CardHeader>
            <CardTitle>Monitored Domains ({domains.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                  Loading domains...
                </div>
              </div>
            ) : domains.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No domains found. Add a domain to start monitoring.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {domains.map((domain) => (
                  <div key={domain.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Domain info */}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground">{domain.domain}</div>
                        <div className="text-sm text-muted-foreground">{domain.subdomain}</div>
                      </div>
                      
                      {/* Registrar */}
                      <div className="min-w-32 hidden md:block">
                        <div className="text-sm text-muted-foreground">{domain.registrar}</div>
                      </div>
                      
                      {/* Expiration */}
                      <div className="min-w-40 hidden lg:block">
                        <div className="text-sm text-foreground">{domain.expirationDate}</div>
                      </div>
                      
                      {/* Status */}
                      <div className="flex items-center space-x-4">
                        <Badge variant={getStatusBadgeVariant(domain.status) as any}>
                          {domain.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground hidden sm:block">
                          Last check: {domain.lastCheck}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDomain(domain.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
