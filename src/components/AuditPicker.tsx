import { useQuestionnaire } from '@/contexts/QuestionnaireContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { t } from '@/i18n/translations';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Card } from '@/components/ui/card';
import { Shield, Brain, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AuditPicker() {
  const { setAuditType } = useQuestionnaire();
  const { language } = useLanguage();

  const items = [
    {
      id: 'it' as const,
      icon: Shield,
      title: t('picker.it.title', language),
      desc: t('picker.it.desc', language),
      gradient: 'from-blue-500/20 to-indigo-600/10',
      iconColor: 'text-blue-600',
    },
    {
      id: 'ai' as const,
      icon: Brain,
      title: t('picker.ai.title', language),
      desc: t('picker.ai.desc', language),
      gradient: 'from-fuchsia-500/20 to-purple-600/10',
      iconColor: 'text-fuchsia-600',
    },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      <div className="text-center space-y-3 max-w-2xl">
        <h1 className="font-heading text-3xl md:text-4xl font-bold">{t('picker.title', language)}</h1>
        <p className="text-muted-foreground">{t('picker.subtitle', language)}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-4xl">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              onClick={() => setAuditType(item.id)}
              className={cn(
                'p-7 cursor-pointer group transition-all border-2 hover:border-primary hover:shadow-xl',
                'bg-gradient-to-br', item.gradient
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn('p-3 rounded-xl bg-background/80 shadow-sm', item.iconColor)}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="font-heading text-xl font-bold mb-2">{item.title}</h2>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-5 text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                {t('picker.start', language)} <ArrowRight className="w-4 h-4" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
