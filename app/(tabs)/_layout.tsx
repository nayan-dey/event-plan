// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Bookmark, Calendar, User } from "lucide-react-native";
import { useWindowDimensions } from "react-native";

export default function TabLayout() {
  const {width} = useWindowDimensions();
  const [foreground, muted, surface] = useThemeColor([
    "foreground",
    "muted",
    "surface",
  ]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: foreground,
        tabBarInactiveTintColor: muted,
        tabBarShowLabel: false,
        tabBarItemStyle:{
      alignItems:"center",
      justifyContent:"center",
      paddingTop: 12, // Push icons down
        },

        tabBarStyle: {
          alignItems: "center",
          justifyContent: "center",
          left: 24,
          right: 24,
          bottom:10,
          backgroundColor: surface,
          borderRadius: 16,
          paddingTop: 8, // Add this
          height: 64,
          borderTopWidth: 0,
          width:width -34,
          alignSelf:"center",
       
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Events",
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
    
      <Tabs.Screen
        name="my-events"
        options={{
          title: "My Events",
          tabBarIcon: ({ color }) => <Bookmark size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen name="program/[id]" options={{ href: null }} />
      <Tabs.Screen name="team/[id]" options={{ href: null }} />
      <Tabs.Screen name="team/create" options={{ href: null }} />
    </Tabs>
  );
}