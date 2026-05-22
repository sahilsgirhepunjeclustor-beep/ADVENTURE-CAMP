"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { MembershipPlan, User } from '@/lib/types';
import { getMembershipPlans, saveMembershipPlans, getUsers, saveUsers } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { fmt, fmtDate, cn, uid } from '@/lib/utils';
import { 
  Gem, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Pencil, 
  Search, 
  Users, 
  ArrowLeft,
  Calendar,
  Zap,
  ShieldCheck,
  CreditCard,
  Ban,
  Clock,
  LayoutGrid,
  ListFilter
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminMembershipsProps {
  onBack?: () => void;
}

export default function AdminMemberships({ onBack }: AdminMembershipsProps) {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [allUsers, setAllUsers] = useState<Record<string, User>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingUser] = useState<MembershipPlan | null>(null);

  // Form State
  const [newPlan, setNewPlan] = useState<Partial<MembershipPlan>>({
    name: '',
    price: 0,
    durationMonths: 12,
    discountPercentage: 0,
    features: [],
    isActive: true
  });

  useEffect(() => {
    setPlans(getMembershipPlans());
    setAllUsers(getUsers());
  }, []);

  const subscribers = useMemo(() => 
    Object.values(allUsers).filter(u => u.membership), 
    [allUsers]
  );

  const filteredSubscribers = subscribers.filter(u => 
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const plan: MembershipPlan = {
      id: uid(),
      name: newPlan.name || 'Standard Plan',
      price: Number(newPlan.price),
      durationMonths: Number(newPlan.durationMonths),
      discountPercentage: Number(newPlan.discountPercentage),
      features: (newPlan.features as any).split(',').map((f: string) => f.trim()),
      isActive: true
    };

    const updated = [...plans, plan];
    setPlans(updated);
    saveMembershipPlans(updated);
    setIsPlanDialogOpen(false);
    toast({ title: 'Membership Plan Created' });
  };

  const togglePlanStatus = (id: string) => {
    const updated = plans.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p);
    setPlans(updated);
    saveMembershipPlans(updated);
    toast({ title: 'Plan Status Updated' });
  };

  const handleMembershipAction = (email: string, action: 'approve' | 'revoke') => {
    const updatedUsers = { ...allUsers };
    if (action === 'approve') {
       updatedUsers[email].membership!.status = 'active';
       toast({ title: 'Membership Activated' });
    } else {
       updatedUsers[email].membership!.status = 'suspended';
       toast({ variant: 'destructive', title: 'Membership Suspended' });
    }
    setAllUsers(updatedUsers);
    saveUsers(updatedUsers);
  };

  return (
    <div className="space-y-8 pb-20 font-sans max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-12 w-12 border-slate-200 shadow-sm hover:bg-slate-50">
              <ArrowLeft size={20} className="text-slate-600" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Membership Management</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Loyalty & Exclusive Access Controls</p>
          </div>
        </div>
        <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-12 px-6 bg-primary hover:bg-accent font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 gap-3 text-white">
              <Plus size={16} /> New Membership Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
             <DialogHeader className="sr-only">
                <DialogTitle>Create Membership Plan</DialogTitle>
                <DialogDescription>Define new loyalty tiers and benefits for platform explorers.</DialogDescription>
             </DialogHeader>
             <div className="bg-[#0d2a1d] p-8 text-white">
                <h3 className="text-sm font-black uppercase tracking-widest">Plan Configuration</h3>
                <p className="text-[10px] text-green-200/60 font-bold mt-1 uppercase">Define new loyalty tier benefits</p>
             </div>
             <form onSubmit={handleCreatePlan} className="p-8 space-y-5 bg-white">
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-black uppercase text-slate-400">Plan Name</Label>
                   <Input onChange={e => setNewPlan({...newPlan, name: e.target.value})} className="rounded-xl h-12 font-bold" placeholder="e.g. Gold Trailblazer" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase text-slate-400">Annual Price (₹)</Label>
                      <Input type="number" onChange={e => setNewPlan({...newPlan, price: Number(e.target.value)})} className="rounded-xl h-12 font-black" required />
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase text-slate-400">Expedition Discount (%)</Label>
                      <Input type="number" onChange={e => setNewPlan({...newPlan, discountPercentage: Number(e.target.value)})} className="rounded-xl h-12 font-black" required />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-black uppercase text-slate-400">Features (Comma separated)</Label>
                   <Input onChange={e => setNewPlan({...newPlan, features: e.target.value as any})} className="rounded-xl h-12 font-bold" placeholder="VIP access, Insurance, etc." />
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest mt-4 shadow-xl text-white">Activate Plan</Button>
             </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">ACTIVE TIERS</h3>
          <div className="space-y-4">
            {plans.map(plan => (
              <div key={plan.id} className={cn(
                "bg-white p-6 rounded-[28px] border-l-[6px] shadow-sm relative overflow-hidden group",
                plan.isActive ? "border-primary" : "border-slate-200 opacity-60"
              )}>
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                       <Gem size={20} />
                    </div>
                    <button onClick={() => togglePlanStatus(plan.id)} className="text-[9px] font-black uppercase text-primary hover:underline">
                       {plan.isActive ? 'Suspend' : 'Activate'}
                    </button>
                 </div>
                 <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{plan.name}</h4>
                 <div className="text-xl font-black text-slate-900 mb-4">{fmt(plan.price)} <span className="text-[10px] text-slate-400 font-bold uppercase">/ Year</span></div>
                 
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase">
                       <Zap size={12} fill="currentColor" /> {plan.discountPercentage}% Camp Discount
                    </div>
                    {plan.features.slice(0, 2).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                         <div className="w-1 h-1 rounded-full bg-slate-300" /> {f}
                      </div>
                    ))}
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8">
           <Tabs defaultValue="members" className="w-full">
              <TabsList className="bg-slate-50 p-1 rounded-2xl mb-6 h-12">
                 <TabsTrigger value="members" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest">Subscriber Ledger</TabsTrigger>
                 <TabsTrigger value="requests" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest">Pending Approvals</TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-6">
                 <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <Input 
                       value={searchQuery}
                       onChange={e => setSearchQuery(e.target.value)}
                       placeholder="Search Subscribers..." 
                       className="pl-12 h-14 rounded-2xl bg-white border-slate-100 shadow-xl font-bold uppercase text-[11px] tracking-tight"
                    />
                 </div>

                 <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50">
                          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                             <th className="px-8 py-5">EXPEDITIONIST</th>
                             <th className="px-8 py-5">TIER</th>
                             <th className="px-8 py-5">EXPIRY</th>
                             <th className="px-8 py-5">STATUS</th>
                             <th className="px-8 py-5 text-right">ACTION</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {filteredSubscribers.length === 0 ? (
                            <tr><td colSpan={5} className="py-20 text-center text-xs font-black text-slate-300 uppercase italic">No active subscribers found</td></tr>
                          ) : (
                            filteredSubscribers.map(u => (
                              <tr key={u.email} className="group hover:bg-slate-50/50 transition-colors">
                                 <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                       <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-500 overflow-hidden border border-white">
                                          {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.firstName[0]}
                                       </div>
                                       <div>
                                          <p className="text-xs font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{u.firstName} {u.lastName}</p>
                                          <p className="text-[9px] font-bold text-slate-400 lowercase">{u.email}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-5">
                                    <Badge className="bg-orange-50 text-orange-600 border-none font-black text-[9px] px-2 py-0.5 rounded-lg">{u.membership?.planName}</Badge>
                                 </td>
                                 <td className="px-8 py-5">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">{fmtDate(u.membership?.expiryDate)}</div>
                                 </td>
                                 <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                       <div className={cn("w-1.5 h-1.5 rounded-full", u.membership?.status === 'active' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-amber-500")} />
                                       <span className="text-[9px] font-black uppercase text-slate-500">{u.membership?.status}</span>
                                    </div>
                                 </td>
                                 <td className="px-8 py-5 text-right">
                                    <button onClick={() => handleMembershipAction(u.email, u.membership?.status === 'active' ? 'revoke' : 'approve')} className="text-slate-300 hover:text-red-500 transition-colors">
                                       {u.membership?.status === 'active' ? <Ban size={18} /> : <CheckCircle2 size={18} className="text-green-500" />}
                                    </button>
                                 </td>
                              </tr>
                            ))
                          )}
                       </tbody>
                    </table>
                 </div>
              </TabsContent>

              <TabsContent value="requests">
                 <div className="space-y-4">
                    {subscribers.filter(u => u.membership?.status === 'pending').length === 0 ? (
                      <div className="bg-white p-20 text-center rounded-[40px] border border-dashed border-slate-200 opacity-40">
                         <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500/20" />
                         <p className="text-sm font-black uppercase tracking-widest text-slate-400">All membership audits complete</p>
                      </div>
                    ) : (
                      subscribers.filter(u => u.membership?.status === 'pending').map(u => (
                        <div key={u.email} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between">
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-black">{u.firstName[0]}</div>
                              <div>
                                 <h4 className="text-base font-black text-slate-900 uppercase tracking-tighter">{u.firstName} {u.lastName}</h4>
                                 <p className="text-[10px] text-slate-400 font-bold">Requesting <span className="text-primary">{u.membership?.planName}</span></p>
                              </div>
                           </div>
                           <div className="flex gap-3">
                              <Button onClick={() => handleMembershipAction(u.email, 'revoke')} variant="ghost" className="h-11 px-4 text-red-500 hover:bg-red-50 rounded-xl"><XCircle size={20} /></Button>
                              <Button onClick={() => handleMembershipAction(u.email, 'approve')} className="h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-white">Approve Member</Button>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </TabsContent>
           </Tabs>
        </div>
      </div>
    </div>
  );
}
