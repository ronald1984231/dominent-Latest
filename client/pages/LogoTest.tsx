import { Logo } from "../components/Logo";
import { HeroLogo } from "../components/HeroLogo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useEffect, useState } from "react";

export default function LogoTest() {
  const [errorCount, setErrorCount] = useState(0);
  const [lastError, setLastError] = useState<string>("");

  useEffect(() => {
    // Monitor for ResizeObserver errors
    const errorHandler = (event: ErrorEvent) => {
      if (event.message.includes("ResizeObserver")) {
        setErrorCount((prev) => prev + 1);
        setLastError(event.message);
        console.log("ResizeObserver error detected:", event.message);
      }
    };

    window.addEventListener("error", errorHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Logo Animation Test
          </h1>
          <p className="text-xl text-gray-600">
            Testing logo animations without ResizeObserver errors
          </p>

          {/* Error Monitor */}
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <div className="flex items-center space-x-4">
              <div
                className={`w-3 h-3 rounded-full ${errorCount === 0 ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <span className="font-medium">
                ResizeObserver Errors: {errorCount}
              </span>
              {lastError && (
                <span className="text-sm text-gray-600 truncate">
                  Last: {lastError}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Standard Logos Test */}
          <Card>
            <CardHeader>
              <CardTitle>Standard Logo Animations</CardTitle>
              <p className="text-gray-600">
                Multiple instances to test for conflicts
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="text-center p-6 bg-white rounded-lg border"
                  >
                    <Logo size="md" />
                    <p className="mt-2 text-sm text-gray-600">Instance {i}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hero Logo Test */}
          <Card>
            <CardHeader>
              <CardTitle>Hero Logo Animation</CardTitle>
              <p className="text-gray-600">Large animated logo test</p>
            </CardHeader>
            <CardContent className="flex justify-center py-12 bg-gradient-to-br from-blue-50 to-white">
              <HeroLogo />
            </CardContent>
          </Card>

          {/* Mixed Sizes Test */}
          <Card>
            <CardHeader>
              <CardTitle>Mixed Logo Sizes</CardTitle>
              <p className="text-gray-600">
                Testing different sizes simultaneously
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <Logo size="sm" />
                  <p className="mt-2 text-xs text-gray-600">Small</p>
                </div>
                <div className="text-center">
                  <Logo size="md" />
                  <p className="mt-2 text-xs text-gray-600">Medium</p>
                </div>
                <div className="text-center">
                  <Logo size="lg" />
                  <p className="mt-2 text-xs text-gray-600">Large</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rapid Re-render Test */}
          <Card>
            <CardHeader>
              <CardTitle>Rapid Re-render Test</CardTitle>
              <p className="text-gray-600">
                Logos that mount/unmount frequently
              </p>
            </CardHeader>
            <CardContent>
              <RapidRenderTest />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Component that rapidly mounts/unmounts logos to test for ResizeObserver issues
function RapidRenderTest() {
  const [showLogos, setShowLogos] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowLogos((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <p className="mb-4 text-sm text-gray-600">
        Logos will appear/disappear every second to test mounting/unmounting
      </p>
      <div className="flex justify-center space-x-4 h-16 items-center">
        {showLogos ? (
          <>
            <Logo size="sm" />
            <Logo size="md" />
            <Logo size="lg" />
          </>
        ) : (
          <span className="text-gray-400">Hidden</span>
        )}
      </div>
    </div>
  );
}
