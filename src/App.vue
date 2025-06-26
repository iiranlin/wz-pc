<template>
  <div id="app"
    :class="{ 'theme_colour': themeColour == '2', 'theme_colour_app': themeColour == '1', 'control_fillet': controlTheme == '1', 'control_straight': controlTheme == '2' }">
    <router-view />
    <watermark v-if="watermarkConfig" :text="watermarkConfig.text" :opacity="watermarkConfig.opacity"
      :tile-width="watermarkConfig.tileWidth" :tile-height="watermarkConfig.tileHeight"
      :font-size="watermarkConfig.fontSize" :rotate="watermarkConfig.rotate" class="watermark-layer"></watermark>
  </div>

</template>

<script>
import { getUserInfo } from '@/utils/user-info'
import { mapState } from 'vuex'
import watermark from 'vue-watermark'
import dayjs from 'dayjs'

export default {
  name: 'App',
  components: {
    watermark
  },
  computed: {
    ...mapState({
      token: state => state.user.token,
      userInfo: state => state.user.userInfo
    }),
    themeColour() {
      const themeColour = this.$store.state.settings.themeColour
      this.body_class(themeColour, 'theme_colour_app', 'theme_colour')
      return themeColour
    },
    controlTheme() {
      const controlTheme = this.$store.state.settings.controlTheme
      this.body_class(controlTheme, 'control_fillet', 'control_straight')
      return controlTheme
    },
    watermarkConfig() {
      // 检查token和userInfo是否都存在
      if (!this.token || !this.userInfo || !this.userInfo.username) {
        return null
      }
      
      // 优先使用store中的userInfo，如果没有则尝试从sessionStorage获取
      let userInfoData = this.userInfo
      if (!userInfoData.username && sessionStorage.getItem('user_info')) {
        userInfoData = getUserInfo()
      }
      
      if (!userInfoData || !userInfoData.username) {
        return null
      }
      
      const username = userInfoData.nickName || userInfoData.username || '用户'
      const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

      return {
        text: username + ' \n\n ' + currentTime,
        opacity: 0.11,                 
         font: '16px Microsoft Yahei',   // 字体和大小
         tileWidth: 400,                // 水印宽度
         tileHeight: 200,               // 水印高度
         tileWidthNumber: 50,
         tileHeightNumber: 50,
      }
    }
  },
  watch: {
    // 监听用户信息变化，确保水印及时更新
    userInfo: {
      handler(newVal, oldVal) {
        // 当用户信息发生变化时，强制重新计算水印配置
        if (newVal && newVal.username && (!oldVal || !oldVal.username)) {
          this.$forceUpdate()
        }
      },
      deep: true,
      immediate: true
    }
  },
  metaInfo() {
    return {
      title: this.$store.state.settings.dynamicTitle && this.$store.state.settings.title,
      titleTemplate: title => {
        return title ? `${title} - ${process.env.VUE_APP_TITLE}` : process.env.VUE_APP_TITLE
      }
    }
  },
  methods: {
    body_class(value, class1, class2) {
      const body = document.body
      const body_classname = body.className
      if (value == '1') {
        body.classList.add(class1)
        body_classname.indexOf(class2) != -1 && body.classList.remove(class2)
      } else {
        body.classList.add(class2)
        body_classname.indexOf(class1) != -1 && body.classList.remove(class1)
      }
    }
  }
}
</script>

<style>
.watermark-layer {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 100 !important;
  pointer-events: none !important;
}
</style>