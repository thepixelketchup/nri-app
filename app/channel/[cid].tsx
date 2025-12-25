import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayRemove, doc, updateDoc } from 'firebase/firestore';
import { Bell, BellOff, ChevronLeft, LogOut, Users, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Channel, MessageInput, MessageList, Thread, useChatContext } from 'stream-chat-expo';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebaseConfig';

export default function ChannelScreen() {
    const { cid } = useLocalSearchParams<{ cid: string }>();
    const { client } = useChatContext();
    const { user } = useAuth();
    const [channel, setChannel] = useState<any>(null);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [icon, setIcon] = useState<string | null>(null);
    const [thread, setThread] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchChannel = async () => {
            if (!client || !client.userID) return;

            const c = client.channel('messaging', cid.split(':')[1]);
            await c.watch();
            setChannel(c);
            setIsMuted(c.muteStatus().muted);
        };
        if (cid) fetchChannel();
    }, [cid, client?.userID]);

    // Effect to resolve channel icon from channel data only
    useEffect(() => {
        if (!channel) return;

        // Check channel data for emoji icon
        if (channel.data?.image && !channel.data.image.startsWith('http')) {
            setIcon(channel.data.image);
        }
    }, [channel]);

    const handleToggleMute = async () => {
        if (!channel) return;
        try {
            if (isMuted) {
                await channel.unmute();
                setIsMuted(false);
            } else {
                await channel.mute();
                setIsMuted(true);
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not update mute status.");
        }
    };

    const handleLeaveGroup = async () => {
        if (!channel || !client.userID) return;

        Alert.alert(
            "Leave Group",
            "Are you sure you want to leave this group? You won't receive messages anymore.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Leave",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const channelId = cid ? cid.split(':')[1] : null;

                            if (channelId) {
                                // 1. Send System Message
                                await channel.sendMessage({
                                    text: `${user?.displayName || user?.email?.split('@')[0] || 'Someone'} left the group`,
                                    type: 'system',
                                    silent: true
                                });

                                // 2. Remove from Stream
                                await channel.removeMembers([client.userID]);

                                // 3. Remove from Firestore if it's a community
                                // Check if it's a community by category OR ID convention
                                const isCommunity = channel.data?.category === 'community' ||
                                    channelId.startsWith('national_') ||
                                    channelId.startsWith('hub_');

                                if (isCommunity && user?.uid) {
                                    const userRef = doc(db, 'users', user.uid);
                                    await updateDoc(userRef, {
                                        joinedGroups: arrayRemove(channelId)
                                    });
                                }

                                router.replace('/(tabs)/messages');
                            } else {
                                Alert.alert("Error", "Could not determine group ID to leave.");
                            }
                        } catch (e) {
                            console.error(e);
                            Alert.alert("Error", "Could not leave group.");
                        }
                    }
                }
            ]
        );
    };

    if (!channel) return <View className="flex-1 bg-white" />;

    const members = Object.values(channel.state.members);
    const memberCount = channel.data?.member_count || members.length;

    const channelName = channel.data?.name || 'Chat';
    // Only use channelImage if it is a URL
    const channelImage = channel.data?.image?.startsWith('http') ? channel.data.image : null;

    const renderMember = ({ item }: { item: any }) => {
        const memberUser = item.user;
        return (
            <View className="flex-row items-center gap-3 py-3 border-b border-slate-50">
                <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center overflow-hidden border border-indigo-100">
                    {memberUser.image ? (
                        <Image source={{ uri: memberUser.image }} className="w-full h-full" />
                    ) : (
                        <Text className="text-indigo-600 font-bold">{memberUser.name?.[0]?.toUpperCase() || 'U'}</Text>
                    )}
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-slate-900 text-base">{memberUser.name || 'Unknown User'}</Text>
                    <Text className="text-slate-500 text-xs">{memberUser.online ? 'Online' : 'Offline'}</Text>
                </View>
                {memberUser.id === client.userID && (
                    <View className="bg-slate-100 px-2 py-1 rounded-md">
                        <Text className="text-xs font-bold text-slate-600">You</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
            <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
                <View className="flex-row items-center flex-1 mr-4">
                    <TouchableOpacity
                        onPress={() => {
                            if (thread) {
                                setThread(null);
                            } else {
                                router.back();
                            }
                        }}
                        className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-slate-100"
                    >
                        <ChevronLeft size={28} color="#0f172a" />
                    </TouchableOpacity>

                    {/* Show Channel Header only if we are NOT in a thread (or show customized header) */}
                    {/* Actually, keeping the header is fine, but maybe change title for Thread? */}
                    {/* For simplicity, we keep the main header for now, maybe handle thread title later */}
                    {!thread && (
                        <TouchableOpacity
                            onPress={() => setShowGroupInfo(true)}
                            className="ml-2 flex-1 flex-row items-center gap-3"
                        >
                            <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center overflow-hidden border border-indigo-100">
                                {channelImage ? (
                                    <Image source={{ uri: channelImage }} className="w-full h-full" />
                                ) : icon ? (
                                    <Text className="text-base">{icon}</Text>
                                ) : (
                                    <Text className="text-indigo-600 font-bold text-xs">{channelName[0]?.toUpperCase()}</Text>
                                )}
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-slate-900" numberOfLines={1}>
                                    {channelName}
                                </Text>
                                <Text className="text-xs text-slate-500 font-medium">Click for info</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    {thread && (
                        <View className="ml-2 flex-1 justify-center">
                            <Text className="text-lg font-bold text-slate-900">Thread</Text>
                            <Text className="text-xs text-slate-500">Replying to message</Text>
                        </View>
                    )}
                </View>
            </View>

            <View className="flex-1">
                <Channel
                    channel={channel}
                    threadList={!!thread}
                    MessageSystem={({ message }: { message: any }) => (
                        <View className="py-2 items-center">
                            <View className="bg-slate-100 px-3 py-1 rounded-full">
                                <Text className="text-xs font-bold text-slate-500 text-center uppercase tracking-wide">
                                    {message.text}
                                </Text>
                            </View>
                        </View>
                    )}
                >
                    {thread ? (
                        <Thread
                            thread={thread}
                            onThreadDismount={() => setThread(null)}
                        />
                    ) : (
                        <>
                            <MessageList onThreadSelect={setThread} />
                            <MessageInput />
                        </>
                    )}
                </Channel>
            </View>

            {/* Unified Group Info Modal */}
            <Modal
                animationType="slide"
                presentationStyle="pageSheet"
                visible={showGroupInfo}
                onRequestClose={() => setShowGroupInfo(false)}
            >
                <View className="flex-1 bg-slate-50">
                    {/* Modal Header */}
                    <View className="bg-white px-4 py-3 border-b border-slate-200 flex-row items-center justify-between sticky top-0 z-10">
                        <TouchableOpacity
                            onPress={() => setShowGroupInfo(false)}
                            className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
                        >
                            <X size={20} color="#64748b" />
                        </TouchableOpacity>
                        <Text className="font-bold text-base text-slate-900">Group Info</Text>
                        <View className="w-8" />
                    </View>

                    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                        {/* Group Header Info */}
                        <View className="bg-white items-center py-8 mb-4 border-b border-slate-200">
                            <View className="w-24 h-24 bg-indigo-50 rounded-full items-center justify-center overflow-hidden border-2 border-indigo-100 mb-4 shadow-sm">
                                {channelImage ? (
                                    <Image source={{ uri: channelImage }} className="w-full h-full" />
                                ) : icon ? (
                                    <Text className="text-5xl">{icon}</Text>
                                ) : (
                                    <Text className="text-4xl text-indigo-600 font-black">{channelName[0]?.toUpperCase()}</Text>
                                )}
                            </View>
                            <Text className="text-2xl font-black text-slate-900 text-center px-6">{channelName}</Text>
                            <Text className="text-slate-500 font-medium mt-1">Group • {memberCount} participants</Text>

                            {channel.data?.desc && (
                                <View className="mt-4 px-8">
                                    <Text className="text-center text-slate-600 leading-5">{channel.data.desc}</Text>
                                </View>
                            )}
                        </View>

                        {/* Actions */}
                        <View className="bg-white mb-4 border-y border-slate-200">
                            {/* Mute */}
                            <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-8 h-8 rounded-full items-center justify-center bg-indigo-50">
                                        {isMuted ? <BellOff size={18} color="#4f46e5" /> : <Bell size={18} color="#4f46e5" />}
                                    </View>
                                    <Text className="font-medium text-slate-900 text-base">Mute Notifications</Text>
                                </View>
                                <Switch
                                    value={isMuted}
                                    onValueChange={handleToggleMute}
                                    trackColor={{ false: '#cbd5e1', true: '#4f46e5' }}
                                />
                            </View>


                        </View>

                        {/* Participants */}
                        <View className="bg-white mb-4 border-y border-slate-200">
                            <View className="p-4 border-b border-slate-50 flex-row justify-between items-center">
                                <Text className="font-bold text-slate-500 text-sm uppercase tracking-wider">{memberCount} Participants</Text>
                                <Users size={16} color="#94a3b8" />
                            </View>
                            <View className="px-4">
                                {members.map((item: any) => (
                                    <View key={item.user.id}>
                                        {renderMember({ item })}
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Safety / Leave */}
                        <View className="bg-white border-y border-slate-200">
                            <TouchableOpacity
                                onPress={handleLeaveGroup}
                                className="flex-row items-center gap-3 p-4 active:bg-slate-50"
                            >
                                <View className="w-8 h-8 rounded-full items-center justify-center bg-red-50">
                                    <LogOut size={18} color="#ef4444" />
                                </View>
                                <Text className="font-bold text-red-600 text-base">Leave Group</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="h-8" />
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
