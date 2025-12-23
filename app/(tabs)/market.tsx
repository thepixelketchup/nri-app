import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import { MapPin, ShoppingBag } from 'lucide-react-native';

export default function MarketScreen() {
    const [items, setItems] = useState<any[]>([]);
    const [filter, setFilter] = useState('housing');

    useEffect(() => {
        const appId = 'default-app-id';
        const marketRef = collection(db, 'artifacts', appId, 'public', 'data', 'market');
        const q = query(marketRef, where('marketType', '==', filter));

        const unsub = onSnapshot(q, (sn) => {
            const list = sn.docs.map(d => ({ id: d.id, ...d.data() }));
            setItems(list);
        });
        return unsub;
    }, [filter]);

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <View className="px-4 py-3 bg-white border-b border-slate-100">
                <Text className="text-xl font-bold text-slate-900">Marketplace</Text>
            </View>

            <View className="flex-row p-4 gap-3">
                <TouchableOpacity
                    onPress={() => setFilter('housing')}
                    className={`flex-1 py-2 rounded-lg items-center ${filter === 'housing' ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                    <Text className={`font-bold text-xs ${filter === 'housing' ? 'text-white' : 'text-slate-600'}`}>Housing</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setFilter('eclassifieds')}
                    className={`flex-1 py-2 rounded-lg items-center ${filter === 'eclassifieds' ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                    <Text className={`font-bold text-xs ${filter === 'eclassifieds' ? 'text-white' : 'text-slate-600'}`}>Classifieds</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={items}
                contentContainerStyle={{ padding: 16 }}
                keyExtractor={i => i.id}
                renderItem={({ item }) => (
                    <TouchableOpacity className="bg-white rounded-xl border border-slate-200 p-3 mb-3 flex-row gap-3 shadow-sm">
                        <View className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden">
                            {item.imageUrl ? <Image source={{ uri: item.imageUrl }} className="w-full h-full" /> : <View className="w-full h-full items-center justify-center"><ShoppingBag className="text-slate-300" /></View>}
                        </View>
                        <View className="flex-1 justify-between">
                            <View>
                                <Text className="font-bold text-slate-900 text-sm" numberOfLines={2}>{item.title}</Text>
                                <View className={`self-start mt-1 px-2 py-0.5 rounded ${item.type === 'offered' ? 'bg-green-100' : 'bg-orange-100'}`}>
                                    <Text className={`text-[10px] font-bold uppercase ${item.type === 'offered' ? 'text-green-700' : 'text-orange-700'}`}>{item.type}</Text>
                                </View>
                            </View>
                            <View>
                                <Text className="font-bold text-indigo-600">€{item.price}</Text>
                                <View className="flex-row items-center gap-1 mt-1">
                                    <MapPin size={10} color="#94a3b8" />
                                    <Text className="text-xs text-slate-400">{item.location}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}
