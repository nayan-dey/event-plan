import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Card, Chip, Spinner, TextField, useThemeColor } from "heroui-native";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TeamMember = {
  _id: Id<"teamMembers">;
  name: string;
  phone?: string;
  isAppUser: boolean;
  userId?: Id<"users">;
};

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [foreground, muted] = useThemeColor(["foreground", "muted"]);

  const teamId = id as Id<"teams">;

  const team = useQuery(api.teams.getWithMembers, { teamId });
  const user = useQuery(api.users.current);

  const addMember = useMutation(api.teams.addMember);
  const removeMember = useMutation(api.teams.removeMember);
  const submitTeam = useMutation(api.teams.submit);
  const deleteTeam = useMutation(api.teams.deleteTeam);

  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isCaptain = useMemo(() => {
    return team?.captainId === user?._id;
  }, [team, user]);

  const canSubmit = useMemo(() => {
    if (!team) return false;
    const memberCount = team.members?.length || 0;
    return memberCount >= (team.program?.minTeamSize || 0);
  }, [team]);

  const memberCount = team?.members?.length || 0;
  const minSize = team?.program?.minTeamSize || 0;
  const maxSize = team?.program?.maxTeamSize || 0;

  // Filter out captain from displayed members list (captain shown separately)
  const nonCaptainMembers = useMemo(() => {
    if (!team?.members || !team?.captainId) return [];
    return team.members.filter((m: TeamMember) => m.userId !== team.captainId);
  }, [team]);

  const handleAddMember = useCallback(async () => {
    if (!memberName.trim()) return;

    setIsLoading(true);
    try {
      await addMember({
        teamId,
        name: memberName.trim(),
        phone: memberPhone.trim() || undefined,
      });
      setMemberName("");
      setMemberPhone("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [teamId, memberName, memberPhone, addMember]);

  const handleRemoveMember = useCallback(
    async (memberId: Id<"teamMembers">) => {
      setIsLoading(true);
      try {
        await removeMember({ memberId });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [removeMember]
  );

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    try {
      await submitTeam({ teamId });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [teamId, submitTeam]);

  const handleDelete = useCallback(() => {
    Alert.alert("Delete Team", "Are you sure you want to delete this team?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTeam({ teamId });
            router.back();
          } catch (err) {
            console.error(err);
          }
        },
      },
    ]);
  }, [teamId, deleteTeam, router]);

  if (!team) {
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
        <View className="flex-1">
          <Text className="text-xl font-semibold text-foreground">{team.name}</Text>
          <Text className="text-muted text-sm">{team.program?.name}</Text>
        </View>
        <Chip
          variant="secondary"
          color={team.status === "registered" ? "success" : "warning"}
        >
          <Chip.Label className="capitalize">{team.status}</Chip.Label>
        </Chip>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <Card className="p-4 mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted text-sm">Team Size</Text>
            <Text className="text-foreground font-medium">
              {memberCount} / {minSize}-{maxSize}
            </Text>
          </View>
          <View className="h-2 bg-default rounded-full overflow-hidden">
            <View
              className={`h-full rounded-full ${
                memberCount >= minSize ? "bg-success" : "bg-warning"
              }`}
              style={{ width: `${Math.min((memberCount / minSize) * 100, 100)}%` }}
            />
          </View>
          {memberCount < minSize && (
            <Text className="text-warning text-sm mt-2">
              Need {minSize - memberCount} more member(s) to submit
            </Text>
          )}
        </Card>

        {/* Captain */}
        <Text className="text-foreground font-medium mb-3">Captain</Text>
        <Card className="p-4 mb-6">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-accent items-center justify-center">
              <Text className="text-accent-foreground font-semibold">
                {team.captain?.firstName?.[0]}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-medium">
                {team.captain?.firstName} {team.captain?.lastName}
              </Text>
              <Text className="text-muted text-sm">{team.captain?.email}</Text>
            </View>
            {isCaptain && (
              <Chip size="sm" variant="secondary">
                <Chip.Label>You</Chip.Label>
              </Chip>
            )}
          </View>
        </Card>

        {/* Members */}
        <Text className="text-foreground font-medium mb-3">
          Members ({nonCaptainMembers.length})
        </Text>

        {nonCaptainMembers.length > 0 ? (
          <View className="gap-2 mb-6">
            {nonCaptainMembers.map((member: TeamMember) => (
              <Card key={member._id} className="p-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-foreground font-medium">{member.name}</Text>
                    {member.phone && (
                      <Text className="text-muted text-sm">{member.phone}</Text>
                    )}
                  </View>
                  {isCaptain && team.status === "forming" && (
                    <Pressable onPress={() => handleRemoveMember(member._id)}>
                      <Ionicons name="close-circle" size={24} color={muted} />
                    </Pressable>
                  )}
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card className="p-4 mb-6">
            <Text className="text-muted text-center">No members added yet</Text>
          </Card>
        )}

        {/* Add Member Form */}
        {isCaptain && team.status === "forming" && memberCount < maxSize && (
          <Card className="p-4 mb-6">
            <Text className="text-foreground font-medium mb-3">Add Member</Text>
            <View className="gap-3">
              <TextField>
                <TextField.Label>Name</TextField.Label>
                <TextField.Input
                  placeholder="Member name"
                  value={memberName}
                  onChangeText={setMemberName}
                />
              </TextField>
              <TextField>
                <TextField.Label>Phone (optional)</TextField.Label>
                <TextField.Input
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                  value={memberPhone}
                  onChangeText={setMemberPhone}
                />
              </TextField>
              <Button
                variant="secondary"
                onPress={handleAddMember}
                isDisabled={!memberName.trim() || isLoading}
              >
                <Button.Label>Add Member</Button.Label>
              </Button>
            </View>
          </Card>
        )}

        {/* Actions */}
        {isCaptain && team.status === "forming" && (
          <View className="gap-3">
            <Button
              variant="primary"
              onPress={handleSubmit}
              isDisabled={!canSubmit || isLoading}
            >
              <Button.Label>
                {isLoading ? "Submitting..." : "Submit Team"}
              </Button.Label>
            </Button>
            <Button variant="danger" onPress={handleDelete}>
              <Button.Label>Delete Team</Button.Label>
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}