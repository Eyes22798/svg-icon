<template>
  <div id="app">
    <div>
      <h2>SVG ICON LIST ViEW</h2><svg-icon-1 name="success" className="icon-task" />

      <IconList :icons="icons" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import IconList from '../example/components/icon-list.vue'

export default defineComponent({
  components: {
    IconList,
  },
  setup() {
    const icons =  [
      { name: 'bianjirenwu' },
      { name: 'close-circle' },
      { name: 'question' },
      { name: 'success' },
      { name: 'warning-circle' },
      { name: 'task' },
      { name: 'a-shujukeshihua' },
      { name: 'huaban' },
      { name: 'shouye' },
      { name: 'shoucang' },
      { name: 'shanchu' },
      { name: 'shijianchuo' },
      { name: 'shijianzhouqi' },
      { name: 'shuzihua' },
      { name: 'sousuobianxiao' },
      { name: 'sousuofangda' },
      { name: 'wodetuandui' },
      { name: 'wodexiangmu' },
      // { name: 'business-fill' },
    ]

    return {
      icons
    }
  }
})
</script>

<style lang="scss">

</style>
