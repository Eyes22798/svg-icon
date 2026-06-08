<template>
  <div id="app">
    <h2>SVG Icon Demo</h2>
    <div class="icon-grid">
      <div v-for="icon in icons" :key="icon" class="icon-item">
        <svg-icon :name="icon" class-name="demo-icon" />
        <span>{{ icon }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const icons = [
  'bianjirenwu',
  'close-circle',
  'question',
  'success',
  'warning-circle',
  'task',
  'a-shujukeshihua',
  'huaban',
  'shouye',
  'shoucang',
  'shanchu',
  'shijianchuo',
  'shijianzhouqi',
  'shuzihua',
  'sousuobianxiao',
  'sousuofangda',
  'wodetuandui',
  'wodexiangmu'
]
</script>

<style lang="scss">
#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  font-family: sans-serif;
}

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 80px;
  font-size: 12px;
  color: #666;
}

.demo-icon {
  font-size: 32px;
  color: #409eff;
}
</style>
