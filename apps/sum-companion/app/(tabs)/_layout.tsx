import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// React version mismatch workaround (sum-companion 19.0 vs monorepo root 19.2)
const Icon = Ionicons as unknown as React.ComponentType<{
  name: string;
  size: number;
  color: string;
}>;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#06b6d4' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: '#06b6d4',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '일기',
          tabBarIcon: ({ color, size }) => (
            <Icon name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
