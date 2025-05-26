<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
      @newButton="handleButton"></button-top>
    <div class="container_flex_form">

      <el-switch v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
      </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv"
        :class="{ 'formRender_view': queryType === 'view' }" @appendButtonClick="handleAppendButtonClick"
        @formChange="handleFormChange" @treeSelectSelect="treeSelectSelect">
        <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
            <attachmentTable businessType="49" ref="attachmentTable" :queryType="queryType" v-model="fileList">
            </attachmentTable>
          </div>
        </template>
        <template slot="product">
          <button-top :button-disable="handleTopButtonDisabled"
            v-if="productDatailProperty.buttonTop && queryType != 'view'"
            :buttonTopData="productDatailProperty.buttonTop" :multiple="multiple" :single="single"
            @newButton="handleTableButton" :buttonShow="handleDetailedButtonShow" />
          <p-table :queryType="queryType" :tableList="productList"></p-table>
        </template>
        <template slot="other">

          <el-tabs v-model="activeOtherName" @tab-click="handleTabClick">
            <el-tab-pane label="材料信息" name="material" lazy>
              <button-top v-if="materialDatailProperty.buttonTop && queryType != 'view'"
                :button-disable="handleMaterTopButtonDisabled" :buttonTopData="materialDatailProperty.buttonTop"
                @newButton="handleTableButton" :showDropdown="false" :multiple="mmultiple" :single="msingle" />
              <table-index numberShow ref="matertableIndex" :visibleAction="queryType != 'view'"
                :tableData="productList[0] ? productList[0].matlList : []" :property="materialDatailProperty"
                @handleButton="handleTableButton" idName="uid" @handleSelectionChange="handleMaterSelectionChange"
                @clickLink="clickLink">
                <template slot="rawNo" slot-scope="scope">
                  {{ scope.$index + 1 }}
                </template>
                <template slot="needNum" slot-scope="scope">
                  <el-input-number v-columnFormat="{
                    index: scope.$index,
                    prop: 'needNum',
                    list: productList[0].matlList
                  }" @input="(v) => scope.data.needNum = v" v-if="queryType != 'view'" v-model="scope.data.needNum"
                    :min="0" controls-position="right" style="width: 100%"></el-input-number>
                  <span v-else>{{ scope.data.needNum || '' }}</span>

                </template>
                <template slot="needDate" slot-scope="scope">
                  <el-date-picker v-columnFormat="{
                    index: scope.$index,
                    prop: 'needDate',
                    list: productList[0].matlList
                  }" @input="(v) => scope.data.needDate = v" style="width: 100%;" v-if="queryType != 'view'"
                    v-model="scope.data.needDate" />
                  <span v-else>{{ parseTime(scope.data.needDate, '{y}-{m}-{d}') }}</span>
                </template>
              </table-index>
            </el-tab-pane>
            <el-tab-pane label="工序信息" name="procedure" lazy>
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
    <toBeReviewed ref="toBereview" />
    <detail-dialog ref="detailDialogRef" />
    <choice-product ref="choiceProductRef" singleMode @confirm="handleProductConfirm"
      :propsFormData="{ unitId: unitId }" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import choiceProduct from './product.vue'
import attachmentTable from '@/views/components/attachmentTable'
import choiceMaterial from '@/views/components/choice-material'


import indexMixin from '@/views/mixins';
import { formFillInPage } from '@/api/form/form'

import { deptTree, getUnitTree } from '@/api/system/dept'
import { saveSubmit, save, detail } from '@/api/projectManagement/productionChange';
import { expandBom, expandForOrdersNum, orderRawDetail } from '@/api/projectManagement/productionOrder'
import { getUserInfo } from '@/utils/user-info'
import { getToken } from '@/utils/auth'
import { menuConfig, generateUUID, deepTreeAddField } from '@/utils'
import { detailByBomOrMatl } from '@/api/prodmgr-mm/processRoute'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import { produceQuoteListForOrder } from '@/api/prodmgr-mm/demandPlan'

import pTable from './ptable.vue'
import VFormRender from '@/components/form-render/index'
import dayjs from 'dayjs'
export default {
  name: 'productionChangeOperate',
  dicts: ['planAttribute', 'processType', 'YesNo', 'orderInStatus', 'PICKING', 'demandPlanSourceType', 'FINASGH', 'MeasureUnit'],
  components: {
    pTable,
    choiceProduct,
    choiceMaterial,
    attachmentTable,
    toBeReviewed,
    VFormRender,
    DetailDialog: () => import('@/views/components/DetailDialog'),
  },
  mixins: [indexMixin],
  data() {
    return {
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
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
        { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
        { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'update, create' }
      ],
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: '01'
      },
      userInfo: getUserInfo(),
      activeOtherName: 'material',
      productDatailProperty: {

        buttonTop: [
          {
            buttonCode: 'query',
            buttonName: '存量查询'
          },
          {
            buttonCode: 'refurbish',
            buttonName: '子件刷新'
          }
        ]
      },
      materialDatailProperty: {}, // MENU_PRODUCT_MATER_TABLE
      procedureDatailProperty: {},// MENU_PRODUCT_PROCEDURE_TABLE
      fileList: [],
      productList: [],
      materialList: [],
      procedureList: [],
      multiple: true,
      single: true,
      selection: [],
      mmultiple: true,
      msingle: true,
      mselection: [],
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
    handleProductConfirm(row) {
      const nextRows = [{ ...row }]
      this.$refs['vFormRef'].setFieldValue("orderRawCode", row.orderRawCode);
      this.$refs['vFormRef'].setFieldValue("orderRawId", row.orderRawId);
      this.updateMatlInvByUnit(this.unitId, nextRows, '1', 'inventoryNum')
      const matlList = [...row.rawList].map(item => ({ ...item, uid: generateUUID() }))
      this.updateMatlInvByUnit(this.unitId, matlList, '1', 'inventoryNum', 'rawList')
      nextRows[0].matlList = matlList
      this.productList = nextRows
      if (this.activeOtherName == 'procedure') {
        this.loadProcessList()
      }
    },


    checkoutStatus(flag) {
      const widgets = ['changeCode', 'changeName', 'notes', 'fileList']
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
      if (['materQuery'].includes(button.buttonCode) && !this.currentProcedureRow.matlList.length) {
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
              res.fields[i]['fieldWidth'] = '200px'
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
      if (['saveSubmit'].includes(buttonCode) && ['3'].includes(this.status)) {
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
      let { type, name, id, auditArr, ids, planAttribute, isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryName = name
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
      this.isQuery = isQuery
      await this.formFillInPage()
      this.$nextTick(async () => {
        this.$refs['vFormRef'].resetForm()
        this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true);
        this.menuProperty(menuConfig.MENU_PRODUCT_MATER_TABLE, 'materialDatailProperty');

        await this.getUnitTree()
        if (['update', 'view'].includes(this.queryType)) {
          this.getOperateDetail(id)
        } else {
          const { deptId, deptName, unitId, unitName, nickName, id: nickId } = this.userInfo
          this.$refs['vFormRef'].setFieldValue('ownerDeptId', deptId)
          this.$refs['vFormRef'].setFieldValue('ownerDeptName', deptName)
          this.$refs['vFormRef'].setFieldValue("unitId", unitId);
          this.$refs['vFormRef'].setFieldValue("unitName", unitName);
          this.unitId = unitId
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
        formFillInPage('productionChange').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)

          resolve(true)
        })
      })
    },
    async getUnitTree() {
      const res = await getUnitTree({ status: 0 })
      this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
    },
    // 加载详情数据
    async getOperateDetail(id) {
      try {
        this.loading = true
        const { data } = await detail(id)
        const { rawList = [], fileList = [], ...form } = data
        this.status = form.status;
        this.unitId = form.unitId
        this.$refs['vFormRef'].setFormData({ ...form });
        this.updateMatlInvByUnit(this.unitId, rawList, '1', 'inventoryNum', 'rawList')
        this.fileList = !!fileList.length ? fileList.map(f => ({ ...f, uid: generateUUID() })) : []
        this.$nextTick(() => {
          this.productList = rawList
        })
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    handleTabClick({ index }) {
      if (index == '1') {
        this.$nextTick(() => {
          this.loadProcessList()
        })

      }
    },
    // 表单追加按钮事件处理器
    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
      if (name === 'orderRawCode') {
        this.$refs.choiceProductRef.init()
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
        const arr = this.productList[0] ? this.productList[0].matlList : []
        this.$refs.choiceMaterial.init(null, [], arr);
      } else if (buttonCode === 'deleteMaterial') {
        // 删除物料
        const msel = !!_2.length ? _2.map(({ uid }) => uid) : this.mselection.map(({ uid }) => uid)
        this.productList[0].matlList = this.productList[0].matlList.filter(item => !msel.includes(item.uid)).map((item, idx) => ({ ...item, rawNo: idx }))
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
        if ('matlList' in item && Array.isArray(item.matlList)) {
          for (let ii of item.matlList) {
            if (ii.needDate) {
              ii.needDate = dayjs(ii.needDate).format('YYYY-MM-DD')
            }
          }
        }
      }
    },
    async loadExpandForOrdersNum() {
      try {
        const arr = [...this.productList]
        this.treePropsDateFunc(arr)
        const { data } = await expandForOrdersNum(arr)
        const matlList = [...data[0].rawList].map(item => ({ ...item, uid: generateUUID() }))
        this.updateMatlInvByUnit(this.unitId, matlList, '1', 'inventoryNum', 'rawList')
        data[0].matlList = matlList
        this.productList = data
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
        this.productList[0].matlList = [...this.productList[0].matlList.map((item, idx) => ({ ...item, rawNo: idx }))]

        this.updateMatlInvByUnit(this.unitId, this.productList[0].matlList, '1', 'inventoryNum')
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
    async handleConfirmMaterial(list = []) {
      const matlList = [...this.productList[0].matlList].concat(list)
      this.$set(this.productList, 0, { ...this.productList[0], matlList: matlList })
    },
    // 顶部按钮事件处理器
    handleButton(buttonCode) {
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
    async loadProcessList() {
      try {
        if (!this.productList[0] || !this.productList[0].bomId) {
          this.procedureList = []
          return
        }
        this.menuProperty(menuConfig.MENU_PRODUCT_PROCEDURE_TABLE, 'procedureDatailProperty');
        const { matlCode, bomId } = this.productList[0]
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
        let api = save
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
        this.loading = true
        const formData = await this.$refs.vFormRef.getFormData()
        const arr = Array.isArray(this.productList) ? this.productList : []
        if (!arr.length) {
          this.$modal.msgError('产品信息不能为空')
          return
        }
        const param = {
          ...formData,
          fileList: this.fileList,
          rawList: arr
        }
        const saveObj = {
          'save': () => { this.saveOrder(api, param) },
          'saveSubmit': () => {
            this.$reviewerDialog({
              type: ACTIVITI_ASSUGNEE.MM_SCBG,
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