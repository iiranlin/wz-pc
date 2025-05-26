<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
    <div class="container_flex_form">
      
      <el-switch v-if="checkedShow" v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
      </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv"
        @appendButtonClick="handleAppendButtonClick" @selectChange="selectChange" @buttonClick="handleButtonClick"
        @treeSelectInput="treeSelectInput" @treeSelectSelect="treeSelectSelect">
        <template slot="detail">
          <div style="height: 500px;display: flex;flex-direction: column;">
            <table-index ref="tableIndex" idName="uid" :tableData="detailList" :property="datailProperty"
              @handleSelectionChange="handleSelectionChange" @clickLink="clickLink" @handleButton="handleButton"
              @selectChange="selectTableChange">
              <template slot="warehouseId" slot-scope="scope">
                <selectTree style="width: 100%"  :value="scope.data.warehouseId" @getValue="(obj, treeIndex, valueId)=>getWarehouseName(obj, scope)"
                  :options="scope.data.warehouseTree" :props="warehouseOptionsProps" :disabledFun="disabledFun" />
              </template>
              <template slot="outNum" slot-scope="scope">
                <el-input-number style="width: 100%;" :value="scope.data.outNum"
                  @change="(currentValue, oldValue) => scope.data.outNum = currentValue" controls-position="right"
                  :min="1"></el-input-number>
              </template>
            </table-index>
          </div>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import {
  warehouseGetOutWarehouse
} from '@/api/warehouseManage/outboundMaintenance'
import selectTree from '@/components/selectTree/index.vue'
import indexMixin from '@/views/mixins';
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import {generateUUID} from '@/utils'
import { deptTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import { getUserInfo } from '@/utils/user-info'
import {
  warehouseSaveOrder,
} from '@/api/warehouseManage/outboundMaintenance'
import { menuConfig, uniqueArrByField } from '@/utils'
import {
  getOutQuoteList,
} from '@/api/warehouseManage/lendManage'
import VFormRender from '@/components/form-render/index'
export default {
  name: 'outbound',
  components: {
    selectTree,
    VFormRender
  },
  mixins: [indexMixin],
  data() {
    return {
      warehouseOptions: [],
      warehouseOptionsProps: {
        children: "children",
        label: "name",
        value: "id",
        disabled: (node, data) => {
          return data.level == 1;
        },
      },
      loading: false,
      type: '',
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
        { buttonName: '提交', buttonCode: 'submit', buttonIcon: 'Blue-Submit', type: 'view, update' }
      ],
      queryAuditArr: null,
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: '01'
      },
      /*合同信息*/
      checked: false,
      detailedForm: [],
      userInfo: getUserInfo(),
      checkedShow: true,
      formValidate: {
        detailedForm: []
      },
      oldOutSourceValue: '',  /*记录下上一次出库来源选择的值*/
      isOrLendStatus: false,
      datailProperty: {},
      detailList: [],
      queryIds: []
    }
  },
  computed: {
    ...mapGetters(['infoData'])
  },
  created() {

    this.init()
  },
  methods: {
    selectTableChange(row) {

    },
    emitAblFilter(listQuery) {

    },
    clickLink() {

    },
    handleSelectionChange(ids, single, multiple, row) {

    },
    handleButtonDisable(button, row) {
      return false
    },
    handleButton(code, a, rows, c) {
      if('delRow' == code) {
        this.detailList = this.detailList.filter(item => item.uid !== rows[0].uid)
      }else if('copyRow' == code) {
        this.$set(this.detailList, this.detailList.length, {...rows[0], uid: generateUUID()})
      }
    },
    disabledFun(node) {
      return node.level == 1
    },
    getWarehouseName(obj, row) {
        row.data.warehouseId = obj.id;
        row.data.warehouseName = obj.name;
        row.data.warehouseCode = obj.code;
    },
    async menuProperty() {
      this.datailProperty = await this.$store.dispatch('menuProperty', menuConfig.MENU_LEND_OUTBOUND)
      this.datailProperty.fields.forEach((field) => {
        if (['warehouseId', 'outNum'].includes(field.fieldCode)) {
          field.listSlot = true
          field.required = true
        }
      })
      this.$nextTick(() => {
        this.$refs['tableIndex'].init(this.datailProperty.fields)
      })


    },
    buttonShow(item) {
      if (['submit', 'edit'].includes(item.buttonCode) && !['0', '1'].includes(this.formData.status)) {
        return false
      }
      if (['submit', 'edit'].includes(item.buttonCode) && this.queryName == 'toBeDeal') {
        return false
      }
      if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
        return true
      } else {
        return false
      }
    },
    async init() {
      let { type, name, ids='', id } = this.$route.query
      this.queryType = type || 'create'
      this.queryId =  id || ''
      this.queryIds =  ids.split(',') || []
      this.queryName = name
      this.$nextTick(async () => {
        this.$refs['vFormRef'].resetForm()
        /*默认禁用销售负责人*/
        await this.formFillInPage()
        await this.menuProperty();
        await this.getDeptTreeData()
        await this.getDetailData(this.queryIds)
        if (['update', 'view'].includes(this.queryType)) {
        } else {
          const { deptId, deptName, nickName, id: nickId } = this.userInfo
          await this.getUserListAll(deptId)
          this.$refs['vFormRef'].setFieldValue('outDeptId', deptId)
          this.$refs['vFormRef'].setFieldValue('outDeptName', deptName)
          this.$refs['vFormRef'].setFieldValue('outUserId', nickId)
          this.$refs['vFormRef'].setFieldValue('outUserName', nickName)
          this.$refs['vFormRef'].setReadMode(false)

          /*添加的时候来源单号和出库来源是联动的*/
          this.$refs['vFormRef'].disableWidgets('sourceCode')
        }
      })
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('lendOutboundOrder').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    async getDeptTreeData() {
      const res = await deptTree({ bizStatus: '1' })
      this.$refs['vFormRef'].getWidgetRef('outDeptId').loadOptions(res.data || [])
    },
    async getUserListAll(deptId) {
      const res = await userListAll({ deptId })
      this.$refs['vFormRef'].getWidgetRef('outUserId').loadOptions(res.data.list || [])
    },
    async getDetailData(ids) {
      try {
        const param = {
          ids: ids
        }
        const { data: { list } } = await getOutQuoteList(param)
        if(!!list.length) {
          const res = await warehouseGetOutWarehouse(list)
       const nextList = res.data || []
        const codeArr = uniqueArrByField(nextList, 'sourceCode')
        const codes = codeArr.join(',')
        this.$refs['vFormRef'].setFieldValue('sourceCode', codes)
        this.detailList = nextList.map(item => ({...item, uid: generateUUID()}))
        }
       
      } catch (err) {
        console.error(err)
      }
    },
    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
      if (name === 'sourceCode') {
        this.$refs.transferOrderRef.init(this.detailedForm, this.isOrLendStatus)
      }
    },
    handleButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
    },
    selectChange(fieldName, newValue) {
      if (fieldName === 'outUserId') {
        if (newValue) {
          const optionLabel = this.$refs['vFormRef'].getWidgetRef('outUserId').optionLabel
          this.$refs['vFormRef'].setFieldValue('outUserName', optionLabel)
        } else {
          this.$refs['vFormRef'].setFieldValue('outUserName', '')
        }
      } else if (fieldName === 'outSource') {
        if (this.oldOutSourceValue === newValue) {
          this.oldOutSourceValue = newValue
          return
        }
        this.oldOutSourceValue = newValue  /*清空选中的数据*/
        this.detailedForm = []
        this.formValidate.detailedForm = []
        this.$refs['vFormRef'].setFieldValue('sourceCode', '')
        if (newValue === '') {
          this.$refs['vFormRef'].disableWidgets('sourceCode')
          return
        }
        this.$refs['vFormRef'].enableWidgets('sourceCode')
        if (newValue === '5') {
          this.isOrLendStatus = true
        } else {
          this.isOrLendStatus = false
        }
      }
    },
    newButton(buttonCode) {
      switch(buttonCode) {
        case 'cancel':
        this.cancel()
          break;
          case 'save':
            this.handleSave()
            break;
            default:
      }
    },
    cancel() {
      // 关闭当前tabs
      this.$tab.closeOpenPage({ name: this.queryName })
    },
    validateForm(formRef) {
      return new Promise((resolve) => {
        this.$refs[formRef].validateForm((valid) => {
          resolve(valid)
        })
      })
    },
  async  handleSave() {
      try {
        if(this.loading) {
          return
        }
        const formValid = await this.validateForm('vFormRef')
        if (!formValid) {
          this.$modal.msgError('基本信息字段不能为空')
          return
        }
        if (!this.detailList.length) {
          this.$modal.msgError('明细信息不能为空')
          return
        }

        let flag = false
        for(let i=0; i< this.detailList.length; i++) {
          const {outNum, warehouseId} = this.detailList[i]
          if(!outNum || !warehouseId) {
            flag = true
            break
          }
        }
        if(flag) {
          this.$modal.msgError('明细信息字段不能为空')
          return
        }
        const formData = await this.$refs.vFormRef.getFormData()
        const param = {
          ...formData,
          detailList: this.detailList
        }
        if(this._id) {
          param.id = this._id
        }
        this.loading = true
        const res = await warehouseSaveOrder(param)
        res.success && this.$modal.msgSuccess(`${res.message}`)
        this.cancel()
      }catch(err){
        this.$modal.msgError(`${err.message}`)
        console.error(err)
      }finally {
        this.loading = false
      }
    },
    // 部门树选择
    async treeSelectSelect(vm, node) {
      let {
        field: {
          options: { name }
        }
      } = vm || {}
      if (name === 'outDeptId') {
        this.$refs['vFormRef'].setFieldValue('outUserId', '')
        this.$refs['vFormRef'].setFieldValue('outUserName', '')
        this.$refs.vFormRef.setFieldValue('outDeptName', node.deptName)
        this.getUserListAll(node.id)
      }
    },
    treeSelectInput(vm, newVal) {
      let {
        field: {
          options: { name }
        }
      } = vm || {}
      if (name === 'outUserId') {
        if (!newVal) {
          this.$refs['vFormRef'].setFieldValue('outUserId', '')
          this.$refs['vFormRef'].setFieldValue('outUserName', '')
          // this.$refs['vFormRef'].getWidgetRef('outUserId').loadOptions([])
        }
      }
    },
    checkoutStatus(flag) {
      const widgets = ['outDeptId', 'outUserId', 'comments', 'fileList', 'outCode']
      if (flag) {
        this.$refs.vFormRef.hideWidgets(widgets)
      } else {
        this.$refs.vFormRef.showWidgets(widgets)
      }
    },
    orderRow(row) {
      this.detailedForm = [...this.detailedForm, ...row]
      this.formValidate.detailedForm = this.detailedForm
      let sourceAllCode = this.detailedForm.map(item => item.sourceCode)
      let _sourceAllCode = Array.from(new Set(sourceAllCode))
      let _sourceAllCodeStr = _sourceAllCode.length > 1 ? _sourceAllCode.join(',') : _sourceAllCode[0]
      this.$refs['vFormRef'].setFieldValue('sourceCode', _sourceAllCodeStr)
    },
    selectable(row, index) {
      const selectRowIdGroup = this.selectRow.map(item => item.matlCode)
      return !selectRowIdGroup.includes(row.matlCode)
    },
    deleteRow(index) {
      this.detailedForm.splice(index, 1)
      this.formValidate.detailedForm = this.detailedForm
      let sourceAllCode = this.detailedForm.map(item => item.sourceCode)
      let _sourceAllCode = Array.from(new Set(sourceAllCode))
      let _sourceAllCodeStr = _sourceAllCode.length > 1 ? _sourceAllCode.join(',') : _sourceAllCode[0]
      this.$refs['vFormRef'].setFieldValue('sourceCode', _sourceAllCodeStr)
    },
    copyRow(row, index) {
      this.detailedForm.splice(index, 0, row)
      this.$set(this.detailedForm, index + 1, { ...row, outNum: '' })
      this.formValidate.detailedForm = this.detailedForm
    }
  }
}
</script>
<style lang="scss" scoped>
.slotIcon-color-content {
  color: red
}

.slotIcon-color {
  color: #1890ff;
}
</style>