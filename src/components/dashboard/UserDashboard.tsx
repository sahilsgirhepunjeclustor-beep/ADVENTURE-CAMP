"use client";

import React, { useMemo } from 'react';
import { User, AppData, Activity, Camp } from '@/lib/types';
import { fmt, fmtDate, daysUntil, cn } from '@/lib/utils';
import { getAllApprovedCamps } from '@/lib/store';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Heart, 
  IndianRupee, 
  Star, 
  Zap, 
  ShieldCheck,
  CreditCard,
  History,
  LifeBuoy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserDashboardProps {
  currentUser: User;
  data: AppData;
  onNavigate: (page: string) => void;
}

export default function UserDashboard({ currentUser, data, onNavigate }: UserDashboardProps) {
  const confirmedBookings = data.bookings.filter(b => b.status === 'Confirmed');
  const upcomingTrips = confirmedBookings.filter(b => daysUntil(b.checkin) >= 0);
  const totalSpent = confirmedBookings.reduce((s, b) => s + b.amount, 0);
  
  const allCamps = useMemo(() => getAllApprovedCamps(), []);
  const wishlistCamps = useMemo(() => 
    allCamps.filter(c => (data.wishlist || []).includes(c.id)),
    [allCamps, data.wishlist]
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans font-normal pb-20">
      {/* Immersive User Hero */}
      <div className="bg-gradient-to-br from-green-900 via-[#0d2a1d] to-[#166534] rounded-[32px] p-8 md:p-12 relative overflow-hidden text-white border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-[-20deg] translate-x-32 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-white/10 text-green-200 border-none font-medium text-[10px] uppercase tracking-widest px-3 py-1 mb-4">Explorer Hub</Badge>
          <h2 className="text-3xl md:text-4xl font-medium mb-3 tracking-tight leading-none">Adventure awaits, {currentUser.firstName}</h2>
          <p className="text-sm text-green-100/70 font-medium max-w-md leading-relaxed mb-8 uppercase tracking-wide">You have {upcomingTrips.length} upcoming wilderness expeditions. Check your roadmap.</p>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => onNavigate('camps')}
              className="bg-white text-green-900 hover:bg-green-50 h-14 px-8 rounded-2xl font-medium text-xs uppercase tracking-widest shadow-xl border-none"
            >
              Discover New Trails <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button 
              onClick={() => onNavigate('activities')}
              variant="outline" 
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 h-14 px-8 rounded-2xl font-medium text-xs uppercase tracking-widest"
            >
              Expedition Roadmap
            </Button>
          </div>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'EXPEDITION SPEND', value: fmt(totalSpent), icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'WISHLIST SIZE', value: `${(data.wishlist || []).length} Camps`, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'TOTAL TRIPS', value: confirmedBookings.length, icon: History, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'SUPPORT TICKETS', value: '2 Active', icon: LifeBuoy, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner", s.bg, s.color)}>
                  <s.icon size={20} />
               </div>
               <div className="text-[8px] font-medium text-slate-300 uppercase tracking-widest">Platform Stat</div>
            </div>
            <div>
               <div className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1">{s.label}</div>
               <div className="text-xl font-medium text-slate-700 tracking-tight">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-full min-h-[450px]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-[11px] font-medium text-slate-800 uppercase tracking-widest">Expedition Roadmap</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">Timeline of confirmed trips</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate('activities')} className="h-9 px-5 rounded-xl font-medium text-[9px] uppercase border-primary text-primary hover:bg-primary/5">View Full Log</Button>
          </div>

          <div className="space-y-4 flex-1">
            {upcomingTrips.length > 0 ? upcomingTrips.slice(0, 3).map(trip => (
              <div key={trip.id} className="p-6 bg-slate-50/50 rounded-[32px] border border-slate-100 flex flex-col sm:flex-row items-center gap-6 transition-all hover:shadow-lg hover:border-primary/20 cursor-pointer" onClick={() => onNavigate('activities')}>
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-sm border border-slate-100 shrink-0">🏕️</div>
                <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-2 gap-2">
                    <div className="text-base font-medium text-slate-800 uppercase tracking-tight truncate">{trip.camp}</div>
                    <Badge className="bg-green-100 text-green-700 border-none font-medium text-[8px] uppercase px-2 py-0.5 rounded-lg shrink-0">{trip.status}</Badge>
                  </div>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 md:gap-6 text-[10px] font-medium text-slate-500 uppercase">
                    <span className="flex items-center gap-2"><Calendar size={14} className="text-primary" /> {fmtDate(trip.checkin)}</span>
                    <span className="flex items-center gap-2 text-orange-600 font-medium"><Clock size={14} /> Starts in {daysUntil(trip.checkin)} days</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center bg-slate-50/30 rounded-[32px] border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner opacity-40 grayscale">🏜️</div>
                <h4 className="text-sm font-medium text-slate-800 uppercase tracking-tight">Horizon is empty</h4>
                <p className="text-[10px] text-slate-400 font-medium uppercase mt-2 max-w-[200px] mx-auto leading-relaxed">No wilderness trips confirmed recently.</p>
                <Button 
                   onClick={() => onNavigate('camps')}
                   className="mt-6 bg-primary h-10 px-6 rounded-xl font-medium text-[9px] uppercase tracking-widest border-none shadow-lg text-white"
                >
                  Browse Camps
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Financial & Activity Sidebar */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl flex flex-col border border-white/5 relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-center mb-8">
                 <h3 className="text-[10px] font-medium uppercase tracking-widest text-primary">Payment History</h3>
                 <button onClick={() => onNavigate('payments')} className="text-[9px] font-medium text-slate-400 hover:text-white uppercase underline-offset-4 underline">All Receipts</button>
              </div>
              
              <div className="relative z-10 space-y-6">
                 {confirmedBookings.length > 0 ? confirmedBookings.slice(0, 3).map(b => (
                   <div key={b.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10"><IndianRupee size={16} /></div>
                         <div>
                            <p className="text-xs font-medium uppercase tracking-tight truncate max-w-[120px]">{b.camp}</p>
                            <p className="text-[8px] text-slate-500 font-medium uppercase">{fmtDate(b.addedAt)}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-medium text-white">{fmt(b.amount)}</p>
                         <p className="text-[7px] font-medium text-green-400 uppercase tracking-widest">SUCCESSFUL</p>
                      </div>
                   </div>
                 )) : (
                   <div className="py-10 text-center opacity-30 italic text-[11px] font-medium uppercase tracking-widest">No transactions recorded</div>
                 )}
              </div>
              <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-[-25deg] translate-x-12" />
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-[11px] font-medium text-slate-800 uppercase tracking-widest">Wishlist Curations</h3>
                 <button onClick={() => onNavigate('wishlist')} className="text-primary text-[9px] font-medium uppercase tracking-widest hover:underline">View All →</button>
              </div>
              <div className="space-y-4">
                 {wishlistCamps.length > 0 ? wishlistCamps.slice(0, 3).map(c => (
                   <div key={c.id} onClick={() => onNavigate('camps', { selectedId: c.id })} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:bg-white hover:shadow-lg transition-all">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-inner">
                         <img src={c.campImages[0]} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-xs font-medium text-slate-800 uppercase tracking-tight truncate">{c.name}</p>
                         <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">{fmt(c.price)} • {c.location}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                         <Heart size={14} fill="currentColor" />
                      </div>
                   </div>
                 )) : (
                    <div className="py-8 text-center text-slate-300 font-medium italic uppercase text-[10px] tracking-widest opacity-40">Wishlist empty</div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
