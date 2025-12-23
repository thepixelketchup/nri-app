import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar as CalendarIcon, Check, MapPin, MessageCircle, Share2 } from 'lucide-react-native';
import { Alert, Platform, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatContext } from 'stream-chat-expo';
import { STRINGS } from '../../constants/Strings';
import { useAuth } from '../../context/AuthContext';

export default function EventSuccessScreen() {
    const router = useRouter();
    const { id, title, date, location, imageUrl } = useLocalSearchParams<{
        id: string; title: string; date: string; location: string; imageUrl: string;
    }>();
    const { client } = useChatContext();
    const { user } = useAuth();
    const { top } = useSafeAreaInsets();

    const eventDate = new Date(date!);
    const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000);

    const handleCalendar = async () => {
        try {
            const { status } = await Calendar.requestCalendarPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(STRINGS.EVENTS.SUCCESS.CALENDAR.PERM_TITLE, STRINGS.EVENTS.SUCCESS.CALENDAR.PERM_MSG);
                return;
            }

            const defaultCalendarSource = Platform.OS === 'ios'
                ? await getDefaultCalendarSource()
                : { isLocalAccount: true, name: 'Expo Calendar' };

            let calendarId;

            if (Platform.OS === 'ios') {
                const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
                const defaultCalendar = calendars.find(c => c.source.name === 'Default' || c.isPrimary);
                calendarId = defaultCalendar ? defaultCalendar.id : calendars[0]?.id;
            } else {
                const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
                const writable = calendars.find(c => c.accessLevel === Calendar.CalendarAccessLevel.OWNER || c.accessLevel === Calendar.CalendarAccessLevel.CONTRIBUTOR);
                calendarId = writable?.id;
            }

            if (!calendarId) {
                Alert.alert(STRINGS.EVENTS.SUCCESS.CALENDAR.ERROR_TITLE, STRINGS.EVENTS.SUCCESS.CALENDAR.NO_WRITABLE);
                return;
            }

            await Calendar.createEventAsync(calendarId, {
                title: title,
                startDate: eventDate,
                endDate: endDate,
                location: location,
                timeZone: 'Europe/Amsterdam',
            });

            Alert.alert(STRINGS.EVENTS.SUCCESS.CALENDAR.SUCCESS_TITLE, STRINGS.EVENTS.SUCCESS.CALENDAR.SUCCESS_MSG);
        } catch (e: any) {
            console.log(e);
            Alert.alert(STRINGS.EVENTS.SUCCESS.CALENDAR.ERROR_TITLE, STRINGS.EVENTS.SUCCESS.CALENDAR.FAIL_PREFIX + e.message);
        }
    };

    async function getDefaultCalendarSource() {
        const defaultCalendar = await Calendar.getDefaultCalendarAsync();
        return defaultCalendar.source;
    }

    const handleShare = async () => {
        try {
            const dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            await Share.share({
                message: STRINGS.EVENTS.SUCCESS.SHARE_MESSAGE(title, dateStr, timeStr, location),
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleJoinChat = async () => {
        if (!client || !user) return;
        try {
            const channel = client.channel('messaging', `event-${id}`, {
                name: title,
                image: imageUrl,
                members: [user.uid],
                type: 'event_chat'
            } as any);
            await channel.watch();
            router.push('/(tabs)/messages');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Hero Image (Consistent with Event Details) */}
                <View className="h-72 w-full relative">
                    <Image
                        source={{ uri: imageUrl || 'https://via.placeholder.com/400' }}
                        className="w-full h-full"
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={500}
                    />
                    <View
                        className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/60 to-transparent flex-row justify-between items-start px-4"
                        style={{ paddingTop: top + 10 }}
                    >
                        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full items-center justify-center border border-white/10">
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content Card */}
                <View className="px-5 -mt-6 bg-white rounded-t-3xl pt-8">

                    {/* Success Badge */}
                    <View className="bg-green-100 self-start px-4 py-2 rounded-full flex-row items-center gap-2 mb-6 border border-green-200">
                        <View className="bg-green-500 rounded-full p-0.5">
                            <Check size={12} color="white" strokeWidth={4} />
                        </View>
                        <Text className="text-green-700 font-bold text-sm uppercase tracking-wide">{STRINGS.EVENTS.SUCCESS.CONFIRMED}</Text>
                    </View>

                    <Text className="text-3xl font-extrabold text-slate-900 leading-tight mb-2">
                        {STRINGS.EVENTS.SUCCESS.TITLE(title)}
                    </Text>
                    <Text className="text-slate-500 text-lg mb-8">
                        {STRINGS.EVENTS.SUCCESS.SUBTITLE}
                    </Text>

                    {/* Info Grid (Consistent with Details) */}
                    <View className="flex-col gap-1 mb-10">
                        {/* Date & Time */}
                        <View className="flex-row items-center gap-4">
                            <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
                                <CalendarIcon size={20} color="#4f46e5" />
                            </View>
                            <View>
                                <Text className="text-slate-900 font-bold text-base">
                                    {eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </Text>
                                <Text className="text-slate-500 text-sm">
                                    {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>

                        {/* Location */}
                        <View className="flex-row items-center gap-4">
                            <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
                                <MapPin size={20} color="#4f46e5" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 font-bold text-base">{location}</Text>
                                <Text className="text-slate-500 text-sm">{STRINGS.EVENTS.DETAILS.VIEW_ON_MAP}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <Text className="text-lg font-bold text-slate-900 mb-4">{STRINGS.EVENTS.SUCCESS.NEXT_STEPS_TITLE}</Text>
                    <View className="gap-3">
                        <TouchableOpacity onPress={handleCalendar} className="bg-white border border-slate-200 py-4 px-4 rounded-xl flex-row items-center gap-4 shadow-sm active:bg-slate-50">
                            <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
                                <CalendarIcon size={20} color="#4f46e5" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-slate-900 text-base">{STRINGS.EVENTS.SUCCESS.ADD_CALENDAR_TITLE}</Text>
                                <Text className="text-slate-500 text-sm">{STRINGS.EVENTS.SUCCESS.ADD_CALENDAR_SUBTITLE}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleShare} className="bg-white border border-slate-200 py-4 px-4 rounded-xl flex-row items-center gap-4 shadow-sm active:bg-slate-50">
                            <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
                                <Share2 size={20} color="#4f46e5" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-slate-900 text-base">{STRINGS.EVENTS.SUCCESS.INVITE_TITLE}</Text>
                                <Text className="text-slate-500 text-sm">{STRINGS.EVENTS.SUCCESS.INVITE_SUBTITLE}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleJoinChat} className="bg-indigo-600 py-4 px-4 rounded-xl flex-row items-center gap-4 shadow-md shadow-indigo-200 active:scale-[0.99]">
                            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                                <MessageCircle size={20} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-white text-base">{STRINGS.EVENTS.SUCCESS.JOIN_CHAT_TITLE}</Text>
                                <Text className="text-indigo-100 text-sm">{STRINGS.EVENTS.SUCCESS.JOIN_CHAT_SUBTITLE}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
