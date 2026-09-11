import { Platform } from "react-native";
import { FONT_FAMILIES } from "@/constants/constants";

// Compatibilité pour les imports existants. Les valeurs sont centralisées.
export { Colors, theme } from "@/constants/constants";
export const Fonts = Platform.select<Record<keyof typeof FONT_FAMILIES.ios, string>>(FONT_FAMILIES);
