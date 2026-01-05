import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Card, Chip, Spinner, TextField, useThemeColor } from "heroui-native";
import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [foreground] = useThemeColor(["foreground"]);

  const programId = id as Id<"programs">;

  const program = useQuery(api.programs.get, { programId });
  const eligibility = useQuery(api.programs.checkEligibility, { programId });
  const participantCount = useQuery(api.programs.getParticipantCount, { programId });

  const register = useMutation(api.registrations.register);
  const cancelRegistration = useMutation(api.registrations.cancel);

  const [songLink, setSongLink] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isRegistered = eligibility?.registration?.status === "registered";
  const canRegister = eligibility?.eligible && !isRegistered;

  const handleRegister = useCallback(async () => {
    if (!program) return;

    setIsLoading(true);
    try {
      if (program.isTeamEvent) {
        router.push(`/(tabs)/team/create?programId=${programId}`);
      } else {
        await register({
          programId,
          songLink: program.requiresSongLink ? songLink : undefined,
          songTitle: program.requiresSongLink ? songTitle : undefined,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [program, programId, songLink, songTitle, register, router]);

  const handleCancel = useCallback(async () => {
    if (!eligibility?.registration) return;

    setIsLoading(true);
    try {
      await cancelRegistration({ registrationId: eligibility.registration._id });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [eligibility, cancelRegistration]);

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
        className="absolute top-0 left-0 right-0 z-10 px-4 py-3"
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-background/80 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color={foreground} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {program.imageUrl && (
          <Image
            source={{ uri: program.imageUrl }}
            className="w-full h-56"
            resizeMode="cover"
          />
        )}

        <View className="px-5 pt-5">
          {/* Title & Category */}
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">{program.name}</Text>
              {program.description && (
                <Text className="text-muted mt-1">{program.description}</Text>
              )}
            </View>
            <Chip variant="secondary">
              <Chip.Label className="capitalize">{program.category}</Chip.Label>
            </Chip>
          </View>

          {/* Info Cards */}
          <View className="flex-row gap-3 mb-6">
            <Card className="flex-1 p-3 items-center">
              <Text className="text-muted text-xs mb-1">Day</Text>
              <Text className="text-foreground font-semibold">{program.day}</Text>
            </Card>
            <Card className="flex-1 p-3 items-center">
              <Text className="text-muted text-xs mb-1">Time</Text>
              <Text className="text-foreground font-semibold">{program.time}</Text>
            </Card>
            <Card className="flex-1 p-3 items-center">
              <Text className="text-muted text-xs mb-1">Registered</Text>
              <Text className="text-foreground font-semibold">{participantCount || 0}</Text>
            </Card>
          </View>

          {/* Venue */}
          {program.venue && (
            <Card className="p-4 mb-4">
              <Text className="text-muted text-sm mb-1">Venue</Text>
              <Text className="text-foreground font-medium">{program.venue}</Text>
            </Card>
          )}

          {/* Eligibility */}
          <Text className="text-foreground font-medium mb-3">Eligibility</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            <Chip variant="soft">
              <Chip.Label className="capitalize">
                {program.gender === "all" ? "All genders" : `${program.gender} only`}
              </Chip.Label>
            </Chip>
            {program.minAge && (
              <Chip variant="soft">
                <Chip.Label>Min age: {program.minAge}</Chip.Label>
              </Chip>
            )}
            {program.maxAge && (
              <Chip variant="soft">
                <Chip.Label>Max age: {program.maxAge}</Chip.Label>
              </Chip>
            )}
            {program.isTeamEvent && (
              <Chip variant="soft">
                <Chip.Label>
                  Team: {program.minTeamSize}-{program.maxTeamSize} members
                </Chip.Label>
              </Chip>
            )}
          </View>

          {/* Song Link Input */}
          {program.requiresSongLink && canRegister && (
            <Card className="p-4 mb-6">
              <Text className="text-foreground font-medium mb-3">Song Details</Text>
              <View className="gap-3">
                <TextField>
                  <TextField.Label>Song Title</TextField.Label>
                  <TextField.Input
                    placeholder="Enter song name"
                    value={songTitle}
                    onChangeText={setSongTitle}
                  />
                </TextField>
                <TextField>
                  <TextField.Label>Song Link</TextField.Label>
                  <TextField.Input
                    placeholder="YouTube or Spotify link"
                    value={songLink}
                    onChangeText={setSongLink}
                    autoCapitalize="none"
                  />
                </TextField>
              </View>
            </Card>
          )}

          {/* Registration Status / Action */}
          {isRegistered ? (
            <Card className="p-4 mb-4 bg-success/10 border-success/20">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-success font-medium">You&apos;re registered!</Text>
                  {eligibility?.registration?.songTitle && (
                    <Text className="text-muted text-sm mt-1">
                      Song: {eligibility.registration.songTitle}
                    </Text>
                  )}
                </View>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleCancel}
                  isDisabled={isLoading}
                >
                  <Button.Label className="text-danger">Cancel</Button.Label>
                </Button>
              </View>
            </Card>
          ) : eligibility?.eligible ? (
            <Button
              variant="primary"
              onPress={handleRegister}
              isDisabled={
                isLoading ||
                (program.requiresSongLink && (!songLink || !songTitle))
              }
            >
              <Button.Label>
                {isLoading
                  ? "Please wait..."
                  : program.isTeamEvent
                  ? "Create Team"
                  : "Register"}
              </Button.Label>
            </Button>
          ) : (
            <Card className="p-4 bg-danger/10 border-danger/20">
              <Text className="text-danger">{eligibility?.reason}</Text>
            </Card>
          )}

          {/* Team Link */}
          {isRegistered && program.isTeamEvent && eligibility?.registration?.teamId && (
            <Button
              variant="secondary"
              className="mt-3"
              onPress={() =>
                router.push(`/(tabs)/team/${eligibility.registration?.teamId}`)
              }
            >
              <Button.Label>View Your Team</Button.Label>
            </Button>
          )}
        </View>
      </ScrollView>
    </View>
  );
}