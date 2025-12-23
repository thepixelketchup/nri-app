import { Tabs } from 'expo-router';
import { BookOpen, Calendar, Home, MessagesSquare, ShoppingBag, Store, Users2 } from 'lucide-react-native';

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
                    marginTop: -5,
                },
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
                name="guides"
                options={{
                    title: 'Guides',
                    tabBarIcon: ({ color }) => <BookOpen color={color} size={24} />,
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
                    title: 'Market',
                    tabBarIcon: ({ color }) => <ShoppingBag color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="directory"
                options={{
                    title: 'Stores',
                    tabBarIcon: ({ color }) => <Store color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="communities"
                options={{
                    title: 'Hubs',
                    tabBarIcon: ({ color }) => <Users2 color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'Chats',
                    tabBarIcon: ({ color }) => <MessagesSquare color={color} size={24} />,
                }}
            />
        </Tabs>
    );
}
