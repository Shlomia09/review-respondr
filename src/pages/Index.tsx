import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageSquare, TrendingUp, Zap, Globe, Shield } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Logo />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">RevAI Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            AI-Powered Review Management
            <span className="block text-blue-600">for Your Business</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Monitor, analyze, and respond to online reviews across Google, Facebook, and Trustpilot 
            with intelligent AI assistance. Support for Hebrew, Arabic, English, and Spanish.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Manage Reviews
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Powerful features designed for small and medium-sized businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>AI Response Generation</CardTitle>
              <CardDescription>
                Generate personalized responses using GPT-4, matching your brand tone and customer language
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Sentiment Analysis</CardTitle>
              <CardDescription>
                Automatically classify reviews as positive, neutral, or negative with detailed topic extraction
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Globe className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Multi-Language Support</CardTitle>
              <CardDescription>
                Full RTL support for Hebrew and Arabic, plus English and Spanish with intelligent translation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-600 mb-4" />
              <CardTitle>Real-Time Alerts</CardTitle>
              <CardDescription>
                Instant WhatsApp and email notifications for negative reviews with automated positive responses
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Star className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Multi-Platform Integration</CardTitle>
              <CardDescription>
                Connect Google Reviews, Facebook, Trustpilot, and more platforms through secure APIs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Shield className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Weekly and monthly reports with sentiment trends, response rates, and exportable PDFs
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose the plan that fits your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-center">Free</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold">€0</span>
                <span className="text-gray-500">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• 1 response/day</p>
              <p className="text-sm">• 1 platform</p>
              <p className="text-sm">• Basic sentiment analysis</p>
              <Button variant="outline" className="w-full mt-4">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-center">Starter</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold">€29</span>
                <span className="text-gray-500">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• Up to 100 reviews/month</p>
              <p className="text-sm">• 3 platforms</p>
              <p className="text-sm">• Smart AI replies</p>
              <Button className="w-full mt-4">
                Start Trial
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="text-center">Pro</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold">€69</span>
                <span className="text-gray-500">/month</span>
              </div>
              <div className="text-center">
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Most Popular</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• Unlimited reviews</p>
              <p className="text-sm">• All platforms</p>
              <p className="text-sm">• Tone learning & alerts</p>
              <Button className="w-full mt-4">
                Start Trial
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-center">Agency</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold">€199</span>
                <span className="text-gray-500">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• Multi-account dashboard</p>
              <p className="text-sm">• White label</p>
              <p className="text-sm">• Full API access</p>
              <Button variant="outline" className="w-full mt-4">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Review Management?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of businesses already using ReviewAI Manager
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Start Your Free Trial Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo size="sm" />
            <span className="text-lg font-semibold">RevAI Manager</span>
          </div>
          <p className="text-gray-400">
            © 2024 RevAI Manager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
