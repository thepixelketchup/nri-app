import { Stack, useRouter } from 'expo-router';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Home,
    LayoutGrid,
    ShoppingBag,
    Tag,
    X,
    Sparkles,
    CheckCircle2,
    Building2,
    Bed,
    KeySquare
} from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STRINGS } from '../../constants/Strings';
import { useMarketplace } from '../../context/MarketplaceContext';

export default function MarketplaceFiltersScreen() {
    const router = useRouter();
    const { filters, setFilters } = useMarketplace();

    const [category, setCategory] = useState(filters.category);
    const [type, setType] = useState(filters.type);
    const [location, setLocation] = useState(filters.location);
    const [minPrice, setMinPrice] = useState(filters.minPrice || '');
    const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');
    const [sortBy, setSortBy] = useState(filters.sortBy || 'date_desc');
    
    // Classifieds specific
    const [condition, setCondition] = useState(filters.condition || 'all');
    
    // Housing specific
    const [housingType, setHousingType] = useState(filters.housingType || 'all');
    const [propertyType, setPropertyType] = useState(filters.propertyType || 'all');
    const [bedrooms, setBedrooms] = useState(filters.bedrooms || 'all');

    // Original Slider logic translated to filters
    const maxSliderValue = category === 'housing' ? 10000 : 1000;
    const sliderStep = category === 'housing' ? 1000 : 100;
    
    // Calculate initial slider value correctly
    const [sliderValue, setSliderValue] = useState(() => {
        if (!filters.minPrice || filters.minPrice === '0') return 0;
        return Number(filters.minPrice) + sliderStep / 10; 
    });

    const displayPrice = sliderValue === 0
                        ? `${sliderValue}`
                        : `${sliderValue - sliderStep / 10} -  ${sliderValue + sliderStep / 10}`;

    const handleApply = () => {
        let appliedMinPrice = minPrice;
        let appliedMaxPrice = maxPrice;

        if (sliderValue === 0) {
            appliedMinPrice = '0';
            appliedMaxPrice = '';
        } else {
            appliedMinPrice = (sliderValue - sliderStep / 10).toString();
            appliedMaxPrice = (sliderValue + sliderStep / 10).toString();
        }

        setFilters({ 
            category, type, location, minPrice: appliedMinPrice, maxPrice: appliedMaxPrice, sortBy, condition, housingType, propertyType, bedrooms, searchQuery: filters.searchQuery
        });
        router.back();
    };

    const handleReset = () => {
        setCategory('all');
        setType('all');
        setLocation('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('date_desc');
        setCondition('all');
        setHousingType('all');
        setPropertyType('all');
        setBedrooms('all');
        setSliderValue(0);
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
                        <FilterPill label={STRINGS.MARKETPLACE.FILTER_ALL} active={category === 'all'} icon={LayoutGrid} onPress={() => setCategory('all')} />
                        <FilterPill label={STRINGS.MARKETPLACE.FILTER_HOUSING} active={category === 'housing'} icon={Home} onPress={() => setCategory('housing')} />
                        <FilterPill label={STRINGS.MARKETPLACE.FILTER_CLASSIFIEDS} active={category === 'eclassifieds'} icon={ShoppingBag} onPress={() => setCategory('eclassifieds')} />
                    </View>
                </View>

                {/* Common General Type Section */}
                <View className="mt-8">
                    <Text className="text-[11px] font-black text-slate-400 mb-4 uppercase tracking-[2px]">
                        Listing Type
                    </Text>
                    <View className="flex-row flex-wrap">
                        <FilterPill label={STRINGS.MARKETPLACE.FILTER_ALL} active={type === 'all'} icon={Tag} onPress={() => setType('all')} />
                        <FilterPill label={STRINGS.MARKETPLACE.OFFERED_LABEL} active={type === 'offered'} icon={ArrowUpCircle} onPress={() => setType('offered')} />
                        <FilterPill label={STRINGS.MARKETPLACE.WANTED_LABEL} active={type === 'wanted'} icon={ArrowDownCircle} onPress={() => setType('wanted')} />
                    </View>
                </View>

                {/* SORT BY */}
                <View className="mt-8">
                    <Text className="text-[11px] font-black text-slate-400 mb-4 uppercase tracking-[2px]">
                        Sort By
                    </Text>
                    <View className="flex-row flex-wrap">
                        <FilterPill label="Newest first" active={sortBy === 'date_desc'} icon={Sparkles} onPress={() => setSortBy('date_desc')} />
                        <FilterPill label="Oldest first" active={sortBy === 'date_asc'} icon={Sparkles} onPress={() => setSortBy('date_asc')} />
                        <FilterPill label="Price: Low to High" active={sortBy === 'price_asc'} icon={Sparkles} onPress={() => setSortBy('price_asc')} />
                        <FilterPill label="Price: High to Low" active={sortBy === 'price_desc'} icon={Sparkles} onPress={() => setSortBy('price_desc')} />
                    </View>
                </View>

                {/* PRICE RANGE (Using Original Slider UI) */}
                <View className="mt-8">
                    <Text className="text-[11px] font-black text-slate-400 mb-4 uppercase tracking-[2px]">
                        Price Range (€)
                    </Text>
                    <View className="bg-slate-50 border border-slate-100 rounded-3xl p-5">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-3xl font-black text-slate-900 tracking-tighter">
                                € {displayPrice}
                            </Text>
                        </View>
                        <Slider
                            minimumValue={0}
                            maximumValue={maxSliderValue}
                            step={sliderStep}
                            value={sliderValue}
                            onValueChange={(val) => setSliderValue(val)}
                            minimumTrackTintColor="#4f46e5"
                            maximumTrackTintColor="#cbd5e1"
                            thumbTintColor="#4f46e5"
                            style={{ height: 30, width: '100%' }}
                        />
                    </View>
                </View>

                {/* HOUSING SPECIFIC */}
                {category === 'housing' && (
                    <>
                        <View className="mt-8">
                            <Text className="text-[11px] font-black text-slate-400 mb-4 uppercase tracking-[2px]">
                                Housing Type
                            </Text>
                            <View className="flex-row flex-wrap">
                                <FilterPill label="All" active={housingType === 'all'} icon={LayoutGrid} onPress={() => setHousingType('all')} />
                                <FilterPill label="For Rent" active={housingType === 'rent'} icon={KeySquare} onPress={() => setHousingType('rent')} />
                                <FilterPill label="For Sale" active={housingType === 'sale'} icon={Building2} onPress={() => setHousingType('sale')} />
                            </View>
                        </View>

                        <View className="mt-8">
                            <Text className="text-[11px] font-black text-slate-400 mb-4 uppercase tracking-[2px]">
                                Property Type
                            </Text>
                            <View className="flex-row flex-wrap">
                                <FilterPill label="All" active={propertyType === 'all'} icon={LayoutGrid} onPress={() => setPropertyType('all')} />
                                <FilterPill label="Apartment" active={propertyType === 'apartment'} icon={Building2} onPress={() => setPropertyType('apartment')} />
                                <FilterPill label="House" active={propertyType === 'house'} icon={Home} onPress={() => setPropertyType('house')} />
                                <FilterPill label="Studio" active={propertyType === 'studio'} icon={Home} onPress={() => setPropertyType('studio')} />
                            </View>
                        </View>

                        <View className="mt-8">
                            <Text className="text-[11px] font-black text-slate-400 mb-4 uppercase tracking-[2px]">
                                Bedrooms
                            </Text>
                            <View className="flex-row flex-wrap">
                                <FilterPill label="Any" active={bedrooms === 'all'} icon={Bed} onPress={() => setBedrooms('all')} />
                                <FilterPill label="1" active={bedrooms === '1'} icon={Bed} onPress={() => setBedrooms('1')} />
                                <FilterPill label="2" active={bedrooms === '2'} icon={Bed} onPress={() => setBedrooms('2')} />
                                <FilterPill label="3" active={bedrooms === '3'} icon={Bed} onPress={() => setBedrooms('3')} />
                                <FilterPill label="4+" active={bedrooms === '4+'} icon={Bed} onPress={() => setBedrooms('4+')} />
                            </View>
                        </View>
                    </>
                )}

                {/* CLASSIFIEDS SPECIFIC */}
                {category === 'eclassifieds' && (
                    <View className="mt-8">
                        <Text className="text-[11px] font-black text-slate-400 mb-4 uppercase tracking-[2px]">
                            Condition
                        </Text>
                        <View className="flex-row flex-wrap">
                            <FilterPill label="All" active={condition === 'all'} icon={LayoutGrid} onPress={() => setCondition('all')} />
                            <FilterPill label="New" active={condition === 'new'} icon={Sparkles} onPress={() => setCondition('new')} />
                            <FilterPill label="Like New" active={condition === 'like_new'} icon={CheckCircle2} onPress={() => setCondition('like_new')} />
                            <FilterPill label="Used" active={condition === 'used'} icon={CheckCircle2} onPress={() => setCondition('used')} />
                        </View>
                    </View>
                )}

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

            <View className="px-8 py-6 border-t border-slate-50 bg-white shadow-2xl">
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
