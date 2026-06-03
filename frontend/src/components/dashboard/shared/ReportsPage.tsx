"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { 
  getGlobalAppData, 
  getAllApprovedCamps, 
  getUsers 
} from '@/lib/store';
import { fmt, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users as UsersIcon, 
  ClipboardList, 
  Star,
  Mountain,
  Waves,
  TreePine,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  IndianRupee,
  ShieldCheck,
  Trophy,
  ArrowUpRight,
  TrendingDown,
  HandCoins,
  Gem,
  Download,
  FileText
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const COLORS = ['#16a34a', '#f97316', '#ef4444', '#94a3b8'];
const MONTHLY_DATA = [
  { name: 'Jul', revenue: 20000, bookings: 4, users: 12, commission: 2000 },
  { name: 'Aug', revenue: 25000, bookings: 5, users: 18, commission: 2500 },
  { name: 'Sep', revenue: 22000, bookings: 4, users: 25, commission: 2200 },
  { name: 'Oct', revenue: 30000, bookings: 6, users: 32, commission: 3000 },
  { name: 'Nov', revenue: 35000, bookings: 7, users: 45, commission: 3500 },
  { name: 'Dec', revenue: 40000, bookings: 8, users: 58, commission: 4000 },
];

interface ReportsPageProps {
  onBack?: () => void;
  initialSection?: 'revenue' | 'bookings' | 'growth' | 'performance';
}

export default function ReportsPage({ onBack, initialSection = 'revenue' }: ReportsPageProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeSection, setActiveSection] = useState<'revenue' | 'bookings' | 'growth' | 'performance'>(initialSection);

  useEffect(() => {
    if (initialSection && initialSection !== activeSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // Poll for data freshness to ensure instant reflection
  useEffect(() => {
    const interval = setInterval(() => setRefreshKey(p => p + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const { allBookings, allReviews } = getGlobalAppData();
  const allCamps = getAllApprovedCamps();
  const allUsers = Object.values(getUsers());

  // Advanced Analytics Data Synchronization
  const stats = useMemo(() => {
    const totalRev = allBookings.reduce((sum, b) => 
      sum + (b.status === 'Confirmed' ? b.amount : 0), 0
    );

    const totalComm = allBookings.reduce((sum, b) => 
      sum + (b.status === 'Confirmed' ? (b.commissionAmount || 0) : 0), 0
    );
    
    const confirmedCount = allBookings.filter(b => b.status === 'Confirmed').length;
    const pendingCount = allBookings.filter(b => b.status === 'Pending').length;
    const cancelledCount = allBookings.filter(b => b.status === 'Cancelled').length;
    
    const organizers = allUsers.filter(u => u.role === 'organizer');
    const commonUsers = allUsers.filter(u => u.role === 'user');
    const admins = allUsers.filter(u => u.role === 'admin');
    const members = allUsers.filter(u => u.membership?.status === 'active');

    const avgRating = allReviews.length > 0 
      ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
      : "5.0";

    // Top Performing Organizers Logic
    const orgRevenue: Record<string, number> = {};
    allBookings.forEach(b => {
      if (b.status === 'Confirmed') {
        const camp = allCamps.find(c => c.id === b.campId);
        const orgName = camp?.organizer || 'Independent';
        orgRevenue[orgName] = (orgRevenue[orgName] || 0) + b.amount;
      }
    });

    const topOrganizers = Object.entries(orgRevenue)
      .map(([name, rev]) => ({ name, revenue: rev }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    // Popular Camps Logic
    const topCamps = [...allCamps]
      .sort((a, b) => (b.occupancy || 0) - (a.occupancy || 0))
      .slice(0, 3);

    return { 
      totalRev, 
      totalComm,
      totalBookings: allBookings.length,
      confirmedCount, 
      pendingCount, 
      cancelledCount, 
      totalUsers: allUsers.length,
      admins: admins.length, 
      organizers: organizers.length, 
      commonUsers: commonUsers.length,
      members: members.length,
      avgRating,
      topOrganizers,
      topCamps
    };
  }, [allBookings, allUsers, allReviews, allCamps, refreshKey]);

  const handleExportCSV = () => {
    if (allBookings.length === 0) {
      toast({ title: "Audit Empty", description: "No booking data available for export.", variant: "destructive" });
      return;
    }

    const headers = ["Transaction ID", "Customer", "Email", "Expedition", "Gross Amount", "Commission", "Status", "Date"];
    const csvRows = [headers.join(",")];

    allBookings.forEach(b => {
      const row = [
        b.id,
        `"${b.customer}"`,
        b.customerEmail,
        `"${b.camp}"`,
        b.amount,
        b.commissionAmount || 0,
        b.status,
        b.addedAt.split('T')[0]
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `trailwise_ops_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: "Report Exported", description: "CSV operational ledger downloaded successfully." });
  };

  const handleGeneratePDF = () => {
    window.print();
    toast({ title: "Print Protocol Initiated", description: "PDF generation window opened." });
  };

  return (
    <div className="space-y-8 pb-20 font-sans animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
              onClick={onBack} 
              className="h-12 w-12 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all no-print"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
               <BarChart3 size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">System Analytics</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Platform Performance & Growth Audit</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 no-print">
           <Button variant="outline" onClick={handleExportCSV} className="h-12 rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest px-6 bg-white gap-2">
              <Download size={14} /> Export CSV
           </Button>
           <Button onClick={handleGeneratePDF} className="h-12 rounded-2xl bg-primary hover:bg-accent text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-xl shadow-primary/20 gap-2">
              <FileText size={14} /> Generate PDF
           </Button>
        </div>
      </div>

      <div className="bg-slate-50 rounded-[32px] p-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { value: 'revenue', label: 'Revenue', icon: BarChart3 },
            { value: 'bookings', label: 'Bookings', icon: ClipboardList },
            { value: 'growth', label: 'User Growth', icon: UsersIcon },
            { value: 'performance', label: 'Camp Performance', icon: Mountain },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveSection(item.value as any)}
              className={cn(
                'rounded-2xl px-5 py-3 text-left transition-all border',
                activeSection === item.value ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-200'
              )}
            >
              <div className="flex items-center gap-3 text-slate-600 mb-2"><item.icon size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span></div>
              <p className="text-2xl font-black text-slate-900">{item.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'GROSS YIELD', value: fmt(stats.totalRev), sub: 'Verified Revenue', color: 'border-green-400', icon: IndianRupee },
          { label: 'COMMISSION', value: fmt(stats.totalComm), sub: 'Platform Fee (10%)', color: 'border-blue-400', icon: HandCoins },
          { label: 'LOYALTY BASE', value: stats.members, sub: 'Active Members', color: 'border-orange-400', icon: Gem },
          { label: 'INVENTORY', value: allCamps.length, sub: 'Approved Camps', color: 'border-emerald-400', icon: Mountain },
          { label: 'COMMUNITY', value: `${stats.avgRating} ★`, sub: 'Service Quality', color: 'border-amber-400', icon: Star },
        ].map(s => (
          <div key={s.label} className={cn("bg-white rounded-[28px] border-t-[8px] shadow-sm p-6 hover:shadow-md transition-all", s.color)}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">{s.label}</span>
              <s.icon size={18} className="text-slate-300" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{s.value}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Growth Trends & User Metrics */}
        <div className="xl:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-full min-h-[500px]">
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Platform Growth Analytics</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Multi-layered trajectory of users and revenue</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                     <span className="text-[9px] font-black text-slate-400 uppercase">Comm.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                     <span className="text-[9px] font-black text-slate-400 uppercase">Users</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 w-full min-h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MONTHLY_DATA}>
                     <defs>
                        <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15}/>
                           <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                           <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1', letterSpacing: '0.1em' }} 
                        dy={15} 
                     />
                     <YAxis hide />
                     <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                        labelStyle={{ fontWeight: 900, color: '#0f172a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                     />
                     <Area type="monotone" dataKey="commission" stroke="#16a34a" strokeWidth={4} fillOpacity={1} fill="url(#colorComm)" />
                     <Area type="monotone" dataKey="users" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorUser)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Status Distribution & Rankings */}
        <div className="xl:col-span-4 space-y-8">
           {/* Booking Reports / Status */}
           <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl flex flex-col justify-between min-h-[300px]">
              <div>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">Booking Lifecycle Report</h3>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'CONFIRMED', val: stats.confirmedCount, icon: CheckCircle2, color: 'text-green-400' },
                      { label: 'PENDING', val: stats.pendingCount, icon: Clock, color: 'text-amber-400' },
                      { label: 'REFUNDED', val: stats.cancelledCount, icon: XCircle, color: 'text-rose-400' },
                      { label: 'MEMBERS', val: stats.members, icon: Gem, color: 'text-blue-400' },
                    ].map(item => (
                      <div key={item.label} className="p-4 bg-white/5 rounded-[20px] border border-white/5">
                         <div className="flex items-center gap-2 mb-2">
                            <item.icon size={12} className={item.color} />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                         </div>
                         <div className="text-xl font-black">{item.val}</div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Top Performers */}
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Top Performing Partners</h3>
              <div className="space-y-4">
                 {stats.topOrganizers.map((org, i) => (
                   <div key={org.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm font-black border border-slate-100">
                            {i+1}
                         </div>
                         <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{org.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                               <ArrowUpRight size={10} className="text-green-500" /> Top Performer
                            </p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-black text-primary">{fmt(org.revenue)}</p>
                         <p className="text-[8px] font-bold text-slate-400 uppercase">Gross Revenue</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Popular Camps Audit */}
        <div className="xl:col-span-5 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Popular Camps Registry</h3>
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500"><Trophy size={16} /></div>
           </div>
           <div className="space-y-5">
              {stats.topCamps.map(camp => (
                <div key={camp.id} className="flex gap-5 p-2 rounded-2xl hover:bg-slate-50 transition-colors group">
                   <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                      <img src={camp.campImages[0]} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                   </div>
                   <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter truncate leading-tight">{camp.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 mb-3">{camp.location}</p>
                      <div className="flex items-center gap-3">
                         <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${camp.occupancy}%` }} />
                         </div>
                         <span className="text-[10px] font-black text-emerald-600">{camp.occupancy}% Occupied</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Global Summary Table */}
        <div className="xl:col-span-7 bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Inventory Yield Summary</h3>
              <Badge variant="outline" className="bg-slate-50 text-slate-500 border-none font-black text-[9px] py-1 px-3">Live Ledger</Badge>
           </div>
           <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left">
                 <thead className="bg-slate-50/50">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                       <th className="px-8 py-5">EXPEDITION IDENTITY</th>
                       <th className="px-8 py-5">PRICING</th>
                       <th className="px-8 py-5">YIELD / OCCUPANCY</th>
                       <th className="px-8 py-5 text-right">TAG</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {allCamps.map((c, i) => {
                      const icons = [<Mountain size={14} />, <Waves size={14} />, <TreePine size={14} />];
                      return (
                        <tr key={c.id} className="group hover:bg-slate-50/30 transition-colors">
                           <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    {icons[i % 3]}
                                 </div>
                                 <div>
                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{c.name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{c.location}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-5">
                              <span className="text-sm font-black text-slate-900">{fmt(c.price)}</span>
                           </td>
                           <td className="px-8 py-5 w-48">
                              <div className="flex items-center gap-3">
                                 <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full transition-all duration-1000", c.occupancy > 80 ? "bg-emerald-500" : c.occupancy > 50 ? "bg-orange-400" : "bg-rose-400")} style={{ width: `${c.occupancy}%` }} />
                                 </div>
                                 <span className="text-[9px] font-black text-slate-400">{c.occupancy}%</span>
                              </div>
                           </td>
                           <td className="px-8 py-5 text-right">
                              <Badge variant="outline" className={cn(
                                "text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border-none",
                                c.category.toLowerCase().includes('mountain') ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                              )}>
                                {c.category}
                              </Badge>
                           </td>
                        </tr>
                      );
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
