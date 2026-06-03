"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { User, Review, Camp } from '@/lib/types';
import { getAllApprovedCamps, getAppData, saveAppData, getUsers } from '@/lib/store';
import { stars, fmtDate, uid, cn } from '@/lib/utils';
import { 
  Star, 
  Search, 
  MessageSquare, 
  Reply, 
  Flag, 
  Trash2, 
  ArrowLeft,
  X,
  Send,
  ShieldAlert,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrganizerReviewsProps {
  currentUser: User;
  onBack: () => void;
}

export default function OrganizerReviews({ currentUser, onBack }: OrganizerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reporting, setReporting] = useState<Review | null>(null);
  const [reportReason, setReportReason] = useState('');

  const myCampIds = useMemo(() => {
    return getAllApprovedCamps()
      .filter(c => c.addedBy === currentUser.email)
      .map(c => c.id);
  }, [currentUser.email]);

  const fetchReviews = () => {
    const allUsers = getUsers();
    const allReviews: Review[] = [];
    Object.keys(allUsers).forEach(email => {
      const data = getAppData(email);
      const relevant = data.reviews.filter(r => myCampIds.includes(r.campId));
      allReviews.push(...relevant);
    });
    setReviews(allReviews.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
  };

  useEffect(() => {
    fetchReviews();
  }, [myCampIds]);

  const filteredReviews = reviews.filter(r => 
    r.camp.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTo || !replyText.trim()) return;

    const customerData = getAppData(replyingTo.customerEmail);
    customerData.reviews = customerData.reviews.map(r => 
      r.id === replyingTo.id ? { ...r, reply: replyText, repliedAt: new Date().toISOString() } : r
    );
    saveAppData(replyingTo.customerEmail, customerData);

    toast({ title: 'Reply Published', description: 'Your response is now visible to all explorers.' });
    setReplyingTo(null);
    setReplyText('');
    fetchReviews();
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporting || !reportReason.trim()) return;

    const customerData = getAppData(reporting.customerEmail);
    customerData.reviews = customerData.reviews.map(r => 
      r.id === reporting.id ? { ...r, isReported: true, reportReason } : r
    );
    saveAppData(reporting.customerEmail, customerData);

    toast({ title: 'Review Reported', description: 'Administrative staff will audit this feedback shortly.' });
    setReporting(null);
    setReportReason('');
    fetchReviews();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-sans pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-10 w-10 border-slate-200 shadow-sm">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Guest Feedback</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5 opacity-70">Experience & Reputation Audit</p>
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <Input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search reviews..." 
            className="pl-12 h-12 rounded-2xl bg-white border-slate-100 shadow-sm font-bold text-[11px] uppercase"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200 opacity-50 flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-200 mb-6">
                <MessageSquare size={40} />
             </div>
             <p className="text-sm font-black uppercase text-slate-400 tracking-widest">No reviews found in your registry</p>
          </div>
        ) : (
          filteredReviews.map(r => (
            <div key={r.id} className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-lg transition-all group border-l-[8px] border-l-primary/10 hover:border-l-primary">
               <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg border border-white shadow-sm overflow-hidden">
                              {r.avatar ? <img src={r.avatar} className="w-full h-full object-cover" /> : r.customer[0]}
                           </div>
                           <div>
                              <h4 className="text-base font-black text-slate-900 uppercase tracking-tighter leading-none mb-1.5">{r.customer}</h4>
                              <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                 <Badge variant="outline" className="bg-slate-50 border-slate-100 text-[8px] px-2 py-0">{r.camp}</Badge>
                                 <span>•</span>
                                 <span>{fmtDate(r.time)}</span>
                              </div>
                           </div>
                        </div>
                        <div className="text-amber-500 text-[10px] flex gap-0.5">{stars(r.rating)}</div>
                     </div>

                     <div className="relative">
                        <div className="absolute -left-2 -top-2 text-3xl text-slate-50 font-serif">“</div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed italic relative z-10">{r.text}</p>
                     </div>

                     {r.reply && (
                       <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 space-y-2 animate-in slide-in-from-top-2">
                          <div className="flex justify-between items-center">
                             <div className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <Reply size={12} /> Your Response
                             </div>
                             <span className="text-[8px] text-slate-400 font-bold">{fmtDate(r.repliedAt)}</span>
                          </div>
                          <p className="text-xs text-slate-700 font-bold leading-relaxed">{r.reply}</p>
                       </div>
                     )}

                     {r.isReported && (
                       <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
                          <ShieldAlert size={14} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Audit: Review reported as fake</span>
                       </div>
                     )}
                  </div>

                  <div className="flex flex-row md:flex-col justify-end gap-2 md:w-32 shrink-0">
                     {!r.reply && (
                        <Button 
                          onClick={() => setReplyingTo(r)}
                          className="flex-1 md:flex-none h-10 rounded-xl bg-primary hover:bg-accent text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-primary/10 border-none gap-2"
                        >
                           <Reply size={14} /> Reply
                        </Button>
                     )}
                     <Button 
                       variant="outline"
                       onClick={() => setReporting(r)}
                       disabled={r.isReported}
                       className="flex-1 md:flex-none h-10 rounded-xl border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 font-black text-[9px] uppercase tracking-widest gap-2"
                     >
                        <Flag size={14} /> {r.isReported ? 'Reported' : 'Report'}
                     </Button>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={!!replyingTo} onOpenChange={() => setReplyingTo(null)}>
        <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden font-sans">
          <DialogHeader className="sr-only"><DialogTitle>Reply to Review</DialogTitle></DialogHeader>
          <div className="bg-[#0d2a1d] p-8 text-white">
             <h3 className="text-sm font-black uppercase tracking-widest">Public Response</h3>
             <p className="text-[10px] text-green-200/60 font-bold mt-1 uppercase">Respond to {replyingTo?.customer}'s feedback</p>
          </div>
          <form onSubmit={handleReplySubmit} className="p-8 space-y-6 bg-white">
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Message</label>
                <Textarea 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Thank the explorer for their visit..."
                  className="rounded-2xl min-h-[120px] font-bold text-xs"
                  required
                />
             </div>
             <div className="flex gap-4">
                <Button variant="ghost" type="button" onClick={() => setReplyingTo(null)} className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase">Cancel</Button>
                <Button type="submit" className="flex-1 h-12 rounded-xl bg-primary hover:bg-accent text-white font-black text-[10px] uppercase shadow-lg shadow-primary/20 border-none gap-2">
                   <Send size={14} /> Post Reply
                </Button>
             </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={!!reporting} onOpenChange={() => setReporting(null)}>
        <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden font-sans">
          <DialogHeader className="sr-only"><DialogTitle>Report Review</DialogTitle></DialogHeader>
          <div className="bg-red-900 p-8 text-white">
             <h3 className="text-sm font-black uppercase tracking-widest">Integrity Audit</h3>
             <p className="text-[10px] text-red-300 font-bold mt-1 uppercase">Flag review from {reporting?.customer}</p>
          </div>
          <form onSubmit={handleReportSubmit} className="p-8 space-y-6 bg-white">
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audit Reason</label>
                <Textarea 
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="Explain why this review should be audited (e.g. Fake booking, inappropriate language)..."
                  className="rounded-2xl min-h-[120px] font-bold text-xs bg-red-50/20 border-red-100"
                  required
                />
             </div>
             <div className="flex gap-4">
                <Button variant="ghost" type="button" onClick={() => setReporting(null)} className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase">Cancel</Button>
                <Button type="submit" className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase shadow-lg shadow-red-600/20 border-none gap-2">
                   <AlertCircle size={14} /> Request Audit
                </Button>
             </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
