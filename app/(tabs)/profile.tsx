import { api } from "@/convex/_generated/api";
import { useClerk } from "@clerk/clerk-expo";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Calendar, ChevronRight, LogOut, Mail, Phone, Sparkles, User } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Gender = "male" | "female" | "other";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function ProfileScreen() {
  const user = useQuery(api.users.current);
  const updateProfile = useMutation(api.users.updateProfile);
  const { signOut } = useClerk();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form state
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(() => {
    if (user?.dateOfBirth) return new Date(user.dateOfBirth);
    return null;
  });
  const [gender, setGender] = useState<Gender | undefined>(user?.gender);
  const [phone, setPhone] = useState(user?.phone || "");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate age from DOB
  const calculatedAge = useMemo(() => {
    if (!dateOfBirth) return null;
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    return age;
  }, [dateOfBirth]);

  const isProfileComplete = !!(user?.age && user?.gender && user?.phone);

  const handleSave = useCallback(async () => {
    if (!gender) {
      Alert.alert("Error", "Please select your gender");
      return;
    }
    if (!dateOfBirth) {
      Alert.alert("Error", "Please enter your date of birth");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        dateOfBirth: dateOfBirth.toISOString().split("T")[0],
        gender,
        phone: phone.trim(),
      });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }, [dateOfBirth, gender, phone, updateProfile]);

  const handleSignOut = useCallback(async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  }, [signOut, router]);

  const handleDateChange = useCallback((_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  }, []);

  const formatDate = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const shouldEdit = isEditing || !isProfileComplete;

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-6 flex-row items-center justify-between">
          <Text style={{ color: colors.text }} className="text-2xl font-bold">
            Profile
          </Text>
          {isProfileComplete && !isEditing && (
            <Pressable onPress={() => setIsEditing(true)}>
              <Text className="text-violet-500 font-medium">Edit</Text>
            </Pressable>
          )}
        </View>

        {/* User Avatar & Name */}
        <View className="items-center mb-8 px-5">
          <LinearGradient
            colors={["#8B5CF6", "#6D28D9"]}
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
          >
            <Text className="text-3xl font-bold text-white">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </Text>
          </LinearGradient>
          <Text style={{ color: colors.text }} className="text-xl font-semibold">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={{ color: colors.muted }}>{user?.email}</Text>
          {user?.age && (
            <View className="flex-row items-center mt-2 gap-2">
              <View className="bg-violet-500/20 px-3 py-1 rounded-full">
                <Text className="text-violet-500 text-sm">{user.age} years</Text>
              </View>
              {user.gender && (
                <View className="bg-blue-500/20 px-3 py-1 rounded-full">
                  <Text className="text-blue-500 text-sm capitalize">{user.gender}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Profile Completion Warning */}
        {!isProfileComplete && (
          <View className="mx-5 mb-6">
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
                <Text className="text-white/70 text-sm">Required to register for events</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Profile Form */}
        <View className="px-5">
          {shouldEdit ? (
            <View className="gap-4">
              {/* Date of Birth */}
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2">
                  Date of Birth
                </Text>
                <Pressable
                  style={{ backgroundColor: colors.input, borderColor: colors.border }}
                  className="rounded-xl p-4 flex-row items-center justify-between border"
                  onPress={() => setShowDatePicker(true)}
                >
                  <View className="flex-row items-center">
                    <Calendar size={20} color={colors.muted} />
                    <Text
                      style={{ color: dateOfBirth ? colors.text : colors.muted }}
                      className="ml-3"
                    >
                      {formatDate(dateOfBirth)}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.muted} />
                </Pressable>
                {calculatedAge !== null && (
                  <Text style={{ color: colors.muted }} className="text-sm mt-2">
                    Age: {calculatedAge} years
                  </Text>
                )}
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth || new Date(2000, 0, 1)}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1940, 0, 1)}
                />
              )}

              {/* Gender */}
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2">
                  Gender
                </Text>
                <View className="flex-row gap-3">
                  {GENDER_OPTIONS.map((option) => {
                    const isSelected = gender === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => setGender(option.value)}
                        className="flex-1 rounded-xl overflow-hidden"
                      >
                        {isSelected ? (
                          <LinearGradient
                            colors={["#8B5CF6", "#6D28D9"]}
                            className="p-4 items-center"
                          >
                            <Text className="text-white font-medium">{option.label}</Text>
                          </LinearGradient>
                        ) : (
                          <View
                            style={{ backgroundColor: colors.input, borderColor: colors.border }}
                            className="p-4 items-center border"
                          >
                            <Text style={{ color: colors.text }} className="font-medium">
                              {option.label}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Phone */}
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2">
                  Phone Number
                </Text>
                <View
                  style={{ backgroundColor: colors.input, borderColor: colors.border }}
                  className="rounded-xl flex-row items-center border px-4"
                >
                  <Phone size={20} color={colors.muted} />
                  <TextInput
                    style={{ color: colors.text }}
                    className="flex-1 py-4 ml-3"
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.muted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Save Button */}
              <View className="mt-4 gap-3">
                <Pressable onPress={handleSave} disabled={isLoading}>
                  <LinearGradient
                    colors={isLoading ? ["#6B7280", "#4B5563"] : ["#8B5CF6", "#6D28D9"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-xl py-4 items-center"
                  >
                    <Text className="text-white font-semibold">
                      {isLoading ? "Saving..." : "Save Profile"}
                    </Text>
                  </LinearGradient>
                </Pressable>
                {isEditing && isProfileComplete && (
                  <Pressable
                    style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                    className="rounded-xl py-4 items-center border"
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={{ color: colors.text }} className="font-semibold">
                      Cancel
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          ) : (
            /* View Mode */
            <View className="gap-3">
              <View
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                className="rounded-2xl p-4 border"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-violet-500/20 items-center justify-center mr-4">
                    <Calendar size={20} color="#8B5CF6" />
                  </View>
                  <View>
                    <Text style={{ color: colors.muted }} className="text-sm">Date of Birth</Text>
                    <Text style={{ color: colors.text }} className="font-medium">
                      {user?.dateOfBirth
                        ? new Date(user.dateOfBirth).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Not set"}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                className="rounded-2xl p-4 border"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-pink-500/20 items-center justify-center mr-4">
                    <User size={20} color="#EC4899" />
                  </View>
                  <View>
                    <Text style={{ color: colors.muted }} className="text-sm">Gender</Text>
                    <Text style={{ color: colors.text }} className="font-medium capitalize">
                      {user?.gender || "Not set"}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                className="rounded-2xl p-4 border"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center mr-4">
                    <Phone size={20} color="#10B981" />
                  </View>
                  <View>
                    <Text style={{ color: colors.muted }} className="text-sm">Phone</Text>
                    <Text style={{ color: colors.text }} className="font-medium">
                      {user?.phone || "Not set"}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                className="rounded-2xl p-4 border"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center mr-4">
                    <Mail size={20} color="#3B82F6" />
                  </View>
                  <View>
                    <Text style={{ color: colors.muted }} className="text-sm">Email</Text>
                    <Text style={{ color: colors.text }} className="font-medium">
                      {user?.email}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Sign Out */}
          <Pressable
            className="mt-8"
            onPress={handleSignOut}
          >
            <View
              style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)" }}
              className="rounded-xl py-4 flex-row items-center justify-center gap-2 border"
            >
              <LogOut size={18} color="#EF4444" />
              <Text className="text-red-500 font-semibold">Sign Out</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}