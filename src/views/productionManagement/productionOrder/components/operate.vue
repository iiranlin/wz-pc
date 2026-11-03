<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
      @newButton="handleButton"></button-top>
    <div class="container_flex_form">

      <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required"
        active-text="隐藏非必填项">
      </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv"
        :class="{ 'formRender_view': queryType === 'view' }" @appendButtonClick="handleAppendButtonClick"
        @formChange="handleFormChange" @treeSelectSelect="treeSelectSelect">
        <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
            <attachmentTable businessType="32" ref="attachmentTable" :queryType="queryType" v-model="fileList">
            </attachmentTable>
          </div>
        </template>
        <template slot="product">
          <button-top :button-disable="handleTopButtonDisabled"
            v-if="productDatailProperty.buttonTop && queryType != 'view'"
            :buttonTopData="productDatailProperty.buttonTop" :multiple="multiple" :single="single"
            @newButton="handleTableButton" :buttonShow="handleDetailedButtonShow" />
          <table-index numberShow ref="procedureTableIndex" idName="bomId" :visibleAction="queryType != 'view'"
            :tableData="productList" :customnDisabled="true" :selectShow="false" :treeProps="treeProps"
            :property="productDatailProperty" @handleButton="handleTableButton"
            @handleCurrentChange="handleCurrentChange" @handleSelectionChange="handleSelectionChange"
            @clickLink="clickLink" :defaultExpandAll="true" :row-class-name="rowClassName">

            <template slot="sourceRowNum" slot-scope="scope">
              <span>{{ !!scope.data.sourceRowNum ? scope.data.sourceRowNum : '' }}</span>
            </template>
            <template slot="planAttribute" slot-scope="scope">
              <span :style="{ color: scope && scope.data && scope.data.planAttribute == '3' ? '#9726ff' : '#1b1e22' }">{{
                scope.data.planAttribute | orderTypeFilter(dict.type.planAttribute) }}</span>
            </template>
            <template slot="isFinished" slot-scope="scope">
              <el-select v-if="queryType != 'view' && !scope.data.sourcePlanId" v-model="scope.data.isFinished"
                style="width: 100%;">
                <el-option label="是" value="1"></el-option>
                <el-option label="否" value="0"></el-option>
              </el-select>
              <span v-else>{{ scope.data.isFinished == '1' ? '是' : '否' }}</span>
            </template>
            <template slot="planNum" slot-scope="scope">
              <el-input-number style="width: 100%;" v-if="queryType != 'view' && !scope.data.sourcePlanRawId"
                v-model="scope.data.planNum" :min="1" controls-position="right"></el-input-number>
              <span v-else>{{ scope.data.planNum }}</span>
            </template>
            <template slot="planStartDate" slot-scope="scope">
              <el-date-picker format="yyyy-MM-dd" style="width: 100%;" v-if="queryType != 'view'"
                v-model="scope.data.planStartDate" type="date" />
              <span v-else>{{ parseTime(scope.data.planStartDate, '{y}-{m}-{d}') }}</span>
            </template>
            <template slot="planEndDate" slot-scope="scope">
              <el-date-picker format="yyyy-MM-dd" style="width: 100%;" v-if="queryType != 'view'"
                v-model="scope.data.planEndDate" type="date" />
              <span v-else>{{ parseTime(scope.data.planEndDate, '{y}-{m}-{d}') }}</span>
            </template>
            <template slot="sourceProjectCode" slot-scope="scope">
              <el-input style="width: 100%;"
                v-if="(queryType == 'create' || queryType == 'update') && !scope.data.sourcePlanId" placeholder="请选择项目"
                v-model="scope.data.sourceProjectCode" class="input-with-select">
                <el-button slot="append" icon="el-icon-search"
                  @click="handleSelectProject(scope.data, scope.$index)"></el-button>
              </el-input>
              <el-link v-else type="primary" @click="clickLink(scope.data, 'sourceProjectCode')">{{
                scope.data.sourceProjectCode }}</el-link>
            </template>
          </table-index>
        </template>
        <template slot="other">

          <el-tabs v-model="activeOtherName" @tab-click="handleTabClick">
            <el-tab-pane label="材料信息" name="material">
              <button-top v-if="materialDatailProperty.buttonTop && queryType != 'view'"
                :button-disable="handleMaterTopButtonDisabled" :buttonTopData="materialDatailProperty.buttonTop"
                @newButton="handleTableButton" :showDropdown="false" :multiple="mmultiple" :single="msingle" />
              <table-index numberShow ref="matertableIndex" :visibleAction="queryType != 'view'"
                :tableData="currentProcedureRow.rawList" :property="materialDatailProperty"
                @handleButton="handleTableButton" idName="uid" @handleSelectionChange="handleMaterSelectionChange"
                @clickLink="clickLink">
                <template slot="rawNo" slot-scope="scope">
                  {{ scope.$index + 1 }}
                </template>
                <template slot="needNum" slot-scope="scope">
                  <el-input-number v-columnFormat="{
                    index: scope.$index,
                    prop: 'needNum',
                    list: currentProcedureRow.rawList
                  }" @input="(v) => scope.data.needNum = v" v-if="queryType != 'view'" v-model="scope.data.needNum"
                    :min="0" controls-position="right" style="width: 100%" @change="handleChange"></el-input-number>
                  <span v-else>{{ scope.data.needNum || '' }}</span>

                </template>
                <template slot="needDate" slot-scope="scope">
                  <el-date-picker v-columnFormat="{
                    index: scope.$index,
                    prop: 'needDate',
                    list: currentProcedureRow.rawList
                  }" @input="(v) => scope.data.needDate = v" style="width: 100%;" v-if="queryType != 'view'"
                    v-model="scope.data.needDate" @change="handleChange" />
                  <span v-else>{{ parseTime(scope.data.needDate, '{y}-{m}-{d}') }}</span>
                </template>

              </table-index>
            </el-tab-pane>
            <el-tab-pane label="工序信息" name="procedure">
              <table-index numberShow ref="tableIndex" :visibleAction="queryType != 'view'" :tableData="procedureList"
                idName="pathProcessId" :property="procedureDatailProperty" @handleButton="handleTableButton"
                @clickLink="clickLink">
              </table-index>
            </el-tab-pane>
          </el-tabs>
        </template>
      </VFormRender>
    </div>
    <choice-material ref="choiceMaterial" @choiceMaterialClick="handleConfirmMaterial" />
    <choice-plan ref="choicePlan" :isPlan="true" @change="handleConfirmPlan" :unitId="unitId" />
    <choice-bom ref="choiceBom" @change="handleConfirmBom" />
    <toBeReviewed ref="toBereview" />
    <selectProject ref="selectProject" singleMode :propsFormData="propsFormData" @selections="projectSelections" />
    <detail-dialog ref="detailDialogRef" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import attachmentTable from '@/views/components/attachmentTable'
import choiceMaterial from '@/views/components/choice-material'
import choicePlan from '@/views/components/choice-plan'
import choiceBom from '@/views/components/choice-bom'
import indexMixin from '@/views/mixins';
import { formFillInPage } from '@/api/form/form'

import { deptTree, getUnitTree } from '@/api/system/dept'

import { historyDetail } from '@/api/projectManagement/productionChange';
import { saveCreate, saveModify, saveSubmit, detail, expandBom, expandForOrdersNum, orderRawDetail } from '@/api/projectManagement/productionOrder'
import { getUserInfo } from '@/utils/user-info'
import { getToken } from '@/utils/auth'
import { menuConfig, generateUUID, deepTreeAddField } from '@/utils'
import { detailByBomOrMatl } from '@/api/prodmgr-mm/processRoute'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import { produceQuoteListForOrder } from '@/api/prodmgr-mm/demandPlan'
import selectProject from "@/views/components/selectProject"

import VFormRender from '@/components/form-render/index'
import dayjs from 'dayjs'
export default {
  name: 'productionOrderOperate',
  dicts: ['planAttribute'],
  components: {
    choiceMaterial,
    attachmentTable,
    choicePlan,
    choiceBom,
    toBeReviewed,
    VFormRender,
    selectProject,
    DetailDialog: () => import('@/views/components/DetailDialog'),
  },
  mixins: [indexMixin],
  data() {
    return {
      propsFormData: {},
      treeProps: {
        children: 'children'
      },
      loading: false,
      queryId: '',
      queryName: '',
      queryType: '',
      formJson: {},
      formData: {},
      status: '',
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
        { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
        { buttonName: '退回上一步', buttonCode: 'rollbackToPrevious', buttonIcon: 'Blue-Cancel', type: '' },
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
        { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
        { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'view, update, create' }
      ],
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: '01'
      },
      userInfo: getUserInfo(),
      activeOtherName: 'material',
      productDatailProperty: {},
      materialDatailProperty: {}, // MENU_PRODUCT_MATER_TABLE
      procedureDatailProperty: {},// MENU_PRODUCT_PROCEDURE_TABLE
      fileList: [],
      productList: [],
      materialList: [],
      procedureList: [],
      currentProcedureRow: { rawList: [] },
      multiple: true,
      single: true,
      selection: [],
      mmultiple: true,
      msingle: true,
      mselection: [],
      tableType: '1',
      checked: false,
      queryAuditArr: null,
      isQuery: '',
      unitId: '',
    }

  },
  computed: {
    ...mapGetters(['infoData'])
  },
  async created() {
    this.init()
  },
  methods: {
    handleSelectProject(row, index) {
      const pId = row.sourceProjectCode
      this._index = index
      this.propsFormData.unitId = this.unitId
      this.$refs.selectProject.init(pId);
    },
    projectSelections(val) {
      const that = this
      function deep(arr) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i]['bomId'] == that.currentProcedureRow.bomId) {
            arr[i].sourceProjectName = val.projectName
            arr[i].sourceProjectCode = val.projectCode
            arr[i].sourceProjectId = val.id
          }
          if (Array.isArray(arr[i].children) && !!arr[i].children.length) {
            deep(arr[i].children)
          }
        }
      }

      deep(this.productList)
    },
    checkoutStatus(flag) {
      const widgets = ['grid27037', 'grid83223', 'orderCode']
      if (flag) {
        this.$refs.vFormRef.hideWidgets(widgets)
      } else {
        this.$refs.vFormRef.showWidgets(widgets)
      }
    },
    rowClassName: function ({ row }) {
      if (row.hid) {
        return "hiddenTableRow";
      }
      return ''
    },
    handleSelectionChange(ids, single, multiple, row) {
      this.single = single
      this.multiple = multiple
      this.selection = row
    },
    handleChange() {
      const that = this
      function deep(arr) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i]['bomId'] == that.currentProcedureRow.bomId) {
            arr[i].rawList = that.currentProcedureRow.rawList
          }
          if (Array.isArray(arr[i].children) && !!arr[i].children.length) {
            deep(arr[i].children)
          }
        }
      }

      deep(this.productList)
    },
    handleTopButtonDisabled(button) {
      if (!this.selection.length && ["deletePlan"].includes(button.buttonCode)) {
        return true
      }
      if (!this.productList.length && ["refurbish"].includes(button.buttonCode)) {
        return true
      }
      if (['query'].includes(button.buttonCode) && !this.productList.length) {
        return true
      }
      if (['materQuery'].includes(button.buttonCode) && !this.currentProcedureRow.rawList.length) {
        return true
      }
      return this.selection.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
      return false
    },
    handleMaterSelectionChange(ids, single, multiple, row) {
      this.msingle = single
      this.mmultiple = multiple
      this.mselection = row
    },
    handleMaterTopButtonDisabled(button) {
      if (["choiceMaterial"].includes(button.buttonCode) && !this.currentProcedureRow.bomId) {
        return true
      }
      if (!this.mselection.length && ["deleteMaterial"].includes(button.buttonCode)) {
        return true
      }
      return this.mselection.some(row => this.handleMaterButtonDisable(button, row))
    },
    handleMaterButtonDisable(button, row) {
      return false
    },
    // 加载表格配置项
    async menuProperty(menuId, prop) {
      this.$store.dispatch('menuProperty', menuId).then(res => {
        if (prop === 'materialDatailProperty') {
          for (let i = 0; i < res.fields.length; i++) {
            if (["needDate"].includes(res.fields[i]['fieldCode'])) {
              res.fields[i]['listSlot'] = res.fields[i]['fieldCode']
            }
          }
        }
        if (prop === 'productDatailProperty') {
          for (let i = 0; i < res.fields.length; i++) {
            if (["sourceProjectCode"].includes(res.fields[i]['fieldCode'])) {
              res.fields[i]['listSlot'] = res.fields[i]['fieldCode']
            }
          }
        }
        this[prop] = res
      })
    },
    // 表单按钮权限设置
    buttonShow({ buttonCode, type }) {
      if (buttonCode === 'rollbackToPrevious') {
        const query = this.isDialog ? this.dialogQuery : this.$route.query
        return query.name === 'audit' && query.type === 'view' && Array.isArray(this.queryAuditArr)
          && this.queryAuditArr.length === 1 && !!this.queryAuditArr[0]?.taskId
          && this.buttonShow({ buttonCode: 'reject', type })
      }
      if (['saveSubmit'].includes(buttonCode) && ['3'].includes(this.status) || ['saveSubmit'].includes(buttonCode) && this.tableType == '2') {
        return false
      }
      if (type.includes(this.queryType) && ['saveSubmit'].includes(buttonCode) && !this.queryAuditArr) {
        return true
      }
      if (type.includes(this.queryType) && !['saveSubmit', 'edit'].includes(buttonCode)) {
        return true
      }
      if (['edit', 'saveSubmit'].includes(buttonCode) && (!['0', '1'].includes(this.status) || this.isQuery == 'query')) {
        return false
      }
      if (['saveSubmit'].includes(buttonCode) && ['0', '1'].includes(this.status)) {
        return true
      }
      if (['edit', 'saveSubmit'].includes(buttonCode) && ['0', '1'].includes(this.status) && this.queryType == 'view') {
        return true
      }
      if (type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(buttonCode))) {
        return true
      }

      return false
    },
    handleDetailedButtonShow(item) {
      if (['choicePlan'].includes(item.buttonCode) && this.queryName == 'demandPlanWorkbench') {
        return false
      }
      return true
    },
    // 加载初始化数据
    async init() {
      let { type, name, id, tableType = '1', auditArr, ids, planAttribute, isQuery = '', isChange = '' } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.isChange = isChange
      this.queryName = name
      this.tableType = tableType
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
      this.isQuery = isQuery

      this.$nextTick(async () => {
        this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true);
        this.$refs['vFormRef'].resetForm()
        await this.formFillInPage()
        if (this.tableType != '1') {
          this.$refs['vFormRef'].hideWidgets(['basecardform6767'])
        }
        this.menuProperty(menuConfig.MENU_PRODUCT_TABLE, 'productDatailProperty');
        this.menuProperty(menuConfig.MENU_PRODUCT_MATER_TABLE, 'materialDatailProperty');
        this.menuProperty(menuConfig.MENU_PRODUCT_PROCEDURE_TABLE, 'procedureDatailProperty');
        await this.getDeptTreeData()
        await this.getUnitTree()

        if (['update', 'view'].includes(this.queryType)) {
          this.getOperateDetail(id)
        } else {
          const { deptId, deptName, unitId, unitName, nickName, id: nickId } = this.userInfo
          this.$refs['vFormRef'].setFieldValue('ownerDeptId', deptId)
          this.$refs['vFormRef'].setFieldValue('ownerDeptName', deptName)
          this.$refs['vFormRef'].setFieldValue("unitId", unitId);
          this.$refs['vFormRef'].setFieldValue("unitName", unitName);

        }
        if (ids && this.queryName === 'demandPlanWorkbench') {
          const { data } = await produceQuoteListForOrder({ planAttribute, ids: ids.split(',') })
          this.treePropsFunc(data.list)
          const list = this.productList.concat(data.list)
          if (data.list.length > 0) {
            this.$refs['vFormRef'].setFieldValue("unitId", data.list[0].unitId);
            this.$refs['vFormRef'].setFieldValue("unitName", data.list[0].unitName);
          }
          this.setProductList([], list.length - 1, list)
        }
       
      })
    },
    treePropsFunc(list = []) {
      for (let item of list) {

        if ('children' in item && Array.isArray(item.children)) {
          this.treePropsFunc(item.children)
        }
      }
    },
    // 加载表单配置项
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('productionOrder').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)

          resolve(true)
        })
      })
    },
    // 加载部门数据

    async getDeptTreeData() {
      const res = await deptTree({ bizStatus: '1' })
      this.$refs['vFormRef'].getWidgetRef('ownerDeptId').loadOptions(res.data || [])
    },
    async getUnitTree() {
      const res = await getUnitTree({ status: 0 })
      this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
    },
    // 加载详情数据
    async getOperateDetail(id) {
      try {
        this.loading = true
          let req = this.tableType == '2' ? orderRawDetail : detail
        if(this.queryName === 'productionChange') {
          req = historyDetail
        }
      
        const { data } = await req(id)
        if (this.tableType == '2') {
          function deep(arr) {
            for (let j = 0; j < arr.length; j++) {
              if (Array.isArray(arr[j].children) && !!arr[j].children.length) {
                deep(arr[j].children)
              }
            }
          }
          deep(data)
          const arr = deepTreeAddField(data)
          this.setProductList(arr)
        } else {
          const { rawList = [], fileList = [], ...form } = data
          this.status = form.status;
          this.$refs['vFormRef'].setFormData({ ...form });
          function deep(arr) {
            for (let j = 0; j < arr.length; j++) {

              if (Array.isArray(arr[j].children) && !!arr[j].children.length) {
                deep(arr[j].children)
              }
            }
          }
          deep(rawList)
          const arr = deepTreeAddField(rawList)
          this.updateMatlInvByUnit(this.unitId, arr, '1', 'inventoryNum', 'children')
          this.setProductList(arr)
          this.fileList = !!fileList.length ? fileList.map(f => ({ ...f, uid: generateUUID() })) : []
        }

      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleCurrentChange(row, index) {
      this.currentProcedureRow = { ...row, rawList: row && Array.isArray(row.rawList) ? row.rawList.map((item, idx) => ({ ...item, rawNo: idx, needDate: item.needDate || '', needNum: item.needNum || 1, uid: item.uid || generateUUID() })) : [] }
      this.loadProcessList(this.currentProcedureRow)
    },
    handleTabClick({ index }) {
      if (index == '1') {
        this.loadProcessList(this.currentProcedureRow)
      }
    },
    // 表单追加按钮事件处理器
    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
      if (name === 'projectCode') {
        this.$refs.selectProject.open();
        return
      }
    },
    // 表单字段改变事件处理器
    handleFormChange(fieldName, newValue, oldValue) {
      if (fieldName == 'unitId' && newValue != oldValue) {
        this.unitId = newValue
        this.productList = []
      }
    },
    // 表格按钮事件处理器
    handleTableButton(buttonCode, _1, _2, _3, row) {
      if (buttonCode === 'choiceMaterial') {
        //  选择物料
        const arr = this.currentProcedureRow.rawList
        this.$refs.choiceMaterial.init(null, [], arr);
      } else if (buttonCode === 'deleteMaterial') {
        // 删除物料
        const msel = !!_2.length ? _2.map(({ uid }) => uid) : this.mselection.map(({ uid }) => uid)
        this.currentProcedureRow.rawList = this.currentProcedureRow.rawList.filter(item => !msel.includes(item.uid)).map((item, idx) => ({ ...item, rawNo: idx }))
      } else if (buttonCode === 'choicePlan') {
        // 选择生产
        // TODO 数据源过滤出生产
        if (!this.unitId) {
          this.$modal.msgError('请先选择所属组织')
          return
        }
        this.$refs.choicePlan.init(null, [], this.productList);
      } else if (buttonCode === 'deletePlan') {
        // 删除生产
        let idx = 0
        const sel = !!_2.length ? _2.map(({ uid }) => uid) : this.selection.map(({ uid }) => uid)
        function deepDel(arr) {
          return arr.filter((item) => {
            if (Array.isArray(item.children) && !!item.children.length) {
              item.children = deepDel(item.children)
            }
            if (sel.includes(item.uid)) {
              return false
            }
            return true
          })
        }
        const nextProductList = deepDel(this.productList)

        this.setProductList([], idx < 0 ? 0 : idx, nextProductList)
      } else if (buttonCode === 'choiceBom') {
        // 选择BOM
        // TODO 数据源过滤出BOM
        if (!this.unitId) {
          this.$modal.msgError('请先选择所属组织')
          return
        }
        this.$refs.choiceBom.init(null, this.productList);
      } else if (buttonCode === 'refurbish') {
        this.handleRefurbish()
        // 子件刷新
      } else if (buttonCode === 'query') {
        // 库存查询
        this.handleProductQuery()
      } else if (buttonCode === 'materQuery') {
        // 存量查询
        this.handleMatlQuery()
      }
    },
    async handleRefurbish(flag = true) {
      const loading = this.$loading({
        lock: true,
        text: '子件刷新中',
        spinner: 'el-icon-loading',
      });
      await this.loadExpandForOrdersNum()
      loading.close();
    },
    treePropsDateFunc(list = []) {
      for (let item of list) {
        if ('rawList' in item && Array.isArray(item.rawList)) {
          for (let ii of item.rawList) {
            if (ii.needDate) {
              ii.needDate = dayjs(ii.needDate).format('YYYY-MM-DD')
            }
          }

        }

        if ('children' in item && Array.isArray(item.children)) {
          this.treePropsDateFunc(item.children)
        }
      }
    },
    async loadExpandForOrdersNum() {
      try {
        const arr = [...this.productList]
        this.treePropsDateFunc(arr)
        const { data } = await expandForOrdersNum(arr)
        this.setProductList([], 0, data)
        this.$nextTick(() => {
          this.$refs.procedureTableIndex.setCurrentRow(data[0]);
        })

      } catch (err) {
        console.error(err)
        this.$modal.msgError(err.message);
      }


    },
    async handleProductQuery() {
      let loading
      try {
        loading = this.$loading({
          lock: true,
          text: '库存查询中',
          spinner: 'el-icon-loading',
        });

        this.updateMatlInvByUnit(this.unitId, this.productList, '1', 'inventoryNum', 'children')
        this.$modal.msgSuccess("库存查询成功");
      } catch (err) {
        console.error(err)
        this.$modal.msgError(err.message);
      } finally {
        loading.close();
      }

    },
    async handleMatlQuery() {
      let loading
      try {
        loading = this.$loading({
          lock: true,
          text: '存量查询中',
          spinner: 'el-icon-loading',
        });
        this.currentProcedureRow.rawList = [...this.currentProcedureRow.rawList.map((item, idx) => ({ ...item, rawNo: idx }))]

        this.updateMatlInvByUnit(this.unitId, this.currentProcedureRow.rawList, '1', 'inventoryNum')
        this.$modal.msgSuccess("存量查询成功");
      } catch (err) {
        console.error(err)
        this.$modal.msgError(err.message);
      } finally {
        loading.close();
      }

    },
    clickLink(row, code) {
      const linkConfig = {
        sourceCode: { refName: { 1: 'saleOrderOperate', 2: 'preOperate', 3: 'selfResearchDemandOperate' }[row.sourceType], id: row.sourceId },
        cuCode: { refName: 'customerProfileAdd', id: row.cuId },
        sourcePlanCode: { refName: 'demandPlanWorkbenchOperate', id: row.sourcePlanId },
        sourceProjectCode: { refName: 'projectManagementOperate', id: row.sourceProjectId },
        matlCode: { refName: 'materialArchivesOperate', matlCode: row.matlCode },
        bomCode: { refName: 'bomAdministrationOperate', id: row.bomId },
        bomVersion: { refName: 'bomAdministrationOperate', id: row.bomId },
        pathCode: { refName: 'processRouteOperate', id: row.pathId },
        pathVersion: { refName: 'processRouteOperate', id: row.pathId },
        processCode: { refName: 'standardProcessCreate', id: row.processId },
      }[code]
      if (!!linkConfig) {
        this.clickRouterInDialog(this.$refs.detailDialogRef, linkConfig)
      }
    },
    // 物料选择事件
    async handleConfirmMaterial(data = []) {
     
      const { orderId, orderRawId } = this.currentProcedureRow
      const arr = data.map(item => ({ ...item, needDate: item.needDate || undefined, needNum: item.needNum || 1, uid: generateUUID(), orderId: orderId, orderRawId: orderRawId }))
      this.currentProcedureRow.rawList = this.currentProcedureRow.rawList.concat(arr).map((item, idx) => ({ ...item, rawNo: idx }))
      for (let i = 0; i < this.productList.length; i++) {
        if (this.productList[i]['uid'] === this.currentProcedureRow['uid']) {
          break
        }
      }
    },
    // 计划选择事件
    async handleConfirmPlan(data = []) {
      this.treePropsFunc(data)
      const list = this.productList.concat(data)
      this.setProductList([], list.length - 1, list)
    },
    // BOM选择事件
    async handleConfirmBom(data = []) {
      const arr = data.map(item => ({
        ...item,
        uid: generateUUID(),
        planStartDate: '',
        planEndDate: '',
      }))
      const { data: matl } = await expandBom(data.map(({ bomId }) => bomId))
      this.updateMatlInvByUnit(this.unitId, matl, '1', 'inventoryNum', 'children')
      const list = this.productList.concat(matl)
      this.setProductList([], list.length - 1, list)
    },
    setProductList(arr, idx = 0, list = undefined) {
      const productList = Array.isArray(list) ? list : this.productList.concat(arr)
      for (let u = 0; u < productList.length; u++) {
        productList[u]['mLevel'] = 0
        productList[u]['uid'] = generateUUID(),
          productList[u]['rawList'] = Array.isArray(productList[u].rawList) && productList[u].rawList.length ? productList[u].rawList.map(item => ({ ...item, uid: generateUUID(), needNum: item.needNum || 1 })) : []
      }
      if (!!productList.length && !this.$refs.procedureTableIndex.selection.length) {
        if (productList[idx]) {
          this.updateMatlInvByUnit(this.unitId, productList[idx]['rawList'], '1', 'inventoryNum', 'children')
          this.$nextTick(() => {
            this.$refs.procedureTableIndex.setCurrentRow({ ...productList[idx] });
            this.$set(this.currentProcedureRow, 'rawList', [...productList[idx]['rawList']])
          })

        }
      } else {
        this.$refs.procedureTableIndex.setCurrentRow();
        this.currentProcedureRow = { rawList: [] }
        this.selection = []
      }
      this.$nextTick(() => {
        this.productList = productList
      })

      this.loadProcessList(this.currentProcedureRow)
    },
    // 顶部按钮事件处理器
    handleButton(buttonCode) {
      if (buttonCode === 'rollbackToPrevious') {
        this.$refs.toBereview.init('rollbackToPrevious', this.queryAuditArr, this.queryName || this.name)
        return
      }
      switch (buttonCode) {
        case 'edit':
          this.queryType = 'update';
          this.$refs['vFormRef'].setReadMode(false);
          break;
        case 'cancel':
          this.handleCancel()
          break;
        case 'pass':
        case 'reject':
          this.$refs.toBereview.init(buttonCode, this.queryAuditArr, this.queryName)
          break;
        case 'save':
        case 'saveSubmit':
          this.handleSave(buttonCode)
          break;
        default:
      }
    },
    // 加载工序信息
    async loadProcessList(row) {
      try {
        const { matlCode, bomId } = row
        if (!bomId) {
          this.procedureList = []
          return
        }

        const { data } = await detailByBomOrMatl({ bomId, matlCode })
        if (data && data[0] && data[0].rawList) {
          this.procedureList = data[0].rawList
        } else {
          this.procedureList = []
        }
      } catch (err) {
        console.error(err)
      }

    },
    // 取消事件处理器

    handleCancel() {
      this.$tab.closeOpenPage({ name: this.queryName })
    },
    validateForm(formRef) {
      return new Promise((resolve) => {
        this.$refs[formRef].validateForm((valid) => {
          resolve(valid)
        })
      })
    },
    // 保存事件处理器
    async handleSave(buttonCode) {
      try {
        let api = saveCreate
        const formValid = await this.validateForm('vFormRef')
        if (!formValid) {
          this.$modal.msgError('基本信息必填项不能为空')
          return
        }
        let flag = ''
        if (flag) {
          this.$modal.msgError(flag)
          return
        }
        await this.loadExpandForOrdersNum()
        this.loading = true
        const formData = await this.$refs.vFormRef.getFormData()
        const arr = Array.isArray(this.productList) ? this.productList : []
        // function deep(arr) {
        //   for (let j = 0; j < arr.length; j++) {
        //     arr[j]['planNum'] = arr[j]['needNum']
        //     if (Array.isArray(arr[j].children) && !!arr[j].children.length) {
        //       deep(arr[j].children)
        //     }
        //   }
        // }
        // deep(arr)
        if (!arr.length) {
          this.$modal.msgError('产品信息不能为空')
          return
        }
        const param = {
          ...formData,
          fileList: this.fileList,
          rawList: arr
        }
        if (formData.orderId) {
          api = saveModify
        }
        const saveObj = {
          'save': () => { this.saveOrder(api, param) },
          'saveSubmit': () => {
            this.$reviewerDialog({
              type: ACTIVITI_ASSUGNEE.MM_ORDER,
              multiple: false,
              success: (assignee) => {
                this.saveOrder(saveSubmit, param, assignee)
              }
            })
          }
        }
        saveObj[buttonCode] && saveObj[buttonCode]()
      } catch (err) {
        this.$modal.msgError(`${err.message}`)
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async saveOrder(url, param, assignee) {
      if (!this.resOk) {
        const res = await url({ ...param, assignee })
        res.success && this.$modal.msgSuccess(`${res.message}`)
        this.resOk = true
        this.handleCancel()
      }
    },
    // tree组件改变事件
    async treeSelectSelect(vm, node) {
      let {
        field: {
          options: { name }
        }
      } = vm || {}
      // 部门改变
      if (name === 'ownerDeptId') {
        this.$refs.vFormRef.setFieldValue('ownerDeptName', node.deptName)
      }
      if (name === 'unitId') {
        this.$refs.vFormRef.setFieldValue('unitName', node.deptName)
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.container_flex_form {
  position: relative;

  .checkbox {
    position: absolute;
    z-index: 1000;
    left: 160px;
    color: #fff;
    top: 16px
  }

  ::v-deep .el-checkbox__input.is-checked+.el-checkbox__label {
    color: #fff
  }
}

.slotIcon-color-content {
  color: red
}

.slotIcon-color {
  color: #1890ff;
}
</style>