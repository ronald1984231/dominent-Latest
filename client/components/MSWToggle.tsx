import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export default function MSWToggle() {
  const [isMocking, setIsMocking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<string>("default");

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const toggleMocking = async () => {
    setIsLoading(true);
    try {
      if (isMocking) {
        const { disableMocking } = await import("../mocks");
        await disableMocking();
        setIsMocking(false);
      } else {
        const { enableMocking } = await import("../mocks");
        await enableMocking();
        setIsMocking(true);
      }
    } catch (error) {
      console.error("Failed to toggle MSW:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchScenario = async (scenario: string) => {
    if (!isMocking) return;

    try {
      if (scenario === "default") {
        const { resetToDefaultHandlers } = await import("../mocks/browser");
        resetToDefaultHandlers();
      } else {
        const { switchToErrorScenario } = await import("../mocks/browser");
        switchToErrorScenario(scenario as any);
      }
      setCurrentScenario(scenario);
    } catch (error) {
      console.error("Failed to switch MSW scenario:", error);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-64 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <span>MSW Mock Service</span>
          <Badge variant={isMocking ? "default" : "secondary"}>
            {isMocking ? "ON" : "OFF"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          size="sm"
          variant={isMocking ? "destructive" : "default"}
          onClick={toggleMocking}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "..." : isMocking ? "Disable Mocking" : "Enable Mocking"}
        </Button>

        {isMocking && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Test Scenario:</label>
            <Select value={currentScenario} onValueChange={switchScenario}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">✅ Success (Default)</SelectItem>
                <SelectItem value="registrarImportError">❌ Registrar API Down</SelectItem>
                <SelectItem value="domainsFetchError">❌ Database Error</SelectItem>
                <SelectItem value="addDomainError">❌ Domain Add Failed</SelectItem>
                <SelectItem value="networkTimeout">⏱️ Network Timeout</SelectItem>
                <SelectItem value="unauthorizedError">🔒 Unauthorized</SelectItem>
                <SelectItem value="rateLimitError">🚦 Rate Limited</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
