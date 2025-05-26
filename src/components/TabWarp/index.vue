<template>
    <div class="app-container container_flex table-tab-warp" :key="activeName">
        <div v-if="activeName == tabs[0]" :class="['app-container container_flex table-tab-warp-item', activeName == tabs[0] ? 'table-tab-warp-show' : 'table-tab-warp-hide']"
            ref="masterSlot">
            <slot name="master" refName="branch" :type="tabs[0]" :change="handleTabChange"></slot>
        </div>
        <div v-if="activeName == tabs[1]" :class="['app-container container_flex table-tab-warp-item', activeName == tabs[1] ? 'table-tab-warp-show' : 'table-tab-warp-hide']"
            ref="branchSlot">
            <slot name="branch" refName="master" :type="tabs[1]" :change="handleTabChange"></slot>
        </div>
        <div v-if="tabs[2] && activeName == tabs[2]" :class="['app-container container_flex table-tab-warp-item', activeName == tabs[2] ? 'table-tab-warp-show' : 'table-tab-warp-hide']"
            ref="branchSlot0">
            <slot name="branch0" refName="master" :type="tabs[2]" :change="handleTabChange"></slot>
        </div>
        <div v-if="tabs[3] && activeName == tabs[3]" :class="['app-container container_flex table-tab-warp-item', activeName == tabs[3] ? 'table-tab-warp-show' : 'table-tab-warp-hide']"
            ref="branchSlot1">
            <slot name="branch1" refName="master" :type="tabs[3]" :change="handleTabChange"></slot>
        </div>
        <div v-if="tabs[4] && activeName == tabs[4]" :class="['app-container container_flex table-tab-warp-item', activeName == tabs[4] ? 'table-tab-warp-show' : 'table-tab-warp-hide']"
            ref="branchSlot2">
            <slot name="branch2" refName="master" :type="tabs[4]" :change="handleTabChange"></slot>
        </div>
    </div>

</template>
<script>

export default {
    name: "tabWarp",
    props: {
        tabs: {
            type: Array,
            default: ['1', '2']
        },
        value: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            activeName: this.value || this.tabs[0]
        }
    },
    methods: {
        handleTabChange(v) {
            this.activeName = v
        },
    }
}
</script>
<style lang="scss">
.table-tab-warp {
    width: 100%;
    .table-tab-warp-item {
        position: absolute;
        width: 100%;
    }
    .table-tab-warp-show {
        z-index: 1;
        background-color: #fff;
        .pagination-container {
            z-index: 1;
        }
    }

    .table-tab-warp-hide {
        z-index: -1;
        background-color: transparent;
        .pagination-container {
            z-index: -1;
        }
    }
}
</style>
