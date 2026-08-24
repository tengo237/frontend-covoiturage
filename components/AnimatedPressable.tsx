import React from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  children: React.ReactNode;
  className?: string;
  scaleTo?: number;
};

/**
 * Bouton avec retour physique au toucher (ressort), pour éviter l'effet
 * "plat" d'un Pressable standard. À utiliser pour tous les CTA principaux.
 */
export default function AnimatedPressable({
  children,
  className,
  scaleTo = 0.96,
  onPressIn,
  onPressOut,
  style,
  ...props
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableBase
      className={className}
      style={[style, animatedStyle]}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, { damping: 15, stiffness: 300 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
        onPressOut?.(e);
      }}
      {...props}
    >
      {children}
    </AnimatedPressableBase>
  );
}
