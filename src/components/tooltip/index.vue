<template>
   <el-tooltip 
    class="slotIcon-color"
    placement="top"
    effect="light"
    >

        <div slot="content" class="slotIcon-color-content">
            <div v-if="!!imgUrl" style="margin-bottom: 10px;">
                <img style="width: 100%;height: auto;" :src="imgUrl">
            </div>
            <div v-if="!!content" v-html="content"></div>
        </div>
        <i class="el-icon-question"></i>
    </el-tooltip>
</template>

<script>
export default {
    props: {
        content: {
            type: String,
            default: ''
        },
        imgUrl: {
            type: String,
            default: ''
        }
    },
    name: 'Tooltip',
}
</script>
<style lang="scss">

</style>