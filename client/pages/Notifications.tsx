import { useState, useEffect } from "react";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";

interface NotificationSettings {
  domainExpiration: {
    thirtyDays: boolean;
    fifteenDays: boolean;
    sevenDays: boolean;
    oneDay: boolean;
  };
  certificateExpiration: {
    thirtyDays: boolean;
    fifteenDays: boolean;
    sevenDays: boolean;
    oneDay: boolean;
  };
  webhookUrl: string;
  slackWebhookUrl: string;
}

export default function Notifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    domainExpiration: {
      thirtyDays: true,
      fifteenDays: true,
      sevenDays: true,
      oneDay: true
    },
    certificateExpiration: {
      thirtyDays: true,
      fifteenDays: true,
      sevenDays: true,
      oneDay: true
    },
    webhookUrl: "",
    slackWebhookUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDomainExpirationToggle = (period: keyof NotificationSettings['domainExpiration']) => {
    setSettings(prev => ({
      ...prev,
      domainExpiration: {
        ...prev.domainExpiration,
        [period]: !prev.domainExpiration[period]
      }
    }));
  };

  const handleCertificateExpirationToggle = (period: keyof NotificationSettings['certificateExpiration']) => {
    setSettings(prev => ({
      ...prev,
      certificateExpiration: {
        ...prev.certificateExpiration,
        [period]: !prev.certificateExpiration[period]
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Success",
        description: "Notification settings saved successfully",
      });
    }, 1000);
  };

  const handleReset = () => {
    setSettings({
      domainExpiration: {
        thirtyDays: true,
        fifteenDays: true,
        sevenDays: true,
        oneDay: true
      },
      certificateExpiration: {
        thirtyDays: true,
        fifteenDays: true,
        sevenDays: true,
        oneDay: true
      },
      webhookUrl: "",
      slackWebhookUrl: ""
    });
    
    toast({
      title: "Settings Reset",
      description: "Notification settings have been reset to defaults",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <InternalHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">Configure when important changes will you want to hear about</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">50%</div>
              <div className="flex space-x-1">
                <Button variant="outline" size="sm">−</Button>
                <Button variant="outline" size="sm">+</Button>
              </div>
              <Button variant="outline" size="sm">Reset</Button>
            </div>
            <div className="text-sm text-muted-foreground">This lifetime</div>
          </div>
        </div>

        {/* Free Tier Alert */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge className="bg-blue-600 text-white">FREE TIER TRIAL</Badge>
                <span className="text-sm text-blue-800">
                  Up to 20 free monthly important alerts per month. Get notified faster when it matters.
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">NOTIFICATION LOGS</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8">
          {/* Domain Expiration Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Domain Expiration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Get alerted when important domains could be expiring. Get you notified when an alert is expires.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">30 days</Label>
                    <p className="text-xs text-muted-foreground">Notify when a domain expires in 30 days</p>
                  </div>
                  <Switch
                    checked={settings.domainExpiration.thirtyDays}
                    onCheckedChange={() => handleDomainExpirationToggle('thirtyDays')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">15 days</Label>
                    <p className="text-xs text-muted-foreground">Notify when a domain expires in 15 days</p>
                  </div>
                  <Switch
                    checked={settings.domainExpiration.fifteenDays}
                    onCheckedChange={() => handleDomainExpirationToggle('fifteenDays')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">7 days</Label>
                    <p className="text-xs text-muted-foreground">Notify when a domain expires in 7 days</p>
                  </div>
                  <Switch
                    checked={settings.domainExpiration.sevenDays}
                    onCheckedChange={() => handleDomainExpirationToggle('sevenDays')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">1 day</Label>
                    <p className="text-xs text-muted-foreground">Notify when a domain expires in 1 day</p>
                  </div>
                  <Switch
                    checked={settings.domainExpiration.oneDay}
                    onCheckedChange={() => handleDomainExpirationToggle('oneDay')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificate Expiration Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Certificate Expiration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Get alerted when important certificates are expiring. We will monitor and notify when a certificate expires in 7 days.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">30 days</Label>
                    <p className="text-xs text-muted-foreground">Notify when a certificate expires in 30 days</p>
                  </div>
                  <Switch
                    checked={settings.certificateExpiration.thirtyDays}
                    onCheckedChange={() => handleCertificateExpirationToggle('thirtyDays')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">15 days</Label>
                    <p className="text-xs text-muted-foreground">Notify when a certificate expires in 15 days</p>
                  </div>
                  <Switch
                    checked={settings.certificateExpiration.fifteenDays}
                    onCheckedChange={() => handleCertificateExpirationToggle('fifteenDays')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">7 days</Label>
                    <p className="text-xs text-muted-foreground">Notify when a certificate expires in 7 days</p>
                  </div>
                  <Switch
                    checked={settings.certificateExpiration.sevenDays}
                    onCheckedChange={() => handleCertificateExpirationToggle('sevenDays')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">1 day</Label>
                    <p className="text-xs text-muted-foreground">Notify when a certificate expires in 1 day</p>
                  </div>
                  <Switch
                    checked={settings.certificateExpiration.oneDay}
                    onCheckedChange={() => handleCertificateExpirationToggle('oneDay')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Webhook Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Webhook</CardTitle>
              <p className="text-sm text-muted-foreground">
                Send notifications to your webhook URL. Get notified when your domains are about to expire.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://your-webhook-url.com/endpoint"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add your webhook url if you want to be notified here. You can learn how to configure webhooks at your service documentation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Slack Webhook Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Slack</CardTitle>
              <p className="text-sm text-muted-foreground">
                Send notifications to your Slack channel. Get notified when your domains are about to expire.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="slackWebhookUrl">Slack Webhook URL</Label>
                <Input
                  id="slackWebhookUrl"
                  type="url"
                  value={settings.slackWebhookUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, slackWebhookUrl: e.target.value }))}
                  placeholder="https://hooks.slack.com/services/..."
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add your webhook url if you want to be notified here. You can learn how to configure Slack webhooks at your service documentation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Settings */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button onClick={handleSaveSettings} disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
