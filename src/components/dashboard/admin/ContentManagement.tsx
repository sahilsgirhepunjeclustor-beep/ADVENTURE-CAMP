/**
 * @file ContentManagement.tsx
 * @description This component provides a Content Management System (CMS) interface for administrators.
 * It allows for the management of various content types across the platform, including homepage content (hero titles, subtitles, banners),
 * blog posts, Frequently Asked Questions (FAQs), and legal documents (Terms & Conditions, Privacy Policy). It also includes a section for SEO settings.
 *
 * @requires react
 * @requires lucide-react - for icons
 * @requires @/lib/types - for CMS content type definitions (CMSContent, FAQ, BlogPost)
 * @requires @/lib/store - for data persistence functions (getCMSContent, saveCMSContent)
 * @requires @/lib/utils - for utility functions like cn and uid
 * @requires @/components/ui/* - for various UI components (Button, Tabs, Input, Textarea, etc.)
 */

"use client";

// Import necessary libraries, types, and components
import React, { useState, useEffect } from 'react';
import { CMSContent, FAQ, BlogPost } from '@/lib/types';
import { getCMSContent, saveCMSContent } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  FileCode,
  Home,
  HelpCircle,
  BookOpen,
  ShieldAlert,
  Image as ImageIcon,
  Plus,
  Trash2,
  Pencil,
  ArrowLeft,
  Save,
  Globe,
  Settings,
  Layout
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, uid } from '@/lib/utils';
import { DialogTitle } from '@/components/ui/dialog';

/**
 * @interface ContentManagementProps
 * @description Defines the props for the ContentManagement component.
 * @property {() => void} [onBack] - Optional callback function to handle back navigation.
 */
interface ContentManagementProps {
  onBack?: () => void;
}

/**
 * @function ContentManagement
 * @description The main component for managing platform content via a CMS-like interface.
 * @param {ContentManagementProps} props - The component's props.
 * @returns {JSX.Element | null} The rendered component, or null if content is not yet loaded.
 */
export default function ContentManagement({ onBack }: ContentManagementProps) {
  // --- STATE MANAGEMENT ---

  // State to hold the entire CMS content structure.
  const [content, setContent] = useState<CMSContent | null>(null);

  // --- DATA FETCHING ---

  /**
   * @effect
   * @description Fetches the CMS content from the store on component mount.
   */
  useEffect(() => {
    setContent(getCMSContent());
  }, []);

  // --- EVENT HANDLERS ---

  /**
   * @function handleSave
   * @description Saves the current state of the content to the store and shows a toast notification.
   */
  const handleSave = () => {
    if (content) {
      saveCMSContent(content);
      toast({ title: 'Content Published', description: 'Platform updates are now live.' });
    }
  };

  /**
   * @function updateFaq
   * @description Updates a specific field of a FAQ item.
   * @param {number} index - The index of the FAQ to update.
   * @param {keyof FAQ} field - The field to update (e.g., 'question', 'answer').
   * @param {string} value - The new value for the field.
   */
  const updateFaq = (index: number, field: keyof FAQ, value: string) => {
    if (!content) return;
    const newFaqs = [...content.faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setContent({ ...content, faqs: newFaqs });
  };

  /**
   * @function removeFaq
   * @description Removes a FAQ item from the list.
   * @param {number} index - The index of the FAQ to remove.
   */
  const removeFaq = (index: number) => {
    if (!content) return;
    const newFaqs = content.faqs.filter((_, i) => i !== index);
    setContent({ ...content, faqs: newFaqs });
  };

  /**
   * @function addFaq
   * @description Adds a new, empty FAQ item to the list.
   */
  const addFaq = () => {
    if (!content) return;
    const newFaqs = [...content.faqs, { id: uid(), question: '', answer: '' }];
    setContent({ ...content, faqs: newFaqs });
  };

  // --- RENDER METHOD ---

  // Return null if content is not yet loaded to prevent rendering errors.
  if (!content) return null;

  return (
    <div className="space-y-8 pb-20 font-sans max-w-7xl mx-auto px-4 md:px-0 animate-in fade-in duration-500">
      {/* Header with Back and Save buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-12 w-12 border-slate-200 shadow-sm">
              <ArrowLeft size={20} className="text-slate-600" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">CMS & Content Portal</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Global Content Orchestration</p>
          </div>
        </div>
        <Button onClick={handleSave} className="rounded-2xl h-12 px-8 bg-primary hover:bg-accent font-black text-[10px] uppercase tracking-widest shadow-xl text-white gap-2">
           <Save size={16} /> Publish Changes
        </Button>
      </div>

      <Tabs defaultValue="homepage" className="w-full">
        <TabsList className="bg-slate-50 p-1 rounded-2xl mb-8 h-12 flex overflow-x-auto no-scrollbar w-full sm:w-auto">
          <TabsTrigger value="homepage" className="flex-1 sm:flex-none rounded-xl px-6 font-black uppercase text-[10px] tracking-widest gap-2"><Home size={14} /> Homepage</TabsTrigger>
          <TabsTrigger value="blogs" className="flex-1 sm:flex-none rounded-xl px-6 font-black uppercase text-[10px] tracking-widest gap-2"><BookOpen size={14} /> Blogs</TabsTrigger>
          <TabsTrigger value="faqs" className="flex-1 sm:flex-none rounded-xl px-6 font-black uppercase text-[10px] tracking-widest gap-2"><HelpCircle size={14} /> FAQs</TabsTrigger>
          <TabsTrigger value="legal" className="flex-1 sm:flex-none rounded-xl px-6 font-black uppercase text-[10px] tracking-widest gap-2"><ShieldAlert size={14} /> Legal</TabsTrigger>
          <TabsTrigger value="seo" className="flex-1 sm:flex-none rounded-xl px-6 font-black uppercase text-[10px] tracking-widest gap-2"><Globe size={14} /> SEO</TabsTrigger>
        </TabsList>

        {/* Homepage Content Tab */}
        <TabsContent value="homepage" className="space-y-6">
           <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hero Section Heading</Label>
                    <Input
                       value={content.homepage.heroTitle}
                       onChange={e => setContent({...content, homepage: {...content.homepage, heroTitle: e.target.value}})}
                       className="rounded-xl h-12 font-black"
                    />
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hero Subtitle</Label>
                    <Textarea
                       value={content.homepage.heroSubtitle}
                       onChange={e => setContent({...content, homepage: {...content.homepage, heroSubtitle: e.target.value}})}
                       className="rounded-xl min-h-[100px] font-bold"
                    />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Promotional Banners (URLs)</Label>
                    <div className="space-y-3">
                       {content.homepage.banners.map((b, i) => (
                         <div key={i} className="flex gap-2">
                            <Input value={b} className="rounded-xl h-10 text-xs font-bold" readOnly />
                            <Button variant="outline" size="icon" className="h-10 w-10 text-red-400 hover:text-red-500 rounded-xl"><Trash2 size={16} /></Button>
                         </div>
                       ))}
                       <Button variant="outline" className="w-full rounded-xl border-dashed border-slate-300 font-black text-[10px] uppercase h-10">+ Add Banner</Button>
                    </div>
                 </div>
              </div>
           </div>
        </TabsContent>

        {/* Blogs Content Tab */}
        <TabsContent value="blogs" className="space-y-6">
           <div className="flex justify-between items-center px-1">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Article Registry</h3>
              <Button size="sm" variant="outline" className="rounded-xl font-black text-[10px] uppercase h-9 border-primary text-primary px-4">+ New Draft</Button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.blogs.map(blog => (
                <div key={blog.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
                   <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                      <img src={blog.image} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-slate-900 uppercase truncate leading-none mb-1.5">{blog.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{blog.category} • {new Date(blog.publishedAt).toLocaleDateString()}</p>
                   </div>
                   <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl"><Pencil size={14} /></Button>
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl text-red-400 hover:text-red-500"><Trash2 size={14} /></Button>
                   </div>
                </div>
              ))}
           </div>
        </TabsContent>

        {/* FAQs Content Tab */}
        <TabsContent value="faqs" className="space-y-6">
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
              <div className="space-y-6">
                 {content.faqs.map((faq, i) => (
                   <div key={i} className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 space-y-4">
                      <div className="flex justify-between items-center">
                         <Badge className="bg-primary text-white text-[8px] font-black py-0.5 px-2 rounded-lg">FAQ #{i+1}</Badge>
                         <button className="text-red-400 hover:text-red-600 transition-colors" onClick={() => removeFaq(i)}><Trash2 size={14} /></button>
                      </div>
                      <Input
                        value={faq.question}
                        onChange={(e) => updateFaq(i, 'question', e.target.value)}
                        className="rounded-xl h-11 font-black text-xs"
                      />
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                        className="rounded-xl min-h-[80px] text-xs font-bold"
                      />
                   </div>
                 ))}
                 <Button variant="outline" className="w-full rounded-2xl border-dashed border-slate-300 font-black text-[10px] uppercase h-12 shadow-sm" onClick={addFaq}>+ Add Query</Button>
              </div>
           </div>
        </TabsContent>

        {/* Legal Content Tab */}
        <TabsContent value="legal" className="space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                 <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Terms & Conditions</Label>
                 <Textarea
                    value={content.legal.termsAndConditions}
                    onChange={e => setContent({...content, legal: {...content.legal, termsAndConditions: e.target.value}})}
                    className="rounded-xl min-h-[400px] text-xs font-medium leading-relaxed bg-slate-50/50"
                 />
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                 <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Privacy Policy</Label>
                 <Textarea
                    value={content.legal.privacyPolicy}
                    onChange={e => setContent({...content, legal: {...content.legal, privacyPolicy: e.target.value}})}
                    className="rounded-xl min-h-[400px] text-xs font-medium leading-relaxed bg-slate-50/50"
                 />
              </div>
           </div>
        </TabsContent>

        {/* SEO Settings Tab */}
        <TabsContent value="seo" className="space-y-6">
           <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm max-w-2xl">
              <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 mb-8">Metadata Control</h3>
              <div className="space-y-6">
                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase text-slate-400">Global Page Title</Label>
                    <Input defaultValue="TrailWise | Curated Wilderness Expeditions" className="rounded-xl h-12 font-bold" />
                 </div>
                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase text-slate-400">Meta Keywords</Label>
                    <Input defaultValue="adventure, camping, trekking, travel" className="rounded-xl h-12 font-bold" />
                 </div>
                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase text-slate-400">Google Analytics ID</Label>
                    <Input placeholder="G-XXXXXXXXXX" className="rounded-xl h-12 font-mono text-xs uppercase" />
                 </div>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
