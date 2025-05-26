<template>
    <Dialog tabindex='1' class="flex-dialog max-height-dialog dialog-padding" title="选择生产订单" :visible.sync="visible"
        :close-on-click-modal="false" append-to-body width="1300px">
        <div slot="title" class="el-dialog__title">
            选择生产订单
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <ul class="radio_type">
            <li :class="{ 'radioTypeLi': radioType == '1' }" @click="radioTypeClick('1')">按主单选择数据</li>
            <li :class="{ 'radioTypeLi': radioType == '2' }" @click="radioTypeClick('2')">按主单+明细选择数据</li>
        </ul>
        <tbl1 @change="change" ref="tbl1" v-if="radioType == '1'" :propsFormData="propsFormData" :singleMode="true" :unitId="unitId"></tbl1>
        <tbl2  @change="change" ref="tbl2" v-if="radioType == '2'" :propsFormData="propsFormData" :singleMode="singleMode" :unitId="unitId"></tbl2>
        <template #footer>
            <el-button plain round type="primary" @click="saveSelection" v-preventReClick>确定</el-button>
            <el-button plain round @click.native="handleCancel">取消</el-button>
        </template>
    </Dialog>
</template>

<script>
import { pickingQuoteList } from '@/api/projectManagement/productionOrder';

import tbl1 from './tbl1.vue'
import tbl2 from './tbl2.vue'
export default {
    components: {
        tbl1,
        tbl2,
    },
    props: {
        propsFormData: {
            type: Object,
            default: null
        },
        singleMode: {
            type: Boolean,
            required: false,
            default: true
        },
        unitId: {
            type: String,
            default: ''
        },
    },
    data() {
        return {
            radioType: '1',
            visible: false,
        }
    },

    methods: {
        init(orderRawId = null, selected = []) {
            this._orderRawId = orderRawId
            this._selected = selected
            this.visible = true;
            this.radioType = '1'
            this.$nextTick(() => {
              this.$refs[`tbl${this.radioType}`].init(orderRawId, selected)
            })
        },
        radioTypeClick(val) {
            this.radioType = val
            this.$nextTick(() => {
              this.$refs[`tbl${this.radioType}`].init(this._orderRawId, this._selected)
            })
        },
        searchData() {
            this.$refs[`tbl${this.radioType}`].searchData()
        },
        resetSearch() {
            this.$refs[`tbl${this.radioType}`].resetSearch()
        },
       async change(data) {
        this.handleCancel()
            if(this.radioType == '1') {
               const {data: {list}} = await pickingQuoteList({orderRawId: data.orderRawId})
                this.$emit('change', list, true)
            }else {
                this.$emit('change', data)
            }
          
        },
        saveSelection() {
            this.$refs[`tbl${this.radioType}`].saveSelection()

        },
        handleCancel() {
            this.visible = false
        }
    }
}
</script>

<style scoped lang="scss">
.table-wrapper {
    flex: 1;
}

.radio_type {
    margin: 0;
    padding: 0;
    list-style: none;

    li {
        margin: 0;
        padding: 0;
        list-style: none;
        float: left;
        margin-left: 20px;
        padding: 10px 0px;
        border-bottom: 1px solid #ccc;
        cursor: pointer;
    }

    .radioTypeLi {
        color: #1890ff;
        border-bottom: 1px solid #1890ff;
    }
}
</style>
<style lang="scss"></style>