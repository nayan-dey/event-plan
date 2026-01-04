import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Link as LinkIcon,
  MapPin,
  Music,
  Users,
  X,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORY_GRADIENT: Record<string, [string, string]> = {
  sports: ["#3B82F6", "#1D4ED8"],
  art: ["#8B5CF6", "#6D28D9"],
  music: ["#EC4899", "#BE185D"],
  dance: ["#F97316", "#C2410C"],
  fun: ["#10B981", "#047857"],
  other: ["#6B7280", "#374151"],
};

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const programId = id as Id<"programs">;

  const program = useQuery(api.programs.get, { programId });
  const eligibility = useQuery(api.programs.checkEligibility, { programId });
  const existingRegistration = useQuery(api.registrations.getForProgram, { programId });
  const userTeam = useQuery(api.teams.getUserTeamForProgram, { programId });
  const participantCount = useQuery(api.programs.getParticipantCount, { programId });

  const register = useMutation(api.registrations.register);
  const cancelRegistration = useMutation(api.registrations.cancel);

  const [songLink, setSongLink] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Theme colors
  const colors = {
    bg: isDark ? "#0a0a0f" : "#f5f5f7",
    surface: isDark ? "#13131a" : "#ffffff",
    card: isDark ? "#1a1a24" : "#ffffff",
    border: isDark ? "#2a2a3a" : "#e5e5ea",
    text: isDark ? "#ffffff" : "#1c1c1e",
    textSecondary: isDark ? "#a0a0b0" : "#3a3a3c",
    muted: isDark ? "#6b6b7b" : "#8e8e93",
    input: isDark ? "#1a1a24" : "#f5f5f7",
  };

  const handleRegister = useCallback(async () => {
    if (!program) return;

    if (program.requiresSongLink && !songLink.trim()) {
      Alert.alert("Song Required", "Please provide a YouTube or Spotify link for your song.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        programId,
        songLink: songLink.trim() || undefined,
        songTitle: songTitle.trim() || undefined,
      });
      Alert.alert("Success", "You have been registered for this event!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  }, [program, programId, register, songLink, songTitle]);

  const handleCancel = useCallback(async () => {
    if (!existingRegistration) return;

    Alert.alert("Cancel Registration", "Are you sure you want to cancel your registration?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          setIsLoading(true);
          try {
            await cancelRegistration({ registrationId: existingRegistration._id });
            Alert.alert("Cancelled", "Your registration has been cancelled.");
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to cancel");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  }, [existingRegistration, cancelRegistration]);

  const handleCreateTeam = useCallback(() => {
    router.push(`/(tabs)/team/create?programId=${programId}`);
  }, [router, programId]);

  const handleViewTeam = useCallback(() => {
    if (userTeam?.team) {
      router.push(`/(tabs)/team/${userTeam.team._id}`);
    }
  }, [router, userTeam]);

  if (!program) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }} className="items-center justify-center">
        <Text style={{ color: colors.muted }}>Loading...</Text>
      </View>
    );
  }

  const gradient = CATEGORY_GRADIENT[program.category] || CATEGORY_GRADIENT.other;
  const isRegistered = existingRegistration && existingRegistration.status !== "cancelled";
  const hasTeam = userTeam?.team && userTeam.team.status !== "cancelled";

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Hero Image */}
      <View className="relative">
        <Image
          source={{ uri: program.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800" }}
          className="w-full h-72"
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          className="absolute inset-0"
        />

        {/* Back Button */}
        <Pressable
          style={{ top: insets.top + 8 }}
          className="absolute left-4 w-10 h-10 rounded-full bg-black/30 items-center justify-center"
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#fff" />
        </Pressable>

        {/* Category Badge */}
        <View className="absolute bottom-4 left-4 right-4">
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="self-start px-3 py-1.5 rounded-full mb-2"
          >
            <Text className="text-white text-sm font-medium capitalize">{program.category}</Text>
          </LinearGradient>
          <Text className="text-white text-2xl font-bold">{program.name}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Cards */}
        <View className="px-5 pt-6 gap-3">
          {/* Schedule & Venue */}
          <View className="flex-row gap-3">
            <View
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              className="flex-1 rounded-2xl p-4 border"
            >
              <View className="flex-row items-center gap-2 mb-1">
                <Calendar size={16} color="#8B5CF6" />
                <Text style={{ color: colors.muted }} className="text-sm">Day</Text>
              </View>
              <Text style={{ color: colors.text }} className="font-semibold">Day {program.day}</Text>
            </View>
            <View
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              className="flex-1 rounded-2xl p-4 border"
            >
              <View className="flex-row items-center gap-2 mb-1">
                <Clock size={16} color="#3B82F6" />
                <Text style={{ color: colors.muted }} className="text-sm">Time</Text>
              </View>
              <Text style={{ color: colors.text }} className="font-semibold">{program.time}</Text>
            </View>
          </View>

          {program.venue && (
            <View
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              className="rounded-2xl p-4 border"
            >
              <View className="flex-row items-center gap-2 mb-1">
                <MapPin size={16} color="#10B981" />
                <Text style={{ color: colors.muted }} className="text-sm">Venue</Text>
              </View>
              <Text style={{ color: colors.text }} className="font-semibold">{program.venue}</Text>
            </View>
          )}

          {/* Participants */}
          <View
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
            className="rounded-2xl p-4 border"
          >
            <View className="flex-row items-center gap-2 mb-1">
              <Users size={16} color="#EC4899" />
              <Text style={{ color: colors.muted }} className="text-sm">Participants</Text>
            </View>
            <Text style={{ color: colors.text }} className="font-semibold">
              {participantCount || 0} registered
            </Text>
          </View>

          {/* Eligibility */}
          <View
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
            className="rounded-2xl p-4 border"
          >
            <Text style={{ color: colors.text }} className="font-semibold mb-3">Eligibility</Text>
            <View className="flex-row flex-wrap gap-2">
              <View className="bg-violet-500/20 px-3 py-1.5 rounded-full">
                <Text className="text-violet-400 text-sm">
                  {program.gender === "all"
                    ? "All genders"
                    : program.gender === "male"
                      ? "Men only"
                      : "Women only"}
                </Text>
              </View>
              {(program.minAge || program.maxAge) && (
                <View className="bg-blue-500/20 px-3 py-1.5 rounded-full">
                  <Text className="text-blue-400 text-sm">
                    {program.maxAge && !program.minAge
                      ? `Up to ${program.maxAge} years`
                      : program.minAge && !program.maxAge
                        ? `${program.minAge}+ years`
                        : `${program.minAge}-${program.maxAge} years`}
                  </Text>
                </View>
              )}
              {program.isTeamEvent && (
                <View className="bg-emerald-500/20 px-3 py-1.5 rounded-full">
                  <Text className="text-emerald-400 text-sm">
                    Team of {program.minTeamSize}
                    {program.maxTeamSize ? `-${program.maxTeamSize}` : "+"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {program.description && (
            <View
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              className="rounded-2xl p-4 border"
            >
              <Text style={{ color: colors.text }} className="font-semibold mb-2">About</Text>
              <Text style={{ color: colors.textSecondary }}>{program.description}</Text>
            </View>
          )}

          {/* Song Link Input */}
          {program.requiresSongLink && !isRegistered && eligibility?.eligible && (
            <View
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              className="rounded-2xl p-4 border"
            >
              <Text style={{ color: colors.text }} className="font-semibold mb-3">Song Details</Text>
              <View className="gap-3">
                <View
                  style={{ backgroundColor: colors.input, borderColor: colors.border }}
                  className="rounded-xl flex-row items-center border px-4"
                >
                  <LinkIcon size={18} color={colors.muted} />
                  <TextInput
                    style={{ color: colors.text }}
                    className="flex-1 py-3.5 ml-3"
                    placeholder="YouTube or Spotify link"
                    placeholderTextColor={colors.muted}
                    value={songLink}
                    onChangeText={setSongLink}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
                <View
                  style={{ backgroundColor: colors.input, borderColor: colors.border }}
                  className="rounded-xl flex-row items-center border px-4"
                >
                  <Music size={18} color={colors.muted} />
                  <TextInput
                    style={{ color: colors.text }}
                    className="flex-1 py-3.5 ml-3"
                    placeholder="Song title (optional)"
                    placeholderTextColor={colors.muted}
                    value={songTitle}
                    onChangeText={setSongTitle}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Registered Song Info */}
          {isRegistered && existingRegistration?.songLink && (
            <View className="rounded-2xl p-4 border-2 border-emerald-500/30 bg-emerald-500/10">
              <View className="flex-row items-center gap-2 mb-2">
                <Music size={16} color="#10B981" />
                <Text className="text-emerald-400 font-semibold">Your Song</Text>
              </View>
              {existingRegistration.songTitle && (
                <Text style={{ color: colors.text }} className="font-medium">
                  {existingRegistration.songTitle}
                </Text>
              )}
              <Text style={{ color: colors.muted }} className="text-sm mt-1" numberOfLines={1}>
                {existingRegistration.songLink}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View
        style={{ backgroundColor: colors.bg, borderTopColor: colors.border }}
        className="absolute bottom-0 left-0 right-0 border-t px-5 pt-4"
        pointerEvents="box-none"
      >
        <View style={{ paddingBottom: insets.bottom + 16 }}>
          {!program.isOpen ? (
            <View
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="rounded-xl py-4 items-center border"
            >
              <Text style={{ color: colors.muted }} className="font-semibold">
                Registration Closed
              </Text>
            </View>
          ) : program.isTeamEvent ? (
            hasTeam ? (
              <Pressable onPress={handleViewTeam}>
                <LinearGradient
                  colors={["#8B5CF6", "#6D28D9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="rounded-xl py-4 flex-row items-center justify-center gap-2"
                >
                  <Users size={18} color="#fff" />
                  <Text className="text-white font-semibold">View Your Team</Text>
                </LinearGradient>
              </Pressable>
            ) : (
              <Pressable onPress={handleCreateTeam}>
                <LinearGradient
                  colors={["#8B5CF6", "#6D28D9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="rounded-xl py-4 flex-row items-center justify-center gap-2"
                >
                  <Users size={18} color="#fff" />
                  <Text className="text-white font-semibold">Create Team</Text>
                </LinearGradient>
              </Pressable>
            )
          ) : isRegistered ? (
            <View className="gap-3">
              <View className="bg-emerald-500/15 rounded-xl p-4 flex-row items-center justify-center gap-2">
                <CheckCircle size={20} color="#10B981" />
                <Text className="text-emerald-500 font-semibold">You're registered!</Text>
              </View>
              <Pressable onPress={handleCancel} disabled={isLoading}>
                <View className="bg-red-500/15 rounded-xl py-4 flex-row items-center justify-center gap-2">
                  <X size={18} color="#EF4444" />
                  <Text className="text-red-500 font-semibold">Cancel Registration</Text>
                </View>
              </Pressable>
            </View>
          ) : eligibility?.eligible ? (
            <Pressable onPress={handleRegister} disabled={isLoading}>
              <LinearGradient
                colors={isLoading ? ["#6B7280", "#4B5563"] : ["#8B5CF6", "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl py-4 items-center"
              >
                <Text className="text-white font-semibold">
                  {isLoading ? "Registering..." : "Register Now"}
                </Text>
              </LinearGradient>
            </Pressable>
          ) : (
            <View className="bg-red-500/15 rounded-xl p-4">
              <Text className="text-red-400 text-center font-medium">
                {eligibility?.reason || "Not eligible"}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}