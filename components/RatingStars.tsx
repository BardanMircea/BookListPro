import {
  RATING_STARS,
  RATING_MAX,
  theme,
} from "@/constants/constants";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/app/theme/ThemeContext";

type RatingStarsProps = {
  note: number | null;
  onRate?: (nouvelleNote: number) => void;
  readOnly?: boolean;
};

export const RatingStars: React.FC<RatingStarsProps> = ({
  note,
  onRate,
  readOnly = false,
}) => {
  const { colors } = useAppTheme();
  const valeurActuelle = note ?? 0;

  return (
    <View style={styles.container}>
      {RATING_STARS.map((starIndex) => {
        const estRemplie = starIndex <= valeurActuelle;

        return (
          <Pressable
            key={starIndex}
            style={({ pressed }) => [
              styles.starTouch,
              pressed && !readOnly && styles.starPressed,
            ]}
            onPress={() => {
              if (!readOnly && onRate) {
                // Si l'utilisateur reclique sur la même note, il peut la réinitialiser à 0
                onRate(valeurActuelle === starIndex ? 0 : starIndex);
              }
            }}
            disabled={readOnly}
            accessibilityRole="button"
            accessibilityLabel={`Donner la note de ${starIndex} sur ${RATING_MAX}`}
            accessibilityState={{ selected: estRemplie }}
          >
            <Text
              style={[
                styles.starChar,
                { color: estRemplie ? colors.warning : colors.border },
              ]}
            >
              ★
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starTouch: {
    minWidth: theme.layout.minTouchTarget,
    minHeight: theme.layout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  starPressed: {
    transform: [{ scale: 1.2 }],
  },
  starChar: {
    fontSize: 24,
    lineHeight: 28,
  },
});
