import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe, Map, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useChatContext } from 'stream-chat-expo';

const GROUPS = {
    national: [
        { id: 'intro', name: 'Introductions', icon: '🎙️', desc: 'Say hello to the community' },
        { id: 'travel', name: 'Travel to India', icon: '✈️', desc: 'Flight buddies & document carry' },
        { id: 'cricket', name: 'Cricket Fans', icon: '🏏', desc: 'India vs Pakistan live chat' },
    ],
    hubs: [
        { city: 'Amstelveen', id: 'ams_gen', name: 'Amstelveen Chat', icon: '💬', desc: 'Stadshart updates & local news' },
        { city: 'Amsterdam', id: 'adam_gen', name: 'Amsterdam Chat', icon: '💬', desc: 'City life & housing tips' },
        { city: 'Eindhoven', id: 'eind_gen', name: 'Eindhoven Chat', icon: '💬', desc: 'Tech hub discussions' },
    ]
};

export default function CommunitiesScreen() {
    const router = useRouter();
    const { client } = useChatContext();
    const { user } = useAuth();

    const handleJoin = async (group: any) => {
        if (!client || !user) return;

        const channelType = 'messaging';
        const channelId = group.id;

        const channel = client.channel(channelType, channelId, {
            name: group.name,
            members: [user.uid],
        });

        await channel.watch();
        router.push(`/channel/${channel.cid}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <View className="px-4 py-3 bg-white border-b border-slate-100">
                <Text className="text-xl font-bold text-slate-900">Communities</Text>
            </View>

            <ScrollView className="p-4">
                {/* National */}
                <View className="mb-6">
                    <View className="flex-row items-center gap-2 mb-3">
                        <Globe size={16} color="#4f46e5" />
                        <Text className="text-xs font-bold text-slate-500 uppercase">National Channels</Text>
                    </View>
                    <View className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        {GROUPS.national.map((g, i) => (
                            <TouchableOpacity key={g.id} onPress={() => handleJoin(g)} className={`p-4 flex-row items-center gap-3 ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
                                <Text className="text-2xl">{g.icon}</Text>
                                <View className="flex-1">
                                    <Text className="font-bold text-slate-900 text-sm">{g.name}</Text>
                                    <Text className="text-xs text-slate-500">{g.desc}</Text>
                                </View>
                                <ChevronRight size={16} color="#cbd5e1" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Hubs */}
                <View className="mb-6">
                    <View className="flex-row items-center gap-2 mb-3">
                        <Map size={16} color="#4f46e5" />
                        <Text className="text-xs font-bold text-slate-500 uppercase">Local Hubs</Text>
                    </View>
                    <View className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        {GROUPS.hubs.map((g, i) => (
                            <TouchableOpacity key={g.id} onPress={() => handleJoin(g)} className={`p-4 flex-row items-center gap-3 ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
                                <Text className="text-2xl">{g.icon}</Text>
                                <View className="flex-1">
                                    <Text className="font-bold text-slate-900 text-sm">{g.name}</Text>
                                    <Text className="text-xs text-slate-500">{g.city} • {g.desc}</Text>
                                </View>
                                <ChevronRight size={16} color="#cbd5e1" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
