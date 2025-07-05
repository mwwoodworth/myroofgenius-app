'use client';
import {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import en from '../../locales/en.json';
import es from '../../locales/es.json';

type Messages = typeof en;
const messagesMap: Record<string, Messages> = { en, es };

interface LocaleState {
  locale: string;
  messages: Messages;
  setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleState>({
  locale: 'en',
  messages: en,
  setLocale: () => {}
});

export function LocaleProvider({children}: {children: ReactNode}) {
  const [locale, setLocale] = useState('en');
  const messages = messagesMap[locale] || en;
  return (
    <LocaleContext.Provider value={{locale, messages, setLocale}}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function DocumentLang() {
  const {locale} = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);
  return null;
}
