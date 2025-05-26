<template>
    <el-dialog v-bind="$attrs" v-on="$listeners" :show-close="false" v-dialogFullScreen ref="elDialog">
        <div slot="title" class="el-dialog__title t-dialog" v-if="'title' in $slots" ref="fullRef">
            <slot name="title">
            </slot>
            <i class="full-btn el-icon-full-screen"></i>
            <i class="full-btn-close el-icon-close" @click="handleClose"></i>
            
        </div>

        <div slot="title" v-else class="el-dialog__title t-dialog" ref="fullRef">
            <span>{{ $attrs.title }}
            </span>
            <i class="full-btn el-icon-full-screen"></i>
            <i class="full-btn-close el-icon-close" @click="handleClose"></i>
        </div>

        <template v-for="slotName in Object.keys($slots).filter(key => key != 'title')" #[slotName]>
            <slot :name="slotName"></slot>
        </template>
    </el-dialog>
</template>
<script>
export default {
    name: 'dialog',
    methods: {
        handleClose() {
            if('close' in this.$refs.elDialog.$listeners) {
                this.$refs.elDialog.$listeners.close()
            }else {
                this.$refs.elDialog.$emit('update:visible', false)
            }
        },
        fullChange() {
            if('full' in this.$refs.elDialog.$listeners) {
                this.$refs.elDialog.$listeners.full()
            }
        }
    },
}
</script>
<style lang="scss">
.flex-dialog .el-dialog__headerbtn {
    top: 28px !important;

}

.el-dialog__header {
    background-color: #f0f0f0;
    padding-top: 10px;
}

.t-dialog {
    width: calc(100% - 60px);
    position: relative;
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0;
   
    .el-dialog__title {
        padding: 0 0px;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        position: relative;

    }

    .full-btn {
        position: absolute;
        right: -30px;
        top: 5px;
        font-size: 16px;
        padding: 5px;
    }

    .full-btn:hover {
        cursor: pointer;
    }
    .full-btn-close {
        position: absolute;
        right: -60px;
        top: 5px;
        font-size: 16px;
        padding: 5px;
    }
    .full-btn-close:hover {
        cursor: pointer;
    }
}
</style>