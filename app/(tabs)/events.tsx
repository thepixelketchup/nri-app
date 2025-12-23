import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import { MapPin, Calendar } from 'lucide-react-native';

export default function EventsScreen() {
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        const appId = 'default-app-id';
        const eventsRef = collection(db, 'artifacts', appId, 'public', 'data', 'events');
        const q = query(eventsRef, orderBy('createdAt', 'desc'));

        const unsub = onSnapshot(q, (sn) => {
            const list = sn.docs.map(d => ({ id: d.id, ...d.data() }));
            setEvents(list);
        });
        return unsub;
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <View className="px-4 py-3 bg-white border-b border-slate-100">
                <Text className="text-xl font-bold text-slate-900">Events</Text>
            </View>

            <FlatList
                data={events}
                contentContainerStyle={{ padding: 16 }}
                keyExtractor={i => i.id}
                renderItem={({ item }) => (
                    <TouchableOpacity className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 overflow-hidden active:scale-95 transition-transform">
                        <View className="h-40 bg-slate-200 relative">
                            {item.imageUrl ? <Image source={{ uri: item.imageUrl }} className="w-full h-full" /> : <View className="w-full h-full bg-indigo-500" />}
                            <View className="absolute bottom-3 left-4 bg-white px-3 py-1 rounded-lg shadow-sm flex-row items-center gap-1">
                                <Calendar size={12} color="#4f46e5" />
                                <Text className="text-xs font-bold text-indigo-600">
                                    {item.eventDate ? new Date(item.eventDate).toLocaleDateString() : 'TBA'}
                                </Text>
                            </View>
                        </View>
                        <View className="p-4">
                            <Text className="text-lg font-bold text-slate-900">{item.title}</Text>
                            <View className="flex-row items-center gap-1 mt-2">
                                <MapPin size={14} color="#64748b" />
                                <Text className="text-xs text-slate-500">{item.location}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}
