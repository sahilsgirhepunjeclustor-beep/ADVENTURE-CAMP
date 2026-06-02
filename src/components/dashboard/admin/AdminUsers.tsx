/**
 * @file AdminUsers.tsx
 * @description This component provides a comprehensive interface for administrators to manage all users on the platform.
 * It includes features for viewing a list of all users, searching, filtering by role, and performing various
 * administrative actions such as editing user profiles, updating passwords, changing roles, and managing account status
 * (active, suspended, blocked) and verification.
 *
 * @requires react
 * @requires lucide-react - for icons
 * @requires @/lib/types - for User and Role type definitions
 * @requires @/lib/store - for data persistence and retrieval functions (getUsers, saveUsers)
 * @requires @/lib/utils - for utility functions like cn (for class names) and fmtDate
 * @requires @/components/ui/* - for various UI components (Button, Badge, Dialog, Input, etc.)
 */

"use client";

// Import necessary libraries, types, and components
import React, { useState, useEffect, useMemo } from 'react';
import { getUsers, saveUsers } from '@/lib/store';
import { User, Role } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Trash2,
  UserCog,
  Mail,
  Shield,
  User as UserIcon,
  Building2,
  RotateCcw,
  Search,
  Users as UsersIcon,
  ShieldAlert,
  Key,
  Calendar,
  Eye,
  EyeOff,
  Pencil,
  Lock,
  Clock,
  ArrowLeft,
  Ban,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmtDate, cn } from '@/lib/utils';

/**
 * @interface AdminUsersProps
 * @description Defines the props for the AdminUsers component.
 * @property {() => void} [onBack] - Optional callback function to handle back navigation.
 */
interface AdminUsersProps {
  onBack?: () => void;
  initialTab?: 'all' | 'verified' | 'suspended' | 'reports';
}

/**
 * @function AdminUsers
 * @description The main component for managing user accounts in the admin dashboard.
 * @param {AdminUsersProps} props - The component's props.
 * @returns {JSX.Element} The rendered component.
 */
export default function AdminUsers({ onBack, initialTab }: AdminUsersProps) {
  // --- STATE MANAGEMENT ---

  // State to hold all user data.
  const [allUsers, setAllUsers] = useState<Record<string, User>>({});
  // State for the currently active tab.
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'suspended' | 'reports'>(initialTab || 'all');
  // State for the search query to filter users.
  const [searchQuery, setSearchQuery] = useState('');
  // State to hold the user object being edited.
  const [editingUser, setEditingUser] = useState<User | null>(null);
  // State to toggle password visibility in the edit dialog.
  const [showPassword, setShowPassword] = useState(false);
  // State to temporarily hold the password while editing.
  const [tempPassword, setTempPassword] = useState('');

  // --- DATA FETCHING & INITIALIZATION ---

  /**
   * @effect
   * @description Fetches all users from the store on component mount.
   */
  useEffect(() => {
    setAllUsers(getUsers());
  }, []);

  // --- MEMOIZED COMPUTATIONS ---

  // Memoized list of all users, derived from the `allUsers` state.
  const usersList = useMemo(() => Object.values(allUsers), [allUsers]);

  const verifiedUsers = useMemo(() => usersList.filter(u => u.isApproved && !u.isRejected), [usersList]);
  const suspendedUsers = useMemo(() => usersList.filter(u => u.status === 'suspended'), [usersList]);
  const reportUsers = useMemo(() => usersList.filter(u => u.isRejected || u.status === 'blocked'), [usersList]);

  const currentList = activeTab === 'all'
    ? usersList
    : activeTab === 'verified'
      ? verifiedUsers
      : activeTab === 'suspended'
        ? suspendedUsers
        : reportUsers;

  // Memoized list of users filtered by the search query.
  const filteredUsers = currentList.filter(u =>
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Memoized statistics about user roles.
  const stats = useMemo(() => {
    const list = Object.values(allUsers);
    return {
      total: list.length,
      admins: list.filter(u => u.role === 'admin').length,
      organizers: list.filter(u => u.role === 'organizer').length,
      users: list.filter(u => u.role === 'user').length,
    };
  }, [allUsers]);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // --- EVENT HANDLERS ---

  /**
   * @function handleDelete
   * @description Permanently deletes a user account.
   * @param {string} email - The email of the user to delete.
   */
  const handleDelete = (email: string) => {
    if (confirm('Are you sure you want to permanently delete this user account? This action cannot be undone.')) {
      const updated = { ...allUsers };
      delete updated[email.toLowerCase()];
      saveUsers(updated);
      setAllUsers(updated);
      toast({ variant: 'destructive', title: 'User Account Terminated' });
    }
  };

  /**
   * @function handleEditClick
   * @description Opens the edit dialog for a specific user.
   * @param {User} u - The user object to edit.
   */
  const handleEditClick = (u: User) => {
    setEditingUser(u);
    setTempPassword(u.password || '');
  };

  /**
   * @function handleUpdateUser
   * @description Saves the changes made to a user's profile.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated = { ...allUsers };
    const userToSave = { ...editingUser, password: tempPassword };

    updated[editingUser.email.toLowerCase()] = userToSave;
    saveUsers(updated);
    setAllUsers(updated);
    setEditingUser(null);
    toast({ title: 'Profile Updated', description: 'User identity and security credentials updated.' });
  };

  /**
   * @function updateStatus
   * @description Updates the account status of a user.
   * @param {string} email - The user's email.
   * @param {'active' | 'suspended' | 'blocked'} status - The new account status.
   */
  const updateStatus = (email: string, status: 'active' | 'suspended' | 'blocked') => {
    const updated = { ...allUsers };
    updated[email.toLowerCase()] = { ...updated[email.toLowerCase()], status };
    saveUsers(updated);
    setAllUsers(updated);
    toast({ title: `Account ${status.toUpperCase()}` });
  };

  /**
   * @function toggleApproval
   * @description Toggles the verification status of a user.
   * @param {User} user - The user to update.
   */
  const toggleApproval = (user: User) => {
    const updated = { ...allUsers };
    const isNowApproved = !user.isApproved;
    updated[user.email.toLowerCase()] = { ...user, isApproved: isNowApproved, isRejected: false };
    saveUsers(updated);
    setAllUsers(updated);
    toast({ title: isNowApproved ? 'Access Verified' : 'Access Revoked' });
  };

  /**
   * @function updateRole
   * @description Updates the role (permission level) of a user.
   * @param {User} user - The user to update.
   * @param {Role} newRole - The new role to assign.
   */
  const updateRole = (user: User, newRole: Role) => {
    const updated = { ...allUsers };
    updated[user.email.toLowerCase()] = { ...user, role: newRole };
    saveUsers(updated);
    setAllUsers(updated);
    toast({ title: `Role Escalated to ${newRole.toUpperCase()}` });
  };

  // --- RENDER METHOD ---

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
              Users
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">All Users</h2>
              <p className="mt-2 text-sm text-slate-500">Manage marketplace travelers, memberships, verification status, and account health in one place.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="outline" size="sm" className="rounded-full px-4 h-10">Import CSV</Button>
            <Button variant="outline" size="sm" className="rounded-full px-4 h-10">Export</Button>
            <Button size="sm" className="rounded-full px-4 h-10">Invite User</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.35em] font-black text-slate-400 mb-2">Total Users</p>
            <div className="text-3xl font-black text-slate-900">{stats.total}</div>
            <p className="mt-2 text-xs text-slate-500">+12.4% vs last month</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.35em] font-black text-slate-400 mb-2">Verified</p>
            <div className="text-3xl font-black text-slate-900">{verifiedUsers.length}</div>
            <p className="mt-2 text-xs text-slate-500">+6.1% verified growth</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.35em] font-black text-slate-400 mb-2">Suspended</p>
            <div className="text-3xl font-black text-slate-900">{suspendedUsers.length}</div>
            <p className="mt-2 text-xs text-slate-500">-3.2% from last cycle</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.35em] font-black text-slate-400 mb-2">Pending Reports</p>
            <div className="text-3xl font-black text-slate-900">{reportUsers.length}</div>
            <p className="mt-2 text-xs text-slate-500">+{reportUsers.length > 0 ? 8 : 0} recent</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative flex-1 min-w-[280px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search users, email, phone or membership"
            className="pl-9 h-11 rounded-2xl border-slate-100 bg-slate-50/80 font-bold text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full h-10 px-4">Filter</Button>
          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Showing {filteredUsers.length} users</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-[24px] border border-slate-100">
        {[
          { key: 'all', label: 'All Users', count: usersList.length },
          { key: 'verified', label: 'Verified', count: verifiedUsers.length },
          { key: 'suspended', label: 'Suspended', count: suspendedUsers.length },
          { key: 'reports', label: 'Reports', count: reportUsers.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={cn(
              'px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap',
              activeTab === tab.key ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:bg-white hover:text-slate-900'
            )}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/70">
            <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.22em] border-b border-slate-100">
              <th className="px-6 py-4">USER</th>
              <th className="px-6 py-4">PHONE</th>
              <th className="px-6 py-4">MEMBERSHIP</th>
              <th className="px-6 py-4">STATUS</th>
              <th className="px-6 py-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center text-[10px] font-black text-slate-200 uppercase italic tracking-widest">No active directory entries</td></tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.email} className="group hover:bg-slate-50/30 transition-colors">
                  {/* User Identity Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-sm border border-white shadow-sm overflow-hidden">
                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.firstName[0]}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-slate-900 tracking-tight leading-none">{u.firstName} {u.lastName}</div>
                        <div className="text-[10px] text-slate-400 font-bold truncate">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{u.phone || '—'}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={cn(
                      'text-[9px] font-black uppercase px-2 py-1 rounded-lg border-none',
                      u.membership?.status === 'active' ? 'text-green-700 bg-green-100' :
                      u.membership?.status === 'pending' ? 'text-amber-700 bg-amber-100' :
                      'text-slate-700 bg-slate-100'
                    )}>
                      {u.membership?.planName || 'Standard'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={cn(
                      'text-[9px] font-black uppercase px-2 py-1 rounded-lg border-none',
                      u.status === 'suspended' ? 'text-amber-700 bg-amber-100' :
                      u.status === 'blocked' ? 'text-red-700 bg-red-100' :
                      'text-primary bg-primary/10'
                    )}>
                      {u.status || 'active'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="outline" size="icon" onClick={() => handleEditClick(u)} className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-primary hover:text-white border-slate-100 shadow-sm transition-all"><Pencil size={14} /></Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" size="icon" className="h-8 w-8 rounded-lg"><UserCog size={14} /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl min-w-[220px] shadow-2xl border-none p-2 font-sans">
                          <DropdownMenuLabel className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">Account Registry</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => toggleApproval(u)} className="text-[9px] font-bold gap-3 rounded-xl py-2 px-3 cursor-pointer">
                             {u.isApproved ? <Ban size={14} className="text-amber-500" /> : <UserCheck size={14} className="text-primary" />}
                             {u.isApproved ? 'Revoke Verification' : 'Verify Identity'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-50" />

                          <DropdownMenuLabel className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">Access Control</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => updateStatus(u.email, 'active')} className="text-[9px] font-bold gap-3 rounded-xl py-2 px-3 cursor-pointer">
                             <PlayCircle size={14} className="text-green-500" /> Activate Account
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(u.email, 'suspended')} className="text-[9px] font-bold gap-3 rounded-xl py-2 px-3 cursor-pointer">
                             <PauseCircle size={14} className="text-amber-500" /> Suspend Access
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(u.email, 'blocked')} className="text-[9px] font-bold gap-3 rounded-xl py-2 px-3 cursor-pointer">
                             <Ban size={14} className="text-red-500" /> Block Account
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-slate-50" />
                          <DropdownMenuLabel className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">Authorization Scale</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => updateRole(u, 'user')} className="text-[9px] font-bold gap-3 rounded-xl py-2 px-3 cursor-pointer"><UserIcon size={14} className="text-green-500" /> Explorer Level</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateRole(u, 'organizer')} className="text-[9px] font-bold gap-3 rounded-xl py-2 px-3 cursor-pointer"><Building2 size={14} className="text-blue-500" /> Partner Access</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateRole(u, 'admin')} className="text-[9px] font-bold gap-3 rounded-xl py-2 px-3 cursor-pointer"><Shield size={14} className="text-orange-500" /> Platform Staff</DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-slate-50" />
                          <DropdownMenuItem onClick={() => handleDelete(u.email)} className="text-[9px] font-bold gap-3 rounded-xl py-2 px-3 text-destructive hover:bg-red-50 cursor-pointer">
                             <Trash2 size={14} /> Terminate Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 px-2 pb-10">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
          Active Directory: 1 to {filteredUsers.length} of {usersList.length} entities
        </p>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="rounded-xl h-7 px-3 font-black uppercase text-[8px] tracking-widest">Prev</Button>
           <div className="px-3 h-7 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-[8px] font-black uppercase tracking-tight">
             Page 1 of 1
           </div>
           <Button variant="outline" size="sm" className="rounded-xl h-7 px-3 font-black uppercase text-[8px] tracking-widest">Next</Button>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-md rounded-[28px] border-none shadow-2xl p-0 overflow-hidden font-sans m-4 h-[85vh] flex flex-col">
          <DialogHeader className="sr-only"><DialogTitle>Identity Audit</DialogTitle></DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateUser} className="flex flex-col h-full bg-white">
              <div className="bg-[#0d2a1d] p-6 text-white relative shrink-0">
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-[18px] bg-white/10 flex items-center justify-center text-2xl font-black border border-white/20 shadow-xl overflow-hidden">
                       {editingUser.avatar ? <img src={editingUser.avatar} className="w-full h-full object-cover" /> : editingUser.firstName[0]}
                    </div>
                    <div>
                       <h3 className="text-base font-black uppercase tracking-tighter leading-none mb-1">{editingUser.firstName} {editingUser.lastName}</h3>
                       <p className="text-[9px] text-green-200/60 font-black uppercase tracking-widest">{editingUser.email}</p>
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-[-25deg] translate-x-12" />
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">First Name</Label>
                        <Input value={editingUser.firstName} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} className="rounded-xl h-10 font-bold text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Last Name</Label>
                        <Input value={editingUser.lastName} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} className="rounded-xl h-10 font-bold text-xs" />
                      </div>
                  </div>

                  <div className="space-y-1.5">
                      <div className="flex justify-between items-center mb-0.5">
                        <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Security Credentials</Label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[8px] font-black text-primary uppercase hover:underline"
                        >
                          {showPassword ? 'Hide Key' : 'Reveal Key'}
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300">
                            <Key size={14} />
                        </div>
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={tempPassword}
                          onChange={e => setTempPassword(e.target.value)}
                          className="rounded-xl h-10 font-black text-xs pl-9 pr-10 border-slate-100 bg-slate-50/50"
                          placeholder="Registry Password"
                        />
                      </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                        <ShieldAlert size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-slate-900 uppercase leading-none mb-0.5">System Clearance</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">{editingUser.role} Profile</p>
                      </div>
                      <Badge className={cn(
                        "border-none text-[8px] font-black uppercase px-2 py-0.5",
                        editingUser.isApproved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {editingUser.isApproved ? 'Verified' : 'Pending'}
                      </Badge>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
                  <Button type="button" variant="ghost" onClick={() => setEditingUser(null)} className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase">Cancel</Button>
                  <Button type="submit" className="flex-[2] h-10 rounded-xl bg-primary hover:bg-accent font-black text-[9px] uppercase tracking-widest shadow-xl shadow-primary/10 text-white">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
