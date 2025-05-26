<template>
  <div v-loading="fullscreenLoading">
    <i-frame :src="url" />
  </div>
</template>
<script>
import { getSnapTicket } from "@/api/login";
import iFrame from "@/components/iFrame/index";
export default {
  name: "Druid",
  components: { iFrame },
  data() {
    return {
      url: "",
      fullscreenLoading: false,
    };
  },
  async created() {
    let { componentUrl } = this.$route.meta
    if (componentUrl !== 'iframe') {
      await this.getUrl(componentUrl)
    }
    this.fullscreenLoading = true;
    setTimeout(() => {
      this.fullscreenLoading = false;
    }, 3000);
  },
  methods: {
    getUrl(componentUrl) {
      try {
        return new Promise((resolve) => {
          if (!componentUrl) resolve(true)
          getSnapTicket()
            .then((res) => {
              if (res.success) {
                let Url = new URL(componentUrl)
                let connector = Url.search ? "&" : "?"
                this.url = `${componentUrl}${connector}snapTicket=${res.data.snapTicket}`
              } else {
                this.url = `${componentUrl}`
              }
              resolve(true)
            })
            .catch((err) => {
              console.log(err)
            })
        })
      } catch (err) {
        console.log(err)
      }
    },
  }
};
</script>

<style lang="scss" scoped>
::v-deep .el-loading-mask {
  background-color: rgba(255, 255, 255);
}
</style>
  