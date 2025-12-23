import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useProtectedRoute() {
    const { user, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(tabs)';

        if (!user && inAuthGroup) {
            // Redirect to the login page if not signed in
            router.replace('/login');
        } else if (user && segments[0] === 'login') {
            // Redirect away from the login page if signed in
            router.replace('/(tabs)');
        }
    }, [user, loading, segments]);
}
