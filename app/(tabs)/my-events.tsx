import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Calendar, ChevronRight, Clock, MapPin, Music, Ticket, Users } from "lucide-react-native";
import { useCallback, useMemo } from "react";
import { Image, Pressable, ScrollView, Text, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Registration = {
  _id: Id<"registrations">;
  programId: Id<"programs">;
  status: string;
  songLink?: string;
  songTitle?: string;
  registeredAt: number;
  teamId?: Id<"teams">;
  program?: {
    _id: Id<"programs">;
    name: string;
    description?: string;
    day: number;
    time: string;
    venue?: string;
    category: string;
    imageUrl?: string;
    isTeamEvent: boolean;
  } | null;
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  registered: { color: "#10B981", bg: "rgba(16, 185, 129, 0.15)", label: "Registered" },
  waitlist: { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)", label: "Waitlist" },
  checked_in: { color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.15)", label: "Checked In" },
  qualified: { color: "#10B981", bg: "rgba(16, 185, 129, 0.15)", label: "Qualified" },
  disqualified: { color: "#EF4444", bg: "rgba(239, 68, 68, 0.15)", label: "Disqualified" },
  cancelled: { color: "#6B7280", bg: "rgba(107, 114, 128, 0.15)", label: "Cancelled" },
};

export default function MyEventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const myRegistrations = useQuery(api.registrations.myRegistrations);
  const myTeams = useQuery(api.teams.myTeams);

  const groupedByDay = useMemo(() => {
    if (!myRegistrations) return { 1: [], 2: [], 3: [] };

    const grouped: Record<number, Registration[]> = { 1: [], 2: [], 3: [] };

    for (const reg of myRegistrations) {
      const day = reg.program?.day || 1;
      if (grouped[day]) {
        grouped[day].push(reg as Registration);
      }
    }

    return grouped;
  }, [myRegistrations]);

  const totalEvents = useMemo(() => {
    return (myRegistrations?.length || 0) + (myTeams?.length || 0);
  }, [myRegistrations, myTeams]);

  const handleEventPress = useCallback(
    (programId: Id<"programs">) => {
      router.push(`/(tabs)/program/${programId}`);
    },
    [router]
  );

  const handleTeamPress = useCallback(
    (teamId: Id<"teams">) => {
      router.push(`/(tabs)/team/${teamId}`);
    },
    [router]
  );

  // Theme colors
  const colors = {
    bg: isDark ? "#0a0a0f" : "#f5f5f7",
    surface: isDark ? "#13131a" : "#ffffff",
    card: isDark ? "#1a1a24" : "#ffffff",
    border: isDark ? "#2a2a3a" : "#e5e5ea",
    text: isDark ? "#ffffff" : "#1c1c1e",
    textSecondary: isDark ? "#a0a0b0" : "#3a3a3c",
    muted: isDark ? "#6b6b7b" : "#8e8e93",
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text style={{ color: colors.text }} className="text-2xl font-bold">
          My Events
        </Text>
        <Text style={{ color: colors.muted }} className="text-sm mt-1">
          {totalEvents} events registered
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View className="flex-row gap-3 mb-6">
          <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="flex-1 p-4 rounded-2xl border">
            <View className="flex-row items-center justify-between mb-2">
              <Ticket size={20} color="#8B5CF6" />
              <Text className="text-violet-500 text-2xl font-bold">{myRegistrations?.length || 0}</Text>
            </View>
            <Text style={{ color: colors.muted }} className="text-xs">Individual Events</Text>
          </View>
          <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="flex-1 p-4 rounded-2xl border">
            <View className="flex-row items-center justify-between mb-2">
              <Users size={20} color="#3B82F6" />
              <Text className="text-blue-500 text-2xl font-bold">{myTeams?.length || 0}</Text>
            </View>
            <Text style={{ color: colors.muted }} className="text-xs">Team Events</Text>
          </View>
        </View>

        {/* Team Events */}
        {myTeams && myTeams.length > 0 && (
          <View className="mb-6">
            <Text style={{ color: colors.text }} className="font-semibold mb-3">
              Team Events
            </Text>
            <View className="gap-3">
              {myTeams.map((team) => (
                <Pressable
                  key={team._id}
                  onPress={() => handleTeamPress(team._id)}
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
                  className="rounded-2xl p-4 border"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View
                          style={{
                            backgroundColor: team.status === "registered" ? "rgba(16, 185, 129, 0.15)" : "rgba(139, 92, 246, 0.15)"
                          }}
                          className="px-2 py-0.5 rounded-full"
                        >
                          <Text
                            style={{ color: team.status === "registered" ? "#10B981" : "#8B5CF6" }}
                            className="text-xs font-medium capitalize"
                          >
                            {team.status}
                          </Text>
                        </View>
                        <Text style={{ color: colors.muted }} className="text-xs">
                          {team.memberCount} members
                        </Text>
                      </View>
                      <Text style={{ color: colors.text }} className="font-semibold text-base">
                        {team.name}
                      </Text>
                      <Text style={{ color: colors.muted }} className="text-sm">
                        {team.program?.name}
                      </Text>
                    </View>
                    <ChevronRight size={20} color={colors.muted} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Individual Events by Day */}
        {[1, 2, 3].map((day) => {
          const dayEvents = groupedByDay[day];
          if (dayEvents.length === 0) return null;

          return (
            <View key={day} className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <LinearGradient
                  colors={["#8B5CF6", "#6D28D9"]}
                  className="w-6 h-6 rounded-full items-center justify-center"
                >
                  <Text className="text-white text-xs font-bold">{day}</Text>
                </LinearGradient>
                <Text style={{ color: colors.text }} className="font-semibold">
                  Day {day}
                </Text>
              </View>

              <View className="gap-3">
                {dayEvents.map((reg) => {
                  const status = STATUS_CONFIG[reg.status] || STATUS_CONFIG.registered;

                  return (
                    <Pressable
                      key={reg._id}
                      onPress={() => handleEventPress(reg.programId)}
                      style={{ backgroundColor: colors.card, borderColor: colors.border }}
                      className="rounded-2xl overflow-hidden border flex-row"
                    >
                      {/* Image */}
                      <Image
                        source={{ uri: reg.program?.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200" }}
                        className="w-24 h-24"
                        resizeMode="cover"
                      />

                      {/* Content */}
                      <View className="flex-1 p-3 justify-between">
                        <View>
                          <View className="flex-row items-center gap-2 mb-1">
                            <View style={{ backgroundColor: status.bg }} className="px-2 py-0.5 rounded-full">
                              <Text style={{ color: status.color }} className="text-xs font-medium">
                                {status.label}
                              </Text>
                            </View>
                          </View>
                          <Text style={{ color: colors.text }} className="font-semibold">
                            {reg.program?.name}
                          </Text>
                        </View>

                        <View className="gap-1">
                          <View className="flex-row items-center gap-3">
                            <View className="flex-row items-center">
                              <Clock size={10} color={colors.muted} />
                              <Text style={{ color: colors.muted }} className="text-xs ml-1">
                                {reg.program?.time}
                              </Text>
                            </View>
                            {reg.program?.venue && (
                              <View className="flex-row items-center">
                                <MapPin size={10} color={colors.muted} />
                                <Text style={{ color: colors.muted }} className="text-xs ml-1">
                                  {reg.program.venue}
                                </Text>
                              </View>
                            )}
                          </View>
                          {reg.songTitle && (
                            <View className="flex-row items-center">
                              <Music size={10} color={colors.muted} />
                              <Text style={{ color: colors.muted }} className="text-xs ml-1">
                                {reg.songTitle}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View className="justify-center pr-3">
                        <ChevronRight size={18} color={colors.muted} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Empty State */}
        {totalEvents === 0 && (
          <View className="py-16 items-center">
            <View
              style={{ backgroundColor: colors.surface }}
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
            >
              <Calendar size={40} color={colors.muted} />
            </View>
            <Text style={{ color: colors.text }} className="font-semibold text-lg">
              No events yet
            </Text>
            <Text style={{ color: colors.muted }} className="text-center mt-2 px-8">
              Browse events and register for programs that interest you
            </Text>
            <Pressable className="mt-6" onPress={() => router.push("/(tabs)")}>
              <LinearGradient
                colors={["#8B5CF6", "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Browse Events</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}