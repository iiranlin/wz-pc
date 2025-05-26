<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :button-disable="handleTopButtonDisabled"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
      @handleQuery="handleQuery" @handleResetField="handleResetField">
      <template slot="ascriptionName">
          <el-select class="select-box" v-model="formData.ascriptions" placeholder="请选择采购员" filterable multiple collapse-tags style="width:100%" size="small">
            <el-option v-for="(item, key)  in ascriptionsData" :key="key" :label="item.ascriptionName" :value="item.ascription" />
          </el-select>
      </template>
      <template slot="confirmStatus" slot-scope="scope">
          <el-select class="select-box" v-model="formData.confirmStatuss" placeholder="请选择确认状态" filterable multiple collapse-tags style="width:100%" size="small">
            <el-option v-for="(item, key)  in cfStatusFun(scope.data.fieldFormatArr)" :key="key" :label="item.name" :value="item.code" />
          </el-select>
      </template>
      <template slot="confirmByName">
          <el-select class="select-box" v-model="formData.confirmBys" placeholder="请选择确认人" filterable multiple collapse-tags style="width:100%" size="small">
            <el-option v-for="(item, key)  in confirmBysData" :key="key" :label="item.confirmByName" :value="item.confirmBy" />
          </el-select>
      </template>
    </form-data>
    <el-row type="flex" class="container_h">
      <el-col :span="18" :xs="24" class="container_flex">
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
          :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
          @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
          @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
          :buttonDisable="handleButtonDisable" :property="property" idName="suId" :numberShow="numberShow"
          @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
          @emitAblFilter="emitAblFilter" @clickLink="clickLink" :rowSetStyle="rowSetStyle">
          <template slot="status" slot-scope="scope">
            <icon-svg :class="[iconClassSize(scope.value), 'icon-size']" :icon-class="iconClass(scope.value)" />{{ scope.value | fieldFormat(scope.fieldFormatArr) }}
          </template>
          <template slot="ascriptionName" slot-scope="scope">
            <el-button v-if="scope.data.adjType" type="text" @click="ascriptionNameFun(scope.data.confirmId)">{{ scope.data.ascriptionName || '暂无'}}</el-button>
            <span v-else> {{ scope.data.ascriptionName || '暂无' }}</span>
          </template>
          <template slot="confirmByName" slot-scope="scope">
            {{ scope.data.confirmByName }}
          </template>
          <template slot="revisionReason" slot-scope="scope">
            <el-select v-model="scope.data.revisionReason" placeholder="请选择调整原因" filterable collapse-tags size="small" v-if="scope.data.adjType">
              <el-option v-for="(item, key)  in scope.fieldFormatArr" :key="key" :label="item.name" :value="item.code" />
            </el-select>
            <span v-else>{{ revisionFun(scope.fieldFormatArr, scope.data.revisionReason) }}</span>
          </template>
          <template slot="matlCode" slot-scope="scope">
            <el-button v-if="scope.data.adjType" type="text" @click="selectMaterials()">{{ scope.data.matlCode }}</el-button>
            <el-button v-else type="text" size="small" @click="clickLink(scope.data, 'matlCode')">{{ scope.data.matlCode }}</el-button>
          </template>
          <template slot="confirmStatus" slot-scope="scope">
              <span :class="'confirmStatus-' + scope.value">{{ scope.value |
                  fieldFormat(scope.fieldFormatArr) }}</span>
          </template>
          <template slot="planNum" slot-scope="scope">
            <div v-if="scope.data.adjType">
              <el-input show-word-limit v-model.trim="scope.data.planNum" @change="totalize(scope.data)">
              </el-input>
            </div>
            <span v-else>{{ scope.data.planNum }}</span>
          </template>
          <template slot="price" slot-scope="scope">
            <div v-if="scope.data.adjType">
              <el-input show-word-limit v-model.trim="scope.data.price" @change="totalize(scope.data)">
              </el-input>
            </div>
            <span v-else>{{ scope.data.price }}</span>
          </template>
          <template slot="taxRate" slot-scope="scope">
            <el-select v-model="scope.data.taxRate" placeholder="请选择税率" filterable collapse-tags size="small"
              v-if="scope.data.adjType" @change="totalize(scope.data)">
              <el-option v-for="(item, key)  in scope.fieldFormatArr" :key="key" :label="item.name" :value="item.code" />
            </el-select>
            <span>{{ scope.value | fieldFormat(scope.fieldFormatArr)  }}</span>
          </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="getList" />
      </el-col>
    </el-row>
    <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
    <activiti-assignee ref="activitiAssignee" :multiple="false" @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
    <customUser ref="customUser" :singleMode="true" @customUserClick="customUserClick"></customUser>
    <choice-material :singleMode="true" :propsFormData="{ planAttributes: [] }" ref="choiceMaterial" @choiceMaterialClick="choiceClick" />
    <detail-dialog ref="detailDialogRef" />
  </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import {
  planAscriptionList,
  planConfirmByList,
  batchAdjustAPI,
  adjustAPI,
  reviewAPI,
  reviewListExportAPI
} from '@/api/purchasingManagement/plan'
import { reviewListAPI } from '@/api/purchasingManagement/supplier'
import { getPuSuSubmitList } from '@/api/projectManagement/contractManagement'
import { download } from '@/utils/request'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import workFlowView from '@/components/workFlowView'
import customUser from '@/views/components/custom-user'
import choiceMaterial from "@/views/components/choice-material"
import {ACTIVITI_ASSUGNEE} from '@/utils/constant'
export default {
  name: "purchasePlanReview",
  mixins: [indexMixin],
  components: { activitiAssignee, workFlowView, customUser, choiceMaterial, DetailDialog: () => import('@/views/components/DetailDialog') },
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
      formData: {
        confirmStatuss: [],
        ascriptions: [],
        confirmBys: [],
      },
      formDataClick: {},
      // 部门树选项
      treeLoading: false,
      filterText: "",

      open: false,
      rules: {
        dataTime: [
          { required: true, message: '同步日期不能为空', trigger: 'blur' },
        ],
      },
      workFlowViewVisible: false,
      selectedRow: null,
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' }
      ],
      ascriptionsData: [],
      confirmBysData: [],
      selectIdList: [],
      selectObject: {},
      adjustStatus: false,
      sourceDetails: {
        '1': 'demandPlanWorkbenchOperate',
        '2': 'requirementPlanMaintenanceOperate',
        '3': 'productionDamageOperate',
        '4': 'saleOrderOperate'
      }
    };

  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  created() {
    this.menuProperty();
    this.planAscriptionList();
    this.planConfirmByList();
  },
  methods: {
    cfStatusFun(arr) {
      let newArr = []
      arr.forEach(item => {
        if (item.name == '待调整' || item.name == '待复核') {
          newArr.push(item)
        }
      })
      return newArr
    },
    rowSetStyle(row, rowIndex) {
      return {}
    },
    iconClassSize(value) {
      if (value !== '3') {
        return "icon-size"
      }
      return ""
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
      if(['Adjust', 'batchAdjust', 'review', 'reviewList'].includes(button.buttonCode)){
        return row.confirmStatus == '3' || row.adjType
      }else if ( button.buttonCode === "save") {
        return row.adjType == false
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
    clickLink(row, name) {
      if (name === 'planCode') {
        this.$router.push({ name: 'purchasePlanOperate', query: { name: 'purchasePlanReview', type: 'view', id: row.planId }})
      } else if (name === 'projectCode') {
        this.$router.push({ name: 'projectManagementOperate', query: { name: 'purchasePlanReview', type: 'view', id: row.projectId } })
      } else if (name === 'sourceCode') {
        if(this.sourceDetails[row.sourceType]){
          this.$router.push({name: this.sourceDetails[row.sourceType], query:{type: 'view', id: row.sourceId, name: 'purchasePlanReview'}})
        }
      } else if (name === 'matlCode') {
        this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'purchasePlanConfirm' } });
      }
      // this.$router.push({ name: 'supplierOperate', query: { type: "view", id: row.suId } })
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
    revisionFun(arr, num) {
      const newArr = arr
      for (let i = 0; i < newArr.length; i++) {
        if (i == (num - 1)) {
          return newArr[i].name
        }
      }

    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      //复核
      if (buttonCode == 'review' || buttonCode == 'reviewList') {
        let confirmIds = []
        this.list.forEach(item => {
          rowArr.forEach(itemA => {
            if (item.confirmId == itemA.confirmId) {
              confirmIds.push(item.confirmId)
            }
          })
        })
        if (confirmIds.length == 0) {
          this.$message.error('请选择一条数据')
        }
        let conType = rowArr.some(item => item.confirmStatus == '1')
        const name = conType?`当前订单有待调整信息，请确认后再进行操作！` : `是否确认复核！`
        this.$modal.confirm(name, '系统提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
          this.reviewAPI(confirmIds)
        })
      } else if (buttonCode === 'export') {
        const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
        download(`${reviewListExportAPI}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
        return
      } else if (buttonCode === 'Adjust') {
        this.selectObject = rowArr
        for (let i = 0; i < this.list.length; i++) {
          if (this.list[i].id == rowArr[0].id) {
            this.list[i].adjType = true
          }
        }
      } else if (buttonCode === 'save') {
        adjustAPI(rowArr[0]).then(({ data }) => {
          this.$modal.msgSuccess('保存成功')
          this.getList();
        })
      } else if (buttonCode == 'batchAdjust') {
        //批量调整
        let newIdArr = []
        this.adjustStatus = false
        this.list.forEach(item=>{
          rowArr.forEach(itemA=>{
            if (item.confirmId == itemA.confirmId) {
              newIdArr.push(item.confirmId)
            }
          })
        })
        this.selectIdList = newIdArr
        this.$refs.customUser.init();
        
      }
    },
    reviewAPI (confirmIds) {
      reviewAPI({ confirmIds: confirmIds }).then(({ data }) => {
        this.$modal.msgSuccess('复核成功')
        this.getList();
      }).finally(() => {
        this.loading = false;
      })
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      reviewListAPI(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        data.list.forEach(item=>{
          Object.assign(item,{adjType:false})
        })
        this.list = data.list
        this.total = data.total;
      }).finally(() => {
        this.loading = false;
      })
    },
    //提交
    submit(assignee = '') {
      const param = this.ids.map(id => ({ businessId: id, businessType: ACTIVITI_ASSUGNEE.PU_SU, candidateUsers: assignee ? [assignee] : [] }))
      this.loading = true;
      getPuSuSubmitList(param).then(({ success, data, message }) => {
        if (success) {
          this.$modal.msgSuccess('提交成功')
          this.getList()
        } else {
          this.$modal.msgError(message)
        }
      }).finally(() => {
        this.loading = false;
      })
    },
    planAscriptionList() {
      planAscriptionList().then(({ data }) => {
        this.ascriptionsData = data
      })
    },
    planConfirmByList() {
      planConfirmByList().then(({ data }) => {
        this.confirmBysData = data
      })
    },
    selectMaterials() {
      this.$refs.choiceMaterial.init()
    },
    choiceClick(data) {
      this.list.forEach(item => {
        if (item.id == this.selectObject[0].id) {
          Object.assign(item, { "matlCode": data.matlCode })
          Object.assign(item, { "matlName": data.matlName })
          Object.assign(item, { "matlType": data.matlType })
          Object.assign(item, { "matlUnit": data.matlUnit })
        }
      })
    },
    customUserClick(data) {
      let res = {
        ascription: data.id,
        ascriptionName: data.nickName,
        confirmIds: this.selectIdList,
      }
      if (this.adjustStatus == true) {
        this.list.forEach(item => {
          if (item.confirmId == this.selectIdList[0]) {
            Object.assign(item, { "ascriptionName": res.ascriptionName })
            Object.assign(item, { "ascription": res.ascription })
          }
        })
      } else {
        batchAdjustAPI(res).then(({ data }) => {
          this.$modal.msgSuccess('采购员更改成功')
          this.getList();
        })
      }
    },
    ascriptionNameFun(id) {
      let arr = [id]
      this.adjustStatus = true
      this.selectIdList = arr
      this.$refs.customUser.init();
    },
    totalize(scopeRow) {
      const row = scopeRow
      const taxAmount = (row.planNum * row.price * (1 + row.taxRate / 100))
      const amount = (row.planNum * row.price)
      const taxPrice = (row.price * (1 + row.taxRate / 100))
      this.list.forEach(item => {
        if (item.id == row.id) {
          Object.assign(item, { "taxAmount": taxAmount.toFixed(2) })
          Object.assign(item, { "amount": amount.toFixed(2) })
          Object.assign(item, { "taxPrice": taxPrice.toFixed(2) })
        }
      })
    },
  }
};
</script>
