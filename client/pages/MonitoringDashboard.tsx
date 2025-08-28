import { useState, useEffect } from "react";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";

interface MonitoringLog {
  id: string;
  domain: string;
  logType: 'domain_expiry' | 'ssl_expiry' | 'domain_status' | 'monitoring_error';
  severity: 'info' | 'warning' | 'critical' | 'error';
  message: string;
  details?: any;
  alertSent: boolean;
  alertChannels?: string[];
  createdAt: string;
}

interface MonitoringStats {
  totalDomains: number;
  activeDomains: number;
  domainsExpiringSoon: number;
  sslExpiringSoon: number;
  criticalAlerts: number;
  lastMonitoringRun?: string;
  nextMonitoringRun?: string;
}

interface MonitoringStatus {
  isRunning: boolean;
  nextRun: string | null;
  monitoringJobActive: boolean;
  cleanupJobActive: boolean;
  version: string;
  uptime: number;
  environment: string;
}

export default function MonitoringDashboard() {
  const [logs, setLogs] = useState<MonitoringLog[]>([]);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [status, setStatus] = useState<MonitoringStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggeringMonitoring, setTriggeringMonitoring] = useState(false);
  const [filters, setFilters] = useState({
    domain: '',
    logType: 'all',
    severity: 'all'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [logsResponse, statsResponse, statusResponse] = await Promise.all([
        fetch('/api/monitoring/logs?' + new URLSearchParams({
          ...(filters.domain && { domain: filters.domain }),
          ...(filters.logType !== 'all' && { logType: filters.logType }),
          ...(filters.severity !== 'all' && { severity: filters.severity }),
          limit: '50'
        })),
        fetch('/api/monitoring/stats'),
        fetch('/api/monitoring/status')
      ]);

      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setLogs(logsData.logs || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setStatus(statusData);
      }
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
      toast({
        title: "Error",
        description: "Failed to load monitoring data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerMonitoring = async () => {
    try {
      setTriggeringMonitoring(true);
      
      const response = await fetch('/api/monitoring/trigger-all', {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Domain monitoring triggered successfully. Check logs for progress.",
        });
        
        // Reload data after a short delay
        setTimeout(() => {
          loadData();
        }, 2000);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to trigger monitoring');
      }
    } catch (error) {
      console.error('Failed to trigger monitoring:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to trigger monitoring",
        variant: "destructive"
      });
    } finally {
      setTriggeringMonitoring(false);
    }
  };

  const triggerDomainMonitoring = async (domain: string) => {
    try {
      const response = await fetch(`/api/monitoring/trigger/${encodeURIComponent(domain)}`, {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Monitoring triggered for ${domain}`,
        });
        loadData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to trigger domain monitoring');
      }
    } catch (error) {
      console.error('Failed to trigger domain monitoring:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to trigger domain monitoring",
        variant: "destructive"
      });
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'destructive';
      case 'error': return 'destructive';
      case 'info': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      case 'error': return 'text-red-500';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      <InternalHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Monitoring Dashboard</h1>
            <p className="text-muted-foreground">Domain and SSL certificate monitoring system</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              onClick={triggerMonitoring}
              disabled={triggeringMonitoring || status?.isRunning}
              className="bg-primary hover:bg-primary/90"
            >
              {triggeringMonitoring ? 'Triggering...' : status?.isRunning ? 'Monitoring Running...' : 'Trigger Monitoring'}
            </Button>
            <Button variant="outline" onClick={loadData}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Domains</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalDomains}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Domains</p>
                    <p className="text-2xl font-bold text-foreground">{stats.activeDomains}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-lg">⚠️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                    <p className="text-2xl font-bold text-foreground">{stats.domainsExpiringSoon}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-lg">🔒</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SSL Expiring</p>
                    <p className="text-2xl font-bold text-foreground">{stats.sslExpiringSoon}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-lg">🚨</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                    <p className="text-2xl font-bold text-foreground">{stats.criticalAlerts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Status Card */}
        {status && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Monitoring Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {status.isRunning ? (
                      <Badge className="bg-orange-100 text-orange-700">Running</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700">Idle</Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Next Run</label>
                  <div className="mt-1 text-sm">
                    {status.nextRun ? new Date(status.nextRun).toLocaleString() : 'Not scheduled'}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Uptime</label>
                  <div className="mt-1 text-sm">{formatUptime(status.uptime)}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Environment</label>
                  <div className="mt-1 text-sm">{status.environment}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Filter by domain..."
                  value={filters.domain}
                  onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
                />
              </div>
              
              <div>
                <Select value={filters.logType} onValueChange={(value) => setFilters(prev => ({ ...prev, logType: value }))}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Log Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="domain_expiry">Domain Expiry</SelectItem>
                    <SelectItem value="ssl_expiry">SSL Expiry</SelectItem>
                    <SelectItem value="domain_status">Domain Status</SelectItem>
                    <SelectItem value="monitoring_error">Monitoring Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={filters.severity} onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monitoring Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Monitoring Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                  Loading logs...
                </div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No monitoring logs found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant={getSeverityBadgeVariant(log.severity) as any} className="text-xs">
                          {log.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium text-foreground">{log.domain}</span>
                        <span className="text-sm text-muted-foreground">
                          {log.logType.replace('_', ' ').toUpperCase()}
                        </span>
                        {log.alertSent && (
                          <Badge variant="secondary" className="text-xs">
                            Alert Sent
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-foreground mb-2">{log.message}</p>
                      
                      {log.details && (
                        <div className="text-xs text-muted-foreground">
                          {Object.entries(log.details).map(([key, value]) => (
                            <span key={key} className="mr-4">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-xs text-muted-foreground text-right">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                      {log.domain !== 'SYSTEM' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerDomainMonitoring(log.domain)}
                          className="text-xs"
                        >
                          Check Now
                        </Button>
                      )}
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
