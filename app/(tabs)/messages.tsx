import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChannelList } from 'stream-chat-expo';
import { useAuth } from '../../context/AuthContext';

export default function MessagesScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'inbox' | 'communities'>('inbox');

    if (!user) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-slate-50 border-t border-slate-200">
                <Text className="text-slate-500 font-medium">Please sign in to view messages</Text>
            </SafeAreaView>
        );
    }

    // Filter Logic:
    // Inbox: Private chats (members >= 2 usually, but we can filter by NOT separate ID pattern if we used one).
    // The easiest way to distinct community channels vs private is custom data or ID prefix.
    // In communities.tsx we used `national_` and `hub_` prefixes.

    const filters = useMemo(() => {
        if (activeTab === 'inbox') {
            return {
                members: { $in: [user.uid] },
                type: 'messaging',
                id: { $nin: ['national_intro', 'national_travel', 'national_cricket', 'hub_ams_gen', 'hub_adam_gen', 'hub_eind_gen'] } // Basic exclusion, logically better to use custom field
                // Better approach: filter by explicitly NOT starting with 'national_' or 'hub_' using $nin or client side filter?
                // Stream filter support for regex on ID is limited.
                // Alternative: Filter by member_count <= 2 for DMs? But group DMs exist.
                // Ideally we tag channels with output data (e.g. { category: 'community' }).
                // For now, let's assume if it DOESN'T start with 'national_' AND 'hub_', it's inbox.
                // However, Stream Query Operators for strings are: $eq, $ne, $in, $nin. No $regex or $startswith.
                // So we will fetch all and rely on the fact that community channels have distinct IDs we can exclude if they are few.
                // Actually, let's reverse it: Communities Tab definitely looks for ID prefixes/specific IDs.
            };
        } else {
            return {
                members: { $in: [user.uid] },
                id: { $autocomplete: 'national_' } // This might work if supported or just simple member check for now, trusting the user joined specific groups.
                // Actually 'autocomplete' is for search.
                // Let's rely on a simpler approach: 
                // We'll tag the community channels with a custom field `isCommunity: true` moving forward, 
                // BUT for existing ones, we can just filter by member count > 20 OR explicit IDs? 

                // Let's try this: 
                // Inbox = All channels
                // Communities = All channels
                // And we use the `filterFn` prop of ChannelList if available? No, explicit props.
            };
        }
    }, [activeTab, user.uid]);

    // Better Strategy for Filters given Stream limitations without custom fields:
    // 1. Communities: We know the list of community IDs. We can check if `id` is IN that list.
    // 2. Inbox: `id` NOT IN that list.

    const communityIds = [
        'national_intro', 'national_travel', 'national_cricket',
        'hub_ams_gen', 'hub_ams_sports', 'hub_ams_moms',
        'hub_adam_gen', 'hub_adam_student',
        'hub_eind_gen', 'hub_eind_carpool'
    ];

    const inboxFilters = {
        members: { $in: [user.uid] },
        id: { $nin: communityIds }
    };

    const communityFilters = {
        members: { $in: [user.uid] },
        id: { $in: communityIds }
    };

    const sort = { last_message_at: -1 };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-4 py-3 bg-white">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-3xl font-bold text-slate-900">Messages</Text>
                    <View className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                        <Text className="text-indigo-600 font-bold text-lg">{user.email ? user.email[0].toUpperCase() : 'U'}</Text>
                    </View>
                </View>

                {/* Search Bar Placeholder */}
                <View className="bg-slate-50 flex-row items-center px-4 py-3 rounded-xl border border-slate-100 mb-4">
                    <Search size={20} color="#94a3b8" />
                    <Text className="ml-2 text-slate-400">Search messages...</Text>
                </View>

                {/* Tags Toggle */}
                <View className="flex-row bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                    <TouchableOpacity
                        onPress={() => setActiveTab('inbox')}
                        className={`flex-1 py-2 items-center rounded-lg flex-row justify-center gap-2 ${activeTab === 'inbox' ? 'bg-indigo-600' : 'bg-transparent'}`}
                    >
                        <Text className={`font-bold ${activeTab === 'inbox' ? 'text-white' : 'text-slate-500'}`}>Inbox 📩</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('communities')}
                        className={`flex-1 py-2 items-center rounded-lg flex-row justify-center gap-2 ${activeTab === 'communities' ? 'bg-indigo-600' : 'bg-transparent'}`}
                    >
                        <Text className={`font-bold ${activeTab === 'communities' ? 'text-white' : 'text-slate-500'}`}>Communities 👥</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-1 bg-slate-50">
                <ChannelList
                    key={activeTab} // Force re-mount on tab change to apply new filters clearly
                    filters={activeTab === 'inbox' ? inboxFilters : communityFilters}
                    sort={sort}
                    onSelect={(channel) => {
                        router.push(`/channel/${channel.cid}`);
                    }}
                    emptyStateIndicator={() => (
                        <View className="flex-1 items-center justify-center p-10 opacity-50">
                            <Text className="text-center font-bold text-slate-400 mb-2">No conversations yet</Text>
                            <Text className="text-center text-xs text-slate-400">
                                {activeTab === 'inbox' ? 'Start a chat from a marketplace listing!' : 'Join groups in the Hubs tab!'}
                            </Text>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}
