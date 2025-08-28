import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { useToast } from "../hooks/use-toast";
import { 
  Domain, 
  GetDomainsResponse, 
  AddDomainRequest, 
  DomainSearchQuery,
  DomainMonitoringResponse
} from "@shared/domain-api";
import { Loader2, Plus, Download, RefreshCw, Settings, ExternalLink, Trash2 } from "lucide-react";

export default function InternalDomains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegistrar, setSelectedRegistrar] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSSLStatus, setSelectedSSLStatus] = useState("all");
  const [selectedExpiryStatus, setSelectedExpiryStatus] = useState("all");
  const [registrars, setRegistrars] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  const [bulkDomains, setBulkDomains] = useState("");
  const [addingBulkDomains, setAddingBulkDomains] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDomains();
    loadRegistrars();
  }, []);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const query: DomainSearchQuery = {
        search: searchTerm || undefined,
        registrar: selectedRegistrar !== "all" ? selectedRegistrar : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        sslStatus: selectedSSLStatus !== "all" ? selectedSSLStatus : undefined,
        expiryStatus: selectedExpiryStatus !== "all" ? selectedExpiryStatus : undefined,
        limit: 100
      };

      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });

      const response = await fetch(`/api/domains?${params}`);
      const data: GetDomainsResponse = await response.json();
      
      setDomains(data.domains);
    } catch (error) {
      console.error("Failed to load domains:", error);
      toast({
        title: "Error",
        description: "Failed to load domains. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrars = async () => {
    try {
      const response = await fetch("/api/registrars");
      const data = await response.json();
      setRegistrars(data.registrars || []);
    } catch (error) {
      console.error("Failed to load registrars:", error);
    }
  };

  const handleBulkAddDomains = async () => {
    if (!bulkDomains.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one domain name.",
        variant: "destructive",
      });
      return;
    }

    const domainList = bulkDomains
      .split('\n')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0)
      .filter(domain => /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(domain));

    if (domainList.length === 0) {
      toast({
        title: "Error",
        description: "No valid domain names found. Please check your input.",
        variant: "destructive",
      });
      return;
    }

    setAddingBulkDomains(true);
    let successCount = 0;
    let failedCount = 0;
    const failedDomains: string[] = [];

    try {
      // Process domains in batches of 3 to avoid overwhelming the server
      const batchSize = 3;
      for (let i = 0; i < domainList.length; i += batchSize) {
        const batch = domainList.slice(i, i + batchSize);

        const promises = batch.map(async (domain) => {
          try {
            const request: AddDomainRequest = { domain: domain.toLowerCase() };
            const response = await fetch("/api/domains", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(request),
            });

            const data = await response.json();

            if (response.ok) {
              successCount++;
              return { success: true, domain };
            } else {
              failedCount++;
              failedDomains.push(`${domain}: ${data.error || 'Unknown error'}`);
              return { success: false, domain, error: data.error };
            }
          } catch (error) {
            failedCount++;
            failedDomains.push(`${domain}: Network error`);
            return { success: false, domain, error: 'Network error' };
          }
        });

        await Promise.all(promises);

        // Add delay between batches
        if (i + batchSize < domainList.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Show results
      if (failedCount === 0) {
        toast({
          title: "Success",
          description: `All ${successCount} domains added successfully.`,
        });
      } else {
        toast({
          title: "Partial Success",
          description: `${successCount} domains added successfully, ${failedCount} failed.`,
          variant: failedCount > successCount ? "destructive" : "default",
        });
      }

      if (successCount > 0) {
        setBulkDomains("");
        loadDomains();
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add domains. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingBulkDomains(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast({
        title: "Error",
        description: "Please enter a domain name.",
        variant: "destructive",
      });
      return;
    }

    setAddingDomain(true);
    try {
      const request: AddDomainRequest = { domain: newDomain.trim() };
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Domain ${newDomain} added successfully.`,
        });
        setNewDomain("");
        loadDomains();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add domain.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingDomain(false);
    }
  };

  const handleDeleteDomain = async (domainId: string, domainName: string) => {
    try {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Domain ${domainName} deleted successfully.`,
        });
        loadDomains();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete domain.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAllDomains = async () => {
    setUpdating(true);

    let successCount = 0;
    let failedCount = 0;

    try {
      // Process domains in smaller batches to avoid overwhelming the server
      const batchSize = 3;
      const batches: Domain[][] = [];

      for (let i = 0; i < domains.length; i += batchSize) {
        batches.push(domains.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const promises = batch.map(async (domain) => {
          try {
            const response = await fetch(`/api/domains/${domain.id}/monitor`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            });

            // Check if response is ok before trying to read body
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Clone the response to avoid "body stream already read" error
            const responseClone = response.clone();

            try {
              const result = await responseClone.json();
              successCount++;
              return result;
            } catch (jsonError) {
              // If JSON parsing fails, try to get text instead
              const text = await response.text();
              console.warn(`Failed to parse JSON for ${domain.domain}, got text:`, text);
              successCount++;
              return { success: true };
            }
          } catch (error) {
            console.error(`Failed to update ${domain.domain}:`, error);
            failedCount++;
            return null;
          }
        });

        // Wait for current batch to complete
        await Promise.all(promises);

        // Add small delay between batches
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (failedCount === 0) {
        toast({
          title: "Success",
          description: `All ${successCount} domains updated successfully.`,
        });
      } else {
        toast({
          title: "Partial Success",
          description: `${successCount} domains updated successfully, ${failedCount} failed.`,
          variant: failedCount > successCount ? "destructive" : "default",
        });
      }

      // Reload domains after a short delay
      setTimeout(() => {
        loadDomains();
      }, 1000);

    } catch (error) {
      console.error("Update all domains error:", error);
      toast({
        title: "Error",
        description: "Failed to update domains. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSearch = () => {
    loadDomains();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return 'default';
      case 'offline': return 'destructive';
      default: return 'secondary';
    }
  };

  const getExpiryVariant = (dateStr: string | undefined) => {
    if (!dateStr) return 'secondary';
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'destructive'; // Expired
    if (diffDays <= 7) return 'destructive'; // Expiring very soon
    if (diffDays <= 30) return 'destructive'; // Expiring soon
    return 'default'; // Valid
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays <= 30) {
      return `${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSSLStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'valid': return 'text-success';
      case 'expired': return 'text-destructive';
      default: return 'text-muted-foreground';
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-success hover:bg-success/90 text-success-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  ADD DOMAIN
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Add New Domain</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter the domain name you want to monitor. We'll automatically check its status, SSL certificate, and expiration date.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAddDomain} disabled={addingDomain}>
                    {addingDomain ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Domain"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>IMPORT FROM REGISTRAR</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={handleUpdateAllDomains}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>UPDATE DOMAINS</span>
            </Button>
            
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6 space-y-4 lg:space-y-0 flex-wrap lg:flex-nowrap">
          <div className="flex items-center space-x-4 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filters:</span>
            
            <Select value={selectedRegistrar} onValueChange={setSelectedRegistrar}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Registrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Registrars</SelectItem>
                {registrars.map(registrar => (
                  <SelectItem key={registrar} value={registrar}>
                    {registrar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSSLStatus} onValueChange={setSelectedSSLStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="SSL" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SSL</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedExpiryStatus} onValueChange={setSelectedExpiryStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Expiry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Expiry</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-3">
            <Input
              placeholder="Search domains or registrars..."
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
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "SEARCH"
              )}
            </Button>
          </div>
        </div>

        {/* Domains Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center">
                  <Loader2 className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2" />
                  Loading domains...
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {/* Table Header */}
                <div className="grid grid-cols-9 gap-4 p-6 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
                  <span className="col-span-2">NAME</span>
                  <span>REGISTRAR</span>
                  <span>DOMAIN EXPIRY</span>
                  <span>SSL STATUS</span>
                  <span>SSL EXPIRY</span>
                  <span className="col-span-2">STATUS</span>
                  <span>ACTIONS</span>
                </div>

                {/* Table Rows */}
                {domains.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No domains found. Try adjusting your search criteria or add a new domain.</p>
                  </div>
                ) : (
                  domains.map((domain, index) => (
                    <div key={domain.id} className={`grid grid-cols-9 gap-4 p-6 hover:bg-muted/30 transition-colors ${index !== domains.length - 1 ? 'border-b' : ''}`}>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 bg-gray-300 rounded"></div>
                          <div>
                            <Link 
                              to={`/internal/domains/${domain.id}`}
                              className="font-medium text-foreground hover:text-primary transition-colors"
                            >
                              {domain.domain}
                            </Link>
                            <div className="text-sm text-muted-foreground">{domain.subdomain}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-foreground text-sm">{domain.registrar}</span>
                        <span className="text-xs text-success">Connected</span>
                      </div>

                      <div>
                        <Badge variant={getExpiryVariant(domain.expiry_date) as any} className="text-xs font-medium">
                          {formatDate(domain.expiry_date)}
                        </Badge>
                        {domain.lastWhoisCheck && (
                          <div className="text-xs text-muted-foreground mt-1">
                            WHOIS: {new Date(domain.lastWhoisCheck).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className={`text-sm font-medium ${getSSLStatusColor(domain.ssl_status)}`}>
                          {domain.ssl_status?.toUpperCase() || 'UNKNOWN'}
                        </div>
                        {domain.lastSslCheck && (
                          <div className="text-xs text-muted-foreground">
                            SSL: {new Date(domain.lastSslCheck).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div>
                        {domain.ssl_expiry ? (
                          <Badge variant={getExpiryVariant(domain.ssl_expiry) as any} className="text-xs font-medium">
                            {formatDate(domain.ssl_expiry)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unknown</span>
                        )}
                      </div>

                      <div className="col-span-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            domain.status === 'Online' ? 'bg-green-500' : 
                            domain.status === 'Offline' ? 'bg-red-500' : 'bg-gray-400'
                          }`}></div>
                          <div>
                            <Badge variant={getStatusBadgeVariant(domain.status)} className="text-xs">
                              {domain.status}
                            </Badge>
                            <div className="text-xs text-muted-foreground">{domain.lastCheck}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Auto updated
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link to={`/internal/domains/${domain.id}`}>
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Domain</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {domain.domain}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteDomain(domain.id, domain.domain)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {domains.length > 0 && (
          <div className="mt-6 text-sm text-muted-foreground">
            Showing {domains.length} domain{domains.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
