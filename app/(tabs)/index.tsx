import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Card, useThemeColor } from "heroui-native";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const user = useQuery(api.users.current);
  const insets = useSafeAreaInsets();
  const muted = useThemeColor("muted");

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32 }}
    >
      <View className="px-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-muted text-base">Welcome back,</Text>
          <Text className="text-foreground text-2xl font-semibold">
            {user?.firstName || "Guest"}
          </Text>
        </View>

        {/* Event Banner */}
        <Card className="mb-6 p-5">
          <Card.Body>
            <Text className="text-lg font-semibold text-foreground mb-1">
              Saraswati Puja 2025
            </Text>
            <Text className="text-muted text-sm mb-4">
              4 days of competitions and celebrations
            </Text>
            <View className="flex-row gap-4">
              <View className="flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={16} color={muted} />
                <Text className="text-muted text-sm">4 Days</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="trophy-outline" size={16} color={muted} />
                <Text className="text-muted text-sm">20+ Events</Text>
              </View>
            </View>
          </Card.Body>
        </Card>

        {/* Quick Actions */}
        <Text className="text-foreground font-medium mb-3">Quick Actions</Text>
        <View className="gap-3">
          <Card className="p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-accent/20 items-center justify-center">
                  <Ionicons name="calendar" size={20} color={muted} />
                </View>
                <View>
                  <Text className="text-foreground font-medium">View Schedule</Text>
                  <Text className="text-muted text-sm">See all programs</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={muted} />
            </View>
          </Card>

          <Card className="p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-accent/20 items-center justify-center">
                  <Ionicons name="person" size={20} color={muted} />
                </View>
                <View>
                  <Text className="text-foreground font-medium">My Registrations</Text>
                  <Text className="text-muted text-sm">0 programs</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={muted} />
            </View>
          </Card>

          <Card className="p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-accent/20 items-center justify-center">
                  <Ionicons name="stats-chart" size={20} color={muted} />
                </View>
                <View>
                  <Text className="text-foreground font-medium">My Stats</Text>
                  <Text className="text-muted text-sm">View your performance</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={muted} />
            </View>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}