import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Check, 
  X, 
  ArrowRight, 
  Shield, 
  Clock, 
  Bell, 
  Users, 
  BarChart3,
  Globe,
  Mail,
  Webhook,
  Database,
  Zap
} from "lucide-react";

const PRICING_PLANS = [
  {
    name: "Starter",
    domains: 5,
    price: 9,
    description: "Perfect for individuals and small projects",
    popular: false,
    features: [
      { name: "Up to 5 domains", included: true },
      { name: "Domain expiry monitoring", included: true },
      { name: "SSL certificate tracking", included: true },
      { name: "Email notifications", included: true },
      { name: "Basic DNS monitoring", included: true },
      { name: "30-day monitoring history", included: true },
      { name: "Email support", included: true },
      { name: "API access", included: false },
      { name: "Custom alerting", included: false },
      { name: "Team collaboration", included: false },
      { name: "Advanced reporting", included: false },
      { name: "Priority support", included: false }
    ]
  },
  {
    name: "Professional",
    domains: 25,
    price: 29,
    description: "Great for growing businesses and agencies",
    popular: true,
    features: [
      { name: "Up to 25 domains", included: true },
      { name: "Domain expiry monitoring", included: true },
      { name: "SSL certificate tracking", included: true },
      { name: "Email notifications", included: true },
      { name: "Advanced DNS monitoring", included: true },
      { name: "90-day monitoring history", included: true },
      { name: "Priority email support", included: true },
      { name: "API access", included: true },
      { name: "Custom alerting", included: true },
      { name: "Team collaboration (3 users)", included: true },
      { name: "Advanced reporting", included: false },
      { name: "Priority support", included: false }
    ]
  },
  {
    name: "Business",
    domains: 100,
    price: 79,
    description: "Ideal for large agencies and enterprises",
    popular: false,
    features: [
      { name: "Up to 100 domains", included: true },
      { name: "Domain expiry monitoring", included: true },
      { name: "SSL certificate tracking", included: true },
      { name: "Email + Slack + Webhook notifications", included: true },
      { name: "Advanced DNS monitoring", included: true },
      { name: "1-year monitoring history", included: true },
      { name: "Priority support", included: true },
      { name: "Full API access", included: true },
      { name: "Custom alerting", included: true },
      { name: "Team collaboration (10 users)", included: true },
      { name: "Advanced reporting & analytics", included: true },
      { name: "Phone support", included: true }
    ]
  },
  {
    name: "Enterprise",
    domains: "Unlimited",
    price: "Custom",
    description: "For large-scale domain monitoring needs",
    popular: false,
    features: [
      { name: "Unlimited domains", included: true },
      { name: "Domain expiry monitoring", included: true },
      { name: "SSL certificate tracking", included: true },
      { name: "All notification channels", included: true },
      { name: "Advanced DNS monitoring", included: true },
      { name: "Unlimited monitoring history", included: true },
      { name: "Dedicated support manager", included: true },
      { name: "Full API access", included: true },
      { name: "Custom alerting & automation", included: true },
      { name: "Unlimited team collaboration", included: true },
      { name: "Custom reporting & analytics", included: true },
      { name: "24/7 phone support", included: true }
    ]
  }
];

const FEATURES_LIST = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Domain & SSL Monitoring",
    description: "Monitor domain expiration dates and SSL certificate status across all your domains"
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Real-time Alerts",
    description: "Get notified 30, 15, 7, and 1 day before expiration via email, Slack, or webhooks"
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "DNS Monitoring",
    description: "Track DNS record changes, nameserver updates, and WHOIS data modifications"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Team Collaboration",
    description: "Organize domains into projects, assign team members, and manage permissions"
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Advanced Analytics",
    description: "Comprehensive reporting and analytics to track domain portfolio health"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "API Integration",
    description: "Integrate with your existing tools and workflows via our comprehensive API"
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="container mx-auto px-6">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your domain monitoring needs. 
              Scale as you grow with no hidden fees.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4">
              <span className="text-gray-600">Monthly</span>
              <div className="relative">
                <input type="checkbox" className="sr-only" />
                <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
              </div>
              <span className="text-gray-600">
                Annual 
                <Badge className="ml-2 bg-green-100 text-green-700">Save 20%</Badge>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {PRICING_PLANS.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-lg' : 'border border-gray-200'}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center">
                      {typeof plan.price === 'number' ? (
                        <>
                          <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                          <span className="text-gray-600 ml-1">/month</span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {typeof plan.domains === 'number' ? `${plan.domains} domains` : plan.domains}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mt-4">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Button 
                    className={`w-full mb-6 ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : plan.name === 'Enterprise'
                        ? 'bg-gray-900 hover:bg-gray-800 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                    asChild
                  >
                    <Link to={plan.name === 'Enterprise' ? '/contact' : '/create-account'}>
                      {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-500'}`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need for domain monitoring
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and features to monitor, manage, and protect your domain portfolio
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {FEATURES_LIST.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently asked questions
            </h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans at any time?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate any charges or credits.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens if I exceed my domain limit?
              </h3>
              <p className="text-gray-600">
                We'll notify you when you're approaching your limit. You can upgrade your plan or 
                remove domains to stay within your limit. We won't stop monitoring your domains.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer annual discounts?
              </h3>
              <p className="text-gray-600">
                Yes! Annual plans come with a 20% discount compared to monthly billing. 
                You can switch to annual billing from your account settings.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                All plans come with a 14-day free trial. No credit card required to start. 
                You can monitor up to 5 domains during your trial period.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. 
                Enterprise customers can also pay by bank transfer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to protect your domains?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start monitoring your domains today with our 14-day free trial. 
            No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 text-lg"
              asChild
            >
              <Link to="/create-account">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg"
              asChild
            >
              <Link to="/internal/domains">View Demo</Link>
            </Button>
          </div>

          <p className="text-blue-200 text-sm mt-6">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">DOMINENT</h3>
              <p className="text-gray-400 text-sm">
                The most comprehensive domain monitoring solution for businesses and agencies.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <Link to="/pricing" className="block text-gray-400 hover:text-white">Pricing</Link>
                <Link to="/domains-search" className="block text-gray-400 hover:text-white">Domain Search</Link>
                <Link to="/internal/domains" className="block text-gray-400 hover:text-white">Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                <Link to="#" className="block text-gray-400 hover:text-white">About</Link>
                <Link to="#" className="block text-gray-400 hover:text-white">Contact</Link>
                <Link to="#" className="block text-gray-400 hover:text-white">Support</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link to="#" className="block text-gray-400 hover:text-white">Privacy Policy</Link>
                <Link to="#" className="block text-gray-400 hover:text-white">Terms of Service</Link>
                <Link to="#" className="block text-gray-400 hover:text-white">Cookie Policy</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-gray-400">
                © 2024 DOMINENT. All rights reserved.
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <Link to="#" className="text-gray-400 hover:text-white">Twitter</Link>
                <Link to="#" className="text-gray-400 hover:text-white">LinkedIn</Link>
                <Link to="#" className="text-gray-400 hover:text-white">GitHub</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
