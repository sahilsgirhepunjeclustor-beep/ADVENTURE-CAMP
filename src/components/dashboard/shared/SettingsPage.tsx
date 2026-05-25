"use client";

import React, { useState } from 'react';
import { User, TeamMember, SocialLinks } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  ArrowLeft,
  Settings,
  ShieldCheck,
  IndianRupee,
  Bell,
  Globe,
  Database,
  Key,
  ShieldAlert,
  Zap,
  Activity,
  LogOut,
  Clock,
  Layout,
  Server,
  CreditCard,
  Percent,
  CheckCircle2,
  Calendar,
  HeartPulse,
  HeartHandshake,
  Eye,
  EyeOff,
  Building2,
  Users,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Plus,
  Trash2,
  Award,
  Lock,
  Smartphone,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { cn, uid, compressImage } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsPageProps {
  currentUser: User;
  onUpdateProfile: (user: User) => void;
  onBack?: () => void;
  onLogout?: () => void;
}

export default function SettingsPage({ currentUser, onUpdateProfile, onBack, onLogout }: SettingsPageProps) {
  const isAdmin = currentUser.role === 'admin';
  const isOrganizer = currentUser.role === 'organizer';
  
  // Personal State
  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [lastName, setLastName] = useState(currentUser.lastName);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [dob, setDob] = useState(currentUser.dob || '');
  const [gender, setGender] = useState(currentUser.gender || 'Prefer not to say');
  const [emergencyContact, setEmergencyContact] = useState(currentUser.emergencyContact || '');
  const [medicalInfo, setMedicalInfo] = useState(currentUser.medicalInfo || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);

  // Security State
  const [password, setPassword] = useState(currentUser.password || '');
  const [showPassword, setShowPassword] = useState(false);

  // Organizer Business State
  const [expDetails, setExpDetails] = useState(currentUser.organizerProfile?.experienceDetails || '');
  const [team, setTeam] = useState<TeamMember[]>(currentUser.organizerProfile?.teamMembers || []);
  const [certs, setCertifications] = useState<string[]>(currentUser.organizerProfile?.certifications || []);
  const [socials, setSocials] = useState<SocialLinks>(currentUser.organizerProfile?.socialLinks || {});

  // Admin Platform State
  const [platformName, setPlatformName] = useState('Adventure Camping');
  const [commission, setCommission] = useState('10');
  const [taxRate, setTaxRate] = useState('18');
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [payoutLimit, setPayoutLimit] = useState('5000');

  // API Visibility State
  const [showMapsKey, setShowMapsKey] = useState(false);
  const [showPaymentKey, setShowPaymentKey] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast({ title: 'Processing Image', description: 'Optimizing profile avatar...' });

    const reader = new FileReader();
    reader.onloadend = async () => {
      const data = reader.result as string;
      const compressed = await compressImage(data, 400, 0.7);
      setAvatar(compressed);
      toast({ title: 'Avatar Staged', description: 'Save profile to commit changes.' });
    };
    reader.readAsDataURL(file);
  };

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentUser,
      firstName,
      lastName,
      phone,
      location,
      dob,
      gender: gender as any,
      emergencyContact,
      medicalInfo,
      avatar,
      password
    });
    toast({ title: 'Profile Synchronized', description: 'Your identity and security credentials have been updated.' });
  };

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.organizerProfile) return;

    onUpdateProfile({
      ...currentUser,
      organizerProfile: {
        ...currentUser.organizerProfile,
        experienceDetails: expDetails,
        teamMembers: team,
        certifications: certs,
        socialLinks: socials
      }
    });
    toast({ title: 'Business Profile Updated', description: 'Your company details are now live.' });
  };

  const handleSaveGlobal = () => {
    toast({ title: 'System Config Committed', description: 'Platform-wide parameters are now live across all nodes.' });
  };

  const addTeamMember = () => {
    setTeam([...team, { id: uid(), name: '', role: '' }]);
  };

  const removeTeamMember = (id: string) => {
    setTeam(team.filter(m => m.id !== id));
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string) => {
    setTeam(team.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addCert = () => {
    setCertifications([...certs, '']);
  };

  const removeCert = (idx: number) => {
    setCertifications(certs.filter((_, i) => i !== idx));
  };

  const updateCert = (idx: number, value: string) => {
    const newCerts = [...certs];
    newCerts[idx] = value;
    setCertifications(newCerts);
  };

  const auditLogs = [
    { event: 'Platform Commission updated from 8% to 10%', time: '2 hours ago', user: 'Super Admin', type: 'financial' },
    { event: 'Global Security Protocol: 2FA enforced for all partners', time: '5 hours ago', user: 'System', type: 'security' },
    { event: 'Database Backup Completed (1.2GB)', time: 'Yesterday', user: 'Auto-Bot', type: 'system' },
    { event: 'New Membership Plan "Elite Nomad" Published', time: '2 days ago', user: 'Admin', type: 'content' },
  ];

  return (
    <div className="max-w-[1100px] mx-auto space-y-8 pb-32 font-sans px-4 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
            <h2 className="text-2xl font-medium text-slate-900 uppercase tracking-tighter leading-none">Account Ecosystem</h2>
            <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest mt-1 opacity-70">
              {isAdmin ? 'Platform Command Center' : isOrganizer ? 'Business Identity & Operations' : 'Personal Security & Preferences'}
            </p>
          </div>
        </div>
        {isAdmin && (
           <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[9px] font-medium uppercase tracking-widest px-3 py-1 rounded-xl">
             System Admin Level Access
           </Badge>
        )}
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-[16px] mb-8 h-auto flex flex-wrap lg:flex-nowrap w-full lg:w-max gap-1">
          <TabsTrigger value="profile" className="rounded-xl px-5 py-2 font-medium uppercase text-[9px] tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <UserIcon size={12} /> Profile Registry
          </TabsTrigger>
          {isOrganizer && (
            <TabsTrigger value="company" className="rounded-xl px-5 py-2 font-medium uppercase text-[9px] tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Building2 size={12} /> Company Identity
            </TabsTrigger>
          )}
          {isAdmin && (
            <>
              <TabsTrigger value="platform" className="rounded-xl px-5 py-2 font-medium uppercase text-[9px] tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Globe size={12} /> Platform Core
              </TabsTrigger>
              <TabsTrigger value="financial" className="rounded-xl px-5 py-2 font-medium uppercase text-[9px] tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <IndianRupee size={12} /> Revenue Guard
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-xl px-5 py-2 font-medium uppercase text-[9px] tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Activity size={12} /> Global Audit
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="profile" className="mt-0 outline-none">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left relative overflow-hidden">
              <div className="relative group z-10">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[32px] bg-primary flex items-center justify-center text-white text-3xl font-medium overflow-hidden shadow-2xl ring-8 ring-white transition-transform group-hover:scale-105 duration-500">
                  {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : currentUser.firstName[0]}
                </div>
                <label className="absolute -bottom-1 -right-1 w-9 h-9 bg-white rounded-xl shadow-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all border border-slate-100 cursor-pointer group-hover:rotate-12">
                  <Camera size={16} />
                  <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} />
                </label>
              </div>
              <div className="flex-1 z-10">
                <h3 className="text-xl md:text-2xl font-medium text-slate-900 uppercase tracking-tighter leading-none mb-1.5">{currentUser.firstName} {currentUser.lastName}</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center mb-4">
                  <Badge className="bg-primary text-white border-none font-medium uppercase text-[8px] tracking-widest px-2 py-0.5 rounded-lg shadow-lg">
                    {currentUser.role} Level Profile
                  </Badge>
                  <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-primary" /> Verified Account
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 text-[9px] font-normal text-slate-400 uppercase">
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-primary/20"><Mail size={10} className="text-primary" /> {currentUser.email}</span>
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-primary/20"><Clock size={10} className="text-primary" /> Joined {new Date(currentUser.createdAt).getFullYear()}</span>
                </div>
              </div>
              <div className="flex gap-2 z-10">
                 <Button onClick={onLogout} variant="outline" className="rounded-xl font-medium text-[9px] uppercase tracking-widest border-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all h-11 px-6 shadow-sm">
                    <LogOut size={14} className="mr-2" /> Sign Out
                 </Button>
              </div>
              <div className="absolute top-0 right-0 w-48 h-full bg-primary/5 skew-x-[-25deg] translate-x-12 pointer-events-none" />
            </div>

            <form onSubmit={handleSavePersonal} className="p-6 md:p-10 space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7 space-y-10">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary flex items-center gap-3 mb-1">
                        <UserIcon size={16} /> Identity Registry
                      </h4>
                      <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">Global platform identification</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-medium uppercase text-slate-400 tracking-widest">First Name</Label>
                        <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="rounded-xl h-12 font-medium text-sm bg-slate-50/50 border-slate-100 focus:bg-white transition-all" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-medium uppercase text-slate-400 tracking-widest">Last Name</Label>
                        <Input value={lastName} onChange={e => setLastName(e.target.value)} className="rounded-xl h-12 font-medium text-sm bg-slate-50/50 border-slate-100 focus:bg-white transition-all" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-medium uppercase text-slate-400 tracking-widest">Birth Registry (DOB)</Label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                          <Input type="date" value={dob} onChange={e => setDob(e.target.value)} className="rounded-xl h-12 pl-11 font-medium text-sm bg-slate-50/50 border-slate-100 focus:bg-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-medium uppercase text-slate-400 tracking-widest">Gender Orientation</Label>
                        <Select value={gender} onValueChange={(v: any) => setGender(v)}>
                          <SelectTrigger className="rounded-xl h-12 font-medium text-sm bg-slate-50/50 border-slate-100 focus:bg-white transition-all">
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                            <SelectItem value="Male" className="text-xs font-medium uppercase">Male</SelectItem>
                            <SelectItem value="Female" className="text-xs font-medium uppercase">Female</SelectItem>
                            <SelectItem value="Other" className="text-xs font-medium uppercase">Other Identity</SelectItem>
                            <SelectItem value="Prefer not to say" className="text-xs font-medium uppercase">Private / N.A.</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-50" />

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary flex items-center gap-3 mb-1">
                        <Key size={16} /> Security Credentials
                      </h4>
                      <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">Access key management</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                          <Label className="text-[9px] font-medium uppercase text-slate-400 tracking-widest">Registry Password</Label>
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-[9px] font-medium text-primary uppercase hover:underline flex items-center gap-1"
                          >
                            {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                            {showPassword ? 'Hide Key' : 'Reveal Key'}
                          </button>
                        </div>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Set new access key"
                            className="rounded-xl h-12 pl-11 font-medium text-sm bg-slate-50/50 border-slate-100 focus:bg-white" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-10">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary flex items-center gap-3 mb-1">
                        <HeartPulse size={16} /> Expedition Bio
                      </h4>
                      <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">Critical safety information</p>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-medium uppercase text-slate-400 tracking-widest">Emergency Dispatch Contact</Label>
                        <div className="relative">
                          <HeartHandshake size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                          <Input value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="Name & Mobile (+91)" className="rounded-xl h-12 pl-11 font-medium text-sm bg-slate-50/50 border-slate-100" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-medium uppercase text-slate-400 tracking-widest">Medical Intelligence</Label>
                        <textarea 
                          value={medicalInfo} 
                          onChange={e => setMedicalInfo(e.target.value)} 
                          placeholder="Document allergies, existing conditions, or chronic requirements..." 
                          className="w-full rounded-2xl min-h-[100px] p-4 font-normal text-xs bg-slate-50/50 border border-slate-100 outline-none focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary flex items-center gap-3 mb-1">
                        <Phone size={16} /> Communication
                      </h4>
                      <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">Contact & geo-location</p>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-medium uppercase text-slate-400 tracking-widest">Primary Mobile</Label>
                        <div className="relative">
                          <Smartphone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91" className="rounded-xl h-12 pl-11 font-medium text-sm bg-slate-50/50 border-slate-100" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-medium uppercase text-slate-400 tracking-widest">Operational Headquarters (City)</Label>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                          <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Mumbai, Maharashtra" className="rounded-xl h-12 pl-11 font-medium text-sm bg-slate-50/50 border-slate-100" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10 flex items-center gap-4 shadow-inner">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0 text-primary">
                      <ShieldAlert size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-900 uppercase tracking-tight mb-0.5">Privacy Lock Enabled</p>
                      <p className="text-[8px] text-slate-400 font-normal uppercase leading-relaxed tracking-widest">Your sensitive medical and contact data is encrypted and only shared with verified organizers of trips you book.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 flex flex-col sm:flex-row justify-end gap-4 border-t border-slate-50">
                 <Button type="button" variant="ghost" className="rounded-xl font-medium uppercase text-[10px] tracking-widest h-14 px-8 order-2 sm:order-1">Reset Fields</Button>
                 <Button type="submit" className="rounded-2xl px-12 font-medium uppercase tracking-[0.15em] h-14 shadow-2xl shadow-primary/20 text-white border-none bg-primary text-[11px] order-1 sm:order-2">
                   Commit Profile Updates
                 </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        {isOrganizer && (
          <TabsContent value="company" className="mt-0 outline-none">
             <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                <form onSubmit={handleSaveBusiness} className="p-6 md:p-10 space-y-12">
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                      <div className="lg:col-span-7 space-y-10">
                         <div>
                            <h4 className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary flex items-center gap-3 mb-1">
                               <Building2 size={16} /> Business Heritage
                            </h4>
                            <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">Professional pedigree & narrative</p>
                         </div>

                         <div className="space-y-3">
                            <Label className="text-[9px] font-medium uppercase text-slate-400 tracking-widest">Expeditionary Experience (Narrative)</Label>
                            <textarea 
                              value={expDetails}
                              onChange={e => setExpDetails(e.target.value)}
                              placeholder="Detail your company's heritage, safety record, and specialized trail knowledge..."
                              className="w-full rounded-2xl min-h-[200px] p-5 font-normal text-xs bg-slate-50/50 border border-slate-100 outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed shadow-inner"
                            />
                         </div>

                         <div className="space-y-8 pt-4">
                            <div>
                               <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary flex items-center gap-3 mb-6">
                                  <Award size={16} /> Industry Certifications
                               </h4>
                               <div className="space-y-3">
                                  {certs.map((cert, idx) => (
                                    <div key={idx} className="flex gap-2 animate-in slide-in-from-left-2">
                                       <Input 
                                         value={cert} 
                                         onChange={e => updateCert(idx, e.target.value)}
                                         placeholder="e.g. Mountaineering Institute Grade-A"
                                         className="rounded-xl h-12 bg-slate-50/50 font-medium text-sm border-slate-100"
                                       />
                                       <Button variant="outline" size="icon" onClick={() => removeCert(idx)} className="h-12 w-12 rounded-xl text-red-400 hover:text-red-500 border-slate-100 shadow-sm"><Trash2 size={18} /></Button>
                                    </div>
                                  ))}
                                  <Button variant="outline" onClick={addCert} className="w-full h-12 rounded-xl border-dashed border-slate-300 font-medium text-[10px] uppercase tracking-widest gap-2 bg-slate-50/30">
                                     <Plus size={16} /> Add Recognition / Permit
                                  </Button>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="lg:col-span-5 space-y-10">
                         <div className="space-y-8">
                            <div>
                               <h4 className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary flex items-center gap-3 mb-1">
                                  <Users size={16} /> Operations Team
                               </h4>
                               <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">Key field personnel & guides</p>
                            </div>

                            <div className="space-y-4">
                               {team.map((member) => (
                                 <div key={member.id} className="p-5 bg-slate-50/50 rounded-[24px] border border-slate-100 flex flex-col sm:flex-row gap-4 animate-in slide-in-from-right-2 hover:bg-white transition-all shadow-sm">
                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                       <div className="space-y-1.5">
                                          <Label className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">Name</Label>
                                          <Input 
                                            value={member.name}
                                            onChange={e => updateTeamMember(member.id, 'name', e.target.value)}
                                            className="h-10 rounded-lg bg-white border-none font-medium text-xs shadow-sm"
                                          />
                                       </div>
                                       <div className="space-y-1.5">
                                          <Label className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">Specialization</Label>
                                          <Input 
                                            value={member.role}
                                            onChange={e => updateTeamMember(member.id, 'role', e.target.value)}
                                            className="h-10 rounded-lg bg-white border-none font-medium text-xs shadow-sm"
                                          />
                                       </div>
                                    </div>
                                    <div className="flex items-end">
                                       <Button variant="outline" size="icon" onClick={() => removeTeamMember(member.id)} className="h-10 w-10 rounded-lg text-red-300 hover:text-red-500 border-none bg-white shadow-sm"><Trash2 size={16} /></Button>
                                    </div>
                                 </div>
                               ))}
                               <Button variant="outline" onClick={addTeamMember} className="w-full h-12 rounded-xl border-dashed border-slate-300 font-medium text-[10px] uppercase tracking-widest gap-2">
                                  <Plus size={16} /> Register Key Personnel
                               </Button>
                            </div>
                         </div>

                         <Separator className="bg-slate-50" />

                         <div className="space-y-8">
                            <div>
                               <h4 className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary flex items-center gap-3 mb-1">
                                  <Globe size={16} /> Digital Footprint
                               </h4>
                               <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">Social connectivity</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                               {[
                                 { icon: Instagram, key: 'instagram', label: '@handle', color: 'text-pink-500', bg: 'bg-pink-50' },
                                 { icon: Facebook, key: 'facebook', label: 'FB Page URL', color: 'text-blue-600', bg: 'bg-blue-50' },
                                 { icon: Twitter, key: 'twitter', label: '@handle_x', color: 'text-slate-900', bg: 'bg-slate-50' },
                                 { icon: Linkedin, key: 'linkedin', label: 'Company Page', color: 'text-blue-700', bg: 'bg-blue-50' }
                               ].map(item => (
                                 <div key={item.key} className="group flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-transparent group-hover:border-slate-100 transition-all shadow-sm", item.bg, item.color)}>
                                       <item.icon size={16} />
                                    </div>
                                    <Input 
                                      value={(socials as any)[item.key] || ''}
                                      onChange={e => setSocials({...socials, [item.key]: e.target.value})}
                                      placeholder={item.label}
                                      className="h-11 rounded-xl bg-slate-50/50 border-slate-100 font-medium text-xs focus:bg-white"
                                    />
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="pt-10 flex justify-end gap-4 border-t border-slate-50">
                      <Button type="submit" className="rounded-2xl px-12 font-medium uppercase tracking-[0.15em] h-14 shadow-2xl shadow-primary/20 text-white border-none bg-primary text-[11px]">
                        Save Company Identity
                      </Button>
                   </div>
                </form>
             </div>
          </TabsContent>
        )}

        {isAdmin && (
          <>
            <TabsContent value="platform" className="mt-0 space-y-6 outline-none animate-in fade-in slide-in-from-right-2">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 bg-white p-6 md:p-10 rounded-[40px] border border-slate-100 shadow-xl space-y-10">
                    <section className="space-y-8">
                      <div>
                        <h3 className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary flex items-center gap-3 mb-1"><Layout size={16} /> Core Branding</h3>
                        <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">Global platform identification</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label className="text-[9px] font-medium uppercase text-slate-400 tracking-widest">Platform Identity Name</Label>
                           <Input value={platformName} onChange={e => setPlatformName(e.target.value)} className="rounded-xl h-12 font-medium text-sm bg-slate-50/50 border-slate-100" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[9px] font-medium uppercase text-slate-400 tracking-widest">Primary Support Node (Email)</Label>
                           <Input defaultValue="ops@trailwise.platform" className="rounded-xl h-12 font-normal text-xs bg-slate-50/50 border-slate-100" />
                        </div>
                      </div>
                    </section>

                    <Separator className="bg-slate-50" />

                    <section className="space-y-8">
                      <div>
                        <h3 className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary flex items-center gap-3 mb-1"><Server size={16} /> Global States</h3>
                        <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">Runtime system parameters</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center justify-between group hover:bg-white transition-all shadow-sm">
                           <div className="space-y-1">
                              <p className="text-[11px] font-medium uppercase text-slate-900 leading-tight">Maintenance Protocol</p>
                              <p className="text-[8px] text-slate-400 font-normal uppercase tracking-widest">Disable marketplace nodes</p>
                           </div>
                           <Switch className="scale-100" checked={isMaintenance} onCheckedChange={setIsMaintenance} />
                        </div>
                        <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center justify-between group hover:bg-white transition-all shadow-sm">
                           <div className="space-y-1">
                              <p className="text-[11px] font-medium uppercase text-slate-900 leading-tight">Snapshot Auto-Archiving</p>
                              <p className="text-[8px] text-slate-400 font-normal uppercase tracking-widest">Encrypted backups every 12h</p>
                           </div>
                           <Badge className="bg-green-500 text-white border-none font-medium text-[8px] px-3 py-1 rounded-full shadow-lg shadow-green-500/20">LIVE</Badge>
                        </div>
                      </div>
                    </section>
                    
                    <div className="pt-4 flex justify-end">
                       <Button onClick={handleSaveGlobal} className="h-14 px-10 rounded-2xl bg-primary hover:bg-accent text-white font-medium text-[11px] uppercase tracking-widest shadow-2xl shadow-primary/20 border-none">Publish Platform Updates</Button>
                    </div>
                  </div>

                  <div className="lg:col-span-4 h-full">
                     <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden h-full flex flex-col border border-white/5">
                        <div className="relative z-10 space-y-8 flex-1">
                           <div>
                              <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary mb-2">Security Architecture</h3>
                              <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">Encrypted secrets & api nodes</p>
                           </div>
                           <div className="space-y-6">
                              <div className="space-y-2">
                                 <div className="flex justify-between items-center mb-1">
                                   <Label className="text-[9px] font-medium uppercase text-slate-500 tracking-widest">Geo-Map API Matrix</Label>
                                   <button onClick={() => setShowMapsKey(!showMapsKey)} className="text-[9px] font-medium text-primary uppercase flex items-center gap-1 hover:underline">
                                      {showMapsKey ? <EyeOff size={10} /> : <Eye size={10} />}
                                      {showMapsKey ? 'Hide' : 'Reveal'}
                                   </button>
                                 </div>
                                 <div className="relative">
                                    <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                                    <Input 
                                      type={showMapsKey ? "text" : "password"} 
                                      value="AIzaSyA_TW_NODE_89Xj_Pz1" 
                                      className="rounded-xl h-11 pl-11 font-mono text-[10px] bg-white/5 border-white/10 text-slate-300 focus:bg-white/10" 
                                      readOnly 
                                    />
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <div className="flex justify-between items-center mb-1">
                                   <Label className="text-[9px] font-medium uppercase text-slate-500 tracking-widest">Payment Settlement Secret</Label>
                                   <button onClick={() => setShowPaymentKey(!showPaymentKey)} className="text-[9px] font-medium text-primary uppercase flex items-center gap-1 hover:underline">
                                      {showPaymentKey ? <EyeOff size={10} /> : <Eye size={10} />}
                                      {showPaymentKey ? 'Hide' : 'Reveal'}
                                   </button>
                                 </div>
                                 <div className="relative">
                                    <Zap size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                                    <Input 
                                      type={showPaymentKey ? "text" : "password"} 
                                      value="sk_test_TRAILWISE_SSL_SECURE" 
                                      className="rounded-xl h-11 pl-11 font-mono text-[10px] bg-white/5 border-white/10 text-slate-300 focus:bg-white/10" 
                                      readOnly 
                                    />
                                 </div>
                              </div>
                           </div>
                           <div className="pt-10 flex items-start gap-4 text-orange-400">
                              <ShieldAlert size={24} className="shrink-0 animate-shake" />
                              <p className="text-[8px] font-medium uppercase tracking-[0.15em] leading-relaxed">System parameters are immutable during active sync. Modifications are logged to the global audit trail.</p>
                           </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-[-25deg] translate-x-16 pointer-events-none" />
                     </div>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="financial" className="mt-0 animate-in fade-in slide-in-from-right-2">
               <div className="bg-white p-6 md:p-10 rounded-[40px] border border-slate-100 shadow-xl space-y-10">
                  <div>
                     <h3 className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary flex items-center gap-3 mb-1"><CreditCard size={16} /> Financial Governance</h3>
                     <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">Platform protocol yields and taxation logic</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-3 p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:bg-white transition-all shadow-sm group">
                        <div className="flex justify-between items-center">
                           <Label className="text-[9px] font-medium uppercase text-slate-400 tracking-widest">Protocol Fee (%)</Label>
                           <Percent size={14} className="text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        <Input value={commission} onChange={e => setCommission(e.target.value)} className="h-12 font-medium text-2xl border-none bg-transparent p-0 focus-visible:ring-0 text-slate-900" />
                        <p className="text-[8px] text-slate-400 font-normal uppercase">Applied to all gross bookings</p>
                     </div>
                     <div className="space-y-3 p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:bg-white transition-all shadow-sm group">
                        <div className="flex justify-between items-center">
                           <Label className="text-[9px] font-medium uppercase text-slate-400 tracking-widest">GST Regulation (%)</Label>
                           <IndianRupee size={14} className="text-slate-400" />
                        </div>
                        <Input value={taxRate} onChange={e => setTaxRate(e.target.value)} className="h-12 font-medium text-2xl border-none bg-transparent p-0 focus-visible:ring-0 text-slate-900" />
                        <p className="text-[8px] text-slate-400 font-normal uppercase">Standard Service Tax compliance</p>
                     </div>
                     <div className="space-y-3 p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:bg-white transition-all shadow-sm group">
                        <div className="flex justify-between items-center">
                           <Label className="text-[9px] font-medium uppercase text-slate-400 tracking-widest">Settlement Floor (₹)</Label>
                           <ArrowUpRight size={14} className="text-emerald-500" />
                        </div>
                        <Input value={payoutLimit} onChange={e => setPayoutLimit(e.target.value)} className="h-12 font-medium text-2xl border-none bg-transparent p-0 focus-visible:ring-0 text-slate-900" />
                        <p className="text-[8px] text-slate-400 font-normal uppercase">Minimum payout dispatch amount</p>
                     </div>
                  </div>

                  <div className="p-8 bg-[#0d2a1d] rounded-[32px] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
                     <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner border border-primary/20"><CheckCircle2 size={32} /></div>
                           <div>
                              <p className="text-sm font-medium uppercase tracking-tight">Active Financial Cycle: T+3</p>
                              <p className="text-[9px] text-green-200/60 font-normal uppercase tracking-widest">Settlements dispatched every 72 operational hours</p>
                           </div>
                        </div>
                     </div>
                     <Button onClick={handleSaveGlobal} className="relative z-10 h-14 px-10 rounded-2xl bg-primary hover:bg-accent text-white font-medium text-[11px] uppercase tracking-widest border-none shadow-2xl shadow-black/40">Commit Ledger Policy</Button>
                     <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-[-20deg] translate-x-24 pointer-events-none" />
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="security" className="mt-0 animate-in fade-in slide-in-from-right-2 h-full outline-none">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                  <div className="lg:col-span-8">
                     <div className="bg-white p-6 md:p-10 rounded-[40px] border border-slate-100 shadow-xl space-y-10 h-full">
                        <div>
                           <h3 className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary flex items-center gap-3 mb-1"><Activity size={16} /> Global Operational Log</h3>
                           <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">Administrative trace & tamper-proof ledger</p>
                        </div>
                        <div className="space-y-4">
                           {auditLogs.map((log, i) => (
                             <div key={i} className="p-5 bg-slate-50/50 rounded-[28px] border border-slate-100 flex items-center justify-between group hover:bg-white transition-all shadow-sm">
                                <div className="flex items-center gap-5">
                                   <div className={cn(
                                     "w-11 h-11 rounded-xl flex items-center justify-center shadow-md border border-white",
                                     log.type === 'financial' ? "bg-emerald-50 text-emerald-600" :
                                     log.type === 'security' ? "bg-orange-50 text-orange-600" :
                                     "bg-blue-50 text-blue-600"
                                   )}>
                                      {log.type === 'financial' ? <IndianRupee size={20} /> : 
                                       log.type === 'security' ? <ShieldCheck size={20} /> : 
                                       <Database size={20} />}
                                   </div>
                                   <div>
                                      <p className="text-xs font-medium uppercase text-slate-900 leading-tight mb-1">{log.event}</p>
                                      <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">{log.user} • {log.time}</p>
                                   </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 group-hover:text-primary transition-colors"><Settings size={18} /></Button>
                             </div>
                           ))}
                        </div>
                        <Button variant="outline" className="w-full h-12 rounded-2xl border-dashed border-slate-300 font-medium text-[10px] uppercase tracking-widest bg-slate-50/30 hover:bg-white transition-all">Audit Platform Logs (v2.5)</Button>
                     </div>
                  </div>

                  <div className="lg:col-span-4 space-y-8">
                     <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl flex flex-col h-full border border-white/5">
                        <div className="flex-1 space-y-10">
                           <div>
                              <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary mb-2">Access Control Node</h3>
                              <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">Enforce session governance</p>
                           </div>
                           <div className="space-y-8">
                              <div className="space-y-3">
                                 <Label className="text-[9px] font-medium uppercase text-slate-500 tracking-widest px-1">Session Inactivity Lock</Label>
                                 <div className="relative">
                                   <select className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-5 font-medium text-[10px] outline-none appearance-none cursor-pointer uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all">
                                      <option className="text-slate-900">30 MINS PROTOCOL</option>
                                      <option className="text-slate-900">1 HOUR PROTOCOL</option>
                                      <option className="text-slate-900">EXTENDED 4 HOURS</option>
                                   </select>
                                   <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                                 </div>
                              </div>
                              <div className="p-6 bg-white/5 rounded-[28px] border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all shadow-inner">
                                 <div className="space-y-1">
                                    <p className="text-xs font-medium uppercase text-white leading-none">IP Node Lock</p>
                                    <p className="text-[8px] text-slate-500 font-normal uppercase tracking-widest">Restrict by whitelisted IP</p>
                                 </div>
                                 <Badge className="bg-orange-500 text-white border-none font-medium text-[8px] px-3 py-1 rounded-full shadow-lg shadow-orange-500/20">ENFORCED</Badge>
                              </div>
                           </div>
                        </div>
                        <div className="pt-12">
                           <Button className="w-full h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-[11px] uppercase tracking-widest border-none shadow-2xl shadow-black/40 group transition-all">
                             <Lock size={16} className="mr-3 group-hover:scale-110 transition-transform" /> Kill All Active Sessions
                           </Button>
                        </div>
                     </div>
                  </div>
               </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}