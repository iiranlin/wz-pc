<template>
  <el-form ref="elForm" :model="tableData" :rules="tableData.rules">
    <el-table class="saleOrderOperateEltable table-sortable" v-loading="loading" ref="elTable" :data="tableData.detailsList" border row-key="processCode"
      max-height="300px" style="width: 100%">
      <el-table-column align="left" label="序号" key="index" type="index" width="50" />
      <el-table-column align="left" label="来源单号" prop="outCode" show-overflow-tooltip min-width="220"></el-table-column>
      <el-table-column align="left" label="来源行号" prop="sourceRowNum" show-overflow-tooltip min-width="100"></el-table-column>
      <el-table-column align="left" label="物料编码" prop="matlCode" show-overflow-tooltip min-width="220"></el-table-column>
      <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip min-width="220"></el-table-column>
      <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip min-width="220"></el-table-column>
      <el-table-column align="left" label="计量单位" prop="matlUnit" show-overflow-tooltip min-width="220">
        <template slot-scope="{row}">
          <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="单据原量" prop="originalNum" show-overflow-tooltip min-width="220"></el-table-column>
      <el-table-column align="left" label="已累计生成退货单数量" prop="saReturnNum" show-overflow-tooltip min-width="220"></el-table-column>
      <el-table-column align="left" label="本次退货数量" prop="returnNum" show-overflow-tooltip min-width="180">
        <template slot="header">
          <span><span class="slotIcon-color-content">*</span>本次退货数量</span>
        </template>
        <template slot-scope="scope">
          <el-form-item :prop="'detailsList.' + scope.$index + '.returnNum'" :rules="tableData.rules.returnNum">
            <el-input-number @change="numberChange(scope)" v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.returnNum" :max="queryType == 'update' ?scope.row.maxReturnNum:scope.row.outNum - (scope.row.saReturnNum || 0)"
              :min="1" controls-position="right" style="width: 150px"></el-input-number>
            <span v-else>{{ scope.row.returnNum }}</span>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column align="left" label="入库仓库" prop="warehouseId" show-overflow-tooltip min-width="225">
        <template slot="header">
          <span>入库仓库</span>
        </template>
        <template slot-scope="scope">
          <selectTree v-if="queryType == 'create' || queryType == 'update'" :disable="queryType === 'view'" style="width: 200px;" :index="scope.$index"
            :value="scope.row.warehouseId" :options="dataOptions" :props="optionsProps"
            @getValue="getQuAreaCodeValue" :disabledFun="disabledFun" />
          <span v-else>{{ scope.row.warehouseName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="单价(不含税)" prop="price" show-overflow-tooltip min-width="150">
        <template slot-scope="{row}">
          {{ $textMethod.money(row.price) }}
        </template>
      </el-table-column>
      <el-table-column label="税率" align="left" min-width="150" prop="taxRate">
          <template slot="header">
              <span style="color: red">*</span>
              <span>税率</span>
          </template>
          <template slot-scope="scope">
              <el-form-item :prop="'detailsList.' + scope.$index + '.taxRate'"
                  :rules="[{ required: true, message: '请选择税率', trigger: ['change', 'blur'] }]">
                  <span v-if="queryType == 'view'">{{ scope.row.taxRate | orderTypeFilter(dict.type.taxPre)}}</span>
                  <el-select v-columnFormat="{
                      index: scope.$index,
                      prop: 'taxRate',
                      list: tableData.detailsList
                  }" @change="(newVal, oldVal) => numberChange(scope)"
                      v-else v-model="scope.row.taxRate" clearable>
                      <el-option v-for="(item, key)  in dict.type.taxPre" :key="key"
                          :label="item.label" :value="item.value" />
                  </el-select>
              </el-form-item>
          </template>
      </el-table-column>
      <el-table-column align="left" label="总金额(含税)" prop="taxAmount" show-overflow-tooltip min-width="150">
        <template slot-scope="{row}">
          {{ $textMethod.money(row.taxAmount) }}
        </template>
      </el-table-column>
      <el-table-column align="left" label="总金额(不含税)" prop="unTaxAmount" show-overflow-tooltip min-width="150">
        <template slot-scope="{row}">
          {{ $textMethod.money(row.amount) }}
        </template>
      </el-table-column>
      <el-table-column align="left" label="退货单行号" prop="rowNum" show-overflow-tooltip min-width="150"></el-table-column>
      <el-table-column align="center" label="操作" fixed="right" width="100" v-if="queryType == 'create' || (queryType == 'update' && tableType == '1')">
        <template slot="header">
          操作
          <tooltip content="如果误删可以重新选择单据" />
        </template>
        <template slot-scope="scope">
          <el-button type="text" @click="removeData(scope.row, scope.$index)">删行</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-form>
</template>

<script>
import indexMixin from '@/views/mixins'
import { getWarehouseTree } from '@/api/warehouseManage/inventoryMaintenance'
import selectTree from '@/components/selectTree/index.vue'
export default {
  mixins: [indexMixin],
  dicts: ['MeasureUnit','taxPre'],
  components: { selectTree, tooltip: () => import('@/components/tooltip') },
  props: {
    queryType: {
      type: String,
      default: ''
    },
    tableType: {
      type: String,
      default: '1'
    },
  },
  data() {
    return {
      loading: false,
      tableData: {
        detailsList: [],
        rules: {
          returnNum: [{ required: true, message: '请输入本次退货数量', trigger: ['blur', 'change'] }],
        }
      },
      selectData: [],
      dataOptions: [],
      optionsProps: {
        children: "children",
        label: "name",
        value: "id",
        disabled: (node, data) => {
          return data.level == 1;
        },
      },
    }
  },
  methods: {
    async init(data) {
      const res = await getWarehouseTree()
      this.dataOptions = res.data || [];
      this.tableData.detailsList.push(...data)
      this.$emit('numberChange', this.tableData.detailsList);
    },
    // 明细按钮权限
    handleButtonShow() {
      return true
    },
    // 按钮事件处理器
    async handleNewButton(buttonCode) {
      if (buttonCode === 'addProcess') {
        this.$refs.choiceProcedure.init(null, this.tableData.detailsList);
        return
      }
    },
    removeData(row, i) {
      this.tableData.detailsList.splice(i, 1)
      this.$emit('numberChange', this.tableData.detailsList);
      this.$emit('asyncCodes', this.tableData.detailsList);
    },
    getQuAreaCodeValue(node, index, valueId) {
      this.tableData.detailsList[index].warehouseCode = node.code
      this.tableData.detailsList[index].warehouseId = node.id
      this.tableData.detailsList[index].warehouseName = node.name
    },
    disabledFun(node) {
      return node.level !== 1
    },
    numberChange (scope) {
      const taxRate = Number(scope.row.taxRate || 0);
      const returnNum = Number(scope.row.returnNum || 0);
      const price = Number(scope.row.price || 0);
      scope.row.taxAmount = (returnNum * price * (1 + taxRate / 100)).toFixed(2)
      scope.row.amount = (returnNum * price).toFixed(2);
      this.$emit('numberChange', this.tableData.detailsList);
    }
  }
};
</script>
<style lang="scss" scoped>
.slotIcon-color {
  color: #1890ff;
  font-size: 16px;
  margin-left: 2px;
}

.slotIcon-color-content {
  color: red;
}

.sortHandle {
  cursor: move;
  display: inline-block;
  width: 100%;
}
</style>