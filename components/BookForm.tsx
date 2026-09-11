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
import { LivreFormData, LivreSchema } from "../app/domain/livre";

import { theme } from "@/constants/constants";
import { useI18n } from "../app/i18n/i18n";
import { useAppTheme } from "../app/theme/ThemeContext";

// Schéma de formulaire dérivé (champs éditables)
const FormSchema = LivreSchema.pick({
  titre: true,
  auteur: true,
  editeur: true,
  annee: true,
  lu: true,
});

type BookFormProps = {
  defaultValues?: Partial<LivreFormData>;
  onSubmit: (data: LivreFormData) => Promise<void> | void;
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
  const { colors } = useAppTheme();
  const { language } = useI18n();

  const isFr = language === "fr";

  const labels = {
    titre: isFr ? "Titre de l’ouvrage" : "Book title",
    titrePlaceholder: isFr
      ? "Ex. Le Rouge et le Noir"
      : "e.g. The Red and the Black",
    auteur: isFr ? "Auteur" : "Author",
    auteurPlaceholder: isFr ? "Ex. Stendhal" : "e.g. Stendhal",
    editeur: isFr ? "Éditeur" : "Publisher",
    editeurPlaceholder: isFr ? "Ex. Gallimard" : "e.g. Penguin Books",
    annee: isFr ? "Année de publication" : "Publication year",
    anneePlaceholder: isFr ? "Ex. 1830" : "e.g. 1830",
    lu: isFr ? "Ouvrage lu par l’équipe" : "Read by the bookstore team",
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LivreFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      titre: defaultValues?.titre ?? "",
      auteur: defaultValues?.auteur ?? "",
      editeur: defaultValues?.editeur ?? "",
      annee: defaultValues?.annee ?? new Date().getFullYear(),
      lu: defaultValues?.lu ?? false,
    },
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {/* Erreur globale du serveur (ex. 409 conflit ou validation serveur) */}
      {serverError && (
        <View
          style={[
            styles.serverErrorBox,
            {
              backgroundColor: colors.dangerBg,
              borderColor: colors.dangerBorder,
            },
          ]}
        >
          <Text style={[styles.serverErrorText, { color: colors.danger }]}>
            {serverError}
          </Text>
        </View>
      )}

      {/* Titre */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          {labels.titre} *
        </Text>
        <Controller
          control={control}
          name="titre"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: errors.titre ? colors.danger : colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder={labels.titrePlaceholder}
              placeholderTextColor={colors.textMuted}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isSubmitting}
              accessibilityLabel={labels.titre}
            />
          )}
        />
        {errors.titre && (
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {errors.titre.message}
          </Text>
        )}
      </View>

      {/* Auteur */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          {labels.auteur} *
        </Text>
        <Controller
          control={control}
          name="auteur"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: errors.auteur ? colors.danger : colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder={labels.auteurPlaceholder}
              placeholderTextColor={colors.textMuted}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isSubmitting}
              accessibilityLabel={labels.auteur}
            />
          )}
        />
        {errors.auteur && (
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {errors.auteur.message}
          </Text>
        )}
      </View>

      {/* Éditeur */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          {labels.editeur} *
        </Text>
        <Controller
          control={control}
          name="editeur"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: errors.editeur ? colors.danger : colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder={labels.editeurPlaceholder}
              placeholderTextColor={colors.textMuted}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isSubmitting}
              accessibilityLabel={labels.editeur}
            />
          )}
        />
        {errors.editeur && (
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {errors.editeur.message}
          </Text>
        )}
      </View>

      {/* Année */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          {labels.annee} *
        </Text>
        <Controller
          control={control}
          name="annee"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: errors.annee ? colors.danger : colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder={labels.anneePlaceholder}
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={(text) => {
                const parsed = parseInt(text, 10);
                onChange(isNaN(parsed) ? 0 : parsed);
              }}
              value={value ? value.toString() : ""}
              editable={!isSubmitting}
              accessibilityLabel={labels.annee}
            />
          )}
        />
        {errors.annee && (
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {errors.annee.message}
          </Text>
        )}
      </View>

      {/* Statut Lu */}
      <View
        style={[styles.switchGroup, { borderTopColor: colors.borderLight }]}
      >
        <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>
          {labels.lu}
        </Text>
        <Controller
          control={control}
          name="lu"
          render={({ field: { onChange, value } }) => (
            <Switch
              value={value}
              onValueChange={onChange}
              disabled={isSubmitting}
              trackColor={{ false: colors.border, true: colors.primaryHover }}
              thumbColor={value ? colors.primary : colors.borderLight}
              accessibilityLabel={labels.lu}
            />
          )}
        />
      </View>

      {/* Bouton de validation */}
      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          { backgroundColor: colors.primary },
          (isSubmitting || pressed) && { opacity: 0.8 },
        ]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel={submitLabel}
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
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
  },
  serverErrorBox: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
  },
  serverErrorText: {
    fontSize: 13,
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  input: {
    minHeight: theme.layout.minTouchTarget,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
  switchGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderTopWidth: 1,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  submitButton: {
    minHeight: theme.layout.minTouchTarget,
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
