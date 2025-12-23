
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Calendar, MapPin, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STRINGS } from '../../constants/Strings';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebaseConfig';



export default function EventsScreen() {
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();



    useEffect(() => {
        const appId = 'nri-nl';
        const eventsRef = collection(db, 'public', 'data', 'events');
        // Limiting to 50 for performance as requested. FlatList handles rendering efficiently.
        const q = query(eventsRef, orderBy('eventDate', 'asc'), limit(50));

        const unsub = onSnapshot(q, (sn) => {
            const list = sn.docs.map(d => ({ id: d.id, ...d.data() }));
            console.log("Events fetched:", list.length);
            setEvents(list);
            setLoading(false);
        }, (error) => {
            console.error("Events fetch error:", error);
            setError(error.message);
            setLoading(false);
        });
        return unsub;
    }, []);

    const renderEventCard = ({ item }: { item: any }) => {
        const date = new Date(item.eventDate);
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(`/events/${item.id}`)}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-5 overflow-hidden"
            >
                {/* Event Image */}
                <View className="h-48 w-full relative">
                    <Image
                        source={{ uri: item.imageUrl || 'https://via.placeholder.com/400' }}
                        className="w-full h-full"
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={500}
                    />
                </View>

                {/* Content */}
                <View className="p-4">
                    <Text className="text-lg font-bold text-slate-900 mb-2 leading-6" numberOfLines={2}>
                        {item.title}
                    </Text>

                    <View className="flex-col gap-2">
                        <View className="flex-row items-center gap-2">
                            <Calendar size={14} color="#64748b" />
                            <Text className="text-sm font-medium text-slate-600">
                                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <MapPin size={14} color="#64748b" />
                            <Text className="text-sm font-medium text-slate-600 truncate flex-1" numberOfLines={1}>
                                {item.location}
                            </Text>
                        </View>
                    </View>

                    <View className="mt-4 pt-3 border-t border-slate-50 flex-row items-center gap-2">
                        <Users size={14} color="#64748b" />
                        <Text className="text-xs text-slate-500 font-medium">
                            {item.attendeeIds?.length > 0 ? `${item.attendeeIds.length} ${STRINGS.EVENTS.GOING_SUFFIX}` : STRINGS.EVENTS.BE_THE_FIRST}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            {/* Header - Minimal & Clean */}
            <View className="px-6 pt-4 pb-4 bg-white z-10 flex-row justify-between items-start">
                <View>
                    <Text className="text-4xl font-extrabold text-slate-900 tracking-tighter">{STRINGS.EVENTS.HEADER_TITLE}</Text>
                    <Text className="text-slate-500 font-medium text-base mt-1">{STRINGS.EVENTS.HEADER_SUBTITLE}</Text>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-red-500 text-center mb-2">{STRINGS.EVENTS.LOADING_ERROR}</Text>
                    <Text className="text-slate-400 text-center text-xs">{error}</Text>
                </View>
            ) : (
                <FlatList
                    data={events}
                    keyExtractor={i => i.id}
                    renderItem={renderEventCard}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20 opacity-50 h-full">
                            <Calendar size={48} color="#cbd5e1" />
                            <Text className="text-slate-400 mt-4 font-medium">{STRINGS.EVENTS.NO_EVENTS}</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
