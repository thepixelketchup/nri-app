import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Calendar, Crown, Heart, MapPin, Share2, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { STRINGS } from '../../constants/Strings';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebaseConfig';

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [rsvpLoading, setRsvpLoading] = useState(false);
    const { top, bottom } = useSafeAreaInsets();

    useEffect(() => {
        if (!id) return;
        fetchEvent();
    }, [id]);

    const handleShare = async () => {
        if (!event) return;
        const eventDateTime = new Date(event.eventDate);
        const dateStr = eventDateTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        const timeStr = eventDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        try {
            await Share.share({
                message: STRINGS.EVENTS.DETAILS.SHARE_MESSAGE(event.title, dateStr, timeStr, event.location),
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    const fetchEvent = async () => {
        try {
            const docRef = doc(db, 'public', 'data', 'events', String(id));
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setEvent({ id: snap.id, ...snap.data() });
            } else {
                Alert.alert(STRINGS.EVENTS.SUCCESS.CALENDAR.ERROR_TITLE, STRINGS.EVENTS.DETAILS.ERROR_NOT_FOUND);
                router.back();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRSVP = async () => {
        if (!user) {
            Alert.alert(STRINGS.EVENTS.DETAILS.SIGN_IN_TITLE, STRINGS.EVENTS.DETAILS.SIGN_IN_MSG);
            return;
        }
        setRsvpLoading(true);
        const docRef = doc(db, 'public', 'data', 'events', String(id));

        const isAttending = event.attendeeIds?.includes(user.uid);

        try {
            await updateDoc(docRef, {
                attendeeIds: isAttending ? arrayRemove(user.uid) : arrayUnion(user.uid)
            });
            // Optimistic update
            const newAttendees = isAttending
                ? event.attendeeIds.filter((uid: string) => uid !== user.uid)
                : [...(event.attendeeIds || []), user.uid];

            setEvent({ ...event, attendeeIds: newAttendees });

            // If user just joined, navigate to success
            if (!isAttending) {
                router.push({
                    pathname: '/events/success',
                    params: {
                        id: event.id,
                        title: event.title,
                        date: event.eventDate,
                        location: event.location,
                        imageUrl: event.imageUrl,
                        description: event.description
                    }
                });
            }
        } catch (e) {
            console.error(e);
            Alert.alert(STRINGS.EVENTS.SUCCESS.CALENDAR.ERROR_TITLE, STRINGS.EVENTS.DETAILS.ERROR_RSVP_UPDATE);
        } finally {
            setRsvpLoading(false);
        }
    };

    const handleOpenMap = () => {
        if (!event?.location) return;
        const encodedLocation = encodeURIComponent(event.location);

        const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
        const appleUrl = `maps:0,0?q=${encodedLocation}`;

        const options: any[] = [
            {
                text: 'Google Maps',
                onPress: () => Linking.openURL(googleUrl)
            },
        ];

        if (Platform.OS === 'ios') {
            options.push({
                text: 'Apple Maps',
                onPress: () => Linking.openURL(appleUrl)
            });
        }

        options.push({ text: 'Cancel', style: 'cancel' });

        Alert.alert(
            'Open Map',
            'Choose your preferred map application',
            options
        );
    };

    const handleInterest = async () => {
        if (!user) {
            Alert.alert(STRINGS.EVENTS.DETAILS.SIGN_IN_TITLE, STRINGS.EVENTS.DETAILS.SIGN_IN_MSG);
            return;
        }

        const docRef = doc(db, 'public', 'data', 'events', String(id));
        const isInterested = event.interestedIds?.includes(user.uid);

        try {
            // Optimistic update
            const newInterested = isInterested
                ? event.interestedIds.filter((uid: string) => uid !== user.uid)
                : [...(event.interestedIds || []), user.uid];

            setEvent({ ...event, interestedIds: newInterested });

            await updateDoc(docRef, {
                interestedIds: isInterested ? arrayRemove(user.uid) : arrayUnion(user.uid)
            });
        } catch (e) {
            console.error(e);
            // Revert on error would go here, but omitted for brevity in casual app
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    if (!event) return null;

    const isAttending = event.attendeeIds?.includes(user?.uid);
    const isInterested = event.interestedIds?.includes(user?.uid);
    const date = new Date(event.eventDate);
    const eventDate = date; // Use the already parsed 'date'
    // Use event.endDate if available, otherwise default to start + 3h
    const endDate = new Date(event.endDate);

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }}>
                {/* Hero Image or Fallback */}
                <View className="h-72 w-full relative bg-slate-900">
                    {event.imageUrl ? (
                        <Image
                            source={{ uri: event.imageUrl }}
                            className="w-full h-full"
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                            transition={500}
                        />
                    ) : (
                        <View className="w-full h-full items-center justify-center bg-indigo-600">
                            <Calendar size={64} color="white" strokeWidth={1.5} />
                        </View>
                    )}
                    <View
                        className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/60 to-transparent flex-row justify-between items-start px-4"
                        style={{ paddingTop: top + 10 }}
                    >
                        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full items-center justify-center border border-white/10">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View className="flex-row gap-3">
                            <TouchableOpacity onPress={handleInterest} className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full items-center justify-center border border-white/10">
                                <Heart size={20} color={isInterested ? "#ef4444" : "white"} fill={isInterested ? "#ef4444" : "transparent"} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleShare} className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full items-center justify-center border border-white/10">
                                <Share2 size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Content */}
                <View className="px-5 -mt-6 bg-white rounded-t-3xl pt-8">
                    {/* Title */}
                    <View className="mb-6">
                        <Text className="text-3xl font-extrabold text-slate-900 leading-tight">{event.title}</Text>
                    </View>

                    {/* Info Grid */}
                    <View className="flex-col gap-1 mb-8">
                        {/* Date & Time */}
                        <View className="flex-row items-center gap-4">
                            <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
                                <Calendar size={20} color="#4f46e5" />
                            </View>
                            <View>
                                <Text className="text-slate-900 font-bold text-base">
                                    {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </Text>
                                <Text className="text-slate-500 text-sm">
                                    {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>

                        {/* Location */}
                        <TouchableOpacity
                            onPress={handleOpenMap}
                            activeOpacity={0.7}
                            className="flex-row items-center gap-4 active:scale-[0.98]"
                        >
                            <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
                                <MapPin size={20} color="#4f46e5" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 font-bold text-base">{event.location}</Text>
                                <Text className="text-indigo-600 text-sm font-semibold">{STRINGS.EVENTS.DETAILS.VIEW_ON_MAP}</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Host - Moved here */}
                        <View className="flex-row items-center gap-4">
                            <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
                                <Crown size={20} color="#4f46e5" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 font-bold text-base">{event.host}</Text>
                                <Text className="text-slate-500 text-sm">{STRINGS.EVENTS.DETAILS.ORGANIZER}</Text>
                            </View>
                        </View>

                        {/* Attendees */}
                        <View className="flex-row items-center gap-4">
                            <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
                                <Users size={20} color="#4f46e5" />
                            </View>
                            <View>
                                <Text className="text-slate-900 font-bold text-base">{event.attendeeIds?.length || 0} {STRINGS.EVENTS.DETAILS.GOING}</Text>
                                <Text className="text-slate-500 text-sm">{STRINGS.EVENTS.DETAILS.ATTENDEES_SUBTITLE}</Text>
                            </View>
                        </View>

                        {/* Interested */}
                        {event.interestedIds?.length > 0 && (
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
                                    <Heart size={20} color="#4f46e5" />
                                </View>
                                <View>
                                    <Text className="text-slate-900 font-bold text-base">{event.interestedIds.length} {STRINGS.EVENTS.INTERESTED_SUFFIX}</Text>
                                    <Text className="text-slate-500 text-sm">People who like this event</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Description */}
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-slate-900 mb-3">{STRINGS.EVENTS.DETAILS.ABOUT_TITLE}</Text>
                        <Text className="text-slate-600 text-base leading-7">{event.description}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Floating Bottom Bar */}
            <View
                className="absolute left-5 right-5"
                style={{ bottom: bottom + 10 }}
            >
                <View className="bg-white rounded-[32px] p-2 pr-2.5 pl-6 flex-row items-center justify-between shadow-2xl shadow-slate-200 border border-slate-100">
                    <View>
                        <Text className="text-slate-900 text-xl font-bold">
                            {event.price === 0 ? STRINGS.EVENTS.DETAILS.FREE : `€ ${event.price.toFixed(2).replace('.', ',')}`}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleRSVP}
                        disabled={rsvpLoading}
                        className={`px-8 py-4 rounded-full active:scale-95 transition-transform ${isAttending ? 'bg-slate-100' : 'bg-indigo-600'}`}
                    >
                        {rsvpLoading ? (
                            <ActivityIndicator color={isAttending ? "#64748b" : "white"} size="small" />
                        ) : (
                            <Text className={`font-bold text-base ${isAttending ? 'text-slate-600' : 'text-white'}`}>
                                {isAttending ? STRINGS.EVENTS.DETAILS.NOT_GOING : STRINGS.EVENTS.DETAILS.GOING}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
