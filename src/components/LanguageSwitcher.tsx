import { Globe } from 'lucide-react';
import { useLanguage, type Language } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';

const flags: Record<Language, string> = { hu: '🇭🇺', ro: '🇷🇴', en: '🇬🇧' };

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
      {(['hu', 'ro', 'en'] as Language[]).map(lang => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={cn(
            'px-2.5 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1',
            language === lang
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span>{flags[lang]}</span>
          <span className="uppercase">{lang}</span>
        </button>
      ))}
    </div>
  );
}
