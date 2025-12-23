import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Heart, MessageCircle, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function GuideCategoryScreen() {
    const { category } = useLocalSearchParams();
    const router = useRouter();
    const { feedClient } = useAuth();
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper to slugify category for feed ID
    const getFeedId = (cat: string) => `guide_${cat.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_')}`;

    const fetchFeed = async () => {
        if (!feedClient || !category) return;
        setError(null);
        try {
            // Fetch from the specific guide timeline feed
            const feedId = getFeedId(String(category));
            const feed = feedClient.feed('timeline', feedId);
            const results = await feed.getOrCreate({ limit: 20, watch: true });
            setActivities(results.activities);
        } catch (e: any) {
            console.warn("Guide Feed Fetch Error:", e);
            setError("Failed to load guide. Check Stream Auth settings.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, [category, feedClient]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchFeed();
    };

    const renderItem = ({ item }: { item: any }) => {
        const data = item;
        const hostName = typeof data.actor === 'string' ? 'User' : (data.actor?.data?.name || data.host || 'User');

        return (
            <View className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 overflow-hidden p-4">
                <View className="flex-row items-start gap-3">
                    <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
                        <Text className="font-bold text-slate-500 text-lg">
                            {hostName[0].toUpperCase()}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-slate-900 text-base leading-5 mb-1">{data.title || "Untitled Post"}</Text>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-xs text-slate-500 font-medium">{hostName}</Text>
                            <Text className="text-xs text-slate-300">•</Text>
                            <Text className="text-xs text-slate-400">
                                {data.time ? new Date(data.time).toLocaleDateString() : 'Just now'}
                            </Text>
                        </View>
                    </View>
                </View>

                <Text className="text-slate-600 mt-3 text-sm leading-5">{data.description}</Text>

                {data.imageUrl && (
                    <Image
                        source={{ uri: data.imageUrl }}
                        className="w-full h-48 rounded-xl mt-3 bg-slate-100"
                        resizeMode="cover"
                    />
                )}

                <View className="flex-row items-center border-t border-slate-50 mt-4 pt-3 gap-6">
                    <TouchableOpacity className="flex-row items-center gap-1.5 opacity-60">
                        <Heart size={18} color="#64748b" />
                        <Text className="text-xs font-bold text-slate-600">Like</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center gap-1.5 opacity-60">
                        <MessageCircle size={18} color="#64748b" />
                        <Text className="text-xs font-bold text-slate-600">Comment</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-4 py-3 border-b border-slate-100 flex-row items-center justify-between bg-white">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full overflow-hidden hover:bg-slate-50">
                        <ChevronLeft size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-900 capitalize">{category}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/add-guide-post', params: { initialCategory: category } })}
                    className="w-9 h-9 bg-indigo-600 rounded-full items-center justify-center shadow-sm"
                >
                    <Plus size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            {loading && !refreshing ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <FlatList
                    data={activities}
                    keyExtractor={i => i.id}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />
                    }
                    ListEmptyComponent={() => (
                        <View className="items-center justify-center py-20 opacity-50 px-4">
                            <MessageCircle size={48} color={error ? "#ef4444" : "#cbd5e1"} />
                            <Text className={`text-center mt-4 ${error ? "text-red-500 font-bold" : "text-slate-400"}`}>
                                {error || `No discussions yet in ${category}.\nBe the first to start one!`}
                            </Text>
                        </View>
                    )}
                    renderItem={renderItem}
                />
            )}
        </SafeAreaView>
    );
}
