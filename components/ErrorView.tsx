import { AppError } from "@/app/domain/errors";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ErrorViewProps = {
  error: AppError | null;
  onRetry: () => void;
};

export const ErrorView: React.FC<ErrorViewProps> = ({ error, onRetry }) => {
  const getErrorMessage = () => {
    if (!error) return "Une erreur inattendue est survenue.";
    switch (error.type) {
      case "RESEAU":
        return `Problème réseau : ${error.message}`;
      case "CONFLIT":
        return `Conflit de version : ${error.message}`;
      case "VALIDATION":
        return `Données invalides : ${error.message}`;
      case "AUTH":
        return `Accès refusé : ${error.message}`;
      default:
        return "Une erreur inattendue est survenue.";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>Une erreur est survenue</Text>
      <Text style={styles.message}>{getErrorMessage()}</Text>
      <Pressable style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Réessayer</Text>
      </Pressable>
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
    fontSize: 42,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#0284c7",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
