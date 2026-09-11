## Ajouts après 17 h 00 — Tests automatisés

Les tests sont regroupés dans [tests/](tests/README.md), en dehors des routes Expo Router. Ils utilisent **Jest 29**, **jest-expo 54** et **React Native Testing Library 13**. La configuration se trouve dans [jest.config.js](jest.config.js).

### Commandes

| Commande                | Utilisation                                                                    |
| ----------------------- | ------------------------------------------------------------------------------ |
| `npm test`              | Exécuter toute la suite une fois, générer la couverture et vérifier les seuils |
| `npm run test:watch`    | Relancer les tests pendant le développement, sans couverture                   |
| `npm run test:coverage` | Exécuter explicitement la suite avec le rapport de couverture                  |

Pour exécuter uniquement les tests du service de livres :

```bash
npm test -- --runTestsByPath tests/services/booksService.test.ts --coverage=false
```

Sous PowerShell, si `npm.ps1` est bloqué par la politique d’exécution, utiliser `npm.cmd` à la place de `npm`, par exemple `npm.cmd test`.

### Organisation

```text
tests/
├── components/   # EmptyView, ErrorView et RatingStars
├── domain/       # Règles de validation Zod
├── helpers/      # Livres, notes et réponses HTTP de test
├── hooks/        # useBooks avec API simulée
├── services/     # Client HTTP et services applicatifs
├── setup.ts      # Simulation réseau et nettoyage entre les tests
└── README.md     # Détails et limites des scénarios
```

Les fichiers de tests portent l’extension `.test.ts` ou `.test.tsx`.

### Tests ajoutés et comportements vérifiés

| Partie               | Scénarios                                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `httpClient`         | Validation des réponses, en-têtes, réponse 204, erreurs 401/403/409/422/503, réponse non JSON, panne réseau et timeout                                                    |
| `booksService`       | Lecture, création, modification et suppression ; pagination ; encodage des filtres ; conservation de `favori=false` ; transmission de `If-Match` et remontée des conflits |
| `notesService`       | Chargement, création, suppression et rejet d’une note invalide reçue du serveur                                                                                           |
| `openLibraryService` | Recherche encodée, transformation des métadonnées, champs optionnels et repli en cas d’échec ou de résultat vide                                                          |
| Couvertures          | Résolution des URL, image de repli, annulation de sélection, compression JPEG, envoi du base64 et réinitialisation                                                        |
| `EmptyView`          | Messages par défaut/personnalisés, déclenchement et affichage conditionnel de l’action                                                                                    |
| `ErrorView`          | Message adapté au type d’erreur et bouton de relance                                                                                                                      |
| `RatingStars`        | Attribution d’une note, remise à zéro et lecture seule                                                                                                                    |
| `useBooks`           | Chargement, résultat vide, erreur et relance, changement de filtres et limites de pagination                                                                              |
| Schémas du domaine   | Champs obligatoires, années limites, notes de 0 à 5, pagination et longueur du contenu d’une note                                                                         |

Les tests des services et du hook simulent la frontière réseau avec **un mock de `fetch`** : les services, le client HTTP et les validations Zod sont réellement exécutés. Aucun serveur n’est nécessaire pour les lancer. Les modules natifs de sélection/compression d’images et AsyncStorage sont également simulés.

Chaque test du hook utilise un cache React Query indépendant, avec les nouvelles tentatives automatiques désactivées.
