import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Loader2, ArrowLeft, Check, Shield, Clock, Users, BarChart3 } from "lucide-react";

export default function CreateAccount() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const { signup, loading, error, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    const errors = [];
    if (formData.password.length > 0) {
      if (formData.password.length < 6) {
        errors.push("At least 6 characters");
      }
      if (!/[A-Z]/.test(formData.password)) {
        errors.push("One uppercase letter");
      }
      if (!/[a-z]/.test(formData.password)) {
        errors.push("One lowercase letter");
      }
      if (!/[0-9]/.test(formData.password)) {
        errors.push("One number");
      }
    }
    setPasswordErrors(errors);
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (passwordErrors.length > 0) {
      return;
    }

    await signup(formData.email, formData.password, formData.name);
  };

  const isFormValid = 
    formData.name.length > 0 &&
    formData.email.length > 0 &&
    formData.password === formData.confirmPassword &&
    passwordErrors.length === 0;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        
        <div className="flex flex-col justify-center px-12 py-24 relative z-10">
          <div className="max-w-md">
            <Logo size="lg" />
            
            <h1 className="text-4xl font-bold text-gray-900 mt-8 mb-6">
              Start monitoring your domains today
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of businesses protecting their digital assets with DOMINENT's comprehensive domain monitoring.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">SSL & domain expiry monitoring</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Real-time alerts & notifications</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700">Team collaboration & projects</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-gray-700">Advanced analytics & reporting</span>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="bg-green-100 text-green-700 border-green-200">Free Trial</Badge>
                <span className="text-sm font-medium text-gray-900">14 days free</span>
              </div>
              <p className="text-sm text-gray-600">
                No credit card required. Start monitoring up to 5 domains immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-block">
              <Logo size="md" />
            </Link>
          </div>

          {/* Back to home link */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-gray-600 mb-8">
              Start your 14-day free trial. No credit card required.
            </p>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
                className="w-full h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="w-full h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                disabled={loading}
                className="w-full h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              
              {formData.password.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">Password requirements:</p>
                  <div className="space-y-1">
                    {[
                      "At least 6 characters",
                      "One uppercase letter",
                      "One lowercase letter", 
                      "One number"
                    ].map((requirement, index) => (
                      <div key={requirement} className="flex items-center space-x-2">
                        <Check className={`h-3 w-3 ${
                          passwordErrors.includes(requirement) 
                            ? 'text-gray-400' 
                            : 'text-green-500'
                        }`} />
                        <span className={`text-xs ${
                          passwordErrors.includes(requirement) 
                            ? 'text-gray-500' 
                            : 'text-green-600'
                        }`}>
                          {requirement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                disabled={loading}
                className={`w-full h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                  formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : ''
                }`}
              />
              {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{" "}
                <Link to="#" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="#" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Start free trial"
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                asChild
              >
                <Link to="/login">
                  Sign in to your account
                </Link>
              </Button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Check className="w-3 h-3" />
                <span>No spam</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
