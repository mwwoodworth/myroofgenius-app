'use client';
import {useLocale} from '../src/context/LocaleContext';

export default function LanguageSwitcher() {
  const {locale, setLocale, messages} = useLocale();
  return (
    <div className="flex items-center space-x-2 text-sm">
      <span>{messages.language}:</span>
      {['en', 'es'].map(l => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-2 py-1 rounded ${locale === l ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
