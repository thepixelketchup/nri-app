import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebaseConfig'; // Keep Firebase for persistence if needed or remove if pure Stream

export default function AddGuidePostScreen() {
    const router = useRouter();
    const { initialCategory, initialType } = useLocalSearchParams();
    const { user, feedClient } = useAuth();

    // Default to the passed category or empty
    const [category, setCategory] = useState<string>(initialCategory ? String(initialCategory) : '');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [posting, setPosting] = useState(false);

    // Hardcoded type
    const postType = 'guide';

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handlePost = async () => {
        if (!title || !description || !category) {
            Alert.alert('Missing Fields', 'Please fill in Title, Description and Category.');
            return;
        }

        setPosting(true);
        try {
            // 1. Prepare Data
            const postData = {
                actor: user ? `user:${user.uid}` : 'user:guest',
                verb: 'post',
                object: `guide:${Date.now()}`,
                type: postType,
                title,
                description,
                category,
                imageUrl: image,
                host: user?.displayName || 'Anonymous',
                time: new Date().toISOString(),
            };

            // 2. Publish to Stream Feeds
            if (feedClient) {
                // Add to 'user:global' for Home Feed
                const userFeed = feedClient.feed('user', 'global');
                await userFeed.addActivity(postData);

                // Add to 'timeline:guide_[category]' for Guide Feed
                const slugCategory = category.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
                const guideFeed = feedClient.feed('timeline', `guide_${slugCategory}`);
                await guideFeed.addActivity(postData);
            }

            // 3. Persist to Firestore (Optional but recommended for backup/search)
            // We use 'market' collection for guides as per previous schema
            await addDoc(collection(db, 'public', 'data', 'market'), {
                ...postData,
                marketType: 'guide',
                createdAt: serverTimestamp(),
            });

            Alert.alert('Success', 'Guide posted successfully!');
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to create post. Please try again.');
        } finally {
            setPosting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 py-3 border-b border-slate-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-slate-500 text-base">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-900">New Guide</Text>
                <TouchableOpacity onPress={handlePost} disabled={posting}>
                    {posting ? <ActivityIndicator color="#4f46e5" /> : <Text className="text-indigo-600 font-bold text-base">Post</Text>}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1 p-4">
                    {/* Image Picker */}
                    <TouchableOpacity onPress={pickImage} className="w-full h-48 bg-slate-50 rounded-xl border border-dashed border-slate-300 items-center justify-center mb-6 overflow-hidden">
                        {image ? (
                            <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <View className="items-center">
                                <Ionicons name="image-outline" size={32} color="#94a3b8" />
                                <Text className="text-slate-400 mt-2 font-medium">Add Cover Image</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Title */}
                    <Text className="text-xs font-bold text-slate-500 uppercase mb-2">Title</Text>
                    <TextInput
                        className="bg-slate-50 p-4 rounded-xl text-slate-900 text-base mb-4 font-semibold"
                        placeholder="What is this guide about?"
                        placeholderTextColor="#cbd5e1"
                        value={title}
                        onChangeText={setTitle}
                    />

                    {/* Category (Read-only if passed, or editable if generic) */}
                    <Text className="text-xs font-bold text-slate-500 uppercase mb-2">Category</Text>
                    <TextInput
                        className="bg-slate-100 p-4 rounded-xl text-slate-500 text-base mb-4"
                        value={category}
                        editable={!initialCategory} // Lock if passed from category screen
                        onChangeText={setCategory}
                    />

                    {/* Description */}
                    <Text className="text-xs font-bold text-slate-500 uppercase mb-2">Content</Text>
                    <TextInput
                        className="bg-slate-50 p-4 rounded-xl text-slate-900 text-base min-h-[150px]"
                        placeholder="Write your guide content here..."
                        placeholderTextColor="#cbd5e1"
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
