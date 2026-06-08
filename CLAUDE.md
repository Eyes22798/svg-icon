# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server for the example app
npm run build        # Full build: Vite library mode (ESM + UMD) + type declarations
npm run build:types  # vue-tsc type declarations only
npm run preview      # Preview production build of the example app
npm run test         # Run Vitest unit tests
npm run test:watch   # Vitest in watch mode
```

## Architecture

This is a Vue 3 SVG icon component library (`@eyes22798/svg-icon`) that renders icons from an SVG sprite. It ships with both Vite and webpack integration helpers for consumers.

### Source layout

- **`src/svg-icon.vue`** — The Vue 3 component written in `<script setup lang="ts">` (Composition API). Takes `name` (SVG symbol ID), `className`, `disabled`, `interact` (hover/active effects), and color props. Renders an `<svg>` with a `<use>` element pointing to `#icon-{name}` via `href` (SVG 2).
- **`src/template-webpack.js`** — EJS template for webpack. Uses `require.context` to auto-import SVGs from the consumer's icon directory. Contains `<%= iconPath %>` and `<%= name %>` EJS placeholders.
- **`src/template-vite.js`** — EJS template for Vite. Uses `import.meta.glob` instead of `require.context`. Contains `<%= componentSource %>` placeholder for the SFC path resolved at plugin render time.
- **`src/index.js`** — Re-exports from `template-webpack.js`.

### Vite plugin (`vite/index.js`)

The `SvgIconPlugin` function is the main export consumers use in `vite.config.ts`. It does three things:

1. **Virtual module** — Intercepts imports of `@eyes22798/svg-icon` and returns the Vite template rendered with EJS (injecting `componentSource`, `iconPath`, and component `name`).
2. **SVG sprite injection** (`transformIndexHtml`) — Recursively collects all SVGs from the consumer's icon directory, wraps them as `<symbol>` elements, and injects an inline sprite before `</body>`.
3. **SVGO optimization** — Strips `fill` attributes from SVGs, excluding files under `original/` subdirectories.

Zero external sprite dependencies (only `fs`, `path`, `ejs`).

### Webpack plugin (`webpack/index.js`)

The `SvgIconConfig` function for webpack consumers (`vue.config.js`). Uses `svg-sprite-loader`, `svgo-loader`, and `webpack-virtual-modules`. Renders the webpack EJS template into a virtual module at `node_modules/@eyes22798/svg-icon/index.js`.

### Build (`vite.config.ts`)

Vite library mode builds from `src/index.js` → `dist/`:
- `es` → `dist/index.esm.js`
- `umd` → `dist/index.umd.js`

TypeScript declarations via `vue-tsc` → `dist/types/`. External dependency: `vue`.

### Testing

Vitest with `@vue/test-utils` v2 and `jsdom`. Test files live in `src/__tests__/`. Run with `npm test`.

### Example app

A vanilla Vue 3 app in `example/` that demonstrates the icon component. Uses the Vite plugin to load SVG icons. Run with `npm run dev`.
