# Vue 3 Upgrade Design

**Date:** 2026-06-05
**Branch:** `feat/vue3-upgrade`
**Version:** 2.0.0 (breaking change)

## Overview

Upgrade `@eyes22798/svg-icon` from Vue 2 to Vue 3 only, switch build toolchain to Vite + Vitest, implement Vite plugin alongside existing webpack plugin, rewrite component to Composition API with `<script setup>`.

## Design Decisions

| Decision | Choice |
|----------|--------|
| Compatibility | Vue 3 only (breaking, v2.0.0) |
| Build tool | Vite library mode (ESM + UMD) |
| Test framework | Vitest + @vue/test-utils v2 + jsdom |
| Component API | Composition API (`<script setup>`) |
| Vite plugin | Self-implemented, zero external sprite deps |
| Webpack plugin | Retained and upgraded for Vue 3 |
| Example app | Pure HTML/CSS, no UI library |
| TypeScript | Upgrade to 5.x |

## Architecture

```
src/
├── svg-icon.vue          # Composition API (<script setup>)
├── template.js           # Vue 3 install (app.component)
└── index.js              # Re-export (unchanged)

webpack/
└── index.js              # Upgraded Vue 3 webpack plugin

vite/                     # NEW: Vite plugin
└── index.js              # Virtual module + SVG sprite transform

vitest.config.ts          # NEW: replaces jest.config.js
vite.config.ts            # NEW: replaces vue.config.js (example dev)

example/                  # Simplified, no element-ui
```

## Component (`src/svg-icon.vue`)

Rewrite to `<script setup>`:

- Replace `v-on="$listeners"` — removed, Vue 3 auto-merges events into `$attrs`
- Replace `xlink:href` with `href` (SVG 2 standard)
- `defineProps` for props (same signature: `name`, `className`, `disabled`, `interact`, `interactHoverColor`, `interactActiveColor`)
- `computed()` for `iconName` and `svgClass`
- SCSS styles unchanged (no deep selectors to migrate)

## Install Mechanism (`src/template.js`)

EJS template variables (`<%= iconPath %>`, `<%= name %>`) unchanged. Install function updated:

```js
SvgIcon.install = function (app) {
  app.component(componentName || 'SvgIcon', SvgIcon)
}
```

Consumer usage: `createApp(App).use(SvgIcon)` instead of `Vue.use(SvgIcon)`.

## Vite Plugin (`vite/index.js`)

Zero external sprite dependencies. Custom implementation:

1. **Virtual module** (`resolveId` + `load` hooks) — renders EJS template with `iconPath` and `name`, mounts as `@eyes22798/svg-icon`
2. **SVG sprite injection** (`transformIndexHtml` hook) — generates inline `<svg><symbol id="icon-xxx">...</symbol></svg>` sprite from icon directory SVGs
3. **HMR** — watches icon directory for SVG changes, triggers virtual module reload
4. **SVGO optimization** — strips `fill` attribute, excludes `original` subdirectories

Consumer API:
```ts
import SvgIconPlugin from '@eyes22798/svg-icon/vite'
export default defineConfig({
  plugins: [SvgIconPlugin({ iconPath: './src/assets/icons', name: 'svg-icon' })]
})
```

## Webpack Plugin (`webpack/index.js`)

Keep existing API. Changes:

- EJS template now renders Vue 3 code (unified with vite)
- `svg-sprite-loader` / `svgo-loader` configuration unchanged
- Simplify: remove fallback to physical `dist/index.esm.js`, always use virtual modules

## Testing

- Framework: Vitest (drop Jest, `@vue/cli-plugin-unit-jest`, `@vue/vue2-jest`)
- Test utils: `@vue/test-utils` v2
- Environment: jsdom
- Test file: `src/__tests__/svg-icon.spec.ts`
- Coverage: `props.name` → correct `href`, `className` variants, CSS class states
- Remove stale `tests/unit/button.spec.ts` (imports non-existent file)

## Dependencies

**Removed:**
- `vue-template-compiler` (replaced by `@vue/compiler-sfc`, bundled by `@vitejs/plugin-vue`)
- `@vue/composition-api` (built into Vue 3)
- `@vue/cli-plugin-babel`, `@vue/cli-plugin-eslint`, `@vue/cli-plugin-typescript`, `@vue/cli-plugin-unit-jest`, `@vue/cli-service`
- `@vue/eslint-config-standard`, `@vue/eslint-config-typescript`
- `@babel/preset-typescript`, `@rollup/plugin-babel`, `babel-jest`, `@vue/vue2-jest`
- `jest`, `ts-jest`, `@types/jest`
- `element-ui`
- `commitizen`, `cz-conventional-changelog`, `husky`, `@commitlint/*`
- `standard-version`

**Added:**
- `vite` (dev + build)
- `@vitejs/plugin-vue` (SFC compilation)
- `vitest` (testing)
- `@vue/test-utils@^2` (component testing)
- `vue-tsc` (type declarations)
- `@types/node` (for path resolution)

**Upgraded:**
- `vue` → `^3.5`
- `typescript` → `~5.8`
- `rollup-plugin-vue` → removed (Vite handles SFC natively)

## Build Scripts

| Old | New |
|-----|-----|
| `vue-cli-service serve` | `vite` (example dev) |
| `rollup --config rollup.config.mjs` | `vite build` (library mode) |
| `vue-cli-service build` | `vite build` (example) |
| `vue-cli-service test:unit` | `vitest run` |
| `vue-cli-service lint` | `eslint` directly |
| `tsc --build tsconfig.types.json` | `vue-tsc --declaration --emitDeclarationOnly` |

## Files to Remove

- `babel.config.js`
- `jest.config.js`
- `vue.config.js`
- `rollup.config.mjs`
- `tests/unit/button.spec.ts`
- `tsconfig.types.json` (merged into tsconfig.json)

## Breaking Changes (v2.0.0)

1. `Vue.use(SvgIcon)` → `app.use(SvgIcon)` (Vue 3 plugin API)
2. `@vue/composition-api` peer dependency removed
3. Vue 2 template compiler not supported
4. `xlink:href` → `href`
5. Minimum Vue version: `^3.5`
