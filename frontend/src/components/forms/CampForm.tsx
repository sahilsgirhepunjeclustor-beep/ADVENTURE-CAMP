"use client";

import React, { useState } from 'react';
import { User, Camp, ItineraryStep, Batch } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Mountain, 
  MapPin, 
  IndianRupee, 
  Calendar,
  Video,
  Image as ImageIcon,
  Zap,
  CheckCircle2,
  FileCode,
  Layout,
  Utensils,
  Backpack,
  ShieldAlert,
  CloudSun,
  Globe,
  Clock,
  Users
} from 'lucide-react';
import { uid, compressImage } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CampFormProps {
  currentUser: User;
  onBack: () => void;
  onSubmit: (camp: Camp) => void;
  initialData?: Camp;
}

export default function CampForm({ currentUser, onBack, onSubmit, initialData }: CampFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [capacity, setCapacity] = useState(initialData?.capacity?.toString() || '20');
  const [duration, setDuration] = useState(initialData?.duration?.toString() || '3');
  const [category, setCategory] = useState(initialData?.category || 'Adventure');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Challenging' | 'Expert'>(initialData?.difficulty || 'Moderate');
  const [amenities, setAmenities] = useState(initialData?.amenities.toString() || 'Tents, Meals, First Aid, Guide');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [lat, setLat] = useState(initialData?.coordinates?.lat || '');
  const [lng, setLng] = useState(initialData?.coordinates?.lng || '');
  const [weatherInfo, setWeatherInfo] = useState(initialData?.weatherInfo || 'Generally pleasant with cool nights.');
  
  const [campImages, setCampImages] = useState<string[]>(initialData?.campImages || [
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80'
  ]);

  const [itinerary, setItinerary] = useState<ItineraryStep[]>(initialData?.itinerary || [
    { day: 'Day 1', title: 'Arrival & Setup', description: 'Briefing and campsite allocation.' }
  ]);

  const [batches, setBatches] = useState<Batch[]>(initialData?.batches || [
    { id: uid(), dates: 'May 2025', status: 'Available', price: initialData?.price || 5000, maxCapacity: 20, currentBookings: 0, cutoffDate: '' }
  ]);

  const [food, setFood] = useState<string[]>(initialData?.food || ['Breakfast', 'Lunch', 'Dinner', 'Evening Snacks']);
  const [equipment, setEquipment] = useState<string[]>(initialData?.equipment || ['Tents', 'Sleeping Bags', 'Trekking Poles']);
  const [safetyInstructions, setSafetyInstructions] = useState<string[]>(initialData?.safetyInstructions || ['Follow guide instructions at all times', 'Stay hydrated']);
  const [discounts, setDiscounts] = useState<string[]>(initialData?.discounts || []);

  const addItineraryDay = () => {
    setItinerary([...itinerary, { day: `Day ${itinerary.length + 1}`, title: '', description: '' }]);
  };

  const updateItinerary = (index: number, field: keyof ItineraryStep, value: string) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setItinerary(updated);
  };

  const removeItineraryDay = (index: number) => {
    if (itinerary.length <= 1) return;
    setItinerary(itinerary.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: `Day ${i + 1}` })));
  };

  const addBatch = () => {
    setBatches([...batches, { 
      id: uid(), 
      dates: '', 
      status: 'Available', 
      price: parseInt(price) || 0, 
      maxCapacity: parseInt(capacity) || 20, 
      currentBookings: 0, 
      cutoffDate: '' 
    }]);
  };

  const updateBatch = (index: number, field: keyof Batch, value: any) => {
    const updated = [...batches];
    updated[index] = { ...updated[index], [field]: value };
    setBatches(updated);
  };

  const removeBatch = (index: number) => {
    if (batches.length <= 1) return;
    setBatches(batches.filter((_, i) => i !== index));
  };

  // Generic List Handlers
  const addToList = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) => setter([...list, '']);
  const updateList = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], idx: number, val: string) => {
    const next = [...list];
    next[idx] = val;
    setter(next);
  };
  const removeFromList = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], idx: number) => setter(list.filter((_, i) => i !== idx));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const processedImages: string[] = [];

    toast({ title: 'Processing Images', description: `Optimizing ${fileArray.length} photos for storage...` });

    for (const file of fileArray) {
      try {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        // Compress to save LocalStorage quota
        const compressed = await compressImage(base64, 1000, 0.6);
        processedImages.push(compressed);
      } catch (err) {
        console.error('Error processing image:', err);
      }
    }

    setCampImages(prev => [...prev, ...processedImages]);
    toast({ title: 'Images Staged', description: `${processedImages.length} photos optimized and added to gallery.` });
  };

  const handleAction = (status: 'draft' | 'pending_approval') => {
    if (!name || !location || !price) {
      toast({ variant: 'destructive', title: 'Mandatory Fields Missing', description: 'Please fill name, location and price.' });
      return;
    }

    const newCamp: Camp = {
      id: initialData?.id || uid(),
      name,
      location,
      description,
      capacity: parseInt(capacity),
      minGroup: 1,
      price: parseInt(price),
      duration: parseInt(duration),
      startDate,
      endDate,
      occupancy: initialData?.occupancy || 0,
      category,
      activity: category,
      difficulty,
      rating: initialData?.rating || 5.0,
      familyFriendly: true,
      groupSize: 10,
      amenities,
      activities: [category],
      food: food.filter(f => f.trim()),
      costIncludes: ['Stay', 'Meals'],
      costExcludes: ['Travel'],
      campImages,
      videoUrl,
      discounts: discounts.filter(d => d.trim()),
      equipment: equipment.filter(e => e.trim()),
      safetyInstructions: safetyInstructions.filter(s => s.trim()),
      weatherInfo,
      coordinates: { lat, lng },
      addedBy: currentUser.email,
      organizer: currentUser.organizerProfile?.businessName || `${currentUser.firstName}'s Camp`,
      addedByName: currentUser.firstName,
      addedAt: initialData?.addedAt || new Date().toISOString(),
      status,
      batches,
      itinerary,
      faqs: [],
      pickupPoints: ['Basecamp']
    };

    onSubmit(newCamp);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 font-sans animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-2xl bg-white shadow-sm hover:bg-slate-50 border-slate-200">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              {initialData ? 'Revise Expedition' : 'List New Adventure'}
            </h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5 opacity-70">
              Expedition Registry Protocol
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleAction('draft')}
            className="flex-1 sm:flex-none h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest border-slate-200"
          >
            Save as Draft
          </Button>
          <Button 
            onClick={() => handleAction('pending_approval')}
            className="flex-[2] sm:flex-none h-12 px-8 rounded-2xl bg-primary hover:bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 border-none"
          >
            Submit for Audit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* General Information */}
          <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
             <div className="flex items-center gap-3 text-primary border-b border-slate-50 pb-4">
                <Mountain size={20} />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Expedition Core Details</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Expedition Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pine Forest Riverside Retreat" className="rounded-xl h-12 font-bold" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Exact Location</Label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                    <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Kasol, HP" className="rounded-xl h-12 pl-11 font-bold" required />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Deep Overview</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Technical and lifestyle overview of the camp..." className="rounded-[24px] min-h-[120px] font-medium leading-relaxed" required />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Camp Category</Label>
                   <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="rounded-xl h-12 font-bold">
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                         {['Mountain', 'River', 'Forest', 'Desert', 'Beach', 'Adventure'].map(c => (
                           <SelectItem key={c} value={c} className="text-xs font-bold uppercase">{c}</SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Difficulty Grade</Label>
                   <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{difficulty}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">{difficulty} LEVEL</p>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black uppercase border-primary text-primary px-2 rounded-lg">{difficulty}</Badge>
                   </div>
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Duration (Days)</Label>
                   <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="rounded-xl h-12 font-black" />
                </div>
             </div>
          </section>

          {/* Batches & Scheduling */}
          <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
             <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3 text-primary">
                   <Calendar size={20} />
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Schedules & Inventory Limits</h3>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addBatch} className="rounded-xl h-9 px-4 font-black text-[9px] uppercase border-primary text-primary">
                  + Add New Batch
                </Button>
             </div>
             
             <div className="space-y-4">
                {batches.map((batch, idx) => (
                  <div key={batch.id} className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 animate-in fade-in zoom-in duration-300">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-1.5">
                           <Label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Expedition Dates</Label>
                           <Input value={batch.dates} onChange={e => updateBatch(idx, 'dates', e.target.value)} placeholder="e.g. 21 May - 29 May" className="h-10 rounded-xl bg-white border-none shadow-sm font-bold" />
                        </div>
                        <div className="space-y-1.5">
                           <Label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Price Override (₹)</Label>
                           <Input type="number" value={batch.price} onChange={e => updateBatch(idx, 'price', parseInt(e.target.value))} className="h-10 rounded-xl bg-white border-none shadow-sm font-black" />
                        </div>
                        <div className="space-y-1.5">
                           <Label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Seat Limit (Max Capacity)</Label>
                           <div className="relative">
                              <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                              <Input type="number" value={batch.maxCapacity} onChange={e => updateBatch(idx, 'maxCapacity', parseInt(e.target.value))} className="h-10 rounded-xl bg-white border-none shadow-sm font-black pl-10" />
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                        <div className="space-y-1.5">
                           <Label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Booking Cutoff Date</Label>
                           <div className="relative">
                              <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                              <Input type="date" value={batch.cutoffDate} onChange={e => updateBatch(idx, 'cutoffDate', e.target.value)} className="h-10 rounded-xl bg-white border-none shadow-sm font-bold pl-10" />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <Label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Audit Status</Label>
                           <Select value={batch.status} onValueChange={v => updateBatch(idx, 'status', v)}>
                              <SelectTrigger className="h-10 rounded-xl bg-white border-none shadow-sm font-bold text-xs uppercase">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="Available" className="text-xs font-bold uppercase">Available</SelectItem>
                                 <SelectItem value="Filling Fast" className="text-xs font-bold uppercase">Filling Fast</SelectItem>
                                 <SelectItem value="Sold Out" className="text-xs font-bold uppercase">Sold Out</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="flex justify-end pt-2 lg:pt-0">
                           <button type="button" onClick={() => removeBatch(idx)} className="h-10 px-4 flex items-center justify-center gap-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm font-black text-[9px] uppercase tracking-widest">
                              <Trash2 size={14} /> Terminate Batch
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </section>

          {/* Itinerary Management */}
          <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
             <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3 text-primary">
                   <Layout size={20} />
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Expedition Timeline</h3>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addItineraryDay} className="rounded-xl h-9 px-4 font-black text-[9px] uppercase border-primary text-primary">
                  + Add Day
                </Button>
             </div>
             
             <div className="space-y-6">
                {itinerary.map((step, idx) => (
                  <div key={idx} className="relative pl-12 border-l-2 border-slate-50 pb-8 last:pb-0">
                     <div className="absolute left-[-11px] top-0 h-5 w-5 rounded-full bg-primary border-4 border-white shadow-md" />
                     <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 space-y-4 relative group">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[9px] font-black bg-primary text-white px-3 py-1 rounded-full uppercase tracking-[0.15em] shadow-lg">{step.day}</span>
                           <button type="button" onClick={() => removeItineraryDay(idx)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1">
                             <Trash2 size={16} />
                           </button>
                        </div>
                        <Input 
                          value={step.title} 
                          onChange={e => updateItinerary(idx, 'title', e.target.value)} 
                          placeholder="Day Title (e.g. Acclimatization in Basecamp)" 
                          className="rounded-xl border-none shadow-sm font-black text-sm uppercase"
                        />
                        <Textarea 
                          value={step.description} 
                          onChange={e => updateItinerary(idx, 'description', e.target.value)} 
                          placeholder="Specific activities, training or transitions for this day..." 
                          className="rounded-2xl border-none shadow-sm text-xs font-medium leading-relaxed bg-white/50"
                        />
                     </div>
                  </div>
                ))}
             </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
           {/* Pricing Strategy */}
           <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
              <div>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 mb-1">
                    <Zap size={14} /> Strategy & Revenue
                 </h3>
                 <p className="text-[9px] text-slate-400 font-bold uppercase">Pricing & Discount Logic</p>
              </div>

              <div className="space-y-6">
                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Base Price per Pax (₹)</Label>
                    <div className="relative">
                       <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                       <Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="rounded-xl h-12 pl-11 font-black text-xl border-slate-100 bg-slate-50/50" required />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Discounts & Offers</Label>
                       <button type="button" onClick={() => addToList(setDiscounts, discounts)} className="text-[8px] font-black text-primary uppercase hover:underline">+ New Offer</button>
                    </div>
                    <div className="space-y-2">
                       {discounts.map((d, i) => (
                         <div key={i} className="flex gap-2 animate-in slide-in-from-right-2">
                            <Input value={d} onChange={e => updateList(setDiscounts, discounts, i, e.target.value)} placeholder="e.g. Early Bird: 10% OFF" className="h-9 rounded-xl text-[10px] font-bold bg-slate-50 border-none" />
                            <button onClick={() => removeFromList(setDiscounts, discounts, i)} className="text-red-300 hover:text-red-500"><Trash2 size={14} /></button>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </section>

           {/* Safety & Weather Protocols */}
           <section className="bg-rose-900 rounded-[32px] p-8 text-white shadow-2xl space-y-8">
              <div>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 flex items-center gap-2 mb-1">
                    <ShieldAlert size={14} /> Risk & Safety Audit
                 </h3>
                 <p className="text-[8px] text-rose-300/60 font-bold uppercase">Mandatory safety instructions</p>
              </div>
              <div className="space-y-6">
                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <Label className="text-[9px] font-black uppercase tracking-widest text-rose-300/40">Instructions</Label>
                       <button onClick={() => addToList(setSafetyInstructions, safetyInstructions)} className="text-[8px] font-black text-rose-400 uppercase">+ Add</button>
                    </div>
                    <div className="space-y-3">
                       {safetyInstructions.map((ins, i) => (
                         <div key={i} className="flex gap-2 items-start">
                            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[9px] font-black shrink-0">{i+1}</div>
                            <Textarea 
                              value={ins} 
                              onChange={e => updateList(setSafetyInstructions, safetyInstructions, i, e.target.value)}
                              className="bg-white/5 border-white/10 rounded-xl min-h-[60px] text-[11px] font-medium p-3"
                            />
                            <button onClick={() => removeFromList(setSafetyInstructions, safetyInstructions, i)} className="text-rose-400 pt-2"><Trash2 size={14} /></button>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2 pt-4 border-t border-white/10">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-rose-300/40 flex items-center gap-2">
                       <CloudSun size={12} /> Weather Intelligence
                    </Label>
                    <Textarea 
                      value={weatherInfo} 
                      onChange={e => setWeatherInfo(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-xl min-h-[80px] text-[11px] font-medium p-3"
                    />
                 </div>
              </div>
           </section>

           {/* Media Content */}
           <section className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl space-y-8">
              <div>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 mb-1">
                    <ImageIcon size={14} /> Media Intelligence
                 </h3>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Video Trailer (YouTube Embed)</Label>
                    <div className="relative">
                       <Video size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                       <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="Embed URL" className="bg-white/5 border-white/10 rounded-xl h-10 pl-10 text-[10px] font-mono" />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Expedition Gallery</Label>
                    <div className="grid grid-cols-2 gap-2">
                       {campImages.map((img, i) => (
                         <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 relative group">
                            <img src={img} className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => setCampImages(campImages.filter((_, idx) => idx !== i))} 
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <Trash2 size={12} className="text-white" />
                            </button>
                         </div>
                       ))}
                       <div className="relative aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-all cursor-pointer bg-white/5">
                          <Plus size={24} />
                          <span className="text-[8px] font-black uppercase tracking-widest mt-2">Add Photo</span>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleImageUpload}
                          />
                       </div>
                    </div>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
