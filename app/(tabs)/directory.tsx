import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { ChevronRight, Filter, MapPin, Store } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../utils/firebaseConfig';

const BUSINESS_CATEGORIES = [
    'All', 'Tiffins & Food', 'Grocery Stores', 'Accountants & Advisors', 'Fashion & Jewelry', 'Other Services'
];

export default function DirectoryScreen() {
    const [items, setItems] = useState<any[]>([]);
    const [filter, setFilter] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const marketRef = collection(db, 'public', 'data', 'market');
        // Using simple client-side filtering or logic for now as compound queries might need indices
        const q = query(marketRef, where('marketType', '==', 'business'));

        const unsub = onSnapshot(q, (sn) => {
            let list = sn.docs.map(d => ({ id: d.id, ...d.data() }));
            if (filter !== 'All') {
                list = list.filter((i: any) => i.category === filter);
            }
            setItems(list);
        });
        return unsub;
    }, [filter]);

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <View className="px-4 py-3 bg-white border-b border-slate-100 flex-row justify-between items-center">
                <Text className="text-xl font-bold text-slate-900">Directory</Text>
                <TouchableOpacity onPress={() => setShowFilters(!showFilters)} className={`p-2 rounded-full ${showFilters ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                    <Filter size={20} color={showFilters ? '#4f46e5' : '#64748b'} />
                </TouchableOpacity>
            </View>

            {showFilters && (
                <View className="bg-white p-3 border-b border-slate-100 flex-row flex-wrap gap-2">
                    {BUSINESS_CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setFilter(cat)}
                            className={`px-3 py-1.5 rounded-lg border ${filter === cat ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
                        >
                            <Text className={`text-xs font-bold ${filter === cat ? 'text-white' : 'text-slate-600'}`}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <FlatList
                data={items}
                contentContainerStyle={{ padding: 16 }}
                keyExtractor={i => i.id}
                renderItem={({ item }) => (
                    <TouchableOpacity className="bg-white rounded-xl border border-slate-200 p-4 mb-3 flex-row gap-4 shadow-sm items-center">
                        <View className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden items-center justify-center">
                            {item.imageUrl ? <Image source={{ uri: item.imageUrl }} className="w-full h-full" /> : <Store size={24} color="#cbd5e1" />}
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-slate-900">{item.title}</Text>
                            <Text className="text-xs font-bold text-orange-600 uppercase mb-1">{item.category}</Text>
                            <View className="flex-row items-center gap-1">
                                <MapPin size={12} color="#94a3b8" />
                                <Text className="text-xs text-slate-500">{item.location}</Text>
                            </View>
                        </View>
                        <ChevronRight size={20} color="#cbd5e1" />
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}
