# BookListPro

Application de gestion d’une bibliothèque personnelle développée avec **React Native, Expo et TypeScript**. BookListPro permet d’organiser ses ouvrages, de suivre ses lectures et de conserver ses appréciations et notes dans une interface proposant des thèmes clair et sombre ainsi qu’un choix de langue français/anglais.

Le projet contient le client de l’application. Les livres et les notes sont enregistrés par une **API REST distincte**, à démarrer et configurer séparément.

## Démarrage rapide

Le parcours le plus court utilise **la version web**, sans émulateur ni installation globale d’Expo. Prévoir Git, Node.js 20.19 minimum et npm déjà installés. Le temps d’installation dépend de la connexion et de la machine.

**Pour utiliser les livres, il faut disposer d’une API déjà démarrée.** Son code et sa commande de lancement ne sont pas fournis dans ce dépôt. Demander au mainteneur l’URL d’une API accessible ou le dépôt backend et ses instructions. Sans cette API, le client peut démarrer, mais la bibliothèque affichera une erreur réseau ; les tests restent exécutables.

### 1. Récupérer et installer le projet

```bash
git clone https://github.com/BardanMircea/BookListPro.git
cd BookListPro
npm ci
```

Si le dépôt est déjà ouvert sur votre machine, exécuter seulement `npm ci` depuis le dossier contenant `package.json`.

### 2. Vérifier la connexion à l’API

La configuration par défaut utilise `http://localhost:3000`. Si le serveur est disponible à cette adresse, aucune modification n’est nécessaire. Sinon, modifier uniquement la valeur de `API_BASE_URL` dans [constants/constants.ts](constants/constants.ts) avec l’URL fournie par le mainteneur, sans slash final. Aucun fichier `.env` ni clé Open Library n’est requis par le client.

Ouvrir `http://localhost:3000/books?page=1&limit=1` dans le navigateur, en adaptant l’adresse si nécessaire. Le serveur doit renvoyer du JSON contenant `items`, `page`, `limit`, `total` et `totalPages`.

### 3. Lancer le client web

```bash
npm run web
```

Ouvrir l’adresse locale affichée par Expo si le navigateur ne s’ouvre pas automatiquement. Le démarrage est réussi lorsque **BookListPro** affiche les livres ou un état vide, sans erreur réseau. Utiliser le bouton **+** pour créer un premier ouvrage si l’API autorise les écritures.

### 4. Vérifier les tests

Dans un second terminal, à la racine du projet :

```bash
npm test
```

Cette commande fonctionne **sans API** grâce aux réponses réseau simulées. Elle termine après l’exécution et produit le rapport `coverage/index.html`.

**Windows / PowerShell :** si `npm.ps1` est bloqué, utiliser `npm.cmd ci`, `npm.cmd run web` et `npm.cmd test`.

## Sommaire

- [BookListPro](#booklistpro)
  - [Démarrage rapide](#démarrage-rapide)
    - [1. Récupérer et installer le projet](#1-récupérer-et-installer-le-projet)
    - [2. Vérifier la connexion à l’API](#2-vérifier-la-connexion-à-lapi)
    - [3. Lancer le client web](#3-lancer-le-client-web)
    - [4. Vérifier les tests](#4-vérifier-les-tests)
  - [Sommaire](#sommaire)
  - [Fonctionnalités](#fonctionnalités)
  - [Technologies](#technologies)
  - [Installation et démarrage](#installation-et-démarrage)
    - [Prérequis](#prérequis)
    - [Installer les dépendances](#installer-les-dépendances)
    - [Démarrer l’application](#démarrer-lapplication)
  - [Configuration](#configuration)
    - [Adresse du serveur](#adresse-du-serveur)
    - [Paramètres principaux](#paramètres-principaux)
  - [Dépannage du premier lancement](#dépannage-du-premier-lancement)
  - [Architecture](#architecture)
  - [Contrat API](#contrat-api)
  - [Gestion des données](#gestion-des-données)
    - [Cache et mises à jour](#cache-et-mises-à-jour)
    - [Validation, erreurs et conflits](#validation-erreurs-et-conflits)
  - [Tests et qualité](#tests-et-qualité)
    - [Ajouts après 17 h 00 — Tests automatisés](#ajouts-après-17-h-00--tests-automatisés)
    - [Exécution](#exécution)
    - [Couverture](#couverture)
    - [Vérifications complémentaires](#vérifications-complémentaires)
  - [Limites actuelles](#limites-actuelles)

## Fonctionnalités

| Fonctionnalité        | Description                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| Bibliothèque          | Liste paginée, recherche avec temporisation de la saisie et consultation des fiches détaillées              |
| Filtres et tri        | Filtrage par état lu/non lu et favoris ; tri par titre, auteur, année ou note                               |
| Gestion des ouvrages  | Création et modification du titre, de l’auteur, de l’éditeur, de l’année et de l’état de lecture            |
| Suivi de lecture      | Bascule lu/non lu et ajout aux favoris avec mise à jour immédiate de l’affichage                            |
| Évaluation            | Attribution d’une note sur cinq étoiles et remise à zéro                                                    |
| Notes personnelles    | Ajout et suppression de notes textuelles, avec une limite de 1 000 caractères                               |
| Couvertures           | Sélection d’une image, redimensionnement et compression JPEG, téléversement et réinitialisation             |
| Open Library          | Informations complémentaires sur les éditions, l’année de première publication et une couverture de secours |
| Suppression annulable | Confirmation puis délai de cinq secondes pendant lequel la suppression peut être annulée                    |
| Préférences           | Choix du thème clair/sombre et de la langue français/anglais, sauvegardés localement                        |
| États de l’interface  | Squelettes de chargement, listes vides et messages d’erreur avec possibilité de relance                     |

## Technologies

| Technologie                           | Version du projet | Rôle                                             |
| ------------------------------------- | ----------------- | ------------------------------------------------ |
| Expo                                  | SDK 54            | Environnement de développement et modules natifs |
| React Native / React                  | 0.81.5 / 19.1.0   | Interface mobile et composants                   |
| Expo Router                           | 6                 | Navigation à partir des fichiers                 |
| TypeScript                            | 5.9               | Typage statique                                  |
| TanStack Query                        | 5                 | Cache des données serveur, requêtes et mutations |
| React Hook Form / Zod                 | 7 / 4             | Formulaires et validation des données            |
| AsyncStorage                          | 2.2               | Persistance des préférences                      |
| Expo Image Picker / Image Manipulator | 17 / 14           | Sélection et traitement des couvertures          |
| Jest / jest-expo                      | 29 / 54           | Exécution des tests                              |
| React Native Testing Library          | 13                | Tests de composants et de hooks                  |

Les versions déclarées figurent dans [package.json](package.json) et les versions résolues dans `package-lock.json`.

## Installation et démarrage

### Prérequis

- Node.js compatible avec Expo SDK 54, à partir de la version 20.19, et npm.
- Un environnement d’exécution : navigateur web, appareil avec Expo Go compatible avec le SDK du projet, ou émulateur/simulateur configuré.
- Une API REST accessible respectant le [contrat attendu](#contrat-api).
- Pour le simulateur iOS : macOS et Xcode.

### Installer les dépendances

Depuis la racine du dépôt :

```bash
npm ci
```

### Démarrer l’application

Configurer d’abord l’adresse de l’API, puis lancer Expo :

```bash
npm start
```

Les commandes suivantes permettent de choisir directement une plateforme :

| Commande          | Action                                                       |
| ----------------- | ------------------------------------------------------------ |
| `npm run android` | Démarrer Expo et ouvrir Android                              |
| `npm run ios`     | Démarrer Expo et ouvrir iOS dans un environnement compatible |
| `npm run web`     | Démarrer la version web                                      |

Sous PowerShell, si la politique d’exécution bloque `npm.ps1`, remplacer `npm` par `npm.cmd` et `npx` par `npx.cmd`.

## Configuration

Les paramètres partagés sont centralisés dans [constants/constants.ts](constants/constants.ts).

### Adresse du serveur

La constante `API_BASE_URL` vaut actuellement `http://localhost:3000`. Adapter cette valeur à une adresse accessible depuis l’environnement qui exécute l’application.

Sur un téléphone physique, `localhost` désigne le téléphone : utiliser l’adresse réseau de la machine hébergeant l’API. Pour la version web, le serveur doit autoriser l’origine du client et les en-têtes utilisés, notamment `Content-Type` et `If-Match`, via sa configuration CORS.

La configuration actuelle lit directement les constantes du projet ; aucun fichier `.env` n’est nécessaire. Le dépôt ne fournit pas de commande de démarrage du serveur API.

### Paramètres principaux

| Paramètre                              | Valeur actuelle                                      |
| -------------------------------------- | ---------------------------------------------------- |
| Taille de page                         | 20 livres                                            |
| Temporisation de recherche             | 300 ms                                               |
| Délai maximal du client HTTP           | 8 secondes                                           |
| Délai d’annulation d’une suppression   | 5 secondes                                           |
| Années acceptées                       | 1450 à 2027                                          |
| Longueur maximale d’une note textuelle | 1 000 caractères                                     |
| Évaluation d’un livre                  | De 0 à 5 ; `null` représente l’absence de note       |
| Traitement d’une couverture            | Largeur cible de 600 px, JPEG, compression 0,7       |
| Cache Open Library                     | Données considérées comme fraîches pendant 24 heures |

## Dépannage du premier lancement

| Symptôme                                                  | Vérification ou action                                                                                                                                                       |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm` ou `node` introuvable                               | Installer Node.js avec npm, rouvrir le terminal et vérifier `node --version` et `npm --version`                                                                              |
| `npm.ps1` ne peut pas être chargé                         | Utiliser `npm.cmd` dans PowerShell                                                                                                                                           |
| La bibliothèque affiche une erreur réseau                 | Ouvrir l’URL `/books?page=1&limit=1` de l’API et vérifier `API_BASE_URL` ; `npm run web` démarre seulement le client                                                         |
| L’API répond dans un onglet, mais l’application échoue    | Examiner la console du navigateur ; le backend doit autoriser l’origine affichée par Expo, les méthodes HTTP utilisées et les en-têtes `Content-Type` et `If-Match` via CORS |
| L’API répond, mais le client rejette les données          | Comparer le JSON aux [schémas du domaine](app/domain/livre.ts), notamment les UUID, dates, champs obligatoires et données de pagination                                      |
| Le navigateur ne s’ouvre pas                              | Copier l’adresse locale affichée dans le terminal Expo                                                                                                                       |
| Expo conserve une ancienne version après une modification | Arrêter le serveur avec `Ctrl+C`, puis lancer `npm run web -- --clear`                                                                                                       |
| Le client mobile ne joint pas le backend                  | Remplacer `localhost` par une adresse accessible depuis l’appareil ; vérifier le réseau et l’accès au port du serveur                                                        |

## Architecture

```text
app/
├── _layout.tsx             # Providers et navigation principale
├── index.tsx               # Bibliothèque, recherche et pagination
├── books/
│   ├── new.tsx             # Création d’un ouvrage
│   ├── [id].tsx            # Fiche détaillée
│   └── edit/[id].tsx       # Modification d’un ouvrage
├── domain/                 # Types, schémas Zod et erreurs applicatives
├── services/
│   ├── api/                # Client HTTP, livres, notes et Open Library
│   ├── coverUploadService.ts
│   └── imageResolver.ts
├── i18n/                   # Traductions et préférence de langue
└── theme/                  # Contexte et préférences du thème
components/                 # Composants réutilisables
hooks/                      # Accès aux données et comportements partagés
constants/                  # Configuration, clés de cache et styles partagés
assets/                     # Ressources graphiques
tests/                      # Tests, données de test et simulations
```

Les écrans composent les composants d’interface et les hooks. Les hooks coordonnent les requêtes, les mutations et le cache ; les services effectuent les appels réseau. Les schémas Zod contrôlent les réponses de l’API et les données des formulaires.

La racine installe `QueryClientProvider`, `ThemeProvider` et `I18nProvider` avant la navigation.

## Contrat API

Les chemins suivants sont relatifs à `API_BASE_URL` et décrivent les appels attendus par le client.

| Méthode  | Chemin                     | Utilisation                                                                  |
| -------- | -------------------------- | ---------------------------------------------------------------------------- |
| `GET`    | `/books`                   | Liste paginée et filtrée                                                     |
| `GET`    | `/books/:id`               | Détail d’un livre                                                            |
| `POST`   | `/books`                   | Création d’un livre                                                          |
| `PUT`    | `/books/:id`               | Modification du formulaire, avec la version dans `If-Match`                  |
| `PATCH`  | `/books/:id`               | Modification de `lu`, `favori` ou `note`                                     |
| `DELETE` | `/books/:id`               | Suppression d’un livre ; réponse 204 attendue                                |
| `GET`    | `/books/:id/notes`         | Liste des notes textuelles                                                   |
| `POST`   | `/books/:id/notes`         | Ajout d’une note avec le champ `contenu`                                     |
| `DELETE` | `/books/:id/notes/:noteId` | Suppression d’une note ; réponse 204 attendue                                |
| `POST`   | `/books/:id/cover`         | Envoi d’une couverture dans le champ `image`, au format data URL JPEG base64 |
| `DELETE` | `/books/:id/cover`         | Réinitialisation de la couverture ; retour du livre actualisé                |

La liste accepte les paramètres `page`, `limit`, `q`, `status` (`lu` ou `nonlu`), `favori`, `sort` et `order` (`asc` ou `desc`). Le service accepte les tris `titre`, `auteur`, `annee`, `note` et `updatedAt` ; l’interface propose les quatre premiers.

Une réponse paginée contient `items`, `page`, `limit`, `total` et `totalPages`.

Le contrat complet des livres et notes est défini dans [app/domain/livre.ts](app/domain/livre.ts) et [app/domain/note.ts](app/domain/note.ts). Un livre comprend notamment son identifiant UUID, ses informations bibliographiques, son état de lecture, son favori, son évaluation, sa couverture, ses dates de création/modification et sa version.

Open Library est interrogée séparément par [openLibraryService.ts](app/services/api/openLibraryService.ts). L’absence de résultat ou une panne de ce service produit une réponse de repli.

## Gestion des données

### Cache et mises à jour

TanStack Query conserve les données serveur en mémoire. Les clés de liste incluent les filtres pour distinguer les résultats. Les mutations invalident ou actualisent les caches concernés.

Les changements lu/non lu et favori sont optimistes : l’affichage est mis à jour avant la réponse du serveur. Si la requête échoue, les données précédentes sont restaurées, puis les requêtes concernées sont invalidées pour resynchroniser l’affichage.

AsyncStorage conserve le thème et la langue. Le cache des livres et des notes n’est pas persisté sur disque.

### Validation, erreurs et conflits

Les formulaires et les réponses réseau sont validés avec Zod. Le client HTTP traduit les erreurs en catégories applicatives :

| Catégorie    | Origine                                                |
| ------------ | ------------------------------------------------------ |
| `VALIDATION` | Réponse HTTP 422, avec d’éventuelles erreurs par champ |
| `CONFLIT`    | Réponse HTTP 409, avec une éventuelle version attendue |
| `AUTH`       | Réponse HTTP 401 ou 403                                |
| `RESEAU`     | Autres erreurs serveur, échec réseau ou timeout        |

La modification complète d’un livre envoie sa version dans `If-Match`. En cas de conflit, l’écran signale que le livre a été modifié ailleurs et invite à recharger la fiche. Il n’effectue pas de fusion automatique.

Les requêtes peuvent être retentées jusqu’à deux fois avec un délai croissant. Les erreurs de validation, de conflit et d’autorisation ne sont pas retentées automatiquement.

## Tests et qualité

### Ajouts après 17 h 00 — Tests automatisés

Une suite de tests a été ajoutée avec sa configuration Jest, ses simulations réseau et natives, ses commandes npm et ses seuils de couverture. Elle est regroupée dans [tests/](tests/README.md), en dehors des routes Expo Router.

| Périmètre                  | Scénarios vérifiés                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Services                   | Requêtes et payloads, pagination, filtres, conflits, erreurs HTTP, validation des réponses, timeout, Open Library et couvertures |
| Composants                 | `EmptyView`, `ErrorView` et `RatingStars` : affichage, actions, sélection et lecture seule                                       |
| Hook de données            | `useBooks` : chargement, succès, liste vide, erreur et relance, filtres et pagination                                            |
| Domaine et fonctions pures | Validations Zod, valeurs limites et résolution des URL de couverture                                                             |

Les tests des services et de `useBooks` simulent `fetch` tout en exécutant les vrais services, le client HTTP et les schémas. Les tests ne nécessitent ni serveur API ni téléphone. Les modules natifs utilisés et AsyncStorage sont simulés.

### Exécution

```bash
npm test
npm run test:watch
npm run test:coverage
```

`npm test` exécute la suite une fois, génère la couverture et vérifie les seuils. Le mode watch désactive la couverture pour accélérer les relances.

Pour cibler un fichier :

```bash
npm test -- --runTestsByPath tests/services/booksService.test.ts --coverage=false
```

### Couverture

[jest.config.js](jest.config.js) impose un minimum de **40 % séparément sur `app/domain/` et `app/services/`**, pour les lignes, instructions, fonctions et branches. Tous les fichiers de ces dossiers sont inclus, même s’ils ne sont pas importés par les tests.

Lors de la validation initiale de cette suite : **80 tests réussis dans 11 suites**, **100 % des lignes exécutables couvertes** et **90,24 % des branches** sur ce périmètre. Ces résultats ne représentent pas la couverture de l’ensemble des écrans et hooks de l’application.

Les rapports sont générés dans `coverage/index.html` et `coverage/lcov.info`. Le dossier `coverage/` est ignoré par Git.

Les types TypeScript seuls n’ont pas de comportement exécutable. Les schémas Zod contiennent en revanche des validations testables. Le domaine ne contient actuellement aucune fonction de tri, de calcul ou de fusion de conflits à tester.

### Vérifications complémentaires

```bash
npx tsc --noEmit
npm run lint
```

Ces commandes vérifient les types TypeScript et les règles ESLint. Le détail des scénarios et leurs limites figure dans [tests/README.md](tests/README.md).

## Limites actuelles

- Le fonctionnement complet dépend du serveur REST externe ; aucun mode hors ligne persistant n’est implémenté pour les livres et les notes.
- Le choix français/anglais est disponible, mais certains messages restent écrits directement en français.
- La gestion de `AUTH` traduit les réponses HTTP ; aucun parcours de connexion n’est implémenté dans le client.
- La combinaison d’un signal d’annulation externe et du timeout reste à corriger dans les clients HTTP, comme détaillé dans la documentation des tests.
- Une réponse rejetée par Zod est actuellement présentée comme une erreur `RESEAU`.
- La suite couvre les services et des comportements ciblés ; elle ne comprend pas de tests de parcours complets sur appareil.
