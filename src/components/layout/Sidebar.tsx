"use client";

import React from 'react';
import { User, Role } from '@/lib/types';
import { 
  LayoutDashboard, 
  Mountain, 
  ClipboardCheck, 
  Users, 
  Star, 
  BarChart3, 
  Settings, 
  LogOut,
  ShoppingBag,
  Plane,
  Tent,
  MapPin,
  CheckCircle2,
  Gem,
  Ticket,
  FileCode,
  MessageCircle,
  LifeBuoy,
  CreditCard,
  UserCheck,
  Heart,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface SidebarProps {
  currentUser: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ currentUser, currentPage, onNavigate, onLogout, isMobile }: SidebarProps) {
  const role = currentUser.role;
  const logoIcon = PlaceHolderImages.find(img => img.id === 'logo-icon');
  const brandText = PlaceHolderImages.find(img => img.id === 'brand-text');

  const adminItems = [
    { section: 'Operational Control', items: [
      { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { page: 'camps', label: 'All Camps', icon: Mountain },
      { page: 'approvals', label: 'Camp Approvals', icon: CheckCircle2 },
      { page: 'organizers', label: 'Partner Verifications', icon: MapPin },
      { page: 'memberships', label: 'Memberships', icon: Gem },
      { page: 'coupons', label: 'Coupons & Offers', icon: Ticket },
      { page: 'cms', label: 'Content Management', icon: FileCode },
      { page: 'bookings', label: 'All Bookings', icon: ClipboardCheck },
      { page: 'users', label: 'Manage Users', icon: Users },
      { page: 'reviews', label: 'Review Moderation', icon: Star },
      { page: 'support', label: 'Support & Disputes', icon: LifeBuoy },
      { page: 'communications', label: 'Communications', icon: MessageCircle },
      { page: 'reports', label: 'Reports', icon: BarChart3 },
    ]},
    { section: 'Personal Workspace', items: [
      { page: 'activities', label: 'My Expeditions', icon: Plane },
      { page: 'my_reviews', label: 'My Feedback', icon: Star },
      { page: 'settings', label: 'Account Settings', icon: Settings },
    ]}
  ];

  const organizerItems = [
    { page: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { page: 'camps', label: 'Inventory (My Camps)', icon: Mountain },
    { page: 'bookings', label: 'Booking Manifest', icon: ClipboardCheck },
    { page: 'organizer_customers', label: 'Explorers (Guests)', icon: UserCheck },
    { page: 'organizer_reports', label: 'Financial Reports', icon: CreditCard },
    { page: 'reviews', label: 'Guest Feedback', icon: Star },
    { page: 'settings', label: 'Business Profile', icon: Settings },
  ];

  const userItems = [
    { page: 'dashboard', label: 'Explorer Hub', icon: LayoutDashboard },
    { page: 'camps', label: 'Marketplace', icon: ShoppingBag },
    { page: 'activities', label: 'My Expeditions', icon: Plane },
    { page: 'wishlist', label: 'Wishlist', icon: Heart },
    { page: 'payments', label: 'Payment History', icon: Wallet },
    { page: 'my_reviews', label: 'My Reviews', icon: Star },
    { page: 'support', label: 'Support Tickets', icon: LifeBuoy },
    { page: 'settings', label: 'Account Settings', icon: Settings },
  ];

  return (
    <div id="sidebar" className={cn(
      "bg-white h-screen flex flex-col border-r border-slate-100 font-normal",
      isMobile ? "w-full" : "w-[280px] sticky top-0"
    )}>
      <div className="p-6 md:p-8 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-sm">
           <img src={logoIcon?.imageUrl} className="w-full h-full object-cover" data-ai-hint={logoIcon?.imageHint} alt="TrailWise Logo" />
        </div>
        <div className="min-w-0">
          <div className="h-6 w-32">
             <img src={brandText?.imageUrl} className="h-full w-auto object-contain" data-ai-hint={brandText?.imageHint} alt="TrailWise Brand" />
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={cn("w-1.5 h-1.5 rounded-full", role === 'admin' ? "bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.3)]" : "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]")} />
            <span className={cn("text-[9px] font-medium uppercase tracking-widest", role === 'admin' ? "text-orange-500" : "text-emerald-600")}>
              {role.toUpperCase()} PROFILE
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-6">
          {role === 'admin' ? (
            adminItems.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="text-[9px] font-medium text-slate-400 uppercase tracking-widest px-4 mb-3">{section.section}</h3>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.page;
                  return (
                    <button
                      key={item.page}
                      onClick={() => onNavigate(item.page)}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-sm font-medium transition-all group",
                        isActive 
                          ? "bg-emerald-50 text-emerald-800 shadow-sm" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <Icon size={16} className={cn(isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-700")} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            (role === 'organizer' ? organizerItems : userItems).map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all group",
                    isActive 
                      ? "bg-emerald-50 text-emerald-800 shadow-sm" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon size={18} className={cn(isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-700")} />
                  <span>{item.label}</span>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="p-4 md:p-6 mt-auto border-t border-slate-50 shrink-0">
        <div className="flex items-center gap-3 p-2 md:p-3 mb-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-white font-medium text-sm shadow-sm overflow-hidden border-2 border-white ring-1 ring-slate-100",
            role === 'admin' ? "bg-orange-500" : "bg-emerald-600"
          )}>
            {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : currentUser.firstName[0]}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-800 truncate uppercase tracking-tight leading-none mb-1">{currentUser.firstName}</div>
            <div className="text-[9px] text-slate-400 truncate font-medium uppercase tracking-widest">{role} Identity</div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
