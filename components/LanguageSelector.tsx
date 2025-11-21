
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  currentLang: Language;
  onChange: (lang: Language) => void;
  variant?: 'light' | 'dark';
}

const FLAGS: Record<Language, string> = {
  [Language.EN]: 'https://flagcdn.com/w40/gb.png',
  [Language.ZH_TW]: 'https://flagcdn.com/w40/tw.png',
  [Language.JA]: 'https://flagcdn.com/w40/jp.png',
  [Language.KO]: 'https://flagcdn.com/w40/kr.png',
};

const LABELS: Record<Language, string> = {
  [Language.EN]: 'English',
  [Language.ZH_TW]: '繁體中文',
  [Language.JA]: '日本語',
  [Language.KO]: '한국어',
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLang, onChange, variant = 'light' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buttonClasses = variant === 'dark' 
    ? "bg-green-800 text-white border-green-600 hover:bg-green-900" 
    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all border shadow-sm ${buttonClasses}`}
      >
        <img 
            src={FLAGS[currentLang]} 
            alt={LABELS[currentLang]} 
            className="w-5 h-3.5 object-cover rounded-sm shadow-sm" 
        />
        <span className="hidden sm:inline">{LABELS[currentLang]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
          {(Object.keys(FLAGS) as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                onChange(lang);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors ${currentLang === lang ? 'bg-green-50 text-green-700 font-bold' : 'text-slate-700'}`}
            >
              <img 
                src={FLAGS[lang]} 
                alt={LABELS[lang]} 
                className="w-5 h-3.5 object-cover rounded-sm shadow-sm" 
              />
              <span className="text-sm">{LABELS[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
