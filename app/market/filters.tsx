import { Stack, useRouter } from 'expo-router';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Home,
    LayoutGrid,
    ShoppingBag,
    Tag,
    X
} from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STRINGS } from '../../constants/Strings';
import { useMarket } from '../../context/MarketContext';

export default function MarketFiltersScreen() {
    const router = useRouter();
    const { filters, setFilters } = useMarket();

    const [category, setCategory] = useState(filters.category);
    const [type, setType] = useState(filters.type);
    const [location, setLocation] = useState(filters.location);

    const handleApply = () => {
        setFilters({ category, type, location });
        router.back();
    };

    const handleReset = () => {
        setCategory('all');
        setType('all');
        setLocation('');
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
                        <FilterPill
                            label={STRINGS.MARKETPLACE.FILTER_ALL}
                            active={category === 'all'}
                            icon={LayoutGrid}
                            onPress={() => setCategory('all')}
                        />
                        <FilterPill
                            label={STRINGS.MARKETPLACE.FILTER_HOUSING}
                            active={category === 'housing'}
                            icon={Home}
                            onPress={() => setCategory('housing')}
                        />
                        <FilterPill
                            label={STRINGS.MARKETPLACE.FILTER_CLASSIFIEDS}
                            active={category === 'eclassifieds'}
                            icon={ShoppingBag}
                            onPress={() => setCategory('eclassifieds')}
                        />
                    </View>
                </View>

                {/* Type Section */}
                <View className="mt-8">
                    <Text className="text-[11px] font-black text-slate-400 mb-4 uppercase tracking-[2px]">
                        {STRINGS.MARKETPLACE.FILTERS.SECTION_TYPE}
                    </Text>
                    <View className="flex-row flex-wrap">
                        <FilterPill
                            label={STRINGS.MARKETPLACE.FILTER_ALL}
                            active={type === 'all'}
                            icon={Tag}
                            onPress={() => setType('all')}
                        />
                        <FilterPill
                            label={STRINGS.MARKETPLACE.OFFERED_LABEL}
                            active={type === 'offered'}
                            icon={ArrowUpCircle}
                            onPress={() => setType('offered')}
                        />
                        <FilterPill
                            label={STRINGS.MARKETPLACE.WANTED_LABEL}
                            active={type === 'wanted'}
                            icon={ArrowDownCircle}
                            onPress={() => setType('wanted')}
                        />
                    </View>
                </View>

                {/* Location Section */}
                <View className="mt-8 mb-10">
                    <Text className="text-[11px] font-black text-slate-400 mb-4 uppercase tracking-[2px]">
                        {STRINGS.MARKETPLACE.FILTERS.SECTION_LOCATION}
                    </Text>

                    {/* Quick Location Pills */}
                    <View className="flex-row flex-wrap">
                        <TouchableOpacity
                            onPress={() => setLocation('')}
                            activeOpacity={0.7}
                            className={`px-4 py-2.5 rounded-full border mr-2 mb-2 ${location === '' ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-50 border-slate-100'}`}
                        >
                            <Text className={`text-xs font-bold ${location === '' ? 'text-white' : 'text-slate-600'}`}>All</Text>
                        </TouchableOpacity>
                        {['Amstelveen', 'Amsterdam', 'Eindhoven', 'Rotterdam', 'The Hague', 'Utrecht'].sort().map(city => (
                            <TouchableOpacity
                                key={city}
                                onPress={() => setLocation(city)}
                                activeOpacity={0.7}
                                className={`px-4 py-2.5 rounded-full border mr-2 mb-2 ${location === city ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-50 border-slate-100'}`}
                            >
                                <Text className={`text-xs font-bold ${location === city ? 'text-white' : 'text-slate-600'}`}>{city}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Actions - RESTORED TO INDIGO STYLE */}
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
