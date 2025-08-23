import { useState, useEffect } from 'react';

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

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || defaultLanguage;
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', language === 'he' || language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, language, setLanguage };
};