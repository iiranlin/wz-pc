<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
      @newButton="handleButton"></button-top>
    <div class="container_flex_form">

      <el-switch v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
      </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv"
        :class="{ 'formRender_view': queryType === 'view' }" @appendButtonClick="handleAppendButtonClick"
        @selectChange="handleSelectChange" @treeSelectSelect="treeSelectSelect" @formChange="handleFormChange">
        <template slot="dividerOut">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="项目信息" />项目信息</p>
        </template>
        <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
            <attachmentTable ref="attachmentTable" businessType="21" :queryType="queryType" v-model="fileList">
            </attachmentTable>
          </div>
        </template>
        <template slot="detail">
          <div style="height: 500px;display: flex;flex-direction: column;">
            <button-top v-if="queryType != 'view'" :buttonTopData="datailProperty.buttonTop"
              @newButton="handleTableButton" :button-disable="handleTopButtonDisabled" />
            <table-index numberShow :styles="{ width: '100%', height: '454px', margin: '0', 'overflow-y': 'auto' }"
              ref="tableIndex" :visibleAction="queryType != 'view'" :tableData="detailList" :property="datailProperty"
              @handleButton="handleTableButton">
              <template slot="lendNum" slot-scope="scope">
                <el-input-number v-if="queryType != 'view'" style="width: 100%;" :value="scope.data.lendNum"
                  @change="(currentValue) => scope.data.lendNum = currentValue" controls-position="right" :min="0"
                  :max="scope.data.inventoryNum"></el-input-number>
                <span v-else>{{ scope.data.lendNum }}</span>
              </template>
            </table-index>
          </div>
        </template>
      </VFormRender>
    </div>
    <selectProject ref="selectProject" singleMode @selections="handleConfirmProject" :propsFormData="propsFormData" />
    <choice-material isLend ref="choiceMaterial" @choiceMaterialClick="handleConfirmMaterial"
      :propsFormData="propsMaterData" />
    <toBeReviewed ref="toBereview" />
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'

import attachmentTable from '@/views/components/attachmentTable'
import selectProject from "@/views/components/selectProject"
import choiceMaterial from '@/views/components/choice-material'
import indexMixin from '@/views/mixins';

import { formFillInPage } from '@/api/form/form'
import { deptTree, getUnitTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import {
  saveOrder,
  getDetailOrder,
  lendSaveSubmit
} from '@/api/warehouseManage/lendManage'

import { getUserInfo } from '@/utils/user-info'
import { getToken } from '@/utils/auth'
import { menuConfig, generateUUID } from '@/utils'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
export default {
  name: 'createLendOrder',
  components: {
    selectProject,
    choiceMaterial,
    attachmentTable,
    toBeReviewed,
    VFormRender
  },
  mixins: [indexMixin],

  data() {
    const userInfo = getUserInfo()
    return {
      propsFormData: {
        unitId: userInfo.unitId,
      },
      propsMaterData: {
        unitId: userInfo.unitId,
        projectId: ''
      },
      loading: false,
      queryId: '',
      queryName: '',
      queryType: '',
      formJson: {},
      formData: {},
      // 菜单按钮、字段等数据
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
        { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
        { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
        { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'create, update, view' },
      ],
      queryAuditArr: null,
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: '01'
      },
      userInfo: userInfo,
      datailProperty: {},
      detailList: [],
      fileList: [],
      checked: false,
      status: '1',
      isQuery: ''
    }
  },
  computed: {
    ...mapGetters(['infoData'])
  },
  async created() {
    this.init()
  },
  methods: {
    handleTopButtonDisabled(button) {
      // if(button.buttonCode === 'create') {
      //   const pId = this.$refs['vFormRef'].getFieldValue('projectId')
      //   return !pId
      // }
    },
    checkoutStatus(flag) {
      const widgets = ['grid27037', 'grid56510', 'lendCode', 'projectName', 'projectCode']
      if (flag) {
        this.$refs.vFormRef.hideWidgets(widgets)
      } else {
        this.$refs.vFormRef.showWidgets(widgets)
      }
    },
    // 确认选中项目事件
    handleConfirmProject(row) {
      this.detailList = []
      this.$refs['vFormRef'].setFieldValue('projectCode', row.projectCode)
      this.$refs['vFormRef'].setFieldValue('projectName', row.projectName)
      this.$refs['vFormRef'].setFieldValue('projectId', row.id)
    },
    // 加载表格配置项
    async menuProperty() {
      this.datailProperty = await this.$store.dispatch('menuProperty', menuConfig.MENU_LEND_DETAIL)
      this.datailProperty.fields.forEach((field) => {
        if (field.fieldCode === 'lendNum') {
          field.listSlot = true
          field.required = true
        }
      })
      this.$nextTick(() => {
        this.$refs['tableIndex'].init(this.datailProperty.fields)
      })
    },
    // 表单按钮权限设置
    buttonShow(item) {
      if (['saveSubmit', 'edit'].includes(item.buttonCode) && !['0', '1'].includes(this.status)) {
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
    // 加载初始化数据
    async init() {
      let { type, name, id, auditArr, isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryName = name
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
      this.isQuery = isQuery

      this.$nextTick(async () => {


        await this.formFillInPage()
        this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true);
        this.$refs['vFormRef'].resetForm()
        await this.getDeptTreeData()
        await this.menuProperty();

        if (['update', 'view'].includes(this.queryType)) {
          this.getOperateDetail(id)

        } else {
          const { deptId, deptName, nickName, id: nickId, unitId, unitName } = this.userInfo
          this.getUserListAll(deptId)
          this.$refs['vFormRef'].setFieldValue('borrowDeptId', deptId)
          this.$refs['vFormRef'].setFieldValue('borrowDeptName', deptName)
          this.initUnitInfo()
          this.$refs['vFormRef'].setFieldValue('borrowUserId', nickId)
          this.$refs['vFormRef'].setFieldValue('borrowUserName', nickName)
        }
      })
    },
    // 加载表单配置项
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('lendOrderOperate').then(res => {

          this.$refs['vFormRef'].setFormJson(res.data)
          if (this.queryType == 'view') {
            // this.$refs['vFormRef'].showWidgets(['borrowUserName'])
            this.$refs['vFormRef'].showWidgets(['borrowUserId'])
          }
          resolve(true)
        })
      })
    },
    // 加载部门数据
    async getDeptTreeData() {
      const res = await deptTree({ bizStatus: '1' })
      this.$refs['vFormRef'].getWidgetRef('borrowDeptId').loadOptions(res.data || [])
      const unitTree = await getUnitTree({ status: 0 })
      this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(unitTree.data || [])

    },
    // 加载人员数据
    async getUserListAll(deptId) {
      const res = await userListAll({ deptId })
      this.$refs['vFormRef'].getWidgetRef('borrowUserId').loadOptions(res.data.list || [])
    },
    // 加载详情数据
    async getOperateDetail(id) {
      try {
        this.loading = true
        const { data: { detailList, fileList, ...form } } = await getDetailOrder(id)
        await this.getUserListAll(form.borrowDeptId)
        const expectReturnDate = moment(form.expectReturnDate).format("YYYY-MM-DD");
        this._id = form.id
        this.status = form.status
        this.$refs['vFormRef'].setFormData({ ...form, expectReturnDate });
       
        this.fileList = !!fileList.length ? fileList.map(f => ({ ...f, uid: generateUUID() })) : []
        this.$nextTick(() => {
          this.detailList = detailList.map(item => ({ ...item, uid: generateUUID() }))
        })
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    // 表单追加按钮事件处理器
    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
      if (name === 'projectCode') {
        const pId = this.$refs['vFormRef'].getFieldValue('projectId')
        const unitId = this.$refs['vFormRef'].getFieldValue('unitId')
        this.propsFormData.unitId = unitId

        this.$refs.selectProject.init(pId);
        return
      }
    },
    // 表单字段改变事件处理器
    handleSelectChange(fieldName, newValue) {
      if (fieldName === 'borrowUserId') {
        if (newValue) {
          const optionLabel = this.$refs['vFormRef'].getWidgetRef('borrowUserId').optionLabel
          this.$refs['vFormRef'].setFieldValue('borrowUserName', optionLabel)
        } else {
          this.$refs['vFormRef'].setFieldValue('borrowUserName', '')
        }
      }
      if (fieldName === 'projectCode' && !newValue) {
        this.$refs['vFormRef'].setFieldValue('projectCode', '')
        this.$refs['vFormRef'].setFieldValue('projectId', '')
        this.$refs['vFormRef'].setFieldValue('projectName', '')
      }
    },
    handleFormChange(fieldName, value, oldValue) {
      if (fieldName === 'unitId' && value != oldValue) {
        this.$refs['vFormRef'].setFieldValue('projectCode', '')
        this.$refs['vFormRef'].setFieldValue('projectId', '')
        this.$refs['vFormRef'].setFieldValue('projectName', '')
        this.detailList = []

      }

    },
    // 表格按钮事件处理器
    handleTableButton(buttonCode, _1, _2, _3, row) {
      if (buttonCode === 'create') {
        const unitId = this.$refs['vFormRef'].getFieldValue('unitId')
        const projectId = this.$refs['vFormRef'].getFieldValue('projectId')
        this.propsMaterData.unitId = unitId
        this.propsMaterData.projectId = projectId
        this.$refs.choiceMaterial.init(null, [], this.detailList);
      } else if (buttonCode === 'delete') {
        this.detailList = this.detailList.filter(item => item.uid != _2[0].uid)
      }
    },
    // 物料选择事件
    handleConfirmMaterial(data = []) {
      const arr = data.map(item => ({ ...item, uid: generateUUID(), lendNum: undefined }))
      this.detailList = this.detailList.concat(arr)
    },
    // 顶部按钮事件处理器
    handleButton(buttonCode) {
      switch (buttonCode) {
        case 'cancel':
          this.handleCancel()
          break;
        case 'save':
          this.handleSave(buttonCode)
          break;
        case 'saveSubmit':
          this.handleSave(buttonCode)
          break;
        case 'pass':
          this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName);
          break;
        case 'reject':
          this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName);
          break;
        case 'edit':
          this.queryType = 'update';
          this.$refs['vFormRef'].setReadMode(false);
          break;
        default:
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
        const formValid = await this.validateForm('vFormRef')
        if (!formValid) {
          this.$modal.msgError('基本信息必填项不能为空')
          return
        }
        let flag = ''
        if (!this.detailList.length) {
          flag = '明细信息不能为空'
        }

        for (let i = 0; i < this.detailList.length; i++) {
          const { lendNum } = this.detailList[i]
          if (!lendNum || lendNum == 0) {
            flag = '借出数据不能为空或为0'
            break
          }
        }
        if (flag) {
          this.$modal.msgError(flag)
          return
        }
        this.loading = true
        const formData = await this.$refs.vFormRef.getFormData()
        const param = {
          ...formData,
          fileList: this.fileList,
          detailList: this.detailList
        }
        if (!!this._id) {
          param.id = this._id
        }
        const saveObj = {
          'save': () => { this.saveOrder(saveOrder, param) },
          'saveSubmit': () => {
            this.$reviewerDialog({
              type: ACTIVITI_ASSUGNEE.INV_JCD,
              multiple: false,
              success: (assignee) => {
                this.saveOrder(lendSaveSubmit, param, assignee)
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
      if (name === 'borrowDeptId') {
        this.$refs['vFormRef'].setFieldValue('borrowUserId', '')
        this.$refs['vFormRef'].setFieldValue('borrowUserName', '')
        this.$refs.vFormRef.setFieldValue('borrowDeptName', node.deptName)
        this.getUserListAll(node.id)
      } else if (name === 'unitId') {
        this.$refs['vFormRef'].setFieldValue('unitName', node.deptName)
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