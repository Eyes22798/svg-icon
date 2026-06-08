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
