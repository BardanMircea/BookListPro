export const noteKeys = {
  all: ["notes"] as const,
  byBook: (livreId: string) => [...noteKeys.all, "book", livreId] as const,
};
