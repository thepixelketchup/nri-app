import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, MessageCircle } from 'lucide-react-native';
import { ChannelList } from 'stream-chat-expo';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function MessagesScreen() {
    const router = useRouter();
    const { user } = useAuth();

    if (!user) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-slate-50">
                <Text className="text-slate-500">Please sign in to view messages</Text>
            </SafeAreaView>
        );
    }

    // Custom filter to show channels where user is a member
    const filters = {
        members: { $in: [user.uid] },
    };

    const sort = { last_message_at: -1 };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-4 py-3 bg-white border-b border-slate-100">
                <Text className="text-xl font-bold text-slate-900">Inbox</Text>
            </View>
            <View className="flex-1">
                <ChannelList
                    filters={filters}
                    sort={sort}
                    onSelect={(channel) => {
                        router.push(`/channel/${channel.cid}`);
                    }}
                />
            </View>
        </SafeAreaView>
    );
}
