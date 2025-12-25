import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ChevronLeft, Info, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebaseConfig';

const CITIES = ['Amstelveen', 'Amsterdam', 'Eindhoven', 'Rotterdam', 'Utrecht', 'Other'];

export default function RequestCommunityScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { top } = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        city: '',
        description: '',
        reason: '',
    });

    const handleSubmit = async () => {
        if (!form.name || !form.city || !form.description) {
            Alert.alert("Missing Fields", "Please fill in the community name, city, and description.");
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'community_requests'), {
                ...form,
                userId: user?.uid,
                userEmail: user?.email,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            Alert.alert(
                "Request Sent!",
                "Thanks for suggesting a new community. We'll review it and notify you once it's live.",
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-6 pb-4 border-b border-slate-100" style={{ paddingTop: top + 12 }}>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3">
                    <ChevronLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-bold text-slate-900">Request Community</Text>
                    <Text className="text-xs text-slate-500">Suggest a new local or interest group</Text>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>

                    <View className="bg-indigo-50 p-4 rounded-xl mb-6 flex-row items-start gap-3">
                        <Info size={20} color="#4f46e5" style={{ marginTop: 2 }} />
                        <Text className="flex-1 text-indigo-900 text-sm leading-5">
                            We curate communities to ensure they remain active and relevant. Tell us what's missing!
                        </Text>
                    </View>

                    {/* Name */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">Community Name</Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-base"
                            placeholder="e.g. Badminton Club Eindhoven"
                            value={form.name}
                            onChangeText={t => setForm({ ...form, name: t })}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    {/* City */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">City / Region</Text>
                        <View className="relative">
                            <View className="absolute left-4 top-4 z-10">
                                <MapPin size={20} color="#94a3b8" />
                            </View>
                            <TextInput
                                className="bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-900 text-base"
                                placeholder="Which city is this for?"
                                value={form.city}
                                onChangeText={t => setForm({ ...form, city: t })}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                        {/* Quick City Pills */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ gap: 8 }}>
                            {CITIES.map(city => (
                                <TouchableOpacity
                                    key={city}
                                    onPress={() => setForm({ ...form, city: city === 'Other' ? '' : city })}
                                    className="bg-white border border-slate-200 px-3 py-1.5 rounded-full"
                                >
                                    <Text className="text-xs text-slate-600 font-medium">{city}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Description */}
                    <View className="mb-8">
                        <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">Description</Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-base min-h-[120px]"
                            placeholder="What will this community discuss or do?"
                            value={form.description}
                            onChangeText={t => setForm({ ...form, description: t })}
                            multiline
                            textAlignVertical="top"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        className={`py-4 rounded-xl items-center justify-center shadow-sm ${loading ? 'bg-slate-100' : 'bg-indigo-600'}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="#64748b" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Send Request</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
