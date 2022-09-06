# Vue-svg-icon-custom
A lightweight component with no dependecy to allow use of custom SVG icons in your Vue.js application based on SVG sprite.

## Installation
Using NPM:
```shell
npm install @eyes22798/svg-icon --save
```

Using Yarn:

```shell
yarn add @eyes22798/svg-icon
```

## Requirements

 - [Vue.js](https://github.com/vuejs/vue) (2.x+)
 - [svgxuse](https://github.com/Keyamoon/svgxuse) polyfill to support IE9-11 version
 - SVG sprite file that should be available in **"/assets/icons"** folder by default (can be changed, more details in configuration section)


## Usage
In your main.js file:
```js
import SvgIcon from '@eyes22798/svg-icon'

Vue.use(VueSVGCustomIcon)
```

In your vue.config.js

> You can customize the component name and icon assets dir

```js
const SvgIconConfig = require('@eyes22798/svg-icon/webpack')

module.exports = {
  chainWebpack: (config) => {
    SvgIconConfig({ config, iconPath: './src/assets/icons', name: 'svg-icon' })
  }
}
```

In your components:

> this name is current svg file name

```html
  <svg-icon name="file_name" className="iconClass"></svg-icon>
```
- **name** - SVG sprite symbol id value (svg file name)
- **className** - svg class，arrays are supported（`:className=['class1', 'class2']`）

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
