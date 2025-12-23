import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flag, Megaphone, FileText, Euro, Heart, GraduationCap } from 'lucide-react-native';

const GUIDE_CATEGORIES = {
    'Start Here': { icon: Flag, color: 'bg-green-100', iconColor: '#16a34a', desc: 'Rules & getting started' },
    'Official Updates': { icon: Megaphone, color: 'bg-red-100', iconColor: '#dc2626', desc: 'News from admins' },
    'Visas & IND': { icon: FileText, color: 'bg-blue-100', iconColor: '#2563eb', desc: 'HSM, 30% Ruling, Dependent visas' },
    'Tax & Finance': { icon: Euro, color: 'bg-yellow-100', iconColor: '#ca8a04', desc: 'Box 3, ZZP, Money transfer' },
    'Health & GP': { icon: Heart, color: 'bg-pink-100', iconColor: '#db2777', desc: 'Doctors, Insurance, Eigen Risico' },
    'Schools': { icon: GraduationCap, color: 'bg-purple-100', iconColor: '#9333ea', desc: 'International vs Dutch schools' },
};

export default function GuidesScreen() {
    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <View className="px-4 py-3 bg-white border-b border-slate-100">
                <Text className="text-xl font-bold text-slate-900">Dutch Survival Kit</Text>
            </View>

            <ScrollView className="p-4">
                <View className="flex-row flex-wrap justify-between">
                    {Object.entries(GUIDE_CATEGORIES).map(([key, data]) => {
                        const Icon = data.icon;
                        return (
                            <TouchableOpacity key={key} className="w-[48%] bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
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
        </SafeAreaView>
    );
}
