# Tests automatisés

Ce dossier regroupe les tests ajoutés après 17 h 00. Nous avons mis en place
la configuration Jest/Testing Library, les simulations nécessaires, les scénarios
ci-dessous et le contrôle de la couverture pour répondre aux contraintes du projet.

Depuis la racine :

```sh
npm test
npm run test:watch
npm run test:coverage
```

Sous PowerShell, si la politique d’exécution bloque `npm.ps1`, utiliser `npm.cmd test`.
`npm test` termine après une exécution et génère aussi la couverture dans
`coverage/index.html`. Le mode watch désactive la couverture pour accélérer les relances.

La configuration utilise Jest 29 et `jest-expo` 54 pour Expo SDK 54.
Testing Library 13 utilise `react-test-renderer` 19.1.0, aligné sur React du projet.

## Scénarios

| Dossier | Comportements vérifiés |
| --- | --- |
| `services/` | Requêtes et payloads des livres/notes, pagination, filtres encodés, If-Match et conflit 409, erreurs HTTP, contrats invalides, timeout, repli Open Library, résolution de couverture, compression et téléversement |
| `components/` | Messages et action de `EmptyView`, erreurs et relance de `ErrorView`, sélection/réinitialisation/lecture seule de `RatingStars` |
| `hooks/` | `useBooks` : chargement, succès, liste vide, erreur et relance, changement des filtres, bornes de pagination |
| `domain/` | Règles Zod : champs obligatoires, années limites, notes de 0 à 5, pagination, longueur du contenu |

Les tests de services et du hook simulent `fetch`, sans remplacer les services,
le client HTTP ou les validations Zod. Chaque test de hook a son propre cache
React Query, sans retry automatique. Les modules natifs de sélection/compression
et AsyncStorage sont simulés ; aucun serveur ou téléphone n’est nécessaire.

La couverture inclut **tous** les fichiers de `app/domain/` et `app/services/`,
même ceux non importés par les tests. Un minimum de 40 % est imposé séparément
pour chaque dossier (lignes, instructions, fonctions et branches).
Les types TypeScript purs, comme `AppError`, n’ont pas de comportement exécutable.
Les schémas Zod sont en revanche des validations exécutables et testables.
Leur couverture d’instructions ne remplace pas les assertions sur les limites.

Il n’existe pas de fonction pure de tri, calcul ou résolution de conflit dans
`domain/` actuellement. Les tests vérifient les règles présentes et la fonction
pure `resolveCoverUrl`, sans inventer de logique pour satisfaire la grille.
Le test du conflit vérifie sa remontée depuis l’API, pas une fusion de versions.

Limites connues hors de ces scénarios : `httpClient` remplace actuellement le
signal d’annulation fourni par l’appelant par celui de son timeout ; Open Library
utilise le signal externe à la place du signal de timeout lorsqu’il est fourni.
L’annulation externe combinée au timeout reste donc à corriger et tester.
Une réponse incompatible avec Zod est actuellement traduite en erreur `RESEAU`.

Références : [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/) et
[guide de tests Expo](https://docs.expo.dev/develop/unit-testing/).
