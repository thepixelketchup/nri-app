import { View, Text, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDays, Flag, Megaphone, Plus, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';

export default function HomeScreen() {
    const router = useRouter();
    const [feed, setFeed] = useState<any[]>([]);

    useEffect(() => {
        // Determine App ID wrapper or just use root
        // For now assuming root collection 'public/data/events' etc for simplicity based on provided code structure
        // provided code: collection(db, 'artifacts', appId, 'public', 'data', 'events')
        // I need the appId. User code had: const appId = ...
        // I will hardcode a default appId or use a constant.
        const appId = 'default-app-id';

        const eventsRef = collection(db, 'artifacts', appId, 'public', 'data', 'events');
        // const q = query(eventsRef, orderBy('createdAt', 'desc'), limit(5));
        // For MVP, just fetching events
        const unsub = onSnapshot(eventsRef, (sn) => {
            const items = sn.docs.map(d => ({ id: d.id, ...d.data(), feedType: 'Event' }));
            setFeed(prev => [...items]); // Need to merge properly in real app
        });

        return unsub;
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            {/* Header */}
            <View className="px-4 py-3 bg-white border-b border-slate-100 flex-row justify-between items-center">
                <Text className="text-xl font-bold text-slate-900">Home Feed</Text>
                <TouchableOpacity onPress={() => { }} className="bg-slate-100 p-2 rounded-full">
                    <Search className="text-slate-500" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Quick Actions */}
                <View className="mb-6">
                    <Text className="text-xs font-bold text-slate-500 uppercase mb-3">Quick Actions</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/guides')}
                            className="w-32 h-28 bg-indigo-600 rounded-xl p-3 justify-between shadow-sm mr-3"
                        >
                            <Flag color="white" size={24} />
                            <Text className="text-white font-bold text-sm">Survival Kit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="w-24 h-28 bg-white border border-dashed border-slate-300 rounded-xl items-center justify-center">
                            <Plus color="#94a3b8" size={24} />
                            <Text className="text-xs font-bold text-slate-400 mt-2">Add Post</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Feed */}
                <View>
                    <Text className="text-xs font-bold text-slate-500 uppercase mb-3">Recent Updates</Text>
                    {feed.length === 0 ? (
                        <View className="items-center py-10 opacity-50">
                            <Text>No updates yet</Text>
                        </View>
                    ) : (
                        feed.map((item, idx) => (
                            <View key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 overflow-hidden">
                                {item.imageUrl && (
                                    <Image source={{ uri: item.imageUrl }} className="w-full h-40 bg-slate-200" />
                                )}
                                <View className="p-4">
                                    <Text className="text-lg font-bold text-slate-900 mb-1">{item.title}</Text>
                                    <Text className="text-sm text-slate-500 mb-3" numberOfLines={2}>{item.description}</Text>
                                    <View className="flex-row justify-between items-center pt-3 border-t border-slate-50">
                                        <Text className="text-xs text-slate-400 font-medium">{item.host || 'Community'}</Text>
                                        <Text className="text-indigo-600 font-bold text-xs">Event</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
