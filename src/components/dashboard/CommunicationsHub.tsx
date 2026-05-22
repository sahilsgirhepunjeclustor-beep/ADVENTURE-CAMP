"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Mail, 
  Smartphone, 
  Bell, 
  Send, 
  Users, 
  Target, 
  ArrowLeft,
  Calendar,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, uid } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { addAdminNotification } from '@/lib/store';

interface CommunicationsHubProps {
  onBack?: () => void;
}

export default function CommunicationsHub({ onBack }: CommunicationsHubProps) {
  const [activeChannel, setActiveChannel] = useState<'email' | 'push' | 'sms' | 'announcement'>('email');
  
  const [campaign, setCampaign] = useState({
    title: '',
    message: '',
    target: 'all',
    schedule: 'immediate'
  });

  const [history] = useState([
    { id: '1', title: 'Winter Sale 2025', channel: 'Email', status: 'Delivered', reach: '4.2k', date: '2025-01-10' },
    { id: '2', title: 'New Kasol Camp', channel: 'Push', status: 'Active', reach: '1.8k', date: '2025-01-15' },
    { id: '3', title: 'Organizer Policy Update', channel: 'Platform', status: 'Draft', reach: '0', date: '2025-01-20' }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign.title || !campaign.message) return;

    if (activeChannel === 'announcement') {
      addAdminNotification({
        id: uid(),
        type: 'campaign',
        title: campaign.title,
        message: campaign.message,
        time: new Date().toISOString(),
        read: false
      });
    }

    toast({ title: 'Campaign Broadcasted', description: `Message queued for ${campaign.target} explorers via ${activeChannel.toUpperCase()}.` });
    setCampaign({ title: '', message: '', target: 'all', schedule: 'immediate' });
  };

  return (
    <div className="space-y-8 pb-20 font-sans max-w-7xl mx-auto px-4 md:px-0 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-12 w-12 border-slate-200 shadow-sm">
              <ArrowLeft size={20} className="text-slate-600" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Communications Hub</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Omnichannel Campaign Orchestration</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-7">
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
              <Tabs defaultValue="email" onValueChange={(v: any) => setActiveChannel(v)}>
                 <TabsList className="bg-slate-50 p-1 rounded-2xl mb-8 h-12 flex w-full sm:w-auto">
                    <TabsTrigger value="email" className="flex-1 sm:flex-none rounded-xl px-6 font-black uppercase text-[10px] gap-2"><Mail size={14} /> Email</TabsTrigger>
                    <TabsTrigger value="push" className="flex-1 sm:flex-none rounded-xl px-6 font-black uppercase text-[10px] gap-2"><Bell size={14} /> Push</TabsTrigger>
                    <TabsTrigger value="sms" className="flex-1 sm:flex-none rounded-xl px-6 font-black uppercase text-[10px] gap-2"><Smartphone size={14} /> SMS</TabsTrigger>
                    <TabsTrigger value="announcement" className="flex-1 sm:flex-none rounded-xl px-6 font-black uppercase text-[10px] gap-2"><MessageCircle size={14} /> Alert</TabsTrigger>
                 </TabsList>

                 <form onSubmit={handleSend} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Campaign Title</Label>
                          <Input 
                             value={campaign.title}
                             onChange={e => setCampaign({...campaign, title: e.target.value})}
                             placeholder="Internal identification"
                             className="rounded-xl h-12 font-black"
                             required
                          />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Audience</Label>
                          <Select value={campaign.target} onValueChange={v => setCampaign({...campaign, target: v})}>
                             <SelectTrigger className="rounded-xl h-12 font-bold"><SelectValue /></SelectTrigger>
                             <SelectContent>
                                <SelectItem value="all">All Ecosystem Users</SelectItem>
                                <SelectItem value="explorers">Explorers Only</SelectItem>
                                <SelectItem value="organizers">Partners (Organizers)</SelectItem>
                                <SelectItem value="members">Active Membership Tier</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Campaign Content</Label>
                       <Textarea 
                          value={campaign.message}
                          onChange={e => setCampaign({...campaign, message: e.target.value})}
                          placeholder="Your broadcast message..."
                          className="rounded-[24px] min-h-[180px] font-bold text-sm bg-slate-50/50"
                          required
                       />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                       <Button type="submit" className="flex-[2] h-14 rounded-2xl bg-primary hover:bg-accent text-white font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/10">
                          <Send size={18} /> Broadcast Now
                       </Button>
                       <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3">
                          <Calendar size={18} /> Schedule
                       </Button>
                    </div>
                 </form>
              </Tabs>
           </div>
        </div>

        <div className="xl:col-span-5 space-y-6">
           <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-primary mb-8">TRANSMISSION LOG</h3>
              <ScrollArea className="h-[480px]">
                 <div className="space-y-4">
                    {history.map(item => (
                      <div key={item.id} className="p-5 bg-white/5 rounded-[24px] border border-white/5 transition-all hover:bg-white/10 group">
                         <div className="flex justify-between items-start mb-4">
                            <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">{item.channel}</Badge>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{item.date}</span>
                         </div>
                         <h4 className="text-sm font-black uppercase tracking-tight mb-4 group-hover:text-primary transition-colors">{item.title}</h4>
                         <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                               <span className="text-[9px] font-black uppercase text-slate-300">{item.status}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                               <Users size={12} /> {item.reach} Target
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </ScrollArea>
           </div>
        </div>
      </div>
    </div>
  );
}