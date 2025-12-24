import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { GROUPS } from './groups';

export const seedCommunities = async () => {
    try {
        console.log("Seeding National Groups...");
        const communitiesRef = collection(db, 'public', 'data', 'communities');

        for (const group of GROUPS.national) {
            // Check for duplicates by name to prevent flooding
            const q = query(communitiesRef, where("name", "==", group.name));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                console.log(`Skipping ${group.name}, already exists.`);
                continue;
            }

            // Generate new doc ref (auto-ID)
            const newDocRef = doc(communitiesRef);
            const channelId = newDocRef.id;

            await setDoc(newDocRef, {
                // id: group.id, // Removed as requested
                name: group.name,
                icon: group.icon,
                desc: group.desc,
                type: 'national',
                channelId: channelId
            });
            console.log(`Created national group: ${group.name} (${channelId})`);
        }

        console.log("Seeding Hub Groups...");
        for (const group of GROUPS.hubs) {
            const q = query(communitiesRef, where("name", "==", group.name));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                console.log(`Skipping ${group.name}, already exists.`);
                continue;
            }

            const newDocRef = doc(communitiesRef);
            const channelId = newDocRef.id;

            await setDoc(newDocRef, {
                // id: group.id, // Removed
                name: group.name,
                icon: group.icon,
                desc: group.desc,
                type: 'hub', // Using 'hub' to match index.tsx filter
                city: group.city,
                channelId: channelId
            });
            console.log(`Created hub group: ${group.name} (${channelId})`);
        }
        console.log("Communities seeding complete.");
    } catch (error) {
        console.error("Error seeding communities:", error);
        throw error;
    }
};
