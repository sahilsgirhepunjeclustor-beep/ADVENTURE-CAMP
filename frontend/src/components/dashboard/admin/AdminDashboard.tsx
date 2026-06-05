 
"use client";

import React, { useMemo, useState, useEffect, FC, ReactNode } from 'react';
import { User, AppData, Camp, Activity as ActivityType, Review, Booking } from '@/lib/types';
import { cn, fmt, fmtDate, uid } from '@/lib/utils';
import {
  getGlobalAppData,
  getUsers,
  getAllApprovedCamps,
  getPendingCamps,
  getRejectedCamps,
  saveUsers,
  addUserNotification,
  savePendingCamps,
  saveApprovedCamps,
  saveRejectedCamps,
} from '@/lib/store';
import {
  Mountain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  TrendingUp,
  Users as UsersIcon,
  ClipboardList,
  Star,
  User as UserIcon,
  AlertTriangle,
  Cloud,
  MountainSnow,
  Server,
  Wifi,
  BookOpenCheck,
  CircleDollarSign,
  DollarSign,
  CreditCard,
  ShieldCheck,
  Briefcase,
  Activity,
  CalendarCheck,
  ArrowLeftRight,
  TrendingDown,
  Gem,
  Target,
  Clock,
  Filter,
  Download,
  FileText,
  MapPin,
  Check,
  X,
  UserPlus,
  Undo2,
  UserX,
  Search, 
  File,
  MoreHorizontal,
  RefreshCw, 
  Trophy,
  Zap, 
  Thermometer, 
  Wind, 
  Droplets, 
  Sun,
  Database,
  LucideProps,
  Users
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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from "@/components/ui/textarea";
import { Progress } from '@/components/ui/progress';
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
  Cell,
  Legend,
  Sector,
  BarChart,
  Bar,
  LineChart,
  ComposedChart,
  LegendProps,
} from 'recharts';
import AdminOrganizers from './AdminOrganizers';
import AdminUsers from './AdminUsers';
import AdminBookings from './AdminBookings';

interface AdminDashboardProps {
  currentUser: User;
  data: AppData;
  onNavigate: (page: string, params?: any) => void;
}

// Helper to format time differences into a human-readable format like "5m ago".
const timeAgo = (date: string | Date): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 0) return "just now";
    if (seconds < 2) return "1s ago";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 2) return "1m ago";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 2) return "1h ago";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 2) return "1d ago";
    return `${days}d ago`;
};

// Type definition for live feed activities.
interface LiveFeedActivity {
    id: string;
    type: 'Camp approved' | 'New organizer registered' | 'Refund processed' | 'Booking completed' | 'Payment failed' | 'User suspended' | 'New review';
    message: string;
    time: string;
}

interface TopOrganizersProps {
    organizers: User[];
    bookings: Booking[];
}

/**
 * TopOrganizers Component
 * @param {TopOrganizersProps} props
 * @returns {JSX.Element}
 * Displays a ranked list of top organizers by revenue in the last 30 days.
 * It calculates revenue, total bookings, and average rating for each organizer.
 * The list is responsive and includes progress bars to visualize revenue comparison.
 */
const TopOrganizers: FC<TopOrganizersProps> = ({ organizers, bookings }) => {
    // Memoized calculation for top organizers to prevent re-computation on every render.
    const topOrganizers = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const orgData = organizers.map(org => {
            const orgBookings = bookings.filter(b => b.organizerEmail === org.email && new Date(b.addedAt) > thirtyDaysAgo && b.status === 'Confirmed');
            const revenue = orgBookings.reduce((acc, b) => acc + b.amount, 0);
            return {
                ...org,
                revenue,
                totalBookings: orgBookings.length,
                totalCamps: org.camps?.length || 0,
                rating: (org.reviews?.reduce((acc, r) => acc + r.rating, 0) || 0) / (org.reviews?.length || 1)
            };
        });

        return orgData.sort((a, b) => b.revenue - a.revenue).slice(0, 4);
    }, [organizers, bookings]);

    const maxRevenue = topOrganizers[0]?.revenue || 1;
    const RANK_COLORS = ['bg-amber-400', 'bg-blue-400', 'bg-green-500', 'bg-slate-400'];

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-slate-800">Top Organizers</h3>
                <a href="#" className="text-sm font-medium text-primary hover:underline">All →</a>
            </div>
            <p className="text-sm text-slate-500 mb-4">By revenue this month</p>
            <div className="space-y-5">
                {topOrganizers.map((org, index) => (
                    <div key={org.email} className="animate-in fade-in duration-500">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className={cn(RANK_COLORS[index], "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm")}>
                                <Trophy size={16} className="absolute opacity-20"/>
                                <span className="relative">#{index + 1}</span>
                            </div>
                            <div className="flex-grow min-w-0">
                                <p className="font-semibold text-slate-900 truncate">{org.organizerProfile?.businessName || 'Unknown'}</p>
                                <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                                    <span>{org.totalCamps} camps</span><span className="hidden sm:inline">•</span>
                                    <span>{org.totalBookings} bookings</span><span className="hidden sm:inline">•</span>
                                    <span className="flex items-center gap-1"><Star size={12} className="text-amber-400"/>{org.rating.toFixed(1)}</span>
                                </div>
                            </div>
                            <p className="font-bold text-slate-800 text-base sm:text-lg">{fmt(org.revenue, 'compact')}</p>
                        </div>
                        <Progress value={(org.revenue / maxRevenue) * 100} className="mt-2 h-1.5" indicatorClassName={RANK_COLORS[index]}/>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface TopPerformingCampsProps {
    camps: Camp[];
    bookings: Booking[];
}

/**
 * TopPerformingCamps Component
 * @param {TopPerformingCampsProps} props
 * @returns {JSX.Element}
 * Renders a list of top-performing camps based on revenue and occupancy.
 * The component is responsive and features progress bars for visual comparison.
 */
const TopPerformingCamps: FC<TopPerformingCampsProps> = ({ camps, bookings }) => {
    // Memoized calculation for top camps.
    const topCamps = useMemo(() => {
        return camps.map(camp => {
            const campBookings = bookings.filter(b => b.campId === camp.id && b.status === 'Confirmed');
            const revenue = campBookings.reduce((acc, b) => acc + b.amount, 0);
            // Simple occupancy calculation. This can be made more complex based on booking dates and camp availability.
            const occupancy = camp.capacity > 0 ? Math.min(100, (campBookings.length / (camp.capacity * 0.2)) * 100) : 0;
            return { ...camp, revenue, occupancy, bookingsCount: campBookings.length };
        }).sort((a,b) => b.revenue - a.revenue).slice(0, 4);
    }, [camps, bookings]);

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-slate-800">Top Performing Camps</h3>
                <a href="#" className="text-sm font-medium text-primary hover:underline">All →</a>
            </div>
            <p className="text-sm text-slate-500 mb-4">Occupancy & revenue leaders</p>
            <div className="space-y-3">
                {topCamps.map((camp, index) => (
                    <div key={camp.id} className="p-2 rounded-lg hover:bg-slate-50/50 relative animate-in fade-in duration-500">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center shrink-0 font-bold shadow-sm">
                               <span>#{index + 1}</span>
                            </div>
                            <div className="flex-grow min-w-0">
                                <p className="font-semibold text-slate-900 truncate">{camp.name}</p>
                                 <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                                    <span className="flex items-center gap-1"><MapPin size={12}/>{camp.location}</span><span className="hidden sm:inline">•</span>
                                    <span>{fmt(camp.revenue, 'compact')}</span><span className="hidden sm:inline">•</span>
                                    <span>{camp.bookingsCount} bk</span><span className="hidden sm:inline">•</span>
                                    <span className="flex items-center gap-1"><Star size={12} className="text-amber-400"/>{camp.rating.toFixed(1)}</span>
                                 </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                               <Badge className="bg-green-100 text-green-700 gap-1 border-none hidden lg:flex"><Zap size={12}/> Hot</Badge>
                               <p className="text-sm font-bold text-slate-600">{Math.round(camp.occupancy)}%</p>
                            </div>
                        </div>
                        <Progress value={camp.occupancy} className="absolute bottom-1 left-0 right-0 h-1 mx-2 opacity-50" indicatorClassName="bg-amber-400" />
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * LiveWeatherWatch Component
 * @returns {JSX.Element}
 * Displays simulated live weather data for key adventure locations. Includes responsive design and animations.
 * NOTE: The weather data is mocked. In a real app, this would be fetched from a live weather API.
 */
const LiveWeatherWatch: FC = () => {
    const weatherData = { himalaya: { temp: 24, wind: 32, humidity: 68 }, patagonia: { temp: 18, wind: 45, humidity: 75 }, bali: { temp: 31, wind: 15, humidity: 82 } };

    return (
        <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl p-6 text-white shadow-lg h-full relative overflow-hidden">
            <Sun size={80} className="absolute -top-5 -right-5 text-white/20 animate-pulse duration-2000"/>
            <div className="relative z-10">
                <p className="text-sm font-medium uppercase tracking-wider text-white/80">Live Weather Watch</p>
                <h3 className="text-2xl font-bold mt-1">Adventure Conditions</h3>
                
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 text-center">
                    <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                        <p className="font-bold text-xl sm:text-2xl flex items-center justify-center"><Thermometer size={16} className="mr-1"/>{weatherData.himalaya.temp}°</p>
                        <p className="text-xs text-white/80">Himalaya</p>
                    </div>
                     <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                        <p className="font-bold text-xl sm:text-2xl flex items-center justify-center"><Wind size={16} className="mr-1"/>{weatherData.patagonia.wind}km/h</p>
                        <p className="text-xs text-white/80">Patagonia</p>
                    </div>
                     <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                        <p className="font-bold text-xl sm:text-2xl flex items-center justify-center"><Droplets size={16} className="mr-1"/>{weatherData.bali.humidity}%</p>
                        <p className="text-xs text-white/80">Bali</p>
                    </div>
                </div>

                <div className="bg-white/20 p-4 rounded-lg mt-4 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={24} className="text-yellow-300 animate-shake"/>
                        <div>
                           <p className="font-bold">Storm advisory - Patagonia</p>
                           <p className="text-xs text-white/80">6 active camps in zone • 142 guests notified</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-4 text-sm">
                    <p className="flex items-center gap-2"><MapPin size={14}/> 18 risk zones tracked</p>
                    <a href="#" className="font-semibold hover:underline">Open map →</a>
                </div>
            </div>
        </div>
    );
};

interface RecentBookingsProps {
    bookings: Booking[];
    users: User[];
    onNavigateToBookings: () => void;
}

const RecentBookings: FC<RecentBookingsProps> = ({ bookings, users, onNavigateToBookings }) => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: 'addedAt', order: 'desc' });
  const bookingsPerPage = 7;

  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
        toast({ title: "No data to export", variant: "destructive"});
        return;
    }
    const toCsv = (value: any): string => {
        const str = String(value ?? '').replace(/"/g, '""');
        return `"${str}"`;
    };
    const headers = ["Booking ID", "User", "Camp", "Date", "Amount", "Status", "Payment"];
    const csvRows = filteredBookings.map(b => {
        const payment = getPaymentStatus(b);
        const row = [
            `BK-${b.id.substring(0,5).toUpperCase()}`,
            b.customer,
            b.camp,
            fmtDate(b.addedAt, {month: 'short', day: 'numeric', year: 'numeric'}),
            b.amount,
            b.status,
            payment.text
        ];
        return row.map(toCsv).join(',');
    });
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'bookings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "CSV Export Successful" });
  };
  
  const handleExportPDF = () => {
      toast({
          title: "PDF Export Unavailable",
          description: "This feature is currently under development. Please use CSV export.",
      });
  };

  const handleFilterClick = () => {
      toast({
          title: "Advanced Filters",
          description: "Advanced filtering options are under development.",
      });
  };

  const filteredBookings = useMemo(() => {
    return bookings
      .filter(b => filter === 'All' || b.status === filter)
      .filter(b => 
        !searchTerm ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.camp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customer.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a,b) => {
        if (sort.key === 'amount') {
            return sort.order === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
        return sort.order === 'asc' ? new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime() : new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      });
  }, [bookings, filter, searchTerm, sort]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (page - 1) * bookingsPerPage;
    return filteredBookings.slice(startIndex, startIndex + bookingsPerPage);
  }, [filteredBookings, page]);

  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  const statusCounts = useMemo(() => {
    const counts: {[key: string]: number} = { All: bookings.length, Confirmed: 0, Pending: 0, Cancelled: 0, Disputed: 0 };
    bookings.forEach(b => {
        const statusKey = b.status.charAt(0).toUpperCase() + b.status.slice(1);
        if (counts[statusKey] !== undefined) {
            counts[statusKey]++;
        }
    });
    return counts;
  }, [bookings]);

  const getPaymentStatus = (booking: Booking) => {
    if (booking.status === 'Cancelled') return { text: 'Refunded', color: 'text-blue-600 bg-blue-100' };
    if (booking.status === 'Pending') return { text: 'Pending', color: 'text-amber-600 bg-amber-100' };
    if (booking.status === 'Disputed') return { text: 'Held', color: 'text-red-600 bg-red-100' };
    return { text: 'Paid', color: 'text-green-600 bg-green-100' };
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div>
                <h3 className="text-xl font-bold text-slate-800">Recent Bookings</h3>
                <p className="text-sm text-slate-500 mt-1">{bookings.length} bookings • updated {timeAgo(new Date(Date.now() - 120000))}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <Input placeholder="Search bookings..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 w-full sm:w-40 md:w-48 h-9 rounded-lg"/>
                </div>
                <Button variant="outline" onClick={handleFilterClick} className="h-9 gap-1.5"><Filter size={14}/> Filter</Button>
                <Button variant="outline" onClick={handleExportCSV} className="h-9 gap-1.5"><File size={14}/> CSV</Button>
                <Button onClick={onNavigateToBookings} className="h-9 gap-1.5 bg-slate-800 hover:bg-slate-700 text-white"><ClipboardList size={14}/> View All</Button>
            </div>
        </div>
        <div className="flex gap-4 border-b border-slate-200 mb-2 overflow-x-auto">
            {Object.entries(statusCounts).map(([status, count]) => (
                <button key={status} onClick={() => setFilter(status)} className={cn("py-2.5 px-1 text-sm font-semibold border-b-2 whitespace-nowrap", filter === status ? "text-primary border-primary" : "text-slate-500 border-transparent hover:text-slate-700")}>
                    {status} <span className="text-slate-400 font-medium ml-1">{count}</span>
                </button>
            ))}
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="text-xs text-slate-400 uppercase bg-slate-50/50">
                        <th className="p-3 w-8 font-medium"><Checkbox /></th>
                        <th className="p-3 font-medium">Booking</th>
                        <th className="p-3 font-medium hidden md:table-cell">User</th>
                        <th className="p-3 font-medium">Camp</th>
                        <th className="p-3 font-medium hidden lg:table-cell">Date</th>
                        <th className="p-3 font-medium cursor-pointer" onClick={() => setSort(s => ({ key: 'amount', order: s.order === 'asc' ? 'desc' : 'asc' }))}>Amount <span className={cn("text-slate-400", {'text-primary': sort.key === 'amount'})}>{sort.key === 'amount' ? (sort.order === 'asc' ? '↑' : '↓') : ''}</span></th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium hidden sm:table-cell">Payment</th>
                        <th className="p-3 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedBookings.map(b => {
                        const user = users.find(u => u.email === b.userEmail);
                        const payment = getPaymentStatus(b);
                        return (
                            <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="p-3"><Checkbox /></td>
                                <td className="p-3 font-semibold text-slate-700">{`BK-${b.id.substring(0,5).toUpperCase()}`}</td>
                                <td className="p-3 hidden md:table-cell">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs shrink-0">{user ? `${user.firstName[0]}${user.lastName[0]}` : '??'}</div>
                                        <span className="font-medium text-slate-800 truncate">{b.customer}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-slate-600 max-w-xs truncate">{b.camp}</td>
                                <td className="p-3 text-slate-600 hidden lg:table-cell">{fmtDate(b.addedAt, {month: 'short', day: 'numeric', year: 'numeric'})}</td>
                                <td className="p-3 font-semibold text-slate-800">{fmt(b.amount)}</td>
                                <td className="p-3">
                                    <Badge className={cn("font-semibold border-none text-xs", `bg-${b.status === 'Confirmed' ? 'green' : b.status === 'Pending' ? 'amber' : b.status === 'Cancelled' ? 'slate' : 'red'}-100`, `text-${b.status === 'Confirmed' ? 'green' : b.status === 'Pending' ? 'amber' : b.status === 'Cancelled' ? 'slate' : 'red'}-700`)}>{b.status}</Badge>
                                </td>
                                <td className="p-3 hidden sm:table-cell"><Badge className={cn("font-semibold border-none text-xs", payment.color)}>{payment.text}</Badge></td>
                                <td className="p-3">
                                    <div className="flex gap-1 justify-end">
                                        <Button variant="ghost" size="icon" className="w-8 h-8"><Eye size={16}/></Button>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 hidden sm:flex"><RefreshCw size={16}/></Button>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-red-500 hidden md:flex"><X size={16}/></Button>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 hidden lg:flex"><Download size={16}/></Button>
                                        <Button variant="ghost" size="icon" className="w-8 h-8"><MoreHorizontal size={16}/></Button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
        <div className="flex flex-wrap justify-between items-center mt-4 text-sm gap-4">
            <p className="text-slate-500">Showing {paginatedBookings.length > 0 ? (page-1)*bookingsPerPage + 1 : 0} - {(page-1)*bookingsPerPage + paginatedBookings.length} of {filteredBookings.length} bookings</p>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>← Prev</Button>
                <div className="flex items-center gap-1">
                    {Array.from({length: totalPages > 5 ? 5 : totalPages}, (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5 && page > 3) {
                            if (i === 0) pageNum = 1;
                            else if (i === 1) return <span key="dots-start" className="px-2 py-1">...</span>;
                            else if (page >= totalPages - 2) pageNum = totalPages - (4-i);
                            else pageNum = page - (2-i);
                        } 
                        if (totalPages > 5 && page <= 3 && i > 2 && i < 4) {
                             return <span key="dots-end" className="px-2 py-1">...</span>;
                        }
                        if(totalPages > 5 && page <= 3 && i === 4) pageNum = totalPages;

                        return <Button key={pageNum} variant={page === pageNum ? 'default' : 'outline'} size="sm" className="w-8 h-8 p-0" onClick={() => setPage(pageNum)}>{pageNum}</Button>
                    })}
                </div>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}>Next →</Button>
            </div>
        </div>
    </div>
  );
};

interface ModerationQueuesProps {
    pendingOrganizers: User[];
    pendingCamps: Camp[];
    onApproveOrg: (email: string) => void;
    onRejectOrg: (user: User) => void;
    onApproveCamp: (id: string) => void;
    onRejectCamp: (id: string) => void;
    onNavigate: (page: string, params?: any) => void;
}

const ModerationQueues: FC<ModerationQueuesProps> = ({ pendingOrganizers, pendingCamps, onApproveOrg, onRejectOrg, onApproveCamp, onRejectCamp, onNavigate }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
                <h4 className="font-semibold text-slate-800">Pending Organizer Approvals</h4>
                {pendingOrganizers.length > 0 && <Badge className="bg-amber-100 text-amber-700 font-semibold border-none">{pendingOrganizers.length} PENDING</Badge>}
            </div>
            <button onClick={() => onNavigate('approvals')} className="text-sm font-medium text-primary hover:underline">View all →</button>
        </div>
        <div className="space-y-1">
            {pendingOrganizers.slice(0, 3).map(org => (
                <div key={org.email} className="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50/50">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center shrink-0">
                        {org.organizerProfile?.businessName.slice(0,2).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <p className="font-semibold text-sm text-slate-900 truncate">{org.organizerProfile?.businessName}</p>
                           <Badge className="bg-amber-100 text-amber-700 font-semibold border-none px-1.5 py-0.5 text-[10px] shrink-0">PENDING</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                            <span>{org.firstName} {org.lastName}</span><span className="text-slate-300"> • </span>
                            <span className="flex items-center gap-1"><MapPin size={12}/>{org.location}</span><span className="text-slate-300"> • </span>
                            <span className="flex items-center gap-1"><FileText size={12}/>{org.organizerProfile?.documents?.length || 0} docs</span><span className="text-slate-300"> • </span>
                            <span>{timeAgo(org.createdAt)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"><Eye size={16}/></Button>
                        <Button variant="ghost" size="icon" onClick={() => onRejectOrg(org)} className="w-9 h-9 rounded-full bg-red-100 text-red-600 hover:bg-red-200"><X size={16}/></Button>
                        <Button variant="ghost" size="icon" onClick={() => onApproveOrg(org.email)} className="w-9 h-9 rounded-full bg-green-100 text-green-600 hover:bg-green-200"><Check size={16}/></Button>
                    </div>
                </div>
            ))}
        </div>
    </div>
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
                <h4 className="font-semibold text-slate-800">Pending Camp Approvals</h4>
                {pendingCamps.length > 0 && <Badge variant="destructive" className="border-none">{pendingCamps.length} pending</Badge>}
            </div>
            <button onClick={() => onNavigate('approvals', { tab: 'camps' })} className="text-sm font-medium text-primary hover:underline">View all →</button>
        </div>
        <div className="space-y-1">
            {pendingCamps.slice(0, 3).map(camp => (
                <div key={camp.id} className="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50/50">
                    <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center shrink-0">
                        <Mountain size={20}/>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900 truncate">{camp.name}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                            <span className="truncate">{camp.organizer}</span><span className="text-slate-300"> • </span>
                            <span className="flex items-center gap-1"><MapPin size={12}/>{camp.location}</span><span className="text-slate-300"> • </span>
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 font-medium">{camp.category}</Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"><Eye size={16}/></Button>
                        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200"><Star size={16}/></Button>
                        <Button variant="ghost" size="icon" onClick={() => onRejectCamp(camp.id)} className="w-9 h-9 rounded-full bg-red-100 text-red-600 hover:bg-red-200"><X size={16}/></Button>
                        <Button variant="ghost" size="icon" onClick={() => onApproveCamp(camp.id)} className="w-9 h-9 rounded-full bg-green-100 text-green-600 hover:bg-green-200"><Check size={16}/></Button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  </div>
);

const LiveActivityFeed: FC<{ activities: LiveFeedActivity[], onNavigate: (page: string, params?: any) => void }> = ({ activities, onNavigate }) => {
    const ICONS: {[key: string]: {icon: FC<LucideProps>, color: string, bg: string}} = {
        'Camp approved': { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
        'New organizer registered': { icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-100' },
        'Refund processed': { icon: Undo2, color: 'text-amber-600', bg: 'bg-amber-100' },
        'Booking completed': { icon: CalendarCheck, color: 'text-slate-600', bg: 'bg-slate-100' },
        'Payment failed': { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
        'User suspended': { icon: UserX, color: 'text-red-600', bg: 'bg-red-100' },
        'New review': { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-slate-800">Live Activity</h4>
                     <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        Streaming - real-time
                    </div>
                </div>
                <button onClick={() => onNavigate('reports', {tab: 'audit'})} className="text-sm font-medium text-primary hover:underline">Audit log →</button>
            </div>
            <div className="relative space-y-6">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200 z-0"></div>
                {activities.map(act => {
                    const { icon: Icon, color, bg } = ICONS[act.type] || { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-100' };
                    return (
                        <div key={act.id} className="flex gap-4 items-start relative z-10">
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-white", bg)}>
                                <Icon size={16} className={color} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-800">{act.message}</p>
                                <p className="text-xs text-slate-500">{timeAgo(act.time)}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

interface StatCardProps {
    icon: FC<LucideProps>;
    title: string;
    value: string | number;
    trend?: string;
    trendDirection?: 'up' | 'down' | 'stale';
    subtext: string;
    chartData: {value: number}[];
    iconBgColor: string;
    onClick?: () => void;
}

const StatCard: FC<StatCardProps> = ({ icon: Icon, title, value, trend, trendDirection, subtext, chartData, iconBgColor, onClick }) => {
  const trendColor = trendDirection === 'up' ? 'text-green-600' : (trendDirection === 'down' ? 'text-red-600' : 'text-amber-600');
  const trendBgColor = trendDirection === 'up' ? 'bg-green-100' : (trendDirection === 'down' ? 'bg-red-100' : 'bg-amber-100');
  const TrendIcon = trendDirection === 'up' ? TrendingUp : (trendDirection === 'down' ? TrendingDown : TrendingUp);
  const gradId = useMemo(() => `stat-grad-${title.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 4)}`, [title]);
  const chartColors: {[key: string]: {hex: string, stop: string}} = { 'bg-green-500': { hex: '#22c55e', stop: '#22c55e' }, 'bg-blue-500': { hex: '#3b82f6', stop: '#3b82f6' }, 'bg-red-500': { hex: '#ef4444', stop: '#ef4444' }, 'bg-amber-500': { hex: '#f59e0b', stop: '#f59e0b' } };
  const color = chartColors[iconBgColor] || chartColors['bg-green-500'];

  return (
    <div onClick={onClick} className={cn("group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1", onClick && "cursor-pointer")}>
      <div className={`absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full ${iconBgColor} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
      <div className="flex justify-between items-start z-10">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", iconBgColor)}>
          <Icon className="text-white group-hover:scale-110 transition-transform duration-300" size={20} />
        </div>
        {trend && <div className={cn("flex items-center gap-1 text-xs font-semibold rounded-md px-2 py-1 ml-2", trendBgColor, trendColor)}><TrendIcon size={14} /><span>{trend}</span></div>}
      </div>
      <div className="flex-grow flex flex-col justify-end z-10 mt-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
        </div>
        <div className="flex justify-between items-end mt-2">
          <p className="text-xs text-slate-400">{subtext}</p>
          <div className="w-24 h-10 -mr-2">
            <ResponsiveContainer width="100%" height="100%"id={`rc-${gradId}`}>           <AreaChart data={chartData} id={`chart-${gradId}`}>\n            <defs><linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color.stop} stopOpacity={0.3} /><stop offset="95%" stopColor={color.stop} stopOpacity={0} /></linearGradient></defs>
            <Area type="monotone" dataKey="value" stroke={color.hex} strokeWidth={2} fillOpacity={1} fill={`url(#${gradId})`} /></AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RevenueAnalyticsProps {
    bookings: Booking[];
}

const RevenueAnalytics: FC<RevenueAnalyticsProps> = ({ bookings }) => {
  const [timeRange, setTimeRange] = useState('7D');

  const analyticsData = useMemo(() => {
    const now = new Date();
    let startDate = new Date(now);
    const endDate = new Date(now);
    let interval = 'day';
    let format = (d: Date) => d.toLocaleDateString('en-US', {weekday: 'short'});

    switch(timeRange) {
      case '7D': startDate.setDate(now.getDate() - 6); break;
      case '30D': startDate.setDate(now.getDate() - 29); format = (d) => d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}); break;
      case '90D': startDate.setDate(now.getDate() - 89); format = (d) => d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}); break;
      case '12M': startDate.setMonth(now.getMonth() - 11); startDate.setDate(1); interval = 'month'; format = (d) => d.toLocaleDateString('en-US', {month: 'short'}); break;
      default: startDate.setDate(now.getDate() - 6);
    }

    const dataMap = new Map();
    let d = new Date(startDate);

    if (interval === 'day') {
      while (d <= endDate) {
        dataMap.set(d.toISOString().split('T')[0], { name: format(d), revenue: 0, refunds: 0 });
        d.setDate(d.getDate() + 1);
      }
    } else { // month interval
        d = new Date(startDate);
        for(let i=0; i < 12; i++) {
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            dataMap.set(key, { name: format(d), revenue: 0, refunds: 0 });
            d.setMonth(d.getMonth() + 1);
        }
    }

    bookings.forEach(booking => {
      const bookingDate = new Date(booking.addedAt);
      if (bookingDate >= startDate && bookingDate <= endDate) {
        let key;
        if(interval === 'day') {
            key = bookingDate.toISOString().split('T')[0];
        } else {
            key = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}`;
        }
        
        if (dataMap.has(key)) {
          const entry = dataMap.get(key);
          if (entry) {
            if (booking.status === 'Confirmed') entry.revenue += booking.amount;
            else if (booking.status === 'Cancelled') entry.refunds += booking.amount;
          }
        }
      }
    });
    
    return Array.from(dataMap.values());
  }, [timeRange, bookings]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
      <div className="flex flex-wrap justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Revenue Analytics</h3>
          <p className="text-sm text-slate-500">Revenue, membership & refunds — {timeRange}</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 text-xs bg-slate-100 p-1 rounded-md">
            {['7D', '30D', '90D', '12M'].map(range => (
              <button key={range} onClick={() => setTimeRange(range)} className={cn('px-2 py-1 rounded-md', timeRange === range ? 'bg-white shadow-sm text-primary font-semibold' : 'text-slate-500')}>
                {range}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="icon" className="text-slate-500"><Filter size={16} /></Button>
          <Button variant="ghost" size="icon" className="text-slate-500"><Download size={16} /></Button>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%" id="rev-analytics-container">
          <AreaChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10}/>
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} width={40} tickFormatter={(value) => `${value/1000}k`}/>
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
              <linearGradient id="colorRefunds" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
            </defs>
            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" name="Revenue"/>
            <Area type="monotone" dataKey="refunds" stroke="#ef4444" strokeWidth={2} fill="url(#colorRefunds)" name="Refunds"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface CampMixProps {
    camps: Camp[];
}

const CampMix: FC<CampMixProps> = ({ camps }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = useMemo(() => {
    const categoryCounts: {[key: string]: number} = camps.reduce((acc, camp) => {
      const category = camp.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as {[key: string]: number});
    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  }, [camps]);

  const COLORS: {[key: string]: string} = { Mountain: '#16a34a', Desert: '#f97316', Beach: '#3b82f6', Forest: '#115e59', Other: '#64748b' };
  const onPieEnter = (_: any, index: number) => setActiveIndex(index);
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 4} startAngle={startAngle} endAngle={endAngle} fill={fill} />;
  };

  const CustomLegend: FC<LegendProps> = ({ payload }) => (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {payload?.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center gap-2 text-sm text-slate-600">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
           <h3 className="text-lg font-semibold text-slate-800">Camp Mix</h3>
           <p className="text-sm text-slate-500">Active camps by category</p>
        </div>
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" className="text-slate-500"><Filter size={16} /></Button>
           <Button variant="ghost" size="icon" className="text-slate-500"><Download size={16} /></Button>
        </div>
      </div>
      <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%" id="camp-mix-container">
        <PieChart id="camp-mix-chart" onMouseLeave={() => setActiveIndex(null)}>
              <Pie activeIndex={activeIndex ?? undefined} activeShape={renderActiveShape} onMouseEnter={onPieEnter} data={data} cx="50%" cy="45%" innerRadius={75} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value">
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name]} className="cursor-pointer"/>)}
              </Pie>
              <Tooltip />
              <Legend content={<CustomLegend />} verticalAlign="bottom" />
                 </PieChart>
       </ResponsiveContainer>
      </div>
    </div>
  )
}

interface BookingTrendsChartProps {
    bookings: Booking[];
}

const BookingTrendsChart: FC<BookingTrendsChartProps> = ({ bookings }) => {
  const data = useMemo(() => {
    const trendData = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return { name: d.toLocaleDateString('en-US', {weekday: 'short'}), bookings: 0 };
    }).reverse();

    bookings.forEach(b => {
      const bookingDate = new Date(b.addedAt);
      const today = new Date();
      const diffDays = Math.ceil((today.getTime() - bookingDate.getTime()) / (1000 * 3600 * 24));
      if(diffDays <= 7 && diffDays > 0) {
        const dayIndex = 7 - diffDays;
        if (trendData[dayIndex]) {
            trendData[dayIndex].bookings++;
        }
      }
    });
    return trendData;
  }, [bookings]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Booking Trends</h3>
          <p className="text-sm text-slate-500">Daily bookings for last 7 days</p>
        </div>
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" className="text-slate-500"><Filter size={16} /></Button>
           <Button variant="ghost" size="icon" className="text-slate-500"><Download size={16} /></Button>
        </div>
      </div>
      <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%" id="booking-trends-container">
      <BarChart data={data} id="booking-trends-chart">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} width={30} />
              <Tooltip cursor={{fill: 'rgba(22, 163, 74, 0.1)'}} contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9'}} />
              <Bar dataKey="bookings" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={20}/>
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface UserGrowthChartProps {
    users: User[];
}

const UserGrowthChart: FC<UserGrowthChartProps> = ({ users }) => {
  const data = useMemo(() => {
    const weeks = 6;
    const weeklyData = Array.from({length: weeks}, (_, i) => ({
      name: `W${weeks-i}`,
      total: 0,
      organizers: 0,
      explorers: 0,
    }));

    const now = new Date();
    users.forEach(user => {
      const userDate = new Date(user.createdAt);
      const diffWeeks = Math.floor((now.getTime() - userDate.getTime()) / (1000 * 3600 * 24 * 7));
      if(diffWeeks < weeks) {
        const weekIndex = weeks - 1 - diffWeeks;
        if(weeklyData[weekIndex]) {
            weeklyData[weekIndex].total++;
            if(user.role === 'organizer') weeklyData[weekIndex].organizers++;
            else if(user.role === 'user') weeklyData[weekIndex].explorers++;
        }
      }
    });
    return weeklyData.reverse();
  }, [users]);
  
  return (
     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">User Growth</h3>
          <p className="text-sm text-slate-500">New signups over last 6 weeks</p>
        </div>
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" className="text-slate-500"><Filter size={16} /></Button>
           <Button variant="ghost" size="icon" className="text-slate-500"><Download size={16} /></Button>
        </div>
      </div>
      <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%" id="user-growth-container">
      <LineChart data={data} id="user-growth-chart">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} width={40} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9'}} />
            <Line type="monotone" dataKey="total" stroke="#f97316" strokeWidth={2} name="Total Users" />
            <Line type="monotone" dataKey="organizers" stroke="#16a34a" strokeWidth={2} name="Organizers" />
            <Line type="monotone" dataKey="explorers" stroke="#3b82f6" strokeWidth={2} name="Explorers" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
};

interface RevenueVsBookingsChartProps {
    bookings: Booking[];
}

const RevenueVsBookingsChart: FC<RevenueVsBookingsChartProps> = ({ bookings }) => {
  const data = useMemo(() => {
    const trendData = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return { name: d.toLocaleDateString('en-US', {weekday: 'short'}), revenue: 0, bookings: 0 };
    }).reverse();

    bookings.forEach(b => {
      if (b.status !== 'Confirmed') return;
      const bookingDate = new Date(b.addedAt);
      const today = new Date();
      const diffDays = Math.ceil((today.getTime() - bookingDate.getTime()) / (1000 * 3600 * 24));
      if(diffDays <= 7 && diffDays > 0) {
        const dayIndex = 7 - diffDays;
        if (trendData[dayIndex]) {
            trendData[dayIndex].revenue += b.amount;
            trendData[dayIndex].bookings++;
        }
      }
    });
    return trendData;
  }, [bookings]);

  return (
    <div className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-700">Revenue vs. Bookings</h3>
        </div>
        <div>
          <Button variant="ghost" size="icon" className="text-slate-500"><Download size={16} /></Button>
        </div>
      </div>
      <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%" id="rev-vs-bk-container">
      <ComposedChart data={data} id="rev-vs-bk-chart">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
            <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{fontSize: 12}} width={40} tickFormatter={(val) => `${val/1000}k`} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12}} width={30}/>
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9'}} />
            {/* Ensure unique names for clarity and to help recharts differentiate */}
            <Bar yAxisId="left" dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={20} name="Revenue"/>
            <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#f97316" strokeWidth={2} name="Bookings"/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
interface RecentTransactionsProps {
    bookings: Booking[];
    onNavigateToBookings: () => void;
}

const RecentTransactions: FC<RecentTransactionsProps> = ({ bookings, onNavigateToBookings }) => {
    const { recentTransactions, totalProcessed, successRate, refundRate, totalCommission } = useMemo(() => {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const relevantBookings = bookings.filter(b => new Date(b.addedAt) > twentyFourHoursAgo);

        const totalProcessed = relevantBookings.reduce((acc, b) => acc + b.amount, 0);
        const successful = relevantBookings.filter(b => b.status === 'Confirmed').length;
        const refunded = relevantBookings.filter(b => b.status === 'Cancelled').length;
        const totalCommission = relevantBookings.reduce((acc, b) => acc + (b.commissionAmount || 0), 0);

        return {
            recentTransactions: bookings.slice(0, 5),
            totalProcessed,
            successRate: relevantBookings.length > 0 ? (successful / relevantBookings.length) * 100 : 100,
            refundRate: relevantBookings.length > 0 ? (refunded / relevantBookings.length) * 100 : 0,
            totalCommission
        };
    }, [bookings]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed': return <Badge className="bg-green-100 text-green-700">Success</Badge>;
      case 'Pending': return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case 'Cancelled': return <Badge className="bg-blue-100 text-blue-700">Refunded</Badge>;
      case 'Disputed': return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
          <p className="text-sm text-slate-500">Last 24 hours - {fmt(totalProcessed)} processed</p>
        </div>
        <button onClick={onNavigateToBookings} className="text-sm font-medium text-primary hover:underline">All →</button>
      </div>
      <div className="space-y-4">
        {recentTransactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <CreditCard size={20} className="text-slate-500"/>
              </div>
              <div>
                <p className="font-medium text-slate-800">{t.customer}</p>
                <p className="text-sm text-slate-500">{`BK-${t.id.substring(0,5).toUpperCase()}`}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">{fmt(t.amount)}</p>
              {getStatusBadge(t.status)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 text-sm font-medium">
        <div className="text-center">
          <p className="text-green-600 font-bold">{successRate.toFixed(1)}%</p>
          <p className="text-slate-500 text-xs">SUCCESS</p>
        </div>
        <div className="text-center">
          <p className="text-blue-600 font-bold">{refundRate.toFixed(1)}%</p>
          <p className="text-slate-500 text-xs">REFUND RATE</p>
        </div>
        <div className="text-center">
          <p className="text-slate-800 font-bold">{fmt(totalCommission)}</p>
          <p className="text-slate-500 text-xs">COMMISSION</p>
        </div>
      </div>
    </div>
  );
};

interface SystemHealthProps {
    bookings: Booking[];
}

const SystemHealth: FC<SystemHealthProps> = ({ bookings }) => {
  const [apiUptime, setApiUptime] = useState(99.9);
  const [serverHealth, setServerHealth] = useState(95);
  const [databaseHealth, setDatabaseHealth] = useState(92);

  useEffect(() => {
    const interval = setInterval(() => {
      setApiUptime(99.9 + (Math.random() * 0.1));
      setServerHealth(95 + (Math.random() * 5));
      setDatabaseHealth(90 + (Math.random() * 10));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const failedPaymentsPercentage = useMemo(() => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentBookings = bookings.filter(b => new Date(b.addedAt) > twentyFourHoursAgo);
    if (recentBookings.length === 0) return .0;
    const failed = recentBookings.filter(b => b.status === 'Disputed').length;
    return (failed / recentBookings.length) * 100;
  }, [bookings]);

  const overallHealth = (apiUptime > 99.5 && serverHealth > 90 && databaseHealth > 85 && failedPaymentsPercentage < 5) ? 'HEALTHY' : 'DEGRADED';

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-800">System Health</h3>
        <Badge className={cn(overallHealth === 'HEALTHY' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>{overallHealth}</Badge>
      </div>
      <p className="text-sm text-slate-500 mb-4 flex items-center gap-2"><span className={cn("w-2 h-2 rounded-full", overallHealth === 'HEALTHY' ? "bg-green-500" : "bg-amber-500")}></span> All systems operational</p>
      
      <div className="space-y-5">
        <div className="flex items-center">
          <TrendingUp size={16} className="text-slate-500 mr-3"/>
          <div className="flex-grow">
            <div className="flex justify-between text-sm">
              <p className="font-medium text-slate-700">API Uptime</p>
              <p className={cn("font-semibold", apiUptime > 99.9 ? "text-green-600" : "text-amber-600")}>{apiUptime.toFixed(2)}%</p>
            </div>
            <Progress value={apiUptime} className="h-2 mt-1" indicatorClassName={apiUptime > 99.9 ? "bg-green-500" : "bg-amber-500"}/>
            <p className="text-xs text-slate-400 mt-1">Last 30d</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Server size={16} className="text-slate-500 mr-3"/>
          <div className="flex-grow">
            <div className="flex justify-between text-sm">
              <p className="font-medium text-slate-700">Server Health</p>
              <p className={cn("font-semibold", serverHealth > 95 ? "text-green-600" : "text-amber-600")}>{serverHealth.toFixed(0)}%</p>
            </div>
            <Progress value={serverHealth} className="h-2 mt-1" indicatorClassName={serverHealth > 95 ? "bg-green-500" : "bg-amber-500"}/>
            <p className="text-xs text-slate-400 mt-1">8 nodes - all green</p>
          </div>
        </div>

        <div className="flex items-center">
          <Database size={16} className="text-slate-500 mr-3"/>
          <div className="flex-grow">
            <div className="flex justify-between text-sm">
              <p className="font-medium text-slate-700">Database</p>
              <p className={cn("font-semibold", databaseHealth > 90 ? "text-blue-600" : "text-amber-600")}>{databaseHealth.toFixed(0)}%</p>
            </div>
            <Progress value={databaseHealth} className="h-2 mt-1" indicatorClassName={databaseHealth > 90 ? "bg-blue-500" : "bg-amber-500"}/>
            <p className="text-xs text-slate-400 mt-1">p95 18ms</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Zap size={16} className="text-slate-500 mr-3"/>
          <div className="flex-grow">
            <div className="flex justify-between text-sm">
              <p className="font-medium text-slate-700">Failed Payments</p>
              <p className={cn("font-semibold", failedPaymentsPercentage < 5 ? "text-green-600" : "text-red-600")}>{failedPaymentsPercentage.toFixed(1)}%</p>
            </div>
            <Progress value={failedPaymentsPercentage} className="h-2 mt-1" indicatorClassName={failedPaymentsPercentage < 5 ? "bg-green-500" : "bg-red-500"}/>
            <p className="text-xs text-slate-400 mt-1">Last 24h</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard({ currentUser, data, onNavigate }: AdminDashboardProps) {
  // 1. SAARE STATES (Hamesha Sabse Upar)
  const [refreshKey, setRefreshKey] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [userToProcess, setUserToProcess] = useState<User | null>(null);
  const [dateTime, setDateTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [viewParams, setViewParams] = useState<any>({});

  const handleNavigate = (page: string, params: any) => {
    setActiveView(page);
    setViewParams(params);
  }


  // 2. USE-EFFECT (EK HI BLOCK MEIN)
  useEffect(() => {
    setMounted(true); 
    const timer = setInterval(() => setDateTime(new Date()), 60000);
    const refreshInterval = setInterval(() => setRefreshKey(p => p + 1), 5000);
    
    return () => {
      clearInterval(timer);
      clearInterval(refreshInterval);
    }
  }, []);

  // 3. SAARE USE-MEMO (Return null se PEHLE aane chahiye)
  const allUsersArray = useMemo(() => Object.values(getUsers()), [refreshKey]);
  const globalData = useMemo(() => getGlobalAppData(), [refreshKey]);
  const camps = useMemo(() => getAllApprovedCamps(), [refreshKey]);
  const pendingCamps = useMemo(() => getPendingCamps().sort((a,b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()), [refreshKey]);
  
  const totalUsersCount = allUsersArray.length;

  const pendingOrganizers = useMemo(() =>
    allUsersArray.filter(u => u.role === 'organizer' && !u.isApproved && !u.isRejected).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [allUsersArray]
  );

  const approvedOrganizers = useMemo(() => 
    allUsersArray.filter(u => u.role === 'organizer' && u.isApproved), 
  [allUsersArray]);

  const approvedUsersList = useMemo(() =>
    allUsersArray.filter(u => {
      if (u.role === 'admin') return true;
      if (u.role === 'organizer') return u.isApproved === true && u.status !== 'suspended' && u.status !== 'blocked';
      return u.status !== 'suspended' && u.status !== 'blocked';
    }),
    [allUsersArray]
  );

  const allActivities = useMemo(() => {
    const activities: LiveFeedActivity[] = [];
    const recentCamps = camps.filter(c => new Date(c.addedAt) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000));
    recentCamps.forEach(c => activities.push({ id: `camp-appr-${c.id}`, type: 'Camp approved', message: `Camp '${c.name}' approved`, time: c.addedAt }));
    const recentUsers = allUsersArray.filter(u => new Date(u.createdAt) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000));
    recentUsers.forEach(u => activities.push({ id: `usr-${u.email}`, type: 'New organizer registered', message: `New organizer '${u.organizerProfile?.businessName || u.firstName}' registered`, time: u.createdAt }));
    globalData.allBookings.forEach(b => {
        activities.push({
            id: `bk-${b.id}`,
            type: b.status === 'Confirmed' ? 'Booking completed' : 'Refund processed',
            message: b.status === 'Confirmed' ? `Booking ${b.id.substring(0,5)} by ${b.customer}` : `Refund for BK-${b.id.substring(0,5)} (${fmt(b.amount)})`,
            time: b.addedAt,
        });
    });
    globalData.allReviews.forEach((r: Review) => {
        activities.push({ id: `rev-${r.id}`, type: 'New review', message: `New ${r.rating}★ review on '${r.camp}'`, time: r.date });
    });
    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0,7);
  }, [globalData, allUsersArray, camps]);

  const totalRevenue = globalData.allBookings.reduce((sum, b) => sum + (b.status === 'Confirmed' ? b.amount : 0), 0);
  const revenueToday = globalData.allBookings.filter(b => {
    const bookingDate = new Date(b.addedAt);
    const today = new Date();
    return bookingDate.getDate() === today.getDate() && bookingDate.getMonth() === today.getMonth() && bookingDate.getFullYear() === today.getFullYear() && b.status === 'Confirmed';
  }).reduce((sum, b) => sum + b.amount, 0);

  const totalCommission = globalData.allBookings.reduce((sum, b) => sum + (b.status === 'Confirmed' ? (b.commissionAmount || 0) : 0), 0);
  const activeMembers = allUsersArray.filter(u => u.membership?.status === 'active').length;
  const auditTotal = pendingCamps.length + pendingOrganizers.length;
  const activeOrganizers = approvedOrganizers.length;
  const totalCamps = camps.length;
  const liveBookings = globalData.allBookings.filter(b => b.status === 'Confirmed').length;
  
  const { monthlyGrowth, conversionRate, refundRequests } = useMemo(() => {
    const now = new Date();
    const last30DaysStart = new Date();
    last30DaysStart.setDate(now.getDate() - 30);
    const prev30DaysStart = new Date();
    prev30DaysStart.setDate(now.getDate() - 60);
    const last30DaysRevenue = globalData.allBookings.filter(b => new Date(b.addedAt) >= last30DaysStart && b.status === 'Confirmed').reduce((sum, b) => sum + b.amount, 0);
    const prev30DaysRevenue = globalData.allBookings.filter(b => new Date(b.addedAt) >= prev30DaysStart && new Date(b.addedAt) < last30DaysStart && b.status === 'Confirmed').reduce((sum, b) => sum + b.amount, 0);
    let growth = prev30DaysRevenue > 0 ? ((last30DaysRevenue - prev30DaysRevenue) / prev30DaysRevenue) * 100 : (last30DaysRevenue > 0 ? 100 : 0);
    const usersWithBookings = new Set(globalData.allBookings.map(b => b.userEmail)).size;
    const rate = totalUsersCount > 0 ? (usersWithBookings / totalUsersCount) * 100 : 0;
    const refunds = globalData.allBookings.filter(b => b.status === 'Cancelled').length;
    return { monthlyGrowth: `${growth.toFixed(1)}%`, conversionRate: `${rate.toFixed(2)}%`, refundRequests: refunds };
  }, [globalData.allBookings, totalUsersCount]);

  const generateDynamicChartData = (base = 50, points = 7, variance = 0.5) => {
    let lastValue = base;
    return Array.from({ length: points }, () => {
      const change = (Math.random() - 0.5) * 2 * variance * lastValue;
      lastValue = Math.max(10, lastValue + change);
      return { value: lastValue };
    });
  };

  const platformStats: StatCardProps[] = useMemo(() => [
    { title: 'Total Revenue', value: fmt(totalRevenue), subtext: 'vs last 7d', trend: '12.4%', trendDirection: 'up', icon: DollarSign, iconBgColor: 'bg-green-500', chartData: generateDynamicChartData(totalRevenue/7, 7, 0.3), onClick: () => handleNavigate('bookings', { tab: 'all' }) },
    { title: 'Platform Earnings', value: fmt(totalCommission), subtext: '15% commission', trend: '9.1%', trendDirection: 'up', icon: CreditCard, iconBgColor: 'bg-green-500', chartData: generateDynamicChartData(totalCommission/7, 7, 0.3), onClick: () => handleNavigate('bookings', { tab: 'all' }) },
    { title: 'Total Users', value: totalUsersCount, subtext: '', trend: '6.2%', trendDirection: 'up', icon: Users, iconBgColor: 'bg-blue-500', chartData: generateDynamicChartData(totalUsersCount/7, 7, 0.2), onClick: () => handleNavigate('users', { tab: 'all' }) },
    { title: 'Verified Users', value: approvedUsersList.length, subtext: `${totalUsersCount > 0 ? Math.round((approvedUsersList.length/totalUsersCount)*100) : 0}% verified`, trend: '4.7%', trendDirection: 'up', icon: ShieldCheck, iconBgColor: 'bg-green-500', chartData: generateDynamicChartData(approvedUsersList.length/7, 7, 0.2), onClick: () => handleNavigate('users', { tab: 'verified' }) },
    { title: 'Active Organizers', value: activeOrganizers, subtext: '', trend: '3.1%', trendDirection: 'up', icon: Briefcase, iconBgColor: 'bg-green-500', chartData: generateDynamicChartData(activeOrganizers/7, 7, 0.1), onClick: () => handleNavigate('organizers', { tab: 'verified' }) },
    { title: 'Total Camps', value: totalCamps, subtext: '', trend: '8.4%', trendDirection: 'up', icon: Mountain, iconBgColor: 'bg-green-500', chartData: generateDynamicChartData(totalCamps/7, 7, 0.1), onClick: () => handleNavigate('approvals', { tab: 'approved' }) },
    { title: 'Active Bookings', value: liveBookings, subtext: '', trend: '18.6%', trendDirection: 'up', icon: CalendarCheck, iconBgColor: 'bg-blue-500', chartData: generateDynamicChartData(liveBookings/7, 7, 0.4), onClick: () => handleNavigate('bookings', { tab: 'confirmed' }) },
    { title: 'Refund Requests', value: refundRequests, subtext: '3 urgent', trend: '14.2%', trendDirection: 'down', icon: ArrowLeftRight, iconBgColor: 'bg-red-500', chartData: generateDynamicChartData(refundRequests/7, 7, 0.8), onClick: () => handleNavigate('bookings', { tab: 'refunded' }) },
    { title: 'Pending Approvals', value: auditTotal, subtext: 'Action required', trend: '2%', trendDirection: 'stale', icon: Clock, iconBgColor: 'bg-amber-500', chartData: generateDynamicChartData(auditTotal/7, 7, 0.5), onClick: () => handleNavigate('approvals', { tab: 'pending' }) },
    { title: 'Membership Subs', value: activeMembers, subtext: '', trend: '7.3%', trendDirection: 'stale', icon: Gem, iconBgColor: 'bg-amber-500', chartData: generateDynamicChartData(activeMembers/7, 7, 0.2), onClick: () => handleNavigate('memberships', { tab: 'subscribers' }) },
    { title: 'Monthly Growth', value: monthlyGrowth, subtext: '', trend: '2.4%', trendDirection: 'up', icon: TrendingUp, iconBgColor: 'bg-green-500', chartData: generateDynamicChartData(50, 7, 0.6) },
    { title: 'Conversion Rate', value: conversionRate, subtext: '', trend: '0.8%', trendDirection: 'up', icon: Target, iconBgColor: 'bg-blue-500', chartData: generateDynamicChartData(5, 7, 0.1) },
  ], [totalRevenue, totalCommission, totalUsersCount, approvedUsersList.length, activeOrganizers, totalCamps, liveBookings, refundRequests, auditTotal, activeMembers, monthlyGrowth, conversionRate, handleNavigate]);

  // 4. CONDITIONAL RETURN (Hooks ke BAAD aur JSX se PEHLE)

  if (activeView === 'approvals') {
    return <AdminOrganizers onBack={() => setActiveView('dashboard')} initialTab={viewParams?.tab} />
  }
  if (activeView === 'users') {
    return <AdminUsers onBack={() => setActiveView('dashboard')} initialTab={viewParams?.tab} />
  }
  if (activeView === 'bookings') {
    return <AdminBookings onBack={() => setActiveView('dashboard')} initialTab={viewParams?.tab} />
  }

  if (!mounted) return null;

  // 5. EVENT HANDLERS
  const handleOrgAction = (email: string, action: 'approve' | 'reject', reason?: string) => {
    const allUsers = getUsers();
    const userToUpdate = allUsers[email.toLowerCase()];
    if (!userToUpdate) return;
    const updatedUser = { ...userToUpdate };
    if (action === 'approve') {
      updatedUser.isApproved = true;
      updatedUser.status = 'active';
      toast({ title: 'Partner Verified' });
    } else {
      updatedUser.isRejected = true;
      updatedUser.rejectionReason = reason;
      toast({ variant: 'destructive', title: 'Partner Rejected' });
    }
    saveUsers({ ...allUsers, [email.toLowerCase()]: updatedUser });
    setIsRejectDialogOpen(false);
    setRefreshKey(p => p + 1);
  };

  const handleCampAction = (campId: string, action: 'approve' | 'reject') => {
    const pending = getPendingCamps();
    const camp = pending.find(c => c.id === campId);
    if (!camp) return;
    savePendingCamps(pending.filter(c => c.id !== campId));
    if (action === 'approve') {
      camp.status = 'approved';
      saveApprovedCamps([camp, ...getAllApprovedCamps()]);
      toast({ title: 'Camp Approved' });
    } else {
      saveRejectedCamps([camp, ...getRejectedCamps()]);
      toast({ variant: 'destructive', title: 'Camp Rejected' });
    }
    setRefreshKey(p => p + 1);
  };

  const formattedDate = dateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // 6. FINAL JSX RETURN
  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8 pb-12 font-sans font-normal animate-in fade-in duration-500">
       <div className="bg-gradient-to-br from-green-800 to-green-600 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap justify-between items-start mb-6">
            <div className="text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Operations live - {formattedDate} - {formattedTime}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-2">Good morning, {currentUser.firstName} 👋</h2>
              <p className="text-green-200 max-w-lg">Here's what's moving across the Wildhaven platform today.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <HeaderStat icon={Mountain} label="Active Trips" value={totalCamps} />
              <HeaderStat icon={BookOpenCheck} label="Live Bookings" value={liveBookings} />
              <HeaderStat icon={CircleDollarSign} label="Revenue Today" value={fmt(revenueToday)} />
              <HeaderStat icon={AlertTriangle} label="Pending" value={auditTotal} isHighlighted />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {platformStats.slice(0, 12).map(stat => <StatCard key={stat.title} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7"><RevenueAnalytics bookings={globalData.allBookings} /></div>
        <div className="lg:col-span-5"><CampMix camps={camps} /></div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BookingTrendsChart bookings={globalData.allBookings} />
          <UserGrowthChart users={allUsersArray} />
          <RevenueVsBookingsChart bookings={globalData.allBookings} />
      </div>

      <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                  <ModerationQueues
                      pendingOrganizers={pendingOrganizers}
                      pendingCamps={pendingCamps}
                      onApproveOrg={(email) => handleOrgAction(email, 'approve')}
                      onRejectOrg={(user) => { setUserToProcess(user); setIsRejectDialogOpen(true); }}
                      onApproveCamp={(id) => handleCampAction(id, 'approve')}
                      onRejectCamp={(id) => handleCampAction(id, 'reject')}
                      onNavigate={handleNavigate}
                  />
              </div>
              <div className="lg:col-span-4">
                  <LiveActivityFeed activities={allActivities} onNavigate={onNavigate} />
              </div>
          </div>
      </div>

      <RecentBookings bookings={globalData.allBookings} users={allUsersArray} onNavigateToBookings={() => handleNavigate('bookings', { tab: 'all' })} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RecentTransactions bookings={globalData.allBookings} onNavigateToBookings={() => handleNavigate('bookings', { tab: 'all' })}/>
        <SystemHealth bookings={globalData.allBookings} />
      </div>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reason for Rejection</DialogTitle></DialogHeader>
          <div className="py-4"><Textarea placeholder="Reason..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => userToProcess && handleOrgAction(userToProcess.email, 'reject', rejectionReason)}>Confirm Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface HeaderStatProps {
    icon: FC<LucideProps>;
    label: string;
    value: string | number;
    isHighlighted?: boolean;
}

const HeaderStat: FC<HeaderStatProps> = ({ icon: Icon, label, value, isHighlighted = false }) => (
  <div className={cn("flex flex-col items-center justify-center rounded-2xl p-4 transition-all", isHighlighted ? "bg-green-500/80 shadow-lg" : "bg-black/20")}>
    <div className={cn("p-3 rounded-full mb-2", isHighlighted ? "bg-white/20" : "bg-white/10")}>
      <Icon size={20} className="text-white" />
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-[10px] font-semibold text-green-200 uppercase tracking-wider">{label}</div>
  </div>
);
