import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Card, Spinner, TextField, useThemeColor } from "heroui-native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateTeamScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [foreground] = useThemeColor(["foreground"]);

  const program = useQuery(api.programs.get, {
    programId: programId as Id<"programs">,
  });
  const createTeam = useMutation(api.teams.create);

  const [teamName, setTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!teamName.trim()) return;

    setIsLoading(true);
    try {
      const teamId = await createTeam({
        programId: programId as Id<"programs">,
        name: teamName.trim(),
      });
      router.replace(`/(tabs)/team/${teamId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [teamName, programId, createTeam, router]);

  if (!program) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="lg" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="px-5 py-4 flex-row items-center gap-4"
      >
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={foreground} />
        </Pressable>
        <Text className="text-xl font-semibold text-foreground">Create Team</Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Program Info */}
        <Card className="p-4 mb-6">
          <Text className="text-muted text-sm mb-1">Event</Text>
          <Text className="text-foreground font-medium">{program.name}</Text>
          <Text className="text-muted text-sm mt-2">
            Team size: {program.minTeamSize}-{program.maxTeamSize} members
          </Text>
        </Card>

        {/* Team Name Input */}
        <TextField className="mb-6">
          <TextField.Label>Team Name</TextField.Label>
          <TextField.Input
            placeholder="Enter a team name"
            value={teamName}
            onChangeText={setTeamName}
            autoFocus
          />
        </TextField>

        {/* Create Button */}
        <Button
          variant="primary"
          onPress={handleCreate}
          isDisabled={!teamName.trim() || isLoading}
        >
          <Button.Label>{isLoading ? "Creating..." : "Create Team"}</Button.Label>
        </Button>
      </ScrollView>
    </View>
  );
}