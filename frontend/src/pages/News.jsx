import { useState } from 'react';
import { Newspaper, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewsCard } from '@/components/news/NewsCard';
import { NewsFilter } from '@/components/news/NewsFilter';
import { NewsList } from '@/components/news/NewsList';
import { useNews } from '@/hooks/useNews';
import { useToast } from '@/hooks/use-toast';

/**
 * Financial News Page
 * Displays daily financial news with category filtering and search
 */
export function News() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('news');
  
  // Use custom hook for news management
  const {
    articles,
    categories,
    selectedCategory,
    searchQuery,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    handleCategoryChange,
    handleSearch,
    loadMore,
    refreshFromAPI
  } = useNews({ initialCategory: 'general', pageSize: 20 });

  // Handle refresh with toast notification
  const handleRefresh = async () => {
    try {
      await refreshFromAPI();
      toast({
        title: 'Success',
        description: 'News feed refreshed successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to refresh news feed',
        variant: 'destructive'
      });
    }
  };

  // Handle article click (could open modal or detailed view)
  const handleArticleClick = (article: any) => {
    // You can customize this behavior - open modal, detailed view, etc.
    console.log('Article clicked:', article.title);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Financial News & Market Updates"
          description="Real-time financial news, market insights, and industry updates"
          icon={<Newspaper className="w-8 h-8" />}
        />

        {/* Market Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Article Count</p>
                  <p className="text-3xl font-bold text-green-700 mt-1">
                    {articles.length > 0 ? articles.length : 'Loading'}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Category Filter</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">
                    {categories.find(c => c.id === selectedCategory)?.label || 'All'}
                  </p>
                </div>
                <Newspaper className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-lg font-bold text-purple-700 mt-1">
                    {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <RefreshCw className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="news">News Feed</TabsTrigger>
            <TabsTrigger value="about">About News</TabsTrigger>
          </TabsList>

          {/* NEWS TAB */}
          <TabsContent value="news" className="space-y-6">
            {/* Filter Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5" />
                  Filter News
                </CardTitle>
                <CardDescription>
                  Search and filter financial news by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewsFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                  onSearch={handleSearch}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            {/* Refresh Button */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Latest Articles</h3>
                <p className="text-sm text-muted-foreground">
                  {articles.length} articles found {searchQuery && `for "${searchQuery}"`}
                </p>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
              </Button>
            </div>

            {/* News List */}
            <NewsList
              articles={articles}
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              error={error}
              onRefresh={handleRefresh}
              onArticleClick={handleArticleClick}
              hasMore={hasMore}
              onLoadMore={loadMore}
            />
          </TabsContent>

          {/* ABOUT TAB */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Financial News</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">📰 What's Included</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Real-time financial news and market updates</li>
                    <li>✓ Stock market indices (NIFTY, SENSEX)</li>
                    <li>✓ Technology and IT sector news</li>
                    <li>✓ Banking and financial services updates</li>
                    <li>✓ Cryptocurrency and crypto market news</li>
                    <li>✓ Global economic and market trends</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🏷️ Categories</h4>
                  <div className="space-y-2 text-sm">
                    {categories.map((cat) => (
                      <div key={cat.id} className="p-2 bg-slate-50 rounded-lg">
                        <p className="font-medium text-sm">{cat.label}</p>
                        {cat.keywords && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Keywords: {cat.keywords.slice(0, 3).join(', ')}{cat.keywords.length > 3 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">⚙️ Features</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Search by keywords and titles</li>
                    <li>✓ Filter by category (India, Global, Tech, Banking, Crypto)</li>
                    <li>✓ Sort by latest news first</li>
                    <li>✓ Click to read full article on source site</li>
                    <li>✓ Regular automatic updates</li>
                    <li>✓ Mobile-friendly responsive design</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">📊 Data Sources</h4>
                  <p className="text-sm text-muted-foreground">
                    News articles are fetched from NewsAPI.org, aggregating content from 50,000+ sources worldwide. 
                    Articles are updated every hour automatically.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Last updated: {new Date().toLocaleString('en-IN')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center py-6 border-t">
          <p className="text-xs text-muted-foreground">
            💡 Tip: Use the search bar to find news about specific topics, or select a category to filter content
          </p>
        </div>
      </div>
    </Layout>
  );
}


interface NewsArticle {
  _id: string;
  title: string;
  description: string;
  content?: string;
  source: string;
  category: 'market' | 'economy' | 'stocks' | 'crypto' | 'commodities' | 'general';
  imageUrl?: string;
  articleUrl?: string;
  publishedAt: string;
}

interface NewsResponse {
  success: boolean;
  data: NewsArticle[];
  pagination?: {
    total: number;
    limit: number;
    skip: number;
  };
}
