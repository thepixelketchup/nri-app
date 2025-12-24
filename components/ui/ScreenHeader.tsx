import { useRouter } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    backIcon?: 'chevron' | 'close';
    rightElement?: React.ReactNode;
    className?: string;
}

export function ScreenHeader({
    title,
    subtitle,
    onBack,
    backIcon = 'chevron',
    rightElement,
    className
}: ScreenHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View className={`px-6 pt-4 pb-2 bg-white flex-row justify-between items-start ${className}`}>
            <View className="flex-1 mr-4">
                <Text className="text-4xl font-extrabold text-slate-900 tracking-tighter">
                    {title}
                </Text>
                {subtitle && (
                    <Text className="text-slate-500 font-medium text-base mt-1">
                        {subtitle}
                    </Text>
                )}
            </View>

            <View className="flex-row items-center gap-2">
                {rightElement}

                {onBack && (
                    <TouchableOpacity
                        onPress={handleBack}
                        className={`w-10 h-10 rounded-full items-center justify-center ${backIcon === 'close' ? 'bg-slate-100 mt-1' : 'bg-slate-50 border border-slate-100 mt-1.5'}`}
                    >
                        {backIcon === 'close' ? (
                            <X size={20} color="#64748b" />
                        ) : (
                            <ChevronLeft size={24} color="#64748b" />
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
