// app/books/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BookSkeleton } from "../../components/BookSkeleton";
import { ErrorView } from "../../components/ErrorView";
import { useBookDetail } from "../features/books/useBookDetail";

export default function BookDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Array.isArray(id) ? id[0] : id;

  const { book, isLoading, isError, error, refetch, deleteBook } =
    useBookDetail(bookId);

  // État pour le compte à rebours de suppression (5 secondes)
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Nettoyage des timers si l'utilisateur quitte l'écran
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Déclencheur après confirmation
  const startPendingDelete = () => {
    setCountdown(5);

    // Décompte chaque seconde
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
    }, 1000);

    // Exécution réelle du DELETE au bout de 5 000 ms
    timerRef.current = setTimeout(async () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      try {
        await deleteBook(bookId);
        router.replace("/");
      } catch {
        Alert.alert("Erreur", "Impossible de supprimer cet ouvrage.");
        setCountdown(null);
      }
    }, 5000);
  };

  const cancelPendingDelete = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
    setCountdown(null);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Suppression",
      `Êtes-vous sûr de vouloir supprimer "${book?.titre}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: startPendingDelete,
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <BookSkeleton count={1} />
      </View>
    );
  }

  if (isError || !book) {
    return (
      <View style={styles.container}>
        <ErrorView error={error} onRetry={refetch} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Bandeau d'annulation pendant les 5 secondes */}
      {countdown !== null && (
        <View style={styles.undoBanner}>
          <Text style={styles.undoText}>Suppression dans {countdown} s...</Text>
          <Pressable style={styles.undoButton} onPress={cancelPendingDelete}>
            <Text style={styles.undoButtonText}>ANNULER</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View
            style={[styles.badge, book.lu ? styles.badgeLu : styles.badgeNonLu]}
          >
            <Text
              style={[
                styles.badgeText,
                book.lu ? styles.badgeTextLu : styles.badgeTextNonLu,
              ]}
            >
              {book.lu ? "Ouvrage lu" : "À lire"}
            </Text>
          </View>
          <Text style={styles.versionText}>v{book.version}</Text>
        </View>

        <Text style={styles.titre}>{book.titre}</Text>
        <Text style={styles.auteur}>par {book.auteur}</Text>

        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Éditeur :</Text>
          <Text style={styles.metaValue}>{book.editeur}</Text>
        </View>

        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Année de publication :</Text>
          <Text style={styles.metaValue}>{book.annee}</Text>
        </View>

        {book.note !== null && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Note :</Text>
            <Text style={styles.metaValue}>★ {book.note}/5</Text>
          </View>
        )}
      </View>

      {/* Boutons d'action */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.editButton]}
          onPress={() => router.push(`/books/edit/${book.id}` as any)}
          disabled={countdown !== null}
        >
          <Text style={styles.editButtonText}>Modifier la fiche</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.deleteButton,
            countdown !== null && styles.disabledButton,
          ]}
          onPress={confirmDelete}
          disabled={countdown !== null}
        >
          <Text style={styles.deleteButtonText}>Supprimer l'ouvrage</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
  },
  undoBanner: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  undoText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  undoButton: {
    backgroundColor: "#e11d48",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  undoButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeLu: {
    backgroundColor: "#dcfce7",
  },
  badgeNonLu: {
    backgroundColor: "#f1f5f9",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeTextLu: {
    color: "#15803d",
  },
  badgeTextNonLu: {
    color: "#64748b",
  },
  versionText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  titre: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  auteur: {
    fontSize: 16,
    color: "#475569",
    fontStyle: "italic",
    marginBottom: 20,
  },
  metaBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  metaLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  actions: {
    marginTop: 20,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#0284c7",
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  deleteButtonText: {
    color: "#dc2626",
    fontSize: 15,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
