<template>
  <el-table ref="elTable" :data="tableData" border class="container_flex_form_table" row-key="id" max-height="300px">
    <el-table-column align="center" label="序号" type="index" show-overflow-tooltip width="50"></el-table-column>
    <el-table-column align="center" label="版本号" prop="bomVersion" show-overflow-tooltip width="150"></el-table-column>
    <el-table-column align="center" label="BOM编码" prop="bomCode" show-overflow-tooltip width="150">
      <template slot-scope="{row}">
        <el-link type="primary" target="_blank" @click="linkClick('bomCode', row.bomId)">{{ row.bomCode }}</el-link>
      </template>
    </el-table-column>
    <el-table-column align="left" label="BOM名称" prop="bomName" show-overflow-tooltip width="150"></el-table-column>
    <el-table-column align="center" label="物料编码" prop="matlCode" show-overflow-tooltip width="150">
      <template slot-scope="{row}">
        <el-link type="primary" target="_blank" @click="linkClick('matlCode', row.matlCode)">{{ row.bomCode }}</el-link>
      </template>
    </el-table-column>
    <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip
      min-width="240"></el-table-column>
    <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip width="150"></el-table-column>
    <el-table-column align="center" label="计量单位" prop="matlUnit" show-overflow-tooltip width="150">
      <template slot-scope="{row}">
        {{ row.matlUnit | orderTypeFilter(dict.MeasureUnit) }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="BOM用途" prop="useBy" show-overflow-tooltip width="150">
      <template slot-scope="{row}">
        <span :class="'useBy-' + row.useBy">{{ row.useBy | orderTypeFilter(dict.bomPurpose) }}</span>
      </template>
    </el-table-column>
    <el-table-column align="center" label="BOM类型" prop="type" show-overflow-tooltip width="150">
      <template slot-scope="{row}">
        {{ row.type | orderTypeFilter(dict.bomType) }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="替代标识" prop="replaceFlag" show-overflow-tooltip width="150">
      <template slot-scope="{row}">
        {{ row.replaceFlag | orderTypeFilter(dict.replaceIdentification) }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="审核状态" prop="status" show-overflow-tooltip width="150">
      <template slot-scope="{row}">
        <icon-svg class="icon-size" :icon-class="iconClass(row.status)" />{{ row.status | orderTypeFilter(dict.flowStatus) }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import indexMixin from '@/views/mixins'
export default {
  props: {
    dict: {
      type: Object,
      default: null
    },
    tableData: {
      type: Array,
      default: []
    }
  },
  mixins: [indexMixin],
  data() {
    return {
    }
  },
  methods: {
    linkClick (name, id) {
      if (name == 'bomCode') {
        this.$router.push({ name: 'BOMAdministrationOperate', query: { type: 'view', id, name: 'BOManalysisOperate' } });
        return
      }
      if (name === 'matlCode') {
        this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: id, name: 'BOManalysisOperate' } });
        return
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.container_flex_form_table{
  margin: 0px;
}
</style>