import { Stack, useRouter } from 'expo-router';
import {
    Coffee,
    Flower,
    LayoutGrid,
    MoreHorizontal,
    School,
    ShoppingBag,
    Utensils,
    Wrench,
    X
} from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STRINGS } from '../../constants/Strings';
import { useDirectory } from '../../context/DirectoryContext';

export default function DirectoryFiltersScreen() {
    const router = useRouter();
    const { filters, setFilters } = useDirectory();

    const [category, setCategory] = useState(filters.category);
    const [city, setCity] = useState(filters.city);

    const handleApply = () => {
        setFilters({ category, city });
        router.back();
    };

    const handleReset = () => {
        setCategory('all');
        setCity('');
    };

    const FilterPill = ({ label, active, icon: Icon, onPress }: { label: string, active: boolean, icon: any, onPress: () => void }) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className={`flex-row items-center px-4 py-2.5 rounded-full border mr-3 mb-3 ${active ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-50 border-slate-100'}`}
        >
            <Icon size={16} color={active ? 'white' : '#64748b'} strokeWidth={2} />
            <Text className={`ml-2 text-xs font-bold ${active ? 'text-white' : 'text-slate-600'}`}>{label}</Text>
        </TouchableOpacity>
    );

    // Categories mapping matching directory.tsx
    const CATEGORIES_OPTS = [
        { id: 'all', label: STRINGS.STORES.CATEGORIES.ALL, icon: LayoutGrid },
        { id: 'grocery', label: STRINGS.STORES.CATEGORIES.GROCERY, icon: ShoppingBag },
        { id: 'tiffin', label: STRINGS.STORES.CATEGORIES.TIFFIN, icon: Utensils }, // Nutrition/Tiffin
        { id: 'restaurant', label: STRINGS.STORES.CATEGORIES.RESTAURANT, icon: Coffee }, // or icons from directory.tsx
        { id: 'services', label: STRINGS.STORES.CATEGORIES.SERVICES, icon: Wrench },
        { id: 'beauty', label: STRINGS.STORES.CATEGORIES.BEAUTY, icon: Flower }, // Rose/Flower
        { id: 'education', label: STRINGS.STORES.CATEGORIES.EDUCATION, icon: School },
        { id: 'religious', label: STRINGS.STORES.CATEGORIES.RELIGIOUS, icon: Flower },
        { id: 'other', label: STRINGS.STORES.CATEGORIES.OTHER, icon: MoreHorizontal },
    ];

    const LOCATIONS = ['Amstelveen', 'Amsterdam', 'Eindhoven', 'Rotterdam', 'The Hague', 'Utrecht'];

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 pt-6 pb-2 flex-row justify-between items-center relative">
                <View className="w-12 h-1 bg-slate-200 rounded-full absolute top-2 self-center left-[50%] -ml-6" />
                <Text className="text-xl font-black text-slate-900 tracking-tighter">
                    {STRINGS.MARKETPLACE.FILTERS.TITLE}
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
                >
                    <X size={20} color="#64748b" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* Category Section */}
                <View className="mt-8">
                    <Text className="text-[11px] font-black text-slate-400 mb-4 uppercase tracking-[2px]">
                        {STRINGS.MARKETPLACE.FILTERS.SECTION_CATEGORY}
                    </Text>
                    <View className="flex-row flex-wrap">
                        {CATEGORIES_OPTS.map((cat) => (
                            <FilterPill
                                key={cat.id}
                                label={cat.label}
                                active={category === cat.id}
                                icon={cat.icon}
                                onPress={() => setCategory(cat.id)}
                            />
                        ))}
                    </View>
                </View>

                {/* Location Section */}
                <View className="mt-8 mb-10">
                    <Text className="text-[11px] font-black text-slate-400 mb-4 uppercase tracking-[2px]">
                        {STRINGS.MARKETPLACE.FILTERS.SECTION_LOCATION}
                    </Text>

                    <View className="flex-row flex-wrap">
                        <TouchableOpacity
                            onPress={() => setCity('')}
                            activeOpacity={0.7}
                            className={`px-4 py-2.5 rounded-full border mr-2 mb-2 ${city === '' ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-50 border-slate-100'}`}
                        >
                            <Text className={`text-xs font-bold ${city === '' ? 'text-white' : 'text-slate-600'}`}>All</Text>
                        </TouchableOpacity>
                        {LOCATIONS.sort().map(loc => (
                            <TouchableOpacity
                                key={loc}
                                onPress={() => setCity(loc)}
                                activeOpacity={0.7}
                                className={`px-4 py-2.5 rounded-full border mr-2 mb-2 ${city === loc ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-50 border-slate-100'}`}
                            >
                                <Text className={`text-xs font-bold ${city === loc ? 'text-white' : 'text-slate-600'}`}>{loc}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View className="px-8 py-6 border-t border-slate-50 bg-white">
                <View className="flex-row gap-4">
                    <TouchableOpacity
                        onPress={handleReset}
                        className="flex-1 py-4 items-center justify-center rounded-2xl border border-slate-200"
                    >
                        <Text className="text-base font-bold text-slate-600">
                            {STRINGS.MARKETPLACE.FILTERS.RESET_BTN}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleApply}
                        className="flex-[2] bg-indigo-600 py-4 items-center justify-center rounded-2xl shadow-lg shadow-indigo-100"
                    >
                        <Text className="text-white font-bold text-base">
                            {STRINGS.MARKETPLACE.FILTERS.APPLY_BTN}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
