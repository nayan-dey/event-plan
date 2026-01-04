import { Tabs } from "expo-router";
import { Bookmark, Calendar, Home, User } from "lucide-react-native";
import { useColorScheme } from "react-native";

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#8B5CF6",
        tabBarInactiveTintColor: isDark ? "#6b6b7b" : "#9CA3AF",
        tabBarStyle: {
          backgroundColor: isDark ? "#0a0a0f" : "#ffffff",
          borderTopColor: isDark ? "#2a2a3a" : "#E5E7EB",
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-events"
        options={{
          title: "My Events",
          tabBarIcon: ({ color, size }) => <Bookmark size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen
        name="program/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="team/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="team/create"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}