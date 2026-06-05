'use client';

import React, { useState, useEffect } from 'react';
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
  Wallet,
  ChevronDown,
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  PauseCircle,
  FileText,
  Clock,
  LayoutGrid,
  HandCoins,
  Megaphone,
  Globe,
  Home,
  BookOpen,
  HelpCircle,
  Flag,
  EyeOff,
  Lock,
  IndianRupee,
  ClipboardList,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  currentUser: User;
  currentPage: string;
  pageParams?: any;
  onNavigate: (page: string, params?: any) => void;
  onLogout: () => void;
  toggleSidebar?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
}

// Helper component for simple navigation items
const NavItem = ({ item, isCollapsed, currentPage, currentParams, onNavigate }: {
  item: any;
  isCollapsed: boolean;
  currentPage: string;
  currentParams?: any;
  onNavigate: (page: string, params?: any) => void;
}) => {
  const Icon = item.icon;
  const isActive = currentPage === item.page && (!item.tab || (currentParams?.tab || 'all') === item.tab);

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
          <button onClick={() => onNavigate(item.page, item.tab ? { tab: item.tab } : { tab: 'all' })} className="w-full">
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
    <button onClick={() => onNavigate(item.page, item.tab ? { tab: item.tab } : undefined)} className="w-full">
      {navItemContent}
    </button>
  );
};

const NavGroup = ({ item, isCollapsed, currentPage, currentParams, onNavigate, toggleSidebar, isOpen, onToggle }: {
  item: any;
  isCollapsed: boolean;
  currentPage: string;
  currentParams?: any;
  onNavigate: (page: string, params?: any) => void;
  toggleSidebar?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const Icon = item.icon;
  const isActive = currentPage === item.page;

  const handleCollapsedClick = () => {
    onNavigate(item.page, item.tab ? { tab: item.tab } : undefined);
    if (toggleSidebar) {
      toggleSidebar();
    }
    onToggle();
  };

  return (
    <div className="space-y-1">
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCollapsedClick}
              className={cn(
                'flex items-center justify-center w-full text-sm font-medium transition-all group px-4 py-3',
                isActive
                  ? 'bg-emerald-50 text-emerald-800 rounded-lg shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg'
              )}
            >
              <Icon size={20} className={cn(isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600')} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md">
            {item.label}
          </TooltipContent>
        </Tooltip>
      ) : (
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center justify-between gap-4 w-full text-sm font-medium transition-all group px-4 py-3',
            isActive
              ? 'bg-emerald-50 text-emerald-800 rounded-lg shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg'
          )}
        >
          <span className="flex items-center gap-4">
            <Icon size={20} className={cn(isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600')} />
            <span>{item.label}</span>
          </span>
          <ChevronDown size={18} className={cn('transition-transform', isOpen ? 'rotate-180' : 'rotate-0')} />
        </button>
      )}

      {!isCollapsed && isOpen && (
        <div className="space-y-1 pl-10 pr-2">
          {item.children.map((child: any) => {
            const isChildActive = currentPage === child.page && (currentParams?.tab || 'all') === child.tab;
            const ChildIcon = child.icon;
            return (
              <button
                key={`${child.page}-${child.tab}`}
                onClick={() => onNavigate(child.page, { tab: child.tab })}
                className={cn(
                  'flex items-center gap-3 w-full text-sm font-medium transition-all rounded-lg px-3 py-2',
                  isChildActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <ChildIcon size={16} className={cn(isChildActive ? 'text-emerald-700' : 'text-slate-400')} />
                <span>{child.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function Sidebar({ currentUser, currentPage, pageParams, onNavigate, onLogout, toggleSidebar, isMobile, isCollapsed }: SidebarProps) {
  const role = currentUser.role;
  const logoIcon = PlaceHolderImages.find(img => img.id === 'logo-icon');
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const groupPages = ['approvals', 'organizers', 'users', 'bookings', 'payments', 'memberships', 'marketing', 'cms', 'support', 'reports', 'security'];
    if (groupPages.includes(currentPage)) {
      setOpenGroup(currentPage);
    }
  }, [currentPage, pageParams?.tab]);
  
  const brandText = PlaceHolderImages.find(img => img.id === 'brand-text');

  const adminItems = [
    { section: 'Operational Control', items: [
      { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { page: 'users', label: 'Users', icon: Users, children: [
          { page: 'users', tab: 'all', label: 'All Users', icon: Users },
          { page: 'users', tab: 'pending', label: 'Pending', icon: Clock },
          { page: 'users', tab: 'verified', label: 'Verified Users', icon: CheckCircle2 },
          { page: 'users', tab: 'suspended', label: 'Suspended', icon: PauseCircle },
          { page: 'users', tab: 'reports', label: 'Reports', icon: ShieldAlert },
        ]
      },
      { page: 'organizers', label: 'Organizers', icon: Shield, children: [
          { page: 'organizers', tab: 'all', label: 'All Organizers', icon: Users },
          { page: 'organizers', tab: 'pending', label: 'Pending', icon: ClipboardCheck },
          { page: 'organizers', tab: 'verified', label: 'Verified', icon: CheckCircle2 },
          { page: 'organizers', tab: 'suspended', label: 'Suspended', icon: PauseCircle },
          { page: 'organizers', tab: 'rejected', label: 'Rejected', icon: X },
        ]
      },
      { page: 'approvals', label: 'Camps', icon: Mountain, children: [
          { page: 'approvals', tab: 'pending', label: 'Pending Camps', icon: ClipboardCheck },
          { page: 'approvals', tab: 'approved', label: 'Approved', icon: CheckCircle2 },
          { page: 'approvals', tab: 'rejected', label: 'Rejected', icon: X },
          { page: 'approvals', tab: 'featured', label: 'Featured', icon: Star },
        ]
      },
      { page: 'bookings', label: 'Bookings', icon: ClipboardList, children: [
        { page: 'bookings', tab: 'all', label: 'All Bookings', icon: ClipboardList },
        { page: 'bookings', tab: 'pending', label: 'Pending', icon: Clock },
        { page: 'bookings', tab: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
        { page: 'bookings', tab: 'cancelled', label: 'Cancelled', icon: X },
        { page: 'bookings', tab: 'refunded', label: 'Refunded', icon: RotateCcw },
        { page: 'bookings', tab: 'disputed', label: 'Disputed', icon: ShieldAlert },
      ]
    },
      { page: 'payments', label: 'Payments', icon: CreditCard, children: [
          { page: 'payments', tab: 'transactions', label: 'Transactions', icon: Wallet },
          { page: 'payments', tab: 'refunds', label: 'Refunds', icon: CreditCard },
          { page: 'payments', tab: 'disputes', label: 'Disputes', icon: ShieldAlert },
        ]
      },
      { page: 'memberships', label: 'Memberships', icon: Gem, children: [
          { page: 'memberships', tab: 'plans', label: 'Plans', icon: LayoutGrid },
          { page: 'memberships', tab: 'subscribers', label: 'Subscribers', icon: Users },
          { page: 'memberships', tab: 'renewals', label: 'Renewals', icon: Clock },
        ]
      },
      { page: 'reviews', label: 'Reviews', icon: Star, children: [
          { page: 'reviews', tab: 'pending', label: 'Pending', icon: ClipboardCheck },
          { page: 'reviews', tab: 'approved', label: 'Reported', icon: Flag },
          { page: 'reviews', tab: 'hidden', label: 'Spam', icon: EyeOff },
        ]
      },
      { page: 'marketing', label: 'Marketing', icon: Megaphone, children: [
          { page: 'coupons', tab: 'coupons', label: 'Coupons', icon: Ticket },
          { page: 'communications', tab: 'campaigns', label: 'Campaigns', icon: MessageCircle },
          { page: 'cms', tab: 'seo', label: 'SEO', icon: Globe },
        ]
      },
      { page: 'cms', label: 'CMS', icon: FileCode, children: [
          { page: 'cms', tab: 'homepage', label: 'Homepage', icon: Home },
          { page: 'cms', tab: 'blogs', label: 'Blogs', icon: BookOpen },
          { page: 'cms', tab: 'faqs', label: 'FAQs', icon: HelpCircle },
        ]
      },
      { page: 'support', label: 'Support', icon: LifeBuoy, children: [
          { page: 'support', tab: 'all', label: 'Tickets', icon: MessageCircle },
          { page: 'support', tab: 'Open', label: 'Complaints', icon: Flag },
          { page: 'support', tab: 'In-Progress', label: 'Escalations', icon: Clock },
        ]
      },
      { page: 'reports', label: 'Analytics', icon: BarChart3, children: [
          { page: 'reports', tab: 'revenue', label: 'Revenue', icon: IndianRupee },
          { page: 'reports', tab: 'bookings', label: 'Bookings', icon: ClipboardList },
          { page: 'reports', tab: 'growth', label: 'User Growth', icon: Users },
          { page: 'reports', tab: 'performance', label: 'Camp Performance', icon: Mountain },
        ]
      },
      { page: 'security', label: 'Security', icon: ShieldCheck, children: [
          { page: 'security', tab: 'audit', label: 'Audit Logs', icon: FileText },
          { page: 'security', tab: 'sessions', label: 'Sessions', icon: Clock },
          { page: 'security', tab: 'access', label: 'Access Control', icon: Lock },
        ]
      },
      { page: 'communications', label: 'Communications', icon: MessageCircle },
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
                    {section.items.map(item => (
                      item.children ? (
                        <NavGroup
                          key={item.page}
                          item={item}
                          isCollapsed={!!isCollapsed}
                          currentPage={currentPage}
                          currentParams={pageParams}
                          onNavigate={onNavigate}
                          toggleSidebar={toggleSidebar}
                          isOpen={openGroup === item.page}
                          onToggle={() => setOpenGroup(openGroup === item.page ? null : item.page)}
                        />
                      ) : (
                        <NavItem key={item.page} item={item} isCollapsed={!!isCollapsed} currentPage={currentPage} currentParams={pageParams} onNavigate={onNavigate} />
                      )
                    ))}
                  </div>
                ))
              ) : (
                (role === 'organizer' ? organizerItems : userItems).map(item => <NavItem key={item.page} item={item} isCollapsed={!!isCollapsed} currentPage={currentPage} currentParams={pageParams} onNavigate={onNavigate} />)
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
