import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";
import { LivreFormData, LivreFormSchema } from "../../domain/livre";

// z.input = type attendu en entrée du formulaire (avec les champs optionnels ou avec default)
// z.output = type garanti après validation (LivreFormData, avec tous les champs requis)
type LivreFormInput = z.input<typeof LivreFormSchema>;

type BookFormProps = {
  defaultValues?: Partial<LivreFormData>;
  onSubmit: (data: LivreFormData) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
  serverError?: string | null;
};

export const BookForm: React.FC<BookFormProps> = ({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  serverError,
}) => {
  // En passant <LivreFormInput, any, LivreFormData>, on dit explicitement à react-hook-form :
  // "Les champs du formulaire acceptent LivreFormInput, et après validation via Zod, on obtient LivreFormData"
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LivreFormInput, any, LivreFormData>({
    resolver: zodResolver(LivreFormSchema),
    defaultValues: {
      titre: defaultValues?.titre ?? "",
      auteur: defaultValues?.auteur ?? "",
      editeur: defaultValues?.editeur ?? "",
      annee: defaultValues?.annee ?? new Date().getFullYear(),
      lu: defaultValues?.lu ?? false,
    },
  });

  return (
    <View style={styles.container}>
      {serverError && (
        <View style={styles.serverErrorBanner}>
          <Text style={styles.serverErrorText}>{serverError}</Text>
        </View>
      )}

      {/* Champ Titre */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Titre *</Text>
        <Controller
          control={control}
          name="titre"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.titre && styles.inputError]}
              placeholder="Ex: Le Comte de Monte-Cristo"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isSubmitting}
            />
          )}
        />
        {errors.titre && (
          <Text style={styles.errorText}>{errors.titre.message}</Text>
        )}
      </View>

      {/* Champ Auteur */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Auteur *</Text>
        <Controller
          control={control}
          name="auteur"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.auteur && styles.inputError]}
              placeholder="Ex: Alexandre Dumas"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isSubmitting}
            />
          )}
        />
        {errors.auteur && (
          <Text style={styles.errorText}>{errors.auteur.message}</Text>
        )}
      </View>

      {/* Champ Éditeur */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Éditeur *</Text>
        <Controller
          control={control}
          name="editeur"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.editeur && styles.inputError]}
              placeholder="Ex: Gallimard"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isSubmitting}
            />
          )}
        />
        {errors.editeur && (
          <Text style={styles.errorText}>{errors.editeur.message}</Text>
        )}
      </View>

      {/* Champ Année */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Année de parution *</Text>
        <Controller
          control={control}
          name="annee"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.annee && styles.inputError]}
              placeholder="Ex: 1844"
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={(text) => {
                const parsed = parseInt(text, 10);
                onChange(isNaN(parsed) ? 0 : parsed);
              }}
              value={
                value !== undefined && value !== null ? value.toString() : ""
              }
              editable={!isSubmitting}
            />
          )}
        />
        {errors.annee && (
          <Text style={styles.errorText}>{errors.annee.message}</Text>
        )}
      </View>

      {/* Switch Statut Lu */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>Ouvrage lu par l'équipe</Text>
        <Controller
          control={control}
          name="lu"
          render={({ field: { onChange, value } }) => (
            <Switch
              value={Boolean(value)}
              onValueChange={onChange}
              disabled={isSubmitting}
              trackColor={{ false: "#cbd5e1", true: "#86efac" }}
              thumbColor={value ? "#15803d" : "#f8fafc"}
            />
          )}
        />
      </View>

      {/* Bouton de validation */}
      <Pressable
        style={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit((data) => onSubmit(data))}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>{submitLabel}</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  serverErrorBanner: {
    backgroundColor: "#fee2e2",
    borderColor: "#fca5a5",
    borderWidth: 1,
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  serverErrorText: {
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: "500",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fff5f5",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  submitButton: {
    backgroundColor: "#0284c7",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
