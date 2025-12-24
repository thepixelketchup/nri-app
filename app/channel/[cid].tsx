import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Channel, MessageInput, MessageList, useChatContext } from 'stream-chat-expo';

export default function ChannelScreen() {
    const { cid } = useLocalSearchParams<{ cid: string }>();
    const { client } = useChatContext();
    const [channel, setChannel] = useState<any>(null);

    useEffect(() => {
        const fetchChannel = async () => {
            if (!client || !client.userID) return; // Wait for connection

            const c = client.channel('messaging', cid.split(':')[1]);
            await c.watch();
            setChannel(c);
        };
        if (cid) fetchChannel();
    }, [cid, client?.userID]);

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
