import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function NewBookScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Nouvel ouvrage</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  titre: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
});
