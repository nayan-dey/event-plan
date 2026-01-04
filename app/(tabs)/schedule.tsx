import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Calendar, ChevronRight, Clock, MapPin, Users } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Program = {
  _id: Id<"programs">;
  name: string;
  description?: string;
  time: string;
  venue?: string;
  imageUrl?: string;
  category: string;
  gender: string;
  isTeamEvent: boolean;
};

const DAYS = [
  { id: 1, date: "15", month: "Jan", name: "Sports Day" },
  { id: 2, date: "16", month: "Jan", name: "Art & Culture" },
  { id: 3, date: "17", month: "Jan", name: "Finals" },
];

const CATEGORY_COLORS: Record<string, string> = {
  sports: "#3B82F6",
  art: "#8B5CF6",
  music: "#EC4899",
  dance: "#F97316",
  fun: "#10B981",
  other: "#6B7280",
};

export default function ScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedDay, setSelectedDay] = useState(1);

  const programsByDay = useQuery(api.programs.listGroupedByDay);
  const myRegistrations = useQuery(api.registrations.myRegistrations);

  const registeredProgramIds = useMemo(() => {
    if (!myRegistrations) return new Set<string>();
    return new Set(myRegistrations.map((r) => r.programId));
  }, [myRegistrations]);

  const currentDayPrograms = useMemo(() => {
    if (!programsByDay) return [];
    return programsByDay[selectedDay] || [];
  }, [programsByDay, selectedDay]);

  // Group by time slot
  const groupedByTime = useMemo(() => {
    const groups: Record<string, Program[]> = {};
    for (const program of currentDayPrograms) {
      if (!groups[program.time]) {
        groups[program.time] = [];
      }
      groups[program.time].push(program);
    }
    return groups;
  }, [currentDayPrograms]);

  const timeSlots = useMemo(() => {
    return Object.keys(groupedByTime).sort((a, b) => {
      const parseTime = (t: string) => {
        const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return 0;
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const period = match[3].toUpperCase();
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      return parseTime(a) - parseTime(b);
    });
  }, [groupedByTime]);

  const handleProgramPress = useCallback(
    (programId: Id<"programs">) => {
      router.push(`/(tabs)/program/${programId}`);
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
          Schedule
        </Text>
        <Text style={{ color: colors.muted }} className="text-sm mt-1">
          3-day event timeline
        </Text>
      </View>

      {/* Day Selector */}
      <View className="flex-row px-5 gap-3 mb-6">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day.id;
          return (
            <Pressable
              key={day.id}
              onPress={() => setSelectedDay(day.id)}
              className="flex-1 rounded-2xl overflow-hidden"
            >
              {isSelected ? (
                <LinearGradient
                  colors={["#8B5CF6", "#6D28D9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-4"
                >
                  <Text className="text-white/70 text-xs">{day.month}</Text>
                  <Text className="text-white text-2xl font-bold">{day.date}</Text>
                  <Text className="text-white/70 text-xs mt-1">{day.name}</Text>
                </LinearGradient>
              ) : (
                <View
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  className="p-4 border"
                >
                  <Text style={{ color: colors.muted }} className="text-xs">{day.month}</Text>
                  <Text style={{ color: colors.text }} className="text-2xl font-bold">{day.date}</Text>
                  <Text style={{ color: colors.muted }} className="text-xs mt-1">{day.name}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Timeline */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {timeSlots.length > 0 ? (
          <View>
            {timeSlots.map((time, index) => {
              const programs = groupedByTime[time];
              const isLast = index === timeSlots.length - 1;

              return (
                <View key={time} className="flex-row">
                  {/* Timeline column */}
                  <View className="items-center mr-4 w-6">
                    <LinearGradient
                      colors={["#8B5CF6", "#6D28D9"]}
                      className="w-6 h-6 rounded-full items-center justify-center"
                    >
                      <Clock size={12} color="#fff" />
                    </LinearGradient>
                    {!isLast && (
                      <View
                        style={{ backgroundColor: colors.border }}
                        className="w-0.5 flex-1 my-2"
                      />
                    )}
                  </View>

                  {/* Content column */}
                  <View className="flex-1 pb-6">
                    <Text style={{ color: colors.text }} className="font-bold text-lg mb-3">
                      {time}
                    </Text>

                    <View className="gap-3">
                      {programs.map((program) => {
                        const isRegistered = registeredProgramIds.has(program._id);
                        const categoryColor = CATEGORY_COLORS[program.category] || CATEGORY_COLORS.other;

                        return (
                          <Pressable
                            key={program._id}
                            onPress={() => handleProgramPress(program._id)}
                            style={{ backgroundColor: colors.card, borderColor: colors.border }}
                            className="rounded-2xl overflow-hidden border flex-row"
                          >
                            {/* Image */}
                            <Image
                              source={{ uri: program.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200" }}
                              className="w-20 h-20"
                              resizeMode="cover"
                            />

                            {/* Content */}
                            <View className="flex-1 p-3 justify-between">
                              <View>
                                <View className="flex-row items-center gap-2 mb-1">
                                  <View
                                    style={{ backgroundColor: categoryColor }}
                                    className="w-2 h-2 rounded-full"
                                  />
                                  <Text style={{ color: colors.muted }} className="text-xs capitalize">
                                    {program.category}
                                  </Text>
                                  {isRegistered && (
                                    <View className="bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                      <Text className="text-emerald-500 text-xs">Registered</Text>
                                    </View>
                                  )}
                                </View>
                                <Text style={{ color: colors.text }} className="font-semibold">
                                  {program.name}
                                </Text>
                              </View>

                              <View className="flex-row items-center gap-3">
                                {program.venue && (
                                  <View className="flex-row items-center">
                                    <MapPin size={10} color={colors.muted} />
                                    <Text style={{ color: colors.muted }} className="text-xs ml-1">
                                      {program.venue}
                                    </Text>
                                  </View>
                                )}
                                {program.isTeamEvent && (
                                  <View className="flex-row items-center">
                                    <Users size={10} color={colors.muted} />
                                    <Text style={{ color: colors.muted }} className="text-xs ml-1">
                                      Team
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
                </View>
              );
            })}
          </View>
        ) : (
          <View className="py-16 items-center">
            <Calendar size={48} color={colors.muted} />
            <Text style={{ color: colors.muted }} className="mt-4">
              No events scheduled
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}