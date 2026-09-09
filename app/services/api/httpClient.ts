import { z } from "zod";
import { AppError } from "../../domain/errors";

const BASE_URL = "http://localhost:3000";
const DEFAULT_TIMEOUT_MS = 8000;

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  version?: number; // Pour l'en-tête If-Match
}

export async function request<T>(
  endpoint: string,
  schema: z.ZodSchema<T>,
  options: RequestOptions = {},
): Promise<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    version,
    headers,
    ...customConfig
  } = options;

  const controller = new AbortController();
  const idTimeout = setTimeout(() => controller.abort(), timeoutMs);

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (version !== undefined) {
    requestHeaders["If-Match"] = version.toString();
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...customConfig,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(idTimeout);

    // Suppression réussie (204 No Content)
    if (response.status === 204) {
      return schema.parse(null);
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Traduction ciblée des codes HTTP en erreurs applicatives
      if (response.status === 422) {
        throw {
          type: "VALIDATION",
          message: payload.message ?? "Données invalides",
          champs: payload.champs,
        } satisfies AppError;
      }

      if (response.status === 409) {
        throw {
          type: "CONFLIT",
          message: payload.message ?? "Conflit de version détecté",
          versionAttendue: payload.versionAttendue,
        } satisfies AppError;
      }

      if (response.status === 401 || response.status === 403) {
        throw {
          type: "AUTH",
          message: payload.message ?? "Action non autorisée",
        } satisfies AppError;
      }

      // 503 (Chaos mode), 500, etc.
      throw {
        type: "RESEAU",
        message: payload.message ?? `Erreur serveur (${response.status})`,
      } satisfies AppError;
    }

    // Validation Zod au runtime : si le contrat backend est rompu, ça lève une exception
    return schema.parse(payload);
  } catch (error: unknown) {
    clearTimeout(idTimeout);

    // Si l'erreur est déjà un AppError typé, on la propage
    if (typeof error === "object" && error !== null && "type" in error) {
      throw error as AppError;
    }

    // Erreur réseau brute ou timeout de l'AbortController
    const isTimeout = error instanceof Error && error.name === "AbortError";
    throw {
      type: "RESEAU",
      message: isTimeout
        ? "Délai d’attente dépassé (timeout)."
        : "Impossible de joindre le serveur.",
    } satisfies AppError;
  }
}
