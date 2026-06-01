"use client";

import React, { useState, useEffect } from 'react';
import { User, Notification } from '@/lib/types';
import { 
  Bell, 
  PanelLeft, 
  Menu, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Gift, 
  MessageSquare, 
  ChevronDown, 
  Zap, 
  Mountain, 
  UserCheck, 
  PlusCircle, 
  Settings, 
  LogOut, 
  Command,
  Sparkles
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetTitle, 
  SheetDescription
} from '@/components/ui/sheet';
import Sidebar from './Sidebar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAppData, saveAppData } from '@/lib/store';
import { fmtDate, cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Badge } from '@/components/ui/badge';

interface TopbarProps {
  currentUser: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  toggleSidebar: () => void;
}

export default function Topbar({ currentUser, currentPage, onNavigate, onLogout, toggleSidebar }: TopbarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const fetchNotifs = () => {
      const data = getAppData(currentUser.email);
      setNotifications(data.notifications || []);
    };
    fetchNotifs();
    const notifTimer = setInterval(fetchNotifs, 5000);
    return () => clearInterval(notifTimer);
  }, [currentUser.email]);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    const data = getAppData(currentUser.email);
    const updated = (data.notifications || []).map(n => ({ ...n, read: true }));
    data.notifications = updated;
    setNotifications(updated);
    saveAppData(currentUser.email, data);
  };

  const quickActions = {
    admin: [
      { label: 'Approve Camps', icon: Mountain, page: 'approvals', desc: 'Review submissions' },
      { label: 'Verify Partners', icon: UserCheck, page: 'organizers', desc: 'Check identity' },
    ],
    organizer: [
      { label: 'Add New Camp', icon: PlusCircle, page: 'camps', desc: 'Create listing' },
    ],
    user: [],
  };
  
  const actions = quickActions[currentUser.role] || [];

  return (
    <TooltipProvider delayDuration={200}>
      <header className="h-[72px] w-full bg-white/90 backdrop-blur-xl border-b border-slate-100/80 sticky top-0 z-[45] flex items-center justify-between px-6">
        
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="hidden md:flex h-9 w-9 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 rounded-lg transition-all"
          >
            <PanelLeft size={19} />
          </Button>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-600 hover:bg-slate-50 rounded-xl">
                  <Menu size={22} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] border-r-0 shadow-2xl">
                <VisuallyHidden>
                  <SheetTitle>Mobile Menu</SheetTitle>
                  <SheetDescription>Main navigation</SheetDescription>
                </VisuallyHidden>
                <Sidebar currentUser={currentUser} currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} isMobile />
              </SheetContent>
            </Sheet>
          </div>

          <div className="relative max-w-sm w-full hidden sm:block group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
              <Search size={16} />
            </div>
            <Input 
              placeholder="Search platform..."
              className="bg-slate-50 border-transparent w-full h-9 rounded-lg pl-10 pr-12 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded bg-white border border-slate-200 px-1.5 font-mono text-[9px] font-bold text-slate-400 flex shadow-sm">
                <Command size={9} />K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          
          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg px-4 h-9 gap-2 shadow-sm shadow-emerald-600/10 active:scale-95 transition-all hidden lg:flex">
                  <Sparkles size={14} className="text-emerald-100" />
                  Quick Action
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 p-1.5 rounded-xl border-slate-200 shadow-xl" align="end">
                <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5 py-2">Suggested</DropdownMenuLabel>
                {actions.map(action => (
                  <DropdownMenuItem key={action.page} onClick={() => onNavigate(action.page)} className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer focus:bg-emerald-50 group">
                    <action.icon size={16} className="text-slate-500 group-focus:text-emerald-600" />
                    <div className="flex flex-col">
                      <span className="font-bold text-[13px] text-slate-700 group-focus:text-emerald-700">{action.label}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{action.desc}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Icon Group */}
          <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-xl">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-white transition-all">
                  <Gift size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={10}>Offers</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-white transition-all">
                  <MessageSquare size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={10}>Messages</TooltipContent>
            </Tooltip>

            <Popover onOpenChange={(open) => open && unreadNotifications > 0 && markAllRead()}>
              <Tooltip>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-white relative">
                      <Bell size={18} className={cn(unreadNotifications > 0 && "text-emerald-600")} />
                      {unreadNotifications > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                      )}
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent sideOffset={10}>Inbox</TooltipContent>
              </Tooltip>
              
              <PopoverContent className="w-[340px] p-0 rounded-xl border-none shadow-2xl mt-4" align="end">
                <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                  {unreadNotifications > 0 && <Badge className="bg-emerald-500 text-[10px] h-5 border-none px-2">{unreadNotifications} New</Badge>}
                </div>
                <ScrollArea className="max-h-[380px]">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-slate-400">
                      <p className="text-xs font-medium">No new notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {notifications.map(n => (
                        <div key={n.id} className={cn("p-4 flex gap-3 transition-all hover:bg-slate-50 cursor-pointer", !n.read && "bg-emerald-50/20")}>
                          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", n.type === 'approval' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600")}>
                            {n.type === 'approval' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          </div>
                          <div className="flex-1">
                             <p className="text-[12px] font-bold text-slate-800 leading-tight">{n.title}</p>
                             <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          <div className="h-6 w-px bg-slate-200/80 mx-1 hidden sm:block" />

          {/* REFINED USER PROFILE SECTION */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 pl-1.5 pr-1 py-1 rounded-xl hover:bg-slate-50 transition-all outline-none group border border-transparent hover:border-slate-100">
                <div className="relative">
                  <div className="h-9 w-9 rounded-lg bg-emerald-600 p-[1.5px] shadow-sm group-hover:shadow-md transition-shadow">
                    <div className="h-full w-full rounded-[7px] bg-white flex items-center justify-center overflow-hidden">
                       {currentUser.avatar 
                          ? <img src={currentUser.avatar} className="h-full w-full object-cover" alt="avatar" /> 
                          : <span className="font-extrabold text-emerald-700 text-[11px]">{(currentUser.firstName?.[0] || '') + (currentUser.lastName?.[0] || '')}</span>}
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                </div>
                
                {/* Name & Role with reduced spacing */}
                <div className="text-left hidden lg:flex flex-col justify-center leading-none py-0.5">
                  <span className="text-[14px] font-bold text-slate-800 tracking-tight leading-none">
                    {currentUser.firstName}
                  </span>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                    {currentUser.role}
                  </span>
                </div>
                
                <ChevronDown size={14} className="text-slate-300 transition-transform group-data-[state=open]:rotate-180 ml-0.5" />
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56 mt-2.5 p-1.5 rounded-xl border-slate-200 shadow-2xl" align="end">
              <div className="px-3 py-2.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Signed in as</p>
                  <p className="text-[13px] font-bold text-slate-800 truncate">{currentUser.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-slate-50" />
              <DropdownMenuItem onClick={() => onNavigate('settings')} className="p-2.5 rounded-lg cursor-pointer flex items-center gap-3 text-slate-600 hover:bg-slate-50 font-semibold text-[13px]">
                  <Settings size={16} />
                  Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-50" />
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setShowLogoutConfirm(true); }} className="p-2.5 rounded-lg cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 flex items-center gap-3 font-bold text-[13px]">
                  <LogOut size={16} />
                  Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="rounded-2xl max-w-[380px] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-800">Ready to sign out?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-slate-500 mt-2 leading-relaxed">
              You'll need to log back in to access your dashboard and manage operations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-100 text-slate-500 text-[13px]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onLogout} className="bg-red-500 hover:bg-red-600 rounded-xl font-bold text-[13px] shadow-lg shadow-red-500/10">Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}