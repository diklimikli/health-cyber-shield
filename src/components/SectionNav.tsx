import { sections } from '@/data/questionnaireData';
import { useQuestionnaire } from '@/contexts/QuestionnaireContext';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle } from 'lucide-react';
import { questions } from '@/data/questionnaireData';

export function SectionNav() {
  const { currentSection, setCurrentSection, answers } = useQuestionnaire();

  return (
    <nav className="w-full overflow-x-auto">
      <div className="flex gap-1 p-1 bg-secondary rounded-lg min-w-max">
        {sections.map((section, idx) => {
          const sectionQuestions = questions.filter(q => q.sectionId === section.id);
          const answered = sectionQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '').length;
          const total = sectionQuestions.length;
          const isComplete = answered === total && total > 0;

          return (
            <button
              key={section.id}
              onClick={() => setCurrentSection(idx)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap',
                idx === currentSection
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {isComplete ? (
                <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span>{idx + 1}. {section.titleHu.split(' /')[0].split(' és')[0].substring(0, 20)}</span>
              <span className="text-[10px] opacity-60">{answered}/{total}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
