import { useRouter } from 'expo-router';
import { arrayUnion, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Globe, Map, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChatContext } from 'stream-chat-expo';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebaseConfig';

import { GROUPS } from '../../utils/groups';

const CITIES = ['All', 'Amstelveen', 'Amsterdam', 'Eindhoven', 'Rotterdam', 'Utrecht'];

export default function CommunitiesScreen() {
    const router = useRouter();
    const { client } = useChatContext();
    const { user } = useAuth();
    const [joiningIds, setJoiningIds] = useState<string[]>([]);
    const [userData, setUserData] = useState<any>(null);
    const [selectedCity, setSelectedCity] = useState('All');

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

        // If already joined, do nothing (button should be disabled/hidden logic)
        if (userData?.joinedGroups?.includes(groupId)) return;

        setJoiningIds(prev => [...prev, group.id]);

        // 1. Update Firestore Profile
        const userRef = doc(db, 'users', user.uid);
        try {
            await setDoc(userRef, {
                joinedGroups: arrayUnion(groupId)
            }, { merge: true });
        } catch (e) {
            console.error(e);
        }

        // 2. Stream Channel Logic
        try {
            const channelType = 'messaging';
            const channelId = groupId;

            const channel = client.channel(channelType, channelId, {
                name: group.name,
                members: [user.uid],
                category: 'community'
            } as any);

            await channel.watch();
            await channel.addMembers([user.uid]);
            // No navigation - just stay on page
        } catch (e) {
            console.error(e);
        } finally {
            setJoiningIds(prev => prev.filter(id => id !== group.id));
        }
    };

    const filteredHubs = selectedCity === 'All'
        ? GROUPS.hubs
        : GROUPS.hubs.filter(h => h.city === selectedCity);

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-6 pt-6 pb-2 bg-white flex-row items-start justify-between">
                <View>
                    <Text className="text-4xl font-extrabold text-slate-900 tracking-tighter">Communities</Text>
                    <Text className="text-slate-500 font-medium text-base mt-1">Connect with your tribe</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-1 w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                >
                    <X size={20} color="#64748b" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* National Section */}
                <View className="mt-6 px-6">
                    <View className="flex-row items-center gap-2 mb-4">
                        <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center border border-indigo-100">
                            <Globe size={16} color="#4f46e5" />
                        </View>
                        <Text className="text-lg font-bold text-slate-900">National Groups</Text>
                    </View>

                    <View className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        {GROUPS.national.map((g, i) => {
                            const isJoined = userData?.joinedGroups?.includes(`national_${g.id}`);
                            const isJoining = joiningIds.includes(g.id);

                            return (
                                <View
                                    key={g.id}
                                    className={`p-4 flex-row items-center gap-4 ${i !== 0 ? 'border-t border-slate-50' : ''}`}
                                >
                                    <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center text-xl">
                                        <Text className="text-xl">{g.icon}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold text-slate-900 text-base">{g.name}</Text>
                                        <Text className="text-sm text-slate-500">{g.desc}</Text>
                                    </View>

                                    <View className="w-[85px] items-end justify-center">
                                        {!userData ? (
                                            <ActivityIndicator size="small" color="#94a3b8" />
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() => handleJoin(g, 'national')}
                                                disabled={isJoined || isJoining}
                                                className={`px-4 py-2 rounded-full ${isJoined
                                                    ? 'bg-slate-100'
                                                    : isJoining
                                                        ? 'bg-indigo-50 border border-indigo-100'
                                                        : 'bg-indigo-600 shadow-sm shadow-indigo-200'
                                                    }`}
                                            >
                                                {isJoining ? (
                                                    <ActivityIndicator size="small" color="#4f46e5" />
                                                ) : (
                                                    <Text className={`text-xs font-bold ${isJoined ? 'text-slate-500' : 'text-white'}`}>
                                                        {isJoined ? 'Joined' : 'Join'}
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                </View>

                {/* Local Hubs Section */}
                <View className="mt-8">
                    <View className="px-6 flex-row items-center gap-2 mb-4">
                        <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center border border-indigo-100">
                            <Map size={16} color="#4f46e5" />
                        </View>
                        <Text className="text-lg font-bold text-slate-900">Local Hubs</Text>
                    </View>

                    {/* City Filters */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-4"
                        contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
                    >
                        {CITIES.map((city) => (
                            <TouchableOpacity
                                key={city}
                                onPress={() => setSelectedCity(city)}
                                className={`px-4 py-2 rounded-full border ${selectedCity === city ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
                            >
                                <Text className={`font-bold text-xs ${selectedCity === city ? 'text-white' : 'text-slate-600'}`}>
                                    {city}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View className="px-6">
                        <View className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {filteredHubs.length > 0 ? (
                                filteredHubs.map((g, i) => {
                                    const isJoined = userData?.joinedGroups?.includes(`hub_${g.id}`);
                                    const isJoining = joiningIds.includes(g.id);

                                    return (
                                        <View
                                            key={g.id}
                                            className={`p-4 flex-row items-center gap-4 ${i !== 0 ? 'border-t border-slate-50' : ''}`}
                                        >
                                            <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center">
                                                <Text className="text-xl">{g.icon}</Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="font-bold text-slate-900 text-base">{g.name}</Text>
                                                <Text className="text-sm text-slate-500">{g.city} • {g.desc}</Text>
                                            </View>

                                            <View className="w-[85px] items-end justify-center">
                                                {!userData ? (
                                                    <ActivityIndicator size="small" color="#94a3b8" />
                                                ) : (
                                                    <TouchableOpacity
                                                        onPress={() => handleJoin(g, 'hub')}
                                                        disabled={isJoined || isJoining}
                                                        className={`px-4 py-2 rounded-full ${isJoined
                                                            ? 'bg-slate-100'
                                                            : isJoining
                                                                ? 'bg-indigo-50 border border-indigo-100'
                                                                : 'bg-indigo-600 shadow-sm shadow-indigo-200'
                                                            }`}
                                                    >
                                                        {isJoining ? (
                                                            <ActivityIndicator size="small" color="#4f46e5" />
                                                        ) : (
                                                            <Text className={`text-xs font-bold ${isJoined ? 'text-slate-500' : 'text-white'}`}>
                                                                {isJoined ? 'Joined' : 'Join'}
                                                            </Text>
                                                        )}
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    )
                                })
                            ) : (
                                <View className="p-8 items-center justify-center">
                                    <Text className="text-slate-400 font-medium">No hubs found in {selectedCity}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
