(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addAdminNotification",
    ()=>addAdminNotification,
    "addUserNotification",
    ()=>addUserNotification,
    "getAllApprovedCamps",
    ()=>getAllApprovedCamps,
    "getAppData",
    ()=>getAppData,
    "getBookingsForOrganizer",
    ()=>getBookingsForOrganizer,
    "getCMSContent",
    ()=>getCMSContent,
    "getCoupons",
    ()=>getCoupons,
    "getCurrentUser",
    ()=>getCurrentUser,
    "getDraftCamps",
    ()=>getDraftCamps,
    "getGlobalAppData",
    ()=>getGlobalAppData,
    "getMembershipPlans",
    ()=>getMembershipPlans,
    "getPendingCamps",
    ()=>getPendingCamps,
    "getRejectedCamps",
    ()=>getRejectedCamps,
    "getSupportTickets",
    ()=>getSupportTickets,
    "getUsers",
    ()=>getUsers,
    "initialCMSContent",
    ()=>initialCMSContent,
    "initialCamps",
    ()=>initialCamps,
    "initialMembershipPlans",
    ()=>initialMembershipPlans,
    "initialSupportTickets",
    ()=>initialSupportTickets,
    "saveAppData",
    ()=>saveAppData,
    "saveApprovedCamps",
    ()=>saveApprovedCamps,
    "saveCMSContent",
    ()=>saveCMSContent,
    "saveCoupons",
    ()=>saveCoupons,
    "saveDraftCamps",
    ()=>saveDraftCamps,
    "saveMembershipPlans",
    ()=>saveMembershipPlans,
    "savePendingCamps",
    ()=>savePendingCamps,
    "saveRejectedCamps",
    ()=>saveRejectedCamps,
    "saveSupportTickets",
    ()=>saveSupportTickets,
    "saveUsers",
    ()=>saveUsers,
    "setCurrentUser",
    ()=>setCurrentUser,
    "store",
    ()=>store
]);
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
const store = {
    get: (key)=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            const val = localStorage.getItem(key);
            return val ? JSON.parse(val) : null;
        } catch (e) {
            return null;
        }
    },
    set: (key, val)=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                console.error('CRITICAL: Local storage quota exceeded!');
            }
            console.error('Storage error', e);
        }
    },
    remove: (key)=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        localStorage.removeItem(key);
    }
};
const initialMembershipPlans = [
    {
        id: 'p1',
        name: 'Bronze Explorer',
        price: 999,
        durationMonths: 12,
        discountPercentage: 5,
        features: [
            '10% OFF on all camps',
            'Early access to bookings'
        ],
        isActive: true
    },
    {
        id: 'p2',
        name: 'Silver Nomad',
        price: 2499,
        durationMonths: 12,
        discountPercentage: 10,
        features: [
            '15% OFF on all camps',
            'Priority Support',
            'Free photography assist'
        ],
        isActive: true
    },
    {
        id: 'p3',
        name: 'Gold Trailblazer',
        price: 4999,
        durationMonths: 12,
        discountPercentage: 15,
        features: [
            '20% OFF on all camps',
            'VIP Campsites',
            'Cancellation Insurance'
        ],
        isActive: true
    }
];
const initialCMSContent = {
    homepage: {
        heroTitle: 'Adventure Camping Platform',
        heroSubtitle: 'Curated professional adventure camps and expeditions across the globe.',
        banners: [
            'https://picsum.photos/seed/banner1/1920/600',
            'https://picsum.photos/seed/banner2/1920/600'
        ]
    },
    faqs: [
        {
            id: '1',
            question: 'Is gear provided?',
            answer: 'Yes, most of our technical gear is provided unless specified.'
        }
    ],
    blogs: [
        {
            id: '1',
            title: 'Top 5 Trekking Spots in 2024',
            author: 'Expedition Team',
            content: 'Explore the vast landscapes...',
            image: 'https://picsum.photos/seed/blog1/800/400',
            publishedAt: new Date().toISOString(),
            category: 'Adventure',
            isDraft: false
        }
    ],
    legal: {
        termsAndConditions: 'Standard platform terms apply...',
        privacyPolicy: 'Your data is secured...'
    }
};
const initialSupportTickets = [
    {
        id: 'T-1001',
        userEmail: 'user@example.com',
        userName: 'John Doe',
        subject: 'Refund delay',
        message: 'I cancelled my trip but havent received refund yet.',
        category: 'Dispute',
        priority: 'High',
        status: 'Open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'T-1002',
        userEmail: 'org@example.com',
        userName: 'Adventure Corp',
        subject: 'KYC Document issue',
        message: 'My business registration was rejected without clear reason.',
        category: 'Escalation',
        priority: 'Medium',
        status: 'In-Progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];
const initialCamps = [
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
        amenities: [
            'Professional Guide',
            'Tents/Hotels',
            'All Meals',
            'Transport',
            'Oxygen Support',
            'First Aid',
            'WiFi in Leh',
            'Photography Assist'
        ],
        activities: [
            'Trekking',
            'Photography',
            'Camping',
            'Sightseeing',
            'Stargazing',
            'River Rafting'
        ],
        food: [
            'Breakfast',
            'Dinner',
            'Hot Tea/Coffee',
            'Local Ladakhi Cuisine',
            'Evening Snacks'
        ],
        costIncludes: [
            'Accommodation on twin sharing',
            'Breakfast and Dinner',
            'All transfers in Non-AC vehicle',
            'Driver charges, Fuel, Tolls',
            'Outer area permits',
            'Oxygen cylinders'
        ],
        costExcludes: [
            'Airfare/Train fare',
            'Personal expenses',
            'Anything not mentioned in inclusions',
            'Lunch during travel',
            'Rafting charges'
        ],
        campImages: [
            'https://picsum.photos/seed/leh1/1200/800',
            'https://picsum.photos/seed/leh2/1200/800',
            'https://picsum.photos/seed/leh3/1200/800',
            'https://picsum.photos/seed/leh4/1200/800',
            'https://picsum.photos/seed/leh5/1200/800',
            'https://picsum.photos/seed/leh6/1200/800'
        ],
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        coordinates: {
            lat: '34.1526',
            lng: '77.5771'
        },
        discounts: [
            'Early Bird: 15% OFF',
            'Group Booking (5+): Extra 10% OFF'
        ],
        equipment: [
            '4-Season Tents',
            'Thermal Sleeping Bags',
            'Trekking Poles',
            'Oxygen Cylinders',
            'Satellite Phones'
        ],
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
        pickupPoints: [
            'Leh Airport',
            'Leh Market'
        ],
        batches: [
            {
                id: 'b1',
                dates: '21 May - 29 May',
                status: 'Filling Fast',
                price: 18999,
                maxCapacity: 25,
                currentBookings: 18,
                cutoffDate: '2026-05-15'
            },
            {
                id: 'b2',
                dates: '01 Jun - 09 Jun',
                status: 'Available',
                price: 18999,
                maxCapacity: 25,
                currentBookings: 5,
                cutoffDate: '2026-05-25'
            },
            {
                id: 'b3',
                dates: '11 Jun - 19 Jun',
                status: 'Available',
                price: 19500,
                maxCapacity: 25,
                currentBookings: 0,
                cutoffDate: '2026-06-05'
            },
            {
                id: 'b4',
                dates: '21 Jun - 29 Jun',
                status: 'Sold Out',
                price: 19500,
                maxCapacity: 25,
                currentBookings: 25,
                cutoffDate: '2026-06-15'
            }
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
            {
                question: 'Is oxygen available during the trip?',
                answer: 'Yes, we provide oxygen cylinders in every vehicle and campsite for high-altitude safety.'
            }
        ]
    }
];
function getAppData(email) {
    const key = "".concat(DATA_PREFIX).concat(email.toLowerCase());
    const stored = store.get(key);
    const initial = {
        camps: [],
        bookings: [],
        reviews: [],
        activities: [],
        notifications: [],
        wishlist: []
    };
    if (stored) {
        // Migration: ensure all fields exist for legacy user data
        return {
            ...initial,
            ...stored
        };
    }
    store.set(key, initial);
    return initial;
}
function saveAppData(email, data) {
    store.set("".concat(DATA_PREFIX).concat(email.toLowerCase()), data);
}
function getSupportTickets() {
    return store.get(SUPPORT_TICKETS_KEY) || initialSupportTickets;
}
function saveSupportTickets(tickets) {
    store.set(SUPPORT_TICKETS_KEY, tickets);
}
function getCoupons() {
    return store.get(COUPONS_KEY) || [];
}
function saveCoupons(coupons) {
    store.set(COUPONS_KEY, coupons);
}
function getCMSContent() {
    return store.get(CMS_CONTENT_KEY) || initialCMSContent;
}
function saveCMSContent(content) {
    store.set(CMS_CONTENT_KEY, content);
}
function getMembershipPlans() {
    return store.get(MEMBERSHIP_PLANS_KEY) || initialMembershipPlans;
}
function saveMembershipPlans(plans) {
    store.set(MEMBERSHIP_PLANS_KEY, plans);
}
function addUserNotification(email, notif) {
    const data = getAppData(email);
    const notifications = data.notifications || [];
    data.notifications = [
        notif,
        ...notifications
    ];
    saveAppData(email, data);
}
function addAdminNotification(notif) {
    const users = getUsers();
    const admins = Object.values(users).filter((u)=>u.role === 'admin');
    admins.forEach((admin)=>{
        addUserNotification(admin.email, notif);
    });
}
function getGlobalAppData() {
    const users = getUsers();
    const allBookings = [];
    const allReviews = [];
    Object.keys(users).forEach((email)=>{
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
function getBookingsForOrganizer(organizerEmail) {
    const { allBookings } = getGlobalAppData();
    const myCamps = getAllApprovedCamps().filter((c)=>c.addedBy === organizerEmail);
    const myCampIds = myCamps.map((c)=>c.id);
    return allBookings.filter((b)=>myCampIds.includes(b.campId));
}
function getAllApprovedCamps() {
    const global = store.get(APPROVED_CAMPS_KEY);
    if (global === null) return initialCamps;
    return global;
}
function getPendingCamps() {
    return store.get(PENDING_CAMPS_KEY) || [];
}
function getRejectedCamps() {
    return store.get(REJECTED_CAMPS_KEY) || [];
}
function getDraftCamps() {
    return store.get(DRAFT_CAMPS_KEY) || [];
}
function savePendingCamps(camps) {
    store.set(PENDING_CAMPS_KEY, camps);
}
function saveApprovedCamps(camps) {
    store.set(APPROVED_CAMPS_KEY, camps);
}
function saveRejectedCamps(camps) {
    store.set(REJECTED_CAMPS_KEY, camps);
}
function saveDraftCamps(camps) {
    store.set(DRAFT_CAMPS_KEY, camps);
}
function getUsers() {
    return store.get(USERS_KEY) || {};
}
function saveUsers(users) {
    store.set(USERS_KEY, users);
}
function getCurrentUser() {
    return store.get(SESSION_KEY);
}
function setCurrentUser(user) {
    store.set(SESSION_KEY, user);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "compressImage",
    ()=>compressImage,
    "daysUntil",
    ()=>daysUntil,
    "fmt",
    ()=>fmt,
    "fmtDate",
    ()=>fmtDate,
    "parseYMD",
    ()=>parseYMD,
    "stars",
    ()=>stars,
    "today",
    ()=>today,
    "uid",
    ()=>uid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn() {
    for(var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++){
        inputs[_key] = arguments[_key];
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
const uid = ()=>Math.random().toString(36).slice(2, 9);
const today = ()=>new Date().toISOString().split('T')[0];
const parseYMD = (d)=>{
    if (!d) return new Date();
    if (d instanceof Date) return d;
    const match = String(d).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return new Date(d);
};
const fmt = (n, p0)=>{
    if (n >= 100000) return "₹".concat((n / 100000).toFixed(2), "L");
    return "₹".concat(Number(n).toLocaleString('en-IN'));
};
const fmtDate = (d, p0)=>{
    if (!d) return '';
    const dt = parseYMD(d);
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];
    return "".concat(dt.getDate(), " ").concat(months[dt.getMonth()], " ").concat(dt.getFullYear());
};
const stars = (n)=>'★'.repeat(n) + '☆'.repeat(5 - n);
const daysUntil = (d)=>{
    const dt = parseYMD(d);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    dt.setHours(0, 0, 0, 0);
    return Math.ceil((dt.getTime() - now.getTime()) / 86400000);
};
const compressImage = function(base64Str) {
    let maxWidth = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1000, quality = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.6;
    return new Promise((resolve)=>{
        if (!base64Str || !base64Str.startsWith('data:image/')) {
            resolve(base64Str);
            return;
        }
        const img = new Image();
        img.src = base64Str;
        img.onload = ()=>{
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
                height = Math.round(height * maxWidth / width);
                width = maxWidth;
            } else if (base64Str.length < 100000) {
                // If image is already small (< 100KB), return as is to save processing
                resolve(base64Str);
                return;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(base64Str);
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            // Using jpeg to optimize for size over transparency
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = ()=>resolve(base64Str);
    });
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/placeholder-images.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("{\"placeholderImages\":[{\"id\":\"logo-icon\",\"description\":\"TrailWise Icon Logo - Mountain and Compass\",\"imageUrl\":\"https://picsum.photos/seed/trailwise-logo/512/512\",\"imageHint\":\"mountain compass logo icon\"},{\"id\":\"brand-text\",\"description\":\"TrailWise Brand Typography\",\"imageUrl\":\"https://picsum.photos/seed/trailwise-brand/400/100\",\"imageHint\":\"trailwise brand typography\"}]}"));}),
"[project]/src/lib/placeholder-images.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlaceHolderImages",
    ()=>PlaceHolderImages
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$placeholder$2d$images$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/src/lib/placeholder-images.json (json)");
;
const PlaceHolderImages = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$placeholder$2d$images$2e$json__$28$json$29$__["default"].placeholderImages;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-toast.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reducer",
    ()=>reducer,
    "toast",
    ()=>toast,
    "useToast",
    ()=>useToast
]);
// Inspired by react-hot-toast library
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;
const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST"
};
let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}
const toastTimeouts = new Map();
const addToRemoveQueue = (toastId)=>{
    if (toastTimeouts.has(toastId)) {
        return;
    }
    const timeout = setTimeout(()=>{
        toastTimeouts.delete(toastId);
        dispatch({
            type: "REMOVE_TOAST",
            toastId: toastId
        });
    }, TOAST_REMOVE_DELAY);
    toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action)=>{
    switch(action.type){
        case "ADD_TOAST":
            return {
                ...state,
                toasts: [
                    action.toast,
                    ...state.toasts
                ].slice(0, TOAST_LIMIT)
            };
        case "UPDATE_TOAST":
            return {
                ...state,
                toasts: state.toasts.map((t)=>t.id === action.toast.id ? {
                        ...t,
                        ...action.toast
                    } : t)
            };
        case "DISMISS_TOAST":
            {
                const { toastId } = action;
                // ! Side effects ! - This could be extracted into a dismissToast() action,
                // but I'll keep it here for simplicity
                if (toastId) {
                    addToRemoveQueue(toastId);
                } else {
                    state.toasts.forEach((toast)=>{
                        addToRemoveQueue(toast.id);
                    });
                }
                return {
                    ...state,
                    toasts: state.toasts.map((t)=>t.id === toastId || toastId === undefined ? {
                            ...t,
                            open: false
                        } : t)
                };
            }
        case "REMOVE_TOAST":
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: []
                };
            }
            return {
                ...state,
                toasts: state.toasts.filter((t)=>t.id !== action.toastId)
            };
    }
};
const listeners = [];
let memoryState = {
    toasts: []
};
function dispatch(action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener)=>{
        listener(memoryState);
    });
}
function toast(param) {
    let { ...props } = param;
    const id = genId();
    const update = (props)=>dispatch({
            type: "UPDATE_TOAST",
            toast: {
                ...props,
                id
            }
        });
    const dismiss = ()=>dispatch({
            type: "DISMISS_TOAST",
            toastId: id
        });
    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open)=>{
                if (!open) dismiss();
            }
        }
    });
    return {
        id: id,
        dismiss,
        update
    };
}
function useToast() {
    _s();
    const [state, setState] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](memoryState);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "useToast.useEffect": ()=>{
            listeners.push(setState);
            return ({
                "useToast.useEffect": ()=>{
                    const index = listeners.indexOf(setState);
                    if (index > -1) {
                        listeners.splice(index, 1);
                    }
                }
            })["useToast.useEffect"];
        }
    }["useToast.useEffect"], [
        state
    ]);
    return {
        ...state,
        toast,
        dismiss: (toastId)=>dispatch({
                type: "DISMISS_TOAST",
                toastId
            })
    };
}
_s(useToast, "SPWE98mLGnlsnNfIwu/IAKTSZtk=");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2f$AuthScreen$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/auth/AuthScreen.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/Sidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Topbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/Topbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminDashboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/admin/AdminDashboard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminApprovals$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/admin/AdminApprovals.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminOrganizers$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/admin/AdminOrganizers.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminUsers$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/admin/AdminUsers.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminBookings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/admin/AdminBookings.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminMemberships$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/admin/AdminMemberships.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminReviews$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/admin/AdminReviews.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminSupport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/admin/AdminSupport.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$CouponManagement$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/admin/CouponManagement.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$ContentManagement$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/admin/ContentManagement.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$CommunicationsHub$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/admin/CommunicationsHub.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$ActionCenter$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/admin/ActionCenter.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$organizer$2f$OrganizerDashboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/organizer/OrganizerDashboard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$organizer$2f$OrganizerCamps$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/organizer/OrganizerCamps.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$organizer$2f$OrganizerBookings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/organizer/OrganizerBookings.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$organizer$2f$OrganizerReports$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/organizer/OrganizerReports.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$organizer$2f$OrganizerCustomers$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/organizer/OrganizerCustomers.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$organizer$2f$OrganizerReviews$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/organizer/OrganizerReviews.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$user$2f$UserDashboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/user/UserDashboard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$user$2f$UserWishlist$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/user/UserWishlist.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$user$2f$UserPayments$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/user/UserPayments.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$user$2f$UserSupport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/user/UserSupport.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$marketplace$2f$CampCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/marketplace/CampCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$marketplace$2f$CampDetails$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/marketplace/CampDetails.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$marketplace$2f$CheckoutPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/marketplace/CheckoutPage.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$shared$2f$SettingsPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/shared/SettingsPage.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$shared$2f$ReviewsPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/shared/ReviewsPage.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$shared$2f$ReportsPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/shared/ReportsPage.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$MarketplaceSearchForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/MarketplaceSearchForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-toast.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toaster$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/toaster.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function Home() {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('dashboard');
    const [pageParams, setPageParams] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [selectedCampId, setSelectedCampId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [refreshKey, setRefreshKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Filtering & Discovery State
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [activeMarketTab, setActiveMarketTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('All');
    const [sortBy, setSortBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('newest');
    const [priceRange, setPriceRange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        0,
        50000
    ]);
    const [difficultyFilter, setDifficulty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('All');
    const [familyOnly, setFamilyOnly] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [minRating, setMinRating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [minGroupSize, setMinGroupSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [maxDuration, setMaxDuration] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(30);
    const [dateFilter, setDateFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            const session = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentUser"])();
            if (session) {
                setUser(session);
                const appData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAppData"])(session.email);
                setData(appData);
            }
            setIsLoading(false);
        }
    }["Home.useEffect"], [
        refreshKey
    ]);
    const triggerRefresh = ()=>setRefreshKey((p)=>p + 1);
    const toggleSidebar = ()=>{
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };
    const handleLogin = (u)=>{
        setUser(u);
        const appData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAppData"])(u.email);
        setData(appData);
        // Redirect unapproved organizers to audit page
        if (u.role === 'organizer' && !u.isApproved && !u.isRejected) {
            setCurrentPage('audit');
        } else {
            setCurrentPage('dashboard');
        }
    };
    const handleLogout = ()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setCurrentUser"])(null);
        setUser(null);
        setData(null);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])({
            title: 'Logged out',
            description: 'See you on your next adventure!'
        });
    };
    const onNavigate = (page, params)=>{
        setCurrentPage(page);
        setPageParams(params || null);
        if (params === null || params === void 0 ? void 0 : params.selectedId) {
            setSelectedCampId(params.selectedId);
        } else {
            setSelectedCampId(null);
        }
        window.scrollTo(0, 0);
    };
    const handleBookInitiate = (bookingData)=>{
        onNavigate('checkout', bookingData);
    };
    const handleConfirmBooking = (bookingData, participants)=>{
        if (!data || !user) return;
        const amount = bookingData.amount || 0;
        const newBooking = {
            id: Math.random().toString(36).slice(2, 9).toUpperCase(),
            customer: "".concat(user.firstName, " ").concat(user.lastName),
            customerEmail: user.email,
            camp: bookingData.camp || '',
            campId: bookingData.campId || '',
            checkin: bookingData.checkin || '',
            checkout: bookingData.checkout || '',
            amount: amount,
            commissionAmount: amount * 0.10,
            status: 'Confirmed',
            addedAt: new Date().toISOString(),
            participants: participants || [],
            userEmail: '',
            organizerEmail: ''
        };
        const activity = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uid"])(),
            type: 'Booked',
            camp: bookingData.camp || 'Adventure',
            date: new Date().toISOString()
        };
        const updatedData = {
            ...data,
            bookings: [
                newBooking,
                ...data.bookings
            ],
            activities: [
                activity,
                ...data.activities
            ]
        };
        setData(updatedData);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAppData"])(user.email, updatedData);
        const camp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllApprovedCamps"])().find((c)=>c.id === bookingData.campId);
        if (camp) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addUserNotification"])(camp.addedBy, {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uid"])(),
                type: 'booking',
                title: 'New Booking Received!',
                message: "Explorer ".concat(user.firstName, ' has booked "').concat(bookingData.camp, '".'),
                time: new Date().toISOString(),
                read: false
            });
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])({
            title: 'Expedition Confirmed!',
            description: "Payment successful for ".concat(bookingData.camp, ".")
        });
        setCurrentPage('activities');
        triggerRefresh();
    };
    const handleCancelBooking = (bookingId)=>{
        if (!data || !user) return;
        const bookingToCancel = data.bookings.find((b)=>b.id === bookingId);
        if (!bookingToCancel) return;
        const updatedBookings = data.bookings.map((b)=>b.id === bookingId ? {
                ...b,
                status: 'Cancelled'
            } : b);
        const activity = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uid"])(),
            type: 'Cancelled Trip',
            camp: bookingToCancel.camp,
            date: new Date().toISOString()
        };
        const updatedData = {
            ...data,
            bookings: updatedBookings,
            activities: [
                activity,
                ...data.activities
            ]
        };
        setData(updatedData);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAppData"])(user.email, updatedData);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])({
            variant: 'destructive',
            title: 'Trip Cancelled',
            description: "Your booking for ".concat(bookingToCancel.camp, " has been cancelled.")
        });
        triggerRefresh();
    };
    const handleAddReview = (review)=>{
        if (!data || !user) return;
        const activity = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uid"])(),
            type: 'Reviewed',
            camp: review.camp,
            date: new Date().toISOString()
        };
        const updatedData = {
            ...data,
            reviews: [
                review,
                ...data.reviews
            ],
            activities: [
                activity,
                ...data.activities
            ]
        };
        setData(updatedData);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAppData"])(user.email, updatedData);
        triggerRefresh();
    };
    const toggleWishlist = (id, e)=>{
        if (e) e.stopPropagation();
        if (!data || !user) return;
        const currentWishlist = data.wishlist || [];
        const isWishlisted = currentWishlist.includes(id);
        const updatedWishlist = isWishlisted ? currentWishlist.filter((item)=>item !== id) : [
            ...currentWishlist,
            id
        ];
        const updatedData = {
            ...data,
            wishlist: updatedWishlist
        };
        setData(updatedData);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAppData"])(user.email, updatedData);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])({
            title: isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist'
        });
    };
    const handleUpdateProfile = (updatedUser)=>{
        setUser(updatedUser);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setCurrentUser"])(updatedUser);
        const allUsers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getUsers"])();
        allUsers[updatedUser.email.toLowerCase()] = updatedUser;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveUsers"])(allUsers);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])({
            title: 'Profile Updated',
            description: 'Your changes have been saved successfully.'
        });
        triggerRefresh();
    };
    const filteredAndSortedCamps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Home.useMemo[filteredAndSortedCamps]": ()=>{
            const allApproved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllApprovedCamps"])();
            const globalData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGlobalAppData"])();
            const bookingCounts = {};
            globalData.allBookings.forEach({
                "Home.useMemo[filteredAndSortedCamps]": (b)=>{
                    bookingCounts[b.campId] = (bookingCounts[b.campId] || 0) + 1;
                }
            }["Home.useMemo[filteredAndSortedCamps]"]);
            return allApproved.filter({
                "Home.useMemo[filteredAndSortedCamps]": (camp)=>{
                    if (camp.status !== 'approved' || camp.isHidden) return false;
                    const matchesSearch = camp.name.toLowerCase().includes(searchQuery.toLowerCase()) || camp.location.toLowerCase().includes(searchQuery.toLowerCase()) || camp.organizer.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesPrice = camp.price >= priceRange[0] && camp.price <= priceRange[1];
                    const matchesDifficulty = difficultyFilter === 'All' || camp.difficulty === difficultyFilter;
                    const matchesFamily = familyOnly ? camp.familyFriendly : true;
                    const matchesRating = (camp.rating || 5) >= minRating;
                    const matchesGroupSize = (camp.capacity || 0) >= minGroupSize;
                    const matchesTab = activeMarketTab === 'All' || camp.category === activeMarketTab;
                    const matchesDuration = camp.duration <= maxDuration;
                    const matchesDate = !dateFilter || new Date(camp.startDate) >= new Date(dateFilter);
                    return matchesSearch && matchesPrice && matchesDifficulty && matchesFamily && matchesRating && matchesGroupSize && matchesTab && matchesDuration && matchesDate;
                }
            }["Home.useMemo[filteredAndSortedCamps]"]).sort({
                "Home.useMemo[filteredAndSortedCamps]": (a, b)=>{
                    if (a.isFeatured && !b.isFeatured) return -1;
                    if (!a.isFeatured && b.isFeatured) return 1;
                    switch(sortBy){
                        case 'price_low':
                            return a.price - b.price;
                        case 'price_high':
                            return b.price - a.price;
                        case 'top_rated':
                            return (b.rating || 5) - (a.rating || 5);
                        case 'most_booked':
                            return (bookingCounts[b.id] || 0) - (bookingCounts[a.id] || 0);
                        case 'trending':
                            return (b.occupancy || 0) - (a.occupancy || 0);
                        case 'newest':
                        default:
                            return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
                    }
                }
            }["Home.useMemo[filteredAndSortedCamps]"]);
        }
    }["Home.useMemo[filteredAndSortedCamps]"], [
        searchQuery,
        sortBy,
        priceRange,
        difficultyFilter,
        familyOnly,
        minRating,
        minGroupSize,
        maxDuration,
        dateFilter,
        activeMarketTab,
        refreshKey
    ]);
    if (isLoading) return null;
    if (!user) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2f$AuthScreen$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        onLogin: handleLogin
    }, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 309,
        columnNumber: 21
    }, this);
    const clearAllFilters = ()=>{
        setSearchQuery('');
        setDifficulty('All');
        setFamilyOnly(false);
        setMinRating(0);
        setPriceRange([
            0,
            50000
        ]);
        setMaxDuration(30);
        setDateFilter('');
        setMinGroupSize(0);
        setActiveMarketTab('All');
    };
    const renderContent = ()=>{
        if (selectedCampId) {
            const allApproved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllApprovedCamps"])();
            const camp = allApproved.find((c)=>c.id === selectedCampId);
            if (camp) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$marketplace$2f$CampDetails$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                camp: camp,
                onBack: ()=>setSelectedCampId(null),
                onBook: handleBookInitiate,
                reviews: (data === null || data === void 0 ? void 0 : data.reviews.filter((r)=>r.campId === camp.id)) || [],
                onAddReview: handleAddReview,
                currentUser: user,
                isWishlisted: ((data === null || data === void 0 ? void 0 : data.wishlist) || []).includes(camp.id),
                onToggleWishlist: toggleWishlist
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 328,
                columnNumber: 9
            }, this);
        }
        const backToDashboard = ()=>onNavigate('dashboard');
        switch(currentPage){
            case 'dashboard':
                if (user.role === 'admin') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminDashboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    onNavigate: onNavigate,
                    currentUser: user,
                    data: data
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 345,
                    columnNumber: 43
                }, this);
                if (user.role === 'organizer') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$organizer$2f$OrganizerDashboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    onNavigate: onNavigate,
                    currentUser: user,
                    data: data
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 346,
                    columnNumber: 47
                }, this);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$user$2f$UserDashboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    onNavigate: onNavigate,
                    currentUser: user,
                    data: data
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 347,
                    columnNumber: 16
                }, this);
            case 'approvals':
                if (user.role !== 'admin') return null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminApprovals$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 351,
                    columnNumber: 16
                }, this);
            case 'organizers':
                if (user.role !== 'admin') return null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminOrganizers$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 355,
                    columnNumber: 16
                }, this);
            case 'memberships':
                if (user.role !== 'admin') return null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminMemberships$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 359,
                    columnNumber: 16
                }, this);
            case 'coupons':
                if (user.role !== 'admin') return null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$CouponManagement$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 363,
                    columnNumber: 16
                }, this);
            case 'cms':
                if (user.role !== 'admin') return null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$ContentManagement$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 367,
                    columnNumber: 16
                }, this);
            case 'communications':
                if (user.role !== 'admin') return null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$CommunicationsHub$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 371,
                    columnNumber: 16
                }, this);
            case 'users':
                if (user.role !== 'admin') return null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminUsers$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 375,
                    columnNumber: 16
                }, this);
            case 'support':
                if (user.role === 'admin') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminSupport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 378,
                    columnNumber: 43
                }, this);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$user$2f$UserSupport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    currentUser: user,
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 379,
                    columnNumber: 16
                }, this);
            case 'action_center':
                if (user.role !== 'admin') return null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$ActionCenter$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    currentUser: user,
                    onNavigate: onNavigate,
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 383,
                    columnNumber: 16
                }, this);
            case 'bookings':
                if (user.role === 'admin') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminBookings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    initialFilter: (pageParams === null || pageParams === void 0 ? void 0 : pageParams.filter) || 'All',
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 386,
                    columnNumber: 43
                }, this);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$organizer$2f$OrganizerBookings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    currentUser: user,
                    onBack: backToDashboard,
                    onRefresh: triggerRefresh
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 387,
                    columnNumber: 16
                }, this);
            case 'wishlist':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$user$2f$UserWishlist$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    currentUser: user,
                    data: data,
                    onBack: backToDashboard,
                    onNavigate: onNavigate,
                    onToggleWishlist: toggleWishlist
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 390,
                    columnNumber: 16
                }, this);
            case 'payments':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$user$2f$UserPayments$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    currentUser: user,
                    data: data,
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 393,
                    columnNumber: 16
                }, this);
            case 'organizer_reports':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$organizer$2f$OrganizerReports$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    currentUser: user,
                    data: data,
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 396,
                    columnNumber: 16
                }, this);
            case 'organizer_customers':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$organizer$2f$OrganizerCustomers$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    currentUser: user,
                    data: data,
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 399,
                    columnNumber: 16
                }, this);
            case 'checkout':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$marketplace$2f$CheckoutPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    bookingData: pageParams,
                    onBack: ()=>setSelectedCampId(pageParams.campId),
                    onConfirm: handleConfirmBooking,
                    currentUser: user
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 402,
                    columnNumber: 16
                }, this);
            case 'reports':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$shared$2f$ReportsPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 405,
                    columnNumber: 16
                }, this);
            case 'camps':
                if (user.role === 'organizer') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$organizer$2f$OrganizerCamps$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    currentUser: user
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 408,
                    columnNumber: 47
                }, this);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-6 animate-in fade-in duration-700 font-sans",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$MarketplaceSearchForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            searchQuery: searchQuery,
                            setSearchQuery: setSearchQuery,
                            sortBy: sortBy,
                            setSortBy: setSortBy,
                            priceRange: priceRange,
                            setPriceRange: setPriceRange,
                            difficultyFilter: difficultyFilter,
                            setDifficulty: setDifficulty,
                            familyOnly: familyOnly,
                            setFamilyOnly: setFamilyOnly,
                            minRating: minRating,
                            setMinRating: setMinRating,
                            minGroupSize: minGroupSize,
                            setMinGroupSize: setMinGroupSize,
                            maxDuration: maxDuration,
                            setMaxDuration: setMaxDuration,
                            dateFilter: dateFilter,
                            setDateFilter: setDateFilter,
                            clearAllFilters: clearAllFilters,
                            backToDashboard: backToDashboard
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 412,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex overflow-x-auto no-scrollbar gap-2 pb-2",
                            children: [
                                'All',
                                'Mountain',
                                'River',
                                'Forest',
                                'Desert',
                                'Beach',
                                'Adventure'
                            ].map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveMarketTab(tab),
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-6 py-3 rounded-2xl text-[10px] font-medium uppercase tracking-widest transition-all whitespace-nowrap", activeMarketTab === tab ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"),
                                    children: tab === 'All' ? 'Explore All' : tab
                                }, tab, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 437,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 435,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-center px-2 py-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-[10px] font-medium text-slate-400 uppercase tracking-widest",
                                    children: [
                                        "Found ",
                                        filteredAndSortedCamps.length,
                                        " expeditions"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 451,
                                    columnNumber: 16
                                }, this),
                                (searchQuery || difficultyFilter !== 'All' || familyOnly || minRating > 0 || maxDuration < 30 || dateFilter || minGroupSize > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: clearAllFilters,
                                    className: "text-[9px] font-medium text-primary uppercase flex items-center gap-1.5 hover:underline",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            size: 12
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 456,
                                            columnNumber: 20
                                        }, this),
                                        " Clear Filters"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 455,
                                    columnNumber: 18
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 450,
                            columnNumber: 13
                        }, this),
                        filteredAndSortedCamps.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "py-32 flex flex-col items-center justify-center bg-white rounded-[40px] border border-dashed border-slate-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        size: 48,
                                        className: "text-slate-200"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 464,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 463,
                                    columnNumber: 18
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-medium text-slate-800 uppercase tracking-tight",
                                    children: "No results matched your search"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 466,
                                    columnNumber: 18
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-slate-400 font-medium mt-2 uppercase tracking-widest",
                                    children: "Try adjusting your filters or keywords"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 467,
                                    columnNumber: 18
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "outline",
                                    onClick: clearAllFilters,
                                    className: "mt-8 h-12 px-10 rounded-2xl border-primary text-primary font-medium uppercase text-[10px] tracking-widest",
                                    children: "Show All"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 468,
                                    columnNumber: 18
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 462,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20",
                            children: filteredAndSortedCamps.map((camp)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$marketplace$2f$CampCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    camp: camp,
                                    onClick: setSelectedCampId,
                                    onBook: (b)=>handleBookInitiate({
                                            campId: b.id,
                                            camp: b.name,
                                            amount: b.price,
                                            checkin: b.startDate,
                                            checkout: b.endDate
                                        }),
                                    isWishlisted: ((data === null || data === void 0 ? void 0 : data.wishlist) || []).includes(camp.id),
                                    onToggleWishlist: toggleWishlist
                                }, camp.id, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 473,
                                    columnNumber: 19
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 471,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 411,
                    columnNumber: 11
                }, this);
            case 'activities':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "outline",
                                    size: "icon",
                                    onClick: backToDashboard,
                                    className: "rounded-full h-10 w-10 border-slate-200 shadow-sm hover:bg-slate-50 shrink-0",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                        size: 18,
                                        className: "text-slate-600"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 497,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 491,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-2xl font-medium uppercase tracking-tight text-slate-800",
                                    children: "My Upcoming Trips"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 499,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 490,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-2 gap-6 pt-6",
                            children: [
                                data === null || data === void 0 ? void 0 : data.bookings.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-.white p-6 rounded-[24px] border border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-3xl shrink-0",
                                                children: "🏕️"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 504,
                                                columnNumber: 20
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex justify-between items-start",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-lg font-medium text-slate-800 uppercase tracking-tight",
                                                                children: b.camp
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 507,
                                                                columnNumber: 24
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                variant: "outline",
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-[9px] font-medium uppercase px-2 py-0.5 rounded-lg", b.status === 'Confirmed' ? 'border-green-200 text-green-700 bg-green-50' : b.status === 'Cancelled' ? 'border-red-200 text-red-700 bg-red-50' : 'border-amber-200 text-amber-700 bg-amber-50'),
                                                                children: b.status
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 508,
                                                                columnNumber: 24
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 506,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm text-slate-500 font-medium mt-1",
                                                        children: [
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtDate"])(b.checkin),
                                                            " - ",
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtDate"])(b.checkout)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 517,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-4 flex gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                variant: "outline",
                                                                size: "sm",
                                                                className: "rounded-lg h-9 px-4 font-medium uppercase text-[9px] tracking-widest border-slate-200 text-slate-500",
                                                                children: "Vouchers"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 519,
                                                                columnNumber: 25
                                                            }, this),
                                                            b.status !== 'Cancelled' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                variant: "outline",
                                                                size: "sm",
                                                                onClick: ()=>handleCancelBooking(b.id),
                                                                className: "rounded-lg h-9 px-4 font-medium uppercase text-[9px] tracking-widest text-destructive border-destructive/20 hover:bg-destructive/5",
                                                                children: "Cancel"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 521,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 518,
                                                        columnNumber: 22
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 505,
                                                columnNumber: 20
                                            }, this)
                                        ]
                                    }, b.id, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 503,
                                        columnNumber: 17
                                    }, this)),
                                (!(data === null || data === void 0 ? void 0 : data.bookings) || data.bookings.length === 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "col-span-full py-20 text-center bg-white rounded-[32px] border border-border/50 opacity-40 font-medium italic text-xl uppercase tracking-widest text-slate-400",
                                    children: "No trips booked yet"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 535,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 501,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 489,
                    columnNumber: 11
                }, this);
            case 'settings':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$shared$2f$SettingsPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    currentUser: user,
                    onUpdateProfile: handleUpdateProfile,
                    onBack: backToDashboard,
                    onLogout: handleLogout
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 545,
                    columnNumber: 11
                }, this);
            case 'reviews':
            case 'my_reviews':
                if (user.role === 'admin' && currentPage === 'reviews') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$admin$2f$AdminReviews$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 555,
                    columnNumber: 72
                }, this);
                if (user.role === 'organizer' && currentPage === 'reviews') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$organizer$2f$OrganizerReviews$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    currentUser: user,
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 556,
                    columnNumber: 76
                }, this);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$shared$2f$ReviewsPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    currentUser: user,
                    data: data,
                    onBack: backToDashboard
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 557,
                    columnNumber: 16
                }, this);
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col items-center justify-center h-full py-32 opacity-30 grayscale",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-8xl mb-6",
                            children: "🚧"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 562,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xl font-medium uppercase tracking-widest",
                            children: "Under Development"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 563,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-medium mt-2",
                            children: "Coming soon in v2.5"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 564,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 561,
                    columnNumber: 11
                }, this);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-screen bg-slate-50 font-sans font-normal",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("hidden md:block transition-all duration-300", isSidebarCollapsed ? "w-20" : "w-[280px]"),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "sticky top-0 h-screen overflow-y-auto no-scrollbar",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        currentUser: user,
                        currentPage: currentPage,
                        onNavigate: onNavigate,
                        onLogout: handleLogout,
                        isCollapsed: isSidebarCollapsed
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 574,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 573,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 572,
                columnNumber: 8
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Topbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        currentUser: user,
                        currentPage: currentPage,
                        onNavigate: onNavigate,
                        onLogout: handleLogout,
                        toggleSidebar: toggleSidebar
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 585,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 p-4 md:p-8 overflow-y-auto max-w-[1440px] mx-auto w-full relative no-scrollbar",
                        children: renderContent()
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 592,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 584,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toaster$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {}, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 596,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 571,
        columnNumber: 5
    }, this);
}
_s(Home, "W8RwkhbM5/EECGB7N1bz7P/AdHE=");
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_77346c5c._.js.map