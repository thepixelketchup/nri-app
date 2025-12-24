import { useRouter } from 'expo-router';
import { ChevronLeft, Euro, FileText, Flag, GraduationCap, Heart, Megaphone } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GUIDE_CATEGORIES = {
    'Start Here': { icon: Flag, color: 'bg-green-100', iconColor: '#16a34a', desc: 'Rules & getting started' },
    'Official Updates': { icon: Megaphone, color: 'bg-red-100', iconColor: '#dc2626', desc: 'News from admins' },
    'Visas & IND': { icon: FileText, color: 'bg-blue-100', iconColor: '#2563eb', desc: 'HSM, 30% Ruling, Dependent visas' },
    'Tax & Finance': { icon: Euro, color: 'bg-yellow-100', iconColor: '#ca8a04', desc: 'Box 3, ZZP, Money transfer' },
    'Health & GP': { icon: Heart, color: 'bg-pink-100', iconColor: '#db2777', desc: 'Doctors, Insurance, Eigen Risico' },
    'Schools': { icon: GraduationCap, color: 'bg-purple-100', iconColor: '#9333ea', desc: 'International vs Dutch schools' },
};

export default function GuidesScreen() {
    const router = useRouter();
    return (
        <View className="flex-1 bg-slate-50">
            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-4 py-3 border-b border-slate-100 flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
                        <ChevronLeft size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-900">Dutch Survival Kit</Text>
                </View>
            </SafeAreaView>

            <ScrollView className="p-4">
                <View className="flex-row flex-wrap justify-between">
                    {Object.entries(GUIDE_CATEGORIES).map(([key, data]) => {
                        const Icon = data.icon;
                        return (
                            <TouchableOpacity
                                key={key}
                                onPress={() => router.push(`/guides/${encodeURIComponent(key)}`)}
                                className="w-[48%] bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4 active:scale-95 transition-transform"
                            >
                                <View className={`w-10 h-10 rounded-full items-center justify-center ${data.color} mb-3`}>
                                    <Icon size={20} color={data.iconColor} />
                                </View>
                                <Text className="font-bold text-slate-900 text-sm mb-1">{key}</Text>
                                <Text className="text-xs text-slate-500 leading-4">{data.desc}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}
