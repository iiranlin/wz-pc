<template>
  <el-table :data="columnList" height="100%" border>
    <el-table-column label="序号" type="index" align="left"></el-table-column>
    <el-table-column label="列名" prop="columnName" align="left"></el-table-column>
    <el-table-column label="备注" prop="columnComment" align="left">
      <template v-slot="scope">
        <el-input v-model="scope.row.columnComment" placeholder="请输入备注"></el-input>
      </template>
    </el-table-column>
    <el-table-column label="数据库类型" prop="columnType" align="left"></el-table-column>
    <el-table-column label="JAVA类型" prop="javaType" align="left">
      <template v-slot="scope">
        <el-select v-model="scope.row.javaType">
          <el-option v-for="item in javaTypeList" :key="item.label" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </template>
    </el-table-column>
    <el-table-column label="JAVA属性" prop="javaField" align="left"></el-table-column>
    <el-table-column label="插入" prop="isInsert" align="left">
      <template v-slot="scope">
        <el-checkbox true-label="1" false-label="0" v-model="scope.row.isInsert"></el-checkbox>
      </template>
    </el-table-column>
    <el-table-column label="编辑" prop="isEdit" align="left">
      <template v-slot="scope">
        <el-checkbox true-label="1" false-label="0" v-model="scope.row.isEdit"></el-checkbox>
      </template>
    </el-table-column>
    <el-table-column label="列表" prop="isList" align="left">
      <template v-slot="scope">
        <el-checkbox true-label="1" false-label="0" v-model="scope.row.isList"></el-checkbox>
      </template>
    </el-table-column>
    <el-table-column label="查询" prop="isQuery" align="left">
      <template v-slot="scope">
        <el-checkbox true-label="1" false-label="0" v-model="scope.row.isQuery"></el-checkbox>
      </template>
    </el-table-column>
    <el-table-column label="查询方式" prop="queryType" align="left">
      <template v-slot="scope">
        <el-select v-model="scope.row.queryType">
          <el-option v-for="item in queryTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { columnSelectOptions } from '@/api/tool/gen'

export default {
  props: {
    columnList: Array
  },
  data() {
    return {
      //java类型
      javaTypeList: [],
      //查询方式
      queryTypeList: []
    }
  },
  created() {
    this.init()
  },
  methods: {
    //初始化
    init() {
      columnSelectOptions().then(res => {
        this.javaTypeList = res.data.javaType
        this.queryTypeList = res.data.queryType
      })
    }
  }
}
</script>
