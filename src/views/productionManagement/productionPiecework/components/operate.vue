<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="handleButton"></button-top>
    <div class="container_flex_form">

      <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required"
        active-text="隐藏非必填项">
      </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv"
        :class="{ 'formRender_view': queryType === 'view' }" @appendButtonClick="handleAppendButtonClick"
        @selectChange="handleSelectChange" @formChange="handleFormChange" @treeSelectSelect="treeSelectSelect"
        @treeSelectInput="treeSelectInput">
        <template slot="design_p1">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />基本信息</p>
        </template>
        <template slot="design_p2">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="统计信息" />统计信息</p>
        </template>
        <template slot="workerId" slot-scope="scope">
          <div style="display: flex;flex-direction: column;">
            <el-select v-if="queryType != 'view'" v-model="scope.formModel.workerId" filterable clearable>
              <el-option @click.native="handleWorkerChange(item)" v-for="item in usersList" :key="item.id"
                :label="item.nickName" :value="item.id"></el-option>
            </el-select>
            <span v-else>{{ scope.formModel.workerName }}</span>
          </div>
        </template>
        <template slot="statiType" slot-scope="scope">
          <div style="display: flex;flex-direction: column;">
            <el-select v-if="queryType != 'view'" v-model="scope.formModel.statiType" filterable clearable>
              <el-option v-for="item in statiTypeList" :key="item.code" :label="item.name"
                :value="item.code"></el-option>
            </el-select>
            <span v-else>{{ scope.formModel.statiType | orderTypeFilter(dict.type.statiType) }}</span>
          </div>
        </template>

        <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
            <attachmentTable ref="attachmentTable" businessType="33" :queryType="queryType" v-model="fileList">
            </attachmentTable>
          </div>
        </template>
        <template slot="detail">
          <div style="height: 500px;display: flex;flex-direction: column;">
            <button-top v-if="queryType != 'view' && tableType == '1'" :buttonTopData="datailProperty.buttonTop"
              @newButton="handleTableButton" />
            <el-form ref="elForm" :model="validateTable" :rules="validateTable.rules">
              <el-table :data="validateTable.detailList" :height="screenHeight"
                @selection-change="handleSelectionChange">
                <el-table-column align="center" width="50" type="selection" />
                <el-table-column align="center" width="50" label="序号" type="index"></el-table-column>
                <el-table-column align="center" label="生产单号" prop="orderRawCode"></el-table-column>
                <el-table-column align="center" width="150" label="物料编码" prop="matlCode"></el-table-column>
                <el-table-column align="left" width="150" label="物料名称" prop="matlName"></el-table-column>
                <el-table-column align="left" width="150" label="规格型号" prop="matlType"></el-table-column>
                <el-table-column align="center" width="150" label="计量单位" prop="matlUnit">
                  <template slot-scope="{row}">
                    <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                  </template>
                </el-table-column>
                <el-table-column align="right" label="计数明细" prop="baseNum ">
                  <template slot="header">
                    <span style="color:red">*</span>
                    <span>计数明细</span>
                  </template>
                  <template slot-scope="scope">
                    <el-form-item :prop="'detailList.' + scope.$index + '.baseNum'"
                      :rules="validateTable.rules.baseNum">
                      <el-input-number v-if="queryType !== 'view'" v-model="scope.row.baseNum" :min="0"
                        style="width: 100%" @change="handleBaseNumChange"></el-input-number>
                      <span v-else>{{ scope.row.baseNum }}</span>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column align="left" label="备注" prop="note">
                  <template slot="header">
                    <span>备注</span>
                  </template>
                  <template slot-scope="scope">
                    <el-input v-if="queryType !== 'view'" v-model="scope.row.note" style="width: 100%"></el-input>
                    <span v-else>{{ scope.row.note }}</span>
                  </template>
                </el-table-column>
                <el-table-column align="center" width="150" label="操作" prop="materialCount" fixed="right"
                  v-if="queryType !== 'view' && tableType == '1'">
                  <template slot-scope="scope">
                    <el-button type="text" @click="handleDeleteRow(scope.row)">删行</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form>
          </div>
        </template>
      </VFormRender>
    </div>
    <choice-production :singleMode="false" :unitId="unitId" ref="choiceProduction" @change="productionChange" />
    <toBeReviewed ref="toBereview" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import attachmentTable from '@/views/components/attachmentTable'
import { deptTreeAll, getUnitTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import indexMixin from '@/views/mixins';
import choiceProduction from "@/views/components/choice-production"
import { formFillInPage } from '@/api/form/form'
import selectTree from '@/components/selectTree/index.vue'
import {
  createOrder,
  modifyOrder,
  saveSubmit,
  getDetail,
  getRawDetail,
  saveRawDetail
} from '@/api/projectManagement/productionPiecework'
import { getWarehouseTree } from '@/api/warehouseManage/inventoryMaintenance'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import { getUserInfo } from '@/utils/user-info'
import { getToken } from '@/utils/auth'
import { generateUUID } from '@/utils'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import VFormRender from '@/components/form-render/index'
import { getListByParentCode } from "@/api/system/dict";

export default {
  name: 'productionPieceworkOperate',
  dicts: ['MeasureUnit', 'statiType'],
  components: {
    attachmentTable,
    choiceProduction,
    selectTree,
    toBeReviewed,
    VFormRender
  },
  mixins: [indexMixin],

  data() {
    const userInfo = getUserInfo()
    return {
      userInfo: userInfo,
      usersList: [],
      statiTypeList: [],
      loading: false,
      queryId: '',
      queryName: '',
      queryType: '',
      formJson: {},
      formData: {},
      tableType: '1',
      screenHeight: 500,
      queryAuditArr: null,
      // 菜单按钮、字段等数据
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
        { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
        { buttonName: '退回上一步', buttonCode: 'rollbackToPrevious', buttonIcon: 'Blue-Cancel', type: '' },
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
        { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
        { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'view, update' }
      ],
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: '01'
      },
      unitId: userInfo.unitId,
      datailProperty: {
        buttonTop: [
          { buttonCode: 'selectProduct', buttonName: '选择生产订单' },
          { buttonCode: 'delete', buttonName: '删除' }
        ]
      },
      validateTable: {
        detailList: [],
        rules: {
          baseNum: [{ required: true, message: '请输入计数明细', trigger: ['blur', 'change'] }],
        },
      },
      fileList: [],
      dataOptions: [],
      selection: [],
      status: '',
      optionsProps: {
        children: "children",
        label: "name",
        value: "id",
        disabled: (node, data) => {
          return data.level == 1;
        },
      },
      checked: false,
      isQuery: ''
    }
  },
  computed: {
    ...mapGetters(['infoData'])
  },
  async created() {
    this.loadTypeDict()

    this.init()
  },
  methods: {
    treeSelectInput(vm, newVal) {
      let {
        field: {
          options: { name },
        },
      } = vm || {};

      if (name === 'unitId') {
        if (!newVal) {
          this.$refs.vFormRef.setFieldValue('unitName', '')
        }
      }
    },
    checkoutStatus(flag) {
      const widgets = ['stName', 'stCode', 'workDeptId', 'workTeamId', 'workerId', 'notes', 'fileList', 'design_p2', 'grid92191', 'grid45430', 'grid73504', 'grid9467']
      if (flag) {
        this.$refs.vFormRef.hideWidgets(widgets)
      } else {
        this.$refs.vFormRef.showWidgets(widgets)
      }
    },
    handleBaseNumChange() {
      const count = this.validateTable.detailList.reduce((a, b) => {
        const n = isNaN(b.baseNum) ? 0 : b.baseNum
        return a + n
      }, 0)
      this.$refs['vFormRef'].setFieldValue('count', count)
    },
    disabledFun(node) {
      return node.level !== 1
    },
    getWarehouseTree() {
      this.loading = true;
      getWarehouseTree().then(({ data }) => {
        this.dataOptions = data || [];
      }).finally(() => {
        this.loading = false;
      })
    },
    handleSelectionChange(rows) {
      this.selection = rows
    },
    getUnQuAreaCodeValue(node, index, valueId) {
      this.validateTable.detailList[index].storageCode = node.code
      this.validateTable.detailList[index].storageId = node.id
      this.validateTable.detailList[index].storageName = node.name
    },
    handleWorkerChange(v) {
      this.$refs['vFormRef'].setFieldValue('workerName', v.nickName || '')
    },
    handleDeleteRow(row) {
      this.validateTable.detailList = this.validateTable.detailList.filter(item => item.uid !== row.uid)
    },
    async productionChange(data) {
      const list = data.map(item => ({
        ...item,
        qualityNum: item.qualityNum || 0,
        uid: generateUUID(),
      }))
      this.validateTable.detailList = this.validateTable.detailList.concat(list)
      // this.$refs['vFormRef'].setFieldValue('orderCode', data.orderCode)
      // this.$refs['vFormRef'].setFieldValue('orderId', data.orderId)
      // this.$refs['vFormRef'].setFieldValue('ownerDeptName', data.deptName)
      // this.$refs['vFormRef'].setFieldValue('ownerDeptId', data.deptId)
    },
    // 确认选中项目事件
    handleConfirmProject(row) {
      this.$refs['vFormRef'].setFormData({ ...row, projectId: row.id });
    },

    // 表单按钮权限设置
    buttonShow({ buttonCode, type }) {
      if (buttonCode === 'rollbackToPrevious') {
        const query = this.isDialog ? this.dialogQuery : this.$route.query
        return query.name === 'audit' && query.type === 'view' && Array.isArray(this.queryAuditArr)
          && this.queryAuditArr.length === 1 && !!this.queryAuditArr[0]?.taskId
          && this.buttonShow({ buttonCode: 'reject', type })
      }
      if (['saveSubmit'].includes(buttonCode) && this.queryType == 'create') {
        return true
      }
      if (['edit', 'saveSubmit'].includes(buttonCode) && (!['0', '1'].includes(this.status) || this.isQuery == 'query')) {
        return false
      }
      if (type.includes(this.queryType)) {
        return true
      }
      if (type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(buttonCode))) {
        return true
      }

      return false
    },
    // 加载初始化数据
    async init() {
      let { type, name, id, ids = '', tableType = '1', auditArr = '', isQuery = '' } = this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
      this.queryName = name
      this.ids = ids ? ids.split(',') : []
      this.tableType = tableType
      this.isQuery = isQuery
      this.$nextTick(async () => {
        this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true);
        await this.formFillInPage()
        this.$refs['vFormRef'].resetForm()
        await this.getUnitTree()
        await this.getDeptData({ bizStatus: '1' }, 'produceDeptId')
        if (this.tableType != '1') {
          this.$refs['vFormRef'].hideWidgets(['card81458'])
        }
        if (['update', 'view'].includes(this.queryType)) {
          if (this.tableType == '2') {
            this.getDetailData(this.ids)
          } else {
            this.getOperateDetail(id)
          }

        } else {
          this.initUnitInfo()
        }
      })
    },
    async getUnitTree() {
      const res = await getUnitTree({ status: 0 })
      this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
    },
    async getDeptData(param, prop, child) {
      const res = await deptTreeAll(param)
      let arr = child ? res.data[0][child] : res.data
      this.$refs['vFormRef'].getWidgetRef(prop).loadOptions(arr)
    },
    // 加载表单配置项
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('productionPieceworkOperate').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    async getDetailData(ids) {
      const res = await getRawDetail({ ids })
    },
    // 加载详情数据
    async getOperateDetail(id) {
      try {
        this.loading = true
        const { data: { rawList, fileList, ...form } } = await getDetail(id)
        this.status = form.status;
        if (form.produceDeptId) {
          await this.getDeptData({ bizStatus: '1', unitId: form.produceDeptId }, 'workDeptId', 'children')
        } else {
          form.produceDeptId = undefined
        }
        if (form.workDeptId) {
          await this.getDeptData({ bizStatus: '1', unitId: form.workDeptId }, 'workTeamId', 'children')
        } else {
          form.workDeptId = undefined
        }
        if (!form.workTeamId) {
          form.workTeamId = undefined
        }
        this.$refs['vFormRef'].setFormData({ ...form });

        this.fileList = !!fileList.length ? fileList.map(f => ({ ...f, uid: generateUUID() })) : []
        this.$nextTick(() => {
          this.validateTable.detailList = rawList.map(item => ({ ...item, uid: generateUUID() }))
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
    },
    async loadTypeDict() {
      const { data } = await getListByParentCode('statiType')
      this._statiType = data
      this.statiTypeList = this._statiType.filter(item => !item.name.includes('工时'))
    },
    // 表单字段改变事件处理器
    handleSelectChange(fieldName, newValue, oldValue) {
      if (fieldName == 'type') {
        this.$refs['vFormRef'].setFieldValue('statiType', '')
        if (newValue == '0') {
          // 记工
          this.statiTypeList = this._statiType.filter(item => !item.name.includes('工时'))

        } else {
          // 计时
          this.statiTypeList = this._statiType.filter(item => item.name.includes('工时'))
        }
      }
    },
    handleFormChange(fieldName, value, oldValue) {
      if (fieldName === 'unitId') {
        this.validateTable.detailList = []
        this.unitId = value

      }

    },
    // 表格按钮事件处理器
    handleTableButton(buttonCode, _1, _2, _3, row) {
      if (buttonCode === 'delete') {
        const uids = this.selection.map(({ uid }) => uid)
        this.validateTable.detailList = this.validateTable.detailList.filter(item => !uids.includes(item.uid))
      } else if (buttonCode === 'selectProduct') {
        this.$refs.choiceProduction.init('', [...this.validateTable.detailList]);
      }
    },
    // 物料选择事件
    handleConfirmMaterial(data = []) {
      const arr = data.map(item => ({ ...item, uid: generateUUID(), lendNum: undefined }))
      this.validateTable.detailList = this.validateTable.detailList.concat(arr)
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
        let flag = true
        this.$refs['elForm'].validate(valid => {
          if (!valid) {
            flag = false
          }
        })
        if (!flag) {
          return
        }
        let api = createOrder
        this.loading = true
        const formData = await this.$refs.vFormRef.getFormData()
        let param = {
          ...formData,
          fileList: this.fileList,
          rawList: this.validateTable.detailList
        }
        if (formData.stId) {
          api = modifyOrder
        }
        if (this.tableType == '2') {
          api = saveRawDetail
          param = this.validateTable.detailList
        }
        const saveObj = {
          'save': () => { this.saveOrder(api, param) },
          'saveSubmit': () => {
            this.$reviewerDialog({
              type: ACTIVITI_ASSUGNEE.MM_ST,
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
      if (name === 'produceDeptId') {
        this.$refs.vFormRef.setFieldValue('produceDeptName', node.deptName)
        this.$refs['vFormRef'].getWidgetRef('workDeptId').loadOptions([])
        this.$refs['vFormRef'].getWidgetRef('workTeamId').loadOptions([])
        this.usersList = []
        await this.getDeptData({ bizStatus: '1', unitId: node.id }, 'workDeptId', 'children')
        await this.getUserListAll(node.id)
        this.$refs.vFormRef.setFieldValue('workDeptId', undefined)
        this.$refs.vFormRef.setFieldValue('workDeptName', undefined)

        this.$refs.vFormRef.setFieldValue('workTeamId', undefined)
        this.$refs.vFormRef.setFieldValue('workTeamName', undefined)

        this.$refs.vFormRef.setFieldValue('workerId', '')
        this.$refs.vFormRef.setFieldValue('workerName', '')
      } else if (name == 'workDeptId') {
        this.$refs.vFormRef.setFieldValue('workDeptName', node.deptName)
        this.$refs['vFormRef'].getWidgetRef('workTeamId').loadOptions([])
        this.usersList = []
        await this.getDeptData({ bizStatus: '1', unitId: node.id }, 'workTeamId', 'children')
        await this.getUserListAll(node.id)
        this.$refs.vFormRef.setFieldValue('workTeamId', undefined)
        this.$refs.vFormRef.setFieldValue('workTeamName', undefined)

        this.$refs.vFormRef.setFieldValue('workerId', '')
        this.$refs.vFormRef.setFieldValue('workerName', '')
      } else if (name == 'workTeamId') {
        this.usersList = []
        this.$refs.vFormRef.setFieldValue('workTeamName', node.deptName)
        await this.getUserListAll(node.id)
        this.$refs.vFormRef.setFieldValue('workerId', '')
        this.$refs.vFormRef.setFieldValue('workerName', '')
      } else if (name == 'unitId') {
        this.$refs.vFormRef.setFieldValue('unitName', node.deptName)
      }
    },
    async getUserListAll(deptId) {
      const res = await userListAll({ deptId })
      this.usersList = res.data.list
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