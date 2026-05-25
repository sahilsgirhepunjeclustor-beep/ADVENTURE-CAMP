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
}

/**
 * @function AdminUsers
 * @description The main component for managing user accounts in the admin dashboard.
 * @param {AdminUsersProps} props - The component's props.
 * @returns {JSX.Element} The rendered component.
 */
export default function AdminUsers({ onBack }: AdminUsersProps) {
  // --- STATE MANAGEMENT ---

  // State to hold all user data.
  const [allUsers, setAllUsers] = useState<Record<string, User>>({});
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

  // Memoized list of users filtered by the search query.
  const filteredUsers = usersList.filter(u =>
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
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
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Identity Management</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Administrative User Directory</p>
          </div>
        </div>
        {/* User Role Statistics */}
        <div className="flex items-center gap-2">
           <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2">
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Admins</div>
              <div className="text-xs font-black text-orange-600">{stats.admins}</div>
           </div>
           <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2">
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Partners</div>
              <div className="text-xs font-black text-primary">{stats.organizers}</div>
           </div>
           <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2">
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Explorers</div>
              <div className="text-xs font-black text-slate-900">{stats.users}</div>
           </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-3 rounded-[20px] border border-slate-100 shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or registry ID..."
            className="pl-9 h-9 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-[10px] uppercase tracking-tight"
          />
        </div>
        <div className="px-4 h-9 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{filteredUsers.length} Directory Entries</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">Identity</th>
              <th className="px-6 py-4">Security Level</th>
              <th className="px-6 py-4">Registry Status</th>
              <th className="px-6 py-4">Access Profile</th>
              <th className="px-6 py-4 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center text-[10px] font-black text-slate-200 uppercase italic tracking-widest">No active directory entries</td></tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.email} className="group hover:bg-slate-50/30 transition-colors">
                  {/* User Identity Column */}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-[10px] border border-white shadow-sm overflow-hidden">
                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.firstName[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{u.firstName} {u.lastName}</div>
                        <div className="text-[8px] text-slate-400 font-bold flex items-center gap-1 uppercase truncate"><Mail size={10} className="text-primary" /> {u.email}</div>
                      </div>
                    </div>
                  </td>
                  {/* Role (Security Level) Column */}
                  <td className="px-6 py-3">
                    <Badge variant="outline" className={cn(
                      "text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border-none",
                      u.role === 'admin' ? 'text-orange-700 bg-orange-100' :
                      u.role === 'organizer' ? 'text-blue-700 bg-blue-100' :
                      'text-green-700 bg-green-100'
                    )}>
                      {u.role}
                    </Badge>
                  </td>
                  {/* Verification Status Column */}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", u.isApproved ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-amber-500")} />
                      <span className={cn("text-[9px] font-black uppercase tracking-tight", u.isApproved ? "text-green-600" : "text-amber-600")}>
                        {u.isApproved ? 'Verified Identity' : 'Registry Pending'}
                      </span>
                    </div>
                  </td>
                  {/* Account Status Column */}
                  <td className="px-6 py-3">
                    <Badge variant="outline" className={cn(
                      "text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border-none",
                      u.status === 'suspended' ? 'text-amber-700 bg-amber-100' :
                      u.status === 'blocked' ? 'text-red-700 bg-red-100' :
                      'text-primary bg-primary/10'
                    )}>
                      {u.status || 'active'}
                    </Badge>
                  </td>
                  {/* Actions Column */}
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="outline" size="icon" onClick={() => handleEditClick(u)} className="h-7 w-7 rounded-lg bg-slate-50 hover:bg-primary hover:text-white border-slate-100 shadow-sm transition-all"><Pencil size={12} /></Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" size="icon" className="h-7 w-7 rounded-lg"><UserCog size={12} /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl min-w-[200px] shadow-2xl border-none p-2 font-sans">
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
