import React from 'react';
import { ScrollView, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface FilterItem {
    id: string;
    label: string;
}

interface FilterPillsProps {
    items: FilterItem[] | string[];
    selectedId: string;
    onSelect: (id: string) => void;
    contentContainerStyle?: ViewStyle;
    className?: string;
}

export function FilterPills({
    items,
    selectedId,
    onSelect,
    contentContainerStyle,
    className
}: FilterPillsProps) {

    const data = items.map(item =>
        typeof item === 'string' ? { id: item, label: item } : item
    );

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className={className}
            contentContainerStyle={[{ paddingHorizontal: 24, gap: 8 }, contentContainerStyle]}
        >
            {data.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    onPress={() => onSelect(item.id)}
                    className={`px-4 py-2 rounded-full border ${selectedId === item.id ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
                >
                    <Text className={`font-bold text-xs ${selectedId === item.id ? 'text-white' : 'text-slate-600'}`}>
                        {item.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
