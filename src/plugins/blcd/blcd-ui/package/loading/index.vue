<template>
    <div :id="id" class="lottie"></div>
</template>
<script>
import lottie from 'lottie-web'
import * as lottieLoad from './lottie.json'
let animation = null
export default {
    name: "Loading",
    props: {
        id: {
            type: String,
            default: 'lottie'
        }
    },
    created(){

        this.$nextTick(()=>{
           animation = lottie.loadAnimation({
                container: document.getElementById(this.id),//当前需要渲染的DOM
                renderer: "svg",//渲染方式，默认为svg,还可以渲染为html和canvas
                loop: true,//循环播放
                autoplay: true,//自动播放
                animationData: lottieLoad.default,//本地动画
            })
        })
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