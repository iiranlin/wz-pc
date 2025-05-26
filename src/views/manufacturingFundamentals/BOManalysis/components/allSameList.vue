<template>
  <el-table ref="elTable" :data="tableData" border @selection-change="handleSelect" class="container_flex_form_table" height="300px">
    <el-table-column align="center" key="selectable" type="selection" width="50" />
    <el-table-column align="left" label="序号" type="index" show-overflow-tooltip width="50"></el-table-column>
    <el-table-column align="left" label="子件编码" prop="matlCode" show-overflow-tooltip width="150">
      <template slot-scope="{row}">
        <el-link type="primary" target="_blank" @click="linkClick('matlCode', row.matlCode)">{{ row.matlCode }}</el-link>
      </template>
    </el-table-column>
    <el-table-column align="left" label="子件名称" prop="matlName" show-overflow-tooltip width="150"></el-table-column>
    <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip width="150"></el-table-column>
    <el-table-column align="left" label="计量单位" prop="matlUnit" show-overflow-tooltip width="150">
      <template slot-scope="{row}">
        {{ row.matlUnit | orderTypeFilter(dict.MeasureUnit) }}
      </template>
    </el-table-column>
    <el-table-column align="left" label="计划属性" prop="planAttribute" show-overflow-tooltip width="150">
      <template slot-scope="{row}">
        <span>{{ row.planAttribute | orderTypeFilter(dict.planAttribute) }}</span>
      </template>
    </el-table-column>
    <el-table-column align="left" label="子件用量" prop="childNum" show-overflow-tooltip width="150"></el-table-column>
    <el-table-column align="left" label="母件底数" prop="baseNum" show-overflow-tooltip width="150"></el-table-column>
    <el-table-column align="left" label="单位用量" prop="unitNum" show-overflow-tooltip width="150">
      <template slot="header">
        <span>单位用量</span>
        <tooltip content="=子件用量/母件底数；即生产一个母件需用的子件数量。" />
      </template>
    </el-table-column>
    <el-table-column align="left" label="替代方式" prop="replaceMethod" show-overflow-tooltip width="150">
      <template slot="header">
        <span>替代方式</span>
        <tooltip content="  替代方式有三种：<br/>
              1.全部替代：比如子件需求量100，有三个替代件分别是，A-替代次序1-库存50、B-替代次序2-库存60、C-替代次序3-库存80；替代比1:1；ABC三种替代件都不能全部满足替代量，则都不使用。<br/>
              2.部分替代：比如子件需求量100，有三个替代件分别是，A-替代次序1-库存50、B-替代次序2-库存60、C-替代次序3-库存80；替代比1:1；则按替代次序依次消耗替代料，即消耗A的50+B的50。<br/>
              3.全部+ 部分替代：比如子件需求量100，有三个替代件分别是，A-替代次序1-库存50、B-替代次序2-库存60、C-替代次序3-库存120；替代比1:1；则优先消耗库存满足的C，如果都不满足，再执行部分替代的逻辑。
            " />
      </template>
      <template slot-scope="scope">
        <span>{{ scope.row.replaceMethod | orderTypeFilter(dict.replaceMethod) }}</span>
      </template>
    </el-table-column>
    <el-table-column align="left" label="损耗率" prop="baseNum" show-overflow-tooltip width="150"></el-table-column>
    <el-table-column align="left" label="发料方式" prop="issueType" show-overflow-tooltip width="150">
      <template slot-scope="scope">
        <span>{{ scope.row.issueType | orderTypeFilter(dict.hmMode) }}</span>
      </template>
    </el-table-column>
    <el-table-column align="left" label="是否主料" prop="isMainMatl" show-overflow-tooltip width="150">
      <template slot="header">
        <span>是否主料</span>
        <tooltip content="业务含义是，比如子件需求100，使用了替代料50，还差50采购，那到底是采购子件还是采购替代件，如果子件是主料，物料需求计划新增时， 会产生子件的采购计划单；如果替代件是主料，会产生替代件的采购计划单；即其作用是当需求不能满足时，是采买标准件，还是采买替代件。"  />
      </template>
      <template slot-scope="scope">
        <span>{{ scope.row.isMainMatl | orderTypeFilter(dict.YesNo) }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import indexMixin from '@/views/mixins'
export default {
  components: {
        tooltip: () => import('@/components/tooltip')
    },
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
      selectionData: []
    }
  },
  methods: {
    linkClick (name, id) {
      if (name === 'matlCode') {
        this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: id, name: 'BOManalysisOperate' } })
        return
      }
    },
    handleSelect(data) {
      this.selectionData = data
      this.$emit('handleSelect')
    },
  }
};
</script>
<style lang="scss" scoped>
.container_flex_form_table{
  margin: 0px;
}
</style>