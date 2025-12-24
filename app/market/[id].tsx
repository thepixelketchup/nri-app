import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { MapPin, Share2, ShoppingBag, Tag, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { STRINGS } from '../../constants/Strings';
import { db } from '../../utils/firebaseConfig';

export default function MarketDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetchItem();
    }, [id]);

    const fetchItem = async () => {
        try {
            const docRef = doc(db, 'public', 'data', 'market', String(id));
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setItem({ id: snap.id, ...snap.data() });
            } else {
                Alert.alert("Error", STRINGS.MARKETPLACE.DETAILS.NOT_FOUND);
                router.back();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!item) return;
        try {
            await Share.share({
                message: STRINGS.MARKETPLACE.DETAILS.SHARE_MESSAGE(item.title, item.price, item.location),
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    const handleContact = () => {
        Alert.alert(
            STRINGS.MARKETPLACE.DETAILS.CONTACT,
            "Contacting functionality will be available soon!",
            [{ text: "OK" }]
        );
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    if (!item) return null;

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }}>
                {/* Hero Image Section */}
                <View className="h-80 w-full relative bg-slate-900">
                    {item.imageUrl ? (
                        <Image
                            source={{ uri: item.imageUrl }}
                            className="w-full h-full"
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                            transition={500}
                        />
                    ) : (
                        <View className="w-full h-full items-center justify-center bg-indigo-600">
                            <ShoppingBag size={80} color="white" strokeWidth={1.5} />
                        </View>
                    )}

                    {/* Header Overlay */}
                    <View
                        className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/60 to-transparent flex-row justify-between items-start px-4"
                        style={{ paddingTop: top + 10 }}
                    >
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full items-center justify-center border border-white/10"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleShare}
                            className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full items-center justify-center border border-white/10"
                        >
                            <Share2 size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Badge Overlay */}
                    <View className={`absolute bottom-6 left-5 px-4 py-1.5 rounded-full ${item.type === 'offered' ? 'bg-green-500' : 'bg-orange-500'}`}>
                        <Text className="text-white font-black uppercase text-xs tracking-widest">
                            {item.type === 'offered' ? STRINGS.MARKETPLACE.OFFERED_LABEL : STRINGS.MARKETPLACE.WANTED_LABEL}
                        </Text>
                    </View>
                </View>

                {/* Content */}
                <View className="px-5 -mt-6 bg-white rounded-t-3xl pt-8">
                    {/* Title & Category */}
                    <View className="mb-6">
                        <Text className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-1">
                            {item.marketType === 'housing' ? STRINGS.MARKETPLACE.DETAILS.HOUSING : STRINGS.MARKETPLACE.DETAILS.CLASSIFIED}
                        </Text>
                        <Text className="text-3xl font-extrabold text-slate-900 leading-tight">{item.title}</Text>
                    </View>

                    {/* Info Matrix */}
                    <View className="flex-row flex-wrap gap-4 mb-8">
                        {/* Price */}
                        <View className="bg-slate-50 rounded-2xl p-4 flex-1 min-w-[140px] border border-slate-100">
                            <View className="flex-row items-center gap-2 mb-1">
                                <Tag size={16} color="#4f46e5" />
                                <Text className="text-slate-500 text-xs font-bold uppercase tracking-tighter">{STRINGS.MARKETPLACE.DETAILS.PRICE}</Text>
                            </View>
                            <Text className="text-2xl font-black text-slate-900">€{item.price === 0 ? 'Free' : item.price}</Text>
                        </View>

                        {/* Location */}
                        <View className="bg-slate-50 rounded-2xl p-4 flex-1 min-w-[140px] border border-slate-100">
                            <View className="flex-row items-center gap-2 mb-1">
                                <MapPin size={16} color="#4f46e5" />
                                <Text className="text-slate-500 text-xs font-bold uppercase tracking-tighter">{STRINGS.MARKETPLACE.DETAILS.LOCATION}</Text>
                            </View>
                            <Text className="text-base font-bold text-slate-900" numberOfLines={1}>{item.location}</Text>
                        </View>
                    </View>

                    {/* Seller Section */}
                    <View className="flex-row items-center gap-4 mb-8 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                        <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center">
                            <User size={24} color="#4f46e5" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-500 text-xs font-bold uppercase tracking-tighter">{STRINGS.MARKETPLACE.DETAILS.SELLER}</Text>
                            <Text className="text-lg font-bold text-slate-900">{item.sellerName || 'Community Member'}</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-slate-900 mb-3">{STRINGS.MARKETPLACE.DETAILS.ABOUT}</Text>
                        <Text className="text-slate-600 text-base leading-7">{item.description}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Floating Action Bar */}
            <View
                className="absolute left-5 right-5"
                style={{ bottom: bottom + 10 }}
            >
                <TouchableOpacity
                    onPress={handleContact}
                    className="bg-indigo-600 rounded-[32px] py-5 items-center justify-center shadow-2xl shadow-indigo-200 active:scale-[0.98] transition-transform"
                >
                    <Text className="text-white text-lg font-black uppercase tracking-widest">{STRINGS.MARKETPLACE.DETAILS.CONTACT}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
