<template>
  <div class="page-section">
    <div class="icon-list">
      <div class="icon-item" v-for="v in icons" :key="v.name">
          <div class="icon">
            <svg-icon-1 :name="v.name"></svg-icon-1>
          </div>
          <p class="icon-name">
              {{ v.name }}
              <br />
          </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IconList',
  props: {
    msg: String,
    icons: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.icon-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-auto-rows: 120px;
    overflow: hidden;
    margin-top: 10px;
    border: 1px solid #E8E8E8;
    border-width: 1px 0 0 1px;
}

* {
  outline: none;
}

.icon-item {
    display: flex;
    border: 1px solid #E8E8E8;
    background: #FFF;
    color: #525252;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    border-width: 0 1px 1px 0;
    flex-direction: column;
}

.icon-item .icon {
    display: flex;
    width: 100%;
    justify-content: space-around;
    align-items: center;
    max-width: 300px;
}

.icon-item .svg-icon {
    width: 32px;
    height: 32px;
}

.icon-item p {
    margin: 0;
    margin-top: 10px;
    color: #262626;
    font-size: 14px;
    text-align: center;
}

.icon-name {
    line-height: 1.5;
}

.icon-name span {
    color: #8C8C8C;
}
</style>
