"use client";

import React, { useState } from 'react';
import { getUsers, saveUsers, setCurrentUser, addAdminNotification } from '@/lib/store';
import { User, Role, UploadedDoc } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User as UserIcon, 
  Shield, 
  Building2, 
  FileUp,
  CheckCircle2,
  Lock,
  Mail,
  Smartphone,
  MapPin,
  Mountain,
  Camera,
  ChevronRight,
  ArrowLeft,
  Search,
  Key,
  AlertCircle,
  CreditCard,
  Hash,
  Briefcase,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn, uid, compressImage } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'find-email';

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<Role>('user');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Core User Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [dob, setDob] = useState('');
  
  // Organizer Specific Fields
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [stateName, setStateName] = useState('');
  const [established, setEstablished] = useState('');
  const [website, setWebsite] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [primaryLocations, setPrimaryLocations] = useState('');
  const [batchCapacity, setBatchCapacity] = useState('30');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [activities, setActivities] = useState<string[]>([]);

  // Documents
  const [govId, setGovId] = useState<UploadedDoc | undefined>();
  const [regDoc, setRegDoc] = useState<UploadedDoc | undefined>();
  const [panDoc, setPanDoc] = useState<UploadedDoc | undefined>();
  const [bankDoc, setBankDoc] = useState<UploadedDoc | undefined>();
  const [safetyDoc, setSafetyDoc] = useState<UploadedDoc | undefined>();
  const [avatar, setAvatar] = useState<string | undefined>();

  const logoIcon = PlaceHolderImages.find(img => img.id === 'logo-icon');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (doc: UploadedDoc) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast({ title: 'Uploading Document', description: 'Optimizing file for registry audit...' });

    const reader = new FileReader();
    reader.onloadend = async () => {
      let data = reader.result as string;
      
      if (file.type.startsWith('image/')) {
        data = await compressImage(data, 1200, 0.5);
      }

      setter({
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        data: data,
        stored: true
      });
      toast({ title: 'Document Staged', description: `${file.name} is ready for registry audit.` });
    };
    reader.readAsDataURL(file);
  };

  const toggleActivity = (activity: string) => {
    setActivities(prev => 
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const users = getUsers();
    const user = users[email.toLowerCase()];

    if (!user || user.password !== password) {
      setError('Invalid identity credentials.');
      return;
    }

    if (user.role === 'organizer') {
      if (user.isRejected) {
        setError(`Registry Rejected: ${user.rejectionReason || 'Compliance audit failure.'}`);
        return;
      }
      if (!user.isApproved) {
        setError('Organizer registry pending audit. Please check back later.');
        return;
      }
    }

    if (user.status === 'suspended' || user.status === 'blocked') {
      setError(`Account ${user.status}. Contact administration.`);
      return;
    }

    setCurrentUser(user);
    onLogin(user);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !firstName) {
      setError('Mandatory fields required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (role === 'organizer' && (!govId || !regDoc || !panDoc || !bankDoc)) {
      setError('All mandatory verification documents must be uploaded.');
      return;
    }

    const users = getUsers();
    if (users[email.toLowerCase()]) {
      setError('Identity already registered.');
      return;
    }

    const newUser: User = {
      email: email.toLowerCase(),
      firstName,
      lastName,
      phone,
      location,
      dob,
      password,
      role,
      avatar,
      createdAt: new Date().toISOString(),
      isApproved: role !== 'organizer',
      isRejected: false,
      status: 'active',
      organizerProfile: role === 'organizer' ? {
        businessName,
        businessAddress,
        businessPincode: pincode,
        businessState: stateName,
        website,
        establishedYear: established,
        registrationNumber: regNumber,
        gstNumber,
        panNumber,
        locations: primaryLocations,
        activities,
        batchCapacity: parseInt(batchCapacity),
        bankAccount,
        ifscCode,
        bankName,
        govIdDoc: govId,
        registrationDoc: regDoc,
        panDoc,
        bankDoc,
        safetyDoc
      } : undefined
    };

    users[email.toLowerCase()] = newUser;
    saveUsers(users);

    if (role === 'organizer') {
      addAdminNotification({
        id: uid(),
        type: 'approval',
        title: 'New Organizer Registry',
        message: `${firstName} ${lastName} (${businessName}) has requested access. Documents staged for audit.`,
        time: new Date().toISOString(),
        read: false
      });
      setSuccess('Registry request dispatched for audit. We will verify your documents shortly.');
      setMode('login');
    } else {
      setSuccess('Account provisioned. Please login.');
      setMode('login');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const foundUser = users[email.toLowerCase()];

    if (foundUser) {
      addAdminNotification({
        id: uid(),
        type: 'info',
        title: 'Security Alert: Recovery Attempt',
        message: `User ${foundUser.firstName} (${foundUser.email}) requested a reset. Current Password: ${foundUser.password}`,
        time: new Date().toISOString(),
        read: false
      });
      setSuccess('Identity verified. Reset instructions dispatched to inbox.');
      setTimeout(() => setMode('login'), 3000);
    } else {
      setError('Identity not found in global registry.');
    }
  };

  const handleFindAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const users = Object.values(getUsers());
    const found = users.find(u => u.phone === phone);

    if (found) {
      addAdminNotification({
        id: uid(),
        type: 'info',
        title: 'Security Audit: Account Identification',
        message: `Recovery via phone (${phone}) for user ${found.firstName}. Identified Email: ${found.email} | Password: ${found.password}`,
        time: new Date().toISOString(),
        read: false
      });
      setSuccess(`Account identified! Registered email: ${found.email}`);
      setEmail(found.email);
      setTimeout(() => setMode('login'), 5000);
    } else {
      setError('No account matches this mobile number.');
    }
  };

  const renderBranding = () => (
    <div className="pt-12 pb-8 flex flex-col items-center text-center px-6">
       <div className="w-12 h-12 mb-2">
          <img src={logoIcon?.imageUrl} className="w-full h-full object-contain" alt="Logo" />
       </div>
       <h1 className="text-[32px] font-medium text-[#0d2a1d] tracking-tight mb-1">Adventure Camp</h1>
       <div className="flex items-center gap-3 w-full max-w-[280px]">
          <div className="flex-1 h-[1px] bg-slate-100" />
          <span className="text-[9px] font-medium text-green-800 uppercase tracking-[0.2em] whitespace-nowrap">
            {mode === 'forgot-password' || mode === 'find-email' ? 'Security Protocol' : 'Camp Organiser Platform'}
          </span>
          <div className="flex-1 h-[1px] bg-slate-100" />
       </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0d2a1d] relative overflow-hidden py-12 px-4 font-sans font-normal">
      {/* Cinematic Bokeh Background */}
      <div className="absolute top-[15%] left-[5%] w-[35%] h-[35%] bg-green-900/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-green-800/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[20%] w-[20%] h-[20%] bg-green-50/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-[650px] z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-white/90 backdrop-blur-md rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
          
          {renderBranding()}

          {/* Mode Switcher */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="px-10 mb-10">
              <div className="bg-[#f1f5f2] p-1 rounded-[16px] flex">
                 <button 
                   onClick={() => { setMode('login'); setError(null); setSuccess(null); }} 
                   className={cn(
                     "flex-1 py-2.5 rounded-[12px] text-sm font-bold uppercase tracking-tight transition-all",
                     mode === 'login' ? "bg-white text-[#166534] shadow-sm" : "text-slate-400 hover:text-slate-600"
                   )}
                 >
                   Login
                 </button>
                 <button 
                   onClick={() => { setMode('signup'); setError(null); setSuccess(null); }} 
                   className={cn(
                     "flex-1 py-2.5 rounded-[12px] text-sm font-bold uppercase tracking-tight transition-all",
                     mode === 'signup' ? "bg-white text-[#166534] shadow-sm" : "text-slate-400 hover:text-slate-600"
                   )}
                 >
                   Sign Up
                 </button>
              </div>
            </div>
          )}

          <div className="px-10 pb-12">
            {error && <Alert variant="destructive" className="rounded-2xl border-none bg-red-50 mb-6"><AlertDescription className="text-xs font-medium">{error}</AlertDescription></Alert>}
            {success && <Alert className="rounded-2xl border-none bg-green-50 mb-6"><AlertDescription className="text-xs font-medium text-green-700">{success}</AlertDescription></Alert>}

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <div className="space-y-2">
                    <Label className="text-sm font-black uppercase text-slate-900">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                      <Input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="h-12 rounded-xl border-slate-200 bg-white font-medium text-slate-900 text-sm placeholder:text-slate-400 placeholder:font-normal pl-10" 
                        placeholder="admin@gmail.com"
                        required 
                      />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-sm font-black uppercase text-slate-900">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="h-12 rounded-xl border-slate-200 bg-white font-medium text-slate-900 text-sm placeholder:text-slate-400 placeholder:font-normal pl-10 pr-12" 
                        placeholder="••••••"
                        required 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-500 transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                 </div>

                 <div className="pt-4 flex flex-col space-y-6">
                    <div className="flex justify-between items-center">
                       <Button type="submit" className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium h-11 px-8 rounded-xl shadow-md border-none text-xs">
                         Login
                       </Button>
                       <button 
                         type="button" 
                         onClick={() => setMode('forgot-password')}
                         className="text-[11px] font-medium text-[#0891b2] hover:underline"
                       >
                         Forgot password?
                       </button>
                    </div>
                 </div>
              </form>
            )}

            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 max-h-[60vh] overflow-y-auto no-scrollbar pr-1 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-black uppercase text-slate-900">First Name *</Label>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                      <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm placeholder:text-slate-400 pl-10" placeholder="First Name" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-black uppercase text-slate-900">Last Name</Label>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                      <Input value={lastName} onChange={e => setLastName(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm placeholder:text-slate-400 pl-10" placeholder="Last Name" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-black uppercase text-slate-900">Email *</Label>
                     <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm placeholder:text-slate-400 pl-10" placeholder="email@example.com" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-black uppercase text-slate-900">Phone</Label>
                    <div className="relative group">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                      <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm placeholder:text-slate-400 pl-10" placeholder="+91" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                   <Label className="text-sm font-black uppercase text-slate-900">Select Identity Role *</Label>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'user', label: 'User', icon: UserIcon },
                        { id: 'organizer', label: 'Organizer', icon: Mountain },
                        { id: 'admin', label: 'Admin', icon: Shield }
                      ].map(r => (
                        <div 
                          key={r.id} 
                          onClick={() => setRole(r.id as Role)}
                          className={cn(
                            "p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 relative",
                            role === r.id ? "bg-green-50 border-[#22c55e]" : "bg-white border-slate-100 hover:border-slate-200"
                          )}
                        >
                           <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", role === r.id ? "bg-[#22c55e] text-white" : "bg-slate-50 text-slate-400")}>
                              <r.icon size={14} />
                           </div>
                           <p className={cn("text-[10px] font-medium uppercase", role === r.id ? "text-green-700" : "text-slate-900")}>{r.label}</p>
                           {role === r.id && (
                             <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-[#22c55e] text-white rounded-full flex items-center justify-center">
                                <CheckCircle2 size={8} />
                             </div>
                           )}
                        </div>
                      ))}
                   </div>
                </div>

                {role === 'organizer' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-500 border-t border-slate-50 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                       <Briefcase size={16} className="text-[#22c55e]" />
                       <h3 className="text-sm font-medium uppercase tracking-tight text-slate-900">Business Registry Protocol</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-black uppercase text-slate-900">Company Legal Name *</Label>
                        <Input value={businessName} onChange={e => setBusinessName(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-black uppercase text-slate-900">GST Identification (GSTIN) *</Label>
                        <Input value={gstNumber} onChange={e => setGstNumber(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm" placeholder="GSTIN Number" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-black uppercase text-slate-900">Permanent Account Number (PAN) *</Label>
                        <Input value={panNumber} onChange={e => setPanNumber(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm" placeholder="PAN Number" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-black uppercase text-slate-900">Business License / Reg. No *</Label>
                        <Input value={regNumber} onChange={e => setRegNumber(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm" placeholder="License Number" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-black uppercase text-slate-900">Established Year *</Label>
                        <Input value={established} onChange={e => setEstablished(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-black uppercase text-slate-900">HQ State *</Label>
                        <Input value={stateName} onChange={e => setStateName(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm" required />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-black uppercase text-slate-900">Business HQ Address *</Label>
                      <Input value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm" required />
                    </div>

                    <div className="space-y-6 pt-2">
                       <div className="flex items-center gap-2">
                          <CreditCard size={16} className="text-[#22c55e]" />
                          <h3 className="text-sm font-medium uppercase tracking-tight text-slate-900">Settlement Account (Bank Details)</h3>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-sm font-black uppercase text-slate-900">Bank Name *</Label>
                            <Input value={bankName} onChange={e => setBankName(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm" required />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-sm font-black uppercase text-slate-900">Account Number *</Label>
                            <Input value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm" required />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-sm font-black uppercase text-slate-900">IFSC Code *</Label>
                            <Input value={ifscCode} onChange={e => setIfscCode(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm uppercase" required />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <Label className="text-sm font-black uppercase text-slate-900">Activities Offered *</Label>
                       <div className="grid grid-cols-2 gap-2">
                          {['Trekking', 'River Rafting', 'Bonfire', 'Camping'].map(a => (
                            <div key={a} className="flex items-center gap-2">
                               <Checkbox id={a} checked={activities.includes(a)} onCheckedChange={() => toggleActivity(a)} className="h-4 w-4 rounded-md" />
                               <Label htmlFor={a} className="text-sm font-medium text-slate-800 uppercase cursor-pointer">{a}</Label>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-[#22c55e]" />
                          <Label className="text-sm font-medium uppercase text-slate-900">Registry Verification Assets (Mandatory) *</Label>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: 'Government ID', setter: setGovId, doc: govId, icon: UserIcon },
                            { label: 'Business License', setter: setRegDoc, doc: regDoc, icon: Building2 },
                            { label: 'PAN Card Copy', setter: setPanDoc, doc: panDoc, icon: Hash },
                            { label: 'Cancelled Cheque', setter: setBankDoc, doc: bankDoc, icon: CreditCard }
                          ].map((item) => (
                            <div key={item.label} className="relative">
                               <div className={cn(
                                 "border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer h-24",
                                 item.doc ? "border-[#22c55e] bg-green-50" : "border-slate-200 hover:border-slate-300"
                               )}>
                                  {item.doc ? <CheckCircle2 size={18} className="text-[#22c55e] mb-1.5" /> : <item.icon size={18} className="text-slate-300 mb-1.5" />}
                                  <p className="text-[9px] font-medium uppercase text-slate-500 text-center leading-tight">
                                    {item.doc ? item.doc.name : item.label}
                                  </p>
                                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, item.setter)} />
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-black uppercase text-slate-900">Password *</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm placeholder:text-slate-400 pl-10 pr-12" 
                        placeholder="••••••••" 
                        required 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-500 transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-black uppercase text-slate-900">Confirm Password *</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                      <Input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        className="h-11 rounded-xl border-slate-200 font-medium text-slate-900 text-sm placeholder:text-slate-400 pl-10 pr-12" 
                        placeholder="••••••••" 
                        required 
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-500 transition-colors">
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full h-12 bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-green-500/20 border-none">
                    Create Registry
                  </Button>
                </div>
              </form>
            )}

            {mode === 'forgot-password' && (
              <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                   <div className="w-14 h-14 bg-blue-50 text-[#0891b2] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Key size={28} />
                   </div>
                   <h2 className="text-lg font-medium text-slate-900 uppercase tracking-tight">Identity Recovery</h2>
                   <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">Enter your email to reset password</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-sm font-black uppercase text-slate-900">Registered Email</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                        <Input 
                          type="email" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          className="h-12 rounded-xl border-slate-200 font-medium text-slate-900 text-sm placeholder:text-slate-400 pl-10" 
                          placeholder="email@example.com"
                          required 
                        />
                      </div>
                   </div>
                   <Button type="submit" className="w-full h-12 bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium uppercase text-xs rounded-xl shadow-lg border-none">
                      Request Reset Link
                   </Button>
                </form>

                <div className="pt-4 flex flex-col items-center gap-4">
                   <button 
                     onClick={() => { setMode('find-email'); setError(null); setSuccess(null); }}
                     className="text-[11px] font-medium text-[#0891b2] hover:underline flex items-center gap-2"
                   >
                     <Search size={14} /> Forgot email? Find my account
                   </button>
                   <button 
                     onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                     className="text-[11px] font-medium text-slate-400 hover:text-slate-600 flex items-center gap-2"
                   >
                     <ArrowLeft size={14} /> Back to Login
                   </button>
                </div>
              </div>
            )}

            {mode === 'find-email' && (
              <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                   <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search size={28} />
                   </div>
                   <h2 className="text-lg font-medium text-slate-900 uppercase tracking-tight">Account Identification</h2>
                   <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">Find your registry email via phone</p>
                </div>

                <form onSubmit={handleFindAccount} className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-sm font-black uppercase text-slate-900">Registered Mobile Number</Label>
                      <div className="relative group">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                        <Input 
                          type="tel" 
                          value={phone} 
                          onChange={e => setPhone(e.target.value)} 
                          className="h-12 rounded-xl border-slate-200 font-medium text-slate-900 text-sm placeholder:text-slate-400 pl-10" 
                          placeholder="+91"
                          required 
                        />
                      </div>
                   </div>
                   <Button type="submit" className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium uppercase text-xs rounded-xl shadow-lg border-none">
                      Locate My Account
                   </Button>
                </form>

                <div className="pt-4 flex flex-col items-center gap-4">
                   <button 
                     onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                     className="text-[11px] font-medium text-slate-400 hover:text-slate-600 flex items-center gap-2"
                   >
                     <ArrowLeft size={14} /> Back to Login
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
