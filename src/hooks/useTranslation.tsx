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
      },
      connected: 'מחובר',
      disconnected: 'לא מחובר',
      businessSelected: 'העסק נבחר בהצלחה',
      selectBusiness: 'בחר עסק',
      loadingBusinesses: 'טוען עסקים...',
      businessSelectionDescription: 'בחר את העסק שלך מהרשימה',
      chooseBusiness: 'בחר עסק',
      noBusinessesFound: 'לא נמצאו עסקים בחשבון זה'
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
    common: {
      error: 'שגיאה',
      saving: 'שומר...',
      save: 'שמור',
      cancel: 'ביטול',
      confirm: 'אישור',
      close: 'סגור'
    },
    dashboard: {
      title: 'לוח בקרה RevAI',
      subtitle: 'החלטות מהירות • ניתוח סנטימנטים',
      newReviews: 'ביקורות חדשות',
      newReviewsThisWeek: 'ביקורות חדשות השבוע',
      averageRating: 'דירוג ממוצע',
      pendingResponses: 'תגובות ממתינות',
      totalReviews: 'סה"כ ביקורות',
      totalCustomers: 'סה"כ לקוחות',
      responseRate: 'שיעור תגובה',
      sentiment: 'סנטימנט',
      sentimentDistribution: 'התפלגות סנטימנטים',
      reviews: 'ביקורות',
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
      responseWaitingApproval: 'התגובה ממתינה לאישור',
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
      sendResponse: 'שלח תגובה',
      pending: 'ממתין',
      generated: 'נוצר'
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
    reviews: {
      allReviews: 'כל הביקורות',
      bulkApprove: 'אישור קבוצתי',
      bulkSend: 'שליחה קבוצתית',
      searchReviews: 'חיפוש ביקורות',
      filterBySentiment: 'סינון לפי סנטימנט',
      filterByPlatform: 'סינון לפי פלטפורמה',
      filterByStatus: 'סינון לפי סטטוס',
      allSentiments: 'כל הסנטימנטים',
      allPlatforms: 'כל הפלטפורמות',
      allStatuses: 'כל הסטטוסים',
      moreFilters: 'מסננים נוספים',
      customer: 'לקוח',
      review: 'ביקורת',
      rating: 'דירוג',
      sentiment: 'סנטימנט',
      platform: 'פלטפורמה',
      date: 'תאריך',
      status: 'סטטוס',
      actions: 'פעולות',
      noReviewsFound: 'לא נמצאו ביקורות',
      tryDifferentFilters: 'נסה מסננים אחרים'
    },
    analytics: {
      sentimentTrend: 'מגמת סנטימנטים',
      platformComparison: 'השוואת פלטפורמות',
      keywordAnalysis: 'ניתוח מילות מפתח',
      responseTime: 'זמן תגובה',
      selectDateRange: 'בחר טווח תאריכים',
      exportData: 'ייצוא נתונים',
      totalReviews: 'סה"כ ביקורות',
      responseRate: 'שיעור תגובה',
      avgRating: 'דירוג ממוצע',
      avgResponseTime: 'זמן תגובה ממוצע',
      sentimentTrendOverTime: 'מגמת סנטימנטים לאורך זמן',
      topKeywords: 'מילות מפתח מובילות'
    },
    customers: {
      totalCustomers: 'סה"כ לקוחות',
      activeCustomers: 'לקוחות פעילים',
      avgRating: 'דירוג ממוצע',
      totalRevenue: 'סה"כ הכנסות',
      customerList: 'רשימת לקוחות',
      searchCustomers: 'חיפוש לקוחות',
      allCustomers: 'כל הלקוחות',
      activeOnly: 'פעילים בלבד',
      inactiveOnly: 'לא פעילים בלבד',
      name: 'שם',
      contact: 'יצירת קשר',
      reviews: 'ביקורות',
      rating: 'דירוג',
      lastReview: 'ביקורת אחרונה',
      spent: 'סכום שהוצא',
      status: 'סטטוס',
      tags: 'תגיות',
      active: 'פעיל',
      inactive: 'לא פעיל',
      noCustomersFound: 'לא נמצאו לקוחות'
    },
    platformConnection: {
      title: 'חיבורי פלטפורמות',
      description: 'חבר את פלטפורמות הביקורות לייבוא וניהול אוטומטי של ביקורות',
      connected: 'מחובר',
      disconnected: 'לא מחובר',
      reviews: 'ביקורות',
      manage: 'ניהול',
      connect: 'חיבור'
    },
    errors: {
      connectionCheck: 'נכשלה בדיקת החיבורים',
      businessFetchFailed: 'נכשלה טעינת עסקים',
      businessSelectionFailed: 'נכשלה בחירת העסק',
      notLoggedIn: 'עליך להתחבר',
      connectionFailed: 'התחברות נכשלה',
      disconnectionFailed: 'ניתוק נכשל'
    },
    aiInstructions: {
      title: 'הוראות ל-AI',
      description: 'הוסיפו הנחיות קצרות כדי להתאים את תגובת ה-AI לביקורת זו',
      fields: {
        instructions: 'הוראות'
      },
      placeholders: {
        instructions: 'לדוגמה: הדגש את זמני השירות המהירים, שמור על טון ידידותי ומקצועי'
      },
      helpText: 'ההוראות יישמרו יחד עם הביקורת וישמשו ליצירת תגובות מדויקות יותר',
      examples: {
        title: 'דוגמאות להוראות',
        list: 'הדגש שירות מהיר, הזכר אחריות מורחבת, בקש פרטים נוספים, הצע פנייה פרטית'
      },
      buttons: {
        cancel: 'ביטול',
        save: 'שמור',
        saving: 'שומר...'
      },
      toasts: {
        errorTitle: 'שגיאה',
        errorMissingInstructions: 'אנא הזן הוראות לפני השמירה',
        savedTitle: 'נשמר',
        savedDesc: 'ההוראות נשמרו בהצלחה',
        errorSaveDesc: 'שמירת ההוראות נכשלה, נסה שוב'
      }
    }
  },
  en: {
    nav: {
      features: 'Features',
      pricing: 'Pricing',
      customers: 'Customers',
      login: 'Login',
      signup: 'Get Started',
      openMenu: 'Open Menu'
    },
    hero: {
      title: 'Manage all your reviews',
      subtitle: 'in one place with AI',
      description: 'Connect automatically to Google, Facebook & Trustpilot. Smart analytics, automated responses and unified dashboard for all your reviews.',
      cta: 'Start Free Trial'
    },
    platforms: {
      google: {
        title: 'Google',
        subtitle: 'Quick integration',
        description: 'Seamless connection to Google reviews'
      },
      facebook: {
        title: 'Facebook',
        subtitle: 'Real-time AI analysis',
        description: 'Advanced insights and sentiments'
      },
      trustpilot: {
        title: 'Trustpilot',
        subtitle: 'Smart reports and insights',
        description: 'Improve your business with actionable data'
      },
      connected: 'Connected',
      disconnected: 'Not Connected',
      businessSelected: 'Business selected successfully',
      selectBusiness: 'Select Business',
      loadingBusinesses: 'Loading businesses...',
      businessSelectionDescription: 'Choose your business from the list',
      chooseBusiness: 'Choose business',
      noBusinessesFound: 'No businesses found for this account'
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
        description: 'AI-powered personalized response generation'
      },
      multilingual: {
        title: 'Multilingual Support',
        description: 'Full support for Hebrew, Arabic, English, Spanish, German and Russian'
      }
    },
    testimonial: {
      quote: 'Since implementation, we saw a 35% increase in customer satisfaction and significant improvement in our response times',
      author: 'John Doe',
      role: 'Marketing Manager, Tech Company'
    },
    pricing: {
      title: 'Choose the right plan for you',
      subtitle: 'From free to full business solution',
      plans: {
        free: {
          name: 'Free',
          price: '$0',
          features: [
            '5 responses per month',
            '1 platform',
            'Basic analytics',
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
            'Unlimited customers',
            'Team management',
            'Full API',
            'Dedicated account manager'
          ]
        }
      }
    },
    cta: {
      title: 'Ready to get started?',
      subtitle: 'Join thousands of businesses already improving their service',
      button: 'Start Free Trial'
    },
    common: {
      error: 'Error',
      saving: 'Saving...',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close'
    },
    dashboard: {
      title: 'RevAI Dashboard',
      subtitle: 'Quick decisions • Sentiment analysis',
      newReviews: 'New Reviews',
      newReviewsThisWeek: 'New Reviews This Week',
      averageRating: 'Average Rating',
      pendingResponses: 'Pending Responses',
      totalReviews: 'Total Reviews',
      totalCustomers: 'Total Customers',
      responseRate: 'Response Rate',
      sentiment: 'Sentiment',
      sentimentDistribution: 'Sentiment Distribution',
      reviews: 'Reviews',
      positive: 'Positive',
      negative: 'Negative',
      neutral: 'Neutral',
      connectPlatform: 'Connect Platform',
      settings: 'Settings',
      logout: 'Logout',
      waitingApproval: 'Waiting for Approval',
      processedResponses: 'Processed Responses',
      loading: 'Loading dashboard...',
      fromLastWeek: 'from last week',
      generateResponse: 'Generate Response',
      approveResponse: 'Approve Response',
      sendResponse: 'Send Response',
      manualResponse: 'Manual Response',
      aiInstructions: 'AI Instructions',
      regenerateResponse: 'Regenerate Response',
      filterBySentiment: 'Filter by Sentiment',
      filterByPlatform: 'Filter by Platform',
      searchReviews: 'Search Reviews',
      allPlatforms: 'All Platforms',
      allSentiments: 'All Sentiments',
      filterReviews: 'Filter Reviews',
      noNewReviews: 'No new reviews',
      noNewReviewsDesc: 'All new reviews will appear here',
      noWaitingReviews: 'No responses waiting for approval',
      noWaitingReviewsDesc: 'AI-generated responses awaiting approval will appear here',
      noProcessedReviews: 'No processed responses',
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
      waitingApproval: 'Waiting for Approval',
      generating: 'Generating...',
      manualResponse: 'Manual Response',
      aiResponse: 'AI Response',
      specialInstructions: 'with Special Instructions',
      responseGenerated: 'Response generated successfully',
      generatingResponse: 'Generating response...',
      generateAIResponse: 'Generate AI Response',
      aiWithInstructions: 'AI with Instructions',
      writeManualResponse: 'Manual Response',
      approveResponse: 'Approve Response',
      regenerateResponse: 'Generate New Response',
      sendResponse: 'Send Response',
      pending: 'Pending',
      generated: 'Generated'
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
      viewAllNotifications: "View all notifications",
      myAccount: "My Account",
      settings: "Settings",
      support: "Support",
      logout: "Logout"
    },
    reviews: {
      allReviews: 'All Reviews',
      bulkApprove: 'Bulk Approve',
      bulkSend: 'Bulk Send',
      searchReviews: 'Search Reviews',
      filterBySentiment: 'Filter by Sentiment',
      filterByPlatform: 'Filter by Platform',
      filterByStatus: 'Filter by Status',
      allSentiments: 'All Sentiments',
      allPlatforms: 'All Platforms',
      allStatuses: 'All Statuses',
      moreFilters: 'More Filters',
      customer: 'Customer',
      review: 'Review',
      rating: 'Rating',
      sentiment: 'Sentiment',
      platform: 'Platform',
      date: 'Date',
      status: 'Status',
      actions: 'Actions',
      noReviewsFound: 'No reviews found',
      tryDifferentFilters: 'Try different filters'
    },
    analytics: {
      sentimentTrend: 'Sentiment Trend',
      platformComparison: 'Platform Comparison',
      keywordAnalysis: 'Keyword Analysis',
      responseTime: 'Response Time',
      selectDateRange: 'Select Date Range',
      exportData: 'Export Data',
      totalReviews: 'Total Reviews',
      responseRate: 'Response Rate',
      avgRating: 'Average Rating',
      avgResponseTime: 'Average Response Time',
      sentimentTrendOverTime: 'Sentiment Trend Over Time',
      topKeywords: 'Top Keywords'
    },
    customers: {
      totalCustomers: 'Total Customers',
      activeCustomers: 'Active Customers',
      avgRating: 'Average Rating',
      totalRevenue: 'Total Revenue',
      customerList: 'Customer List',
      searchCustomers: 'Search Customers',
      allCustomers: 'All Customers',
      activeOnly: 'Active Only',
      inactiveOnly: 'Inactive Only',
      name: 'Name',
      contact: 'Contact',
      reviews: 'Reviews',
      rating: 'Rating',
      lastReview: 'Last Review',
      spent: 'Spent',
      status: 'Status',
      tags: 'Tags',
      active: 'Active',
      inactive: 'Inactive',
      noCustomersFound: 'No customers found'
    },
    platformConnection: {
      title: 'Platform Connections',
      description: 'Connect your review platforms for automatic import and management of reviews',
      connected: 'Connected',
      disconnected: 'Not Connected',
      reviews: 'reviews',
      manage: 'Manage',
      connect: 'Connect'
    },
    errors: {
      connectionCheck: 'Failed to check connections',
      businessFetchFailed: 'Failed to load businesses',
      businessSelectionFailed: 'Failed to select business',
      notLoggedIn: 'You must be logged in',
      connectionFailed: 'Connection failed',
      disconnectionFailed: 'Disconnection failed'
    },
    aiInstructions: {
      title: 'AI Instructions',
      description: 'Add short instructions to tailor the AI response for this review',
      fields: {
        instructions: 'Instructions'
      },
      placeholders: {
        instructions: 'Example: Emphasize fast service times, keep a friendly and professional tone'
      },
      helpText: 'Instructions will be saved with the review and used to generate more accurate responses',
      examples: {
        title: 'Instruction Examples',
        list: 'Emphasize quick service, Mention extended warranty, Ask for more details, Offer private follow‑up'
      },
      buttons: {
        cancel: 'Cancel',
        save: 'Save',
        saving: 'Saving...'
      },
      toasts: {
        errorTitle: 'Error',
        errorMissingInstructions: 'Please enter instructions before saving',
        savedTitle: 'Saved',
        savedDesc: 'Instructions saved successfully',
        errorSaveDesc: 'Failed to save instructions, please try again'
      }
    }
  }
};

interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'he';
  });

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
    document.documentElement.setAttribute('dir', newLanguage === 'he' || newLanguage === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLanguage);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    if (params) {
      return Object.entries(params).reduce((text, [param, val]) => {
        const regex = new RegExp('{{' + param + '}}', 'g');
        return text.replace(regex, String(val));
      }, value);
    }
    
    return value;
  }, [language]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'he' || language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};