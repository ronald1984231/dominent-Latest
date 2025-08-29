import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, Check } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary">DOMINENT</h1>
            <p className="text-muted-foreground mt-2">Start monitoring your domains today</p>
          </Link>
        </div>

        {/* Signup Form */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Create your account</h2>
            <p className="text-muted-foreground">Get started with 14 days free trial</p>
          </div>

          {error && (
            <Alert className="mb-6 border-destructive/50 bg-destructive/10">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                disabled={loading}
                className="w-full"
              />
              
              {formData.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Password requirements:</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {[
                      "At least 6 characters",
                      "One uppercase letter",
                      "One lowercase letter", 
                      "One number"
                    ].map((requirement, index) => (
                      <div key={requirement} className="flex items-center space-x-1">
                        <Check className={`h-3 w-3 ${
                          passwordErrors.includes(requirement) 
                            ? 'text-muted-foreground' 
                            : 'text-green-500'
                        }`} />
                        <span className={
                          passwordErrors.includes(requirement) 
                            ? 'text-muted-foreground' 
                            : 'text-green-600'
                        }>
                          {requirement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                disabled={loading}
                className={`w-full ${
                  formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword
                    ? 'border-destructive focus:border-destructive'
                    : ''
                }`}
              />
              {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>

        {/* Features preview */}
        <div className="mt-6 bg-muted/50 border border-border rounded-lg p-4">
          <h3 className="font-medium text-sm text-foreground mb-2">What you'll get:</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 14-day free trial</li>
            <li>• Monitor unlimited domains</li>
            <li>• SSL certificate tracking</li>
            <li>• Email & webhook alerts</li>
            <li>• No credit card required</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
