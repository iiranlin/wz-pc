<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :button-disable="handleTopButtonDisabled"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
      @handleQuery="handleQuery" @handleResetField="handleResetField"></form-data>

    <el-row type="flex" class="container_h">
      <!--用户数据-->
      <el-col :span="18" :xs="24" class="container_flex">
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
          :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
          @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
          @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
          :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" idName="pathId"
          @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
          @emitAblFilter="emitAblFilter" @clickLink="clickLink">

          <template slot="pathCodeCopy" slot-scope="scope">
            <el-link type="primary" @click="clickLink(scope.data, 'pathCode')"> {{
              scope.data.pathCode }}</el-link>
          </template>
          <template slot="status" slot-scope="scope">
            <icon-svg :class="iconClassSize(scope.value)" :icon-class="iconEnableStautsClass(scope.value)" />{{
              scope.value | fieldFormat(scope.fieldFormatArr) }}
          </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
    <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
    <bomHistory ref="bomHistory"></bomHistory>
    <processHistory ref="processHistory"></processHistory>
    <activiti-assignee ref="activitiAssignee" :multiple="false"
      @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
  </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import bomHistory from '@/views/components/bom-history';
import processHistory from '@/views/components/process-history';
import { getList, remove, submit } from '@/api/prodmgr-mm/processRoute'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import workFlowView from '@/components/workFlowView'
export default {
  name: "processRoute",
  mixins: [indexMixin],
  components: { bomHistory, processHistory, activitiAssignee, workFlowView },
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
      numberShow: false,
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
      // 部门树选项
      treeLoading: false,
      filterText: "",
      workFlowViewVisible: false,
      selectedRow: null
    };

  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  created() {
    this.menuProperty();
  },
  methods: {
    clickLink(row, code) {
      if (code === 'pathCode') {
        this.$router.push({ name: 'processRouteCreate', query: { name: 'processRoute', type: 'view', id: row.pathId } })
      } else if(code === 'version') {
        this.$router.push({ name: 'processRouteCreate', query: { name: 'processRoute', type: 'view', id: row.pathId } })
      }else if (code === 'matlName') {
        this.$router.push({ name: 'materialArchivesOperate', query: { name: 'processRoute', type: 'view', matlCode: row.matlCode } });
      } else if (code === 'bomName') {
        this.$router.push({ name: 'BOMAdministrationOperate', query: { name: 'processRoute', type: 'view', id: row.bomId } });
      }

    },
    filterNode(value, data) {
      if (!value) return true;
      return !!this.$py.match(data.deptName, value) || data.deptCode.indexOf(value) !== -1;
    },
    menuProperty() {
      let id = this.$route.meta.id;
      this.$store.dispatch('menuProperty', id).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30
        this.property = data;
        this.property.buttonTop = this.property.buttonTop.map(item => {
          return item
        })
      });
    },
    handleTopButtonDisabled(button) {
      return this.selection.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
      if (['withdraw'].includes(button.buttonCode)) {
        return !['2'].includes(row.status)
      }
      if (['submit', 'update', 'delete'].includes(button.buttonCode) && ['2', '3'].includes(row.status)) {
        return true
      }
      if (['processHistory'].includes(button.buttonCode)) {
        return ['V001', ''].includes(row.version)
      }
      if (['change'].includes(button.buttonCode) && row.status != '3') {
        return true
      }
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
      this.ids = ids
      this.single = single
      this.multiple = multiple
      this.selection = selection
    },
    handleResetField() {
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.getList();
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      const ids = rowArr.map(({ pathId }) => pathId)
      if (buttonCode == 'change') {
        this.$router.push({ name: 'processRouteCreate', query: { id: ids[0], name: 'processRoute', type: buttonCode } })
      } else if (buttonCode == 'update') {
        this.$router.push({ name: 'processRouteCreate', query: { id: ids[0], name: 'processRoute', type: buttonCode } })
      } else if (buttonCode === 'delete') {
        this.handleRemove(ids)
      } else if (buttonCode === 'create') {
        this.$router.push({ name: 'processRouteCreate', query: { name: 'processRoute', type: buttonCode } })
      } else if (buttonCode == 'flowSee') {
        this.workFlowViewVisible = true

        this.selectedRow = { id: ids[0], businessId: ids[0] };
      } else if (buttonCode === 'historyVersion') {
        this.$refs.processHistory.init('');
      } else if (buttonCode === 'processHistory') {
        this.$refs.processHistory.init(rowArr[0]);
      } else if (buttonCode === 'submit') {
        this.ids = ids
        this.handleSubmit(ACTIVITI_ASSUGNEE.MM_PATH)
      } else if (buttonCode === 'withdraw') {
        this.handleWithdraw({ businessId: ids[0], businessType: ACTIVITI_ASSUGNEE.MM_PATH, })
      }
    },
    handleRemove(ids = []) {
      this.$modal.confirm('是否确定删除?').then(async () => {
        await remove({ ids: ids })
        this.$modal.msgSuccess(`删除成功`)
        this.getList();
      })
    },
    append() {
      const newChild = { id: id++, label: 'testtest', children: [] };
      if (!data.children) {
        this.$set(data, 'children', []);
      }
      data.children.push(newChild);
    },
    remove() {
      const parent = node.parent;
      const children = parent.data.children || parent.data;
      const index = children.findIndex(d => d.id === data.id);
      children.splice(index, 1);
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      getList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list;
        this.total = data.total;
      }).finally(() => {
        this.loading = false;
      })
    },
    async submit(assignee = '') {
      try {
        await submit({ ids: this.ids, assignee })
        this.$modal.msgSuccess(`提交成功`)
        this.getList();
      } catch (err) {
        this.$modal.msgError(err.message)
        console.error(err)
      }
    },

  }
};
</script>

<style lang="scss" scoped>
.flex-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .search-input {
    width: 80%
  }

  .plus-icon {
    cursor: pointer;
    margin-right: 5px;
    color: #52A2FF;
    font-size: 24px;
  }
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;

  .red {
    color: red
  }

  .hide {
    display: none;
  }
}

.ml-5 {
  margin-left: 5px;
}
</style>
