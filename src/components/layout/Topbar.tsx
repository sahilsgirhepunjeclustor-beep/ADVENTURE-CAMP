"use client";

import React, { useState, useEffect } from 'react';
import { User, Notification } from '@/lib/types';
import { Bell, Clock, Menu, CheckCircle2, AlertCircle } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetTrigger 
} from '@/components/ui/sheet';
import Sidebar from './Sidebar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAppData, saveAppData } from '@/lib/store';
import { fmtDate, cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface TopbarProps {
  currentUser: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Topbar({ currentUser, currentPage, onNavigate, onLogout }: TopbarProps) {
  const [time, setTime] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const logoIcon = PlaceHolderImages.find(img => img.id === 'logo-icon');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    
    const fetchNotifs = () => {
      const data = getAppData(currentUser.email);
      setNotifications(data.notifications || []);
    };
    fetchNotifs();
    const notifTimer = setInterval(fetchNotifs, 5000);
    
    return () => {
      clearInterval(timer);
      clearInterval(notifTimer);
    };
  }, [currentUser.email]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    const data = getAppData(currentUser.email);
    const updated = (data.notifications || []).map(n => ({ ...n, read: true }));
    data.notifications = updated;
    setNotifications(updated);
    saveAppData(currentUser.email, data);
  };

  return (
    <div id="topbar" className="h-16 md:h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-10 border-b border-slate-100 sticky top-0 z-50 font-normal">
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>Mobile navigation sidebar</SheetDescription>
              </SheetHeader>
              <Sidebar currentUser={currentUser} currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} isMobile />
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="hidden md:block">
          <h1 className="text-xl font-medium text-slate-800 uppercase tracking-tight">
            {currentPage.replace('_', ' ')}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-5 ml-4">
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-emerald-100">
          <Clock size={12} className="text-emerald-600" />
          <span className="text-[10px] md:text-xs font-medium text-emerald-600 tabular-nums tracking-widest">{time}</span>
        </div>

        <Popover onOpenChange={(open) => open && unreadCount > 0 && markAllRead()}>
          <PopoverTrigger asChild>
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-orange-500 transition-all relative">
              <Bell size={16} className={cn(unreadCount > 0 && "animate-shake text-orange-500")} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-orange-500 text-white text-[9px] font-medium rounded-full flex items-center justify-center border-2 border-white px-1 animate-in zoom-in">
                  {unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0 rounded-[24px] overflow-hidden border-none shadow-2xl mr-4" align="end">
             <div className="bg-[#153c1c] p-5 text-white">
                <div className="flex justify-between items-center">
                   <h3 className="text-xs font-medium uppercase tracking-widest">Notifications</h3>
                   {unreadCount > 0 && <span className="text-[9px] bg-orange-500 px-2 py-0.5 rounded-full font-medium uppercase">New</span>}
                </div>
             </div>
             <ScrollArea className="max-h-[350px]">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center opacity-40 italic text-xs font-medium uppercase tracking-widest text-slate-500">
                    No active alerts
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map(n => (
                      <div key={n.id} className={cn("p-4 flex gap-3 transition-colors", !n.read ? "bg-emerald-50/30" : "bg-white")}>
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          n.type === 'approval' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                        )}>
                           {n.type === 'approval' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        </div>
                        <div className="min-w-0">
                           <div className="text-[11px] font-medium text-slate-800 leading-tight uppercase tracking-tight mb-0.5">{n.title}</div>
                           <p className="text-[10px] text-slate-500 font-medium leading-normal mb-1">{n.message}</p>
                           <div className="text-[8px] font-medium text-slate-300 uppercase tracking-widest">{n.time.includes('T') ? fmtDate(n.time) : n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </ScrollArea>
          </PopoverContent>
        </Popover>

        <button 
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2 md:gap-3 md:pl-4 md:border-l md:border-slate-100"
        >
          <div className="text-right hidden lg:block">
            <div className="text-[10px] font-medium text-slate-700 uppercase tracking-tight">{currentUser.firstName}</div>
            <div className="text-[8px] text-slate-400 font-medium uppercase tracking-widest">Account</div>
          </div>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-medium shadow-sm overflow-hidden shrink-0">
             {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : currentUser.firstName[0].toUpperCase()}
          </div>
        </button>
      </div>
    </div>
  );
}
