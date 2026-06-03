"use client";

import React, { useState, useMemo } from 'react';
import { User, SupportTicket } from '@/lib/types';
import { getSupportTickets, saveSupportTickets } from '@/lib/store';
import { fmtDate, cn, uid } from '@/lib/utils';
import { 
  LifeBuoy, 
  ArrowLeft, 
  Plus, 
  MessageSquare, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Search,
  Filter,
  Send,
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserSupportProps {
  currentUser: User;
  onBack: () => void;
}

export default function UserSupport({ currentUser, onBack }: UserSupportProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'General Support' as any,
    priority: 'Low' as any
  });

  const allTickets = getSupportTickets();
  const myTickets = useMemo(() => 
    allTickets.filter(t => t.userEmail === currentUser.email)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [allTickets, currentUser.email]
  );

  const filteredTickets = myTickets.filter(t => 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) return;

    const ticket: SupportTicket = {
      id: 'T-' + uid().toUpperCase(),
      userEmail: currentUser.email,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      subject: newTicket.subject,
      message: newTicket.message,
      category: newTicket.category,
      priority: newTicket.priority,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveSupportTickets([ticket, ...allTickets]);
    setIsAddOpen(false);
    setNewTicket({ subject: '', message: '', category: 'General Support', priority: 'Low' });
    toast({ title: 'Ticket Created', description: 'Our support guides will audit your request shortly.' });
  };

  return (
    <div className="space-y-8 pb-20 font-sans animate-in fade-in duration-700 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-12 w-12 border-slate-200 shadow-sm hover:bg-slate-50">
            <ArrowLeft size={20} className="text-slate-600" />
          </Button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Support Hub</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Concierge assistance and dispute resolution center</p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 rounded-2xl bg-primary hover:bg-accent text-white font-black text-[10px] uppercase tracking-widest px-8 shadow-xl shadow-primary/20 border-none gap-2">
               <Plus size={16} /> Raise Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden font-sans">
             <DialogHeader className="sr-only"><DialogTitle>Open Support Ticket</DialogTitle></DialogHeader>
             <div className="bg-[#0d2a1d] p-8 text-white">
                <h3 className="text-sm font-black uppercase tracking-widest">Platform Concierge</h3>
                <p className="text-[10px] text-green-200/60 font-bold mt-1 uppercase">Define your assistance request</p>
             </div>
             <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Subject</label>
                   <Input value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} placeholder="e.g. Refund Request for #TXN-123" className="rounded-xl h-12 font-bold" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Category</label>
                      <Select value={newTicket.category} onValueChange={v => setNewTicket({...newTicket, category: v as any})}>
                         <SelectTrigger className="h-12 rounded-xl font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="General Support">General</SelectItem>
                            <SelectItem value="Complaint">Complaint</SelectItem>
                            <SelectItem value="Dispute">Dispute</SelectItem>
                            <SelectItem value="Escalation">Escalation</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Priority</label>
                      <Select value={newTicket.priority} onValueChange={v => setNewTicket({...newTicket, priority: v as any})}>
                         <SelectTrigger className="h-12 rounded-xl font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Message</label>
                   <Textarea value={newTicket.message} onChange={e => setNewTicket({...newTicket, message: e.target.value})} placeholder="Describe your issue in detail..." className="rounded-2xl min-h-[120px] font-bold text-xs" required />
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest mt-4 shadow-xl text-white border-none gap-2">
                   <Send size={16} /> Dispatch Request
                </Button>
             </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-wrap gap-4 items-center bg-white p-3 rounded-[24px] border border-slate-100 shadow-sm">
           <div className="relative flex-1 min-w-[280px]">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <Input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Audit Tickets (Subject, ID)..." 
                className="pl-12 h-12 rounded-2xl bg-slate-50 border-none font-bold text-[11px] uppercase"
              />
           </div>
           <div className="px-6 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{myTickets.length} ACTIVE REQUESTS</span>
           </div>
        </div>

        <div className="space-y-4">
           {filteredTickets.length === 0 ? (
             <div className="py-32 text-center bg-white rounded-[40px] border border-dashed border-slate-200 opacity-50 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-200 mb-6"><LifeBuoy size={40} /></div>
                <p className="text-sm font-black uppercase text-slate-400 tracking-widest">No support records found</p>
             </div>
           ) : (
             filteredTickets.map(t => (
               <div key={t.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 hover:shadow-xl transition-all group">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                    t.priority === 'Critical' ? "bg-red-50 border-red-100 text-red-600" :
                    t.priority === 'High' ? "bg-orange-50 border-orange-100 text-orange-600" :
                    "bg-blue-50 border-blue-100 text-blue-600"
                  )}>
                     {t.category === 'Dispute' ? <ShieldAlert size={20} /> : <MessageSquare size={20} />}
                  </div>
                  
                  <div className="flex-1 min-w-0 w-full text-center md:text-left">
                     <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-2">
                        <Badge variant="outline" className="bg-slate-50 border-slate-100 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg">ID: {t.id}</Badge>
                        <Badge className={cn(
                          "border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-lg",
                          t.status === 'Resolved' ? "bg-green-100 text-green-700" : 
                          t.status === 'In-Progress' ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {t.status}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{fmtDate(t.createdAt)}</span>
                     </div>
                     <h4 className="text-base font-black text-slate-900 uppercase tracking-tight truncate leading-none mb-2">{t.subject}</h4>
                     <p className="text-[11px] text-slate-500 font-medium line-clamp-1 italic">"{t.message}"</p>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-center md:justify-end">
                     <div className="text-right hidden xl:block">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">PRIORITY</p>
                        <p className={cn("text-[10px] font-black uppercase", t.priority === 'Critical' ? 'text-red-600' : 'text-slate-600')}>{t.priority}</p>
                     </div>
                     <Button variant="outline" className="rounded-xl h-10 px-5 font-black text-[9px] uppercase tracking-widest border-slate-200">Audit Status</Button>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
