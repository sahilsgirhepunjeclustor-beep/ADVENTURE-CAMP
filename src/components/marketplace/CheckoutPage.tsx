
"use client";

import React, { useState } from 'react';
import { Booking, User, BookingParticipant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  ArrowLeft, 
  CreditCard, 
  Users, 
  CheckCircle2,
  Lock,
  ChevronRight,
  Smartphone,
  Trash2,
  UserPlus
} from 'lucide-react';
import { fmt, fmtDate, cn, uid } from '@/lib/utils';
import { Separator } from "@/components/ui/separator";

interface CheckoutPageProps {
  bookingData: Partial<Booking>;
  onBack: () => void;
  onConfirm: (booking: Partial<Booking>, participants: BookingParticipant[]) => void;
  currentUser: User;
}

export default function CheckoutPage({ bookingData, onBack, onConfirm, currentUser }: CheckoutPageProps) {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [guests, setGuests] = useState<BookingParticipant[]>([]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => step > 1 ? setStep(step - 1) : onBack();

  const addGuest = () => {
    setGuests([...guests, { id: uid(), name: '', age: '', gender: '' }]);
  };

  const removeGuest = (id: string) => {
    setGuests(guests.filter(g => g.id !== id));
  };

  const updateGuest = (id: string, field: keyof BookingParticipant, value: string) => {
    setGuests(guests.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const leadParticipant: BookingParticipant = {
    id: 'lead',
    name: `${currentUser.firstName} ${currentUser.lastName}`,
    age: '',
    gender: currentUser.gender || 'N/A'
  };

  const allParticipants = [leadParticipant, ...guests];

  const renderStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 text-primary border-b border-slate-50 pb-4">
          <CheckCircle2 size={20} />
          <h3 className="text-sm font-black uppercase tracking-widest">Review Adventure Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Selected Expedition</p>
                 <p className="text-sm font-black text-slate-900 uppercase">{bookingData.camp}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in</p>
                    <p className="text-xs font-bold text-slate-700">{fmtDate(bookingData.checkin)}</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-out</p>
                    <p className="text-xs font-bold text-slate-700">{fmtDate(bookingData.checkout)}</p>
                 </div>
              </div>
           </div>
           <div className="p-6 bg-primary/5 rounded-[24px] border border-primary/10 flex flex-col justify-center">
              <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Total Amount Payable</div>
              <div className="text-3xl font-black text-slate-900 leading-none">{fmt(bookingData.amount || 0)}</div>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">Inclusive of all wilderness permits & taxes</p>
           </div>
        </div>
      </div>
      <Button onClick={handleNext} className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.15em] text-sm shadow-xl shadow-primary/20">
        Proceed to Guest Details <ChevronRight size={18} className="ml-2" />
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-3 text-primary border-b border-slate-50 pb-4">
          <Users size={20} />
          <h3 className="text-sm font-black uppercase tracking-widest">Guest Information</h3>
        </div>
        
        <div className="space-y-6">
           {/* Lead Passenger */}
           <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Lead Passenger (You)</p>
                 <Badge variant="outline" className="bg-white text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border-primary text-primary">Primary</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-slate-400 uppercase">Full Name</Label>
                    <Input defaultValue={`${currentUser.firstName} ${currentUser.lastName}`} className="rounded-xl h-12 bg-white font-bold" />
                 </div>
                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-slate-400 uppercase">Mobile Number</Label>
                    <Input defaultValue={currentUser.phone} className="rounded-xl h-12 bg-white font-bold" />
                 </div>
              </div>
           </div>

           {/* Additional Guests */}
           {guests.map((guest, idx) => (
             <div key={guest.id} className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Guest {idx + 2}</p>
                   <Button variant="ghost" size="icon" onClick={() => removeGuest(guest.id)} className="h-8 w-8 text-destructive hover:bg-destructive/5 rounded-lg">
                      <Trash2 size={14} />
                   </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="md:col-span-1 space-y-1.5">
                      <Label className="text-[9px] font-black text-slate-400 uppercase">Full Name</Label>
                      <Input value={guest.name} onChange={(e) => updateGuest(guest.id, 'name', e.target.value)} placeholder="Enter Name" className="rounded-xl h-12 bg-slate-50/50 font-bold" />
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-[9px] font-black text-slate-400 uppercase">Age</Label>
                      <Input value={guest.age} onChange={(e) => updateGuest(guest.id, 'age', e.target.value)} type="number" placeholder="Age" className="rounded-xl h-12 bg-slate-50/50 font-bold" />
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-[9px] font-black text-slate-400 uppercase">Gender</Label>
                      <Input value={guest.gender} onChange={(e) => updateGuest(guest.id, 'gender', e.target.value)} placeholder="e.g. Male" className="rounded-xl h-12 bg-slate-50/50 font-bold" />
                   </div>
                </div>
             </div>
           ))}

           <div className="p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-3">Traveling with more people?</p>
              <Button onClick={addGuest} variant="outline" size="sm" className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest border-primary text-primary hover:bg-primary/5 gap-2">
                <UserPlus size={14} /> Add Guest Details
              </Button>
           </div>
        </div>
      </div>
      <div className="flex gap-4">
         <Button variant="ghost" onClick={handleBack} className="flex-1 h-14 rounded-2xl font-black text-slate-400 uppercase tracking-widest">Back</Button>
         <Button onClick={handleNext} className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-[0.15em] text-sm shadow-xl shadow-primary/20">
           Continue to Payment <ChevronRight size={18} className="ml-2" />
         </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
           <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-3 text-primary border-b border-slate-50 pb-4">
                <CreditCard size={20} />
                <h3 className="text-sm font-black uppercase tracking-widest">Select Payment Method</h3>
              </div>
              
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 gap-4">
                 {[
                   { id: 'upi', label: 'UPI (GPay, PhonePe, Paytm)', icon: Smartphone },
                   { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                   { id: 'net', label: 'Net Banking', icon: Smartphone },
                 ].map((method) => (
                   <div key={method.id} className={cn(
                     "flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer",
                     paymentMethod === method.id ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
                   )} onClick={() => setPaymentMethod(method.id)}>
                      <div className="flex items-center gap-4">
                         <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", paymentMethod === method.id ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                            <method.icon size={20} />
                         </div>
                         <Label className="text-sm font-black uppercase tracking-tight cursor-pointer">{method.label}</Label>
                      </div>
                      <RadioGroupItem value={method.id} id={method.id} />
                   </div>
                 ))}
              </RadioGroup>
           </div>
        </div>

        <div className="lg:col-span-5">
           <div className="bg-[#0d2a1d] p-8 rounded-[32px] text-white space-y-6 shadow-2xl">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Price Summary</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="opacity-70">Base Price ({guests.length + 1} Pax)</span>
                    <span>{fmt(bookingData.amount! - 250)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="opacity-70">Permit & Insurance</span>
                    <span>₹250</span>
                 </div>
                 <Separator className="bg-white/10" />
                 <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-black uppercase tracking-widest opacity-60">Grand Total</span>
                    <span className="text-2xl font-black tracking-tight">{fmt(bookingData.amount!)}</span>
                 </div>
              </div>
              <div className="pt-4">
                 <Button onClick={() => onConfirm(bookingData, allParticipants)} className="w-full h-14 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] font-black uppercase tracking-widest text-xs border-none shadow-xl shadow-black/20">
                   Confirm & Pay Now
                 </Button>
                 <div className="mt-6 flex items-center justify-center gap-2 opacity-40">
                    <Lock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Secure 256-bit SSL Payment</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBack} className="rounded-full h-12 w-12 border-slate-200 shadow-sm">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Checkout</h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Complete your formalities</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all",
                step >= i ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
              )}>
                {step > i ? <CheckCircle2 size={16} /> : i}
              </div>
              {i < 3 && <div className={cn("w-8 md:w-16 h-1 mx-2 rounded-full", step > i ? "bg-primary" : "bg-slate-100")} />}
            </div>
          ))}
        </div>
      </div>

      <main>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </main>

      <div className="flex items-center justify-center gap-8 py-10 opacity-30 grayscale pointer-events-none overflow-x-hidden w-full">
         <img src="https://picsum.photos/seed/visa/100/40" className="h-6" alt="Visa" />
         <img src="https://picsum.photos/seed/master/100/40" className="h-6" alt="Mastercard" />
         <img src="https://picsum.photos/seed/upi/100/40" className="h-6" alt="UPI" />
         <img src="https://picsum.photos/seed/razor/100/40" className="h-6" alt="Razorpay" />
      </div>
    </div>
  );
}
