<template>
    <div :id="id" class="lottie"></div>
</template>
<script>
import lottie from 'lottie-web'
import * as lottieLoad from '@/assets/lottie.json'
export default {
    name: "Loading",
    props: {
        id: {
            type: String,
            default: 'lottie'
        }
    },
    mounted() {
        this.animation = lottie.loadAnimation({
            container: this.$el,
            renderer: "svg",
            loop: true,
            autoplay: true,
            animationData: lottieLoad.default,
        })
    },
    beforeDestroy() {
        if (this.animation) {
            this.animation.destroy()
        }
    }
}
</script>
<style lang="scss" scoped>
.lottie {
    width: 100px;
    height: 100px;
    position: absolute;
    left: 50%;
    top: 40%;
    transform: translate(-50%,-40%);
    z-index: 999;
}
</style>