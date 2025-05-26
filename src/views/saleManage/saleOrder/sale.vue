<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :button-disable="handleTopButtonDisabled"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
      @handleQuery="handleQuery" @handleResetField="handleResetField">
      <template v-slot:unitName="{data, i18nData}">
        <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
      </template>
    </form-data>
    <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
      :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
      @handleCheckAllChange="handleCheckAllChange" :menuId="menuId" @clickReset="clickReset"
      @numberChange="numberChange" @cleanClick="cleanClick">
      <template v-slot:tab>
        <orderDetailType :value="tableType" @input="handleTableTypeChange" :options="tableOptions" />
      </template>
    </right-toolbar>
    <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
      :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
      @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
      @emitAblFilter="emitAblFilter" @clickLink="clickLink">
      <template slot="status" slot-scope="scope">
        <icon-svg :class="iconClassSize(scope.value)" :icon-class="iconClass(scope.value)" />{{ scope.value |
          fieldFormat(scope.fieldFormatArr) }}
      </template>
      <template slot="bizStatus" slot-scope="scope">
        <span :class="'saleStatus-' + scope.value">{{ scope.value |
          fieldFormat(scope.fieldFormatArr) }}</span>
      </template>
      <template slot="fileList" slot-scope="scope">
        <el-link :disabled="!scope.data.fileList || !scope.data.fileList.length"
          :type="!scope.data.fileList || !scope.data.fileList.length ? 'info' : 'primary'"
          @click.stop="handlePreview(scope.data.fileList)">查看</el-link>
      </template>
    </table-index>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />
    <fileList ref="fileList" />
    <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
    <activiti-assignee ref="activitiAssignee" :multiple="false"
      @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
  </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { menuConfig } from '@/utils'

import orderDetailType from '@/views/components/orderDetailType'
import fileList from '@/views/components/fileList/index'

import { saleOrderList, saleOrderDetailList, saleOrderRemoveDetail, saleOrderSubmit, saleOrderRemoveOrder } from '@/api/saleManage/saleOrder'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import workFlowView from '@/components/workFlowView'
import FormUnitId from '@/views/components/form-unitId'
const TABLE_TYPE = {
  MASTER: 'MASTER', // 主单
  BRANCH: 'BRANCH'  // 主单+明细
}
export default {
  name: "saleOrder",
  mixins: [indexMixin],
  props: {
    tableType: {
      type: String,
      default: 'MASTER'
    },
    tabChange: {
      type: Function,
      default: null
    }
  },
  components: { orderDetailType, fileList, activitiAssignee, workFlowView, FormUnitId },
  data() {
    return {
      tableOptions: [
        { value: TABLE_TYPE.MASTER, label: '主单' },
        { value: TABLE_TYPE.BRANCH, label: '主单+明细' },
      ],
      menuId: '',
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
      workFlowViewVisible: false,
      selectedRow: null
    };

  },
  created() {
    this.menuProperty({ [TABLE_TYPE.MASTER]: '', [TABLE_TYPE.BRANCH]: menuConfig.MENU_SALE_BRANCH }[this.tableType])
  },
  methods: {
    async handlePreview(fileList) {
      try {
        this.$refs.fileList.init(fileList)
      } catch (err) {
        console.error(err)
      }
    },
    iconClassSize(value) {
      if (value !== '3') {
        return "icon-size"
      }
      return "icon-size"
    },
    iconClass(value) {
      const classObj = {
        0: "State-Fail", //待提交
        1: "State-Waiting", //审核中
        2: "State-Audit", //审核通过
        3: "State-Success"
      }
      return `${classObj[value]}`
    },
    menuProperty(id = '') {
      this.menuId = id || this.$route.meta.id;
      this.$store.dispatch('menuProperty', this.menuId).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30
        data.buttonTop.forEach(item => {
          if (item.buttonCode === 'create') {
            item.children = [
              {
                buttonCode: 'byContract',
                buttonName: '按合同',
                buttonMode: '',
              },
              {
                buttonCode: 'byPreOrder',
                buttonName: '按预投',
                buttonMode: ''
              },
            ]
          }
        });
        this.property = data;
      });
    },
    handleTopButtonDisabled(button) {
      if (button.buttonCode == 'submit') {
        return !this.selection.length || !this.selection.every(item => !['2', '3'].includes(item.status))
      }
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
    handleSelectionChange(ids, single, multiple, row) {
      this.ids = ids
      this.single = single
      this.multiple = multiple
      this.selection = row
    },
    handleResetField() {
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      if (buttonCode === 'update') {
        this.$router.push({ name: 'saleOrderOperate', query: { tableType: this.tableType == TABLE_TYPE.BRANCH ? '2' : '1', type: buttonCode, id: this.tableType == TABLE_TYPE.BRANCH ? idArr.join(',') : idArr[0] } })
      } else if (buttonCode === 'delete') {
        const req = this.tableType == TABLE_TYPE.BRANCH ? saleOrderRemoveDetail : saleOrderRemoveOrder
        this.$modal.confirm('是否删除该明细信息?').then(() => {
          return req({ ids: idArr });
        }).then((data) => {
          if (data.success) {
            this.getList();
            this.refreshChange(this.refName)
            this.$modal.msgSuccess("删除成功");
          } else {
            this.getList();
            this.$modal.msgError(data.message);
          }

        }).catch(() => { });
      } else if (buttonCode === 'byContract') {
        this.$router.push({ name: 'saleOrderOperate', query: { type: 'create', createMethod: '1' } })
      } else if (buttonCode === 'byPreOrder') {
        this.$router.push({ name: 'saleOrderOperate', query: { type: 'create', createMethod: '2' } })
      } else if (buttonCode == 'submit') {
        this.ids = idArr
        this.handleSubmit(ACTIVITI_ASSUGNEE.SA_XSD)
      } else if (buttonCode === 'flowSee') {
        this.workFlowViewVisible = true;
        this.selectedRow = { businessId: rowArr[0].id };
      } else if (buttonCode === 'withdraw') {
        this.handleWithdraw({ businessId: rowArr[0].id, businessType: ACTIVITI_ASSUGNEE.SA_XSD, })
      }
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      const func = { [TABLE_TYPE.MASTER]: saleOrderList, [TABLE_TYPE.BRANCH]: saleOrderDetailList }[this.tableType]

      func(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list;
        this.total = data.total;
      }).finally(() => {
        this.loading = false;
      })
    },
    //提交
    submit(assignee = '') {
      this.loading = true;
      saleOrderSubmit({ ids: this.ids, assignee }).then(({ success, data, message }) => {
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
    clickLink(row, name) {
      if (name === 'saleOrderCode') {
        this.$router.push({ name: 'saleOrderOperate', query: { type: "view", id: this.tableType == TABLE_TYPE.MASTER ? row.id : row.saleOrderId } })
      } else if (name === 'projectCode') {
        this.$router.push({ name: 'projectManagementOperate', query: { name: 'saleOrder', type: 'view', id: row.projectId } })
      } else if (name === 'contractCode') {
        this.$router.push({ name: 'contractManagementOperate', query: { name: 'saleOrder', type: 'view', id: row.contractId } })
      } else if (name === 'cuCode') {
        this.$router.push({ name: 'customerProfileAdd', query: { name: 'saleOrder', type: 'view', id: row.cuId } })
      } else if (name === 'matlCode') {
        this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'saleOrder', isQuery: 'query' } });
      }
    },
  }
};
</script>

<style scope>
.icon-size {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  margin-right: 3.5px;
}
</style>
