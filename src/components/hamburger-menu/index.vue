<template>
  <el-drawer
    :custom-class="`hamburger-container-menu-jdrawer ${!sidebar.opened ? 'hamburger-container-menu-left' : ''}`"
    title="全部菜单" :visible.sync="drawer" :destroy-on-close="true" size="50%" :withHeader="false" :direction="direction"
    :modal="modal" :before-close="handleClose">
    <div class="hamburger-container-menu-jdrawer-search">
      <el-input placeholder="请输入菜单名称" v-model="filterText" @keyup.enter.native="searchClick">
        <el-button slot="append" icon="el-icon-search" @click="searchClick">搜索</el-button>
      </el-input>
    </div>
    <div v-if="!isData || filteredData.length" class="hamburger-container-menu-jdrawer-div">
      <menu-card ref="menuCard" v-for="(route, index) in isData?filteredData:sidebarRouters" :key="route.path + index" :item="route"
        :base-path="route.path" @appLinkClick="handleClose" />
    </div>
    <div v-else class="hamburger-container-menu-jdrawer-div">
      <span class="hamburger-container-menu-jdrawer-div-span">暂无数据</span>
    </div>
  </el-drawer>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import MenuCard from "./components/menu-card"
export default {
  name: 'HamburgerMenu',
  components: { MenuCard },
  props: {
    direction: {
      type: String,
      default: 'ltr'
    },
    modal: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      drawer: false,
      filterText: '',
      filterTextA: '',
      filteredData: [],
      isData: false
    }
  },
  computed: {
    ...mapGetters(["sidebarRouters"]),
    ...mapState({
      sidebar: state => state.app.sidebar,
      device: state => state.app.device,
    })
  },
  methods: {
    handleClose() {
      this.drawer = false
    },
    searchClick() {
      this.isData = true
      if(this.filterText){
        if(this.filterText != this.filterTextA){
          this.filteredData = []
          this.$nextTick( () => {
            this.filteredData = this.filterData(JSON.parse(JSON.stringify(this.sidebarRouters)), this.filterText)
            this.filterTextA = this.filterText
          })
        }
      }else{
        this.filteredData = []
        this.isData = false
        this.filterTextA = ''
      }
    },
    filterData(data, keyword) {
      return data.filter(node => {
        // 判断当前节点是否匹配筛选条件
        if (node.meta && node.meta.title && node.meta.title.includes(keyword) && !node.meta.hidden) {
          return true;
        }
        // 递归过滤子节点
        if (node.children && node.children.length) {
          node.children = this.filterData(node.children, keyword);
          return node.children.length > 0;
        }
        return false;
      });
    },

  }
}
</script>

<style lang="scss" scoped>
::v-deep .hamburger-container-menu-jdrawer {
  left: 202px !important;
  top: 85px !important;
  height: calc(100% - 85px) !important;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);

  .el-drawer__body {
    display: flex;
    flex-direction: column;
  }

  .hamburger-container-menu-jdrawer-search {
    width: 40%;
    margin-left: 20px;
    padding: 10px 0;
  }
}

::v-deep .hamburger-container-menu-left {
  left: 55px !important;
}

.el-drawer__wrapper {
  z-index: 1000 !important;
}

::v-deep .el-input-group__append {
  border-color: #227aff !important;

  .el-button {
    background-color: #227aff;
    border-color: #227aff;
    color: #ffffff;
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
  }
}
.hamburger-container-menu-jdrawer-div{
  width: 100%;
  // text-align: center;
  flex: 1;
  overflow: auto;
  .hamburger-container-menu-jdrawer-div-span{
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -64px;
    margin-top: -48px;
  }
}
</style>
