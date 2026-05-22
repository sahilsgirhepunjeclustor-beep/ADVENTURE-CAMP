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
const fmt = (n)=>{
    if (n >= 100000) return "₹".concat((n / 100000).toFixed(2), "L");
    return "₹".concat(Number(n).toLocaleString('en-IN'));
};
const fmtDate = (d)=>{
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
]);

//# sourceMappingURL=src_43ed9057._.js.map