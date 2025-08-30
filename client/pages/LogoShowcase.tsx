import { Logo, LogoMini } from "../components/Logo";
import { HeroLogo } from "../components/HeroLogo";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function LogoShowcase() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            DOMINENT Logo Showcase
          </h1>
          <p className="text-xl text-gray-600">
            All logo variations and usage examples
          </p>
        </div>

        <div className="space-y-12">
          {/* Hero Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Hero Logo</CardTitle>
              <p className="text-gray-600">Large version for landing pages and special occasions</p>
            </CardHeader>
            <CardContent className="flex justify-center py-12 bg-gradient-to-br from-blue-50 to-white">
              <HeroLogo />
            </CardContent>
          </Card>

          {/* Standard Logos */}
          <Card>
            <CardHeader>
              <CardTitle>Standard Logo Sizes</CardTitle>
              <p className="text-gray-600">Different sizes for headers and navigation</p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Small</h3>
                  <div className="flex justify-center p-6 bg-white rounded-lg border">
                    <Logo size="sm" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Medium</h3>
                  <div className="flex justify-center p-6 bg-white rounded-lg border">
                    <Logo size="md" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Large</h3>
                  <div className="flex justify-center p-6 bg-white rounded-lg border">
                    <Logo size="lg" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Icon Only */}
          <Card>
            <CardHeader>
              <CardTitle>Icon Only Versions</CardTitle>
              <p className="text-gray-600">For tight spaces or mobile applications</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Small Icon</h3>
                  <div className="flex justify-center p-6 bg-white rounded-lg border">
                    <Logo size="sm" showText={false} />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Medium Icon</h3>
                  <div className="flex justify-center p-6 bg-white rounded-lg border">
                    <Logo size="md" showText={false} />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Large Icon</h3>
                  <div className="flex justify-center p-6 bg-white rounded-lg border">
                    <Logo size="lg" showText={false} />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Mini Logo</h3>
                  <div className="flex justify-center p-6 bg-white rounded-lg border">
                    <LogoMini />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Background Variations */}
          <Card>
            <CardHeader>
              <CardTitle>Background Variations</CardTitle>
              <p className="text-gray-600">How the logo appears on different backgrounds</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Light Background</h3>
                  <div className="flex justify-center p-8 bg-white rounded-lg border">
                    <Logo size="md" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Gray Background</h3>
                  <div className="flex justify-center p-8 bg-gray-100 rounded-lg border">
                    <Logo size="md" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Dark Background</h3>
                  <div className="flex justify-center p-8 bg-gray-900 rounded-lg border">
                    <Logo size="md" className="text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-3">✅ Do:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>Use the full logo for headers and main navigation</li>
                    <li>Use the icon-only version in tight spaces</li>
                    <li>Maintain proper spacing around the logo</li>
                    <li>Use on light or dark backgrounds as shown</li>
                    <li>Scale proportionally when resizing</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">❌ Don't:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>Stretch or distort the logo</li>
                    <li>Change the colors arbitrarily</li>
                    <li>Place on busy backgrounds</li>
                    <li>Use extremely small sizes where text becomes unreadable</li>
                    <li>Separate the icon from the text unless using the icon-only version</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
