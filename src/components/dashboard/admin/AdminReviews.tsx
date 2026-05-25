/**
 * @file AdminReviews.tsx
 * @description This component provides an interface for administrators to moderate user-submitted reviews.
 * It allows admins to view pending, approved, and hidden (spam) reviews, and to take actions such as
 * approving, hiding, or deleting them.
 *
 * @requires react
 * @requires lucide-react - for icons
 * @requires @/lib/types - for the Review type definition
 * @requires @/lib/store - for data persistence and retrieval functions
 * @requires @/lib/utils - for utility functions like date formatting
 * @requires @/components/ui/* - for various UI components (Button, Badge, Input, Tabs, etc.)
 */

"use client";

// Import necessary libraries, types, and components
import React, { useState, useEffect, useMemo } from 'react';
import { Review } from '@/lib/types';
import { getGlobalAppData, saveAppData, getAppData } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { stars, fmtDate, cn } from '@/lib/utils';
import {
  Star,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  EyeOff,
  Search,
  MessageSquare,
  ArrowLeft,
  XCircle,
  Filter,
  Flag
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * @interface AdminReviewsProps
 * @description Defines the props for the AdminReviews component.
 * @property {() => void} [onBack] - Optional callback function to handle back navigation.
 */
interface AdminReviewsProps {
  onBack?: () => void;
}

/**
 * @function AdminReviews
 * @description The main component for moderating user reviews.
 * @param {AdminReviewsProps} props - The component's props.
 * @returns {JSX.Element} The rendered component.
 */
export default function AdminReviews({ onBack }: AdminReviewsProps) {
  // --- STATE MANAGEMENT ---

  // State to hold all reviews.
  const [reviews, setReviews] = useState<Review[]>([]);
  // State for the search query used to filter reviews.
  const [searchQuery, setSearchQuery] = useState('');
  // State to manage the active tab (pending, approved, hidden).
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'hidden'>('pending');

  // --- DATA FETCHING ---

  /**
   * @effect
   * @description Fetches all reviews from the global app data on component mount.
   * It also ensures that each review has a status, defaulting to 'approved' if not present.
   */
  useEffect(() => {
    const { allReviews } = getGlobalAppData();
    setReviews(allReviews.map(r => ({ ...r, status: r.status || 'approved' })));
  }, []);

  // --- MEMOIZED COMPUTATIONS ---

  // Memoized list of reviews filtered by the active tab and search query.
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchesSearch = r.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.camp.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.text.toLowerCase().includes(searchQuery.toLowerCase());

      if (activeTab === 'pending') {
        // The 'pending' tab should show reviews with status 'pending' or no status at all.
        return matchesSearch && (r.status === 'pending' || !r.status);
      }
      return matchesSearch && r.status === activeTab;
    });
  }, [reviews, searchQuery, activeTab]);

  // --- EVENT HANDLERS ---

  /**
   * @function handleAction
   * @description Handles actions on a review, such as changing its status or deleting it.
   * @param {string} id - The ID of the review.
   * @param {string} email - The email of the user who wrote the review.
   * @param {Review['status'] | 'delete'} action - The action to perform.
   */
  const handleAction = (id: string, email: string, action: Review['status'] | 'delete') => {
    const userData = getAppData(email);

    if (action === 'delete') {
      userData.reviews = userData.reviews.filter(r => r.id !== id);
      toast({ variant: 'destructive', title: 'Review Deleted', description: 'Feedback removed from system records.' });
    } else {
      userData.reviews = userData.reviews.map(r => r.id === id ? { ...r, status: action } : r);
      toast({ title: `Review ${action.toUpperCase()}` });
    }

    saveAppData(email, userData);

    // Update the local state to reflect the change immediately.
    setReviews(prev => {
      if (action === 'delete') return prev.filter(r => r.id !== id);
      return prev.map(r => r.id === id ? { ...r, status: action } : r);
    });
  };

  // --- RENDER METHOD ---

  return (
    <div className="space-y-8 pb-20 font-sans max-w-7xl mx-auto px-4 md:px-0 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-12 w-12 border-slate-200 shadow-sm">
              <ArrowLeft size={20} className="text-slate-600" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Review Moderation</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Audit platform feedback and manage spam</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-3 rounded-[24px] border border-slate-100 shadow-xl">
        <div className="relative flex-1 min-w-[300px]">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
           <Input
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
             placeholder="Audit Search (Explorer, Camp, Content)..."
             className="pl-12 h-12 rounded-xl bg-slate-50 border-none font-bold text-[11px] uppercase"
           />
        </div>
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full sm:w-auto">
           <TabsList className="bg-slate-50 p-1 rounded-xl h-11 w-full">
              <TabsTrigger value="pending" className="flex-1 rounded-lg px-6 font-black uppercase text-[9px] tracking-widest">Auditing</TabsTrigger>
              <TabsTrigger value="approved" className="flex-1 rounded-lg px-6 font-black uppercase text-[9px] tracking-widest">Verified</TabsTrigger>
              <TabsTrigger value="hidden" className="flex-1 rounded-lg px-6 font-black uppercase text-[9px] tracking-widest">Spam/Hidden</TabsTrigger>
           </TabsList>
        </Tabs>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.length === 0 ? (
          // Placeholder when no reviews are found
          <div className="col-span-full py-32 text-center bg-white rounded-[40px] border border-dashed border-slate-200 opacity-50 flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-200 mb-6">
                <MessageSquare size={40} />
             </div>
             <p className="text-sm font-black uppercase text-slate-400 tracking-widest">No feedback in this audit queue</p>
          </div>
        ) : (
          // Render the list of reviews
          filteredReviews.map(r => (
            <div key={r.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative group hover:shadow-xl transition-all border-l-[8px] border-l-primary/10 hover:border-l-primary">
               <div className="flex justify-between items-start mb-6">
                  {/* Reviewer Information */}
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-sm border border-white shadow-sm overflow-hidden">
                        {r.avatar ? <img src={r.avatar} className="w-full h-full object-cover" /> : r.customer[0]}
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{r.customer}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                           <Star size={10} fill="currentColor" className="text-amber-500" /> {r.rating} • {r.camp}
                        </div>
                     </div>
                  </div>
                  {/* Review Date */}
                  <div className="text-[9px] font-bold text-slate-400 uppercase">{fmtDate(r.time)}</div>
               </div>

               {/* Review Text */}
               <div className="relative mb-8">
                  <div className="absolute -left-1 -top-1 text-3xl text-slate-50 font-serif">“</div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed italic px-2 relative z-10">{r.text}</p>
               </div>

               {/* Action Buttons */}
               <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                  {/* Show 'Approve' button if the review is not already approved */}
                  {activeTab !== 'approved' && (
                    <Button onClick={() => handleAction(r.id, r.customerEmail, 'approved')} size="sm" className="rounded-xl h-9 px-4 bg-green-500 hover:bg-green-600 text-white font-black text-[9px] uppercase tracking-widest gap-2">
                       <CheckCircle2 size={14} /> Approve
                    </Button>
                  )}
                  {/* Show 'Mark Spam' button if the review is not already hidden */}
                  {activeTab !== 'hidden' && (
                    <Button onClick={() => handleAction(r.id, r.customerEmail, 'hidden')} variant="outline" size="sm" className="rounded-xl h-9 px-4 border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 font-black text-[9px] uppercase tracking-widest gap-2">
                       <EyeOff size={14} /> Mark Spam
                    </Button>
                  )}
                  {/* Delete Button */}
                  <Button onClick={() => handleAction(r.id, r.customerEmail, 'delete')} variant="outline" size="sm" className="rounded-xl h-9 px-4 border-red-100 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-widest gap-2">
                     <Trash2 size={14} /> Delete
                  </Button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}