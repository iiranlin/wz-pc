<template>
  <el-table :data="databaseData" border default-expand-all>
    <el-table-column label="" type="expand">
      <template slot-scope="scope">
        <el-table :data="scope.row.columnList" class="childTable">
          <el-table-column label="列名" prop="columnName" align="left">
            <template slot-scope="columnScope">
              <el-input v-model="columnScope.row.columnName" placeholder="请输入列名"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="列注释" prop="columnComment" align="left">
            <template slot-scope="columnScope">
              <el-input v-model="columnScope.row.columnComment" placeholder="请输入列注释"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="列类型" prop="columnType" align="left">
            <template slot-scope="columnScope">
              <el-select v-model="columnScope.row.columnType" placeholder="">
                <el-option v-for="item in databaseTypeList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="长度" prop="columnLength" align="left">
            <template slot-scope="columnScope">
              <el-input type="number" v-if="isShowLength(columnScope.row)" v-model="columnScope.row.columnLength" placeholder="请输入长度"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="小数位数" prop="columnDecimal" align="left">
            <template slot-scope="columnScope">
              <el-input type="numer" v-if="isShowDecimal(columnScope.row)" v-model="columnScope.row.columnDecimal" placeholder="请输入小数位数"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="默认值" prop="columnDefault" align="left">
            <template slot-scope="columnScope">
              <el-input v-model="columnScope.row.columnDefault" placeholder="请输入默认值"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="可为空" prop="isNullable" align="left">
            <template slot-scope="columnScope">
              <el-checkbox v-model="columnScope.row.isNullable" :true-label="1" :false-label="0"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="是否主键" prop="isPk" align="left">
            <template slot-scope="columnScope">
              <el-checkbox v-model="columnScope.row.isPk" :true-label="0" :false-label="1"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="columnScope">
              <el-button type="text" size="small" @click="deleteColumn(columnScope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-table-column>
    <el-table-column label="表名" prop="tableName" align="center">
      <template slot-scope="scope">
        <el-input v-model="scope.row.tableName" placeholder="请输入表名"></el-input>
      </template>
    </el-table-column>
    <el-table-column label="表备注" prop="tableComment" align="center">
      <template slot-scope="scope">
        <el-input v-model="scope.row.tableComment" placeholder="请输入表备注"></el-input>
      </template>
    </el-table-column>
    <el-table-column label="操作" align="center">
      <template slot-scope="scope">
        <el-button type="text" size="small" @click="addColumn">新增</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  props: {
    databaseData: Array
  },
  data() {
    return {
      //数据库类型
      databaseTypeList: [
        'binary_double',
        'binary_float',
        'blob',
        'clob',
        'char',
        'date',
        'interval day to second',
        'interval year to month',
        'long',
        'long raw',
        'nclob',
        'number',
        'timestamp',
        'timestamp with local time zone',
        'timestamp with time zone',
        'varchar2'
      ],
      //默认列
      defaultColumn: {
        isNullable: 1
      }
    }
  },
  methods: {
    //删除列
    deleteColumn(index) {
      this.databaseData[0].columnList.splice(index)
    },
    //新增列
    addColumn() {
      this.databaseData[0].columnList.push(this.defaultColumn)
    },
    //是否显示长度
    isShowLength(row) {
      if (row.columnType == 'number' ||
          row.columnType == 'char' ||
          row.columnType == 'varchar2') {
        return true
      }
    },
    //是否显示小数位数
    isShowDecimal(row) {
      if (row.columnType == 'number') {
        return true
      }
    },
    //验证表单
    validForm() {
      return new Promise((resolve, reject) => {
        if (this.databaseData[0].tableName == '') {
          this.$modal.msgError('表名不能为空')
          resolve(false)
        }
        const reg = /^[a-zA-Z][\w]*$/
        if (!reg.test(this.databaseData[0].tableName)) {
          this.$modal.msgError('表名不符合规则')
          resolve(false)
        }
        for (let index = 0; index < this.databaseData[0].columnList.length; index++) {
          const item = this.databaseData[0].columnList[index]
          if (!item.hasOwnProperty('columnName') || item.columnName == '') {
            this.$modal.msgError('列名不能为空')
            resolve(false)
            break
          }
          if (!reg.test(item.columnName)) {
            this.$modal.msgError('列名不符合规则')
            resolve(false)
          }
          if (!item.hasOwnProperty('columnComment') || item.columnComment == '') {
            this.$modal.msgError('列注释不能为空')
            resolve(false)
            break
          }
          if (!item.hasOwnProperty('columnType') || item.columnType == '') {
            this.$modal.msgError('列类型不能为空')
            resolve(false)
            break
          }
          if (this.isShowLength(item) && 
              (!item.hasOwnProperty('columnLength') || item.columnLength == '')) {
            this.$modal.msgError('列长度不能为空')
            resolve(false)
            break
          }
        }
        resolve(true)
      }) 
    },
    //输入框只能输入英文+数字
    handlerInput(val) {
      const reg = /^[a-zA-Z][\w]*$/
      console.log(reg.test(val))
    }
  }
}
</script>

<style scoped lang="scss">
.childTable{
  position: relative;
  overflow: auto !important;
  height: 600px;
}
</style>