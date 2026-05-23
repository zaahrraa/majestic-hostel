// Preloaded hostel data — all frontend state simulation

export const HOSTEL_INFO = {
  name: "Majestic Girls Hostel",
  tagline: "Your Second Home. Safe. Disciplined. Comfortable.",
  address: "Plot 45 Block J, LDA Avenue, Phase 1, Lahore, Punjab, 54000",
  nearby: "Near COMSATS University Gate 3, Lahore, 54000, Pakistan",
  phone: "0327-0844959",
  email: "majesticgirlshostel@gmail.com",
  whatsapp: "923270844959",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3399.8956789!2d74.2799!3d31.5271!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDMxJzM3LjYiTiA3NMKwMTYnNDcuNiJF!5e0!3m2!1sen!2spk!4v1699999999999",
};

export const VISION_TEXT = `Welcome to Majestic Girls Hostel — your second home. Our goal is to provide a safe, disciplined, and supportive environment where every student can thrive academically and personally. We understand the concerns of parents who send their daughters away from home, which is why we have focused on security, cleanliness, and comfort as our top priorities.

Our hostel is not just a place to stay — it's a community built on respect, responsibility, and care. With biometric attendance, strict visitor protocols, and a team committed to maintaining order and cleanliness, we ensure that each student feels secure and supported.

We also encourage personal growth by providing motivational content, a peaceful environment for study, and a clear set of rules that promote healthy hostel living. Whether you're here for a semester or a full degree program, our staff and I are here to help you feel at home and stay focused on your goals.

Wishing you success and peace during your stay with us.`;

export const ROOMS = [
  {
    id: "1seater",
    title: "1-Seater Room",
    type: "Private",
    image: "https://i.postimg.cc/C1c6VYRr/1seater.png",
    price: "18,000",
    available: 3,
    features: ["Private bathroom", "Study desk", "Wardrobe", "AC ready", "Window view"],
    badge: "Premium",
    badgeColor: "gold",
    description: "Your own private sanctuary — perfect for focused study and personal space.",
  },
  {
    id: "2seater",
    title: "2-Seater Room",
    type: "Shared",
    image: "https://i.postimg.cc/c4sPj96P/2-seater.png",
    price: "12,000",
    available: 5,
    features: ["Shared bathroom", "2 Study desks", "2 Wardrobes", "AC ready", "Comfortable beds"],
    badge: "Popular",
    badgeColor: "rose",
    description: "Comfortable shared living with a trusted roommate. Affordable yet spacious.",
  },
  {
    id: "3seater",
    title: "3-Seater Room",
    type: "Shared",
    image: "https://i.postimg.cc/sgW8GtLr/3-seater.png",
    price: "9,000",
    available: 4,
    features: ["Shared bathroom", "3 Study desks", "3 Wardrobes", "Budget-friendly", "Great community"],
    badge: "Best Value",
    badgeColor: "muted",
    description: "Best value option for a vibrant community experience. Great friendships await.",
  },
];

export const FACILITIES = [
  {
    id: "mess",
    title: "Dining Mess",
    icon: "🍽️",
    image: "https://i.postimg.cc/Nj8DcYVb/mess.png",
    description: "Spacious dining area serving hygienic, home-cooked meals twice daily.",
  },
  {
    id: "kitchen1",
    title: "Kitchen (Main)",
    icon: "🍳",
    image: "https://i.postimg.cc/cHCBw3J7/kitechen1.png",
    description: "Fully equipped main kitchen for students who prefer cooking their own meals.",
  },
  {
    id: "kitchen2",
    title: "Kitchen (Secondary)",
    icon: "🔪",
    image: "https://i.postimg.cc/CMZWVB4H/kitchen2.png",
    description: "Secondary kitchen available during peak hours for additional cooking space.",
  },
  {
    id: "freezer",
    title: "Freezer & Oven",
    icon: "❄️",
    image: "https://i.postimg.cc/vmqSJbgr/facilites-like-fridge-and-water-dispensor.png",
    description: "Shared refrigerator, freezer, microwave, and oven available to all residents.",
  },
  {
    id: "elevator",
    title: "Elevator",
    icon: "🛗",
    image: "https://i.postimg.cc/fyX2Sd2s/elevator.png",
    description: "Modern, reliable elevator ensuring easy access to all floors.",
  },
  {
    id: "washroom",
    title: "Attached Washrooms",
    icon: "🚿",
    image: "https://i.postimg.cc/1zHvpPr8/attached-washroom1.png",
    description: "Clean, modern attached washrooms maintained to highest hygiene standards.",
  },
  {
    id: "security",
    title: "24/7 Security",
    icon: "📹",
    image: null,
    description: "Round-the-clock CCTV surveillance with biometric entry/exit system for total safety.",
  },
];

export const RULES = [
  {
    id: 1,
    icon: "🔐",
    title: "Biometric Entry/Exit Required",
    description: "All students must use the biometric system for every entry and exit. No exceptions.",
  },
  {
    id: 2,
    icon: "🌙",
    title: "Seasonal Curfew Timings",
    description: "Students must return before the seasonal closing time. Timings are posted on the notice board.",
  },
  {
    id: 3,
    icon: "📋",
    title: "Weekend Leave Recording",
    description: "Weekend leaves must be properly recorded with the warden at least 24 hours in advance.",
  },
  {
    id: 4,
    icon: "🚫",
    title: "No Outside Gatherings",
    description: "Gatherings outside the hostel gate are strictly prohibited for security reasons.",
  },
  {
    id: 5,
    icon: "🧹",
    title: "Daily Room Cleanliness",
    description: "Rooms must be cleaned daily. Inspections are conducted regularly. Maintain your space.",
  },
  {
    id: 6,
    icon: "🍽️",
    title: "Mess & Kitchen Conduct",
    description: "Use mess and kitchen cleanly. Only allowed food items may be prepared. Clean after use.",
  },
  {
    id: 7,
    icon: "📚",
    title: "Late-Night Study Courtesy",
    description: "Respect roommates during late-night study hours. Maintain noise discipline after 11 PM.",
  },
  {
    id: 8,
    icon: "💰",
    title: "Late Fee Policy",
    description: "A late fee of PKR 500 is charged for every month payment is overdue. Pay on time.",
  },
];

export const GALLERY_IMAGES = [
  { id: 1, src: "https://i.postimg.cc/dtYnSLN7/mainbuilding.png", alt: "Main Building", category: "Building" },
  { id: 2, src: "https://i.postimg.cc/PfmQZdX2/main-Building2.png", alt: "Main Building Entrance", category: "Building" },
  { id: 3, src: "https://i.postimg.cc/wBCDyGSJ/main-Building3.png", alt: "Main Building View", category: "Building" },
  { id: 4, src: "https://i.postimg.cc/v8L5TXXY/stairs.png", alt: "Internal Staircase", category: "Interior" },
  { id: 5, src: "https://i.postimg.cc/Nj8DcYVb/mess.png", alt: "Dining Mess", category: "Facilities" },
  { id: 6, src: "https://i.postimg.cc/cHCBw3J7/kitechen1.png", alt: "Kitchen Main", category: "Facilities" },
  { id: 7, src: "https://i.postimg.cc/CMZWVB4H/kitchen2.png", alt: "Kitchen Secondary", category: "Facilities" },
  { id: 8, src: "https://i.postimg.cc/vmqSJbgr/facilites-like-fridge-and-water-dispensor.png", alt: "Freezer & Appliances", category: "Facilities" },
  { id: 9, src: "https://i.postimg.cc/fyX2Sd2s/elevator.png", alt: "Elevator", category: "Facilities" },
  { id: 10, src: "https://i.postimg.cc/1zHvpPr8/attached-washroom1.png", alt: "Attached Washroom", category: "Rooms" },
  { id: 11, src: "https://i.postimg.cc/C1c6VYRr/1seater.png", alt: "1-Seater Room", category: "Rooms" },
  { id: 12, src: "https://i.postimg.cc/c4sPj96P/2-seater.png", alt: "2-Seater Room", category: "Rooms" },
  { id: 13, src: "https://i.postimg.cc/sgW8GtLr/3-seater.png", alt: "3-Seater Room", category: "Rooms" },
];

export interface Student {
  id: string;
  name: string;
  email: string;
  room: string;
  feeStatus: "Paid" | "Pending";
  joinDate: string;
  phone: string;
  university: string;
  cnic: string;
  guardian: string;
  guardianPhone: string;
  password: string;
  complaints: Complaint[];
  visitorRequests: VisitorRequest[];
  notices: Notice[];
  bookingStatus: "Active" | "Pending" | "Approved";
}

export interface Complaint {
  id: string;
  text: string;
  date: string;
  status: "Pending" | "Resolved";
}

export interface VisitorRequest {
  id: string;
  visitorName: string;
  relation: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  date: string;
  important: boolean;
}

export const INITIAL_NOTICES: Notice[] = [
  { id: "n1", title: "Eid Holiday Schedule", message: "The hostel will have extended curfew hours during Eid. Students must register their leave by 25th of this month.", date: "2025-06-10", important: true },
  { id: "n2", title: "Fee Payment Reminder", message: "Monthly fees are due by the 5th of each month. A late fee of PKR 500 applies after the due date.", date: "2025-06-01", important: true },
  { id: "n3", title: "Cleanliness Drive", message: "A hostel-wide cleanliness inspection will be conducted this Saturday. Please ensure your rooms are tidy.", date: "2025-06-08", important: false },
  { id: "n4", title: "New Biometric System", message: "The updated biometric system has been installed. Please register your fingerprints at the reception before Friday.", date: "2025-06-05", important: false },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "s1", name: "Ayesha Khan", email: "ayesha.khan@gmail.com", room: "1 Seater", feeStatus: "Paid",
    joinDate: "2025-01-15", phone: "0300-1234567", university: "COMSATS University", cnic: "35202-1234567-8",
    guardian: "Mr. Khan", guardianPhone: "0321-9876543", password: "ayesha123",
    complaints: [{ id: "c1", text: "Water supply disruption in washroom", date: "2025-06-02", status: "Resolved" }],
    visitorRequests: [{ id: "v1", visitorName: "Mother - Mrs. Khan", relation: "Mother", date: "2025-06-12", status: "Approved" }],
    notices: INITIAL_NOTICES, bookingStatus: "Active",
  },
  {
    id: "s2", name: "Fatima Ali", email: "fatimaali@gmail.com", room: "2 Seater", feeStatus: "Pending",
    joinDate: "2025-02-10", phone: "0301-2345678", university: "COMSATS University", cnic: "35202-2345678-9",
    guardian: "Mr. Ali", guardianPhone: "0322-8765432", password: "fatima123",
    complaints: [],
    visitorRequests: [{ id: "v2", visitorName: "Fatima's Sister", relation: "Sister", date: "2025-06-14", status: "Pending" }],
    notices: INITIAL_NOTICES, bookingStatus: "Active",
  },
  {
    id: "s3", name: "Hira Ahmed", email: "hira.ahmed@gmail.com", room: "3 Seater", feeStatus: "Paid",
    joinDate: "2025-01-20", phone: "0302-3456789", university: "UET Lahore", cnic: "35202-3456789-0",
    guardian: "Mr. Ahmed", guardianPhone: "0323-7654321", password: "hira123",
    complaints: [{ id: "c2", text: "AC not working properly in room 3B", date: "2025-06-05", status: "Pending" }],
    visitorRequests: [],
    notices: INITIAL_NOTICES, bookingStatus: "Active",
  },
  {
    id: "s4", name: "Sana Malik", email: "sana.malik@gmail.com", room: "2 Seater", feeStatus: "Pending",
    joinDate: "2025-03-05", phone: "0303-4567890", university: "LUMS", cnic: "35202-4567890-1",
    guardian: "Mr. Malik", guardianPhone: "0324-6543210", password: "sana123",
    complaints: [],
    visitorRequests: [],
    notices: INITIAL_NOTICES, bookingStatus: "Active",
  },
  {
    id: "s5", name: "Zainab Tariq", email: "zainab.tariq@gmail.com", room: "1 Seater", feeStatus: "Paid",
    joinDate: "2025-01-08", phone: "0304-5678901", university: "Punjab University", cnic: "35202-5678901-2",
    guardian: "Mr. Tariq", guardianPhone: "0325-5432109", password: "zainab123",
    complaints: [],
    visitorRequests: [{ id: "v3", visitorName: "Friend Amna", relation: "Friend", date: "2025-06-16", status: "Rejected" }],
    notices: INITIAL_NOTICES, bookingStatus: "Active",
  },
  {
    id: "s6", name: "Mahnoor Sheikh", email: "mahnoor@gmail.com", room: "3 Seater", feeStatus: "Pending",
    joinDate: "2025-02-28", phone: "0305-6789012", university: "FAST NUCES", cnic: "35202-6789012-3",
    guardian: "Mr. Sheikh", guardianPhone: "0326-4321098", password: "mahnoor123",
    complaints: [{ id: "c3", text: "Leaking pipe in the kitchen area", date: "2025-06-07", status: "Pending" }],
    visitorRequests: [{ id: "v4", visitorName: "Brother Bilal", relation: "Brother", date: "2025-06-18", status: "Pending" }],
    notices: INITIAL_NOTICES, bookingStatus: "Active",
  },
  {
    id: "s7", name: "Jannat Rasool", email: "jannat123@gmail.com", room: "3 Seater", feeStatus: "Paid",
    joinDate: "2025-03-15", phone: "0306-7890123", university: "Kinnaird College", cnic: "35202-7890123-4",
    guardian: "Mr. Rasool", guardianPhone: "0327-3210987", password: "jannat123",
    complaints: [],
    visitorRequests: [],
    notices: INITIAL_NOTICES, bookingStatus: "Active",
  },
  {
    id: "s8", name: "Komal Iqbal", email: "komal.iqbal@gmail.com", room: "2 Seater", feeStatus: "Pending",
    joinDate: "2025-04-01", phone: "0307-8901234", university: "Lahore College", cnic: "35202-8901234-5",
    guardian: "Mr. Iqbal", guardianPhone: "0328-2109876", password: "komal123",
    complaints: [],
    visitorRequests: [{ id: "v5", visitorName: "Father Mr. Iqbal", relation: "Father", date: "2025-06-20", status: "Pending" }],
    notices: INITIAL_NOTICES, bookingStatus: "Active",
  },
];

export const WARDEN_CREDENTIALS = {
  email: "warden@majestic.com",
  password: "warden@2025",
  name: "Hostel Warden",
};

export const STUDENT_DEMO = {
  email: "ayesha.khan@gmail.com",
  password: "ayesha123",
};
