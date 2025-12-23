import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Euro, MapPin, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../utils/firebaseConfig';
// Removed getStreamFeedClient import as we use context now

const BUSINESS_CATEGORIES = [
    'All', 'Tiffins & Food', 'Grocery Stores', 'Accountants & Advisors', 'Fashion & Jewelry', 'Other Services'
];

export default function AddPostScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { feedClient } = useAuth();

    useEffect(() => {
        if (params.initialCategory) setCategory(params.initialCategory as string);
        if (params.initialType) setType(params.initialType as string);
    }, [params]);
    const [type, setType] = useState('market'); // market | directory | guide
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');
    const [host, setHost] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('General');
    const [marketAction, setMarketAction] = useState('offered'); // offered | wanted

    const [loading, setLoading] = useState(false);

    const handlePost = async () => {
        if (!title || !auth.currentUser) return;
        setLoading(true);
        try {
            const collectionName = (type === 'event' || type === 'home') ? 'events' : 'market';
            let marketType = undefined;

            if (type === 'market') marketType = marketAction === 'offered' ? 'housing' : 'eclassifieds'; // Simplified based on logic or user choice, reusing map
            // Actually user logic was: housing vs eclassifieds. Let's stick to user ref logic:
            // "marketType" field holds 'housing', 'eclassifieds', 'business', 'guide'

            if (type === 'market') marketType = 'eclassifieds'; // default
            if (type === 'directory') marketType = 'business';
            if (type === 'guide') marketType = 'guide';

            const docData: any = {
                title,
                description: desc,
                userId: auth.currentUser.uid,
                createdAt: serverTimestamp(),
                host: host || 'User',
                imageUrl: imageUrl || null
            };

            if (type === 'event') {
                docData.location = location;
                docData.eventDate = date ? new Date(date).toISOString() : null;
                docData.attendeeIds = [auth.currentUser.uid];
            } else {
                // Market / Directory / Guide
                docData.marketType = marketType;
                docData.price = price || undefined;
                docData.location = location || undefined;
                if (type === 'market') docData.type = marketAction; // offered / wanted
                if (type === 'directory' || type === 'guide') docData.category = category;
            }

            // Quick fix for Housing specific override if user wanted housing
            // In RN UI simplicity, let's treat 'market' as general. 
            // The ref code had tabs for Housing/Classifieds. 

            // Firebase Write (Keeping for backup/search if needed, or remove if fully replacing?)
            // Plan said "Replace Firestore-based feeds". But currently we might want both for safety?
            // Let's keep Firebase for now as "Master Record" but Feeds for "Display".
            const docRef = await addDoc(collection(db, 'public', 'data', collectionName), docData);

            // Stream Feed Write
            if (feedClient && auth.currentUser) {
                const userFeed = feedClient.feed('user', auth.currentUser.uid);

                const activity: any = {
                    actor: `user:${auth.currentUser.uid}`,
                    verb: 'post',
                    object: title,
                    foreign_id: docRef.id,
                    time: new Date().toISOString(),
                    title: title,
                    description: desc,
                    imageUrl: imageUrl,
                    type: type,
                    ...docData
                };

                const to = ['user:global']; // Post to global feed by default

                if (type === 'guide' && category) {
                    const slug = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    to.push(`timeline:guide_${slug}`);
                }

                activity.to = to;

                await userFeed.addActivity(activity);
            }

            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not create post. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 py-3 border-b border-slate-100 flex-row justify-between items-center">
                <Text className="text-lg font-bold">New Post</Text>
                <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-100 rounded-full">
                    <X size={20} color="#64748b" />
                </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
                {/* Type Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 flex-row gap-2">
                    {['market', 'directory', 'guide'].map(t => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => setType(t)}
                            className={`px-4 py-2 rounded-full border ${type === t ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
                        >
                            <Text className={`font-bold capitalize ${type === t ? 'text-white' : 'text-slate-600'}`}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View className="space-y-4 gap-4 pb-10">
                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base"
                        placeholder={type === 'directory' ? "Business Name" : "Title"}
                        value={title}
                        onChangeText={setTitle}
                    />

                    {type === 'market' && (
                        <View className="flex-row gap-3">
                            <TouchableOpacity onPress={() => setMarketAction('offered')} className={`flex-1 py-3 items-center rounded-xl border ${marketAction === 'offered' ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-slate-200'}`}>
                                <Text className={`font-bold ${marketAction === 'offered' ? 'text-indigo-700' : 'text-slate-500'}`}>Offering</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setMarketAction('wanted')} className={`flex-1 py-3 items-center rounded-xl border ${marketAction === 'wanted' ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-slate-200'}`}>
                                <Text className={`font-bold ${marketAction === 'wanted' ? 'text-indigo-700' : 'text-slate-500'}`}>Wanted</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Category for Directory */}
                    {type === 'directory' && (
                        <View className="bg-slate-50 border border-slate-200 rounded-xl px-4">
                            <TextInput
                                className="py-3"
                                placeholder="Category (e.g. Food, Tax...)"
                                value={category}
                                onChangeText={setCategory}
                            />
                        </View>
                    )}

                    {type === 'market' && (
                        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4">
                            <Euro size={18} color="#94a3b8" />
                            <TextInput
                                className="flex-1 py-3 ml-2"
                                placeholder="Price"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                            />
                        </View>
                    )}

                    {type !== 'guide' && (
                        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4">
                            <MapPin size={18} color="#94a3b8" />
                            <TextInput
                                className="flex-1 py-3 ml-2"
                                placeholder="Location"
                                value={location}
                                onChangeText={setLocation}
                            />
                        </View>
                    )}

                    {type === 'event' && (
                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                            placeholder="YYYY-MM-DD"
                            value={date}
                            onChangeText={setDate}
                        />
                    )}

                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                        placeholder="Image URL (Optional)"
                        value={imageUrl}
                        onChangeText={setImageUrl}
                    />

                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 h-32 text-base"
                        placeholder="Description"
                        value={desc}
                        onChangeText={setDesc}
                        multiline
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        onPress={handlePost}
                        disabled={loading}
                        className={`py-4 rounded-xl items-center shadow-md ${loading ? 'bg-slate-300' : 'bg-indigo-600'}`}
                    >
                        <Text className="text-white font-bold text-lg">{loading ? 'Posting...' : 'Create Post'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
