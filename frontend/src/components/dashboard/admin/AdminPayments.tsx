import React, { useState, useEffect, useMemo } from 'react';
import { getGlobalAppData, saveAppData, getAppData, getAllApprovedCamps, getCurrentUser, logAdminAction } from '@/lib/store';
import { Camp, Booking } from '@/lib/types';
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

// Define the Payment interface directly in this file
interface Payment {
  id: string;
  customer: string;
  customerEmail: string;
  camp: string;
  campId: string;
  amount: number;
  commissionAmount: number;
  status: 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'Disputed';
  paymentMethod: 'Credit Card' | 'Debit Card' | 'Net Banking' | 'UPI';
  transactionId: string;
  createdAt: string;
}

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


interface AdminPaymentsProps {
    onBack?: () => void;
    initialTab?: string;
}

export default function AdminPayments({ onBack, initialTab = 'all' }: AdminPaymentsProps) {
  const [view, setView] = useState(initialTab);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({ customer: '', customerEmail: '', campId: '', amount: '', status: 'Paid' as const, paymentMethod: 'Credit Card' as const });
  const [actionToConfirm, setActionToConfirm] = useState<{ action: () => void, title: string, description: string } | null>(null);

  const adminUser = useMemo(() => getCurrentUser(), []);
  const camps = useMemo(() => getAllApprovedCamps(), []);

  useEffect(() => {
    const global = getGlobalAppData();
    const paymentsFromBookings: Payment[] = global.allBookings.map((booking: Booking) => {
      let paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'Disputed';
      switch (booking.status) {
        case 'Confirmed':
          paymentStatus = 'Paid';
          break;
        case 'Pending':
          paymentStatus = 'Pending';
          break;
        case 'Cancelled':
          paymentStatus = 'Failed';
          break;
        case 'Refunded':
          paymentStatus = 'Refunded';
          break;
        case 'Disputed':
          paymentStatus = 'Disputed';
          break;
        default:
          paymentStatus = 'Pending';
      }
      
      const paymentMethods: Array<'Credit Card' | 'Debit Card' | 'Net Banking' | 'UPI'> = ['Credit Card', 'Debit Card', 'Net Banking', 'UPI'];

      return {
        id: booking.id,
        customer: booking.customer,
        customerEmail: booking.customerEmail,
        camp: booking.camp,
        campId: booking.campId,
        amount: booking.amount,
        commissionAmount: booking.commissionAmount,
        status: paymentStatus,
        paymentMethod: paymentMethods[booking.id.charCodeAt(booking.id.length - 1) % 4], // Deterministic random from ID
        transactionId: `txn_${booking.id}`,
        createdAt: booking.addedAt,
      };
    });

    setAllPayments(paymentsFromBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  // This critical effect ensures the component view syncs with sidebar navigation
  useEffect(() => {
    setView(initialTab);
    setCurrentPage(1);
  }, [initialTab]);

  const { tableData, stats } = useMemo(() => {
    let filteredData = allPayments;
    const currentView = view || 'all';

    if (currentView !== 'all') {
        const status = currentView.charAt(0).toUpperCase() + currentView.slice(1);
        filteredData = allPayments.filter(p => p.status === status);
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(p => 
            (p.customer?.toLowerCase().includes(query) ||
             p.camp?.toLowerCase().includes(query) ||
             p.id?.toLowerCase().includes(query))
        );
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const paid = allPayments.filter(p => p.status === 'Paid');
    const pending = allPayments.filter(p => p.status === 'Pending');
    const failed = allPayments.filter(p => p.status === 'Failed');
    const refunded = allPayments.filter(p => p.status === 'Refunded');
    const disputed = allPayments.filter(p => p.status === 'Disputed');
    
    const paidIn30d = paid.filter(p => new Date(p.createdAt) > thirtyDaysAgo);

    const calculatedStats = {
      all: [
        { title: "Total Revenue (30d)", value: fmt(paidIn30d.reduce((s, p) => s + p.amount, 0)), icon: DollarSign, color: 'green', trend: "+5.2%" },
        { title: "Pending Payments", value: pending.length, icon: Clock, color: 'orange' },
        { title: "Failed Payments", value: failed.length, icon: AlertCircle, color: 'red' },
        { title: "Disputed Payments", value: disputed.length, icon: ShieldAlert, color: 'purple' },
      ],
      paid: [
        { title: "Total Revenue (30d)", value: fmt(paidIn30d.reduce((s, p) => s + p.amount, 0)), icon: DollarSign, color: 'green', trend: "+5.2%" },
      ],
      pending: [
        { title: "Pending Payments", value: pending.length, icon: Clock, color: 'orange' },
        { title: "Pending Amount", value: fmt(pending.reduce((s, p) => s + p.amount, 0)), icon: DollarSign, color: 'blue' },
      ],
      failed: [
        { title: "Failed Payments", value: failed.length, icon: AlertCircle, color: 'red' },
      ],
      refunded: [
        { title: "Refunded Amount", value: fmt(refunded.reduce((s, p) => s + p.amount, 0)), icon: RotateCcw, color: 'green' },
      ],
      disputed: [
        { title: "Disputed Payments", value: disputed.length, icon: ShieldAlert, color: 'red' },
        { title: "Disputed Amount", value: fmt(disputed.reduce((s, p) => s + p.amount, 0)), icon: DollarSign, color: 'orange' },
      ],
    };

    return { tableData: filteredData, stats: calculatedStats };
  }, [view, allPayments, searchQuery]);

  const paginatedData = tableData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(tableData.length / itemsPerPage));

  const performOptimisticUpdate = (paymentId: string, newStatus: Payment['status']) => {
    setAllPayments(currentPayments => currentPayments.map(p => p.id === paymentId ? { ...p, status: newStatus } : p));
  };

  const handleUpdateStatus = (paymentId: string, newStatus: Payment['status'], actionMessage: string) => {
      performOptimisticUpdate(paymentId, newStatus);
      // In a real application, you would make an API call here to update the payment status
      toast({ title: "Success!", description: `Payment has been ${actionMessage}.` });
  };

  const handleDeletePayment = (payment: Payment) => {
    setActionToConfirm({
      action: () => {
        setAllPayments(current => current.filter(p => p.id !== payment.id));
        // In a real application, you would make an API call here to delete the payment
        toast({ title: "Payment Deleted", variant: "destructive" });
      },
      title: "Delete Payment?",
      description: `This will permanently delete the payment for ${payment.customer}. This action cannot be undone.`
    });
  };

  const handleManualPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { customer, customerEmail, campId, amount, status, paymentMethod } = newPayment;
    if (!customer || !campId || !amount) {
        toast({ title: "Missing Fields", description: "Customer, Camp, and Amount are required.", variant: "destructive" });
        return;
    }
    const selectedCamp = camps.find(c => c.id === campId);
    const payment: Payment = {
      id: 'MPAY-' + uid().toUpperCase(),
      customer, customerEmail, status,
      camp: selectedCamp?.name || 'N/A',
      campId, amount: +amount,
      commissionAmount: +amount * 0.10, 
      paymentMethod, 
      transactionId: 'manual-' + uid(), 
      createdAt: new Date().toISOString(),
    };
    setAllPayments(current => [payment, ...current]);
    setIsManualPaymentOpen(false);
    setNewPayment({ customer: '', customerEmail: '', campId: '', amount: '', status: 'Paid', paymentMethod: 'Credit Card' });
    toast({ title: "Payment Created!" });
  };

  const handleTabClick = (tabId: string) => {
    setView(tabId);
    setCurrentPage(1);
  };

  const PageTitle = () => {
      const titles = {
        all: { title: 'All Payments', desc: 'A complete log of all payments across the platform.' },
        paid: { title: 'Paid Payments', desc: 'Successfully completed transactions.' },
        pending: { title: 'Pending Payments', desc: 'Payments awaiting confirmation.' },
        failed: { title: 'Failed Payments', desc: 'Payments that did not go through.' },
        refunded: { title: 'Refunded Payments', desc: 'Payments that have been returned to the customer.' },
        disputed: { title: 'Disputed Payments', desc: 'Payments with disputes from customers.' },
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
                            <Button onClick={() => setIsManualPaymentOpen(true)} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-sm rounded-lg sm:rounded-xl text-sm">
                                <Plus size={16} className="mr-2"/> New Payment
                            </Button>
                        </div>
                    </div>
                    <nav className="mt-6 flex overflow-x-auto pb-2 scrollbar-hide gap-2">
                        {[
                            { id: 'all', label: 'All Payments', icon: Users },
                            { id: 'paid', label: 'Paid', icon: CheckCircle2 },
                            { id: 'pending', label: 'Pending', icon: Clock },
                            { id: 'failed', label: 'Failed', icon: AlertCircle },
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
                                <th className="px-6 py-3">Customer</th><th className="px-6 py-3">Camp</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Payment Method</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedData.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4"><div className="font-bold text-sm text-gray-800">{p.customer}</div><div className="text-xs text-gray-500">{p.customerEmail}</div></td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{p.camp}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800 font-bold">{fmt(p.amount)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{p.paymentMethod}</td>
                                        <td className="px-6 py-4"><Badge className={cn({'bg-emerald-100 text-emerald-700': p.status === 'Paid','bg-orange-100 text-orange-700': p.status === 'Pending','bg-red-100 text-red-700': p.status === 'Failed','bg-purple-100 text-purple-700': p.status === 'Refunded','bg-amber-100 text-amber-700': p.status === 'Disputed',})}>{p.status}</Badge></td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-gray-400"><MoreHorizontal size={18} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl">
                                                {p.status === 'Pending' && <DropdownMenuItem onClick={() => handleUpdateStatus(p.id, 'Paid', 'paid')}><Check size={14} className="mr-2"/>Mark as Paid</DropdownMenuItem>}
                                                {p.status === 'Paid' && <DropdownMenuItem onClick={() => handleUpdateStatus(p.id, 'Refunded', 'refunded')}><RotateCcw size={14} className="mr-2"/>Process Refund</DropdownMenuItem>}
                                                {p.status !== 'Disputed' && <DropdownMenuItem onClick={() => handleUpdateStatus(p.id, 'Disputed', 'marked as disputed')}><ShieldAlert size={14} className="mr-2"/>Mark Disputed</DropdownMenuItem>}
                                                <DropdownMenuSeparator/>
                                                <DropdownMenuItem onClick={() => handleDeletePayment(p)} className="text-red-600"><X size={14} className="mr-2"/>Delete</DropdownMenuItem>
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
        {isManualPaymentOpen && <Dialog open onOpenChange={setIsManualPaymentOpen}><DialogContent><DialogHeader><DialogTitle>Create Manual Payment</DialogTitle></DialogHeader><form onSubmit={handleManualPaymentSubmit} className="p-1 space-y-4">
            <Label>Customer Name <span className="text-red-500">*</span></Label><Input required value={newPayment.customer} onChange={e => setNewPayment({...newPayment, customer: e.target.value})} />
            <Label>Customer Email</Label><Input type="email" value={newPayment.customerEmail} onChange={e => setNewPayment({...newPayment, customerEmail: e.target.value})} />
            <Label>Camp <span className="text-red-500">*</span></Label><Select onValueChange={v => setNewPayment({...newPayment, campId: v})}><SelectTrigger><SelectValue placeholder="Select camp" /></SelectTrigger><SelectContent>{camps.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
            <div className="grid grid-cols-2 gap-4"><div><Label>Amount <span className="text-red-500">*</span></Label><Input required type="number" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} /></div><div><Label>Status</Label><Select onValueChange={(v: any) => setNewPayment({...newPayment, status: v})} defaultValue="Paid"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Pending">Pending</SelectItem></SelectContent></Select></div></div>
            <div><Label>Payment Method</Label><Select onValueChange={(v: any) => setNewPayment({...newPayment, paymentMethod: v})} defaultValue="Credit Card"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Credit Card">Credit Card</SelectItem><SelectItem value="Debit Card">Debit Card</SelectItem><SelectItem value="Net Banking">Net Banking</SelectItem><SelectItem value="UPI">UPI</SelectItem></SelectContent></Select></div>
            <div className="pt-2 flex gap-3"><Button type="button" variant="outline" onClick={() => setIsManualPaymentOpen(false)}>Cancel</Button><Button type="submit">Create Payment</Button></div>
        </form></DialogContent></Dialog>}
        {actionToConfirm && <ConfirmationModal isOpen onCancel={() => setActionToConfirm(null)} onConfirm={actionToConfirm.action} title={actionToConfirm.title} description={actionToConfirm.description} />}
    </>
  );
}
