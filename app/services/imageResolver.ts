import { API_BASE_URL, DEFAULT_BOOK_COVER } from "@/constants/constants";
export { DEFAULT_BOOK_COVER } from "@/constants/constants";

/**
 * Résout une couverture selon les 3 cas exigés :
 * 1. null / undefined / vide -> image de repli par défaut
 * 2. URL absolue (http://... ou https://...) -> conservée intacte
 * 3. Chemin relatif (/covers/...) -> préfixé par l'URL de base de l'API
 */
export function resolveCoverUrl(couverture: string | null | undefined): string {
  if (!couverture || couverture.trim() === "") {
    return DEFAULT_BOOK_COVER;
  }

  const trimmed = couverture.trim();

  // Déjà une URL absolue
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Chemin relatif : assurer le slash initial
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
