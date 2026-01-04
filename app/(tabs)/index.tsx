import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Bell, Bookmark, Calendar, MapPin, Search, Sparkles, Users } from "lucide-react-native";
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
  category: "sports" | "art" | "music" | "dance" | "fun" | "other";
  gender: "male" | "female" | "all";
  minAge?: number;
  maxAge?: number;
  isTeamEvent: boolean;
  isOpen: boolean;
};

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "sports", label: "Sports" },
  { id: "music", label: "Music" },
  { id: "dance", label: "Dance" },
  { id: "art", label: "Art" },
  { id: "fun", label: "Fun" },
];

const CATEGORY_GRADIENT: Record<string, [string, string]> = {
  sports: ["#3B82F6", "#1D4ED8"],
  art: ["#8B5CF6", "#6D28D9"],
  music: ["#EC4899", "#BE185D"],
  dance: ["#F97316", "#C2410C"],
  fun: ["#10B981", "#047857"],
  other: ["#6B7280", "#374151"],
};

export default function HomeScreen() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selectedCategory, setSelectedCategory] = useState("all");

  const user = useQuery(api.users.current);
  const programsByDay = useQuery(api.programs.listGroupedByDay);
  const myRegistrations = useQuery(api.registrations.myRegistrations);

  const registeredProgramIds = useMemo(() => {
    if (!myRegistrations) return new Set<string>();
    return new Set(myRegistrations.map((r) => r.programId));
  }, [myRegistrations]);

  const allPrograms = useMemo(() => {
    if (!programsByDay) return [];
    return [...(programsByDay[1] || []), ...(programsByDay[2] || []), ...(programsByDay[3] || [])];
  }, [programsByDay]);

  const filteredPrograms = useMemo(() => {
    if (selectedCategory === "all") return allPrograms;
    return allPrograms.filter((p) => p.category === selectedCategory);
  }, [allPrograms, selectedCategory]);

  const featuredPrograms = useMemo(() => {
    return allPrograms.filter((p) => p.category === "dance" || p.category === "music").slice(0, 3);
  }, [allPrograms]);

  const handleProgramPress = useCallback(
    (programId: Id<"programs">) => {
      router.push(`/(tabs)/program/${programId}`);
    },
    [router]
  );

  const isProfileIncomplete = !user?.age || !user?.gender;

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
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <View>
          <View className="flex-row items-center gap-2">
            <Sparkles size={24} color="#8B5CF6" />
            <Text style={{ color: colors.text }} className="text-2xl font-bold">
              Utsav
            </Text>
          </View>
          <Text style={{ color: colors.muted }} className="text-sm mt-1">
            {user ? `Welcome, ${user.firstName}` : "Discover Events"}
          </Text>
        </View>
        <View className="flex-row gap-3">
          <Pressable
            style={{ backgroundColor: colors.surface }}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <Bell size={20} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            style={{ backgroundColor: colors.surface }}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <Bookmark size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-5 mb-4">
        <Pressable
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="flex-row items-center px-4 py-3 rounded-2xl border"
        >
          <Search size={20} color={colors.muted} />
          <Text style={{ color: colors.muted }} className="ml-3">
            Search events...
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Warning */}
        {isSignedIn && isProfileIncomplete && (
          <Pressable className="mx-5 mb-4" onPress={() => router.push("/(tabs)/profile")}>
            <LinearGradient
              colors={["#F59E0B", "#D97706"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-2xl p-4 flex-row items-center"
            >
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
                <Sparkles size={20} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">Complete your profile</Text>
                <Text className="text-white/70 text-sm">Add age & gender to register</Text>
              </View>
            </LinearGradient>
          </Pressable>
        )}

        {/* Featured Section */}
        <View className="mb-6">
          <View className="px-5 flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.text }} className="text-lg font-semibold">
              Featured
            </Text>
            <Pressable>
              <Text className="text-violet-500 text-sm font-medium">See all</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {featuredPrograms.map((program) => (
              <Pressable
                key={program._id}
                onPress={() => handleProgramPress(program._id)}
                className="w-72"
              >
                <View className="rounded-3xl overflow-hidden">
                  <Image
                    source={{ uri: program.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400" }}
                    className="w-full h-40"
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.8)"]}
                    className="absolute inset-0 justify-end p-4"
                  >
                    <Text className="text-white font-bold text-lg">{program.name}</Text>
                    {program.venue && (
                      <View className="flex-row items-center mt-1">
                        <MapPin size={12} color="#a0a0b0" />
                        <Text className="text-white/70 text-xs ml-1">{program.venue}</Text>
                      </View>
                    )}
                  </LinearGradient>
                  {registeredProgramIds.has(program._id) && (
                    <View className="absolute top-3 right-3 bg-emerald-500 px-2 py-1 rounded-full">
                      <Text className="text-white text-xs font-medium">Registered</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Category Filter */}
        <View className="mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={{
                    backgroundColor: isSelected ? "#8B5CF6" : colors.surface,
                    borderColor: colors.border,
                  }}
                  className={`px-5 py-2.5 rounded-full ${!isSelected && "border"}`}
                >
                  <Text
                    style={{ color: isSelected ? "#fff" : colors.textSecondary }}
                    className="font-medium text-sm"
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Events List */}
        <View className="px-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.text }} className="text-lg font-semibold">
              All Events
            </Text>
            <Text style={{ color: colors.muted }} className="text-sm">
              {filteredPrograms.length} events
            </Text>
          </View>

          <View className="gap-4">
            {filteredPrograms.map((program: Program) => {
              const isRegistered = registeredProgramIds.has(program._id);
              const gradient = CATEGORY_GRADIENT[program.category] || CATEGORY_GRADIENT.other;

              return (
                <Pressable
                  key={program._id}
                  onPress={() => handleProgramPress(program._id)}
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
                  className="rounded-2xl overflow-hidden border"
                >
                  <View className="flex-row">
                    {/* Image */}
                    <View className="w-28 h-28 relative">
                      <Image
                        source={{ uri: program.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200" }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.5)"]}
                        className="absolute inset-0"
                      />
                      {/* Day Badge */}
                      <View className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded-md">
                        <Text className="text-white text-xs font-medium">Day {program.day}</Text>
                      </View>
                    </View>

                    {/* Content */}
                    <View className="flex-1 p-3 justify-between">
                      <View>
                        <Text style={{ color: colors.text }} className="font-semibold text-base">
                          {program.name}
                        </Text>
                      </View>

                      <View className="gap-1.5">
                        {/* Category Chip */}
                        <View className="flex-row items-center">
                          <LinearGradient
                            colors={gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="px-2 py-0.5 rounded-full"
                          >
                            <Text className="text-white text-xs font-medium capitalize">
                              {program.category}
                            </Text>
                          </LinearGradient>
                          {program.isTeamEvent && (
                            <View
                              style={{ backgroundColor: colors.surface }}
                              className="ml-2 flex-row items-center px-2 py-0.5 rounded-full"
                            >
                              <Users size={10} color={colors.muted} />
                              <Text style={{ color: colors.muted }} className="text-xs ml-1">
                                Team
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Venue & Time */}
                        <View className="flex-row items-center gap-3">
                          {program.venue && (
                            <View className="flex-row items-center">
                              <MapPin size={12} color={colors.muted} />
                              <Text style={{ color: colors.muted }} className="text-xs ml-1">
                                {program.venue}
                              </Text>
                            </View>
                          )}
                          <View className="flex-row items-center">
                            <Calendar size={12} color={colors.muted} />
                            <Text style={{ color: colors.muted }} className="text-xs ml-1">
                              {program.time}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Status */}
                    <View className="p-3 justify-center">
                      {isRegistered ? (
                        <View className="bg-emerald-500/20 px-3 py-1.5 rounded-full">
                          <Text className="text-emerald-500 text-xs font-medium">✓</Text>
                        </View>
                      ) : program.isOpen ? (
                        <View className="bg-violet-500/20 p-2 rounded-full">
                          <Bookmark size={16} color="#8B5CF6" />
                        </View>
                      ) : (
                        <View style={{ backgroundColor: colors.surface }} className="px-2 py-1 rounded-full">
                          <Text style={{ color: colors.muted }} className="text-xs">Closed</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {filteredPrograms.length === 0 && (
            <View className="py-12 items-center">
              <Calendar size={48} color={colors.muted} />
              <Text style={{ color: colors.muted }} className="mt-4">
                No events found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}