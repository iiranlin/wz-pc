<template>
  <Dialog class="flex-dialog max-height-dialog dialog-padding" v-if="visible" title="选择数据" :visible="true"
    :close-on-click-modal="false" :close-on-press-escape="false" width="1300px" destroy-on-close append-to-body>
    <ul v-if="inSource == '1'" class="radio_type">
      <li :class="{'radioTypeLi': radioType == '1'}" @click="radioTypeClick('1')">按主单选择数据</li>
      <li :class="{'radioTypeLi': radioType == '2'}" @click="radioTypeClick('2')">按主单+明细选择数据</li>
    </ul>
    <select-header ref="formDataSearchRef" :showSearch="true" :showPanel="false" :searchArr="searchButton || []"
      :formData="formData" @handleQuery="handleQuery">
      <template v-slot:unitName="{ data }">
        <el-form-item class="custom-form-item" :label="data.fieldName" :prop="data.fieldCode">
          <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData" :fieldData="data" z-index="99999" />
        </el-form-item>
      </template>
    </select-header>
    <in-table ref="inTable1" v-show="inSource == '1' && radioType == '1'" :inSource="inSource" :total="total1" :tableData="tableData1" :selected="selected" :radioType="'1'" @dbClick="dbClick" @pagination="getList"></in-table>
    <in-table ref="inTable2" v-show="inSource != '1' || radioType == '2'" :inSource="inSource" :total="total2" :tableData="tableData2" :selected="selected" :radioType="'2'" @dbClick="dbClick" @pagination="getList"></in-table>
    <template #footer>
      <el-button class="confirm" @click="saveSelection">确定</el-button>
      <el-button class="cancel" @click.native="visible = false">取消</el-button>
    </template>
  </Dialog>
</template>

<script>

import indexMixin from '@/views/mixins'
import selectHeader from '@/components/selectHeader/index'
import { inQuoteList } from '@/api/prodmgr-pu/arrived'
import { inQuoteListInventory } from '@/api/warehouseManage/transferOrder'
import { returnInQuoteList } from '@/api/warehouseManage/returnManage'
import { saInQuoteList } from '@/api/prodmgr-sa/return'
import {getInlist} from '@/api/projectManagement/productionReport'
import {rejectedRawIn} from '@/api/projectManagement/productionRejected'
import {getOrderInList} from '@/api/projectManagement/productionOrder'
import { orderInQuoteList } from '@/api/prodmgr-pu/order'
import { detailInQuoteDt } from '@/api/prodmgr-pu/arrived'
import FormUnitId from '@/views/components/form-unitId'
import inTable from './inTable'
const apiCallMap = {
  // 采购订单
  '1': inQuoteList,
  // 销售退货
  '2': saInQuoteList,
  // 调拨单
  '3': inQuoteListInventory,
  // 归还
  '4': returnInQuoteList,
  // TODO 需要接口
  // 完工报告
  '5': getInlist,
  // 生产订单
  '6': getOrderInList,
  // 生产退料
  '7': rejectedRawIn
}

export default {
  name: 'selectQuote',
  dicts: ['MeasureUnit'],
  mixins: [indexMixin],
  components: { selectHeader, FormUnitId, inTable },
  props: {
    propsFormData: {
      type: Object,
      default: null
    },
    singleMode: {
      type: Boolean,
      required: false,
      default: false
    },
  },
  data() {
    return {
      visible: false,
      searchButton: [
        { "fieldCode": "sourceCode", "fieldName": "来源单号" },
        { "fieldCode": "matlCode", "fieldName": "物料编码" },
        { "fieldCode": "matlName", "fieldName": "物料名称" },
        { "fieldCode": "unitName", "fieldName": "所属组织", "formSlot": 1 },
        { "fieldCode": "projectCode", "fieldName": "项目编码" },
        { "fieldCode": "projectName", "fieldName": "项目名称" },
        { "fieldCode": "qiCode", "fieldName": "质检单号" }
      ],
      formData: {},
      loading: false,
      tableData1: [],
      total1: 0,
      tableData2: [],
      total2: 0,
      inSource: '',
      selected: [],
      radioType: '1',
    }
  },
  methods: {
    open(arr = [], inSource) {
      this.selected = arr
      this.inSource = inSource
      this.visible = true
      this.radioType = '1'
      if(inSource == '1'){
        this.radioTypeFun()
      }else{
        this.radioType = '2'
      }
      this.$nextTick(() => {
        this.tableData1 = []
        this.tableData2 = []
        this.listQuery.pageNum = 1
        this.listQuery.pageSize = 30
        this.getList()
      })
    },
    handleQuery(row = {}, type) {
      this.formData = Object.assign({}, this.formData, row)
      this.listQuery.pageNum = 1
      this.getList()
    },
    async dbClick(row) {
      let res = null
      if(this.radioType == '1'){
        res = await detailInQuoteDt({purOrderIds: [row.id]})
      }
      const selectRowList = this.radioType == '1'?res?res.data.map((item) => {return {...item, quoteDt: true}}):[]:[row]
      const unitArr = [...this.selected, ...selectRowList]
      const isUnit = unitArr.every(item => item.unitId == unitArr[0].unitId)
      if(!isUnit){
        this.$message.warning('只能选相同所属组织的数据')
        return
      }
      this.$emit('selections', selectRowList)
      this.visible = false
    },
    // 保存选择
    async saveSelection() {
      let res = null
      const inTable1 = this.$refs.inTable1.selectRowList
      const inTable2 = this.$refs.inTable2.selectRowList
      if(inTable1.length){
        const purCodeArr = inTable1.map( ({purCode}) => purCode)
        let isArr = false
        inTable2.forEach(item => {
          if(purCodeArr.includes(item.sourceCode)){
            isArr = true
          }
        });
        if(isArr){
          this.$message.warning('同一个主单不能在两个页签同时选择')
          return
        }
        const purOrderIds = inTable1.map( ({id}) => id)
        res = await detailInQuoteDt({purOrderIds})
      }
      const selectRowList = [...res?res.data.map((item) => {return {...item, quoteDt: true}}):[], ...inTable2]
      if (selectRowList.length === 0) {
        this.$message.warning('请选择明细数据')
        return
      }
      const unitArr = [...this.selected, ...selectRowList]
      const isUnit = unitArr.every(item => item.unitId == unitArr[0].unitId)
      if(!isUnit){
        this.$message.warning('只能选相同所属组织的数据')
        return
      }
      this.$emit('selections', selectRowList)
      this.visible = false
    },
    getList() {
      this.$nextTick(() => {
        if(this.inSource == '1' && this.radioType == '1'){
          this.orderInQuoteList()
        }
        if (apiCallMap[this.inSource]) {
          const func = apiCallMap[this.inSource];
          this.handleApiResponse(func)
        }
      })
    },
    orderInQuoteList () {
      this.loading = true
      orderInQuoteList(Object.assign({}, this.formData, this.$refs.inTable1.listQuery, this.propsFormData)).then(({ data }) => {
        this.tableData1 = data?.list || []
        this.total1 = data?.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    handleApiResponse(func) {
      this.loading = true
      func(Object.assign({}, this.formData, this.$refs.inTable2.listQuery, this.propsFormData)).then(({ data }) => {
        this.tableData2 = data?.list || []
        this.total2 = data?.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    radioTypeClick (val) {
      this.radioType = val
      this.radioTypeFun()
    },
    radioTypeFun () {
      if(this.radioType == '1'){
        this.searchButton = [
          { "fieldCode": "purCode", "fieldName": "来源单号" },
          { "fieldCode": "unitName", "fieldName": "所属组织", "formSlot": 1 },
          { "fieldCode": "purUserName", "fieldName": "采购负责人" },
          { "fieldCode": "receiptDate", "fieldName": "单据日期" },
          { "fieldCode": "projectCode", "fieldName": "项目编码" },
          { "fieldCode": "projectName", "fieldName": "项目名称" },
          { "fieldCode": "ctCode", "fieldName": "合同编码" },
          { "fieldCode": "ctName", "fieldName": "合同名称" },
        ]
      }else{
        this.searchButton = [
          { "fieldCode": "sourceCode", "fieldName": "来源单号" },
          { "fieldCode": "matlCode", "fieldName": "物料编码" },
          { "fieldCode": "matlName", "fieldName": "物料名称" },
          { "fieldCode": "unitName", "fieldName": "所属组织", "formSlot": 1 },
          { "fieldCode": "projectCode", "fieldName": "项目编码" },
          { "fieldCode": "projectName", "fieldName": "项目名称" },
          { "fieldCode": "qiCode", "fieldName": "质检单号" }
        ]
      }
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep .form-content-box-defaultSearch{
  max-height: none;
}
.search,
.reset,
.toggleClose {
  border: 1px solid #1890ff;
}

::v-deep .el-form-item__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.flex-dialog {

  .el-dialog {
    display: flex;
    flex-direction: column;
  }

  .el-dialog__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.max-height-dialog {
  .el-dialog {
    height: 80%;
    min-height: 500px;
  }
}

.confirm {
  height: 34px;
  border-radius: 50px;
  background: #227aff;
  color: #ffffff;
  min-width: 100px;
  padding: 0;
}

.cancel {
  height: 34px;
  border-radius: 50px;
  min-width: 100px;
  margin-left: 10px;
  padding: 0;
}

.link {
  cursor: pointer;
  color: #1890ff;
}

.radio_type{
  margin: 0;
  padding: 0;
  list-style: none;
  li{
    margin: 0;
    padding: 0;
    list-style: none;
    float: left;
    margin-left: 20px;
    padding: 10px 0px;
    border-bottom: 1px solid #ccc;
    cursor: pointer;
  }
  .radioTypeLi{
    color: #1890ff;
    border-bottom: 1px solid #1890ff;
  }
}
</style>
