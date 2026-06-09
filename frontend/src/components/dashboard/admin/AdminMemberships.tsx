import React, { useState, useMemo, useEffect } from 'react';
import { MembershipPlan, User, UserMembership } from '@/lib/types';
import { getMembershipPlans, saveMembershipPlans, getUsers, saveUsers, getCurrentUser } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { fmt, fmtDate, cn, uid } from '@/lib/utils';
import { 
  Gem, Plus, Trash2, CheckCircle2, XCircle, Pencil, Search, Users, ArrowLeft, 
  Calendar, Zap, ShieldCheck, Ban, Clock, LayoutGrid, ListFilter, 
  Crown, Star, TrendingUp, BarChart, MoreHorizontal, UserPlus, SlidersHorizontal, Settings2, ShieldAlert, RotateCcw, TrendingDown
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
            {trend && <p className={`mt-1 text-xs font-semibold flex items-center gap-1 ${trendColor}`}>{trendIcon} {trend.substring(1)}</p>}
        </div>
    );
};

interface MembershipDisplay extends UserMembership {
  user: User;
}

export default function AdminMemberships({ onBack, initialTab = 'subscribers' }: { onBack?: () => void, initialTab?: string }) {
  const [view, setView] = useState(initialTab);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [allUsers, setAllUsers] = useState<Record<string, User>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState<Partial<MembershipPlan>>({ name: '', price: 0, durationMonths: 12, discountPercentage: 10, features: [], isActive: true });

  useEffect(() => {
    setPlans(getMembershipPlans());
    setAllUsers(getUsers());
  }, []);

  useEffect(() => {
    setView(initialTab);
    setCurrentPage(1);
  }, [initialTab]);

  const { tableData, stats } = useMemo(() => {
    const subscribers = Object.values(allUsers)
        .filter(u => u.membership)
        .map(u => ({ ...u.membership!, user: u }));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const mrr = subscribers.reduce((acc, s) => {
        const plan = plans.find(p => p.name === s.planName);
        return s.status === 'active' && plan ? acc + plan.price / 12 : acc;
    }, 0);

    const newSubscribersCount = subscribers.filter(s => new Date(s.startDate) > thirtyDaysAgo).length;

    const calculatedStats = {
      subscribers: [
        { title: "Total Subscribers", value: subscribers.length, icon: Users, color: 'blue', trend: `+${newSubscribersCount}` },
        { title: "MRR", value: fmt(mrr), icon: BarChart, color: 'green', trend: `+5.2%` },
        { title: "Active Plans", value: plans.filter(p => p.isActive).length, icon: Gem, color: 'purple' },
        { title: "Pending Approvals", value: subscribers.filter(s => s.status === 'pending').length, icon: Clock, color: 'orange' },
      ],
      plans: [
        { title: "Total Plans", value: plans.length, icon: LayoutGrid, color: 'blue' },
        { title: "Active Plans", value: plans.filter(p => p.isActive).length, icon: Gem, color: 'green' },
        { title: "Inactive Plans", value: plans.filter(p => !p.isActive).length, icon: Ban, color: 'red' },
        { title: "Avg. Subscribers/Plan", value: Math.round(subscribers.length / plans.length) || 0, icon: Users, color: 'purple' },
      ],
      renewals: [
         { title: "Upcoming Renewals", value: subscribers.filter(u => u.expiryDate && new Date(u.expiryDate).getTime() < Date.now() + 30 * 24 * 60 * 60 * 1000).length, icon: Calendar, color: 'orange' },
         { title: "Expired Memberships", value: subscribers.filter(u => u.status === 'suspended' && u.expiryDate && new Date(u.expiryDate).getTime() < Date.now()).length, icon: XCircle, color: 'red' },
      ]
    };
    
    let data: any[] = [];
    if (view === 'plans') data = plans;
    else if (view === 'renewals') data = subscribers.filter(u => u.expiryDate && new Date(u.expiryDate).getTime() < Date.now() + 30 * 24 * 60 * 60 * 1000);
    else data = subscribers;

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (view === 'plans') {
            data = data.filter(p => p.name.toLowerCase().includes(query));
        } else {
            data = data.filter(s => `${s.user.firstName} ${s.user.lastName}`.toLowerCase().includes(query) || s.user.email.toLowerCase().includes(query));
        }
    }
    
    return { tableData: data, stats: calculatedStats };
  }, [view, allUsers, plans, searchQuery]);

  const paginatedData = tableData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(tableData.length / itemsPerPage));

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const plan: MembershipPlan = { id: uid(), ...newPlan, features: (newPlan.features as any).split(',').map((f: string) => f.trim()), price: Number(newPlan.price), discountPercentage: Number(newPlan.discountPercentage), durationMonths: 12, isActive: true };
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
    const status = action === 'approve' ? 'active' : 'suspended';
    updatedUsers[email].membership!.status = status;
    setAllUsers(updatedUsers);
    saveUsers(updatedUsers);
    toast({ title: `Membership ${status.charAt(0).toUpperCase() + status.slice(1)}` });
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-screen-xl mx-auto space-y-6">
        <header>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Memberships</h1>
                <Button onClick={() => setIsPlanDialogOpen(true)} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-sm rounded-lg sm:rounded-xl text-sm"><Plus size={16} className="mr-2"/>New Plan</Button>
            </div>
            <nav className="mt-6 flex overflow-x-auto pb-2 scrollbar-hide gap-2">
                {[
                    { id: 'subscribers', label: 'Subscribers', icon: Users },
                    { id: 'plans', label: 'Plans', icon: Gem },
                    { id: 'renewals', label: 'Renewals', icon: Clock },
                ].map(item => (
                    <button key={item.id} onClick={() => { setView(item.id); setCurrentPage(1); }} className={cn("flex items-center whitespace-nowrap gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors", view === item.id ? "text-white bg-emerald-500 shadow-md" : "text-gray-600 bg-white hover:bg-gray-100 border")}>
                        <item.icon size={16} /> {item.label}
                    </button>
                ))}
            </nav>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {(stats[view] || stats.subscribers).map(card => <StatCard key={card.title} {...card} />)}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 flex justify-between items-center bg-gray-50/50 border-b border-gray-100">
                <div className="relative w-full max-w-sm">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search..." className="pl-10 w-full rounded-xl bg-white" />
                </div>
            </div>

            <div className="overflow-x-auto">
                {view === 'plans' ? (
                    <table className="w-full text-left">
                        <thead><tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100"><th className="px-6 py-3">Plan</th><th className="px-6 py-3">Price</th><th className="px-6 py-3">Discount</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedData.map((p: MembershipPlan) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4"><div className="font-bold text-sm text-gray-800">{p.name}</div></td>
                                    <td className="px-6 py-4 text-sm font-medium">{fmt(p.price)}/year</td>
                                    <td className="px-6 py-4 text-sm font-medium">{p.discountPercentage}%</td>
                                    <td className="px-6 py-4"><Badge variant={p.isActive ? 'default' : 'destructive'} className={cn("capitalize", p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{p.isActive ? 'Active' : 'Inactive'}</Badge></td>
                                    <td className="px-6 py-4 text-right">
                                        <Button size="sm" variant="outline" onClick={() => togglePlanStatus(p.id)}>{p.isActive ? 'Suspend' : 'Activate'}</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-left">
                        <thead><tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100"><th className="px-6 py-3">Subscriber</th><th className="px-6 py-3">Plan</th><th className="px-6 py-3">Expires</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedData.map((s: MembershipDisplay) => (
                                <tr key={s.user.email} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={s.user.avatar} className="w-10 h-10 rounded-full object-cover"/>
                                            <div>
                                                <div className="font-bold text-sm text-gray-800">{s.user.firstName} {s.user.lastName}</div>
                                                <div className="text-xs text-gray-500">{s.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">{s.planName}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{fmtDate(s.expiryDate)}</td>
                                    <td className="px-6 py-4"><Badge className={cn("capitalize", {'bg-green-100 text-green-700': s.status === 'active','bg-amber-100 text-amber-700': s.status === 'pending', 'bg-red-100 text-red-700': s.status === 'suspended'})}>{s.status}</Badge></td>
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-gray-400"><MoreHorizontal size={18} /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {s.status === 'pending' && <DropdownMenuItem onClick={() => handleMembershipAction(s.user.email, 'approve')}><CheckCircle2 size={14} className="mr-2"/>Approve</DropdownMenuItem>}
                                                {s.status === 'active' && <DropdownMenuItem className="text-red-600" onClick={() => handleMembershipAction(s.user.email, 'revoke')}><Ban size={14} className="mr-2"/>Suspend</DropdownMenuItem>}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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
       <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
          <DialogContent> 
              <DialogHeader><DialogTitle>Create New Membership Plan</DialogTitle></DialogHeader>
              <form onSubmit={handleCreatePlan} className="space-y-4 pt-4">
                  <Input placeholder="Plan Name" onChange={e => setNewPlan({...newPlan, name: e.target.value})} required className="rounded-lg"/>
                  <div className="grid grid-cols-2 gap-4">
                    <Input type="number" placeholder="Annual Price (₹)" onChange={e => setNewPlan({...newPlan, price: Number(e.target.value)})} required className="rounded-lg"/>
                    <Input type="number" placeholder="Camp Discount (%)" onChange={e => setNewPlan({...newPlan, discountPercentage: Number(e.target.value)})} required className="rounded-lg"/>
                  </div>
                  <Input placeholder="Features (comma-separated)" onChange={e => setNewPlan({...newPlan, features: e.target.value as any})} className="rounded-lg"/>
                  <Button type="submit" className="w-full font-bold rounded-lg h-11">Create Plan</Button>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}