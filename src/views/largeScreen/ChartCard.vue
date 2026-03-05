<!-- src/components/ChartCard.vue -->
<template>
    <div class="chart-card">
        <!-- 四角装饰图标（可选） -->
        <div class="corner top-left"></div>
        <div class="corner top-right"></div>
        <div class="corner bottom-left"></div>
        <div class="corner bottom-right"></div>

        <!-- 标题（可选） -->
        <h3 v-if="title" class="chart-title">{{ title }}</h3>

        <!-- 默认插槽：放 EChartsWrapper 或其他内容 -->
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: 'ChartCard',
    props: {
        title: {
            type: String,
            default: ''
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/index.scss";

.chart-card {
    position: relative;
    background-color: rgba(12, 27, 51, 0.6);
    border: vw(1) solid #231AA9;
    // border-radius: vw(8);
    padding: vh(16) vw(20);
    color: #fff;
    overflow: hidden;

    .corner {
        position: absolute;
        width: vw(14);
        height: vh(14);
        background-repeat: no-repeat;
        pointer-events: none;
        z-index: 2;
    }

    .top-left {
        top: 0;
        left: 0;
        background-image: url("../../assets/large/top-left.png");
        background-size: 100% 100%;
    }

    .top-right {
        top: 0;
        right: 0;
        background-image: url("../../assets/large/top-right.png");
        background-size: 100% 100%;
    }

    .bottom-left {
        bottom: 0;
        left: 0;
        background-image: url("../../assets/large/top-right.png");
        transform: rotate(180deg);
        background-size: 100% 100%;
    }

    .bottom-right {
        bottom: 0;
        right: 0;
        background-image: url("../../assets/large/top-left.png");
        transform: rotate(180deg);
        background-size: 100% 100%;
    }

    .chart-title {
        margin: 0;
        font-size: vw(18);
        font-family: HarmonyOS_Sans_SC-bold;
        color: #75f9fd;
    }

    // 响应式字体
    ::v-deep p,
    ::v-deep span,
    ::v-deep div {
        font-size: vw(16);
    }
}
</style>