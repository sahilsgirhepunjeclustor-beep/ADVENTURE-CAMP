import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUsers, saveUsers, getCurrentUser, logAdminAction } from '@/lib/store';
import { User } from '@/lib/types';
import { 
  Search, Users as UsersIcon, Ban, UserCheck, MoreHorizontal, FileText, UsersRound, 
  ChevronLeft, ChevronRight, ShieldAlert, Clock, ShieldCheck, Check, X, Shield, UserCog, Eye, EyeOff, Briefcase, Trash2,
  ArrowLeft, CheckCircle2, Upload, File, KeySquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// --- Reusable Components ---
const Card = ({ title, value, icon, accent }: { title: string; value: string | number; icon: React.ReactNode; accent: string; }) => {
    const accentClasses: { [key: string]: string } = {
        green: 'from-emerald-400 to-emerald-600 shadow-emerald-500/20',
        blue: 'from-blue-400 to-blue-600 shadow-blue-500/20',
        red: 'from-rose-400 to-rose-600 shadow-rose-500/20',
        orange: 'from-orange-400 to-orange-600 shadow-orange-500/20',
        purple: 'from-purple-400 to-purple-600 shadow-purple-500/20',
        pink: 'from-pink-400 to-pink-600 shadow-pink-500/20',
    };
    return (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -5, scale: 1.02 }} className={cn('relative rounded-2xl p-6 text-white overflow-hidden shadow-xl bg-gradient-to-br', accentClasses[accent])}>
            <div className="absolute -top-2 -right-2 p-4 opacity-20 scale-150">{icon}</div>
            <div className="relative z-10">
                <p className="text-xs font-bold text-white/90 uppercase tracking-widest">{title}</p>
                <h3 className="text-4xl font-extrabold tracking-tight mt-2">{value}</h3>
            </div>
        </motion.div>
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
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md font-sans overflow-hidden border border-gray-200/50 p-8 text-center"
                >
                    <ShieldAlert size={48} className="mx-auto text-amber-500 mb-4" />
                    <h3 className="text-2xl font-extrabold text-gray-800">{title}</h3>
                    <p className="text-gray-500 font-medium mt-2">{description}</p>
                    <div className="mt-8 flex gap-4">
                        <Button onClick={onCancel} className="w-full h-12 rounded-xl text-base font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm">Cancel</Button>
                        <Button onClick={onConfirm} className="w-full h-12 rounded-xl text-base font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30">Confirm</Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};


// --- Helper Functions ---
const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (error) { return 'Invalid Date'; }
};

const getDocument = (user: User) => {
    if (user.organizerProfile?.govIdDoc) return "Passport";
    if (user.organizerProfile?.panDoc) return "PAN";
    if (user.organizerProfile?.registrationDoc) return "Registration Doc";
    return "---";
};

// --- Main Component ---
export default function AdminOrganizers({ onBack, initialTab = 'all' }: { onBack?: () => void; initialTab?: string; }) {
  const [allUsers, setAllUsers] = useState<Record<string, User>>({});
  const [view, setView] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrganizers, setSelectedOrganizers] = useState<string[]>([]);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingOrganizer, setEditingOrganizer] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<User> & { password?: string }>({ role: 'organizer' });

  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const adminUser = getCurrentUser();

  useEffect(() => { setAllUsers(getUsers() || {}); }, []);
  useEffect(() => { setView(initialTab); }, [initialTab]);

  const { organizersList, verifiedOrgs, suspendedOrgs, pendingOrgs, rejectedOrgs } = useMemo(() => {
    const organizers = Object.values(allUsers).filter(u => u.role === 'organizer');
    return {
      organizersList: organizers,
      verifiedOrgs: organizers.filter(u => u.isApproved && u.status === 'active'),
      suspendedOrgs: organizers.filter(u => u.status === 'suspended'),
      pendingOrgs: organizers.filter(u => !u.isApproved && !u.isRejected),
      rejectedOrgs: organizers.filter(u => u.isRejected || u.status === 'blocked'),
    };
  }, [allUsers]);

  const dataToDisplay = useMemo(() => {
    let baseData = view === 'verified' ? verifiedOrgs : view === 'suspended' ? suspendedOrgs : view === 'pending' ? pendingOrgs : view === 'rejected' ? rejectedOrgs : organizersList;
    if (!searchQuery) return baseData;
    const query = searchQuery.toLowerCase();
    return baseData.filter(o => o.firstName?.toLowerCase().includes(query) || o.lastName?.toLowerCase().includes(query) || o.email?.toLowerCase().includes(query));
  }, [view, searchQuery, organizersList, verifiedOrgs, suspendedOrgs, pendingOrgs, rejectedOrgs]);

  useEffect(() => { setCurrentPage(1); setSelectedOrganizers([]); }, [view, searchQuery]);

  const paginatedData = dataToDisplay.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(dataToDisplay.length / itemsPerPage));
  const getInitials = (f?: string, l?: string) => `${(f?.[0] || '').toUpperCase()}${(l?.[0] || '').toUpperCase()}`;

  const openModal = (mode: 'create' | 'edit', organizer: User | null = null) => {
      setModalMode(mode);
      if (mode === 'edit' && organizer) {
          setEditingOrganizer(organizer);
          setFormData({ ...organizer, password: '' });
      } else {
          setEditingOrganizer(null);
          setFormData({ id: '', firstName: '', lastName: '', email: '', password: '', role: 'organizer' });
      }
      setIsModalOpen(true);
  }

  const handleUpdateUser = (userKey: string, updates: Partial<User>, message: string) => {
    let updatedUsers = { ...allUsers };
    const userToUpdate = updatedUsers[userKey];
    if (!userToUpdate) return;

    const oldRole = userToUpdate.role;
    updatedUsers[userKey] = { ...userToUpdate, ...updates, updatedAt: new Date().toISOString() };
    
    if (updates.role && updates.role !== 'organizer' && updatedUsers[userKey].organizerProfile) {
        delete updatedUsers[userKey].organizerProfile;
    }

    setAllUsers(updatedUsers);
    saveUsers(updatedUsers);
    toast({ title: "Success!", description: message });

    if (adminUser && updates.role && updates.role !== oldRole) {
      logAdminAction(adminUser, 'Role Change', `Changed ${userToUpdate.email} from ${oldRole} to ${updates.role}`);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email) { toast({ title: "Error", description: "Required fields missing.", variant: "destructive" }); return; }

    if (modalMode === 'create') {
        if (!formData.password) { toast({ title: "Error", description: "Password is required.", variant: "destructive" }); return; }
        if (Object.values(allUsers).some(u => u.email?.toLowerCase() === formData.email?.toLowerCase())) { toast({ title: "Error", description: "Email already exists.", variant: "destructive" }); return; }
        const id = `org_${Date.now()}`;
        const org: User = { ...formData, id, isApproved: true, isRejected: false, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        const updated = { ...allUsers, [org.email!.toLowerCase()]: org };
        setAllUsers(updated); saveUsers(updated);
        toast({ title: "Organizer Created!", description: `${formData.firstName} registered.` });
        if(adminUser) {
            logAdminAction(adminUser, 'Organizer Creation', `Created new organizer ${formData.email}`);
        }
    } else if (modalMode === 'edit' && editingOrganizer) {
        handleUpdateUser(editingOrganizer.email.toLowerCase(), { firstName: formData.firstName, lastName: formData.lastName }, "Organizer details updated.");
    }
    setIsModalOpen(false);
  };

  const handleBulkAction = (action: 'approve' | 'suspend' | 'reinstate' | 'delete') => {
      if (window.confirm(`Sure you want to ${action} ${selectedOrganizers.length} organizers?`)) {
          let updatedUsers = { ...allUsers };
          let updateCount = 0;
          selectedOrganizers.forEach(email => {
              if (updatedUsers[email]) {
                  if (action === 'delete') {
                      delete updatedUsers[email];
                      if (adminUser) logAdminAction(adminUser, 'Bulk Delete', `Deleted organizer ${email}`);
                  } else {
                      let status: User['status'] = updatedUsers[email].status;
                      let isApproved = updatedUsers[email].isApproved;
                      if (action === 'approve') { status = 'active'; isApproved = true; }
                      if (action === 'suspend') { status = 'suspended'; }
                      if (action === 'reinstate') { status = 'active'; }
                      updatedUsers[email] = { ...updatedUsers[email], status, isApproved };
                      if (adminUser) logAdminAction(adminUser, `Bulk ${action}`, `Changed status of ${email} to ${status}`);
                  }
                  updateCount++;
              }
          });
          setAllUsers(updatedUsers);
          saveUsers(updatedUsers);
          toast({ title: `Bulk ${action} successful`, description: `${updateCount} organizers updated.` });
          setSelectedOrganizers([]);
      }
  }

  const handlePasswordReset = (email: string) => {
      if (window.confirm("Generate a new password for this organizer?")) {
          const newPassword = Math.random().toString(36).slice(-8);
          handleUpdateUser(email.toLowerCase(), { password: newPassword }, `Password reset. New password: ${newPassword}`);
          toast({ title: "Password Reset", description: `New password for ${email} is: ${newPassword}`, duration: 9000 });
          if (adminUser) logAdminAction(adminUser, 'Password Reset', `Reset password for ${email}`);
      }
  }

    const confirmRoleChange = (org: User, newRole: 'user' | 'admin') => {
        const action = () => {
            handleUpdateUser(org.email, { role: newRole }, `Role changed to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}.`);
            setConfirmAction(null);
        };
        setConfirmAction(() => action);
    };


  const toggleSelect = (email: string) => setSelectedOrganizers(p => p.includes(email) ? p.filter(e => e !== email) : [...p, email]);
  const toggleSelectAll = () => setSelectedOrganizers(selectedOrganizers.length === paginatedData.length ? [] : paginatedData.map(o => o.email.toLowerCase()));

  // --- RENDER FUNCTIONS ---
  const renderHeaderAndNav = () => (
        <div className="space-y-6 mb-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Organizer Management</h1>
                    <p className="mt-1 text-base text-gray-500 font-medium">Oversee all organizers on the platform.</p>
                </div>
                <Button onClick={() => openModal('create')} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"><UsersRound size={16} className="mr-2"/> Create Organizer</Button>
            </header>
            <nav className="flex overflow-x-auto pb-2 scrollbar-hide gap-2">
                {[{ id: 'all', l: 'All'}, { id: 'pending', l: 'Pending'}, { id: 'verified', l: 'Verified'}, { id: 'suspended', l: 'Suspended'}, { id: 'rejected', l: 'Rejected'}].map(i => <button key={i.id} onClick={() => setView(i.id)} className={cn("relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all", view === i.id ? "text-white shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600" : "text-gray-500 bg-white border border-gray-200 hover:bg-gray-50")}><span className="relative z-10">{i.l}</span></button>)}
            </nav>
        </div>
  );

  const renderStatCards = () => (
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card title="TOTAL" value={organizersList.length} icon={<UsersIcon size={24} />} accent="blue" />
            <Card title="VERIFIED" value={verifiedOrgs.length} icon={<UserCheck size={24} />} accent="green" />
            <Card title="PENDING" value={pendingOrgs.length} icon={<Clock size={24} />} accent="orange" />
            <Card title="SUSPENDED" value={suspendedOrgs.length} icon={<Ban size={24} />} accent="red" />
            <Card title="REJECTED" value={rejectedOrgs.length} icon={<ShieldAlert size={24} />} accent="pink" />
        </motion.div>
  );

  const renderTable = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-5 flex justify-between items-center bg-gray-50/50 border-b border-gray-100">
                <div className="relative flex-1 max-w-xs">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-10 w-full rounded-xl bg-white" />
                </div>
                {selectedOrganizers.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" className="rounded-xl"><UsersIcon size={16} className="mr-2"/> Bulk Actions ({selectedOrganizers.length})</Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-xl">
                            <DropdownMenuItem onClick={() => handleBulkAction('approve')} className="text-emerald-700"><Check size={16} className="mr-2"/>Approve</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction('suspend')} className="text-orange-700"><Ban size={16} className="mr-2"/>Suspend</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction('reinstate')}><ShieldCheck size={16} className="mr-2"/>Reinstate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-red-700"><Trash2 size={16} className="mr-2"/>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead>
                        <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                            <th className="px-6 py-4"><Checkbox checked={selectedOrganizers.length === paginatedData.length && paginatedData.length > 0} onCheckedChange={toggleSelectAll} /></th>
                            <th className="px-6 py-4">ORGANIZER</th>
                            {['DOCUMENT', 'SUBMITTED ON', 'LOCATION', 'STATUS'].map(h => <th key={h} className="px-6 py-4">{h}</th>)}
                            <th className="px-6 py-4 text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((org) => {
                            const isSelected = selectedOrganizers.includes(org.email.toLowerCase());
                            return (
                            <motion.tr key={org.email} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("hover:bg-gray-50", { 'bg-blue-50': isSelected })}>
                                <td className="px-6 py-4"><Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(org.email.toLowerCase())} /></td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">{getInitials(org.firstName, org.lastName)}</div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900">{org.firstName} {org.lastName}</div>
                                            <div className="text-xs text-gray-500">{org.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{getDocument(org)}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(org.createdAt)}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{org.location || '---'}</td>
                                <td className="px-6 py-4"><Badge variant={org.isApproved ? "default" : "secondary"} className={cn({'bg-emerald-100 text-emerald-700': org.isApproved, 'bg-orange-100 text-orange-700': !org.isApproved && !org.isRejected, 'bg-red-100 text-red-700': org.isRejected || org.status === 'suspended'})}>{org.status === 'suspended' ? 'Suspended' : org.isApproved ? 'Verified' : org.isRejected ? 'Rejected' : 'Pending'}</Badge></td>
                                <td className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-gray-400 rounded-lg"><MoreHorizontal size={20} /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-52 rounded-xl p-2 shadow-xl">
                                            <DropdownMenuItem onClick={() => openModal('edit', org)} className="cursor-pointer"><UserCog size={16} className="mr-3"/>Edit Details</DropdownMenuItem>
                                            <DropdownMenuSeparator/>
                                            {!org.isApproved && !org.isRejected && (
                                                <>
                                                    <DropdownMenuItem onClick={() => handleUpdateUser(org.email, { isApproved: true, status: 'active' }, 'Organizer approved.')} className="text-emerald-700"><Check size={16} className="mr-3"/>Approve</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateUser(org.email, { isRejected: true, status: 'blocked' }, 'Organizer rejected.')} className="text-red-700"><X size={16} className="mr-3"/>Reject</DropdownMenuItem>
                                                </>
                                            )}
                                            {org.status === 'active' && <DropdownMenuItem onClick={() => handleUpdateUser(org.email, { status: 'suspended' }, 'Organizer suspended.')} className="text-orange-700"><Ban size={16} className="mr-3"/>Suspend</DropdownMenuItem>}
                                            {org.status === 'suspended' && <DropdownMenuItem onClick={() => handleUpdateUser(org.email, { status: 'active' }, 'Organizer reinstated.')}><ShieldCheck size={16} className="mr-3"/>Reinstate</DropdownMenuItem>}
                                            <DropdownMenuSeparator/>
                                            <DropdownMenuItem onClick={() => confirmRoleChange(org, 'user')}><UserCog size={16} className="mr-3"/>Make User</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => confirmRoleChange(org, 'admin')}><Shield size={16} className="mr-3"/>Make Admin</DropdownMenuItem>
                                            <DropdownMenuSeparator/>
                                            <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-red-700"><Trash2 size={16} className="mr-3"/>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </motion.tr>
                        )})
                        }
                    </tbody>
                </table>
            </div>
            <div className="px-6 py-4 flex items-center justify-between bg-gray-50/50 border-t border-gray-100">
                <span className="text-sm text-gray-500">Showing {paginatedData.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0} to {Math.min(currentPage * itemsPerPage, dataToDisplay.length)} of {dataToDisplay.length}</span>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft size={16} /></Button>
                    <div className='text-sm font-bold text-gray-700'>{currentPage} / {totalPages}</div>
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight size={16} /></Button>
                </div>
            </div>
        </motion.div>
  );

  return (
    <>
      <div className="w-full bg-[#f4f7f9] min-h-screen p-8 font-sans">
        <div className="max-w-screen-xl mx-auto">
          {renderHeaderAndNav()}
          {renderStatCards()}
          {renderTable()}
        </div>
      </div>
      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl font-sans overflow-hidden border border-gray-200/50"
                >
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800">{modalMode === 'create' ? 'Create New Organizer' : 'Edit Organizer'}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full text-gray-400 hover:bg-gray-200/70 hover:text-gray-600 transition-colors outline-none">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleFormSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600">First Name <span className="text-red-500">*</span></label>
                                <Input required value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Sahil" className="h-12 bg-emerald-50/60 border-transparent rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600">Last Name</label>
                                <Input value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Doe" className="h-12 bg-emerald-50/60 border-transparent rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600">Email Address <span className="text-red-500">*</span></label>
                            <Input required type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} disabled={modalMode === 'edit'} className="h-12 bg-gray-100 border-gray-200 rounded-lg cursor-not-allowed" />
                        </div>
                        
                        {modalMode === 'create' && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600">Password <span className="text-red-500">*</span></label>
                                <div className="relative"><Input required type={showPassword ? "text" : "password"} value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} className="h-12 pr-12 bg-emerald-50/60 border-transparent rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
                            </div>
                        )}

                        {modalMode === 'edit' && editingOrganizer && (
                            <div className="space-y-6 pt-8 border-t border-gray-100">
                                <div className="space-y-3">
                                    <h4 className="text-base font-bold text-gray-800">Documents</h4>
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                                        <File size={22} className="text-gray-400 shrink-0" />
                                        <span className="flex-1 text-sm font-semibold text-gray-700">{getDocument(editingOrganizer)}</span>
                                        <Button type="button" variant="outline" size="sm" className="h-10 rounded-lg bg-white shadow-sm font-semibold">View</Button>
                                        <Button type="button" variant="outline" size="sm" className="h-10 rounded-lg bg-white shadow-sm font-semibold"><Upload size={14} className="mr-2"/>Upload</Button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-base font-bold text-gray-800">Security</h4>
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                                        <KeySquare size={22} className="text-gray-400 shrink-0" />
                                        <span className="flex-1 text-sm font-semibold text-gray-700">Manage Password</span>
                                        <Button type="button" variant="destructive" size="sm" className="h-10 rounded-lg bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 font-semibold" onClick={() => handlePasswordReset(editingOrganizer.email)}>Reset Password</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="pt-8 flex gap-4 border-t border-gray-100">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="w-full h-12 rounded-xl text-base font-bold bg-white shadow-sm hover:bg-gray-100 border-gray-300">Cancel</Button>
                            <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30">{modalMode === 'create' ? 'Create Organizer' : 'Save Changes'}</Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
      <ConfirmationModal 
        isOpen={!!confirmAction}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
            if (typeof confirmAction === 'function') {
                confirmAction();
            }
        }}
        title="Are you sure?"
        description="This action may have significant consequences. Please confirm you want to proceed."
      />
    </>
  );
}
