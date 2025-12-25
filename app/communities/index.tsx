import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, Globe, Map, Plus, UsersRound } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Channel as StreamChannel } from 'stream-chat'; // Renamed to avoid conflict
import { useChatContext } from 'stream-chat-expo';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebaseConfig';

// Define simpler interface for our UI needs, or just use StreamChannel
type Channel = StreamChannel;


export default function CommunitiesScreen() {
    const router = useRouter();
    const { client } = useChatContext();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [userData, setUserData] = useState<any>(null);


    // Fetch User Profile (for joined status check fallback)
    useEffect(() => {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        const unsub = onSnapshot(userRef, (doc) => {
            setUserData(doc.data() || { joinedGroups: [] });
        });
        return unsub;
    }, [user]);

    const fetchCommunities = async () => {
        if (!client) return;

        try {
            // Query Stream directly for all community channels
            const filters = {
                type: 'messaging',
                category: 'community',
                // We fetch all to allow client-side filtering/grouping
            };
            const sort = { name: 1 }; // Alphabetical

            const result = await client.queryChannels(filters, sort as any, {
                watch: true,
                state: true,
                limit: 50,
            });

            setChannels(result);
        } catch (error) {
            console.error("Error fetching communities from Stream:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchCommunities();
        }, [client])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchCommunities();
    };



    // Grouping Logic
    const nationalGroups = useMemo(() =>
        channels.filter(c => (c.data as any)?.communityType === 'national'),
        [channels]);

    const localGroups = useMemo(() =>
        channels.filter(c => (c.data as any)?.communityType !== 'national'),
        [channels]);

    // Extract unique cities from local groups
    const uniqueCities = useMemo(() => {
        return Array.from(new Set(
            localGroups
                .map(c => (c.data as any)?.city)
                .filter(city => city && typeof city === 'string')
        )).sort();
    }, [channels]);



    const { top } = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: top }}>
            {/* Standard Nav Bar Header */}
            <View className="px-6 py-3 bg-white flex-row items-center justify-between border-b border-slate-50">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-100"
                >
                    <ArrowLeft size={20} color="#64748b" />
                </TouchableOpacity>

                <Text className="text-lg font-bold text-slate-900">Discover Communities</Text>

                {/* Empty View for center balance */}
                <View className="w-10" />
            </View>

            {loading && channels.length === 0 ? (
                <View className="flex-1 items-center justify-center bg-white">
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <ScrollView area-label="main-scroll"
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 60 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
                >
                    {/* National Section */}
                    {nationalGroups.length > 0 && (
                        <View className="mt-6 px-6">
                            <View className="flex-row items-center gap-2 mb-4">
                                <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center border border-indigo-100">
                                    <Globe size={16} color="#4f46e5" />
                                </View>
                                <Text className="text-lg font-bold text-slate-900">Netherlands Community</Text>
                            </View>

                            <View className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                {nationalGroups.map((channel, i) => {
                                    const isJoined = !!channel.state.members[user?.uid || ''];
                                    const data = channel.data as any;
                                    const memberCount = channel.data?.member_count || (channel.state as any).member_count || 0;

                                    return (
                                        <View
                                            key={channel.id}
                                            className={`p-4 flex-row items-center gap-4 ${i !== 0 ? 'border-t border-slate-50' : ''}`}
                                        >
                                            <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center overflow-hidden">
                                                {/* Fallback Icon logic */}
                                                <Text className="text-xl">{data.image || '🇳🇱'}</Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="font-bold text-slate-900 text-base">{data.name || 'Unnamed Group'}</Text>
                                                {/* Member Count */}
                                                <View className="flex-row items-center gap-1">
                                                    <UsersRound size={12} color="#64748b" />
                                                    <Text className="text-xs text-slate-500 font-medium">{memberCount} {memberCount === 1 ? 'member' : 'members'}</Text>
                                                </View>
                                            </View>

                                            <View className="w-[85px] items-end justify-center">
                                                <TouchableOpacity
                                                    onPress={() => router.push(`/communities/preview?cid=${channel.cid}`)}
                                                    className={`w-20 py-2 rounded-full items-center justify-center ${isJoined
                                                        ? 'bg-slate-100'
                                                        : 'bg-indigo-600 shadow-sm shadow-indigo-200'
                                                        }`}
                                                >
                                                    <Text className={`text-xs font-bold ${isJoined ? 'text-slate-500' : 'text-white'}`}>
                                                        {isJoined ? 'Joined' : 'Join'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                    )}

                    {/* Local Hubs Section - Grouped by City */}


                    {uniqueCities.length > 0 ? (
                        uniqueCities.map((city) => {
                            const cityGroups = localGroups.filter(c => (c.data as any)?.city === city);
                            if (cityGroups.length === 0) return null;

                            return (
                                <View key={city as string} className="mt-8 px-6">
                                    <View className="flex-row items-center gap-2 mb-4">
                                        <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center border border-indigo-100">
                                            <Map size={16} color="#4f46e5" />
                                        </View>
                                        <Text className="text-lg font-bold text-slate-900">{city as string} Community</Text>
                                    </View>

                                    <View className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                        {cityGroups.map((channel, i) => {
                                            const isJoined = !!channel.state.members[user?.uid || ''];
                                            const data = channel.data as any;
                                            const memberCount = channel.data?.member_count || (channel.state as any).member_count || 0;

                                            return (
                                                <View
                                                    key={channel.id}
                                                    className={`p-4 flex-row items-center gap-4 ${i !== 0 ? 'border-t border-slate-50' : ''}`}
                                                >
                                                    <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center overflow-hidden">
                                                        <Text className="text-xl">{data.image || '📍'}</Text>
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="font-bold text-slate-900 text-base">{data.name || 'Unnamed Group'}</Text>
                                                        {/* Member Count */}
                                                        <View className="flex-row items-center gap-1">
                                                            <UsersRound size={12} color="#64748b" />
                                                            <Text className="text-xs text-slate-500 font-medium">{memberCount} {memberCount === 1 ? 'member' : 'members'}</Text>
                                                        </View>
                                                    </View>

                                                    <View className="w-[85px] items-end justify-center">
                                                        <TouchableOpacity
                                                            onPress={() => router.push(`/communities/preview?cid=${channel.cid}`)}
                                                            className={`w-20 py-2 rounded-full items-center justify-center ${isJoined
                                                                ? 'bg-slate-100'
                                                                : 'bg-indigo-600 shadow-sm shadow-indigo-200'
                                                                }`}
                                                        >
                                                            <Text className={`text-xs font-bold ${isJoined ? 'text-slate-500' : 'text-white'}`}>
                                                                {isJoined ? 'Joined' : 'Join'}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            )
                                        })}
                                    </View>
                                </View>
                            )
                        })
                    ) : (
                        <View className="p-8 items-center justify-center">
                            <Text className="text-slate-400 font-medium">No communities found</Text>
                        </View>
                    )}


                    {/* Request Community Section */}
                    <View className="mx-6 mt-8 mb-8">
                        <TouchableOpacity
                            onPress={() => router.push('/communities/request')}
                            className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 items-center flex-row justify-center gap-3"
                        >
                            <View className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-100">
                                <Plus size={20} color="#64748b" />
                            </View>
                            <View>
                                <Text className="font-bold text-slate-700 text-lg">Don't see your city?</Text>
                                <Text className="text-slate-500 text-sm">Request to start a new community</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </View>
    );
}
