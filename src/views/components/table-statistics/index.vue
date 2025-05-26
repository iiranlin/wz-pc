<template>
    <el-collapse v-model="activeNames" accordion class="custom-collapse" @change="handleChange">
        <el-collapse-item name="st">
            <template slot="title">
                <div class="collapse-title">
                    <div :class="['collapse-title-icon', collapse ? 'collapse-rate' : '']">
                        <img src="@/assets/images/collapse.png" />
                    </div>
                    统计
                </div>
            </template>
            <el-row class="table-footer-stat">
                <el-col class="table-footer-stat-col" :span="24 / statistics.length" :key="index"
                    v-for="(stat, index) in statistics">
                    <div class="table-statistics">
                        <div class="table-statistics-item" :style="{ height: `${(100 / stat.length)}%` }"
                            :key="item.key" v-for="item in stat">
                            <div class="label" v-html="item.label"></div>
                            <div class="value">：{{ item.label.indexOf('元') != -1 ? formatAmount(item.value) : item.value}}</div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </el-collapse-item>
    </el-collapse>


</template>
<script>
import {formatAmount} from '@/utils'
export default {
    name: 'tableStatistics',
    props: {
        statistics: {
            type: Array,
            default: () => {
                return []
            }
        },
    },
    data() {
        return {
            collapse: false,
            activeNames:['st']
        }
    },
    methods: {
        formatAmount: formatAmount,
        handleChange(a) {
            this.collapse = !this.collapse
        }
    }
}
</script>
<style>
.custom-collapse .el-collapse-item__arrow {
    display: none !important;
}
</style>
<style scoped lang="scss">
.collapse-title {
    padding-left: 15px;
    display: flex;
    flex-direction: row;
    align-items: center;
    line-height: 48px;
    .collapse-title-icon {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        margin-right: 5px;            

        img {
            width: 20px;
            height: 20px;
        }
    }
    .collapse-rate {
        transform: rotate(-180deg);
    }
}

.table-footer-stat {
    background-color: #f2f2f2;
    margin: 0px auto;
    width: calc(100% - 24px);
    display: flex;
}

.table-footer-stat-col {
    display: flex;
    align-items: center;
    position: relative;
    flex: 1;
}

.table-footer-stat-col::before {
    content: '';
    display: inline-block;
    width: 1px;
    height: 70%;
    background-color: #d7d7d7;
    position: absolute;
    right: 0;
    top: 15%;
}

.table-footer-stat-col:last-child::before {
    display: none;
}

.table-statistics {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    padding: 20px 0;
    width: 100%;
    box-sizing: border-box;
    flex: 1;

    .table-statistics-item {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        margin: 5px;
        width: 100%;

        .label {
            font-size: 14px;
            text-align: right;
            width: 70%;
        }

        .value {
            margin-left: 10px;
            width: 30%;
            font-weight: 600;
            color: #1010fe;
        }
    }
}
</style>
