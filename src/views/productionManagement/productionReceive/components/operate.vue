<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
      @newButton="handleButton"></button-top>
    <div class="container_flex_form">
      <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required"
        active-text="隐藏非必填项">
      </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" :class="{ 'formRender_view': queryType === 'view' }"
        @appendButtonClick="handleAppendButtonClick" @treeSelectSelect="treeSelectSelect" @formChange="formChange">
        <template slot="isOverPicking" slot-scope="scope">
          <div style="display: flex;flex-direction: column;">
            <el-radio-group v-model="scope.formModel.isOverPicking" v-if="queryType !== 'view'"
              @change="handleOverPicking">
              <el-radio label="0">否
              </el-radio>
              <el-radio label="1">是
                <tooltip content="只有领完之后才可超领，未领完之前不可超领" />
              </el-radio>
            </el-radio-group>
            <span v-else>
              {{ { 0: '否', 1: '是' }[scope.formModel.isOverPicking] }}
            </span>
          </div>
        </template>
        <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
            <attachmentTable ref="attachmentTable" businessType="39" :queryType="queryType" v-model="fileList">
            </attachmentTable>
          </div>
        </template>
        <template slot="detail">
          <div style="display: flex;flex-direction: column;">
            <button-top v-if="queryType != 'view' && tableType == '1'" :buttonTopData="datailProperty.buttonTop"
              @newButton="handleTableButton" />
            <div>
              <el-form ref="elForm" :model="validateTable">
                <el-table ref="tdetailRed" :data="validateTable.detailList" row-key="uid"
                  class="saleOrderOperateEltable table-sortable" @selection-change="handleSelectionChange">
                  <el-table-column  type="selection" width="55">
                  </el-table-column>
                  <el-table-column align="center" width="50" label="序号" type="index"></el-table-column>
                  <el-table-column align="center" width="190" label="来源生产单号" prop="orderRawCode"></el-table-column>
                  <el-table-column align="center" width="160" label="产品编码" prop="produceCode"></el-table-column>
                  <el-table-column align="left" width="160" label="产品名称" prop="produceName"></el-table-column>
                  <el-table-column align="center" width="90" label="是否成品" prop="isFinished">
                    <template slot-scope="{row}">
                      <span>{{ row.isFinished | orderTypeFilter(dict.type.YesNo) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" width="90" label="阶次" prop="mLevel"></el-table-column>
                  <el-table-column align="center" width="100" label="材料行行号" prop="rawMatlRowNum">
                  </el-table-column>
                  <el-table-column align="center" width="150" label="物料编码" prop="matlCode"></el-table-column>
                  <el-table-column align="left" label="物料名称" width="150" prop="matlName"></el-table-column>
                  <el-table-column align="left" width="130" label="规格型号" prop="matlType"></el-table-column>
                  <el-table-column align="center" width="150" label="计量单位" prop="matlUnit">
                    <template slot-scope="{row}">
                      <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) || row.matlUnit}}</span>
                    </template>
                  </el-table-column>
                  <el-table-column align="right" width="80" label="需求数量" prop="demandNum"></el-table-column>
                  <el-table-column align="right" width="200" label="已生成领料单数量(累计)" prop="totalPickingNum">
                    <template slot="header">
                      已生成领料单数量(累计)
                    </template>
                    <template slot-scope="scope">
                      <span v-if="['update'].includes(queryType) && !!scope.row.row">{{ scope.row.totalPickingNum -
                        scope.row.pickingNum }}</span>
                      <span v-else>{{ scope.row.totalPickingNum }}</span>

                    </template>
                  </el-table-column>
                  <el-table-column align="right" width="100" label="库存数量" prop="inventoryNum">
                    <template slot="header">
                      库存数量
                      <tooltip content="默认按合格品累计。"></tooltip>
                    </template>
                  </el-table-column>
                  <el-table-column align="right" width="200" label="本次领料数量" prop="pickingNum ">
                    <template slot="header">
                      <span style="color:red">*</span>
                      <span>本次领料数量</span>
                    </template>
                    <template slot-scope="scope">
                      <el-form-item :prop="'detailList.' + scope.$index + '.pickingNum'"
                        :rules="[{ required: true, message: '请输入本次领料数量', trigger: ['blur', 'change'] }]">
                        <el-input-number v-if="queryType !== 'view'" :precision="4" v-model="scope.row.pickingNum"
                          :step="0.0001" :min="0" :max="overPicking == 0 ? scope.row.maxPickingNum : 999999999"
                          style="width: 100%"></el-input-number>
                        <span v-else>{{ scope.row.pickingNum }}</span>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="需求日期" prop="demandDate" show-overflow-tooltip width="200">
                    <template slot="header" v-if="['create', 'update'].includes(queryType)">
                      <span>需求日期</span>
                    </template>
                    <template slot-scope="scope">
                      <el-form-item :prop="'detailList.' + scope.$index + '.demandDate'">
                        <el-date-picker style="width: 100%;" v-if="['create', 'update'].includes(queryType)"
                          v-model="scope.row.demandDate" type="date" format="yyyy-MM-dd"
                          value-format="timestamp"></el-date-picker>
                        <span v-else>{{ parseTime(scope.row.demandDate, '{y}-{m}-{d}') }}</span>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" width="150" label="操作" prop="materialCount" fixed="right"
                    v-if="queryType !== 'view' && tableType == '1'">
                    <template slot-scope="scope">
                      <el-button type="text" @click="handleDeleteRow(scope.$index)">删行</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form>
            </div>
          </div>
        </template>
      </VFormRender>
    </div>
    <choice-material ref="choiceMaterial" @choiceMaterialClick="handleConfirmMaterial" />
    <choice-production :propsFormData="propsFormData" :singleMode="false" :unitId="unitId" ref="choiceProduction"
      @change="productionChange" />
    <toBeReviewed ref="toBereview" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import attachmentTable from '@/views/components/attachmentTable'
import indexMixin from '@/views/mixins';
import choiceMaterial from "@/views/components/choice-material"
import choiceProduction from './choice-production'
import { formFillInPage } from '@/api/form/form'
import { deptTree, getUnitTree } from '@/api/system/dept'
import selectTree from '@/components/selectTree/index.vue'
import {
  saveOrder,
  saveSubmit,
  getDetail,
  detailView,
  saveDetailOrder,
} from '@/api/projectManagement/productionReview'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import { getUserInfo } from '@/utils/user-info'
import { generateUUID } from '@/utils'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import VFormRender from '@/components/form-render/index'
import { uniqueArrByField } from '@/utils'
import tooltip from '@/components/tooltip'
export default {
  name: 'productionReceiveOperate',
  dicts: ['MeasureUnit', 'unqualifiedReason', 'YesNo'],
  components: {
    attachmentTable,
    choiceProduction,
    choiceMaterial,
    selectTree,
    toBeReviewed,
    VFormRender,
    tooltip
  },
  mixins: [indexMixin],

  data() {
    const userInfo = getUserInfo()
    return {
      propsFormData: {
        isOverPicking: '0',
        produceDeptId: userInfo.deptId
      },
      validateTable: {
        detailList: [],

      },
      loading: false,
      queryId: '',
      queryName: '',
      queryType: '',
      formJson: {},
      formData: {},
      tableType: '1',
      overPicking: 0,
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
      userInfo: userInfo,
      datailProperty: {
        buttonTop: [

        ]
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
      isQuery: '',
      unitId: ''
    }
  },
  computed: {
    ...mapGetters(['infoData']),

  },
  async created() {
    this.init()
  },
  methods: {
   
    handleOverPicking(e) {
      this.propsFormData.isOverPicking = e
      this.$refs['vFormRef'].setFieldValue('isOverPicking', e)
    },
    formChange(key, value, oldValue) {
      if (!this.ready) {
        return
      }
      if (key === 'pickingType') {
        if (value == '2') {
          this.clearSomeData()
          this.$refs.vFormRef.hideWidgets(['isOverPicking'])
        } else {
          this.$refs.vFormRef.showWidgets(['isOverPicking'])
          this.showSomeData()
        }
      } else if (key == 'isOverPicking') {
        this.overPicking = value
        this.initTableData()
      } else if (key == 'produceDeptId') {
        this.initTableData()
      } else if (key == 'unitId' && value != oldValue) {
        this.unitId = value
        this.$refs['vFormRef'].setFieldValue('orderRawCode', '')
        this.validateTable.detailList = []
      } else if (key == 'orderRawCode') {
        if (!value) {
          this.validateTable.detailList = []
        }

      }
    },
    initTableData() {
      const isOverPicking = this.$refs['vFormRef'].getFieldValue('isOverPicking')
      const produceDeptId = this.$refs['vFormRef'].getFieldValue('produceDeptId')
      this.propsFormData = {
        isOverPicking: isOverPicking,
        produceDeptId: produceDeptId
      }
      this.validateTable.detailList = []
    },
    showSomeData() {
      this.$refs['vFormRef'].setFieldValue('isOverPicking', '0')
      this.datailProperty.buttonTop = [
        { buttonCode: 'query', buttonName: '存量查询' },
        { buttonCode: 'remove', buttonName: '删除' },
      ]
    },
    clearSomeData() {
      this.$refs['vFormRef'].setFieldValue('orderRawCode', '')
      this.$refs['vFormRef'].setFieldValue('isOverPicking', '')
      this.validateTable.detailList = []
      this.datailProperty.buttonTop = [
        { buttonCode: 'material', buttonName: '选择物料' },
        { buttonCode: 'query', buttonName: '存量查询' },
        { buttonCode: 'remove', buttonName: '删除' },
      ]
    },
    checkoutStatus(flag) {
      const widgets = ['pickingCode', 'pickingName', 'pickingType', 'isOverPicking', 'remarks', 'fileList']
      if (flag) {
        this.$refs.vFormRef.hideWidgets(widgets)
      } else {
        this.$refs.vFormRef.showWidgets(widgets)
      }
    },
    handleSelectionChange(rows) {
      this.selection = rows
    },
    getUnQuAreaCodeValue(valueId, node, index,) {
      if (node) {
        this.$set(this.validateTable.detailList, index, { ...this.validateTable.detailList[index], storageCode: node.code, storageId: node.id, storageName: node.name })
      } else {
        this.$set(this.validateTable.detailList, index, { ...this.validateTable.detailList[index], storageCode: '', storageId: '', storageName: '' })
      }
      this.$nextTick(() => {
        this.$refs.elForm.validateField('warehouseId')
      })
    },
    handleDeleteRow(idx) {
      this.validateTable.detailList = this.validateTable.detailList.filter((_, index) => idx !== index)
      this.setOrderRawId()
    },
    setOrderRawId() {
      const codes = uniqueArrByField(this.validateTable.detailList, 'orderRawCode')
      this.$refs['vFormRef'].setFieldValue('orderRawCode', codes.join(','))
    },
    productionChange(arr, flag = false) {
      this._cache = arr.length ? arr[0] : null

      this.validateTable.detailList =flag ? arr.map(item => ({ ...item, uid: generateUUID() })) : this.validateTable.detailList.concat(arr.map(item => ({ ...item, uid: generateUUID() })))
      this.setOrderRawId()
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
    mounted() {

    },
    // 加载初始化数据
    async init() {
      this.ready = true
      let { type, name, id, tableType = '1', auditArr = '', isQuery = '', ids = '' } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
      this.queryName = name
      this.tableType = tableType
      this.isQuery = isQuery
      this.$nextTick(async () => {
        await this.formFillInPage()
        this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true);
        this.$refs['vFormRef'].resetForm()
        await this.getDeptTreeData()
        await this.getUnitTree()
        if (this.tableType != '1') {
          this.$refs['vFormRef'].hideWidgets(['card1'])
        }
        if (['update', 'view'].includes(this.queryType)) {
          this.ready = false
          this.getOperateDetail(id, ids)

        } else {
          const { deptId, deptName, unitId, unitName, nickName, id: nickId } = this.userInfo

          this.$refs['vFormRef'].setFieldValue('isOverPicking', '0')
          this.$refs['vFormRef'].setFieldValue('produceDeptId', deptId)
          this.$refs['vFormRef'].setFieldValue('produceDeptName', deptName)
          this.initUnitInfo()
        }
      })
    },
    // 加载部门数据
    async getDeptTreeData() {
      const res = await deptTree({ bizStatus: '1' })
      this.$refs['vFormRef'].getWidgetRef('produceDeptId').loadOptions(res.data || [])
    },
    async getUnitTree() {
      const res = await getUnitTree({ status: 0 })
      this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
    },
    // 加载表单配置项
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('productionReceiveOperate').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    // 加载详情数据
    async getOperateDetail(id, ids) {
      try {
        this.loading = true
        const api = this.tableType == '2' ? detailView : getDetail;
        const ID = this.tableType == '2' ? { ids: ids.split(',') } : id;
        const { data } = await api(ID)
        if (this.tableType == '2') {
          this.validateTable.detailList = data.map(item => ({ ...item, uid: generateUUID() }))
        } else {
          const { detailList, fileList, ...form } = data
          this.propsFormData.isOverPicking = form.isOverPicking
          this.status = form.status;
          this.unitId = form.unitId
          if (data.pickingType == '2') {
            this.$refs.vFormRef.hideWidgets(['isOverPicking'])
          }
          this.$refs['vFormRef'].setFormData({ ...form });
          this.validateTable.detailList = detailList.map(item => ({ ...item, uid: generateUUID() }))
          this.fileList = !!fileList.length ? fileList.map(f => ({ ...f, uid: generateUUID() })) : []
        }
        this.$nextTick(() => {
          this.ready = true
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
      if (name === 'orderRawCode') {
        if (!this.unitId) {
          this.$modal.msgError('请先选择所属组织')
          return
        }
        const arr = [...this.validateTable.detailList]
        this.$refs.choiceProduction.init(null, arr);
        return
      }
    },

    // 表格按钮事件处理器
    async handleTableButton(buttonCode, _1, _2, _3, row) {
      if (buttonCode === 'material') {
        const orderRawCode = this.$refs['vFormRef'].getFieldValue('orderRawCode')
        if (!orderRawCode) {
          this.$modal.msgError('请先选择生产单号')
          return
        }
        this.$refs.choiceMaterial.init()
        this.validateTable.detailList = this.validateTable.detailList.filter(item => !uids.includes(item.uid))
      } else if (buttonCode == 'query') {
        const length = this.validateTable.detailList.length
        const pickingType = this.$refs['vFormRef'].getFieldValue('pickingType')
        if (!!length) {
          // const dataList = await this.matlInventory(this.validateTable.detailList)
          this.updateMatlInvByUnit(this.unitId, this.validateTable.detailList)
          // this.validateTable.detailList = dataList
          this.$modal.msgSuccess('存量查询成功')
        } else {
          this.$modal.msgError({ 1: '请先选择生产单号', 2: '请先选择物料' }[pickingType])
        }
      }else if(buttonCode == 'remove') {
        // this.$refs.tdetailRed.
        const uids = this.selection.map(item => item.uid)
        this.validateTable.detailList = this.validateTable.detailList.filter(item => !uids.includes(item.uid))
      }
    },
    // 物料选择事件
    handleConfirmMaterial(data = []) {
      let temp = {}
      if (this._cache) {
        temp = {
          orderRawCode: this._cache.orderRawCode,
          orderRawId: this._cache.orderRawCode,
          produceCode: this._cache.produceCode,
          produceName: this._cache.produceName
        }
      }
      const arr = data.map(item => ({ ...item, ...temp, id: generateUUID(), uid: generateUUID(), demandDate: '', pickingNum: '' }))
      const nextArr = this.validateTable.detailList.concat(arr)
      const pickingType = this.$refs['vFormRef'].getFieldValue('pickingType')
      pickingType == '2' && this.updateMatlInvByUnit(this.unitId, nextArr)
      this.validateTable.detailList = nextArr
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
        let param
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
        if (this.tableType == '2') {
          param = this.validateTable.detailList
        } else {
          const formData = await this.$refs.vFormRef.getFormData()
          param = {
            ...formData,
            fileList: this.fileList,
            detailList: this.validateTable.detailList
          }
        }
        this.loading = true
        const saveObj = {
          'save': async () => {
            if (this.tableType == '2') {
              await saveDetailOrder(param)
              this.handleCancel()
            } else {
              this.saveOrder(saveOrder, param)
            }
          },
          'saveSubmit': () => {
            this.$reviewerDialog({
              type: ACTIVITI_ASSUGNEE.MM_LLD,
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