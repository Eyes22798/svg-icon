<template>
  <svg
    :class="svgClass"
    aria-hidden="true"
    v-on="$listeners"
    :style="{ '--hover-color': interactHoverColor, '--active-color': interactActiveColor }"
  >
    <foreignObject class="mask-box" width="100%" height="100%">
      <div class="mask" />
    </foreignObject>>
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
  },
  computed: {
    iconName() {
      return `#icon-${this.name}`
    },
    svgClass() {
      let svgClass = ''
      if (this.className) {
        svgClass = 'svg-icon' + (Array.isArray(this.className) ? this.className.join(' ') : this.className)
      } else {
        svgClass = 'svg-icon'
      }

      if (this.interact) {
        svgClass += ' ' + 'interact'
      }

      if (this.disabled) {
        svgClass += ' ' + 'disabled'
      }

      return svgClass
    }
  }
}
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

      &:not(:disabled):hover {
        .mask-box {
          display: inline-block;
        }
        .mask {
          background: var(--hover-color);
        }
      }
      &:not(:disabled):active {
        .mask-box {
          display: inline-block;
        }
        .mask {
          background: var(--active-color);
        }
      }
    }
  }
  &.disabled {
    cursor: pointer;
    border-collapse: #d9d9d9;
    color: rgba(0, 0, 0, .25);
    box-shadow: none;
  }
}
</style>
