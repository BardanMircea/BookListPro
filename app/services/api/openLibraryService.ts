import { OPEN_LIBRARY } from "@/constants/constants";
import { z } from "zod";
import { createRequestCancellation } from "./requestCancellation";

export const OpenLibraryDocSchema = z.object({
  title: z.string().optional(),
  first_publish_year: z.number().optional(),
  edition_count: z.number().default(0),
  cover_i: z.number().optional(),
});

export const OpenLibraryResponseSchema = z.object({
  numFound: z.number(),
  docs: z.array(OpenLibraryDocSchema),
});

export type OpenLibraryData = {
  trouve: boolean;
  nombreEditions: number;
  premiereAnneePublication?: number;
  couvertureSecoursUrl?: string;
};

export async function fetchOpenLibraryData(
  titre: string,
  signal?: AbortSignal,
): Promise<OpenLibraryData> {
  const fallbackResult: OpenLibraryData = {
    trouve: false,
    nombreEditions: 0,
  };

  if (!titre || titre.trim().length === 0) {
    return fallbackResult;
  }

  const cancellation = createRequestCancellation(OPEN_LIBRARY.timeoutMs, signal);

  try {
    cancellation.throwIfAborted();
    const encodedTitle = encodeURIComponent(titre.trim());
    const response = await fetch(
      `${OPEN_LIBRARY.searchUrl}?title=${encodedTitle}&limit=${OPEN_LIBRARY.searchLimit}`,
      {
        signal: cancellation.signal,
      },
    );

    cancellation.throwIfAborted();

    if (!response.ok) {
      return fallbackResult; // Dégradation silencieuse
    }

    const json = await response.json();
    cancellation.throwIfAborted();
    const parsed = OpenLibraryResponseSchema.safeParse(json);

    if (!parsed.success || parsed.data.docs.length === 0) {
      return fallbackResult;
    }

    const doc = parsed.data.docs[0];
    return {
      trouve: true,
      nombreEditions: doc.edition_count ?? 0,
      premiereAnneePublication: doc.first_publish_year,
      couvertureSecoursUrl: doc.cover_i
        ? `${OPEN_LIBRARY.coversUrl}/${doc.cover_i}-M.jpg`
        : undefined,
    };
  } catch {
    if (cancellation.signal.aborted && !cancellation.timedOut) {
      cancellation.throwIfAborted();
    }
    // En cas de panne d'OpenLibrary ou de timeout : retour silencieux du repli
    return fallbackResult;
  } finally {
    cancellation.dispose();
  }
}
