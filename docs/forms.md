# Formulaires

Cette documentation décrit l'architecture des formulaires du template,
basée sur **TanStack Form**, **Zod** et les composants UI **shadcn**.

L'objectif est de conserver des formulaires fortement typés,
réutilisables et cohérents, tout en séparant clairement la validation,
l'état du formulaire, les composants UI et la conversion entre valeurs
applicatives et valeurs manipulées par les contrôles HTML.

## Principes

- Les schémas du `Resource` restent la source de validation.
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
- L'affichage des erreurs est centralisé et suit une convention
  commune.

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
    await createTodo.mutateAsync(value)
    onSuccess?.()
  },
})
```

`onMount` permet de connaître immédiatement l'état de validité du
formulaire. `onChange` maintient cet état à jour pendant la saisie.

## Affichage des erreurs

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

Interaction Résultat

---

Champ jamais touché Pas d'erreur affichée
Focus sans modification Pas d'erreur affichée
Champ vide puis blur Erreur affichée
Valeur valide saisie Pas d'erreur
Valeur saisie puis effacée Erreur immédiate
Correction d'une valeur invalide L'erreur disparaît au changement
Submit direct invalide Les erreurs de validation sont disponibles

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

## Champs

### `TextField`

Pour une valeur déjà de type `string`, aucun adapter n'est nécessaire :

```tsx
<form.AppField name="title" children={(field) => <TextField field={field} label="Title" />} />
```

Le composant gère le binding de la valeur, `onChange`, `onBlur`, le
rendu de l'`Input` shadcn et l'affichage des erreurs.

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
textarea. Selon le modèle, il peut représenter `string`,
`string | null`, `string | undefined` ou une autre représentation
nécessitant une transformation.

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

## Organisation actuelle

```text
src/components/form/
├── adapters/
│   ├── FieldAdapter.ts
│   └── nullableStringAdapter.ts
├── FieldError.tsx
├── FormFieldApi.ts
├── TextField.tsx
├── TextareaField.tsx
├── form-context.ts
└── useAppForm.ts
```

Les primitives visuelles restent dans `src/components/ui/`, tandis que
les formulaires métier restent dans leur feature, par exemple
`src/features/todo/components/`.

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

## Tests

Les types publics de la couche formulaire sont testés afin de
verrouiller notamment :

```text
TextField<string> sans adapter                       OK
TextareaField<string> sans adapter                   OK
TextareaField<string | null> + adapter compatible    OK
TextareaField<string | null> sans adapter            Erreur TypeScript
TextareaField<string | null> + adapter incompatible  Erreur TypeScript
```

Ces tests évitent une régression silencieuse de la relation entre
`TValue` et `FieldAdapter`.

## Évolutions prévues

La couche formulaire pourra être complétée progressivement avec :

- un bouton de soumission réutilisable ;
- la gestion centralisée des erreurs de soumission ;
- les erreurs réseau et HTTP ;
- le traitement des réponses `422` et leur éventuel mapping vers les
  fields ;
- d'autres contrôles (`NumberField`, select, date, etc.) ;
- d'autres adapters lorsque de nouveaux besoins de conversion
  apparaîtront.

Les nouvelles abstractions doivent répondre à un besoin concret sans
déplacer la sémantique métier dans les composants UI.
