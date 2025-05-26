<template>
  <div v-if="!item.hidden" class="hamburger-container-menu-jdrawer-card">
    <template v-if="!(item.meta && item.meta.menuType == '2')">
      <div class="vform_icon_link" @appLinkClick="$emit('appLinkClick')"
        v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
        <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path, onlyOneChild.query)">
          <li class="el-menu-item">
            <svg-icon :icon-font="true" :icon-class="onlyOneChild.meta.icon || (item.meta && item.meta.icon)" />
            <span>{{ $t(onlyOneChild.meta.menuCode && `menu.${onlyOneChild.meta.menuCode}`) || onlyOneChild.meta.title }}</span>
          </li>
        </app-link>
      </div>
      <el-card :class="[!!folded ? 'folded' : '']" style="width: 100% !important" v-else>
        <div slot="header">
          <svg-icon v-if="item.meta" :icon-font="true" :icon-class="item.meta && item.meta.icon" />
          <span v-if="item.meta" class="card-title">{{ $t(item.meta.menuCode && `menu.${item.meta.menuCode}`) || item.meta.title }}</span>
          <i class="float-right" :class="[!folded ? 'el-icon-arrow-down' : 'el-icon-arrow-up']" @click="toggleCard"></i>
        </div>
        <template v-if="item.children && item.children.length > 0">
          <li-item v-for="child in item.children" :key="child.path + '-' +child.meta.id" :item="child" :base-path="resolvePath(child.path)" @appLinkClick="appLinkClick" />
        </template>
      </el-card>
    </template>
    <template v-else>
      <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
        <div :index="resolvePath(onlyOneChild.path)" @click="openWidow(item.meta.componentUrl, item)">
          <svg-icon :icon-font="true" :icon-class="onlyOneChild.meta.icon || (item.meta && item.meta.icon)" />
          <span>{{ $t(onlyOneChild.meta.menuCode && `menu.${onlyOneChild.meta.menuCode}`) || onlyOneChild.meta.title }}</span>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import AppLink from '@/layout/components/Sidebar/Link'
import LiItem from './li-item'
export default {
  name: 'MenuCard',
  components: { AppLink, LiItem },
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
      folded: false,
      onlyOneChild: null,
    }
  },
  mounted() {
  },
  methods: {
    toggleCard() {
      this.folded = !this.folded
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
.hamburger-container-menu-jdrawer-card{
  ::v-deep .el-card__header{
    position: relative;
    padding: 0 19px;
    background: linear-gradient(90deg, #f5f7fa 0%, #fff 13.79%, #fff 100%) !important;
    .float-right{
      position: absolute;
      top: 26px;
      right: 15px;
      cursor: pointer;
    }
    .card-title {
      &::after {
        width: 40px;
        height: 100%;
        display: block;
        content: "";
        background: url("~@/assets/images/card_header_icon.webp") no-repeat right top;
        background-size: contain;
        position: absolute;
        right: 0px;
        top: 0px;
      }
    }
    span{
      vertical-align: middle;
    }
    .iconfont{
      vertical-align: middle;
    }
    .el-icon-arrow-down, .el-icon-arrow-up {
      font-size: 16px !important;
    }
  }
  ::v-deep .el-card__body{
    padding: 0 20px;
  }
}
.folded ::v-deep .el-card__body {
  display: none;
}

.card-title {
  font-size: 14px;
  vertical-align: middle;
}
.vform_icon_link{
  width: 100% !important;
  span{
    font-size: 16px;
    vertical-align: middle;
  }
}
</style>
