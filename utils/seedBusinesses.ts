import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

const BUSINESS_NAMES = [
    "Spice Of India", "Desi Tiffin", "Sharma Grocery", "Patel Spices", "Curry House", "Namaste Yoga", "Bollywood Dance",
    "Royal Sweets", "Ganesh Temple", "Punjab Plumber", "Singh Electric", "Lotus Beauty", "Saffron Restaurant",
    "Chai Point", "Taste of Mumbai", "Delhi Chat", "Madras Cafe", "Ayurveda Wellness", "Hindi Tutor", "Sikh Gurdwara"
];

const LOCATIONS = [
    "Amstelveen Center", "Amsterdam Zuid", "Utrecht Central", "Eindhoven", "Rotterdam", "The Hague", "Almere",
    "Hoofddorp", "Leiden", "Haarlem", "Hilversum", "Zaandam"
];

const CATEGORIES = ['grocery', 'tiffin', 'restaurant', 'services', 'beauty', 'education', 'religious', 'other'];

const IMAGES = {
    grocery: "https://picsum.photos/seed/grocery/600/400",
    tiffin: "https://picsum.photos/seed/tiffin/600/400",
    restaurant: "https://picsum.photos/seed/restaurant/600/400",
    services: "https://picsum.photos/seed/services/600/400",
    beauty: "https://picsum.photos/seed/beauty/600/400",
    education: "https://picsum.photos/seed/education/600/400",
    religious: "https://picsum.photos/seed/religious/600/400",
    other: "https://picsum.photos/seed/other/600/400"
};

const LANGUAGES = ["English", "Dutch", "Hindi", "Marathi", "Punjabi", "Tamil", "Gujarati"];
const DIETARY = ["Pure Veg", "Non-Veg", "Halal", "Jain Available"];
const SERVICE_AREAS = ["Amstelveen", "Amsterdam Zuid", "Utrecht Central", "Eindhoven", "Rotterdam", "Den Haag"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SPECIALTIES = ["30% Ruling", "Tax Return", "M-Form", "Mortgage", "Relocation", "Tutor"];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const generateBusiness = (index: number) => {
    const category = getRandom(CATEGORIES);
    const name = `${getRandom(BUSINESS_NAMES)} ${Math.floor(Math.random() * 999)}`;
    const address = getRandom(LOCATIONS);

    // Keywords logic
    const keywords = Array.from(new Set([
        ...name.toLowerCase().split(' '),
        category.toLowerCase(),
        address.toLowerCase().split(' ')[0]
    ])).filter(k => k.length > 2); // Filter shorts

    const business: any = {
        name,
        category,
        address,
        phone: "+31 6 12345678",
        description: `Experience the best ${category} service at ${name}. Serving the community in ${address} with quality and care.`,
        imageUrl: `https://picsum.photos/seed/${category}${index}/600/400`,
        userId: "SEED_USER",
        rating: 4.0 + Math.random(), // 4.0 - 5.0
        reviewCount: Math.floor(Math.random() * 50),
        viewCount: Math.floor(Math.random() * 500),
        contactCount: Math.floor(Math.random() * 50),
        keywords,
        createdAt: serverTimestamp(),
        // NEW FIELDS
        isVerified: Math.random() > 0.3,
        languages: [getRandom(LANGUAGES), getRandom(LANGUAGES)].filter((v, i, a) => a.indexOf(v) === i),
        kvkNumber: `KVK${Math.floor(10000000 + Math.random() * 90000000)}`,
        website: `https://www.${name.toLowerCase().replace(/\s/g, '')}.com`,
        openingHours: {
            open: "09:00",
            close: "21:00"
        },
        serviceAreas: [address.split(' ')[0], getRandom(SERVICE_AREAS)]
    };

    // Category Specifics
    if (category === 'tiffin' || category === 'restaurant') {
        business.dietary = [getRandom(DIETARY)];
        business.fulfillment = Math.random() > 0.5 ? ["Delivery", "Pickup"] : ["Pickup Only"];
        business.deadline = category === 'tiffin' ? "Order before 10 AM for lunch" : "Closes at 10 PM";
    }

    if (category === 'grocery') {
        business.stockDay = getRandom(DAYS);
        business.minOrder = 20 + Math.floor(Math.random() * 30);
    }

    if (category === 'services') {
        business.fee = Math.random() > 0.5 ? "First 15 mins free" : "€60 / hour";
        business.specialties = [getRandom(SPECIALTIES), getRandom(SPECIALTIES)];
    }

    return business;
};

export const seedBusinesses = async (count = 200) => {
    const ref = collection(db, 'public', 'data', 'businesses');
    console.log(`Seeding ${count} businesses...`);

    // Process in smaller chunks to avoid overwhelming the client/network
    // though for 200, a simple loop with await is safest.
    for (let i = 0; i < count; i++) {
        const bus = generateBusiness(i);
        await addDoc(ref, bus);
        if (i % 20 === 0) console.log(`Seeded ${i}/${count}`);
    }
    console.log("Seeding complete!");
};
