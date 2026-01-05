import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";
import "../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

function RootLayoutNav() {
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
<SafeAreaView style={{ flex: 1 }}>

    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <ClerkProvider tokenCache={tokenCache}>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <RootLayoutNav />
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
</SafeAreaView>

  );
}