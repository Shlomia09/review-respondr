import * as React from 'react';

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
    notifications: {
      newReview: "ביקורת חדשה",
      newReviewMessage: "קיבלת ביקורת חדשה שדורשת תשומת לב",
      lowRating: "דירוג נמוך",
      lowRatingMessage: "קיבלת ביקורת עם דירוג נמוך שדורש טיפול",
      aiResponse: "תגובת AI",
      aiResponseMessage: "תגובה אוטומטית נוצרה והועלתה בהצלחה"
    },
    reviews: {
      allReviews: 'כל הביקורות',
      bulkApprove: 'אישור קבוצתי',
      bulkSend: 'שליחה קבוצתית',
      searchReviews: 'חיפוש ביקורות',
      filterBySentiment: 'סינון לפי סנטימנט',
      filterByPlatform: 'סינון לפי פלטפורמה',
      filterByStatus: 'סינון לפי סטטוס',
      filterByBusiness: 'סינון לפי חשבון',
      allSentiments: 'כל הסנטימנטים',
      allPlatforms: 'כל הפלטפורמות',
      allStatuses: 'כל הסטטוסים',
      allBusinesses: 'כל החשבונות',
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
      tryDifferentFilters: 'נסה מסננים אחרים',
      reviewDetails: 'פרטי ביקורת',
      viewReviewDescription: 'צפייה בפרטי הביקורת המלאים',
      business: 'עסק',
      reviewContent: 'תוכן הביקורת',
      response: 'תגובה',
      manualResponse: 'תגובה ידנית',
      success: 'הצלחה',
      responseSaved: 'התגובה נשמרה בהצלחה',
      failedSaveResponse: 'שמירת התגובה נכשלה',
      deleteSuccess: 'הביקורת נמחקה בהצלחה',
      deleteError: 'מחיקת הביקורת נכשלה',
      generateAIResponse: 'יצירת תגובת AI',
      sendResponse: 'שליחת תגובה',
      viewReview: 'צפייה בביקורת',
      editResponse: 'עריכת תגובה',
      delete: 'מחיקה',
      aiResponseGenerated: 'תגובת AI נוצרה בהצלחה',
      aiResponseFailed: 'יצירת תגובת AI נכשלה',
      responseSentSuccess: 'התגובה נשלחה בהצלחה',
      responseSentFailed: 'שליחת התגובה נכשלה',
      bulkGenerateAI: 'יצירת תגובות AI',
      bulkAIGenerated: 'תגובות AI נוצרו בהצלחה',
      requiresAttention: 'דורש טיפול ידני',
      facebookReplyRequired: 'נדרשת תגובה בפייסבוק',
      facebookReplyDescription: 'המלצות פייסבוק ניתן להשיב עליהן רק ידנית דרך מנהל הדפים בפייסבוק. לחץ על הכפתור כדי לפתוח את לשונית הביקורות ולפרסם את תגובתך.',
      openInFacebook: 'פתח בפייסבוק',
      priority: {
        low: 'נמוך',
        medium: 'בינוני',
        high: 'גבוה',
        urgent: 'דחוף'
      }
    },
    manualResponse: {
      title: 'כתיבת תגובה ידנית',
      description: 'כתוב תגובה מותאמת אישית לביקורת זו',
      fields: {
        response: 'תגובה'
      },
      placeholders: {
        response: 'כתוב את תגובתך כאן...'
      },
      helpText: 'התגובה תישמר ותסומן כממתינה לאישור',
      buttons: {
        cancel: 'ביטול',
        save: 'שמור',
        saving: 'שומר...'
      },
      toasts: {
        errorTitle: 'שגיאה',
        errorMissingResponse: 'אנא כתוב תגובה לפני השמירה',
        savedTitle: 'נשמר בהצלחה',
        savedDesc: 'התגובה הידנית נשמרה בהצלחה',
        errorSaveDesc: 'שגיאה בשמירת התגובה'
      }
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
      connect: 'חיבור',
      disconnect: 'ניתוק',
      sync: 'סנכרן',
      syncing: 'מסנכרן ביקורות...',
      syncSuccess: 'סונכרנו ביקורות חדשות:',
      syncFailed: 'נכשל בסנכרון ביקורות',
      connectedPage: 'דף מחובר',
      selectPageFirst: 'אנא בחר דף לפני הסנכרון',
      connectedAccounts: 'חשבונות מחוברים',
      addAccount: 'הוסף חשבון',
      syncAll: 'סנכרן הכל',
      syncingAll: 'מסנכרן את כל החשבונות...',
      lastSync: 'סנכרון אחרון',
      total: 'סה״כ',
      disconnectTitle: 'ניתוק חשבון',
      disconnectSubtitle: 'אתה עומד לנתק את החשבון',
      reviewsWillBeAffected: 'לחשבון זה יש ביקורות במערכת. מה ברצונך לעשות איתן?',
      keepReviews: 'נתק ושמור ביקורות',
      keepReviewsDesc: 'הביקורות ישארו במערכת, רק החיבור ינותק',
      deleteReviews: 'נתק ומחק ביקורות',
      deleteReviewsDesc: 'ימחק לצמיתות את כל הביקורות של חשבון זה'
    },
    errors: {
      connectionCheck: 'נכשלה בדיקת החיבורים',
      businessFetchFailed: 'נכשלה טעינת עסקים',
      businessSelectionFailed: 'נכשלה בחירת העסק',
      notLoggedIn: 'עליך להתחבר',
      connectionFailed: 'התחברות נכשלה',
      disconnectionFailed: 'ניתוק נכשל',
      platformNotSupported: 'פלטפורמה לא נתמכת'
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
    },
    settings: {
      businessProfile: 'פרופיל עסקי',
      notifications: 'התראות',
      privacy: 'פרטיות',
      preferences: 'העדפות',
      businessName: 'שם העסק',
      businessType: 'סוג העסק',
      businessDescription: 'תיאור העסק',
      targetAudience: 'קהל יעד',
      businessTone: 'טון העסק',
      specialInstructions: 'הוראות מיוחדות',
      enterBusinessName: 'הזן שם העסק',
      selectBusinessType: 'בחר סוג עסק',
      describeYourBusiness: 'תאר את העסק שלך',
      describeTargetAudience: 'תאר את קהל היעד שלך',
      specialInstructionsPlaceholder: 'הוראות מיוחדות לתגובות AI (אופציונלי)',
      restaurant: 'מסעדה',
      retail: 'קמעונאות',
      service: 'שירותים',
      healthcare: 'בריאות',
      hospitality: 'אירוח',
      other: 'אחר',
      professional: 'מקצועי',
      friendly: 'ידידותי',
      casual: 'רגיל',
      formal: 'רשמי',
      profileSaved: 'פרופיל נשמר',
      settingsSaved: 'הגדרות נשמרו',
      notificationSettings: 'הגדרות התראות',
      emailNotifications: 'התראות אימייל',
      emailNotificationsDesc: 'קבל התראות על ביקורות חדשות באימייל',
      browserNotifications: 'התראות דפדפן',
      browserNotificationsDesc: 'קבל התראות בדפדפן על פעילות חדשה',
      reviewNotifications: 'התראות ביקורות',
      reviewNotificationsDesc: 'התראות על ביקורות חדשות הדורשות תשומת לב',
      privacySettings: 'הגדרות פרטיות',
      profileVisibility: 'נראות פרופיל',
      profileVisibilityDesc: 'הפוך את הפרופיל שלך לגלוי למשתמשים אחרים',
      dataSharing: 'שיתוף נתונים',
      dataSharingDesc: 'שתף נתונים אנונימיים לשיפור השירות',
      userPreferences: 'העדפות משתמש',
      language: 'שפה',
      timezone: 'איזור זמן',
      theme: 'ערכת נושא',
      selectLanguage: 'בחר שפה',
      selectTimezone: 'בחר איזור זמן',
      selectTheme: 'בחר ערכת נושא',
      light: 'בהיר',
      dark: 'כהה',
      system: 'מערכת'
    },
    aiResponses: {
      minutes: 'דקות',
      minute: 'דקה',
      hours: 'שעות',
      totalAIResponses: 'סה"כ תגובות AI',
      autoResponseRate: 'שיעור תגובה אוטומטית',
      ofAllReviews: 'מכל הביקורות',
      averageResponseTime: 'זמן תגובה ממוצע',
      fasterThanManual: 'מהר יותר מידני',
      responseAccuracy: 'דיוק תגובות',
      customerSatisfaction: 'שביעות רצון לקוחות',
      responseTimeBreakdown: 'פירוט זמני תגובה',
      immediate: 'מיידי',
      fast: 'מהיר',
      moderate: 'בינוני',
      slow: 'איטי',
      sentimentImpact: 'השפעת סנטימנט',
      sentimentImprovementDesc: 'תגובות AI משפרות את הסנטימנט הכולל',
      templateLibrary: 'ספריית תבניות',
      templateLibraryDesc: 'נהל ועדכן תבניות תגובות AI',
      createTemplate: 'צור תבנית חדשה',
      filterByCategory: 'סינון לפי קטגוריה',
      allCategories: 'כל הקטגוריות',
      positive: 'חיובי',
      negative: 'שלילי',
      neutral: 'נייטרלי',
      requestDetails: 'בקשת פרטים',
      filterByTone: 'סינון לפי טון',
      allTones: 'כל הטונים',
      professional: 'מקצועי',
      warm: 'חם',
      friendly: 'ידידותי',
      short: 'קצר',
      default: 'ברירת מחדל',
      uses: 'שימושים',
      copy: 'העתק',
      editTemplate: 'עריכת תבנית'
    },
    socialHub: {
      contentGenerator: 'יוצר תוכן',
      calendar: 'יומן',
      contentIdeas: 'רעיונות תוכן',
      templates: 'תבניות',
      generateContent: 'יצירת תוכן',
      contentType: 'סוג תוכן',
      promotional: 'פרסומי',
      educational: 'חינוכי',
      behindScenes: 'מאחורי הקלעים',
      userGenerated: 'תוכן משתמשים',
      tone: 'טון',
      casual: 'רגיל',
      exciting: 'מרגש',
      targetPlatform: 'פלטפורמת יעד',
      allPlatforms: 'כל הפלטפורמות',
      customPrompt: 'הנחיה מותאמת',
      customPromptPlaceholder: 'תאר את התוכן שברצונך ליצור...',
      generating: 'יוצר...',
      generate: 'יצור',
      generatedContent: 'תוכן שנוצר',
      suggestedHashtags: 'האשטגים מומלצים',
      imagesuggestion: 'הצעת תמונה',
      generateContentPrompt: 'לחץ על הכפתור כדי ליצור תוכן חברתי',
      useThisIdea: 'השתמש ברעיון זה',
      templatesComingSoon: 'תבניות יגיעו בקרוב',
      monthView: 'תצוגת חודש',
      weekView: 'תצוגת שבוע',
      listView: 'תצוגת רשימה',
      filterByPlatform: 'סינון לפי פלטפורמה',
      schedulePost: 'תזמון פוסט',
      scheduledPosts: 'פוסטים מתוזמנים',
      today: 'היום',
      totalPosts: 'סה"כ פוסטים',
      scheduled: 'מתוזמן',
      drafts: 'טיוטות',
      totalLikes: 'סה"כ לייקים',
      draft: 'טיוטה',
      published: 'פורסם',
      failed: 'נכשל'
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
    notifications: {
      newReview: "New Review",
      newReviewMessage: "You have received a new review that requires attention",
      lowRating: "Low Rating",
      lowRatingMessage: "You have received a review with a low rating that needs handling",
      aiResponse: "AI Response",
      aiResponseMessage: "An automated response has been generated and posted successfully"
    },
    reviews: {
      allReviews: 'All Reviews',
      bulkApprove: 'Bulk Approve',
      bulkSend: 'Bulk Send',
      searchReviews: 'Search Reviews',
      filterBySentiment: 'Filter by Sentiment',
      filterByPlatform: 'Filter by Platform',
      filterByStatus: 'Filter by Status',
      filterByBusiness: 'Filter by Account',
      allSentiments: 'All Sentiments',
      allPlatforms: 'All Platforms',
      allStatuses: 'All Statuses',
      allBusinesses: 'All Accounts',
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
      tryDifferentFilters: 'Try different filters',
      reviewDetails: 'Review Details',
      viewReviewDescription: 'View full review details',
      business: 'Business',
      reviewContent: 'Review Content',
      response: 'Response',
      manualResponse: 'Manual Response',
      success: 'Success',
      responseSaved: 'Response saved successfully',
      failedSaveResponse: 'Failed to save response',
      deleteSuccess: 'Review deleted successfully',
      deleteError: 'Failed to delete review',
      generateAIResponse: 'Generate AI Response',
      sendResponse: 'Send Response',
      viewReview: 'View Review',
      editResponse: 'Edit Response',
      delete: 'Delete',
      aiResponseGenerated: 'AI response generated successfully',
      aiResponseFailed: 'Failed to generate AI response',
      responseSentSuccess: 'Response sent successfully',
      responseSentFailed: 'Failed to send response',
      bulkGenerateAI: 'Generate AI Responses',
      bulkAIGenerated: 'AI responses generated successfully',
      requiresAttention: 'Requires Manual Attention',
      facebookReplyRequired: 'Reply Required on Facebook',
      facebookReplyDescription: 'Facebook Recommendations can only be replied to manually through the Facebook Page Manager. Click the button below to open the reviews tab and post your reply there.',
      openInFacebook: 'Open in Facebook',
      priority: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent'
      }
    },
    manualResponse: {
      title: 'Write Manual Response',
      description: 'Write a custom response to this review',
      fields: {
        response: 'Response'
      },
      placeholders: {
        response: 'Write your response here...'
      },
      helpText: 'The response will be saved and marked as pending approval',
      buttons: {
        cancel: 'Cancel',
        save: 'Save',
        saving: 'Saving...'
      },
      toasts: {
        errorTitle: 'Error',
        errorMissingResponse: 'Please write a response before saving',
        savedTitle: 'Saved Successfully',
        savedDesc: 'Manual response saved successfully',
        errorSaveDesc: 'Error saving response'
      }
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
      connect: 'Connect',
      disconnect: 'Disconnect',
      sync: 'Sync',
      syncing: 'Syncing reviews...',
      syncSuccess: 'Synced new reviews:',
      syncFailed: 'Failed to sync reviews',
      connectedPage: 'Connected page',
      selectPageFirst: 'Please select a page before syncing',
      connectedAccounts: 'Connected Accounts',
      addAccount: 'Add account',
      syncAll: 'Sync all',
      syncingAll: 'Syncing all accounts...',
      lastSync: 'Last sync',
      total: 'Total',
      disconnectTitle: 'Disconnect Account',
      disconnectSubtitle: 'You are about to disconnect this account',
      reviewsWillBeAffected: 'This account has reviews in the system. What would you like to do with them?',
      keepReviews: 'Disconnect & keep reviews',
      keepReviewsDesc: 'Reviews stay in the system, only the connection is removed',
      deleteReviews: 'Disconnect & delete reviews',
      deleteReviewsDesc: 'Permanently deletes all reviews from this account'
    },
    errors: {
      connectionCheck: 'Failed to check connections',
      businessFetchFailed: 'Failed to load businesses',
      businessSelectionFailed: 'Failed to select business',
      notLoggedIn: 'You must be logged in',
      connectionFailed: 'Connection failed',
      disconnectionFailed: 'Disconnection failed',
      platformNotSupported: 'Platform not supported'
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
    },
    settings: {
      businessProfile: 'Business Profile',
      notifications: 'Notifications',
      privacy: 'Privacy',
      preferences: 'Preferences',
      businessName: 'Business Name',
      businessType: 'Business Type',
      businessDescription: 'Business Description',
      targetAudience: 'Target Audience',
      businessTone: 'Business Tone',
      specialInstructions: 'Special Instructions',
      enterBusinessName: 'Enter business name',
      selectBusinessType: 'Select business type',
      describeYourBusiness: 'Describe your business',
      describeTargetAudience: 'Describe your target audience',
      specialInstructionsPlaceholder: 'Special instructions for AI responses (optional)',
      restaurant: 'Restaurant',
      retail: 'Retail',
      service: 'Service',
      healthcare: 'Healthcare',
      hospitality: 'Hospitality',
      other: 'Other',
      professional: 'Professional',
      friendly: 'Friendly',
      casual: 'Casual',
      formal: 'Formal',
      profileSaved: 'Profile Saved',
      settingsSaved: 'Settings Saved',
      notificationSettings: 'Notification Settings',
      emailNotifications: 'Email Notifications',
      emailNotificationsDesc: 'Receive email notifications about new reviews',
      browserNotifications: 'Browser Notifications',
      browserNotificationsDesc: 'Receive browser notifications about new activity',
      reviewNotifications: 'Review Notifications',
      reviewNotificationsDesc: 'Notifications about new reviews requiring attention',
      privacySettings: 'Privacy Settings',
      profileVisibility: 'Profile Visibility',
      profileVisibilityDesc: 'Make your profile visible to other users',
      dataSharing: 'Data Sharing',
      dataSharingDesc: 'Share anonymous data to improve the service',
      userPreferences: 'User Preferences',
      language: 'Language',
      timezone: 'Timezone',
      theme: 'Theme',
      selectLanguage: 'Select language',
      selectTimezone: 'Select timezone',
      selectTheme: 'Select theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System'
    },
    aiResponses: {
      minutes: 'minutes',
      minute: 'minute',
      hours: 'hours',
      totalAIResponses: 'Total AI Responses',
      autoResponseRate: 'Auto Response Rate',
      ofAllReviews: 'of all reviews',
      averageResponseTime: 'Average Response Time',
      fasterThanManual: 'faster than manual',
      responseAccuracy: 'Response Accuracy',
      customerSatisfaction: 'customer satisfaction',
      responseTimeBreakdown: 'Response Time Breakdown',
      immediate: 'Immediate',
      fast: 'Fast',
      moderate: 'Moderate',
      slow: 'Slow',
      sentimentImpact: 'Sentiment Impact',
      sentimentImprovementDesc: 'AI responses improve overall sentiment',
      templateLibrary: 'Template Library',
      templateLibraryDesc: 'Manage and update AI response templates',
      createTemplate: 'Create New Template',
      filterByCategory: 'Filter by Category',
      allCategories: 'All Categories',
      positive: 'Positive',
      negative: 'Negative',
      neutral: 'Neutral',
      requestDetails: 'Request Details',
      filterByTone: 'Filter by Tone',
      allTones: 'All Tones',
      professional: 'Professional',
      warm: 'Warm',
      friendly: 'Friendly',
      short: 'Short',
      default: 'Default',
      uses: 'uses',
      copy: 'Copy',
      editTemplate: 'Edit Template'
    },
    socialHub: {
      contentGenerator: 'Content Generator',
      calendar: 'Calendar',
      contentIdeas: 'Content Ideas',
      templates: 'Templates',
      generateContent: 'Generate Content',
      contentType: 'Content Type',
      promotional: 'Promotional',
      educational: 'Educational',
      behindScenes: 'Behind the Scenes',
      userGenerated: 'User Generated',
      tone: 'Tone',
      casual: 'Casual',
      exciting: 'Exciting',
      targetPlatform: 'Target Platform',
      allPlatforms: 'All Platforms',
      customPrompt: 'Custom Prompt',
      customPromptPlaceholder: 'Describe the content you want to create...',
      generating: 'Generating...',
      generate: 'Generate',
      generatedContent: 'Generated Content',
      suggestedHashtags: 'Suggested Hashtags',
      imagesuggestion: 'Image Suggestion',
      generateContentPrompt: 'Click the button to generate social content',
      useThisIdea: 'Use This Idea',
      templatesComingSoon: 'Templates coming soon',
      monthView: 'Month View',
      weekView: 'Week View',
      listView: 'List View',
      filterByPlatform: 'Filter by Platform',
      schedulePost: 'Schedule Post',
      scheduledPosts: 'Scheduled Posts',
      today: 'Today',
      totalPosts: 'Total Posts',
      scheduled: 'Scheduled',
      drafts: 'Drafts',
      totalLikes: 'Total Likes',
      draft: 'Draft',
      published: 'Published',
      failed: 'Failed'
    }
  }
};

interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const TranslationContext = React.createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const setLanguage = React.useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
    document.documentElement.setAttribute('dir', newLanguage === 'he' || newLanguage === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLanguage);
  }, []);

  const t = React.useCallback((key: string, params?: Record<string, string | number>): string => {
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

  React.useEffect(() => {
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
  const context = React.useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};