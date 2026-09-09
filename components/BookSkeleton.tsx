import React from "react";
import { StyleSheet, View } from "react-native";

type BookSkeletonProps = {
  count?: number;
};

export const BookSkeleton: React.FC<BookSkeletonProps> = ({ count = 5 }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <View style={styles.container}>
      {items.map((key) => (
        <View key={key} style={styles.cardSkeleton}>
          <View style={styles.headerSkeleton}>
            <View style={styles.titleLine} />
            <View style={styles.badgePlaceholder} />
          </View>
          <View style={styles.authorLine} />
          <View style={styles.footerLine} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  cardSkeleton: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  headerSkeleton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titleLine: {
    height: 16,
    width: "65%",
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
  },
  badgePlaceholder: {
    height: 20,
    width: 48,
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
  },
  authorLine: {
    height: 14,
    width: "40%",
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    marginBottom: 16,
  },
  footerLine: {
    height: 12,
    width: "50%",
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
  },
});
