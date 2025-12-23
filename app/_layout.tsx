import "../global.css";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StreamChat } from 'stream-chat';
import { Chat, OverlayProvider } from 'stream-chat-expo';
import { useEffect, useState } from 'react';
import { streamConfig } from '../utils/streamConfig';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Slot, useRouter, useSegments } from 'expo-router';

export default function RootLayout() {
    const [client, setClient] = useState<StreamChat | null>(null);

    useEffect(() => {
        const chatClient = StreamChat.getInstance(streamConfig.apiKey);
        setClient(chatClient);

        return () => {
            chatClient.disconnectUser();
        };
    }, []);

    if (!client) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <OverlayProvider>
                <Chat client={client}>
                    <SafeAreaProvider>
                        <Stack>
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            <Stack.Screen name="+not-found" />
                        </Stack>
                    </SafeAreaProvider>
                </Chat>
            </OverlayProvider>
        </GestureHandlerRootView>
    );
}
