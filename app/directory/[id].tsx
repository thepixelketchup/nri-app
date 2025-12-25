import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, increment, setDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, BadgeCheck, CheckCircle2, Clock, Eye, Globe, Languages, MapPin, MessageSquare, Share2, Star, Store, Wallet } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { STRINGS } from '../../constants/Strings';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebaseConfig';

export default function BusinessDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchBusiness();
            trackView();
        }
    }, [id]);

    const fetchBusiness = async () => {
        try {
            const docSnap = await getDoc(doc(db, 'public', 'data', 'businesses', String(id)));
            if (docSnap.exists()) {
                setBusiness({ id: docSnap.id, ...docSnap.data() });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const trackView = async () => {
        if (!user || !id) return;
        try {
            const viewRef = doc(db, 'public', 'data', 'businesses', String(id), 'views', user.uid);
            const viewSnap = await getDoc(viewRef);
            if (!viewSnap.exists()) {
                await setDoc(viewRef, { userId: user.uid, timestamp: new Date() });
                await updateDoc(doc(db, 'public', 'data', 'businesses', String(id)), {
                    viewCount: increment(1)
                });
            }
        } catch (e) { console.error("Track view error", e); }
    };

    /*
    const handleCall = () => {
        if (business?.phone) Linking.openURL(`tel:${business.phone}`);
    };

    const handleWhatsApp = () => {
        if (business?.phone) Linking.openURL(`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}`);
    };
    */

    const handleMessage = () => {
        // Placeholder for internal messaging
        alert("Messaging feature coming soon!");
    };

    const handleOpenMap = () => {
        if (!business?.address) return;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;
        Linking.openURL(url);
    };

    const isStoreOpen = (hours: any) => {
        if (!hours) return true;
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [openH, openM] = hours.open.split(':').map(Number);
        const [closeH, closeM] = hours.close.split(':').map(Number);
        const openTime = openH * 60 + openM;
        const closeTime = closeH * 60 + closeM;
        return currentTime >= openTime && currentTime <= closeTime;
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${business.name} on NRI App!\n📍 ${business.address}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <View className="flex-1 items-center justify-center bg-white"><ActivityIndicator color="#4f46e5" /></View>;
    if (!business) return <View className="flex-1 items-center justify-center bg-white"><Text>Business not found</Text></View>;

    const isOpen = isStoreOpen(business.openingHours);

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }}>
                {/* Hero Image */}
                <View className="h-72 w-full relative bg-slate-100">
                    {business.imageUrl ? (
                        <Image
                            source={{ uri: business.imageUrl }}
                            className="w-full h-full"
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                        />
                    ) : (
                        <View className="w-full h-full items-center justify-center bg-indigo-50">
                            <Store size={64} color="#818cf8" strokeWidth={1.5} />
                        </View>
                    )}

                    {/* Header Actions */}
                    <View className="absolute top-0 w-full flex-row justify-between px-6 z-10" style={{ paddingTop: insets.top + 12 }}>
                        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full items-center justify-center border border-white/10">
                            <ArrowLeft size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleShare} className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full items-center justify-center border border-white/10">
                            <Share2 size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Floating Status Indicator */}
                    <View className={`absolute bottom-10 right-6 px-3 py-1.5 rounded-full backdrop-blur-md border ${isOpen ? 'bg-emerald-500/90 border-emerald-400' : 'bg-rose-500/90 border-rose-400'}`}>
                        <View className="flex-row items-center gap-1.5">
                            <Clock size={12} color="white" />
                            <Text className="text-xs font-black text-white uppercase tracking-tight">
                                {isOpen ? 'Open Now' : 'Closed'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Content Section */}
                <View className="px-6 pb-6 bg-white -mt-6 rounded-t-3xl pt-8">
                    {/* Header: Category & Rating */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-2">
                            <Text className="text-sm font-bold text-indigo-600 uppercase tracking-widest">
                                {business.category}
                            </Text>
                            {business.isVerified && (
                                <View className="flex-row items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                    <BadgeCheck size={12} color="#4f46e5" />
                                    <Text className="text-[10px] font-bold text-indigo-700 uppercase">Verified</Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity className="bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 flex-row items-center gap-1">
                            <Star size={12} color="#d97706" fill="#d97706" />
                            <Text className="text-amber-800 text-xs font-bold leading-none">{business.rating?.toFixed(1) || 'New'} ({business.reviewCount || 0})</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <Text className="text-3xl font-extrabold text-slate-900 leading-tight mb-4">{business.name}</Text>

                    {/* Location & Service Areas */}
                    <TouchableOpacity onPress={handleOpenMap} className="flex-row items-start gap-2.5 mb-2">
                        <MapPin size={18} color="#4f46e5" className="mt-0.5" />
                        <Text className="text-slate-600 text-base flex-1 font-semibold leading-6">{business.address}</Text>
                    </TouchableOpacity>

                    {business.serviceAreas && (
                        <View className="flex-row items-center gap-2 mb-8 ml-7">
                            <Text className="text-xs text-slate-400 font-bold uppercase">Serving:</Text>
                            <Text className="text-xs text-slate-500 font-medium">{business.serviceAreas.join(', ')}</Text>
                        </View>
                    )}

                    {/* Stats Matrix */}
                    <View className="flex-row gap-3 mb-8">
                        <View className="flex-1 bg-blue-50 rounded-2xl p-4 items-center justify-center border border-blue-100/50">
                            <Eye size={20} color="#2563eb" className="mb-1.5" />
                            <Text className="text-blue-900 font-bold text-lg leading-tight">{business.viewCount || 0}</Text>
                            <Text className="text-blue-600/70 text-[10px] font-bold uppercase tracking-tighter">Views</Text>
                        </View>
                        <View className="flex-1 bg-amber-50 rounded-2xl p-4 items-center justify-center border border-amber-100/50">
                            <Star size={20} color="#d97706" className="mb-1.5" />
                            <Text className="text-amber-900 font-bold text-lg leading-tight">{business.rating?.toFixed(1) || 'N/A'}</Text>
                            <Text className="text-amber-600/70 text-[10px] font-bold uppercase tracking-tighter">Rating</Text>
                        </View>
                        <View className="flex-1 bg-indigo-50 rounded-2xl p-4 items-center justify-center border border-indigo-100/50">
                            <MessageSquare size={20} color="#4f46e5" className="mb-1.5" />
                            <Text className="text-indigo-900 font-bold text-lg leading-tight">{business.reviewCount || 0}</Text>
                            <Text className="text-indigo-600/70 text-[10px] font-bold uppercase tracking-tighter">Reviews</Text>
                        </View>
                    </View>

                    {/* Trust & Logistics Section */}
                    <View className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50">
                        <View className="p-4 border-b border-slate-100 bg-slate-50">
                            <Text className="text-sm font-black text-slate-900 uppercase tracking-widest">Trust & Logistics</Text>
                        </View>
                        <View className="p-4 flex-row flex-wrap gap-y-4">
                            <View className="w-1/2 flex-row items-center gap-3">
                                <View className="w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm">
                                    <Languages size={14} color="#64748b" />
                                </View>
                                <View>
                                    <Text className="text-[10px] font-bold text-slate-400 uppercase">Languages</Text>
                                    <Text className="text-xs font-bold text-slate-700">{business.languages?.join(', ') || 'English'}</Text>
                                </View>
                            </View>
                            <View className="w-1/2 flex-row items-center gap-3">
                                <View className="w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm">
                                    <Globe size={14} color="#64748b" />
                                </View>
                                <View>
                                    <Text className="text-[10px] font-bold text-slate-400 uppercase">KvK Number</Text>
                                    <Text className="text-xs font-bold text-slate-700">{business.kvkNumber || 'N/A'}</Text>
                                </View>
                            </View>
                            <View className="w-1/2 flex-row items-center gap-3">
                                <View className="w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm">
                                    <Clock size={14} color="#64748b" />
                                </View>
                                <View>
                                    <Text className="text-[10px] font-bold text-slate-400 uppercase">Hours</Text>
                                    <Text className="text-xs font-bold text-slate-700">9 AM - 9 PM</Text>
                                </View>
                            </View>
                            {business.website && (
                                <TouchableOpacity onPress={() => Linking.openURL(business.website)} className="w-1/2 flex-row items-center gap-3">
                                    <View className="w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm">
                                        <Share2 size={14} color="#4f46e5" />
                                    </View>
                                    <View>
                                        <Text className="text-[10px] font-bold text-indigo-400 uppercase">Website</Text>
                                        <Text className="text-xs font-bold text-indigo-600" numberOfLines={1}>Visit Site</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Category Specific Sections */}
                    {(business.dietary || business.deadline || business.stockDay) && (
                        <View className="mb-8 p-5 rounded-2xl bg-indigo-600">
                            <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-3">Service Details</Text>
                            <View className="flex-row flex-wrap gap-4">
                                {business.dietary?.map((d: string) => (
                                    <View key={d} className="bg-white/10 px-3 py-1.5 rounded-lg flex-row items-center gap-2">
                                        <CheckCircle2 size={14} color="white" />
                                        <Text className="text-white font-bold">{d}</Text>
                                    </View>
                                ))}
                                {business.stockDay && (
                                    <View className="bg-white/10 px-3 py-1.5 rounded-lg flex-row items-center gap-2">
                                        <Store size={14} color="white" />
                                        <Text className="text-white font-bold">Fresh Stock: {business.stockDay}</Text>
                                    </View>
                                )}
                                {business.fee && (
                                    <View className="bg-white/10 px-3 py-1.5 rounded-lg flex-row items-center gap-2">
                                        <Wallet size={14} color="white" />
                                        <Text className="text-white font-bold">{business.fee}</Text>
                                    </View>
                                )}
                            </View>
                            {business.deadline && (
                                <View className="mt-4 pt-4 border-t border-white/10">
                                    <Text className="text-white/90 text-sm font-medium italic">"{business.deadline}"</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Description */}
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-slate-900 mb-3">{STRINGS.STORES.DETAILS.ABOUT}</Text>
                        <Text className="text-slate-600 leading-7 text-base">
                            {business.description}
                        </Text>
                    </View>

                    {/* Photo Gallery Placeholder */}
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-slate-900 mb-4">Photos</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                            {[1, 2, 3, 4].map(i => (
                                <View key={i} className="w-64 h-40 bg-slate-100 rounded-2xl mr-4 overflow-hidden border border-slate-100">
                                    <Image
                                        source={{ uri: `https://picsum.photos/seed/${business.name}${i}/600/400` }}
                                        className="w-full h-full"
                                        contentFit="cover"
                                    />
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Reviews List Placeholder - HIDDEN FOR NOW
                    <View className="mb-8">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-bold text-slate-900">Recent Reviews</Text>
                            <TouchableOpacity>
                                <Text className="text-indigo-600 font-bold">Write a Review</Text>
                            </TouchableOpacity>
                        </View>
                        {[1, 2].map(i => (
                            <View key={i} className="mb-6 pb-6 border-b border-slate-50">
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center gap-3">
                                        <View className="w-8 h-8 rounded-full bg-slate-200" />
                                        <View>
                                            <Text className="text-sm font-bold text-slate-900">Community Member</Text>
                                            <Text className="text-[10px] text-slate-400 font-medium">2 days ago</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} size={10} color={s <= 4 ? "#d97706" : "#cbd5e1"} fill={s <= 4 ? "#d97706" : "transparent"} />
                                        ))}
                                    </View>
                                </View>
                                <Text className="text-slate-600 text-sm leading-6">Great service and very friendly staff. Highly recommend for the Indian community in this area!</Text>
                            </View>
                        ))}
                    </View>
                    */}

                    {/* Report Listing - HIDDEN FOR NOW
                    <TouchableOpacity className="py-4 items-center border border-slate-100 rounded-xl mb-4">
                        <Text className="text-slate-400 font-bold text-sm">Report this Listing</Text>
                    </TouchableOpacity>
                    */}
                </View>
            </ScrollView>

            {/* Sticky Action Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md px-6 pt-4 border-t border-slate-100" style={{ paddingBottom: insets.bottom + 10 }}>
                <View className="w-full">
                    <TouchableOpacity onPress={handleMessage} className="w-full bg-indigo-600 py-4 rounded-2xl items-center flex-row justify-center gap-3 shadow-lg shadow-indigo-200">
                        <MessageSquare size={20} color="white" />
                        <Text className="text-white font-black uppercase tracking-widest">Send a Message</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
