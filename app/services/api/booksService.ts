import { z } from "zod";
import {
  Livre,
  LivreFormData,
  LivreSchema,
  PaginatedBooks,
  PaginatedBooksSchema,
} from "../../domain/livre";
import { request } from "./httpClient";

export type BookFilters = {
  page?: number;
  limit?: number;
  q?: string;
  status?: "lu" | "nonlu";
  favori?: boolean;
  sort?: "titre" | "auteur" | "annee" | "note" | "updatedAt";
  order?: "asc" | "desc";
};

export const booksService = {
  getAll: (page: number = 1, limit: number = 20): Promise<PaginatedBooks> => {
    return request(`/books?page=${page}&limit=${limit}`, PaginatedBooksSchema);
  },

  getById: (id: string): Promise<Livre> => {
    return request(`/books/${id}`, LivreSchema);
  },

  create: (data: LivreFormData): Promise<Livre> => {
    return request("/books", LivreSchema, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: (
    id: string,
    data: LivreFormData,
    version: number,
  ): Promise<Livre> => {
    return request(`/books/${id}`, LivreSchema, {
      method: "PUT",
      version,
      body: JSON.stringify(data),
    });
  },

  toggleLu: (id: string, lu: boolean): Promise<Livre> => {
    return request(`/books/${id}`, LivreSchema, {
      method: "PATCH",
      body: JSON.stringify({ lu }),
    });
  },

  delete: (id: string): Promise<null> => {
    return request(`/books/${id}`, z.null(), {
      method: "DELETE",
    });
  },

  getAllFiltered: (
    filters: BookFilters,
    signal?: AbortSignal,
  ): Promise<PaginatedBooks> => {
    const params = new URLSearchParams();
    if (filters.page) params.set("page", filters.page.toString());
    if (filters.limit) params.set("limit", filters.limit.toString());
    if (filters.q) params.set("q", filters.q);
    if (filters.status) params.set("status", filters.status);
    if (filters.favori !== undefined)
      params.set("favori", filters.favori.toString());
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.order) params.set("order", filters.order);

    return request(`/books?${params.toString()}`, PaginatedBooksSchema, {
      signal,
    });
  },

  toggleFavori: (id: string, favori: boolean): Promise<Livre> => {
    return request(`/books/${id}`, LivreSchema, {
      method: "PATCH",
      body: JSON.stringify({ favori }),
    });
  },
};
