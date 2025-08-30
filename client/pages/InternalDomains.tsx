import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { InternalHeader } from "../components/InternalHeader";
import { SSLStatusCompact } from "../components/SSLStatus";
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
  DomainMonitoringResponse,
} from "@shared/domain-api";
import {
  Registrar,
  RegistrarImportRequest,
  RegistrarImportResponse,
} from "@shared/internal-api";
import {
  Loader2,
  Plus,
  Download,
  RefreshCw,
  Settings,
  ExternalLink,
  Trash2,
} from "lucide-react";

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
  const [addDomainMode, setAddDomainMode] = useState<'single' | 'bulk'>('single');
  const [updating, setUpdating] = useState(false);
  const [availableRegistrars, setAvailableRegistrars] = useState<Registrar[]>(
    [],
  );
  const [selectedRegistrarForImport, setSelectedRegistrarForImport] =
    useState("");
  const [importing, setImporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
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
        expiryStatus:
          selectedExpiryStatus !== "all" ? selectedExpiryStatus : undefined,
        limit: 100,
      };

      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });

      const response = await fetch(`/api/domains?${params}`);
      let data: Partial<GetDomainsResponse> = {};
      try {
        data = await response.json();
      } catch {
        // Non-JSON response; treat as failure
      }

      if (!response.ok || !data || !Array.isArray((data as any).domains)) {
        setDomains([]);
        throw new Error(
          (data as any)?.error ||
            `Failed to fetch domains (${response.status})`,
        );
      }

      setDomains((data as GetDomainsResponse).domains);
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
      let data: any = null;
      try {
        data = await response.clone().json();
      } catch {
        data = null;
      }
      setRegistrars(Array.isArray(data?.registrars) ? data.registrars : []);

      // Also load available registrars for import
      const registrarsResponse = await fetch("/api/internal/registrars");
      let registrarsData: any = null;
      try {
        registrarsData = await registrarsResponse.clone().json();
      } catch {
        registrarsData = null;
      }
      setAvailableRegistrars(
        Array.isArray(registrarsData?.registrars)
          ? registrarsData.registrars
          : [],
      );
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
      .split("\n")
      .map((domain) => domain.trim())
      .filter((domain) => domain.length > 0)
      .filter((domain) =>
        /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
          domain,
        ),
      );

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
              failedDomains.push(`${domain}: ${data.error || "Unknown error"}`);
              return { success: false, domain, error: data.error };
            }
          } catch (error) {
            failedCount++;
            failedDomains.push(`${domain}: Network error`);
            return { success: false, domain, error: "Network error" };
          }
        });

        await Promise.all(promises);

        // Add delay between batches
        if (i + batchSize < domainList.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
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
              body: JSON.stringify({}),
            });

            // Check if response is ok before trying to read body
            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`,
              );
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
              console.warn(
                `Failed to parse JSON for ${domain.domain}, got text:`,
                text,
              );
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
          await new Promise((resolve) => setTimeout(resolve, 1000));
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

  const handleImportFromRegistrar = async () => {
    if (!selectedRegistrarForImport) {
      toast({
        title: "Error",
        description: "Please select a registrar to import from.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    try {
      const request: RegistrarImportRequest = {
        registrarId: selectedRegistrarForImport,
      };

      const response = await fetch("/api/internal/registrars/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data: RegistrarImportResponse = await response.json();

      if (data.success) {
        toast({
          title: "Import Successful",
          description: `Imported ${data.importedCount} domains from ${data.registrarName}. ${data.failedCount > 0 ? `${data.failedCount} domains failed to import.` : ""}`,
        });

        if (data.errors.length > 0) {
          console.warn("Import warnings:", data.errors);
        }

        setShowImportDialog(false);
        setSelectedRegistrarForImport("");
        loadDomains();
      } else {
        toast({
          title: "Import Failed",
          description:
            data.errors.length > 0
              ? data.errors[0]
              : "Failed to import domains.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error during import. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleSearch = () => {
    loadDomains();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "online":
        return "default";
      case "offline":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getExpiryVariant = (dateStr: string | undefined) => {
    if (!dateStr) return "secondary";
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "destructive"; // Expired
    if (diffDays <= 7) return "destructive"; // Expiring very soon
    if (diffDays <= 30) return "destructive"; // Expiring soon
    return "default"; // Valid
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Unknown";
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Expired";
    } else if (diffDays === 0) {
      return "Expires today";
    } else if (diffDays <= 30) {
      return `${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatExpiryDate = (
    expiryDate: string | undefined,
    domain?: Domain,
  ) => {
    // If expiry_date exists, show YYYY-MM-DD format
    if (expiryDate) {
      return expiryDate; // Already in YYYY-MM-DD format from WHOIS
    }

    // Fallback to "Unknown" - the WHOIS raw will be shown below
    return "Unknown";
  };

  return (
    <div className="min-h-screen bg-background">
      <InternalHeader />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Domains
          </h1>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-success hover:bg-success/90 text-success-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="sm:hidden">ADD DOMAIN</span>
                  <span className="hidden sm:inline">ADD DOMAIN</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Add New Domain</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter the domain name you want to monitor. We'll
                    automatically check its status, SSL certificate, and
                    expiration date.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddDomain()}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAddDomain}
                    disabled={addingDomain}
                  >
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

            <AlertDialog
              open={showImportDialog}
              onOpenChange={setShowImportDialog}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="sm:hidden">IMPORT</span>
                  <span className="hidden sm:inline">
                    IMPORT FROM REGISTRAR
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Import Domains from Registrar
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Select a registrar to import all your domains. This will
                    fetch domain information including expiry dates,
                    auto-renewal settings, and nameservers using the registrar's
                    API.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Select
                    value={selectedRegistrarForImport}
                    onValueChange={setSelectedRegistrarForImport}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a registrar" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRegistrars.map((registrar) => (
                        <SelectItem key={registrar.id} value={registrar.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{registrar.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                {registrar.label}
                              </span>
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  registrar.apiStatus === "Connected"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableRegistrars.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      No registrars configured. Please add a registrar first in
                      the{" "}
                      <Link
                        to="/internal/registrars"
                        className="text-primary hover:underline"
                      >
                        Registrars page
                      </Link>
                      .
                    </p>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleImportFromRegistrar}
                    disabled={importing || !selectedRegistrarForImport}
                  >
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      "Import Domains"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center justify-center space-x-2"
              onClick={handleUpdateAllDomains}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="sm:hidden">UPDATE</span>
              <span className="hidden sm:inline">UPDATE DOMAINS</span>
            </Button>

            <Button variant="outline" size="icon" className="w-full sm:w-auto">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Filters:
            </span>

            <Select
              value={selectedRegistrar}
              onValueChange={setSelectedRegistrar}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Registrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Registrars</SelectItem>
                {registrars.map((registrar) => (
                  <SelectItem key={registrar} value={registrar}>
                    {registrar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedSSLStatus}
              onValueChange={setSelectedSSLStatus}
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="SSL" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SSL</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedExpiryStatus}
              onValueChange={setSelectedExpiryStatus}
            >
              <SelectTrigger className="w-full sm:w-32">
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Input
              placeholder="Search domains or registrars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full sm:w-80"
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
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
                    <p className="text-muted-foreground">
                      No domains found. Try adjusting your search criteria or
                      add a new domain.
                    </p>
                  </div>
                ) : (
                  domains.map((domain, index) => (
                    <div
                      key={domain.id}
                      className={`grid grid-cols-9 gap-4 p-6 hover:bg-muted/30 transition-colors ${index !== domains.length - 1 ? "border-b" : ""}`}
                    >
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
                            <div className="text-sm text-muted-foreground">
                              {domain.subdomain}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-foreground text-sm">
                          {domain.registrar || "Unknown"}
                        </span>
                        <span className="text-xs text-success">Connected</span>
                      </div>

                      <div>
                        <div className="flex flex-col">
                          {domain.expiry_date ? (
                            <Badge
                              variant={
                                getExpiryVariant(domain.expiry_date) as any
                              }
                              className="text-xs font-medium"
                            >
                              {formatExpiryDate(domain.expiry_date, domain)}
                            </Badge>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              Unknown
                            </div>
                          )}

                          {/* Show WHOIS information */}
                          <div className="text-xs text-muted-foreground mt-1">
                            {domain.expiry_date
                              ? domain.lastWhoisCheck
                                ? `Verified: ${new Date(domain.lastWhoisCheck).toLocaleDateString()}`
                                : "WHOIS: Not verified"
                              : domain.expirationDate &&
                                  domain.expirationDate !== "Unknown"
                                ? `Raw WHOIS: ${domain.expirationDate}`
                                : domain.lastWhoisCheck
                                  ? `Checked: ${new Date(domain.lastWhoisCheck).toLocaleDateString()}`
                                  : "WHOIS: Not checked"}
                          </div>
                        </div>
                      </div>

                      <div>
                        <SSLStatusCompact
                          sslExpiry={domain.ssl_expiry}
                          lastSslCheck={domain.lastSslCheck}
                        />
                      </div>

                      <div className="text-center">
                        {domain.ssl_expiry ? (
                          <div className="text-xs text-muted-foreground">
                            {new Date(domain.ssl_expiry).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            No certificate
                          </div>
                        )}
                      </div>

                      <div className="col-span-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              domain.status === "Online"
                                ? "bg-green-500"
                                : domain.status === "Offline"
                                  ? "bg-red-500"
                                  : "bg-gray-400"
                            }`}
                          ></div>
                          <div>
                            <Badge
                              variant={getStatusBadgeVariant(domain.status)}
                              className="text-xs"
                            >
                              {domain.status}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {domain.lastCheck}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Auto updated
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/internal/domains/${domain.id}`}>
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Domain</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {domain.domain}?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteDomain(domain.id, domain.domain)
                                }
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
            Showing {domains.length} domain{domains.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
