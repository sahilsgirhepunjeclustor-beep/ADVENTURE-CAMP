'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUsers, saveUsers } from '@/lib/store';
import { User } from '@/lib/types';
import { 
  Search, Users as UsersIcon, Ban, UserCheck, MoreHorizontal, FileText, Filter, UsersRound, 
  ChevronLeft, ChevronRight, ShieldAlert, Clock, ShieldCheck, Check, X, Shield, UserCog, Eye, EyeOff, Briefcase, Trash2,
  AlertTriangle, Calendar, CheckCircle2, FileBadge
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
  change?: string;
  icon: React.ReactNode;
  accent: 'green' | 'blue' | 'red' | 'orange' | 'purple' | 'pink';
}

// Premium Animated Card Component - Optimized for Mobile
const Card = ({ title, value, change, icon, accent }: CardProps) => {
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
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={cn(
                'relative rounded-2xl p-4 sm:p-6 text-white overflow-hidden shadow-xl bg-gradient-to-br transition-all', 
                accentClasses[accent]
            )}
        >
            <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-20 transform translate-x-2 -translate-y-2 sm:translate-x-4 sm:-translate-y-4 scale-125 sm:scale-150">
                {icon}
            </div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <p className="text-[10px] sm:text-xs font-bold text-white/90 uppercase tracking-widest">{title}</p>
                    <div className="hidden sm:flex h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl items-center justify-center border border-white/20">
                        {icon}
                    </div>
                </div>
                <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{value}</h3>
                {change && <p className="text-xs sm:text-sm font-medium text-white/80 mt-1 flex items-center gap-1">{change}</p>}
            </div>
        </motion.div>
    );
};

const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function AdminUsers() {
  const [view, setView] = useState('all'); 
  const [allUsers, setAllUsers] = useState<Record<string, User>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'User' });

  useEffect(() => {
    const usersData = getUsers();
    setAllUsers(usersData || {});
  }, []);

  const { usersList, verifiedUsers, suspendedUsers, pendingUsers, reportUsers } = useMemo(() => {
    const users = Object.values(allUsers);
    return {
      usersList: users,
      verifiedUsers: users.filter(u => u.isApproved && u.status === 'active'),
      suspendedUsers: users.filter(u => u.status === 'suspended'),
      pendingUsers: users.filter(u => !u.isApproved && !u.isRejected && u.status !== 'suspended'),
      reportUsers: users.filter(u => u.isRejected || u.status === 'blocked'), 
    };
  }, [allUsers]);

  const dataToDisplay = useMemo(() => {
    let baseData;
    switch (view) {
        case 'verified': baseData = verifiedUsers; break;
        case 'suspended': baseData = suspendedUsers; break;
        case 'pending': baseData = pendingUsers; break;
        case 'reports': baseData = reportUsers; break;
        case 'all':
        default: baseData = usersList; break;
    }

    if (roleFilter !== 'all') {
        baseData = baseData.filter(u => (u.role || 'User') === roleFilter);
    }

    if (!searchQuery) return baseData;
    const query = searchQuery.toLowerCase();
    return baseData.filter(u => 
        (u.firstName?.toLowerCase().includes(query) ||
         u.lastName?.toLowerCase().includes(query) ||
         u.email?.toLowerCase().includes(query) ||
         u.phone?.toLowerCase().includes(query))
    );
  }, [view, searchQuery, roleFilter, usersList, verifiedUsers, suspendedUsers, pendingUsers, reportUsers]);

  const totalPages = Math.max(1, Math.ceil(dataToDisplay.length / itemsPerPage));
  const paginatedData = dataToDisplay.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [view, searchQuery, roleFilter]);
  
  const getInitials = (firstName: string, lastName: string) => `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`;

  const updateUserStatus = (userId: string, updates: Partial<User>, actionMessage: string) => {
    const userToUpdate = Object.values(allUsers).find(u => u.id === userId || u.email === userId);
    if (!userToUpdate) return;

    const userKey = userToUpdate.id || userToUpdate.email; 
    const updatedUsers = {
        ...allUsers,
        [userKey]: { ...userToUpdate, ...updates, updatedAt: new Date().toISOString() }
    };

    setAllUsers(updatedUsers);
    saveUsers(updatedUsers); 
    
    toast({
        title: "Success!",
        description: `User has been ${actionMessage}.`,
        className: "bg-gray-900 text-white border-none rounded-xl",
    });
  };

  const handleDeleteUser = (userId: string) => {
      if (window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
          const userToDelete = Object.values(allUsers).find(u => u.id === userId || u.email === userId);
          if (!userToDelete) return;

          const userKey = userToDelete.id || userToDelete.email; 
          const updatedUsers = { ...allUsers };
          
          delete updatedUsers[userKey];

          setAllUsers(updatedUsers);
          saveUsers(updatedUsers);

          toast({
              title: "User Deleted",
              description: "The user has been permanently removed from the system.",
              className: "bg-red-600 text-white border-none rounded-xl shadow-lg",
          });
      }
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.firstName || !newUser.email || !newUser.password) {
        toast({ title: "Error", description: "Name, Email, and Password are required.", variant: "destructive" });
        return;
    }

    const userExists = Object.values(allUsers).some(u => u.email === newUser.email);
    if (userExists) {
        toast({ title: "Error", description: "A user with this email already exists.", variant: "destructive" });
        return;
    }

    const newId = `usr_${Date.now()}`;
    const createdUser: User = {
        id: newId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password, 
        role: newUser.role,
        status: 'active',
        isApproved: true, 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const updatedUsers = { ...allUsers, [newId]: createdUser };
    setAllUsers(updatedUsers);
    saveUsers(updatedUsers);

    toast({
        title: "User Created Successfully!",
        description: `${newUser.firstName} is now registered as ${newUser.role} and can login.`,
        className: "bg-emerald-600 text-white border-none rounded-xl",
    });

    setIsInviteModalOpen(false);
    setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'User' });
    setShowPassword(false);
  };

  const renderHeaderAndNav = () => {
    const navItems = [
        { id: 'all', label: 'All Users', icon: <UsersIcon size={16}/> },
        { id: 'pending', label: 'Pending', icon: <Clock size={16}/> },
        { id: 'verified', label: 'Verified', icon: <UserCheck size={16}/> },
        { id: 'suspended', label: 'Suspended', icon: <Ban size={16}/> },
    ];

    const titles: Record<string, { title: string, desc: string }> = {
      all: { title: 'User Management', desc: 'Manage all platform roles: Admins, Organizers, and Users.' },
      pending: { title: 'Pending Verifications', desc: 'Review users awaiting approval.' },
      verified: { title: 'Verified Users', desc: 'Approved users with active accounts.' },
      suspended: { title: 'Suspended Users', desc: 'Accounts temporarily blocked by administrators.' },
    };
    const { title, desc } = titles[view] || titles['all'];

    return (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
                    <p className="mt-1 text-sm sm:text-base text-gray-500 font-medium">{desc}</p>
                </div>
                <div className="flex w-full md:w-auto items-center gap-2 sm:gap-3">
                    <Button 
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 rounded-xl transition-all"
                    >
                        <UsersRound size={16} className="mr-2"/> Create User
                    </Button>
                    <Button variant="outline" className="flex-1 md:flex-none bg-white rounded-xl shadow-sm hover:bg-gray-50 border-gray-200 transition-all text-gray-700">
                        <FileText size={14} className="mr-2 text-gray-500"/> Export
                    </Button>
                </div>
            </header>

            {/* Hidden Scrollbar on Tabs */}
            <nav className="flex overflow-x-auto pb-2 scrollbar-hide gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {navItems.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => { setView(item.id); setRoleFilter('all'); }} 
                        className={cn(
                            "relative flex items-center whitespace-nowrap gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-semibold transition-all duration-300", 
                            view === item.id ? "text-white shadow-md" : "text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-800"
                        )}
                    >
                        {view === item.id && (
                            <motion.div 
                                layoutId="activeTab" 
                                className="absolute inset-0 bg-gray-900 rounded-xl" 
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {item.icon} {item.label}
                        </span>
                    </button>
                ))}
            </nav>
        </motion.div>
    )
  };

  const renderStatCards = () => {
    const commonStats = {
      all: usersList.length,
      verified: verifiedUsers.length,
      suspended: suspendedUsers.length,
      pending: pendingUsers.length,
      reports: reportUsers.length,
      // CASE INSENSITIVE CHECK: ab 'Admin', 'admin', 'ADMIN' sab count honge
      admins: usersList.filter(u => u.role?.toLowerCase() === 'admin').length,
      organizers: usersList.filter(u => u.role?.toLowerCase() === 'organizer').length,
      users: usersList.filter(u => !u.role || u.role.toLowerCase() === 'user').length,
  };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    // Responsive Grid classes applied below: grid-cols-2 for mobile
    switch (view) {
        case 'verified':
            return (
                <motion.div key="verified" initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                    <Card title="VERIFIED" value={commonStats.verified} icon={<UserCheck size={20} />} accent="green" />
                    <Card title="ADMINS" value={verifiedUsers.filter(u => u.role === 'Admin').length} icon={<Shield size={20} />} accent="blue" />
                    <Card title="ORGANIZERS" value={verifiedUsers.filter(u => u.role === 'Organizer').length} icon={<Briefcase size={20} />} accent="purple" />
                    <Card title="STANDARD" value={verifiedUsers.filter(u => !u.role || u.role === 'User').length} icon={<UsersIcon size={20} />} accent="orange" />
                </motion.div>
            );
        case 'pending':
            return (
                <motion.div key="pending" initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                    <Card title="PENDING" value={commonStats.pending} icon={<Clock size={20} />} accent="orange" />
                    <Card title="P. ORGANIZERS" value={pendingUsers.filter(u => u.role === 'Organizer').length} icon={<Briefcase size={20} />} accent="purple" />
                    <Card title="P. USERS" value={pendingUsers.filter(u => !u.role || u.role === 'User').length} icon={<UsersIcon size={20} />} accent="blue" />
                    <Card title="REJECTED" value={commonStats.reports} icon={<Ban size={20} />} accent="red" />
                </motion.div>
            );
        case 'suspended':
            return (
                <motion.div key="suspended" initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                    <Card title="SUSPENDED" value={commonStats.suspended} icon={<Ban size={20} />} accent="red" />
                    <Card title="S. ADMINS" value={suspendedUsers.filter(u => u.role === 'Admin').length} icon={<Shield size={20} />} accent="orange" />
                    <Card title="S. ORGANIZERS" value={suspendedUsers.filter(u => u.role === 'Organizer').length} icon={<Briefcase size={20} />} accent="purple" />
                    <Card title="S. USERS" value={suspendedUsers.filter(u => !u.role || u.role === 'User').length} icon={<UsersIcon size={20} />} accent="pink" />
                </motion.div>
            );
        case 'all':
        default:
            return (
                <motion.div key="all" initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                    <Card title="ACCOUNTS" value={commonStats.all} icon={<UsersIcon size={20} />} accent="blue" />
                    <Card title="ADMINS" value={commonStats.admins} icon={<Shield size={20} />} accent="purple" />
                    <Card title="ORGANIZERS" value={commonStats.organizers} icon={<Briefcase size={20} />} accent="orange" />
                    <Card title="USERS" value={commonStats.users} icon={<UserCheck size={20} />} accent="green" />
                </motion.div>
            );
    }
  };

  const renderTable = () => {
    const tableHeaders: Record<string, string[]> = {
        all: ['User Details', 'Contact Info', 'Role', 'Status'],
        pending: ['User Details', 'Registered Date', 'Role', 'Status'],
        verified: ['User Details', 'Verified On', 'Role', 'Status'],
        suspended: ['User Details', 'Reason/Notes', 'Suspended Date', 'Status'],
    };

    const renderRowContent = (user: User) => {
        const statusBadge = user.status === 'suspended' 
            ? <Badge variant="destructive" className="rounded-full px-3">Suspended</Badge>
            : user.isApproved 
            ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 rounded-full px-3 shadow-sm">Verified</Badge>
            : user.status === 'blocked' || user.isRejected
            ? <Badge variant="destructive" className="rounded-full px-3">Rejected</Badge>
            : <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0 rounded-full px-3 shadow-sm">Pending</Badge>;

        const contactStr = user.phone || 'N/A';
        const notesStr = user.notes || 'No notes provided';
        const roleStr = user.role || 'User';

        const RoleBadge = () => {
            let badgeClasses = "bg-gray-100 text-gray-700";
            let IconComponent = null;

            if (roleStr === 'Admin') {
                badgeClasses = "bg-indigo-100 text-indigo-700";
                IconComponent = <Shield size={12} />;
            } else if (roleStr === 'Organizer') {
                badgeClasses = "bg-purple-100 text-purple-700";
                IconComponent = <Briefcase size={12} />;
            }

            return (
                <span className={cn("px-3 py-1 rounded-full text-xs font-bold shadow-sm inline-flex items-center gap-1", badgeClasses)}>
                    {IconComponent}
                    {roleStr}
                </span>
            );
        };

        switch(view) {
            case 'pending': return (
                <>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap"><RoleBadge /></td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{statusBadge}</td>
                </>
            );
            case 'suspended': return (
                <>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-600 max-w-[150px] sm:max-w-[200px] truncate" title={notesStr}>{notesStr}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">{formatDate(user.updatedAt)}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{statusBadge}</td>
                </>
            );
            case 'verified': 
            case 'all': 
            default: return (
                <>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">{view === 'verified' ? formatDate(user.updatedAt) : contactStr}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap"><RoleBadge /></td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{statusBadge}</td>
                </>
            );
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
        >
            {/* Inline Toolbar for Mobile */}
            <div className="p-4 sm:p-5 flex flex-row justify-between items-center gap-3 bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center gap-2 w-full">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)} 
                            placeholder="Search..." 
                            className="pl-10 pr-8 w-full h-10 sm:h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-emerald-500 shadow-sm transition-all text-sm sm:text-base text-gray-800" 
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-10 sm:h-11 px-3 sm:px-4 bg-white text-gray-700 rounded-xl shadow-sm border-gray-200 whitespace-nowrap hover:bg-gray-50 transition-all outline-none focus:ring-2 focus:ring-emerald-500/20 shrink-0">
                                <Filter size={14} className="sm:mr-2 text-gray-500" />
                                <span className="hidden sm:inline">{roleFilter === 'all' ? 'All Roles' : roleFilter}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white rounded-xl p-2 shadow-xl border border-gray-100">
                            <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">Filter by Role</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-100 mb-1" />
                            <DropdownMenuItem onClick={() => setRoleFilter('all')} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 outline-none">All Roles</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRoleFilter('Admin')} className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-700 cursor-pointer hover:bg-indigo-50 outline-none">Admin</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRoleFilter('Organizer')} className="rounded-lg px-3 py-2 text-sm font-medium text-purple-700 cursor-pointer hover:bg-purple-50 outline-none">Organizer</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRoleFilter('User')} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 outline-none">User</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            
            {/* Hidden Scrollbar on Table Container */}
            <div className="overflow-x-auto min-h-[400px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <table className="w-full text-left min-w-[700px]">
                    <thead>
                        <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-white border-b border-gray-100">
                            {tableHeaders[view].map(h => <th key={h} className="px-4 sm:px-6 py-4 whitespace-nowrap">{h}</th>)}
                            <th className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        <AnimatePresence mode="popLayout">
                            {paginatedData.map((u, index) => (
                                <motion.tr 
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                    key={u.email || u.id} 
                                    className="hover:bg-blue-50/30 transition-colors group"
                                >
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className={cn("w-10 h-10 sm:w-11 sm:h-11 rounded-full text-white flex shrink-0 items-center justify-center font-bold text-sm shadow-md ring-2 ring-white", {
                                                'bg-gradient-to-br from-indigo-400 to-indigo-600': u.role === 'Admin',
                                                'bg-gradient-to-br from-purple-400 to-purple-600': u.role === 'Organizer',
                                                'bg-gradient-to-br from-red-400 to-red-600': (u.status === 'suspended' || u.status === 'blocked') && u.role !== 'Admin' && u.role !== 'Organizer', 
                                                'bg-gradient-to-br from-emerald-400 to-emerald-600': u.status === 'active' && u.isApproved && u.role !== 'Admin' && u.role !== 'Organizer', 
                                                'bg-gradient-to-br from-orange-300 to-orange-500': !u.isApproved && u.status !== 'suspended' && u.status !== 'blocked' && u.role !== 'Admin' && u.role !== 'Organizer'
                                            })}>
                                                {getInitials(u.firstName, u.lastName)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-emerald-600 transition-colors whitespace-nowrap">{u.firstName} {u.lastName}</div>
                                                <div className="text-xs sm:text-sm font-medium text-gray-500">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    {renderRowContent(u)}
                                    <td className="px-4 sm:px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20">
                                                    <MoreHorizontal size={20} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52 bg-white rounded-xl p-2 shadow-xl border border-gray-100">
                                                <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">Manage User</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-gray-100 mb-1" />
                                                
                                                {(u.role || 'User') !== 'Admin' && (
                                                    <DropdownMenuItem onClick={() => updateUserStatus(u.id || u.email, { role: 'Admin' }, 'promoted to Admin')} className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-700 cursor-pointer hover:bg-indigo-50 outline-none">
                                                        <Shield size={16} className="mr-3" /> Make Admin
                                                    </DropdownMenuItem>
                                                )}
                                                {(u.role || 'User') !== 'Organizer' && (
                                                    <DropdownMenuItem onClick={() => updateUserStatus(u.id || u.email, { role: 'Organizer' }, 'changed to Organizer')} className="rounded-lg px-3 py-2 text-sm font-medium text-purple-700 cursor-pointer hover:bg-purple-50 outline-none">
                                                        <Briefcase size={16} className="mr-3" /> Make Organizer
                                                    </DropdownMenuItem>
                                                )}
                                                {(u.role || 'User') !== 'User' && (
                                                    <DropdownMenuItem onClick={() => updateUserStatus(u.id || u.email, { role: 'User' }, 'changed to Standard User')} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 outline-none">
                                                        <UserCog size={16} className="mr-3" /> Make User
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                <DropdownMenuSeparator className="bg-gray-100 my-1" />

                                                {(!u.isApproved && u.status !== 'suspended' && u.status !== 'blocked') && (
                                                    <DropdownMenuItem onClick={() => updateUserStatus(u.id || u.email, { isApproved: true, isRejected: false, status: 'active' }, 'approved')} className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 cursor-pointer hover:bg-emerald-50 outline-none">
                                                        <Check size={16} className="mr-3" /> Approve Account
                                                    </DropdownMenuItem>
                                                )}

                                                {u.status === 'suspended' ? (
                                                    <DropdownMenuItem onClick={() => updateUserStatus(u.id || u.email, { status: 'active', notes: 'Reinstated' }, 'reinstated')} className="rounded-lg px-3 py-2 text-sm font-medium text-blue-700 cursor-pointer hover:bg-blue-50 outline-none">
                                                        <ShieldCheck size={16} className="mr-3" /> Reinstate User
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => updateUserStatus(u.id || u.email, { status: 'suspended', notes: 'Suspended' }, 'suspended')} className="rounded-lg px-3 py-2 text-sm font-medium text-orange-700 cursor-pointer hover:bg-orange-50 outline-none">
                                                        <Ban size={16} className="mr-3" /> Suspend User
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuSeparator className="bg-gray-100 my-1" />
                                                
                                                <DropdownMenuItem onClick={() => handleDeleteUser(u.id || u.email)} className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 cursor-pointer hover:bg-red-50 hover:text-red-700 outline-none">
                                                    <Trash2 size={16} className="mr-3" /> Delete User
                                                </DropdownMenuItem>

                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={tableHeaders[view].length + 1} className="text-center py-24 text-gray-500 bg-gray-50/30">
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                            <Search size={28} className="text-gray-300" />
                                        </div>
                                        <p className="text-lg font-medium text-gray-600">No users found</p>
                                    </motion.div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* PREMIUM PAGINATION */}
            <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 border-t border-gray-100 rounded-b-2xl">
                <span className="text-xs sm:text-sm font-medium text-gray-500">
                    Showing <span className="text-gray-900 font-bold">{paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, dataToDisplay.length)}</span> of <span className="text-gray-900 font-bold">{dataToDisplay.length}</span> users
                </span>
                <div className="flex items-center gap-2 sm:gap-3">
                    <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl border-gray-200 hover:bg-white shadow-sm outline-none text-gray-700" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft size={16} />
                    </Button>
                    <div className='text-xs sm:text-sm font-bold text-gray-700 min-w-[4rem] sm:min-w-[5rem] text-center bg-white px-2 sm:px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm'>
                        {currentPage} / {totalPages}
                    </div>
                    <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl border-gray-200 hover:bg-white shadow-sm outline-none text-gray-700" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
  }

  return (
    <>
        <div className="w-full bg-[#f4f7f9] min-h-screen p-3 sm:p-6 md:p-8 font-sans selection:bg-emerald-100 selection:text-emerald-900">
            <div className="max-w-screen-xl mx-auto">
                {renderHeaderAndNav()}
                {renderStatCards()}
                {renderTable()}
            </div>
        </div>

        {/* INVITE / CREATE USER MODAL */}
        <AnimatePresence>
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
                    >
                        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Create New User</h3>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">Assign role and credentials.</p>
                            </div>
                            <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100 outline-none">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleInviteUser} className="p-5 sm:p-6 space-y-4 sm:space-y-5">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-1.5 sm:space-y-2">
                                    <label className="text-xs sm:text-sm font-semibold text-gray-700">First Name <span className="text-red-500">*</span></label>
                                    <Input required value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} placeholder="John" className="h-10 sm:h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-emerald-500 text-sm" />
                                </div>
                                <div className="space-y-1.5 sm:space-y-2">
                                    <label className="text-xs sm:text-sm font-semibold text-gray-700">Last Name</label>
                                    <Input value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} placeholder="Doe" className="h-10 sm:h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-emerald-500 text-sm" />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="text-xs sm:text-sm font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                                <Input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="john@example.com" className="h-10 sm:h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-emerald-500 text-sm" />
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="text-xs sm:text-sm font-semibold text-gray-700">Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Input 
                                        required 
                                        type={showPassword ? "text" : "password"} 
                                        value={newUser.password} 
                                        onChange={e => setNewUser({...newUser, password: e.target.value})} 
                                        placeholder="Set a password" 
                                        className="h-10 sm:h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-emerald-500 pr-10 text-sm" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors outline-none"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="text-xs sm:text-sm font-semibold text-gray-700">Assign Role</label>
                                <select 
                                    value={newUser.role} 
                                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                                    className="w-full h-10 sm:h-11 px-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none text-sm"
                                >
                                    <option value="User">Standard User</option>
                                    <option value="Organizer">Event Organizer</option>
                                    <option value="Admin">System Admin</option>
                                </select>
                            </div>
                            
                            <div className="pt-2 flex gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)} className="w-full h-10 sm:h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 transition-all text-sm font-semibold">Cancel</Button>
                                <Button type="submit" className="w-full h-10 sm:h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all text-sm font-semibold">Create User</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </>
  );
}