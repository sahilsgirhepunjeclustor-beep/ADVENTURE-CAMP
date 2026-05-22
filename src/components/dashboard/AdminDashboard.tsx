"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { User, AppData, UploadedDoc, Camp, Booking } from '@/lib/types';
import { cn, fmt, fmtDate, uid } from '@/lib/utils';
import { 
  getGlobalAppData, 
  getUsers, 
  getAllApprovedCamps, 
  getPendingCamps, 
  saveUsers 
} from '@/lib/store';
import { 
  Mountain, 
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Building2,
  MapPin,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  FileText,
  ShieldCheck,
  X,
  FileX,
  TrendingUp,
  Users as UsersIcon,
  ClipboardList,
  Star,
  Activity,
  User as UserIcon,
  ShieldAlert,
  Lock,
  HandCoins,
  Gem,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line
} from 'recharts';

interface AdminDashboardProps {
  currentUser: User;
  data: AppData;
  onNavigate: (page: string, params?: any) => void;
}

export default function AdminDashboard({ currentUser, data, onNavigate }: AdminDashboardProps) {
  const [allUsersState, setAllUsersState] = useState<Record<string, User>>({});
  const [pendingIdx, setPendingIdx] = useState(0);
  const [auditUser, setAuditUser] = useState<User | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ label: string; doc?: UploadedDoc } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setAllUsersState(getUsers());
  }, [refreshKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(p => p + 1);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  const totalUsersCount = useMemo(() => Object.keys(allUsersState).length, [allUsersState]);

  const pendingOrganizers = useMemo(() => 
    Object.values(allUsersState).filter(u => u.role === 'organizer' && !u.isApproved && !u.isRejected),
    [allUsersState]
  );

  const approvedUsersList = useMemo(() => 
    Object.values(allUsersState).filter(u => {
      if (u.role === 'admin') return true;
      if (u.role === 'organizer') return u.isApproved === true && u.status !== 'suspended' && u.status !== 'blocked';
      return u.status !== 'suspended' && u.status !== 'blocked';
    }),
    [allUsersState]
  );

  const activeUsers = useMemo(() => 
    approvedUsersList.slice(0, 5),
    [approvedUsersList]
  );

  const camps = useMemo(() => getAllApprovedCamps(), []);
  const pendingCamps = useMemo(() => getPendingCamps(), []);
  const globalData = getGlobalAppData();
  
  const totalRevenue = globalData.allBookings.reduce((sum, b) => 
    sum + (b.status === 'Confirmed' ? b.amount : 0), 0
  );

  const totalCommission = globalData.allBookings.reduce((sum, b) => 
    sum + (b.status === 'Confirmed' ? (b.commissionAmount || 0) : 0), 0
  );

  const activeMembers = Object.values(allUsersState).filter(u => u.membership?.status === 'active').length;

  const liveChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months: Array<{ name: string; revenue: number; bookings: number; monthIdx: number }> = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIdx = (currentMonth - i + 12) % 12;
      last6Months.push({
        name: months[monthIdx],
        revenue: 0,
        bookings: 0,
        monthIdx
      });
    }

    globalData.allBookings.forEach(b => {
      const bDate = new Date(b.addedAt);
      const bMonth = bDate.getMonth();
      const chartPoint = last6Months.find(m => m.monthIdx === bMonth);
      if (chartPoint) {
        chartPoint.bookings++;
        if (b.status === 'Confirmed') {
          chartPoint.revenue += b.amount;
        }
      }
    });

    return last6Months;
  }, [globalData.allBookings]);

  const auditTotal = pendingCamps.length + pendingOrganizers.length;

  const mainStats = [
    { label: 'GROSS REVENUE', value: fmt(totalRevenue), trend: '+12.5%', color: 'border-green-400', icon: '💰' },
    { label: 'PLATFORM YIELD', value: fmt(totalCommission), trend: '10% Fee', color: 'border-blue-400', icon: '📈' },
    { label: 'REGISTRY SIZE', value: totalUsersCount, trend: 'Total Users', color: 'border-slate-300', icon: '👥' },
    { label: 'ACTIVE BASE', value: approvedUsersList.length, trend: 'Verified', color: 'border-emerald-400', icon: '✅' },
    { label: 'ACTIVE MEMBERS', value: activeMembers, trend: 'Loyalty', color: 'border-orange-300', icon: '💎' },
    { label: 'PENDING AUDIT', value: auditTotal, trend: 'Priority', color: auditTotal > 0 ? 'border-orange-400' : 'border-slate-200', icon: '⏳', shake: auditTotal > 0 },
  ];

  const handleOrgAction = (email: string, action: 'approve' | 'reject') => {
    const updatedUsers = { ...allUsersState };
    const user = { ...updatedUsers[email.toLowerCase()] };
    
    if (action === 'approve') {
      user.isApproved = true;
      user.isRejected = false;
      user.status = 'active';
      toast({ title: 'Partner Verified' });
    } else {
      user.isApproved = false;
      user.isRejected = true;
      toast({ variant: 'destructive', title: 'Partner Rejected' });
    }

    updatedUsers[email.toLowerCase()] = user;
    setAllUsersState(updatedUsers);
    saveUsers(updatedUsers);
    setIsAuditOpen(false);
  };

  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const unreadAlerts = data.notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="space-y-8 pb-12 font-sans font-normal animate-in fade-in duration-500">
      <div className="bg-[#153c1c] rounded-[24px] p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-xl gap-6 relative overflow-hidden border border-white/5">
        <div className="relative z-10">
          <h2 className="text-3xl font-medium mb-1 tracking-tight uppercase">Admin Dashboard</h2>
          <p className="text-xs text-green-200/60 font-medium uppercase tracking-widest">Platform-wide overview & controls — {todayStr}</p>
        </div>
        <div className="flex flex-wrap gap-3 relative z-10">
          <Button onClick={() => onNavigate('memberships')} className="bg-[#c28664] hover:bg-[#b0785a] h-11 px-6 rounded-xl font-medium text-[10px] uppercase tracking-widest shadow-lg border-none text-white">
            <Gem size={14} className="mr-2" /> Memberships
          </Button>
          <Button onClick={() => onNavigate('camps')} className="bg-[#16a34a] hover:bg-[#15803d] h-11 px-6 rounded-xl font-medium text-[10px] uppercase tracking-widest shadow-lg border-none text-white">
            <Mountain size={14} className="mr-2" /> Manage Camps
          </Button>
          <Button onClick={() => onNavigate('bookings')} className="bg-[#0d2a1d] hover:bg-black/20 h-11 px-6 rounded-xl font-medium text-[10px] uppercase tracking-widest shadow-lg border border-white/10 text-white">
            <ClipboardList size={14} className="mr-2" /> Bookings Ledger
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-full bg-white/5 skew-x-[-20deg] translate-x-32 pointer-events-none" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {mainStats.map(s => (
          <div key={s.label} className={cn("bg-white rounded-[20px] border-t-[6px] shadow-sm hover:shadow-md transition-all p-5", s.color)}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[8px] font-medium text-slate-600 uppercase tracking-widest leading-none">{s.label}</span>
              <span className={cn("text-lg opacity-40 grayscale", s.shake && "animate-shake opacity-100 grayscale-0")}>{s.icon}</span>
            </div>
            <div>
              <div className={cn("text-xl font-medium text-slate-900 tracking-tight mb-1", s.shake && "text-orange-600")}>{s.value}</div>
              <div className={cn("text-[9px] font-medium uppercase flex items-center gap-1", s.trend.includes('+') ? "text-green-500" : "text-slate-500")}>
                {s.trend.includes('+') && <TrendingUp size={10} />} {s.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col h-full min-h-[480px]">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">PENDING ORGANIZER APPROVALS</h3>
              <Button size="sm" variant="outline" onClick={() => onNavigate('organizers')} className="h-9 px-4 rounded-xl font-medium text-[9px] uppercase border-primary text-primary hover:bg-primary/5">See all</Button>
           </div>
           
           <div className="flex-1 flex flex-col justify-center">
             {pendingOrganizers.length === 0 ? (
               <div className="text-center space-y-6">
                 <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                   <CheckCircle2 size={32} className="text-green-500" />
                 </div>
                 <div>
                   <h4 className="text-base font-medium text-slate-900 uppercase tracking-tight">All Caught Up!</h4>
                   <p className="text-[11px] text-slate-400 font-medium mt-2 leading-relaxed px-12">Excellent! All organizer applications have been reviewed.</p>
                 </div>
               </div>
             ) : (
               <div className="space-y-6">
                  <div className="bg-slate-50/50 p-6 rounded-[28px] border border-slate-100 relative">
                    <button 
                      onClick={() => { setAuditUser(pendingOrganizers[pendingIdx]); setIsAuditOpen(true); }}
                      className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white text-slate-400 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      <Eye size={20} />
                    </button>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-medium animate-shake">
                        {pendingOrganizers[pendingIdx].firstName[0]}
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-slate-900 uppercase tracking-tighter">{pendingOrganizers[pendingIdx].firstName} {pendingOrganizers[pendingIdx].lastName}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{pendingOrganizers[pendingIdx].email}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 mb-6">
                       <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1">Business Identity</p>
                       <p className="text-sm font-medium text-slate-800 uppercase leading-none">{pendingOrganizers[pendingIdx].organizerProfile?.businessName}</p>
                       <p className="text-[10px] text-slate-400 font-medium truncate mt-1">{pendingOrganizers[pendingIdx].organizerProfile?.businessAddress}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => handleOrgAction(pendingOrganizers[pendingIdx].email, 'approve')} className="flex-1 h-12 rounded-xl bg-primary hover:bg-accent font-medium text-[10px] uppercase shadow-lg shadow-primary/10 text-white border-none">Verify Partner</Button>
                      <Button 
                        onClick={() => handleOrgAction(pendingOrganizers[pendingIdx].email, 'reject')} 
                        variant="outline" 
                        className="flex-1 h-12 rounded-xl text-red-500 border-red-200 bg-red-50 hover:bg-red-500 hover:text-white hover:border-red-500 font-medium text-[10px] uppercase transition-all"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-6">
                    <Button variant="outline" size="icon" onClick={() => setPendingIdx(p => Math.max(0, p - 1))} disabled={pendingIdx === 0} className="h-10 w-10 rounded-xl"><ChevronLeft size={16} /></Button>
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{pendingIdx + 1} / {pendingOrganizers.length}</span>
                    <Button variant="outline" size="icon" onClick={() => setPendingIdx(p => Math.min(pendingOrganizers.length - 1, p + 1))} disabled={pendingIdx === pendingOrganizers.length - 1} className="h-10 w-10 rounded-xl"><ChevronRight size={16} /></Button>
                  </div>
               </div>
             )}
           </div>
        </div>

        <div className="xl:col-span-7 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col h-full min-h-[480px]">
           <div className="flex justify-between items-center mb-8">
              <div>
                 <h3 className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">USERS ACTIVE TODAY</h3>
                 <p className="text-[9px] text-slate-600 font-medium mt-0.5">{approvedUsersList.length} verified users active on the platform</p>
              </div>
              <div className="flex items-center gap-3">
                 <Badge className="bg-green-50 text-green-600 border-green-100 text-[9px] font-medium uppercase px-2 py-0.5">{approvedUsersList.length} Verified</Badge>
                 <Button size="sm" onClick={() => onNavigate('users')} className="h-9 px-5 rounded-xl bg-primary hover:bg-accent font-medium text-[9px] uppercase text-white border-none">View all users</Button>
              </div>
           </div>

           <div className="flex-1 overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[8px] font-medium text-slate-600 uppercase tracking-widest border-b border-slate-50">
                       <th className="pb-3 pl-2">NAME</th>
                       <th className="pb-3">EMAIL</th>
                       <th className="pb-3">ROLE</th>
                       <th className="pb-3 pr-2 text-right">LOCATION</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {activeUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-xs font-medium text-slate-300 uppercase italic">No verified active users found</td>
                      </tr>
                    ) : (
                      activeUsers.map(u => (
                        <tr key={u.email} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pl-2">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium border border-white">
                                   {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover rounded-full" /> : u.firstName[0]}
                                </div>
                                <span className="text-xs font-medium text-slate-800 uppercase tracking-tighter">{u.firstName} {u.lastName}</span>
                             </div>
                          </td>
                          <td className="py-4 text-[11px] text-slate-500 font-medium">{u.email}</td>
                          <td className="py-4">
                             <Badge variant="outline" className={cn(
                               "text-[8px] font-medium uppercase px-2 py-0.5 rounded-md border-none",
                               u.role === 'admin' ? "bg-orange-50 text-orange-600" : 
                               u.role === 'organizer' ? "bg-blue-50 text-blue-600" : 
                               "bg-green-50 text-green-600"
                             )}>{u.role}</Badge>
                          </td>
                          <td className="py-4 pr-2 text-right text-[11px] text-slate-400 font-medium uppercase tracking-tight">{u.location || 'India'}</td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">Camp Performance</h3>
              <button onClick={() => onNavigate('camps')} className="text-primary text-[9px] font-medium uppercase tracking-widest hover:underline">Manage →</button>
           </div>
           
           <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[8px] font-medium text-slate-600 uppercase tracking-widest border-b border-slate-50">
                       <th className="pb-3 pl-2">CAMP</th>
                       <th className="pb-3">LOCATION</th>
                       <th className="pb-3">OCCUPANCY</th>
                       <th className="pb-3 pr-2 text-right">PRICE</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {camps.slice(0, 5).map(c => (
                      <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pl-2">
                           <div className="flex items-center gap-3">
                              <span className="text-base">🏕️</span>
                              <span className="text-xs font-medium text-slate-800 uppercase tracking-tighter">{c.name}</span>
                           </div>
                        </td>
                        <td className="py-4 text-[11px] text-slate-500 font-medium">{c.location}</td>
                        <td className="py-4 w-32">
                           <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${c.occupancy || 85}%` }} />
                              </div>
                              <span className="text-[10px] font-medium text-slate-500">{c.occupancy || 85}%</span>
                           </div>
                        </td>
                        <td className="py-4 pr-2 text-right">
                           <span className="text-xs font-medium text-slate-900">{fmt(c.price)}</span>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        <div className="xl:col-span-5 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
           <h3 className="text-[10px] font-medium text-slate-600 uppercase tracking-widest mb-8">Revenue & Booking Trend</h3>
           <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={liveChartData}>
                    <defs>
                       <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 9, fontWeight: 500, fill: '#94a3b8' }} 
                       dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: '500' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    <Line type="monotone" dataKey="bookings" stroke="#f97316" strokeWidth={2} dot={{ r: 4, fill: '#f97316' }} />
                 </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">Revenue (₹)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">Bookings</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
