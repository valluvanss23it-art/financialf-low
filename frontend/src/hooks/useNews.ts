import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import { NewsArticle } from '@/components/news/NewsCard';

export interface NewsResponse {
  success: boolean;
  data: NewsArticle[];
  pagination?: {
    total: number;
    limit: number;
    skip: number;
    pages: number;
  };
}

export interface CategoryOption {
  id: string;
  label: string;
  keywords?: string[];
}

interface UseNewsOptions {
  initialCategory?: string;
  pageSize?: number;
}

/**
 * Custom hook for managing news data, filtering, and pagination
 * Handles fetching from backend API with proper error handling
 */
export function useNews(options: UseNewsOptions = {}) {
  const { initialCategory = 'general', pageSize = 20 } = options;

  // State
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: pageSize,
    skip: 0,
    pages: 0
  });

  /**
   * Fetch available categories from API
   */
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/news/categories');
      if (response.data.success && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback categories
      setCategories([
        { id: 'general', label: 'General' },
        { id: 'india', label: 'India' },
        { id: 'global', label: 'Global' },
        { id: 'tech', label: 'Tech' },
        { id: 'banking', label: 'Banking' },
        { id: 'crypto', label: 'Crypto' }
      ]);
    }
  }, []);

  /**
   * Fetch news articles based on current filters
   */
  const fetchNews = useCallback(async (reset = false) => {
    try {
      setError(null);
      if (reset) {
        setIsLoading(true);
        setPagination(prev => ({ ...prev, skip: 0 }));
      } else {
        setIsRefreshing(true);
      }

      // Build query parameters
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      params.append('limit', pageSize.toString());
      params.append('skip', reset ? '0' : pagination.skip.toString());

      const response = await api.get<NewsResponse>(`/news?${params.toString()}`);

      if (response.data.success) {
        setArticles(reset ? response.data.data : [...articles, ...response.data.data]);
        
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        throw new Error('Failed to fetch news');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
                          err.message ||
                          'Failed to load news articles. Please try again.';
      setError(errorMessage);
      console.error('Error fetching news:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory, searchQuery, pagination.skip, articles, pageSize]);

  /**
   * Refresh news from external API
   */
  const refreshFromAPI = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('categories', selectedCategory);
      }

      const response = await api.post(`/news/refresh?${params.toString()}`);

      if (response.data.success) {
        // Fetch updated news
        await fetchNews(true);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
                          'Failed to refresh news from API';
      setError(errorMessage);
      console.error('Error refreshing news:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedCategory, fetchNews]);

  /**
   * Handle category change
   */
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setPagination(prev => ({ ...prev, skip: 0 }));
  }, []);

  /**
   * Handle search query change (debounced)
   */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, skip: 0 }));
  }, []);

  /**
   * Load more articles (pagination)
   */
  const loadMore = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      skip: prev.skip + prev.limit
    }));
  }, []);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    fetchCategories();
    fetchNews(true);
  }, []);

  /**
   * Refetch when filters change
   */
  useEffect(() => {
    if (selectedCategory !== 'all' || searchQuery) {
      fetchNews(true);
    }
  }, [selectedCategory, searchQuery]);

  /**
   * Load more articles when pagination skip changes
   */
  useEffect(() => {
    if (pagination.skip > 0) {
      fetchNews(false);
    }
  }, [pagination.skip]);

  return {
    // Data
    articles,
    categories,
    selectedCategory,
    searchQuery,
    pagination,
    
    // State
    isLoading,
    isRefreshing,
    error,
    hasMore: pagination.skip + pagination.limit < pagination.total,
    
    // Methods
    fetchNews,
    refreshFromAPI,
    handleCategoryChange,
    handleSearch,
    loadMore,
    setError
  };
}
