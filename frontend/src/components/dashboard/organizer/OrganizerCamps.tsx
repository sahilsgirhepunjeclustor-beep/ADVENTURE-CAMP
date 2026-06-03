"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Camp, User, ItineraryStep, Batch } from '@/lib/types';
import { 
  getAllApprovedCamps, 
  getPendingCamps, 
  getRejectedCamps,
  getDraftCamps,
  savePendingCamps,
  saveDraftCamps,
  saveApprovedCamps,
  saveRejectedCamps
} from '@/lib/store';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  Pencil, 
  Trash2, 
  LayoutGrid, 
  List, 
  Eye, 
  ClipboardList, 
  History, 
  AlertCircle,
  Mountain,
  FileText,
  Building2,
  Undo2,
  CheckCircle2,
  MoreVertical,
  X,
  FileCode,
  Zap,
  ArrowLeft,
  PauseCircle,
  CheckCircle,
  Utensils,
  Backpack,
  CloudSun,
  ShieldAlert,
  Calendar,
  Users,
  Check
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import CampForm from '@/components/forms/CampForm';
import { toast } from '@/hooks/use-toast';
import { fmt, fmtDate, cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrganizerCampsProps {
  currentUser: User;
}

type CampStatusFilter = 'approved' | 'pending' | 'draft' | 'rejected' | 'inactive' | 'completed';

export default function OrganizerCamps({ currentUser }: OrganizerCampsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCamp, setEditingCamp] = useState<Camp | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<CampStatusFilter>('approved');
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const myCamps = useMemo(() => {
    const allCamps = getAllApprovedCamps().filter(c => c.addedBy === currentUser.email);
    const approved = allCamps.filter(c => c.status === 'approved');
    const inactive = allCamps.filter(c => c.status === 'inactive');
    const completed = allCamps.filter(c => c.status === 'completed');
    
    const pending = getPendingCamps().filter(c => c.addedBy === currentUser.email);
    const rejected = getRejectedCamps().filter(c => c.addedBy === currentUser.email);
    const drafts = getDraftCamps().filter(c => c.addedBy === currentUser.email);
    
    return { approved, pending, rejected, drafts, inactive, completed };
  }, [currentUser.email, showForm, refreshKey]);

  const currentList = useMemo(() => {
    switch (activeTab) {
      case 'approved': return myCamps.approved;
      case 'pending': return myCamps.pending;
      case 'draft': return myCamps.drafts;
      case 'rejected': return myCamps.rejected;
      case 'inactive': return myCamps.inactive;
      case 'completed': return myCamps.completed;
      default: return [];
    }
  }, [activeTab, myCamps]);

  const filteredCamps = currentList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const triggerRefresh = () => setRefreshKey(p => p + 1);

  const handleSubmitCamp = (updatedCamp: Camp) => {
    const allDrafts = getDraftCamps().filter(c => c.id !== updatedCamp.id);
    const allPending = getPendingCamps().filter(c => c.id !== updatedCamp.id);
    const allApproved = getAllApprovedCamps().filter(c => c.id !== updatedCamp.id);
    const allRejected = getRejectedCamps().filter(c => c.id !== updatedCamp.id);

    if (updatedCamp.status === 'draft') {
      saveDraftCamps([updatedCamp, ...allDrafts]);
      toast({ title: "Draft Saved", description: "Expedition saved to your local workspace." });
    } else if (updatedCamp.status === 'pending_approval') {
      savePendingCamps([updatedCamp, ...allPending]);
      toast({ title: "Audit Dispatch", description: "Expedition submitted for administrative review." });
    } else {
      saveApprovedCamps([updatedCamp, ...allApproved]);
      const verb = updatedCamp.status === 'inactive' ? 'Deactivated' : updatedCamp.status === 'completed' ? 'Completed' : 'Live';
      toast({ title: "Inventory Updated", description: `Expedition is now ${verb}.` });
    }

    saveRejectedCamps(allRejected);
    
    setShowForm(false);
    setEditingCamp(undefined);
    triggerRefresh();
  };

  const handleStatusChange = (camp: Camp, newStatus: Camp['status']) => {
    const updated = { ...camp, status: newStatus };
    handleSubmitCamp(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Permanently terminate this expedition? This action is irreversible.')) {
      saveDraftCamps(getDraftCamps().filter(c => c.id !== id));
      savePendingCamps(getPendingCamps().filter(c => c.id !== id));
      saveApprovedCamps(getAllApprovedCamps().filter(c => c.id !== id));
      saveRejectedCamps(getRejectedCamps().filter(c => c.id !== id));
      
      toast({ variant: 'destructive', title: 'Record Terminated' });
      triggerRefresh();
    }
  };

  const handleEdit = (camp: Camp) => {
    setEditingCamp(camp);
    setShowForm(true);
  };

  const openReview = (camp: Camp) => {
    setSelectedCamp(camp);
    setIsDetailsOpen(true);
  };

  if (showForm) {
    return (
      <CampForm 
        currentUser={currentUser} 
        onBack={() => { setShowForm(false); setEditingCamp(undefined); }} 
        onSubmit={handleSubmitCamp} 
        initialData={editingCamp}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-sans h-full px-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div className="w-full md:w-auto">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight leading-none truncate">Expedition Inventory</h2>
          <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5 md:mt-2 opacity-70">Workspace Hub</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full md:w-auto rounded-2xl h-12 px-6 font-black bg-primary hover:bg-accent text-white shadow-xl shadow-primary/20 uppercase tracking-widest text-[10px] md:text-xs border-none">
          <Plus size={18} className="mr-2" /> LIST NEW ADVENTURE
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between shrink-0">
        <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-100 shadow-inner w-full lg:w-auto overflow-x-auto no-scrollbar">
           <button 
             onClick={() => setActiveTab('approved')}
             className={cn("px-4 md:px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap", activeTab === 'approved' ? "bg-white text-primary shadow-xl" : "text-slate-400 hover:text-slate-600")}
           >
             <CheckCircle2 size={14} /> Live ({myCamps.approved.length})
           </button>
           <button 
             onClick={() => setActiveTab('pending')}
             className={cn("px-4 md:px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap", activeTab === 'pending' ? "bg-white text-orange-50 shadow-xl" : "text-slate-400 hover:text-slate-600")}
           >
             <ClipboardList size={14} /> Audit ({myCamps.pending.length})
           </button>
           <button 
             onClick={() => setActiveTab('draft')}
             className={cn("px-4 md:px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap", activeTab === 'draft' ? "bg-white text-blue-50 shadow-xl" : "text-slate-400 hover:text-slate-600")}
           >
             <FileCode size={14} /> Drafts ({myCamps.drafts.length})
           </button>
           <button 
             onClick={() => setActiveTab('inactive')}
             className={cn("px-4 md:px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap", activeTab === 'inactive' ? "bg-white text-slate-700 shadow-xl" : "text-slate-400 hover:text-slate-600")}
           >
             <PauseCircle size={14} /> Inactive ({myCamps.inactive.length})
           </button>
           <button 
             onClick={() => setActiveTab('completed')}
             className={cn("px-4 md:px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap", activeTab === 'completed' ? "bg-white text-emerald-700 shadow-xl" : "text-slate-400 hover:text-slate-600")}
           >
             <CheckCircle size={14} /> Done ({myCamps.completed.length})
           </button>
           <button 
             onClick={() => setActiveTab('rejected')}
             className={cn("px-4 md:px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap", activeTab === 'rejected' ? "bg-white text-red-50 shadow-xl" : "text-slate-400 hover:text-slate-600")}
           >
             <History size={14} /> Rejections ({myCamps.rejected.length})
           </button>
        </div>

        <div className="relative flex-1 w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <Input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search inventory..." 
            className="pl-10 h-11 rounded-xl border-slate-100 font-bold text-[11px] md:text-xs uppercase tracking-tight bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {filteredCamps.length === 0 ? (
          <div className="col-span-full text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200 opacity-50 flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-200 mb-6">
                <Mountain size={40} />
             </div>
             <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest">No entries found</h3>
          </div>
        ) : (
          filteredCamps.map(camp => (
            <div key={camp.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative">
               <div className="aspect-[16/10] relative overflow-hidden">
                  <img src={camp.campImages?.[0] || 'https://picsum.photos/seed/default/400/300'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 right-4 flex gap-2">
                     <Badge className={cn(
                       "border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-xl shadow-lg backdrop-blur-md text-white",
                       camp.status === 'approved' ? "bg-green-500/90" : 
                       camp.status === 'pending_approval' ? "bg-orange-500/90" : 
                       camp.status === 'draft' ? "bg-blue-500/90" :
                       camp.status === 'inactive' ? "bg-slate-500/90" :
                       camp.status === 'completed' ? "bg-emerald-600/90" :
                       "bg-red-500/90"
                     )}>
                       {camp.status.replace('_', ' ')}
                     </Badge>
                  </div>
               </div>
               
               <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2 max-w-[85%]">{camp.name}</h4>
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <button className="text-slate-300 hover:text-slate-900 transition-colors p-1"><MoreVertical size={20} /></button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="rounded-2xl min-w-[180px] shadow-2xl border-none font-sans p-2">
                          <DropdownMenuItem onClick={() => openReview(camp)} className="text-[10px] font-bold gap-3 rounded-xl cursor-pointer py-2">
                             <Eye size={14} className="text-primary" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(camp)} className="text-[10px] font-bold gap-3 rounded-xl cursor-pointer py-2">
                             <Pencil size={14} className="text-orange-500" /> Edit Entry
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator className="bg-slate-50" />
                          <DropdownMenuLabel className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-3 py-1">Lifecycle</DropdownMenuLabel>
                          
                          {camp.status === 'approved' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(camp, 'inactive')} className="text-[10px] font-bold gap-3 rounded-xl cursor-pointer py-2">
                               <PauseCircle size={14} className="text-slate-500" /> Deactivate
                            </DropdownMenuItem>
                          )}
                          {camp.status === 'inactive' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(camp, 'approved')} className="text-[10px] font-bold gap-3 rounded-xl cursor-pointer py-2">
                               <CheckCircle2 size={14} className="text-green-500" /> Make Live
                            </DropdownMenuItem>
                          )}
                          {camp.status !== 'completed' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(camp, 'completed')} className="text-[10px] font-bold gap-3 rounded-xl cursor-pointer py-2">
                               <CheckCircle size={14} className="text-emerald-600" /> Mark Completed
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator className="bg-slate-50" />
                          <DropdownMenuItem onClick={() => handleDelete(camp.id)} className="text-[10px] font-bold gap-3 rounded-xl text-destructive hover:bg-red-50 cursor-pointer py-2">
                             <Trash2 size={14} /> Terminate Record
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[9px] font-black text-slate-400 mb-6 uppercase tracking-widest">
                     <div className="flex items-center gap-1.5"><MapPin size={12} className="text-primary" /> {camp.location}</div>
                     <div className="flex items-center gap-1.5"><Clock size={12} className="text-primary" /> {camp.duration}d</div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                     <div className="text-lg font-black text-slate-900">{fmt(camp.price)}</div>
                     <div className="flex gap-2">
                        <button onClick={() => openReview(camp)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-white hover:text-primary transition-all border border-transparent hover:border-slate-100 shadow-sm"><Eye size={18} /></button>
                        <button onClick={() => handleEdit(camp)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-white hover:text-orange-400 transition-all border border-transparent hover:border-slate-100 shadow-sm"><Pencil size={18} /></button>
                     </div>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl font-sans m-4 w-[95vw] flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>Expedition Intelligence View</DialogTitle>
            <DialogDescription>Immersive technical manifest including multi-day itineraries, logistics, and safety protocols for partners.</DialogDescription>
          </DialogHeader>
          {selectedCamp && (
            <div className="flex flex-col h-full bg-white overflow-hidden">
              {/* Cinematic Header */}
              <div className="relative h-48 md:h-64 shrink-0">
                <img src={selectedCamp.campImages?.[0] || 'https://picsum.photos/seed/header/1200/600'} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 text-white pr-10 md:pr-20">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className="bg-primary/90 font-black uppercase text-[8px] md:text-[9px] tracking-widest px-2 md:px-3 py-1 rounded-xl shadow-xl text-white">{selectedCamp.category}</Badge>
                    <Badge variant="outline" className="text-white border-white/30 font-black uppercase text-[8px] md:text-[9px] tracking-widest px-2 md:px-3 py-1 rounded-xl backdrop-blur-md">
                      {selectedCamp.status.toUpperCase()}
                    </Badge>
                  </div>
                  <h2 className="text-lg md:text-3xl font-black uppercase tracking-tighter leading-tight truncate max-w-[85vw]">{selectedCamp.name}</h2>
                </div>
              </div>

              {/* Technical Body with Scroll per Tab */}
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
                      <TabsContent value="overview" className="h-full mt-0 focus-visible:ring-0">
                         <ScrollArea className="h-full">
                            <div className="p-4 md:p-10 pb-20 space-y-8 md:space-y-10">
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
                                                <img src={img} className="w-full h-full object-cover" />
                                             </div>
                                           ))}
                                        </div>
                                     </section>
                                  </div>
                                  <div className="lg:col-span-4 space-y-6 md:space-y-8">
                                     <div className="bg-white rounded-2xl md:rounded-[32px] p-5 md:p-6 border border-slate-100 shadow-xl border-t-[6px] border-t-primary">
                                        <h3 className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">FINANCIAL STRATEGY</h3>
                                        <div className="text-2xl md:text-3xl font-black text-slate-900 mb-1">{fmt(selectedCamp.price)}</div>
                                        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase">Per Participant Basis</p>
                                     </div>
                                     <div className="space-y-3 md:space-y-4">
                                        <h3 className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">SNAPSHOT</h3>
                                        {[
                                          { label: 'Capacity', val: `${selectedCamp.capacity} Pax`, icon: Users },
                                          { label: 'Duration', val: `${selectedCamp.duration} Days`, icon: Clock },
                                          { label: 'Difficulty', val: selectedCamp.difficulty, icon: Zap },
                                          { label: 'Location', val: selectedCamp.location, icon: MapPin },
                                        ].map(item => (
                                          <div key={item.label} className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100">
                                             <div className="flex items-center gap-2 md:gap-3">
                                                <item.icon size={14} className="text-primary" />
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

                      <TabsContent value="itinerary" className="h-full mt-0 focus-visible:ring-0">
                         <ScrollArea className="h-full">
                            <div className="p-4 md:p-10 pb-20 space-y-6 md:space-y-8">
                               <h3 className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                                  <Calendar size={16} className="text-primary" /> Logistical Roadmap
                               </h3>
                               <div className="space-y-8 md:space-y-10 max-w-3xl">
                                  {(selectedCamp.itinerary || []).map((step, idx) => (
                                    <div key={idx} className="relative pl-10 md:pl-12 before:absolute before:left-[14px] md:before:left-[19px] before:top-4 before:bottom-0 before:w-px before:bg-slate-100 last:before:hidden">
                                       <div className="absolute left-0 top-0 w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-[#0d2a1d] text-white flex items-center justify-center font-black text-[10px] md:text-xs shadow-xl z-10">
                                          {step.day}
                                       </div>
                                       <div>
                                          <h4 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tighter mb-1.5 md:mb-2">{step.title}</h4>
                                          <p className="text-[11px] md:text-sm text-slate-500 font-medium leading-relaxed italic">"{step.description}"</p>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </ScrollArea>
                      </TabsContent>

                      <TabsContent value="logistics" className="h-full mt-0 focus-visible:ring-0">
                         <ScrollArea className="h-full">
                            <div className="p-4 md:p-10 pb-20 space-y-10 md:space-y-12">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                                  <section className="space-y-4 md:space-y-6">
                                     <h3 className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                                        <Backpack size={16} className="text-primary" /> Gear Manifest
                                     </h3>
                                     <div className="grid grid-cols-1 gap-2 md:gap-3">
                                        {(selectedCamp.equipment || []).map((eq, i) => (
                                          <div key={i} className="p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 flex items-center gap-3">
                                             <Check size={12} className="text-green-500" />
                                             <span className="text-[10px] md:text-xs font-black uppercase text-slate-700">{eq}</span>
                                          </div>
                                        ))}
                                     </div>
                                  </section>
                                  <section className="space-y-4 md:space-y-6">
                                     <h3 className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                                        <Utensils size={16} className="text-primary" /> Nutrition Plan
                                     </h3>
                                     <div className="flex flex-wrap gap-2 md:gap-3">
                                        {(selectedCamp.food || []).map((f, i) => (
                                          <Badge key={i} className="bg-orange-50 text-orange-600 border-none text-[8px] md:text-[10px] font-black py-1.5 md:py-2 px-3 md:px-4 rounded-lg md:rounded-xl uppercase">{f}</Badge>
                                        ))}
                                     </div>
                                     <div className="p-5 md:p-6 bg-slate-50 rounded-[24px] md:rounded-[32px] border border-slate-100 mt-6 md:mt-8 flex items-center gap-4">
                                        <div className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-inner shrink-0">
                                           <CloudSun size={24} className="md:w-7 md:h-7" />
                                        </div>
                                        <div>
                                           <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Weather Guard</p>
                                           <p className="text-[10px] md:text-xs font-bold text-slate-600 leading-snug md:leading-relaxed uppercase">{selectedCamp.weatherInfo || 'Standard alpine weather.'}</p>
                                        </div>
                                     </div>
                                  </section>
                               </div>
                            </div>
                         </ScrollArea>
                      </TabsContent>

                      <TabsContent value="safety" className="h-full mt-0 focus-visible:ring-0">
                         <ScrollArea className="h-full">
                            <div className="p-4 md:p-10 pb-20">
                               <div className="bg-rose-900 rounded-[24px] md:rounded-[32px] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden">
                                  <div className="relative z-10">
                                     <h3 className="text-lg md:text-2xl font-black uppercase tracking-tight mb-6 md:mb-8 flex items-center gap-3 md:gap-4">
                                        <ShieldAlert size={24} className="text-rose-400 md:w-7 md:h-7" /> Standard Safety Protocol
                                     </h3>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(selectedCamp.safetyInstructions || []).map((ins, i) => (
                                          <div key={i} className="p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 flex gap-3">
                                             <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 font-black text-[10px] shrink-0">{i+1}</div>
                                             <p className="text-[11px] md:text-sm font-bold leading-relaxed">{ins}</p>
                                          </div>
                                        ))}
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

              {/* Action Hub - Fixed at Bottom */}
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
