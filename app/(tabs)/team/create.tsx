import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Sparkles, Users } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateTeamScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const program = useQuery(api.programs.get, {
    programId: programId as Id<"programs">,
  });

  const createTeam = useMutation(api.teams.create);

  const [teamName, setTeamName] = useState("");
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

  const handleCreate = useCallback(async () => {
    if (!teamName.trim()) {
      Alert.alert("Error", "Please enter a team name");
      return;
    }

    setIsLoading(true);
    try {
      const teamId = await createTeam({
        programId: programId as Id<"programs">,
        name: teamName.trim(),
      });
      router.replace(`/(tabs)/team/${teamId}`);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create team");
    } finally {
      setIsLoading(false);
    }
  }, [teamName, programId, createTeam, router]);

  if (!program) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }} className="items-center justify-center">
        <Text style={{ color: colors.muted }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="pt-4">
          <Pressable
            style={{ backgroundColor: colors.surface }}
            className="w-10 h-10 rounded-full items-center justify-center mb-4"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>

          <Text style={{ color: colors.text }} className="text-2xl font-bold">
            Create Team
          </Text>
          <Text style={{ color: colors.muted }} className="mt-1">{program.name}</Text>
        </View>

        {/* Info Card */}
        <View
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
          className="mt-6 rounded-2xl p-4 border"
        >
          <View className="flex-row items-center mb-3">
            <LinearGradient
              colors={["#8B5CF6", "#6D28D9"]}
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
            >
              <Users size={20} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={{ color: colors.text }} className="font-semibold">Team Size</Text>
              <Text style={{ color: colors.muted }} className="text-sm">
                {program.minTeamSize}
                {program.maxTeamSize ? `-${program.maxTeamSize}` : "+"} members required
              </Text>
            </View>
          </View>
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            As team captain, you'll be able to add members after creating the team.
          </Text>
        </View>

        {/* Team Name Input */}
        <View className="mt-6">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2">
            Team Name
          </Text>
          <View
            style={{ backgroundColor: colors.input, borderColor: colors.border }}
            className="rounded-xl flex-row items-center border px-4"
          >
            <Sparkles size={20} color={colors.muted} />
            <TextInput
              style={{ color: colors.text }}
              className="flex-1 py-4 ml-3"
              placeholder="Enter a cool team name"
              placeholderTextColor={colors.muted}
              value={teamName}
              onChangeText={setTeamName}
              autoCapitalize="words"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View
        className="px-5 pt-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable onPress={handleCreate} disabled={isLoading}>
          <LinearGradient
            colors={isLoading ? ["#6B7280", "#4B5563"] : ["#8B5CF6", "#6D28D9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-xl py-4 items-center"
          >
            <Text className="text-white font-semibold">
              {isLoading ? "Creating..." : "Create Team"}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}