<template>
    <div ref="chartContainer" :style="{ width: width, height: height }"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
    name: 'EChartsWrapper',
    inject: ["toRouterPage"],
    props: {
        // 图表配置项
        options: {
            type: Object,
            required: true
        },
        // 容器宽度（支持百分比或像素）
        width: {
            type: String,
            default: '100%'
        },
        // 容器高度
        height: {
            type: String,
            default: '400px'
        },
        // 主题
        theme: {
            type: [String, Object],
            default: ''
        },
        // 是否自动调整大小
        autoResize: {
            type: Boolean,
            default: true
        },
        dataSource: {
            type: Array,
            default: () => []
        },
    },
    data() {
        return {
            chart: null
        }
    },
    watch: {
        // 监听 options 变化，更新图表
        options: {
            deep: true,
            handler(newVal) {
                if (this.chart) {
                    this.chart.setOption(newVal, { notMerge: false })
                }
            }
        }
    },
    mounted() {
        this.initChart()
        if (this.autoResize) {
            window.addEventListener('resize', this.handleResize)
        }
    },
    beforeDestroy() {
        if (this.chart) {
            this.chart.dispose()
            this.chart = null
        }
        if (this.autoResize) {
            window.removeEventListener('resize', this.handleResize)
        }
    },
    methods: {
        initChart() {
            if (!this.$refs.chartContainer) return
            // 初始化图表
            this.chart = echarts.init(this.$refs.chartContainer, this.theme)
            this.chart.setOption(this.options)
             // 图表点击事件
            const _this = this
            this.chart.on('click', function (params) {
                console.log("params ==> ", params);
                let _params = {}
                const value = params.value
                const name = params.name
                const dataIndex = params.dataIndex
            
                // 图表名称
                const seriesName = params.seriesName
          
                switch(seriesName){
                    case '物资种类合同核备数':
                        _params = { purchaseTypeName: value }
                        break;
                    case '物资种类合同核备金额(万元)':
                        _params = { purchaseTypeName: value }
                        break;
                    case '物资种类合同核备金额(背景条)':
                        _params = { purchaseTypeName: _this.dataSource[dataIndex] }
                        break;
                    case '自购物资合同核备数':
                        _params = { month: name.slice(-2) }
                        break;
                }
   
                _this.toRouterPage('/nuclear/contract', _params)
            });
        },
        handleResize() {
            if (this.chart) {
                this.chart.resize()
            }
        },
        // 对外暴露获取图表实例的方法（可选）
        getChart() {
            return this.chart
        }
    }
}
</script>