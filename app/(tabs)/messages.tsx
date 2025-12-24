import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChannelList, useChatContext } from 'stream-chat-expo';
import { useAuth } from '../../context/AuthContext';

// Community IDs are used to identify community channels
const communityIds = [
    'national_intro', 'national_travel', 'national_cricket',
    'hub_ams_gen', 'hub_ams_sports', 'hub_ams_moms',
    'hub_adam_gen', 'hub_adam_student',
    'hub_eind_gen', 'hub_eind_carpool'
];

export default function MessagesScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'communities' | 'events' | 'marketplace' | 'business'>('communities');
    const { client } = useChatContext();

    if (!user || !client || !client.userID) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white border-t border-slate-200">
                <Text className="text-slate-500 font-medium">Please sign in to view messages</Text>
            </SafeAreaView>
        );
    }

    // Single consistent query to fetch all user channels
    const filters = useMemo(() => ({
        members: { $in: [client.userID] }
    }), [client.userID]);

    const sort = { last_message_at: -1 } as const;

    // Client-side filtering logic
    const channelRenderFilterFn = (channels: any) => {
        return channels.filter((c: any) => {
            const cid = c.id || '';
            const type = c.type; // 'messaging' usually

            if (activeTab === 'communities') {
                return communityIds.includes(cid) || cid.startsWith('national_') || cid.startsWith('hub_');
            }
            if (activeTab === 'events') {
                // TODO: Ensure events create channels with 'event_' prefix or specific data
                // For now assuming event channels might have specific ID pattern or data
                return cid.startsWith('event_') || c.data?.category === 'event';
            }
            if (activeTab === 'marketplace') {
                return cid.startsWith('market_') || c.data?.category === 'marketplace';
            }
            if (activeTab === 'business') {
                return cid.startsWith('business_') || c.data?.category === 'business';
            }
            return false;
        });
    };

    // Custom Channel Preview Implementation
    const renderChannelPreview = ({ channel }: any) => {
        const lastMessage = channel.state.messages[channel.state.messages.length - 1];
        const unreadCount = channel.countUnread();
        const displayTitle = channel.data.name || channel.id || 'Unknown';
        const displayImage = channel.data.image;
        const date = lastMessage?.created_at ? new Date(lastMessage.created_at) : null;

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
                                {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
            <View className="px-6 pt-4 pb-4 bg-white">
                <View className="flex-row justify-between items-start">
                    <View>
                        <Text className="text-4xl font-extrabold text-slate-900 tracking-tighter">Messages</Text>
                        <Text className="text-slate-500 font-medium text-base mt-1">Your conversations</Text>
                    </View>
                    {activeTab === 'communities' ? (
                        <TouchableOpacity
                            onPress={() => router.push('/communities')}
                            className="bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full flex-row items-center gap-1 mt-1"
                        >
                            <Text className="text-indigo-600 font-bold text-xs">Discover Communities</Text>
                        </TouchableOpacity>
                    ) : (
                        <View className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 mt-1">
                            <Text className="text-slate-600 font-bold text-lg">{user.email ? user.email[0].toUpperCase() : 'U'}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Edge-to-Edge Scrollable Filter Pills */}
            <View className="bg-white pb-4">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row"
                    contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
                >
                    {[
                        { id: 'communities', label: 'Communities' },
                        { id: 'events', label: 'Events' },
                        { id: 'marketplace', label: 'Marketplace' },
                        { id: 'business', label: 'Business' },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id as any)}
                            className={`px-5 py-2.5 rounded-full border ${activeTab === tab.id ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-50 border-slate-100'}`}
                        >
                            <Text className={`font-bold text-sm ${activeTab === tab.id ? 'text-white' : 'text-slate-600'}`}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View className="flex-1 bg-white">
                <ChannelList
                    filters={filters as any}
                    sort={sort}
                    channelRenderFilterFn={channelRenderFilterFn}
                    additionalFlatListProps={{
                        style: { backgroundColor: 'white' },
                        contentContainerStyle: { backgroundColor: 'white', flexGrow: 1 }
                    }}
                    Preview={renderChannelPreview}
                    onSelect={(channel) => {
                        router.push(`/channel/${channel.cid}`);
                    }}
                    EmptyStateIndicator={() => (
                        <View className="flex-1 items-center justify-center p-10 opacity-50 bg-white">
                            <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
                                <Text className="text-3xl grayscale">
                                    {activeTab === 'communities' && '👥'}
                                    {activeTab === 'events' && '📅'}
                                    {activeTab === 'marketplace' && '🛍️'}
                                    {activeTab === 'business' && '🏪'}
                                </Text>
                            </View>
                            <Text className="text-center font-bold text-slate-900 text-lg mb-2">
                                No {activeTab} chats
                            </Text>
                            <Text className="text-center text-sm text-slate-500 leading-5">
                                {activeTab === 'communities' && 'Join hubs and groups to connect with others.'}
                                {activeTab === 'events' && 'RSVP to events to join their discussion groups.'}
                                {activeTab === 'marketplace' && 'Start buying or selling to message here.'}
                                {activeTab === 'business' && 'Contact local businesses for inquiries.'}
                            </Text>
                            {activeTab === 'communities' && (
                                <TouchableOpacity
                                    onPress={() => router.push('/communities')}
                                    className="mt-6 bg-indigo-600 px-6 py-3 rounded-full shadow-sm shadow-indigo-200"
                                >
                                    <Text className="text-white font-bold">Discover Communities</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}
