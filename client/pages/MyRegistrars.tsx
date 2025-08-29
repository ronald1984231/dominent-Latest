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
      const response = await fetch('/api/internal/registrars');
      const data = await response.json();

      if (response.ok && data.registrars) {
        setRegistrars(data.registrars);
      } else {
        throw new Error('Failed to load registrars');
      }
    } catch (error) {
      console.error('Error loading registrars:', error);
      toast({
        title: "Error",
        description: "Failed to load registrars. Please refresh the page.",
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
    setSelectedRegistrarConfig(config || null);
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Registrars</h1>
          
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button className="bg-success hover:bg-success/90 text-success-foreground">
                + ADD REGISTRAR API
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Registrar API</DialogTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  You can have add multiple accounts for the same registrar.
                </p>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
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

                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    value={newRegistrar.apiKey}
                    onChange={(e) => setNewRegistrar(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="3mM44Ywf7i6urx_FjKo6pjXqBwiP5kCxFnNV"
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="apiSecret">API Secret</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    value={newRegistrar.apiSecret}
                    onChange={(e) => setNewRegistrar(prev => ({ ...prev, apiSecret: e.target.value }))}
                    placeholder="•••••••••••••••••••••••"
                    className="font-mono"
                  />
                </div>

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

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowAddModal(false)}>
                    CANCEL
                  </Button>
                  <Button onClick={handleAddRegistrar} className="bg-slate-800 hover:bg-slate-700 text-white">
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
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">No registrars configured</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first registrar API to start managing your domains.
                </p>
                <Button onClick={() => setShowAddModal(true)} className="bg-success hover:bg-success/90 text-success-foreground">
                  + ADD REGISTRAR API
                </Button>
              </div>
            ) : (
              <div className="space-y-0">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-6 p-6 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
                  <span>NAME</span>
                  <span>LABEL</span>
                  <span>EMAIL</span>
                  <span>API</span>
                  <span>DOMAINS</span>
                  <span></span>
                </div>

                {/* Table Rows */}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
