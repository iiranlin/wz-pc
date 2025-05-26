<template>
  <el-form ref="elForm" :model="tableData" :rules="tableData.rules">
    <el-table :key="key" ref="tableRef" @selection-change="(data) => selectData = data" :data="tableData.detailsList"
      border class="saleOrderOperateEltable" max-height="300px" style="width: 100%">
      <!-- <el-table-column fixed="left" align="center" key="selectable" type="selection" width="50"
        v-if="queryType == 'create' || queryType == 'update'" /> -->
      <el-table-column align="center" label="所属组织" prop="unitName" show-overflow-tooltip width="150"></el-table-column>
      <el-table-column align="center" label="入库单号" prop="inCode" show-overflow-tooltip width="150"></el-table-column>
      <el-table-column align="center" label="物料编码" prop="matlCode" show-overflow-tooltip width="150"></el-table-column>
      <el-table-column align="center" label="物料名称" prop="matlName" show-overflow-tooltip min-width="150"></el-table-column>
      <el-table-column align="center" label="规格型号" prop="matlType" show-overflow-tooltip min-width="150"></el-table-column>
      <el-table-column align="center" label="计量单位" prop="matlUnit" show-overflow-tooltip width="150">
        <template slot-scope="{row}">
          {{ row.matlUnit | orderTypeFilter(dict.MeasureUnit) }}
        </template>
      </el-table-column>
      <el-table-column align="right" label="入库数量" prop="inNum" show-overflow-tooltip min-width="150"></el-table-column>
      <el-table-column align="right" label="入库金额（含税，单位：元）" prop="inAmount" show-overflow-tooltip width="220">
        <template slot-scope="scope">
          <el-form-item :prop="'detailsList.' + scope.$index + '.inAmount'" :rules="tableData.rules.inAmount">
            <el-input-number v-if="queryType == 'create' || queryType == 'update'" v-number-input:true.float="2" v-model="scope.row.inAmount" controls-position="right"></el-input-number>
            <span v-else>{{ scope.row.inAmount }}</span>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column align="center" label="入库来源" prop="inSource" show-overflow-tooltip min-width="150">
        <template slot-scope="{row}">
          {{ row.inSource | orderTypeFilter(dict.inMaintenance) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="来源单号" prop="inSourceCode" show-overflow-tooltip min-width="150"></el-table-column>
      <el-table-column align="center" label="来源行号" prop="inSourceRowNum" show-overflow-tooltip min-width="150"></el-table-column>
      <el-table-column align="center" label="项目编码" prop="projectCode" show-overflow-tooltip min-width="150"></el-table-column>
      <el-table-column align="left" label="项目名称" prop="projectName" show-overflow-tooltip min-width="150"></el-table-column>
      <el-table-column align="center" label="供应商编码" prop="suCode" show-overflow-tooltip min-width="150"></el-table-column>
      <el-table-column align="left" label="供应商名称" prop="suName" show-overflow-tooltip min-width="150"></el-table-column>
      <el-table-column align="center" label="操作" fixed="right" width="100" v-if="queryType == 'create' || queryType == 'update'">
        <template slot-scope="scope">
          <el-button type="text" @click="removeData(scope.row, scope.$index)">删行</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-form>
</template>

<script>
import indexMixin from './mixins';
export default {
  props: {
    dict: {
      type: Object,
      default: null
    },
    queryType: {
      type: String,
      default: ''
    }
  },
  mixins: [indexMixin],
  data() {
    return {
      key: `${Date.now()}`,
      tableData: {
        detailsList: [],
        rules: {
          // inAmount: [{ required: true, message: '请输入入库金额', trigger: ['blur', 'change'] }],
        }
      },
      selectData: []
    }
  },
  methods: {
    init(data) {
      this.tableData.detailsList = this.tableData.detailsList.concat(data)
    },
    removeData(row, i) {
      if (row) {
        this.tableData.detailsList.splice(i, 1)
      } else {
        if (this.selectData.length > 0) {
          this.$modal.confirm('您确定要删除吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            let newData = this.tableData.detailsList.filter((a) => !this.selectData.some((b) => a.inDetailId === b.inDetailId))
            this.tableData.detailsList = newData;
          })
        } else {
          this.$modal.msgError('请选择数据')
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.slotIcon-color {
  color: #1890ff;
}
</style>
