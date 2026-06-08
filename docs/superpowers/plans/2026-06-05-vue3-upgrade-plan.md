# Vue 3 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade @eyes22798/svg-icon from Vue 2 to Vue 3 only with Composition API, Vite + Vitest toolchain, and a new Vite plugin.

**Architecture:** Rewrite the SVG icon component to `<script setup>` Composition API. Two build plugins — `webpack/index.js` (upgraded) and `vite/index.js` (new) — each use EJS to render a platform-specific template via virtual modules. The Vite plugin implements SVG sprite generation and SVGO optimization with zero external sprite dependencies. Testing moves from Jest to Vitest with @vue/test-utils v2.

**Tech Stack:** Vue 3.5+, Vite 6, Vitest, @vue/test-utils v2, TypeScript 5.x, EJS, Rollup (via Vite)

---

### Task 1: Clean up old toolchain

**Files:**
- Remove: `babel.config.js`, `jest.config.js`, `vue.config.js`, `rollup.config.mjs`, `tsconfig.types.json`, `tests/unit/button.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Remove old config files**

```bash
git rm babel.config.js jest.config.js vue.config.js rollup.config.mjs tsconfig.types.json tests/unit/button.spec.ts
```

- [ ] **Step 2: Strip old dependencies and scripts from package.json**

Read `package.json`, then rewrite it to remove old devDependencies and scripts, keeping only what's needed for the new setup.

Remove these keys from `devDependencies`:
- `@babel/preset-typescript`, `@commitlint/cli`, `@commitlint/config-conventional`, `@rollup/plugin-alias`, `@rollup/plugin-babel`, `@rollup/plugin-commonjs`, `@rollup/plugin-json`, `@rollup/plugin-node-resolve`, `@rollup/plugin-replace`, `@types/jest`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `@vue/cli-plugin-babel`, `@vue/cli-plugin-eslint`, `@vue/cli-plugin-typescript`, `@vue/cli-plugin-unit-jest`, `@vue/cli-service`, `@vue/composition-api`, `@vue/eslint-config-standard`, `@vue/eslint-config-typescript`, `@vue/test-utils`, `@vue/vue2-jest`, `babel-jest`, `commitizen`, `core-js`, `coveralls`, `cz-conventional-changelog`, `element-ui`, `eslint`, `eslint-plugin-import`, `eslint-plugin-node`, `eslint-plugin-promise`, `eslint-plugin-standard`, `eslint-plugin-vue`, `fs-extra`, `husky`, `jest`, `minimist`, `rimraf`, `rollup`, `rollup-plugin-filesize`, `rollup-plugin-import-assert`, `rollup-plugin-postcss`, `rollup-plugin-typescript2`, `rollup-plugin-vue`, `sass`, `sass-loader`, `standard-version`, `ts-jest`, `typescript`, `vue-template-compiler`

Remove these keys from `dependencies`:
- None — keep `ejs`, `glob`, `svg-sprite-loader`, `svgo-loader`, `webpack-virtual-modules` (all needed by webpack plugin at runtime)

Remove `peerDependencies`.

Remove `husky`, `commitlint`, `config`, `standard-version` keys.

Rewrite `scripts` to:
```json
{
  "dev": "vite",
  "build": "vite build",
  "build:types": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/types",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "lint": "eslint src/ vite/ webpack/ example/ --ext .ts,.vue,.js --fix"
}
```

Update `keywords` to add `"vue3"`.

Change `version` to `"2.0.0"`.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: remove Vue 2 toolchain and dependencies"
```

---

### Task 2: Install new dependencies and create configs

**Files:**
- Create: `vite.config.ts`, `vitest.config.ts`
- Modify: `tsconfig.json`, `package.json`

- [ ] **Step 1: Install new dependencies**

```bash
pnpm add vue@^3.5
pnpm add -D vite @vitejs/plugin-vue vitest @vue/test-utils@^2 jsdom vue-tsc typescript@^5 @types/node
```

Also keep `sass` for SCSS support (re-add if removed):
```bash
pnpm add -D sass
```

- [ ] **Step 2: Create vite.config.ts**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'SvgIcon',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
        assetFileNames: 'svg-icon.[ext]'
      }
    }
  }
})
```

- [ ] **Step 3: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
```

- [ ] **Step 4: Update tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "strict": true,
    "jsx": "preserve",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "sourceMap": true,
    "baseUrl": ".",
    "types": ["vitest/globals"],
    "paths": {
      "@/*": ["src/*"]
    },
    "lib": ["esnext", "dom", "dom.iterable"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "example/**/*.ts",
    "example/**/*.vue",
    "vite/**/*.ts",
    "vite/**/*.js"
  ],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: add Vue 3 + Vite + Vitest toolchain"
```

---

### Task 3: Rewrite component to Composition API

**Files:**
- Modify: `src/svg-icon.vue`

- [ ] **Step 1: Write the component**

Replace the entire content of `src/svg-icon.vue`:

```vue
<template>
  <svg
    :class="svgClass"
    aria-hidden="true"
    :style="{ '--hover-color': interactHoverColor, '--active-color': interactActiveColor }"
  >
    <foreignObject class="mask-box" width="100%" height="100%">
      <div class="mask" />
    </foreignObject>
    <use :href="iconName" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  className: {
    type: [String, Array],
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  interact: {
    type: Boolean,
    default: false
  },
  interactHoverColor: {
    type: String,
    default: '#e4e5eb'
  },
  interactActiveColor: {
    type: String,
    default: '#cacdd3'
  }
})

const iconName = computed(() => `#icon-${props.name}`)

const svgClass = computed(() => {
  let cls = 'svg-icon'
  if (props.className) {
    cls += ' ' + (Array.isArray(props.className) ? props.className.join(' ') : props.className)
  }
  if (props.interact) {
    cls += ' interact'
  }
  if (props.disabled) {
    cls += ' disabled'
  }
  return cls
})
</script>

<style lang="scss">
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;

  .mask-box {
    display: none;
  }

  &.interact {
    cursor: pointer;
    overflow: visible !important;

    .mask-box {
      position: relative;
      overflow: visible !important;
      display: inline-block;

      .mask {
        position: absolute;
        width: 150%;
        height: 150%;
        border-radius: 4px;
        border-color: transparent;
        transition: background .1s ease-in-out;
        left: -25%;
        top: -25%;
        box-shadow: 0px 0px 2px 0px #00000014;
      }
    }

    &:hover .mask {
      background: var(--hover-color);
    }

    &:active .mask {
      background: var(--active-color);
    }
  }

  &.disabled {
    cursor: not-allowed;
    color: rgba(0, 0, 0, .25);
    box-shadow: none;
  }
}
</style>
```

Key changes:
- `v-on="$listeners"` removed (Vue 3 auto-merges into `$attrs`)
- `xlink:href` → `href`
- `export default { ... }` → `<script setup lang="ts">` with `defineProps` and `computed()`
- SCSS hover/active moved outside `.mask-box` scope (Vue 2 was nested incorrectly — the `&:not(:disabled):hover` was inside `.mask-box` but should be on the parent `.interact` element)
- `display: inline-block` added to `.mask-box` by default when `.interact` (was only added on hover before, but `:not(:disabled)` pseudo-class on `.mask-box` was also broken)

- [ ] **Step 2: Commit**

```bash
git add src/svg-icon.vue && git commit -m "refactor: rewrite SvgIcon to Vue 3 Composition API"
```

---

### Task 4: Update EJS templates

**Files:**
- Rename: `src/template.js` → `src/template-webpack.js`
- Create: `src/template-vite.js`

- [ ] **Step 1: Rename and update the webpack template**

Rename `src/template.js` to `src/template-webpack.js`:

```bash
git mv src/template.js src/template-webpack.js
```

Update `src/template-webpack.js`:

```js
import SvgIcon from './svg-icon.vue'

const requireAll = (requireContext) => {
  window.__svg_icons__ = requireContext.keys()
  return requireContext.keys().map(requireContext)
}

// <%= iconPath %>
const req = require.context('<%= iconPath %>', true, /\.svg$/)
const componentName = '<%= name %>'
requireAll(req)

SvgIcon.install = function (app) {
  app.component(componentName || 'SvgIcon', SvgIcon)
}

export default SvgIcon
```

Change: `Vue.component(...)` → `app.component(...)`.

- [ ] **Step 2: Create the Vite template**

Create `src/template-vite.js`:

```js
import SvgIcon from '<%= componentSource %>'

const icons = import.meta.glob('<%= iconPath %>/**/*.svg', { eager: true, query: '?raw', import: 'default' })
window.__svg_icons__ = Object.keys(icons)

const componentName = '<%= name %>'

SvgIcon.install = function (app) {
  app.component(componentName || 'SvgIcon', SvgIcon)
}

export default SvgIcon
```

The `<%= componentSource %>` placeholder is an EJS variable injected by the Vite plugin at render time. It will be replaced with the absolute filesystem path to `src/svg-icon.vue`, ensuring Vite resolves the import correctly from within the virtual module.

- [ ] **Step 3: Update src/index.js to point to the new webpack template name**

```js
import install from './template-webpack.js'

export default install
```

- [ ] **Step 4: Commit**

```bash
git add src/ && git commit -m "refactor: update templates for Vue 3 install API"
```

---

### Task 5: Write component tests

**Files:**
- Create: `src/__tests__/svg-icon.spec.ts`

- [ ] **Step 1: Create the test file**

Create `src/__tests__/svg-icon.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SvgIcon from '../svg-icon.vue'

describe('SvgIcon', () => {
  it('renders with correct href pointing to icon symbol', () => {
    const wrapper = mount(SvgIcon, {
      props: { name: 'close' }
    })
    const use = wrapper.find('use')
    expect(use.attributes('href')).toBe('#icon-close')
  })

  it('has base class svg-icon', () => {
    const wrapper = mount(SvgIcon, {
      props: { name: 'test' }
    })
    expect(wrapper.classes()).toContain('svg-icon')
  })

  it('appends single className string', () => {
    const wrapper = mount(SvgIcon, {
      props: { name: 'test', className: 'my-icon' }
    })
    expect(wrapper.classes()).toContain('svg-icon')
    expect(wrapper.classes()).toContain('my-icon')
  })

  it('appends array of classNames', () => {
    const wrapper = mount(SvgIcon, {
      props: { name: 'test', className: ['foo', 'bar'] }
    })
    expect(wrapper.classes()).toContain('foo')
    expect(wrapper.classes()).toContain('bar')
  })

  it('adds interact class when interact prop is true', () => {
    const wrapper = mount(SvgIcon, {
      props: { name: 'test', interact: true }
    })
    expect(wrapper.classes()).toContain('interact')
  })

  it('adds disabled class when disabled prop is true', () => {
    const wrapper = mount(SvgIcon, {
      props: { name: 'test', disabled: true }
    })
    expect(wrapper.classes()).toContain('disabled')
  })

  it('sets CSS variables for hover and active colors', () => {
    const wrapper = mount(SvgIcon, {
      props: {
        name: 'test',
        interactHoverColor: '#ff0000',
        interactActiveColor: '#00ff00'
      }
    })
    const style = wrapper.attributes('style')
    expect(style).toContain('--hover-color: #ff0000')
    expect(style).toContain('--active-color: #00ff00')
  })

  it('renders foreignObject mask for interact', () => {
    const wrapper = mount(SvgIcon, {
      props: { name: 'test', interact: true }
    })
    expect(wrapper.find('foreignObject').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
npx vitest run
```

Expected: 7 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/svg-icon.spec.ts && git commit -m "test: add component tests for Vue 3 SvgIcon"
```

---

### Task 6: Implement Vite plugin

**Files:**
- Create: `vite/index.js`

The Vite plugin consists of a single file. It includes the component definition inline so no external SFC imports are needed from the virtual module.

- [ ] **Step 1: Create vite/index.js**

Create `vite/index.js`:

```js
const { readFileSync, readdirSync, statSync, existsSync } = require('fs')
const { resolve, join, basename, extname } = require('path')
const ejs = require('ejs')

const VIRTUAL_MODULE_ID = '@eyes22798/svg-icon'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

function collectSvgSymbols(dir, prefix = 'icon-', originalDirs = []) {
  if (!existsSync(dir)) return ''

  const files = readdirSync(dir)
  let result = ''

  for (const file of files) {
    const fullPath = join(dir, file)
    if (statSync(fullPath).isDirectory()) {
      result += collectSvgSymbols(fullPath, prefix, originalDirs)
    } else if (extname(file) === '.svg') {
      const content = readFileSync(fullPath, 'utf-8')
      const symbolId = prefix + basename(file, '.svg')

      const viewBoxMatch = content.match(/viewBox="([^"]*)"/)
      const innerMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i)
      const inner = innerMatch ? innerMatch[1] : ''

      const isOriginal = originalDirs.some(d =>
        fullPath.includes(d + '/') || fullPath.includes(d + '\\')
      )
      const cleaned = isOriginal
        ? inner
        : inner.replace(/\bfill\s*=\s*["'][^"']*["']/gi, '')

      result += `<symbol id="${symbolId}"${viewBoxMatch ? ` viewBox="${viewBoxMatch[1]}"` : ''}>${cleaned}</symbol>`
    }
  }

  return result
}

function findOriginalDirs(iconDir) {
  if (!existsSync(iconDir)) return []
  const result = []
  function walk(dir) {
    const files = readdirSync(dir)
    for (const file of files) {
      const fullPath = join(dir, file)
      if (statSync(fullPath).isDirectory()) {
        if (file === 'original') result.push(fullPath)
        walk(fullPath)
      }
    }
  }
  walk(iconDir)
  return result
}

module.exports = function SvgIconPlugin(options = {}) {
  const { iconPath = './src/assets/icons', name = 'svg-icon' } = options

  let resolvedIconPath = ''
  let originalDirs = []
  let componentSource = ''
  let templateSource = ''

  return {
    name: 'svg-icon-plugin',

    configResolved(config) {
      resolvedIconPath = resolve(config.root, iconPath)
      originalDirs = findOriginalDirs(resolvedIconPath)
    },

    buildStart() {
      // Resolve absolute path to the SFC source, works in both dev (this repo)
      // and production (installed in consumer's node_modules)
      componentSource = resolve(__dirname, '../src/svg-icon.vue').split('\\').join('/')
      const templatePath = resolve(__dirname, '../src/template-vite.js')
      templateSource = readFileSync(templatePath, 'utf-8')
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return ejs.render(templateSource, {
          componentSource,
          iconPath: resolvedIconPath.split('\\').join('/'),
          name
        })
      }
    },

    transformIndexHtml(html) {
      const symbols = collectSvgSymbols(resolvedIconPath, 'icon-', originalDirs)
      const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols}</svg>`
      return html.replace('</body>', sprite + '</body>')
    }
  }
}
```

Key points:
- `componentSource` is the absolute filesystem path to `src/svg-icon.vue`, injected via EJS into the template's `import SvgIcon from '<%= componentSource %>'` statement. This ensures Vite resolves the `.vue` file correctly from within the virtual module.
- `transformIndexHtml` injects the SVG sprite directly into the HTML. No external sprite library needed.
- `original` directories are detected and excluded from SVGO `fill` stripping.
- The template source is cached in `buildStart` — read once at startup.

- [ ] **Step 2: Commit**

```bash
git add vite/index.js && git commit -m "feat: add Vite plugin for SVG icon"
```

---

### Task 7: Update webpack plugin for Vue 3

**Files:**
- Modify: `webpack/index.js`

- [ ] **Step 1: Update webpack/index.js**

Key changes to `webpack/index.js`:
- Replace `require('fs-extra')` with `require('fs')` (Node.js built-in, no extra dep needed)
- Change glob pattern `'./src/**/*.vue'` → `'./src/svg-icon.vue'` (only virtualize the single SFC)
- Template path: `'../src/template.js'` → `'../src/template-webpack.js'`
- Remove the `isPackageInstalled` check — always read from source template

The updated `readFile` function and `_addVirtualModules` method:

```js
const fs = require('fs')
// Remove: const fsExtra = require('fs-extra')

const readFile = function ({ dir = '', prefix = ''}) {
  const files = glob.sync(dir, {
    absolute: true,
    cwd: path.resolve(__dirname, '..')
  })
  const result = {}

  files.forEach((file) => {
    const data = fs.readFileSync(file, 'utf8')  // was fsExtra.readFileSync
    const parseResult = path.parse(file)
    const fileName = parseResult.name + parseResult.ext

    result[prefix ? `${prefix}/${fileName}` : prefix] = data
  })

  return result
}

// In _addVirtualModules:
_addVirtualModules(compiler) {
  const data = readFile({
    prefix: this.virtualModulesPrefix,
    dir: './src/svg-icon.vue',  // was: './src/**/*.vue'
  })

  const sourcePath = path.resolve(__dirname, '../src/template-webpack.js')

  const iconPathArr = path.resolve(process.cwd(), this.options.iconPath).split(path.sep)
  const rawSource = fs.readFileSync(sourcePath, 'utf-8')
  const source = ejs.render(rawSource, {
    iconPath: iconPathArr.join('/'),
    name: this.options.name
  })
  data[`${this.virtualModulesPrefix}/index.js`] = source

  this.virtualModulesPlugin = new VirtualModulesPlugin(data)
  this.virtualModulesPlugin.apply(compiler)
}
```

Also remove the `isPackageInstalled` function and the unused `resolve`/`findFileFolder` helpers if present.

- [ ] **Step 2: Commit**

```bash
git add webpack/index.js && git commit -m "refactor: update webpack plugin for Vue 3"
```

---

### Task 8: Simplify example app

**Files:**
- Modify: `example/main.ts`, `example/App.vue`
- Remove: `example/components/icon-list.vue`

- [ ] **Step 1: Rewrite example/main.ts**

```ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

- [ ] **Step 2: Rewrite example/App.vue**

```vue
<template>
  <div id="app">
    <h2>SVG Icon Demo</h2>
    <div class="icon-grid">
      <div v-for="icon in icons" :key="icon" class="icon-item">
        <svg-icon :name="icon" class-name="demo-icon" />
        <span>{{ icon }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const icons = [
  'bianjirenwu',
  'close-circle',
  'question',
  'success',
  'warning-circle',
  'task',
  'a-shujukeshihua',
  'huaban',
  'shouye',
  'shoucang',
  'shanchu',
  'shijianchuo',
  'shijianzhouqi',
  'shuzihua',
  'sousuobianxiao',
  'sousuofangda',
  'wodetuandui',
  'wodexiangmu'
]
</script>

<style lang="scss">
#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  font-family: sans-serif;
}

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 80px;
  font-size: 12px;
  color: #666;
}

.demo-icon {
  font-size: 32px;
  color: #409eff;
}
</style>
```

- [ ] **Step 3: Remove old icon-list component**

```bash
git rm example/components/icon-list.vue
```

- [ ] **Step 4: Commit**

```bash
git add example/ && git commit -m "refactor: simplify example app to vanilla Vue 3"
```

---

### Task 9: Update package.json for publishing

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Finalize package.json**

Ensure `package.json` has the correct entry points and files:

```json
{
  "name": "@eyes22798/svg-icon",
  "version": "2.0.0",
  "main": "dist/index.esm.js",
  "module": "dist/index.esm.js",
  "types": "dist/types/svg-icon.vue.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.umd.js"
    },
    "./webpack": "./webpack/index.js",
    "./vite": "./vite/index.js"
  },
  "files": [
    "dist",
    "webpack",
    "vite",
    "src/svg-icon.vue",
    "src/template-vite.js",
    "src/template-webpack.js",
    "src/index.js"
  ],
  "scripts": {
    "dev": "vite",
    "build": "vite build && npm run build:types",
    "build:types": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/types",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/ vite/ webpack/ example/ --ext .ts,.vue,.js --fix"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json && git commit -m "chore: update package.json for Vue 3 publishing"
```

---

### Task 10: Verify build, tests, and dev server

- [ ] **Step 1: Run tests**

```bash
npx vitest run
```

Expected: All 7 tests pass.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds. Output in `dist/`:
```
dist/
├── index.esm.js
├── index.umd.js
├── svg-icon.css
└── types/
    └── svg-icon.vue.d.ts
```

- [ ] **Step 3: Run type check**

```bash
npx vue-tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Verify dev server**

```bash
npm run dev
```

Expected: Dev server starts, `/example/` app loads in browser. Icons render correctly.

- [ ] **Step 5: Commit any final fixes**

```bash
git add -A && git commit -m "chore: final verification fixes"
```

---

### Task 11: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md to reflect Vue 3 toolchain**

Update the `CLAUDE.md` commands section to the new scripts. Remove references to Vue CLI, add Vite/Vitest commands.

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md && git commit -m "docs: update CLAUDE.md for Vue 3"
```
