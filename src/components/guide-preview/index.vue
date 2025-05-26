<template>
    <div class="guidePreview">
        <el-image ref="guidePreview" :src="guideImg" :preview-src-list="[guideImg]"></el-image>
    </div>
</template>

<script>
import GUIDE_03 from '@/assets/images/damage.png'
import GUIDE_02 from '@/assets/images/return.png'
import GUIDE_01 from '@/assets/images/guide.png'
export default {
    data() {
        return {
            guideImg: '' 
        }
    },
    methods: {
        clickHandler(type) {
            this.guideImg = {
                GUIDE_01: GUIDE_01,
                GUIDE_02: GUIDE_02,
                GUIDE_03: GUIDE_03
            }[type]
            this.$nextTick(() => {
                this.$refs.guidePreview.clickHandler()
            })
           
        }
    }
}
</script>

<style scoped lang="scss">
.guidePreview {
    position: fixed;
    z-index: -1;
    background-color: #fff;
    top: -1900px;
}
</style>