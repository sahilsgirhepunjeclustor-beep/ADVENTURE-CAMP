'use client';

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  currentUser: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
}

// Helper component for navigation items
const NavItem = ({ item, isCollapsed, currentPage, onNavigate }: {
  item: any;
  isCollapsed: boolean;
  currentPage: string;
  onNavigate: (page: string) => void;
}) => {
  const Icon = item.icon;
  const isActive = currentPage === item.page;

  const navItemContent = (
    <div className={cn(
      'flex items-center gap-4 w-full text-sm font-medium transition-all group',
      isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
      isActive
        ? 'bg-emerald-50 text-emerald-800 rounded-lg shadow-sm'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg'
    )}>
      <Icon size={isCollapsed ? 24 : 20} className={cn(isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600')} />
      {!isCollapsed && <span>{item.label}</span>}
    </div>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={() => onNavigate(item.page)} className="w-full">
            {navItemContent}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button onClick={() => onNavigate(item.page)} className="w-full">
      {navItemContent}
    </button>
  );
};

export default function Sidebar({ currentUser, currentPage, onNavigate, onLogout, isMobile, isCollapsed }: SidebarProps) {
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
      'bg-white h-screen flex flex-col border-r border-slate-100 font-normal transition-all duration-300',
      isMobile ? 'w-full' : (isCollapsed ? 'w-20' : 'w-[280px]'),
    )}>
      <div className={cn('p-4 flex items-center gap-3 shrink-0', isCollapsed ? 'justify-center' : 'px-6')}>
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-100 shadow-sm">
           <img src={logoIcon?.imageUrl} className="w-full h-full object-cover" alt="TrailWise Logo" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <div className="h-5">
               <img src={brandText?.imageUrl} className="h-full w-auto object-contain" alt="TrailWise Brand" />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <TooltipProvider delayDuration={100}>
          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-4">
              {role === 'admin' ? (
                adminItems.map((section, idx) => (
                  <div key={idx} className="space-y-1">
                    {!isCollapsed && <h3 className="text-[9px] font-medium text-slate-400 uppercase tracking-widest px-4 mb-2">{section.section}</h3>}
                    {section.items.map(item => <NavItem key={item.page} item={item} isCollapsed={!!isCollapsed} currentPage={currentPage} onNavigate={onNavigate} />)}
                  </div>
                ))
              ) : (
                (role === 'organizer' ? organizerItems : userItems).map(item => <NavItem key={item.page} item={item} isCollapsed={!!isCollapsed} currentPage={currentPage} onNavigate={onNavigate} />)
              )}
            </div>
          </ScrollArea>
        </TooltipProvider>
      </div>

      <div className="p-3 border-t border-slate-100 shrink-0 space-y-2">
         <button 
          onClick={onLogout}
          className={cn(
            'flex items-center gap-3 w-full text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all',
             isCollapsed ? 'px-3 py-3 justify-center rounded-lg' : 'px-4 py-3 rounded-lg'
            )}
        >
          <LogOut size={isCollapsed ? 20 : 20} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
        <div className={cn('flex items-center gap-3 cursor-pointer', isCollapsed ? 'justify-center py-2' : 'p-2 rounded-lg hover:bg-slate-100')}>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.firstName} className="rounded-full w-full h-full object-cover"/>
                ) : (
                    currentUser.firstName.charAt(0).toUpperCase()
                )}
            </div>
            {!isCollapsed && (
                <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">{currentUser.firstName} {currentUser.lastName}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
