"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Megaphone, Tag, Globe, BarChart3, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminMarketingProps {
  onBack?: () => void;
  initialTab?: 'coupons' | 'campaigns' | 'seo';
}

export default function AdminMarketing({ onBack, initialTab = 'coupons' }: AdminMarketingProps) {
  const [activeTab, setActiveTab] = useState<'coupons' | 'campaigns' | 'seo'>(initialTab);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="space-y-8 pb-20 font-sans max-w-7xl mx-auto px-4 md:px-0 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-12 w-12 border-slate-200 shadow-sm hover:bg-slate-50">
              <ArrowLeft size={20} className="text-slate-600" />
            </Button>
          )}
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Marketing Studio</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Campaign ops, coupons and SEO workflow</p>
          </div>
        </div>
        <Button onClick={() => toast({ title: 'Marketing sync initiated', description: 'Campaign and coupon data refreshed.' })} className="rounded-2xl h-12 px-8 bg-primary hover:bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-xl gap-2">
          <Megaphone size={16} /> Sync Now
        </Button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-50 p-1 rounded-2xl grid grid-cols-3 gap-2">
            <TabsTrigger value="coupons" className="rounded-xl px-5 font-black uppercase text-[10px] tracking-widest gap-2 flex items-center justify-center"><Tag size={14} /> Coupons</TabsTrigger>
            <TabsTrigger value="campaigns" className="rounded-xl px-5 font-black uppercase text-[10px] tracking-widest gap-2 flex items-center justify-center"><Sparkles size={14} /> Campaigns</TabsTrigger>
            <TabsTrigger value="seo" className="rounded-xl px-5 font-black uppercase text-[10px] tracking-widest gap-2 flex items-center justify-center"><Globe size={14} /> SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="coupons" className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Active Coupons', value: '18', description: 'Live discount codes.' },
                { title: 'Pending Approvals', value: '3', description: 'Awaiting review.' },
                { title: 'Redeemed', value: '1.2k', description: 'Redeemed by explorers.' },
              ].map(item => (
                <div key={item.title} className="bg-slate-50 rounded-[28px] p-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{item.title}</p>
                  <p className="text-3xl font-black text-slate-900">{item.value}</p>
                  <p className="text-[10px] text-slate-500 mt-2">{item.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Spring Launch', status: 'Live', reach: '24.6k' },
                { title: 'Referral Boost', status: 'Draft', reach: 'Pending' },
                { title: 'Email Blast', status: 'Scheduled', reach: '18.2k' },
              ].map(campaign => (
                <div key={campaign.title} className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">{campaign.title}</h3>
                    <Badge className="bg-slate-100 text-slate-600 text-[8px] font-black uppercase px-2 py-1 rounded-full">{campaign.status}</Badge>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-3">Projected Reach</p>
                  <p className="text-2xl font-black text-slate-900">{campaign.reach}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6 pt-6">
            <div className="bg-slate-50 rounded-[32px] p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Organic Traffic', value: '16.4k' },
                { label: 'Search Visibility', value: '92%' },
                { label: 'Keyword Ranking', value: 'Top 3' },
                { label: 'Meta Health', value: 'Good' },
              ].map(metric => (
                <div key={metric.label} className="rounded-3xl bg-white p-6 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{metric.label}</p>
                  <p className="text-3xl font-black text-slate-900">{metric.value}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
