<template>
  <div v-if="!item.hidden" :class="[classChild(item.children)?'link_span':'link_div']" :style="'margin-left:' + item.meta.menuLevel * 10 + 'px'">
    <template v-if="!(item.meta && item.meta.menuType == '2')">
      <el-button type="text" v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow" @click="appLinkClick">
        <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path, onlyOneChild.query)">
          <!-- <svg-icon :icon-font="true" :icon-class="onlyOneChild.meta.icon || (item.meta && item.meta.icon)" /> -->
          <span>{{ $t(onlyOneChild.meta.menuCode && `menu.${onlyOneChild.meta.menuCode}`) || onlyOneChild.meta.title }}</span>
        </app-link>
      </el-button>
      <div class="title_box" v-else>
        <div>
          <p v-if="item.meta">
            <svg-icon :icon-font="true" :icon-class="item.meta && item.meta.icon" />
            <span>{{ $t(item.meta.menuCode && `menu.${item.meta.menuCode}`) || item.meta.title }}</span>
          </p>
        </div>
        <li-item v-for="child in item.children" :key="child.path + '-' +child.meta.id" :item="child" :base-path="resolvePath(child.path)" @appLinkClick="appLinkClick"/>
      </div>
    </template>
    <template v-else>
      <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
        <div :index="resolvePath(onlyOneChild.path)" @click="openWidow(item.meta.componentUrl, item)">
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import AppLink from '@/layout/components/Sidebar/Link'
export default {
  name: 'LiItem',
  components: { AppLink },
  props: {
    item: {
      type: Object,
      required: true
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      onlyOneChild: null,
    }
  },
  methods: {
    classChild (children = []) {
      if (!children) {
        children = [];
      }
      if(children.length > 0){
        return false
      }else{
        return true
      }
    },
    hasOneShowingChild(children = [], parent) {
      if (!children) {
        children = [];
      }
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // Temp set(will be used if only has one showing child)
          this.onlyOneChild = item
          return true
        }
      })
      // When there is only one child router, the child router is displayed by default
      if (showingChildren.length === 1) {
        return true
      }

      // Show parent if there are no child router to display
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ...parent, path: '', noShowingChildren: true }
        return true
      }

      return false
    },
    resolvePath(routePath, routeQuery) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      if (routeQuery) {
        let query = JSON.parse(routeQuery);
        return { path: path.resolve(this.basePath, routePath), query: query }
      }
      return path.resolve(this.basePath, routePath)
    },
    async openWidow(skipUrl, menu) {
      if (menu.name === "testsso") {
        const { data } = await testSSO()
        window.open(data, '_blank');
        return
      }
      if (skipUrl.indexOf('http') != -1) {
        let Url = new URL(skipUrl)
        let connector = Url.search ? "&" : "?"

        if (skipUrl.indexOf('#{p_unit_id}') != -1) {
          skipUrl = await this.replaceUnitId(skipUrl)
        }

        getSnapTicket().then(res => {
          if (res.success) {
            this.url = `${skipUrl}${connector}snapTicket=${res.data.snapTicket}`
          } else {
            this.url = `${skipUrl}${connector}`
          }
          window.open(this.url)
        })
      } else {
        window.open(skipUrl, '_blank');
      }
    },
    appLinkClick () {
      this.$emit('appLinkClick')
    }
  }
}
</script>

<style lang="scss" scoped>
.title_box{
  p{
    padding: 0;
    margin: 0;
  }
}
.link_div, .link_span{
  ::v-deep span{
    vertical-align: middle;
  }
  ::v-deep .iconfont{
    vertical-align: middle;
  }
}
.link_div{
  display: table;
  width: 100%;
}
.link_span{
  float: left;
  margin-left: 10px;
}
.vform_icon {
  font-size: 32px;
  vertical-align: -0.35em !important;
}
.el-button--text{
  padding: 0;
}
</style>
