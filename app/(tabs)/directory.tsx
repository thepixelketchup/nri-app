import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import { BadgeCheck, Clock, Eye, Filter, MapPin, MessageSquare, Search, Star, Store, XCircle } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STRINGS } from '../../constants/Strings';
import { useDirectory } from '../../context/DirectoryContext';
import { db } from '../../utils/firebaseConfig';

const CATEGORIES = [
    { id: 'all', label: STRINGS.STORES.CATEGORIES.ALL, icon: 'grid' },
    { id: 'grocery', label: STRINGS.STORES.CATEGORIES.GROCERY, icon: 'cart' },
    { id: 'tiffin', label: STRINGS.STORES.CATEGORIES.TIFFIN, icon: 'nutrition' },
    { id: 'restaurant', label: STRINGS.STORES.CATEGORIES.RESTAURANT, icon: 'restaurant' },
    { id: 'services', label: STRINGS.STORES.CATEGORIES.SERVICES, icon: 'construct' },
    { id: 'beauty', label: STRINGS.STORES.CATEGORIES.BEAUTY, icon: 'rose' },
    { id: 'education', label: STRINGS.STORES.CATEGORIES.EDUCATION, icon: 'school' },
    { id: 'religious', label: STRINGS.STORES.CATEGORIES.RELIGIOUS, icon: 'flower' },
    { id: 'other', label: STRINGS.STORES.CATEGORIES.OTHER, icon: 'ellipsis-horizontal' },
];

export default function DirectoryScreen() {
    const router = useRouter();
    const { filters } = useDirectory();
    // const [selectedCategory, setSelectedCategory] = useState('all'); // Removed local state
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchBusinesses = useCallback(async (isLoadMore = false) => {
        if (!isLoadMore) setLoading(true);
        if (isLoadMore) setLoadingMore(true);

        try {
            const ref = collection(db, 'public', 'data', 'businesses');
            let constraints: any[] = [];

            if (filters.category !== 'all') {
                constraints.push(where('category', '==', filters.category));
            }

            if (debouncedSearch.trim()) {
                const term = debouncedSearch.trim().toLowerCase().split(/\s+/)[0];
                constraints.push(where('keywords', 'array-contains', term));
            } else if (filters.city) {
                // Fallback to searching city via keywords if no search term active
                const cityTerm = filters.city.trim().toLowerCase().split(/\s+/)[0];
                constraints.push(where('keywords', 'array-contains', cityTerm));
            } else {
                constraints.push(orderBy('createdAt', 'desc'));
            }

            constraints.push(limit(20));
            if (isLoadMore && lastDoc) constraints.push(startAfter(lastDoc));

            const q = query(ref, ...constraints);
            const snap = await getDocs(q);
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            if (isLoadMore) {
                setItems(prev => [...prev, ...list]);
            } else {
                setItems(list);
            }

            setLastDoc(snap.docs[snap.docs.length - 1]);
            setHasMore(list.length === 20);

        } catch (error) {
            console.error("Directory fetch error:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters, debouncedSearch, lastDoc]);

    useEffect(() => {
        setLastDoc(null);
        fetchBusinesses(false);
    }, [filters, debouncedSearch]);

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

    const renderBusinessCard = ({ item }: { item: any }) => {
        const isOpen = isStoreOpen(item.openingHours);

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(`/directory/${item.id}`)}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-5 overflow-hidden"
            >
                {/* Image */}
                <View className="h-40 w-full bg-slate-100 relative">
                    {item.imageUrl ? (
                        <Image
                            source={{ uri: item.imageUrl }}
                            className="w-full h-full"
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                            transition={500}
                        />
                    ) : (
                        <View className="w-full h-full items-center justify-center bg-indigo-50">
                            <Store size={40} color="#818cf8" />
                        </View>
                    )}
                    {/* Category Badge Overlay */}
                    <View className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-100">
                        <Text className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                            {CATEGORIES.find(c => c.id === item.category)?.label || 'Business'}
                        </Text>
                    </View>

                    {/* NEW: Open/Closed Badge Overlay */}
                    <View className={`absolute top-3 right-3 px-2 py-1 rounded-full backdrop-blur-sm border ${isOpen ? 'bg-emerald-500/90 border-emerald-400' : 'bg-rose-500/90 border-rose-400'}`}>
                        <Text className="text-[9px] font-black text-white uppercase tracking-tighter">
                            {isOpen ? 'Open Now' : 'Closed'}
                        </Text>
                    </View>
                </View>

                {/* Content */}
                <View className="p-4">
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 mr-2">
                            <View className="flex-row items-center gap-1.5 flex-wrap">
                                <Text className="text-lg font-bold text-slate-900 leading-6" numberOfLines={1}>
                                    {item.name}
                                </Text>
                                {item.isVerified && (
                                    <BadgeCheck size={18} color="#4f46e5" fill="#eef2ff" />
                                )}
                            </View>

                            {/* Category Specific signals */}
                            <View className="flex-row items-center gap-2 mt-1">
                                {item.dietary?.map((d: string) => (
                                    <View key={d} className={`px-1.5 py-0.5 rounded-md border ${d.includes('Veg') ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
                                        <Text className={`text-[8px] font-bold uppercase ${d.includes('Veg') ? 'text-emerald-700' : 'text-orange-700'}`}>
                                            {d}
                                        </Text>
                                    </View>
                                ))}
                                {item.stockDay && (
                                    <View className="bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">
                                        <Text className="text-[8px] font-bold text-indigo-700 uppercase">Stock: {item.stockDay}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        <View className="flex-row items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                            <Star size={10} color="#d97706" fill="#d97706" />
                            <Text className="text-xs font-bold text-amber-700">{item.rating?.toFixed(1) || 'New'}</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-1.5 mb-4">
                        <MapPin size={14} color="#64748b" />
                        <Text className="text-sm font-medium text-slate-500 flex-1" numberOfLines={1}>
                            {item.address}
                        </Text>
                    </View>

                    <View className="pt-3 border-t border-slate-50 flex-row items-center gap-3">
                        <View className="flex-row items-center gap-1.5">
                            <MessageSquare size={12} color="#64748b" />
                            <Text className="text-xs text-slate-500 font-medium">{item.reviewCount || 0} reviews</Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                            <Eye size={12} color="#64748b" />
                            <Text className="text-xs text-slate-500 font-medium">
                                {item.viewCount || 0} {(item.viewCount === 1 || !item.viewCount) ? 'view' : 'views'}
                            </Text>
                        </View>
                        <View className="flex-1" />
                        <View className="flex-row items-center gap-1">
                            <Clock size={10} color="#94a3b8" />
                            <Text className="text-[10px] text-slate-400 font-medium">9 AM - 9 PM</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-6 pt-4 pb-2 flex-row justify-between items-start">
                <View>
                    <Text className="text-4xl font-extrabold text-slate-900 tracking-tighter">{STRINGS.STORES.HEADER_TITLE}</Text>
                    <Text className="text-slate-500 font-medium text-base mt-1">{STRINGS.STORES.HEADER_SUBTITLE}</Text>
                </View>
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={() => router.push('/directory/filters')}
                        className={`w-10 h-10 rounded-full items-center justify-center border relative ${filters.category !== 'all' || filters.city ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}
                    >
                        <Filter size={20} color={filters.category !== 'all' || filters.city ? '#4f46e5' : '#64748b'} />
                        {((filters.category !== 'all' ? 1 : 0) + (filters.city ? 1 : 0) > 0) && (
                            <View className="absolute -top-1 -right-1 bg-indigo-600 w-5 h-5 rounded-full items-center justify-center">
                                <Text className="text-white text-[10px] font-bold">
                                    {(filters.category !== 'all' ? 1 : 0) + (filters.city ? 1 : 0)}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    {/* Add Button Removed - Moved to Profile Partner Hub */}
                </View>
            </View>

            {/* Search */}
            <View className="px-6 py-2">
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        height: 52,
                        borderWidth: 1,
                        backgroundColor: isSearchFocused ? 'white' : '#f8fafc',
                        borderColor: isSearchFocused ? '#818cf8' : '#f1f5f9',
                    }}
                >
                    <Search
                        size={18}
                        color={isSearchFocused ? '#4f46e5' : '#94a3b8'}
                        strokeWidth={isSearchFocused ? 2.5 : 2}
                    />
                    <TextInput
                        style={{
                            flex: 1,
                            marginLeft: 10,
                            fontSize: 15,
                            color: '#0f172a',
                            fontWeight: '500',
                            paddingVertical: 0,
                        }}
                        placeholder={STRINGS.STORES.SEARCH_PLACEHOLDER}
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setSearchQuery('')}
                            style={{ padding: 4 }}
                        >
                            <XCircle size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Create Index Warning log */}
            {/* If needed, we can add the index link log here if fetches fail */}



            {/* List */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={i => i.id}
                    renderItem={renderBusinessCard}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, flexGrow: 1 }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20 opacity-50 h-full">
                            <Store size={48} color="#cbd5e1" />
                            <Text className="text-slate-400 mt-4 font-medium">{STRINGS.STORES.NO_ITEMS}</Text>
                        </View>
                    }
                    onEndReached={() => { if (hasMore && !loadingMore) fetchBusinesses(true); }}
                    onEndReachedThreshold={0.5}
                />
            )}
        </SafeAreaView>
    );
}
