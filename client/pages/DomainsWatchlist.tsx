import { useState } from "react";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";

interface DomainSearchResult {
  domain: string;
  available: boolean;
  price?: string;
  registrar?: string;
  suggestions?: string[];
}

export default function DomainsWatchlist() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<DomainSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Error",
        description: "Please enter a domain to search",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setHasSearched(true);

    // Simulate domain search API call
    setTimeout(() => {
      const mockResults: DomainSearchResult[] = [
        {
          domain: `${searchTerm}.com`,
          available: Math.random() > 0.5,
          price: "$12.99/year",
          registrar: "GoDaddy"
        },
        {
          domain: `${searchTerm}.net`,
          available: Math.random() > 0.5,
          price: "$14.99/year",
          registrar: "Namecheap"
        },
        {
          domain: `${searchTerm}.org`,
          available: Math.random() > 0.5,
          price: "$13.99/year",
          registrar: "GoDaddy"
        },
        {
          domain: `${searchTerm}.io`,
          available: Math.random() > 0.5,
          price: "$59.99/year",
          registrar: "Namecheap"
        },
        {
          domain: `${searchTerm}.app`,
          available: Math.random() > 0.5,
          price: "$19.99/year",
          registrar: "GoDaddy"
        }
      ];

      setSearchResults(mockResults);
      setLoading(false);
    }, 1500);
  };

  const handleAddToWatchlist = (domain: string) => {
    toast({
      title: "Success",
      description: `Added ${domain} to your watchlist`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <InternalHeader />
      
      <div className="container mx-auto px-6 py-8">
        {!hasSearched ? (
          /* Empty State - Search Interface */
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            {/* Illustration */}
            <div className="relative">
              <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-4">
                {/* Simple illustration placeholder */}
                <div className="space-y-4">
                  <div className="w-32 h-20 bg-white rounded-lg shadow-sm border border-gray-200 relative">
                    {/* Table/list representation */}
                    <div className="space-y-1 p-3">
                      <div className="h-2 bg-green-200 rounded w-full"></div>
                      <div className="h-2 bg-green-200 rounded w-3/4"></div>
                      <div className="h-2 bg-green-200 rounded w-full"></div>
                      <div className="h-2 bg-green-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  {/* Person figure */}
                  <div className="flex justify-center">
                    <div className="w-16 h-20 relative">
                      {/* Head */}
                      <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-1"></div>
                      {/* Body */}
                      <div className="w-12 h-12 bg-green-600 rounded-lg mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-4 max-w-2xl">
              <h1 className="text-2xl font-bold text-foreground">
                Here you can find available domains or monitor your desired domains!
              </h1>
              <p className="text-muted-foreground">
                Start searching your favorite domains from the bar above. We will show if it's available and we can monitor for you!
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-md">
              <div className="flex space-x-3">
                <Input
                  placeholder="Search domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Search Results */
          <div className="space-y-6">
            {/* Header with new search */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Domain Search Results</h1>
                <p className="text-muted-foreground">Results for "{searchTerm}"</p>
              </div>
              
              <div className="flex space-x-3">
                <Input
                  placeholder="Search domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-64"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                  Checking domain availability...
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {searchResults.map((result, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground">{result.domain}</h3>
                            <p className="text-sm text-muted-foreground">
                              {result.available ? "Available for registration" : "Already registered"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            {result.available ? (
                              <>
                                <Badge className="bg-success/10 text-success border-success/20">
                                  Available
                                </Badge>
                                {result.price && (
                                  <p className="text-sm text-muted-foreground mt-1">{result.price}</p>
                                )}
                              </>
                            ) : (
                              <Badge variant="secondary">
                                Taken
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            {result.available ? (
                              <>
                                <Button variant="outline" size="sm">
                                  Register
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAddToWatchlist(result.domain)}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  Add to Watchlist
                                </Button>
                              </>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleAddToWatchlist(result.domain)}
                              >
                                Monitor
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Back to search */}
            <div className="text-center pt-8">
              <Button 
                variant="outline" 
                onClick={() => {
                  setHasSearched(false);
                  setSearchResults([]);
                  setSearchTerm("");
                }}
              >
                Start New Search
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
