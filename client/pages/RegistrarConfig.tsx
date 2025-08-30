import { useState, useEffect } from "react";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { Alert, AlertDescription } from "../components/ui/alert";
import { safeFetchJson, getFetchErrorMessage } from "../lib/safeFetch";
import {
  CheckCircle,
  XCircle,
  Settings,
  TestTube,
  Save,
  Trash2,
} from "lucide-react";

interface RegistrarConfig {
  registrarName: string;
  type: string;
  configured: boolean;
  valid: boolean;
}

interface ConfigForm {
  type: "namecheap" | "godaddy" | "cloudflare" | "networksolutions" | "enom";
  apiUser?: string;
  apiKey?: string;
  username?: string;
  clientIp?: string;
  apiToken?: string;
  apiSecret?: string;
}

export default function RegistrarConfig() {
  const [configs, setConfigs] = useState<RegistrarConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistrar, setSelectedRegistrar] = useState<string>("");
  const [formData, setFormData] = useState<ConfigForm>({
    type: "namecheap",
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async (retryCount = 0) => {
    const maxRetries = 3;

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch("/api/registrar-configs", {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.configs) {
        setConfigs(data.configs);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error(`Failed to load registrar configs (attempt ${retryCount + 1}):`, error);

      // Retry logic for network errors
      if (retryCount < maxRetries && (
        error instanceof TypeError || // Network errors
        (error instanceof Error && error.message.includes('fetch')) ||
        (error instanceof Error && error.message.includes('AbortError'))
      )) {
        console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`);
        setTimeout(() => {
          loadConfigs(retryCount + 1);
        }, (retryCount + 1) * 1000);
        return;
      }

      // Show error after all retries failed
      toast({
        title: "Error",
        description: error instanceof Error ?
          `Failed to load registrar configurations: ${error.message}` :
          "Failed to load registrar configurations. Please check your connection.",
        variant: "destructive",
      });

      // Set empty configs as fallback
      setConfigs([]);
    } finally {
      if (retryCount === 0) { // Only set loading false on the first attempt
        setLoading(false);
      }
    }
  };

  const handleRegistrarSelect = async (registrarName: string) => {
    setSelectedRegistrar(registrarName);

    // Load existing configuration if available
    try {
      const response = await fetch(
        `/api/registrar-config/${encodeURIComponent(registrarName)}`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setFormData({
            type: data.config.type,
            // Don't populate sensitive fields for security
          });
        }
      } else {
        // No existing config, reset form
        const config = configs.find((c) => c.registrarName === registrarName);
        setFormData({
          type: (config?.type as any) || "namecheap",
        });
      }
    } catch (error) {
      console.error("Failed to load existing config:", error);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedRegistrar) {
      toast({
        title: "Error",
        description: "Please select a registrar",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/registrar-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrarName: selectedRegistrar,
          config: formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Configuration saved for ${selectedRegistrar}`,
        });
        await loadConfigs();
      } else {
        throw new Error(data.message || "Failed to save configuration");
      }
    } catch (error) {
      console.error("Failed to save config:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConfig = async () => {
    if (!selectedRegistrar) {
      toast({
        title: "Error",
        description: "Please select a registrar",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      const response = await fetch("/api/registrar-config/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrarName: selectedRegistrar,
          config: formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Test Successful",
          description: `Configuration test passed for ${selectedRegistrar}. Data source: ${data.testResult?.source || "unknown"}`,
        });
      } else {
        throw new Error(data.message || "Configuration test failed");
      }
    } catch (error) {
      console.error("Failed to test config:", error);
      toast({
        title: "Test Failed",
        description:
          error instanceof Error ? error.message : "Configuration test failed",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const renderConfigForm = () => {
    if (!selectedRegistrar) return null;

    const configType = formData.type;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure {selectedRegistrar}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="type">Registrar Type</Label>
            <Select
              value={configType}
              onValueChange={(value: any) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select registrar type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="namecheap">Namecheap</SelectItem>
                <SelectItem value="godaddy">GoDaddy</SelectItem>
                <SelectItem value="cloudflare">Cloudflare</SelectItem>
                <SelectItem value="networksolutions">
                  Network Solutions
                </SelectItem>
                <SelectItem value="enom">Enom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {configType === "namecheap" && (
            <>
              <div>
                <Label htmlFor="apiUser">API User</Label>
                <Input
                  id="apiUser"
                  value={formData.apiUser || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, apiUser: e.target.value })
                  }
                  placeholder="Your Namecheap API username"
                />
              </div>
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, apiKey: e.target.value })
                  }
                  placeholder="Your Namecheap API key"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="Your Namecheap username"
                />
              </div>
              <div>
                <Label htmlFor="clientIp">Client IP</Label>
                <Input
                  id="clientIp"
                  value={formData.clientIp || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, clientIp: e.target.value })
                  }
                  placeholder="Your server's IP address"
                />
              </div>
            </>
          )}

          {configType === "godaddy" && (
            <>
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, apiKey: e.target.value })
                  }
                  placeholder="Your GoDaddy API key"
                />
              </div>
              <div>
                <Label htmlFor="apiSecret">API Secret</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  value={formData.apiSecret || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, apiSecret: e.target.value })
                  }
                  placeholder="Your GoDaddy API secret"
                />
              </div>
            </>
          )}

          {configType === "cloudflare" && (
            <div>
              <Label htmlFor="apiToken">API Token</Label>
              <Input
                id="apiToken"
                type="password"
                value={formData.apiToken || ""}
                onChange={(e) =>
                  setFormData({ ...formData, apiToken: e.target.value })
                }
                placeholder="Your Cloudflare API token"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleTestConfig}
              disabled={testing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {testing ? "Testing..." : "Test Configuration"}
            </Button>
            <Button
              onClick={handleSaveConfig}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              API credentials are used to fetch real-time domain data directly
              from your registrar. This provides more accurate and up-to-date
              information compared to WHOIS lookups alone.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <InternalHeader />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Registrar Configuration
          </h1>
          <p className="text-muted-foreground">
            Configure registrar API access for enhanced domain monitoring with
            real-time data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registrar List */}
          <Card>
            <CardHeader>
              <CardTitle>Available Registrars</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  Loading configurations...
                </div>
              ) : (
                <div className="space-y-3">
                  {configs.map((config) => (
                    <div
                      key={config.registrarName}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRegistrar === config.registrarName
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() =>
                        handleRegistrarSelect(config.registrarName)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">
                            {config.registrarName}
                          </h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {config.type}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {config.configured ? (
                            <Badge
                              variant={config.valid ? "default" : "destructive"}
                            >
                              {config.valid ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Configured
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Invalid
                                </>
                              )}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not Configured</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration Form */}
          <div>{renderConfigForm()}</div>
        </div>

        <div className="mt-8">
          <Alert>
            <AlertDescription>
              <strong>Enhanced Monitoring Benefits:</strong> Configuring
              registrar API access enables real-time domain data fetching,
              providing more accurate expiry dates, registrar information, and
              reducing reliance on WHOIS lookups which can be rate-limited or
              blocked.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
