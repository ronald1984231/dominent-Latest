import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import { AddDomainRequest } from "@shared/domain-api";
import { ArrowLeft, Loader2, Plus, Globe, Shield, Server, Mail } from "lucide-react";

export default function AddDomain() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    domain: "",
    registrar: "",
    expiry_date: "",
    autoRenew: false,
    notes: "",
    monitoring: {
      enabled: true,
      checkWhois: true,
      checkSSL: true,
      checkUptime: true,
      checkDNS: true
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Predefined registrars list
  const registrars = [
    "GoDaddy.com, LLC",
    "NameCheap, Inc.", 
    "Cloudflare, Inc.",
    "Google LLC",
    "Amazon Registrar, Inc.",
    "MarkMonitor Inc.",
    "Network Solutions, LLC",
    "1&1 Internet SE",
    "Tucows Domains Inc.",
    "eNom, LLC",
    "Other"
  ];

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Domain validation
    if (!formData.domain.trim()) {
      errors.domain = "Domain name is required";
    } else if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(formData.domain.trim())) {
      errors.domain = "Please enter a valid domain name";
    }
    
    // Registrar validation
    if (!formData.registrar) {
      errors.registrar = "Please select a registrar";
    }
    
    // Expiry date validation (optional but if provided, should be valid)
    if (formData.expiry_date) {
      const expiryDate = new Date(formData.expiry_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        errors.expiry_date = "Expiry date cannot be in the past";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const request: AddDomainRequest = {
        domain: formData.domain.trim().toLowerCase()
      };
      
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `Domain ${formData.domain} has been added successfully and monitoring has been initiated.`,
        });
        
        // Navigate to the new domain's detail page
        if (data.domain?.id) {
          navigate(`/internal/domains/${data.domain.id}`);
        } else {
          navigate("/internal/domains");
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add domain. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to add domain:", error);
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleMonitoringChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      monitoring: {
        ...prev.monitoring,
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <InternalHeader />
      
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/internal/domains">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Domains
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add New Domain</h1>
            <p className="text-muted-foreground">Add a new domain to your monitoring dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Domain Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain Name *</Label>
                  <Input
                    id="domain"
                    type="text"
                    placeholder="example.com"
                    value={formData.domain}
                    onChange={(e) => handleInputChange("domain", e.target.value)}
                    className={validationErrors.domain ? "border-destructive" : ""}
                  />
                  {validationErrors.domain && (
                    <p className="text-sm text-destructive">{validationErrors.domain}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter the domain without http:// or www (e.g., example.com)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrar">Registrar *</Label>
                  <Select value={formData.registrar} onValueChange={(value) => handleInputChange("registrar", value)}>
                    <SelectTrigger className={validationErrors.registrar ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select registrar" />
                    </SelectTrigger>
                    <SelectContent>
                      {registrars.map(registrar => (
                        <SelectItem key={registrar} value={registrar}>
                          {registrar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.registrar && (
                    <p className="text-sm text-destructive">{validationErrors.registrar}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => handleInputChange("expiry_date", e.target.value)}
                    className={validationErrors.expiry_date ? "border-destructive" : ""}
                  />
                  {validationErrors.expiry_date && (
                    <p className="text-sm text-destructive">{validationErrors.expiry_date}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    If left empty, we'll try to detect it automatically via WHOIS
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoRenew"
                      checked={formData.autoRenew}
                      onCheckedChange={(checked) => handleInputChange("autoRenew", checked)}
                    />
                    <Label htmlFor="autoRenew">Auto-renewal enabled</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Indicates whether the domain is set to auto-renew at the registrar
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this domain..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Monitoring Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="monitoring-enabled"
                  checked={formData.monitoring.enabled}
                  onCheckedChange={(checked) => handleMonitoringChange("enabled", checked)}
                />
                <Label htmlFor="monitoring-enabled" className="font-medium">
                  Enable monitoring for this domain
                </Label>
              </div>

              {formData.monitoring.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 border-l-2 border-muted">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="check-whois"
                        checked={formData.monitoring.checkWhois}
                        onCheckedChange={(checked) => handleMonitoringChange("checkWhois", checked)}
                      />
                      <Label htmlFor="check-whois" className="flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        WHOIS & Expiry Monitoring
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Monitor domain registration and expiry date
                    </p>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="check-ssl"
                        checked={formData.monitoring.checkSSL}
                        onCheckedChange={(checked) => handleMonitoringChange("checkSSL", checked)}
                      />
                      <Label htmlFor="check-ssl" className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        SSL Certificate Monitoring
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Monitor SSL certificate validity and expiry
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="check-uptime"
                        checked={formData.monitoring.checkUptime}
                        onCheckedChange={(checked) => handleMonitoringChange("checkUptime", checked)}
                      />
                      <Label htmlFor="check-uptime" className="flex items-center">
                        <Server className="w-4 h-4 mr-2" />
                        Uptime Monitoring
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Monitor if domain is accessible and responding
                    </p>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="check-dns"
                        checked={formData.monitoring.checkDNS}
                        onCheckedChange={(checked) => handleMonitoringChange("checkDNS", checked)}
                      />
                      <Label htmlFor="check-dns" className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        DNS Monitoring
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Monitor DNS records and nameserver changes
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Immediate Actions:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Domain will be added to your dashboard</li>
                    <li>• Initial WHOIS lookup will be performed</li>
                    <li>• SSL certificate check will be initiated</li>
                    <li>• DNS records will be analyzed</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Ongoing Monitoring:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Daily automated checks</li>
                    <li>• Email alerts for important events</li>
                    <li>• Expiry reminders (30, 15, 7, 1 days)</li>
                    <li>• SSL expiry notifications</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between pt-6">
            <Button variant="outline" asChild>
              <Link to="/internal/domains">Cancel</Link>
            </Button>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-success hover:bg-success/90 text-success-foreground min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Domain
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
