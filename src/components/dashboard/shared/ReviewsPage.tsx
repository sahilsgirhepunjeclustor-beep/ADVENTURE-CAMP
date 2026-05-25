"use client";

import React, { useState, useMemo } from 'react';
import { User, AppData, Review, Camp } from '@/lib/types';
import { stars, fmtDate, uid } from '@/lib/utils';
import { 
  Star, 
  Search, 
  Plus, 
  MessageSquare, 
  ThumbsUp, 
  X, 
  Filter,
  ArrowRight,
  Send,
  ArrowLeft,
  Reply
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getAllApprovedCamps, saveAppData, getAppData } from '@/lib/store';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';

interface ReviewsPageProps {
  currentUser: User;
  data: AppData;
  onBack?: void;
}

export default function ReviewsPage({ currentUser, data, onBack }: ReviewsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [selectedCampId, setSelectedCampId] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  const allCamps = useMemo(() => getAllApprovedCamps(), []);
  const reviews = data.reviews || [];

  // Statistics Calculation
  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, total: 0, dist: [0, 0, 0, 0, 0] };
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = (sum / total).toFixed(1);
    
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) dist[5 - r.rating]++;
    });

    return { 
      avg, 
      total, 
      dist: dist.map(count => Math.round((count / total) * 100)) 
    };
  }, [reviews]);

  const filteredReviews = reviews.filter(r => 
    r.camp.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampId || !newReviewText.trim()) return;

    const camp = allCamps.find(c => c.id === selectedCampId);
    if (!camp) return;

    const newReview: Review = {
      id: uid(),
      customer: `${currentUser.firstName} ${currentUser.lastName}`,
      customerEmail: currentUser.email,
      camp: camp.name,
      campId: camp.id,
      rating: newRating,
      text: newReviewText,
      time: new Date().toISOString(),
      status: 'approved'
    };

    const updatedData = { ...data, reviews: [newReview, ...data.reviews] };
    saveAppData(currentUser.email, updatedData);
    
    // Reset Form
    setIsAddReviewOpen(false);
    setSelectedCampId('');
    setNewReviewText('');
    setNewRating(5);
    
    toast({ title: 'Review Posted', description: 'Your feedback is now live on the platform.' });
  };

  return (
    <div className="space-y-6 pb-20 font-sans animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onBack} 
              className="rounded-full h-10 w-10 border-slate-200 shadow-sm hover:bg-slate-50 shrink-0"
            >
              <ArrowLeft size={18} className="text-slate-600" />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Community Reviews</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-70">Experience Audit Log</p>
          </div>
        </div>
        
        <Dialog open={isAddReviewOpen} onOpenChange={setIsAddReviewOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#16a34a] hover:bg-[#15803d] rounded-xl h-9 px-5 font-black text-[9px] uppercase tracking-widest shadow-xl shadow-green-500/10 gap-2">
              <Plus size={14} /> Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-[28px] border-none shadow-2xl p-0 overflow-hidden">
             <DialogHeader className="sr-only">
               <DialogTitle>Add Platform Review</DialogTitle>
               <DialogDescription>Share your genuine camp experience and rate the professional services provided.</DialogDescription>
             </DialogHeader>
             <div className="bg-[#0d2a1d] p-5 text-white">
                <h3 className="text-xs font-black uppercase tracking-widest">Platform Feedback</h3>
                <p className="text-[10px] text-green-200/60 font-bold mt-1 uppercase">Share your genuine camp experience</p>
             </div>
             <form onSubmit={handleAddReview} className="p-6 space-y-5 bg-white">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Select Expedition</label>
                   <Select value={selectedCampId} onValueChange={setSelectedCampId}>
                      <SelectTrigger className="rounded-xl h-11">
                         <SelectValue placeholder="Which camp did you visit?" />
                      </SelectTrigger>
                      <SelectContent>
                         {allCamps.map(c => (
                           <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                </div>

                <div className="space-y-1.5 text-center">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Experience Rating</label>
                   <div className="flex justify-center gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} type="button" onClick={() => setNewRating(s)} className="p-1 transition-transform active:scale-90">
                           <Star size={20} className={cn(s <= newRating ? "text-amber-500 fill-amber-500" : "text-slate-200")} />
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Your Story</label>
                   <Textarea 
                      value={newReviewText} 
                      onChange={e => setNewReviewText(e.target.value)}
                      placeholder="What was the highlight of your trip?" 
                      className="rounded-xl min-h-[100px] bg-slate-50 border-slate-100 text-xs"
                      required
                   />
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-accent font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/10">
                   Submit Experience
                </Button>
             </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card Area */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-5 p-8 flex flex-col items-center justify-center text-center border-r border-slate-50 space-y-3">
           <div className="text-5xl font-black text-slate-900 tracking-tighter">{stats.avg}</div>
           <div className="text-amber-400 flex gap-0.5 text-sm">
              {stars(Math.round(Number(stats.avg)))}
           </div>
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stats.total} Platform Reviews</p>
           <Button 
              onClick={() => setIsAddReviewOpen(true)}
              className="mt-2 bg-[#16a34a] hover:bg-[#15803d] rounded-full h-10 px-8 font-black text-[10px] uppercase tracking-widest shadow-lg"
           >
             Write a Review
           </Button>
        </div>
        
        <div className="md:col-span-7 p-8 bg-slate-50/30 flex flex-col justify-center space-y-3.5">
           {[5, 4, 3, 2, 1].map((s, idx) => (
             <div key={s} className="flex items-center gap-3">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest w-10">{s} star</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                   <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${stats.dist[idx]}%` }}
                   />
                </div>
                <span className="text-[8px] font-black text-slate-400 w-8">{stats.dist[idx]}%</span>
             </div>
           ))}
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.15em] border-b-2 border-[#16a34a] pb-1.5">Recent Experiences</h3>
        </div>

        {/* Search Bar */}
        <div className="px-2">
           <div className="relative max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <Input 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 placeholder="Search by camp or keyword..." 
                 className="pl-10 h-10 rounded-xl bg-white border-slate-100 shadow-sm font-bold text-[11px] uppercase tracking-tight"
              />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredReviews.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
               <div className="text-5xl mb-4 opacity-30">🔍</div>
               <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">No matching reviews</h4>
               <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">We couldn't find any feedback for "{searchQuery}".</p>
               <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery('')}
                  className="mt-6 rounded-lg h-9 px-5 bg-[#16a34a] text-white border-none font-black text-[9px] uppercase tracking-widest hover:bg-[#15803d]"
               >
                 Clear Search
               </Button>
            </div>
          ) : (
            filteredReviews.map(r => (
              <div key={r.id} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all group border-b-4 border-b-transparent hover:border-b-[#16a34a] space-y-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-base shadow-inner overflow-hidden border border-white">
                      {r.avatar ? <img src={r.avatar} className="w-full h-full object-cover" /> : r.customer[0]}
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-slate-900 uppercase tracking-tighter leading-none">{r.customer}</div>
                      <div className="text-[8px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 mt-1">
                         <div className="w-1 h-1 rounded-full bg-primary" />
                         {r.camp}
                      </div>
                    </div>
                  </div>
                  <div className="text-amber-500 text-[9px] flex gap-0.5">
                    {stars(r.rating)}
                  </div>
                </div>
                
                <div className="relative">
                   <div className="absolute -left-1 -top-1 text-2xl text-slate-50 font-serif">“</div>
                   <p className="text-[11px] text-slate-600 leading-relaxed font-medium italic relative z-10 px-1">
                     {r.text}
                   </p>
                </div>

                {r.reply && (
                   <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-2 animate-in slide-in-from-top-1">
                      <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest">
                         <Reply size={12} /> Organizer's Response
                      </div>
                      <p className="text-[11px] text-slate-700 font-bold leading-relaxed">{r.reply}</p>
                   </div>
                )}

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{fmtDate(r.time)}</div>
                  <button className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
                    <ThumbsUp size={12} /> Helpful
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
