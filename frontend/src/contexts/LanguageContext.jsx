import React, { createContext, useContext, useState, useEffect } from 'react'

// Translation data
const translations = {
  en: {
    'site.home': 'Home',
    'site.browse': 'Browse',
    'site.ebooks': 'Ebooks',
    'site.audiobooks': 'Audiobooks',
    'site.paperbacks': 'Paperbacks',
    'site.authors': 'Authors',
    'site.profile': 'Profile',
    'site.orders': 'Orders',
    'site.wishlist': 'Wishlist',
    'site.library': 'Library',
    'site.subscriptions': 'Subscriptions',
    'site.searchPlaceholder': 'Search books, authors, categories, formats',
    'site.search': 'Search',
    'site.signIn': 'Sign in',
    'site.cart': 'Cart',
    'site.logout': 'Logout',
    'brand.name': 'BookSphere',
    'brand.tagline': 'Digital bookstore',
    'language.english': 'English',
    'language.hindi': 'हिंदी',
    'language.tamil': 'தமிழ்',
    'language.telugu': 'తెలుగు',
  },
  hi: {
    'site.home': 'होम',
    'site.browse': 'ब्राउज़ करें',
    'site.ebooks': 'ई-बुक्स',
    'site.audiobooks': 'ऑडियोबुक्स',
    'site.paperbacks': 'पेपरबैक',
    'site.authors': 'लेखक',
    'site.profile': 'प्रोफाइल',
    'site.orders': 'ऑर्डर',
    'site.wishlist': 'इच्छा सूची',
    'site.library': 'लाइब्रेरी',
    'site.subscriptions': 'सदस्यता',
    'site.searchPlaceholder': 'पुस्तकें, लेखक, श्रेणियां, प्रारूप खोजें',
    'site.search': 'खोजें',
    'site.signIn': 'साइन इन करें',
    'site.cart': 'कार्ट',
    'site.logout': 'लॉगआउट',
    'brand.name': 'बुकस्फीयर',
    'brand.tagline': 'डिजिटल बुकस्टोर',
    'language.english': 'English',
    'language.hindi': 'हिंदी',
    'language.tamil': 'தமிழ்',
    'language.telugu': 'తెలుగు',
  },
  ta: {
    'site.home': 'முகப்பு',
    'site.browse': 'உலாவு',
    'site.ebooks': 'மின்புத்தகங்கள்',
    'site.audiobooks': 'ஆடியோ புத்தகங்கள்',
    'site.paperbacks': 'பேப்பர்பேக்குகள்',
    'site.authors': 'ஆசிரியர்கள்',
    'site.profile': 'சுயவிவரம்',
    'site.orders': 'ஆர்டர்கள்',
    'site.wishlist': 'விருப்பப்பட்டியல்',
    'site.library': 'நூலகம்',
    'site.subscriptions': 'சந்தாக்கள்',
    'site.searchPlaceholder': 'புத்தகங்கள், ஆசிரியர்கள், வகைகள், வடிவங்களைத் தேடுங்கள்',
    'site.search': 'தேடு',
    'site.signIn': 'உள்நுழைய',
    'site.cart': 'கார்ட்',
    'site.logout': 'வெளியேறு',
    'brand.name': 'புக்ஸ்பியர்',
    'brand.tagline': 'டிஜிட்டல் புத்தகக் கடை',
    'language.english': 'English',
    'language.hindi': 'हिंदी',
    'language.tamil': 'தமிழ்',
    'language.telugu': 'తెలుగు',
  },
  te: {
    'site.home': 'హోమ్',
    'site.browse': 'బ్రౌజ్ చేయండి',
    'site.ebooks': 'ఇ-బుక్స్',
    'site.audiobooks': 'ఆడియో పుస్తకాలు',
    'site.paperbacks': 'పేపర్‌బ్యాక్‌లు',
    'site.authors': 'రచయితలు',
    'site.profile': 'ప్రొఫైల్',
    'site.orders': 'ఆర్డర్లు',
    'site.wishlist': 'కోరికల జాబితా',
    'site.library': 'లైబ్రరీ',
    'site.subscriptions': 'చందాలు',
    'site.searchPlaceholder': 'పుస్తకాలు, రచయితలు, వర్గాలు, ఫార్మాట్లను శోధించండి',
    'site.search': 'శోధించండి',
    'site.signIn': 'సైన్ ఇన్',
    'site.cart': 'కార్ట్',
    'site.logout': 'లాగ్అవుట్',
    'brand.name': 'బుక్‌స్ఫియర్',
    'brand.tagline': 'డిజిటల్ బుక్‌స్టోర్',
    'language.english': 'English',
    'language.hindi': 'हिंदी',
    'language.tamil': 'தமிழ்',
    'language.telugu': 'తెలుగు',
  }
}

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en'
  })

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key
  }

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
    document.documentElement.lang = newLanguage
  }

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
