import { Channel, MessageList, MessageInput } from 'stream-chat-expo';
import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';
import { useChatContext } from 'stream-chat-expo';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChannelScreen() {
    const { cid } = useLocalSearchParams<{ cid: string }>();
    const { client } = useChatContext();
    const [channel, setChannel] = useState<any>(null);

    useEffect(() => {
        const fetchChannel = async () => {
            const c = client.channel('messaging', cid.split(':')[1]);
            await c.watch();
            setChannel(c);
        };
        if (cid) fetchChannel();
    }, [cid]);

    if (!channel) return <View className="flex-1 bg-white" />;

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
            <Channel channel={channel}>
                <MessageList />
                <MessageInput />
            </Channel>
        </SafeAreaView>
    );
}
