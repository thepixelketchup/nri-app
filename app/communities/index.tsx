import { useRouter } from 'expo-router';
import { arrayRemove, arrayUnion, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Check, ChevronLeft, Globe, Map } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChatContext } from 'stream-chat-expo';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebaseConfig';

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
    const [userData, setUserData] = useState<any>({ joinedGroups: [] });

    // Fetch User Profile for Joined Groups
    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(doc(db, 'users', user.uid), (d) => {
            if (d.exists()) setUserData(d.data());
            else setUserData({ joinedGroups: [] });
        });
        return unsub;
    }, [user]);

    const handleJoin = async (group: any, type: 'national' | 'hub') => {
        if (!client || !user || !client.userID) {
            alert("Chat connecting...");
            return;
        }

        const groupId = type === 'national' ? `national_${group.id}` : `hub_${group.id}`;
        const isJoined = userData.joinedGroups?.includes(groupId);

        // 1. Update Firestore Profile
        const userRef = doc(db, 'users', user.uid);
        try {
            await setDoc(userRef, {
                joinedGroups: isJoined ? arrayRemove(groupId) : arrayUnion(groupId)
            }, { merge: true });
        } catch (e) {
            console.error(e);
        }

        // 2. Stream Channel Logic
        if (!isJoined) {
            const channelType = 'messaging';
            const channelId = groupId;

            const channel = client.channel(channelType, channelId, {
                name: group.name,
                members: [user.uid],
            } as any);

            await channel.watch();
            router.push(`/channel/${channel.cid}`);
        } else {
            const channelId = groupId;
            router.push(`/channel/messaging:${channelId}`);
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header with Back Button */}
            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-4 py-3 border-b border-slate-100 flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
                        <ChevronLeft size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-900">Join Communities</Text>
                </View>
            </SafeAreaView>

            <ScrollView className="p-4">
                {/* National */}
                <View className="mb-6">
                    <View className="flex-row items-center gap-2 mb-3">
                        <Globe size={16} color="#4f46e5" />
                        <Text className="text-xs font-bold text-slate-500 uppercase">National Channels</Text>
                    </View>
                    <View className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        {GROUPS.national.map((g, i) => {
                            const isJoined = userData.joinedGroups?.includes(`national_${g.id}`);
                            return (
                                <TouchableOpacity key={g.id} onPress={() => handleJoin(g, 'national')} className={`p-4 flex-row items-center gap-3 ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
                                    <Text className="text-2xl">{g.icon}</Text>
                                    <View className="flex-1">
                                        <Text className="font-bold text-slate-900 text-sm">{g.name}</Text>
                                        <Text className="text-xs text-slate-500">{g.desc}</Text>
                                    </View>
                                    {isJoined ? (
                                        <View className="bg-green-100 px-3 py-1 rounded-full flex-row items-center gap-1">
                                            <Check size={12} color="#15803d" />
                                            <Text className="text-xs font-bold text-green-700">Joined</Text>
                                        </View>
                                    ) : (
                                        <View className="bg-slate-100 px-3 py-1 rounded-full">
                                            <Text className="text-xs font-bold text-slate-600">Join</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>

                {/* Hubs */}
                <View className="mb-6">
                    <View className="flex-row items-center gap-2 mb-3">
                        <Map size={16} color="#4f46e5" />
                        <Text className="text-xs font-bold text-slate-500 uppercase">Local Hubs</Text>
                    </View>
                    <View className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        {GROUPS.hubs.map((g, i) => {
                            const isJoined = userData.joinedGroups?.includes(`hub_${g.id}`);
                            return (
                                <TouchableOpacity key={g.id} onPress={() => handleJoin(g, 'hub')} className={`p-4 flex-row items-center gap-3 ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
                                    <Text className="text-2xl">{g.icon}</Text>
                                    <View className="flex-1">
                                        <Text className="font-bold text-slate-900 text-sm">{g.name}</Text>
                                        <Text className="text-xs text-slate-500">{g.city} • {g.desc}</Text>
                                    </View>
                                    {isJoined ? (
                                        <View className="bg-green-100 px-3 py-1 rounded-full flex-row items-center gap-1">
                                            <Check size={12} color="#15803d" />
                                            <Text className="text-xs font-bold text-green-700">Joined</Text>
                                        </View>
                                    ) : (
                                        <View className="bg-slate-100 px-3 py-1 rounded-full">
                                            <Text className="text-xs font-bold text-slate-600">Join</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
