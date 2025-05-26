<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
      @newButton="newButton"></button-top>
    <div class="container_flex_form">
      <el-switch v-if="!isDialog" v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
      </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv" @selectChange="selectChange" :class="{'formRender_view': queryType === 'view'}"
        @treeSelectSelect="treeSelectSelect">
        <template slot="design_p1">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />基本信息</p>
        </template>
        <template slot="design_p2">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="财务信息" />财务信息</p>
        </template>
        <template slot="detailed">
          <el-tabs v-model="activeTabName" :key="queryType">
            <el-tab-pane label="合同信息" name="contract" key="contract">
              <div class="detailed">
                <button-top v-if="queryType !== 'view'" :buttonTopData="contractButtonTop"
                  :buttonShow="handleDetailedButtonShow" @newButton="handleDetailedNewButton" :button-disable="handleTopButtonDisabled"></button-top>
              </div>
              <div>
                <el-table ref="contractList" border :data="contractList"
                  class="mt-20 saleOrderOperateEltable" row-key="ctId"
                  @selection-change="handleContractSelectionChange">
                  <el-table-column v-if="queryType !== 'view'" type="selection" align="center"
                    width="55"></el-table-column>
                  <el-table-column type="index" width="50" align="center" label="序号" />
                  <el-table-column label="合同编号" align="left" prop="ctCode"></el-table-column>
                  <el-table-column label="合同名称" align="left" prop="ctName"></el-table-column>
                  <el-table-column label="合同类型" align="left" prop="ctType">
                    <template slot-scope="scope">
                      {{ contractType[scope.row.ctType] }}
                    </template>
                  </el-table-column>
                  <el-table-column v-if="queryType !== 'view'" label="操作" align="center" fixed="right">
                    <template slot-scope="scope">
                      <el-link type="primary" @click="handleContractDel(scope.$index)">删行</el-link>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
            <el-tab-pane label="附件信息" name="file" key="file">
              <div style="display: flex;flex-direction: column;">
                <attachmentTable  ref="attachmentTable" :queryType="queryType" businessType="07"
                  v-model="fileList">
                </attachmentTable>
              </div>
            </el-tab-pane>
          </el-tabs>
        </template>
      </VFormRender>
    </div>
    <selectContract ref="contract" :filterCondition="filterCondition" @selections="handleContract">
    </selectContract>
    <activiti-assignee ref="activitiAssignee" @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
    <toBeReviewed ref="toBereview"/>
  </div>
</template>

<script>
import moment from 'moment'
import { getChildListByParentId } from '@/api/system/dict'
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import selectContract from '@/views/components/selectContract'
import attachmentTable from '@/views/components/attachmentTable'
import { generateUUID } from '@/utils'
import { deptTree,getUnitTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import { getUserInfo } from '@/utils/user-info'
import indexMixin from '@/views/mixins'
import { projectSave, projectDetail, projectSaveSubmit } from '@/api/projectManagement/projectManager'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
export default {
  name: 'projectManagementOperate',
  dicts: ['MeasureUnit'],
  mixins: [indexMixin],
  components: {
    selectContract,
    attachmentTable,
    activitiAssignee,
    toBeReviewed,
    VFormRender
  },
  data() {
    return {
      userInfo: getUserInfo(),
      activeTabName: 'contract',
      loading: false,
      type: '',
      queryId: '',
      queryName: '',
      queryType: '',
      formJson: {},
      formData: {
      },
      status: '',
      fileList: [],
      // 菜单按钮、字段等数据
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
        { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
        { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
        { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'view, update' }
      ],
      queryAuditArr: null,
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: '01'
      },
      filterCondition: {
        isProjectQuery: '1',
        viewProjectId: '',
        isProject: '1',
        status: '1',
      },
      contractButtonTop: [
        { buttonName: '选择合同', buttonCode: 'selectContract' },
        { buttonName: '删除', buttonCode: 'removeContract' },
      ],
      contractList: [],
      contractSelected: [],
      contractType: {},
      checked: false,
      isQuery: ''
    }
  },
  computed: {
    ...mapGetters(['infoData'])
  },
  created() {
    this.init()
    this.loadContractDict()
  },
  methods: {
    handleTopButtonDisabled(button) {
      if(button.buttonCode == 'removeContract') {
        return  !this.contractSelected.length
      }
      return false
    },
    checkoutStatus() {
      if (this.checked) {
        this.$refs['vFormRef'].hideWidgets(['comments', 'projectCode', 'maintenanceDateStart', 'maintenanceDateEnd']);
      } else {
        this.$refs['vFormRef'].showWidgets(['comments', 'projectCode', 'maintenanceDateStart', 'maintenanceDateEnd']);
      }
    },
    // 合同字典数据
    async loadContractDict() {
      const { data } = await getChildListByParentId({ parentId: '1813744668839989248' })
      for (let i = 0; i < data.length; i++) {
        const { code, name } = data[i]
        this.contractType[code] = name
      }
    },
    // 选择合同
    handleContract(rows = []) {
      this.contractList = this.contractList.concat(rows)
    },
    // 根据指定的索引删除合同条目
    handleContractDel(idx) {
      
      this.contractList.splice(idx, 1)
    },

    // 合同信息批量选择
    handleContractSelectionChange(arr) {
      this.contractSelected = arr
    },

    // 批量删除合同
    handleContractBranchDel() {
      const ids = this.contractSelected.map(({ ctId }) => ctId)
      this.contractList = this.contractList.filter(({ ctId }) => !ids.includes(ctId))
      this.$refs.contractList.clearSelection();
    },
    // 保存
    async handleSave(buttonCode) {
      try {
        let formValid = false
        this.$refs.vFormRef.validateForm((validate) => {
          formValid = validate
        })
        if (!formValid) {
          return
        }
        const formData = await this.$refs.vFormRef.getFormData()
        // if (!this.contractList.length) {
        //   this.$modal.msgError('合同信息不能为空')
        //   return
        // }
        const param = {
          ...formData,
          projectEndDate: moment(formData.projectEndDate).format('YYYY-MM-DD'),
          projectStartDate: moment(formData.projectStartDate).format('YYYY-MM-DD'),
          contractList: this.contractList,
          fileList: this.fileList
        }
        if (this.queryType == 'update') {
          param.id = this.queryId
        }

        const saveObj = {
          'save': () => { this.saveOrder(projectSave, param) },
          'saveSubmit': () => {
            this.$reviewerDialog({
              type: ACTIVITI_ASSUGNEE.PU_PROJECT,
              multiple: false,
              success: (assignee) => {
                this.saveOrder(projectSaveSubmit, param, assignee)
              }
            })
          }
        }
        saveObj[buttonCode] && saveObj[buttonCode]()
      } catch (err) {
        this.$modal.msgError(err.message);
        console.error(err)
      }
    },
    async saveOrder(url, param, assignee) {
      if(!this.resOk) {
      const res = await url({ ...param, assignee })
      res.success && this.$modal.msgSuccess(`${res.message}`)
      this.resOk = true
      this.cancel()
      }
    },
    // 顶部按钮权限
    buttonShow(item) {
      if (['saveSubmit'].includes(item.buttonCode) && this.queryType == 'create') {
        return true
      }
      if (['saveSubmit', 'edit'].includes(item.buttonCode) && !['0', '1'].includes(this.formData.status)) {
        return false
      }
      if (['saveSubmit', 'edit'].includes(item.buttonCode) && (this.queryName == 'toBeDeal' || this.isQuery == 'query')) {
        return false
      }
      if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
        return true
      } else {
        return false
      }
    },
    // 初始化操作
    init() {
      let { type, name, id, auditArr = '', isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryName = name || 'projectManager'
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
      this.isQuery = isQuery
      this.$nextTick(async () => {
        this.$refs['vFormRef'].resetForm()
        await this.formFillInPage()
        await this.getDeptData()
        await this.getUnitTree()
        if (['update', 'view'].includes(this.queryType)) {
          this.loadDetail()
        } else {
          this.initFormData()
          this.initUnitInfo()
        }
      })
    },
    // 初始化表单数据
    async initFormData() {
      const { deptId, deptName, nickName, id: nickId } = this.userInfo
      await this.getUserListAll(deptId)
      this.$refs['vFormRef'].setFieldValue('approvalDeptId', deptId)
      this.$refs['vFormRef'].setFieldValue('approvalDeptName', deptName)
      this.$refs['vFormRef'].setFieldValue('directorId', nickId)
      this.$refs['vFormRef'].setFieldValue('directorName', nickName)
    },
    // 加载表单数据
    async formFillInPage() {
      try {
        const { data } = await formFillInPage('projectManagerOperate')
        this.$refs['vFormRef'].setFormJson(data)
      } catch (err) {
        console.error(err)
      }
    },
    // 加载详情数据
    async loadDetail() {
      this.loading = true
      const { data } = await projectDetail(this.queryId)
      this.formData = data
      this.formData.maintenanceDateStart = this.parseTime(this.formData.maintenanceDateStart,'{y}-{m}-{d}')
      this.formData.maintenanceDateEnd = this.parseTime(this.formData.maintenanceDateEnd,'{y}-{m}-{d}')
      this.status = data.status
      await this.getUserListAll(data.approvalDeptId)
      this.contractList = data.contractList || []
      this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
      this.$refs.vFormRef.setFormData(data)
      if (this.queryType === 'view') {
        this.$refs['vFormRef'].setReadMode(true)
      }
    },
    // 顶部按钮事件
    newButton(buttonCode) {
      if (buttonCode === 'cancel') {
        this.cancel(this.queryName)
      } else if (buttonCode === 'save') {
        this.handleSave(buttonCode)
      } else if (buttonCode === 'edit') {
        this.queryType = 'update'
        this.$refs['vFormRef'].setReadMode(false)
      } else if (buttonCode === 'saveSubmit') {
        this.handleSave(buttonCode)
      } else if (buttonCode === 'pass') {
        this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName);
        return
      } else if (buttonCode === 'reject') {
        this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName);
      }

    },
    cancel(name) {
      this.$tab.closeOpenPage({ name })
    },
    // 组件选择事件
    selectChange(fieldName, newValue) {
      if (fieldName === 'directorId') {
        if (newValue) {
          const optionLabel = this.$refs['vFormRef'].getWidgetRef('directorId').optionLabel

          this.$refs['vFormRef'].setFieldValue('directorName', optionLabel)
        } else {
          this.$refs['vFormRef'].setFieldValue('directorName', '')
        }
      }
    },
    // tree组件选择事件
    async treeSelectSelect(vm, node) {
      let {
        field: {
          options: { name }
        }
      } = vm || {}
      if (name === 'approvalDeptId') {
        this.$refs['vFormRef'].setFieldValue('directorId', '')
        this.$refs['vFormRef'].setFieldValue('directorName', '')
        this.$refs.vFormRef.setFieldValue('approvalDeptName', node.deptName)
        this.getUserListAll(node.id)
      }
      if (name === 'unitId') {
        this.$refs.vFormRef.setFieldValue('unitName', node.deptName);
        this.contractList = [];
      }
    },
    //提交事件
    async submitList() {
      try {
        const param = {
          ids: [this.formData.id],
        }
        const { success, message } = await projectSubmit(param)
        if (success) {
          this.$modal.msgSuccess('提交成功')
          this.cancel(this.queryName)
        } else {
          this.$modal.msgError(message)
        }
      } catch (err) {
        this.$modal.msgError(res.message)
      }
    },
    // 明细按钮权限
    handleDetailedButtonShow() {
      return true
    },
    // 明细按钮事件处理器
    handleDetailedNewButton(buttonCode) {
      if (buttonCode === 'selectContract') {
        const unitId = this.$refs.vFormRef.getFieldValue("unitId");
        if(!unitId){
          this.$modal.msgError('请先选择所属组织')
          return
        }
        this.filterCondition.unitId = unitId
        const projectType = this.$refs['vFormRef'].getFieldValue('projectType')
        const projectId = this.$refs['vFormRef'].getFieldValue('id')
        if (!projectType) {
          this.$modal.msgError('请先选择项目类别')
          return
        }
        this.filterCondition.viewProjectId = projectId
        this.$refs.contract.init(null, [...this.contractList], projectType);
      } else if (buttonCode === 'removeContract') {
        this.handleContractBranchDel()
      }
    },
    async getUnitTree() {
      const res = await getUnitTree({ status: 0 })
      this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
    },
    // 加载部门
    async getDeptData() {
      const res = await deptTree({ bizStatus: '1' })
      this.$refs['vFormRef'].getWidgetRef('approvalDeptId').loadOptions(res.data || [])

    },
    // 加载人员
    async getUserListAll(deptId) {
      const res = await userListAll({ deptId })
      this.$refs['vFormRef'].getWidgetRef('directorId').loadOptions(res.data.list || [])
    },
  }
}
</script>
<style lang="scss" scoped>
.ml-20 {
  margin-left: 20px !important;
}

.mt-20 {
  margin-top: 20px !important;
}
</style>
