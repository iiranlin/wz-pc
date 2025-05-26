<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
      @newButton="newButton"></button-top>
    <div class="container_flex_form">
      <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required"
        active-text="隐藏非必填项">
      </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" :class="{ 'formRender_view': queryType === 'view' }"
        @appendButtonClick="handleAppendButtonClick" @selectChange="selectChange" @buttonClick="handleButtonClick"
        @treeSelectSelect="treeSelectSelect" @treeSelectInput="treeSelectInput">
        <template slot="design_p1">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />基本信息</p>
        </template>
        <template slot="forwardStatusSlot" v-if="formData.forwardStatusSlot == '0'">
          <tooltip content="根据所选数据自动判断，无须手动选择" />
        </template>
        <template slot="generateOutSlot" v-if="formData.generateOutSlot == '0'">
          <tooltip content="如果调整已结转的数据，入库调整审核通过后自动生成出库调整、以平账。" />
        </template>
        <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
            <attachmentTable ref="attachmentTable" businessType="44" :queryType="queryType" v-model="fileList">
            </attachmentTable>
          </div>
        </template>
        <template slot="detailedList">
          <detailedList ref="detailedList" :dict="dict.type" :queryType="queryType"></detailedList>
        </template>
      </VFormRender>
    </div>
    <choice-adjustInQuote ref="choiceAdjustInQuote" :propsFormData="propsFormData" @selections="selectionsAdjustInQuote"></choice-adjustInQuote>
    <toBeReviewed ref="toBereview" />
  </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { getUnitTree } from '@/api/system/dept'
import { generateUUID } from '@/utils'
import indexMixin from '@/views/mixins'
import VFormRender from '@/components/form-render/index'
import attachmentTable from '@/views/components/attachmentTable'
import choiceAdjustInQuote from '@/views/components/choice-adjustInQuote'
import detailedList from './components/detailedList'
import { adjustInSaveOrder, adjustInSaveSubmit, adjustInOrderView } from '@/api/prodmgr-inv/adjustIn'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
export default {
  name: 'inventoryAdjustOperate',
  mixins: [indexMixin],
  dicts: ['MeasureUnit', 'inMaintenance'],
  components: {
    VFormRender,
    attachmentTable,
    detailedList,
    choiceAdjustInQuote,
    toBeReviewed,
    tooltip: () => import('@/components/tooltip')
  },
  data() {
    return {
      projectId: '',
      loading: false,
      queryType: '',
      queryId: '',
      queryName: '',
      formJson: {},
      tableType: '1',
      formData: {},
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
      fileList: [],
      checked: false,
      createMethod: '1',
      propsFormData: {
        unitId: ''
      },
      isQuery: '',
    }
  },
  computed: {
    ...mapGetters(['infoData'])
  },
  created() {
    this.init()
  },
  methods: {
    checkoutStatus() {
      const arrId = ['gridCol79769', 'gridCol13544', 'grid86290', 'grid96921', 'grid46207']
      if (this.checked) {
        this.$refs['vFormRef'].hideWidgets(arrId);
      } else {
        this.$refs['vFormRef'].showWidgets(arrId);
      }
    },
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
    init() {
      let { type, name, id, auditArr, tableType = '1', isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryName = name || 'inventoryAdjustMaintenance'
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
      this.tableType = tableType
      this.isQuery = isQuery
      this.$nextTick(async () => {
        await this.formFillInPage()
        this.$refs['vFormRef'].resetForm()
        await this.getUnitTree()
        if (this.queryType === 'update') {
          this.$refs['vFormRef'].setReadMode(false)
          this.adjustInOrderView(id)
        } else if (this.queryType === 'view') {
          this.$refs['vFormRef'].setReadMode(true)
          this.adjustInOrderView(id)
        }else if(this.queryType === 'create'){
          this.initUnitInfo()
        }else if (buttonCode === 'pass') {
          this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName)
        }else if (buttonCode === 'reject') {
          this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName)
        }
      })
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('inventoryAdjustMaintenance').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    async getUnitTree() {
      const res = await getUnitTree({ status: 0 })
      this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
    },
    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
      const unitId = this.$refs.vFormRef.getFieldValue("unitId")
      if (!unitId) {
        this.$modal.msgError('请先选择所属组织')
        return
      }
      this.propsFormData.unitId = unitId
      const inDetailId = this.$refs.vFormRef.getFieldValue("inDetailId")
      this.$refs.choiceAdjustInQuote.init(inDetailId)
    },
    handleButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
    },
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
      }
    },
    adjustInOrderView (id) {
      this.loading = true
      adjustInOrderView(id).then(({ data }) => {
        this.formData = data
        this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
        delete data.fileList
        this.$refs['vFormRef'].setFormData(data)
        this.$refs.detailedList.init(data.adjustInDetails || [])
      }).finally(() => {
        this.loading = false
      })
    },
    handleSave(buttonCode) {
      this.$refs.vFormRef.getFormData().then(formData => {
        let tableData = []
        const detailedList = this.$refs.detailedList
        if(!detailedList.tableData.detailsList.length) {
          this.$modal.msgError("明细信息不能为空");
          return
        }
        let flag = true
        detailedList.$refs.elForm.validate(valid => {
          if (valid) {
            tableData = detailedList.tableData.detailsList
          }else {
            flag = false
          }
        })
        if(!flag) {
          return
        }
        let id = this.formData.id
        const args = {
          ...formData,
          id: id,
          adjustInDetails: tableData,
          fileList: this.fileList
        }
        const saveObj = {
          'save': () => { this.saveOrder(adjustInSaveOrder, args) },
          'saveSubmit': () => {
            this.$reviewerDialog({
              type: ACTIVITI_ASSUGNEE.INV_ADJUST_IN,
              multiple: false,
              success: (assignee) => {
                this.saveOrder(adjustInSaveSubmit, args, assignee)
              }
            })
          }
        }
        saveObj[buttonCode] && saveObj[buttonCode]()
      }).catch((err) => {
        this.$modal.msgError(err);
      })
    },
    async saveOrder(url, param, assignee) {
      if (!this.resOk) {
        const res = await url({ ...param, assignee })
        res.success && this.$modal.msgSuccess(`${res.message}`)
        this.resOk = true
        this.cancel(this.queryName)
      }
    },
    cancel(name) {
      // 关闭当前tabs
      this.$tab.closeOpenPage({ name })
    },
    // 树选择
    async treeSelectSelect(vm, node) {
      let {
        field: {
          options: { name }
        }
      } = vm || {}
      if (name === 'unitId') {
        this.$refs.vFormRef.setFieldValue('unitName', node.deptName)
        this.$refs.detailedList.tableData.detailsList = []
        this.$refs.vFormRef.setFieldValue('inCode', '')
        this.$refs.vFormRef.setFieldValue('inId', '')
        this.$refs.vFormRef.setFieldValue('inDetailId', '')
      }
    },
    treeSelectInput(vm, newVal) {
      let { field: { options: { name } } } = vm || {}
      if(name === 'unitId'){
        if(!newVal){
          this.$refs.detailedList.tableData.detailsList = []
          this.$refs.vFormRef.setFieldValue('inCode', '')
          this.$refs.vFormRef.setFieldValue('inId', '')
          this.$refs.vFormRef.setFieldValue('inDetailId', '')
        }
      }
    },
    selectChange(name, node) {
      if(name == 'inCode' && !node){
        this.$refs.detailedList.tableData.detailsList = []
        this.$refs.vFormRef.setFieldValue('inId', '')
        this.$refs.vFormRef.setFieldValue('inDetailId', '')
      }
    },
    selectionsAdjustInQuote (data) {
      data.inNum = 0
      data.inAmount = 0
      this.$refs.detailedList.tableData.detailsList = []
      this.$refs.vFormRef.setFormData({
        inCode: data.inCode,
        inId: data.inId,
        inDetailId: data.inDetailId,
        forwardStatus: data.forwardStatus,
        generateOut: data.generateOut,
      });
      this.$refs.detailedList.init([data])
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .forwardStatusSlot, ::v-deep .generateOutSlot{
  display: inline-block;
  width: 16px;
  height: 16px;
  position: absolute;
  top: -26px;
  left: 178px;
  font-size: 14px;
}
::v-deep .generateOutSlot{
  left: 438px;
}
</style>
