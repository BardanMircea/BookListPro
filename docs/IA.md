# Audit d'ingénierie : Génération par IA (`docs/IA.md`)

## 1. Fonctionnalité ciblée

**Suppression temporisée avec compte à rebours d'annulation (5 s), retour arrière optimiste et redirection vers la liste.**

## 2. Prompt exact utilisé

> _"Dans **`app/books/[id].tsx`**, implémente la suppression d'un livre rattachée à l'API **`DELETE /books/:id`**. La suppression doit demander une confirmation, puis afficher un bandeau avec un compte à rebours de 5 secondes permettant d'annuler. Si l'utilisateur n'annule pas, le livre est supprimé via le service, le cache TanStack Query est invalidé et l'utilisateur est redirigé vers l'écran d'accueil **`/`**."_

## 3. Trois défauts d'ingénierie réels relevés dans le code généré

### Défaut 1 : Dépendance native exclusive provoquant un blocage silencieux sur le Web (`Alert.alert`)

- **Constat :** Le code généré utilisait `Alert.alert('Suppression', ...)` sans distinction d'environnement. Sur `react-native-web` (navigateur de bureau des caisses de librairie), l'implémentation de `Alert.alert` ne rend rien ou s'exécute de façon silencieuse selon les versions.
- **Impact :** Aucun dialogue n'apparaissait à l'écran lors du clic sur le bouton de suppression, rendant la fonctionnalité morte sans lever d'exception dans la console.

### Défaut 2 : Inversion du cycle de vie asynchrone & re-fetch fantôme (Erreur HTTP 404)

- **Constat :** Dans le hook de mutation TanStack Query, le callback `onSuccess` appelait :

  ```typescript
  queryClient.invalidateQueries({ queryKey: bookKeys.detail(id) });
  ```

  pendant que l'écran `app/books/[id].tsx` était encore monté à l'écran avant la transition de navigation.

- **Impact :** En TanStack Query, invalider une requête active déclenche immédiatement un re-fetch en tâche de fond (`GET /books/:id`). Comme la ressource venait d'être purgée en base de données, l'API répondait une erreur `404 Not Found`, polluant les métriques réseau et faisant basculer l'écran sur un état d'erreur fugitif avant redirection.

### Défaut 3 : Fuite de mémoire et timers orphelins lors du démontage du composant (_Memory Leak_)

- **Constat :** Les fonctions asynchrones `setTimeout` et `setInterval` étaient stockées dans des variables locales ou déclarées sans hook de nettoyage (`cleanup function` dans un `useEffect`).
- **Impact :** Si l'utilisateur cliquait sur « Retour » ou naviguait vers une autre page pendant les 5 secondes du compte à rebours, les timers continuaient de tourner en mémoire et exécutaient `deleteBook(bookId)` et `router.replace('/')` sur un composant déjà détruit (_unmounted component state mutation_).

## 4. Corrections apportées et justifications techniques

| **Défaut**            | **Correction appliquée**                                                                                                                                                                                | **Justification technique**                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Défaut 1 (Web)**    | Branchement conditionnel via `Platform.OS === 'web'` avec `window.confirm()` en repli sur navigateur et `Alert.alert()` sur mobile.                                                                     | Respecte le contrat d'exécution multiplateforme React Native Web sans ajouter de bibliothèque tierce modale lourde.                         |
| **Défaut 2 (404)**    | Remplacement de `invalidateQueries(detail)` par `queryClient.cancelQueries()` suivi de `queryClient.removeQueries({ queryKey: bookKeys.detail(id), exact: true })`, couplé à une redirection immédiate. | Élimine la requête fantôme en déréférençant la ressource du cache local au lieu d'ordonner au client d'aller chercher une entité supprimée. |
| **Défaut 3 (Timers)** | Utilisation de références persistantes (`useRef`) pour stocker les handles de `setTimeout` et `setInterval`, avec purge explicite dans le `return () => { ... }` du `useEffect`.                        | Garantit l'isolation mémoire, stoppe net les threads asynchrones au démontage et prévient l'exécution d'effets de bord orphelins.           |

### Extrait du code corrigé et validé (il a été refactoré possiblement entre temps)

```typescript
// 1. Timers sécurisés contre le démontage mémoire
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

useEffect(() => {
  return () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, []);

// 2. Détection multiplateforme
const confirmDelete = () => {
  const question = `Êtes-vous sûr de vouloir supprimer "${book?.titre}" ?`;
  if (Platform.OS === "web") {
    if (window.confirm(question)) startPendingDelete();
  } else {
    Alert.alert("Suppression", question, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: startPendingDelete },
    ]);
  }
};

// 3. Purge du cache sans re-fetch fantôme (dans useBookDetail.ts)
const deleteMutation = useMutation<null, AppError, string>({
  mutationFn: (bookId) => booksService.delete(bookId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    queryClient.cancelQueries({ queryKey: bookKeys.detail(id) });
    queryClient.removeQueries({ queryKey: bookKeys.detail(id), exact: true });
  },
});
```
