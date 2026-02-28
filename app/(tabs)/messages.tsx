import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChannelList, useChatContext } from 'stream-chat-expo';
import { FilterPills } from '../../components/ui/FilterPills';
import { useAuth } from '../../context/AuthContext';

export default function MessagesScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { client } = useChatContext();

    if (!user || !client || !client.userID) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white border-t border-slate-200">
                <Text className="text-slate-500 font-medium">Please sign in to view messages</Text>
            </SafeAreaView>
        );
    }

    // Filter State
    const [selectedFilter, setSelectedFilter] = useState('all');

    // Memoized Filters
    const filters = useMemo(() => {
        const baseFilter = {
            type: 'messaging',
            members: { $in: [client.userID as string] },
        };

        switch (selectedFilter) {
            case 'direct':
                return {
                    ...baseFilter,
                    member_count: 2, // 1:1 DMs (Safe fallback)
                    // category: { $ne: 'community' }, // Removed to ensure DMs appear
                };
            case 'events':
                return {
                    ...baseFilter,
                    category: 'event',
                };
            case 'marketplace':
                return {
                    ...baseFilter,
                    category: 'marketplace', // Corrected from 'commerce'
                };
            case 'all':
            default:
                return {
                    ...baseFilter,
                    // category: { $ne: 'community' }, // Temporarily disabled
                };
        }
    }, [client.userID, selectedFilter]);

    const sort = { last_message_at: -1 } as const;

    // Custom Channel Preview Implementation
    const renderChannelPreview = ({ channel }: any) => {
        const lastMessage = channel.state.messages[channel.state.messages.length - 1];
        const unreadCount = channel.countUnread();
        let displayTitle = channel.data.name || channel.id || 'Unknown';
        const displayImage = channel.data.image;
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

        return (
            <TouchableOpacity
                onPress={() => router.push(`/channel/${channel.cid}`)}
                className="bg-white px-6 py-4 border-b border-slate-50 flex-row items-center gap-4"
            >
                {/* Avatar */}
                <View className="w-12 h-12 bg-indigo-50 rounded-full overflow-hidden border border-indigo-100 flex items-center justify-center">
                    {displayImage ? (
                        <Image
                            source={{ uri: displayImage }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <Text className="text-indigo-600 font-bold text-lg">{displayTitle[0]?.toUpperCase()}</Text>
                    )}
                </View>

                {/* Content */}
                <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                        <Text className="font-bold text-slate-900 text-base flex-1 mr-2" numberOfLines={1}>{displayTitle}</Text>
                        {date && (
                            <Text className="text-xs text-slate-400 font-medium">
                                {formatTime(date)}
                            </Text>
                        )}
                    </View>
                    <Text className={`text-sm ${unreadCount > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}`} numberOfLines={1}>
                        {lastMessage?.text || 'No messages yet'}
                    </Text>
                </View>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <View className="bg-indigo-600 w-6 h-6 rounded-full items-center justify-center shadow-sm shadow-indigo-300">
                        <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };


    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header Title */}
            <View className="px-6 py-4 bg-white flex-row justify-between items-center">
                <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">Inbox</Text>
            </View>

            {/* Filter Pills */}
            <View className="pb-2">
                <FilterPills
                    items={[
                        { id: 'all', label: 'All' },
                        { id: 'direct', label: 'Direct' },
                        { id: 'events', label: 'Events' },
                        { id: 'marketplace', label: 'Marketplace' }
                    ]}
                    selectedId={selectedFilter}
                    onSelect={setSelectedFilter}
                />
            </View>

            <ChannelList
                filters={filters}
                sort={sort}
                Preview={renderChannelPreview}
            />
        </SafeAreaView>
    );
}
