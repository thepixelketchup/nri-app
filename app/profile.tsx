import { useRouter } from 'expo-router';
import { Briefcase, Calendar, Database, LogOut, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { seedBusinesses } from '../utils/seedBusinesses';
import { seedCommunities } from '../utils/seedCommunities';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [seeding, setSeeding] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.replace('/login');
    };

    const handleSeed = () => {
        Alert.alert(
            "Developer Tools",
            "Choose a database to seed:",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Seed Businesses",
                    onPress: async () => {
                        setSeeding(true);
                        await seedBusinesses();
                        setSeeding(false);
                        Alert.alert("Success", "Businesses seeded!");
                    }
                },
                {
                    text: "Seed Communities",
                    onPress: async () => {
                        setSeeding(true);
                        await seedCommunities();
                        setSeeding(false);
                        Alert.alert("Success", "Communities seeded!");
                    }
                }
            ]
        );
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

            {/* Partner Hub */}
            <View className="bg-white rounded-2xl p-4 shadow-sm mt-4">
                <Text className="text-xs text-slate-400 font-bold uppercase mb-2 px-2">Partner Center</Text>

                <TouchableOpacity
                    onPress={() => router.push('/directory/request')}
                    className="flex-row items-center gap-3 p-2 border-b border-slate-50 pb-3"
                >
                    <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center">
                        <Briefcase size={16} color="#4f46e5" />
                    </View>
                    <View>
                        <Text className="text-slate-900 font-bold">List Your Business</Text>
                        <Text className="text-xs text-slate-400">Join the directory</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/events/request')}
                    className="flex-row items-center gap-3 p-2 pt-3"
                >
                    <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center">
                        <Calendar size={16} color="#f97316" />
                    </View>
                    <View>
                        <Text className="text-slate-900 font-bold">Host an Event</Text>
                        <Text className="text-xs text-slate-400">Submit an event request</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Developer Tools */}
            <View className="bg-white rounded-2xl p-4 shadow-sm mt-4">
                <Text className="text-xs text-slate-400 font-bold uppercase mb-2 px-2">Developer Tools</Text>
                <TouchableOpacity
                    onPress={handleSeed}
                    className="flex-row items-center gap-3 p-2"
                >
                    {seeding ? <ActivityIndicator size="small" color="#6366f1" /> : <Database size={20} color="#6366f1" />}
                    <View>
                        <Text className="text-indigo-600 font-bold">Seed Database</Text>
                        <Text className="text-xs text-slate-400">Manage dummy data</Text>
                    </View>
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
