// app/(tabs)/index.tsx
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Spinner, Tabs, useThemeColor } from "heroui-native";
import { Clock, MapPin, Sparkles, Users } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const days = [
  { key: "1", label: "Day 1" },
  { key: "2", label: "Day 2" },
  { key: "3", label: "Day 3" },
];

export default function EventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState("1");
  const [accent, border, muted] = useThemeColor(["accent", "border", "muted"]);

  const programs = useQuery(api.programs.list);
  const registrations = useQuery(api.registrations.myRegistrations);
  const user = useQuery(api.users.current);

  const popularPrograms = useMemo(() => {
    if (!programs) return [];
    return programs.filter((p) => p.isTeamEvent || p.category === "dance").slice(0, 3);
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    if (!programs) return [];
    return programs.filter((p) => p.day === Number(selectedDay));
  }, [programs, selectedDay]);

  const registeredIds = useMemo(() => {
    if (!registrations) return new Set<Id<"programs">>();
    return new Set(registrations.map((r) => r.programId));
  }, [registrations]);

  const isProfileComplete = user?.age && user?.gender;

  const stickyIndex = useMemo(() => {
    let index = 1;
    if (!isProfileComplete) index++;
    if (popularPrograms.length > 0) index++;
    return index;
  }, [isProfileComplete, popularPrograms.length]);

  if (!programs) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="lg" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 100,
      }}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[stickyIndex]}
    >
      {/* Header */}
      <View className="px-4 mb-6">
        <Text className="text-2xl font-bold text-foreground">Events</Text>
        <Text className="text-muted text-sm mt-1">Saraswati Puja 2025</Text>
      </View>

      {/* Profile Warning */}
      {!isProfileComplete && (
        <Pressable onPress={() => router.push("/(tabs)/profile")} className="px-4 mb-6">
          <View 
            className="rounded-2xl p-4 bg-warning/10"
            style={{ borderWidth: 1, borderColor: "rgba(245,158,11,0.3)" }}
          >
            <Text className="text-warning font-medium text-sm">
              Complete your profile to register for events →
            </Text>
          </View>
        </Pressable>
      )}

      {/* Popular Section */}
      {popularPrograms.length > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3 px-4">
            <Sparkles size={18} color={accent} />
            <Text className="text-foreground font-semibold">Popular</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3 px-4">
              {popularPrograms.map((program) => (
                <Pressable
                  key={program._id}
                  onPress={() => router.push(`/(tabs)/program/${program._id}`)}
                  className="w-40"
                >
                  <View
                    className="rounded-2xl overflow-hidden bg-surface"
                    style={{ borderWidth: 1, borderColor: border }}
                  >
                    <View className="relative h-24">
                      {program.imageUrl ? (
                        <Image
                          source={{ uri: program.imageUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full bg-default" />
                      )}
                      <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.5)"]}
                        className="absolute inset-0"
                      />
                      <View className="absolute top-2 left-2 bg-accent px-2 py-0.5 rounded-full">
                        <Text className="text-accent-foreground text-xs font-medium">Popular</Text>
                      </View>
                    </View>
                    <View className="p-3">
                      <Text className="text-foreground font-medium text-sm" numberOfLines={1}>
                        {program.name}
                      </Text>
                      <Text className="text-muted text-xs mt-1">
                        Day {program.day} · {program.time}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Sticky Day Tabs */}
      <View 
        className="bg-background px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: border }}
      >
        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <Tabs.List className="w-full">
            <Tabs.Indicator />
            {days.map((day) => (
              <Tabs.Trigger key={day.key} value={day.key} className="flex-1">
                <Tabs.Label>{day.label}</Tabs.Label>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs>
      </View>

      {/* Events List */}
      <View className="gap-4 px-4 pt-4">
        {filteredPrograms.map((program) => {
          const isRegistered = registeredIds.has(program._id);

          return (
            <Pressable
              key={program._id}
              onPress={() => router.push(`/(tabs)/program/${program._id}`)}
            >
              <View
                className="rounded-2xl overflow-hidden bg-surface"
                style={{ borderWidth: 1, borderColor: border }}
              >
                {/* Image */}
                <View className="relative h-40">
                  {program.imageUrl ? (
                    <Image
                      source={{ uri: program.imageUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-default" />
                  )}
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.6)"]}
                    className="absolute inset-0"
                  />

                  {/* Registered Badge */}
                  {isRegistered && (
                    <View className="absolute top-3 left-3 bg-accent px-2.5 py-1 rounded-full">
                      <Text className="text-accent-foreground text-xs font-semibold">
                        ✓ Registered
                      </Text>
                    </View>
                  )}

                  {/* Time & Venue */}
                  <View className="absolute bottom-3 left-3 right-3 flex-row items-center gap-2">
                    <View className="flex-row items-center gap-1 bg-black/50 px-2.5 py-1 rounded-full">
                      <Clock size={12} color="#fff" />
                      <Text className="text-white text-xs font-medium">{program.time}</Text>
                    </View>
                    {program.venue && (
                      <View className="flex-row items-center gap-1 bg-black/50 px-2.5 py-1 rounded-full">
                        <MapPin size={12} color="#fff" />
                        <Text className="text-white text-xs font-medium" numberOfLines={1}>
                          {program.venue}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Content */}
                <View className="p-4">
                  <Text className="text-foreground font-semibold text-lg">{program.name}</Text>

                  {program.description && (
                    <Text className="text-muted text-sm mt-1" numberOfLines={2}>
                      {program.description}
                    </Text>
                  )}

                  {/* Tags */}
                  <View 
                    className="flex-row items-center gap-2 mt-3 pt-3"
                    style={{ borderTopWidth: 1, borderTopColor: border }}
                  >
                    <View className="px-2.5 py-1 rounded-full bg-accent/10">
                      <Text className="text-accent text-xs font-medium capitalize">
                        {program.category}
                      </Text>
                    </View>
                    {program.isTeamEvent && (
                      <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-default">
                        <Users size={12} color={muted} />
                        <Text className="text-foreground text-xs font-medium">Team</Text>
                      </View>
                    )}
                    {program.gender !== "all" && (
                      <View className="px-2.5 py-1 rounded-full bg-default">
                        <Text className="text-foreground text-xs font-medium capitalize">
                          {program.gender}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {filteredPrograms.length === 0 && (
        <View className="items-center py-16 px-4">
          <Text className="text-muted">No events on this day</Text>
        </View>
      )}
    </ScrollView>
  );
}