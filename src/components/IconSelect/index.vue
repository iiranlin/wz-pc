<template>
  <div class="icon-body">
    <el-input v-model="name" style="position: relative;" clearable placeholder="请输入图标名称" suffix-icon="el-icon-search" @input="filterIcons">
    </el-input>
    <div :class="{'icon-list': !menus, 'menu-icon-list': menus}">
      <div v-for="(item, index) in iconList" :key="index" @click="selectedIcon(item)">
        <svg-icon :iconFont="menus" :icon-class="item" :style="menus ?{height: '30px',width: '30px'} : {height: '30px',width: '16px'}" />
        <span class="label">{{ item }}</span>
      </div>
    </div>
  </div>
</template>
<script>
import icons, {mIcons} from './requireIcons'
export default {
  name: 'IconSelect',
  props: {
    menus: {
      type: Boolean,
      default: () => {
        return false
      },
    },
  },
  data(){
    const iconsArr = this.menus ? mIcons : icons
    return{
      name:'',
      iconList: iconsArr,
      iconList2: iconsArr
    }
  },
  methods:{
    filterIcons() {
      this.iconList = this.iconList2
      if (this.name) {
        this.iconList = this.iconList.filter(item => item.includes(this.name))
      }
    },
    selectedIcon(name) {
      this.$emit('select', name)
      document.body.click()
    },
    init() {
      this.name = ''
      this.iconList = this.iconList2
    }
  },
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .icon-body {
    width: 100%;
    .menu-icon-list {
      height: 200px;
      overflow-y: scroll;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: calc(25% - 10px);
        height: 50px;
        margin: 5px;
        cursor: pointer;
        span {
          font-size: 32px !important;
        }
        .label {
          font-size: 12px !important;
          display: inline-block;
          width: 100%;
          white-space:nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          text-align: center;
        }
      }
     
    }
    .icon-list {
      height: 200px;
      overflow-y: scroll;
      div {
        height: 30px;
        line-height: 30px;
        margin-bottom: -5px;
        cursor: pointer;
        width: 33%;
        float: left;
        white-space:nowrap;
      }
      span {
        display: inline-block;
        vertical-align: -0.15em;
        overflow: hidden;
      }
    }
  }
</style>