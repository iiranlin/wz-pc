<template>
    <Dialog title="图片预览" :visible.sync="openDataScope" :before-close="handleClose" :close-on-click-modal="false" append-to-body>
        <el-image 
            :src="srcImg" 
            :preview-src-list="[srcImg]">
        </el-image>
        <div slot="footer">
            <el-button plain round @click="handleClose">关 闭</el-button>
        </div>
    </Dialog>
</template>

<script>
export default {
    props: {
        srcImg: {
            type: String,
            default: ''
        },
        openDataScope: {
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            
        }
    },
    methods: {
        handleClose () {
            this.$emit('update:openDataScope', false)
        }
    }
};
</script>