import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../i18n/context';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuItem } from './ui/dropdown-menu';
import { Moon, Sun, Monitor, ChevronDown, Palette } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { language } = useI18n();

  const themeLabels = {
    light: { 
      icon: Sun, 
      label: language === 'es' ? 'Claro' : 'Light',
      description: language === 'es' ? 'Modo claro' : 'Light mode'
    },
    dark: { 
      icon: Moon, 
      label: language === 'es' ? 'Oscuro' : 'Dark',
      description: language === 'es' ? 'Modo oscuro' : 'Dark mode'
    },
    system: { 
      icon: Monitor, 
      label: language === 'es' ? 'Sistema' : 'System',
      description: language === 'es' ? 'Seguir sistema' : 'Follow system'
    },
  };

  const currentTheme = themeLabels[theme];
  const CurrentIcon = currentTheme.icon;

  return (
    <DropdownMenu
      trigger={
        <Button variant="outline" size="sm" className="gap-2">
          <span>{currentTheme.label}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      }
      align="right"
    >
      <DropdownMenuItem
        active={theme === 'light'}
        onClick={() => {
          setTheme('light');
        }}
      >
        <Sun className="mr-2 h-4 w-4" />
        <div className="flex flex-col items-start">
          <span>{themeLabels.light.label}</span>
          <span className="text-xs text-muted-foreground">{themeLabels.light.description}</span>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem
        active={theme === 'dark'}
        onClick={() => {
          setTheme('dark');
        }}
      >
        <Moon className="mr-2 h-4 w-4" />
        <div className="flex flex-col items-start">
          <span>{themeLabels.dark.label}</span>
          <span className="text-xs text-muted-foreground">{themeLabels.dark.description}</span>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem
        active={theme === 'system'}
        onClick={() => {
          setTheme('system');
        }}
      >
        <Monitor className="mr-2 h-4 w-4" />
        <div className="flex flex-col items-start">
          <span>{themeLabels.system.label}</span>
          <span className="text-xs text-muted-foreground">{themeLabels.system.description}</span>
        </div>
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
