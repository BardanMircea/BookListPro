export type ErreurReseau = {
  readonly type: "RESEAU";
  readonly message: string;
};

export type ErreurValidation = {
  readonly type: "VALIDATION";
  readonly message: string;
  readonly champs?: Record<string, string>; // ex: { titre: "Le titre est requis" }
};

export type ErreurConflit = {
  readonly type: "CONFLIT";
  readonly message: string;
  readonly versionAttendue?: number;
};

export type ErreurAuth = {
  readonly type: "AUTH";
  readonly message: string;
};

// L'équivalent d'une interface Java AppException scellée
export type AppError =
  | ErreurReseau
  | ErreurValidation
  | ErreurConflit
  | ErreurAuth;
