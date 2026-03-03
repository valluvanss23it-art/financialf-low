import { ExternalLink, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export interface NewsArticle {
  _id: string;
  title: string;
  description: string;
  content?: string;
  source: string;
  category: 'general' | 'india' | 'global' | 'tech' | 'banking' | 'crypto';
  imageUrl?: string;
  articleUrl?: string;
  publishedAt: string;
}

interface NewsCardProps {
  article: NewsArticle;
  onArticleClick?: (article: NewsArticle) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  general: { bg: 'bg-blue-100', text: 'text-blue-800' },
  india: { bg: 'bg-orange-100', text: 'text-orange-800' },
  global: { bg: 'bg-purple-100', text: 'text-purple-800' },
  tech: { bg: 'bg-green-100', text: 'text-green-800' },
  banking: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  crypto: { bg: 'bg-yellow-100', text: 'text-yellow-800' }
};

const getCategoryColor = (category: string) => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.general;
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Recently';
  }
};

export function NewsCard({ article, onArticleClick }: NewsCardProps) {
  const colors = getCategoryColor(article.category);
  
  const handleCardClick = () => {
    onArticleClick?.(article);
  };

  const handleArticleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (article.articleUrl) {
      window.open(article.articleUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      {article.imageUrl && (
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <Badge className={`${colors.bg} ${colors.text} border-0 flex-shrink-0`}>
            {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
          </Badge>
          <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
            {formatDate(article.publishedAt)}
          </span>
        </div>
        
        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </CardTitle>
        
        <CardDescription className="text-xs flex items-center gap-1 mt-2">
          <span className="inline-flex items-center">
            📰 {article.source}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {article.description || 'No description available'}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {article.articleUrl && (
            <Button
              variant="default"
              size="sm"
              className="flex-1 group/btn"
              onClick={handleArticleClick}
            >
              <ExternalLink className="w-4 h-4 mr-1 group-hover/btn:translate-x-0.5 transition-transform" />
              Read Full Article
            </Button>
          )}
          {!article.articleUrl && (
            <Button variant="outline" size="sm" disabled className="flex-1">
              <AlertCircle className="w-4 h-4 mr-1" />
              No Link Available
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
