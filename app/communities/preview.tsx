import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayUnion, doc, setDoc } from 'firebase/firestore';
import { ShieldCheck, UsersRound, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Channel as StreamChannel } from 'stream-chat';
import { useChatContext } from 'stream-chat-expo';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebaseConfig';

export default function CommunityPreviewScreen() {
    const { cid } = useLocalSearchParams<{ cid: string }>();
    const router = useRouter();
    const { client } = useChatContext();
    const { user } = useAuth();

    const [channel, setChannel] = useState<StreamChannel | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        const fetchChannel = async () => {
            if (!client || !cid) return;
            try {
                // Parse cid (e.g. 'messaging:my-channel')
                const [type, id] = cid.split(':');
                const c = client.channel(type, id);
                await c.watch(); // Fetch state
                setChannel(c);
            } catch (e) {
                console.error("Error fetching channel preview:", e);
                Alert.alert("Error", "Could not load community details.");
                router.back();
            } finally {
                setLoading(false);
            }
        };

        fetchChannel();
    }, [client, cid]);

    const handleJoin = async () => {
        if (!channel || !user) return;
        setJoining(true);

        try {
            // 1. Join Stream Channel
            await channel.addMembers([user.uid]);

            // 2. Update Firestore Profile
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                joinedGroups: arrayUnion(channel.id)
            }, { merge: true });

            // 3. System Message
            const userName = user.displayName || client.user?.name || 'A new member';
            await channel.sendMessage({
                text: `${userName} joined the group`,
                type: 'system',
                silent: true
            });

            // Navigate back (Close modal)
            router.back();

        } catch (e) {
            console.error("Error joining channel:", e);
            Alert.alert("Error", "Failed to join. Please try again.");
        } finally {
            setJoining(false);
        }
    };

    const { top, bottom } = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: top }}>
            <View className="flex-1">
                {/* Fixed Header - Prevents layout jump */}
                <View className="px-6 py-4 flex-row justify-end items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full items-center justify-center shadow-sm"
                    >
                        <X size={22} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center -mt-20">
                        <ActivityIndicator size="large" color="#4f46e5" />
                        <Text className="text-slate-400 mt-4 font-medium">Loading details...</Text>
                    </View>
                ) : !channel ? (
                    <View className="flex-1 items-center justify-center -mt-20">
                        <X size={48} color="#cbd5e1" />
                        <Text className="text-slate-500 mt-4 text-lg">Community not found</Text>
                    </View>
                ) : (() => {
                    const data = channel.data as any;
                    const memberCount = channel.data?.member_count || (channel.state as any).member_count || 0;
                    const isJoined = !!channel.state.members[user?.uid || ''];

                    return (
                        <View className="flex-1">
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: bottom + 120 }}
                                className="px-8"
                            >
                                {/* Hero Section - Centered */}
                                <View className="items-center mt-4 mb-8">
                                    {/* Category Label */}
                                    <Text className="text-indigo-600 text-[10px] font-black uppercase tracking-[3px] mb-6">
                                        {(data.communityType === 'national' ? 'Netherlands Community' : data.city + ' Community') || 'Community'}
                                    </Text>

                                    {/* Large Premium Avatar */}
                                    <View className="w-24 h-24 bg-white rounded-[32px] items-center justify-center overflow-hidden border border-slate-100 shadow-xl shadow-slate-200 mb-6">
                                        {data.image?.startsWith('http') ? (
                                            <Image source={{ uri: data.image }} className="w-full h-full" />
                                        ) : (
                                            <Text className="text-5xl">{data.image || '🇳🇱'}</Text>
                                        )}
                                    </View>

                                    <Text className="text-3xl font-black text-slate-900 tracking-tight text-center leading-tight mb-2 px-2">
                                        {data.name || 'Community Name'}
                                    </Text>

                                    {/* Member Badge */}
                                    <View className="flex-row items-center bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100/50">
                                        <UsersRound size={14} color="#4f46e5" />
                                        <Text className="text-indigo-700 text-xs font-bold ml-1.5">
                                            {memberCount.toLocaleString()} {memberCount === 1 ? 'Member' : 'Members'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Description */}
                                <View className="mb-8">
                                    <Text className="text-slate-500 text-center text-[17px] leading-[26px] font-medium">
                                        {data.desc || 'Connect with fellow members in this community. Share experiences, ask questions, and help each other grow.'}
                                    </Text>
                                </View>

                                {/* Guidelines Card - Premium Style */}
                                <View className="bg-slate-50/80 p-6 rounded-[24px] border border-slate-100">
                                    <View className="flex-row items-center gap-2.5 mb-4">
                                        <View className="w-8 h-8 rounded-xl bg-white items-center justify-center shadow-sm">
                                            <ShieldCheck size={18} color="#4f46e5" />
                                        </View>
                                        <Text className="font-extrabold text-slate-900 text-base tracking-tight">Community Standards</Text>
                                    </View>

                                    <View className="space-y-3">
                                        {[
                                            'Be respectful and kind to others.',
                                            'No spam or self-promotion.',
                                            'Keep discussions relevant to context.',
                                            'Contribute to a safe community space.'
                                        ].map((rule, i) => (
                                            <View key={i} className="flex-row items-start mb-2.5 last:mb-0">
                                                <View className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 mr-3" />
                                                <Text className="flex-1 text-slate-600 font-medium leading-[22px]">{rule}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </ScrollView>

                            {/* Sticky Action Button */}
                            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 border-t border-slate-50" style={{ paddingBottom: bottom + 20 }}>
                                <TouchableOpacity
                                    onPress={isJoined ? () => router.replace(`/channel/${cid}`) : handleJoin}
                                    disabled={joining}
                                    activeOpacity={0.8}
                                    className={`w-full py-4.5 rounded-[20px] items-center justify-center shadow-lg ${isJoined
                                        ? 'bg-white border-2 border-slate-100 shadow-none'
                                        : 'bg-indigo-600 shadow-indigo-200'
                                        }`}
                                >
                                    {joining ? (
                                        <ActivityIndicator color={isJoined ? "#4f46e5" : "#ffffff"} />
                                    ) : (
                                        <Text className={`font-black text-lg tracking-tight ${isJoined ? 'text-slate-700' : 'text-white'}`}>
                                            {isJoined ? 'Enter Community' : 'Join Community'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })()}
            </View>
        </View>
    );
}
