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
      token: state => state.user.token
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

      if (!this.token) {
        return null
      }

      const userInfo = getUserInfo()
      const username = userInfo.nickName || userInfo.username || '用户'
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