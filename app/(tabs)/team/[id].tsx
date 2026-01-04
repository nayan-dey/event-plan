import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle,
  Crown,
  Phone,
  Plus,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const teamId = id as Id<"teams">;
  const team = useQuery(api.teams.getWithMembers, { teamId });
  const currentUser = useQuery(api.users.current);

  const addMember = useMutation(api.teams.addMember);
  const removeMember = useMutation(api.teams.removeMember);
  const submitTeam = useMutation(api.teams.submit);
  const deleteTeam = useMutation(api.teams.deleteTeam);

  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
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

  const isCaptain = currentUser?._id === team?.captainId;
  const canEdit = isCaptain && team?.status === "forming";
  const memberCount = team?.members?.length || 0;
  const minMembers = team?.program?.minTeamSize || 5;
  const maxMembers = team?.program?.maxTeamSize || 10;
  const canAddMore = memberCount < maxMembers;
  const canSubmit = memberCount >= minMembers;

  const handleAddMember = useCallback(async () => {
    if (!memberName.trim()) {
      Alert.alert("Error", "Please enter member name");
      return;
    }

    setIsLoading(true);
    try {
      await addMember({
        teamId,
        name: memberName.trim(),
        phone: memberPhone.trim() || undefined,
      });
      setMemberName("");
      setMemberPhone("");
      setShowAddMember(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to add member");
    } finally {
      setIsLoading(false);
    }
  }, [teamId, memberName, memberPhone, addMember]);

  const handleRemoveMember = useCallback(
    async (memberId: Id<"teamMembers">) => {
      Alert.alert("Remove Member", "Are you sure you want to remove this member?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeMember({ memberId });
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to remove member");
            }
          },
        },
      ]);
    },
    [removeMember]
  );

  const handleSubmit = useCallback(async () => {
    Alert.alert(
      "Submit Team",
      "Once submitted, you won't be able to add or remove members. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            setIsLoading(true);
            try {
              await submitTeam({ teamId });
              Alert.alert("Success", "Team registered successfully!");
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to submit team");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, [teamId, submitTeam]);

  const handleDelete = useCallback(async () => {
    Alert.alert("Delete Team", "This will cancel your team's registration. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTeam({ teamId });
            router.back();
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to delete team");
          }
        },
      },
    ]);
  }, [teamId, deleteTeam, router]);

  if (!team) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }} className="items-center justify-center">
        <Text style={{ color: colors.muted }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 150 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-4">
          <Pressable
            style={{ backgroundColor: colors.surface }}
            className="w-10 h-10 rounded-full items-center justify-center mb-4"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>

          {/* Status Badge */}
          <View className="flex-row items-center gap-2 mb-2">
            <View
              style={{
                backgroundColor: team.status === "registered" ? "rgba(16, 185, 129, 0.15)" : "rgba(139, 92, 246, 0.15)"
              }}
              className="px-3 py-1 rounded-full"
            >
              <Text
                style={{ color: team.status === "registered" ? "#10B981" : "#8B5CF6" }}
                className="text-sm font-medium capitalize"
              >
                {team.status}
              </Text>
            </View>
          </View>

          <Text style={{ color: colors.text }} className="text-2xl font-bold">
            {team.name}
          </Text>
          <Text style={{ color: colors.muted }} className="mt-1">{team.program?.name}</Text>
        </View>

        {/* Team Size Progress */}
        <View
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
          className="mt-6 rounded-2xl p-4 border"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <LinearGradient
                colors={["#8B5CF6", "#6D28D9"]}
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
              >
                <Users size={20} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={{ color: colors.text }} className="font-semibold">
                  {memberCount} / {minMembers}
                  {maxMembers !== minMembers ? `-${maxMembers}` : ""} members
                </Text>
                <Text style={{ color: colors.muted }} className="text-sm">
                  {canSubmit ? "Ready to submit" : `Need ${minMembers - memberCount} more`}
                </Text>
              </View>
            </View>
            {canSubmit && team.status === "forming" && (
              <View className="bg-emerald-500/20 w-8 h-8 rounded-full items-center justify-center">
                <CheckCircle size={18} color="#10B981" />
              </View>
            )}
          </View>

          {/* Progress Bar */}
          <View style={{ backgroundColor: colors.border }} className="h-2 rounded-full overflow-hidden">
            <LinearGradient
              colors={canSubmit ? ["#10B981", "#047857"] : ["#8B5CF6", "#6D28D9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${Math.min((memberCount / minMembers) * 100, 100)}%` }}
              className="h-full rounded-full"
            />
          </View>
        </View>

        {/* Captain */}
        <View className="mt-6 mb-3 flex-row items-center justify-between">
          <Text style={{ color: colors.text }} className="font-semibold">Captain</Text>
        </View>
        <View
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
          className="rounded-2xl p-4 border"
        >
          <View className="flex-row items-center">
            <LinearGradient
              colors={["#F59E0B", "#D97706"]}
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
            >
              <Crown size={20} color="#fff" />
            </LinearGradient>
            <View className="flex-1">
              <Text style={{ color: colors.text }} className="font-semibold">
                {team.captain?.firstName} {team.captain?.lastName}
              </Text>
              <Text style={{ color: colors.muted }} className="text-sm">
                {team.captain?.phone || "No phone"}
              </Text>
            </View>
          </View>
        </View>

        {/* Members */}
        <View className="mt-6 mb-3 flex-row items-center justify-between">
          <Text style={{ color: colors.text }} className="font-semibold">Team Members</Text>
          {canEdit && canAddMore && (
            <Pressable
              className="flex-row items-center gap-1"
              onPress={() => setShowAddMember(true)}
            >
              <Plus size={16} color="#8B5CF6" />
              <Text className="text-violet-500 font-medium">Add</Text>
            </Pressable>
          )}
        </View>

        <View className="gap-3">
          {team.members
            ?.filter((m) => m.userId !== team.captainId)
            .map((member) => (
              <View
                key={member._id}
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                className="rounded-2xl p-4 border flex-row items-center"
              >
                <View
                  style={{ backgroundColor: colors.surface }}
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                >
                  <User size={20} color={colors.muted} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.text }} className="font-semibold">
                    {member.name}
                  </Text>
                  <Text style={{ color: colors.muted }} className="text-sm">
                    {member.phone || "No phone"}
                  </Text>
                </View>
                {canEdit && (
                  <Pressable
                    className="w-8 h-8 rounded-full bg-red-500/15 items-center justify-center"
                    onPress={() => handleRemoveMember(member._id)}
                  >
                    <X size={16} color="#EF4444" />
                  </Pressable>
                )}
              </View>
            ))}

          {team.members?.length === 1 && (
            <View className="py-8 items-center">
              <Users size={32} color={colors.muted} />
              <Text style={{ color: colors.muted }} className="mt-2">
                Add team members to continue
              </Text>
            </View>
          )}
        </View>

        {/* Add Member Form */}
        {showAddMember && (
          <View
            style={{ backgroundColor: colors.card, borderColor: "#8B5CF6" }}
            className="mt-6 rounded-2xl p-4 border-2"
          >
            <Text style={{ color: colors.text }} className="font-semibold mb-4">
              Add New Member
            </Text>
            <View className="gap-3">
              <View
                style={{ backgroundColor: colors.input, borderColor: colors.border }}
                className="rounded-xl flex-row items-center border px-4"
              >
                <User size={18} color={colors.muted} />
                <TextInput
                  style={{ color: colors.text }}
                  className="flex-1 py-3.5 ml-3"
                  placeholder="Member's full name"
                  placeholderTextColor={colors.muted}
                  value={memberName}
                  onChangeText={setMemberName}
                  autoCapitalize="words"
                />
              </View>
              <View
                style={{ backgroundColor: colors.input, borderColor: colors.border }}
                className="rounded-xl flex-row items-center border px-4"
              >
                <Phone size={18} color={colors.muted} />
                <TextInput
                  style={{ color: colors.text }}
                  className="flex-1 py-3.5 ml-3"
                  placeholder="Phone number (optional)"
                  placeholderTextColor={colors.muted}
                  value={memberPhone}
                  onChangeText={setMemberPhone}
                  keyboardType="phone-pad"
                />
              </View>
              <View className="flex-row gap-3 mt-2">
                <Pressable
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  className="flex-1 rounded-xl py-3.5 items-center border"
                  onPress={() => setShowAddMember(false)}
                >
                  <Text style={{ color: colors.text }} className="font-semibold">Cancel</Text>
                </Pressable>
                <Pressable
                  className="flex-1"
                  onPress={handleAddMember}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? ["#6B7280", "#4B5563"] : ["#8B5CF6", "#6D28D9"]}
                    className="rounded-xl py-3.5 items-center"
                  >
                    <Text className="text-white font-semibold">
                      {isLoading ? "Adding..." : "Add"}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      {canEdit && (
        <View
          style={{ backgroundColor: colors.bg, borderTopColor: colors.border }}
          className="absolute bottom-0 left-0 right-0 border-t px-5 pt-4"
        >
          <View style={{ paddingBottom: insets.bottom + 16 }} className="gap-3">
            <Pressable onPress={handleSubmit} disabled={!canSubmit || isLoading}>
              <LinearGradient
                colors={!canSubmit || isLoading ? ["#6B7280", "#4B5563"] : ["#8B5CF6", "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl py-4 items-center"
              >
                <Text className="text-white font-semibold">
                  {canSubmit ? "Submit Team" : `Need ${minMembers - memberCount} more members`}
                </Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              className="bg-red-500/15 rounded-xl py-4 flex-row items-center justify-center gap-2"
              onPress={handleDelete}
            >
              <Trash2 size={18} color="#EF4444" />
              <Text className="text-red-500 font-semibold">Delete Team</Text>
            </Pressable>
          </View>
        </View>
      )}

      {team.status === "registered" && (
        <View
          style={{ backgroundColor: colors.bg, borderTopColor: colors.border }}
          className="absolute bottom-0 left-0 right-0 border-t px-5 pt-4"
        >
          <View style={{ paddingBottom: insets.bottom + 16 }}>
            <View className="bg-emerald-500/15 rounded-xl p-4 flex-row items-center justify-center gap-2">
              <CheckCircle size={20} color="#10B981" />
              <Text className="text-emerald-500 font-semibold">Team Registered!</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}