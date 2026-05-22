import { User, AppData, Camp, Role, Booking, Review, Notification, MembershipPlan, Coupon, CMSContent, SupportTicket } from './types';

const USERS_KEY = 'ac_users';
const SESSION_KEY = 'ac_session';
const DATA_PREFIX = 'ac_data_';
const DRAFT_CAMPS_KEY = 'ac_draft_camps';
const PENDING_CAMPS_KEY = 'ac_pending_camps';
const APPROVED_CAMPS_KEY = 'ac_approved_camps';
const REJECTED_CAMPS_KEY = 'ac_rejected_camps';
const MEMBERSHIP_PLANS_KEY = 'ac_membership_plans';
const COUPONS_KEY = 'ac_coupons';
const CMS_CONTENT_KEY = 'ac_cms_content';
const SUPPORT_TICKETS_KEY = 'ac_support_tickets';

export const store = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, val: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.error('CRITICAL: Local storage quota exceeded!');
      }
      console.error('Storage error', e);
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }
};

export const initialMembershipPlans: MembershipPlan[] = [
  { id: 'p1', name: 'Bronze Explorer', price: 999, durationMonths: 12, discountPercentage: 5, features: ['10% OFF on all camps', 'Early access to bookings'], isActive: true },
  { id: 'p2', name: 'Silver Nomad', price: 2499, durationMonths: 12, discountPercentage: 10, features: ['15% OFF on all camps', 'Priority Support', 'Free photography assist'], isActive: true },
  { id: 'p3', name: 'Gold Trailblazer', price: 4999, durationMonths: 12, discountPercentage: 15, features: ['20% OFF on all camps', 'VIP Campsites', 'Cancellation Insurance'], isActive: true }
];

export const initialCMSContent: CMSContent = {
  homepage: {
    heroTitle: 'Adventure Camping Platform',
    heroSubtitle: 'Curated professional adventure camps and expeditions across the globe.',
    banners: ['https://picsum.photos/seed/banner1/1920/600', 'https://picsum.photos/seed/banner2/1920/600']
  },
  faqs: [
    { id: '1', question: 'Is gear provided?', answer: 'Yes, most of our technical gear is provided unless specified.' }
  ],
  blogs: [
    { id: '1', title: 'Top 5 Trekking Spots in 2024', author: 'Expedition Team', content: 'Explore the vast landscapes...', image: 'https://picsum.photos/seed/blog1/800/400', publishedAt: new Date().toISOString(), category: 'Adventure', isDraft: false }
  ],
  legal: {
    termsAndConditions: 'Standard platform terms apply...',
    privacyPolicy: 'Your data is secured...'
  }
};

export const initialSupportTickets: SupportTicket[] = [
  { id: 'T-1001', userEmail: 'user@example.com', userName: 'John Doe', subject: 'Refund delay', message: 'I cancelled my trip but havent received refund yet.', category: 'Dispute', priority: 'High', status: 'Open', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'T-1002', userEmail: 'org@example.com', userName: 'Adventure Corp', subject: 'KYC Document issue', message: 'My business registration was rejected without clear reason.', category: 'Escalation', priority: 'Medium', status: 'In-Progress', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

export const initialCamps: Camp[] = [
  {
    id: '1',
    name: '5D Leh-Ladakh Circuit Trip | Leh, Nubra Valley & Turtuk',
    location: 'Leh, Ladakh',
    description: 'Ladakh is a place where you can relax, explore and rejuvenate your mind. It is a land of beautiful landscapes, clear blue water and clean air. The place has something for everyone. If you are an adventure junkie then you can go trekking or river rafting. If you are a peace lover then you can visit the many monasteries in the region.',
    capacity: 40,
    minGroup: 1,
    price: 18999,
    duration: 5,
    startDate: '2026-05-21',
    endDate: '2026-05-29',
    occupancy: 85,
    category: 'Mountain',
    activity: 'Adventure',
    difficulty: 'Moderate',
    rating: 5.0,
    familyFriendly: true,
    groupSize: 15,
    amenities: ['Professional Guide', 'Tents/Hotels', 'All Meals', 'Transport', 'Oxygen Support', 'First Aid', 'WiFi in Leh', 'Photography Assist'],
    activities: ['Trekking', 'Photography', 'Camping', 'Sightseeing', 'Stargazing', 'River Rafting'],
    food: ['Breakfast', 'Dinner', 'Hot Tea/Coffee', 'Local Ladakhi Cuisine', 'Evening Snacks'],
    costIncludes: ['Accommodation on twin sharing', 'Breakfast and Dinner', 'All transfers in Non-AC vehicle', 'Driver charges, Fuel, Tolls', 'Outer area permits', 'Oxygen cylinders'],
    costExcludes: ['Airfare/Train fare', 'Personal expenses', 'Anything not mentioned in inclusions', 'Lunch during travel', 'Rafting charges'],
    campImages: [
      'https://picsum.photos/seed/leh1/1200/800',
      'https://picsum.photos/seed/leh2/1200/800',
      'https://picsum.photos/seed/leh3/1200/800',
      'https://picsum.photos/seed/leh4/1200/800',
      'https://picsum.photos/seed/leh5/1200/800',
      'https://picsum.photos/seed/leh6/1200/800'
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    coordinates: { lat: '34.1526', lng: '77.5771' },
    discounts: ['Early Bird: 15% OFF', 'Group Booking (5+): Extra 10% OFF'],
    equipment: ['4-Season Tents', 'Thermal Sleeping Bags', 'Trekking Poles', 'Oxygen Cylinders', 'Satellite Phones'],
    safetyInstructions: [
      'Strict acclimatization for the first 24 hours is mandatory.',
      'Always carry thermal innerwear and heavy jackets.',
      'Stay hydrated and avoid high-intensity exercise on Day 1.',
      'Report any signs of AMS (Altitude Sickness) to the guide immediately.'
    ],
    weatherInfo: 'Expect 15°C during day and -5°C at night. Clear skies with occasional sudden winds.',
    addedBy: 'admin@adventurecamping.com',
    organizer: 'Adventure Camping Expeditions',
    addedByName: 'Admin',
    addedAt: new Date().toISOString(),
    status: 'approved',
    isFeatured: true,
    pickupPoints: ['Leh Airport', 'Leh Market'],
    batches: [
      { id: 'b1', dates: '21 May - 29 May', status: 'Filling Fast', price: 18999, maxCapacity: 25, currentBookings: 18, cutoffDate: '2026-05-15' },
      { id: 'b2', dates: '01 Jun - 09 Jun', status: 'Available', price: 18999, maxCapacity: 25, currentBookings: 5, cutoffDate: '2026-05-25' },
      { id: 'b3', dates: '11 Jun - 19 Jun', status: 'Available', price: 19500, maxCapacity: 25, currentBookings: 0, cutoffDate: '2026-06-05' },
      { id: 'b4', dates: '21 Jun - 29 Jun', status: 'Sold Out', price: 19500, maxCapacity: 25, currentBookings: 25, cutoffDate: '2026-06-15' }
    ],
    itinerary: [
      { 
        day: 'Day 1', 
        title: 'Arrival in Leh | Acclimatization', 
        description: 'Arrive at Leh airport and transfer to hotel. Rest for the day for acclimatization to the high altitude.',
        morning: 'Airport Pickup & Briefing',
        afternoon: 'Hotel Check-in & Complete Rest',
        evening: 'Shanti Stupa Visit',
        night: 'Dinner & Early Sleep'
      },
      { 
        day: 'Day 2', 
        title: 'Leh to Nubra Valley via Khardung La', 
        description: 'Drive to Nubra Valley via the highest motorable road in the world.',
        morning: 'Breakfast & Start Drive',
        afternoon: 'Cross Khardung La Summit',
        evening: 'Diskit Monastery Visit',
        night: 'Luxury Campsite Stay'
      }
    ],
    faqs: [
      { question: 'Is oxygen available during the trip?', answer: 'Yes, we provide oxygen cylinders in every vehicle and campsite for high-altitude safety.' }
    ]
  }
];

export function getAppData(email: string): AppData {
  const key = `${DATA_PREFIX}${email.toLowerCase()}`;
  const stored = store.get<AppData>(key);
  
  const initial: AppData = {
    camps: [],
    bookings: [],
    reviews: [],
    activities: [],
    notifications: [],
    wishlist: []
  };

  if (stored) {
    // Migration: ensure all fields exist for legacy user data
    return { ...initial, ...stored };
  }
  
  store.set(key, initial);
  return initial;
}

export function saveAppData(email: string, data: AppData) {
  store.set(`${DATA_PREFIX}${email.toLowerCase()}`, data);
}

export function getSupportTickets(): SupportTicket[] {
  return store.get<SupportTicket[]>(SUPPORT_TICKETS_KEY) || initialSupportTickets;
}

export function saveSupportTickets(tickets: SupportTicket[]) {
  store.set(SUPPORT_TICKETS_KEY, tickets);
}

export function getCoupons(): Coupon[] {
  return store.get<Coupon[]>(COUPONS_KEY) || [];
}

export function saveCoupons(coupons: Coupon[]) {
  store.set(COUPONS_KEY, coupons);
}

export function getCMSContent(): CMSContent {
  return store.get<CMSContent>(CMS_CONTENT_KEY) || initialCMSContent;
}

export function saveCMSContent(content: CMSContent) {
  store.set(CMS_CONTENT_KEY, content);
}

export function getMembershipPlans(): MembershipPlan[] {
  return store.get<MembershipPlan[]>(MEMBERSHIP_PLANS_KEY) || initialMembershipPlans;
}

export function saveMembershipPlans(plans: MembershipPlan[]) {
  store.set(MEMBERSHIP_PLANS_KEY, plans);
}

export function addUserNotification(email: string, notif: Notification) {
  const data = getAppData(email);
  const notifications = data.notifications || [];
  data.notifications = [notif, ...notifications];
  saveAppData(email, data);
}

export function addAdminNotification(notif: Notification) {
  const users = getUsers();
  const admins = Object.values(users).filter(u => u.role === 'admin');
  admins.forEach(admin => {
    addUserNotification(admin.email, notif);
  });
}

export function getGlobalAppData() {
  const users = getUsers();
  const allBookings: Booking[] = [];
  const allReviews: Review[] = [];
  
  Object.keys(users).forEach(email => {
    const data = getAppData(email);
    allBookings.push(...data.bookings);
    allReviews.push(...data.reviews);
  });
  
  return {
    allBookings,
    allReviews,
    totalUsersCount: Object.keys(users).length
  };
}

export function getBookingsForOrganizer(organizerEmail: string): Booking[] {
  const { allBookings } = getGlobalAppData();
  const myCamps = getAllApprovedCamps().filter(c => c.addedBy === organizerEmail);
  const myCampIds = myCamps.map(c => c.id);
  return allBookings.filter(b => myCampIds.includes(b.campId));
}

export function getAllApprovedCamps(): Camp[] {
  const global = store.get<Camp[]>(APPROVED_CAMPS_KEY);
  if (global === null) return initialCamps;
  return global;
}

export function getPendingCamps(): Camp[] {
  return store.get<Camp[]>(PENDING_CAMPS_KEY) || [];
}

export function getRejectedCamps(): Camp[] {
  return store.get<Camp[]>(REJECTED_CAMPS_KEY) || [];
}

export function getDraftCamps(): Camp[] {
  return store.get<Camp[]>(DRAFT_CAMPS_KEY) || [];
}

export function savePendingCamps(camps: Camp[]) {
  store.set(PENDING_CAMPS_KEY, camps);
}

export function saveApprovedCamps(camps: Camp[]) {
  store.set(APPROVED_CAMPS_KEY, camps);
}

export function saveRejectedCamps(camps: Camp[]) {
  store.set(REJECTED_CAMPS_KEY, camps);
}

export function saveDraftCamps(camps: Camp[]) {
  store.set(DRAFT_CAMPS_KEY, camps);
}

export function getUsers(): Record<string, User> {
  return store.get<Record<string, User>>(USERS_KEY) || {};
}

export function saveUsers(users: Record<string, User>) {
  store.set(USERS_KEY, users);
}

export function getCurrentUser(): User | null {
  return store.get<User>(SESSION_KEY);
}

export function setCurrentUser(user: User | null) {
  store.set(SESSION_KEY, user);
}
