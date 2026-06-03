"use client";

import React, { useState } from 'react';
import { Camp, Booking, Batch, Review, User } from '@/lib/types';
import { fmt, stars, uid, fmtDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Share2, 
  Heart, 
  Users, 
  Zap, 
  Sun,
  Clock,
  CheckCircle2,
  Utensils,
  Navigation,
  Info,
  ShieldAlert,
  ShieldCheck,
  Send,
  ChevronDown,
  Play,
  CloudSun,
  Backpack,
  Video,
  Globe,
  AlertCircle,
  Reply
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/hooks/use-toast';

interface CampDetailsProps {
  camp: Camp;
  onBack: () => void;
  onBook: (booking: Partial<Booking>) => void;
  reviews: Review[];
  onAddReview: (review: Review) => void;
  currentUser: User;
  isWishlisted: boolean;
  onToggleWishlist: (id: string, e?: React.MouseEvent) => void;
}

export default function CampDetails({ 
  camp, 
  onBack, 
  onBook, 
  reviews, 
  onAddReview, 
  currentUser,
  isWishlisted,
  onToggleWishlist
}: CampDetailsProps) {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(camp.batches?.[0] || null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);

  const basePrice = selectedBatch?.price || camp.price;
  const totalPrice = (basePrice * adults) + (basePrice * 0.7 * children) + 250;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    const review: Review = {
      id: uid(),
      customer: `${currentUser.firstName} ${currentUser.lastName}`,
      customerEmail: currentUser.email,
      camp: camp.name,
      campId: camp.id,
      rating: newRating,
      text: newReviewText,
      time: new Date().toISOString(),
      status: 'approved'
    };

    onAddReview(review);
    setNewReviewText('');
    setNewRating(5);
    toast({ title: 'Review Posted!', description: 'Thank you for sharing your experience.' });
  };

  const isCutoffPassed = selectedBatch?.cutoffDate && new Date() > new Date(selectedBatch.cutoffDate);
  const isSoldOut = selectedBatch?.status === 'Sold Out';
  const seatsLeft = selectedBatch ? selectedBatch.maxCapacity - selectedBatch.currentBookings : 0;

  const mapSrc = camp.coordinates?.lat && camp.coordinates?.lng 
    ? `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d${camp.coordinates.lng}!3d${camp.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1709400000000!5m2!1sen!2sin`
    : `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3324.2384725455823!2d77.58434527581457!3d34.15259797311754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38f1f1d1f0f0f0f1%3A0x0!2zMzTCsDA5JzA5LjMiTiA3N8KwMzUnMTEuOSJF!5e0!3m2!1sen!2sin!4v1709400000000!5m2!1sen!2sin`;

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 pb-32 animate-in fade-in duration-1000 font-sans font-normal no-scrollbar overflow-x-hidden">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-10 w-10 md:h-12 md:w-12 border-slate-200 shadow-sm hover:bg-slate-50">
            <ArrowLeft size={20} className="text-slate-600" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-medium text-slate-800 leading-none tracking-tight uppercase">
              {camp.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex text-amber-500 text-xs">{stars(5)}</div>
              <span className="text-[9px] md:text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                {camp.rating} / 5.0 Rating • Professional Service
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 md:gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none rounded-2xl h-10 md:h-11 px-4 md:px-6 border-slate-200 font-medium text-[9px] md:text-[10px] uppercase tracking-widest gap-2">
            <Share2 size={16} /> Share
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onToggleWishlist(camp.id)}
            className={cn(
              "flex-1 md:flex-none rounded-2xl h-10 md:h-11 px-4 md:px-6 border-slate-200 font-medium text-[9px] md:text-[10px] uppercase tracking-widest gap-2 transition-all",
              isWishlisted ? "bg-rose-50 border-rose-200 text-rose-500" : "text-slate-400 hover:text-rose-500"
            )}
          >
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} /> {isWishlisted ? 'Saved' : 'Wishlist'}
          </Button>
        </div>
      </div>

      {/* Cinematic Hero Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-8 h-[300px] md:h-[550px]">
        <div 
          onClick={() => setIsGalleryOpen(true)}
          className="md:col-span-8 rounded-[24px] md:rounded-[32px] overflow-hidden relative shadow-2xl group cursor-pointer"
        >
          <img src={camp.campImages[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
             <Badge className="bg-primary/90 text-white font-medium uppercase text-[9px] md:text-[10px] tracking-widest px-3 md:px-4 py-1 md:py-1.5 rounded-xl mb-2 md:mb-3 shadow-xl">
               {camp.category} Expedition
             </Badge>
             <div className="flex items-center gap-2 text-white">
                <MapPin size={16} className="text-orange-500" />
                <span className="text-xs md:sm font-medium uppercase tracking-widest">{camp.location}</span>
             </div>
          </div>
        </div>
        <div className="hidden md:grid md:col-span-4 grid-rows-2 gap-2 md:gap-4">
          <div 
            onClick={() => setIsGalleryOpen(true)}
            className="rounded-[32px] overflow-hidden shadow-lg group cursor-pointer relative"
          >
            <img src={camp.campImages[1]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            {camp.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors">
                <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white ring-8 ring-white/10">
                   <Play size={24} fill="currentColor" />
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-4">
             <div 
               onClick={() => setIsGalleryOpen(true)}
               className="rounded-[28px] overflow-hidden shadow-lg group cursor-pointer"
             >
               <img src={camp.campImages[2]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
             </div>
             <div 
               onClick={() => setIsGalleryOpen(true)}
               className="rounded-[28px] overflow-hidden shadow-lg relative group cursor-pointer"
             >
                <img src={camp.campImages[3]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center transition-all hover:bg-black/40">
                  <span className="text-white font-medium text-[9px] uppercase tracking-widest border border-white/30 px-3 py-1.5 rounded-xl">+ More Photos</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Status Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-8">
        {[
          { icon: Users, label: 'TOTAL CAPACITY', val: `${camp.capacity} PAX`, color: 'bg-emerald-50 text-primary' },
          { icon: Sun, label: 'AVG. TEMP', val: '14°C - 20°C', color: 'bg-orange-50 text-orange-600' },
          { icon: Zap, label: 'DIFFICULTY', val: camp.difficulty.toUpperCase(), color: 'bg-blue-50 text-blue-600' },
          { icon: Clock, label: 'DURATION', val: `${camp.duration} DAYS`, color: 'bg-green-50 text-green-600' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-6 border border-slate-100 flex items-center gap-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
             <div className={cn("w-10 h-10 md:w-14 md:h-14 rounded-[20px] flex items-center justify-center shrink-0", item.color)}>
                <item.icon size={18} className="md:size-5" />
             </div>
             <div>
                <p className="text-[9px] font-medium uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</p>
                <p className="text-sm md:text-base font-medium text-slate-800 tracking-tight leading-tight">{item.val}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4 md:px-8">
        <div className="lg:col-span-8 space-y-12">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-transparent border-b border-slate-100 w-full justify-start rounded-none h-auto p-0 mb-8 gap-4 md:gap-10 overflow-x-auto no-scrollbar">
              {['OVERVIEW', 'ITINERARY', 'LOGISTICS', 'FOOD', 'SAFETY', 'REVIEWS'].map(t => (
                <TabsTrigger 
                  key={t} 
                  value={t.toLowerCase()} 
                  className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium text-[11px] uppercase tracking-widest pb-4 px-0 transition-all text-slate-400 data-[state=active]:text-slate-800 whitespace-nowrap"
                >
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-12 mt-0">
              <section className="space-y-6">
                <h2 className="text-xl md:text-2xl font-medium text-slate-800 uppercase tracking-tight">CAMP INFRASTRUCTURE</h2>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-normal">{camp.description}</p>
              </section>

              {camp.videoUrl && (
                <section className="space-y-6">
                   <h2 className="text-xl font-medium text-slate-800 uppercase tracking-tight flex items-center gap-3">
                      <Video size={20} className="text-primary" /> Expedition Trailer
                   </h2>
                   <div className="aspect-video rounded-[32px] overflow-hidden border border-slate-100 shadow-xl bg-slate-900">
                      <iframe 
                        className="w-full h-full"
                        src={camp.videoUrl} 
                        title="Expedition trailer" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen
                      ></iframe>
                   </div>
                </section>
              )}

              <section className="space-y-6">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl md:text-2xl font-medium text-slate-800 uppercase tracking-tight">Geo Location & Coordinates</h2>
                    {camp.coordinates?.lat && (
                      <div className="flex gap-3">
                        <Badge variant="outline" className="bg-slate-50 border-slate-200 text-[10px] font-medium py-1 px-3 rounded-lg text-slate-500 uppercase">LAT: {camp.coordinates.lat}</Badge>
                        <Badge variant="outline" className="bg-slate-50 border-slate-200 text-[10px] font-medium py-1 px-3 rounded-lg text-slate-500 uppercase">LNG: {camp.coordinates.lng}</Badge>
                      </div>
                    )}
                 </div>
                 <div className="h-[400px] w-full rounded-[32px] overflow-hidden border border-slate-100 shadow-lg relative bg-slate-50">
                    <iframe 
                      src={mapSrc}
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                 </div>
              </section>
            </TabsContent>

            <TabsContent value="itinerary" className="mt-0">
               <section className="space-y-8">
                 <h2 className="text-2xl font-medium text-slate-800 uppercase tracking-tight mb-8">Adventure Timeline</h2>
                 <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-10 space-y-12 shadow-sm">
                    {camp.itinerary.map((day, idx) => (
                      <div key={idx} className="relative pl-10 md:pl-14 before:absolute before:left-[19px] before:top-4 before:bottom-0 before:w-px before:bg-slate-100 last:before:hidden">
                         <div className="absolute left-0 top-0 w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-[#0d2a1d] text-white flex items-center justify-center font-medium text-xs shadow-xl z-10">
                            {day.day}
                         </div>
                         <div>
                            <h3 className="text-lg md:text-xl font-medium text-slate-800 uppercase tracking-tight leading-none mb-3">{day.title}</h3>
                            <p className="text-xs md:sm text-slate-500 font-normal leading-relaxed max-w-2xl">{day.description}</p>
                         </div>
                      </div>
                    ))}
                 </div>
               </section>
            </TabsContent>

            <TabsContent value="logistics" className="mt-0 space-y-10">
               <section className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-24 h-24 rounded-[32px] bg-amber-50 flex items-center justify-center text-amber-500 shrink-0 shadow-inner">
                     <CloudSun size={48} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                     <h4 className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-1.5">Weather Intelligence</h4>
                     <p className="text-lg font-medium text-slate-800 tracking-tight leading-snug">{camp.weatherInfo}</p>
                  </div>
               </section>

               <section className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-sm">
                  <h2 className="text-2xl font-medium text-slate-800 uppercase tracking-tight mb-8">Technical Equipment (Included)</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     {camp.equipment.map((eq, i) => (
                       <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 transition-transform hover:translate-y-[-2px]">
                          <Backpack className="text-primary" size={20} />
                          <span className="text-xs font-medium uppercase tracking-tight text-slate-600">{eq}</span>
                       </div>
                     ))}
                  </div>
               </section>
            </TabsContent>

            <TabsContent value="food" className="mt-0">
               <div className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-sm">
                  <h2 className="text-2xl font-medium text-slate-800 uppercase tracking-tight mb-8">Wilderness Cuisines</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                     <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <Utensils className="text-primary mb-4" size={24} />
                        <h4 className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-2">Meals Included</h4>
                        <div className="flex flex-wrap gap-2">
                           {camp.food.map((f, i) => (
                             <Badge key={i} className="bg-white text-slate-700 border-slate-200 text-[9px] font-medium uppercase tracking-widest">{f}</Badge>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="safety" className="mt-0 space-y-8">
               <div className="bg-rose-900 rounded-[32px] p-8 md:p-10 text-white shadow-2xl">
                  <h2 className="text-2xl font-medium uppercase tracking-tight mb-8 flex items-center gap-3 text-white">
                     <ShieldAlert size={28} className="text-rose-400" /> Critical Safety Instructions
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                     {camp.safetyInstructions.map((ins, i) => (
                       <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-4">
                          <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 font-medium shrink-0">{i+1}</div>
                          <p className="text-sm font-medium leading-relaxed text-white/90">{ins}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-0 space-y-8">
               <div className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-sm">
                  <h2 className="text-2xl font-medium text-slate-800 uppercase tracking-tight mb-8">Traveler Feedback</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                     {reviews.length === 0 ? (
                       <div className="col-span-full py-10 text-center text-slate-400 font-medium italic uppercase tracking-widest">No reviews yet</div>
                     ) : (
                       reviews.map(r => (
                         <div key={r.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                            <div className="flex justify-between items-start">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
                                     {r.customer[0]}
                                  </div>
                                  <div>
                                     <p className="text-xs font-medium uppercase tracking-tight text-slate-700">{r.customer}</p>
                                     <p className="text-[8px] font-medium text-slate-400 uppercase">{new Date(r.time).toLocaleDateString()}</p>
                                  </div>
                               </div>
                               <div className="text-amber-500 text-[8px]">{stars(r.rating)}</div>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"{r.text}"</p>
                            
                            {r.reply && (
                               <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-2 mt-2">
                                  <div className="flex items-center gap-2 text-[9px] font-medium text-primary uppercase tracking-widest">
                                     <Reply size={12} /> Organizer's Response
                                  </div>
                                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{r.reply}</p>
                               </div>
                            )}
                         </div>
                       ))
                     )}
                  </div>

                  <form onSubmit={handleSubmitReview} className="space-y-4 max-w-xl mx-auto">
                    <h3 className="text-sm font-medium uppercase tracking-widest text-slate-800 text-center mb-6">Rate Your Adventure</h3>
                    <div className="flex justify-center gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setNewRating(s)} className="p-1">
                          <Star size={22} className={cn(s <= newRating ? "text-amber-500 fill-amber-500" : "text-slate-200")} />
                        </button>
                      ))}
                    </div>
                    <Textarea value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} placeholder="Write your genuine review here..." className="rounded-2xl min-h-[100px] border-slate-100 bg-slate-50" required />
                    <Button type="submit" className="w-full h-12 rounded-2xl font-medium uppercase tracking-widest gap-2 bg-primary text-white shadow-xl shadow-primary/10 border-none">
                      <Send size={16} /> Post Review
                    </Button>
                  </form>
               </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Conversion Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-2xl lg:sticky lg:top-28 space-y-7 mx-0 md:mx-0">
            <div className="relative">
               <Badge className="absolute -top-3 right-0 bg-orange-100 text-orange-600 border-none font-medium uppercase text-[8px] tracking-[0.1em] px-2 py-0.5 rounded-lg z-10">
                 OFFER APPLIED
               </Badge>
               <h3 className="text-[26px] font-medium text-slate-800 leading-[1.1] tracking-tight uppercase">
                 BOOKING {fmt(selectedBatch?.price || camp.price)}
               </h3>
               <div className="mt-4 space-y-2">
                  {camp.discounts?.map((disc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[9px] text-emerald-600 font-medium uppercase tracking-widest leading-tight">
                       <Zap size={10} fill="currentColor" /> {disc}
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">SELECT EXPEDITION BATCH</label>
                  <div className="relative">
                    <select 
                      value={selectedBatch?.id || ''} 
                      onChange={(e) => setSelectedBatch(camp.batches.find(b => b.id === e.target.value) || null)}
                      className="w-full h-[60px] rounded-[20px] bg-slate-50 border border-slate-100 px-5 font-medium text-sm uppercase tracking-tight outline-none appearance-none cursor-pointer pr-10 text-slate-700"
                    >
                      {camp.batches.map(b => (
                        <option key={b.id} value={b.id} disabled={b.status === 'Sold Out'}>{b.dates}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
               </div>

               {selectedBatch && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-medium text-slate-400 uppercase">Availability</span>
                        <Badge className={cn(
                           "border-none text-[8px] font-medium uppercase px-2 py-0.5 rounded-lg",
                           isSoldOut ? "bg-red-100 text-red-600" : seatsLeft < 5 ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                        )}>
                           {isSoldOut ? 'Sold Out' : `${seatsLeft} Seats Left`}
                        </Badge>
                     </div>
                     {selectedBatch.cutoffDate && (
                        <div className="flex items-center gap-2 text-[9px] font-medium text-rose-500 uppercase tracking-widest">
                           <AlertCircle size={12} />
                           Deadline: {fmtDate(selectedBatch.cutoffDate)}
                        </div>
                     )}
                  </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                     <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">ADULTS</label>
                     <div className="flex items-center justify-between h-[60px] bg-slate-50 rounded-[20px] px-5 border border-slate-100">
                        <button onClick={() => setAdults(Math.max(1, adults-1))} className="text-2xl font-medium text-emerald-600">−</button>
                        <span className="font-medium text-base text-slate-700">{adults}</span>
                        <button onClick={() => setAdults(adults+1)} className="text-2xl font-medium text-emerald-600">+</button>
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">CHILDREN</label>
                     <div className="flex items-center justify-between h-[60px] bg-slate-50 rounded-[20px] px-5 border border-slate-100">
                        <button onClick={() => setChildren(Math.max(0, children-1))} className="text-2xl font-medium text-emerald-600">−</button>
                        <span className="font-medium text-base text-slate-700">{children}</span>
                        <button onClick={() => setChildren(children+1)} className="text-2xl font-medium text-emerald-600">+</button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="pt-2">
               <div className="flex justify-between items-center mb-4 px-1">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Grand Total</span>
                  <span className="text-xl font-medium text-slate-800 tracking-tight">{fmt(totalPrice)}</span>
               </div>
               <Button 
                 disabled={isSoldOut || isCutoffPassed}
                 className="w-full h-[64px] rounded-[20px] bg-orange-500 hover:bg-orange-600 font-medium text-sm uppercase tracking-widest shadow-2xl shadow-orange-500/20 text-white border-none disabled:bg-slate-200 disabled:shadow-none"
                 onClick={() => onBook({
                   campId: camp.id,
                   camp: camp.name,
                   amount: totalPrice,
                   checkin: camp.startDate,
                   checkout: camp.endDate
                 })}
               >
                  {isCutoffPassed ? 'Booking Closed' : isSoldOut ? 'Fully Booked' : 'Verify & Pay Now'}
               </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 rounded-[32px] overflow-hidden border-none shadow-2xl flex flex-col bg-slate-900">
          <DialogHeader className="p-6 border-b border-white/10 bg-slate-900 shrink-0">
             <DialogTitle className="text-[10px] font-medium uppercase tracking-widest text-white">Gallery Explorer</DialogTitle>
             <DialogDescription className="sr-only">High resolution expedition gallery</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 w-full p-4 md:p-8">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {camp.campImages.map((img, i) => (
                  <div key={i} className="rounded-[24px] md:rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
                     <img src={img} className="w-full h-auto object-cover" alt={`Gallery ${i}`} />
                  </div>
                ))}
             </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
