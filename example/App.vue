<template>
  <div id="app">
    <div>
      <h2>SVG ICON LIST ViEW</h2><svg-icon-1 name="success" className="icon-task" />

      <IconList :icons="icons" />
    </div>
  </div>
</template>

<script>
import IconList from '../example/components/icon-list.vue'

export default {
  name: 'App',
  components: {
    IconList,
  },
  data() {
    return {
      icons: [
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
      ]
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 20px;
  background-color: #f4f4f6;
  height: calc(100vh - 40px - 20px);
}

.icon-task {
  color: skyblue;
}
</style>
