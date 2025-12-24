import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ChevronLeft, MapPin, Phone, Store, Tag } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebaseConfig';

export default function BusinessRequestScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { top } = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        category: '',
        address: '',
        phone: '',
        description: '',
    });

    const handleSubmit = async () => {
        if (!form.name || !form.category || !form.address || !form.description) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'public', 'data', 'business_requests'), {
                ...form,
                userId: user?.uid,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            Alert.alert(
                "Request Sent",
                "Your business listing request has been submitted for review.",
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
            <View className="flex-row items-center px-4 pb-4 border-b border-slate-100" style={{ paddingTop: top + 10 }}>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3">
                    <ChevronLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-bold text-slate-900">List Your Business</Text>
                    <Text className="text-xs text-slate-500">Join the directory</Text>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>

                    {/* Name */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">Business Name</Text>
                        <View className="relative">
                            <View className="absolute left-4 top-4 z-10">
                                <Store size={20} color="#94a3b8" />
                            </View>
                            <TextInput
                                className="bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-900 text-base"
                                placeholder="e.g. Bombay Spices"
                                value={form.name}
                                onChangeText={t => setForm({ ...form, name: t })}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>

                    {/* Category */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">Category</Text>
                        <View className="relative">
                            <View className="absolute left-4 top-4 z-10">
                                <Tag size={20} color="#94a3b8" />
                            </View>
                            <TextInput
                                className="bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-900 text-base"
                                placeholder="e.g. Grocery, Restaurant, Services"
                                value={form.category}
                                onChangeText={t => setForm({ ...form, category: t })}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>

                    {/* Address */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">Address</Text>
                        <View className="relative">
                            <View className="absolute left-4 top-4 z-10">
                                <MapPin size={20} color="#94a3b8" />
                            </View>
                            <TextInput
                                className="bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-900 text-base"
                                placeholder="Full address"
                                value={form.address}
                                onChangeText={t => setForm({ ...form, address: t })}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>

                    {/* Phone */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">Phone Number</Text>
                        <View className="relative">
                            <View className="absolute left-4 top-4 z-10">
                                <Phone size={20} color="#94a3b8" />
                            </View>
                            <TextInput
                                className="bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-900 text-base"
                                placeholder="+31 6 12345678"
                                keyboardType="phone-pad"
                                value={form.phone}
                                onChangeText={t => setForm({ ...form, phone: t })}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>

                    {/* Description */}
                    <View className="mb-8">
                        <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">Description</Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-base min-h-[120px]"
                            placeholder="Tell us about your business..."
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
                            <Text className="text-white font-bold text-lg">Submit Request</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
