import { FeedsClient } from '@stream-io/feeds-react-native-sdk';
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useChatContext } from 'stream-chat-expo';
import { auth } from '../utils/firebaseConfig';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInGuest: () => Promise<void>;
    signOut: () => Promise<void>;
    streamToken: string | null;
    feedClient: FeedsClient | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInGuest: async () => { },
    signOut: async () => { },
    streamToken: null,
    feedClient: null,
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { client } = useChatContext();
    const [streamToken, setStreamToken] = useState<string | null>(null);
    const [feedClient, setFeedClient] = useState<FeedsClient | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);

            if (firebaseUser && client) {
                const token = client.devToken(firebaseUser.uid);
                setStreamToken(token);

                // Chat Connection
                try {
                    await client.connectUser(
                        {
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest' : firebaseUser.email?.split('@')[0]),
                        },
                        token
                    );
                } catch (e: any) {
                    console.error("Stream Connection Failed:", e);
                    if (e.message?.includes("development tokens are not allowed") || e.code === 5) {
                        console.warn("CRITICAL: Stream Chat is rejecting the dev token. Please enable 'Disable Auth Checks' under Chat -> Overview.");
                    }
                }

                // Feed Connection
                try {
                    // Initialize FeedsClient
                    // Note: Ensure streamConfig is imported
                    // Initialize FeedsClient
                    // Note: Ensure streamConfig is imported
                    const fClient = new FeedsClient("4nuhn4y98bf7");
                    // Hardcoding config for now to avoid import issues if streamConfig isn't imported yet, 
                    // or I can add import in next step. I'll hardcode to be safe or use streamConfig if I add import.
                    // I'll add import in separate tool.
                    await fClient.connectUser({ id: firebaseUser.uid }, token);
                    setFeedClient(fClient);
                } catch (e: any) {
                    console.warn("Stream Feed Connect Error:", e);
                }

            } else if (!firebaseUser && client) {
                await client.disconnectUser();
                setStreamToken(null);
                setFeedClient(null);
            }
        });

        return unsubscribe;
    }, [client]);

    const signInGuest = async () => {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error(error);
        }
    };

    const signOut = async () => {
        try {
            if (client) await client.disconnectUser();
            await auth.signOut();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInGuest, signOut, streamToken, feedClient }}>
            {children}
        </AuthContext.Provider>
    );
}
