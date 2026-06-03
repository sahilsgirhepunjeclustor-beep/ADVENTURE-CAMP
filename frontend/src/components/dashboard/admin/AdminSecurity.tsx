"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, ShieldCheck, Clock, Users, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminSecurityProps {
  onBack?: () => void;
  initialTab?: 'audit' | 'sessions' | 'access';
}

export default function AdminSecurity({ onBack, initialTab = 'audit' }: AdminSecurityProps) {
  const [activeTab, setActiveTab] = useState<'audit' | 'sessions' | 'access'>(initialTab);

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
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Security Hub</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Audit logs, sessions and access control</p>
          </div>
        </div>
        <Button onClick={() => toast({ title: 'Audit refresh started', description: 'Security data is being updated.' })} className="rounded-2xl h-12 px-8 bg-primary hover:bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-xl gap-2">
          Refresh Logs
        </Button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-50 p-1 rounded-2xl grid grid-cols-3 gap-2">
            <TabsTrigger value="audit" className="rounded-xl px-5 font-black uppercase text-[10px] tracking-widest gap-2 flex items-center justify-center"><ShieldCheck size={14} /> Audit Logs</TabsTrigger>
            <TabsTrigger value="sessions" className="rounded-xl px-5 font-black uppercase text-[10px] tracking-widest gap-2 flex items-center justify-center"><Clock size={14} /> Sessions</TabsTrigger>
            <TabsTrigger value="access" className="rounded-xl px-5 font-black uppercase text-[10px] tracking-widest gap-2 flex items-center justify-center"><Lock size={14} /> Access Control</TabsTrigger>
          </TabsList>

          <TabsContent value="audit" className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Active Audits', value: '12' },
                { title: 'Critical Alerts', value: '2' },
                { title: 'Resolved Issues', value: '38' },
              ].map(metric => (
                <div key={metric.title} className="bg-slate-50 rounded-[28px] p-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{metric.title}</p>
                  <p className="text-3xl font-black text-slate-900">{metric.value}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Active Sessions', detail: '24 active', color: 'bg-emerald-50' },
                { title: 'Expired Sessions', detail: '7 expired', color: 'bg-slate-50' },
              ].map(item => (
                <div key={item.title} className={`rounded-[28px] p-6 ${item.color}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{item.title}</p>
                  <p className="text-2xl font-black text-slate-900">{item.detail}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="access" className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Admin Roles', value: '5' },
                { label: 'Active Keys', value: '18' },
                { label: 'Denied Attempts', value: '11' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-[28px] p-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{item.label}</p>
                  <p className="text-3xl font-black text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
