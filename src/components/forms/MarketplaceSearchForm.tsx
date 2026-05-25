"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search, SlidersHorizontal, ArrowUpDown, X, Star, ArrowLeft, Calendar as CalendarIcon, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketplaceSearchFormProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  difficultyFilter: string;
  setDifficulty: (value: string) => void;
  familyOnly: boolean;
  setFamilyOnly: (value: boolean) => void;
  minRating: number;
  setMinRating: (value: number) => void;
  minGroupSize: number;
  setMinGroupSize: (value: number) => void;
  maxDuration: number;
  setMaxDuration: (value: number) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  clearAllFilters: () => void;
  backToDashboard: () => void;
}

const MarketplaceSearchForm: React.FC<MarketplaceSearchFormProps> = ({
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
}) => {
  return (
    <div className="bg-white p-4 md:p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
      <div className="flex items-center gap-4 flex-1 w-full">
        <Button
          variant="outline"
          size="icon"
          onClick={backToDashboard}
          className="rounded-full h-12 w-12 border-slate-200 shadow-sm hover:bg-slate-50 shrink-0"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </Button>
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by location, activity or organizer..."
            className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-medium text-sm text-slate-700"
          />
        </div>
      </div>

      <div className="flex gap-3 w-full lg:w-auto">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex-1 lg:flex-none h-14 px-6 rounded-2xl border-slate-200 font-medium text-[11px] uppercase tracking-widest gap-2 bg-white hover:bg-slate-50 text-slate-600">
              <SlidersHorizontal size={16} /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[450px] p-0 border-none shadow-2xl font-sans">
            <SheetHeader className="bg-[#153c1c] p-8 text-white">
              <SheetTitle className="text-xl font-medium uppercase tracking-tight text-white">Discovery Filters</SheetTitle>
              <SheetDescription className="text-green-200/60 font-medium uppercase text-[10px] tracking-widest mt-1.5">Refine your wilderness exploration</SheetDescription>
            </SheetHeader>
            <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-180px)] custom-scrollbar">
              <div className="space-y-5">
                <Label className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Expedition Cost (₹)</Label>
                <Slider
                  value={priceRange}
                  max={50000}
                  step={500}
                  onValueChange={setPriceRange}
                  className="py-4"
                />
                <div className="flex justify-between text-[11px] font-medium text-slate-600">
                  <span>₹0</span>
                  <span className="bg-primary/10 px-3 py-1 rounded-lg text-primary">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                  <span>₹50,000+</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Available From</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="rounded-xl h-12 border-slate-100 bg-slate-50 font-medium text-xs pl-10 text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Max Duration</Label>
                  <span className="text-xs font-medium text-primary">{maxDuration} Days</span>
                </div>
                <Slider
                  value={[maxDuration]}
                  max={30}
                  min={1}
                  step={1}
                  onValueChange={(v) => setMaxDuration(v[0])}
                  className="py-4"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Difficulty</Label>
                  <Select value={difficultyFilter} onValueChange={setDifficulty}>
                    <SelectTrigger className="rounded-xl h-12 border-slate-100 bg-slate-50 font-medium text-xs uppercase text-slate-600">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                      <SelectItem value="All" className="text-xs font-medium uppercase">All Levels</SelectItem>
                      <SelectItem value="Easy" className="text-xs font-medium uppercase">Easy</SelectItem>
                      <SelectItem value="Moderate" className="text-xs font-medium uppercase">Moderate</SelectItem>
                      <SelectItem value="Challenging" className="text-xs font-medium uppercase">Challenging</SelectItem>
                      <SelectItem value="Expert" className="text-xs font-medium uppercase">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Min. Rating</Label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setMinRating(r === minRating ? 0 : r)}
                        className={cn(
                          "flex-1 h-10 rounded-xl border flex items-center justify-center transition-all",
                          minRating >= r ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-slate-100 text-slate-300"
                        )}
                      >
                        <Star size={12} fill={minRating >= r ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[11px] font-medium uppercase tracking-tight text-slate-700">Family Friendly</Label>
                    <p className="text-[9px] font-medium text-slate-400 uppercase">Camps safe for children</p>
                  </div>
                  <Checkbox checked={familyOnly} onCheckedChange={(v: boolean) => setFamilyOnly(v)} className="h-6 w-6 rounded-lg" />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Min. Group Size</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
                    <Input
                      type="number"
                      value={minGroupSize || ''}
                      placeholder="e.g. 5 pax"
                      className="rounded-xl h-12 bg-slate-50 border-none font-medium pl-10 text-slate-700"
                      onChange={(e) => setMinGroupSize(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
            <SheetFooter className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <Button variant="ghost" onClick={clearAllFilters} className="flex-1 h-12 rounded-xl font-medium uppercase text-[10px] text-slate-400">Reset</Button>
              <Button className="flex-[2] h-12 rounded-xl bg-primary hover:bg-accent font-medium uppercase text-[10px] shadow-xl text-white border-none">Apply</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="flex-1 lg:w-48 h-14 rounded-2xl border-slate-200 font-medium text-[11px] uppercase tracking-widest gap-2 bg-white text-slate-600">
            <ArrowUpDown size={16} /> <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl">
            <SelectItem value="newest" className="text-xs font-medium uppercase">Newest</SelectItem>
            <SelectItem value="most_booked" className="text-xs font-medium uppercase">Most Booked</SelectItem>
            <SelectItem value="trending" className="text-xs font-medium uppercase">Trending</SelectItem>
            <SelectItem value="top_rated" className="text-xs font-medium uppercase">Top Rated</SelectItem>
            <SelectItem value="price_low" className="text-xs font-medium uppercase">Price: Low to High</SelectItem>
            <SelectItem value="price_high" className="text-xs font-medium uppercase">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default MarketplaceSearchForm;
