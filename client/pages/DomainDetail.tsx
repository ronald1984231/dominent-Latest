import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useToast } from "../hooks/use-toast";
import { safeFetch, safeFetchJson, getFetchErrorMessage } from "../lib/safeFetch";
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
  Clock,
  Plus
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
  const [loadingDNS, setLoadingDNS] = useState(true);
  const { toast } = useToast();

  // DNS record form
  const [dnsForm, setDnsForm] = useState({
    name: "",
    type: "A" as const,
    value: "",
    ttl: 1800,
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
      const data: DomainDetailResponse = await safeFetchJson(`/api/domains/${id}`);

      setDomain(data.domain);
      setSslCertificates(data.sslCertificates);
      setServices(data.services);
      setMonitoringLogs(data.monitoringLogs);

      // Simulate DNS loading
      setTimeout(() => {
        setDnsRecords(data.dnsRecords);
        setLoadingDNS(false);
      }, 2000);

    } catch (error) {
      console.error("Failed to load domain details:", error);

      // Handle 404 specifically
      if (error instanceof Error && error.message.includes('404')) {
        toast({
          title: "Domain not found",
          description: "The requested domain could not be found.",
          variant: "destructive",
        });
        navigate("/internal/domains");
        return;
      }

      toast({
        title: "Error",
        description: getFetchErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      
      const response = await safeFetch(`/api/domains/${id}/dns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "DNS record created successfully.",
        });
        setDnsForm({ name: "", type: "A", value: "", ttl: 1800, priority: 10 });
        setLoadingDNS(true);
        setTimeout(() => {
          loadDomainDetails();
        }, 1000);
      } else {
        throw new Error("Failed to create DNS record");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getFetchErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setAddingDNS(false);
    }
  };

  const handleServiceCheck = async (serviceType: string) => {
    if (!id) return;
    
    try {
      setUpdating(true);
      const response = await safeFetch(`/api/domains/${id}/monitor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `${serviceType} check completed.`,
        });
        loadDomainDetails();
      } else {
        throw new Error("Failed to check service");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getFetchErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const getExpiryVariant = (dateStr: string | undefined) => {
    if (!dateStr) return 'secondary';
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'destructive';
    if (diffDays <= 7) return 'destructive';
    if (diffDays <= 30) return 'destructive';
    return 'default';
  };

  // SSL-specific functions (separate from domain expiry)
  const getSSLExpiryVariant = (sslExpiry: string | undefined) => {
    if (!sslExpiry) return 'secondary';
    const expiry = new Date(sslExpiry);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'destructive'; // Expired - red
    if (diffDays <= 30) return 'destructive'; // Expiring soon - orange/red
    return 'default'; // Valid - green
  };

  const formatSSLExpiry = (sslExpiry: string | undefined) => {
    if (!sslExpiry) return 'Unknown';

    const expiry = new Date(sslExpiry);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays <= 30) {
      return `${diffDays} days`;
    } else {
      return expiry.toLocaleDateString(); // Show formatted date for long-term SSL
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
        {/* Back Navigation */}
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/internal/domains">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>
        </div>

        {/* Domain Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-success">{domain.domain}</h1>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              EDIT
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground">IN</div>
              <div className="font-medium">{domain.registrar}</div>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                <span className="text-sm text-success">Connected</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">EXPIRATION DATE</div>
              <Badge 
                variant={getExpiryVariant(domain.expiry_date) as any}
                className="mt-1"
              >
                {domain.expiry_date ? formatDate(domain.expiry_date) : 'Unknown'}
              </Badge>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">AUTO RENEWAL</div>
              <div className="flex items-center mt-1">
                {domain.autoRenew ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-success mr-1" />
                    <span className="text-success">YES</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-muted-foreground mr-1" />
                    <span className="text-muted-foreground">NO</span>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">STATUS</div>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  domain.status === 'Online' ? 'bg-success' : 'bg-destructive'
                }`}></div>
                <span className={domain.status === 'Online' ? 'text-success' : 'text-destructive'}>
                  {domain.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Nameservers</div>
                  <div className="text-sm text-muted-foreground">
                    {services?.nameservers?.detected ? 'Nameservers detected' : 'No nameservers detected'}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleServiceCheck('Nameservers')}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email handled by</div>
                  <div className="text-sm text-muted-foreground">
                    {services?.email?.detected ? `${services.email.provider} Records detected` : 'No MX Records detected'}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleServiceCheck('Email')}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Hosting</div>
                  <div className="text-sm text-muted-foreground">
                    {services?.hosting?.detected ? `${services.hosting.provider}` : 'Not detected'}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleServiceCheck('Hosting')}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SSL Certificates Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>SSL Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            {sslCertificates.length === 0 ? (
              <p className="text-muted-foreground">No SSL certificates found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SERIAL NUMBER</TableHead>
                    <TableHead>ISSUER</TableHead>
                    <TableHead>VALID FROM</TableHead>
                    <TableHead>EXPIRATION DATE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sslCertificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono text-sm">{cert.serialNumber}</TableCell>
                      <TableCell>{cert.issuer}</TableCell>
                      <TableCell>{formatDate(cert.validFrom)}</TableCell>
                      <TableCell>
                        <Badge variant={getSSLExpiryVariant(cert.expiresAt) as any}>
                          {formatSSLExpiry(cert.expiresAt)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create New Record Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create new record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="hostname">Hostname</Label>
                <Input
                  id="hostname"
                  placeholder="Enter @ or hostname"
                  value={dnsForm.name}
                  onChange={(e) => setDnsForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
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
                    <SelectItem value="SRV">SRV</SelectItem>
                    <SelectItem value="URL">URL</SelectItem>
                    <SelectItem value="ALIAS">ALIAS</SelectItem>
                    <SelectItem value="CAA">CAA</SelectItem>
                    <SelectItem value="SFP">SFP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  placeholder="Enter value or content IP"
                  value={dnsForm.value}
                  onChange={(e) => setDnsForm(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ttl">TTL</Label>
                <Input
                  id="ttl"
                  type="number"
                  value={dnsForm.ttl}
                  onChange={(e) => setDnsForm(prev => ({ ...prev, ttl: parseInt(e.target.value) || 1800 }))}
                />
              </div>

              {dnsForm.type === "MX" && (
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={dnsForm.priority}
                    onChange={(e) => setDnsForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 10 }))}
                  />
                </div>
              )}
              
              <Button 
                onClick={handleCreateDNSRecord} 
                disabled={addingDNS}
                className="bg-slate-800 hover:bg-slate-700 text-white"
              >
                {addingDNS ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "CREATE RECORD"
                )}
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                You can create a record at the root of the domain or enter a hostname or subdomain.
                A record can only work for IPv4 addresses only and is a request where your domain should direct to.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* DNS Records Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              DNS Records
              <Button variant="outline" size="sm">
                UPDATE DNS
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDNS ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Getting DNS records...</span>
              </div>
            ) : dnsRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No DNS records found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NAME</TableHead>
                    <TableHead>TYPE</TableHead>
                    <TableHead>VALUE</TableHead>
                    <TableHead>TTL</TableHead>
                    <TableHead>PRIORITY</TableHead>
                    <TableHead>ACTIONS</TableHead>
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
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
