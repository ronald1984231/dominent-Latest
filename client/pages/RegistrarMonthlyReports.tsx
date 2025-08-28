import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Switch } from "../components/ui/switch";
import { useToast } from "../hooks/use-toast";
import { FileText, Globe, Settings, Loader2, Download, Calendar } from "lucide-react";

interface RegistrarInfo {
  id: string;
  name: string;
  displayName: string;
}

interface ReportSettings {
  domainExpiration: boolean;
  sslCertificateExpiration: boolean;
  enableMonthlyReports: boolean;
  emailRecipient: string;
}

export default function RegistrarMonthlyReports() {
  const { id } = useParams<{ id: string }>();
  const [registrar, setRegistrar] = useState<RegistrarInfo | null>(null);
  const [settings, setSettings] = useState<ReportSettings>({
    domainExpiration: true,
    sslCertificateExpiration: true,
    enableMonthlyReports: true,
    emailRecipient: "contact@example.com"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadReportSettings();
    }
  }, [id]);

  const loadReportSettings = async () => {
    try {
      setLoading(true);
      
      // Mock registrar info
      const mockRegistrar: RegistrarInfo = {
        id: id || "3319",
        name: "GoDaddy.com, LLC",
        displayName: "GoDaddy.com, LLC"
      };
      
      setRegistrar(mockRegistrar);
    } catch (error) {
      console.error("Failed to load report settings:", error);
      toast({
        title: "Error",
        description: "Failed to load report settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (setting: keyof ReportSettings, enabled: boolean) => {
    try {
      // Update local state optimistically
      setSettings(prev => ({
        ...prev,
        [setting]: enabled
      }));

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Success",
        description: "Report settings updated successfully.",
      });
    } catch (error) {
      // Revert on error
      setSettings(prev => ({
        ...prev,
        [setting]: !enabled
      }));
      
      toast({
        title: "Error",
        description: "Failed to update report settings.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Report settings saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save report settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadReport = async (reportType: string) => {
    try {
      toast({
        title: "Generating Report",
        description: `Preparing ${reportType} report for download...`,
      });
      
      // Mock download delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Download Ready",
        description: `${reportType} report has been generated and downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <InternalHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading report settings...</span>
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
          <Link to={`/registrars/${registrar.id}`} className="text-muted-foreground hover:text-foreground">
            {registrar.displayName}
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
                      className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md mb-1"
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
                      className="flex items-center px-4 py-2 text-sm font-medium bg-muted text-foreground rounded-md"
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
              {/* Page Header */}
              <div>
                <h1 className="text-2xl font-bold">Monthly reports for {registrar.displayName}</h1>
                <p className="text-muted-foreground">
                  Configure what tasks require monthly report containing a summary of all failed records of {registrar.displayName} LLC.
                </p>
              </div>

              {/* Include Checks Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Include checks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Domain expiration</div>
                      <div className="text-sm text-muted-foreground">
                        Include domain expiration monitoring results in monthly reports
                      </div>
                    </div>
                    <Switch
                      checked={settings.domainExpiration}
                      onCheckedChange={(checked) => handleToggleSetting("domainExpiration", checked)}
                      className="bg-success"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">SSL Certificate Expiration</div>
                      <div className="text-sm text-muted-foreground">
                        Include SSL certificate expiration monitoring in monthly reports
                      </div>
                    </div>
                    <Switch
                      checked={settings.sslCertificateExpiration}
                      onCheckedChange={(checked) => handleToggleSetting("sslCertificateExpiration", checked)}
                      className="bg-success"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Generate Reports Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Generate Reports</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Download reports for specific time periods
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadReport("Current Month")}
                      className="justify-start h-auto p-4"
                    >
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Current Month Report</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleDownloadReport("Last Month")}
                      className="justify-start h-auto p-4"
                    >
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Last Month Report</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleDownloadReport("Quarterly")}
                      className="justify-start h-auto p-4"
                    >
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Quarterly Report</div>
                          <div className="text-sm text-muted-foreground">
                            Last 3 months summary
                          </div>
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleDownloadReport("Annual")}
                      className="justify-start h-auto p-4"
                    >
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Annual Report</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date().getFullYear()} full year summary
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Save Settings */}
              <div className="flex justify-end">
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
                    "SAVE"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
