import { COVER_UPLOAD } from "@/constants/constants";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Livre, LivreSchema } from "../domain/livre";
import { request } from "./api/httpClient";

export const coverUploadService = {
  pickAndUploadCover: async (bookId: string): Promise<Livre | null> => {
    // 1. Demande d'accès et sélection
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [...COVER_UPLOAD.aspect],
      quality: COVER_UPLOAD.pickerQuality,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];

    // 2. Redimensionnement et compression pour ne pas saturer l'API
    const manipulated = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: COVER_UPLOAD.width } }], // Largeur max de 600 px
      { compress: COVER_UPLOAD.compression, format: ImageManipulator.SaveFormat.JPEG, base64: true },
    );

    if (!manipulated.base64) {
      throw {
        type: "RESEAU",
        message: "Échec de l’encodage base64 de l’image.",
      };
    }

    // 3. Envoi au backend : POST /books/:id/cover
    return request(`/books/${bookId}/cover`, LivreSchema, {
      method: "POST",
      body: JSON.stringify({
        image: `data:image/jpeg;base64,${manipulated.base64}`,
      }),
    });
  },

  resetCover: async (bookId: string): Promise<Livre> => {
    return request(`/books/${bookId}/cover`, LivreSchema, {
      method: "DELETE",
    });
  },
};
