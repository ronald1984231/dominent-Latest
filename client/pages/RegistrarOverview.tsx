import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useToast } from "../hooks/use-toast";
import { ArrowLeft, Edit, Settings, FileText, Globe, AlertTriangle } from "lucide-react";
import { Registrar } from "@shared/internal-api";
import { Domain, GetDomainsResponse } from "@shared/domain-api";
import { getRegistrarConfig } from "@shared/registrar-config";


export default function RegistrarOverview() {
  const { id } = useParams<{ id: string }>();
  const [registrar, setRegistrar] = useState<Registrar | null>(null);
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState<Domain[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadRegistrarDetails();
    }
  }, [id]);

  useEffect(() => {
    if (registrar?.name) {
      loadDomainsForRegistrar(registrar.name);
    }
  }, [registrar?.name]);

  const loadRegistrarDetails = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/internal/registrars/${id}`);
      const data = await response.json();

      if (response.ok && data.success && data.registrar) {
        setRegistrar(data.registrar);
      } else {
        throw new Error(data.error || 'Failed to fetch registrar');
      }
    } catch (error) {
      console.error("Failed to load registrar details:", error);
      toast({
        title: "Error",
        description: "Failed to load registrar details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDomainsForRegistrar = async (registrarName: string) => {
    try {
      const params = new URLSearchParams();
      params.append('registrar', registrarName);
      params.append('limit', '1000');
      const response = await fetch(`/api/domains?${params.toString()}`);
      let data: Partial<GetDomainsResponse> = {};
      try {
        data = await response.json();
      } catch {}
      if (!response.ok || !data || !Array.isArray((data as any).domains)) {
        setDomains([]);
        return;
      }
      setDomains((data as GetDomainsResponse).domains);
    } catch (e) {
      console.error('Failed to load domains for registrar:', e);
      setDomains([]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Connected':
        return <Badge className="bg-success text-success-foreground">Connected</Badge>;
      case 'Disconnected':
        return <Badge variant="destructive">Disconnected</Badge>;
      case 'Error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <InternalHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading registrar details...</span>
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
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 mb-4 sm:mb-6 text-sm sm:text-base">
          <Link to="/internal/registrars" className="text-muted-foreground hover:text-foreground">
            Registrars
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium truncate">{getRegistrarConfig(registrar.name)?.displayName || registrar.name}</span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <div className="flex flex-col">
                  {/* Header with Avatar */}
                  <div className="p-4 sm:p-6 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {registrar.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{getRegistrarConfig(registrar.name)?.displayName || registrar.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Registered {new Date(registrar.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Menu */}
                  <nav className="p-2">
                    <Link
                      to={`/registrars/${registrar.id}`}
                      className="flex items-center px-3 sm:px-4 py-2 text-sm font-medium bg-muted text-foreground rounded-md mb-1"
                    >
                      <FileText className="w-4 h-4 mr-2 sm:mr-3" />
                      <span className="truncate">Overview</span>
                    </Link>

                    <Link
                      to={`/registrars/${registrar.id}/domains`}
                      className="flex items-center px-3 sm:px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md mb-1"
                    >
                      <Globe className="w-4 h-4 mr-2 sm:mr-3" />
                      <span className="truncate">Domains</span>
                    </Link>

                    <Link
                      to={`/registrars/${registrar.id}/apisettings`}
                      className="flex items-center px-3 sm:px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md mb-1"
                    >
                      <Settings className="w-4 h-4 mr-2 sm:mr-3" />
                      <span className="truncate">API Settings</span>
                    </Link>

                    <Link
                      to={`/registrars/${registrar.id}/monthlyreports`}
                      className="flex items-center px-3 sm:px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                    >
                      <FileText className="w-4 h-4 mr-2 sm:mr-3" />
                      <span className="truncate">Monthly reports</span>
                    </Link>
                  </nav>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            <div className="space-y-6">
              {/* Registrar Identity Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Registrar Identity</CardTitle>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    EDIT
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Registrar name</Label>
                      <div className="mt-1 text-sm">{registrar.name}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Website</Label>
                      <div className="mt-1 text-sm">{getRegistrarConfig(registrar.name)?.website || 'N/A'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Alert */}
              {registrar.apiStatus !== 'Connected' && (
                <div className="flex items-center p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-destructive mr-3" />
                  <div>
                    <div className="font-medium text-destructive">Configuration Required</div>
                    <div className="text-sm text-muted-foreground">
                      This registrar requires additional configuration. Please check the API settings and ensure all required fields are properly configured.
                    </div>
                  </div>
                </div>
              )}

              {/* API Status */}
              <Card>
                <CardHeader>
                  <CardTitle>API Connection Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Connection Status</div>
                      <div className="text-sm text-muted-foreground">
                        Last updated: {new Date(registrar.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {getStatusBadge(registrar.apiStatus)}
                  </div>
                  
                  {registrar.apiCredentials && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="font-medium mb-2">API Credentials</div>
                      <div className="space-y-2">
                        {Object.entries(registrar.apiCredentials).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded text-right max-w-xs truncate">
                              {key.toLowerCase().includes('secret') || key.toLowerCase().includes('password') ? '•••••••••••••••' : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Domain Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Domain Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{domains.length}</div>
                      <div className="text-sm text-muted-foreground">Total Domains</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">{domains.filter(d => d.status === 'Online').length}</div>
                      <div className="text-sm text-muted-foreground">Active Domains</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-muted-foreground">{domains.filter(d => {
                        if (!d.expiry_date) return 0;
                        const dt = new Date(d.expiry_date);
                        return !isNaN(dt.getTime()) && dt.getTime() < Date.now();
                      }).length}</div>
                      <div className="text-sm text-muted-foreground">Expired Domains</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
