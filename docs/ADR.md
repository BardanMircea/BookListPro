# Décisions d’architecture — BookListPro

Ce document formalise trois décisions déjà appliquées dans le client. Les dates correspondent à leur documentation, et non à la date initiale de leur implémentation.

---

# ADR 001 — Gestion des données serveur avec TanStack Query

## Statut

Accepté — 11/09/2026

## Contexte

La bibliothèque, les fiches détaillées et les formulaires utilisent les mêmes livres issus d’une API REST. Une modification depuis un écran doit être répercutée dans les autres vues. Les listes dépendent aussi de la recherche, des filtres et de la pagination.

Contraintes : conserver un affichage réactif sur mobile, partager les données entre écrans, gérer les chargements et les erreurs, et éviter de dupliquer la synchronisation du cache dans chaque composant. Le périmètre actuel ne comprend pas de stockage persistant des livres ni de file de mutations hors ligne.

## Options envisagées

1. `fetch` avec `useEffect` et état local dans chaque écran : peu de dépendances, mais duplication des états de chargement, des relances et de la synchronisation.
2. Un store global géré manuellement : partage explicite des données, mais nécessité de développer les règles de cache, d’invalidation et de restauration après erreur.
3. TanStack Query avec des hooks dédiés : gestion commune des requêtes, mutations et caches, au prix d’une dépendance et de conventions à respecter.

## Décision

Nous retenons l’option 3. Un `QueryClient` est créé à la racine de l’application. Les hooks partagent des clés de cache centralisées : les listes incluent leurs filtres et les fiches utilisent l’identifiant du livre.

Les mutations mettent à jour ou invalident les caches concernés. Les bascules lu/non lu et favori sont optimistes : elles sauvegardent l’état précédent, actualisent immédiatement les listes et la fiche, restaurent cet état en cas d’échec, puis invalident les requêtes pour resynchroniser les données.

Les préférences de langue et de thème restent dans leurs contextes React et sont persistées avec AsyncStorage. Le cache des données serveur reste en mémoire.

Implémentation : [providers](../app/_layout.tsx), [clés de cache](../constants/constants.ts), [hook de liste](../hooks/useBooks.ts) et [mutations optimistes](../hooks/useOptimisticBookToggles.ts).

## Conséquences

**Positives :** les écrans partagent les données ; les états de chargement et d’erreur sont standardisés ; les actions simples répondent immédiatement ; le hook de liste peut être testé avec un cache indépendant et une API simulée.

**Négatives :** chaque mutation doit invalider les bonnes clés ; les restaurations de snapshots demandent une attention particulière si plusieurs mutations se chevauchent ; les données ne sont pas conservées après fermeture de l’application. Le défaut initial de propagation du signal externe au transport a été corrigé et documenté dans [IA.md](IA.md).

**À revoir si :** un usage hors ligne devient nécessaire, les volumes rendent le cache coûteux ou les modifications simultanées provoquent des incohérences. Il faudra alors étudier la persistance, la synchronisation et la coordination des mutations.

---

# ADR 002 — Validation des contrats API et centralisation des erreurs

## Statut

Accepté — 11/09/2026

## Contexte

Le client consomme une API REST indépendante et un service tiers, Open Library. Les types TypeScript ne garantissent pas la validité des données JSON reçues à l’exécution. Une réponse incorrecte peut introduire des valeurs incompatibles avec les composants ou le cache.

Contraintes : vérifier les données externes, partager les règles de validation avec les formulaires, fournir des erreurs exploitables par l’interface et tester les services sans serveur réel.

## Options envisagées

1. Utiliser uniquement les types TypeScript et des conversions de type : simple, mais aucune vérification des réponses à l’exécution.
2. Écrire des validations et traductions d’erreurs dans chaque écran : adaptation locale possible, mais duplication et risque de comportements divergents.
3. Définir des schémas Zod et centraliser le transport de l’API principale : contrats explicites et traitement homogène, avec un coût de validation et de maintenance des schémas.

## Décision

Nous retenons l’option 3. Les schémas Zod du domaine décrivent les livres, la pagination, les notes et les formulaires. Les types correspondants sont inférés à partir des schémas.

Les services de l’API principale utilisent la fonction `request`, qui prépare la requête, applique un timeout, traite les réponses sans contenu et valide la réponse avec le schéma fourni. Elle traduit les erreurs HTTP en catégories `VALIDATION`, `CONFLIT`, `AUTH` et `RESEAU`.

Open Library conserve un traitement distinct : ses données sont complémentaires. Son service valide la réponse et retourne un résultat de repli en cas de panne ou de contrat invalide, afin de ne pas bloquer la consultation du livre.

Les tests simulent `fetch` et exécutent les vrais services et schémas pour vérifier cette frontière.

Implémentation : [schéma des livres](../app/domain/livre.ts), [schéma des notes](../app/domain/note.ts), [erreurs applicatives](../app/domain/errors.ts), [client HTTP](../app/services/api/httpClient.ts) et [service Open Library](../app/services/api/openLibraryService.ts).

## Conséquences

**Positives :** les réponses incompatibles sont rejetées avant leur utilisation ; les règles sont explicites et testables ; les écrans manipulent des catégories d’erreurs communes ; une indisponibilité d’Open Library n’empêche pas l’affichage des données principales.

**Négatives :** les schémas doivent évoluer avec le backend ; la validation ajoute un traitement à chaque réponse ; une rupture de contrat Zod est actuellement traduite en erreur `RESEAU`, ce qui rend le diagnostic moins précis. Le repli silencieux d’Open Library ne distingue pas une panne d’une absence de résultat pour l’utilisateur.

**À revoir si :** plusieurs versions d’API doivent coexister, les contrats changent fréquemment ou le diagnostic des incidents devient insuffisant. Une catégorie dédiée aux erreurs de contrat, une génération depuis une spécification API et une meilleure observabilité pourront être introduites.

---

# ADR 003 — Stratégie de résolution des conflits de version

## Statut

Accepté — 11/09/2026

## Contexte

Un utilisateur peut ouvrir un formulaire, puis enregistrer ses modifications après qu’un autre client a modifié le même livre. Sans contrôle de version, l’enregistrement risque d’écraser une modification concurrente.

Chaque livre possède un champ `version`. La modification complète transmet cette version au serveur. Le client actuel ne gère ni mutations hors ligne persistées ni historique permettant une fusion à trois versions.

Contraintes : détecter une édition obsolète, informer l’utilisateur, éviter un écrasement automatique et conserver une interface adaptée au périmètre du projet. Le backend doit contrôler la version de façon atomique ; le client seul ne peut pas garantir cette protection.

## Options envisagées

1. Le client gagne : enregistrer sans contrôle de version, avec le risque d’écraser le travail d’un autre utilisateur.
2. Refuser l’édition obsolète et demander un rechargement : préserver la version serveur et signaler le conflit, au prix d’une reprise manuelle de la saisie.
3. Fusion assistée : comparer les versions et permettre un choix par champ, avec un coût supplémentaire de stockage, de règles métier et d’interface.

## Décision

Nous retenons l’option 2 pour la modification complète d’un livre via `PUT /books/:id`.

Le service envoie la version du livre chargé dans l’en-tête `If-Match`. Selon le contrat attendu par ce projet, le serveur refuse une version obsolète avec HTTP 409. Le client traduit cette réponse en erreur `CONFLIT`, en conservant l’éventuelle `versionAttendue`.

L’écran d’édition affiche un message indiquant que le livre a été modifié ailleurs et invite à recharger la fiche. Il n’écrase pas automatiquement les données serveur et ne réalise aucune fusion. Aucun parcours dédié de comparaison ou de rechargement avec sauvegarde du brouillon n’est implémenté.

Cette décision ne couvre pas les modifications partielles de `lu`, `favori` et `note` : les appels `PATCH` actuels n’envoient pas de version. La restauration d’un cache après un échec réseau est distincte de la résolution d’un conflit entre utilisateurs.

Implémentation : [service des livres](../app/services/api/booksService.ts), [traduction du conflit](../app/services/api/httpClient.ts) et [écran d’édition](../app/books/edit/[id].tsx). Le [test du service](../tests/services/booksService.test.ts) vérifie l’envoi de `If-Match` et la remontée du conflit ; il ne vérifie pas le contrôle atomique du serveur externe.

## Conséquences

**Positives :** les éditions complètes obsolètes peuvent être rejetées sans écrasement silencieux, sous réserve du contrôle serveur ; le conflit est visible ; le mécanisme reste simple et testable côté client.

**Négatives :** l’utilisateur doit reprendre manuellement son édition ; un rechargement peut lui faire perdre une saisie non sauvegardée ; les mises à jour partielles restent hors de cette protection ; le fonctionnement dépend du respect du contrat par le backend.

**À revoir si :** les conflits deviennent fréquents, la collaboration simultanée se généralise ou un mode hors ligne est ajouté. Il faudra alors envisager une sauvegarde des brouillons, une comparaison avec la version serveur, une fusion assistée et l’extension du contrôle de version aux mutations partielles.
