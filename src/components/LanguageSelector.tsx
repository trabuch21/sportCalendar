import React from 'react';
import { useI18n } from '../i18n/context';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuItem } from './ui/dropdown-menu';
import { ChevronDown, Globe } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage } = useI18n();

  const languageLabels = {
    es: { flag: '🇦🇷', label: 'Es' },
    en: { flag: '🇺🇸', label: 'En' },
  };

  const currentLanguage = languageLabels[language];

  return (
    <DropdownMenu
      trigger={
        <Button variant="outline" size="sm" className="gap-2">
          <span>{currentLanguage.flag} {currentLanguage.label}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      }
      align="right"
    >
      <DropdownMenuItem
        active={language === 'es'}
        onClick={() => {
          setLanguage('es');
        }}
      >
        <span className="mr-2 text-base">🇪🇸</span>
        <span>Español</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        active={language === 'en'}
        onClick={() => {
          setLanguage('en');
        }}
      >
        <span className="mr-2 text-base">🇬🇧</span>
        <span>English</span>
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
