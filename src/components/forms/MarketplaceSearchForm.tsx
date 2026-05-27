import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MarketplaceSearchFormProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  difficultyFilter: string;
  setDifficulty: (difficulty: string) => void;
  familyOnly: boolean;
  setFamilyOnly: (familyOnly: boolean) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  minGroupSize: number;
  setMinGroupSize: (size: number) => void;
  maxDuration: number;
  setMaxDuration: (duration: number) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  clearAllFilters: () => void;
  backToDashboard: () => void;
}

export default function MarketplaceSearchForm({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
  difficultyFilter,
  setDifficulty,
  familyOnly,
  setFamilyOnly,
  minRating,
  setMinRating,
  minGroupSize,
  setMinGroupSize,
  maxDuration,
  setMaxDuration,
  dateFilter,
  setDateFilter,
  clearAllFilters,
  backToDashboard,
}: MarketplaceSearchFormProps) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-800">Explore Expeditions</h2>
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search by location, activity or organizer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 px-6 rounded-xl bg-slate-50/50 text-sm w-full md:w-72"
          />
          <Button variant="outline" className="h-12 w-12 rounded-xl border-slate-200">
            <Search size={20} className="text-slate-500" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sort by</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-11 rounded-lg mt-2 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="top_rated">Top Rated</SelectItem>
              <SelectItem value="most_booked">Most Booked</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Difficulty</label>
          <Select value={difficultyFilter} onValueChange={setDifficulty}>
            <SelectTrigger className="h-11 rounded-lg mt-2 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Price Range</label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
              className="h-11 rounded-lg text-sm"
            />
            <span className="text-slate-400">-</span>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
              className="h-11 rounded-lg text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Min. Rating</label>
          <Input
            type="number"
            value={minRating}
            onChange={(e) => setMinRating(+e.target.value)}
            className="h-11 rounded-lg mt-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</label>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-11 rounded-lg mt-2 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center justify-between mt-8">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <input
            type="checkbox"
            checked={familyOnly}
            onChange={(e) => setFamilyOnly(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          <span>Family Friendly Only</span>
        </label>
        <Button variant="ghost" onClick={clearAllFilters} className="text-sm text-primary hover:bg-primary/5">
          <X size={14} className="mr-2" /> Clear All Filters
        </Button>
      </div>
    </div>
  );
}