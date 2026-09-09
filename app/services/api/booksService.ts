import { z } from "zod";
import {
  Livre,
  LivreFormData,
  LivreSchema,
  PaginatedBooks,
  PaginatedBooksSchema,
} from "../../domain/livre";
import { request } from "./httpClient";

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
};
