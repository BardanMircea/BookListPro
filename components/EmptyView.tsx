import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type EmptyViewProps = {
  titre?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyView: React.FC<EmptyViewProps> = ({
  titre = "Aucun ouvrage trouvé",
  description = "Votre fonds de lecture ne contient pas encore de livre.",
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📖</Text>
      <Text style={styles.titre}>{titre}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  titre: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#1e293b",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
