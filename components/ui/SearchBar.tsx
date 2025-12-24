import { Search, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    containerStyle?: ViewStyle;
    className?: string;
}

export function SearchBar({
    value,
    onChangeText,
    placeholder = "Search...",
    containerStyle,
    className
}: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View className={`px-6 py-2 ${className}`} style={containerStyle}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    height: 52,
                    borderWidth: 1,
                    backgroundColor: isFocused ? 'white' : '#f8fafc',
                    borderColor: isFocused ? '#818cf8' : '#f1f5f9',
                }}
            >
                <Search
                    size={18}
                    color={isFocused ? '#4f46e5' : '#94a3b8'}
                    strokeWidth={isFocused ? 2.5 : 2}
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
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {value.length > 0 && (
                    <TouchableOpacity
                        onPress={() => onChangeText('')}
                        style={{ padding: 4 }}
                    >
                        <XCircle size={18} color="#94a3b8" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
