"use client";

import React, { useState, useEffect } from 'react';
import { User, Notification } from '@/lib/types';
import { Bell, PanelLeft, Menu, CheckCircle2, AlertCircle, Search, Gift, MessageSquare, ChevronDown, Zap, Mountain, UserCheck, PlusCircle, Settings, LogOut } from 'lucide-react';
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
import { getAppData, saveAppData } from '@/lib/store';
import { fmtDate, cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

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
    
    return () => {
      clearInterval(notifTimer);
    };
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
      { label: 'Approve Camps', icon: Mountain, page: 'approvals' },
      { label: 'Verify Partners', icon: UserCheck, page: 'organizers' },
    ],
    organizer: [
      { label: 'Add New Camp', icon: PlusCircle, page: 'camps' },
    ],
    user: [],
  };
  
  const actions = quickActions[currentUser.role] || [];

  return (
    <>
      <div id="topbar" className="h-[72px] bg-white flex items-center justify-between px-4 sm:px-6 border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          <button onClick={toggleSidebar} className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 hidden md:block">
            <PanelLeft size={20} />
          </button>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 text-gray-600 rounded-lg hover:bg-gray-100">
                  <Menu size={20} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px]">
                <VisuallyHidden>
                  <SheetTitle>Mobile Menu</SheetTitle>
                  <SheetDescription>Navigation menu for mobile devices.</SheetDescription>
                </VisuallyHidden>
                <Sidebar currentUser={currentUser} currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} isMobile />
              </SheetContent>
            </Sheet>
          </div>

          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input 
              placeholder="Search users, camps, organizers, bookings, payments..."
              className="bg-gray-100/70 border-none w-full h-11 rounded-lg pl-10 pr-16 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-sans text-gray-400 bg-white border border-gray-200/80 rounded-md px-1.5 py-0.5">
              ⌘K
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-4">
          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 h-11 hidden sm:flex items-center gap-2 transition-all">
                  <Zap size={16} />
                  <span className="font-medium">Quick Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2" align="end">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {actions.map(action => (
                  <DropdownMenuItem key={action.page} onClick={() => onNavigate(action.page)}>
                    <action.icon className="mr-2 h-4 w-4" />
                    <span>{action.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="flex items-center gap-1">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <Gift size={20} />
            </button>

            <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors relative">
              <MessageSquare size={20} />
            </button>

            <Popover onOpenChange={(open) => open && unreadNotifications > 0 && markAllRead()}>
              <PopoverTrigger asChild>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors relative">
                  <Bell size={20} className={cn(unreadNotifications > 0 && "text-gray-700")} />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0.5 right-0.5 block h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center border-2 border-white">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0 rounded-xl overflow-hidden shadow-2xl mr-4" align="end">
                  <div className="bg-gray-50 p-3 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-800">Notifications</h3>
                  </div>
                  <ScrollArea className="max-h-[350px]">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center text-xs text-gray-500 italic">
                      No new notifications
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map(n => (
                        <div key={n.id} className={cn("p-3 flex gap-3 items-start", !n.read && "bg-emerald-50/40")}>
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", n.type === 'approval' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600")}>
                             {n.type === 'approval' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          </div>
                          <div>
                             <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                             <p className="text-xs text-gray-500 leading-snug">{n.message}</p>
                             <p className="text-[10px] text-gray-400 mt-1">{fmtDate(n.time)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                 </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm overflow-hidden shrink-0">
                          {currentUser.avatar 
                              ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> 
                              : `${(currentUser.firstName?.[0] || '')}${(currentUser.lastName?.[0] || '')}`.toUpperCase()}
                      </div>
                      <div className="text-left hidden lg:block">
                          <div className="text-sm font-semibold text-gray-800">{currentUser.firstName} {currentUser.lastName}</div>
                          <div className="text-xs text-gray-500">{currentUser.role === 'admin' ? 'Super Admin' : currentUser.role}</div>
                      </div>
                      <ChevronDown size={16} className="text-gray-400 hidden lg:block" />
                  </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate('settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setShowLogoutConfirm(true); }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to sign out as {currentUser.firstName}. You will be returned to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onLogout} className="bg-red-500 hover:bg-red-600">Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
