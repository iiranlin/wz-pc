<template>
  <div class="hamburger-container-flex">
    <div style="padding-left: 15px;padding-right: 10px;" @click="toggleClick">
      <svg :class="{'is-active':isActive}" class="hamburger" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
        <path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z" />
      </svg>
    </div>
    <div class="hamburger-container-flex-jw" style="padding-left: 10px;padding-right: 15px;" @click="menuClick">
      <svg-icon icon-class="jw-菜单" />
    </div>
    <hamburger-menu :modal="modal" ref="hamburgerMenu"/>
  </div>
</template>

<script>
import HamburgerMenu from "@/components/hamburger-menu"
export default {
  name: 'Hamburger',
  components: { HamburgerMenu },
  props: {
    isActive: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      modal: false
    }
  },
  methods: {
    toggleClick() {
      this.$emit('toggleClick')
    },
    menuClick () {
      this.$refs.hamburgerMenu.drawer = true
    }
  }
}
</script>

<style lang="scss" scoped>
.hamburger {
  display: inline-block;
  vertical-align: middle;
  width: 15px;
  height: 15px;
  fill: rgba(166, 181, 203, 1);
}

.hamburger.is-active {
  transform: rotate(180deg);
}
.hamburger:hover{
  fill: #3D8AFF;
  opacity: 1;
}
.hamburger-container-flex{
  display: flex;
  .hamburger-container-flex-jw{
    ::v-deep .svg-icon{
      vertical-align: -0.2em;
      fill: rgba(166, 181, 203, 1);
      font-size: 15px;
      &:hover{
        fill: #3D8AFF;
        opacity: 1;
      }
    }
  }
}
</style>
