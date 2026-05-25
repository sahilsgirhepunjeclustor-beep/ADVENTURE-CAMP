"use client";

import React, { useState, useEffect } from 'react';
import { User, Notification, Camp, UploadedDoc } from '@/lib/types';
import { 
  getAppData, 
  saveAppData, 
  getUsers, 
  saveUsers, 
  getPendingCamps, 
  savePendingCamps,
  saveApprovedCamps,
  getAllApprovedCamps
} from '@/lib/store';
import { 
  Bell, 
  CheckCircle2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Building2,
  MapPin,
  Clock,
  Eye,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  FileText,
  ShieldCheck,
  X,
  FileX,
  User as UserIcon,
  ArrowLeft,
  AlertCircle,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/hooks/use-toast';
import { fmtDate, cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ActionCenterProps {
  currentUser: User;
  onNavigate: (page: string) => void;
  onBack?: () => void;
}

export default function ActionCenter({ currentUser, onNavigate, onBack }: ActionCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingOrgs, setPendingOrgs] = useState<User[]>([]);
  const [pendingCamps, setPendingCamps] = useState<Camp[]>([]);
  const [orgIdx, setOrgIdx] = useState(0);
  const [auditUser, setAuditUser] = useState<User | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isOrgRejectOpen, setIsOrgRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [previewDoc, setPreviewDoc] = useState<{ label: string; doc?: UploadedDoc } | null>(null);

  const refreshData = () => {
    const data = getAppData(currentUser.email);
    setNotifications(data.notifications || []);
    
    const users = getUsers();
    const currentPendingOrgs = Object.values(users).filter(u => u.role === 'organizer' && !u.isApproved && !u.isRejected);
    setPendingOrgs(currentPendingOrgs);
    
    const currentPendingCamps = getPendingCamps();
    setPendingCamps(currentPendingCamps);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, [currentUser.email]);

  const handleMarkRead = (id: string) => {
    const data = getAppData(currentUser.email);
    data.notifications = (data.notifications || []).map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(data.notifications);
    saveAppData(currentUser.email, data);
  };

  const handleOrgAction = (email: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      setIsOrgRejectOpen(true);
      return;
    }

    const users = getUsers();
    const user = users[email.toLowerCase()];
    if (!user) return;

    if (action === 'approve') {
      user.isApproved = true;
      user.isRejected = false;
      user.rejectionReason = undefined;
      toast({ title: 'Organizer Verified' });
    } else {
      user.isApproved = false;
      user.isRejected = true;
      user.rejectionReason = rejectionReason;
      toast({ variant: 'destructive', title: 'Organizer Rejected' });
    }

    saveUsers(users);
    setIsAuditOpen(false);
    setIsOrgRejectOpen(false);
    setRejectionReason('');
    refreshData();
  };

  const handleCampAction = (campId: string, action: 'approve' | 'reject') => {
    const currentPending = getPendingCamps();
    const camp = currentPending.find(c => c.id === campId);
    if (!camp) return;

    if (action === 'approve') {
      const approved = getAllApprovedCamps();
      saveApprovedCamps([{ ...camp, status: 'approved' }, ...approved]);
      toast({ title: 'Camp Live!' });
    } else {
      toast({ variant: 'destructive', title: 'Camp Rejected' });
    }

    const updatedPending = currentPending.filter(c => c.id !== campId);
    savePendingCamps(updatedPending);
    refreshData();
  };

  const pendingAuditTotal = pendingOrgs.length + pendingCamps.length;
  const unreadAlerts = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onBack} 
              className="rounded-full h-10 w-10 border-slate-200 shadow-sm hover:bg-slate-50 shrink-0"
            >
              <ArrowLeft size={18} className="text-slate-600" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Action Center</h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1.5 opacity-70">Operations Hub</p>
          </div>
        </div>
        <div className={cn(
          "bg-white px-5 py-3 rounded-2xl border border-border/50 shadow-sm flex flex-col items-center transition-all",
          pendingAuditTotal > 0 && "border-orange-200 shadow-orange-100"
        )}>
           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending Audit</div>
           <div className={cn("text-xl font-black text-primary leading-none mt-1", pendingAuditTotal > 0 && "animate-shake text-orange-500")}>{pendingAuditTotal}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 space-y-6">
          <Tabs defaultValue="organizers" className="w-full">
            <TabsList className="bg-muted/30 p-1 rounded-2xl mb-4 h-12 w-full sm:w-auto">
              <TabsTrigger value="organizers" className="flex-1 sm:flex-none rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">Partner Registry ({pendingOrgs.length})</TabsTrigger>
              <TabsTrigger value="camps" className="flex-1 sm:flex-none rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">Camp Verif. ({pendingCamps.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="organizers">
              {pendingOrgs.length === 0 ? (
                <div className="bg-white p-16 text-center rounded-[32px] border border-slate-100 shadow-sm opacity-50">
                   <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500 opacity-20" />
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">All applications audited</h3>
                </div>
              ) : (
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-sm animate-in fade-in zoom-in duration-300 relative max-w-2xl mx-auto w-full">
                  <button 
                    onClick={() => { setAuditUser(pendingOrgs[orgIdx]); setIsAuditOpen(true); }}
                    className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <Eye size={24} />
                  </button>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-3xl font-black shrink-0">
                      {pendingOrgs[orgIdx]?.firstName[0]}
                    </div>
                    <div className="flex-1 min-w-0 pr-0 sm:pr-10">
                      <div className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-tight truncate">
                        {pendingOrgs[orgIdx]?.firstName} {pendingOrgs[orgIdx]?.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold mb-4 uppercase">{pendingOrgs[orgIdx]?.email}</div>
                      
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <div className="flex items-center justify-center sm:justify-start gap-3 text-xs font-bold text-slate-600">
                            <Building2 size={14} className="text-primary shrink-0" />
                            <span className="truncate uppercase">{pendingOrgs[orgIdx]?.organizerProfile?.businessName}</span>
                         </div>
                         <div className="flex items-center justify-center sm:justify-start gap-3 text-[10px] font-bold text-slate-500">
                            <MapPin size={14} className="text-primary shrink-0" />
                            <span className="truncate uppercase leading-tight">{pendingOrgs[orgIdx]?.organizerProfile?.businessAddress}</span>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => handleOrgAction(pendingOrgs[orgIdx].email, 'approve')} className="flex-1 h-14 rounded-2xl bg-primary hover:bg-accent font-black text-xs text-white uppercase tracking-widest shadow-xl border-none">Activate</Button>
                    <Button onClick={() => { setAuditUser(pendingOrgs[orgIdx]); setIsOrgRejectOpen(true); }} className="flex-1 h-14 rounded-2xl bg-red-500 hover:bg-red-600 font-black text-xs text-white uppercase tracking-widest shadow-xl border-none">Reject</Button>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
                    <Button variant="outline" size="icon" onClick={() => setOrgIdx(p => Math.max(0, p - 1))} disabled={orgIdx === 0} className="h-10 w-10 rounded-xl"><ChevronLeft size={16} /></Button>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{orgIdx + 1} / {pendingOrgs.length} Applications</span>
                    <Button variant="outline" size="icon" onClick={() => setOrgIdx(p => Math.min(pendingOrgs.length - 1, p + 1))} disabled={orgIdx === pendingOrgs.length - 1} className="h-10 w-10 rounded-xl"><ChevronRight size={16} /></Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="camps">
              <div className="space-y-4">
                {pendingCamps.length === 0 ? (
                  <div className="bg-white p-16 text-center rounded-[32px] border border-slate-100 shadow-sm opacity-50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">Camp audits complete</h3>
                  </div>
                ) : (
                  pendingCamps.map(camp => (
                    <div key={camp.id} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-5 animate-in slide-in-from-bottom-2">
                       <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                          <img src={camp.campImages[0]} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1 min-w-0 text-center sm:text-left">
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter truncate leading-tight">{camp.name}</h4>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-[9px] text-slate-400 font-bold mt-1.5 uppercase">
                             <div className="flex items-center gap-1.5"><MapPin size={12} className="text-primary" /> {camp.location}</div>
                             <div className="flex items-center gap-1.5"><Clock size={12} className="text-primary" /> {camp.duration}d</div>
                          </div>
                       </div>
                       <div className="flex gap-3 w-full sm:w-auto">
                          <Button onClick={() => handleCampAction(camp.id, 'reject')} variant="ghost" className="flex-1 sm:flex-none h-10 w-10 rounded-xl text-destructive hover:bg-red-50 p-0"><Trash2 size={16} /></Button>
                          <Button onClick={() => handleCampAction(camp.id, 'approve')} className="flex-[2] sm:flex-none h-10 px-5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-sm text-white border-none">Verify</Button>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="xl:col-span-5">
           <div className="bg-slate-900 rounded-[32px] p-6 shadow-2xl text-white">
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                       <Bell size={20} className={cn(unreadAlerts > 0 && "animate-shake text-orange-400")} />
                    </div>
                    <div>
                       <h3 className="text-xs font-black uppercase tracking-widest">Platform Alerts</h3>
                       <p className="text-[9px] text-slate-400 font-bold uppercase">{unreadAlerts} Unread</p>
                    </div>
                 </div>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                 <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <div className="py-20 text-center opacity-30 italic text-[11px] font-bold uppercase tracking-widest">No active alerts</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={cn("p-5 rounded-2xl border transition-all cursor-pointer group", n.read ? "bg-white/5 border-white/5 opacity-60" : "bg-white/10 border-white/10")}>
                           <div className="flex justify-between items-start">
                              <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", !n.read ? "bg-orange-500" : "bg-transparent")} />
                              <div className="flex-1 ml-4">
                                 <h4 className="text-[11px] font-black uppercase tracking-tighter mb-1 leading-tight">{n.title}</h4>
                                 <p className="text-[10px] text-slate-300 font-medium leading-relaxed">{n.message}</p>
                              </div>
                              <button onClick={() => handleMarkRead(n.id)} disabled={n.read} className="text-white/20 hover:text-white transition-colors ml-3 p-1">
                                 <CheckCircle2 size={14} />
                              </button>
                           </div>
                           <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-3 text-right">{fmtDate(n.time)}</div>
                        </div>
                      ))
                    )}
                 </div>
              </ScrollArea>
           </div>
        </div>
      </div>

      {/* Deep Audit Dialog */}
      <Dialog open={isAuditOpen} onOpenChange={setIsAuditOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[24px] border-none shadow-2xl font-sans m-4 sm:m-0 w-[95vw] h-[90vh] flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>Organizer Audit</DialogTitle>
            <DialogDescription>Full operational audit of the selected partner's business registry and compliance assets.</DialogDescription>
          </DialogHeader>
          {auditUser && (
            <div className="flex flex-col h-full bg-slate-50/50 overflow-hidden">
              <div className="bg-[#153c1c] p-6 pt-10 text-white relative shrink-0">
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-black border border-white/20 shadow-xl overflow-hidden shrink-0">
                    {auditUser.avatar ? <img src={auditUser.avatar} className="w-full h-full object-cover" /> : auditUser.firstName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-black uppercase tracking-tight truncate">{auditUser.firstName} {auditUser.lastName}</h2>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[8px] font-black uppercase tracking-widest py-0 px-2 shrink-0">Deep Audit</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-green-200/60 uppercase">
                      <span className="flex items-center gap-1.5"><Mail size={12} /> {auditUser.email}</span>
                      <span className="flex items-center gap-1.5"><Phone size={12} /> {auditUser.phone || 'N/A'}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> DOB: {auditUser.dob || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 w-full">
                <div className="p-6 md:p-8 space-y-8 pb-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Business Details */}
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Building2 size={12} className="text-primary" /> Business Profile</h4>
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                             <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Entity Name</p>
                             <p className="text-xs font-black text-slate-900 uppercase">{auditUser.organizerProfile?.businessName}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                               <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">GST Identification</p>
                               <p className="text-xs font-bold text-slate-700">{auditUser.organizerProfile?.gstNumber || 'N/A'}</p>
                            </div>
                            <div>
                               <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">PAN Number</p>
                               <p className="text-xs font-bold text-slate-700">{auditUser.organizerProfile?.panNumber || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                               <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">License #</p>
                               <p className="text-xs font-bold text-slate-700">{auditUser.organizerProfile?.registrationNumber}</p>
                            </div>
                            <div>
                               <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Established</p>
                               <p className="text-xs font-bold text-slate-700">{auditUser.organizerProfile?.establishedYear}</p>
                            </div>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">HQ Address</p>
                             <p className="text-[10px] font-bold text-slate-600 uppercase leading-tight">{auditUser.organizerProfile?.businessAddress}, {auditUser.organizerProfile?.businessPincode}</p>
                          </div>
                        </div>
                      </div>

                      {/* Bank Details */}
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CreditCard size={12} className="text-primary" /> Settlement Account</h4>
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                         <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Bank Name</p>
                            <p className="text-xs font-black text-slate-900 uppercase">{auditUser.organizerProfile?.bankName || 'N/A'}</p>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Account Number</p>
                              <p className="text-xs font-bold text-slate-700">{auditUser.organizerProfile?.bankAccount}</p>
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">IFSC Code</p>
                              <p className="text-xs font-bold text-slate-700 uppercase">{auditUser.organizerProfile?.ifscCode}</p>
                           </div>
                         </div>
                      </div>
                    </div>

                    {/* Verification Assets */}
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText size={12} className="text-primary" /> Compliance Documentation</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { label: 'Government ID', doc: auditUser.organizerProfile?.govIdDoc, icon: UserIcon, color: 'bg-blue-50 text-blue-600' },
                          { label: 'Business License', doc: auditUser.organizerProfile?.registrationDoc, icon: Building2, color: 'bg-green-50 text-green-600' },
                          { label: 'PAN Card Copy', doc: auditUser.organizerProfile?.panDoc, icon: Hash, color: 'bg-orange-50 text-orange-600' },
                          { label: 'Cancelled Cheque', doc: auditUser.organizerProfile?.bankDoc, icon: CreditCard, color: 'bg-purple-50 text-purple-600' },
                          { label: 'Safety Certification', doc: auditUser.organizerProfile?.safetyDoc, icon: ShieldCheck, color: 'bg-amber-50 text-amber-600' }
                        ].map(item => (
                          <div key={item.label} className="p-4 bg-white rounded-xl border border-slate-100 flex items-center justify-between shadow-sm group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-4">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.color)}>
                                 <item.icon size={18} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{item.label}</p>
                                 <p className={cn("text-[8px] font-bold uppercase", item.doc?.data ? "text-green-500" : "text-slate-400")}>
                                   {item.doc?.data ? 'ATTACHMENT VERIFIED' : 'ASSET MISSING'}
                                 </p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setPreviewDoc({ label: item.label, doc: item.doc })}
                              className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
                         <ShieldCheck size={18} className="text-primary shrink-0" />
                         <p className="text-[9px] text-slate-500 font-medium leading-relaxed uppercase">Platform security requires 100% document verification for all operational partners.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-6 bg-white border-t border-slate-100 flex gap-4 shrink-0 mt-auto">
                <Button 
                  onClick={() => { setAuditUser(auditUser); setIsOrgRejectOpen(true); }} 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl border-red-100 text-red-600 bg-red-50 hover:bg-red-500 hover:text-white hover:border-red-500 font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  Reject Registry
                </Button>
                <Button onClick={() => handleOrgAction(auditUser.email, 'approve')} className="flex-[2] h-12 rounded-xl bg-primary hover:bg-accent text-white font-black uppercase text-[10px] tracking-widest shadow-lg transition-all border-none">Approve & Activate Partner</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Partner Rejection Reason Dialog */}
      <Dialog open={isOrgRejectOpen} onOpenChange={setIsOrgRejectOpen}>
        <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden font-sans">
          <DialogHeader className="bg-[#153c1c] p-6 text-white">
            <DialogTitle className="text-xs font-black uppercase tracking-widest">Partner Rejection Protocol</DialogTitle>
            <DialogDescription className="text-[9px] text-green-200/60 font-bold uppercase mt-1">Registry Audit Decline for {auditUser?.organizerProfile?.businessName}</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audit Intelligence (Reason)</Label>
              <Textarea 
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Explain why this partner was declined (e.g., Invalid business registration, mismatched identity)..."
                className="min-h-[120px] rounded-2xl bg-slate-50 border-slate-100 text-xs font-bold leading-relaxed"
              />
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setIsOrgRejectOpen(false)} className="flex-1 rounded-xl h-12 font-black uppercase text-[10px]">Cancel</Button>
              <Button onClick={() => auditUser && handleOrgAction(auditUser.email, 'reject')} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-12 font-black uppercase text-[10px] shadow-lg shadow-red-500/10 border-none">Confirm Rejection</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[24px] border-none shadow-2xl font-sans m-4 w-[90vw]">
           <DialogHeader className="sr-only">
             <DialogTitle>Audit Asset Preview</DialogTitle>
             <DialogDescription>A visual preview of the uploaded compliance document for administrative verification.</DialogDescription>
           </DialogHeader>
           {previewDoc && (
             <div className="flex flex-col h-full">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600">{previewDoc.label}</h3>
                </div>
                <div className="p-8 flex items-center justify-center bg-white min-h-[300px]">
                   {previewDoc.doc?.data ? (
                     <div className="w-full flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                        {previewDoc.doc.type.startsWith('image/') ? (
                           <img src={previewDoc.doc.data} className="max-w-full max-h-[60vh] rounded-xl shadow-xl object-contain border border-slate-100" />
                        ) : (
                           <div className="text-center p-12 bg-slate-50 rounded-[32px] border border-slate-100 max-w-xs">
                              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary"><FileText size={32} /></div>
                              <p className="text-xs font-black text-slate-900 uppercase mb-4 leading-tight">{previewDoc.doc.name}</p>
                              <Button className="w-full rounded-xl font-black text-[10px] uppercase h-10 shadow-lg text-white border-none">Download PDF</Button>
                           </div>
                        )}
                     </div>
                   ) : (
                     <div className="text-center space-y-3 animate-in fade-in duration-500 p-8">
                        <FileX size={40} className="mx-auto text-red-200" />
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">No asset found</h4>
                        <p className="text-[9px] text-slate-400 font-bold max-w-[200px] mx-auto leading-relaxed uppercase">The organizer did not submit this compliance asset during registration.</p>
                     </div>
                   )}
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
