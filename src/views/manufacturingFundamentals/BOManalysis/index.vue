<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :button-disable="handleTopButtonDisabled"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
      @handleQuery="handleQuery" @handleResetField="handleResetField">
    </form-data>

    <el-row type="flex" class="container_h">
      <!--用户数据-->
      <el-col :span="18" :xs="24" class="container_flex">
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
          :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
          @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
          @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
          :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :showButton="handleShowButton"
          @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @clickLink="clickLink"
          @selectChange="selectChange" @emitAblFilter="emitAblFilter">
          <template slot="status" slot-scope="scope" v-if="scope.value">
            <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value | fieldFormat(scope.fieldFormatArr) }}
          </template>
          <template slot="useBy" slot-scope="scope" v-if="scope.value">
            <span :class="'useBy-' + scope.value">{{ scope.value | fieldFormat(scope.fieldFormatArr) }}</span>
          </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="getList" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { bomReferenceHistory } from '@/api/prodmgr-mm/bom';
import indexMixin from '@/views/mixins';
export default {
  name: "BOManalysis",
  mixins: [indexMixin],
  data() {
    return {
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 表格数据
      list: [],
      //列表选中数据
      selection: [],
      // 表格序号是否展示
      numberShow: true,
      // 页面属性
      property: {},
      total: 0,
      // 查询参数
      listQuery: {
        pageNum: 1,
        pageSize:  30,
      },
      // 表单参数
      formData: {},
      formDataClick: {},
      treeProps: {
        children: 'rawList',
        hasChildren: 'hasChildren'
      },
      workFlowViewVisible: false,
      selectedRow: null,
    };

  },
  created() {
    this.menuProperty();
  },
  methods: {
    handleShowButton(row) {
      return row.level == 0
    },
    menuProperty() {
      let id = this.$route.meta.id;
      this.$store.dispatch('menuProperty', id).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30
        this.property = data
      });
    },
    handleTopButtonDisabled(button) {
      return this.selection.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
      return false
    },
    numberChange(val) {
      this.numberShow = val;
    },
    newButton(buttonCode, formId, buttonData) {
      this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
    },
    handleCheckAllChange(columns) {
      this.$refs.tableIndex.init(columns);
    },
    clickReset() {
      this.handleQuery();
    },
    //选择框回调
    selectChange(row) {
      let { formData, isWatch } = row;
      if (!isWatch) {
        this.handleQuery(formData);
      } else {
        this.formData = Object.assign({}, this.formData, formData);
      }
    },
    cleanClick(data) {
      for (const key of data) {
        if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
          this.$refs.formData.resetQueryDateRange(key);
        }
        this.formData[key] = null;
      }
      this.handleQuery();
    },
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery)
      this.handleQuery();
    },
    handleSelectionChange(ids, single, multiple, selection) {
      this.ids = selection.map(item => item.id);
      this.single = single;
      this.multiple = multiple;
      this.selection = selection;
    },
    handleResetField() {
    },
    handleButton(buttonCode, idArr, rowArr,  { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      if(buttonCode === 'BOMcompare'){
        if(idArr.length < 2){
          this.$modal.msgError('最少选择2条数据')
          return
        }
        if(idArr.length > 5){
          this.$modal.msgError('最多选择5条数据')
          return
        }
        this.$router.push({name: 'BOManalysisOperate', query: { ids: idArr.join(',') } })
      }
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      bomReferenceHistory(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list;
        this.total = data.total;
      }).finally(() => {
        this.loading = false;
      })
    },
    clickLink(row, fieldCode, linkText) {
      if (fieldCode == 'bomCode') {
        this.$router.push({ name: 'BOMAdministrationOperate', query: { type: 'view', id: !!row.level ? row.bomId : row.id } });
        return
      }
      if (fieldCode === 'matlCode') {
        this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'BOMAdministration' } });
        return
      }
    },
  }
};
</script>
<style lang="scss" scoped>
.ov_head {
  flex: 1;
  height: 100%;
  overflow-y: scroll;
}
</style>