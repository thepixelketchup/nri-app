import { Stack } from "expo-router";
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StreamChat } from 'stream-chat';
import { Chat, OverlayProvider } from 'stream-chat-expo';
import { AuthProvider } from '../context/AuthContext';
import "../global.css";
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import "../polyfills";
import { streamConfig } from '../utils/streamConfig';

// Separate component to check authentication *inside* the Provider
function RootNavigator() {
    useProtectedRoute();

    return (
        <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="add-post" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="add-guide-post" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="events/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
        </Stack>
    );
}

export default function RootLayout() {
    const [client, setClient] = useState<StreamChat | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const chatClient = StreamChat.getInstance(streamConfig.apiKey);
        setClient(chatClient);
        setIsReady(true);

        return () => {
            chatClient.disconnectUser();
        };
    }, []);

    if (!isReady || !client) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <OverlayProvider>
                <Chat client={client}>
                    <AuthProvider>
                        <SafeAreaProvider>
                            <RootNavigator />
                        </SafeAreaProvider>
                    </AuthProvider>
                </Chat>
            </OverlayProvider>
        </GestureHandlerRootView>
    );
}
