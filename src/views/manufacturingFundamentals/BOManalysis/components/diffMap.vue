<template>
  <el-table ref="elTable" :data="tableData" border class="container_flex_form_table" height="300px" @selection-change="handleSelect"
    :span-method="objectSpanMethod" :header-cell-style="headerCellStyle" :row-style="rowStyle">
    <el-table-column align="center" key="selectable" type="selection" width="50" :selectable="selectable" v-if="isSelection" />
    <el-table-column width="50" align="left" class-name="elChgTbeClmn" >
      <template slot="header">
        <div class="elHeadCon">
          <div class="headerCon1">{{ title }}</div>
          <div class="headerCon2">BOM</div>
          <div class="headerLine"></div>
        </div>
      </template>
      <template slot-scope="scope">
        {{ scope.row.nameIndex }}
      </template>
    </el-table-column>
    <el-table-column width="150" class-name="el-label--border" align="left">
      <template slot-scope="scope">
        <span style="color: #1B1E22;">{{ scope.row.label }}</span>
      </template>
    </el-table-column>
    <el-table-column v-for="(item, index) in bomInfos" align="left" show-overflow-tooltip
      :label="item.bomCode + '-' + (index + 1)" :key="item.id">
      <template slot-scope="scope">
        <template v-if="activeOtherName === 'diffList'">
          <span v-if="scope.row.parentBomId === item.id && scope.row.code === 'matlCode'">
            <el-link style="display: inline" :type="'primary'" @click="linkClick(scope.row[scope.row.code])">
              {{ scope.row[scope.row.code] }}
            </el-link>
          </span>
          <span v-else-if="scope.row.parentBomId === item.id && scope.row.type === 'dict'">{{ scope.row[scope.row.code] | orderTypeFilter(dict[scope.row.fieldFormatName])}}</span>
          <span v-else-if="scope.row.parentBomId === item.id">{{ scope.row[scope.row.code] }}</span>
        </template>
        <template v-else-if="activeOtherName === 'partSameList'">
          <span v-if="scope.row.partSameObj[item.id] && scope.row.code === 'matlCode'">
            <el-link style="display: inline" :type="'primary'" @click="linkClick(scope.row.partSameObj[item.id][scope.row.code])">
              {{ scope.row.partSameObj[item.id][scope.row.code] }}
            </el-link>
          </span>
          <span v-else-if="scope.row.partSameObj[item.id] && scope.row.type === 'dict'" :style="false ?{color: 'red'}:{}">{{ scope.row.partSameObj[item.id][scope.row.code] | orderTypeFilter(dict[scope.row.fieldFormatName])}}</span>
          <span v-else-if="scope.row.partSameObj[item.id]" :style="false ?{color: 'red'}:{}">{{ scope.row.partSameObj[item.id][scope.row.code] }}</span>
        </template>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import indexMixin from '@/views/mixins'
export default {
  props: {
    title: {
      type: String,
      default: '子件'
    },
    dict: {
      type: Object,
      default: null
    },
    bomInfos: {
      type: Array,
      default: []
    },
    tableData: {
      type: Array,
      default: []
    },
    len: {
      type: Number,
      default: 0
    },
    activeOtherName: {
      type: String,
      default: ''
    },
    isSelection: {
      type: Boolean,
      default: true
    }
  },
  mixins: [indexMixin],
  data() {
    return {
      selectionData: []
    }
  },
  methods: {
    selectable(row, index) {
      if (index % this.len === 0) {
        return true
      }else{
        return false
      }
    },
    //表格头部样式
    headerCellStyle({ row, column, rowIndex, columnIndex }) {
      let index = this.isSelection?1:0
      if (columnIndex === index+1) {
        return { display: "none" };
      }
      if (rowIndex == 0 && columnIndex == index) {
        this.$nextTick(() => {
          document.querySelector(`.${column.id}`).setAttribute("colspan", "2");
        });
      }
    },
    rowStyle ({row, rowIndex}) {
      let isColor = {}
      if(row.partSameObj){
        const firstKey = Object.entries(row.partSameObj)[0][1]
        for (const key in row.partSameObj) {
          if(row.partSameObj[key][row.code] != firstKey[row.code]){
            isColor = {'color': 'red'}
            return isColor
          }
        }
      }
      return isColor
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      let index = this.isSelection?[0, 1]:[0]
      if (index.includes(columnIndex)) {
        if (rowIndex % this.len === 0) {
          return {
            rowspan: this.len,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },
    handleSelect(data) {
      this.selectionData = data
      this.$emit('handleSelect')
    },
    linkClick(id) {
      this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: id, name: 'BOManalysisOperate' } })
    }
  }
};
</script>
<style lang="scss" scoped>
.container_flex_form_table {
  margin: 0px;
  ::v-deep .el-label--border {
    .cell {
      padding-left: 10px !important;
      padding-right: 10px !important;
    }
  }
  /* 如果单元格的padding */
  ::v-deep .elChgTbeClmn .cell {
    padding: 0px !important;
  }

  .elHeadCon {
    height: 50px;
    position: relative;
  }

  .headerCon1 {
    position: absolute;
    left: 40px;
    bottom: 5px;
  }

  .headerCon2 {
    position: absolute;
    right: 40px;
    top: 5px;
  }

  .headerLine {
    width: 1px;
    height: 204px;
    transform: rotate(-76deg);
    transform-origin: top;
    background-color: #dfe6ec;
  }
}

</style>