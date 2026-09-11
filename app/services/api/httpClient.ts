import { API_BASE_URL, DEFAULT_TIMEOUT_MS, HTTP_STATUS } from "@/constants/constants";
import { z } from "zod";
import { AppError } from "../../domain/errors";
import { createRequestCancellation } from "./requestCancellation";


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
    signal,
    ...customConfig
  } = options;

  const cancellation = createRequestCancellation(timeoutMs, signal);

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (version !== undefined) {
    requestHeaders["If-Match"] = version.toString();
  }

  try {
    cancellation.throwIfAborted();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...customConfig,
      headers: requestHeaders,
      signal: cancellation.signal,
    });

    cancellation.throwIfAborted();

    // Suppression réussie (204 No Content)
    if (response.status === HTTP_STATUS.NO_CONTENT) {
      return schema.parse(null);
    }

    const payload = await response.json().catch((error: unknown) => {
      cancellation.throwIfAborted();
      if (error instanceof Error && error.name === "AbortError") throw error;
      return {};
    });
    cancellation.throwIfAborted();

    if (!response.ok) {
      // Traduction ciblée des codes HTTP en erreurs applicatives
      if (response.status === HTTP_STATUS.VALIDATION) {
        throw {
          type: "VALIDATION",
          message: payload.message ?? "Données invalides",
          champs: payload.champs,
        } satisfies AppError;
      }

      if (response.status === HTTP_STATUS.CONFLICT) {
        throw {
          type: "CONFLIT",
          message: payload.message ?? "Conflit de version détecté",
          versionAttendue: payload.versionAttendue,
        } satisfies AppError;
      }

      if (response.status === HTTP_STATUS.UNAUTHORIZED || response.status === HTTP_STATUS.FORBIDDEN) {
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
    // Une annulation volontaire n'est pas une panne ni un timeout.
    if (cancellation.signal.aborted && !cancellation.timedOut) {
      cancellation.throwIfAborted();
    }

    // Si l'erreur est déjà un AppError typé, on la propage
    if (typeof error === "object" && error !== null && "type" in error) {
      throw error as AppError;
    }

    // Erreur réseau brute ou timeout de l'AbortController
    const isTimeout = cancellation.timedOut;
    throw {
      type: "RESEAU",
      message: isTimeout
        ? "Délai d’attente dépassé (timeout)."
        : "Impossible de joindre le serveur.",
    } satisfies AppError;
  } finally {
    cancellation.dispose();
  }
}
