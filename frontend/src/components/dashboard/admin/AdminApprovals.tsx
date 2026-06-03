/**
 * @file AdminApprovals.tsx
 * @description This component provides a comprehensive interface for administrators to manage the approval lifecycle of camps.
 * It includes tabs for pending, approved, rejected, and archived camps, allowing for efficient moderation and lifecycle management.
 * Admins can view camp details, approve, reject with a reason, update status, and restore rejected camps.
 *
 * @requires react
 * @requires lucide-react - for icons
 * @requires @/lib/types - for the Camp type definition
 * @requires @/lib/store - for data persistence and retrieval functions related to camps and user notifications
 * @requires @/lib/utils - for utility functions like date formatting, class name construction, and unique ID generation
 * @requires @/components/ui/* - for various UI components (Button, Badge, Dialog, Tabs, etc.)
 */

"use client";

// Import necessary libraries, types, and components
import React, { useState, useEffect, useMemo } from 'react';
import {
  getPendingCamps,
  getAllApprovedCamps,
  getRejectedCamps,
  savePendingCamps,
  saveApprovedCamps,
  saveRejectedCamps,
  addUserNotification
} from '@/lib/store';
import { Camp } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { fmt, fmtDate, cn, uid } from '@/lib/utils';
import {
  Check,
  X,
  Eye,
  MapPin,
  Calendar,
  Building2,
  Mountain,
  FileText,
  RotateCcw,
  LayoutGrid,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Star,
  EyeOff,
  History,
  AlertCircle,
  Undo2,
  PauseCircle,
  CheckCircle,
  Utensils,
  Backpack,
  CloudSun,
  ShieldAlert,
  Zap,
  Clock,
  Info,
  Users
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ITEMS_PER_PAGE = 8;

/**
 * @interface AdminApprovalsProps
 * @description Defines the props for the AdminApprovals component.
 * @property {() => void} [onBack] - Optional callback function to handle back navigation.
 */
interface AdminApprovalsProps {
  onBack?: () => void;
  initialTab?: 'pending' | 'approved' | 'rejected' | 'archived' | 'featured';
}

/**
 * @function AdminApprovals
 * @description The main component for managing camp approvals and their lifecycle.
 * @param {AdminApprovalsProps} props - The component's props.
 * @returns {JSX.Element} The rendered component.
 */
export default function AdminApprovals({ onBack, initialTab }: AdminApprovalsProps) {
  // --- STATE MANAGEMENT ---

  // The currently active tab (e.g., pending, approved).
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'archived' | 'featured'>('pending');
  // State for camps pending approval.
  const [pending, setPending] = useState<Camp[]>([]);
  // State for approved camps.
  const [approved, setApproved] = useState<Camp[]>([]);
  // State for rejected camps.
  const [rejected, setRejected] = useState<Camp[]>([]);
  // State for archived camps (inactive or completed).
  const [archived, setArchived] = useState<Camp[]>([]);
  // The camp currently selected for detailed view or action.
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  // State to control the visibility of the camp details dialog.
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  // State to control the visibility of the rejection reason dialog.
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  // State for the rejection reason text.
  const [rejectionReason, setRejectionReason] = useState('');
  // State for the current page number for pagination.
  const [currentPage, setCurrentPage] = useState(1);

  // --- DATA LOADING & SYNCHRONIZATION ---

  /**
   * @function loadData
   * @description Loads all camp data from the store and categorizes it into the respective state arrays.
   */
  const loadData = () => {
    const allApproved = getAllApprovedCamps();
    setPending(getPendingCamps());
    setApproved(allApproved.filter(c => c.status === 'approved'));
    setRejected(getRejectedCamps());
    setArchived(allApproved.filter(c => c.status === 'inactive' || c.status === 'completed'));
  };

  /**
   * @effect
   * @description Loads data on initial component mount.
   */
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  /**
   * @effect
   * @description Resets pagination to the first page whenever the active tab changes.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // --- MEMOIZED COMPUTATIONS ---

  // Memoized list of camps to display based on the active tab.
  const currentList = useMemo(() => {
    if (activeTab === 'pending') return pending;
    if (activeTab === 'approved') return approved;
    if (activeTab === 'rejected') return rejected;
    if (activeTab === 'featured') return approved.filter(c => c.isFeatured);
    return archived;
  }, [activeTab, pending, approved, rejected, archived]);

  const totalPages = Math.ceil(currentList.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedList = currentList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  /**
   * @function syncStore
   * @description A utility function to save all camp lists to the store and update the component's state.
   * @param {Camp[]} newPending - The updated list of pending camps.
   * @param {Camp[]} newApproved - The updated list of approved camps.
   * @param {Camp[]} newRejected - The updated list of rejected camps.
   */
  const syncStore = (newPending: Camp[], newApproved: Camp[], newRejected: Camp[]) => {
    savePendingCamps(newPending);
    saveApprovedCamps(newApproved);
    saveRejectedCamps(newRejected);

    setPending(newPending);
    setApproved(newApproved.filter(c => c.status === 'approved'));
    setRejected(newRejected);
    setArchived(newApproved.filter(c => c.status === 'inactive' || c.status === 'completed'));
  };

  // --- ACTION HANDLERS ---

  /**
   * @function handleApprove
   * @description Approves a camp, moving it from the pending list to the approved list.
   * @param {Camp} camp - The camp to approve.
   */
  const handleApprove = (camp: Camp) => {
    const allApproved = getAllApprovedCamps();
    const newPending = pending.filter(c => c.id !== camp.id);
    const newRejected = rejected.filter(c => c.id !== camp.id);
    const updatedApproved = [{ ...camp, status: 'approved' as const, rejectionReason: undefined }, ...allApproved.filter(c => c.id !== camp.id)];

    syncStore(newPending, updatedApproved, newRejected);

    // Notify the camp organizer about the approval.
    addUserNotification(camp.addedBy, {
      id: uid(),
      type: 'approval',
      title: 'Expedition Approved!',
      message: `Your camp "${camp.name}" has been verified and is now live in the marketplace.`,
      time: new Date().toISOString(),
      read: false
    });

    toast({ title: 'Camp Approved!', description: `${camp.name} is now live.` });
    setIsDetailsOpen(false);
  };

  /**
   * @function handleReject
   * @description Rejects a camp, moving it to the rejected list.
   * @param {Camp} camp - The camp to reject.
   */
  const handleReject = (camp: Camp) => {
    if (!rejectionReason.trim()) {
      toast({ variant: 'destructive', title: 'Action Required', description: 'Please provide a reason for rejection.' });
      return;
    }

    const allApproved = getAllApprovedCamps();
    const newPending = pending.filter(c => c.id !== camp.id);
    const newApproved = allApproved.filter(c => c.id !== camp.id);
    const newRejected = [{ ...camp, status: 'rejected' as const, rejectionReason }, ...rejected];

    syncStore(newPending, newApproved, newRejected);

    // Notify the camp organizer about the rejection.
    addUserNotification(camp.addedBy, {
      id: uid(),
      type: 'info',
      title: 'Camp Audit Declined',
      message: `"${camp.name}" was not approved. Reason: ${rejectionReason}`,
      time: new Date().toISOString(),
      read: false
    });

    toast({ variant: 'destructive', title: 'Camp Rejected' });
    setIsRejectDialogOpen(false);
    setIsDetailsOpen(false);
    setRejectionReason('');
  };

  /**
   * @function handleStatusUpdate
   * @description Updates the status of an already approved camp (e.g., to inactive).
   * @param {Camp} camp - The camp to update.
   * @param {Camp['status']} status - The new status.
   */
  const handleStatusUpdate = (camp: Camp, status: Camp['status']) => {
    const allApproved = getAllApprovedCamps();
    const updated = allApproved.map(c => c.id === camp.id ? { ...c, status } : c);
    syncStore(pending, updated, rejected);

    const message = status === 'inactive' ? 'Moved to Lifecycle/Inactive tab' : 'Expedition is now Live';
    toast({ title: 'Status Updated', description: message });
  };

  /**
   * @function handleRestore
   * @description Restores a rejected camp back to the pending queue for re-evaluation.
   * @param {Camp} camp - The camp to restore.
   */
  const handleRestore = (camp: Camp) => {
    const newRejected = rejected.filter(c => c.id !== camp.id);
    const newPending = [{ ...camp, status: 'pending_approval' as const }, ...pending];
    const allApproved = getAllApprovedCamps().filter(c => c.id !== camp.id);

    syncStore(newPending, allApproved, newRejected);
    toast({ title: 'Camp Restored', description: 'Moved back to pending queue for re-evaluation.' });
  };

  /**
   * @function openReview
   * @description Opens the detailed audit view for a selected camp.
   * @param {Camp} camp - The camp to review.
   */
  const openReview = (camp: Camp) => {
    setSelectedCamp(camp);
    setIsDetailsOpen(true);
  };

  // --- RENDER METHOD ---

  return (
    <div className="space-y-6 font-sans max-w-[1600px] mx-auto px-2 md:px-4 h-full">
      {/* Header and Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 shrink-0">
        <div className="flex items-center gap-3 md:gap-4 w-full">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-10 w-10 md:h-12 md:w-12 border-slate-200 shadow-sm hover:bg-slate-50 shrink-0">
              <ArrowLeft size={18} className="text-slate-600" />
            </Button>
          )}
          <div className="min-w-0">
            <h2 className="text-xl md:text-3xl font-black text-[#0d2a1d] uppercase tracking-tight leading-none md:truncate">Inventory Moderation</h2>
            <p className="text-[9px] md:text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1.5 md:mt-2 opacity-70">Submissions & lifecycle audit</p>
          </div>
        </div>
        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-inner w-full lg:w-auto overflow-x-auto no-scrollbar">
           <button onClick={() => setActiveTab('pending')} className={cn("px-4 md:px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap", activeTab === 'pending' ? "bg-white text-primary shadow-xl" : "text-slate-400 hover:text-slate-600")}>
             <ClipboardList size={14} /> Audit ({pending.length})
           </button>
           <button onClick={() => setActiveTab('approved')} className={cn("px-4 md:px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap", activeTab === 'approved' ? "bg-white text-primary shadow-xl" : "text-slate-400 hover:text-slate-600")}>
             <LayoutGrid size={14} /> Live ({approved.length})
           </button>
           <button onClick={() => setActiveTab('featured')} className={cn("px-4 md:px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap", activeTab === 'featured' ? "bg-white text-primary shadow-xl" : "text-slate-400 hover:text-slate-600")}>
             <Star size={14} /> Featured ({approved.filter(c => c.isFeatured).length})
           </button>
           <button onClick={() => setActiveTab('archived')} className={cn("px-4 md:px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap", activeTab === 'archived' ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600")}>
             <PauseCircle size={14} /> Lifecycle ({archived.length})
           </button>
           <button onClick={() => setActiveTab('rejected')} className={cn("px-4 md:px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap", activeTab === 'rejected' ? "bg-white text-red-50 shadow-xl" : "text-slate-400 hover:text-slate-600")}>
             <History size={14} /> Rejected ({rejected.length})
           </button>
        </div>
      </div>

      {/* Camp List */}
      <div className="space-y-4 pb-20">
        {paginatedList.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-sm opacity-50 flex flex-col items-center">
            <ClipboardList size={40} className="text-slate-200 mb-6" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Queue Empty</h3>
          </div>
        ) : (
          paginatedList.map(camp => (
            <div key={camp.id} className="bg-white p-4 md:p-5 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-5 md:gap-6 hover:shadow-xl transition-all group">
              <div className="w-full md:w-32 h-40 md:h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-inner">
                <img src={camp.campImages?.[0] || 'https://picsum.photos/seed/default/400/300'} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
              </div>

              <div className="flex-1 min-w-0 text-center md:text-left w-full">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                   <h4 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight line-clamp-2 leading-tight max-w-full">{camp.name}</h4>
                   <Badge className={cn(
                     "text-[7px] font-black uppercase px-2 py-0.5 rounded-md border-none whitespace-nowrap",
                     camp.status === 'approved' ? 'bg-green-100 text-green-700' :
                     camp.status === 'inactive' ? 'bg-slate-100 text-slate-700' :
                     camp.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                     'bg-orange-100 text-orange-700'
                   )}>
                     {camp.status.toUpperCase()}
                   </Badge>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-5 text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-1.5"><MapPin size={12} className="text-primary" /> {camp.location}</div>
                  <div className="flex items-center gap-1.5"><Building2 size={12} className="text-primary" /> {camp.organizer}</div>
                </div>
              </div>

              {/* Action Buttons based on Active Tab */}
              <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                <Button onClick={() => openReview(camp)} variant="outline" size="icon" className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-slate-50 border-slate-100 hover:bg-white transition-all shadow-sm shrink-0"><Eye size={18} /></Button>

                {activeTab === 'pending' && (
                  <>
                    <Button onClick={() => handleApprove(camp)} className="flex-1 md:flex-none h-10 md:h-11 px-5 rounded-xl bg-primary hover:bg-accent font-black text-[9px] uppercase tracking-widest text-white shadow-lg">Approve</Button>
                    <Button onClick={() => { setSelectedCamp(camp); setIsRejectDialogOpen(true); }} variant="outline" className="h-10 w-10 md:h-11 md:w-11 rounded-xl border-red-100 text-red-500 bg-red-50 p-0 shrink-0"><X size={18} /></Button>
                  </>
                )}

                {activeTab === 'approved' && (
                  <Button onClick={() => handleStatusUpdate(camp, 'inactive')} variant="outline" className="flex-1 md:flex-none h-10 md:h-11 px-6 rounded-xl border-slate-200 text-slate-500 font-black text-[9px] uppercase tracking-widest">Deactivate</Button>
                )}

                {activeTab === 'archived' && (
                  <>
                    {camp.status === 'inactive' && (
                      <Button onClick={() => handleStatusUpdate(camp, 'approved')} className="flex-1 md:flex-none h-10 md:h-11 px-6 rounded-xl bg-primary text-white font-black text-[9px] uppercase tracking-widest">Make Live</Button>
                    )}
                    {camp.status === 'completed' && (
                      <Badge variant="outline" className="flex-1 md:flex-none h-10 md:h-11 px-5 rounded-xl border-emerald-200 text-emerald-600 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
                        <CheckCircle size={14} /> Completed
                      </Badge>
                    )}
                  </>
                )}

                {activeTab === 'rejected' && (
                  <Button onClick={() => handleRestore(camp)} className="flex-1 md:flex-none h-10 md:h-11 px-6 rounded-xl bg-[#0d2a1d] hover:bg-black font-black text-[9px] uppercase tracking-widest text-white shadow-xl gap-2">
                    <Undo2 size={16} /> Restore
                  </Button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 md:gap-6 py-10 border-t border-slate-50 mt-10">
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-9 w-9 md:h-10 md:w-10 rounded-xl"><ChevronLeft size={18} /></Button>
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-9 w-9 md:h-10 md:w-10 rounded-xl"><ChevronRight size={18} /></Button>
          </div>
        )}
      </div>

      {/* Rejection Reason Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden font-sans m-4">
          <DialogHeader className="bg-[#153c1c] p-6 text-white">
            <DialogTitle className="text-xs font-black uppercase tracking-widest text-white">Rejection Protocol</DialogTitle>
            <DialogDescription className="sr-only">Provide a technical reason for declining this expedition submission to guide the partner's correction process.</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rejection Intelligence (Reason)</Label>
              <Textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Reason for decline..." className="min-h-[120px] rounded-2xl bg-slate-50" />
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)} className="flex-1 rounded-xl h-12 font-black uppercase text-[10px]">Cancel</Button>
              <Button onClick={() => selectedCamp && handleReject(selectedCamp)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-12 font-black uppercase text-[10px] border-none shadow-lg shadow-red-500/10">Reject</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expanded Deep Audit Dialog for Camp Details */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl font-sans m-4 w-[95vw] flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>Deep Audit Intelligence View</DialogTitle>
            <DialogDescription>Full technical review of expedition logistics, itineraries, and safety compliance protocols.</DialogDescription>
          </DialogHeader>
          {selectedCamp && (
            <div className="flex flex-col h-full bg-white overflow-hidden">
              {/* Header with Camp Image and Title */}
              <div className="relative h-48 md:h-64 shrink-0">
                <img src={selectedCamp.campImages?.[0] || 'https://picsum.photos/seed/header/1200/600'} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 text-white pr-10 md:pr-20">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className="bg-primary/90 font-black uppercase text-[8px] md:text-[9px] tracking-widest px-2 md:px-3 py-1 rounded-xl shadow-xl">{selectedCamp.category}</Badge>
                    <Badge variant="outline" className="text-white border-white/30 font-black uppercase text-[8px] md:text-[9px] tracking-widest px-2 md:px-3 py-1 rounded-xl backdrop-blur-md">
                      AUDIT: {selectedCamp.status.toUpperCase()}
                    </Badge>
                  </div>
                  <h2 className="text-lg md:text-3xl font-black uppercase tracking-tighter leading-tight truncate max-w-[85vw]">{selectedCamp.name}</h2>
                </div>
              </div>

              {/* Tabbed content for camp details */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                   <div className="px-4 md:px-10 border-b border-slate-100 bg-slate-50 shrink-0">
                      <TabsList className="h-12 md:h-14 bg-transparent gap-4 md:gap-8 p-0 rounded-none w-full justify-start overflow-x-auto no-scrollbar">
                        {['Overview', 'Itinerary', 'Logistics', 'Safety'].map(t => (
                          <TabsTrigger
                            key={t}
                            value={t.toLowerCase()}
                            className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black text-[8px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] text-slate-400 data-[state=active]:text-slate-900 transition-all px-0 whitespace-nowrap"
                          >
                            {t}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                   </div>

                   <div className="flex-1 overflow-hidden">
                      {/* Overview Tab */}
                      <TabsContent value="overview" className="h-full mt-0 focus-visible:ring-0">
                         <ScrollArea className="h-full">
                            <div className="p-4 md:p-10 pb-20 space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-2">
                               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                                  <div className="lg:col-span-8 space-y-6 md:space-y-8">
                                     <section>
                                        <h3 className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 flex items-center gap-3">
                                           <FileText size={16} className="text-primary" /> Technical Narrative
                                        </h3>
                                        <div className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100">
                                           {selectedCamp.description || 'No description provided.'}
                                        </div>
                                     </section>

                                     <section>
                                        <h3 className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 flex items-center gap-3">
                                           <LayoutGrid size={16} className="text-primary" /> Media Assets
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                                           {(selectedCamp.campImages || []).map((img, i) => (
                                             <div key={i} className="aspect-square rounded-xl md:rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                                                <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                                             </div>
                                           ))}
                                        </div>
                                     </section>
                                  </div>

                                  <div className="lg:col-span-4 space-y-6 md:space-y-8">
                                     <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-6 border border-slate-100 shadow-xl border-t-[6px] border-t-primary">
                                        <h3 className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">FINANCIAL YIELD</h3>
                                        <div className="text-2xl md:text-3xl font-black text-slate-900 mb-1">{fmt(selectedCamp.price)}</div>
                                        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase">Base Price per Participant</p>
                                     </div>

                                     <div className="space-y-3 md:space-y-4">
                                        <h3 className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">LOGISTICS SNAPSHOT</h3>
                                        {[
                                          { label: 'Capacity', val: `${selectedCamp.capacity} Pax`, icon: Users },
                                          { label: 'Duration', val: `${selectedCamp.duration} Days`, icon: Clock },
                                          { label: 'Difficulty', val: selectedCamp.difficulty, icon: Zap },
                                          { label: 'Location', val: selectedCamp.location, icon: MapPin },
                                        ].map(item => (
                                          <div key={item.label} className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100">
                                             <div className="flex items-center gap-3">
                                                <item.icon className="text-primary size-4" />
                                                <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400">{item.label}</span>
                                             </div>
                                             <span className="text-[9px] md:text-[10px] font-black text-slate-900 uppercase">{item.val}</span>
                                          </div>
                                        ))}
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </ScrollArea>
                      </TabsContent>

                      {/* Itinerary Tab */}
                      <TabsContent value="itinerary" className="h-full mt-0 focus-visible:ring-0">
                         <ScrollArea className="h-full">
                            <div className="p-4 md:p-10 pb-20 space-y-8 md:space-y-10 max-w-3xl">
                               <h3 className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                                  <Calendar size={16} className="text-primary" /> Day-by-Day manifest
                               </h3>
                               <div className="space-y-8 md:space-y-10 max-w-3xl">
                                  {(selectedCamp.itinerary || []).length > 0 ? (
                                    selectedCamp.itinerary.map((step, idx) => (
                                      <div key={idx} className="relative pl-10 md:pl-12 before:absolute before:left-[14px] md:before:left-[19px] before:top-4 before:bottom-0 before:w-px before:bg-slate-100 last:before:hidden">
                                         <div className="absolute left-0 top-0 w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-[#0d2a1d] text-white flex items-center justify-center font-black text-[10px] md:text-xs shadow-xl z-10">
                                            {step.day}
                                         </div>
                                         <div>
                                            <h4 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tighter mb-1.5 md:mb-2">{step.title}</h4>
                                            <p className="text-[11px] md:text-sm text-slate-500 font-medium leading-relaxed italic">"{step.description}"</p>
                                         </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-8 text-center bg-slate-50 rounded-2xl md:rounded-3xl border border-dashed border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                       No itinerary steps defined.
                                    </div>
                                  )}
                               </div>
                            </div>
                         </ScrollArea>
                      </TabsContent>

                      {/* Logistics Tab */}
                      <TabsContent value="logistics" className="h-full mt-0 focus-visible:ring-0">
                         <ScrollArea className="h-full">
                            <div className="p-4 md:p-10 pb-20 space-y-10 md:space-y-12 animate-in fade-in slide-in-from-bottom-2">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                                  <section className="space-y-4 md:space-y-6">
                                     <h3 className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                                        <Backpack size={16} className="text-primary" /> Technical Equipment
                                     </h3>
                                     <div className="grid grid-cols-1 gap-2 md:gap-3">
                                        {(selectedCamp.equipment || []).map((eq, i) => (
                                          <div key={i} className="p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 flex items-center gap-3 md:gap-4">
                                             <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-white flex items-center justify-center shadow-sm"><Check size={12} className="text-green-500" /></div>
                                             <span className="text-[10px] md:text-xs font-black uppercase text-slate-700">{eq}</span>
                                          </div>
                                        ))}
                                     </div>
                                  </section>

                                  <section className="space-y-4 md:space-y-6">
                                     <h3 className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                                        <Utensils size={16} className="text-primary" /> Wilderness Cuisines
                                     </h3>
                                     <div className="flex flex-wrap gap-2 md:gap-3">
                                        {(selectedCamp.food || []).map((f, i) => (
                                          <Badge key={i} className="bg-orange-50 text-orange-600 border-orange-100 text-[8px] md:text-[10px] font-black py-1.5 md:py-2 px-3 md:px-4 rounded-lg md:rounded-xl uppercase tracking-widest whitespace-nowrap">
                                             {f}
                                          </Badge>
                                        ))}
                                     </div>
                                     <div className="p-5 md:p-6 bg-slate-50 rounded-[24px] md:rounded-[32px] border border-slate-100 mt-6 md:mt-8 flex items-center gap-4 md:gap-6">
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-amber-500 shadow-inner shrink-0">
                                           <CloudSun size={24} className="size-6 md:size-8" />
                                        </div>
                                        <div>
                                           <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Weather Intelligence</p>
                                           <p className="text-[11px] md:text-xs font-bold text-slate-600 leading-snug md:leading-relaxed uppercase">{selectedCamp.weatherInfo || 'Standard alpine weather expected.'}</p>
                                        </div>
                                     </div>
                                  </section>
                               </div>
                            </div>
                         </ScrollArea>
                      </TabsContent>

                      {/* Safety Tab */}
                      <TabsContent value="safety" className="h-full mt-0 focus-visible:ring-0">
                         <ScrollArea className="h-full">
                            <div className="p-4 md:p-10 pb-20 animate-in fade-in slide-in-from-bottom-2">
                               <div className="bg-rose-900 rounded-[24px] md:rounded-[32px] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden">
                                  <div className="relative z-10">
                                     <h3 className="text-lg md:text-2xl font-black uppercase tracking-tighter mb-6 md:mb-8 flex items-center gap-3 md:gap-4">
                                        <ShieldAlert className="text-rose-400 size-6 md:size-8" /> Critical Safety Audit
                                     </h3>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        {(selectedCamp.safetyInstructions || []).length > 0 ? (
                                          selectedCamp.safetyInstructions.map((ins, i) => (
                                            <div key={i} className="p-5 bg-white/5 rounded-xl md:rounded-[24px] border border-white/5 flex gap-3 md:gap-4">
                                               <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 font-black text-[10px] md:text-xs shrink-0">{i+1}</div>
                                               <p className="text-[11px] md:text-sm font-bold leading-relaxed">{ins}</p>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="col-span-full text-center text-rose-300/40 font-bold text-[10px] uppercase tracking-widest py-10">No specific safety instructions documented.</p>
                                        )}
                                     </div>
                                  </div>
                                  <div className="absolute top-0 right-0 w-32 md:w-64 h-full bg-white/5 skew-x-[-20deg] translate-x-16 md:translate-x-32" />
                               </div>
                            </div>
                         </ScrollArea>
                      </TabsContent>
                   </div>
                </Tabs>
              </div>

              {/* Dialog Footer Actions */}
              <div className="p-4 md:p-8 bg-white border-t border-slate-100 flex gap-3 md:gap-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-20">
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-slate-900 text-white font-black text-[10px] md:text-xs uppercase tracking-widest border-none"
                >
                  Dismiss Preview
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
