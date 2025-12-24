import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STRINGS } from '../../constants/Strings';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebaseConfig';

const CATEGORIES = [
    { id: 'grocery', label: STRINGS.STORES.CATEGORIES.GROCERY },
    { id: 'tiffin', label: STRINGS.STORES.CATEGORIES.TIFFIN },
    { id: 'restaurant', label: STRINGS.STORES.CATEGORIES.RESTAURANT },
    { id: 'services', label: STRINGS.STORES.CATEGORIES.SERVICES },
    { id: 'beauty', label: STRINGS.STORES.CATEGORIES.BEAUTY },
    { id: 'education', label: STRINGS.STORES.CATEGORIES.EDUCATION },
    { id: 'religious', label: STRINGS.STORES.CATEGORIES.RELIGIOUS },
    { id: 'other', label: STRINGS.STORES.CATEGORIES.OTHER },
];

export default function AddBusinessScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        category: 'grocery',
        phone: '',
        address: '',
        description: '',
        imageUrl: '',
    });

    const isFormValid = form.name && form.phone && form.address && form.description;

    const handleSubmit = async () => {
        if (!user) {
            Alert.alert("Sign In Required", "You must be logged in to list a business.");
            return;
        }
        if (!isFormValid) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }

        setSubmitting(true);
        try {
            // Create Keywords for Search
            const keywords = [
                ...form.name.toLowerCase().split(' '),
                form.category.toLowerCase(),
                form.address.toLowerCase().split(' ')[0]
            ];

            await addDoc(collection(db, 'public', 'data', 'businesses'), {
                ...form,
                userId: user.uid,
                createdAt: serverTimestamp(),
                keywords: keywords,
                viewCount: 0,
                contactCount: 0,
                rating: 0,
                reviewCount: 0,
            });

            Alert.alert(
                STRINGS.STORES.ADD.SUCCESS.TITLE,
                STRINGS.STORES.ADD.SUCCESS.MSG,
                [{ text: "OK", onPress: () => router.back() }]
            );

        } catch (error) {
            console.error("Add business error:", error);
            Alert.alert("Error", "Could not submit listing");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-6 py-4 border-b border-slate-100 flex-row items-center gap-4">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
                    <ArrowLeft size={20} color="#0f172a" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-bold text-slate-900">{STRINGS.STORES.ADD.TITLE}</Text>
                    <Text className="text-slate-500 text-xs">{STRINGS.STORES.ADD.SUBTITLE}</Text>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1 p-6">
                    {/* Name */}
                    <Text className="text-sm font-bold text-slate-700 mb-2">{STRINGS.STORES.ADD.FORM.NAME_LABEL} *</Text>
                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 mb-5"
                        placeholder={STRINGS.STORES.ADD.FORM.NAME_PLACEHOLDER}
                        value={form.name}
                        onChangeText={t => setForm({ ...form, name: t })}
                    />

                    {/* Category */}
                    <Text className="text-sm font-bold text-slate-700 mb-2">{STRINGS.STORES.ADD.FORM.CATEGORY_LABEL} *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                onPress={() => setForm({ ...form, category: cat.id })}
                                className={`mr-2 px-4 py-2.5 rounded-xl border ${form.category === cat.id ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
                            >
                                <Text className={`font-bold text-sm ${form.category === cat.id ? 'text-white' : 'text-slate-600'}`}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Address */}
                    <Text className="text-sm font-bold text-slate-700 mb-2">{STRINGS.STORES.ADD.FORM.ADDRESS_LABEL} *</Text>
                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 mb-5"
                        placeholder={STRINGS.STORES.ADD.FORM.ADDRESS_PLACEHOLDER}
                        value={form.address}
                        onChangeText={t => setForm({ ...form, address: t })}
                    />

                    {/* Phone */}
                    <Text className="text-sm font-bold text-slate-700 mb-2">{STRINGS.STORES.ADD.FORM.PHONE_LABEL} *</Text>
                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 mb-5"
                        placeholder={STRINGS.STORES.ADD.FORM.PHONE_PLACEHOLDER}
                        keyboardType="phone-pad"
                        value={form.phone}
                        onChangeText={t => setForm({ ...form, phone: t })}
                    />

                    {/* Description */}
                    <Text className="text-sm font-bold text-slate-700 mb-2">{STRINGS.STORES.ADD.FORM.DESC_LABEL} *</Text>
                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 mb-5 h-32"
                        placeholder={STRINGS.STORES.ADD.FORM.DESC_PLACEHOLDER}
                        multiline
                        textAlignVertical="top"
                        value={form.description}
                        onChangeText={t => setForm({ ...form, description: t })}
                    />

                    {/* Image URL Placeholder */}
                    <Text className="text-sm font-bold text-slate-700 mb-2">Image URL (Optional)</Text>
                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 mb-8"
                        placeholder="https://..."
                        value={form.imageUrl}
                        onChangeText={t => setForm({ ...form, imageUrl: t })}
                        autoCapitalize="none"
                    />

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={submitting || !isFormValid}
                        className={`py-4 rounded-2xl items-center justify-center mb-10 ${isFormValid ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-200'}`}
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className={`font-bold text-lg ${isFormValid ? 'text-white' : 'text-slate-400'}`}>
                                {STRINGS.STORES.ADD.FORM.SUBMIT_BTN}
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
