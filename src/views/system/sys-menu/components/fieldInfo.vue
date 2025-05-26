<template>
  <el-table class="field-info-table" ref="table" v-loading="loading" :data="dataList" row-key="columnName"
            :height="tableHeight()"
            @selection-change="handleSelectionChange"
  >
    <el-table-column type="selection" width="55" align="center"/>
    <el-table-column label="序号" prop="id" align="left" width="80">
      <template slot-scope="scope">
        <span>{{ scope.$index + 1 }}</span>
      </template>
    </el-table-column>
    <el-table-column label="字段列名" align="left" prop="columnName" min-width="10%" show-overflow-tooltip/>
    <el-table-column label="字段描述" align="left" min-width="10%">
      <template slot-scope="scope">
        <span>{{ scope.row.columnComment }}</span>
      </template>
    </el-table-column>
    <el-table-column label="物理类型" align="left" prop="columnType" min-width="10%" show-overflow-tooltip/>
    <el-table-column label="Java类型" align="left" min-width="11%">
      <template slot-scope="scope">
        <span>{{ scope.row.javaType }}</span>
      </template>
    </el-table-column>
    <el-table-column label="java属性" align="left" min-width="10%">
      <template slot-scope="scope">
        <span>{{ scope.row.javaField }}</span>
      </template>
    </el-table-column>

    <el-table-column label="插入" align="left" min-width="5%">
      <template slot-scope="scope">
        <el-checkbox true-label="1" false-label="0" v-model="scope.row.isInsert" disabled></el-checkbox>
      </template>
    </el-table-column>
    <el-table-column label="编辑" align="left" min-width="5%">
      <template slot-scope="scope">
        <el-checkbox true-label="1" false-label="0" v-model="scope.row.isEdit" disabled></el-checkbox>
      </template>
    </el-table-column>
    <el-table-column label="列表" align="left" min-width="5%">
      <template slot-scope="scope">
        <el-checkbox true-label="1" false-label="0" v-model="scope.row.isList" disabled></el-checkbox>
      </template>
    </el-table-column>
    <el-table-column label="查询" align="left" min-width="5%">
      <template slot-scope="scope">
        <el-checkbox true-label="1" false-label="0" v-model="scope.row.isQuery" disabled></el-checkbox>
      </template>
    </el-table-column>
    <el-table-column label="查询方式" align="left" min-width="10%">
      <template slot-scope="scope">
        <el-select v-model="scope.row.queryType" disabled>
          <el-option label="=" value="EQ"/>
          <el-option label="!=" value="NE"/>
          <el-option label=">" value="GT"/>
          <el-option label=">=" value="GTE"/>
          <el-option label="<" value="LT"/>
          <el-option label="<=" value="LTE"/>
          <el-option label="LIKE" value="LIKE"/>
          <el-option label="BETWEEN" value="BETWEEN"/>
        </el-select>
      </template>
    </el-table-column>
    <el-table-column label="必填" align="left" min-width="5%">
      <template slot-scope="scope">
        <el-checkbox true-label="1" false-label="0" v-model="scope.row.isRequired" disabled></el-checkbox>
      </template>
    </el-table-column>
    <el-table-column label="显示类型" align="left" min-width="12%">
      <template slot-scope="scope">
        <el-select v-model="scope.row.htmlType" disabled>
          <el-option label="文本框" value="input"/>
          <el-option label="文本域" value="textarea"/>
          <el-option label="下拉框" value="select"/>
          <el-option label="单选框" value="radio"/>
          <el-option label="复选框" value="checkbox"/>
          <el-option label="日期控件" value="datetime"/>
          <el-option label="图片上传" value="imageUpload"/>
          <el-option label="文件上传" value="fileUpload"/>
          <el-option label="富文本控件" value="editor"/>
        </el-select>
      </template>
    </el-table-column>
    <el-table-column label="字典类型" align="left" min-width="10%">
      <template slot-scope="scope">
        <tree-select v-model="scope.row.dictType" :appendToBody="true" :options="dictOptions" :normalizer="normalizer"
                     placeholder="请选择" disabled
        />
      </template>
    </el-table-column>
    <el-table-column label="操作" align="center" width="80">
      <template slot-scope="scope">
        <el-button
          size="mini"
          type="text"
          icon="el-icon-circle-plus"
          @click="handleAdd(scope.row,scope.$index)"
        ></el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { camelCase } from '@/utils'
import { commonTree } from '@/api/system/dict'

export default {
  name: 'fieldInfo',
  props: {
    //表格数据
    dataList: {
      type: Array,
      default: []
    },
    //菜单信息配置是否展开
    isMenuShow: {
      required: true,
      type: Boolean,
      default: false
    },
    // 数据属性配置是否打开
    isDataSourceShow: {
      required: true,
      type: Boolean,
      default: false
    },
    // 是否全屏展示
    dialogFull: {
      required: true,
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      selectionList: [],
      windowHeight: 0,
      // 字典信息
      dictOptions: []
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
    commonTree().then(res => {
      this.dictOptions = res.data
    })
    let windowHeight = document.body.clientHeight && document.documentElement.clientHeight
    this.windowHeight = windowHeight - 610
  },
  methods: {
    /** 转换数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      }
    },
    tableHeight() {
      let windowHeight = this.windowHeight
      windowHeight = windowHeight + (this.isMenuShow ? 0 : 180) + (this.isDataSourceShow ? 0 : 60)
      return windowHeight
    },
    handleSelectionChange(selection) {
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

<style scoped>

.field-info-table ::v-deep .el-table {
  display: flex;
  flex-direction: column;
}

.field-info-table ::v-deep .el-table__header-wrapper {
  height: 45px;
}

.field-info-table ::v-deep .el-table__body-wrapper {
  flex: 1;
}

</style>
