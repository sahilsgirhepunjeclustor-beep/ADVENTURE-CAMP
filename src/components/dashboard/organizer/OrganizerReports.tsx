
"use client";

import React, { useMemo } from 'react';
import { User, AppData, Booking } from '@/lib/types';
import { fmt, fmtDate, cn } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  IndianRupee, 
  ArrowLeft, 
  Download, 
  FileText,
  PieChart as PieChartIcon,
  HandCoins,
  History,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrganizerReportsProps {
  currentUser: User;
  data: AppData;
  onBack: () => void;
}

const COLORS = ['#16a34a', '#f97316', '#3b82f6', '#94a3b8'];

export default function OrganizerReports({ currentUser, data, onBack }: OrganizerReportsProps) {
  const confirmedBookings = data.bookings.filter(b => b.status === 'Confirmed');
  
  const stats = useMemo(() => {
    const gross = confirmedBookings.reduce((s, b) => s + b.amount, 0);
    const comm = confirmedBookings.reduce((s, b) => s + (b.commissionAmount || 0), 0);
    const net = gross - comm;
    
    // Categorize by camp
    const campYield: Record<string, number> = {};
    confirmedBookings.forEach(b => {
      campYield[b.camp] = (campYield[b.camp] || 0) + b.amount;
    });

    const pieData = Object.entries(campYield).map(([name, value]) => ({ name, value }));

    return { gross, comm, net, pieData };
  }, [confirmedBookings]);

  return (
    <div className="space-y-8 pb-20 font-sans animate-in fade-in duration-700 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-12 w-12 border-slate-200 shadow-sm hover:bg-slate-50">
            <ArrowLeft size={20} className="text-slate-600" />
          </Button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Financial Yield Audit</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Gross Earnings, Commission & Settlement Records</p>
          </div>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="h-12 rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest px-6 bg-white gap-2">
              <Download size={14} /> Export XLS
           </Button>
           <Button className="h-12 rounded-2xl bg-primary hover:bg-accent text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-xl shadow-primary/20 gap-2 border-none">
              <FileText size={14} /> Monthly Report
           </Button>
        </div>
      </div>

      {/* Primary Financial Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm border-t-[8px] border-t-emerald-500 group hover:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GROSS EARNINGS</span>
               <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><TrendingUp size={18} /></div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tighter mb-2">{fmt(stats.gross)}</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lifetime Total Volume</p>
         </div>

         <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm border-t-[8px] border-t-blue-500 group hover:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PLATFORM COMMISSION</span>
               <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><HandCoins size={18} /></div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tighter mb-2">{fmt(stats.comm)}</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Standard 10% Protocol Fee</p>
         </div>

         <div className="bg-[#0d2a1d] p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">NET PAYABLE YIELD</span>
                  <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/20"><ShieldCheck size={18} /></div>
               </div>
               <div className="text-3xl font-black text-white tracking-tighter mb-2">{fmt(stats.net)}</div>
               <div className="flex items-center gap-2 text-[10px] font-black text-green-400 uppercase tracking-widest">
                  <CheckCircle2 size={12} /> Ready for Settlement
               </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-[-20deg] translate-x-12" />
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         {/* Yield Distribution */}
         <div className="xl:col-span-4 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-8 w-full text-left">Revenue Split by Camp</h3>
            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={stats.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {stats.pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 w-full">
               {stats.pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                     <span className="text-[9px] font-black uppercase text-slate-400 truncate">{entry.name}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Payout History Ledger */}
         <div className="xl:col-span-8 bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
               <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Settlement Timeline</h3>
               <Badge className="bg-slate-50 text-slate-500 border-none font-black text-[9px] py-1 px-3">Payout Ledger</Badge>
            </div>
            <div className="overflow-x-auto flex-1">
               <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                     <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                        <th className="px-8 py-5">SETTLEMENT ID</th>
                        <th className="px-8 py-5">PERIOD</th>
                        <th className="px-8 py-5 text-right">NET AMOUNT</th>
                        <th className="px-8 py-5 text-right">STATUS</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {[
                       { id: 'SET-98421', period: '01 Oct - 07 Oct', amount: 18500, status: 'Completed', color: 'bg-green-100 text-green-700' },
                       { id: 'SET-98420', period: '24 Sep - 30 Sep', amount: 14200, status: 'Completed', color: 'bg-green-100 text-green-700' },
                       { id: 'SET-98422', period: '08 Oct - 14 Oct', amount: 22100, status: 'Processing', color: 'bg-amber-100 text-amber-700' },
                     ].map((p, i) => (
                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                           <td className="px-8 py-5 text-[11px] font-black uppercase text-slate-900">{p.id}</td>
                           <td className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase">{p.period}</td>
                           <td className="px-8 py-5 text-right text-sm font-black text-slate-900">{fmt(p.amount)}</td>
                           <td className="px-8 py-5 text-right">
                              <Badge className={cn("border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-lg", p.color)}>
                                 {p.status}
                              </Badge>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}

