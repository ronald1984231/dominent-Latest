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
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">MSW</span>
        <Badge variant={isMocking ? "default" : "secondary"}>
          {isMocking ? "ON" : "OFF"}
        </Badge>
      </div>
      <Button
        size="sm"
        variant={isMocking ? "destructive" : "default"}
        onClick={toggleMocking}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "..." : isMocking ? "Disable Mocking" : "Enable Mocking"}
      </Button>
    </div>
  );
}
