
"use client";

import React, { useState, useMemo } from 'react';
import { User, AppData, Booking } from '@/lib/types';
import { fmtDate, cn } from '@/lib/utils';
import { 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  History,
  ShieldCheck,
  Star,
  User as UserIcon,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OrganizerCustomersProps {
  currentUser: User;
  data: AppData;
  onBack: () => void;
}

export default function OrganizerCustomers({ currentUser, data, onBack }: OrganizerCustomersProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const customers = useMemo(() => {
    const custMap: Record<string, { name: string, email: string, phone?: string, bookings: number, lastTrip: string }> = {};
    
    data.bookings.forEach(b => {
      if (!custMap[b.customerEmail]) {
        custMap[b.customerEmail] = {
          name: b.customer,
          email: b.customerEmail,
          bookings: 0,
          lastTrip: b.checkin
        };
      }
      custMap[b.customerEmail].bookings++;
      if (new Date(b.checkin) > new Date(custMap[b.customerEmail].lastTrip)) {
        custMap[b.customerEmail].lastTrip = b.checkin;
      }
    });

    return Object.values(custMap).filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data.bookings, searchQuery]);

  return (
    <div className="space-y-8 pb-20 font-sans animate-in fade-in duration-700 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-12 w-12 border-slate-200 shadow-sm hover:bg-slate-50">
            <ArrowLeft size={20} className="text-slate-600" />
          </Button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Explorer Registry</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Manage guest relationships and booking history</p>
          </div>
        </div>
        <div className="relative w-full md:w-80">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
           <Input 
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
             placeholder="Search your explorers..." 
             className="pl-12 h-12 rounded-2xl bg-white border-slate-100 shadow-xl font-bold text-[11px] uppercase tracking-tight"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white rounded-[40px] border border-dashed border-slate-200 opacity-50 flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-200 mb-6">
                <Users size={40} />
             </div>
             <p className="text-sm font-black uppercase text-slate-400 tracking-widest">No matching explorers found</p>
          </div>
        ) : (
          customers.map(c => (
            <div key={c.email} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full relative overflow-hidden">
               <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl border border-white shadow-sm overflow-hidden">
                        {c.name[0]}
                     </div>
                     <div>
                        <h4 className="text-base font-black text-slate-900 uppercase tracking-tighter leading-none mb-1.5">{c.name}</h4>
                        <div className="text-[10px] text-slate-400 font-bold lowercase flex items-center gap-1.5 truncate max-w-[150px]">
                           <Mail size={10} className="text-primary shrink-0" /> {c.email}
                        </div>
                     </div>
                  </div>
                  <Badge variant="outline" className="bg-slate-50 border-slate-100 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg">{c.bookings} Trips</Badge>
               </div>

               <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     <History size={12} className="text-primary" /> Last Expedition: {fmtDate(c.lastTrip)}
                  </div>
                  <div className="flex gap-2">
                     <Badge className="bg-green-50 text-green-600 border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-md">Verified Account</Badge>
                     <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-md">Repeat Guest</Badge>
                  </div>
               </div>

               <div className="mt-auto pt-6 border-t border-slate-50 flex gap-2 relative z-10">
                  <Button variant="outline" className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest border-slate-200">History</Button>
                  <Button className="flex-1 h-10 rounded-xl bg-primary hover:bg-accent text-white font-black text-[9px] uppercase tracking-widest border-none shadow-lg shadow-primary/10">Message</Button>
               </div>
               
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-8 translate-x-8" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

