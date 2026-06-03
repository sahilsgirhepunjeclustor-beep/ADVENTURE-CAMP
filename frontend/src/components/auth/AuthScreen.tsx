
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
  CheckCircle2,
  Lock,
  Mail,
  Smartphone,
  Mountain,
  ArrowLeft,
  Search,
  Key,
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
  const [, setLocation] = useState('');
  const [, setDob] = useState('');
  
  // Organizer Specific Fields
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [, setPincode] = useState('');
  const [stateName, setStateName] = useState('');
  const [established, setEstablished] = useState('');
  const [, setWebsite] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [, setPrimaryLocations] = useState('');
  const [, setBatchCapacity] = useState('30');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [activities, setActivities] = useState<string[]>([]);

  // Documents
  const [govId, setGovId] = useState<UploadedDoc | undefined>();
  const [regDoc, setRegDoc] = useState<UploadedDoc | undefined>();
  const [panDoc, setPanDoc] = useState<UploadedDoc | undefined>();
  const [bankDoc, setBankDoc] = useState<UploadedDoc | undefined>();
  const [, setSafetyDoc] = useState<UploadedDoc | undefined>();
  const [, setAvatar] = useState<string | undefined>();

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
      location: '',
      dob: '',
      password,
      role,
      avatar: '',
      createdAt: new Date().toISOString(),
      isApproved: role !== 'organizer',
      isRejected: false,
      status: 'active',
      organizerProfile: role === 'organizer' ? {
        businessName,
        businessAddress,
        businessPincode: '',
        businessState: stateName,
        website: '',
        establishedYear: established,
        registrationNumber: regNumber,
        gstNumber,
        panNumber,
        locations: '',
        activities,
        batchCapacity: 30,
        bankAccount,
        ifscCode,
        bankName,
        govIdDoc: govId,
        registrationDoc: regDoc,
        panDoc,
        bankDoc,
        safetyDoc: undefined
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
  
  const handleGoogleSignIn = () => {
    // This is a placeholder for the actual Google Sign-In logic.
    // In a real application, you would use a library like Firebase Authentication
    // or the Google Identity Services SDK.
    toast({
      title: 'Social Login',
      description: 'Google Sign-In is not yet implemented.',
    });
  };

  const GoogleIcon = () => (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.612-3.87-11.283-8.951l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C43.021 36.251 46 30.694 46 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
  );

  const renderBranding = () => (
    <div className="pt-12 pb-8 flex flex-col items-center text-center px-6">
       <div className="w-12 h-12 mb-2">
          <img src={logoIcon?.imageUrl} className="w-full h-full object-contain" alt="Logo" />
       </div>
       <h1 className="text-[32px] font-medium text-white tracking-tight mb-1">Adventure Camp</h1>
       <div className="flex items-center gap-3 w-full max-w-[280px]">
          <div className="flex-1 h-[1px] bg-white/30" />
          <span className="text-[9px] font-medium text-green-200 uppercase tracking-[0.2em] whitespace-nowrap">
            {mode === 'forgot-password' || mode === 'find-email' ? 'Security Protocol' : 'Camp Organiser Platform'}
          </span>
          <div className="flex-1 h-[1px] bg-white/30" />
       </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden py-12 px-4 font-sans font-normal bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="w-full max-w-[650px] z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-white/10 backdrop-blur-md rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-white/20">
          
          {renderBranding()}

          {(mode === 'login' || mode === 'signup') && (
            <div className="px-10 mb-10">
              <div className="bg-white/10 p-1 rounded-[16px] flex">
                 <button 
                   onClick={() => { setMode('login'); setError(null); setSuccess(null); }} 
                   className={cn(
                     "flex-1 py-2.5 rounded-[12px] text-sm font-bold uppercase tracking-tight transition-all",
                     mode === 'login' ? "bg-white text-green-800 shadow-sm" : "text-white/60 hover:text-white"
                   )}
                 >
                   Login
                 </button>
                 <button 
                   onClick={() => { setMode('signup'); setError(null); setSuccess(null); }} 
                   className={cn(
                     "flex-1 py-2.5 rounded-[12px] text-sm font-bold uppercase tracking-tight transition-all",
                     mode === 'signup' ? "bg-white text-green-800 shadow-sm" : "text-white/60 hover:text-white"
                   )}
                 >
                   Sign Up
                 </button>
              </div>
            </div>
          )}

          <div className="px-10 pb-12">
            {error && <Alert variant="destructive" className="rounded-2xl border-none bg-red-900/80 text-white mb-6"><AlertDescription className="text-xs font-medium">{error}</AlertDescription></Alert>}
            {success && <Alert className="rounded-2xl border-none bg-green-900/80 text-white mb-6"><AlertDescription className="text-xs font-medium">{success}</AlertDescription></Alert>}

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <div className="space-y-2">
                    <Label className="text-sm font-black uppercase text-white/80">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white transition-colors" />
                      <Input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="h-12 rounded-xl border-white/20 bg-white/10 font-medium text-white text-sm placeholder:text-white/60 placeholder:font-normal pl-10" 
                        placeholder="admin@gmail.com"
                        required 
                      />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-sm font-black uppercase text-white/80">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white transition-colors" />
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="h-12 rounded-xl border-white/20 bg-white/10 font-medium text-white text-sm placeholder:text-white/60 placeholder:font-normal pl-10 pr-12" 
                        placeholder="••••••"
                        required 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                 </div>

                 <div className="pt-4 flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                       <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-medium h-11 px-8 rounded-xl shadow-md shadow-green-500/20 border-none text-xs">
                         Login
                       </Button>
                       <button 
                         type="button" 
                         onClick={() => setMode('forgot-password')}
                         className="text-[11px] font-medium text-cyan-300 hover:underline"
                       >
                         Forgot password?
                       </button>
                    </div>
                    
                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-white/20"></div>
                        <span className="flex-shrink mx-4 text-white/60 text-xs">OR</span>
                        <div className="flex-grow border-t border-white/20"></div>
                    </div>

                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      className="w-full h-12 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border-white/20 flex items-center justify-center"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </Button>
                 </div>
              </form>
            )}

            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 max-h-[60vh] overflow-y-auto no-scrollbar pr-1 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-black uppercase text-white/80">First Name *</Label>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white transition-colors" />
                      <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="h-11 rounded-xl border-white/20 bg-white/10 text-white font-medium text-sm placeholder:text-white/60 pl-10" placeholder="First Name" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-black uppercase text-white/80">Last Name</Label>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white transition-colors" />
                      <Input value={lastName} onChange={e => setLastName(e.target.value)} className="h-11 rounded-xl border-white/20 bg-white/10 text-white font-medium text-sm placeholder:text-white/60 pl-10" placeholder="Last Name" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-black uppercase text-white/80">Email *</Label>
                     <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white transition-colors" />
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-11 rounded-xl border-white/20 bg-white/10 text-white font-medium text-sm placeholder:text-white/60 pl-10" placeholder="email@example.com" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-black uppercase text-white/80">Phone</Label>
                    <div className="relative group">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white transition-colors" />
                      <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-11 rounded-xl border-white/20 bg-white/10 text-white font-medium text-sm placeholder:text-white/60 pl-10" placeholder="+91" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                   <Label className="text-sm font-black uppercase text-white/80">Select Identity Role *</Label>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {id: 'user', label: 'User', icon: UserIcon},
                        {id: 'organizer', label: 'Organizer', icon: Mountain},
                        {id: 'admin', label: 'Admin', icon: Shield}
                      ].map(r => (
                        <div 
                          key={r.id} 
                          onClick={() => setRole(r.id as Role)}
                          className={cn(
                            "p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 relative",
                            role === r.id ? "bg-white/20 border-green-400" : "bg-transparent border-white/20 hover:border-white/40"
                          )}
                        >
                           <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", role === r.id ? "bg-green-500 text-white" : "bg-white/10 text-white/70")}>
                              <r.icon size={14} />
                           </div>
                           <p className={cn("text-[10px] font-medium uppercase", role === r.id ? "text-green-300" : "text-white")}>{r.label}</p>
                           {role === r.id && (
                             <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-green-400 text-white rounded-full flex items-center justify-center">
                                <CheckCircle2 size={8} />
                             </div>
                           )}
                        </div>
                      ))}
                   </div>
                </div>

                {role === 'organizer' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-500 border-t border-white/20 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                       <Briefcase size={16} className="text-green-400" />
                       <h3 className="text-sm font-medium uppercase tracking-tight text-white">Business Registry Protocol</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-black uppercase text-white/80">Company Legal Name *</Label>
                        <Input value={businessName} onChange={e => setBusinessName(e.target.value)} className="h-11 rounded-xl border-white/20 bg-white/10 text-white font-medium text-sm" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-black uppercase text-white/80">GST Identification (GSTIN) *</Label>
                        <Input value={gstNumber} onChange={e => setGstNumber(e.target.value)} className="h-11 rounded-xl border-white/20 bg-white/10 text-white font-medium text-sm" placeholder="GSTIN Number" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-black uppercase text-white/80">Permanent Account Number (PAN) *</Label>
                        <Input value={panNumber} onChange={e => setPanNumber(e.target.value)} className="h-11 rounded-xl border-white/20 bg-white/10 text-white font-medium text-sm" placeholder="PAN Number" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-black uppercase text-white/80">Business License / Reg. No *</Label>
                        <Input value={regNumber} onChange={e => setRegNumber(e.target.value)} className="h-11 rounded-xl border-white/20 bg-white/10 text-white font-medium text-sm" placeholder="License Number" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-black uppercase text-white/80">Established Year *</Label>
                        <Input value={established} onChange={e => setEstablished(e.target.value)} className="h-11 rounded-xl border-white/20 bg-white/10 text-white font-medium text-sm" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-black uppercase text-white/80">HQ State *</Label>
                        <Input value={stateName} onChange={e => setStateName(e.target.value)} className="h-11 rounded-xl border-white/20 bg-white/10 text-white font-medium text-sm" required />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-black uppercase text-white/80">Business HQ Address *</Label>
                      <Input value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} className="h-11 rounded-xl border-white/20 bg-white/10 text-white font-medium text-sm" required />
                    </div>

                    <div className="space-y-6 pt-2">
                       <div className="flex items-center gap-2">
                          <CreditCard size={16} className="text-green-400" />
                          <h3 className="text-sm font-medium uppercase tracking-tight text-white">Settlement Account (Bank Details)</h3>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-sm font-black uppercase text-white/80">Bank Name *</Label>
                            <Input value={bankName} onChange={e => setBankName(e.target.value)} className="h-11 rounded-xl border-white/20 bg-white/10 text-white font-medium text-sm" required />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-sm font-black uppercase text-white/80">Account Number *</Label>
                            <Input value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="h-11 rounded-xl border-white/20 bg-white/10 text-white font-medium text-sm" required />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-sm font-black uppercase text-white/80">IFSC Code *</Label>
                            <Input value={ifscCode} onChange={e => setIfscCode(e.target.value)} className="h-11 rounded-xl border-white/20 bg-white/10 text-white font-medium text-sm uppercase" required />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <Label className="text-sm font-black uppercase text-white/80">Activities Offered *</Label>
                       <div className="grid grid-cols-2 gap-2">
                          {['Trekking', 'River Rafting', 'Bonfire', 'Camping'].map(a => (
                            <div key={a} className="flex items-center gap-2">
                               <Checkbox id={a} checked={activities.includes(a)} onCheckedChange={() => toggleActivity(a)} className="h-4 w-4 rounded-md border-white/40" />
                               <Label htmlFor={a} className="text-sm font-medium text-white/90 uppercase cursor-pointer">{a}</Label>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-green-400" />
                          <Label className="text-sm font-medium uppercase text-white">Registry Verification Assets (Mandatory) *</Label>
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
                                 item.doc ? "border-green-400 bg-white/10" : "border-white/30 hover:border-white/50"
                               )}>
                                  {item.doc ? <CheckCircle2 size={18} className="text-green-400 mb-1.5" /> : <item.icon size={18} className="text-white/50 mb-1.5" />}
                                  <p className="text-[9px] font-medium uppercase text-white/70 text-center leading-tight">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/20 pt-6">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-black uppercase text-white/80">Password *</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white" />
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="h-11 rounded-xl border-white/20 bg-white/10 font-medium text-white text-sm placeholder:text-white/60 pl-10 pr-12" 
                        placeholder="••••••••" 
                        required 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-black uppercase text-white/80">Confirm Password *</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white" />
                      <Input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        className="h-11 rounded-xl border-white/20 bg-white/10 font-medium text-white text-sm placeholder:text-white/60 pl-10 pr-12" 
                        placeholder="••••••••" 
                        required 
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-green-500/20 border-none">
                    Create Registry
                  </Button>
                </div>
              </form>
            )}

            {mode === 'forgot-password' && (
              <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                   <div className="w-14 h-14 bg-white/10 text-cyan-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Key size={28} />
                   </div>
                   <h2 className="text-lg font-medium text-white uppercase tracking-tight">Identity Recovery</h2>
                   <p className="text-[10px] text-white/60 font-medium uppercase mt-1">Enter your email to reset password</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-sm font-black uppercase text-white/80">Registered Email</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white" />
                        <Input 
                          type="email" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          className="h-12 rounded-xl border-white/20 bg-white/10 font-medium text-white text-sm placeholder:text-white/60 pl-10" 
                          placeholder="email@example.com"
                          required 
                        />
                      </div>
                   </div>
                   <Button type="submit" className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white font-medium uppercase text-xs rounded-xl shadow-lg border-none">
                      Request Reset Link
                   </Button>
                </form>

                <div className="pt-4 flex flex-col items-center gap-4">
                   <button 
                     onClick={() => { setMode('find-email'); setError(null); setSuccess(null); }}
                     className="text-[11px] font-medium text-cyan-300 hover:underline flex items-center gap-2"
                   >
                     <Search size={14} /> Forgot email? Find my account
                   </button>
                   <button 
                     onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                     className="text-[11px] font-medium text-white/60 hover:text-white flex items-center gap-2"
                   >
                     <ArrowLeft size={14} /> Back to Login
                   </button>
                </div>
              </div>
            )}

            {mode === 'find-email' && (
              <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                   <div className="w-14 h-14 bg-white/10 text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search size={28} />
                   </div>
                   <h2 className="text-lg font-medium text-white uppercase tracking-tight">Account Identification</h2>
                   <p className="text-[10px] text-white/60 font-medium uppercase mt-1">Find your registry email via phone</p>
                </div>

                <form onSubmit={handleFindAccount} className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-sm font-black uppercase text-white/80">Registered Mobile Number</Label>
                      <div className="relative group">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white" />
                        <Input 
                          type="tel" 
                          value={phone} 
                          onChange={e => setPhone(e.target.value)} 
                          className="h-12 rounded-xl border-white/20 bg-white/10 font-medium text-white text-sm placeholder:text-white/60 pl-10" 
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
                     className="text-[11px] font-medium text-white/60 hover:text-white flex items-center gap-2"
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
