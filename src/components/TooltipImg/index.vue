<template>
    <el-popover
    :trigger="trigger"
    :placement="placement"
    >
    <el-image
    :style="{width: width}"
      :src="tooltipMap[tooltipType]"
      fit="contain"></el-image>
    <div class="tooltipClass" slot="reference">
        <slot></slot>
    </div>
  </el-popover>
</template>

<script>
import planNumImg from '@/assets/file/jhsl.png' 
export default {
    props: {
        placement: {
            type: String,
            default: 'top'
        },
        tooltipType: {
            type: String,
            default: ''
        },
        trigger: {
            type: String,
            default: 'hover'
        },
        width: {
            type: String,
            default: '500px'
        },
    },
    name: 'TooltipImg',
    data() {
        return {
            tooltipMap: {
                planNum: planNumImg
            }
            
        }
    }
}
</script>
<style lang="scss">
.tooltipClass {
    display: inline-block;
    cursor: pointer;

}
</style>