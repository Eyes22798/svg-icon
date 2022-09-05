<template>
  <svg :class="svgClass" aria-hidden="true" v-on="$listeners">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script>
export default {
  name: 'SvgIcon',
  props: {
    name: {
      type: String,
      required: true
    },
    className: {
      type: [String, Array],
      default: ''
    }
  },
  computed: {
    iconName() {
      return `#icon-${this.name}`
    },
    svgClass() {
      if (this.className) {
        return 'svg-icon ' + (Array.isArray(this.className) ? this.className.join(' ') : this.className)
      } else {
        return 'svg-icon'
      }
    }
  }
}
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>