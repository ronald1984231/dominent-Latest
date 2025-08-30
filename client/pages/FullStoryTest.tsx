import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { safeFetchJson, getFetchErrorMessage } from "../lib/safeFetch";

export default function FullStoryTest() {
  const [fullStoryErrors, setFullStoryErrors] = useState<string[]>([]);
  const [fetchAttempts, setFetchAttempts] = useState<{
    timestamp: string;
    url: string;
    method: 'original' | 'safe' | 'xhr';
    success: boolean;
    error?: string;
    fallbackUsed?: boolean;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Monitor console for FullStory-related errors
    const originalConsoleError = console.error;
    const originalConsoleDebug = console.debug;
    
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('FullStory') || 
          message.includes('edge.fullstory.com') || 
          message.includes('fs.js') ||
          message.includes('Failed to fetch')) {
        setFullStoryErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
      }
      originalConsoleError(...args);
    };

    console.debug = (...args) => {
      const message = args.join(' ');
      if (message.includes('Fetch intercepted by third-party') || 
          message.includes('FullStory') ||
          message.includes('XMLHttpRequest fallback')) {
        setFullStoryErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: [DEBUG] ${message}`]);
      }
      originalConsoleDebug(...args);
    };

    return () => {
      console.error = originalConsoleError;
      console.debug = originalConsoleDebug;
    };
  }, []);

  const testOriginalFetch = async () => {
    const timestamp = new Date().toLocaleTimeString();
    try {
      const response = await fetch('/api/internal/dashboard');
      const data = await response.json();
      setFetchAttempts(prev => [...prev, {
        timestamp,
        url: '/api/internal/dashboard',
        method: 'original',
        success: true
      }]);
    } catch (error) {
      setFetchAttempts(prev => [...prev, {
        timestamp,
        url: '/api/internal/dashboard',
        method: 'original',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }]);
    }
  };

  const testSafeFetch = async () => {
    const timestamp = new Date().toLocaleTimeString();
    try {
      const data = await safeFetchJson('/api/internal/dashboard');
      setFetchAttempts(prev => [...prev, {
        timestamp,
        url: '/api/internal/dashboard',
        method: 'safe',
        success: true,
        fallbackUsed: fullStoryErrors.some(e => e.includes('XMLHttpRequest fallback'))
      }]);
    } catch (error) {
      setFetchAttempts(prev => [...prev, {
        timestamp,
        url: '/api/internal/dashboard',
        method: 'safe',
        success: false,
        error: getFetchErrorMessage(error)
      }]);
    }
  };

  const testXHRDirect = async () => {
    const timestamp = new Date().toLocaleTimeString();
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/internal/dashboard');
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      xhr.onload = () => {
        setFetchAttempts(prev => [...prev, {
          timestamp,
          url: '/api/internal/dashboard',
          method: 'xhr',
          success: xhr.status >= 200 && xhr.status < 300
        }]);
        resolve(xhr.status);
      };
      
      xhr.onerror = () => {
        setFetchAttempts(prev => [...prev, {
          timestamp,
          url: '/api/internal/dashboard',
          method: 'xhr',
          success: false,
          error: 'XMLHttpRequest error'
        }]);
        resolve(false);
      };
      
      xhr.send();
    });
  };

  const testMultipleConcurrent = async () => {
    setIsLoading(true);
    try {
      const promises = Array(5).fill(0).map(() => safeFetchJson('/api/internal/dashboard'));
      await Promise.all(promises);
      
      const timestamp = new Date().toLocaleTimeString();
      setFetchAttempts(prev => [...prev, {
        timestamp,
        url: '/api/internal/dashboard (5x concurrent)',
        method: 'safe',
        success: true
      }]);
    } catch (error) {
      const timestamp = new Date().toLocaleTimeString();
      setFetchAttempts(prev => [...prev, {
        timestamp,
        url: '/api/internal/dashboard (5x concurrent)',
        method: 'safe',
        success: false,
        error: getFetchErrorMessage(error)
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setFetchAttempts([]);
    setFullStoryErrors([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FullStory Interference Test
          </h1>
          <p className="text-xl text-gray-600">
            Testing fetch mechanisms against FullStory and third-party interference
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testOriginalFetch} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Test Original Fetch (May Fail)
              </Button>
              
              <Button 
                onClick={testSafeFetch} 
                disabled={isLoading}
                className="w-full"
              >
                Test Safe Fetch (Should Work)
              </Button>
              
              <Button 
                onClick={testXHRDirect} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Test Direct XMLHttpRequest
              </Button>
              
              <Button 
                onClick={testMultipleConcurrent} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Testing..." : "Test 5 Concurrent Requests"}
              </Button>
              
              <Button 
                onClick={clearResults} 
                variant="destructive"
                className="w-full"
              >
                Clear Results
              </Button>
            </CardContent>
          </Card>

          {/* Fetch Attempts */}
          <Card>
            <CardHeader>
              <CardTitle>Fetch Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {fetchAttempts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No fetch attempts yet. Click a test button to start.
                  </p>
                ) : (
                  fetchAttempts.slice(-10).reverse().map((attempt, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 border rounded">
                      <Badge variant={attempt.success ? "default" : "destructive"}>
                        {attempt.success ? "✓" : "✗"}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{attempt.timestamp}</span>
                          <Badge variant="outline" className="text-xs">
                            {attempt.method.toUpperCase()}
                          </Badge>
                          {attempt.fallbackUsed && (
                            <Badge variant="secondary" className="text-xs">
                              Fallback Used
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium">{attempt.url}</p>
                        {attempt.error && (
                          <p className="text-sm text-red-600">{attempt.error}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* FullStory Errors Monitor */}
          <Card>
            <CardHeader>
              <CardTitle>FullStory Error Monitor</CardTitle>
              <p className="text-sm text-gray-600">
                Tracking FullStory-related errors and fallback usage
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {fullStoryErrors.length === 0 ? (
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">✓</Badge>
                    <span className="text-green-600">No FullStory interference detected</span>
                  </div>
                ) : (
                  fullStoryErrors.slice(-10).reverse().map((error, index) => (
                    <div key={index} className={`text-sm p-2 rounded ${
                      error.includes('[DEBUG]') ? 'bg-blue-50 text-blue-800' : 'bg-red-50 text-red-600'
                    }`}>
                      {error}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Fix Effectiveness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                      fetchAttempts.filter(a => a.method === 'original' && a.success).length > 0 ? 'bg-green-500' : 
                      fetchAttempts.filter(a => a.method === 'original').length > 0 ? 'bg-red-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="text-xs">
                      <div className="font-medium">Original Fetch</div>
                      <div className="text-gray-600">
                        {fetchAttempts.filter(a => a.method === 'original' && a.success).length}/
                        {fetchAttempts.filter(a => a.method === 'original').length}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                      fetchAttempts.filter(a => a.method === 'safe' && a.success).length > 0 ? 'bg-green-500' : 
                      fetchAttempts.filter(a => a.method === 'safe').length > 0 ? 'bg-red-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="text-xs">
                      <div className="font-medium">Safe Fetch</div>
                      <div className="text-gray-600">
                        {fetchAttempts.filter(a => a.method === 'safe' && a.success).length}/
                        {fetchAttempts.filter(a => a.method === 'safe').length}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                      fetchAttempts.filter(a => a.method === 'xhr' && a.success).length > 0 ? 'bg-green-500' : 
                      fetchAttempts.filter(a => a.method === 'xhr').length > 0 ? 'bg-red-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="text-xs">
                      <div className="font-medium">Direct XHR</div>
                      <div className="text-gray-600">
                        {fetchAttempts.filter(a => a.method === 'xhr' && a.success).length}/
                        {fetchAttempts.filter(a => a.method === 'xhr').length}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg ${
                    fetchAttempts.some(a => a.fallbackUsed) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className="font-medium">Fallback Usage:</span>
                    <span>{fetchAttempts.filter(a => a.fallbackUsed).length} times</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
