import { useRouter } from 'expo-router';
import { Flag, Home, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
    const router = useRouter();
    const { feedClient, user } = useAuth();
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFeed = async () => {
        if (!feedClient) return;
        setError(null);
        try {
            // Read from 'user:global'
            const feed = feedClient.feed('user', 'global');

            // Using getOrCreate({ watch: true }) as recommended for real-time
            // The user snippet suggests this is the way to read and subscribe
            const results = await feed.getOrCreate({ limit: 20, watch: true });

            // Note: results from getOrCreate matching strictly what user showed
            // Response type uses `activities`
            setActivities(results.activities);

            // For real-time, the SDK might handle it if we use hooks, but with raw client we might need
            // to listen to 'new_activity' event? 
            // feed.on('new_activity', ...) ?
            // Since .subscribe is missing on type, we assume getOrCreate sets up internal socket,
            // but we need to know how to bind UI.
            // For now, simple fetch is safer. We can explore hooks later.

        } catch (e: any) {
            console.warn("Home Feed Fetch Error:", e);
            setError("Unable to load feed. Invalid signature (Code 17) usually means you need to disable auth checks in Stream Dashboard.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFeed();
        // Cleanup subscription if possible? 
        // return () => feed.unsubscribe(); // hard to do without ref
    }, [feedClient]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchFeed();
    };

    const renderHeader = () => (
        <View className="mb-6 px-4 pt-4">
            {/* Quick Actions */}
            <View>
                <Text className="text-xs font-bold text-slate-500 uppercase mb-3">Quick Actions</Text>
                <View className="flex-row gap-3">
                    <TouchableOpacity onPress={() => router.push('/guides')} className="flex-1 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 justify-between shadow-sm">
                        <Flag color="white" size={24} />
                        <Text className="text-white font-bold text-sm">Survival Kit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/add-post')} className="w-28 h-28 bg-white border border-dashed border-slate-300 rounded-xl items-center justify-center">
                        <Plus color="#94a3b8" size={24} />
                        <Text className="text-xs font-bold text-slate-400 mt-2">Add Post</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className="mt-8 mb-2">
                <Text className="text-xs font-bold text-slate-500 uppercase">Recent Updates</Text>
            </View>
        </View>
    );

    const renderActivity = ({ item }: { item: any }) => {
        const { actor, verb, object, time, ...rest } = item;
        const data = item;
        const type = data.type || 'post';
        const isEvent = type === 'event';
        const actorName = typeof actor === 'string' ? actor.split(':')[1] : (actor?.data?.name || 'User');

        return (
            <TouchableOpacity
                onPress={() => { }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm mx-4 mb-4 overflow-hidden"
            >
                {data.imageUrl && (
                    <View className="h-40 bg-slate-200 relative">
                        <Image source={{ uri: data.imageUrl }} className="w-full h-full" />
                        <View className={`absolute top-2 left-2 px-2 py-1 rounded shadow-sm ${isEvent ? 'bg-indigo-600' : 'bg-orange-500'}`}>
                            <Text className="text-[10px] font-bold uppercase text-white">{type}</Text>
                        </View>
                    </View>
                )}
                <View className="p-4">
                    <View className="flex-row justify-between items-start">
                        <Text className="text-lg font-bold text-slate-900 mb-1 flex-1 mr-2">{data.title || object}</Text>
                        {!data.imageUrl && (
                            <View className={`px-2 py-1 rounded ${isEvent ? 'bg-indigo-100' : 'bg-orange-100'}`}>
                                <Text className={`text-[10px] font-bold uppercase ${isEvent ? 'text-indigo-700' : 'text-orange-700'}`}>{type}</Text>
                            </View>
                        )}
                    </View>

                    <Text className="text-sm text-slate-500 mb-3" numberOfLines={2}>{data.description}</Text>

                    <View className="flex-row justify-between items-center pt-3 border-t border-slate-50">
                        <View className="flex-row items-center gap-2">
                            <View className="bg-slate-100 px-2 py-0.5 rounded">
                                <Text className="text-xs text-slate-500 font-medium">{actorName}</Text>
                            </View>
                        </View>

                        {isEvent ? (
                            <Text className="text-indigo-600 font-bold text-xs">{data.eventDate ? new Date(data.eventDate).toLocaleDateString() : ''}</Text>
                        ) : (
                            data.price && <Text className="text-slate-900 font-bold text-sm">€{data.price}</Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-4 pb-2 bg-white flex-row justify-between items-center z-10">
                <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">Home Feed</Text>
                <TouchableOpacity onPress={() => router.push('/profile')} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
                    <Text className="text-indigo-600 font-bold text-lg">U</Text>
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <FlatList
                    data={activities}
                    keyExtractor={i => i.id || Math.random().toString()}
                    ListHeaderComponent={renderHeader}
                    renderItem={renderActivity}
                    ListEmptyComponent={() => (
                        <View className="items-center py-10 opacity-50 px-4">
                            <Home size={32} color={error ? "#ef4444" : "#cbd5e1"} />
                            <Text className={`text-center mt-2 ${error ? "text-red-500 font-bold" : "text-slate-400"}`}>
                                {error || "Feed is empty"}
                            </Text>
                        </View>
                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />
                    }
                />
            )}
        </SafeAreaView>
    );
}
