import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Euro, MapPin, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STRINGS } from '../../constants/Strings';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebaseConfig';

export default function AddMarketListingScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [marketType, setMarketType] = useState('housing'); // housing | eclassifieds
    const [type, setType] = useState('offered'); // offered | wanted
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !price || !location || !user) {
            Alert.alert("Missing Info", "Please fill in title, price and location.");
            return;
        }

        setLoading(true);
        try {
            const marketData = {
                title,
                description,
                price: parseFloat(price) || 0,
                location,
                imageUrl: imageUrl || null,
                marketType,
                type,
                userId: user.uid,
                sellerName: user.displayName || 'Community Member',
                searchTitle: title.toLowerCase(),
                keywords: title.toLowerCase().split(/\s+/).filter(word => word.length > 0),
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'public', 'data', 'market'), marketData);

            Alert.alert(
                STRINGS.MARKETPLACE.ADD.SUCCESS.TITLE,
                STRINGS.MARKETPLACE.ADD.SUCCESS.MSG,
                [{ text: "Great!", onPress: () => router.back() }]
            );
        } catch (e: any) {
            console.error(e);
            Alert.alert("Error", e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 py-4 border-b border-slate-100 flex-row justify-between items-center">
                <View>
                    <Text className="text-2xl font-black text-slate-900 tracking-tighter">{STRINGS.MARKETPLACE.ADD.TITLE}</Text>
                    <Text className="text-slate-500 text-xs font-medium">{STRINGS.MARKETPLACE.ADD.SUBTITLE}</Text>
                </View>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
                    <X size={20} color="#64748b" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                <View className="gap-6 pb-20">
                    {/* Category Selector */}
                    <View>
                        <Text className="text-sm font-bold text-slate-900 mb-3">{STRINGS.MARKETPLACE.ADD.FORM.CATEGORY_LABEL}</Text>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setMarketType('housing')}
                                className={`flex-1 py-3 items-center rounded-2xl border ${marketType === 'housing' ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
                            >
                                <Text className={`font-bold ${marketType === 'housing' ? 'text-white' : 'text-slate-600'}`}>{STRINGS.MARKETPLACE.FILTER_HOUSING}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setMarketType('eclassifieds')}
                                className={`flex-1 py-3 items-center rounded-2xl border ${marketType === 'eclassifieds' ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
                            >
                                <Text className={`font-bold ${marketType === 'eclassifieds' ? 'text-white' : 'text-slate-600'}`}>{STRINGS.MARKETPLACE.FILTER_CLASSIFIEDS}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Type Selector */}
                    <View>
                        <Text className="text-sm font-bold text-slate-900 mb-3">{STRINGS.MARKETPLACE.ADD.FORM.TYPE_LABEL}</Text>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setType('offered')}
                                className={`flex-1 py-3 items-center rounded-2xl border ${type === 'offered' ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-slate-200'}`}
                            >
                                <Text className={`font-bold ${type === 'offered' ? 'text-indigo-700' : 'text-slate-500'}`}>Offering</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setType('wanted')}
                                className={`flex-1 py-3 items-center rounded-2xl border ${type === 'wanted' ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-slate-200'}`}
                            >
                                <Text className={`font-bold ${type === 'wanted' ? 'text-indigo-700' : 'text-slate-500'}`}>Wanted</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Title */}
                    <View>
                        <Text className="text-sm font-bold text-slate-900 mb-2">{STRINGS.MARKETPLACE.ADD.FORM.TITLE_LABEL}</Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-base text-slate-900"
                            placeholder={STRINGS.MARKETPLACE.ADD.FORM.TITLE_PLACEHOLDER}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    {/* Price & Location Row */}
                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-slate-900 mb-2">{STRINGS.MARKETPLACE.ADD.FORM.PRICE_LABEL}</Text>
                            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4">
                                <Euro size={18} color="#64748b" />
                                <TextInput
                                    className="flex-1 py-4 ml-2 text-base text-slate-900"
                                    placeholder="0"
                                    value={price}
                                    onChangeText={setPrice}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                        <View className="flex-2">
                            <Text className="text-sm font-bold text-slate-900 mb-2">{STRINGS.MARKETPLACE.ADD.FORM.LOCATION_LABEL}</Text>
                            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4">
                                <MapPin size={18} color="#64748b" />
                                <TextInput
                                    className="flex-1 py-4 ml-2 text-base text-slate-900"
                                    placeholder="e.g. Amsterdam"
                                    value={location}
                                    onChangeText={setLocation}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Image URL */}
                    <View>
                        <Text className="text-sm font-bold text-slate-900 mb-2">Image URL (Optional)</Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-base text-slate-900"
                            placeholder="https://..."
                            value={imageUrl}
                            onChangeText={setImageUrl}
                        />
                    </View>

                    {/* Description */}
                    <View>
                        <Text className="text-sm font-bold text-slate-900 mb-2">{STRINGS.MARKETPLACE.ADD.FORM.DESC_LABEL}</Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-base text-slate-900 h-40"
                            placeholder={STRINGS.MARKETPLACE.ADD.FORM.DESC_PLACEHOLDER}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        className={`py-5 rounded-2xl items-center shadow-lg ${loading ? 'bg-slate-300' : 'bg-indigo-600 shadow-indigo-200'}`}
                    >
                        <Text className="text-white font-black uppercase tracking-widest text-lg">
                            {loading ? STRINGS.MARKETPLACE.ADD.FORM.SUBMITTING : STRINGS.MARKETPLACE.ADD.FORM.SUBMIT_BTN}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
