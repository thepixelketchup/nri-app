import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDays, Loader2 } from 'lucide-react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signInGuest } = useAuth();
    const router = useRouter();

    const handleAuth = async () => {
        setError('');
        setLoading(true);
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            router.replace('/(tabs)');
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const handleGuest = async () => {
        setLoading(true);
        await signInGuest();
        router.replace('/(tabs)');
        setLoading(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-100 justify-center p-6">
            <View className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md self-center">
                <View className="items-center mb-8">
                    <View className="w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center shadow-lg mb-4">
                        <CalendarDays color="white" size={32} />
                    </View>
                    <Text className="text-2xl font-bold text-slate-900">DesiNL</Text>
                    <Text className="text-slate-500">Join the community</Text>
                </View>

                <View className="space-y-4 gap-4">
                    <TextInput
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base"
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                    <TextInput
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base"
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {error ? <Text className="text-red-500 text-xs text-center">{error}</Text> : null}

                    <TouchableOpacity
                        className="w-full bg-indigo-600 py-3.5 rounded-xl items-center shadow-lg active:opacity-90"
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-base">{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View className="mt-6 items-center gap-3">
                    <TouchableOpacity onPress={handleGuest}>
                        <Text className="text-slate-500 text-sm font-medium">Continue as Guest</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                        <Text className="text-xs text-indigo-600 font-bold">
                            {isSignUp ? 'Have account? Sign In' : 'Need account? Sign Up'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
