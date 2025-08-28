import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useToast } from "../hooks/use-toast";
import { FileText, Globe, Settings, Loader2, Search, MoreVertical } from "lucide-react";

interface RegistrarDomain {
  id: string;
  domain: string;
  status: 'Active' | 'Inactive' | 'Pending';
  monitored: boolean;
  autoRenew: boolean;
  expiryDate: string;
  registrationDate: string;
}

interface RegistrarInfo {
  id: string;
  name: string;
  displayName: string;
}

export default function RegistrarDomains() {
  const { id } = useParams<{ id: string }>();
  const [registrar, setRegistrar] = useState<RegistrarInfo | null>(null);
  const [domains, setDomains] = useState<RegistrarDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Mock domains data based on the screenshot
  const mockDomains: RegistrarDomain[] = [
    {
      id: "1",
      domain: "affiliateadventures.com",
      status: "Active",
      monitored: true,
      autoRenew: true,
      expiryDate: "2025-03-15",
      registrationDate: "2024-03-15"
    },
    {
      id: "2", 
      domain: "elenvet.com",
      status: "Active",
      monitored: true,
      autoRenew: true,
      expiryDate: "2025-06-20",
      registrationDate: "2024-06-20"
    },
    {
      id: "3",
      domain: "ducifuenella.com", 
      status: "Active",
      monitored: true,
      autoRenew: true,
      expiryDate: "2025-01-10",
      registrationDate: "2024-01-10"
    },
    {
      id: "4",
      domain: "fingerpaiger.com",
      status: "Active", 
      monitored: true,
      autoRenew: true,
      expiryDate: "2025-08-30",
      registrationDate: "2024-08-30"
    },
    {
      id: "5",
      domain: "longenez.com",
      status: "Active",
      monitored: true,
      autoRenew: true,
      expiryDate: "2025-04-12",
      registrationDate: "2024-04-12"
    },
    {
      id: "6",
      domain: "mediekamara.buzz",
      status: "Active",
      monitored: true,
      autoRenew: true,
      expiryDate: "2025-09-05",
      registrationDate: "2024-09-05"
    },
    {
      id: "7",
      domain: "megalodonlens.com",
      status: "Active",
      monitored: true,
      autoRenew: true,
      expiryDate: "2025-07-18",
      registrationDate: "2024-07-18"
    },
    {
      id: "8",
      domain: "onlineenterpreneurs.com",
      status: "Active",
      monitored: true,
      autoRenew: true,
      expiryDate: "2025-02-28",
      registrationDate: "2024-02-28"
    },
    {
      id: "9",
      domain: "goabloggers.com",
      status: "Active",
      monitored: true,
      autoRenew: true,
      expiryDate: "2025-05-15",
      registrationDate: "2024-05-15"
    },
    {
      id: "10",
      domain: "onlinerica.online",
      status: "Active",
      monitored: true,
      autoRenew: true,
      expiryDate: "2025-10-22",
      registrationDate: "2024-10-22"
    },
    {
      id: "11",
      domain: "amherens.com",
      status: "Active",
      monitored: true,
      autoRenew: true,
      expiryDate: "2025-11-08",
      registrationDate: "2024-11-08"
    }
  ];

  useEffect(() => {
    if (id) {
      loadRegistrarDomains();
    }
  }, [id]);

  const loadRegistrarDomains = async () => {
    try {
      setLoading(true);
      
      // Mock registrar info
      const mockRegistrar: RegistrarInfo = {
        id: id || "3319",
        name: "GoDaddy.com, LLC",
        displayName: "GoDaddy.com, LLC"
      };
      
      setRegistrar(mockRegistrar);
      setDomains(mockDomains);
    } catch (error) {
      console.error("Failed to load registrar domains:", error);
      toast({
        title: "Error",
        description: "Failed to load domains. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMonitoring = async (domainId: string, enabled: boolean) => {
    try {
      // Update local state optimistically
      setDomains(prev => prev.map(domain => 
        domain.id === domainId 
          ? { ...domain, monitored: enabled }
          : domain
      ));

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Success",
        description: `Monitoring ${enabled ? 'enabled' : 'disabled'} for domain.`,
      });
    } catch (error) {
      // Revert on error
      setDomains(prev => prev.map(domain => 
        domain.id === domainId 
          ? { ...domain, monitored: !enabled }
          : domain
      ));
      
      toast({
        title: "Error",
        description: "Failed to update monitoring settings.",
        variant: "destructive",
      });
    }
  };

  const filteredDomains = domains.filter(domain =>
    domain.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <InternalHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading domains...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!registrar) {
    return (
      <div className="min-h-screen bg-background">
        <InternalHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">Registrar not found</h2>
            <p className="text-muted-foreground mt-2">The requested registrar could not be found.</p>
            <Button asChild className="mt-4">
              <Link to="/internal/registrars">Back to Registrars</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <InternalHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 mb-6">
          <Link to="/internal/registrars" className="text-muted-foreground hover:text-foreground">
            Registrars
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link to={`/registrars/${registrar.id}`} className="text-muted-foreground hover:text-foreground">
            {registrar.displayName}
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-3">
            <Card>
              <CardContent className="p-0">
                <div className="flex flex-col">
                  {/* Header with Avatar */}
                  <div className="p-6 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {registrar.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{registrar.displayName}</h3>
                        <p className="text-sm text-muted-foreground">Registered 2 June 2024</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Menu */}
                  <nav className="p-2">
                    <Link
                      to={`/registrars/${registrar.id}`}
                      className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md mb-1"
                    >
                      <FileText className="w-4 h-4 mr-3" />
                      Overview
                    </Link>
                    
                    <Link
                      to={`/registrars/${registrar.id}/domains`}
                      className="flex items-center px-4 py-2 text-sm font-medium bg-muted text-foreground rounded-md mb-1"
                    >
                      <Globe className="w-4 h-4 mr-3" />
                      Domains
                    </Link>
                    
                    <Link
                      to={`/registrars/${registrar.id}/apisettings`}
                      className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md mb-1"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      API Settings
                    </Link>
                    
                    <Link
                      to={`/registrars/${registrar.id}/monthlyreports`}
                      className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                    >
                      <FileText className="w-4 h-4 mr-3" />
                      Monthly reports
                    </Link>
                  </nav>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            <div className="space-y-6">
              {/* Header with Search */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Domains</h1>
                  <p className="text-muted-foreground">Manage domains for {registrar.displayName}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search domains..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline">
                    ACTIONS
                  </Button>
                </div>
              </div>

              {/* Domains List */}
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 bg-muted/30 text-sm font-medium text-muted-foreground">
                      <div className="col-span-6">DOMAIN</div>
                      <div className="col-span-2">STATUS</div>
                      <div className="col-span-2">MONITORING</div>
                      <div className="col-span-2">ACTIONS</div>
                    </div>

                    {/* Domain Rows */}
                    {filteredDomains.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          {searchTerm ? "No domains found matching your search." : "No domains found."}
                        </p>
                      </div>
                    ) : (
                      filteredDomains.map((domain) => (
                        <div key={domain.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/30 transition-colors">
                          <div className="col-span-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="font-medium">{domain.domain}</div>
                                <div className="text-sm text-muted-foreground">
                                  Expires: {new Date(domain.expiryDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-span-2 flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                              {domain.status}
                            </span>
                          </div>

                          <div className="col-span-2 flex items-center">
                            <Switch
                              checked={domain.monitored}
                              onCheckedChange={(checked) => handleToggleMonitoring(domain.id, checked)}
                              aria-label={`Toggle monitoring for ${domain.domain}`}
                            />
                          </div>

                          <div className="col-span-2 flex items-center">
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              {filteredDomains.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Showing {filteredDomains.length} of {domains.length} domains
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
