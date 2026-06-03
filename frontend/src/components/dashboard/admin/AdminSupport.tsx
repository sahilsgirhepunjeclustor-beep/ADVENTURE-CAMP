/**
 * @file AdminSupport.tsx
 * @description This component provides an interface for administrators to manage support tickets.
 * It allows viewing, filtering, searching, and updating the status of tickets. Actions include resolving,
 * marking as in-progress, re-opening, escalating, and deleting tickets.
 *
 * @requires react
 * @requires lucide-react - for icons
 * @requires @/lib/types - for the SupportTicket type definition
 * @requires @/lib/store - for data persistence and retrieval functions
 * @requires @/lib/utils - for utility functions like date formatting
 * @requires @/components/ui/* - for various UI components (Button, Badge, Input, DropdownMenu, etc.)
 */

"use client";

// Import necessary libraries, types, and components
import React, { useState, useEffect, useMemo } from 'react';
import { SupportTicket } from '@/lib/types';
import { getSupportTickets, saveSupportTickets } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { fmtDate, cn } from '@/lib/utils';
import {
  LifeBuoy,
  Search,
  Filter,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  User as UserIcon,
  Trash2,
  MoreVertical,
  Flag
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * @interface AdminSupportProps
 * @description Defines the props for the AdminSupport component.
 * @property {() => void} [onBack] - Optional callback function to handle back navigation.
 */
interface AdminSupportProps {
  onBack?: () => void;
  initialTab?: 'all' | 'Open' | 'In-Progress' | 'Resolved';
}

/**
 * @function AdminSupport
 * @description The main component for managing support tickets and escalations.
 * @param {AdminSupportProps} props - The component's props.
 * @returns {JSX.Element} The rendered component.
 */
export default function AdminSupport({ onBack, initialTab = 'all' }: AdminSupportProps) {
  // --- STATE MANAGEMENT ---

  // State to hold all support tickets.
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  // State for the search query.
  const [searchQuery, setSearchQuery] = useState('');
  // State for the active filter tab.
  const [activeTab, setActiveTab] = useState<'all' | 'Open' | 'In-Progress' | 'Resolved'>(initialTab);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // --- DATA FETCHING ---

  /**
   * @effect
   * @description Fetches all support tickets from the store on component mount.
   */
  useEffect(() => {
    setTickets(getSupportTickets());
  }, []);

  // --- MEMOIZED COMPUTATIONS ---

  // Memoized list of tickets filtered by the active tab and search query.
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch =
        t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (activeTab === 'all') return matchesSearch;
      return matchesSearch && t.status === activeTab;
    });
  }, [tickets, searchQuery, activeTab]);

  // --- EVENT HANDLERS ---

  /**
   * @function updateStatus
   * @description Updates the status of a support ticket.
   * @param {string} id - The ID of the ticket to update.
   * @param {SupportTicket['status']} newStatus - The new status to set.
   */
  const updateStatus = (id: string, newStatus: SupportTicket['status']) => {
    const updated = tickets.map(t => t.id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t);
    setTickets(updated);
    saveSupportTickets(updated);
    toast({ title: `Ticket ${newStatus}`, description: `Reference #${id} updated.` });
  };

  /**
   * @function deleteTicket
   * @description Deletes a support ticket.
   * @param {string} id - The ID of the ticket to delete.
   */
  const deleteTicket = (id: string) => {
    const updated = tickets.filter(t => t.id !== id);
    setTickets(updated);
    saveSupportTickets(updated);
    toast({ variant: 'destructive', title: 'Ticket Deleted' });
  };

  // --- RENDER METHOD ---

  return (
    <div className="space-y-8 pb-20 font-sans max-w-7xl mx-auto px-4 md:px-0 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-12 w-12 border-slate-200 shadow-sm">
              <ArrowLeft size={20} className="text-slate-600" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Support & Escalations</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Resolution Center for Complaints & Disputes</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-3 rounded-[24px] border border-slate-100 shadow-xl">
        <div className="relative flex-1 min-w-[300px]">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
           <Input
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
             placeholder="Search by ID, User or Subject..."
             className="pl-12 h-12 rounded-xl bg-slate-50 border-none font-bold text-[11px] uppercase"
           />
        </div>
        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
          {['all', 'Open', 'In-Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                activeTab === tab ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.length === 0 ? (
          // Placeholder when no tickets are found
          <div className="py-32 text-center bg-white rounded-[40px] border border-dashed border-slate-200 opacity-50 flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-200 mb-6">
                <LifeBuoy size={40} />
             </div>
             <p className="text-sm font-black uppercase text-slate-400 tracking-widest">No support records found</p>
          </div>
        ) : (
          // Render the list of tickets
          filteredTickets.map(t => (
            <div key={t.id} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 hover:shadow-lg transition-all group">
               {/* Priority and Category Icon */}
               <div className={cn(
                 "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                 t.priority === 'Critical' ? "bg-red-50 border-red-100 text-red-600" :
                 t.priority === 'High' ? "bg-orange-50 border-orange-100 text-orange-600" :
                 "bg-blue-50 border-blue-100 text-blue-600"
               )}>
                  {t.category === 'Dispute' ? <ShieldAlert size={20} /> : <MessageSquare size={20} />}
               </div>

               <div className="flex-1 min-w-0">
                  {/* Ticket Metadata */}
                  <div className="flex items-center gap-3 mb-1">
                     <Badge variant="outline" className="bg-slate-50 border-slate-100 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg">ID: {t.id}</Badge>
                     <Badge className={cn(
                       "border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-lg",
                       t.status === 'Resolved' ? "bg-green-100 text-green-700" :
                       t.status === 'In-Progress' ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                     )}>
                       {t.status}
                     </Badge>
                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{t.category}</span>
                  </div>
                  {/* Ticket Subject */}
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate leading-none mb-2">{t.subject}</h4>
                  {/* User and Date Information */}
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase">
                     <span className="flex items-center gap-1.5"><UserIcon size={12} className="text-primary" /> {t.userName}</span>
                     <span className="flex items-center gap-1.5"><Clock size={12} className="text-primary" /> {fmtDate(t.createdAt)}</span>
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                  {/* Priority Indicator */}
                  <div className="hidden xl:block px-6 border-r border-slate-100">
                     <div className={cn(
                       "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg inline-block",
                       t.priority === 'Critical' ? "bg-red-500 text-white" : "bg-slate-100 text-slate-500"
                     )}>
                        {t.priority} PRIORITY
                     </div>
                  </div>

                  <div className="flex gap-2 flex-1 md:flex-none">
                     {/* Resolve Button */}
                     <Button
                       onClick={() => updateStatus(t.id, 'Resolved')}
                       disabled={t.status === 'Resolved'}
                       className="flex-1 md:flex-none h-10 px-5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-green-500/10 gap-2"
                     >
                        <CheckCircle2 size={14} /> Resolve
                     </Button>

                     {/* More Actions Dropdown */}
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200"><MoreVertical size={16} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl min-w-[180px] shadow-2xl border-none p-2 font-sans">
                           <DropdownMenuLabel className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">Lifecycle Actions</DropdownMenuLabel>
                           <DropdownMenuItem onClick={() => updateStatus(t.id, 'In-Progress')} className="text-[10px] font-bold gap-3 rounded-xl py-2 px-3 cursor-pointer">
                              <Clock size={14} className="text-blue-500" /> Mark In-Progress
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => updateStatus(t.id, 'Open')} className="text-[10px] font-bold gap-3 rounded-xl py-2 px-3 cursor-pointer">
                              <AlertCircle size={14} className="text-amber-500" /> Re-open Ticket
                           </DropdownMenuItem>
                           <DropdownMenuItem className="text-[10px] font-bold gap-3 rounded-xl py-2 px-3 cursor-pointer">
                              <Flag size={14} className="text-orange-500" /> Escalate Further
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => deleteTicket(t.id)} className="text-[10px] font-bold gap-3 rounded-xl py-2 px-3 text-destructive hover:bg-red-50 cursor-pointer">
                              <Trash2 size={14} /> Delete Record
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
