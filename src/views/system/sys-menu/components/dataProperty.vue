<template>
  <el-table class="container_table1" border v-loading="loading" :data="dataList" row-key="columnName" :height="tableHeight()"
            @selection-change="handleSelectionChange"
  >
    <el-table-column type="selection" width="55" align="center"/>
    <el-table-column label="序号" type="index" align="left" width="80">
      <template slot-scope="scope">
        <span>{{ scope.$index + 1 }}</span>
      </template>
    </el-table-column>
    <el-table-column label="字段编码" prop="columnName" align="left"/>
    <el-table-column label="字段名称" prop="columnComment" align="left" :show-overflow-tooltip="true"/>
    <el-table-column label="字段类型" prop="dataType" align="left"/>
    <el-table-column label="字段长度" prop="numLength" align="left"/>
    <el-table-column label="小数位" prop="numBit" align="left"/>
    <el-table-column label="主键" prop="id" align="left"/>
    <el-table-column label="允许空" prop="nullable" align="left"/>
    <el-table-column label="默认值" prop="default" align="left" :show-overflow-tooltip="true"/>
    <!--<el-table-column label="操作" fixed="right" align="center" width="80">-->
    <el-table-column label="操作" align="center" width="80">
      <template slot-scope="scope">
        <el-button
          type="text"
          icon="el-icon-circle-plus"
          @click="handleAdd(scope.row,scope.$index)"
        ></el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
import { camelCase } from '@/utils/index'

export default {
  props: {
    //表格数据
    dataList: {
      type: Array,
      default: []
    },
    //菜单信息配置是否展开
    isMenuShow: {
      type: Boolean,
      default: false
    },
    // 数据属性配置是否打开
    isDataSourceShow: {
      type: Boolean,
      default: false
    },
    // 是否全屏展示
    dialogFull: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      selectionList: [],
      windowHeight: Number()
    }
  },
  watch: {
    'dialogFull': {
      handler: function(newDialogFull) {
        if (newDialogFull) {
          this.windowHeight = this.windowHeight + 80
        } else {
          this.windowHeight = this.windowHeight - 80
        }
      }
    }
  },
  created() {
    let windowHeight = document.body.clientHeight && document.documentElement.clientHeight
    this.windowHeight = windowHeight - 610
  },
  methods: {
    tableHeight() {
      let windowHeight = this.windowHeight
      windowHeight = windowHeight + (this.isMenuShow ? 0 : 180) + (this.isDataSourceShow ? 0 : 60)
      return windowHeight
    },
    handleSelectionChange(selection) {
      // selection.forEach(item => {
      //   item.columnName = camelCase(item.columnName)
      // });
      this.selectionList = selection
    },
    handleAdd(row, index) {
      let camelCaseStr = camelCase(row.columnName)
      let params = [{
        columnName: camelCaseStr,
        columnComment: row.columnComment
      }]
      this.$emit('handleAddField', params)
    }
  }
}
</script>

