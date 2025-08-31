import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { safeFetchJson, getFetchErrorMessage } from "../lib/safeFetch";
import { Registrar, AddRegistrarRequest } from "@shared/internal-api";
import { getRegistrarConfig, getRegistrarDisplayNames, RegistrarConfig } from "@shared/registrar-config";


export default function MyRegistrars() {
  const [registrars, setRegistrars] = useState<Registrar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRegistrar, setNewRegistrar] = useState({
    registrar: "",
    apiKey: "",
    apiSecret: "",
    label: "",
    credentials: {} as Record<string, string>
  });
  const [selectedRegistrarConfig, setSelectedRegistrarConfig] = useState<RegistrarConfig | null>(null);
  const { toast } = useToast();

  // Starting with empty registrars array - all sample data removed
  const mockRegistrars: Registrar[] = [];

  useEffect(() => {
    loadRegistrars();
  }, []);

  const loadRegistrars = async () => {
    try {
      setLoading(true);
      const data = await safeFetchJson('/api/internal/registrars');

      if (data && Array.isArray(data.registrars)) {
        setRegistrars(data.registrars);
      } else {
        setRegistrars([]);
      }
    } catch (error) {
      console.error('Error loading registrars:', error);
      toast({
        title: "Error",
        description: getFetchErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegistrar = async (registrarId: string, registrarName: string) => {
    try {
      const response = await fetch(`/api/internal/registrars/${registrarId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRegistrars(prev => prev.filter(r => r.id !== registrarId));
        toast({
          title: "Success",
          description: `${registrarName} removed successfully`,
        });
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to remove registrar",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting registrar:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRegistrarChange = (registrarName: string) => {
    const config = getRegistrarConfig(registrarName);
    if (!config) {
      toast({
        title: "Error",
        description: `Configuration not found for ${registrarName}. Please contact support.`,
        variant: "destructive"
      });
      return;
    }
    setSelectedRegistrarConfig(config);
    setNewRegistrar(prev => ({
      ...prev,
      registrar: registrarName,
      credentials: {}
    }));
  };

  const handleCredentialChange = (key: string, value: string) => {
    setNewRegistrar(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [key]: value
      }
    }));
  };

  const validateCredentials = (): boolean => {
    if (!selectedRegistrarConfig) return false;

    for (const field of selectedRegistrarConfig.credentials) {
      if (field.required && !newRegistrar.credentials[field.key]) {
        return false;
      }
    }
    return true;
  };

  const handleAddRegistrar = async () => {
    if (!newRegistrar.registrar) {
      toast({
        title: "Error",
        description: "Please select a registrar",
        variant: "destructive"
      });
      return;
    }

    if (!validateCredentials()) {
      toast({
        title: "Error",
        description: "Please fill in all required credential fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const requestData: AddRegistrarRequest = {
        registrar: newRegistrar.registrar,
        apiCredentials: newRegistrar.credentials,
        label: newRegistrar.label || "Not set"
      };

      // For backward compatibility, also include apiKey and apiSecret if they exist in credentials
      if (newRegistrar.credentials.api_key) {
        requestData.apiKey = newRegistrar.credentials.api_key;
      }
      if (newRegistrar.credentials.api_secret) {
        requestData.apiSecret = newRegistrar.credentials.api_secret;
      }

      const response = await fetch('/api/internal/registrars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success && data.registrar) {
        setRegistrars(prev => [...prev, data.registrar]);
        setShowAddModal(false);
        setNewRegistrar({
          registrar: "",
          apiKey: "",
          apiSecret: "",
          label: "",
          credentials: {}
        });
        setSelectedRegistrarConfig(null);

        toast({
          title: "Success",
          description: "Registrar API added successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add registrar API",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding registrar:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Connected':
        return <Badge className="bg-success/10 text-success border-success/20">Connected</Badge>;
      case 'Disconnected':
        return <Badge variant="secondary">Disconnected</Badge>;
      case 'Unmanaged':
        return <Badge variant="secondary">Unmanaged</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <InternalHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Registrars</h1>

          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-success hover:bg-success/90 text-success-foreground">
                <span className="sm:hidden">+ ADD REGISTRAR</span>
                <span className="hidden sm:inline">+ ADD REGISTRAR API</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 sm:mx-0 sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Registrar API</DialogTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  You can have add multiple accounts for the same registrar.
                </p>
              </DialogHeader>
              
              <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto px-1">
                <div>
                  <Label htmlFor="registrar">Registrar</Label>
                  <Select value={newRegistrar.registrar} onValueChange={handleRegistrarChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a registrar" />
                    </SelectTrigger>
                    <SelectContent>
                      {getRegistrarDisplayNames().map(({ name, displayName }) => (
                        <SelectItem key={name} value={name}>
                          {displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedRegistrarConfig?.documentation && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <a href={selectedRegistrarConfig.documentation} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        📖 API Documentation
                      </a>
                    </p>
                  )}
                </div>

                {/* Dynamic credential fields based on selected registrar */}
                {selectedRegistrarConfig && selectedRegistrarConfig.credentials.map((field) => (
                  <div key={field.key}>
                    <Label htmlFor={field.key}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={field.key}
                      type={field.type}
                      value={newRegistrar.credentials[field.key] || ""}
                      onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="font-mono"
                    />
                  </div>
                ))}

                {!selectedRegistrarConfig && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Please select a registrar to see the required credential fields.</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={newRegistrar.label}
                    onChange={(e) => setNewRegistrar(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="godaddy_Samay"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a unique identifier label for this registrar
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-yellow-600">⚠️</span>
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Access to the API may require enabling certain options.</p>
                      <p className="mt-1">A production API cannot be accessed with OT-E related domains.</p>
                      <p className="mt-1">Please make sure you are using Operational Test & Evaluation (OT-E) credentials or registrant-level DNS credentials for any Nominet Domains Data – Provider Membership gTLD transactions.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowAddModal(false)} className="w-full sm:w-auto">
                    CANCEL
                  </Button>
                  <Button onClick={handleAddRegistrar} className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white">
                    ADD REGISTRAR
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Registrars Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                  Loading registrars...
                </div>
              </div>
            ) : registrars.length === 0 ? (
              <div className="text-center py-8 sm:py-12 px-4">
                <h3 className="text-lg sm:text-xl font-medium text-foreground mb-2">No registrars configured</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md mx-auto">
                  Add your first registrar API to start managing your domains.
                </p>
                <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto bg-success hover:bg-success/90 text-success-foreground">
                  <span className="sm:hidden">+ ADD REGISTRAR</span>
                  <span className="hidden sm:inline">+ ADD REGISTRAR API</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-0">
                {/* Table Header - Hidden on mobile, show as cards */}
                <div className="hidden lg:grid lg:grid-cols-6 gap-6 p-6 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
                  <span>NAME</span>
                  <span>LABEL</span>
                  <span>EMAIL</span>
                  <span>API</span>
                  <span>DOMAINS</span>
                  <span></span>
                </div>

                {/* Desktop Table Rows */}
                <div className="hidden lg:block">
                  {registrars.map((registrar, index) => (
                    <div key={registrar.id} className={`grid grid-cols-6 gap-6 p-6 hover:bg-muted/30 transition-colors ${index !== registrars.length - 1 ? 'border-b' : ''}`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-300 rounded"></div>
                        <div>
                          <Link to={`/registrars/${registrar.id}`} className="font-medium text-primary text-sm hover:underline">
                            {registrar.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">support@{registrar.name.split('.')[0].toLowerCase()}.com</div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground">{registrar.label}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground">{registrar.email}</span>
                      </div>

                      <div className="flex items-center">
                        {getStatusBadge(registrar.apiStatus)}
                      </div>

                      <div className="flex items-center">
                        <span className="text-sm font-medium text-foreground">{registrar.domainCount} Domains</span>
                      </div>

                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" className="text-xs">
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-destructive"
                          onClick={() => handleDeleteRegistrar(registrar.id, registrar.name)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile Card Layout */}
                <div className="lg:hidden">
                  {registrars.map((registrar, index) => (
                    <div key={registrar.id} className={`p-4 sm:p-6 hover:bg-muted/30 transition-colors ${index !== registrars.length - 1 ? 'border-b' : ''}`}>
                      <div className="space-y-4">
                        {/* Header Row */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-8 h-8 bg-gray-300 rounded"></div>
                            <div className="flex-1 min-w-0">
                              <Link to={`/registrars/${registrar.id}`} className="font-medium text-primary text-base hover:underline block truncate">
                                {registrar.name}
                              </Link>
                              <div className="text-sm text-muted-foreground">{registrar.label}</div>
                            </div>
                          </div>
                          <div className="flex items-center ml-4">
                            {getStatusBadge(registrar.apiStatus)}
                          </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <span className="ml-2 text-foreground">{registrar.email}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Domains:</span>
                            <span className="ml-2 font-medium text-foreground">{registrar.domainCount}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs">
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none text-xs text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleDeleteRegistrar(registrar.id, registrar.name)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
