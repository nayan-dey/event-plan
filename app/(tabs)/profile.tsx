import { api } from "@/convex/_generated/api";
import { useClerk } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Button, Card, FormField, Switch, TextField } from "heroui-native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Uniwind, useUniwind } from "uniwind";

type Gender = "male" | "female" | "other";

const genderOptions: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const { signOut } = useClerk();

  const user = useQuery(api.users.current);
  const updateProfile = useMutation(api.users.updateProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | undefined>();
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync form state when user data loads (using derived initial values)
  const formAge = isEditing ? age : (user?.age?.toString() || "");
  const formGender = isEditing ? gender : user?.gender;
  const formPhone = isEditing ? phone : (user?.phone || "");

  const startEditing = useCallback(() => {
    setAge(user?.age?.toString() || "");
    setGender(user?.gender);
    setPhone(user?.phone || "");
    setIsEditing(true);
  }, [user]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
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
      setIsSaving(false);
    }
  }, [age, gender, phone, updateProfile]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  }, [signOut, router]);

  const toggleTheme = useCallback(() => {
    Uniwind.setTheme(theme === "light" ? "dark" : "light");
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 32,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-5">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-3xl font-bold text-foreground">Profile</Text>
          {!isEditing && (
            <Pressable onPress={startEditing}>
              <Text className="text-accent font-medium">Edit</Text>
            </Pressable>
          )}
        </View>

        {/* Avatar & Name */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-default items-center justify-center mb-3">
            <Text className="text-2xl font-semibold text-foreground">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </Text>
          </View>
          <Text className="text-xl font-semibold text-foreground">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-muted">{user?.email}</Text>
        </View>

        {/* Profile Info */}
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
                />
              </TextField>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Gender</Text>
                <View className="flex-row gap-2">
                  {genderOptions.map((opt) => (
                    <Pressable
                      key={opt.value}
                      onPress={() => setGender(opt.value)}
                      className={`flex-1 py-3 rounded-xl items-center ${
                        gender === opt.value ? "bg-accent" : "bg-default"
                      }`}
                    >
                      <Text
                        className={`font-medium ${
                          gender === opt.value ? "text-accent-foreground" : "text-foreground"
                        }`}
                      >
                        {opt.label}
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
                />
              </TextField>

              <View className="flex-row gap-3 mt-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onPress={() => setIsEditing(false)}
                >
                  <Button.Label>Cancel</Button.Label>
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onPress={handleSave}
                  isDisabled={isSaving}
                >
                  <Button.Label>{isSaving ? "Saving..." : "Save"}</Button.Label>
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
                <Text className="text-foreground capitalize">
                  {user?.gender || "Not set"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Phone</Text>
                <Text className="text-foreground">{user?.phone || "Not set"}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Settings */}
        <Text className="text-foreground font-medium mb-3">Settings</Text>
        <Card className="mb-6">
          <FormField isSelected={isDark} onSelectedChange={toggleTheme}>
            <View className="flex-1 p-4">
              <FormField.Label>Dark Mode</FormField.Label>
              <FormField.Description>
                {isDark ? "Currently using dark theme" : "Currently using light theme"}
              </FormField.Description>
            </View>
            <View className="pr-4">
              <FormField.Indicator>
                <Switch>
                  <Switch.Thumb />
                </Switch>
              </FormField.Indicator>
            </View>
          </FormField>
        </Card>

        {/* Sign Out */}
        <Button variant="danger" onPress={handleSignOut}>
          <Button.Label>Sign Out</Button.Label>
        </Button>
      </View>
    </ScrollView>
  );
}