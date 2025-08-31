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
      
      {/* Main Search Section */}
      <section className="py-20 bg-white">
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
                className="h-14 px-8 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg"
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
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Other TLDs</h2>
            
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
      <section className="py-20 bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-200">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to monitor your domains?
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Domexus it's used by startups, web agencies, freelancers, developers and many more. Your
            domains deserve a better treatment! Get started now 🔥
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 text-lg"
              asChild
            >
              <Link to="/internal/domains">
                Start free trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <div className="text-sm text-gray-600">
              <div>⏰ 14 day free trial</div>
              <div>💳 No credit card required</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <Link to="#" className="hover:text-gray-900">Twitter</Link>
              <Link to="#" className="hover:text-gray-900">Terms</Link>
              <Link to="#" className="hover:text-gray-900">Privacy Policy</Link>
              <Link to="/documentation" className="hover:text-gray-900">Documentation ↗</Link>
            </div>
            <div className="text-sm text-gray-500">
              © 2024 DOMINENT - All rights reserved.
              <br className="md:hidden" />
              <span className="md:ml-2">
                Proudly developed with ❤️ and Next.js
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
