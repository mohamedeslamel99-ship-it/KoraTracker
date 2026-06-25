import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "KoraTracker": "KoraTracker",
      "Home": "Home",
      "Leagues": "Leagues",
      "Fantasy Hub": "Fantasy Hub",
      "switch_lang": "عربي",
      "heroTitle": "AI Analytics for Your Squad",
      "masterSquad": "Master Your Fantasy Squad",
      "quickAdd": "Quick Add",
      "starOfTheWeek": "Star of the Week",
      "launchHub": "Launch Fantasy Hub"
    }
  },
  ar: {
    translation: {
      "KoraTracker": "كورة تراكير",
      "Home": "الرئيسية",
      "Leagues": "الدوريات",
      "Fantasy Hub": "فانتسي هاب",
      "switch_lang": "English",
      "heroTitle": "حلل تشكيلتك بالذكاء الاصطناعي",
      "masterSquad": "تحكم في تشكيلتك",
      "quickAdd": "إضافة سريعة",
      "starOfTheWeek": "نجم الجولة",
      "launchHub": "ابدأ التحليل الآن"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;