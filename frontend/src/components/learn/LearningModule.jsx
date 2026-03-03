import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Circle, Lightbulb, AlertTriangle, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LearningModuleProps {
  title: string;
  description: string;
  sections: {
    title: string;
    content: string;
    tips?: string[];
    mistakes?: string[];
    example?: string;
  }[];
  calculatorLink?: string;
}

export function LearningModule({
  title,
  description,
  sections,
  calculatorLink,
}: LearningModuleProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const markComplete = (index: number) => {
    if (completedSections.includes(index)) {
      setCompletedSections(completedSections.filter((i) => i !== index));
    } else {
      setCompletedSections([...completedSections, index]);
    }
  };

  const progress = Math.round((completedSections.length / sections.length) * 100);

  return (
    <div className="finance-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">{progress}%</span>
          <p className="text-xs text-muted-foreground">Complete</p>
        </div>
      </div>

      <div className="w-full h-2 bg-muted rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <div
            key={index}
            className={cn(
              'border rounded-lg overflow-hidden transition-colors',
              expandedSection === index ? 'border-primary/50' : 'border-border'
            )}
          >
            <button
              onClick={() => toggleSection(index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markComplete(index);
                  }}
                  className="flex-shrink-0"
                >
                  {completedSections.includes(index) ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                <span
                  className={cn(
                    'font-medium',
                    completedSections.includes(index) && 'text-muted-foreground line-through'
                  )}
                >
                  {section.title}
                </span>
              </div>
              {expandedSection === index ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {expandedSection === index && (
              <div className="px-4 pb-4 animate-fade-in">
                <div className="pl-8 space-y-4">
                  <p className="text-muted-foreground">{section.content}</p>

                  {section.example && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">📖 Example</p>
                      <p className="text-sm text-muted-foreground">{section.example}</p>
                    </div>
                  )}

                  {section.tips && section.tips.length > 0 && (
                    <div className="bg-success/10 rounded-lg p-4">
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-success" />
                        Pro Tips
                      </p>
                      <ul className="space-y-1">
                        {section.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            • {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.mistakes && section.mistakes.length > 0 && (
                    <div className="bg-destructive/10 rounded-lg p-4">
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        Common Mistakes
                      </p>
                      <ul className="space-y-1">
                        {section.mistakes.map((mistake, i) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            • {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {calculatorLink && (
        <div className="mt-6 pt-4 border-t border-border">
          <Button asChild variant="outline" className="w-full">
            <a href={calculatorLink}>
              <Calculator className="w-4 h-4 mr-2" />
              Try the Calculator
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
