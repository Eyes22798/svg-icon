import SvgIcon from '<%= componentSource %>'

const icons = import.meta.glob('/<%= iconPath %>/**/*.svg', { eager: true, query: '?raw', import: 'default' })
window.__svg_icons__ = Object.keys(icons)

const componentName = '<%= name %>'

SvgIcon.install = function (app) {
  app.component(componentName || 'SvgIcon', SvgIcon)
}

export default SvgIcon
