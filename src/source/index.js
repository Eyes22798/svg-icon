import SvgIcon from '../icon.vue'
const requireAll = requireContext => requireContext.keys().map(requireContext)

// <%= iconPath %>
const req = require.context('<%= iconPath %>', true, /\.svg$/)
const componentName = '<%= name %>'
requireAll(req)

SvgIcon.install = function (Vue) {
  Vue.component(componentName || SvgIcon.name, SvgIcon)
}

export default SvgIcon
