import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

export type Language = 'he' | 'en' | 'es' | 'de' | 'ar' | 'ru';

interface TranslationData {
  [key: string]: string | TranslationData | string[];
}

interface Translations {
  [key: string]: TranslationData;
}

const translations: Translations = {
  he: {
    nav: {
      features: 'תכונות',
      pricing: 'תמחור', 
      customers: 'לקוחות',
      login: 'התחברות',
      signup: 'התחל עכשיו',
      openMenu: 'פתח תפריט'
    },
    hero: {
      title: 'נהל את הביקורות שלך',
      subtitle: 'במקום אחד באמצעות AI',
      description: 'התחבר אוטומטית לגוגל, פייסבוק ו-Trustpilot. ניתוח חכם, תגובות אוטומטיות ולוח בקרה מאוחד לכל הביקורות שלך.',
      cta: 'התחל ניסיון חינמי'
    },
    platforms: {
      google: {
        title: 'גוגל',
        subtitle: 'אינטגרציה מהירה',
        description: 'התחברות חלקה לביקורות גוגל'
      },
      facebook: {
        title: 'פייסבוק', 
        subtitle: 'ניתוח AI בזמן אמת',
        description: 'תובנות וסנטימנטים מתקדמים'
      },
      trustpilot: {
        title: 'Trustpilot',
        subtitle: 'דוחות חכמים ותובנות',
        description: 'שפר את העסק שלך עם נתונים ניתנים לפעולה'
      }
    },
    features: {
      sync: {
        title: 'סנכרון ביקורות',
        description: 'סנכרון אוטומטי של ביקורות מכל הפלטפורמות'
      },
      sentiment: {
        title: 'ניתוח סנטימנטים',
        description: 'זיהוי אוטומטי של רגשות ונושאים בביקורות'
      },
      responses: {
        title: 'תגובות אוטומטיות',
        description: 'יצירת תגובות מותאמות אישית באמצעות AI'
      },
      multilingual: {
        title: 'תמיכה רב-לשונית',
        description: 'תמיכה מלאה בעברית, ערבית, אנגלית, ספרדית, גרמנית ורוסית'
      }
    },
    testimonial: {
      quote: 'מאז ההטמעה, ראינו עלייה של 35% בשביעות רצון הלקוחות ושיפור משמעותי בזמני התגובה שלנו',
      author: 'יוסי מלכה',
      role: 'מנהל שיווק, חברת טק'
    },
    pricing: {
      title: 'בחר את התוכנית המתאימה לך',
      subtitle: 'מחינם ועד פתרון עסקי מלא',
      plans: {
        free: {
          name: 'חינם',
          price: '₪0',
          features: [
            '5 תגובות בחודש',
            'פלטפורמה אחת',
            'ניתוח בסיסי',
            'תמיכה קהילתית'
          ]
        },
        starter: {
          name: 'מתחיל',
          price: '₪99',
          features: [
            '50 תגובות בחודש',
            '3 פלטפורמות', 
            'ניתוח סנטימנטים',
            'תמיכה באימייל'
          ]
        },
        pro: {
          name: 'מקצועי',
          price: '₪299',
          features: [
            'תגובות ללא הגבלה',
            'כל הפלטפורמות',
            'AI מתקדם',
            'תמיכה טלפונית'
          ]
        },
        agency: {
          name: 'סוכנות',
          price: '₪599',
          features: [
            'לקוחות ללא הגבלה',
            'ניהול צוות',
            'API מלא',
            'מנהל חשבון ייעודי'
          ]
        }
      }
    },
    cta: {
      title: 'מוכן להתחיל?',
      subtitle: 'הצטרף לאלפי עסקים שכבר משפרים את השירות שלהם',
      button: 'התחל ניסיון חינמי'
    },
    dashboard: {
      title: 'לוח בקרה RevAI',
      subtitle: 'החלטות מהירות • ניתוח סנטימנטים',
      newReviews: 'ביקורות חדשות',
      averageRating: 'דירוג ממוצע',
      pendingResponses: 'תגובות ממתינות',
      totalReviews: 'סה"כ ביקורות',
      responseRate: 'שיעור תגובה',
      sentiment: 'סנטימנט',
      positive: 'חיובי',
      negative: 'שלילי',
      neutral: 'נייטרלי',
      connectPlatform: 'חבר פלטפורמה',
      settings: 'הגדרות',
      logout: 'התנתקות',
      waitingApproval: 'מחכות לאישור',
      processedResponses: 'תגובות מטופלות',
      loading: 'טוען לוח בקרה...',
      fromLastWeek: 'מהשבוע שעבר',
      generateResponse: 'יצר תגובה',
      approveResponse: 'אשר תגובה',
      sendResponse: 'שלח תגובה',
      manualResponse: 'תגובה ידנית',
      aiInstructions: 'הוראות AI',
      regenerateResponse: 'יצר תגובה מחדש',
      filterBySentiment: 'סנן לפי סנטימנט',
      filterByPlatform: 'סנן לפי פלטפורמה',
      searchReviews: 'חיפוש ביקורות',
      allPlatforms: 'כל הפלטפורמות',
      allSentiments: 'כל הסנטימנטים',
      filterReviews: 'סינון ביקורות',
      noNewReviews: 'אין ביקורות חדשות',
      noNewReviewsDesc: 'כל הביקורות החדשות יופיעו כאן',
      noWaitingReviews: 'אין תגובות הממתינות לאישור',
      noWaitingReviewsDesc: 'תגובות AI שנוצרו והמחכות לאישור יופיעו כאן',
      noProcessedReviews: 'אין תגובות מטופלות',
      noProcessedReviewsDesc: 'תגובות שאושרו ונשלחו יופיעו כאן',
      aiResponseGenerated: 'תגובת AI נוצרה בהצלחה',
      responseWaitingApproval: 'התגובה ממתينה לאישור',
      error: 'שגיאה',
      failedToGenerate: 'לא הצלחנו לייצר תגובת AI. נסה שוב.',
      responseApproved: 'תגובה אושרה',
      responseApprovedSuccess: 'התגובה אושרה בהצלחה',
      failedToApprove: 'לא הצלחנו לאשר את התגובה',
      responseSent: 'תגובה נשלחה',
      responseSentSuccess: 'התגובה נשלחה ללקוח בהצלחה',
      failedToSend: 'לא הצלחנו לשלוח את התגובה',
      errorFetching: 'שגיאה בטעינת הביקורות'
    },
    reviewCard: {
      sent: 'נשלח',
      approved: 'אושר',  
      waitingApproval: 'ממתין לאישור',
      generating: 'מייצר...',
      manualResponse: 'תגובה ידנית',
      aiResponse: 'תגובת AI',
      specialInstructions: 'עם הוראות מיוחדות',
      responseGenerated: 'התגובה נוצרה בהצלחה',
      generatingResponse: 'מייצר תגובה...',
      generateAIResponse: 'צור תגובת AI',
      aiWithInstructions: 'AI עם הוראות',
      writeManualResponse: 'תגובה ידנית',
      approveResponse: 'אשר תגובה',
      regenerateResponse: 'צור תגובה חדשה',
      sendResponse: 'שלח תגובה'
    },
    sidebar: {
      navigation: "ניווט",
      reviews: "ביקורות",
      aiResponses: "תגובות AI",
      analytics: "אנליטיקה",
      socialHub: "מרכז חברתי",
      integrations: "אינטגרציות",
      customers: "לקוחות",
      settings: "הגדרות",
      support: "תמיכה"
    },
    header: {
      searchPlaceholder: "חיפוש ביקורות, פוסטים, לקוחות...",
      notifications: "התראות",
      viewAllNotifications: "הצג את כל ההתראות",
      myAccount: "החשבון שלי",
      settings: "הגדרות", 
      support: "תמיכה",
      logout: "התנתק"
    },
    notifications: {
      newReview: "ביקורת חדשה",
      newReviewMessage: "קיבלת ביקורת חדשה בגוגל",
      lowRating: "דירוג נמוך",
      lowRatingMessage: "ביקורת עם דירוג כוכב אחד",
      aiResponse: "תגובת AI",
      aiResponseMessage: "תגובת AI חדשה נוצרה"
    },
    reviews: {
      allReviews: "כל הביקורות",
      searchReviews: "חיפוש ביקורות",
      filterBySentiment: "סנן לפי סנטימנט",
      filterByPlatform: "סנן לפי פלטפורמה", 
      filterByStatus: "סנן לפי סטטוס",
      allSentiments: "כל הסנטימנטים",
      allPlatforms: "כל הפלטפורמות",
      allStatuses: "כל הסטטוסים",
      moreFilters: "עוד מסננים",
      customer: "לקוח",
      review: "ביקורת",
      rating: "דירוג",
      platform: "פלטפורמה",
      date: "תאריך",
      status: "סטטוס",
      actions: "פעולות",
      bulkApprove: "אשר מרובים",
      bulkSend: "שלח מרובים",
      noReviewsFound: "לא נמצאו ביקורות",
      tryDifferentFilters: "נסה מסננים שונים",
      success: "הצלחה",
      bulkApproveSuccess: "ביקורות אושרו בהצלחה",
      bulkSendSuccess: "ביקורות נשלחו בהצלחה",
      deleteSuccess: "ביקורת נמחקה בהצלחה",
      deleteError: "שגיאה במחיקת ביקורת"
    },
    footer: {
      copyright: '© 2024 RevAI. כל הזכויות שמורות.'
    }
  },
  en: {
    nav: {
      features: 'Features',
      pricing: 'Pricing',
      customers: 'Customers',  
      login: 'Sign In',
      signup: 'Get Started',
      openMenu: 'Open menu'
    },
    hero: {
      title: 'Manage Your Reviews',
      subtitle: 'All in One Place with AI',
      description: 'Automatically connect to Google, Facebook & Trustpilot. Smart analysis, automated responses, and unified dashboard for all your reviews.',
      cta: 'Start Free Trial'
    },
    platforms: {
      google: {
        title: 'Google',
        subtitle: 'Quick Integration',
        description: 'Seamless connection to Google reviews'
      },
      facebook: {
        title: 'Facebook',
        subtitle: 'Real-time AI Analysis', 
        description: 'Advanced insights and sentiment analysis'
      },
      trustpilot: {
        title: 'Trustpilot',
        subtitle: 'Smart Reports & Insights',
        description: 'Improve your business with actionable data'
      }
    },
    features: {
      sync: {
        title: 'Review Sync',
        description: 'Automatic synchronization of reviews from all platforms'
      },
      sentiment: {
        title: 'Sentiment Analysis',
        description: 'Automatic detection of emotions and topics in reviews'
      },
      responses: {
        title: 'Automated Responses',
        description: 'Generate personalized responses using AI'
      },
      multilingual: {
        title: 'Multi-language Support',
        description: 'Full support for Hebrew, Arabic, English, Spanish, German and Russian'
      }
    },
    testimonial: {
      quote: 'Since implementation, we\'ve seen a 35% increase in customer satisfaction and significant improvement in our response times',
      author: 'John Miller',
      role: 'Marketing Manager, Tech Company'
    },
    pricing: {
      title: 'Choose Your Plan',
      subtitle: 'From free to full enterprise solution',
      plans: {
        free: {
          name: 'Free',
          price: '$0',
          features: [
            '5 responses per month',
            '1 platform',
            'Basic analysis',
            'Community support'
          ]
        },
        starter: {
          name: 'Starter',
          price: '$29',
          features: [
            '50 responses per month',
            '3 platforms',
            'Sentiment analysis', 
            'Email support'
          ]
        },
        pro: {
          name: 'Professional',
          price: '$89',
          features: [
            'Unlimited responses',
            'All platforms',
            'Advanced AI',
            'Phone support'
          ]
        },
        agency: {
          name: 'Agency',
          price: '$199',
          features: [
            'Unlimited clients',
            'Team management',
            'Full API',
            'Dedicated account manager'
          ]
        }
      }
    },
    cta: {
      title: 'Ready to Get Started?',
      subtitle: 'Join thousands of businesses already improving their service',
      button: 'Start Free Trial'
    },
    dashboard: {
      title: 'RevAI Dashboard',
      subtitle: 'Quick decisions • Sentiment analysis',
      newReviews: 'New Reviews',
      averageRating: 'Average Rating',
      pendingResponses: 'Pending Responses',
      totalReviews: 'Total Reviews',
      responseRate: 'Response Rate',
      sentiment: 'Sentiment',
      positive: 'Positive',
      negative: 'Negative',
      neutral: 'Neutral',
      connectPlatform: 'Connect Platform',
      settings: 'Settings',
      logout: 'Logout',
      waitingApproval: 'Waiting Approval',
      processedResponses: 'Processed Responses',
      loading: 'Loading dashboard...',
      fromLastWeek: 'from last week',
      generateResponse: 'Generate Response',
      approveResponse: 'Approve Response',
      sendResponse: 'Send Response',
      manualResponse: 'Manual Response',
      aiInstructions: 'AI Instructions',
      regenerateResponse: 'Regenerate Response',
      filterBySentiment: 'Filter by sentiment',
      filterByPlatform: 'Filter by platform',
      searchReviews: 'Search reviews',
      allPlatforms: 'All platforms',
      allSentiments: 'All sentiments',
      filterReviews: 'Filter Reviews',
      noNewReviews: 'No New Reviews',
      noNewReviewsDesc: 'All new reviews will appear here',
      noWaitingReviews: 'No Responses Waiting for Approval',
      noWaitingReviewsDesc: 'AI responses that are generated and waiting for approval will appear here',
      noProcessedReviews: 'No Processed Responses',
      noProcessedReviewsDesc: 'Approved and sent responses will appear here',
      aiResponseGenerated: 'AI response generated successfully',
      responseWaitingApproval: 'Response is waiting for approval',
      error: 'Error',
      failedToGenerate: 'Failed to generate AI response. Please try again.',
      responseApproved: 'Response approved',
      responseApprovedSuccess: 'Response approved successfully',
      failedToApprove: 'Failed to approve response',
      responseSent: 'Response sent',
      responseSentSuccess: 'Response sent to customer successfully',
      failedToSend: 'Failed to send response',
      errorFetching: 'Error fetching reviews'
    },
    reviewCard: {
      sent: 'Sent',
      approved: 'Approved',
      waitingApproval: 'Waiting for approval',
      generating: 'Generating...',
      manualResponse: 'Manual response',
      aiResponse: 'AI response',
      specialInstructions: 'With special instructions',
      responseGenerated: 'Response generated successfully',
      generatingResponse: 'Generating response...',
      generateAIResponse: 'Generate AI Response',
      aiWithInstructions: 'AI with Instructions',
      writeManualResponse: 'Manual Response',
      approveResponse: 'Approve Response',
      regenerateResponse: 'Generate New Response',
      sendResponse: 'Send Response'
    },
    sidebar: {
      navigation: "Navigation",
      reviews: "Reviews",
      aiResponses: "AI Responses",
      analytics: "Analytics",
      socialHub: "Social Hub",
      integrations: "Integrations",
      customers: "Customers",
      settings: "Settings",
      support: "Support"
    },
    header: {
      searchPlaceholder: "Search reviews, posts, customers...",
      notifications: "Notifications",
      viewAllNotifications: "View All Notifications",
      myAccount: "My Account",
      settings: "Settings",
      support: "Support", 
      logout: "Logout"
    },
    notifications: {
      newReview: "New Review",
      newReviewMessage: "You received a new review on Google",
      lowRating: "Low Rating",
      lowRatingMessage: "A review with 1-star rating",
      aiResponse: "AI Response",
      aiResponseMessage: "New AI response generated"
    },
    reviews: {
      allReviews: "All Reviews",
      searchReviews: "Search reviews",
      filterBySentiment: "Filter by sentiment",
      filterByPlatform: "Filter by platform",
      filterByStatus: "Filter by status", 
      allSentiments: "All sentiments",
      allPlatforms: "All platforms",
      allStatuses: "All statuses",
      moreFilters: "More filters",
      customer: "Customer",
      review: "Review", 
      rating: "Rating",
      platform: "Platform",
      date: "Date",
      status: "Status",
      actions: "Actions",
      bulkApprove: "Bulk Approve",
      bulkSend: "Bulk Send",
      noReviewsFound: "No reviews found",
      tryDifferentFilters: "Try different filters",
      success: "Success",
      bulkApproveSuccess: "Reviews approved successfully",
      bulkSendSuccess: "Reviews sent successfully", 
      deleteSuccess: "Review deleted successfully",
      deleteError: "Error deleting review"
    },
    footer: {
      copyright: '© 2024 RevAI. All rights reserved.'
    }
  }
};

// Adding missing translations for pricing plans and dashboard
translations.es = {
  nav: {
    features: 'Características',
    pricing: 'Precios', 
    customers: 'Clientes',
    login: 'Iniciar Sesión',
    signup: 'Empezar Ahora',
    openMenu: 'Abrir menú'
  },
  hero: {
    title: 'Gestiona Tus Reseñas',
    subtitle: 'Todo en Un Lugar con IA',
    description: 'Conéctate automáticamente a Google, Facebook y Trustpilot. Análisis inteligente, respuestas automatizadas y panel unificado para todas tus reseñas.',
    cta: 'Iniciar Prueba Gratuita'
  },
  platforms: {
    google: {
      title: 'Google',
      subtitle: 'Integración Rápida',
      description: 'Conexión perfecta a reseñas de Google'
    },
    facebook: {
      title: 'Facebook',
      subtitle: 'Análisis IA en Tiempo Real',
      description: 'Insights y análisis de sentimientos avanzados'
    },
    trustpilot: {
      title: 'Trustpilot',
      subtitle: 'Reportes Inteligentes',
      description: 'Mejora tu negocio con datos accionables'
    }
  },
  features: {
    sync: {
      title: 'Sincronización de Reseñas',
      description: 'Sincronización automática de reseñas de todas las plataformas'
    },
    sentiment: {
      title: 'Análisis de Sentimientos',
      description: 'Detección automática de emociones y temas en reseñas'
    },
    responses: {
      title: 'Respuestas Automatizadas',
      description: 'Genera respuestas personalizadas usando IA'
    },
    multilingual: {
      title: 'Soporte Multiidioma',
      description: 'Soporte completo para hebreo, árabe, inglés, español, alemán y ruso'
    }
  },
  testimonial: {
    quote: 'Desde la implementación, hemos visto un aumento del 35% en la satisfacción del cliente y una mejora significativa en nuestros tiempos de respuesta',
    author: 'Juan Martínez',
    role: 'Gerente de Marketing, Empresa Tech'
  },
  pricing: {
    title: 'Elige Tu Plan',
    subtitle: 'Desde gratis hasta solución empresarial completa',
    plans: {
      free: {
        name: 'Gratis',
        price: '$0',
        features: [
          '5 respuestas por mes',
          '1 plataforma',
          'Análisis básico',
          'Soporte comunitario'
        ]
      },
      starter: {
        name: 'Iniciador',
        price: '$29',
        features: [
          '50 respuestas por mes',
          '3 plataformas',
          'Análisis de sentimientos',
          'Soporte por email'
        ]
      },
      pro: {
        name: 'Profesional',
        price: '$89',
        features: [
          'Respuestas ilimitadas',
          'Todas las plataformas',
          'IA avanzada',
          'Soporte telefónico'
        ]
      },
      agency: {
        name: 'Agencia',
        price: '$199',
        features: [
          'Clientes ilimitados',
          'Gestión de equipos',
          'API completa',
          'Gerente de cuenta dedicado'
        ]
      }
    }
  },
  cta: {
    title: '¿Listo para Comenzar?',
    subtitle: 'Únete a miles de empresas que ya mejoran su servicio',
    button: 'Iniciar Prueba Gratuita'
  },
  dashboard: {
    title: 'Panel RevAI',
    subtitle: 'Decisiones rápidas • Análisis de sentimientos',
    newReviews: 'Nuevas Reseñas',
    averageRating: 'Calificación Promedio',
    pendingResponses: 'Respuestas Pendientes',
    totalReviews: 'Reseñas Totales',
    responseRate: 'Tasa de Respuesta',
    sentiment: 'Sentimiento',
    positive: 'Positivo',
    negative: 'Negativo',
    neutral: 'Neutral',
    connectPlatform: 'Conectar Plataforma',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',
    waitingApproval: 'Esperando Aprobación',
    processedResponses: 'Respuestas Procesadas',
    loading: 'Cargando panel...',
    fromLastWeek: 'desde la semana pasada',
    generateResponse: 'Generar Respuesta',
    approveResponse: 'Aprobar Respuesta',
    sendResponse: 'Enviar Respuesta',
    manualResponse: 'Respuesta Manual',
    aiInstructions: 'Instrucciones de IA',
    regenerateResponse: 'Regenerar Respuesta',
    filterBySentiment: 'Filtrar por sentimiento',
    filterByPlatform: 'Filtrar por plataforma',
    searchReviews: 'Buscar reseñas',
    allPlatforms: 'Todas las plataformas',
    allSentiments: 'Todos los sentimientos',
    filterReviews: 'Filtrar Reseñas',
    noNewReviews: 'Sin Nuevas Reseñas',
    noNewReviewsDesc: 'Todas las nuevas reseñas aparecerán aquí',
    noWaitingReviews: 'Sin Respuestas Esperando Aprobación',
    noWaitingReviewsDesc: 'Las respuestas de IA generadas y esperando aprobación aparecerán aquí',
    noProcessedReviews: 'Sin Respuestas Procesadas',
    noProcessedReviewsDesc: 'Las respuestas aprobadas y enviadas aparecerán aquí',
    aiResponseGenerated: 'Respuesta de IA generada exitosamente',
    responseWaitingApproval: 'La respuesta está esperando aprobación',
    error: 'Error',
    failedToGenerate: 'No se pudo generar la respuesta de IA. Por favor inténtalo de nuevo.',
    responseApproved: 'Respuesta aprobada',
    responseApprovedSuccess: 'Respuesta aprobada exitosamente',
    failedToApprove: 'No se pudo aprobar la respuesta',
    responseSent: 'Respuesta enviada',
    responseSentSuccess: 'Respuesta enviada al cliente exitosamente',
    failedToSend: 'No se pudo enviar la respuesta',
    errorFetching: 'Error al cargar las reseñas'
  },
  reviewCard: {
    sent: 'Enviado',
    approved: 'Aprobado',
    waitingApproval: 'Esperando aprobación',
    generating: 'Generando...',
    manualResponse: 'Respuesta manual',
    aiResponse: 'Respuesta de IA',
    specialInstructions: 'Con instrucciones especiales',
    responseGenerated: 'Respuesta generada exitosamente',
    generatingResponse: 'Generando respuesta...',
    generateAIResponse: 'Generar Respuesta de IA',
    aiWithInstructions: 'IA con Instrucciones',
    writeManualResponse: 'Respuesta Manual',
    approveResponse: 'Aprobar Respuesta',
    regenerateResponse: 'Generar Nueva Respuesta',
    sendResponse: 'Enviar Respuesta'
  },
  footer: {
    copyright: '© 2024 RevAI. Todos los derechos reservados.'
  }
};

translations.de = {
  nav: {
    features: 'Funktionen',
    pricing: 'Preise',
    customers: 'Kunden',
    login: 'Anmelden',
    signup: 'Jetzt Starten',
    openMenu: 'Menü öffnen'
  },
  hero: {
    title: 'Verwalten Sie Ihre Bewertungen',
    subtitle: 'Alles an einem Ort mit KI',
    description: 'Automatische Verbindung zu Google, Facebook & Trustpilot. Intelligente Analyse, automatisierte Antworten und einheitliches Dashboard für alle Ihre Bewertungen.',
    cta: 'Kostenlose Testversion Starten'
  },
  platforms: {
    google: {
      title: 'Google',
      subtitle: 'Schnelle Integration',
      description: 'Nahtlose Verbindung zu Google Bewertungen'
    },
    facebook: {
      title: 'Facebook',
      subtitle: 'Echtzeit KI-Analyse',
      description: 'Erweiterte Einblicke und Sentiment-Analyse'
    },
    trustpilot: {
      title: 'Trustpilot',
      subtitle: 'Intelligente Berichte',
      description: 'Verbessern Sie Ihr Geschäft mit umsetzbaren Daten'
    }
  },
  features: {
    sync: {
      title: 'Bewertungs-Synchronisation',
      description: 'Automatische Synchronisation von Bewertungen aller Plattformen'
    },
    sentiment: {
      title: 'Sentiment-Analyse',
      description: 'Automatische Erkennung von Emotionen und Themen in Bewertungen'
    },
    responses: {
      title: 'Automatisierte Antworten',
      description: 'Generieren Sie personalisierte Antworten mit KI'
    },
    multilingual: {
      title: 'Mehrsprachiger Support',
      description: 'Vollständige Unterstützung für Hebräisch, Arabisch, Englisch, Spanisch, Deutsch und Russisch'
    }
  },
  testimonial: {
    quote: 'Seit der Implementierung haben wir eine 35%ige Steigerung der Kundenzufriedenheit und deutlich verbesserte Antwortzeiten gesehen',
    author: 'Hans Müller',
    role: 'Marketing Manager, Tech Unternehmen'
  },
  pricing: {
    title: 'Wählen Sie Ihren Plan',
    subtitle: 'Von kostenlos bis zur vollständigen Unternehmenslösung',
    plans: {
      free: {
        name: 'Kostenlos',
        price: '€0',
        features: [
          '5 Antworten pro Monat',
          '1 Plattform',
          'Grundlegende Analyse',
          'Community-Support'
        ]
      },
      starter: {
        name: 'Starter',
        price: '€29',
        features: [
          '50 Antworten pro Monat',
          '3 Plattformen',
          'Sentiment-Analyse',
          'E-Mail-Support'
        ]
      },
      pro: {
        name: 'Professionell',
        price: '€89',
        features: [
          'Unbegrenzte Antworten',
          'Alle Plattformen',
          'Erweiterte KI',
          'Telefon-Support'
        ]
      },
      agency: {
        name: 'Agentur',
        price: '€199',
        features: [
          'Unbegrenzte Kunden',
          'Team-Management',
          'Vollständige API',
          'Dedizierter Kundenbetreuer'
        ]
      }
    }
  },
  cta: {
    title: 'Bereit Anzufangen?',
    subtitle: 'Schließen Sie sich Tausenden von Unternehmen an, die bereits ihren Service verbessern',
    button: 'Kostenlose Testversion Starten'
  },
  dashboard: {
    title: 'RevAI Dashboard',
    subtitle: 'Schnelle Entscheidungen • Sentiment-Analyse',
    newReviews: 'Neue Bewertungen',
    averageRating: 'Durchschnittliche Bewertung',
    pendingResponses: 'Ausstehende Antworten',
    totalReviews: 'Bewertungen Gesamt',
    responseRate: 'Antwortrate',
    sentiment: 'Stimmung',
    positive: 'Positiv',
    negative: 'Negativ',
    neutral: 'Neutral',
    connectPlatform: 'Plattform Verbinden',
    settings: 'Einstellungen',
    logout: 'Abmelden',
    waitingApproval: 'Warten auf Genehmigung',
    processedResponses: 'Verarbeitete Antworten',
    loading: 'Dashboard wird geladen...',
    fromLastWeek: 'von letzter Woche',
    generateResponse: 'Antwort Generieren',
    approveResponse: 'Antwort Genehmigen',
    sendResponse: 'Antwort Senden',
    manualResponse: 'Manuelle Antwort',
    aiInstructions: 'KI-Anweisungen',
    regenerateResponse: 'Antwort Regenerieren',
    filterBySentiment: 'Nach Stimmung filtern',
    filterByPlatform: 'Nach Plattform filtern',
    searchReviews: 'Bewertungen suchen',
    allPlatforms: 'Alle Plattformen',
    allSentiments: 'Alle Stimmungen',
    filterReviews: 'Bewertungen Filtern',
    noNewReviews: 'Keine Neuen Bewertungen',
    noNewReviewsDesc: 'Alle neuen Bewertungen werden hier angezeigt',
    noWaitingReviews: 'Keine Antworten Warten auf Genehmigung',
    noWaitingReviewsDesc: 'KI-Antworten, die generiert wurden und auf Genehmigung warten, werden hier angezeigt',
    noProcessedReviews: 'Keine Verarbeiteten Antworten',
    noProcessedReviewsDesc: 'Genehmigte und gesendete Antworten werden hier angezeigt',
    aiResponseGenerated: 'KI-Antwort erfolgreich generiert',
    responseWaitingApproval: 'Antwort wartet auf Genehmigung',
    error: 'Fehler',
    failedToGenerate: 'KI-Antwort konnte nicht generiert werden. Bitte versuchen Sie es erneut.',
    responseApproved: 'Antwort genehmigt',
    responseApprovedSuccess: 'Antwort erfolgreich genehmigt',
    failedToApprove: 'Antwort konnte nicht genehmigt werden',
    responseSent: 'Antwort gesendet',
    responseSentSuccess: 'Antwort erfolgreich an Kunden gesendet',
    failedToSend: 'Antwort konnte nicht gesendet werden',
    errorFetching: 'Fehler beim Laden der Bewertungen'
  },
  reviewCard: {
    sent: 'Gesendet',
    approved: 'Genehmigt',
    waitingApproval: 'Wartet auf Genehmigung',
    generating: 'Generiert...',
    manualResponse: 'Manuelle Antwort',
    aiResponse: 'KI-Antwort',
    specialInstructions: 'Mit speziellen Anweisungen',
    responseGenerated: 'Antwort erfolgreich generiert',
    generatingResponse: 'Antwort wird generiert...',
    generateAIResponse: 'KI-Antwort Generieren',
    aiWithInstructions: 'KI mit Anweisungen',
    writeManualResponse: 'Manuelle Antwort',
    approveResponse: 'Antwort Genehmigen',
    regenerateResponse: 'Neue Antwort Generieren',
    sendResponse: 'Antwort Senden'
  },
  footer: {
    copyright: '© 2024 RevAI. Alle Rechte vorbehalten.'
  }
};

translations.ar = {
  nav: {
    features: 'المميزات',
    pricing: 'الأسعار',
    customers: 'العملاء',
    login: 'تسجيل الدخول',
    signup: 'ابدأ الآن',
    openMenu: 'فتح القائمة'
  },
  hero: {
    title: 'إدارة مراجعاتك',
    subtitle: 'في مكان واحد بالذكاء الاصطناعي',
    description: 'اتصال تلقائي بجوجل وفيسبوك وTrustpilot. تحليل ذكي وردود تلقائية ولوحة تحكم موحدة لجميع مراجعاتك.',
    cta: 'ابدأ النسخة التجريبية المجانية'
  },
  platforms: {
    google: {
      title: 'جوجل',
      subtitle: 'تكامل سريع',
      description: 'اتصال سلس بمراجعات جوجل'
    },
    facebook: {
      title: 'فيسبوك',
      subtitle: 'تحليل ذكي فوري',
      description: 'رؤى متقدمة وتحليل المشاعر'
    },
    trustpilot: {
      title: 'Trustpilot',
      subtitle: 'تقارير ذكية ورؤى',
      description: 'حسّن عملك بالبيانات القابلة للتنفيذ'
    }
  },
  features: {
    sync: {
      title: 'مزامنة المراجعات',
      description: 'مزامنة تلقائية للمراجعات من جميع المنصات'
    },
    sentiment: {
      title: 'تحليل المشاعر',
      description: 'اكتشاف تلقائي للمشاعر والمواضيع في المراجعات'
    },
    responses: {
      title: 'ردود تلقائية',
      description: 'إنشاء ردود مخصصة باستخدام الذكاء الاصطناعي'
    },
    multilingual: {
      title: 'دعم متعدد اللغات',
      description: 'دعم كامل للعبرية والعربية والإنجليزية والإسبانية والألمانية والروسية'
    }
  },
  testimonial: {
    quote: 'منذ التطبيق، شهدنا زيادة 35% في رضا العملاء وتحسناً كبيراً في أوقات الاستجابة',
    author: 'أحمد محمد',
    role: 'مدير التسويق، شركة تقنية'
  },
  pricing: {
    title: 'اختر خطتك',
    subtitle: 'من المجاني إلى الحل المؤسسي الكامل',
    plans: {
      free: {
        name: 'مجاني',
        price: '$0',
        features: [
          '5 ردود شهرياً',
          'منصة واحدة',
          'تحليل أساسي',
          'دعم المجتمع'
        ]
      },
      starter: {
        name: 'المبتدئ',
        price: '$29',
        features: [
          '50 رد شهرياً',
          '3 منصات',
          'تحليل المشاعر',
          'دعم البريد الإلكتروني'
        ]
      },
      pro: {
        name: 'المحترف',
        price: '$89',
        features: [
          'ردود غير محدودة',
          'جميع المنصات',
          'ذكاء اصطناعي متقدم',
          'دعم هاتفي'
        ]
      },
      agency: {
        name: 'الوكالة',
        price: '$199',
        features: [
          'عملاء غير محدودين',
          'إدارة الفريق',
          'API كامل',
          'مدير حساب مخصص'
        ]
      }
    }
  },
  cta: {
    title: 'مستعد للبدء؟',
    subtitle: 'انضم لآلاف الشركات التي تحسن خدماتها بالفعل',
    button: 'ابدأ النسخة التجريبية المجانية'
  },
  dashboard: {
    title: 'لوحة تحكم RevAI',
    subtitle: 'قرارات سريعة • تحليل المشاعر',
    newReviews: 'مراجعات جديدة',
    averageRating: 'التقييم المتوسط',
    pendingResponses: 'ردود معلقة',
    totalReviews: 'إجمالي المراجعات',
    responseRate: 'معدل الاستجابة',
    sentiment: 'المشاعر',
    positive: 'إيجابي',
    negative: 'سلبي',
    neutral: 'محايد',
    connectPlatform: 'ربط منصة',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    waitingApproval: 'في انتظار الموافقة',
    processedResponses: 'ردود معالجة',
    loading: 'جاري تحميل اللوحة...',
    fromLastWeek: 'من الأسبوع الماضي',
    generateResponse: 'إنشاء رد',
    approveResponse: 'موافقة على الرد',
    sendResponse: 'إرسال الرد',
    manualResponse: 'رد يدوي',
    aiInstructions: 'تعليمات الذكاء الاصطناعي',
    regenerateResponse: 'إعادة إنشاء الرد',
    filterBySentiment: 'تصفية حسب المشاعر',
    filterByPlatform: 'تصفية حسب المنصة',
    searchReviews: 'البحث في المراجعات',
    allPlatforms: 'جميع المنصات',
    allSentiments: 'جميع المشاعر',
    filterReviews: 'تصفية المراجعات',
    noNewReviews: 'لا توجد مراجعات جديدة',
    noNewReviewsDesc: 'جميع المراجعات الجديدة ستظهر هنا',
    noWaitingReviews: 'لا توجد ردود في انتظار الموافقة',
    noWaitingReviewsDesc: 'ردود الذكاء الاصطناعي المُنشأة والتي في انتظار الموافقة ستظهر هنا',
    noProcessedReviews: 'لا توجد ردود معالجة',
    noProcessedReviewsDesc: 'الردود المعتمدة والمرسلة ستظهر هنا',
    aiResponseGenerated: 'تم إنشاء رد الذكاء الاصطناعي بنجاح',
    responseWaitingApproval: 'الرد في انتظار الموافقة',
    error: 'خطأ',
    failedToGenerate: 'فشل في إنشاء رد الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.',
    responseApproved: 'تمت الموافقة على الرد',
    responseApprovedSuccess: 'تمت الموافقة على الرد بنجاح',
    failedToApprove: 'فشل في الموافقة على الرد',
    responseSent: 'تم إرسال الرد',
    responseSentSuccess: 'تم إرسال الرد للعميل بنجاح',
    failedToSend: 'فشل في إرسال الرد',
    errorFetching: 'خطأ في تحميل المراجعات'
  },
  reviewCard: {
    sent: 'مرسل',
    approved: 'معتمد',
    waitingApproval: 'في انتظار الموافقة',
    generating: 'جاري الإنشاء...',
    manualResponse: 'رد يدوي',
    aiResponse: 'رد الذكاء الاصطناعي',
    specialInstructions: 'مع تعليمات خاصة',
    responseGenerated: 'تم إنشاء الرد بنجاح',
    generatingResponse: 'جاري إنشاء الرد...',
    generateAIResponse: 'إنشاء رد ذكي',
    aiWithInstructions: 'ذكاء اصطناعي مع تعليمات',
    writeManualResponse: 'رد يدوي',
    approveResponse: 'الموافقة على الرد',
    regenerateResponse: 'إنشاء رد جديد',
    sendResponse: 'إرسال الرد'
  },
  footer: {
    copyright: '© 2024 RevAI. جميع الحقوق محفوظة.'
  }
};

translations.ru = {
  nav: {
    features: 'Возможности',
    pricing: 'Цены',
    customers: 'Клиенты',
    login: 'Войти',
    signup: 'Начать Сейчас',
    openMenu: 'Открыть меню'
  },
  hero: {
    title: 'Управляйте Отзывами',
    subtitle: 'Всё в Одном Месте с ИИ',
    description: 'Автоматическое подключение к Google, Facebook и Trustpilot. Умный анализ, автоматические ответы и единая панель для всех ваших отзывов.',
    cta: 'Начать Бесплатный Пробный Период'
  },
  platforms: {
    google: {
      title: 'Google',
      subtitle: 'Быстрая Интеграция',
      description: 'Бесшовное подключение к отзывам Google'
    },
    facebook: {
      title: 'Facebook',
      subtitle: 'ИИ-Анализ в Реальном Времени',
      description: 'Продвинутая аналитика и анализ тональности'
    },
    trustpilot: {
      title: 'Trustpilot',
      subtitle: 'Умные Отчеты и Аналитика',
      description: 'Улучшите бизнес с действенными данными'
    }
  },
  features: {
    sync: {
      title: 'Синхронизация Отзывов',
      description: 'Автоматическая синхронизация отзывов со всех платформ'
    },
    sentiment: {
      title: 'Анализ Тональности',
      description: 'Автоматическое определение эмоций и тем в отзывах'
    },
    responses: {
      title: 'Автоматические Ответы',
      description: 'Создание персонализированных ответов с помощью ИИ'
    },
    multilingual: {
      title: 'Многоязычная Поддержка',
      description: 'Полная поддержка иврита, арабского, английского, испанского, немецкого и русского языков'
    }
  },
  testimonial: {
    quote: 'С момента внедрения мы увидели 35% рост удовлетворенности клиентов и значительное улучшение времени отклика',
    author: 'Иван Петров',
    role: 'Менеджер по маркетингу, IT компания'
  },
  pricing: {
    title: 'Выберите Ваш План',
    subtitle: 'От бесплатного до полного корпоративного решения',
    plans: {
      free: {
        name: 'Бесплатно',
        price: '$0',
        features: [
          '5 ответов в месяц',
          '1 платформа',
          'Базовый анализ',
          'Поддержка сообщества'
        ]
      },
      starter: {
        name: 'Стартер',
        price: '$29',
        features: [
          '50 ответов в месяц',
          '3 платформы',
          'Анализ тональности',
          'Поддержка по email'
        ]
      },
      pro: {
        name: 'Профессиональный',
        price: '$89',
        features: [
          'Неограниченные ответы',
          'Все платформы',
          'Продвинутый ИИ',
          'Телефонная поддержка'
        ]
      },
      agency: {
        name: 'Агентство',
        price: '$199',
        features: [
          'Неограниченные клиенты',
          'Управление командой',
          'Полный API',
          'Персональный менеджер'
        ]
      }
    }
  },
  cta: {
    title: 'Готовы Начать?',
    subtitle: 'Присоединяйтесь к тысячам компаний, которые уже улучшают свой сервис',
    button: 'Начать Бесплатный Пробный Период'
  },
  dashboard: {
    title: 'Панель RevAI',
    subtitle: 'Быстрые решения • Анализ тональности',
    newReviews: 'Новые Отзывы',
    averageRating: 'Средний Рейтинг',
    pendingResponses: 'Ожидающие Ответы',
    totalReviews: 'Всего Отзывов',
    responseRate: 'Процент Ответов',
    sentiment: 'Тональность',
    positive: 'Позитивные',
    negative: 'Негативные',
    neutral: 'Нейтральные',
    connectPlatform: 'Подключить Платформу',
    settings: 'Настройки',
    logout: 'Выйти',
    waitingApproval: 'Ожидают Подтверждения',
    processedResponses: 'Обработанные Ответы',
    loading: 'Загрузка панели...',
    fromLastWeek: 'с прошлой недели',
    generateResponse: 'Сгенерировать Ответ',
    approveResponse: 'Одобрить Ответ',
    sendResponse: 'Отправить Ответ',
    manualResponse: 'Ручной Ответ',
    aiInstructions: 'Инструкции ИИ',
    regenerateResponse: 'Перегенерировать Ответ',
    filterBySentiment: 'Фильтр по тональности',
    filterByPlatform: 'Фильтр по платформе',
    searchReviews: 'Поиск отзывов',
    allPlatforms: 'Все платформы',
    allSentiments: 'Все тональности',
    filterReviews: 'Фильтр Отзывов',
    noNewReviews: 'Нет Новых Отзывов',
    noNewReviewsDesc: 'Все новые отзывы будут появляться здесь',
    noWaitingReviews: 'Нет Ответов Ожидающих Подтверждения',
    noWaitingReviewsDesc: 'Ответы ИИ, которые созданы и ожидают подтверждения, будут появляться здесь',
    noProcessedReviews: 'Нет Обработанных Ответов',
    noProcessedReviewsDesc: 'Одобренные и отправленные ответы будут появляться здесь',
    aiResponseGenerated: 'Ответ ИИ успешно создан',
    responseWaitingApproval: 'Ответ ожидает подтверждения',
    error: 'Ошибка',
    failedToGenerate: 'Не удалось создать ответ ИИ. Пожалуйста, попробуйте еще раз.',
    responseApproved: 'Ответ одобрен',
    responseApprovedSuccess: 'Ответ успешно одобрен',
    failedToApprove: 'Не удалось одобрить ответ',
    responseSent: 'Ответ отправлен',
    responseSentSuccess: 'Ответ успешно отправлен клиенту',
    failedToSend: 'Не удалось отправить ответ',
    errorFetching: 'Ошибка загрузки отзывов'
  },
  reviewCard: {
    sent: 'Отправлен',
    approved: 'Одобрен',
    waitingApproval: 'Ожидает подтверждения',
    generating: 'Генерация...',
    manualResponse: 'Ручной ответ',
    aiResponse: 'Ответ ИИ',
    specialInstructions: 'Со специальными инструкциями',
    responseGenerated: 'Ответ успешно создан',
    generatingResponse: 'Создание ответа...',
    generateAIResponse: 'Создать Ответ ИИ',
    aiWithInstructions: 'ИИ с Инструкциями',
    writeManualResponse: 'Ручной Ответ',
    approveResponse: 'Одобрить Ответ',
    regenerateResponse: 'Создать Новый Ответ',
    sendResponse: 'Отправить Ответ'
  },
  footer: {
    copyright: '© 2024 RevAI. Все права защищены.'
  }
};

const defaultLanguage: Language = 'en';

// Add missing translations for all modals and components
(translations as any).en.aiInstructions = {
  title: 'AI Instructions',
  description: 'Add special instructions for AI to customize the response for this review',
  fields: {
    instructions: 'Instructions for AI'
  },
  placeholders: {
    instructions: 'For example: emphasize service quality, mention current promotions...'
  },
  helpText: 'These instructions will help AI generate a more accurate response',
  examples: {
    title: 'Example Instructions:',
    list: 'Mention current promotions, Apologize for unavailability, Invite to special event, Emphasize product quality'
  },
  buttons: {
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...'
  },
  toasts: {
    errorTitle: 'Error',
    errorMissingInstructions: 'Please enter instructions for the system',
    savedTitle: 'Saved',
    savedDesc: 'Instructions saved successfully',
    errorSaveDesc: 'Error saving instructions. Please try again.'
  }
};

(translations as any).he.aiInstructions = {
  title: 'הוראות למערכת AI',
  description: 'הוסף הוראות מיוחדות למערכת AI כדי להתאים את התגובה לביקורת הזו',
  fields: {
    instructions: 'הוראות למערכת AI'
  },
  placeholders: {
    instructions: 'למשל: תן דגש על איכות השירות, הזכר את המבצעים החדשים...'
  },
  helpText: 'ההוראות האלה יעזרו למערכת AI להתאים את התגובה באופן מדויק יותר',
  examples: {
    title: 'דוגמאות להוראות:',
    list: 'הזכר את המבצעים הנוכחיים, תתנצל על חוסר הזמינות, הזמן לאירוע מיוחד, דגש על איכות המוצרים'
  },
  buttons: {
    cancel: 'ביטול',
    save: 'שמירה',
    saving: 'שומר...'
  },
  toasts: {
    errorTitle: 'שגיאה',
    errorMissingInstructions: 'אנא הזן הוראות למערכת',
    savedTitle: 'נשמר',
    savedDesc: 'ההוראות נשמרו בהצלחה',
    errorSaveDesc: 'שגיאה בשמירת ההוראות. נסה שוב.'
  }
};

(translations as any).en.manualResponse = {
  title: 'Manual Response',
  description: 'Write a personal response to this review',
  fields: {
    response: 'Your Response'
  },
  placeholders: {
    response: 'Write a personalized response...'
  },
  helpText: 'The response will be sent to the customer after approval',
  buttons: {
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...'
  },
  toasts: {
    errorTitle: 'Error',
    errorMissingResponse: 'Please write a response',
    savedTitle: 'Saved',
    savedDesc: 'Response saved successfully',
    errorSaveDesc: 'Error saving response. Please try again.'
  }
};

(translations as any).he.manualResponse = {
  title: 'תגובה ידנית',
  description: 'כתוב תגובה אישית לביקורת הזו',
  fields: {
    response: 'התגובה שלך'
  },
  placeholders: {
    response: 'כתוב תגובה מותאמת אישית...'
  },
  helpText: 'התגובה תישלח ללקוח לאחר האישור',
  buttons: {
    cancel: 'ביטול',
    save: 'שמירה',
    saving: 'שומר...'
  },
  toasts: {
    errorTitle: 'שגיאה',
    errorMissingResponse: 'אנא כתוב תגובה',
    savedTitle: 'נשמר',
    savedDesc: 'התגובה נשמרה בהצלחה',
    errorSaveDesc: 'שגיאה בשמירת התגובה. נסה שוב.'
  }
};

(translations as any).en.platformConnection = {
  title: 'Platform Connections',
  description: 'Connect your review platforms for automatic import and management of reviews',
  connected: 'Connected',
  disconnected: 'Not Connected',
  reviews: 'reviews',
  connect: 'Connect',
  manage: 'Manage'
};

(translations as any).he.platformConnection = {
  title: 'חיבור פלטפורמות',
  description: 'חבר את פלטפורמות הביקורת שלך לייבוא וניהול אוטומטי של ביקורות',
  connected: 'מחובר',
  disconnected: 'לא מחובר',
  reviews: 'ביקורות',
  connect: 'חבר',
  manage: 'נהל'
};

// Add translations for all other languages  
['es', 'de', 'ar', 'ru'].forEach(lang => {
  if (lang === 'es') {
    (translations as any)[lang].aiInstructions = {
      title: 'Instrucciones de IA',
      description: 'Agrega instrucciones especiales para que la IA personalice la respuesta',
      fields: { instructions: 'Instrucciones para IA' },
      placeholders: { instructions: 'Por ejemplo: enfatizar la calidad del servicio, mencionar promociones...' },
      helpText: 'Estas instrucciones ayudarán a la IA a generar una respuesta más precisa',
      examples: { title: 'Ejemplos de instrucciones:', list: 'Mencionar promociones actuales, Disculparse por no disponibilidad, Invitar a evento especial, Enfatizar calidad del producto' },
      buttons: { cancel: 'Cancelar', save: 'Guardar', saving: 'Guardando...' },
      toasts: { errorTitle: 'Error', errorMissingInstructions: 'Por favor ingresa instrucciones', savedTitle: 'Guardado', savedDesc: 'Instrucciones guardadas exitosamente', errorSaveDesc: 'Error al guardar. Inténtalo de nuevo.' }
    };
    (translations as any)[lang].manualResponse = {
      title: 'Respuesta Manual',
      description: 'Escribe una respuesta personal a esta reseña',
      fields: { response: 'Tu Respuesta' },
      placeholders: { response: 'Escribe una respuesta personalizada...' },
      helpText: 'La respuesta será enviada al cliente después de la aprobación',
      buttons: { cancel: 'Cancelar', save: 'Guardar', saving: 'Guardando...' },
      toasts: { errorTitle: 'Error', errorMissingResponse: 'Por favor escribe una respuesta', savedTitle: 'Guardado', savedDesc: 'Respuesta guardada exitosamente', errorSaveDesc: 'Error al guardar. Inténtalo de nuevo.' }
    };
    (translations as any)[lang].platformConnection = { 
      title: 'Conexiones de Plataforma', 
      description: 'Conecta tus plataformas de reseñas para importación y gestión automática', 
      connected: 'Conectado', 
      disconnected: 'No Conectado', 
      reviews: 'reseñas', 
      connect: 'Conectar', 
      manage: 'Gestionar',
      selectBusiness: 'Seleccionar Tu Negocio',
      loadingBusinesses: 'Cargando negocios...',
      businessSelectionDescription: 'Por favor selecciona el negocio que quieres conectar:',
      chooseBusiness: 'Elegir un negocio',
      businessSelected: 'Negocio seleccionado exitosamente',
      noBusinessesFound: 'No se encontraron negocios. Asegúrate de tener Google My Business configurado.'
    };
  } else if (lang === 'de') {
    (translations as any)[lang].aiInstructions = {
      title: 'KI-Anweisungen',
      description: 'Füge spezielle Anweisungen für die KI hinzu, um die Antwort anzupassen',
      fields: { instructions: 'Anweisungen für KI' },
      placeholders: { instructions: 'Zum Beispiel: Servicequalität betonen, aktuelle Aktionen erwähnen...' },
      helpText: 'Diese Anweisungen helfen der KI, eine genauere Antwort zu generieren',
      examples: { title: 'Beispiel-Anweisungen:', list: 'Aktuelle Aktionen erwähnen, Sich für Nichtverfügbarkeit entschuldigen, Zu besonderen Events einladen, Produktqualität betonen' },
      buttons: { cancel: 'Abbrechen', save: 'Speichern', saving: 'Speichern...' },
      toasts: { errorTitle: 'Fehler', errorMissingInstructions: 'Bitte geben Sie Anweisungen ein', savedTitle: 'Gespeichert', savedDesc: 'Anweisungen erfolgreich gespeichert', errorSaveDesc: 'Fehler beim Speichern. Bitte erneut versuchen.' }
    };
    (translations as any)[lang].manualResponse = {
      title: 'Manuelle Antwort',
      description: 'Schreibe eine persönliche Antwort auf diese Bewertung',
      fields: { response: 'Ihre Antwort' },
      placeholders: { response: 'Schreibe eine personalisierte Antwort...' },
      helpText: 'Die Antwort wird nach Genehmigung an den Kunden gesendet',
      buttons: { cancel: 'Abbrechen', save: 'Speichern', saving: 'Speichern...' },
      toasts: { errorTitle: 'Fehler', errorMissingResponse: 'Bitte schreiben Sie eine Antwort', savedTitle: 'Gespeichert', savedDesc: 'Antwort erfolgreich gespeichert', errorSaveDesc: 'Fehler beim Speichern. Bitte erneut versuchen.' }
    };
    (translations as any)[lang].platformConnection = { 
      title: 'Plattform-Verbindungen', 
      description: 'Verbinden Sie Ihre Bewertungsplattformen für automatischen Import und Verwaltung', 
      connected: 'Verbunden', 
      disconnected: 'Nicht Verbunden', 
      reviews: 'bewertungen', 
      connect: 'Verbinden', 
      manage: 'Verwalten',
      selectBusiness: 'Ihr Unternehmen auswählen',
      loadingBusinesses: 'Unternehmen werden geladen...',
      businessSelectionDescription: 'Bitte wählen Sie das Unternehmen aus, das Sie verbinden möchten:',
      chooseBusiness: 'Ein Unternehmen wählen',
      businessSelected: 'Unternehmen erfolgreich ausgewählt',
      noBusinessesFound: 'Keine Unternehmen gefunden. Stellen Sie sicher, dass Google My Business eingerichtet ist.'
    };
  } else if (lang === 'ar') {
    (translations as any)[lang].aiInstructions = {
      title: 'تعليمات الذكاء الاصطناعي',
      description: 'أضف تعليمات خاصة للذكاء الاصطناعي لتخصيص الرد',
      fields: { instructions: 'تعليمات للذكاء الاصطناعي' },
      placeholders: { instructions: 'مثال: التأكيد على جودة الخدمة، ذكر العروض الحالية...' },
      helpText: 'ستساعد هذه التعليمات الذكاء الاصطناعي في إنتاج رد أكثر دقة',
      examples: { title: 'أمثلة على التعليمات:', list: 'ذكر العروض الحالية, الاعتذار عن عدم التوفر, دعوة لحدث خاص, التأكيد على جودة المنتج' },
      buttons: { cancel: 'إلغاء', save: 'حفظ', saving: 'جارٍ الحفظ...' },
      toasts: { errorTitle: 'خطأ', errorMissingInstructions: 'يرجى إدخال تعليمات', savedTitle: 'تم الحفظ', savedDesc: 'تم حفظ التعليمات بنجاح', errorSaveDesc: 'خطأ في الحفظ. يرجى المحاولة مرة أخرى.' }
    };
    (translations as any)[lang].manualResponse = {
      title: 'رد يدوي',
      description: 'اكتب رداً شخصياً على هذه المراجعة',
      fields: { response: 'ردك' },
      placeholders: { response: 'اكتب رداً مخصصاً...' },
      helpText: 'سيتم إرسال الرد للعميل بعد الموافقة',
      buttons: { cancel: 'إلغاء', save: 'حفظ', saving: 'جارٍ الحفظ...' },
      toasts: { errorTitle: 'خطأ', errorMissingResponse: 'يرجى كتابة رد', savedTitle: 'تم الحفظ', savedDesc: 'تم حفظ الرد بنجاح', errorSaveDesc: 'خطأ في الحفظ. يرجى المحاولة مرة أخرى.' }
    };
    (translations as any)[lang].platformConnection = { 
      title: 'اتصالات المنصة', 
      description: 'اربط منصات المراجعات للاستيراد والإدارة التلقائية', 
      connected: 'متصل', 
      disconnected: 'غير متصل', 
      reviews: 'مراجعات', 
      connect: 'اتصال', 
      manage: 'إدارة',
      selectBusiness: 'اختر عملك',
      loadingBusinesses: 'تحميل الأعمال...',
      businessSelectionDescription: 'يرجى اختيار العمل الذي تريد ربطه:',
      chooseBusiness: 'اختر عملاً',
      businessSelected: 'تم اختيار العمل بنجاح',
      noBusinessesFound: 'لم يتم العثور على أعمال. تأكد من إعداد Google My Business.'
    };
  } else if (lang === 'ru') {
    (translations as any)[lang].aiInstructions = {
      title: 'Инструкции для ИИ',
      description: 'Добавьте специальные инструкции для ИИ для настройки ответа',
      fields: { instructions: 'Инструкции для ИИ' },
      placeholders: { instructions: 'Например: подчеркнуть качество сервиса, упомянуть текущие акции...' },
      helpText: 'Эти инструкции помогут ИИ создать более точный ответ',
      examples: { title: 'Примеры инструкций:', list: 'Упомянуть текущие акции, Извиниться за недоступность, Пригласить на особое событие, Подчеркнуть качество продукта' },
      buttons: { cancel: 'Отмена', save: 'Сохранить', saving: 'Сохранение...' },
      toasts: { errorTitle: 'Ошибка', errorMissingInstructions: 'Пожалуйста, введите инструкции', savedTitle: 'Сохранено', savedDesc: 'Инструкции успешно сохранены', errorSaveDesc: 'Ошибка сохранения. Попробуйте еще раз.' }
    };
    (translations as any)[lang].manualResponse = {
      title: 'Ручной Ответ',
      description: 'Напишите личный ответ на этот отзыв',
      fields: { response: 'Ваш Ответ' },
      placeholders: { response: 'Напишите персонализированный ответ...' },
      helpText: 'Ответ будет отправлен клиенту после одобрения',
      buttons: { cancel: 'Отмена', save: 'Сохранить', saving: 'Сохранение...' },
      toasts: { errorTitle: 'Ошибка', errorMissingResponse: 'Пожалуйста, напишите ответ', savedTitle: 'Сохранено', savedDesc: 'Ответ успешно сохранен', errorSaveDesc: 'Ошибка сохранения. Попробуйте еще раз.' }
    };
    (translations as any)[lang].platformConnection = { 
      title: 'Подключения Платформ', 
      description: 'Подключите платформы отзывов для автоматического импорта и управления', 
      connected: 'Подключено', 
      disconnected: 'Не Подключено', 
      reviews: 'отзывов', 
      connect: 'Подключить', 
      manage: 'Управлять',
      selectBusiness: 'Выберите Ваш Бизнес',
      loadingBusinesses: 'Загрузка бизнесов...',
      businessSelectionDescription: 'Пожалуйста, выберите бизнес, который хотите подключить:',
      chooseBusiness: 'Выберите бизнес',
      businessSelected: 'Бизнес успешно выбран',
      noBusinessesFound: 'Бизнесы не найдены. Убедитесь, что Google My Business настроен.'
    };
  }
});
(translations as any).en.businessSetup = {
  title: 'Business Setup',
  description: 'Tell us about your business so we can personalize AI responses.',
  fields: {
    businessName: 'Business Name',
    businessType: 'Business Type',
    description: 'Business Description',
    targetAudience: 'Target Audience',
    tone: 'Response Tone',
    specialInstructions: 'Special Instructions for AI',
  },
  placeholders: {
    businessName: 'e.g., Cafe Aroma',
    businessType: 'Select business type',
    description: 'Briefly describe what your business offers...',
    targetAudience: 'Families, young adults, business people...',
    specialInstructions: 'Additional guidance for AI on how to respond...'
  },
  tone: {
    professional: 'Professional',
    friendly: 'Friendly',
    casual: 'Casual',
    luxury: 'Luxury',
  },
  types: {
    restaurant: 'Restaurant',
    cafe: 'Cafe',
    retail_store: 'Retail Store',
    beauty_salon: 'Beauty Salon',
    medical_clinic: 'Medical Clinic',
    fitness_gym: 'Fitness / Gym',
    hotel: 'Hotel',
    automotive: 'Automotive',
    technology: 'Technology',
    consulting: 'Consulting',
    education: 'Education',
    real_estate: 'Real Estate',
    entertainment: 'Entertainment',
    other: 'Other'
  },
  buttons: {
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    dontShowAgain: "Don't show again",
  },
  toasts: {
    errorTitle: 'Missing information',
    errorMissingFields: 'Please fill in the required fields.',
    savedTitle: 'Saved',
    savedDesc: 'Your business profile has been saved successfully.',
    errorSaveDesc: 'We could not save your business profile. Please try again.'
  }
};

(translations as any).he.businessSetup = {
  title: 'הגדרת עסק',
  description: 'ספר לנו על העסק כדי שנתאים את תגובות ה-AI.',
  fields: {
    businessName: 'שם העסק',
    businessType: 'סוג העסק',
    description: 'תיאור העסק',
    targetAudience: 'קהל היעד',
    tone: 'טון התגובות',
    specialInstructions: 'הוראות מיוחדות למערכת',
  },
  placeholders: {
    businessName: 'לדוגמה: קפה ארומה',
    businessType: 'בחר סוג עסק',
    description: 'תאר בקצרה מה העסק מציע...',
    targetAudience: 'משפחות עם ילדים, צעירים, אנשי עסקים...',
    specialInstructions: 'הוראות נוספות למערכת AI על איך להגיב...'
  },
  tone: {
    professional: 'מקצועי',
    friendly: 'ידידותי',
    casual: 'קליל',
    luxury: 'יוקרתי',
  },
  types: {
    restaurant: 'מסעדה',
    cafe: 'בית קפה',
    retail_store: 'חנות קמעונאית',
    beauty_salon: 'סלון יופי',
    medical_clinic: 'מרפאה',
    fitness_gym: 'כושר / חדר כושר',
    hotel: 'מלון',
    automotive: 'רכב',
    technology: 'טכנולוגיה',
    consulting: 'ייעוץ',
    education: 'חינוך',
    real_estate: 'נדל"ן',
    entertainment: 'בידור',
    other: 'אחר'
  },
  buttons: {
    cancel: 'ביטול',
    save: 'שמירה',
    saving: 'שומר...',
    dontShowAgain: 'אל תציג שוב',
  },
  toasts: {
    errorTitle: 'חסר פרטים',
    errorMissingFields: 'אנא מלא את השדות החיוניים.',
    savedTitle: 'נשמר',
    savedDesc: 'פרטי העסק נשמרו בהצלחה.',
    errorSaveDesc: 'לא הצלחנו לשמור את פרטי העסק. נסה שוב.'
  }
};

(translations as any).es.businessSetup = {
  title: 'Configuración del Negocio',
  description: 'Cuéntanos sobre tu negocio para personalizar las respuestas de IA.',
  fields: {
    businessName: 'Nombre del negocio',
    businessType: 'Tipo de negocio',
    description: 'Descripción del negocio',
    targetAudience: 'Público objetivo',
    tone: 'Tono de respuesta',
    specialInstructions: 'Instrucciones especiales para IA',
  },
  placeholders: {
    businessName: 'p. ej., Cafe Aroma',
    businessType: 'Selecciona el tipo de negocio',
    description: 'Describe brevemente lo que ofrece tu negocio...',
    targetAudience: 'Familias, jóvenes, ejecutivos...',
    specialInstructions: 'Guía adicional para IA sobre cómo responder...'
  },
  tone: {
    professional: 'Profesional',
    friendly: 'Amigable',
    casual: 'Informal',
    luxury: 'De lujo',
  },
  types: {
    restaurant: 'Restaurante',
    cafe: 'Café',
    retail_store: 'Tienda minorista',
    beauty_salon: 'Salón de belleza',
    medical_clinic: 'Clínica médica',
    fitness_gym: 'Gimnasio',
    hotel: 'Hotel',
    automotive: 'Automotriz',
    technology: 'Tecnología',
    consulting: 'Consultoría',
    education: 'Educación',
    real_estate: 'Bienes raíces',
    entertainment: 'Entretenimiento',
    other: 'Otro'
  },
  buttons: {
    cancel: 'Cancelar',
    save: 'Guardar',
    saving: 'Guardando...',
    dontShowAgain: 'No mostrar de nuevo',
  },
  toasts: {
    errorTitle: 'Falta información',
    errorMissingFields: 'Por favor completa los campos obligatorios.',
    savedTitle: 'Guardado',
    savedDesc: 'El perfil de tu negocio se guardó correctamente.',
    errorSaveDesc: 'No pudimos guardar el perfil del negocio. Inténtalo de nuevo.'
  }
};

(translations as any).de.businessSetup = {
  title: 'Unternehmens-Setup',
  description: 'Erzählen Sie uns von Ihrem Unternehmen, um KI-Antworten zu personalisieren.',
  fields: {
    businessName: 'Unternehmensname',
    businessType: 'Unternehmenstyp',
    description: 'Unternehmensbeschreibung',
    targetAudience: 'Zielgruppe',
    tone: 'Antwort-Ton',
    specialInstructions: 'Spezielle Anweisungen für KI',
  },
  placeholders: {
    businessName: 'z. B. Cafe Aroma',
    businessType: 'Unternehmenstyp auswählen',
    description: 'Beschreiben Sie kurz, was Ihr Unternehmen anbietet...',
    targetAudience: 'Familien, junge Erwachsene, Geschäftsleute...',
    specialInstructions: 'Zusätzliche Anleitung für die KI, wie geantwortet werden soll...'
  },
  tone: {
    professional: 'Professionell',
    friendly: 'Freundlich',
    casual: 'Locker',
    luxury: 'Luxuriös',
  },
  types: {
    restaurant: 'Restaurant',
    cafe: 'Café',
    retail_store: 'Einzelhandelsgeschäft',
    beauty_salon: 'Schönheitssalon',
    medical_clinic: 'Klinik',
    fitness_gym: 'Fitnessstudio',
    hotel: 'Hotel',
    automotive: 'Automobil',
    technology: 'Technologie',
    consulting: 'Beratung',
    education: 'Bildung',
    real_estate: 'Immobilien',
    entertainment: 'Unterhaltung',
    other: 'Andere'
  },
  buttons: {
    cancel: 'Abbrechen',
    save: 'Speichern',
    saving: 'Speichern...',
    dontShowAgain: 'Nicht mehr anzeigen',
  },
  toasts: {
    errorTitle: 'Fehlende Informationen',
    errorMissingFields: 'Bitte füllen Sie die Pflichtfelder aus.',
    savedTitle: 'Gespeichert',
    savedDesc: 'Ihr Unternehmensprofil wurde erfolgreich gespeichert.',
    errorSaveDesc: 'Das Unternehmensprofil konnte nicht gespeichert werden. Bitte erneut versuchen.'
  }
};

(translations as any).ar.businessSetup = {
  title: 'إعداد العمل',
  description: 'أخبرنا عن عملك لنخصص ردود الذكاء الاصطناعي.',
  fields: {
    businessName: 'اسم العمل',
    businessType: 'نوع العمل',
    description: 'وصف العمل',
    targetAudience: 'الجمهور المستهدف',
    tone: 'نبرة الرد',
    specialInstructions: 'تعليمات خاصة للذكاء الاصطناعي',
  },
  placeholders: {
    businessName: 'مثال: كافيه أرومي',
    businessType: 'اختر نوع العمل',
    description: 'صف باختصار ما يقدمه عملك...',
    targetAudience: 'العائلات، الشباب، رجال الأعمال...',
    specialInstructions: 'إرشادات إضافية للذكاء الاصطناعي حول كيفية الرد...'
  },
  tone: {
    professional: 'احترافي',
    friendly: 'ودود',
    casual: 'غير رسمي',
    luxury: 'فاخر',
  },
  types: {
    restaurant: 'مطعم',
    cafe: 'مقهى',
    retail_store: 'متجر بيع بالتجزئة',
    beauty_salon: 'صالون تجميل',
    medical_clinic: 'عيادة',
    fitness_gym: 'نادي رياضي',
    hotel: 'فندق',
    automotive: 'سيارات',
    technology: 'تقنية',
    consulting: 'استشارات',
    education: 'تعليم',
    real_estate: 'عقارات',
    entertainment: 'ترفيه',
    other: 'أخرى'
  },
  buttons: {
    cancel: 'إلغاء',
    save: 'حفظ',
    saving: 'جارٍ الحفظ...',
    dontShowAgain: 'عدم الإظهار مرة أخرى',
  },
  toasts: {
    errorTitle: 'معلومات ناقصة',
    errorMissingFields: 'يرجى تعبئة الحقول المطلوبة.',
    savedTitle: 'تم الحفظ',
    savedDesc: 'تم حفظ ملف عملك بنجاح.',
    errorSaveDesc: 'تعذر حفظ ملف العمل. يرجى المحاولة مرة أخرى.'
  }
};

(translations as any).ru.businessSetup = {
  title: 'Настройка бизнеса',
  description: 'Расскажите о вашем бизнесе, чтобы персонализировать ответы ИИ.',
  fields: {
    businessName: 'Название компании',
    businessType: 'Тип бизнеса',
    description: 'Описание бизнеса',
    targetAudience: 'Целевая аудитория',
    tone: 'Тон ответа',
    specialInstructions: 'Особые инструкции для ИИ',
  },
  placeholders: {
    businessName: 'например, Cafe Aroma',
    businessType: 'Выберите тип бизнеса',
    description: 'Кратко опишите, что предлагает ваш бизнес...',
    targetAudience: 'Семьи, молодые люди, бизнес-аудитория...',
    specialInstructions: 'Дополнительные указания для ИИ по стилю ответов...'
  },
  tone: {
    professional: 'Профессиональный',
    friendly: 'Дружелюбный',
    casual: 'Неформальный',
    luxury: 'Премиальный',
  },
  types: {
    restaurant: 'Ресторан',
    cafe: 'Кафе',
    retail_store: 'Розничный магазин',
    beauty_salon: 'Салон красоты',
    medical_clinic: 'Клиника',
    fitness_gym: 'Фитнес / Зал',
    hotel: 'Отель',
    automotive: 'Авто',
    technology: 'Технологии',
    consulting: 'Консалтинг',
    education: 'Образование',
    real_estate: 'Недвижимость',
    entertainment: 'Развлечения',
    other: 'Другое'
  },
  buttons: {
    cancel: 'Отмена',
    save: 'Сохранить',
    saving: 'Сохранение...',
    dontShowAgain: 'Больше не показывать',
  },
  toasts: {
    errorTitle: 'Отсутствуют данные',
    errorMissingFields: 'Пожалуйста, заполните обязательные поля.',
    savedTitle: 'Сохранено',
    savedDesc: 'Профиль вашего бизнеса успешно сохранен.',
    errorSaveDesc: 'Не удалось сохранить профиль. Попробуйте еще раз.'
  }
};

// Translation context to share language across the app
interface TranslationContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const fallbackTranslate = (lang: Language, key: string): string => {
  const keys = key.split('.');
  let value: any = (enhancedTranslations as any)[lang];
  for (const k of keys) value = value?.[k];
  if (typeof value === 'string') return value;
  // fallback to English
  value = (enhancedTranslations as any).en;
  for (const k of keys) value = value?.[k];
  return typeof value === 'string' ? value : key;
};

const TranslationContext = createContext<TranslationContextValue>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => fallbackTranslate(defaultLanguage, key)
});

export const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || defaultLanguage;
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', language === 'he' || language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  const t = useCallback((key: string) => fallbackTranslate(language, key), [language]);

  return React.createElement(
    TranslationContext.Provider,
    { value: { language, setLanguage, t } },
    children
  );
};

// Add error messages and platform messages to translations
const addErrorMessages = (translations: any) => {
  const errorMessages = {
    errors: {
      connectionCheck: {
        he: 'שגיאה בבדיקת חיבורים',
        en: 'Error checking connections',
        es: 'Error al verificar conexiones',
        fr: 'Erreur lors de la vérification des connexions',
        ar: 'خطأ في فحص الاتصالات',
        de: 'Fehler beim Überprüfen der Verbindungen'
      },
      notLoggedIn: {
        he: 'יש להתחבר למערכת',
        en: 'Please log in to the system',
        es: 'Por favor inicie sesión en el sistema',
        fr: 'Veuillez vous connecter au système',
        ar: 'يرجى تسجيل الدخول إلى النظام',
        de: 'Bitte melden Sie sich im System an'
      },
      connectionFailed: {
        he: 'החיבור נכשל',
        en: 'Connection failed',
        es: 'Conexión fallida',
        fr: 'Connexion échouée',
        ar: 'فشل الاتصال',
        de: 'Verbindung fehlgeschlagen'
      },
      disconnectionFailed: {
        he: 'ניתוק נכשל',
        en: 'Disconnection failed',
        es: 'Desconexión fallida',
        fr: 'Déconnexion échouée',
        ar: 'فشل قطع الاتصال',
        de: 'Trennung fehlgeschlagen'
      },
      businessFetchFailed: {
        he: 'שגיאה בשליפת העסקים',
        en: 'Failed to fetch businesses',
        es: 'Error al obtener negocios',
        fr: 'Erreur lors de la récupération des entreprises',
        ar: 'فشل في جلب الأعمال',
        de: 'Fehler beim Abrufen der Unternehmen'
      },
      businessSelectionFailed: {
        he: 'שגיאה בבחירת העסק',
        en: 'Failed to select business',
        es: 'Error al seleccionar negocio',
        fr: 'Erreur lors de la sélection de l\'entreprise',
        ar: 'فشل في اختيار العمل',
        de: 'Fehler bei der Auswahl des Unternehmens'
      }
    },
    platforms: {
      connected: {
        he: 'פלטפורמה מחוברת בהצלחה',
        en: 'Platform connected successfully',
        es: 'Plataforma conectada exitosamente',
        fr: 'Plateforme connectée avec succès',
        ar: 'تم ربط المنصة بنجاح',
        de: 'Plattform erfolgreich verbunden'
      },
      disconnected: {
        he: 'פלטפורמה נותקה בהצלחה',
        en: 'Platform disconnected successfully',
        es: 'Plataforma desconectada exitosamente',
        fr: 'Plateforme déconnectée avec succès',
        ar: 'تم قطع اتصال المنصة بنجاح',
        de: 'Plattform erfolgreich getrennt'
      },
      businessSelected: {
        he: 'העסק נבחר בהצלחה',
        en: 'Business selected successfully',
        es: 'Negocio seleccionado exitosamente',
        fr: 'Entreprise sélectionnée avec succès',
        ar: 'تم اختيار العمل بنجاح',
        de: 'Unternehmen erfolgreich ausgewählt'
      }
    }
  };

  // Add error messages to each language
  Object.keys(translations).forEach(lang => {
    if (translations[lang] && typeof translations[lang] === 'object') {
      translations[lang] = { ...translations[lang], ...errorMessages };
    }
  });

  return translations;
};

// Apply error messages to existing translations
const enhancedTranslations = addErrorMessages(translations);

export const useTranslation = () => useContext(TranslationContext);
