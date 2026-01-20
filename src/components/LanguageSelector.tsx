import React from 'react';
import { useI18n } from '../i18n/context';
import { Button } from './ui/button';

export function LanguageSelector() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex gap-2">
      <Button
        variant={language === 'es' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('es')}
      >
        🇪🇸 ES
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('en')}
      >
        🇬🇧 EN
      </Button>
    </div>
  );
}
