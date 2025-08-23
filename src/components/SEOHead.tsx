import { Helmet } from "react-helmet-async";
import { useTranslation } from "@/hooks/useTranslation";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const seoData = {
  en: {
    title: "RevAI - AI-Powered Review Management Platform",
    description: "Manage all your business reviews in one place with AI. Connect Google, Facebook & Trustpilot. Automated responses, sentiment analysis & smart insights.",
    keywords: "review management, AI reviews, Google reviews, Facebook reviews, Trustpilot, automated responses, sentiment analysis, business reviews",
    siteName: "RevAI"
  },
  he: {
    title: "RevAI - פלטפורמת ניהול ביקורות מבוססת AI",
    description: "נהל את כל הביקורות של העסק שלך במקום אחד עם AI. חיבור לגוגל, פייסבוק ו-Trustpilot. תגובות אוטומטיות, ניתוח סנטימנטים ותובנות חכמות.",
    keywords: "ניהול ביקורות, ביקורות AI, ביקורות גוגל, ביקורות פייסבוך, Trustpilot, תגובות אוטומטיות, ניתוח סנטימנטים, ביקורות עסקיות",
    siteName: "RevAI"
  },
  es: {
    title: "RevAI - Plataforma de Gestión de Reseñas con IA",
    description: "Gestiona todas las reseñas de tu negocio en un solo lugar con IA. Conecta Google, Facebook y Trustpilot. Respuestas automatizadas, análisis de sentimientos e insights inteligentes.",
    keywords: "gestión de reseñas, reseñas IA, reseñas Google, reseñas Facebook, Trustpilot, respuestas automatizadas, análisis sentimientos, reseñas negocio",
    siteName: "RevAI"
  },
  de: {
    title: "RevAI - KI-gestützte Bewertungsmanagement-Plattform",
    description: "Verwalten Sie alle Ihre Unternehmensbewertungen an einem Ort mit KI. Verbinden Sie Google, Facebook & Trustpilot. Automatisierte Antworten, Sentiment-Analyse & intelligente Einblicke.",
    keywords: "Bewertungsmanagement, KI Bewertungen, Google Bewertungen, Facebook Bewertungen, Trustpilot, automatisierte Antworten, Sentiment-Analyse, Unternehmensbewertungen",
    siteName: "RevAI"
  },
  ar: {
    title: "RevAI - منصة إدارة المراجعات بالذكاء الاصطناعي",
    description: "إدارة جميع مراجعات عملك في مكان واحد بالذكاء الاصطناعي. اتصال بجوجل وفيسبوك وTrustpilot. ردود تلقائية وتحليل المشاعر ورؤى ذكية.",
    keywords: "إدارة المراجعات, مراجعات الذكاء الاصطناعي, مراجعات جوجل, مراجعات فيسبوك, Trustpilot, ردود تلقائية, تحليل المشاعر, مراجعات الأعمال",
    siteName: "RevAI"
  },
  ru: {
    title: "RevAI - Платформа Управления Отзывами с ИИ",
    description: "Управляйте всеми отзывами вашего бизнеса в одном месте с ИИ. Подключите Google, Facebook и Trustpilot. Автоматические ответы, анализ тональности и умные инсайты.",
    keywords: "управление отзывами, отзывы ИИ, отзывы Google, отзывы Facebook, Trustpilot, автоматические ответы, анализ тональности, бизнес отзывы",
    siteName: "RevAI"
  }
};

export const SEOHead = ({
  title,
  description,
  keywords,
  canonical,
  ogImage = "https://revai.app/og-image.jpg",
  noIndex = false
}: SEOHeadProps) => {
  const { language } = useTranslation();
  const data = seoData[language] || seoData.en;
  
  const finalTitle = title ? `${title} | ${data.siteName}` : data.title;
  const finalDescription = description || data.description;
  const finalKeywords = keywords || data.keywords;
  
  return (
    <Helmet>
      <html lang={language} dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'} />
      
      {/* Basic SEO */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content="RevAI" />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={data.siteName} />
      <meta property="og:locale" content={language === 'he' ? 'he_IL' : language === 'ar' ? 'ar_SA' : language} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional meta tags for better SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#0066CC" />
      <meta name="msapplication-TileColor" content="#0066CC" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": data.siteName,
          "description": finalDescription,
          "url": "https://revai.app",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "provider": {
            "@type": "Organization", 
            "name": "RevAI",
            "url": "https://revai.app"
          }
        })}
      </script>
    </Helmet>
  );
};