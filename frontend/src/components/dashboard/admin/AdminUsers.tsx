'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUsers, saveUsers, getCurrentUser, logAdminAction } from '@/lib/store';
import { User } from '@/lib/types';
import { 
  Search, Users as UsersIcon, Ban, UserCheck, MoreHorizontal, FileText, Filter, UsersRound, 
  ChevronLeft, ChevronRight, ShieldAlert, Clock, ShieldCheck, Check, X, Shield, UserCog, Eye, EyeOff, Briefcase, Trash2,
  AlertTriangle, Calendar, CheckCircle2, FileBadge, ArrowLeft
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
import { cn } from '@/lib/utils';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accent: 'green' | 'blue' | 'red' | 'orange' | 'purple' | 'pink';
}

const Card = ({ title, value, icon, accent }: CardProps) => {
    const accentClasses = {
        green: 'from-emerald-400 to-emerald-600 shadow-emerald-500/20',
        blue: 'from-blue-400 to-blue-600 shadow-blue-500/20',
        red: 'from-rose-400 to-rose-600 shadow-rose-500/20',
        orange: 'from-orange-400 to-orange-600 shadow-orange-500/20',
        purple: 'from-purple-400 to-purple-600 shadow-purple-500/20',
        pink: 'from-pink-400 to-pink-600 shadow-pink-500/20',
    };
    return (
        <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={cn('relative rounded-2xl p-6 text-white overflow-hidden shadow-xl bg-gradient-to-br', accentClasses[accent])}
        >
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

const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

interface AdminUsersProps {
    onBack?: () => void;
    initialTab?: string;
    onNavigate?: (page: string, params?: any) => void;
}

export default function AdminUsers({ onBack, initialTab = 'all', onNavigate }: AdminUsersProps) {
  const [view, setView] = useState(initialTab); 
  const [allUsers, setAllUsers] = useState<Record<string, User>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'user' as const });
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const adminUser = getCurrentUser();

  useEffect(() => {
    setAllUsers(getUsers() || {});
  }, []);

  useEffect(() => {
    setView(initialTab);
  }, [initialTab]);

  const { standardUsers, verifiedUsers, suspendedUsers, pendingUsers, rejectedUsers } = useMemo(() => {
    const users = Object.values(allUsers).filter(u => u.role === 'user');
    return {
        standardUsers: users,
        verifiedUsers: users.filter(u => u.isApproved && u.status === 'active'),
        suspendedUsers: users.filter(u => u.status === 'suspended'),
        pendingUsers: users.filter(u => !u.isApproved && !u.isRejected),
        rejectedUsers: users.filter(u => u.isRejected || u.status === 'blocked'),
    };
  }, [allUsers]);

  const dataToDisplay = useMemo(() => {
    let baseData;
    switch (view) {
        case 'verified': baseData = verifiedUsers; break;
        case 'suspended': baseData = suspendedUsers; break;
        case 'pending': baseData = pendingUsers; break;
        case 'rejected': baseData = rejectedUsers; break;
        default: baseData = standardUsers; break;
    }

    if (!searchQuery) return baseData;
    const query = searchQuery.toLowerCase();
    return baseData.filter(u => 
        (u.firstName?.toLowerCase().includes(query) ||
         u.lastName?.toLowerCase().includes(query) ||
         u.email?.toLowerCase().includes(query))
    );
  }, [view, searchQuery, standardUsers, verifiedUsers, suspendedUsers, pendingUsers, rejectedUsers]);

  const totalPages = Math.max(1, Math.ceil(dataToDisplay.length / itemsPerPage));
  const paginatedData = dataToDisplay.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [view, searchQuery]);
  
  const getInitials = (firstName: string, lastName: string) => `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`;

  const updateUser = (userId: string, updates: Partial<User>, actionMessage: string) => {
    const userToUpdate = Object.values(allUsers).find(u => u.id === userId || u.email === userId);
    if (!userToUpdate) return;

    const userKey = userToUpdate.email.toLowerCase(); 
    const updatedUsers = { ...allUsers, [userKey]: { ...userToUpdate, ...updates, updatedAt: new Date().toISOString() } };

    setAllUsers(updatedUsers);
    saveUsers(updatedUsers);
    
    if (adminUser && (updates.role || updates.status)) {
        const details = updates.role ? `Changed role of ${userToUpdate.email} to ${updates.role}` : `Changed status of ${userToUpdate.email} to ${updates.status}`;
        logAdminAction(adminUser, 'User Update', details);
    }
    
    toast({ title: "Success!", description: `User has been ${actionMessage}.` });
  };

  const confirmRoleChange = (user: User, newRole: 'organizer' | 'admin') => {
    const action = () => {
        updateUser(user.id || user.email, { role: newRole }, `promoted to ${newRole}`);
        setConfirmAction(null);
    };
    setConfirmAction(() => action);
  };

  const handleDeleteUser = (userId: string) => {
      const action = () => {
          const userToDelete = Object.values(allUsers).find(u => u.id === userId || u.email === userId);
          if (!userToDelete) return;

          const userKey = userToDelete.email.toLowerCase(); 
          const updatedUsers = { ...allUsers };
          delete updatedUsers[userKey];

          setAllUsers(updatedUsers);
          saveUsers(updatedUsers);

          if(adminUser) {
            logAdminAction(adminUser, 'User Deletion', `Deleted user ${userToDelete.email}`);
          }

          toast({ title: "User Deleted", description: "The user has been permanently removed.", variant: "destructive" });
          setConfirmAction(null);
      };
      setConfirmAction(() => action);
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.firstName || !newUser.email || !newUser.password) {
        toast({ title: "Error", description: "Name, Email, and Password are required.", variant: "destructive" });
        return;
    }
    if (Object.values(allUsers).some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
        toast({ title: "Error", description: "A user with this email already exists.", variant: "destructive" });
        return;
    }

    const newId = `usr_${Date.now()}`;
    const createdUser: User = {
        id: newId,
        ...newUser,
        status: 'active',
        isApproved: true, 
        isRejected: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const updatedUsers = { ...allUsers, [createdUser.email.toLowerCase()]: createdUser };
    setAllUsers(updatedUsers);
    saveUsers(updatedUsers);

    if(adminUser) {
        logAdminAction(adminUser, 'User Creation', `Created new user ${createdUser.email}`);
    }

    toast({ title: "User Created!", description: `${newUser.firstName} can now login.` });

    setIsInviteModalOpen(false);
    setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'user' });
    setShowPassword(false);
  };

  const renderHeaderAndNav = () => {
    const navItems = [
        { id: 'all', label: 'All Users', icon: <UsersIcon size={16}/> },
        { id: 'pending', label: 'Pending', icon: <Clock size={16}/> },
        { id: 'verified', label: 'Verified', icon: <UserCheck size={16}/> },
        { id: 'suspended', label: 'Suspended', icon: <Ban size={16}/> },
        { id: 'rejected', label: 'Rejected', icon: <ShieldAlert size={16}/> },
    ];

    const titles = {
      all: { title: 'User Management', desc: 'Manage all standard users.' },
      pending: { title: 'Pending Verifications', desc: 'Review users awaiting approval.' },
      verified: { title: 'Verified Users', desc: 'Approved users with active accounts.' },
      suspended: { title: 'Suspended Users', desc: 'Accounts temporarily blocked.' },
      rejected: { title: 'Rejected Accounts', desc: 'Users who have been denied access.' },
    };
    const { title, desc } = titles[view] || titles.all;

    return (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mb-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    {onBack && <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={onBack}><ArrowLeft size={18}/></Button>}
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
                        <p className="mt-1 text-base text-gray-500 font-medium">{desc}</p>
                    </div>
                </div>
                <div className="flex w-full md:w-auto items-center gap-3">
                    <Button onClick={() => setIsInviteModalOpen(true)} className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg rounded-xl">
                        <UsersRound size={16} className="mr-2"/> Create User
                    </Button>
                    <Button variant="outline" className="flex-1 md:flex-none bg-white rounded-xl shadow-sm border-gray-200 text-gray-700">
                        <FileText size={14} className="mr-2 text-gray-500"/> Export
                    </Button>
                </div>
            </header>

            <nav className="flex overflow-x-auto pb-2 scrollbar-hide gap-2">
                {navItems.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => setView(item.id)} 
                        className={cn("relative flex items-center whitespace-nowrap gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all", view === item.id ? "text-white shadow-md" : "text-gray-500 bg-white border border-gray-200 hover:bg-gray-50")}
                    >
                        {view === item.id && <motion.div layoutId="activeUserTab" className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl" />}
                        <span className="relative z-10 flex items-center gap-2">{item.icon} {item.label}</span>
                    </button>
                ))}
            </nav>
        </motion.div>
    );
  };

  const renderStatCards = () => {
    const stats = {
      all: standardUsers.length,
      verified: verifiedUsers.length,
      pending: pendingUsers.length,
      suspended: suspendedUsers.length,
      rejected: rejectedUsers.length,
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card title="TOTAL USERS" value={stats.all} icon={<UsersIcon size={24} />} accent="blue" />
            <Card title="VERIFIED" value={stats.verified} icon={<UserCheck size={24} />} accent="green" />
            <Card title="PENDING" value={stats.pending} icon={<Clock size={24} />} accent="orange" />
            <Card title="SUSPENDED" value={stats.suspended} icon={<Ban size={24} />} accent="red" />
            <Card title="REJECTED" value={stats.rejected} icon={<ShieldAlert size={24} />} accent="pink" />
        </motion.div>
    );
  };

  const renderTable = () => {
    const tableHeaders = ['USER', 'CONTACT INFO', 'REGISTERED ON', 'STATUS'];

    const renderRowContent = (user: User) => {
        const statusBadge = user.status === 'suspended' ? <Badge variant="destructive" className="rounded-full py-1">Suspended</Badge>
            : user.isApproved ? <Badge className="bg-emerald-100 text-emerald-700 rounded-full py-1 flex items-center gap-1"><CheckCircle2 size={12}/>Verified</Badge>
            : user.isRejected ? <Badge variant="destructive" className="rounded-full py-1">Rejected</Badge>
            : <Badge variant="secondary" className="bg-orange-100 text-orange-700 rounded-full py-1">Pending</Badge>;

        return (
            <>
                <td className="px-6 py-4 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                <td className="px-6 py-4">{statusBadge}</td>
            </>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-5 flex justify-between items-center bg-gray-50/50 border-b border-gray-100">
                <div className="relative w-full max-w-xs">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users..." className="pl-10 w-full rounded-xl bg-white" />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                    <thead>
                        <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                            {tableHeaders.map(h => <th key={h} className="px-6 py-4">{h}</th>)}
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((u, index) => (
                            <motion.tr 
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={u.email || u.id} 
                                className="hover:bg-gray-50 group"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">{getInitials(u.firstName, u.lastName)}</div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900 group-hover:text-emerald-600">{u.firstName} {u.lastName}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                {renderRowContent(u)}
                                <td className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-gray-400 rounded-lg"><MoreHorizontal size={20} /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-52 rounded-xl p-2 shadow-xl">
                                            <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {!u.isApproved && !u.isRejected && (
                                                <>
                                                    <DropdownMenuItem onClick={() => updateUser(u.id || u.email, { isApproved: true, isRejected: false, status: 'active' }, 'approved')} className="text-emerald-700 cursor-pointer"><Check size={16} className="mr-3"/>Approve Account</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateUser(u.id || u.email, { isRejected: true, isApproved: false, status: 'blocked' }, 'rejected')} className="text-red-700 cursor-pointer"><X size={16} className="mr-3"/>Reject Account</DropdownMenuItem>
                                                </>
                                            )}
                                            {u.isApproved && u.status === 'active' && (
                                                <DropdownMenuItem onClick={() => updateUser(u.id || u.email, { status: 'suspended' }, 'suspended')} className="text-orange-700 cursor-pointer"><Ban size={16} className="mr-3"/>Suspend User</DropdownMenuItem>
                                            )}
                                            {u.status === 'suspended' && (
                                                <DropdownMenuItem onClick={() => updateUser(u.id || u.email, { status: 'active' }, 'reinstated')}><ShieldCheck size={16} className="mr-3"/>Reinstate User</DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => confirmRoleChange(u, 'organizer')}><Briefcase size={16} className="mr-3"/>Make Organizer</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => confirmRoleChange(u, 'admin')}><Shield size={16} className="mr-3"/>Make Admin</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDeleteUser(u.id || u.email)} className="text-red-600 cursor-pointer"><Trash2 size={16} className="mr-3"/>Delete User</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="px-6 py-4 flex items-center justify-between bg-gray-50/50 border-t border-gray-100">
                <span className="text-sm text-gray-500">Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, dataToDisplay.length)} of {dataToDisplay.length} users</span>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft size={16} /></Button>
                    <div className='text-sm font-bold text-gray-700'>{currentPage} / {totalPages}</div>
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight size={16} /></Button>
                </div>
            </div>
        </motion.div>
    );
  }

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
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-900">Create New User</h3>
                            <p className="text-sm text-gray-500 mt-1">Enter the details for the new standard user.</p>
                        </div>
                        <form onSubmit={handleInviteUser} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-semibold text-gray-700">First Name <span className="text-red-500">*</span></label><Input required value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} placeholder="John" className="rounded-xl" /></div>
                                <div><label className="text-sm font-semibold text-gray-700">Last Name</label><Input value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} placeholder="Doe" className="rounded-xl" /></div>
                            </div>
                            <div><label className="text-sm font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></label><Input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="john@example.com" className="rounded-xl" /></div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Input required type={showPassword ? "text" : "password"} value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="Set a password" className="rounded-xl pr-10" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)} className="w-full rounded-xl">Cancel</Button>
                                <Button type="submit" className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white">Create User</Button>
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
