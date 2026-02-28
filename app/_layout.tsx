import { Stack } from "expo-router";
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StreamChat } from 'stream-chat';
import { Chat, OverlayProvider } from 'stream-chat-expo';
import { AuthProvider } from '../context/AuthContext';
import { DirectoryProvider } from '../context/DirectoryContext';
import { MarketplaceProvider } from '../context/MarketplaceContext';
import "../global.css";
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import "../polyfills";
import { streamConfig } from '../utils/streamConfig';

function RootNavigator() {
    useProtectedRoute();

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="add-post" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="add-guide-post" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="guides/[category]" options={{ headerShown: false }} />
            <Stack.Screen name="events/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="marketplace/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="marketplace/add" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="marketplace/filters" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="directory/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="directory/add" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="directory/filters" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="communities/index" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="channel/[cid]" options={{ headerShown: false }} />
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
                        <MarketplaceProvider>
                            <DirectoryProvider>
                                <SafeAreaProvider>
                                    <RootNavigator />
                                </SafeAreaProvider>
                            </DirectoryProvider>
                        </MarketplaceProvider>
                    </AuthProvider>
                </Chat>
            </OverlayProvider>
        </GestureHandlerRootView>
    );
}
