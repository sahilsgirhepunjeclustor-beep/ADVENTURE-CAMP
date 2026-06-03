"use client";

import React, { useMemo } from 'react';
import { User, AppData, Booking } from '@/lib/types';
import { fmt, fmtDate, cn } from '@/lib/utils';
import { 
  Wallet, 
  ArrowLeft, 
  IndianRupee, 
  Download, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  XCircle,
  CreditCard,
  FileText,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UserPaymentsProps {
  currentUser: User;
  data: AppData;
  onBack: () => void;
}

export default function UserPayments({ currentUser, data, onBack }: UserPaymentsProps) {
  const bookings = useMemo(() => 
    [...data.bookings].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()),
    [data.bookings]
  );

  const totalSpent = useMemo(() => 
    bookings.filter(b => b.status === 'Confirmed').reduce((s, b) => s + b.amount, 0),
    [bookings]
  );

  return (
    <div className="space-y-8 pb-20 font-sans animate-in fade-in duration-700 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-12 w-12 border-slate-200 shadow-sm hover:bg-slate-50">
            <ArrowLeft size={20} className="text-slate-600" />
          </Button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Financial Ledger</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Payment history, receipts and refund audit</p>
          </div>
        </div>
        <div className="flex bg-slate-900 p-6 rounded-[28px] text-white shadow-2xl relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">TOTAL EXPEDITION VALUE</p>
              <p className="text-2xl font-black text-white">{fmt(totalSpent)}</p>
           </div>
           <div className="absolute top-0 right-0 w-24 h-full bg-white/5 skew-x-[-20deg] translate-x-12" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'CONFIRMED PAYMENTS', val: bookings.filter(b => b.status === 'Confirmed').length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
           { label: 'PENDING SETTLEMENTS', val: bookings.filter(b => b.status === 'Pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
           { label: 'REFUNDED VOLUME', val: fmt(bookings.filter(b => b.status === 'Refunded').reduce((s, b) => s + b.amount, 0)), icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
         ].map(item => (
            <div key={item.label} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-5">
               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", item.bg, item.color)}>
                  <item.icon size={20} />
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-lg font-black text-slate-900 leading-none">{item.val}</p>
               </div>
            </div>
         ))}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
         <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Transaction Registry</h3>
            <div className="relative w-full md:w-64">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
               <Input placeholder="Audit Transaction ID..." className="pl-9 h-9 rounded-xl border-slate-100 bg-slate-50 font-bold text-[10px] uppercase" />
            </div>
         </div>

         <div className="overflow-x-auto custom-scrollbar">
            <Table>
               <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-b border-slate-100">
                     <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">TRANSACTION IDENTITY</TableHead>
                     <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">EXPEDITION</TableHead>
                     <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">DATE</TableHead>
                     <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">AMOUNT</TableHead>
                     <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">STATUS</TableHead>
                     <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">INVOICE</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                       <TableCell colSpan={6} className="py-24 text-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-slate-200"><Wallet size={40} /></div>
                          <p className="text-sm font-black text-slate-300 uppercase tracking-widest italic">No payment records found in ledger</p>
                       </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map(b => (
                      <TableRow key={b.id} className="group hover:bg-slate-50/50 transition-colors">
                         <TableCell className="px-8 py-5">
                            <span className="text-[10px] font-black uppercase text-slate-900">#TXN-{b.id}</span>
                         </TableCell>
                         <TableCell className="px-8 py-5">
                            <span className="text-[11px] font-black uppercase text-slate-700 tracking-tight line-clamp-1">{b.camp}</span>
                         </TableCell>
                         <TableCell className="px-8 py-5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{fmtDate(b.addedAt)}</span>
                         </TableCell>
                         <TableCell className="px-8 py-5 text-right">
                            <span className="text-sm font-black text-slate-900">{fmt(b.amount)}</span>
                         </TableCell>
                         <TableCell className="px-8 py-5 text-right">
                            <Badge className={cn(
                               "border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-lg",
                               b.status === 'Confirmed' ? "bg-green-100 text-green-700" :
                               b.status === 'Pending' ? "bg-amber-100 text-amber-700" :
                               "bg-red-100 text-red-700"
                            )}>
                               {b.status}
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
      </div>

      <div className="bg-primary/5 p-8 rounded-[40px] border border-primary/10 flex items-center gap-6">
         <div className="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck size={32} className="text-primary" />
         </div>
         <div>
            <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">Encrypted Financial Audit</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 leading-relaxed max-w-2xl">All transactions are processed through 256-bit SSL encrypted channels. Your financial data is synchronized across the platform security nodes for maximum integrity.</p>
         </div>
      </div>
    </div>
  );
}
