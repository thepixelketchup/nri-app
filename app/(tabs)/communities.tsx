import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { BookUser, Globe, Info, Map, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Channel } from 'stream-chat';
import { useChatContext } from 'stream-chat-expo';
import { SearchBar } from '../../components/ui/SearchBar';
import { useAuth } from '../../context/AuthContext';

type CommunityGroup = {
    name: string;
    city: string;
    type: 'national' | 'local' | 'interest';
    channels: Channel[];
    image?: string;
};

export default function MyCommunitiesScreen() {
    const router = useRouter();
    const { client } = useChatContext();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [myCommunities, setMyCommunities] = useState<CommunityGroup[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDiscoverBanner, setShowDiscoverBanner] = useState(false);

    // Banner Logic: Show until closed 3 times
    useEffect(() => {
        const checkBannerVisibility = async () => {
            try {
                const countStr = await AsyncStorage.getItem('discover_banner_dismissals');
                const count = countStr ? parseInt(countStr, 10) : 0;

                if (count < 3) {
                    setShowDiscoverBanner(true);
                }
            } catch (e) {
                console.error("Error checking banner visibility", e);
            }
        };
        checkBannerVisibility();
    }, []);

    const dismissBanner = async () => {
        setShowDiscoverBanner(false);
        try {
            const countStr = await AsyncStorage.getItem('discover_banner_dismissals');
            const count = countStr ? parseInt(countStr, 10) : 0;
            await AsyncStorage.setItem('discover_banner_dismissals', (count + 1).toString());
        } catch (e) {
            console.error("Error dismissing banner", e);
        }
    };

    const fetchMyCommunities = async (silent = false) => {
        // Wait for Stream Client to be fully connected
        if (!client || !user || !client.userID) return;

        if (!silent) setLoading(true); // Only show spinner on initial load or explicit refresh

        try {
            // Fetch channels where user is a member and category is 'community'
            const filters = {
                type: 'messaging',
                members: { $in: [user.uid] },
                category: 'community',
            };
            const sort = { last_message_at: -1 };

            const channels = await client.queryChannels(filters, sort as any, {
                watch: true,
                state: true,
            });

            // Group by City/Hub
            const groups: { [key: string]: CommunityGroup } = {};

            channels.forEach((channel) => {
                const data = channel.data as any;
                const city = data?.city as string || 'General';
                const type = data?.communityType as any || 'interest';
                const name = data?.name || 'Unknown Group'; // This might be "Indians in Amstelveen"

                // We want to group by the "Parent". 
                // Currently our data model is a bit flat.
                // If city is "Amstelveen", we group under "Amstelveen Hub".
                // If type is "national", we group under "National Groups".

                let groupKey = city;
                let groupName = city === 'All' ? 'National Community' : `${city} Community`;
                let groupImage = (channel.data as any)?.image;

                if (type === 'national') {
                    groupKey = 'National';
                    groupName = 'Netherlands Community';
                }

                if (!groups[groupKey]) {
                    groups[groupKey] = {
                        name: groupName,
                        city: city,
                        type: type,
                        channels: [],
                        image: groupImage
                    };
                }
                groups[groupKey].channels.push(channel);
            });

            // Sort: National first, then Alphabetical by Name
            const sortedGroups = Object.values(groups).sort((a, b) => {
                if (a.type === 'national') return -1;
                if (b.type === 'national') return 1;
                return a.name.localeCompare(b.name);
            });

            setMyCommunities(sortedGroups);

        } catch (e) {
            console.error("Error fetching my communities:", e);
        } finally {
            if (!silent) setLoading(false);
            setRefreshing(false);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchMyCommunities();
    }, [client, user, client?.userID]);

    // Refresh when screen comes into focus (clears unread badges)
    useFocusEffect(
        useCallback(() => {
            fetchMyCommunities(true);
        }, [client, user])
    );

    // Real-time Updates Listener
    useEffect(() => {
        if (!client) return;

        const handleEvent = (event: any) => {
            // Refresh list silently when message/channel events occur
            fetchMyCommunities(true);
        };

        // Listen for relevant events
        const listener = client.on(event => {
            if (
                event.type === 'message.new' ||
                event.type === 'notification.message_new' ||
                event.type === 'channel.updated' ||
                event.type === 'channel.truncated' ||
                event.type === 'channel.deleted' ||
                event.type === 'message.read'
            ) {
                handleEvent(event);
            }
        });

        return () => listener.unsubscribe();
    }, [client]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyCommunities(true); // Keep refreshing logic
    };

    // Filter Logic
    const filteredCommunities = myCommunities.map(group => {
        // If no query, return group as is
        if (!searchQuery.trim()) return group;

        const query = searchQuery.toLowerCase();

        // Check if group name matches
        const groupMatches = group.name.toLowerCase().includes(query);

        // Filter channels inside
        const matchingChannels = group.channels.filter(channel =>
            ((channel.data as any)?.name || '').toLowerCase().includes(query)
        );

        // If group matches, show all? Or just matching? 
        // Better UX: Show group if name matches OR if matching channels exist.
        // We will return the group with ONLY matching channels to reduce noise.

        if (matchingChannels.length > 0) {
            return { ...group, channels: matchingChannels };
        }

        // If the group header itself matches but no channels match explicitly (rare case if channels name include city),
        // we could show all channels, but for now let's strict filter on channels unless group name is very specific.
        // Actually, if I search "Amsterdam", I expect "Amsterdam Community" and all its channels?
        // Let's stick to channel filtering for now as it's cleaner. 
        if (groupMatches) return group; // Show all channels if Group Matches

        return null;
    }).filter(g => g !== null) as CommunityGroup[];

    const { top } = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-white">
            <View
                className="px-6 pb-2 bg-white z-10 flex-row justify-between items-start"
                style={{ paddingTop: top + 12 }}
            >
                <View className="flex-1">
                    <Text className="text-4xl font-extrabold text-slate-900 tracking-tighter">Communities</Text>
                    <Text className="text-slate-500 font-medium text-base mt-1">Connect with your tribe</Text>
                </View>
                {/* Permanent Discover Icon */}
                <TouchableOpacity
                    onPress={() => router.push('/communities')}
                    className="bg-indigo-600 w-10 h-10 rounded-full items-center justify-center"
                    style={{
                        shadowColor: "#4f46e5",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                >
                    <BookUser size={20} color="white" strokeWidth={1.5} />
                </TouchableOpacity>
            </View>

            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search your groups..."
            />

            {loading ? (
                <View className="flex-1 items-center justify-center bg-white">
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <ScrollView
                    className="flex-1 px-6 mt-2"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
                >
                    {/* Discover Banner (Professional "Tip" Style) */}
                    {(!searchQuery && showDiscoverBanner) && (
                        <View
                            className="bg-white mx-1 mb-6 rounded-xl shadow-sm flex-row overflow-hidden border border-indigo-100"
                        >
                            {/* Accent Strip */}
                            <View className="w-1.5 bg-indigo-600" />

                            <View className="p-4 flex-row items-start flex-1">
                                <View className="mr-3 mt-0.5">
                                    <Info size={20} color="#4f46e5" strokeWidth={2} />
                                </View>

                                <TouchableOpacity
                                    onPress={() => router.push('/communities')}
                                    className="flex-1 pr-6"
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-slate-900 font-semibold text-sm">Find More Communities</Text>
                                    <Text className="text-slate-600 text-xs mt-1 leading-5">
                                        Tap the compass icon above to browse all communities and join new groups.
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Close Button */}
                            <TouchableOpacity
                                onPress={dismissBanner}
                                className="absolute top-2 right-2 p-1.5 bg-slate-50 rounded-full"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <X size={14} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Groups List */}
                    {filteredCommunities.length === 0 ? (
                        <View className="items-center py-10">
                            <Text className="text-slate-400 font-medium text-center">
                                {searchQuery ? 'No matching groups found.' : "You haven't joined any communities yet."}
                            </Text>
                            {!searchQuery && (
                                <TouchableOpacity onPress={() => router.push('/communities')} className="mt-4">
                                    <Text className="text-indigo-600 font-bold">Find a Community</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        filteredCommunities.map((group) => (
                            <View key={group.name} className="mb-6">
                                {/* Group Header */}
                                <View className="flex-row items-center mb-3 gap-2">
                                    <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center border border-indigo-100">
                                        {group.type === 'national' ? (
                                            <Globe size={16} color="#4f46e5" />
                                        ) : (
                                            <Map size={16} color="#4f46e5" />
                                        )}
                                    </View>
                                    <Text className="text-lg font-bold text-slate-900">{group.name}</Text>
                                </View>

                                {/* Channels in this Group */}
                                <View className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                                    {group.channels.map((channel, i) => {
                                        const lastMessage = channel.state.messages[channel.state.messages.length - 1];
                                        const unreadCount = channel.countUnread();
                                        const displayTitle = (channel.data as any)?.name || 'Unknown';
                                        const displayImage = (channel.data as any)?.image;
                                        const date = lastMessage?.created_at;

                                        const formatTime = (date: Date) => {
                                            const now = new Date();
                                            const yesterday = new Date(now);
                                            yesterday.setDate(now.getDate() - 1);

                                            const isToday = date.toDateString() === now.toDateString();
                                            const isYesterday = yesterday.toDateString() === date.toDateString();

                                            if (isToday) {
                                                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                            } else if (isYesterday) {
                                                return 'Yesterday';
                                            } else {
                                                return date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' });
                                            }
                                        };

                                        const data = channel.data as any;

                                        return (
                                            <TouchableOpacity
                                                key={channel.cid}
                                                onPress={() => router.push(`/channel/${channel.cid}`)}
                                                className={`p-4 flex-row items-center gap-4 ${i !== 0 ? 'border-t border-slate-50' : ''} active:bg-slate-50`}
                                            >
                                                {/* Avatar */}
                                                <View className="w-12 h-12 bg-indigo-50 rounded-full overflow-hidden border border-indigo-100 flex items-center justify-center">
                                                    {displayImage ? (
                                                        // If image is an emoji string (from seed), render text, else Image
                                                        // Assuming seed data uses emoji strings for now based on current app state
                                                        displayImage.length < 5 ? (
                                                            <Text className="text-xl">{displayImage}</Text>
                                                        ) : (
                                                            <Image source={{ uri: displayImage }} className="w-full h-full" resizeMode="cover" />
                                                        )
                                                    ) : (
                                                        <Text className="text-indigo-600 font-bold text-lg">{displayTitle[0]?.toUpperCase()}</Text>
                                                    )}
                                                </View>

                                                {/* Content */}
                                                <View className="flex-1">
                                                    <View className="flex-row justify-between items-center mb-1">
                                                        <Text className="font-bold text-slate-900 text-base flex-1 mr-2" numberOfLines={1}>{displayTitle}</Text>
                                                        {date && (
                                                            <Text className="text-xs text-slate-400 font-medium ml-2">
                                                                {formatTime(date)}
                                                            </Text>
                                                        )}
                                                    </View>
                                                    <View className="flex-row justify-between items-center">
                                                        <Text className={`text-sm flex-1 mr-2 ${unreadCount > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}`} numberOfLines={1}>
                                                            {lastMessage?.text || 'No messages yet'}
                                                        </Text>
                                                        {unreadCount > 0 && (
                                                            <View className="bg-indigo-600 w-5 h-5 rounded-full items-center justify-center shadow-sm shadow-indigo-300">
                                                                <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}
