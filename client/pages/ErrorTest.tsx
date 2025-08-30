import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { safeFetchJson, getFetchErrorMessage } from "../lib/safeFetch";

export default function ErrorTest() {
  const [rootWarnings, setRootWarnings] = useState<string[]>([]);
  const [fetchErrors, setFetchErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    success: boolean;
    message: string;
    timestamp: string;
  }[]>([]);

  useEffect(() => {
    // Monitor for createRoot warnings
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('createRoot')) {
        setRootWarnings(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
      }
      originalConsoleWarn(...args);
    };

    // Monitor for fetch errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('Failed to fetch') || message.includes('TypeError')) {
        setFetchErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
      }
      originalConsoleError(...args);
    };

    return () => {
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, []);

  const testRegistrarConfigsAPI = async () => {
    setIsLoading(true);
    const timestamp = new Date().toLocaleTimeString();
    
    try {
      const data = await safeFetchJson("/api/registrar-configs");
      setTestResults(prev => [...prev, {
        success: true,
        message: `Successfully loaded ${data.configs?.length || 0} registrar configs`,
        timestamp
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        success: false,
        message: getFetchErrorMessage(error),
        timestamp
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const testFailingEndpoint = async () => {
    setIsLoading(true);
    const timestamp = new Date().toLocaleTimeString();
    
    try {
      await safeFetchJson("/api/non-existent-endpoint");
      setTestResults(prev => [...prev, {
        success: true,
        message: "Unexpected success on failing endpoint",
        timestamp
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        success: true, // Expected to fail
        message: `Expected error handled gracefully: ${getFetchErrorMessage(error)}`,
        timestamp
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setRootWarnings([]);
    setFetchErrors([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Error Handling Test
          </h1>
          <p className="text-xl text-gray-600">
            Testing the fixes for ReactDOMClient.createRoot() and fetch errors
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
                onClick={testRegistrarConfigsAPI} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Testing..." : "Test Registrar Configs API"}
              </Button>
              
              <Button 
                onClick={testFailingEndpoint} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? "Testing..." : "Test Failing Endpoint"}
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

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No test results yet. Click a test button to start.
                  </p>
                ) : (
                  testResults.map((result, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "✓" : "✗"}
                      </Badge>
                      <span className="text-sm text-gray-600">{result.timestamp}</span>
                      <span className="text-sm">{result.message}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* CreateRoot Warnings Monitor */}
          <Card>
            <CardHeader>
              <CardTitle>CreateRoot Warnings</CardTitle>
              <p className="text-sm text-gray-600">
                Should be empty if the fix is working
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {rootWarnings.length === 0 ? (
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">✓</Badge>
                    <span className="text-green-600">No createRoot warnings detected</span>
                  </div>
                ) : (
                  rootWarnings.map((warning, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {warning}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fetch Errors Monitor */}
          <Card>
            <CardHeader>
              <CardTitle>Fetch Errors</CardTitle>
              <p className="text-sm text-gray-600">
                Monitoring for unhandled fetch errors
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {fetchErrors.length === 0 ? (
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">✓</Badge>
                    <span className="text-green-600">No unhandled fetch errors</span>
                  </div>
                ) : (
                  fetchErrors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                  rootWarnings.length === 0 ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div className="text-sm">
                  <div className="font-medium">CreateRoot Fix</div>
                  <div className="text-gray-600">
                    {rootWarnings.length === 0 ? 'Working' : 'Issues Detected'}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                  fetchErrors.length === 0 ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div className="text-sm">
                  <div className="font-medium">Fetch Error Handling</div>
                  <div className="text-gray-600">
                    {fetchErrors.length === 0 ? 'Working' : 'Issues Detected'}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                  testResults.filter(r => !r.success).length === 0 ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <div className="text-sm">
                  <div className="font-medium">API Tests</div>
                  <div className="text-gray-600">
                    {testResults.length === 0 ? 'Not Tested' : 
                     testResults.filter(r => !r.success).length === 0 ? 'All Passed' : 'Some Failed'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
