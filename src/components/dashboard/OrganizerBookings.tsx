"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { User, Booking, AppData, BookingParticipant } from '@/lib/types';
import { getBookingsForOrganizer, getAppData, saveAppData } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { fmt, fmtDate, cn } from '@/lib/utils';
import { 
  Check, 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  Tent, 
  ArrowLeft, 
  Download, 
  Users, 
  Search, 
  MoreHorizontal,
  Eye,
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface OrganizerBookingsProps {
  currentUser: User;
  onBack?: () => void;
  onRefresh?: () => void;
}

export default function OrganizerBookings({ currentUser, onBack, onRefresh }: OrganizerBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  const loadBookings = () => {
    setBookings(getBookingsForOrganizer(currentUser.email));
  };

  useEffect(() => {
    loadBookings();
    const interval = setInterval(loadBookings, 5000);
    return () => clearInterval(interval);
  }, [currentUser.email]);

  const handleAction = (bookingId: string, customerEmail: string, status: 'Confirmed' | 'Cancelled') => {
    // Find customer's app data and update the specific booking
    const customerData = getAppData(customerEmail);
    customerData.bookings = customerData.bookings.map(b => b.id === bookingId ? { ...b, status } : b);
    saveAppData(customerEmail, customerData);
    
    toast({ 
      title: `Booking ${status}`, 
      description: status === 'Confirmed' ? 'Verification complete. Traveler notified.' : 'Booking declined.' 
    });
    loadBookings();
    if (onRefresh) onRefresh();
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => 
      b.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.camp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }, [bookings, searchQuery]);

  const handleDownloadCSV = (booking: Booking) => {
    if (!booking.participants || booking.participants.length === 0) {
      toast({ variant: 'destructive', title: 'Manifest Empty', description: 'No participant details found for this booking.' });
      return;
    }

    const headers = ["Name", "Age", "Gender"];
    const rows = booking.participants.map(p => [p.name, p.age, p.gender].join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `participants_${booking.id}_${booking.camp.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Download Started', description: 'Participant list exported to CSV.' });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onBack} 
              className="rounded-full h-10 w-10 border-slate-200 shadow-sm hover:bg-slate-50 shrink-0"
            >
              <ArrowLeft size={18} className="text-slate-600" />
            </Button>
          )}
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Booking Manifest</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Global Business Registry Operations</p>
          </div>
        </div>
        <div className="relative w-full md:w-80">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
           <Input 
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
             placeholder="Search by ID, User or Camp..." 
             className="pl-12 h-12 rounded-2xl bg-white border-slate-100 shadow-sm font-bold text-[11px] uppercase tracking-tight"
           />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200 opacity-50 flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-200 mb-6">
                <FileText size={40} />
             </div>
             <p className="text-sm font-black uppercase text-slate-400 tracking-widest">No matching bookings found</p>
          </div>
        ) : (
          filteredBookings.map(b => (
            <div key={b.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group border-l-[8px] border-l-primary/10 hover:border-l-primary">
               <div className="flex flex-col xl:flex-row gap-6">
                  <div className="flex-1 min-w-0">
                     <div className="flex flex-wrap items-center gap-3 mb-3">
                        <Badge variant="outline" className="bg-slate-50 border-slate-100 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg">ID: {b.id}</Badge>
                        <Badge className={cn(
                          "border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-lg",
                          b.status === 'Confirmed' ? "bg-green-100 text-green-700" : 
                          b.status === 'Cancelled' ? "bg-red-50 text-red-600" : 
                          "bg-amber-100 text-amber-700"
                        )}>
                          {b.status}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{fmtDate(b.addedAt)}</span>
                     </div>
                     
                     <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2">{b.camp}</h4>
                     
                     <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold text-slate-500 uppercase">
                        <span className="flex items-center gap-1.5"><Users size={12} className="text-primary" /> {b.customer}</span>
                        <span className="flex items-center gap-1.5"><Mail size={12} className="text-primary" /> {b.customerEmail}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-primary" /> {fmtDate(b.checkin)} - {fmtDate(b.checkout)}</span>
                     </div>
                  </div>

                  <div className="flex flex-row xl:flex-col justify-between items-end gap-2 border-t xl:border-t-0 xl:border-l border-slate-50 pt-4 xl:pt-0 xl:pl-6">
                     <div className="text-right">
                        <div className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{fmt(b.amount)}</div>
                        <div className="text-[9px] font-black text-green-500 uppercase tracking-widest">Yield: {fmt(b.amount - b.commissionAmount)}</div>
                     </div>
                     
                     <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { setSelectedBooking(b); setIsParticipantsOpen(true); }}
                          className="rounded-xl h-10 px-4 font-black text-[9px] uppercase tracking-widest border-slate-200 gap-2"
                        >
                           <Users size={14} /> Participants
                        </Button>
                        
                        {b.status === 'Pending' && (
                          <>
                            <Button 
                              onClick={() => handleAction(b.id, b.customerEmail, 'Confirmed')}
                              className="rounded-xl h-10 px-4 bg-green-500 hover:bg-green-600 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-green-500/10 border-none"
                            >
                              Approve
                            </Button>
                            <Button 
                              onClick={() => handleAction(b.id, b.customerEmail, 'Cancelled')}
                              variant="outline"
                              className="rounded-xl h-10 px-4 text-red-500 border-red-100 bg-red-50 hover:bg-red-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-widest"
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        
                        {b.status === 'Confirmed' && (
                          <Button 
                            variant="outline"
                            onClick={() => handleDownloadCSV(b)}
                            className="rounded-xl h-10 px-4 font-black text-[9px] uppercase tracking-widest border-primary text-primary hover:bg-primary/5 gap-2"
                          >
                            <Download size={14} /> Manifest
                          </Button>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Participants Detail Dialog */}
      <Dialog open={isParticipantsOpen} onOpenChange={setIsParticipantsOpen}>
        <DialogContent className="max-w-2xl rounded-[32px] border-none shadow-2xl p-0 overflow-hidden font-sans">
          <DialogHeader className="sr-only">
            <DialogTitle>Participant Registry</DialogTitle>
            <DialogDescription>Full list of registered explorers and their identification details for this expedition.</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="flex flex-col h-full bg-white">
              <div className="bg-[#0d2a1d] p-8 text-white relative shrink-0">
                 <h3 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">Group Manifest</h3>
                 <p className="text-[10px] text-green-200/60 font-black uppercase tracking-widest">{selectedBooking.camp}</p>
                 <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-[-25deg] translate-x-12" />
              </div>

              <div className="p-8">
                 <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                       <Users size={18} className="text-primary" />
                       <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Registered Participants ({selectedBooking.participants?.length || 0})</span>
                    </div>
                    {selectedBooking.participants && selectedBooking.participants.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDownloadCSV(selectedBooking)}
                        className="h-8 px-3 rounded-lg text-primary hover:bg-primary/5 font-black text-[9px] uppercase tracking-widest gap-2"
                      >
                         <Download size={12} /> Export CSV
                      </Button>
                    )}
                 </div>

                 <ScrollArea className="max-h-[400px] border border-slate-100 rounded-2xl">
                    <Table>
                       <TableHeader className="bg-slate-50">
                          <TableRow className="border-b border-slate-100">
                             <TableHead className="text-[9px] font-black uppercase text-slate-400">Guest Name</TableHead>
                             <TableHead className="text-[9px] font-black uppercase text-slate-400 text-center">Age</TableHead>
                             <TableHead className="text-[9px] font-black uppercase text-slate-400 text-right">Gender</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {!selectedBooking.participants || selectedBooking.participants.length === 0 ? (
                            <TableRow>
                               <TableCell colSpan={3} className="py-20 text-center text-[10px] font-black text-slate-300 uppercase italic">
                                  No participant data captured for this booking.
                               </TableCell>
                            </TableRow>
                          ) : (
                            selectedBooking.participants.map((p, idx) => (
                              <TableRow key={idx} className="border-b border-slate-50 last:border-0">
                                 <TableCell className="text-xs font-bold text-slate-900 uppercase">{p.name || 'Anonymous Explorer'}</TableCell>
                                 <TableCell className="text-xs font-black text-slate-600 text-center">{p.age || 'N/A'}</TableCell>
                                 <TableCell className="text-xs font-bold text-slate-600 text-right uppercase">{p.gender || 'N/A'}</TableCell>
                              </TableRow>
                            ))
                          )}
                       </TableBody>
                    </Table>
                 </ScrollArea>

                 <div className="mt-8 flex gap-3">
                    <Button 
                      onClick={() => setIsParticipantsOpen(false)}
                      className="w-full h-12 rounded-2xl bg-primary hover:bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-xl border-none"
                    >
                      Dismiss Registry
                    </Button>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
