<template>
    <el-tooltip effect="light" class="slotIcon-color" :content="value" placement="top">
        <div slot="content" class="slotIcon-color-content" v-html="value"></div>
        <span class="default-svg-icon">
            <i class="el-icon-question"></i>
        </span>
    </el-tooltip>
</template>

<script>
export default {
    name: "prompt-header",
    props: {
        value: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
        };
    },
    methods: {
    }
};
</script>
<style lang="scss" scoped>
.svg-icon {
    width: 20px;
    height: 20px;
}

.default-svg-icon {
    color: #ffffff;
}
</style>