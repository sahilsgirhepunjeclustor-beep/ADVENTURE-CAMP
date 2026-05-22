
"use client";

import React, { useState, useEffect } from 'react';
import { Coupon } from '@/lib/types';
import { getCoupons, saveCoupons } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { fmt, uid } from '@/lib/utils';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Clock, 
  Zap, 
  ArrowLeft,
  Settings2,
  Calendar,
  Layers,
  ChevronRight,
  Ban,
  CheckCircle2
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';

interface CouponManagementProps {
  onBack?: () => void;
}

export default function CouponManagement({ onBack }: CouponManagementProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minBookingValue: 0,
    usageLimit: 100,
    expiryDate: '',
    isActive: true
  });

  useEffect(() => {
    setCoupons(getCoupons());
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const coupon: Coupon = {
      id: uid(),
      code: newCoupon.code!.toUpperCase(),
      discountType: newCoupon.discountType as any,
      discountValue: Number(newCoupon.discountValue),
      minBookingValue: Number(newCoupon.minBookingValue),
      usageLimit: Number(newCoupon.usageLimit),
      usedCount: 0,
      expiryDate: newCoupon.expiryDate!,
      isActive: true
    };

    const updated = [coupon, ...coupons];
    setCoupons(updated);
    saveCoupons(updated);
    setIsAddOpen(false);
    toast({ title: 'Campaign Activated', description: `Coupon ${coupon.code} is now live.` });
  };

  const toggleStatus = (id: string) => {
    const updated = coupons.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
    setCoupons(updated);
    saveCoupons(updated);
    toast({ title: 'Campaign Updated' });
  };

  const deleteCoupon = (id: string) => {
    const updated = coupons.filter(c => c.id !== id);
    setCoupons(updated);
    saveCoupons(updated);
    toast({ variant: 'destructive', title: 'Campaign Terminated' });
  };

  return (
    <div className="space-y-8 pb-20 font-sans max-w-7xl mx-auto px-4 md:px-0 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-12 w-12 border-slate-200 shadow-sm">
              <ArrowLeft size={20} className="text-slate-600" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Coupon & Campaign Hub</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Manage seasonal offers and promotional discounts</p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-12 px-6 bg-primary hover:bg-accent font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 gap-3 text-white">
              <Plus size={16} /> New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden font-sans">
             <DialogHeader className="sr-only">
                <DialogTitle>Create Coupon Campaign</DialogTitle>
             </DialogHeader>
             <div className="bg-[#0d2a1d] p-8 text-white">
                <h3 className="text-sm font-black uppercase tracking-widest">Discount Logic</h3>
                <p className="text-[10px] text-green-200/60 font-bold mt-1 uppercase">Configure your promotional campaign</p>
             </div>
             <form onSubmit={handleCreate} className="p-8 space-y-5 bg-white">
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-black uppercase text-slate-400">Coupon Code</Label>
                   <Input value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} className="rounded-xl h-12 font-black uppercase" placeholder="e.g. SUMMER25" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase text-slate-400">Discount Type</Label>
                      <Select value={newCoupon.discountType} onValueChange={v => setNewCoupon({...newCoupon, discountType: v as any})}>
                         <SelectTrigger className="rounded-xl h-12 font-bold"><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase text-slate-400">Value</Label>
                      <Input type="number" value={newCoupon.discountValue} onChange={e => setNewCoupon({...newCoupon, discountValue: Number(e.target.value)})} className="rounded-xl h-12 font-black" required />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase text-slate-400">Min. Booking (₹)</Label>
                      <Input type="number" value={newCoupon.minBookingValue} onChange={e => setNewCoupon({...newCoupon, minBookingValue: Number(e.target.value)})} className="rounded-xl h-12 font-bold" />
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase text-slate-400">Expiry Date</Label>
                      <Input type="date" value={newCoupon.expiryDate} onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} className="rounded-xl h-12 font-bold" required />
                   </div>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest mt-4 shadow-xl text-white">Commit Campaign</Button>
             </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white rounded-[40px] border border-dashed border-slate-200 opacity-50 flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-200 mb-6">
                <Ticket size={40} />
             </div>
             <p className="text-sm font-black uppercase text-slate-400 tracking-widest">No active campaigns</p>
          </div>
        ) : (
          coupons.map(c => (
            <div key={c.id} className={cn(
              "bg-white p-6 rounded-[32px] border shadow-sm relative overflow-hidden transition-all hover:shadow-xl",
              c.isActive ? "border-slate-100" : "border-slate-100 opacity-60 grayscale"
            )}>
               <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                     <Ticket size={24} />
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => toggleStatus(c.id)} className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary">
                        {c.isActive ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                     </button>
                     <button onClick={() => deleteCoupon(c.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={16} />
                     </button>
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                     <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">{c.code}</h3>
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                        {c.discountValue}{c.discountType === 'percentage' ? '%' : '₹'} OFF
                     </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                     <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">USAGE</p>
                        <p className="text-xs font-black text-slate-900">{c.usedCount} / {c.usageLimit}</p>
                     </div>
                     <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">MIN. SPEND</p>
                        <p className="text-xs font-black text-slate-900">{fmt(c.minBookingValue)}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-2">
                     <Calendar size={12} className="text-primary" /> EXP: {c.expiryDate}
                  </div>
               </div>
               <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
