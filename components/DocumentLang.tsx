'use client';
import {useLocale} from '../src/context/LocaleContext';
import {useEffect} from 'react';

export default function DocumentLang() {
  const {locale} = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);
  return null;
}
