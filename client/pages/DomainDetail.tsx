import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useToast } from "../hooks/use-toast";
import { 
  Domain,
  DomainDetailResponse,
  CreateDNSRecordRequest,
  UpdateDomainRequest,
  SSLCertificate,
  DNSRecord,
  DomainServices,
  MonitoringLog
} from "@shared/domain-api";
import { 
  Loader2, 
  ArrowLeft, 
  Edit, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Globe,
  Mail,
  Server,
  Shield,
  Clock,
  Plus,
  Trash2,
  ExternalLink
} from "lucide-react";

export default function DomainDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [domain, setDomain] = useState<Domain | null>(null);
  const [sslCertificates, setSslCertificates] = useState<SSLCertificate[]>([]);
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [services, setServices] = useState<DomainServices | null>(null);
  const [monitoringLogs, setMonitoringLogs] = useState<MonitoringLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  // Form states
  const [editForm, setEditForm] = useState({
    registrar: "",
    expiry_date: "",
    autoRenew: false
  });
  
  // DNS record form
  const [dnsForm, setDnsForm] = useState({
    name: "",
    type: "A" as const,
    value: "",
    ttl: 3600,
    priority: 10
  });
  const [addingDNS, setAddingDNS] = useState(false);

  useEffect(() => {
    if (id) {
      loadDomainDetails();
    }
  }, [id]);

  const loadDomainDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/domains/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Domain not found",
            description: "The requested domain could not be found.",
            variant: "destructive",
          });
          navigate("/internal/domains");
          return;
        }
        throw new Error("Failed to load domain details");
      }
      
      const data: DomainDetailResponse = await response.json();
      
      setDomain(data.domain);
      setSslCertificates(data.sslCertificates);
      setDnsRecords(data.dnsRecords);
      setServices(data.services);
      setMonitoringLogs(data.monitoringLogs);
      
      // Initialize edit form
      setEditForm({
        registrar: data.domain.registrar,
        expiry_date: data.domain.expiry_date || "",
        autoRenew: data.domain.autoRenew || false
      });
      
    } catch (error) {
      console.error("Failed to load domain details:", error);
      toast({
        title: "Error",
        description: "Failed to load domain details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDomain = async () => {
    if (!id || !domain) return;
    
    try {
      setUpdating(true);
      const updates: UpdateDomainRequest = {
        registrar: editForm.registrar,
        expiry_date: editForm.expiry_date || undefined,
        autoRenew: editForm.autoRenew
      };
      
      const response = await fetch(`/api/domains/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Domain updated successfully.",
        });
        setEditMode(false);
        loadDomainDetails();
      } else {
        throw new Error("Failed to update domain");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update domain. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleTriggerMonitoring = async () => {
    if (!id) return;
    
    try {
      setUpdating(true);
      const response = await fetch(`/api/domains/${id}/monitor`, {
        method: "POST",
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Domain monitoring completed.",
        });
        loadDomainDetails();
      } else {
        throw new Error("Failed to trigger monitoring");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger monitoring. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateDNSRecord = async () => {
    if (!id || !dnsForm.name || !dnsForm.value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setAddingDNS(true);
      const request: CreateDNSRecordRequest = {
        domainId: id,
        name: dnsForm.name,
        type: dnsForm.type,
        value: dnsForm.value,
        ttl: dnsForm.ttl,
        priority: dnsForm.type === "MX" ? dnsForm.priority : undefined
      };
      
      const response = await fetch(`/api/domains/${id}/dns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "DNS record created successfully.",
        });
        setDnsForm({ name: "", type: "A", value: "", ttl: 3600, priority: 10 });
        loadDomainDetails();
      } else {
        throw new Error("Failed to create DNS record");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create DNS record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingDNS(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "online":
      case "valid":
      case "success":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "offline":
      case "expired":
      case "error":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getExpiryStatus = (dateStr: string | undefined) => {
    if (!dateStr) return "unknown";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "expired";
    if (diffDays <= 7) return "critical";
    if (diffDays <= 30) return "warning";
    return "valid";
  };

  const getExpiryColor = (status: string) => {
    switch (status) {
      case "expired": return "text-destructive";
      case "critical": return "text-destructive";
      case "warning": return "text-orange-500";
      case "valid": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <InternalHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading domain details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="min-h-screen bg-background">
        <InternalHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">Domain not found</h2>
            <p className="text-muted-foreground mt-2">The requested domain could not be found.</p>
            <Button asChild className="mt-4">
              <Link to="/internal/domains">Back to Domains</Link>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/internal/domains">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Domains
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{domain.domain}</h1>
              <p className="text-muted-foreground">Domain monitoring and management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleTriggerMonitoring}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Check Now
            </Button>
            
            <Button
              variant={editMode ? "default" : "outline"}
              onClick={() => setEditMode(!editMode)}
            >
              <Edit className="w-4 h-4 mr-2" />
              {editMode ? "Cancel" : "Edit"}
            </Button>
          </div>
        </div>

        {/* Domain Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              {getStatusIcon(domain.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{domain.status}</div>
              <p className="text-xs text-muted-foreground">{domain.lastCheck}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Domain Expiry</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getExpiryColor(getExpiryStatus(domain.expiry_date))}`}>
                {domain.expiry_date ? new Date(domain.expiry_date).toLocaleDateString() : "Unknown"}
              </div>
              <p className="text-xs text-muted-foreground">
                {domain.lastWhoisCheck ? `Checked ${new Date(domain.lastWhoisCheck).toLocaleDateString()}` : "Never checked"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SSL Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getExpiryColor(domain.ssl_status === 'valid' ? 'valid' : 'expired')}`}>
                {domain.ssl_status?.toUpperCase() || "UNKNOWN"}
              </div>
              <p className="text-xs text-muted-foreground">
                {domain.lastSslCheck ? `Checked ${new Date(domain.lastSslCheck).toLocaleDateString()}` : "Never checked"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registrar</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{domain.registrar}</div>
              <p className="text-xs text-muted-foreground">
                Auto-renew: {domain.autoRenew ? "Enabled" : "Disabled"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Domain Information Edit Form */}
        {editMode && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Edit Domain Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrar">Registrar</Label>
                  <Input
                    id="registrar"
                    value={editForm.registrar}
                    onChange={(e) => setEditForm(prev => ({ ...prev, registrar: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={editForm.expiry_date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={editForm.autoRenew}
                  onChange={(e) => setEditForm(prev => ({ ...prev, autoRenew: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="autoRenew">Enable auto-renewal</Label>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleUpdateDomain} disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for detailed information */}
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="ssl">SSL Certificates</TabsTrigger>
            <TabsTrigger value="dns">DNS Records</TabsTrigger>
            <TabsTrigger value="logs">Monitoring Logs</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  Services Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hosting */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Server className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Hosting</h3>
                      <p className="text-sm text-muted-foreground">
                        {services?.hosting?.detected ? `${services.hosting.provider} (${services.hosting.ipAddress})` : "Not detected"}
                      </p>
                    </div>
                  </div>
                  {getStatusIcon(services?.hosting?.detected ? "success" : "unknown")}
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email Service</h3>
                      <p className="text-sm text-muted-foreground">
                        {services?.email?.detected ? `${services.email.provider} (${services.email.mxRecords?.join(", ")})` : "Not detected"}
                      </p>
                    </div>
                  </div>
                  {getStatusIcon(services?.email?.detected ? "success" : "unknown")}
                </div>

                {/* Nameservers */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Globe className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Nameservers</h3>
                      <p className="text-sm text-muted-foreground">
                        {services?.nameservers?.detected ? services.nameservers.servers.join(", ") : "Not detected"}
                      </p>
                    </div>
                  </div>
                  {getStatusIcon(services?.nameservers?.detected ? "success" : "unknown")}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SSL Certificates Tab */}
          <TabsContent value="ssl" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  SSL Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sslCertificates.length === 0 ? (
                  <p className="text-muted-foreground">No SSL certificates found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Issuer</TableHead>
                        <TableHead>Valid From</TableHead>
                        <TableHead>Expires At</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sslCertificates.map((cert) => (
                        <TableRow key={cert.id}>
                          <TableCell className="font-mono text-sm">{cert.serialNumber}</TableCell>
                          <TableCell>{cert.issuer}</TableCell>
                          <TableCell>{new Date(cert.validFrom).toLocaleDateString()}</TableCell>
                          <TableCell className={getExpiryColor(getExpiryStatus(cert.expiresAt))}>
                            {new Date(cert.expiresAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={cert.isValid ? "default" : "destructive"}>
                              {cert.isValid ? "Valid" : "Invalid"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DNS Records Tab */}
          <TabsContent value="dns" className="space-y-6">
            {/* Add DNS Record Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create New DNS Record</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dns-name">Hostname</Label>
                    <Input
                      id="dns-name"
                      placeholder="@, www, mail, etc."
                      value={dnsForm.name}
                      onChange={(e) => setDnsForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dns-type">Type</Label>
                    <Select value={dnsForm.type} onValueChange={(value: any) => setDnsForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="AAAA">AAAA</SelectItem>
                        <SelectItem value="CNAME">CNAME</SelectItem>
                        <SelectItem value="MX">MX</SelectItem>
                        <SelectItem value="TXT">TXT</SelectItem>
                        <SelectItem value="NS">NS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dns-value">Value</Label>
                    <Input
                      id="dns-value"
                      placeholder="IP address or target"
                      value={dnsForm.value}
                      onChange={(e) => setDnsForm(prev => ({ ...prev, value: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dns-ttl">TTL</Label>
                    <Input
                      id="dns-ttl"
                      type="number"
                      value={dnsForm.ttl}
                      onChange={(e) => setDnsForm(prev => ({ ...prev, ttl: parseInt(e.target.value) || 3600 }))}
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button onClick={handleCreateDNSRecord} disabled={addingDNS} className="w-full">
                      {addingDNS ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {dnsForm.type === "MX" && (
                  <div className="mt-4">
                    <Label htmlFor="dns-priority">Priority</Label>
                    <Input
                      id="dns-priority"
                      type="number"
                      value={dnsForm.priority}
                      onChange={(e) => setDnsForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 10 }))}
                      className="w-32"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* DNS Records Table */}
            <Card>
              <CardHeader>
                <CardTitle>DNS Records</CardTitle>
              </CardHeader>
              <CardContent>
                {dnsRecords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Getting DNS records...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>TTL</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dnsRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-mono">{record.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{record.value}</TableCell>
                          <TableCell>{record.ttl}</TableCell>
                          <TableCell>{record.priority || "-"}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring History</CardTitle>
              </CardHeader>
              <CardContent>
                {monitoringLogs.length === 0 ? (
                  <p className="text-muted-foreground">No monitoring logs available.</p>
                ) : (
                  <div className="space-y-4">
                    {monitoringLogs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                        {getStatusIcon(log.status)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{log.type.toUpperCase()}</Badge>
                              <span className="text-sm font-medium">{log.message}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(log.timestamp)}
                            </span>
                          </div>
                          {log.details && (
                            <pre className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
