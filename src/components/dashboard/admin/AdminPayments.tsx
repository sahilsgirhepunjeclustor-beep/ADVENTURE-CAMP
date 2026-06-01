"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Booking, AppData } from '@/lib/types';
import { getGlobalAppData } from '@/lib/store';
import { fmt, fmtDate, cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Search, Download, CreditCard, X, HandCoins, BarChart3, ShieldCheck, Clock, CheckCircle2, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AdminPaymentsProps {
  initialTab?: 'transactions' | 'refunds' | 'payouts' | 'revenue';
  onBack?: () => void;
}

export default function AdminPayments({ initialTab = 'transactions', onBack }: AdminPaymentsProps) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'refunds' | 'payouts' | 'revenue'>(initialTab);
  const globalAppData = useMemo(() => getGlobalAppData(), []);
  const bookings = useMemo(() => {
    return [...globalAppData.allBookings].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }, [globalAppData]);

  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
  const refundedBookings = bookings.filter(b => b.status === 'Refunded');
  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const payoutTotal = confirmedBookings.reduce((sum, booking) => sum + (booking.amount * 0.9), 0);
  const revenueTotal = confirmedBookings.reduce((sum, booking) => sum + booking.amount, 0);
  const refundTotal = refundedBookings.reduce((sum, booking) => sum + booking.amount, 0);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const filteredTransactions = useMemo(() => {
    switch (activeTab) {
      case 'refunds':
        return refundedBookings;
      case 'payouts':
        return confirmedBookings;
      default:
        return bookings;
    }
  }, [activeTab, bookings, refundedBookings, confirmedBookings]);

  const payoutByOrganizer = useMemo(() => {
    return confirmedBookings.reduce<Record<string, number>>((totals, booking) => {
      const organizer = booking.organizer || 'Unknown Organizer';
      totals[organizer] = (totals[organizer] || 0) + booking.amount * 0.9;
      return totals;
    }, {});
  }, [confirmedBookings]);

  return (
    <div className="space-y-8 pb-20 font-sans animate-in fade-in duration-700 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-12 w-12 border-slate-200 shadow-sm hover:bg-slate-50">
              <ArrowLeft size={20} className="text-slate-600" />
            </Button>
          )}
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Payments Control Center</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Platform-wide transactions, refunds and payout audits</p>
          </div>
        </div>
        <div className="flex bg-slate-900 p-6 rounded-[28px] text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">NET PROCESSING VALUE</p>
            <p className="text-2xl font-black text-white">{fmt(revenueTotal)}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-full bg-white/5 skew-x-[-20deg] translate-x-12" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'TRANSACTIONS', value: bookings.length, icon: CreditCard, bg: 'bg-slate-100 text-slate-900' },
          { label: 'REFUNDS', value: refundedBookings.length, icon: X, bg: 'bg-rose-100 text-rose-700' },
          { label: 'PAYOUTS', value: confirmedBookings.length, icon: HandCoins, bg: 'bg-emerald-100 text-emerald-700' },
        ].map(item => (
          <div key={item.label} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner', item.bg)}>
              <item.icon size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-lg font-black text-slate-900 leading-none">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-50 p-1 rounded-2xl grid grid-cols-4 gap-2">
              <TabsTrigger value="transactions" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Transactions</TabsTrigger>
              <TabsTrigger value="refunds" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Refunds</TabsTrigger>
              <TabsTrigger value="payouts" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Payouts</TabsTrigger>
              <TabsTrigger value="revenue" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Revenue</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-8 space-y-6">
          <div className="relative w-full md:w-96">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <Input placeholder="Search transactions..." className="pl-9 h-11 rounded-xl border-slate-100 bg-slate-50 font-bold text-[10px] uppercase" />
          </div>

          {activeTab === 'revenue' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-[28px] p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Revenue</p>
                <p className="text-2xl font-black text-slate-900">{fmt(revenueTotal)}</p>
              </div>
              <div className="bg-slate-50 rounded-[28px] p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Payouts</p>
                <p className="text-2xl font-black text-slate-900">{fmt(payoutTotal)}</p>
              </div>
              <div className="bg-slate-50 rounded-[28px] p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Refund Liability</p>
                <p className="text-2xl font-black text-slate-900">{fmt(refundTotal)}</p>
              </div>
            </div>
          ) : activeTab === 'payouts' ? (
            <div className="space-y-6">
              {Object.entries(payoutByOrganizer).map(([organizer, payout]) => (
                <div key={organizer} className="bg-white rounded-[28px] border border-slate-100 p-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight text-slate-900">{organizer}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expected payout</p>
                  </div>
                  <p className="text-lg font-black text-slate-900">{fmt(payout)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-b border-slate-100">
                    <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">TRANSACTION ID</TableHead>
                    <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">EXPEDITION</TableHead>
                    <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">DATE</TableHead>
                    <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">AMOUNT</TableHead>
                    <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">STATUS</TableHead>
                    <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">INVOICE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-slate-200"><Wallet size={40} /></div>
                        <p className="text-sm font-black text-slate-300 uppercase tracking-widest italic">No transactions found for this view</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map(booking => (
                      <TableRow key={booking.id} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell className="px-8 py-5 text-[10px] font-black uppercase text-slate-900">#TXN-{booking.id}</TableCell>
                        <TableCell className="px-8 py-5 text-[11px] font-black uppercase text-slate-700 tracking-tight line-clamp-1">{booking.camp}</TableCell>
                        <TableCell className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase">{fmtDate(booking.addedAt)}</TableCell>
                        <TableCell className="px-8 py-5 text-right text-slate-900 font-black">{fmt(booking.amount)}</TableCell>
                        <TableCell className="px-8 py-5 text-right">
                          <Badge className={cn(
                            'border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-lg',
                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'Refunded' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          )}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-5 text-right">
                          <button className="text-slate-300 hover:text-primary transition-colors">
                            <Download size={16} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
