"use client";

import React, { useMemo } from 'react';
import { User, AppData, Booking } from '@/lib/types';
import { fmt, fmtDate, stars, cn } from '@/lib/utils';
import { 
  TrendingUp, 
  Users, 
  ClipboardList, 
  Star, 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  LineChart
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrganizerDashboardProps {
  currentUser: User;
  data: AppData;
  onNavigate: (page: string) => void;
}

const MOCK_MONTHLY_DATA = [
  { name: 'Jan', revenue: 45000, bookings: 12 },
  { name: 'Feb', revenue: 52000, bookings: 15 },
  { name: 'Mar', revenue: 48000, bookings: 14 },
  { name: 'Apr', revenue: 61000, bookings: 18 },
  { name: 'May', revenue: 75000, bookings: 22 },
  { name: 'Jun', revenue: 82000, bookings: 25 },
];

export default function OrganizerDashboard({ currentUser, data, onNavigate }: OrganizerDashboardProps) {
  const confirmedBookings = data.bookings.filter(b => b.status === 'Confirmed');
  const totalRevenue = confirmedBookings.reduce((s, b) => s + b.amount, 0);
  const totalCommission = confirmedBookings.reduce((s, b) => s + (b.commissionAmount || 0), 0);
  const netEarnings = totalRevenue - totalCommission;
  
  const stats = [
    { label: 'GROSS REVENUE', value: fmt(totalRevenue), trend: '+18%', isPositive: true, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'NET EARNINGS', value: fmt(netEarnings), trend: 'After Fee', isPositive: true, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'CONFIRMED SLOTS', value: confirmedBookings.length, trend: '+4 today', isPositive: true, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'AVG. RATING', value: data.reviews.length > 0 ? (data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length).toFixed(1) : '5.0', trend: 'Guest Satisfaction', isPositive: true, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans font-normal pb-20">
      {/* Welcome Hero */}
      <div className="bg-[#0d2a1d] rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-primary/20 text-primary border-none font-medium text-[10px] uppercase tracking-widest px-3 py-1 mb-4">Partner Portal v2.5</Badge>
          <h2 className="text-3xl md:text-4xl font-medium mb-3 tracking-tighter uppercase leading-none">Welcome back, {currentUser.firstName}</h2>
          <p className="text-sm md:text-base text-green-200/60 font-medium max-w-md leading-relaxed mb-8 uppercase tracking-wide">Your wilderness inventory is currently performing at 85% capacity this month.</p>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => onNavigate('camps')} className="bg-primary hover:bg-accent text-white h-12 px-8 rounded-2xl font-medium text-xs uppercase tracking-widest shadow-xl border-none">
              Manage Camps
            </Button>
            <Button onClick={() => onNavigate('bookings')} variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 h-12 px-8 rounded-2xl font-medium text-xs uppercase tracking-widest">
              View Bookings
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-[-20deg] translate-x-32 pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner", s.bg, s.color)}>
                <s.icon size={20} />
              </div>
              <div className={cn("flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest", s.isPositive ? "text-emerald-500" : "text-slate-400")}>
                {s.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {s.trend}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">{s.label}</div>
              <div className="text-2xl font-medium text-slate-900 tracking-tight">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Monthly Analytics Chart */}
        <div className="xl:col-span-8 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-full min-h-[450px]">
           <div className="flex justify-between items-center mb-8">
              <div>
                 <h3 className="text-[11px] font-medium text-slate-900 uppercase tracking-[0.2em]">Monthly Performance Analytics</h3>
                 <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">Booking velocity and revenue growth</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-[9px] font-medium text-slate-400 uppercase">Revenue</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                    <span className="text-[9px] font-medium text-slate-400 uppercase">Slots</span>
                 </div>
              </div>
           </div>

           <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={MOCK_MONTHLY_DATA}>
                    <defs>
                       <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fontWeight: 500, fill: '#cbd5e1', letterSpacing: '0.1em' }} 
                       dy={15} 
                    />
                    <YAxis hide />
                    <Tooltip 
                       contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                    <Line type="monotone" dataKey="bookings" stroke="#f97316" strokeWidth={4} dot={{ r: 4, fill: '#f97316' }} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Recent Transactions / Payouts Section */}
        <div className="xl:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl flex flex-col h-full border border-white/5">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">Pending Payouts</h3>
                 <Badge className="bg-primary/20 text-primary border-none text-[8px] font-medium uppercase tracking-widest px-2 py-0.5">T+3 Cycle</Badge>
              </div>
              
              <div className="space-y-6 flex-1">
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1">Total Receivable</p>
                    <div className="text-3xl font-medium text-white">{fmt(netEarnings * 0.4)}</div>
                    <p className="text-[8px] font-medium text-green-400 uppercase mt-2">Next settlement: Wed, 15 Oct</p>
                 </div>

                 <div className="space-y-4">
                    <p className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">Recent Settlements</p>
                    {[1, 2].map(i => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary"><IndianRupee size={14} /></div>
                            <div>
                               <p className="text-[11px] font-medium uppercase">Batch Oct #00{i}</p>
                               <p className="text-[9px] text-slate-500 font-medium uppercase">12 Oct 2024</p>
                            </div>
                         </div>
                         <p className="text-xs font-medium text-primary">{fmt(12500 * i)}</p>
                      </div>
                    ))}
                 </div>
              </div>

              <Button onClick={() => onNavigate('organizer_reports')} className="w-full mt-8 h-12 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-medium text-[10px] uppercase tracking-widest border-none">
                 Full Financial Audit
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Feedback */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[11px] font-medium text-slate-900 uppercase tracking-[0.2em]">Latest Guest Feedback</h3>
            <button onClick={() => onNavigate('reviews')} className="text-primary text-[10px] font-medium uppercase tracking-widest hover:underline">View All Feedback</button>
          </div>
          <div className="space-y-5">
            {data.reviews.length > 0 ? data.reviews.slice(0, 3).map(r => (
              <div key={r.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start mb-3">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary font-medium text-xs shadow-sm overflow-hidden border border-slate-100">
                        {r.customer[0]}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-900 uppercase tracking-tight">{r.customer}</div>
                        <div className="text-[9px] text-slate-400 font-medium uppercase">{r.camp}</div>
                      </div>
                   </div>
                   <div className="text-amber-500 text-[10px] flex gap-0.5">{stars(r.rating)}</div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">"{r.text}"</p>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-300 font-medium italic uppercase text-xs tracking-widest opacity-40">No guest reviews recorded</div>
            )}
          </div>
        </div>

        {/* Upcoming Expeditions */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-[11px] font-medium text-slate-900 uppercase tracking-[0.2em]">Upcoming Expeditions</h3>
              <button onClick={() => onNavigate('bookings')} className="text-primary text-[10px] font-medium uppercase tracking-widest hover:underline">Full Manifest →</button>
           </div>
           <div className="space-y-4">
              {confirmedBookings.length > 0 ? confirmedBookings.slice(0, 4).map(b => (
                <div key={b.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group cursor-pointer">
                   <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                         <Calendar size={18} />
                      </div>
                      <div>
                         <p className="text-xs font-medium text-slate-900 uppercase tracking-tight">{b.customer}</p>
                         <p className="text-[10px] text-slate-400 font-medium uppercase">{fmtDate(b.checkin)} • {b.camp}</p>
                      </div>
                   </div>
                   <Badge className="bg-green-100 text-green-700 border-none text-[8px] font-medium px-2 py-0.5 rounded-lg">READY</Badge>
                </div>
              )) : (
                <div className="text-center py-10 space-y-4 opacity-30 flex flex-col items-center">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl">🏜️</div>
                   <p className="text-xs font-medium uppercase tracking-widest">No active trip manifest</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
