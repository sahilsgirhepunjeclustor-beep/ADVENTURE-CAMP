"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Booking, Camp } from '@/lib/types';
import { getGlobalAppData, getAllApprovedCamps, getAppData, saveAppData } from '@/lib/store';
import { fmt, fmtDate, cn, uid } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ArrowLeft,
  RotateCcw,
  ShieldAlert,
  CreditCard,
  Ban,
  MoreHorizontal,
  HandCoins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminBookingsProps {
  initialFilter?: 'All' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Refunded' | 'Disputed';
  onBack?: () => void;
}

export default function AdminBookings({ initialFilter = 'All', onBack }: AdminBookingsProps) {
  const [filter, setFilter] = useState(initialFilter);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Manual Booking Form State (Override)
  const [newBooking, setNewBooking] = useState({
    customer: '',
    customerEmail: '',
    campId: '',
    amount: '',
    checkin: '',
    checkout: '',
    status: 'Confirmed' as const
  });

  const camps = useMemo(() => getAllApprovedCamps(), []);

  const { enrichedBookings, summary } = useMemo(() => {
    const global = getGlobalAppData();
    const allCamps = getAllApprovedCamps();
    
    const enriched = global.allBookings.map(b => {
      const camp = allCamps.find(c => c.id === b.campId);
      return { 
        ...b, 
        organizer: camp?.organizer || 'Unknown Organizer' 
      };
    }).sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

    const confirmedCount = enriched.filter(b => b.status === 'Confirmed').length;
    const disputedCount = enriched.filter(b => b.status === 'Disputed').length;
    const totalRevenue = enriched.filter(b => b.status === 'Confirmed').reduce((s, b) => s + b.amount, 0);
    const totalCommission = enriched.filter(b => b.status === 'Confirmed').reduce((s, b) => s + (b.commissionAmount || 0), 0);

    return { 
      enrichedBookings: enriched, 
      summary: { confirmedCount, disputedCount, totalRevenue, totalCommission, totalItems: enriched.length } 
    };
  }, [refreshKey]);

  const filteredBookings = enrichedBookings.filter(b => {
    const matchesSearch = 
      b.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.camp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (filter === 'All') return matchesSearch;
    return b.status === filter && matchesSearch;
  });

  const handleUpdateStatus = (bookingId: string, email: string, newStatus: Booking['status']) => {
    const data = getAppData(email);
    data.bookings = data.bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
    saveAppData(email, data);
    setRefreshKey(prev => prev + 1);
    toast({ 
      title: `Booking ${newStatus}`, 
      description: `Action logged successfully for transaction #${bookingId}.` 
    });
  };

  const handleDelete = (bookingId: string, email: string) => {
    if (confirm('Permanently erase this transaction from platform records? This audit action cannot be undone.')) {
      const data = getAppData(email);
      data.bookings = data.bookings.filter(b => b.id !== bookingId);
      saveAppData(email, data);
      setRefreshKey(prev => prev + 1);
      toast({ variant: 'destructive', title: 'Record Terminated' });
    }
  };

  const handleManualBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.customer || !newBooking.campId || !newBooking.amount) return;

    const selectedCamp = camps.find(c => c.id === newBooking.campId);
    const email = newBooking.customerEmail || 'offline@trailwise.com';
    const data = getAppData(email);
    const amount = Number(newBooking.amount);

    const booking: Booking = {
      id: 'OV-' + uid().toUpperCase(),
      customer: newBooking.customer,
      customerEmail: email,
      camp: selectedCamp?.name || 'Manual Adventure',
      campId: newBooking.campId,
      checkin: newBooking.checkin || selectedCamp?.startDate || '',
      checkout: newBooking.checkout || selectedCamp?.endDate || '',
      amount: amount,
      commissionAmount: amount * 0.10, // 10% standard commission
      status: newBooking.status,
      addedAt: new Date().toISOString(),
      organizerNotice: true
    };

    data.bookings = [booking, ...data.bookings];
    saveAppData(email, data);
    setRefreshKey(prev => prev + 1);
    setIsManualBookingOpen(false);
    setNewBooking({ customer: '', customerEmail: '', campId: '', amount: '', checkin: '', checkout: '', status: 'Confirmed' });
    toast({ title: 'Override Successful', description: 'Manual transaction added to platform ledger.' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans max-w-7xl mx-auto px-4 md:px-0">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onBack} 
              className="rounded-full h-12 w-12 border-slate-200 shadow-sm hover:bg-slate-50 shrink-0"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Booking Control Center</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Platform-Wide Transaction Ledger</p>
          </div>
        </div>
        <Dialog open={isManualBookingOpen} onOpenChange={setIsManualBookingOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-12 px-6 bg-primary hover:bg-accent font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 gap-3 text-white border-none">
              <Plus size={16} /> Override & New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden font-sans">
            <DialogHeader className="sr-only">
              <DialogTitle>System Override Form</DialogTitle>
              <DialogDescription>Administrative override to manually insert offline or exception bookings into the platform ledger.</DialogDescription>
            </DialogHeader>
            <div className="bg-[#0d2a1d] p-8 text-white">
               <h3 className="text-sm font-black uppercase tracking-widest">Manual Override</h3>
               <p className="text-[10px] text-green-200/60 font-bold mt-1 uppercase tracking-tight">Direct Injection into Transaction Ledger</p>
            </div>
            <form onSubmit={handleManualBookingSubmit} className="p-8 space-y-5 bg-white">
               <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Explorer Full Name</Label>
                  <Input value={newBooking.customer} onChange={e => setNewBooking({...newBooking, customer: e.target.value})} className="rounded-xl h-12 font-bold" placeholder="e.g. Sahil Girhepunje" required />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Expedition Selection</Label>
                  <Select onValueChange={v => setNewBooking({...newBooking, campId: v})}>
                    <SelectTrigger className="rounded-xl h-12 font-bold">
                      <SelectValue placeholder="Select Expedition" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                      {camps.map(c => (
                        <SelectItem key={c.id} value={c.id} className="font-bold text-xs uppercase">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Price Override (₹)</Label>
                     <Input type="number" value={newBooking.amount} onChange={e => setNewBooking({...newBooking, amount: e.target.value})} className="rounded-xl h-12 font-black" placeholder="₹" required />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ledger Status</Label>
                     <Select onValueChange={(v: any) => setNewBooking({...newBooking, status: v})}>
                        <SelectTrigger className="rounded-xl h-12 font-bold uppercase">
                           <SelectValue placeholder="Confirmed" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                           <SelectItem value="Confirmed" className="text-[10px] font-black uppercase">Confirmed (Paid)</SelectItem>
                           <SelectItem value="Pending" className="text-[10px] font-black uppercase">Pending (Unpaid)</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>
               <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest mt-4 shadow-2xl shadow-primary/20 text-white border-none">Commit Override</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Intelligence Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all border-t-[6px] border-t-green-500">
           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">GROSS REVENUE</div>
           <div className="text-2xl font-black text-slate-900 tracking-tight">{fmt(summary.totalRevenue)}</div>
        </div>
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all border-t-[6px] border-t-blue-500">
           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">PLATFORM COMMISSIONS</div>
           <div className="text-2xl font-black text-primary tracking-tight">{fmt(summary.totalCommission)}</div>
        </div>
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all border-t-[6px] border-t-amber-500">
           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">ACTIVE DISPUTES</div>
           <div className="text-2xl font-black text-slate-900 tracking-tight">{summary.disputedCount}</div>
        </div>
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all border-t-[6px] border-t-slate-900">
           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">TOTAL AUDIT SIZE</div>
           <div className="text-2xl font-black text-slate-900 tracking-tight">{summary.totalItems} Records</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-xl flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
           <Input 
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
             placeholder="Audit Search (Customer, ID, Expedition)..." 
             className="pl-12 h-12 rounded-2xl bg-slate-50 border-none font-bold text-xs uppercase tracking-tight"
           />
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-2 w-full lg:w-auto">
          {['All', 'Confirmed', 'Pending', 'Cancelled', 'Refunded', 'Disputed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                filter === f 
                  ? "bg-primary text-white border-primary shadow-xl shadow-primary/10" 
                  : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              {f === 'All' ? 'Full Ledger' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-left">Expedition Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-left">Explorer</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-left">Timeline</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-left">Financials</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-left">Audit State</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Operations</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-32 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-slate-200">
                       <CreditCard size={40} />
                    </div>
                    <p className="text-base font-black text-slate-300 uppercase tracking-[0.2em] italic">No Transactions Found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((b) => (
                  <TableRow key={b.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                    <TableCell className="px-8 py-6">
                       <div className="text-xs font-black text-slate-900 uppercase tracking-tighter leading-none mb-1.5">{b.camp}</div>
                       <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <Badge variant="outline" className="px-1 py-0 rounded text-[7px] border-slate-200 text-slate-400 bg-white">ID: {b.id}</Badge>
                       </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="text-xs font-black text-slate-900 uppercase tracking-tighter">{b.customer}</div>
                      <div className="text-[9px] text-slate-400 font-medium lowercase truncate max-w-[150px] mt-0.5">{b.customerEmail}</div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">
                        {fmtDate(b.checkin)}
                        <span className="mx-2 text-slate-300">→</span>
                        {fmtDate(b.checkout)}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="text-xs font-black text-slate-900 tracking-tight leading-none mb-1">{fmt(b.amount)}</div>
                      <div className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Comm: {fmt(b.commissionAmount || 0)}</div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-black uppercase px-3 py-1 rounded-xl border-none shadow-sm",
                        b.status === 'Confirmed' ? "bg-green-100 text-green-700" : 
                        b.status === 'Cancelled' ? "bg-red-50 text-red-600" : 
                        b.status === 'Refunded' ? "bg-rose-50 text-rose-600" :
                        b.status === 'Disputed' ? "bg-amber-100 text-amber-700" :
                        "bg-orange-100 text-orange-700"
                      )}>
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {b.status === 'Pending' && (
                          <button 
                            onClick={() => handleUpdateStatus(b.id, b.customerEmail, 'Confirmed')}
                            className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm"
                            title="Verify Payment"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-slate-100"><MoreHorizontal size={18} /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl min-w-[180px] shadow-2xl border-none p-2 font-sans">
                            <DropdownMenuLabel className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">Security Ops</DropdownMenuLabel>
                            
                            {b.status !== 'Cancelled' && b.status !== 'Refunded' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(b.id, b.customerEmail, 'Cancelled')} className="text-[10px] font-bold gap-3 rounded-xl py-2 px-3 cursor-pointer">
                                <Ban size={14} className="text-red-500" /> Cancel Booking
                              </DropdownMenuItem>
                            )}
                            
                            {b.status === 'Cancelled' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(b.id, b.customerEmail, 'Refunded')} className="text-[10px] font-bold gap-3 rounded-xl py-2 px-3 cursor-pointer">
                                <CreditCard size={14} className="text-rose-500" /> Process Refund
                              </DropdownMenuItem>
                            )}

                            {b.status !== 'Disputed' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(b.id, b.customerEmail, 'Disputed')} className="text-[10px] font-bold gap-3 rounded-xl py-2 px-3 cursor-pointer">
                                <ShieldAlert size={14} className="text-amber-500" /> Mark Disputed
                              </DropdownMenuItem>
                            )}

                            {b.status === 'Disputed' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(b.id, b.customerEmail, 'Confirmed')} className="text-[10px] font-bold gap-3 rounded-xl py-2 px-3 cursor-pointer">
                                <RotateCcw size={14} className="text-green-500" /> Resolve Dispute
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem onClick={() => handleDelete(b.id, b.customerEmail)} className="text-[10px] font-bold gap-3 rounded-xl py-2 px-3 text-destructive hover:bg-red-50 cursor-pointer">
                               <Trash2 size={14} /> Terminate Record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination & Audit Info */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 px-2 pb-20">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Platform Audit Log: showing {filteredBookings.length} of {summary.totalItems} entries
        </p>
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" className="rounded-xl h-10 px-5 font-black uppercase text-[10px] tracking-widest border-slate-200">Prev</Button>
           <div className="px-5 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-tight">
             Page 1 of 1
           </div>
           <Button variant="outline" size="sm" className="rounded-xl h-10 px-5 font-black uppercase text-[10px] tracking-widest border-slate-200">Next</Button>
        </div>
      </div>
    </div>
  );
}
