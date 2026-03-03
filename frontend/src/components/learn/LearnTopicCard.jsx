import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearnTopicCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  topics: string[];
  color: string;
  link?: string;
}

export function LearnTopicCard({
  icon,
  title,
  description,
  topics,
  color,
  link,
}: LearnTopicCardProps) {
  return (
    <div className="finance-card card-hover group">
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', color)}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <ul className="space-y-2 mb-4">
        {topics.slice(0, 4).map((topic, index) => (
          <li
            key={index}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <ChevronRight className="w-3 h-3 text-primary" />
            {topic}
          </li>
        ))}
      </ul>
      {link && (
        <Link
          to={link}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Explore
          <ExternalLink className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
