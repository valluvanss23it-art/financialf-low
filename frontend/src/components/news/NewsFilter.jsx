import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface CategoryOption {
  id: string;
  label: string;
  keywords?: string[];
}

interface NewsFilterProps {
  categories: CategoryOption[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function NewsFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  onSearch,
  isLoading = false
}: NewsFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchTooltip, setShowSearchTooltip] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search news by title or keywords..."
              className="pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={isLoading}
              onFocus={() => setShowSearchTooltip(true)}
              onBlur={() => setShowSearchTooltip(false)}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Search Tooltip */}
        {showSearchTooltip && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-slate-900 text-white text-xs rounded whitespace-nowrap z-10">
            Search by article title or keywords
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            disabled={isLoading}
            className="transition-all"
            title={category.keywords ? `Keywords: ${category.keywords.join(', ')}` : ''}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Category Info */}
      {selectedCategory !== 'general' && (
        <div className="text-xs text-muted-foreground p-3 bg-slate-50 rounded-lg border">
          <strong>Category Filter:</strong> Showing news related to{' '}
          <span className="font-semibold">
            {categories.find((c) => c.id === selectedCategory)?.label}
          </span>
        </div>
      )}
    </div>
  );
}
