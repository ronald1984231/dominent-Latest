import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useToast } from "../hooks/use-toast";
import { ArrowLeft, Edit, Settings, FileText, Globe, AlertTriangle } from "lucide-react";

interface RegistrarDetails {
  id: string;
  name: string;
  displayName: string;
  label: string;
  email: string;
  apiStatus: 'Connected' | 'Disconnected' | 'Error';
  status: 'Connected' | 'Disconnected' | 'Unmanaged';
  domainCount: number;
  apiKey?: string;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export default function RegistrarOverview() {
  const { id } = useParams<{ id: string }>();
  const [registrar, setRegistrar] = useState<RegistrarDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadRegistrarDetails();
    }
  }, [id]);

  const loadRegistrarDetails = async () => {
    try {
      setLoading(true);
      
      // Mock data based on the screenshot
      const mockRegistrar: RegistrarDetails = {
        id: id || "3319",
        name: "GoDaddy.com, LLC",
        displayName: "GoDaddy.com, LLC",
        label: "godaddy_Samay",
        email: "contact@example.com",
        apiStatus: "Connected",
        status: "Connected", 
        domainCount: 26,
        apiKey: "3mM44Ywf7i6urx_FjKo6pjXqBwiP5kCxFnNV",
        lastSync: new Date().toISOString(),
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: new Date().toISOString()
      };
      
      setRegistrar(mockRegistrar);
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
      
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 mb-6">
          <Link to="/internal/registrars" className="text-muted-foreground hover:text-foreground">
            Registrars
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{registrar.displayName}</span>
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
                      className="flex items-center px-4 py-2 text-sm font-medium bg-muted text-foreground rounded-md mb-1"
                    >
                      <FileText className="w-4 h-4 mr-3" />
                      Overview
                    </Link>
                    
                    <Link
                      to={`/registrars/${registrar.id}/domains`}
                      className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md mb-1"
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
                      <div className="mt-1 text-sm">www.godaddy.com</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Alert */}
              {registrar.apiStatus === 'Connected' && (
                <div className="flex items-center p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-destructive mr-3" />
                  <div>
                    <div className="font-medium text-destructive">Missing</div>
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
                        Last updated: {new Date(registrar.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    {getStatusBadge(registrar.apiStatus)}
                  </div>
                  
                  {registrar.apiKey && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="font-medium mb-2">API Key</div>
                      <div className="font-mono text-sm bg-muted px-3 py-2 rounded">
                        {registrar.apiKey}
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
                      <div className="text-2xl font-bold text-primary">{registrar.domainCount}</div>
                      <div className="text-sm text-muted-foreground">Total Domains</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">24</div>
                      <div className="text-sm text-muted-foreground">Active Domains</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-muted-foreground">2</div>
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
