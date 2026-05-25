/**
 * @file AdminDashboard.tsx
 * @description This component renders the main dashboard for administrative users.
 * It provides a high-level overview of platform activity, including key statistics,
 * pending approvals, recent user activity, and financial performance.
 *
 * @requires react
 * @requires lucide-react - for icons
 * @requires recharts - for data visualization
 * @requires @/lib/types - for application-specific type definitions
 * @requires @/lib/utils - for utility functions like formatting
 * @requires @/lib/store - for accessing and manipulating application data
 * @requires @/components/ui/* - for various UI components like Button, Badge, Dialog, etc.
 */

"use client";

// Import necessary libraries and components
import React, { useMemo, useState, useEffect } from 'react';
import { User, AppData, UploadedDoc, Camp, Booking } from '@/lib/types';
import { cn, fmt, fmtDate, uid } from '@/lib/utils';
import {
  getGlobalAppData,
  getUsers,
  getAllApprovedCamps,
  getPendingCamps,
  saveUsers,
  addUserNotification
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
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
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

/**
 * @interface AdminDashboardProps
 * @description Defines the props for the AdminDashboard component.
 * @property {User} currentUser - The currently logged-in administrative user.
 * @property {AppData} data - The global application data.
 * @property {(page: string, params?: any) => void} onNavigate - Function to handle navigation to different pages.
 */
interface AdminDashboardProps {
  currentUser: User;
  data: AppData;
  onNavigate: (page: string, params?: any) => void;
}

/**
 * @function AdminDashboard
 * @description The main component for the admin dashboard.
 * @param {AdminDashboardProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered admin dashboard.
 */
export default function AdminDashboard({ currentUser, data, onNavigate }: AdminDashboardProps) {
  // --- STATE MANAGEMENT ---

  // State to hold all user data, initialized from the store.
  const [allUsersState, setAllUsersState] = useState<Record<string, User>>({});
  // State to manage the index of the currently displayed pending organizer.
  const [pendingIdx, setPendingIdx] = useState(0);
  // State to hold the user object being audited.
  const [auditUser, setAuditUser] = useState<User | null>(null);
  // State to control the visibility of the audit dialog.
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  // State for the document to be previewed.
  const [previewDoc, setPreviewDoc] = useState<{ label: string; doc?: UploadedDoc } | null>(null);
  // State to trigger a refresh of the user data.
  const [refreshKey, setRefreshKey] = useState(0);
  // State to store the reason for rejecting an organizer.
  const [rejectionReason, setRejectionReason] = useState('');
  // State to control the visibility of the rejection confirmation dialog.
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  // State to hold the user being approved or rejected.
  const [userToProcess, setUserToProcess] = useState<User | null>(null);

  // --- DATA FETCHING & SIDE EFFECTS ---

  /**
   * @effect
   * @description Fetches all users from the store whenever the `refreshKey` changes.
   * This allows for periodic refreshing of user data.
   */
  useEffect(() => {
    setAllUsersState(getUsers());
  }, [refreshKey]);

  /**
   * @effect
   * @description Sets up an interval to periodically increment `refreshKey`,
   * which in turn triggers a refetch of user data.
   * The interval is cleared on component unmount to prevent memory leaks.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(p => p + 1);
    }, 5000); // Refreshes every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // --- MEMOIZED COMPUTATIONS ---
  // Using useMemo to optimize performance by caching expensive calculations.

  // Memoized calculation for the total number of users.
  const totalUsersCount = useMemo(() => Object.keys(allUsersState).length, [allUsersState]);

  // Memoized list of organizers pending approval.
  const pendingOrganizers = useMemo(() =>
    Object.values(allUsersState).filter(u => u.role === 'organizer' && !u.isApproved && !u.isRejected),
    [allUsersState]
  );

  // Memoized list of all approved and active users.
  const approvedUsersList = useMemo(() =>
    Object.values(allUsersState).filter(u => {
      if (u.role === 'admin') return true;
      if (u.role === 'organizer') return u.isApproved === true && u.status !== 'suspended' && u.status !== 'blocked';
      return u.status !== 'suspended' && u.status !== 'blocked';
    }),
    [allUsersState]
  );

  // Memoized list of the first 5 active users for display.
  const activeUsers = useMemo(() =>
    approvedUsersList.slice(0, 5),
    [approvedUsersList]
  );

  // Memoized lists of all and pending camps.
  const camps = useMemo(() => getAllApprovedCamps(), []);
  const pendingCamps = useMemo(() => getPendingCamps(), []);
  // Get global application data.
  const globalData = getGlobalAppData();

  // Calculate total revenue from confirmed bookings.
  const totalRevenue = globalData.allBookings.reduce((sum, b) =>
    sum + (b.status === 'Confirmed' ? b.amount : 0), 0
  );

  // Calculate total commission from confirmed bookings.
  const totalCommission = globalData.allBookings.reduce((sum, b) =>
    sum + (b.status === 'Confirmed' ? (b.commissionAmount || 0) : 0), 0
  );

  // Calculate the number of active members.
  const activeMembers = Object.values(allUsersState).filter(u => u.membership?.status === 'active').length;

  // Memoized data for the live revenue and bookings chart.
  const liveChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months: Array<{ name: string; revenue: number; bookings: number; monthIdx: number }> = [];

    // Initialize the last 6 months for the chart.
    for (let i = 5; i >= 0; i--) {
      const monthIdx = (currentMonth - i + 12) % 12;
      last6Months.push({
        name: months[monthIdx],
        revenue: 0,
        bookings: 0,
        monthIdx
      });
    }

    // Populate the chart data with booking information.
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

  // Total number of items pending audit (camps + organizers).
  const auditTotal = pendingCamps.length + pendingOrganizers.length;

  // --- UI DATA & CONFIGURATION ---

  // Configuration for the main statistics grid.
  const mainStats = [
    { label: 'GROSS REVENUE', value: fmt(totalRevenue), trend: '+12.5%', color: 'border-green-400', icon: '💰' },
    { label: 'PLATFORM YIELD', value: fmt(totalCommission), trend: '10% Fee', color: 'border-blue-400', icon: '📈' },
    { label: 'REGISTRY SIZE', value: totalUsersCount, trend: 'Total Users', color: 'border-slate-300', icon: '👥' },
    { label: 'ACTIVE BASE', value: approvedUsersList.length, trend: 'Verified', color: 'border-emerald-400', icon: '✅' },
    { label: 'ACTIVE MEMBERS', value: activeMembers, trend: 'Loyalty', color: 'border-orange-300', icon: '💎' },
    { label: 'PENDING AUDIT', value: auditTotal, trend: 'Priority', color: auditTotal > 0 ? 'border-orange-400' : 'border-slate-200', icon: '⏳', shake: auditTotal > 0 },
  ];

  // --- EVENT HANDLERS ---

  /**
   * @function handleOrgAction
   * @description Handles the approval or rejection of an organizer.
   * @param {string} email - The email of the organizer to process.
   * @param {'approve' | 'reject'} action - The action to perform.
   * @param {string} [reason] - The reason for rejection (required for rejection).
   */
  const handleOrgAction = (email: string, action: 'approve' | 'reject', reason?: string) => {
    const updatedUsers = { ...allUsersState };
    const user = { ...updatedUsers[email.toLowerCase()] };

    if (action === 'approve') {
      // Approve the user
      user.isApproved = true;
      user.isRejected = false;
      user.rejectionReason = ''; // Clear any previous rejection reason
      user.status = 'active';
      // Add a notification for the user
      addUserNotification(user.email, {
        id: uid(),
        type: 'approval',
        title: 'Application Approved!',
        message: 'Congratulations! Your organizer account is now active and you can list your camps.',
        time: new Date().toISOString(),
        read: false
      });
      toast({ title: 'Partner Verified' });
    } else {
      // Reject the user
      if (!reason) return; // Reason is mandatory for rejection
      user.isApproved = false;
      user.isRejected = true;
      user.rejectionReason = reason;

      // Add a notification for the user
      addUserNotification(user.email, {
        id: uid(),
        type: 'approval',
        title: 'Application Update',
        message: `Your organizer application was rejected. Reason: ${reason}`,
        time: new Date().toISOString(),
        read: false
      });

      toast({ variant: 'destructive', title: 'Partner Rejected' });
    }

    // Update the user in the local state and save to the store.
    updatedUsers[email.toLowerCase()] = user;
    setAllUsersState(updatedUsers);
    saveUsers(updatedUsers);

    // Reset the UI state.
    setIsAuditOpen(false);
    setIsRejectDialogOpen(false);
    setRejectionReason('');
    setUserToProcess(null);
  };

  // Get today's date formatted as a string.
  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  // Count the number of unread notifications.
  const unreadAlerts = data.notifications?.filter(n => !n.read).length || 0;

  // --- RENDER METHOD ---

  return (
    <div className="space-y-8 pb-12 font-sans font-normal animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-[#153c1c] rounded-[24px] p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-xl gap-6 relative overflow-hidden border border-white/5">
        <div className="relative z-10">
          <h2 className="text-3xl font-medium mb-1 tracking-tight uppercase">Admin Dashboard</h2>
          <p className="text-xs text-green-200/60 font-medium uppercase tracking-widest">Platform-wide overview & controls — {todayStr}</p>
        </div>
        {/* Action Buttons */}
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
        {/* Decorative skewed element */}
        <div className="absolute top-0 right-0 w-96 h-full bg-white/5 skew-x-[-20deg] translate-x-32 pointer-events-none" />
      </div>

      {/* --- Main Statistics Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {mainStats.map(s => (
          <div
            key={s.label}
            className={cn(
              "bg-white rounded-[24px] border-t-[8px] shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between min-h-[140px]",
              s.color
            )}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight">
                {s.label}
              </span>
              <span className={cn("text-2xl opacity-50 grayscale", s.shake && "animate-shake opacity-100 grayscale-0")}>
                {s.icon}
              </span>
            </div>

            <div>
              <div className={cn(
                "text-3xl font-bold text-slate-900 tracking-tight mb-2",
                s.shake && "text-orange-600"
              )}>
                {s.value}
              </div>
              <div className={cn("text-[11px] font-medium uppercase flex items-center gap-1", s.trend.includes('+') ? "text-green-600" : "text-slate-500")}>
                {s.trend.includes('+') && <TrendingUp size={12} />} {s.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* --- Pending Organizer Approvals Section --- */}
        <div className="xl:col-span-5 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col h-full min-h-[480px]">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">PENDING ORGANIZER APPROVALS</h3>
              <Button size="sm" variant="outline" onClick={() => onNavigate('organizers')} className="h-9 px-4 rounded-xl font-medium text-[9px] uppercase border-primary text-primary hover:bg-primary/5">See all</Button>
           </div>
           
           <div className="flex-1 flex flex-col justify-center">
             {pendingOrganizers.length === 0 ? (
               // Displayed when there are no pending organizers
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
               // Displayed when there are pending organizers
               <div className="space-y-6">
                  <div className="bg-slate-50/50 p-6 rounded-[28px] border border-slate-100 relative">
                    {/* Button to open the audit dialog */}
                    <button
                      onClick={() => { setAuditUser(pendingOrganizers[pendingIdx]); setIsAuditOpen(true); }}
                      className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white text-slate-400 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      <Eye size={20} />
                    </button>
                    {/* Organizer Information */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-medium animate-shake">
                        {pendingOrganizers[pendingIdx].firstName[0]}
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-slate-900 uppercase tracking-tighter">{pendingOrganizers[pendingIdx].firstName} {pendingOrganizers[pendingIdx].lastName}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{pendingOrganizers[pendingIdx].email}</p>
                      </div>
                    </div>
                    {/* Business Identity */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 mb-6">
                       <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1">Business Identity</p>
                       <p className="text-sm font-medium text-slate-800 uppercase leading-none">{pendingOrganizers[pendingIdx].organizerProfile?.businessName}</p>
                       <p className="text-[10px] text-slate-400 font-medium truncate mt-1">{pendingOrganizers[pendingIdx].organizerProfile?.businessAddress}</p>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button onClick={() => handleOrgAction(pendingOrganizers[pendingIdx].email, 'approve')} className="flex-1 h-12 rounded-xl bg-primary hover:bg-accent font-medium text-[10px] uppercase shadow-lg shadow-primary/10 text-white border-none">Verify Partner</Button>
                      <Button
                        onClick={() => {
                          setUserToProcess(pendingOrganizers[pendingIdx]);
                          setIsRejectDialogOpen(true);
                        }}
                        variant="outline"
                        className="flex-1 h-12 rounded-xl text-red-500 border-red-200 bg-red-50 hover:bg-red-500 hover:text-white hover:border-red-500 font-medium text-[10px] uppercase transition-all"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                  {/* Pagination for pending organizers */}
                  <div className="flex items-center justify-center gap-6">
                    <Button variant="outline" size="icon" onClick={() => setPendingIdx(p => Math.max(0, p - 1))} disabled={pendingIdx === 0} className="h-10 w-10 rounded-xl"><ChevronLeft size={16} /></Button>
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{pendingIdx + 1} / {pendingOrganizers.length}</span>
                    <Button variant="outline" size="icon" onClick={() => setPendingIdx(p => Math.min(pendingOrganizers.length - 1, p + 1))} disabled={pendingIdx === pendingOrganizers.length - 1} className="h-10 w-10 rounded-xl"><ChevronRight size={16} /></Button>
                  </div>
               </div>
             )}
           </div>
        </div>

        {/* --- Active Users Section --- */}
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
        {/* --- Camp Performance Section --- */}
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

        {/* --- Revenue & Booking Trend Section --- */}
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
              {/* Chart Legend */}
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

      {/* Rejection Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reason for Rejection</DialogTitle>
            <DialogDescription>
              Please provide a clear reason for rejecting this organizer. This will be sent to them.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="e.g., Business license is not valid..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => userToProcess && handleOrgAction(userToProcess.email, 'reject', rejectionReason)}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
