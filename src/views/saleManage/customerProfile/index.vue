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
          :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
          @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
          @emitAblFilter="emitAblFilter" @clickLink="clickLink">
          <template slot="status" slot-scope="scope">
            <icon-svg :class="iconClassSize(scope.value)" :icon-class="iconClass(scope.value)" />{{ scope.value |
              fieldFormat(scope.fieldFormatArr) }}
          </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
    <customer-supplier-add ref="customerSupplierAdd"></customer-supplier-add>
    <customer-restrict-add ref="customerRestrictAdd"></customer-restrict-add>

    <!--    客户同步日期-->
    <Dialog title="客户同步" :visible.sync="open" width="30%" :before-close="handleClose">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="130px" class="demo-ruleForm">
        <el-form-item label="同步日期:" prop="dataTime">
          <el-date-picker v-model="ruleForm.dataTime" type="date" placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="open = false">确 定</el-button>
        <el-button @click="open = false" style="margin-left: 5px">取 消</el-button>
      </span>
    </Dialog>
    <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
    <activiti-assignee ref="activitiAssignee" :multiple="false"
      @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
    <sync-operate ref="syncOperate" :callback="syncOperateConfirm"></sync-operate>
  </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import CustomerProfileAdd from './components/customerProfileAdd.vue'
import CustomerSupplierAdd from './components/customerSupplierAdd.vue'
import CustomerRestrictAdd from './components/customerRestrictAdd.vue'
import { getProfileList, getProfileDelete, exportDetailList, cuInfoSubmit } from '@/api/saleManage/customerProfile'
import { download } from '@/utils/request'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import workFlowView from '@/components/workFlowView'
import syncOperate from '@/views/components/syncOperate'

export default {
  name: "customerProfile",
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

      open: false,
      ruleForm: {
        dataTime: ""
      },
      rules: {
        dataTime: [
          { required: true, message: '同步日期不能为空', trigger: 'blur' },
        ],
      },
      workFlowViewVisible: false,
      selectedRow: null,
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' }]
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
    iconClassSize(value) {
      if (value !== '3') {
        return "icon-size"
      }
      return "icon-size"
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
      });
    },
    handleTopButtonDisabled(button) {
      return this.selection.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
      if (['withdraw'].includes(button.buttonCode)) {
       return !['2'].includes(row.status)
      }
      if (button.buttonCode === "submit" || button.buttonCode === "delete") {
        return row.status === '2' || row.status === '3'
      } else if (button.buttonCode === "update") {
        return row.status === '2' || row.status === '3'
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
    clickLink(row) {
      this.$router.push({ name: 'customerProfileAdd', query: { type: "view", id: row.id } })
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
      this.listQuery.pageNum = 1;
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    operateSuccess() {
      this.handleQuery()
    },
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery)
      this.handleQuery();
    },
    handleSelectionChange(ids, single, multiple, selection) {
      this.ids = ids
      this.single = single
      this.multiple = multiple
      this.selection = selection;
    },
    handleResetField() {
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      if (buttonCode == 'update') {
        this.$router.push({ name: 'customerProfileAdd', query: { type: buttonCode, id: rowArr[0].id } })
      } else if (buttonCode === 'delete') {
        this.$modal.confirm('是否确定删除?').then(() => {
          return getProfileDelete({ ids: idArr });
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => { });
      } else if (buttonCode === 'create') {
        this.$router.push({ name: 'customerProfileAdd', query: { type: buttonCode } })
      } else if (buttonCode === 'supplier') {
        this.$refs['customerSupplierAdd'].init('create', "customerSupplierAdd");
      } else if (buttonCode === 'restrict') {
        this.$refs['customerRestrictAdd'].init('create', "customerRestrictAdd");
      } else if (buttonCode === 'synchronous') {
        this.open = true
      } else if (buttonCode === 'flowSee') {
        this.workFlowViewVisible = true;
        this.selectedRow = { id: rowArr[0].id, businessId: rowArr[0].id };
      } else if (buttonCode === 'export') {
        const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
        download(`${exportDetailList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
      } else if (buttonCode == 'submit') {
        this.ids = idArr
        this.handleSubmit(ACTIVITI_ASSUGNEE.SA_CU)
      } else if (buttonCode === 'sync') {
        this.$refs.syncOperate.init();
      } else if (buttonCode === 'withdraw') {
        this.handleWithdraw({ businessId: rowArr[0].id, businessType: ACTIVITI_ASSUGNEE.SA_CU, })
      }
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      getProfileList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list
        this.total = data.total;
      }).finally(() => {
        this.loading = false;
      })
    },
    /*导出*/
    // handleExport(obj) {
    //   const _this = this;
    //   let params ={
    //     pageSize:this.listQuery.pageSize,
    //     pageNum:this.listQuery.pageNum,

    //   }
    //   if(obj.exportType =='1'){
    //     params.pageNum = -1
    //     params.pageSize = -1
    //   }
    //   _this.loading = true
    //   getProfileExport(Object.assign({},obj,params,this.formData)).then(response => {
    //     const fileName = '客户档案.xlsx';
    //     if (typeof window.navigator.msSaveBlob !== 'undefined') {
    //       window.navigator.msSaveBlob(new Blob([response.data]), fileName);
    //     }
    //     else {
    //       let url = window.URL.createObjectURL(new Blob([response.data]));
    //       let link = document.createElement('a');
    //       link.style.display = 'none';
    //       link.href = url;
    //       link.setAttribute('download', fileName);
    //       document.body.appendChild(link);
    //       link.click();
    //       document.body.removeChild(link); //下载完成移除元素
    //       window.URL.revokeObjectURL(url); //释放掉blob对象
    //     }
    //   }).finally(()=>{
    //     _this.loading = false;
    //   })
    // },
    // submitSuccess(ids){
    //   this.ids = ids
    //   this.submitList()
    // },
    //提交
    submit(assignee = '') {
      this.loading = true;
      cuInfoSubmit({ ids: this.ids, assignee }).then(({ success, data, message }) => {
        if (success) {
          this.$modal.msgSuccess('提交成功')
          this.getList()
          this.refreshChange(this.refName)
        } else {
          this.$modal.msgError(message)
        }
      }).finally(() => {
        this.loading = false;
      })
    },
    handleClose() {
      this.open = false
    },
    async syncOperateConfirm(func, args) {
      // const idx = this.property.buttonTop.findIndex(item => item.buttonCode == 'sync')
      // const btn = this.property.buttonTop[idx]
      try {
        this.setButtonLoading('sync', true)
        // this.$set(this.property.buttonTop, idx, { ...btn, buttonName: '同步中', loading: true })
        const { message } = await func(args)
        this.$modal.msgSuccess(message)
        this.handleQuery()
      } catch (err) {
        console.error(err)
      } finally {
         this.setButtonLoading('sync', false)
        // this.$set(this.property.buttonTop, idx, { ...btn, buttonName: '同步供应商', loading: false })
      }
    },
  },
  components: {
    CustomerRestrictAdd,
    CustomerSupplierAdd,
    CustomerProfileAdd,
    activitiAssignee,
    workFlowView,
    syncOperate
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
}

.icon-size {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  margin-right: 3.5px;
}
</style>
