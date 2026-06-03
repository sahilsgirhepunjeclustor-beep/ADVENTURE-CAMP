/**
 * @file AdminOrganizers.tsx
 * @description This component provides a comprehensive interface for administrators to manage organizer accounts.
 * It allows for viewing pending applications, approving or rejecting them, and managing the operational status
 * (active, suspended) of verified organizers. It also includes features for viewing and editing organizer profiles
 * and their compliance documents.
 *
 * @requires react
 * @requires lucide-react - for icons
 * @requires @/lib/types - for User and UploadedDoc type definitions
 * @requires @/lib/store - for data persistence and retrieval functions (getUsers, saveUsers)
 * @requires @/lib/utils - for utility functions like cn (for class names)
 * @requires @/components/ui/* - for various UI components (Button, Badge, Dialog, etc.)
 */

"use client";

// Import necessary libraries, types, and components
import React, { useState, useEffect } from 'react';
import { getUsers, saveUsers } from '@/lib/store';
import { User, UploadedDoc } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Building2,
  MapPin,
  ShieldCheck,
  Shield,
  FileText,
  CheckCircle2,
  XCircle,
  Pencil,
  FileX,
  Eye,
  Search,
  Mail,
  Phone,
  User as UserIcon,
  ArrowLeft,
  PauseCircle,
  PlayCircle,
  ShieldAlert,
  Hash,
  CalendarDays,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * @interface AdminOrganizersProps
 * @description Defines the props for the AdminOrganizers component.
 * @property {() => void} [onBack] - Optional callback function to handle back navigation.
 */
interface AdminOrganizersProps {
  onBack?: () => void;
  initialTab?: 'pending' | 'approved' | 'suspended' | 'documents';
}

/**
 * @function AdminOrganizers
 * @description The main component for managing organizer accounts.
 * @param {AdminOrganizersProps} props - The component's props.
 * @returns {JSX.Element} The rendered component.
 */
export default function AdminOrganizers({ onBack, initialTab }: AdminOrganizersProps) {
  // --- STATE MANAGEMENT ---

  // State to hold all user data.
  const [allUsers, setAllUsers] = useState<Record<string, User>>({});
  // State for the currently selected organizer's email (ID).
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The currently active organizer view tab.
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'suspended' | 'documents'>(initialTab || 'pending');
  // Sync tab state when the parent sends a new tab prop.
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  // State to control the preview of a compliance document.
  const [previewDoc, setPreviewDoc] = useState<{ label: string; doc?: UploadedDoc } | null>(null);
  // State to hold the user object being edited.
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // --- DATA FETCHING & INITIALIZATION ---

  /**
   * @effect
   * @description Fetches all users on component mount.
   */
  useEffect(() => {
    const users = getUsers();
    setAllUsers(users);
  }, []);

  // --- DATA FILTERING ---

  // Filter for users who are organizers.
  const organizers = Object.values(allUsers).filter(u => u.role === 'organizer');
  // Further filter for pending organizers.
  const pending = organizers.filter(u => !u.isApproved && !u.isRejected);
  // Approved organizers who are currently active.
  const approvedOrgs = organizers.filter(u => u.isApproved && u.status === 'active');
  // Suspended partners.
  const suspendedOrgs = organizers.filter(u => u.status === 'suspended');
  // Organizers with compliance documentation.
  const documentOrgs = organizers.filter(u =>
    !!(u.organizerProfile?.govIdDoc || u.organizerProfile?.registrationDoc || u.organizerProfile?.safetyDoc)
  );
  // Filter for organizers who have been either approved or rejected (history).
  const history = organizers.filter(u => u.isApproved || u.isRejected);

  const currentList = activeTab === 'pending'
    ? pending
    : activeTab === 'approved'
      ? approvedOrgs
      : activeTab === 'suspended'
        ? suspendedOrgs
        : documentOrgs;

  useEffect(() => {
    if (!currentList.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !currentList.some(u => u.email === selectedId)) {
      setSelectedId(currentList[0].email);
    }
  }, [activeTab, currentList, selectedId]);

  // The currently selected user object based on `selectedId`.
  const selectedUser = selectedId ? allUsers[selectedId.toLowerCase()] : null;

  // --- EVENT HANDLERS ---

  /**
   * @function handleAction
   * @description Handles the approval or rejection of an organizer.
   * @param {string} email - The email of the organizer.
   * @param {'approve' | 'reject'} action - The action to perform.
   */
  const handleAction = (email: string, action: 'approve' | 'reject') => {
    const updatedUsers = { ...allUsers };
    const user = { ...updatedUsers[email.toLowerCase()] };

    if (action === 'approve') {
      user.isApproved = true;
      user.isRejected = false;
      user.status = 'active';
      toast({ title: 'Partner Verified', description: 'Account is now active and live.' });
    } else {
      user.isApproved = false;
      user.isRejected = true;
      user.status = 'blocked';
      toast({ variant: 'destructive', title: 'Partner Rejected' });
    }

    updatedUsers[email.toLowerCase()] = user;
    setAllUsers(updatedUsers);
    saveUsers(updatedUsers);
  };

  /**
   * @function handleStatusUpdate
   * @description Updates the operational status of an organizer (active/suspended).
   * @param {string} email - The organizer's email.
   * @param {'active' | 'suspended'} status - The new status.
   */
  const handleStatusUpdate = (email: string, status: 'active' | 'suspended') => {
    const updatedUsers = { ...allUsers };
    const user = { ...updatedUsers[email.toLowerCase()] };
    user.status = status;

    updatedUsers[email.toLowerCase()] = user;
    setAllUsers(updatedUsers);
    saveUsers(updatedUsers);
    toast({
      title: status === 'active' ? 'Partner Reactivated' : 'Partner Suspended',
      description: `Operational status updated for ${user.organizerProfile?.businessName}`
    });
  };

  /**
   * @function handleUpdateProfile
   * @description Handles the submission of the profile editing form.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedUsers = { ...allUsers };
    updatedUsers[editingUser.email.toLowerCase()] = editingUser;
    setAllUsers(updatedUsers);
    saveUsers(updatedUsers);
    setEditingUser(null); // Close the dialog
    toast({ title: 'Business Info Updated', description: 'Changes have been synchronized across the platform.' });
  };

  // --- RENDER METHOD ---

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700 px-2 sm:px-4 md:px-6 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-6">
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
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 border border-primary/20">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0d2a1d] uppercase tracking-tight leading-none">Organizer Moderation</h2>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-1.5 opacity-70">Approve, verify identity, or moderate partner operational status.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-3xl border border-slate-100">
          {[
            { key: 'pending', label: 'Pending Approvals', count: pending.length },
            { key: 'approved', label: 'Approved', count: approvedOrgs.length },
            { key: 'suspended', label: 'Suspended', count: suspendedOrgs.length },
            { key: 'documents', label: 'Documents', count: documentOrgs.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3',
                activeTab === tab.key ? 'bg-primary text-white shadow-xl' : 'text-slate-400 hover:bg-white hover:text-slate-900'
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Verification Queue */}
        <div className="xl:col-span-5 space-y-6">
           <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] px-1">{activeTab === 'pending' ? 'VERIFICATION QUEUE' : activeTab === 'approved' ? 'ACTIVE ORGANIZERS' : activeTab === 'suspended' ? 'SUSPENDED PARTNERS' : 'DOCUMENT REVIEW'}</h3>
           <ScrollArea className="h-[400px] lg:h-[600px] pr-4">
              <div className="space-y-4">
                {currentList.length === 0 ? (
                  <div className="bg-white p-16 text-center rounded-[32px] border border-dashed border-slate-200 opacity-50">
                    <CheckCircle2 size={40} className="mx-auto mb-4 text-green-500/20" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      {activeTab === 'pending' ? 'No pending applications' : activeTab === 'approved' ? 'No approved partners yet' : activeTab === 'suspended' ? 'No suspended partners' : 'No organizers with documents'}
                    </p>
                  </div>
                ) : (
                  currentList.map(user => (
                    <div
                      key={user.email}
                      onClick={() => setSelectedId(user.email)}
                      className={cn(
                        "p-6 rounded-[28px] border-l-[6px] transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group relative overflow-hidden",
                        selectedId === user.email
                          ? "bg-white border-primary shadow-2xl shadow-primary/5 ring-1 ring-primary/10"
                          : "bg-slate-50/50 border-slate-200 hover:bg-white hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-sm border border-white shadow-sm overflow-hidden shrink-0">
                          {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.firstName[0]}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate leading-none mb-1.5">{user.organizerProfile?.businessName}</h4>
                          <p className="text-[10px] text-slate-400 font-bold lowercase truncate mb-1">{user.email}</p>
                          <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest">
                             <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center"><MapPin size={10} /></div>
                             <span className="truncate">{user.organizerProfile?.businessState || 'PARTNER'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity w-full sm:w-auto">
                         <button onClick={(e) => { e.stopPropagation(); handleAction(user.email, 'approve'); }} className="flex-1 sm:flex-none h-9 px-4 bg-green-500 hover:bg-green-600 text-white text-[9px] font-black uppercase rounded-xl shadow-lg shadow-green-500/20">Verify</button>
                         <button onClick={(e) => { e.stopPropagation(); handleAction(user.email, 'reject'); }} className="flex-1 sm:flex-none h-9 px-4 bg-red-500 hover:bg-red-600 text-white text-[9px] font-black uppercase rounded-xl shadow-lg shadow-red-500/20">Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
           </ScrollArea>
        </div>

        {/* Right Panel: Selected Organizer Details */}
        <div className="xl:col-span-7">
           <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] px-1 mb-6">OPERATIONAL IDENTITY</h3>
           {selectedUser ? (
             <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in duration-300 min-h-[600px] flex flex-col">
                <div className="p-6 sm:p-10 space-y-10 flex-1">
                   {/* Business Header */}
                   <div className="p-8 sm:p-10 bg-slate-50/50 rounded-[32px] border-l-[8px] border-primary relative overflow-hidden group">
                      <div className="relative z-10 flex items-center gap-6">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[28px] bg-white border-2 border-white shadow-xl overflow-hidden shrink-0">
                           {selectedUser.avatar ? (
                             <img src={selectedUser.avatar} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full bg-primary flex items-center justify-center text-white text-3xl font-black">
                               {selectedUser.firstName[0]}
                             </div>
                           )}
                        </div>
                        <div>
                          <h4 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">{selectedUser.organizerProfile?.businessName}</h4>
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge className={cn(
                              "border-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg",
                              selectedUser.status === 'suspended' ? "bg-amber-100 text-amber-700" :
                              selectedUser.isApproved ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                            )}>
                              {selectedUser.status === 'suspended' ? 'SUSPENDED' : selectedUser.isApproved ? 'VERIFIED PARTNER' : 'PENDING AUDIT'}
                            </Badge>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                              <ShieldCheck size={12} className={selectedUser.isApproved ? "text-green-500" : "text-slate-300"} /> IDENTITY HUB
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 skew-x-[-20deg] translate-x-12 group-hover:translate-x-10 transition-transform duration-700" />
                   </div>

                   {/* Business Details */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-16">
                      <div className="space-y-1.5">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ADMIN CONTACT:</p>
                         <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedUser.firstName} {selectedUser.lastName}</p>
                      </div>
                      <div className="space-y-1.5">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EMAIL ADDRESS:</p>
                         <p className="text-sm font-black text-slate-900 break-all uppercase tracking-tight">{selectedUser.email}</p>
                      </div>
                      <div className="space-y-1.5">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ESTABLISHED YEAR:</p>
                         <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedUser.organizerProfile?.establishedYear || '2023'}</p>
                      </div>
                      <div className="space-y-1.5">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BATCH CAPACITY:</p>
                         <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedUser.organizerProfile?.batchCapacity || '25'} PAX</p>
                      </div>
                   </div>

                   {/* Compliance Documents */}
                   <div className="space-y-4 pt-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">COMPLIANCE ASSETS (IDENTITY VERIFICATION):</p>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { label: 'Gov ID', doc: selectedUser.organizerProfile?.govIdDoc, icon: FileText, color: 'text-orange-400' },
                          { label: 'Registration', doc: selectedUser.organizerProfile?.registrationDoc, icon: Building2, color: 'text-blue-400' },
                          { label: 'Safety Cert', doc: selectedUser.organizerProfile?.safetyDoc, icon: ShieldCheck, color: 'text-primary' }
                        ].map(item => (
                          <button
                            key={item.label}
                            onClick={() => setPreviewDoc({ label: item.label, doc: item.doc })}
                            className="flex items-center gap-3 px-6 h-12 rounded-[18px] bg-slate-50 border border-slate-100 shadow-sm hover:shadow-xl hover:bg-white hover:border-primary/20 transition-all group"
                          >
                             <item.icon size={18} className={item.color} />
                             <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900">{item.label}</span>
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

                {/* Action Footer */}
                <div className="p-6 sm:p-10 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-center sm:justify-start gap-4 shrink-0">
                   {!selectedUser.isApproved ? (
                     // Actions for pending organizers
                     <>
                       <Button
                        onClick={() => handleAction(selectedUser.email, 'approve')}
                        className="h-14 px-8 rounded-2xl bg-primary hover:bg-accent text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary/20 flex-1 sm:flex-none min-w-[160px]"
                       >
                         <CheckCircle2 size={18} className="mr-2" /> Verify & Activate
                       </Button>
                       <Button
                        onClick={() => handleAction(selectedUser.email, 'reject')}
                        variant="outline"
                        className="h-14 px-8 rounded-2xl border-red-100 text-red-600 bg-red-50/50 hover:bg-red-500 hover:text-white hover:border-red-500 font-black text-[11px] uppercase tracking-widest transition-all flex-1 sm:flex-none min-w-[120px]"
                       >
                         <XCircle size={18} className="mr-2" /> Reject
                       </Button>
                     </>
                   ) : (
                     // Actions for verified organizers
                     <>
                        {selectedUser.status === 'suspended' ? (
                          <Button
                            onClick={() => handleStatusUpdate(selectedUser.email, 'active')}
                            className="h-14 px-8 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-[11px] uppercase tracking-widest shadow-lg flex-1 sm:flex-none min-w-[180px]"
                          >
                            <PlayCircle size={18} className="mr-2" /> Reactivate Partner
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleStatusUpdate(selectedUser.email, 'suspended')}
                            className="h-14 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] uppercase tracking-widest shadow-lg flex-1 sm:flex-none min-w-[180px]"
                          >
                            <PauseCircle size={18} className="mr-2" /> Suspend Operations
                          </Button>
                        )}
                        <Button
                          onClick={() => handleAction(selectedUser.email, 'reject')}
                          variant="outline"
                          className="h-14 px-8 rounded-2xl border-red-100 text-red-600 bg-red-50/50 hover:bg-red-500 hover:text-white hover:border-red-500 font-black text-[11px] uppercase tracking-widest transition-all flex-1 sm:flex-none"
                        >
                          <ShieldAlert size={18} className="mr-2" /> Revoke Access
                        </Button>
                     </>
                   )}
                   <Button
                    onClick={() => setEditingUser(selectedUser)}
                    variant="outline"
                    className="h-14 px-8 rounded-2xl border-slate-200 text-slate-400 hover:bg-white hover:text-slate-900 font-black text-[11px] uppercase tracking-widest flex-1 sm:flex-none ml-auto"
                   >
                     <Pencil size={18} className="mr-2 text-orange-400" /> Edit Info
                   </Button>
                </div>
             </div>
           ) : (
             // Placeholder when no organizer is selected
             <div className="bg-slate-50/50 h-[600px] rounded-[40px] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-slate-200 shadow-xl mb-6">
                   <Search size={48} />
                </div>
                <h4 className="text-lg font-black text-slate-300 uppercase tracking-widest">Select partner to moderate</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Information intelligence will appear here</p>
             </div>
           )}
        </div>
      </div>

      {/* Verification History Section */}
      <div className="space-y-6 pt-12 border-t border-slate-100">
         <div className="flex justify-between items-center px-1">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">VERIFICATION HISTORY</h3>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{history.length} ENTITIES PROCESSED</span>
         </div>

         <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[800px]">
                 <thead className="bg-slate-50/80">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                       <th className="px-10 py-6">BUSINESS IDENTITY</th>
                       <th className="px-10 py-6">OPERATIONAL STATUS</th>
                       <th className="px-10 py-6">CONTACT EMAIL</th>
                       <th className="px-10 py-6 text-right">AUDIT RESULT</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-24 text-center text-sm font-black text-slate-200 uppercase italic tracking-widest">No historic verification records found.</td>
                      </tr>
                    ) : (
                      history.map(u => (
                        <tr key={u.email} className="group hover:bg-slate-50/30 transition-colors">
                          <td className="px-10 py-5">
                             <div className="flex items-center gap-4">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border border-white shadow-sm overflow-hidden", u.isApproved ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                                   {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.firstName[0]}
                                </div>
                                <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{u.organizerProfile?.businessName}</span>
                             </div>
                          </td>
                          <td className="px-10 py-5">
                             <Badge variant="outline" className={cn(
                               "border-none text-[9px] font-black uppercase px-3 py-1 rounded-lg",
                               u.status === 'suspended' ? "bg-amber-50 text-amber-600" :
                               u.status === 'active' ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-400"
                             )}>
                               {u.status || 'Active'}
                             </Badge>
                          </td>
                          <td className="px-10 py-5 text-[11px] font-bold text-slate-400 lowercase">{u.email}</td>
                          <td className="px-10 py-5 text-right">
                             <Badge className={cn(
                               "text-[9px] font-black uppercase px-3 py-1 border-none rounded-xl",
                               u.isApproved ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600"
                             )}>
                               {u.isApproved ? 'IDENTITY VERIFIED' : 'IDENTITY REJECTED'}
                             </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
            </div>
         </div>
      </div>

      {/* Edit Organizer Profile Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-2xl rounded-[32px] border-none shadow-2xl p-0 overflow-hidden font-sans m-4 h-[90vh] flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>Business Registry Audit</DialogTitle>
            <DialogDescription>Review and manually update business registry information for administrative purposes.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateProfile} className="flex flex-col h-full bg-white">
              <div className="bg-[#0d2a1d] p-8 text-white relative shrink-0">
                 <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 rounded-[24px] bg-white/10 flex items-center justify-center text-3xl font-black border border-white/20 shadow-xl overflow-hidden">
                       {editingUser.avatar ? <img src={editingUser.avatar} className="w-full h-full object-cover" /> : editingUser.firstName[0]}
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">{editingUser.organizerProfile?.businessName}</h3>
                       <p className="text-[10px] text-green-200/60 font-black uppercase tracking-[0.2em]">Registry Identity: {editingUser.email}</p>
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 w-48 h-full bg-white/5 skew-x-[-25deg] translate-x-12" />
              </div>

              <ScrollArea className="flex-1">
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Legal Business Name</Label>
                        <div className="relative">
                            <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                            <Input
                              value={editingUser.organizerProfile?.businessName}
                              onChange={e => setEditingUser({...editingUser, organizerProfile: {...editingUser.organizerProfile!, businessName: e.target.value}})}
                              className="rounded-2xl h-12 font-bold text-sm pl-11 bg-slate-50 border-slate-100"
                            />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Contact</Label>
                        <div className="relative">
                            <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                            <Input
                              value={`${editingUser.firstName} ${editingUser.lastName}`}
                              disabled
                              className="rounded-2xl h-12 font-bold text-sm pl-11 bg-slate-50/50 border-slate-100 opacity-60"
                            />
                        </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Established Year</Label>
                        <div className="relative">
                            <CalendarDays size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                            <Input
                              type="number"
                              value={editingUser.organizerProfile?.establishedYear}
                              onChange={e => setEditingUser({...editingUser, organizerProfile: {...editingUser.organizerProfile!, establishedYear: e.target.value}})}
                              className="rounded-2xl h-12 font-bold text-sm pl-11 bg-slate-50 border-slate-100"
                            />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Batch Capacity</Label>
                        <div className="relative">
                            <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                            <Input
                              type="number"
                              value={editingUser.organizerProfile?.batchCapacity}
                              onChange={e => setEditingUser({...editingUser, organizerProfile: {...editingUser.organizerProfile!, batchCapacity: Number(e.target.value)}})}
                              className="rounded-2xl h-12 font-bold text-sm pl-11 bg-slate-50 border-slate-100"
                            />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Region</Label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                            <Input
                              value={editingUser.organizerProfile?.businessState}
                              onChange={e => setEditingUser({...editingUser, organizerProfile: {...editingUser.organizerProfile!, businessState: e.target.value}})}
                              className="rounded-2xl h-12 font-bold text-sm pl-11 bg-slate-50 border-slate-100"
                            />
                        </div>
                      </div>
                  </div>

                  <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">HQ Physical Address</Label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-4 text-primary" />
                        <textarea
                          value={editingUser.organizerProfile?.businessAddress}
                          onChange={e => setEditingUser({...editingUser, organizerProfile: {...editingUser.organizerProfile!, businessAddress: e.target.value}})}
                          className="w-full rounded-2xl min-h-[80px] p-4 pl-11 font-bold text-sm bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                  </div>

                  <div className="bg-primary/5 p-6 rounded-[24px] border border-primary/10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                        <ShieldCheck size={24} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-black text-slate-900 uppercase leading-none mb-1">Identity Sync</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Updates will be audited by the platform security engine.</p>
                      </div>
                      <Badge className={cn(
                        "border-none text-[9px] font-black uppercase px-3 py-1",
                        editingUser.isApproved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {editingUser.isApproved ? 'Verified' : 'Audit Pending'}
                      </Badge>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
                  <Button type="button" variant="ghost" onClick={() => setEditingUser(null)} className="flex-1 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest">Dismiss</Button>
                  <Button type="submit" className="flex-[2] h-14 rounded-2xl bg-primary hover:bg-accent font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary/20 text-white">Commit Registry Updates</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-[32px] border-none shadow-2xl font-sans m-4 w-[95vw]">
           <DialogHeader className="sr-only">
             <DialogTitle>Audit Asset Preview</DialogTitle>
             <DialogDescription>A high-resolution preview of partner verification documents for platform security audit.</DialogDescription>
           </DialogHeader>
           {previewDoc && (
             <div className="flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                   <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><FileText size={16} /></div>
                      {previewDoc.label} - Compliance Document
                   </h3>
                </div>
                <div className="p-10 flex items-center justify-center bg-white min-h-[400px]">
                   {previewDoc.doc?.data ? (
                     <div className="w-full flex flex-col items-center gap-6 animate-in zoom-in duration-300">
                        {previewDoc.doc.type.startsWith('image/') ? (
                           <img src={previewDoc.doc.data} className="max-w-full max-h-[65vh] rounded-[24px] shadow-2xl object-contain border border-slate-100" />
                        ) : (
                           // Fallback for non-image files, e.g., PDFs
                           <div className="text-center p-16 bg-slate-50 rounded-[40px] border border-slate-100 max-w-sm w-full">
                              <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-primary shadow-xl"><FileText size={48} /></div>
                              <p className="text-sm font-black text-slate-900 uppercase mb-2 leading-tight">{previewDoc.doc.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">PDF DOCUMENT DETECTED</p>
                              <Button className="w-full h-12 rounded-2xl bg-primary hover:bg-accent text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/10">Download Document</Button>
                           </div>
                        )}
                     </div>
                   ) : (
                     // Displayed when a document is missing
                     <div className="text-center space-y-4 animate-in fade-in duration-500 p-12">
                        <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center mx-auto mb-4 text-red-200 shadow-inner">
                           <FileX size={44} />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Compliance Asset Missing</h4>
                        <p className="text-[11px] text-slate-400 font-bold max-w-[280px] mx-auto leading-relaxed uppercase tracking-widest">The organizer did not submit this mandatory compliance asset during registration.</p>
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
