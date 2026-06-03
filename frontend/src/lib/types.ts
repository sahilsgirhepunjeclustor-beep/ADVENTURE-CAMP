export type Role = 'admin' | 'organizer' | 'user';

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  location?: string;
  role: Role;
  avatar?: string;
  password?: string;
  createdAt: string;
  lastLogin?: string;
  isApproved: boolean;
  isRejected: boolean;
  rejectionReason?: string;
  status?: 'active' | 'suspended' | 'blocked';
  organizerProfile?: OrganizerProfile;
  membership?: UserMembership;
  emergencyContact?: string;
  medicalInfo?: string;
}

export interface UserMembership {
  planId: string;
  planName: string;
  status: 'active' | 'pending' | 'expired' | 'suspended';
  startDate: string;
  expiryDate: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  discountPercentage: number;
  features: string[];
  isActive: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
}

export interface OrganizerProfile {
  businessName: string;
  businessAddress: string;
  businessPincode: string;
  businessState: string;
  website?: string;
  establishedYear: string;
  registrationNumber: string; // Business License Number
  gstNumber: string;
  panNumber: string;
  locations: string;
  activities: string[];
  batchCapacity: number;
  bankAccount: string;
  ifscCode: string;
  bankName: string;
  govIdDoc?: UploadedDoc;
  registrationDoc?: UploadedDoc; // Business License
  panDoc?: UploadedDoc;
  bankDoc?: UploadedDoc; // Cancelled Cheque/Passbook
  safetyDoc?: UploadedDoc;
  approvalRequestedAt?: string;
  approvedAt?: string;
  // New Profile Management Fields
  teamMembers?: TeamMember[];
  experienceDetails?: string;
  certifications?: string[];
  socialLinks?: SocialLinks;
}

export interface UploadedDoc {
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  data?: string;
  stored: boolean;
}

export interface Camp {
  id: string;
  name: string;
  location: string;
  description: string;
  capacity: number;
  minGroup: number;
  price: number;
  duration: number;
  startDate: string;
  endDate: string;
  occupancy: number;
  category: string;
  activity: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Expert';
  rating: number;
  familyFriendly: boolean;
  groupSize: number;
  amenities: string[] | string;
  activities: string[];
  food: string[];
  costIncludes: string[];
  costExcludes: string[];
  ageRequirement?: string;
  languages?: string;
  contact?: string;
  image?: string;
  campImages: string[];
  videoUrl?: string;
  coordinates?: { lat: string; lng: string };
  discounts?: string[];
  equipment: string[];
  safetyInstructions: string[];
  weatherInfo: string;
  addedBy: string;
  organizer: string;
  addedByName: string;
  addedAt: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'inactive' | 'completed';
  rejectionReason?: string;
  isFeatured?: boolean;
  isHidden?: boolean;
  pickupPoints: string[];
  batches: Batch[];
  itinerary: ItineraryStep[];
  faqs: FAQ[];
}

export interface Batch {
  id: string;
  dates: string;
  status: 'Filling Fast' | 'Sold Out' | 'Available';
  price: number;
  maxCapacity: number;
  currentBookings: number;
  cutoffDate: string;
}

export interface FAQ {
  id?: string;
  question: string;
  answer: string;
}

export interface ItineraryStep {
  day: string;
  title: string;
  description: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
  night?: string;
}

export interface BookingParticipant {
  id: string;
  name: string;
  age: string;
  gender: string;
}

export interface Booking {
  userEmail: string;
  organizerEmail: string;
  id: string;
  customer: string;
  customerEmail: string;
  camp: string;
  campId: string;
  checkin: string;
  checkout: string;
  amount: number;
  commissionAmount: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Refunded' | 'Disputed';
  addedAt: string;
  organizerNotice?: boolean;
  participants?: BookingParticipant[];
}

export interface Review {
  id: string;
  customer: string;
  customerEmail: string;
  camp: string;
  campId: string;
  rating: number;
  text: string;
  time: string;
  avatar?: string;
  status: 'pending' | 'approved' | 'hidden' | 'deleted';
  reply?: string;
  repliedAt?: string;
  isReported?: boolean;
  reportReason?: string;
}

export interface Activity {
  id: string;
  type: 'Booked' | 'Reviewed' | 'Completed Trip' | 'Account Created' | 'Cancelled Trip' | 'Membership Joined';
  camp: string;
  date: string;
}

export interface Notification {
  id: string;
  type: 'booking' | 'approval' | 'info' | 'campaign';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  minBookingValue: number;
  isActive: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  content: string;
  image: string;
  publishedAt: string;
  category: string;
  isDraft: boolean;
}

export interface CMSContent {
  homepage: {
    heroTitle: string;
    heroSubtitle: string;
    banners: string[];
  };
  faqs: FAQ[];
  blogs: BlogPost[];
  legal: {
    termsAndConditions: string;
    privacyPolicy: string;
  };
}

export interface SupportTicket {
  id: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  category: 'General Support' | 'Complaint' | 'Dispute' | 'Escalation';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In-Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  camps: Camp[];
  bookings: Booking[];
  reviews: Review[];
  activities: Activity[];
  notifications: Notification[];
  wishlist: string[];
}
