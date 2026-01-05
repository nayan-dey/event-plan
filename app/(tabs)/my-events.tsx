import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Button, Card, Chip, Spinner } from "heroui-native";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyEventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const registrations = useQuery(api.registrations.myRegistrations);

  // Separate individual and team registrations
  const { individualRegs, teamRegs } = useMemo(() => {
    if (!registrations) return { individualRegs: [], teamRegs: [] };

    const individual = registrations.filter((r) => !r.program?.isTeamEvent);
    const team = registrations.filter((r) => r.program?.isTeamEvent);

    return { individualRegs: individual, teamRegs: team };
  }, [registrations]);

  if (registrations === undefined) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="lg" />
      </View>
    );
  }

  const isEmpty = registrations.length === 0;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-5">
        {/* Header */}
        <Text className="text-3xl font-bold text-foreground mb-6">My Events</Text>

        {isEmpty ? (
          <View className="items-center py-12">
            <Text className="text-muted text-center mb-4">
              You haven&apos;t registered for any events yet
            </Text>
            <Button variant="primary" onPress={() => router.push("/(tabs)")}>
              <Button.Label>Browse Events</Button.Label>
            </Button>
          </View>
        ) : (
          <View className="gap-6">
            {/* Individual Events */}
            {individualRegs.length > 0 && (
              <View>
                <Text className="text-foreground font-medium mb-3">
                  Individual Events ({individualRegs.length})
                </Text>
                <View className="gap-2">
                  {individualRegs.map((reg) => (
                    <Pressable
                      key={reg._id}
                      onPress={() => router.push(`/(tabs)/program/${reg.programId}`)}
                    >
                      <Card className="p-4">
                        <View className="flex-row items-start justify-between">
                          <View className="flex-1">
                            <Text className="text-foreground font-medium">
                              {reg.program?.name}
                            </Text>
                            <Text className="text-muted text-sm mt-1">
                              Day {reg.program?.day} • {reg.program?.time}
                            </Text>
                            {reg.songTitle && (
                              <Text className="text-muted text-sm mt-1">
                                Song: {reg.songTitle}
                              </Text>
                            )}
                          </View>
                          <Chip size="sm" variant="secondary" color="success">
                            <Chip.Label>Registered</Chip.Label>
                          </Chip>
                        </View>
                      </Card>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Team Events */}
            {teamRegs.length > 0 && (
              <View>
                <Text className="text-foreground font-medium mb-3">
                  Team Events ({teamRegs.length})
                </Text>
                <View className="gap-2">
                  {teamRegs.map((reg) => (
                    <Pressable
                      key={reg._id}
                      onPress={() =>
                        reg.teamId
                          ? router.push(`/(tabs)/team/${reg.teamId}`)
                          : router.push(`/(tabs)/program/${reg.programId}`)
                      }
                    >
                      <Card className="p-4">
                        <View className="flex-row items-start justify-between">
                          <View className="flex-1">
                            <Text className="text-foreground font-medium">
                              {reg.program?.name}
                            </Text>
                            <Text className="text-muted text-sm mt-1">
                              Day {reg.program?.day} • {reg.program?.time}
                            </Text>
                          </View>
                          <Chip
                            size="sm"
                            variant="secondary"
                            color={reg.status === "registered" ? "success" : "warning"}
                          >
                            <Chip.Label className="capitalize">{reg.status}</Chip.Label>
                          </Chip>
                        </View>
                      </Card>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}