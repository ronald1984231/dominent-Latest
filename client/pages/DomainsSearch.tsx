import { useState } from "react";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router-dom";
import { Search, CheckCircle, ArrowRight, XCircle } from "lucide-react";
import { safeFetchJson, getFetchErrorMessage } from "../lib/safeFetch";
import { useToast } from "../hooks/use-toast";

const TLD_EXTENSIONS = [
  { extension: '.com', price: '$12.99', available: true },
  { extension: '.net', price: '$14.99', available: true },
  { extension: '.org', price: '$13.99', available: true },
  { extension: '.us', price: '$9.99', available: true },
  { extension: '.info', price: '$11.99', available: true },
  { extension: '.biz', price: '$15.99', available: true },
  { extension: '.tv', price: '$29.99', available: true },
  { extension: '.me', price: '$19.99', available: true },
  { extension: '.co', price: '$24.99', available: true },
  { extension: '.co.uk', price: '$8.99', available: true },
  { extension: '.in', price: '$11.99', available: true },
  { extension: '.it', price: '$16.99', available: true },
  { extension: '.email', price: '$22.99', available: true },
  { extension: '.build', price: '$34.99', available: true },
  { extension: '.agency', price: '$28.99', available: true },
  { extension: '.bargains', price: '$31.99', available: true },
  { extension: '.zone', price: '$29.99', available: true },
  { extension: '.futbol', price: '$13.99', available: true },
  { extension: '.club', price: '$18.99', available: true },
  { extension: '.productions', price: '$32.99', available: true },
  { extension: '.dating', price: '$49.99', available: true },
  { extension: '.partners', price: '$52.99', available: true },
  { extension: '.ninja', price: '$24.99', available: true },
  { extension: '.social', price: '$31.99', available: true },
  { extension: '.condos', price: '$52.99', available: true },
  { extension: '.events', price: '$31.99', available: true },
  { extension: '.mation', price: '$42.99', available: true },
  { extension: '.properties', price: '$31.99', available: true },
  { extension: '.reviews', price: '$24.99', available: true }
];

export default function DomainsSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{domain: string, available: boolean, price?: string} | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);

    try {
      const cleanDomain = searchTerm.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
      const baseDomain = cleanDomain.replace(/\.(com|net|org|info|io|co)$/i, '');

      const response = await safeFetchJson(`/api/domains/search?q=${encodeURIComponent(baseDomain)}`);

      if (response.success) {
        setSearchResults({
          domain: response.domain,
          available: response.available,
          price: response.price
        });
      } else {
        throw new Error(response.error || 'Search failed');
      }
    } catch (error) {
      console.error('Domain search failed:', error);
      toast({
        title: "Search Error",
        description: getFetchErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getDisplayDomain = (baseDomain: string, extension: string) => {
    return `${baseDomain}${extension}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Search Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Search your next domains
            </h1>

            {/* Search Input */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="timemachine.ai"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-14 text-lg px-6 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchTerm.trim()}
                size="lg"
                className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              >
                {isSearching ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults && (
              <div className="mt-12">
                <Card className={`border-2 max-w-md mx-auto ${
                  searchResults.available
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center space-x-3">
                      {searchResults.available ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                      <div className="text-center">
                        <span className={`text-lg font-semibold ${
                          searchResults.available ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {searchResults.domain}.com is {searchResults.available ? 'available' : 'not available'}
                        </span>
                        {searchResults.available && searchResults.price && (
                          <div className="text-sm text-gray-600 mt-1">
                            Starting at {searchResults.price}/year
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Other TLDs Section */}
      {searchResults && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Other TLDs</h2>
              <p className="text-xl text-gray-600">Explore alternative domain extensions for your project</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Column */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Name
                </div>
                {TLD_EXTENSIONS.slice(0, Math.ceil(TLD_EXTENSIONS.length / 2)).map((tld, index) => (
                  <div key={index} className="flex items-center space-x-3 py-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-900 font-medium">
                      {getDisplayDomain(searchResults.domain, tld.extension)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Available Column */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Available
                </div>
                {TLD_EXTENSIONS.slice(0, Math.ceil(TLD_EXTENSIONS.length / 2)).map((tld, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Domain available</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-900 font-semibold">{tld.price}</span>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Name Column */}
              <div className="space-y-4">
                {TLD_EXTENSIONS.slice(Math.ceil(TLD_EXTENSIONS.length / 2)).map((tld, index) => (
                  <div key={index} className="flex items-center space-x-3 py-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-900 font-medium">
                      {getDisplayDomain(searchResults.domain, tld.extension)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Available Column */}
              <div className="space-y-4">
                {TLD_EXTENSIONS.slice(Math.ceil(TLD_EXTENSIONS.length / 2)).map((tld, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Domain available</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-900 font-semibold">{tld.price}</span>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to monitor your domains?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            DOMINENT is used by startups, web agencies, freelancers, developers and many more. Your
            domains deserve a better treatment! Get started now 🔥
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
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">DOMINENT</h3>
              <p className="text-gray-400 text-sm">
                The most comprehensive domain monitoring solution for businesses and agencies.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <Link to="/pricing" className="block text-gray-400 hover:text-white">Pricing</Link>
                <Link to="/documentation" className="block text-gray-400 hover:text-white">Documentation</Link>
                <Link to="/internal/domains" className="block text-gray-400 hover:text-white">Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                <Link to="#" className="block text-gray-400 hover:text-white">About</Link>
                <Link to="#" className="block text-gray-400 hover:text-white">Contact</Link>
                <Link to="#" className="block text-gray-400 hover:text-white">Support</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link to="#" className="block text-gray-400 hover:text-white">Privacy Policy</Link>
                <Link to="#" className="block text-gray-400 hover:text-white">Terms of Service</Link>
                <Link to="#" className="block text-gray-400 hover:text-white">Cookie Policy</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-gray-400">
                © 2024 DOMINENT. All rights reserved.
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <Link to="#" className="text-gray-400 hover:text-white">Twitter</Link>
                <Link to="#" className="text-gray-400 hover:text-white">LinkedIn</Link>
                <Link to="#" className="text-gray-400 hover:text-white">GitHub</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
