import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import { AlertCircle, Eye, Filter, Heart, MapPin, MessageCircle, Search, ShoppingBag, XCircle } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STRINGS } from '../../constants/Strings';
import { useMarketplace } from '../../context/MarketplaceContext';
import { db } from '../../utils/firebaseConfig';
import MarketPlaceCard from '../marketplace/marketPlaceCard';

export default function MarketplaceScreen() {
    const router = useRouter();
    const { filters } = useMarketplace();

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchListings = useCallback(async (isLoadMore = false, isRefresh = false) => {
        if (!isLoadMore) setLoading(true);
        if (isLoadMore) setLoadingMore(true);
        setError(null);

        try {
            const marketRef = collection(db, 'public', 'data', 'market');
            let constraints: any[] = [];

            // 1. Filters
            if (filters.category !== 'all') {
                constraints.push(where('marketType', '==', filters.category));
            }
            if (filters.type !== 'all') {
                constraints.push(where('type', '==', filters.type));
            }
            if (filters.location) {
                constraints.push(where('location', '==', filters.location));
            }

            // 2. Search (Keywords Array)
            if (debouncedSearch.trim()) {
                // Split search into words and take the first one for array-contains
                // limits Firestore (only 1 array-contains per query)
                const searchWord = debouncedSearch.trim().toLowerCase().split(/\s+/)[0];
                if (searchWord) {
                    constraints.push(where('keywords', 'array-contains', searchWord));
                }
            } else {
                // Default Sort only when not searching (array-contains limits ordering)
                constraints.push(orderBy('createdAt', 'desc'));
            }

            // 3. Pagination
            constraints.push(limit(20));
            if (isLoadMore && lastDoc) {
                constraints.push(startAfter(lastDoc));
            }

            const q = query(marketRef, ...constraints);
            const snapshot = await getDocs(q);

            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            if (isLoadMore) {
                setItems(prev => [...prev, ...list]);
            } else {
                setItems(list);
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(list.length === 20);

        } catch (err: any) {
            console.error("Market fetch error:", err);
            setError(STRINGS.MARKETPLACE.ERRORS.GENERIC);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, [filters, debouncedSearch, lastDoc]);

    // Initial Fetch & Filter Change
    useEffect(() => {
        setLastDoc(null);
        fetchListings(false);
    }, [filters, debouncedSearch]);

    const handleRefresh = () => {
        setRefreshing(true);
        setLastDoc(null);
        fetchListings(false, true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && !loading && lastDoc) {
            fetchListings(true);
        }
    };

    // const renderMarketItem = ({ item }: { item: any }) => (
    //     <TouchableOpacity
    //         activeOpacity={0.9}
    //         onPress={() => router.push(`/marketplace/${item.id}`)}
    //         className="bg-white rounded-2xl border border-slate-100 mb-4 overflow-hidden flex-row p-3 gap-4"
    //         style={{
    //             shadowColor: "#000",
    //             shadowOffset: { width: 0, height: 1 },
    //             shadowOpacity: 0.05,
    //             shadowRadius: 2,
    //             elevation: 2,
    //         }}
    //     >
    //         {/* Image Section */}
    //         <View className="w-28 h-28 bg-slate-50 rounded-xl overflow-hidden relative">
    //             {item.imageUrl ? (
    //                 <Image
    //                     source={{ uri: item.imageUrl }}
    //                     className="w-full h-full"
    //                     style={{ width: '100%', height: '100%' }}
    //                     contentFit="cover"
    //                     transition={500}
    //                 />
    //             ) : (
    //                 <View className="w-full h-full items-center justify-center bg-indigo-50">
    //                     <ShoppingBag size={32} color="#818cf8" strokeWidth={1.5} />
    //                 </View>
    //             )}
    //             {/* Badge Overlay */}
    //             <View className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-md ${item.type === 'offered' ? 'bg-green-500' : 'bg-orange-500'}`}>
    //                 <Text className="text-[8px] font-bold text-white uppercase tracking-tighter">
    //                     {item.type === 'offered' ? STRINGS.MARKETPLACE.OFFERED_LABEL : STRINGS.MARKETPLACE.WANTED_LABEL}
    //                 </Text>
    //             </View>
    //         </View>

    //         {/* Info Section */}
    //         <View className="flex-1 justify-between py-0.5">
    //             <View>
    //                 <View className='flex-row items-center justify-between w-full'>
    //                     <Text className="text-base font-bold text-slate-900 leading-5" numberOfLines={2}>
    //                         {item.title}
    //                     </Text>
    //                     <Heart
    //                         size={24}
    //                         color={favourited ? "#ec4899" : "#94a3b8"}
    //                         fill={favourited ? "#ec4899" : "none"}
    //                         onPress={() => setFavourited(!favourited)}
    //                     />
    //                 </View>
    //                 <View className="flex-row items-center gap-1 mt-1.5">
    //                     <MapPin size={12} color="#94a3b8" />
    //                     <Text className="text-xs text-slate-400 font-medium" numberOfLines={1}>
    //                         {item.location}
    //                     </Text>
    //                 </View>

    //                 {/* Stats */}
    //                 <View className="flex-row items-center gap-3 mt-2">
    //                     <View className="flex-row items-center gap-1">
    //                         <Eye size={12} color="#94a3b8" />
    //                         <Text className="text-[10px] font-medium text-slate-500">
    //                             {item.viewCount || 0} {(item.viewCount === 1 || !item.viewCount) ? 'View' : 'Views'}
    //                         </Text>
    //                     </View>
    //                     <View className="flex-row items-center gap-1">
    //                         <MessageCircle size={12} color="#94a3b8" />
    //                         <Text className="text-[10px] font-medium text-slate-500">
    //                             {item.contactCount || 0} {(item.contactCount === 1 || !item.contactCount) ? 'Msg' : 'Msgs'}
    //                         </Text>
    //                     </View>
    //                 </View>
    //             </View>

    //             <View className="flex-row items-end justify-between mt-2">
    //                 <Text className="text-xl font-black text-indigo-600">
    //                     €{item.price === 0 ? 'Free' : item.price}
    //                 </Text>
    //                 <View className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
    //                     <Text className="text-[10px] text-slate-400 font-bold uppercase">
    //                         {item.marketType === 'housing' ? 'Housing' : 'Item'}
    //                     </Text>
    //                 </View>
    //             </View>
    //         </View>
    //     </TouchableOpacity>
    // );

    const activeFilterCount = [
        filters.category !== 'all',
        filters.type !== 'all',
        filters.location !== ''
    ].filter(Boolean).length;

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-6 pt-4 pb-2 bg-white flex-row justify-between items-start">
                <View className="flex-1">
                    <Text className="text-4xl font-extrabold text-slate-900 tracking-tighter">
                        {STRINGS.MARKETPLACE.HEADER_TITLE}
                    </Text>
                    <Text className="text-slate-500 font-medium text-base mt-1">
                        {STRINGS.MARKETPLACE.HEADER_SUBTITLE}
                    </Text>
                </View>
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={() => router.push({
                            pathname: '/marketplace/filters',
                            params: { category: filters.category, type: filters.type }
                        })}
                        className={`w-10 h-10 rounded-full items-center justify-center border relative ${activeFilterCount > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}
                    >
                        <Filter size={20} color={activeFilterCount > 0 ? '#4f46e5' : '#64748b'} />
                        {activeFilterCount > 0 && (
                            <View className="absolute -top-1 -right-1 bg-indigo-600 w-5 h-5 rounded-full items-center justify-center">
                                <Text className="text-white text-[10px] font-bold">{activeFilterCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/marketplace/add')}
                        className="bg-indigo-600 w-10 h-10 rounded-full items-center justify-center"
                        style={{
                            shadowColor: "#4f46e5",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 5,
                        }}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
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
                        placeholder={STRINGS.MARKETPLACE.SEARCH.PLACEHOLDER}
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

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center p-8 text-center bg-white">
                    <View className="bg-red-50 p-4 rounded-full mb-4">
                        <AlertCircle size={32} color="#ef4444" />
                    </View>
                    <Text className="text-slate-900 text-lg font-bold mb-2 text-center">
                        {STRINGS.MARKETPLACE.LOADING_ERROR}
                    </Text>
                    <Text className="text-slate-500 text-sm text-center mb-6 leading-5">
                        {error}
                    </Text>
                    <TouchableOpacity
                        onPress={() => fetchListings(false, true)}
                        className="bg-slate-900 px-6 py-3 rounded-full"
                    >
                        <Text className="text-white font-bold text-sm">Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={i => i.id}
                    renderItem={({item}) => <MarketPlaceCard item={item} />}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={loadingMore ? <ActivityIndicator className="py-4" color="#4f46e5" /> : null}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20 opacity-50">
                            <ShoppingBag size={48} color="#cbd5e1" />
                            <Text className="text-slate-400 mt-4 font-medium">{STRINGS.MARKETPLACE.NO_ITEMS}</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
