<template>
    <div :class="{ 'collapse_show  collapse': isCollapse, 'collapse_hidden collapse': !isCollapse }">
        <slot></slot>
        <div class="toggle_btn" >
            <div class="show_info" v-if="isCollapse" @click="handleToggle">
                <i class="el-icon-caret-left"></i>
            </div>
            <div class="hidden_info" v-else @click="handleToggle">
                <i class="el-icon-caret-right"></i>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Collapse",
    props: {
        collapse: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            isCollapse: this.collapse && true
        }
    },
    methods: {
        handleToggle() {
            this.isCollapse = !this.isCollapse
        }
    }
};
</script>
<style lang="scss" scoped>
.collapse {
    position: relative;
    overflow: hidden;
    .toggle_btn {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 100;
        width: 20px;
        font-size: 14px;
        text-align: center;
       
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .show_info {
            writing-mode:sideways-rl;
            width: 20px;
            height: 40px;
            background-color: #C0C4CC;
            color: #fff;
            font-size: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border-radius: 8px 0 0 8px;
            cursor: pointer;
        }

        .hidden_info {
            writing-mode:sideways-rl;
            width: 20px;
            height: 40px;
            background-color: #C0C4CC;
            color: #fff;
            font-size: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border-radius: 0 5px 5px 0;
            cursor: pointer;
        }
    }

}
.el-icon-caret-left {
    transform: rotate(-90deg);
}
.el-icon-caret-right {
    transform: rotate(-90deg);
}
.collapse_show {
    display: block;
    width: 240px;
    .toggle_btn {
        left: calc(100% - 20px);
    }
}

.collapse_hidden {
    width: 20px;
    .container_flex_overflow {
        display: none;
    }
    .toggle_btn {
        left: 0;
    }
}

</style>