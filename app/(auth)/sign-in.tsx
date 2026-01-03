import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, TextField, useThemeColor } from "heroui-native";
import { useCallback, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type AuthStep = "email" | "name" | "otp";

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();

  const [step, setStep] = useState<AuthStep>("email");
  const [isNewUser, setIsNewUser] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const muted = useThemeColor("muted");

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Step 1: Check if email exists
  const handleEmailSubmit = useCallback(async () => {
    if (!isSignInLoaded || !isSignUpLoaded || !signIn || !signUp) return;

    if (!isValidEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const signInAttempt = await signIn.create({ identifier: email });
      const emailFactor = signInAttempt.supportedFirstFactors?.find(
        (factor) => factor.strategy === "email_code"
      );

      if (emailFactor && "emailAddressId" in emailFactor) {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailFactor.emailAddressId,
        });
        setIsNewUser(false);
        setStep("otp");
      }
    } catch (err: any) {
      const errorCode = err?.errors?.[0]?.code;
      if (errorCode === "form_identifier_not_found" || errorCode === "identifier_not_found") {
        setIsNewUser(true);
        setStep("name");
      } else {
        setError(err?.errors?.[0]?.message || "Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isSignInLoaded, isSignUpLoaded, signIn, signUp, email]);

  // Step 2: Collect name and send OTP
  const handleNameSubmit = useCallback(async () => {
    if (!isSignUpLoaded || !signUp) return;

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your full name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("otp");
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  }, [isSignUpLoaded, signUp, email, firstName, lastName]);

  // Step 3: Verify OTP
  const handleOtpSubmit = useCallback(async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (isNewUser) {
        if (!isSignUpLoaded || !signUp) return;
        const result = await signUp.attemptEmailAddressVerification({ code });
        if (result.status === "complete") {
          await setSignUpActive({ session: result.createdSessionId });
          router.replace("/(tabs)");
        }
      } else {
        if (!isSignInLoaded || !signIn) return;
        const result = await signIn.attemptFirstFactor({ strategy: "email_code", code });
        if (result.status === "complete") {
          await setSignInActive({ session: result.createdSessionId });
          router.replace("/(tabs)");
        }
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Invalid code");
    } finally {
      setIsLoading(false);
    }
  }, [otp, isNewUser, isSignUpLoaded, signUp, setSignUpActive, isSignInLoaded, signIn, setSignInActive, router]);

  // OTP handlers
  const handleOtpChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }, [otp]);

  const handleOtpKeyPress = useCallback((index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleResendOtp = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      if (isNewUser && signUp) {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      } else if (signIn) {
        const emailFactor = signIn.supportedFirstFactors?.find(
          (factor) => factor.strategy === "email_code"
        );
        if (emailFactor && "emailAddressId" in emailFactor) {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          });
        }
      }
      setOtp(["", "", "", "", "", ""]);
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Failed to resend");
    } finally {
      setIsLoading(false);
    }
  }, [isNewUser, signUp, signIn]);

  const handleBack = useCallback(() => {
    setError("");
    if (step === "otp") {
      setOtp(["", "", "", "", "", ""]);
      setStep(isNewUser ? "name" : "email");
    } else if (step === "name") {
      setStep("email");
    }
  }, [step, isNewUser]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        {step !== "email" && (
          <Pressable onPress={handleBack} className="absolute top-14 left-6 p-2">
            <Ionicons name="arrow-back" size={24} color={muted} />
          </Pressable>
        )}

        <View className="py-16">
          {/* Header */}
          <View className="mb-10">
            {step === "email" && (
              <>
                <Text className="text-3xl font-semibold text-foreground mb-2">
                  Get started
                </Text>
                <Text className="text-base text-muted">
                  Enter your email to continue
                </Text>
              </>
            )}
            {step === "name" && (
              <>
                <Text className="text-3xl font-semibold text-foreground mb-2">
                  Create account
                </Text>
                <Text className="text-base text-muted">
                  Tell us your name
                </Text>
              </>
            )}
            {step === "otp" && (
              <>
                <Text className="text-3xl font-semibold text-foreground mb-2">
                  Enter code
                </Text>
                <Text className="text-base text-muted">
                  We sent a code to {email}
                </Text>
              </>
            )}
          </View>

          {/* Forms */}
          <View className="gap-4">
            {/* Email Step */}
            {step === "email" && (
              <>
                <TextField isInvalid={!!error}>
                  <TextField.Input
                    placeholder="Email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError("");
                    }}
                    onSubmitEditing={handleEmailSubmit}
                    className="h-14"
                  />
                </TextField>

                {error && (
                  <Text className="text-danger text-sm">{error}</Text>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleEmailSubmit}
                  isDisabled={!isValidEmail(email) || isLoading}
                  className="h-14 mt-2"
                >
                  <Button.Label>
                    {isLoading ? "Please wait..." : "Continue"}
                  </Button.Label>
                </Button>
              </>
            )}

            {/* Name Step */}
            {step === "name" && (
              <>
                <TextField>
                  <TextField.Input
                    placeholder="First name"
                    autoCapitalize="words"
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      setError("");
                    }}
                    className="h-14"
                  />
                </TextField>

                <TextField>
                  <TextField.Input
                    placeholder="Last name"
                    autoCapitalize="words"
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      setError("");
                    }}
                    onSubmitEditing={handleNameSubmit}
                    className="h-14"
                  />
                </TextField>

                {error && (
                  <Text className="text-danger text-sm">{error}</Text>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleNameSubmit}
                  isDisabled={!firstName.trim() || !lastName.trim() || isLoading}
                  className="h-14 mt-2"
                >
                  <Button.Label>
                    {isLoading ? "Please wait..." : "Continue"}
                  </Button.Label>
                </Button>
              </>
            )}

            {/* OTP Step */}
            {step === "otp" && (
              <>
                <View className="flex-row justify-between gap-2 mb-2">
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (otpRefs.current[index] = ref)}
                      className="flex-1 h-14 bg-default rounded-xl text-center text-xl font-medium text-foreground"
                      maxLength={1}
                      keyboardType="number-pad"
                      value={digit}
                      onChangeText={(value) => handleOtpChange(index, value)}
                      onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {error && (
                  <Text className="text-danger text-sm">{error}</Text>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleOtpSubmit}
                  isDisabled={otp.join("").length !== 6 || isLoading}
                  className="h-14 mt-2"
                >
                  <Button.Label>
                    {isLoading ? "Verifying..." : "Continue"}
                  </Button.Label>
                </Button>

                <Pressable onPress={handleResendOtp} disabled={isLoading} className="py-3">
                  <Text className="text-center text-muted text-sm">
                    Didn&apos;t receive code?{" "}
                    <Text className="text-foreground font-medium">Resend</Text>
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}