import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

const IMAGES = [
    "https://images.unsplash.com/photo-1543450918-095fa7936c3e?q=80&w=2070&auto=format&fit=crop", // Diwali
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop", // Tech
    "https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=1978&auto=format&fit=crop", // Party
    "https://images.unsplash.com/photo-1465847899078-b41304c4202e?q=80&w=1943&auto=format&fit=crop", // Music
    "https://images.unsplash.com/photo-1544367563-12123d896889?q=80&w=2070&auto=format&fit=crop", // Yoga
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop", // Food
    "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop", // Cricket
    "https://images.unsplash.com/photo-1553531384-cc64ac80f931?q=80&w=1964&auto=format&fit=crop", // Holi
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop", // Startup
    "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=2070&auto=format&fit=crop", // Comedy
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop", // Office/Work
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop", // Party/Social
    "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1940&auto=format&fit=crop", // Concert
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070&auto=format&fit=crop", // Gala
    "https://images.unsplash.com/photo-1561489413-985b06da5bee?q=80&w=2070&auto=format&fit=crop", // Art
];

const TITLES_PREFIX = ["Grand", "Exclusive", "Annual", "Monthly", "Special", "Community", "Expats", "Weekend", "Friday Night", "Sunday"];
const TITLES_MAIN = ["Diwali Bash", "Tech Meetup", "Bollywood Night", "Classical Concert", "Yoga Session", "Food Festival", "Cricket Screening", "Holi Party", "Startup Pitch", "Comedy Show", "Networking Event", "Art Workshop", "Dance Class", "Cooking Masterclass"];
const LOCATIONS = ["RAI Amsterdam", "Vondelpark", "The Social Hub", "Melkweg", "Westergasfabriek", "Amstelveen Center", "Zuidas", "Arena Park", "Dam Square", "Rembrandtplein", "Utrecht Central", "Rotterdam Ahoy", "Eindhoven Tech Park"];
const HOSTS = ["Indian Expats NL", "Tech NL", "Desi Beats", "Sangeet NL", "Yoga with Priya", "Foodie Club", "Cricket Maniacs", "Startup Amsterdam", "Laughter Club", "Art & Soul"];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const generateEvent = (index: number) => {
    const title = `${getRandom(TITLES_PREFIX)} ${getRandom(TITLES_MAIN)} #${index + 1}`;
    const location = getRandom(LOCATIONS);
    const host = getRandom(HOSTS);
    const daysFromNow = Math.floor(Math.random() * 180); // Next 6 months

    const startTime = Date.now() + 86400000 * daysFromNow;
    const durationHours = Math.floor(Math.random() * 4) + 2; // 2 to 6 hours
    const endTime = startTime + durationHours * 3600000;

    return {
        title,
        description: `Join us for ${title}! It's going to be an amazing experience at ${location}. Meet likeminded people and enjoy a great time. Organized by ${host}.`,
        location,
        eventDate: new Date(startTime).toISOString(),
        endDate: new Date(endTime).toISOString(),
        imageUrl: getRandom(IMAGES),
        host,
        price: Math.random() > 0.3 ? Math.floor(Math.random() * 50) + 5 : 0, // 30% chance free, else 5-55 eur
        type: 'event'
    };
};

export const seedEvents = async () => {
    const eventsRef = collection(db, 'public', 'data', 'events');
    const TOTAL_TO_SEED = 100;

    let count = 0;
    // Batching would be better but simple loop is fine for client side script of 100
    for (let i = 0; i < TOTAL_TO_SEED; i++) {
        const ev = generateEvent(i);
        await addDoc(eventsRef, {
            ...ev,
            createdAt: serverTimestamp(),
            attendeeIds: []
        });
        count++;
        if (count % 10 === 0) console.log(`Seeded ${count}/${TOTAL_TO_SEED}`);
    }
    return count;
};
