import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageSquare, TrendingUp, Zap, Globe, Shield, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SEOHead } from "@/components/SEOHead";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t, language } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center justify-center">
              <Logo />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.features')}
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.pricing')}
              </a>
              <a href="#customers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.customers')}
              </a>
            </nav>
            
            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />
              <Link to="/login">
                <Button variant="ghost" className="text-sm">{t('nav.login')}</Button>
              </Link>
              <Link to="/signup">
                <Button className="text-sm bg-primary text-primary-foreground hover:bg-primary/90">{t('nav.signup')}</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={t('nav.openMenu')}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border shadow-lg">
              <nav className="py-4 px-4 space-y-4">
              <a 
                href="#features" 
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.features')}
              </a>
              <a 
                href="#pricing" 
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.pricing')}
              </a>
              <a 
                href="#customers" 
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.customers')}
              </a>
              <hr className="border-border" />
              <LanguageSwitcher />
              <Link to="/login" className="block py-2">
                <Button variant="ghost" className="w-full text-sm justify-start">{t('nav.login')}</Button>
              </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Sticky CTA Button */}
      {isMobile && scrolled && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
          <Link to="/signup" className="block">
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {t('nav.signup')}
            </Button>
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={`text-center ${language === 'ar' || language === 'he' ? 'lg:text-right' : 'lg:text-left'}`}>
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              {t('hero.title')}
              <span className="block">{t('hero.subtitle')}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              {t('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/signup">
                <Button size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {t('hero.cta')}
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="bg-card border border-border rounded-2xl shadow-xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm font-medium mb-2">{t('dashboard.title')}</div>
                <div className="text-xs text-muted-foreground">
                  {t('dashboard.subtitle')}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium">175%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">f</span>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-1/2"></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium">92%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-2/3"></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium">158%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Integration Section */}
      <section id="features" className="bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl font-bold">G</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('platforms.google.title')}</h3>
              <p className="text-sm font-medium text-primary mb-2">{t('platforms.google.subtitle')}</p>
              <p className="text-sm text-muted-foreground">
                {t('platforms.google.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600">f</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('platforms.facebook.title')}</h3>
              <p className="text-sm font-medium text-primary mb-2">{t('platforms.facebook.subtitle')}</p>
              <p className="text-sm text-muted-foreground">
                {t('platforms.facebook.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('platforms.trustpilot.title')}</h3>
              <p className="text-sm font-medium text-primary mb-2">{t('platforms.trustpilot.subtitle')}</p>
              <p className="text-sm text-muted-foreground">
                {t('platforms.trustpilot.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
              <h4 className="font-semibold text-foreground">{t('dashboard.title')}</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('dashboard.newReviews')}</span>
                  <span className="text-sm font-medium">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('dashboard.averageRating')}</span>
                  <span className="text-sm font-medium">4.8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('dashboard.pendingResponses')}</span>
                  <span className="text-sm font-medium">3</span>
                </div>
              </div>
                </div>
              </div>
            </div>
            
            <div className={`text-center ${language === 'ar' || language === 'he' ? 'lg:text-right' : 'lg:text-left'}`}>
              <blockquote className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
                "{t('testimonial.quote')}"
              </blockquote>
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {language === 'he' ? 'YM' : 'JM'}
                  </span>
                </div>
                <div className={language === 'ar' || language === 'he' ? 'text-right' : 'text-left'}>
                  <p className="font-medium text-foreground">{t('testimonial.author')}</p>
                  <p className="text-sm text-muted-foreground">{t('testimonial.role')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features List Section */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-1">
                  <MessageSquare className="w-3 h-3 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t('features.sync.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('features.sync.description')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-1">
                  <TrendingUp className="w-3 h-3 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t('features.sentiment.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('features.sentiment.description')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-1">
                  <MessageSquare className="w-3 h-3 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t('features.responses.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('features.responses.description')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-1">
                  <Globe className="w-3 h-3 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t('features.multilingual.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('features.multilingual.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('pricing.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free Plan */}
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">{t('pricing.plans.free.name')}</h3>
              <div className="text-3xl font-bold text-foreground mb-4">
                {t('pricing.plans.free.price')}
                <span className="text-sm text-muted-foreground font-normal">/{language === 'he' ? 'חודש' : 'month'}</span>
              </div>
              
              <ul className={`space-y-3 mb-6 text-sm ${language === 'he' || language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t('pricing.plans.free.features').split(',').map((feature: string, index: number) => (
                  <li key={index} className={`flex items-center gap-2 ${language === 'he' || language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                    {language === 'he' || language === 'ar' ? (
                      <>
                        <span className="text-muted-foreground">{feature.trim()}</span>
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                        <span className="text-muted-foreground">{feature.trim()}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              
              <Link to="/signup">
                <Button variant="outline" size="lg" className="w-full">
                  {t('nav.signup')}
                </Button>
              </Link>
            </div>

            {/* Starter Plan */}
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">{t('pricing.plans.starter.name')}</h3>
              <div className="text-3xl font-bold text-foreground mb-4">
                {t('pricing.plans.starter.price')}
                <span className="text-sm text-muted-foreground font-normal">/{language === 'he' ? 'חודש' : 'month'}</span>
              </div>
              
              <ul className={`space-y-3 mb-6 text-sm ${language === 'he' || language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t('pricing.plans.starter.features').split(',').map((feature: string, index: number) => (
                  <li key={index} className={`flex items-center gap-2 ${language === 'he' || language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                    {language === 'he' || language === 'ar' ? (
                      <>
                        <span className="text-muted-foreground">{feature.trim()}</span>
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                        <span className="text-muted-foreground">{feature.trim()}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              
              <Link to="/signup">
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {t('nav.signup')}
                </Button>
              </Link>
            </div>

            {/* Pro Plan - Popular */}
            <div className="bg-card border-2 border-primary rounded-2xl p-6 text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  {language === 'he' ? 'הכי פופולרי' : language === 'ar' ? 'الأكثر شيوعاً' : 'Most Popular'}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-foreground mb-2">{t('pricing.plans.pro.name')}</h3>
              <div className="text-3xl font-bold text-foreground mb-4">
                {t('pricing.plans.pro.price')}
                <span className="text-sm text-muted-foreground font-normal">/{language === 'he' ? 'חודש' : 'month'}</span>
              </div>
              
              <ul className={`space-y-3 mb-6 text-sm ${language === 'he' || language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t('pricing.plans.pro.features').split(',').map((feature: string, index: number) => (
                  <li key={index} className={`flex items-center gap-2 ${language === 'he' || language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                    {language === 'he' || language === 'ar' ? (
                      <>
                        <span className="text-muted-foreground">{feature.trim()}</span>
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                        <span className="text-muted-foreground">{feature.trim()}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              
              <Link to="/signup">
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {t('nav.signup')}
                </Button>
              </Link>
            </div>

            {/* Agency Plan */}
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">{t('pricing.plans.agency.name')}</h3>
              <div className="text-3xl font-bold text-foreground mb-4">
                {t('pricing.plans.agency.price')}
                <span className="text-sm text-muted-foreground font-normal">/{language === 'he' ? 'חודש' : 'month'}</span>
              </div>
              
              <ul className={`space-y-3 mb-6 text-sm ${language === 'he' || language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t('pricing.plans.agency.features').split(',').map((feature: string, index: number) => (
                  <li key={index} className={`flex items-center gap-2 ${language === 'he' || language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                    {language === 'he' || language === 'ar' ? (
                      <>
                        <span className="text-muted-foreground">{feature.trim()}</span>
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                        <span className="text-muted-foreground">{feature.trim()}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              
              <Link to="/signup">
                <Button variant="outline" size="lg" className="w-full">
                  {language === 'he' ? 'צור קשר' : language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[hsl(220,30%,20%)] to-[hsl(220,25%,15%)] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('cta.subtitle')}
          </p>
          <Link to="/signup">
            <Button size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              {t('cta.button')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Logo size="sm" />
          </div>
          <p className="text-muted-foreground text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
