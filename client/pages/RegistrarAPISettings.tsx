import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useToast } from "../hooks/use-toast";
import { FileText, Globe, Settings, Loader2, Eye, EyeOff } from "lucide-react";

interface RegistrarAPISettings {
  id: string;
  name: string;
  displayName: string;
  apiKey: string;
  apiSecret: string;
  testMode: boolean;
}

export default function RegistrarAPISettings() {
  const { id } = useParams<{ id: string }>();
  const [settings, setSettings] = useState<RegistrarAPISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    apiKey: "",
    apiSecret: "",
    testMode: false
  });

  useEffect(() => {
    if (id) {
      loadAPISettings();
    }
  }, [id]);

  const loadAPISettings = async () => {
    try {
      setLoading(true);
      
      // Mock data based on screenshot
      const mockSettings: RegistrarAPISettings = {
        id: id || "3319",
        name: "GoDaddy.com, LLC",
        displayName: "GoDaddy.com, LLC",
        apiKey: "3mM44Ywf7i6urx_FjKo6pjXqBwiP5kCxFnNV",
        apiSecret: "•••••••••••••••••••••••",
        testMode: false
      };
      
      setSettings(mockSettings);
      setFormData({
        apiKey: mockSettings.apiKey,
        apiSecret: mockSettings.apiSecret,
        testMode: mockSettings.testMode
      });
    } catch (error) {
      console.error("Failed to load API settings:", error);
      toast({
        title: "Error",
        description: "Failed to load API settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!formData.apiKey.trim() || !formData.apiSecret.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both API Key and API Secret.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "API settings updated successfully.",
      });
      
      // Update local state
      if (settings) {
        setSettings({
          ...settings,
          apiKey: formData.apiKey,
          apiSecret: formData.apiSecret,
          testMode: formData.testMode
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update API settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <InternalHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading API settings...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
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
          <Link to={`/registrars/${settings.id}`} className="text-muted-foreground hover:text-foreground">
            {settings.displayName}
          </Link>
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
                          {settings.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{settings.displayName}</h3>
                        <p className="text-sm text-muted-foreground">Registered 2 June 2024</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Menu */}
                  <nav className="p-2">
                    <Link
                      to={`/registrars/${settings.id}`}
                      className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md mb-1"
                    >
                      <FileText className="w-4 h-4 mr-3" />
                      Overview
                    </Link>
                    
                    <Link
                      to={`/registrars/${settings.id}/domains`}
                      className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md mb-1"
                    >
                      <Globe className="w-4 h-4 mr-3" />
                      Domains
                    </Link>
                    
                    <Link
                      to={`/registrars/${settings.id}/apisettings`}
                      className="flex items-center px-4 py-2 text-sm font-medium bg-muted text-foreground rounded-md mb-1"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      API Settings
                    </Link>
                    
                    <Link
                      to={`/registrars/${settings.id}/monthlyreports`}
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
            <Card>
              <CardHeader>
                <CardTitle>Update API</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update existing credentials.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Key Field */}
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-sm font-medium">
                    API Key
                  </Label>
                  <Input
                    id="apiKey"
                    type="text"
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange("apiKey", e.target.value)}
                    placeholder="Enter your API key"
                    className="font-mono"
                  />
                </div>

                {/* API Secret Field */}
                <div className="space-y-2">
                  <Label htmlFor="apiSecret" className="text-sm font-medium">
                    API Secret
                  </Label>
                  <div className="relative">
                    <Input
                      id="apiSecret"
                      type={showApiSecret ? "text" : "password"}
                      value={formData.apiSecret}
                      onChange={(e) => handleInputChange("apiSecret", e.target.value)}
                      placeholder="Enter your API secret"
                      className="font-mono pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowApiSecret(!showApiSecret)}
                    >
                      {showApiSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Test Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="testMode"
                    checked={formData.testMode}
                    onChange={(e) => handleInputChange("testMode", e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="testMode" className="text-sm font-medium">
                    Enable test mode (sandbox environment)
                  </Label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6">
                  <Button variant="outline" asChild>
                    <Link to={`/registrars/${settings.id}`}>Cancel</Link>
                  </Button>
                  
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="bg-slate-800 hover:bg-slate-700 text-white min-w-24"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "UPDATE"
                    )}
                  </Button>
                </div>

                {/* Help Text */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">API Configuration Help</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• You can find your API credentials in your {settings.name} account dashboard</li>
                    <li>• API Key is used for authentication with the registrar's API</li>
                    <li>• API Secret provides additional security for API requests</li>
                    <li>• Test mode allows you to test the connection without affecting live domains</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
