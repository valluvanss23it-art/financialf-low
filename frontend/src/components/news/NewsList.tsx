import { NewsCard, NewsArticle } from './NewsCard';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface NewsListProps {
  articles: NewsArticle[];
  isLoading: boolean;
  isRefreshing: boolean;
  error?: string | null;
  onRefresh: () => void;
  onArticleClick?: (article: NewsArticle) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function NewsList({
  articles,
  isLoading,
  isRefreshing,
  error,
  onRefresh,
  onArticleClick,
  hasMore = false,
  onLoadMore
}: NewsListProps) {
  // Loading State
  if (isLoading && articles.length === 0) {
    return (
      <div className="space-y-4">
        {/* Loading Skeleton Cards */}
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-48 bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className="p-8 border-red-200 bg-red-50">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">Unable to Load News</h3>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <Button onClick={onRefresh} variant="outline" size="sm" className="text-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Empty State
  if (!isLoading && articles.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="space-y-4">
          <div className="text-4xl">📰</div>
          <h3 className="text-lg font-semibold">No News Found</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            We couldn't find any news articles matching your filters. Try adjusting your search or category selection.
          </p>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh News Feed
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <NewsCard
            key={article._id}
            article={article}
            onArticleClick={onArticleClick}
          />
        ))}
      </div>

      {/* Loading More Indicator */}
      {isRefreshing && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Refreshing news feed...
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-4">
          <Button onClick={onLoadMore} variant="outline">
            Load More Articles
          </Button>
        </div>
      )}

      {/* End of List */}
      {!hasMore && articles.length > 0 && (
        <div className="text-center py-4 text-xs text-muted-foreground">
          Showing all available articles ({articles.length} total)
        </div>
      )}
    </div>
  );
}
