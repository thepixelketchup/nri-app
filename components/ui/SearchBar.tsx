import { Search, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    StyleProp,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
    /** Controlled value */
    value: string;
    /** Called on every keystroke — debouncing is handled by the consumer hook */
    onChangeText: (text: string) => void;
    placeholder?: string;
    /** Style applied to the outer wrapper View */
    wrapperStyle?: StyleProp<ViewStyle>;
}

/**
 * Universal search bar component.
 * Handles focus styling, the search icon, and a clear (×) button.
 * Drop into any screen that needs a search input; pair with
 * `useMarketplaceSearch` (or a similar hook) for debounced fuzzy filtering.
 */
export function SearchBar({
    value,
    onChangeText,
    placeholder = 'Search…',
    wrapperStyle,
    ...textInputProps
}: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={wrapperStyle}>
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
                    returnKeyType="search"
                    autoCorrect={false}
                    autoCapitalize="none"
                    clearButtonMode="never"
                    {...textInputProps}
                />

                {value.length > 0 && (
                    <TouchableOpacity
                        onPress={() => onChangeText('')}
                        style={{ padding: 4 }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <XCircle size={18} color="#94a3b8" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
