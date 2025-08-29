import { useState, useEffect } from "react";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalDomains: number;
  domainsRenewalPrice: number;
  expiringDomains: number;
}

interface ExpiringDomain {
  id: string;
  name: string;
  registrar: string;
  expirationDate: string;
  price: string;
  lastCheck: string;
  status: string;
}

interface ExpiringCertificate {
  id: string;
  domain: string;
  expirationDate: string;
  issuer: string;
  lastCheck: string;
  status: string;
}

export default function InternalDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDomains: 0,
    domainsRenewalPrice: 0.00,
    expiringDomains: 0
  });

  useEffect(() => {
    // Load monitoring stats
    const loadMonitoringStats = async () => {
      try {
        const response = await fetch('/api/monitoring/stats');
        if (response.ok) {
          const monitoringStats = await response.json();
          setStats(prev => ({
            ...prev,
            totalDomains: monitoringStats.totalDomains,
            expiringDomains: monitoringStats.domainsExpiringSoon + monitoringStats.sslExpiringSoon
          }));
        }
      } catch (error) {
        console.error('Failed to load monitoring stats:', error);
      }
    };

    loadMonitoringStats();
  }, []);

  // Starting with empty expiring domains - all sample data removed
  const [expiringDomains] = useState<ExpiringDomain[]>([]);

  // Starting with empty expiring certificates - all sample data removed
  const [expiringCertificates] = useState<ExpiringCertificate[]>([]);

  return (
    <div className="min-h-screen bg-background">
      <InternalHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">👤</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome Ronald Stone</h1>
              <p className="text-muted-foreground">
                Domexus is an easy to use application that will assist in managing your domains and SSL certificates, ensuring you never forget about them. Additionally, it simplifies the billing process for multiple domain providers. You can renew your domains directly from your dashboard, eliminating the need to manage each provider separately.
              </p>
            </div>
          </div>
          <Button className="bg-success hover:bg-success/90 text-success-foreground">
            <Link to="/internal/domains" className="flex items-center">
              + ADD DOMAIN
            </Link>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Domains</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalDomains}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">$</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Domains Renewal Price</p>
                  <p className="text-3xl font-bold text-foreground">{stats.domainsRenewalPrice.toFixed(2)} $</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expiring Domains</p>
                  <p className="text-3xl font-bold text-foreground">{stats.expiringDomains}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expiring Domains */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Expiring Domains</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wide pb-3 border-b">
                  <span className="col-span-2">NAME</span>
                  <span>REGISTRAR</span>
                  <span>EXPIRATION DATE</span>
                  <span>PRICE</span>
                  <span>LAST CHECK</span>
                </div>

                {/* Table Rows */}
                <div className="space-y-3 pt-3">
                  {expiringDomains.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No expiring domains found
                    </div>
                  ) : (
                    expiringDomains.map((domain) => (
                      <div key={domain.id} className="grid grid-cols-6 gap-4 items-center text-sm">
                        <div className="col-span-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gray-300 rounded"></div>
                            <div>
                              <div className="font-medium text-foreground">{domain.name}</div>
                              <div className="text-xs text-muted-foreground">{domain.name}</div>
                            </div>
                          </div>
                        </div>

                        <div className="text-muted-foreground">
                          <div>{domain.registrar}</div>
                          <div className="text-xs">Connected</div>
                        </div>

                        <div>
                          <Badge variant="destructive" className="text-xs">
                            {domain.expirationDate}
                          </Badge>
                        </div>

                        <div className="text-muted-foreground">-</div>

                        <div className="flex items-center text-xs">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <div>
                            <div className="text-success">Online</div>
                            <div className="text-muted-foreground">{domain.lastCheck}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expiring Certificates */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Expiring Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wide pb-3 border-b">
                  <span className="col-span-2">DOMAIN</span>
                  <span>EXPIRATION</span>
                  <span>ISSUER</span>
                  <span>STATUS</span>
                </div>

                {/* Table Rows */}
                <div className="space-y-3 pt-3">
                  {expiringCertificates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No expiring certificates found
                    </div>
                  ) : (
                    expiringCertificates.map((cert) => (
                      <div key={cert.id} className="grid grid-cols-5 gap-4 items-center text-sm">
                        <div className="col-span-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gray-300 rounded"></div>
                            <div className="font-medium text-foreground">{cert.domain}</div>
                          </div>
                        </div>

                        <div className="text-muted-foreground">{cert.expirationDate}</div>
                        <div className="text-muted-foreground">{cert.issuer}</div>

                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-success text-xs">{cert.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
