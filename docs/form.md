# Formulaires

Cette documentation décrit l'architecture des formulaires du template,
basée sur **TanStack Form**, **Zod** et les composants UI **shadcn**.

L'objectif est de conserver des formulaires fortement typés,
réutilisables et cohérents, tout en séparant clairement :

- la validation applicative ;
- l'état du formulaire ;
- les composants UI ;
- la conversion entre valeurs applicatives et valeurs manipulées par
  les contrôles HTML ;
- l'interprétation des erreurs provenant du backend ;
- leur intégration dans l'état TanStack Form.

## Principes

- Les schémas du `Resource` restent la source de validation côté
  frontend.
- Les champs reçoivent explicitement le field TanStack afin de
  conserver son type.
- Les composants UI manipulent des valeurs adaptées aux contrôles
  HTML.
- Les `FieldAdapter` convertissent les valeurs entre l'état du
  formulaire et l'UI.
- Un adapter est facultatif lorsque la valeur du field est déjà une
  `string`.
- Un adapter devient obligatoire lorsque le type du field n'est pas
  directement compatible avec le contrôle.
- TypeScript vérifie qu'un adapter est compatible avec le type réel du
  field.
- L'affichage des erreurs de champs est centralisé dans `FieldError`.
- Les erreurs de soumission sont normalisées avant d'être injectées
  dans TanStack Form.
- Les erreurs techniques du core ne sont pas affichées directement à
  l'utilisateur.
- Les erreurs backend liées à un champ disparaissent lorsque ce champ
  est modifié.

## Validation

Un formulaire peut utiliser directement le schéma dérivé du `Resource` :

```ts
const form = useAppForm({
  defaultValues: {
    title: '',
    description: null as string | null,
  },
  validators: {
    onMount: todoResource.createSchema,
    onChange: todoResource.createSchema,
  },
  onSubmit: async ({ value }) => {
    try {
      await createTodo.mutateAsync(value)
      onSuccess?.()
    } catch (error) {
      applyFormSubmissionError(form, error)
    }
  },
})
```

`onMount` permet de connaître immédiatement l'état de validité du
formulaire.

`onChange` maintient cet état à jour pendant la saisie.

La validation frontend et la validation backend restent deux mécanismes
distincts :

```text
Resource / Zod
      ↓
validation frontend

Backend
      ↓
validation serveur
      ↓
erreurs de soumission
```

Une validation frontend réussie ne garantit donc pas que le backend
acceptera la requête.

## Affichage des erreurs de champs

Les composants affichent les erreurs lorsqu'un champ a été modifié ou a
perdu le focus :

```tsx
{
  ;(field.state.meta.isBlurred || field.state.meta.isDirty) && (
    <FieldError errors={field.state.meta.errors} />
  )
}
```

Comportement attendu :

---

Interaction Résultat

---

Champ jamais touché Pas d'erreur affichée

Focus sans modification Pas d'erreur affichée

Champ vide puis blur Erreur affichée

Valeur valide saisie Pas d'erreur

Valeur saisie puis effacée Erreur immédiate

Correction d'une valeur invalide L'erreur disparaît au changement

Submit direct invalide Les erreurs de validation sont
disponibles

Erreur backend liée à un field Erreur affichée sur le field

Modification après erreur backend L'erreur backend du field disparaît
-----------------------------------------------------------------------

`FieldError` centralise le formatage des erreurs afin d'éviter de
répéter cette logique.

## `FormFieldApi`

Les composants utilisent un contrat minimal plutôt que de dépendre de
toute l'API interne de TanStack Form :

```ts
export type FormFieldApi<TValue> = {
  name: string
  state: {
    value: TValue
    meta: {
      errors: readonly unknown[]
      isBlurred: boolean
      isDirty: boolean
    }
  }
  handleBlur: () => void
  handleChange: (value: NoInfer<TValue>) => void
}
```

Le type `TValue` est inféré à partir de la valeur réelle du field.

Cette interface limite le couplage de nos composants avec TanStack Form
tout en conservant le typage du field.

## Champs

### `TextField`

Pour une valeur déjà de type `string`, aucun adapter n'est nécessaire :

```tsx
<form.AppField name="title" children={(field) => <TextField field={field} label="Title" />} />
```

Le composant gère :

- le binding de la valeur ;
- `onChange` ;
- `onBlur` ;
- le rendu de l'`Input` shadcn ;
- l'affichage des erreurs.

### `TextareaField`

Lorsqu'une transformation est nécessaire, un adapter est fourni
explicitement :

```tsx
<form.AppField
  name="description"
  children={(field) => (
    <TextareaField field={field} label="Description" adapter={nullableStringAdapter} />
  )}
/>
```

Ici, `description` est de type `string | null`, alors qu'un `<textarea>`
manipule une chaîne de caractères.

## Field adapters

Un `FieldAdapter` définit la conversion entre une valeur du formulaire
et la représentation utilisée par un contrôle UI :

```ts
export type FieldAdapter<TValue, TInputValue> = {
  format: (value: TValue) => TInputValue
  parse: (value: TInputValue) => TValue
}
```

La direction des transformations est :

```text
Valeur du formulaire ── format ──> Valeur UI
Valeur du formulaire <── parse ─── Valeur UI
```

### Exemple : `nullableStringAdapter`

```ts
export const nullableStringAdapter: FieldAdapter<string | null, string> = {
  format: (value) => value ?? '',
  parse: (value) => (value === '' ? null : value),
}
```

État du formulaire UI

---

`null` `""`
`"Hello"` `"Hello"`

Dans l'autre sens :

UI État du formulaire

---

`""` `null`
`"Hello"` `"Hello"`

Pour conserver cette cohérence même si l'utilisateur ne touche jamais le
champ, la valeur initiale représente directement la valeur applicative :

```ts
defaultValues: {
  description: null as string | null,
}
```

Le `format()` de l'adapter affiche ensuite `null` comme une chaîne vide.

## Pourquoi ne pas convertir directement dans `TextareaField` ?

La conversion `"" → null` n'est pas une propriété intrinsèque d'un
textarea.

Selon le modèle, il peut représenter :

- `string` ;
- `string | null` ;
- `string | undefined` ;
- ou une autre représentation nécessitant une transformation.

Le composant UI ne doit donc pas décider lui-même de la sémantique
métier.

Les adapters permettent de conserver un seul `TextField` et un seul
`TextareaField`, avec une conversion explicite et réutilisable, plutôt
que de multiplier des composants comme `NullableTextareaField` ou
`NullableTextField`.

## Adapter facultatif ou obligatoire

Lorsque le field est une `string`, l'adapter est facultatif :

```tsx
<TextField field={field} label="Title" />
```

Si la valeur est par exemple `string | null`, un adapter est obligatoire
:

```tsx
<TextareaField field={field} label="Description" adapter={nullableStringAdapter} />
```

Cette distinction est exprimée avec une condition non distributive :

```ts
[TValue] extends [string]
```

Le tuple est important pour les unions comme `string | null` : il teste
le type complet au lieu de distribuer la condition séparément sur chaque
membre de l'union.

## Sécurité de type

Le field est passé explicitement au composant :

```tsx
<TextareaField field={field} adapter={nullableStringAdapter} />
```

Le type est donc inféré depuis `field.state.value`.

Pour un field `string | null`, l'adapter attendu est :

```ts
FieldAdapter<string | null, string>
```

Un `FieldAdapter<number, string>` est rejeté par TypeScript.

Cette liaison explicite est la raison pour laquelle les composants
reçoivent le field en prop plutôt que d'inférer arbitrairement leur type
via `useFieldContext<TValue>()`.

## Composants liés au formulaire

Les composants qui dépendent du formulaire complet sont enregistrés
comme `formComponents` dans `useAppForm`.

Exemple :

```ts
export const { useAppForm } = createFormHook({
  fieldComponents: {},
  formComponents: {
    FormError,
    SubmitButton,
  },
  fieldContext,
  formContext,
})
```

Ils sont ensuite disponibles directement sur l'instance du formulaire :

```tsx
<form.FormError />

<form.SubmitButton pendingLabel="Creating...">
  Create todo
</form.SubmitButton>
```

### `SubmitButton`

`SubmitButton` centralise le comportement du bouton de soumission.

Il observe notamment :

- `canSubmit` ;
- `isSubmitting`.

Le bouton est désactivé lorsque le formulaire ne peut pas être soumis ou
lorsqu'une soumission est déjà en cours.

Il peut également afficher un libellé spécifique pendant la soumission :

```tsx
<form.SubmitButton pendingLabel="Creating...">Create todo</form.SubmitButton>
```

Le composant utilise le `formContext` fourni par `createFormHook` et
doit donc être utilisé à l'intérieur de :

```tsx
<form.AppForm>...</form.AppForm>
```

### `FormError`

`FormError` affiche l'erreur globale de soumission du formulaire.

Exemple :

```tsx
<form.FormError />
```

Une erreur globale est utilisée lorsqu'aucune erreur spécifique à un
field ne peut être affichée, par exemple :

```text
NetworkError
→ Unable to connect to the server. Please try again.

HTTP 500
→ The server encountered an error. Please try again.
```

Le composant observe :

```ts
state.errorMap.onSubmit
```

TanStack Form expose directement à cet endroit l'erreur globale de
soumission.

## Gestion des erreurs de soumission

La gestion des erreurs de soumission est séparée en plusieurs
responsabilités.

Architecture :

```text
Erreur technique
      ↓
FormErrorMapper
      ↓
FormSubmissionError
      ↓
applyFormSubmissionError
      ↓
TanStack Form
      ├── erreur globale
      └── erreurs de fields
```

### `FormSubmissionError`

Toutes les erreurs destinées à un formulaire sont normalisées sous la
même forme :

```ts
export type FormSubmissionError = {
  message: string
  fields: Record<string, string[]>
}
```

Le formulaire n'a donc pas besoin de connaître la structure d'une erreur
Laravel, d'une erreur réseau ou d'une autre erreur technique.

### `FormErrorMapper`

`FormErrorMapper` constitue la frontière entre les erreurs techniques et
l'UI.

Il transforme notamment :

- les erreurs de validation backend ;
- les erreurs HTTP ;
- les erreurs réseau ;
- les réponses serveur invalides ;
- les erreurs inconnues.

Exemples :

```text
NetworkError
→ "Unable to connect to the server. Please try again."

HTTP 500
→ "The server encountered an error. Please try again."

Erreur inconnue
→ "An unexpected error occurred. Please try again."
```

Les messages techniques produits par le core, par exemple :

```text
HTTP 500: Internal Server Error
Network request failed: POST ...
```

ne sont donc pas affichés directement à l'utilisateur.

### Backend spécifique

L'interprétation d'une erreur de validation dépend du backend.

Le mapper délègue cette responsabilité au backend configuré :

```ts
backend().mapValidationError(error)
```

Cela permet au formulaire de rester indépendant du format concret de
Laravel ou d'un autre backend.

Pour Laravel, une réponse de validation peut par exemple être normalisée
depuis :

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "title": ["The title has already been taken."]
  }
}
```

vers :

```ts
{
  message: 'The given data was invalid.',
  fields: {
    title: ['The title has already been taken.'],
  },
}
```

## Application des erreurs dans TanStack Form

`applyFormSubmissionError` constitue le pont entre notre représentation
normalisée et TanStack Form.

Utilisation :

```ts
onSubmit: async ({ value }) => {
  try {
    await createTodo.mutateAsync(value)
    onSuccess?.()
  } catch (error) {
    applyFormSubmissionError(form, error)
  }
}
```

La fonction applique les erreurs via :

```ts
form.setErrorMap({
  onSubmit: {
    form: ...,
    fields: ...,
  },
})
```

TanStack Form distribue ensuite les erreurs :

```text
onSubmit.form
      ↓
state.errorMap.onSubmit
      ↓
FormError

onSubmit.fields.title
      ↓
field.state.meta.errors
      ↓
FieldError
```

Le formulaire métier ne contient donc aucune logique spécifique à
Laravel ou aux différentes classes d'erreur.

## Erreurs globales et erreurs de fields

Lorsqu'une erreur contient des erreurs associées à des fields, celles-ci
sont privilégiées.

Exemple :

```text
422 Laravel
fields.title = ["The title has already been taken."]
```

Résultat :

```text
Title
[My todo]
The title has already been taken.
```

Le message global n'est pas affiché en plus afin d'éviter une
information redondante.

À l'inverse, lorsqu'aucune erreur de field n'existe :

```text
HTTP 500
```

le message est affiché via `FormError`.

La règle est donc :

```text
fields présents
→ erreurs sur les fields
→ pas de message global

aucun field
→ message global
```

## Cycle de vie des erreurs backend

Une erreur backend associée à un field est considérée comme liée à la
valeur qui a été soumise.

Lorsqu'un utilisateur modifie ce field, TanStack Form retire l'erreur de
soumission correspondante.

Exemple :

```text
Submit
  ↓
422
  ↓
title: "The title has already been taken."
  ↓
erreur affichée

Utilisateur modifie title
  ↓
erreur backend supprimée
  ↓
validation onChange normale
```

Cela évite de conserver à l'écran une erreur serveur qui ne correspond
plus à la valeur actuelle.

## Organisation actuelle

```text
src/components/form/
├── adapters/
│   ├── FieldAdapter.ts
│   └── nullableStringAdapter.ts
├── applyFormSubmissionError.ts
├── FieldError.tsx
├── FormError.tsx
├── FormErrorMapper.ts
├── FormFieldApi.ts
├── FormSubmissionError.ts
├── SubmitButton.tsx
├── TextField.tsx
├── TextareaField.tsx
├── form-context.ts
└── useAppForm.ts
```

Les primitives visuelles restent dans `src/components/ui/`, tandis que
les formulaires métier restent dans leur feature, par exemple :

```text
src/features/todo/components/
```

Architecture générale :

```text
Resource / Zod
      ↓
TanStack Form
      ↓
FormFieldApi<TValue>
      ↓
FieldAdapter si nécessaire
      ↓
TextField / TextareaField
      ↓
Primitives shadcn
```

Pour la soumission :

```text
TodoForm
      ↓
Service / mutation
      ↓
Core errors
      ↓
BackendAdapter
      ↓
FormErrorMapper
      ↓
FormSubmissionError
      ↓
applyFormSubmissionError
      ↓
TanStack Form
      ├── FieldError
      └── FormError
```

## Tests

La couche formulaire est testée à plusieurs niveaux.

### Typage des composants

Les types publics verrouillent notamment :

```text
TextField<string> sans adapter                       OK
TextareaField<string> sans adapter                   OK
TextareaField<string | null> + adapter compatible    OK
TextareaField<string | null> sans adapter            Erreur TypeScript
TextareaField<string | null> + adapter incompatible  Erreur TypeScript
```

Ces tests évitent une régression silencieuse de la relation entre
`TValue` et `FieldAdapter`.

### Mapping des erreurs

`FormErrorMapper` vérifie notamment la normalisation :

```text
validation backend
HTTP 401 / 403 / 404 / 409 / 500
NetworkError
ResponseParseError
erreur inconnue
```

### Application des erreurs

`applyFormSubmissionError` vérifie notamment :

```text
erreurs de fields présentes
→ pas d’erreur globale

aucune erreur de field
→ erreur globale
```

### Composants

Les composants tels que `FormError` et `SubmitButton` sont testés avec
le contexte réel fourni par `useAppForm`.

### Intégration

`TodoForm` sert également de test d'intégration de la chaîne complète.

Les scénarios actuellement couverts sont :

```text
succès
→ mutation appelée
→ onSuccess appelé

422 Laravel
→ erreur affichée sur le bon field

422 Laravel puis modification
→ erreur backend supprimée

NetworkError
→ erreur globale affichée
```

Le test d'intégration initialise explicitement la configuration
nécessaire au backend afin de traverser réellement le mécanisme de
résolution du backend.

## Ajouter un nouveau champ

Lorsqu'un nouveau contrôle est nécessaire :

1.  déterminer le type applicatif du field ;
2.  déterminer le type manipulé par le contrôle HTML ;
3.  si les deux types sont identiques et directement compatibles, aucun
    adapter n'est nécessaire ;
4.  sinon, créer ou réutiliser un `FieldAdapter` ;
5.  conserver la sémantique métier hors du composant UI ;
6.  ajouter les tests de type nécessaires si une nouvelle règle
    générique est introduite.

Exemple :

```text
number | null
      ↓ format
string
      ↓ input HTML
string
      ↓ parse
number | null
```

Cette logique pourra servir ultérieurement à un `NumberField`.

## Ajouter un nouveau backend

La couche formulaire ne doit pas être modifiée pour supporter un nouveau
format de validation backend.

Le nouveau backend doit fournir son interprétation des erreurs de
validation via l'abstraction backend existante.

La chaîne reste alors :

```text
ApiError
      ↓
BackendAdapter
      ↓
ValidationError normalisée
      ↓
FormErrorMapper
      ↓
TanStack Form
```

Cette séparation évite de faire apparaître des conditions du type :

```ts
if (backend === 'laravel') {
  ...
}
```

dans les formulaires ou les composants UI.

## Évolutions prévues

La V1 de la couche formulaire couvre désormais :

- les champs texte ;
- les textarea ;
- les valeurs nullable via adapters ;
- la validation Zod ;
- l'affichage centralisé des erreurs de champs ;
- le bouton de soumission ;
- l'état de soumission ;
- les erreurs globales ;
- les erreurs réseau et HTTP ;
- les réponses de validation backend ;
- le mapping des erreurs backend vers les fields ;
- la disparition des erreurs backend après modification ;
- les tests unitaires, de typage et d'intégration associés.

Les évolutions suivantes doivent maintenant répondre à des besoins
concrets, par exemple :

- `NumberField` ;
- select ;
- checkbox ;
- date / datetime ;
- nouveaux adapters ;
- internationalisation des messages utilisateur ;
- amélioration éventuelle de l'accessibilité.

L'objectif n'est pas de construire une bibliothèque de formulaires
exhaustive à l'avance, mais de faire évoluer cette couche
progressivement lorsque de nouveaux cas réels apparaissent.
