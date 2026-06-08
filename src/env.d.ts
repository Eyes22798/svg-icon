declare module '@eyes22798/svg-icon' {
  import { Plugin, DefineComponent } from 'vue'
  const component: DefineComponent<{
    name: string
    className?: string | string[]
    disabled?: boolean
    interact?: boolean
    interactHoverColor?: string
    interactActiveColor?: string
  }> & { install: Plugin['install'] }
  export default component
}
