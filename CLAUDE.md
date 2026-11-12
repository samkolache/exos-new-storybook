# CLAUDE.md

- **Theme:** All global styles come from `src/theme/` (DCFC tokens + Bootstrap 5), mirroring `ExosThemeDCFC` in Exos.DesignSystem. Keep file names identical. Add raw colors to `tokens/_primitives.scss`, semantic names to `tokens/_colors.scss`, and map to Bootstrap only in `_bootstrap-variables.scss`. Bootstrap overrides go in `scss/bootstrap-theme/`.
- **Components:** Add them under `src/app/components/<name>/` as standalone components using plain Bootstrap markup. Style with `var(--color-*)` only: no primitives, no hex values, and no app-specific dependencies, so they can be migrated later.
- **Storybook:** Add `<name>.stories.ts` next to the component (title `Components/<Name>`). Stories are automatically wrapped in `.exos-theme-dcfc`, so the theme applies with no extra setup.
- **Design principles:** Apple HIG (iOS) for design principles and mobile; IBM Carbon for web (sizes, padding, spacing, states, docs structure). Colors come from our own tokens. No raw px for space or corners: use `--exos-spacing-*`, `--exos-space-*` and `--exos-radius-*` (see Foundations: Spacing, Padding, Corner radius).
- **Docs pages:** Each component gets a `<name>.mdx` (attached with `<Meta of={...} />`; no `autodocs` tag) organized like `input.mdx`. Showcase stories used only by the docs are tagged `'!dev'`, and each canvas on a page uses a different story.
- **New components:** use the `create-new-component` skill (`.claude/skills/create-new-component/SKILL.md`). It has the full principles, file layout, stories and docs-page section order.
