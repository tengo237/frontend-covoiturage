import React, { useEffect, useState } from "react";
import { View, Text, Pressable, useWindowDimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import AnimatedPressable from "../components/AnimatedPressable";

type Slide = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  badgeBg: string;
  iconColor: string;
  title: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    key: "covoiturage",
    icon: "car-sport",
    badgeBg: "bg-terre-600",
    iconColor: "#FBF6EF",
    title: "Voyagez ensemble",
    description:
      "Trouvez un trajet ou proposez le vôtre en quelques clics, partout au Cameroun.",
  },
  {
    key: "securite",
    icon: "shield-checkmark",
    badgeBg: "bg-teal-600",
    iconColor: "#FBF6EF",
    title: "Voyagez en sécurité",
    description:
      "Alerte SOS automatique et partage du trajet à vos proches en cas d'accident.",
  },
  {
    key: "colis",
    icon: "cube",
    badgeBg: "bg-terre-600",
    iconColor: "#FBF6EF",
    title: "Envoyez vos colis",
    description:
      "Profitez des trajets disponibles pour envoyer un colis rapidement, à moindre coût.",
  },
];

// Badge qui "respire" doucement — c'est ce petit mouvement continu qui
// évite l'effet figé d'une icône statique.
function BreathingBadge({ slide, size }: { slide: Slide; size: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      className={`${slide.badgeBg} rounded-full items-center justify-center`}
      style={[{ width: size, height: size }, style]}
    >
      <Ionicons name={slide.icon} size={size * 0.42} color={slide.iconColor} />
    </Animated.View>
  );
}

function RouteDashes({ index }: { index: number }) {
  return (
    <View className="flex-row items-center justify-center" style={{ gap: 6 }}>
      {SLIDES.map((s, i) => (
        <Animated.View
          key={s.key}
          layout={undefined}
          className={i === index ? "bg-terre-600" : "bg-brun/15"}
          style={{ width: i === index ? 28 : 10, height: 4, borderRadius: 2 }}
        />
      ))}
    </View>
  );
}

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  const goNext = () => (isLast ? router.replace("/login") : setIndex((i) => i + 1));
  const skip = () => router.replace("/login");

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <View className="flex-row justify-end px-6 pt-2">
        {!isLast && (
          <Pressable onPress={skip} hitSlop={10}>
            <Text className="text-sm text-brun-muted font-body">Passer</Text>
          </Pressable>
        )}
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <Animated.View
          key={slide.key}
          entering={FadeIn.duration(280)}
          className={`w-full items-center ${isTablet ? "max-w-md" : ""}`}
        >
          <View className="mb-10">
            <BreathingBadge slide={slide} size={isTablet ? 128 : 96} />
          </View>

          <View className="flex-row mb-8" style={{ gap: 5 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} className="bg-brun/10" style={{ width: 14, height: 2, borderRadius: 1 }} />
            ))}
          </View>

          <Text className="font-display-bold text-brun text-3xl text-center mb-3">
            {slide.title}
          </Text>
          <Text className="font-body text-brun-muted text-base text-center leading-6 px-2">
            {slide.description}
          </Text>
        </Animated.View>
      </View>

      <View className="mb-6">
        <RouteDashes index={index} />
      </View>

      <View
        className="px-6 pb-6 w-full items-center"
        style={{ paddingBottom: Platform.OS === "ios" ? 24 : 20 }}
      >
        <AnimatedPressable
          onPress={goNext}
          className={`w-full ${isTablet ? "max-w-md" : ""} bg-terre-600 rounded-2xl py-4 items-center`}
        >
          <Text className="font-body-semibold text-creme text-base">
            {isLast ? "Commencer" : "Suivant"}
          </Text>
        </AnimatedPressable>
      </View>
    </SafeAreaView>
  );
}
