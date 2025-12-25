import { Tabs } from 'expo-router';
import { Calendar, Home, MessageCircle, ShoppingBag, Users } from 'lucide-react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopColor: '#e2e8f0',
                    height: 80,
                    paddingBottom: 20,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: '#4f46e5', // indigo-600
                tabBarInactiveTintColor: '#94a3b8', // slate-400
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: 'bold',
                    marginTop: 0,
                },
                tabBarShowLabel: true,
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Home color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="communities"
                options={{
                    title: 'Communities',
                    tabBarIcon: ({ color }) => <Users color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="events"
                options={{
                    title: 'Events',
                    tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="market"
                options={{
                    title: 'Marketplace',
                    tabBarIcon: ({ color }) => <ShoppingBag color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'Inbox', // Renamed from Messages
                    tabBarIcon: ({ color }) => <MessageCircle color={color} size={24} />,
                }}
            />

            {/* Hidden Tabs */}
            <Tabs.Screen
                name="directory"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
        </Tabs>
    );
}
