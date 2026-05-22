
"use client";

import React, { useMemo } from 'react';
import { User, AppData, Camp } from '@/lib/types';
import { getAllApprovedCamps } from '@/lib/store';
import { fmt, cn } from '@/lib/utils';
import { Heart, ArrowLeft, Search, MapPin, Star, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserWishlistProps {
  currentUser: User;
  data: AppData;
  onBack: () => void;
  onNavigate: (page: string, params?: any) => void;
  onToggleWishlist: (id: string, e?: React.MouseEvent) => void;
}

export default function UserWishlist({ 
  currentUser, 
  data, 
  onBack, 
  onNavigate, 
  onToggleWishlist 
}: UserWishlistProps) {
  const allCamps = useMemo(() => getAllApprovedCamps(), []);
  const wishlistedCamps = useMemo(() => 
    allCamps.filter(c => (data.wishlist || []).includes(c.id)),
    [allCamps, data.wishlist]
  );

  return (
    <div className="space-y-8 pb-20 font-sans animate-in fade-in duration-700 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-12 w-12 border-slate-200 shadow-sm hover:bg-slate-50">
            <ArrowLeft size={20} className="text-slate-600" />
          </Button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Expedition Wishlist</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Curated wilderness experiences for your next trip</p>
          </div>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center"><Heart size={20} fill="currentColor" /></div>
           <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SAVED ITEMS</p>
              <p className="text-lg font-black text-slate-900 leading-none">{wishlistedCamps.length} CAMPS</p>
           </div>
        </div>
      </div>

      {wishlistedCamps.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[40px] border border-dashed border-slate-200 opacity-50">
           <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
              <Heart size={48} />
           </div>
           <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Your collection is empty</h3>
           <p className="text-sm text-slate-400 font-bold mt-2 uppercase tracking-wide">Save the expeditions you love for quick access</p>
           <Button 
             onClick={() => onNavigate('camps')}
             className="mt-10 h-12 px-10 rounded-2xl bg-primary hover:bg-accent font-black uppercase text-[10px] tracking-widest text-white shadow-xl border-none"
           >
             Browse Marketplace
           </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistedCamps.map(camp => (
            <div 
              key={camp.id} 
              className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full relative cursor-pointer"
              onClick={() => onNavigate('camps', { selectedId: camp.id })}
            >
               <div className="aspect-[16/10] relative overflow-hidden">
                  <img src={camp.campImages[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 right-4 flex gap-2">
                     <button 
                       onClick={(e) => onToggleWishlist(camp.id, e)}
                       className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md text-rose-500 flex items-center justify-center shadow-xl border border-white hover:bg-rose-500 hover:text-white transition-all"
                     >
                        <Trash2 size={18} />
                     </button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                     <Badge className="bg-primary/90 text-white border-none font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-lg shadow-lg">
                        {camp.category}
                     </Badge>
                  </div>
               </div>
               
               <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors mb-4 line-clamp-2">{camp.name}</h4>
                  
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                     <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin size={12} className="text-primary shrink-0" /> 
                        <span className="truncate">{camp.location}</span>
                     </div>
                     <div className="flex items-center gap-1.5 bg-slate-900 text-white px-2 py-0.5 rounded-lg text-[9px] shrink-0">
                        <Star size={10} fill="currentColor" /> {camp.rating}
                     </div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-slate-50 flex flex-wrap items-center justify-between gap-3">
                     <div className="text-xl font-black text-slate-900 shrink-0">{fmt(camp.price)}</div>
                     <Button className="h-10 px-5 rounded-xl bg-primary hover:bg-accent text-white font-black text-[9px] uppercase tracking-widest border-none shadow-lg shadow-primary/10 flex-1 sm:flex-none">
                        View Expedition <ArrowRight size={14} className="ml-2" />
                     </Button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
