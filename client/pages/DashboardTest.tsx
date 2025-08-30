import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { safeFetchJson, getFetchErrorMessage } from "../lib/safeFetch";

export default function DashboardTest() {
  const [createRootWarnings, setCreateRootWarnings] = useState<string[]>([]);
  const [fetchErrors, setFetchErrors] = useState<string[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<
    {
      success: boolean;
      message: string;
      timestamp: string;
    }[]
  >([]);

  useEffect(() => {
    // Monitor for createRoot warnings
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(" ");
      if (message.includes("createRoot")) {
        setCreateRootWarnings((prev) => [
          ...prev,
          `${new Date().toLocaleTimeString()}: ${message}`,
        ]);
      }
      originalConsoleWarn(...args);
    };

    // Monitor for fetch errors in dashboard context
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(" ");
      if (
        message.includes("Failed to load dashboard data") ||
        message.includes("Failed to fetch")
      ) {
        setFetchErrors((prev) => [
          ...prev,
          `${new Date().toLocaleTimeString()}: ${message}`,
        ]);
      }
      originalConsoleError(...args);
    };

    return () => {
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, []);

  const testDashboardAPI = async () => {
    setLoading(true);
    const timestamp = new Date().toLocaleTimeString();

    try {
      const data = await safeFetchJson("/api/internal/dashboard");
      setDashboardData(data);
      setTestResults((prev) => [
        ...prev,
        {
          success: true,
          message: `Dashboard data loaded successfully. Found ${data.stats?.totalDomains || 0} domains`,
          timestamp,
        },
      ]);
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        {
          success: false,
          message: getFetchErrorMessage(error),
          timestamp,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const testMultipleRequests = async () => {
    setLoading(true);
    const timestamp = new Date().toLocaleTimeString();

    try {
      // Test multiple concurrent requests
      const promises = Array(5)
        .fill(0)
        .map(() => safeFetchJson("/api/internal/dashboard"));

      const results = await Promise.all(promises);
      setTestResults((prev) => [
        ...prev,
        {
          success: true,
          message: `Multiple concurrent requests successful. All ${results.length} requests completed.`,
          timestamp,
        },
      ]);
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        {
          success: false,
          message: `Multiple requests failed: ${getFetchErrorMessage(error)}`,
          timestamp,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setCreateRootWarnings([]);
    setFetchErrors([]);
    setDashboardData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dashboard Error Fix Test
          </h1>
          <p className="text-xl text-gray-600">
            Testing fixes for createRoot warnings and fetch errors in dashboard
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
                onClick={testDashboardAPI}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Testing..." : "Test Dashboard API"}
              </Button>

              <Button
                onClick={testMultipleRequests}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? "Testing..." : "Test Multiple Concurrent Requests"}
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
                    <div key={index} className="flex items-start space-x-2">
                      <Badge
                        variant={result.success ? "default" : "destructive"}
                      >
                        {result.success ? "✓" : "✗"}
                      </Badge>
                      <div className="flex-1">
                        <span className="text-sm text-gray-600">
                          {result.timestamp}
                        </span>
                        <p className="text-sm">{result.message}</p>
                      </div>
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
                Should remain empty if the fix is working
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {createRootWarnings.length === 0 ? (
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">✓</Badge>
                    <span className="text-green-600">
                      No createRoot warnings detected
                    </span>
                  </div>
                ) : (
                  createRootWarnings.map((warning, index) => (
                    <div
                      key={index}
                      className="text-sm text-red-600 bg-red-50 p-2 rounded"
                    >
                      {warning}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Data Display */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Data</CardTitle>
              <p className="text-sm text-gray-600">
                Latest fetched dashboard data
              </p>
            </CardHeader>
            <CardContent>
              {dashboardData ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Total Domains:</strong>{" "}
                    {dashboardData.stats?.totalDomains || 0}
                  </div>
                  <div className="text-sm">
                    <strong>Expiring Domains:</strong>{" "}
                    {dashboardData.stats?.expiringDomains || 0}
                  </div>
                  <div className="text-sm">
                    <strong>Expiring Certificates:</strong>{" "}
                    {dashboardData.stats?.expiringCertificates || 0}
                  </div>
                  <div className="text-sm">
                    <strong>Online Domains:</strong>{" "}
                    {dashboardData.stats?.onlineDomains || 0}
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      View Raw Data
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(dashboardData, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <p className="text-gray-500">
                  No data loaded yet. Click "Test Dashboard API" to fetch data.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Fix Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div
                  className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                    createRootWarnings.length === 0
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <div className="text-sm">
                  <div className="font-medium">CreateRoot Fix</div>
                  <div className="text-gray-600">
                    {createRootWarnings.length === 0
                      ? "Working"
                      : `${createRootWarnings.length} warnings`}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div
                  className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                    fetchErrors.length === 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <div className="text-sm">
                  <div className="font-medium">Fetch Error Handling</div>
                  <div className="text-gray-600">
                    {fetchErrors.length === 0
                      ? "Working"
                      : `${fetchErrors.length} errors`}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div
                  className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                    testResults.filter((r) => !r.success).length === 0
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                ></div>
                <div className="text-sm">
                  <div className="font-medium">Dashboard API</div>
                  <div className="text-gray-600">
                    {testResults.length === 0
                      ? "Not Tested"
                      : testResults.filter((r) => !r.success).length === 0
                        ? "All Passed"
                        : "Some Failed"}
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
