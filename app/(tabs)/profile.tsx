import { api } from "@/convex/_generated/api";
import { useClerk } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Button, Card, TextField } from "heroui-native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Gender = "male" | "female" | "other";

export default function ProfileScreen() {
  const user = useQuery(api.users.current);
  const updateProfile = useMutation(api.users.updateProfile);
  const { signOut } = useClerk();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isEditing, setIsEditing] = useState(false);
  const [age, setAge] = useState(user?.age?.toString() || "");
  const [gender, setGender] = useState<Gender | undefined>(user?.gender);
  const [phone, setPhone] = useState(user?.phone || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        age: age ? parseInt(age, 10) : undefined,
        gender,
        phone: phone || undefined,
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [age, gender, phone, updateProfile]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  }, [signOut, router]);

  const genderOptions: { value: Gender; label: string }[] = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32 }}
    >
      <View className="px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-2xl font-semibold text-foreground">Profile</Text>
          {!isEditing && (
            <Pressable onPress={() => setIsEditing(true)}>
              <Text className="text-accent font-medium">Edit</Text>
            </Pressable>
          )}
        </View>

        {/* User Info */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-default items-center justify-center mb-3">
            <Text className="text-2xl font-semibold text-foreground">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
          <Text className="text-xl font-semibold text-foreground">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-muted">{user?.email}</Text>
        </View>

        {/* Profile Form */}
        {isEditing ? (
          <Card className="p-5 mb-6">
            <View className="gap-4">
              <TextField>
                <TextField.Label>Age</TextField.Label>
                <TextField.Input
                  placeholder="Enter your age"
                  keyboardType="number-pad"
                  value={age}
                  onChangeText={setAge}
                  className="h-12"
                />
              </TextField>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Gender</Text>
                <View className="flex-row gap-2">
                  {genderOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => setGender(option.value)}
                      className={`flex-1 py-3 rounded-xl items-center ${
                        gender === option.value ? "bg-accent" : "bg-default"
                      }`}
                    >
                      <Text
                        className={`font-medium ${
                          gender === option.value ? "text-accent-foreground" : "text-foreground"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <TextField>
                <TextField.Label>Phone (optional)</TextField.Label>
                <TextField.Input
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  className="h-12"
                />
              </TextField>

              <View className="flex-row gap-3 mt-2">
                <Button
                  variant="secondary"
                  className="flex-1 h-12"
                  onPress={() => setIsEditing(false)}
                >
                  <Button.Label>Cancel</Button.Label>
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 h-12"
                  onPress={handleSave}
                  isDisabled={isLoading}
                >
                  <Button.Label>{isLoading ? "Saving..." : "Save"}</Button.Label>
                </Button>
              </View>
            </View>
          </Card>
        ) : (
          <Card className="p-5 mb-6">
            <View className="gap-4">
              <View className="flex-row justify-between">
                <Text className="text-muted">Age</Text>
                <Text className="text-foreground">{user?.age || "Not set"}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Gender</Text>
                <Text className="text-foreground capitalize">{user?.gender || "Not set"}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Phone</Text>
                <Text className="text-foreground">{user?.phone || "Not set"}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Stats */}
        <Text className="text-foreground font-medium mb-3">My Stats</Text>
        <View className="flex-row gap-3 mb-6">
          <Card className="flex-1 p-4 items-center">
            <Text className="text-2xl font-semibold text-foreground">0</Text>
            <Text className="text-muted text-sm">Programs</Text>
          </Card>
          <Card className="flex-1 p-4 items-center">
            <Text className="text-2xl font-semibold text-foreground">0</Text>
            <Text className="text-muted text-sm">Points</Text>
          </Card>
          <Card className="flex-1 p-4 items-center">
            <Text className="text-2xl font-semibold text-foreground">0</Text>
            <Text className="text-muted text-sm">Wins</Text>
          </Card>
        </View>

        {/* Sign Out */}
        <Button variant="danger" className="h-12" onPress={handleSignOut}>
          <Button.Label>Sign Out</Button.Label>
        </Button>
      </View>
    </ScrollView>
  );
}