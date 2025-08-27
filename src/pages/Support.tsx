import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SupportChatbot } from "@/components/SupportChatbot";
import { 
  HelpCircle, 
  MessageSquare, 
  Book, 
  Phone, 
  Mail, 
  FileQuestion,
  Lightbulb,
  Video,
  ExternalLink
} from "lucide-react";

export function Support() {
  const { t } = useTranslation();

  const faqs = [
    {
      question: "איך יוצרים תגובות AI לביקורות?",
      answer: "עבור לדף הביקורות, בחר ביקורת ולחץ על 'יצור תגובה AI'. המערכת תיצור תגובה מותאמת בהתבסס על פרופיל העסק שלך."
    },
    {
      question: "איך מתחברים לפלטפורמות חיצוניות?",
      answer: "עבור לדף האינטגרציות ולחץ על 'התחבר' ליד הפלטפורמה הרצויה. תוכל להתחבר ל-Google My Business, Facebook ו-Trustpilot."
    },
    {
      question: "איך יוצרים תוכן חברתי?",
      answer: "במרכז החברתי יש יוצר תוכן AI. בחר סוג תוכן, טון ופלטפורמת יעד, והמערכת תיצור תוכן מותאם עם הצעות לתמונות והאשטגים."
    },
    {
      question: "איך מגדירים אוטומציה לתגובות?",
      answer: "בהגדרות העסק תוכל להגדיר טון, הוראות מיוחדות וכללי אוטומציה לתגובות על ביקורות."
    },
    {
      question: "איך מייצאים נתונים ודוחות?",
      answer: "בדף האנליטיקס יש כפתור 'ייצוא נתונים' שמאפשר להוריד דוחות של ביקורות, סטטיסטיקות ונתוני ביצועים."
    }
  ];

  const resources = [
    {
      title: "מדריך למתחילים",
      description: "צעדים ראשונים במערכת REVAI",
      icon: Book,
      link: "#"
    },
    {
      title: "סרטוני הדרכה",
      description: "למד איך להשתמש בכל התכונות",
      icon: Video,
      link: "#"
    },
    {
      title: "דוגמאות ושימושים",
      description: "רעיונות לשיפור הביצועים",
      icon: Lightbulb,
      link: "#"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <HelpCircle className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("sidebar.support")}</h1>
      </div>

      <Tabs defaultValue="chatbot" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 gap-2">
          <TabsTrigger value="chatbot" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            עוזר חכם
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4" />
            שאלות נפוצות
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            משאבים
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            צור קשר
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chatbot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                עוזר REVAI החכם
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                שאל אותי כל שאלה או בקש שאבצע פעולות במערכת עבורך
              </p>
            </CardHeader>
          </Card>
          
          <SupportChatbot className="w-full" />
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5" />
                שאלות נפוצות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-border pb-4 last:border-b-0">
                  <h3 className="font-medium text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resources.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <resource.icon className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-base">{resource.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">בקרוב</Badge>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  תמיכה באימייל
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  שלח לנו אימייל ונחזור אליך תוך 24 שעות
                </p>
                <div className="space-y-2">
                  <p><strong>תמיכה כללית:</strong> support@revai.com</p>
                  <p><strong>תמיכה טכנית:</strong> tech@revai.com</p>
                  <p><strong>מכירות:</strong> sales@revai.com</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  תמיכה טלפונית
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  שירות לקוחות זמין בימים א'-ה' 9:00-18:00
                </p>
                <div className="space-y-2">
                  <p><strong>ישראל:</strong> 03-1234567</p>
                  <p><strong>חירום:</strong> זמין 24/7 ללקוחות Pro</p>
                  <Badge className="bg-green-100 text-green-800">
                    זמן המתנה ממוצע: 2 דקות
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>זמני תגובה לפי תוכנית</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <h3 className="font-semibold mb-2">Free</h3>
                  <p className="text-2xl font-bold text-gray-600">72h</p>
                  <p className="text-sm text-muted-foreground">אימייל בלבד</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <h3 className="font-semibold mb-2">Pro</h3>
                  <p className="text-2xl font-bold text-blue-600">24h</p>
                  <p className="text-sm text-muted-foreground">אימייל + טלפון</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <h3 className="font-semibold mb-2">Enterprise</h3>
                  <p className="text-2xl font-bold text-purple-600">4h</p>
                  <p className="text-sm text-muted-foreground">תמיכה מוקדשת</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}