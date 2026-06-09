import React, { useState, useEffect, useMemo } from 'react';
import { getGlobalAppData, saveAppData, getAppData, getAllApprovedCamps, getCurrentUser, logAdminAction } from '@/lib/store';
import { Booking, Camp } from '@/lib/types';
import { 
  Search, Users, Ban, MoreHorizontal, FileText, Plus, DollarSign, TrendingUp, TrendingDown, 
  ChevronLeft, ChevronRight, ShieldAlert, Clock, CheckCircle2, Check, X, ArrowLeft, CreditCard, RotateCcw, BarChart2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';
import { cn, fmt, fmtDate, uid } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StatCard = ({ title, value, icon, color, trend }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'green' | 'blue' | 'orange' | 'red' | 'purple';
  trend?: string;
}) => {
    const trendIcon = trend?.includes('+') ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
    const trendColor = trend?.includes('+') ? 'text-green-600' : 'text-red-600';
    const colors = {
        green: { bg: 'bg-green-50', text: 'text-green-700', iconBg: 'bg-green-100' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-700', iconBg: 'bg-orange-100' },
        red: { bg: 'bg-red-50', text: 'text-red-700', iconBg: 'bg-red-100' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100' },
    };
    const selectedColor = colors[color];
    const Icon = icon;

    return (
        <div className={`p-5 rounded-2xl shadow-sm border border-slate-100/80 ${selectedColor.bg}`}>
            <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedColor.iconBg}`}>
                    <Icon size={16} className={selectedColor.text} />
                </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            {trend && <p className={`mt-1 text-xs font-semibold flex items-center gap-1 ${trendColor}`}>{trendIcon} {trend}</p>}
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onCancel, onConfirm, title, description }: {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md font-sans p-8 text-center">
                <ShieldAlert size={48} className="mx-auto text-amber-500 mb-4" />
                <h3 className="text-2xl font-extrabold text-gray-800">{title}</h3>
                <p className="text-gray-500 font-medium mt-2">{description}</p>
                <div className="mt-8 flex gap-4">
                    <Button onClick={onCancel} className="w-full h-12 rounded-xl text-base font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm">Cancel</Button>
                    <Button onClick={() => { onConfirm(); onCancel(); }} className="w-full h-12 rounded-xl text-base font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30">Confirm</Button>
                </div>
            </div>
        </div>
    );
};


interface AdminBookingsProps {
    onBack?: () => void;
    initialTab?: string;
    onNavigate?: (page: string, params?: any) => void;
}

export default function AdminBookings({ onBack, initialTab = 'all', onNavigate }: AdminBookingsProps) {
  const [view, setView] = useState(initialTab);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({ customer: '', customerEmail: '', campId: '', amount: '', checkin: '', checkout: '', status: 'Confirmed' as const });
  const [actionToConfirm, setActionToConfirm] = useState<{ action: () => void, title: string, description: string } | null>(null);

  const adminUser = useMemo(() => getCurrentUser(), []);
  const camps = useMemo(() => getAllApprovedCamps(), []);

  useEffect(() => {
    const global = getGlobalAppData();
    const enriched = global.allBookings.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    setAllBookings(enriched);
  }, []);

  useEffect(() => {
    setView(initialTab);
    setCurrentPage(1);
  }, [initialTab]);

  const { tableData, stats } = useMemo(() => {
    let filteredData = allBookings;
    const currentView = view || 'all';

    if (currentView !== 'all') {
        const status = currentView.charAt(0).toUpperCase() + currentView.slice(1);
        filteredData = allBookings.filter(b => b.status === status);
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(b => 
            (b.customer?.toLowerCase().includes(query) ||
             b.camp?.toLowerCase().includes(query) ||
             b.id?.toLowerCase().includes(query))
        );
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const isToday = (d: string) => d && new Date(d).toDateString() === new Date().toDateString();
    
    const confirmed = allBookings.filter(b => b.status === 'Confirmed');
    const cancelled = allBookings.filter(b => b.status === 'Cancelled');
    const refunded = allBookings.filter(b => b.status === 'Refunded');
    const pending = allBookings.filter(b => b.status === 'Pending');
    const disputed = allBookings.filter(b => b.status === 'Disputed');
    
    const newIn30d = allBookings.filter(b => new Date(b.addedAt) > thirtyDaysAgo);
    const newInPrev30d = allBookings.filter(b => new Date(b.addedAt) > sixtyDaysAgo && new Date(b.addedAt) <= thirtyDaysAgo);
    
    const confirmedIn30d = confirmed.filter(b => new Date(b.addedAt) > thirtyDaysAgo);
    const confirmedInPrev30d = confirmed.filter(b => new Date(b.addedAt) > sixtyDaysAgo && new Date(b.addedAt) <= thirtyDaysAgo);

    const cancelledIn30d = cancelled.filter(b => new Date(b.addedAt) > thirtyDaysAgo);
    const refundedIn30d = refunded.filter(b => new Date(b.addedAt) > thirtyDaysAgo);

    const gmv30d = confirmedIn30d.reduce((s, b) => s + b.amount, 0);
    const gmvPrev30d = confirmedInPrev30d.reduce((s, b) => s + b.amount, 0);

    const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? '+100.0%' : '+0.0%';
        const percentage = ((current - previous) / previous) * 100;
        return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
    }

    const calculatedStats = {
      all: [
        { title: "Active Bookings", value: confirmed.length, icon: BarChart2, color: 'green', trend: calculateTrend(newIn30d.length, newInPrev30d.length) },
        { title: "Today's Check-ins", value: confirmed.filter(b => isToday(b.checkin!)).length, icon: Check, color: 'blue' },
        { title: "Today's Check-outs", value: confirmed.filter(b => isToday(b.checkout!)).length, icon: X, color: 'orange' },
        { title: "GMV (30d)", value: fmt(gmv30d), icon: DollarSign, color: 'purple', trend: calculateTrend(gmv30d, gmvPrev30d) },
      ],
      confirmed: [
        { title: "Active Bookings", value: confirmed.length, icon: BarChart2, color: 'green', trend: calculateTrend(newIn30d.length, newInPrev30d.length) },
        { title: "Today's Check-ins", value: confirmed.filter(b => isToday(b.checkin!)).length, icon: Check, color: 'blue' },
        { title: "Today's Check-outs", value: confirmed.filter(b => isToday(b.checkout!)).length, icon: X, color: 'orange' },
        { title: "GMV (30d)", value: fmt(gmv30d), icon: DollarSign, color: 'purple', trend: calculateTrend(gmv30d, gmvPrev30d) },
      ],
      cancelled: [
        { title: "Cancelled (30d)", value: cancelledIn30d.length, icon: Ban, color: 'red' },
        { title: "Cancellation Rate (30d)", value: `${newIn30d.length > 0 ? ((cancelledIn30d.length / newIn30d.length) * 100).toFixed(1) : 0}%`, icon: BarChart2, color: 'orange' },
        { title: "Total Commission Lost (30d)", value: fmt(cancelledIn30d.reduce((s, b) => s + b.commissionAmount, 0)), icon: DollarSign, color: 'blue' },
        { title: "Total Value Lost (30d)", value: fmt(cancelledIn30d.reduce((s, b) => s + b.amount, 0)), icon: CreditCard, color: 'green' },
      ],
      refunded: [
        { title: "Cancellations to Refund", value: cancelled.filter(c => !refunded.some(r => r.id === c.id)).length, icon: Clock, color: 'orange' },
        { title: "Refunded Value (30d)", value: fmt(refundedIn30d.reduce((s, b) => s + b.amount, 0)), icon: RotateCcw, color: 'green' },
        { title: "Refunded Bookings (30d)", value: refundedIn30d.length, icon: Users, color: 'blue' },
        { title: "Total Refunded (All Time)", value: fmt(refunded.reduce((s, b) => s + b.amount, 0)), icon: AlertCircle, color: 'red' },
      ],
      pending: [
        { title: "Pending Bookings", value: pending.length, icon: Clock, color: 'orange' },
        { title: "Pending Amount", value: fmt(pending.reduce((s, b) => s + b.amount, 0)), icon: DollarSign, color: 'blue' },
      ],
      disputed: [
        { title: "Disputed Bookings", value: disputed.length, icon: ShieldAlert, color: 'red' },
        { title: "Disputed Amount", value: fmt(disputed.reduce((s, b) => s + b.amount, 0)), icon: DollarSign, color: 'orange' },
      ],
    };

    return { tableData: filteredData, stats: calculatedStats };
  }, [view, allBookings, searchQuery]);

  const paginatedData = tableData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(tableData.length / itemsPerPage));

  const performOptimisticUpdate = (bookingId: string, newStatus: Booking['status']) => {
    setAllBookings(currentBookings => currentBookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
  };

  const handleUpdateStatus = (bookingId: string, email: string, newStatus: Booking['status'], actionMessage: string) => {
      performOptimisticUpdate(bookingId, newStatus);
      
      setTimeout(() => {
          const data = getAppData(email);
          const updatedBookings = data.bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
          saveAppData(email, { ...data, bookings: updatedBookings });
          logAdminAction(adminUser, 'Booking Update', `Changed status of booking ${bookingId} to ${newStatus}`);
          toast({ title: "Success!", description: `Booking has been ${actionMessage}.` });
      }, 300); 
  };

  const handleDeleteBooking = (booking: Booking) => {
    setActionToConfirm({
      action: () => {
        setAllBookings(current => current.filter(b => b.id !== booking.id));
        setTimeout(() => {
            const data = getAppData(booking.customerEmail);
            saveAppData(booking.customerEmail, { ...data, bookings: data.bookings.filter(b => b.id !== booking.id) });
            logAdminAction(adminUser, 'Booking Deletion', `Deleted booking ${booking.id}`);
            toast({ title: "Booking Deleted", variant: "destructive" });
        }, 300);
      },
      title: "Delete Booking?",
      description: `This will permanently delete the booking for ${booking.customer}. This action cannot be undone.`
    });
  };

  const handleManualBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { customer, customerEmail, campId, amount, checkin, checkout, status } = newBooking;
    if (!customer || !campId || !amount) {
        toast({ title: "Missing Fields", description: "Customer, Camp, and Amount are required.", variant: "destructive" });
        return;
    }
    const selectedCamp = camps.find(c => c.id === campId);
    const email = customerEmail || 'manual@booking.com';
    const data = getAppData(email);
    const booking: Booking = {
      id: 'MBK-' + uid().toUpperCase(),
      customer, customerEmail: email, status,
      camp: selectedCamp?.name || 'N/A',
      campId, amount: +amount, checkin, checkout, 
      commissionAmount: +amount * 0.10, addedAt: new Date().toISOString(), organizerNotice: true, userEmail: 'manual', organizerEmail: selectedCamp ? selectedCamp.addedBy : 'N/A'
    };
    setAllBookings(current => [booking, ...current]);
    setIsManualBookingOpen(false);
    setNewBooking({ customer: '', customerEmail: '', campId: '', amount: '', checkin: '', checkout: '', status: 'Confirmed' });
    setTimeout(() => {
        saveAppData(email, { ...data, bookings: [booking, ...data.bookings] });
        logAdminAction(adminUser, 'Booking Creation', `Created new booking ${booking.id}`);
        toast({ title: "Booking Created!" });
    }, 300);
  };

  const handleTabClick = (tabId: string) => {
    if (onNavigate) {
      onNavigate('bookings', { tab: tabId });
    } else {
      setView(tabId);
      setCurrentPage(1);
    }
  };

  const PageTitle = () => {
      const titles: {[key: string]: {title: string, desc: string}} = {
        all: { title: 'All Bookings', desc: 'A complete log of all bookings across the platform.' },
        pending: { title: 'Pending Bookings', desc: 'Bookings awaiting payment or confirmation.' },
        confirmed: { title: 'Active Bookings', desc: 'Confirmed and upcoming reservations.' },
        cancelled: { title: 'Cancelled Bookings', desc: 'All cancellations across the platform.' },
        refunded: { title: 'Refund Requests', desc: 'Refunds pending review and processing.' },
        disputed: { title: 'Disputed Bookings', desc: 'Bookings with payment disputes.' },
      };
      const { title, desc } = titles[view] || titles.all;
      return (
        <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500 font-medium">{desc}</p>
        </div>
      );
  }

  return (
    <>
        <div className="w-full bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-screen-xl mx-auto space-y-6">
                <header>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            {onBack && <Button variant="outline" size="icon" className="rounded-full h-10 w-10 sm:h-12 sm:w-12" onClick={onBack}><ArrowLeft size={18}/></Button>}
                            <PageTitle />
                        </div>
                        <div className="flex w-full md:w-auto items-center gap-2 sm:gap-3">
                            <Button onClick={() => setIsManualBookingOpen(true)} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-sm rounded-lg sm:rounded-xl text-sm">
                                <Plus size={16} className="mr-2"/> New Booking
                            </Button>
                        </div>
                    </div>
                    <nav className="mt-6 flex overflow-x-auto pb-2 scrollbar-hide gap-2">
                        {[
                            { id: 'all', label: 'All Bookings', icon: Users },
                            { id: 'pending', label: 'Pending', icon: Clock },
                            { id: 'confirmed', label: 'Active', icon: CheckCircle2 },
                            { id: 'cancelled', label: 'Cancelled', icon: Ban },
                            { id: 'refunded', label: 'Refunded', icon: RotateCcw },
                            { id: 'disputed', label: 'Disputed', icon: ShieldAlert },
                        ].map(item => (
                                <button key={item.id} onClick={() => handleTabClick(item.id)} className={cn("flex items-center whitespace-nowrap gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors", view === item.id ? "text-white bg-emerald-500 shadow-md" : "text-gray-600 bg-white hover:bg-gray-100 border")}>
                                    <item.icon size={16} /> {item.label}
                                </button>
                        ))}
                    </nav>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {(stats[view] || stats.all).map(card => <StatCard key={card.title} {...card} />)}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 flex justify-between items-center bg-gray-50/50 border-b border-gray-100">
                        <div className="relative w-full max-w-sm">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search by customer, camp, or ID..." className="pl-10 w-full rounded-xl bg-white" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead><tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-6 py-3">Customer</th><th className="px-6 py-3">Camp</th><th className="px-6 py-3">Dates</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedData.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4"><div className="font-bold text-sm text-gray-800">{b.customer}</div><div className="text-xs text-gray-500">{b.customerEmail}</div></td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{b.camp}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{fmtDate(b.checkin)} - {fmtDate(b.checkout)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800 font-bold">{fmt(b.amount)}</td>
                                        <td className="px-6 py-4"><Badge className={cn({'bg-emerald-100 text-emerald-700': b.status === 'Confirmed','bg-orange-100 text-orange-700': b.status === 'Pending','bg-red-100 text-red-700': b.status === 'Cancelled','bg-purple-100 text-purple-700': b.status === 'Refunded','bg-amber-100 text-amber-700': b.status === 'Disputed',})}>{b.status}</Badge></td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-gray-400"><MoreHorizontal size={18} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl">
                                                {b.status === 'Pending' && <DropdownMenuItem onClick={() => handleUpdateStatus(b.id, b.customerEmail, 'Confirmed', 'confirmed')}><Check size={14} className="mr-2"/>Confirm Payment</DropdownMenuItem>}
                                                {b.status === 'Confirmed' && <DropdownMenuItem onClick={() => handleUpdateStatus(b.id, b.customerEmail, 'Cancelled', 'cancelled')}><Ban size={14} className="mr-2"/>Cancel</DropdownMenuItem>}
                                                {b.status === 'Cancelled' && <DropdownMenuItem onClick={() => handleUpdateStatus(b.id, b.customerEmail, 'Refunded', 'refunded')}><RotateCcw size={14} className="mr-2"/>Process Refund</DropdownMenuItem>}
                                                {b.status !== 'Disputed' && <DropdownMenuItem onClick={() => handleUpdateStatus(b.id, b.customerEmail, 'Disputed', 'marked as disputed')}><ShieldAlert size={14} className="mr-2"/>Mark Disputed</DropdownMenuItem>}
                                                <DropdownMenuSeparator/>
                                                <DropdownMenuItem onClick={() => handleDeleteBooking(b)} className="text-red-600"><X size={14} className="mr-2"/>Delete</DropdownMenuItem>
                                            </DropdownMenuContent></DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-3 flex items-center justify-between bg-gray-50/50 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, tableData.length)} of {tableData.length}</span>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft size={16} /> Prev</Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next <ChevronRight size={16} /></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {isManualBookingOpen && <Dialog open onOpenChange={setIsManualBookingOpen}><DialogContent><DialogHeader><DialogTitle>Create Manual Booking</DialogTitle></DialogHeader><form onSubmit={handleManualBookingSubmit} className="p-1 space-y-4">
            <Label>Customer Name <span className="text-red-500">*</span></Label><Input required value={newBooking.customer} onChange={e => setNewBooking({...newBooking, customer: e.target.value})} />
            <Label>Customer Email</Label><Input type="email" value={newBooking.customerEmail} onChange={e => setNewBooking({...newBooking, customerEmail: e.target.value})} />
            <Label>Camp <span className="text-red-500">*</span></Label><Select onValueChange={v => setNewBooking({...newBooking, campId: v})}><SelectTrigger><SelectValue placeholder="Select camp" /></SelectTrigger><SelectContent>{camps.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
            <div className="grid grid-cols-2 gap-4"><div><Label>Amount <span className="text-red-500">*</span></Label><Input required type="number" value={newBooking.amount} onChange={e => setNewBooking({...newBooking, amount: e.target.value})} /></div><div><Label>Status</Label><Select onValueChange={(v: any) => setNewBooking({...newBooking, status: v})} defaultValue="Confirmed"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Confirmed">Confirmed</SelectItem><SelectItem value="Pending">Pending</SelectItem></SelectContent></Select></div></div>
            <div className="grid grid-cols-2 gap-4"><div><Label>Check-in</Label><Input type="date" value={newBooking.checkin} onChange={e => setNewBooking({...newBooking, checkin: e.target.value})} /></div><div><Label>Check-out</Label><Input type="date" value={newBooking.checkout} onChange={e => setNewBooking({...newBooking, checkout: e.target.value})} /></div></div>
            <div className="pt-2 flex gap-3"><Button type="button" variant="outline" onClick={() => setIsManualBookingOpen(false)}>Cancel</Button><Button type="submit">Create Booking</Button></div>
        </form></DialogContent></Dialog>}
        {actionToConfirm && <ConfirmationModal isOpen onCancel={() => setActionToConfirm(null)} onConfirm={actionToConfirm.action} title={actionToConfirm.title} description={actionToConfirm.description} />}
    </>
  );
}
