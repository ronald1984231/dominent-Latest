import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Link } from "react-router-dom";
import { 
  CheckCircle, 
  Shield, 
  Globe, 
  Monitor, 
  Users, 
  Bell, 
  Download, 
  Plus,
  ArrowRight,
  Clock,
  Search,
  FileText,
  Mail,
  Slack,
  Webhook
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Dashboard Preview */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-8">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 border-green-200 px-4 py-2"
              >
                🚀 The new way to monitor your domains
              </Badge>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                The new way to monitor
                <span className="text-blue-600"> your domains</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                DOMINENT monitors domains and SSL certificates expiration, 
                nameservers, DNS Records, domain availability, sales and 
                purchases seamlessly across your stack.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 text-lg"
                  asChild
                >
                  <Link to="/internal/domains">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-semibold px-8 py-4 text-lg"
                  asChild
                >
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </div>

            {/* Right side - Dashboard Preview */}
            <div className="relative">
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Browser Header */}
                <div className="bg-gray-900 px-4 py-3 flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-gray-400 text-sm">DOMINENT</span>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Domains</h3>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Domain
                    </Button>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">247</div>
                      <div className="text-xs text-gray-600">Total Domains</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">235</div>
                      <div className="text-xs text-gray-600">Active</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">12</div>
                      <div className="text-xs text-gray-600">Expiring</div>
                    </div>
                  </div>

                  {/* Domain List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">example.com</span>
                      </div>
                      <Badge variant="outline" className="text-xs">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium">mydomain.net</span>
                      </div>
                      <Badge variant="destructive" className="text-xs">7 days</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">testsite.org</span>
                      </div>
                      <Badge variant="outline" className="text-xs">Active</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm font-medium tracking-wider uppercase mb-6">
              Works with popular domain registrars
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded"></div>
                <span className="font-semibold text-gray-700">Namecheap</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                <span className="font-semibold text-gray-700">GoDaddy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded"></div>
                <span className="font-semibold text-gray-700">Cloudflare</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-500 rounded"></div>
                <span className="font-semibold text-gray-700">Porkbun</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded"></div>
                <span className="font-semibold text-gray-700">Enom</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Monitor All Domains Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Monitor all your domains, in one solution
          </h2>
          <div className="mt-16">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-4xl mx-auto">
              <div className="p-8">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Domains</h3>
                    <div className="flex items-center space-x-4">
                      <Input placeholder="Filter registrars..." className="w-48" />
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Domain
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">247</div>
                      <div className="text-sm text-gray-600">All</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">235</div>
                      <div className="text-sm text-gray-600">Active</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">8</div>
                      <div className="text-sm text-gray-600">Expiring</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">4</div>
                      <div className="text-sm text-gray-600">Expired</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-gray-600">SSL Issues</div>
                    </div>
                  </div>

                  {/* Domain Table Header */}
                  <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                    <div>DOMAIN</div>
                    <div>REGISTRAR</div>
                    <div>EXPIRY</div>
                    <div>SSL</div>
                    <div>STATUS</div>
                  </div>

                  {/* Domain Rows */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-5 gap-4 items-center py-3 border-b border-gray-100">
                      <div className="font-medium">example.com</div>
                      <div className="text-gray-600">Namecheap</div>
                      <div>
                        <Badge variant="outline">Jan 15, 2026</Badge>
                      </div>
                      <div>
                        <Badge className="bg-green-100 text-green-700">Valid</Badge>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600">Online</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-4 items-center py-3 border-b border-gray-100">
                      <div className="font-medium">mydomain.net</div>
                      <div className="text-gray-600">GoDaddy</div>
                      <div>
                        <Badge variant="destructive">7 days</Badge>
                      </div>
                      <div>
                        <Badge className="bg-yellow-100 text-yellow-700">Expiring</Badge>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-yellow-600">Warning</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-4 items-center py-3">
                      <div className="font-medium">testsite.org</div>
                      <div className="text-gray-600">Cloudflare</div>
                      <div>
                        <Badge variant="outline">Dec 31, 2025</Badge>
                      </div>
                      <div>
                        <Badge className="bg-green-100 text-green-700">Valid</Badge>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Setup in 2 Minutes Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-6">
              <div className="text-blue-600 font-semibold">Setup in 2 minutes</div>
              <h2 className="text-4xl font-bold text-gray-900">
                Import all your domains
              </h2>
              <p className="text-lg text-gray-600">
                Import your domains from your registrars via API,
                upload a CSV file, or add them manually. Everything can be
                done in two minutes.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link to="/internal/domains/add">
                  <Download className="w-4 h-4 mr-2" />
                  Import Domains
                </Link>
              </Button>
            </div>

            {/* Right side - Import Interface */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-semibold mb-6">Add Domains</h3>
              <Tabs defaultValue="api" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="api">API Import</TabsTrigger>
                  <TabsTrigger value="csv">CSV Upload</TabsTrigger>
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                </TabsList>
                <TabsContent value="api" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Select Registrar</label>
                    <select className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                      <option>GoDaddy</option>
                      <option>Namecheap</option>
                      <option>Cloudflare</option>
                    </select>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Connect & Import
                  </Button>
                </TabsContent>
                <TabsContent value="csv" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Drop your CSV file here or click to browse
                    </p>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Upload & Import
                  </Button>
                </TabsContent>
                <TabsContent value="manual" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Domain Name</label>
                    <Input placeholder="example.com" className="mt-1" />
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Add Domain
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Easily Manage Domains Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - DNS Interface */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-semibold mb-6">DNS Management</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">example.com</span>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div>Name</div>
                    <div>Type</div>
                    <div>Value</div>
                    <div>TTL</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 py-2 text-sm">
                    <div>@</div>
                    <div><Badge variant="outline">A</Badge></div>
                    <div className="text-gray-600">192.168.1.1</div>
                    <div className="text-gray-600">3600</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 py-2 text-sm">
                    <div>www</div>
                    <div><Badge variant="outline">CNAME</Badge></div>
                    <div className="text-gray-600">example.com</div>
                    <div className="text-gray-600">3600</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 py-2 text-sm">
                    <div>mail</div>
                    <div><Badge variant="outline">MX</Badge></div>
                    <div className="text-gray-600">mail.example.com</div>
                    <div className="text-gray-600">3600</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="space-y-6">
              <div className="text-orange-600 font-semibold">Easily manage your domains</div>
              <h2 className="text-4xl font-bold text-gray-900">
                Manage your domains information and DNS Records
              </h2>
              <p className="text-lg text-gray-600">
                Manage your DNS Records never been easier. 
                You can have a simple and clean dashboard to 
                manage all your domains information.
              </p>
              <Button className="bg-orange-600 hover:bg-orange-700" asChild>
                <Link to="/internal/domains">
                  Manage Domains
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Monitor Sales Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-6">
              <div className="text-green-600 font-semibold">Monitor your sales and purchases</div>
              <h2 className="text-4xl font-bold text-gray-900">
                Not only expiration monitoring
              </h2>
              <p className="text-lg text-gray-600">
                Domain analytics help to your business. You can 
                see your domain value, track sales and also your 
                profit.
              </p>
              <Button className="bg-green-600 hover:bg-green-700" asChild>
                <Link to="/internal/monitoring">
                  View Analytics
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Right side - Sales Dashboard */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-semibold mb-6">Sales</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$12,500</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">23</div>
                    <div className="text-sm text-gray-600">Domains Sold</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recent sales</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">techstartup.com</div>
                        <div className="text-sm text-gray-600">Sold 2 days ago</div>
                      </div>
                      <div className="text-green-600 font-semibold">$2,500</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">myapp.net</div>
                        <div className="text-sm text-gray-600">Sold 1 week ago</div>
                      </div>
                      <div className="text-green-600 font-semibold">$850</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recent purchases</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">newproject.org</div>
                        <div className="text-sm text-gray-600">Purchased yesterday</div>
                      </div>
                      <div className="text-red-600 font-semibold">$45</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Availability Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Search Interface */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-semibold mb-6">Domain Search</h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input placeholder="Search domain..." className="flex-1" />
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">Save your favorite domains</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">myidea.com</div>
                        <div className="text-sm text-gray-600">
                          <span className="text-red-600">●</span> Not available
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Watch</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">myidea.net</div>
                        <div className="text-sm text-gray-600">
                          <span className="text-green-600">●</span> Available - $12.99
                        </div>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">Buy</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">myidea.org</div>
                        <div className="text-sm text-gray-600">
                          <span className="text-green-600">●</span> Available - $14.99
                        </div>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">Buy</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="space-y-6">
              <div className="text-blue-600 font-semibold">Monitor domain availability</div>
              <h2 className="text-4xl font-bold text-gray-900">
                Save your favorite domains
              </h2>
              <p className="text-lg text-gray-600">
                Search for your next favorite domain and save it 
                if it's available. If not you can save it and we will 
                let you know when it becomes available.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link to="/domains-search">
                  Search Domains
                  <Search className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-6">
              <div className="text-purple-600 font-semibold">Powerful notifications under control</div>
              <h2 className="text-4xl font-bold text-gray-900">
                Choose when to get notified
              </h2>
              <p className="text-lg text-gray-600">
                Easily manage your notifications and choose when
                to get notified. No more unwanted emails or
                notifications.
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                <Link to="/internal/notifications">
                  Configure Notifications
                  <Bell className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Right side - Notifications Interface */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-semibold mb-6">Notifications</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Notification Channels</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <span>Email Notifications</span>
                      </div>
                      <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end pr-1">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Slack className="w-5 h-5 text-green-600" />
                        <span>Slack Integration</span>
                      </div>
                      <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end pr-1">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Webhook className="w-5 h-5 text-purple-600" />
                        <span>Webhooks</span>
                      </div>
                      <div className="w-10 h-6 bg-gray-300 rounded-full flex items-center pl-1">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Alert Schedule</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>30 days before expiration</span>
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>15 days before expiration</span>
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>7 days before expiration</span>
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>1 day before expiration</span>
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>SSL certificate expiring</span>
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>DNS changes detected</span>
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Access Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Customer Interface */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-semibold mb-6">Customers</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      JD
                    </div>
                    <div>
                      <div className="font-medium">John Doe</div>
                      <div className="text-sm text-gray-600">john@example.com</div>
                    </div>
                  </div>
                  <Badge variant="outline">5 domains</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      SM
                    </div>
                    <div>
                      <div className="font-medium">Sarah Miller</div>
                      <div className="text-sm text-gray-600">sarah@company.com</div>
                    </div>
                  </div>
                  <Badge variant="outline">12 domains</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      MW
                    </div>
                    <div>
                      <div className="font-medium">Mike Wilson</div>
                      <div className="text-sm text-gray-600">mike@startup.io</div>
                    </div>
                  </div>
                  <Badge variant="outline">3 domains</Badge>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="space-y-6">
              <div className="text-cyan-600 font-semibold">Customer access</div>
              <h2 className="text-4xl font-bold text-gray-900">
                Give your customers access to their domains
              </h2>
              <p className="text-lg text-gray-600">
                You can give access to your customers to see only 
                their domains and their information. Now you,
                can in DOMINENT.
              </p>
              <Button className="bg-cyan-600 hover:bg-cyan-700" asChild>
                <Link to="/internal/projects">
                  Manage Customers
                  <Users className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to monitor your domains?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Dominate your field by DOMINENT, your business, monitoring, alerting and everything. New 
            domain experience a better landscape. Get started now 🔥
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 text-lg"
              asChild
            >
              <Link to="/internal/domains">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg"
              asChild
            >
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>

          <p className="text-blue-200 text-sm mt-6">
            🔒 Free trial setup in our first install
            👍 No credit card required
          </p>
        </div>
      </section>
    </div>
  );
}
