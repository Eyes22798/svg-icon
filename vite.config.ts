import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import SvgIconPlugin from './vite/index.js'

export default defineConfig({
  plugins: [
    vue(),
    SvgIconPlugin({
      iconPath: './example/assets/icons',
      name: 'svg-icon'
    })
  ],
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
