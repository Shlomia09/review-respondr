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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Logo />
              <h1 className="text-xl font-bold text-foreground">RevAI</h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                תכונות
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                תמחור
              </a>
              <a href="#customers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                לקוחות
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-sm">התחברות</Button>
              </Link>
              <Link to="/signup">
                <Button className="text-sm bg-primary text-primary-foreground hover:bg-primary/90">התחל עכשיו</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-right">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              נהל את הביקורות שלך
              <span className="block">במקום אחד באמצעות AI</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              התחבר אוטומטית לגוגל, פייסבוק ו-Trustpilot. 
              ניתוח חכם, תגובות אוטומטיות ולוח בקרה מאוחד לכל הביקורות שלך.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/signup">
                <Button size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                  התחל ניסיון חינמי
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
                <div className="text-sm font-medium mb-2">לוח בקרה RevAI</div>
                <div className="text-xs text-muted-foreground">
                  קבלת החלטות מהירות • ניתוח סנטימנטים
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
              <h3 className="text-xl font-bold mb-2">גוגל</h3>
              <p className="text-sm font-medium text-primary mb-2">אינטגרציה מהירה של פלטפורמות</p>
              <p className="text-sm text-muted-foreground">
                התחברות חלקה לפלטפורמות ביקורות
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600">f</span>
              </div>
              <h3 className="text-xl font-bold mb-2">פייסבוק</h3>
              <p className="text-sm font-medium text-primary mb-2">ניתוח AI בזמן אמת</p>
              <p className="text-sm text-muted-foreground">
                תובנות וסנטימנטים בקצות האצבעות שלך
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Trustpilot</h3>
              <p className="text-sm font-medium text-primary mb-2">דוחות חכמים ותובנות</p>
              <p className="text-sm text-muted-foreground">
                שפר את העסק שלך עם נתונים ניתנים לפעולה
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
                  <h4 className="font-semibold text-foreground">לוח בקרה RevAI</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">ביקורות חדשות</span>
                      <span className="text-sm font-medium">24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">דירוג ממוצע</span>
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">תגובות ממתינות</span>
                      <span className="text-sm font-medium">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <blockquote className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
                "מאז ההרשמה, ראינו עלייה של 30% בפניות חדשות"
              </blockquote>
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">YM</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">יוסי מלכה</p>
                  <p className="text-sm text-muted-foreground">מנהל שיווק</p>
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
                  <h4 className="font-semibold text-foreground mb-2">סנכרון ביקורות</h4>
                  <p className="text-sm text-muted-foreground">
                    סנכרון אוטומטי של ביקורות מכל הפלטפורמות
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-1">
                  <TrendingUp className="w-3 h-3 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">ניתוח סנטימנטים</h4>
                  <p className="text-sm text-muted-foreground">
                    זיהוי אוטומטי של רגשות ונושאים בביקורות
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
                  <h4 className="font-semibold text-foreground mb-2">תגובות אוטומטיות</h4>
                  <p className="text-sm text-muted-foreground">
                    יצירת תגובות מותאמות אישית באמצעות AI
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-1">
                  <Globe className="w-3 h-3 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">תמיכה רב-לשונית</h4>
                  <p className="text-sm text-muted-foreground">
                    תמיכה מלאה בעברית, ערבית, אנגלית וספרדית
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              תוכנית המותאמת לעסק שלך
            </h2>
            <p className="text-lg text-muted-foreground">
              החל מ-€ /חודש
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg max-w-md mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">תוכנית מקצועית</h3>
              <div className="text-4xl font-bold text-foreground mb-2">
                €69
                <span className="text-lg text-muted-foreground font-normal">/חודש</span>
              </div>
              <p className="text-sm text-muted-foreground">ללא כרטיס אשראי נדרש</p>
            </div>
            
            <ul className="space-y-3 mb-8 text-right">
              <li className="flex items-center justify-end gap-3">
                <span className="text-sm text-muted-foreground">ביקורות בלתי מוגבלות</span>
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
              </li>
              <li className="flex items-center justify-end gap-3">
                <span className="text-sm text-muted-foreground">כל הפלטפורמות</span>
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
              </li>
              <li className="flex items-center justify-end gap-3">
                <span className="text-sm text-muted-foreground">למידת טון ואזעקות</span>
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
              </li>
              <li className="flex items-center justify-end gap-3">
                <span className="text-sm text-muted-foreground">תמיכה 24/7</span>
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
              </li>
            </ul>
            
            <Link to="/signup">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                הצג תוכניות
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[hsl(220,30%,20%)] to-[hsl(220,25%,15%)] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            התחל לנהל את המוניטין שלך עוד היום
          </h2>
          <p className="text-xl mb-8 opacity-90">
            חינמי למשך 14 יום, ללא כרטיס אשראי נדרש
          </p>
          <Link to="/signup">
            <Button size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              צור חשבון עכשיו
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo size="sm" />
            <span className="text-lg font-semibold text-foreground">RevAI</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 RevAI. כל הזכויות שמורות.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
