---
name: create-new-component
description: Build a new Exos design-system component (Angular standalone + Bootstrap + DCFC theme) with its stories and docs page, following the Input component as the reference. Use whenever adding a component, rebuilding one, or writing/reorganizing a component's docs page.
---

# Create a new component

The **Input** component (`src/app/components/input/`) is the reference for everything below: its design (shaped with Tanisha's input), its code, its stories and its docs page. When in doubt, open the matching part of Input and do the same.

## 1. Design principles

The system follows two outside references. Check both before deciding how a component looks or behaves.

- **Apple Human Interface Guidelines (iOS)** for design principles and mobile behavior: clarity over decoration, content first, 44pt minimum touch targets, 16px text in fields (so phones don't zoom), the right keyboard / Return key / autocapitalization per field, plain direct language, and sensible defaults so people do less.
- **IBM Carbon Design System** for web: component anatomy, sizes (sm 32 / md 40 / lg 48px), states (invalid, warning, valid, disabled, read-only), the 2x grid and breakpoints (mobile below 672px), the structure of the docs page, and writing guidance (sentence case, short labels, specific error messages).

**Colors and visual style (fills, gradients, radius) come from our own DCFC tokens, not Carbon or Apple.** Carbon and Apple decide structure: sizes, padding, spacing, states and behavior. Use the spacing scale (`--exos-spacing-01`…`13`, the same steps as Carbon's `$spacing-*`), never raw px. Button (`button.mdx`) was rebuilt this way and is a second reference.

Where they disagree, use Apple HIG on mobile and Carbon on web. Every component must work on both: see `src/app/foundations/mobile-and-web/`.

Before building, decide (write it down in the docs page):
- Its **variants** (different jobs), **sizes**, **modifiers** (optional add-ons) and **states**.
- What it looks like on **mobile vs web** (touch targets, text size, layout, hover).
- How it's **read by a screen reader** and used with a **keyboard**.
- Which look-alike components it could be confused with, and when to use each.

## 2. Files

```
src/app/components/<name>/
  <name>.ts            standalone component (signals: input(), model(), output(), computed())
  <name>.html          plain Bootstrap markup
  <name>.stories.ts    title 'Components/<Group>/<Name>' or 'Components/<Name>'
  <name>.mdx           docs page
```

- Styles go in the theme, not the component: `src/theme/scss/bootstrap-theme/_<area>.scss` (e.g. inputs live in `_forms.scss`). Use `var(--color-*)` only: no primitives, no hex values, no app-specific dependencies.
- Reuse `src/app/components/shared/` (`form-field.ts` for sizes/states/ids, `status-icon.ts`, `anatomy.ts`, `story-source.ts`, `story-decorators.ts`).
- Forms components implement `ControlValueAccessor` so they work with `[(value)]`, `ngModel` and reactive forms.
- Document the component class with a short JSDoc showing 2–4 usage lines, and each non-obvious input with a one-line comment.

## 3. Stories (`<name>.stories.ts`)

Follow `input.stories.ts`. In order:

1. **`DEFAULTS`** object with every input's default, passed to `storySource({ selector, component, importPath, defaults, models })` in `parameters.docs.source.transform`, so the code panel prints only props that differ.
2. **Meta:** `parameters.a11y: { test: 'error' }`; `controls.exclude` for internal members so the API table shows only real inputs/outputs; `argTypes` with a short `description` for every input, `table.defaultValue`, `control` options, outputs under `category: 'outputs'`, and grouped categories (e.g. `'Mobile'`).
3. **Playgrounds (sidebar):** `Default` (named after the component) plus one story per main use (`Disabled`, `Invalid`, …).
4. **Docs-only stories, tagged `'!dev'`**, each used by exactly one canvas on the page:
   - `MobileExample` / `WebExample` (`fullWidth: true`, `example: true`), plus `OnMobile` / `OnWeb` copies tagged `'!autodocs'` with the `exosMobile` / `exosDesktop` viewport.
   - `Anatomy` using `AnatomyComponent` with numbered `parts`.
   - `Switchable` (base for appearance/size switches), `Var*` (variants), `Mod*` (modifiers), `AllStates`.
   - `Do*` / `Dont*` pairs for the Content section.
   - `Edge*` for edge cases (long value, long label, long message).
5. **Tests (hidden, tagged `'!dev'`, named `'Test · …'`)** with `play` functions: sizes on web and mobile (44px / 16px), screen reader name/role/description, keyboard, every interactive feature.

## 4. Docs page (`<name>.mdx`)

Use exactly this order and these headings (as in `input.mdx`). Skip a section only if it truly doesn't apply.

```mdx
import { Meta, Title, Subtitle, Controls } from '@storybook/addon-docs/blocks';
import { DeviceCanvas, DeviceVariation } from '../../../../.storybook/blocks/DeviceExample';
import { PageNav, DoDont, Guideline, SpecimenGrid, Specimen, ScreenReader, Related, SizeSpecs, TokenTable } from '../../../../.storybook/blocks/Guidelines';
import * as XStories from './<name>.stories';

<Meta of={XStories} />
<PageNav />
<Title />
<Subtitle>One sentence: what it lets people do.</Subtitle>
```

1. **Live demo:** `<DeviceCanvas of={MobileExample} webOf={WebExample} defaultDevice="mobile" />`, with one line saying the same thing is shown on phone and web.
2. **When to use:** bullet list of uses, then **### Compared with look-alikes** — a table (Component | People | Use it for) linking to related components, and a line on when to pick another one.
3. **Anatomy:** `<DeviceCanvas of={Anatomy} noCode />` + a table (# | Part | Shows when).
4. **Variants:** one `<DeviceVariation title=… of={Var…}>` per variant (guidance left, live canvas + code right). Use `switches={[…]}` for a toolbar switch like appearance.
5. **Size:** one `<DeviceVariation … sizeSwitch>` listing each size, its px height and when to use it, plus the mobile minimum.
6. **Modifiers:** one `<DeviceVariation>` per optional add-on, each naming the exact prop(s) in code.
7. **Specs:** `<SizeSpecs>` measured from the theme CSS (never typed-in numbers).
8. **Content:** writing rules (labels, placeholders, messages, width), then `<DoDont>` with `<Guideline type="do|dont" of={…}>` pairs.
9. **States:** `<DeviceVariation title="All states" of={AllStates} noCode>` + one bullet per state saying when to use it.
10. **Behavior:** `### Keyboard` (table of keys, per variant), `### When to validate` (or the component's equivalent interaction rules), `### Mobile and web` (table: Mobile below 672px | Web 672px and up — height, text, tap areas, keyboard, layout, hover; link to the Mobile and web foundation), `### Edge cases` (`<SpecimenGrid>` of `<Specimen>`s).
11. **Accessibility:** `<ScreenReader name role state description />` for a real example, then bullets: labels, `aria-*` links, colour never the only signal, contrast, and which tests check it.
12. **Code:** one line noting the examples above have code; `### <framework integration>` (e.g. Reactive forms, `<DeviceCanvas … codeOpen />`), `### API` (`<Controls of={Default} />`), `### Theming` (`<TokenTable>` of every `--color-*` / `--exos-*` variable it reads).
13. **Related:** `<Related items={[…]} />` (title, one-line text, href).
14. **### Changelog:** dated bullets, newest first.

### Writing style

Plain, short sentences in sentence case; say "people", not "the user". Lead with the decision ("Use X when …"), name props in backticks, give px values for web and mobile. No marketing language.

## 5. Check before finishing

- `npm run storybook` and open the page: every canvas renders on Mobile and Web, code panels show clean code, the API table has only real props.
- Run the Storybook tests (a11y is `error` level) and fix failures.
- Add the component to `src/docs/catalog.mdx`.
