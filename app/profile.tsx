import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User as UserIcon, Mail } from 'lucide-react-native';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.replace('/login');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 p-6">
            <View className="items-center mt-10 mb-10">
                <View className="w-24 h-24 bg-indigo-100 rounded-full items-center justify-center mb-4 border-4 border-white shadow-sm">
                    <Text className="text-3xl font-bold text-indigo-600">
                        {user?.email ? user.email[0].toUpperCase() : 'G'}
                    </Text>
                </View>
                <Text className="text-xl font-bold text-slate-900">
                    {user?.isAnonymous ? 'Guest User' : (user?.email || 'User')}
                </Text>
                <Text className="text-slate-500">Community Member</Text>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                <View className="flex-row items-center gap-3 p-2 border-b border-slate-50 pb-4">
                    <Mail size={20} color="#64748b" />
                    <View>
                        <Text className="text-xs text-slate-400 font-bold uppercase">Email</Text>
                        <Text className="text-slate-900 font-medium">{user?.email || 'N/A'}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleSignOut}
                    className="flex-row items-center gap-3 p-2 pt-2"
                >
                    <LogOut size={20} color="#ef4444" />
                    <Text className="text-red-500 font-bold">Sign Out</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={() => router.back()}
                className="mt-auto items-center py-4"
            >
                <Text className="text-indigo-600 font-bold">Close</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
