import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { StreamChat } from 'stream-chat';
import { useChatContext } from 'stream-chat-expo';
import { auth } from '../utils/firebaseConfig';
import { streamConfig } from '../utils/streamConfig';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInGuest: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInGuest: async () => { },
    signOut: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { client } = useChatContext();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);

            if (firebaseUser && client) {
                // In production, fetch token from your backend
                // For development, we use dev token (insecure for prod)
                const token = client.devToken(firebaseUser.uid);

                await client.connectUser(
                    {
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest' : firebaseUser.email?.split('@')[0]),
                    },
                    token
                );
            } else if (!firebaseUser && client) {
                await client.disconnectUser();
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
        <AuthContext.Provider value={{ user, loading, signInGuest, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
