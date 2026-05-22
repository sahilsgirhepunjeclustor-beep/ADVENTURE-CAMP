"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { User, AppData, Booking, Review, Activity, Camp } from '@/lib/types';
import { 
  getCurrentUser, 
  setCurrentUser, 
  getAppData, 
  saveAppData, 
  getAllApprovedCamps, 
  saveUsers,
  getUsers,
  getGlobalAppData,
  addUserNotification
} from '@/lib/store';
import AuthScreen from '@/components/auth/AuthScreen';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import AdminApprovals from '@/components/dashboard/AdminApprovals';
import AdminOrganizers from '@/components/dashboard/AdminOrganizers';
import AdminUsers from '@/components/dashboard/AdminUsers';
import AdminBookings from '@/components/dashboard/AdminBookings';
import AdminMemberships from '@/components/dashboard/AdminMemberships';
import AdminReviews from '@/components/dashboard/AdminReviews';
import AdminSupport from '@/components/dashboard/AdminSupport';
import CouponManagement from '@/components/dashboard/CouponManagement';
import ContentManagement from '@/components/dashboard/ContentManagement';
import CommunicationsHub from '@/components/dashboard/CommunicationsHub';
import ActionCenter from '@/components/dashboard/ActionCenter';
import OrganizerDashboard from '@/components/dashboard/OrganizerDashboard';
import OrganizerCamps from '@/components/dashboard/OrganizerCamps';
import OrganizerBookings from '@/components/dashboard/OrganizerBookings';
import OrganizerReports from '@/components/dashboard/OrganizerReports';
import OrganizerCustomers from '@/components/dashboard/OrganizerCustomers';
import OrganizerReviews from '@/components/dashboard/OrganizerReviews';
import UserDashboard from '@/components/dashboard/UserDashboard';
import UserWishlist from '@/components/dashboard/UserWishlist';
import UserPayments from '@/components/dashboard/UserPayments';
import UserSupport from '@/components/dashboard/UserSupport';
import CampCard from '@/components/marketplace/CampCard';
import CampDetails from '@/components/marketplace/CampDetails';
import CheckoutPage from '@/components/marketplace/CheckoutPage';
import SettingsPage from '@/components/dashboard/SettingsPage';
import ReviewsPage from '@/components/dashboard/ReviewsPage';
import ReportsPage from '@/components/dashboard/ReportsPage';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ChevronRight, Search, SlidersHorizontal, ArrowUpDown, X, Star, ArrowLeft, Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fmtDate, cn, uid } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageParams, setPageParams] = useState<any>(null);
  const [data, setData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampId, setSelectedCampId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Filtering & Discovery State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMarketTab, setActiveMarketTab] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [difficultyFilter, setDifficulty] = useState('All');
  const [familyOnly, setFamilyOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [minGroupSize, setMinGroupSize] = useState(0);
  const [maxDuration, setMaxDuration] = useState(30);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const session = getCurrentUser();
    if (session) {
      setUser(session);
      const appData = getAppData(session.email);
      setData(appData);
    }
    setIsLoading(false);
  }, [refreshKey]);

  const triggerRefresh = () => setRefreshKey(p => p + 1);

  const handleLogin = (u: User) => {
    setUser(u);
    const appData = getAppData(u.email);
    setData(appData);
    
    // Redirect unapproved organizers to audit page
    if (u.role === 'organizer' && !u.isApproved && !u.isRejected) {
      setCurrentPage('audit');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setData(null);
    toast({ title: 'Logged out', description: 'See you on your next adventure!' });
  };

  const onNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || null);
    if (params?.selectedId) {
      setSelectedCampId(params.selectedId);
    } else {
      setSelectedCampId(null);
    }
    window.scrollTo(0, 0);
  };

  const handleBookInitiate = (bookingData: Partial<Booking>) => {
    onNavigate('checkout', bookingData);
  };

  const handleConfirmBooking = (bookingData: Partial<Booking>, participants: any[]) => {
    if (!data || !user) return;
    const amount = bookingData.amount || 0;
    const newBooking: Booking = {
      id: Math.random().toString(36).slice(2, 9).toUpperCase(),
      customer: `${user.firstName} ${user.lastName}`,
      customerEmail: user.email,
      camp: bookingData.camp || '',
      campId: bookingData.campId || '',
      checkin: bookingData.checkin || '',
      checkout: bookingData.checkout || '',
      amount: amount,
      commissionAmount: amount * 0.10, 
      status: 'Confirmed',
      addedAt: new Date().toISOString(),
      participants: participants || []
    };

    const activity: Activity = {
      id: uid(),
      type: 'Booked',
      camp: bookingData.camp || 'Adventure',
      date: new Date().toISOString()
    };

    const updatedData = { 
      ...data, 
      bookings: [newBooking, ...data.bookings],
      activities: [activity, ...data.activities]
    };
    setData(updatedData);
    saveAppData(user.email, updatedData);

    const camp = getAllApprovedCamps().find(c => c.id === bookingData.campId);
    if (camp) {
      addUserNotification(camp.addedBy, {
        id: uid(),
        type: 'booking',
        title: 'New Booking Received!',
        message: `Explorer ${user.firstName} has booked "${bookingData.camp}".`,
        time: new Date().toISOString(),
        read: false
      });
    }

    toast({ title: 'Expedition Confirmed!', description: `Payment successful for ${bookingData.camp}.` });
    setCurrentPage('activities');
    triggerRefresh();
  };

  const handleCancelBooking = (bookingId: string) => {
    if (!data || !user) return;
    
    const bookingToCancel = data.bookings.find(b => b.id === bookingId);
    if (!bookingToCancel) return;

    const updatedBookings = data.bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'Cancelled' as const } : b
    );

    const activity: Activity = {
      id: uid(),
      type: 'Cancelled Trip',
      camp: bookingToCancel.camp,
      date: new Date().toISOString()
    };

    const updatedData = { 
      ...data, 
      bookings: updatedBookings,
      activities: [activity, ...data.activities]
    };
    
    setData(updatedData);
    saveAppData(user.email, updatedData);

    toast({ 
      variant: 'destructive',
      title: 'Trip Cancelled', 
      description: `Your booking for ${bookingToCancel.camp} has been cancelled.` 
    });
    triggerRefresh();
  };

  const handleAddReview = (review: Review) => {
    if (!data || !user) return;
    
    const activity: Activity = {
      id: uid(),
      type: 'Reviewed',
      camp: review.camp,
      date: new Date().toISOString()
    };

    const updatedData = { 
      ...data, 
      reviews: [review, ...data.reviews],
      activities: [activity, ...data.activities]
    };
    setData(updatedData);
    saveAppData(user.email, updatedData);
    triggerRefresh();
  };

  const toggleWishlist = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!data || !user) return;
    
    const currentWishlist = data.wishlist || [];
    const isWishlisted = currentWishlist.includes(id);
    const updatedWishlist = isWishlisted 
      ? currentWishlist.filter(item => item !== id) 
      : [...currentWishlist, id];
    
    const updatedData = { ...data, wishlist: updatedWishlist };
    setData(updatedData);
    saveAppData(user.email, updatedData);
    
    toast({ title: isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist' });
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setUser(updatedUser);
    setCurrentUser(updatedUser);
    const allUsers = getUsers();
    allUsers[updatedUser.email.toLowerCase()] = updatedUser;
    saveUsers(allUsers);
    toast({ title: 'Profile Updated', description: 'Your changes have been saved successfully.' });
    triggerRefresh();
  };

  const filteredAndSortedCamps = useMemo(() => {
    const allApproved = getAllApprovedCamps();
    const globalData = getGlobalAppData();
    
    const bookingCounts: Record<string, number> = {};
    globalData.allBookings.forEach(b => {
      bookingCounts[b.campId] = (bookingCounts[b.campId] || 0) + 1;
    });

    return allApproved
      .filter(camp => {
        if (camp.status !== 'approved' || camp.isHidden) return false;

        const matchesSearch = 
          camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          camp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          camp.organizer.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesPrice = camp.price >= priceRange[0] && camp.price <= priceRange[1];
        const matchesDifficulty = difficultyFilter === 'All' || camp.difficulty === difficultyFilter;
        const matchesFamily = familyOnly ? camp.familyFriendly : true;
        const matchesRating = (camp.rating || 5) >= minRating;
        const matchesGroupSize = (camp.capacity || 0) >= minGroupSize;
        const matchesTab = activeMarketTab === 'All' || camp.category === activeMarketTab;
        const matchesDuration = camp.duration <= maxDuration;
        const matchesDate = !dateFilter || new Date(camp.startDate) >= new Date(dateFilter);

        return matchesSearch && matchesPrice && matchesDifficulty && matchesFamily && matchesRating && matchesGroupSize && matchesTab && matchesDuration && matchesDate;
      })
      .sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;

        switch (sortBy) {
          case 'price_low': return a.price - b.price;
          case 'price_high': return b.price - a.price;
          case 'top_rated': return (b.rating || 5) - (a.rating || 5);
          case 'most_booked': return (bookingCounts[b.id] || 0) - (bookingCounts[a.id] || 0);
          case 'trending': return (b.occupancy || 0) - (a.occupancy || 0);
          case 'newest':
          default:
            return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        }
      });
  }, [searchQuery, sortBy, priceRange, difficultyFilter, familyOnly, minRating, minGroupSize, maxDuration, dateFilter, activeMarketTab, refreshKey]);

  if (isLoading) return null;
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const clearAllFilters = () => {
    setSearchQuery('');
    setDifficulty('All');
    setFamilyOnly(false);
    setMinRating(0);
    setPriceRange([0, 50000]);
    setMaxDuration(30);
    setDateFilter('');
    setMinGroupSize(0);
    setActiveMarketTab('All');
  };

  const renderContent = () => {
    if (selectedCampId) {
      const allApproved = getAllApprovedCamps();
      const camp = allApproved.find(c => c.id === selectedCampId);
      if (camp) return (
        <CampDetails 
          camp={camp} 
          onBack={() => setSelectedCampId(null)} 
          onBook={handleBookInitiate}
          reviews={data?.reviews.filter(r => r.campId === camp.id) || []}
          onAddReview={handleAddReview}
          currentUser={user}
          isWishlisted={(data?.wishlist || []).includes(camp.id)}
          onToggleWishlist={toggleWishlist}
        />
      );
    }

    const backToDashboard = () => onNavigate('dashboard');

    switch (currentPage) {
      case 'dashboard':
        if (user.role === 'admin') return <AdminDashboard onNavigate={onNavigate} currentUser={user} data={data!} />;
        if (user.role === 'organizer') return <OrganizerDashboard onNavigate={onNavigate} currentUser={user} data={data!} />;
        return <UserDashboard onNavigate={onNavigate} currentUser={user} data={data!} />;
      
      case 'approvals':
        if (user.role !== 'admin') return null;
        return <AdminApprovals onBack={backToDashboard} />;
      
      case 'organizers':
        if (user.role !== 'admin') return null;
        return <AdminOrganizers onBack={backToDashboard} />;

      case 'memberships':
        if (user.role !== 'admin') return null;
        return <AdminMemberships onBack={backToDashboard} />;

      case 'coupons':
        if (user.role !== 'admin') return null;
        return <CouponManagement onBack={backToDashboard} />;

      case 'cms':
        if (user.role !== 'admin') return null;
        return <ContentManagement onBack={backToDashboard} />;

      case 'communications':
        if (user.role !== 'admin') return null;
        return <CommunicationsHub onBack={backToDashboard} />;

      case 'users':
        if (user.role !== 'admin') return null;
        return <AdminUsers onBack={backToDashboard} />;

      case 'support':
        if (user.role === 'admin') return <AdminSupport onBack={backToDashboard} />;
        return <UserSupport currentUser={user} onBack={backToDashboard} />;
      
      case 'action_center':
        if (user.role !== 'admin') return null;
        return <ActionCenter currentUser={user} onNavigate={onNavigate} onBack={backToDashboard} />;

      case 'bookings':
        if (user.role === 'admin') return <AdminBookings initialFilter={pageParams?.filter || 'All'} onBack={backToDashboard} />;
        return <OrganizerBookings currentUser={user} onBack={backToDashboard} onRefresh={triggerRefresh} />;

      case 'wishlist':
        return <UserWishlist currentUser={user} data={data!} onBack={backToDashboard} onNavigate={onNavigate} onToggleWishlist={toggleWishlist} />;

      case 'payments':
        return <UserPayments currentUser={user} data={data!} onBack={backToDashboard} />;

      case 'organizer_reports':
        return <OrganizerReports currentUser={user} data={data!} onBack={backToDashboard} />;

      case 'organizer_customers':
        return <OrganizerCustomers currentUser={user} data={data!} onBack={backToDashboard} />;

      case 'checkout':
        return <CheckoutPage bookingData={pageParams} onBack={() => setSelectedCampId(pageParams.campId)} onConfirm={handleConfirmBooking} currentUser={user} />;

      case 'reports':
        return <ReportsPage onBack={backToDashboard} />;

      case 'camps':
        if (user.role === 'organizer') return <OrganizerCamps currentUser={user} />;
        
        return (
          <div className="space-y-6 animate-in fade-in duration-700 font-sans">
            <div className="bg-white p-4 md:p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex items-center gap-4 flex-1 w-full">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={backToDashboard} 
                  className="rounded-full h-12 w-12 border-slate-200 shadow-sm hover:bg-slate-50 shrink-0"
                >
                  <ArrowLeft size={20} className="text-slate-600" />
                </Button>
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by location, activity or organizer..." 
                    className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-medium text-sm text-slate-700"
                  />
                </div>
              </div>

              <div className="flex gap-3 w-full lg:w-auto">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex-1 lg:flex-none h-14 px-6 rounded-2xl border-slate-200 font-medium text-[11px] uppercase tracking-widest gap-2 bg-white hover:bg-slate-50 text-slate-600">
                      <SlidersHorizontal size={16} /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[400px] sm:w-[450px] p-0 border-none shadow-2xl font-sans">
                    <SheetHeader className="bg-[#153c1c] p-8 text-white">
                      <SheetTitle className="text-xl font-medium uppercase tracking-tight text-white">Discovery Filters</SheetTitle>
                      <SheetDescription className="text-green-200/60 font-medium uppercase text-[10px] tracking-widest mt-1.5">Refine your wilderness exploration</SheetDescription>
                    </SheetHeader>
                    <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-180px)] custom-scrollbar">
                      <div className="space-y-5">
                        <Label className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Expedition Cost (₹)</Label>
                        <Slider 
                          value={priceRange} 
                          max={50000} 
                          step={500} 
                          onValueChange={setPriceRange}
                          className="py-4"
                        />
                        <div className="flex justify-between text-[11px] font-medium text-slate-600">
                          <span>₹0</span>
                          <span className="bg-primary/10 px-3 py-1 rounded-lg text-primary">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                          <span>₹50,000+</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Available From</Label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
                          <Input 
                            type="date" 
                            value={dateFilter}
                            onChange={e => setDateFilter(e.target.value)}
                            className="rounded-xl h-12 border-slate-100 bg-slate-50 font-medium text-xs pl-10 text-slate-700"
                          />
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Max Duration</Label>
                          <span className="text-xs font-medium text-primary">{maxDuration} Days</span>
                        </div>
                        <Slider 
                          value={[maxDuration]} 
                          max={30} 
                          min={1}
                          step={1} 
                          onValueChange={(v) => setMaxDuration(v[0])}
                          className="py-4"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Difficulty</Label>
                          <Select value={difficultyFilter} onValueChange={setDifficulty}>
                            <SelectTrigger className="rounded-xl h-12 border-slate-100 bg-slate-50 font-medium text-xs uppercase text-slate-600">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                              <SelectItem value="All" className="text-xs font-medium uppercase">All Levels</SelectItem>
                              <SelectItem value="Easy" className="text-xs font-medium uppercase">Easy</SelectItem>
                              <SelectItem value="Moderate" className="text-xs font-medium uppercase">Moderate</SelectItem>
                              <SelectItem value="Challenging" className="text-xs font-medium uppercase">Challenging</SelectItem>
                              <SelectItem value="Expert" className="text-xs font-medium uppercase">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Min. Rating</Label>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map(r => (
                              <button 
                                key={r}
                                onClick={() => setMinRating(r === minRating ? 0 : r)}
                                className={cn(
                                  "flex-1 h-10 rounded-xl border flex items-center justify-center transition-all",
                                  minRating >= r ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-slate-100 text-slate-300"
                                )}
                              >
                                <Star size={12} fill={minRating >= r ? "currentColor" : "none"} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6 pt-4 border-t border-slate-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-[11px] font-medium uppercase tracking-tight text-slate-700">Family Friendly</Label>
                            <p className="text-[9px] font-medium text-slate-400 uppercase">Camps safe for children</p>
                          </div>
                          <Checkbox checked={familyOnly} onCheckedChange={(v: boolean) => setFamilyOnly(v)} className="h-6 w-6 rounded-lg" />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Min. Group Size</Label>
                          <div className="relative">
                             <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
                             <Input 
                                type="number" 
                                value={minGroupSize || ''}
                                placeholder="e.g. 5 pax" 
                                className="rounded-xl h-12 bg-slate-50 border-none font-medium pl-10 text-slate-700"
                                onChange={e => setMinGroupSize(Number(e.target.value))}
                             />
                          </div>
                        </div>
                      </div>
                    </div>
                    <SheetFooter className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                       <Button variant="ghost" onClick={clearAllFilters} className="flex-1 h-12 rounded-xl font-medium uppercase text-[10px] text-slate-400">Reset</Button>
                       <Button className="flex-[2] h-12 rounded-xl bg-primary hover:bg-accent font-medium uppercase text-[10px] shadow-xl text-white border-none">Apply</Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1 lg:w-48 h-14 rounded-2xl border-slate-200 font-medium text-[11px] uppercase tracking-widest gap-2 bg-white text-slate-600">
                    <ArrowUpDown size={16} /> <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="newest" className="text-xs font-medium uppercase">Newest</SelectItem>
                    <SelectItem value="most_booked" className="text-xs font-medium uppercase">Most Booked</SelectItem>
                    <SelectItem value="trending" className="text-xs font-medium uppercase">Trending</SelectItem>
                    <SelectItem value="top_rated" className="text-xs font-medium uppercase">Top Rated</SelectItem>
                    <SelectItem value="price_low" className="text-xs font-medium uppercase">Price: Low to High</SelectItem>
                    <SelectItem value="price_high" className="text-xs font-medium uppercase">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
              {['All', 'Mountain', 'River', 'Forest', 'Desert', 'Beach', 'Adventure'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveMarketTab(tab)}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-[10px] font-medium uppercase tracking-widest transition-all whitespace-nowrap",
                    activeMarketTab === tab ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
                  )}
                >
                  {tab === 'All' ? 'Explore All' : tab}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center px-2 py-4">
               <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                  Found {filteredAndSortedCamps.length} expeditions
               </div>
               {(searchQuery || difficultyFilter !== 'All' || familyOnly || minRating > 0 || maxDuration < 30 || dateFilter || minGroupSize > 0) && (
                 <button onClick={clearAllFilters} className="text-[9px] font-medium text-primary uppercase flex items-center gap-1.5 hover:underline">
                   <X size={12} /> Clear Filters
                 </button>
               )}
            </div>

            {filteredAndSortedCamps.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[40px] border border-dashed border-slate-200">
                 <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Search size={48} className="text-slate-200" />
                 </div>
                 <h3 className="text-lg font-medium text-slate-800 uppercase tracking-tight">No results matched your search</h3>
                 <p className="text-xs text-slate-400 font-medium mt-2 uppercase tracking-widest">Try adjusting your filters or keywords</p>
                 <Button variant="outline" onClick={clearAllFilters} className="mt-8 h-12 px-10 rounded-2xl border-primary text-primary font-medium uppercase text-[10px] tracking-widest">Show All</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
                {filteredAndSortedCamps.map(camp => (
                  <CampCard 
                    key={camp.id} 
                    camp={camp} 
                    onClick={setSelectedCampId} 
                    onBook={(b) => handleBookInitiate({ campId: b.id, camp: b.name, amount: b.price, checkin: b.startDate, checkout: b.endDate })} 
                    isWishlisted={(data?.wishlist || []).includes(camp.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'activities':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={backToDashboard} 
                className="rounded-full h-10 w-10 border-slate-200 shadow-sm hover:bg-slate-50 shrink-0"
              >
                <ArrowLeft size={18} className="text-slate-600" />
              </Button>
              <h2 className="text-2xl font-medium uppercase tracking-tight text-slate-800">My Upcoming Trips</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              {data?.bookings.map(b => (
                <div key={b.id} className="bg-white p-6 rounded-[24px] border border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6">
                   <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-3xl shrink-0">🏕️</div>
                   <div className="flex-1">
                     <div className="flex justify-between items-start">
                       <div className="text-lg font-medium text-slate-800 uppercase tracking-tight">{b.camp}</div>
                       <Badge variant="outline" className={cn(
                         "text-[9px] font-medium uppercase px-2 py-0.5 rounded-lg",
                         b.status === 'Confirmed' ? 'border-green-200 text-green-700 bg-green-50' : 
                         b.status === 'Cancelled' ? 'border-red-200 text-red-700 bg-red-50' : 
                         'border-amber-200 text-amber-700 bg-amber-50'
                       )}>
                         {b.status}
                       </Badge>
                     </div>
                     <div className="text-sm text-slate-500 font-medium mt-1">{fmtDate(b.checkin)} - {fmtDate(b.checkout)}</div>
                     <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg h-9 px-4 font-medium uppercase text-[9px] tracking-widest border-slate-200 text-slate-500">Vouchers</Button>
                        {b.status !== 'Cancelled' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleCancelBooking(b.id)}
                            className="rounded-lg h-9 px-4 font-medium uppercase text-[9px] tracking-widest text-destructive border-destructive/20 hover:bg-destructive/5"
                          >
                            Cancel
                          </Button>
                        )}
                     </div>
                   </div>
                </div>
              ))}
              {(!data?.bookings || data.bookings.length === 0) && (
                <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-border/50 opacity-40 font-medium italic text-xl uppercase tracking-widest text-slate-400">
                  No trips booked yet
                </div>
              )}
            </div>
          </div>
        );

      case 'settings':
        return (
          <SettingsPage 
            currentUser={user} 
            onUpdateProfile={handleUpdateProfile} 
            onBack={backToDashboard} 
            onLogout={handleLogout} 
          />
        );

      case 'reviews':
      case 'my_reviews':
        if (user.role === 'admin' && currentPage === 'reviews') return <AdminReviews onBack={backToDashboard} />;
        if (user.role === 'organizer' && currentPage === 'reviews') return <OrganizerReviews currentUser={user} onBack={backToDashboard} />;
        return <ReviewsPage currentUser={user} data={data!} onBack={backToDashboard} />;

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full py-32 opacity-30 grayscale">
            <div className="text-8xl mb-6">🚧</div>
            <h3 className="text-xl font-medium uppercase tracking-widest">Under Development</h3>
            <p className="text-sm font-medium mt-2">Coming soon in v2.5</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen font-sans font-normal">
      <div className="hidden md:block">
        <Sidebar currentUser={user} currentPage={currentPage} onNavigate={onNavigate} onLogout={handleLogout} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar 
          currentUser={user} 
          currentPage={currentPage} 
          onNavigate={onNavigate} 
          onLogout={handleLogout} 
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1440px] mx-auto w-full relative no-scrollbar">
          {renderContent()}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
