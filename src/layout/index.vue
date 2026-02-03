<template>
  <div :class="classObj" class="app-wrapper" :style="{'--current-color': theme}">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"/>
    <sidebar class="sidebar-container" v-if="sideTheme == 'theme-dark' || sideTheme == 'theme-dark-top'"/>
    <div :class="{hasTagsView:needTagsView}" class="main-container" :style="sideTheme != 'theme-dark' && sideTheme != 'theme-dark-top'?'margin-left:0px':''">
      <div :class="{'fixed-header':fixedHeader}">
        <navbar />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main id="appMainSearch"/>
      <right-panel>
        <settings />
      </right-panel>
    </div>
    <!-- 项目选择弹窗（首次加载不可取消） -->
    <select-project ref="selectProjectDialog" :showCancelButton="true"></select-project>
  </div>
</template>

<script>
import RightPanel from '@/components/RightPanel'
import { AppMain, Navbar, Settings, Sidebar, TagsView } from './components'
import ResizeMixin from './mixin/ResizeHandler'
import { mapState } from 'vuex'
import variables from '@/assets/styles/variables.scss'
import SelectProject from '@/components/SelectProject'

export default {
  name: 'Layout',
  components: {
    AppMain,
    Navbar,
    RightPanel,
    Settings,
    Sidebar,
    TagsView,
    SelectProject
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapState({
      theme: state => state.settings.theme,
      sideTheme: state => state.settings.sideTheme,
      sidebar: state => state.app.sidebar,
      device: state => state.app.device,
      needTagsView: state => state.settings.tagsView,
      fixedHeader: state => state.settings.fixedHeader
    }),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    },
    variables() {
      return variables;
    }
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    }
  },
  async created() {
    try {
      // 获取可选项目列表
      const res = await this.$store.dispatch('GetSameProjectUser')
      const projectList = res?.data || []
      
      // 如果有多个项目且是首次加载，自动弹出项目选择弹窗
      if (projectList.length > 1 && !sessionStorage.getItem('firstLoadDialog')) {
        sessionStorage.setItem('firstLoadDialog', 'true')
        this.$nextTick(() => {
          if (this.$refs.selectProjectDialog) {
            this.$refs.selectProjectDialog.dialogShow = true
            this.$store.commit('SET_SELECT_PROJECT_DIALOG', true)
          }
        })
      }
    } catch (error) {
      console.warn('获取项目列表失败:', error)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/assets/styles/mixin.scss";
  @import "~@/assets/styles/variables.scss";

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;

    &.mobile.openSidebar {
      position: fixed;
      top: 0;
    }
  }

  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$base-sidebar-width});
    transition: width 0.28s;
  }

  .hideSidebar .fixed-header {
    width: calc(100% - 54px);
  }

  .mobile .fixed-header {
    width: 100%;
  }
</style>
