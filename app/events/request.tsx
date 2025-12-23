import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Calendar, ChevronLeft, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { STRINGS } from '../../constants/Strings';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebaseConfig';

export default function EventRequestScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { top } = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: '',
        date: '',
        location: '',
        description: '',
        price: '',
    });

    const handleSubmit = async () => {
        if (!form.title || !form.location || !form.description) {
            Alert.alert(STRINGS.EVENTS.REQUEST.ERROR.TITLE, STRINGS.EVENTS.REQUEST.ERROR.MISSING_FIELDS);
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'public', 'data', 'event_requests'), {
                ...form,
                price: parseFloat(form.price) || 0,
                userId: user?.uid,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            Alert.alert(
                STRINGS.EVENTS.REQUEST.SUCCESS.TITLE,
                STRINGS.EVENTS.REQUEST.SUCCESS.MSG,
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error(error);
            Alert.alert(STRINGS.EVENTS.REQUEST.ERROR.TITLE, STRINGS.EVENTS.REQUEST.ERROR.MSG);
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
                    <Text className="text-xl font-bold text-slate-900">{STRINGS.EVENTS.REQUEST.TITLE}</Text>
                    <Text className="text-xs text-slate-500">{STRINGS.EVENTS.REQUEST.SUBTITLE}</Text>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>

                    {/* Title */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">{STRINGS.EVENTS.REQUEST.FORM.TITLE_LABEL}</Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-base"
                            placeholder={STRINGS.EVENTS.REQUEST.FORM.TITLE_PLACEHOLDER}
                            value={form.title}
                            onChangeText={t => setForm({ ...form, title: t })}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    {/* Date (Simple Text for now, can upgrade to Picker) */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">{STRINGS.EVENTS.REQUEST.FORM.DATE_LABEL}</Text>
                        <View className="relative">
                            <View className="absolute left-4 top-4 z-10">
                                <Calendar size={20} color="#94a3b8" />
                            </View>
                            <TextInput
                                className="bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-900 text-base"
                                placeholder="e.g. 25th Dec, 6:00 PM"
                                value={form.date}
                                onChangeText={t => setForm({ ...form, date: t })}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>

                    {/* Location */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">{STRINGS.EVENTS.REQUEST.FORM.LOCATION_LABEL}</Text>
                        <View className="relative">
                            <View className="absolute left-4 top-4 z-10">
                                <MapPin size={20} color="#94a3b8" />
                            </View>
                            <TextInput
                                className="bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-900 text-base"
                                placeholder={STRINGS.EVENTS.REQUEST.FORM.LOCATION_PLACEHOLDER}
                                value={form.location}
                                onChangeText={t => setForm({ ...form, location: t })}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>

                    {/* Price */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">{STRINGS.EVENTS.REQUEST.FORM.PRICE_LABEL}</Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-base"
                            placeholder={STRINGS.EVENTS.REQUEST.FORM.PRICE_PLACEHOLDER}
                            keyboardType="numeric"
                            value={form.price}
                            onChangeText={t => setForm({ ...form, price: t })}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    {/* Description */}
                    <View className="mb-8">
                        <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">{STRINGS.EVENTS.REQUEST.FORM.DESC_LABEL}</Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-base min-h-[120px]"
                            placeholder={STRINGS.EVENTS.REQUEST.FORM.DESC_PLACEHOLDER}
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
                            <Text className="text-white font-bold text-lg">{STRINGS.EVENTS.REQUEST.FORM.SUBMIT_BTN}</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
