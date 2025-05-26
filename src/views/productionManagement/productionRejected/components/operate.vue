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
            <attachmentTable ref="attachmentTable" businessType="33" :queryType="queryType" v-model="fileList">
            </attachmentTable>
          </div>
        </template>
        <template slot="detail">
          <div style="display: flex;flex-direction: column;">
            <button-top v-if="queryType != 'view' && tableType == '1'" :buttonTopData="datailProperty.buttonTop"
              @newButton="handleTableButton" />
            <div>
              <el-form ref="elForm" :model="validateTable" :rules="validateTable.rules">

                <el-table :data="validateTable.detailList" :height="screenHeight"
                  class="saleOrderOperateEltable table-sortable" @selection-change="handleSelectionChange">
                  <el-table-column align="center" width="50" type="selection" />
                  <el-table-column align="center" width="50" label="序号" type="index"></el-table-column>
                  <el-table-column align="center" label="来源生产单号" prop="orderRawCode" width="200"></el-table-column>
                  <el-table-column align="center" width="150" label="来源材料行行号" prop="rawMatlRowNum">
                    <template slot="header" slot-scope="scope">
                      来源材料行行号<span style="padding-left: 5px;font-size: 12px;"></span>
                      <tooltip content="取生产订单>材料信息>材料行的行号" />
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="来源出库单号" prop="outCode" width="150"></el-table-column>
                  <el-table-column align="center" width="150" label="物料编码" prop="matlCode"></el-table-column>
                  <el-table-column align="left" label="物料名称" prop="matlName"></el-table-column>
                  <el-table-column align="left" width="130" label="规格型号" prop="matlType"></el-table-column>
                  <el-table-column align="center" width="150" label="计量单位" prop="matlUnit">
                    <template slot-scope="{row}">
                      <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column align="right" width="80" label="需求数量" prop="needNum"></el-table-column>
                  <el-table-column align="right" width="180" label="已领数量（累计）" prop="outNum">
                    <template slot="header" slot-scope="scope">
                      已领数量（累计）<span style="padding-left: 5px;font-size: 12px;"></span>
                      <tooltip content="取已出库完成数量" />
                    </template>
                  </el-table-column>
                  <el-table-column align="right" width="200" label="本次退料数量" prop="returnNum ">
                    <template slot="header">
                      <span style="color:red">*</span>
                      <span>本次退料数量</span>
                    </template>
                    <template slot-scope="scope">
                      <el-form-item :prop="'detailList.' + scope.$index + '.returnNum'"
                        :rules="validateTable.rules.returnNum">
                        <el-input-number v-if="queryType !== 'view'" :precision="4" v-model="scope.row.returnNum"
                          :step="0.0001" :min="0" :max="scope.row.maxReturnNum" style="width: 100%" @input="handleAmountChange(scope.row)"></el-input-number>
                        <span v-else>{{ scope.row.returnNum }}</span>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <!-- <el-table-column align="left" width="150" label="单价（不含税，单位：元）" prop="price"></el-table-column>
                  <el-table-column align="left" width="150" label="金额（不含税，单位：元）" prop="amount">
                  </el-table-column> -->
                  <el-table-column align="center" width="150" label="操作" prop="materialCount" fixed="right"
                    v-if="queryType !== 'view' && tableType == '1'">
                    <template slot-scope="scope">
                      <el-button type="text" @click="handleDeleteRow(scope.row)">删行</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form>
            </div>


          </div>
        </template>
      </VFormRender>
    </div>
    <choice-production type="RETURN" ref="choiceProduction" @change="productionChange" :unitId="unitId" />
    <toBeReviewed ref="toBereview" />
    <selectReturnWarehouse type="productionRejected" ref="selectReturnWarehouse" @change="selectReturnWarehouseChange" :propsFormData="propsFormData" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getReturnQuoteDetail } from '@/api/projectManagement/productionOrder'
import attachmentTable from '@/views/components/attachmentTable'
import indexMixin from '@/views/mixins';
import choiceProduction from "@/views/components/choice-production"
import { formFillInPage } from '@/api/form/form'
import selectTree from '@/components/selectTree/index.vue'
import {
  saveOrder,
  saveSubmit,
  getDetail,
  detailView,
  saveDetailOrder,
} from '@/api/projectManagement/productionRejected'
import { getWarehouseTree } from '@/api/warehouseManage/inventoryMaintenance'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import { getUserInfo } from '@/utils/user-info'
import { getToken } from '@/utils/auth'
import { getUnitTree } from '@/api/system/dept'
import { generateUUID, uniqueArrByField } from '@/utils'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import VFormRender from '@/components/form-render/index'
import selectReturnWarehouse from '@/views/components/selectReturnWarehouse'
export default {
  name: 'productionRejectedOperate',
  dicts: ['MeasureUnit', 'unqualifiedReason'],
  components: {
    selectReturnWarehouse,
    attachmentTable,
    choiceProduction,
    selectTree,
    toBeReviewed,
    VFormRender,
    tooltip: () => import('@/components/tooltip')
  },
  mixins: [indexMixin],

  data() {

    return {
      validateTable: {
        detailList: [],
        rules: {
          returnNum: [{ required: true, message: '请输入本次退料数量', trigger: ['blur', 'change'] }],
        },
      },
      propsFormData: {},
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
      userInfo: getUserInfo(),
      datailProperty: {
        buttonTop: [
          { buttonCode: 'delete', buttonName: '删除' }
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
      unitId: '',
      loaded: true,
    }
  },
  computed: {
    ...mapGetters(['infoData'])
  },
  async created() {
    this.init()
  },
  methods: {
    handleAmountChange(row) {
      row['amount'] = row['price'] * row['returnNum']
    },
    checkoutStatus(flag) {
      const widgets = ['produceDeptName', 'grid27037', 'grid98090', 'returnCode']
      if (flag) {
        this.$refs.vFormRef.hideWidgets(widgets)
      } else {
        this.$refs.vFormRef.showWidgets(widgets)
      }
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
    handleDeleteRow(row) {
      this.validateTable.detailList = this.validateTable.detailList.filter(item => item.uid !== row.uid)
      this.asyncCodes([...this.validateTable.detailList])
    },
    asyncCodes(arr = []) {
      const codes =  uniqueArrByField(arr, 'outCode')
      if(!!codes.length) {
        this.$refs.vFormRef.setFieldValue('outCode', codes.join(','));
      }else {
        this.$refs.vFormRef.setFieldValue('outCode', '');
      }
    },
    async productionChange(data) {
      // const res = await getReturnQuoteDetail({outDetailIds: [data.orderRawId]})
      // this.validateTable.detailList = res.data.map(item => ({
      //   ...item,
      //   returnNum: item.returnNum || item.outNum,
      //   qualifiedNum: item.qualifiedNum || item.outNum,
      //   uid: generateUUID(),
      // }))
      
      this.$refs['vFormRef'].setFieldValue('outCode', '')
      this.$refs['vFormRef'].setFieldValue('orderRawId', data.orderRawId)
      this.$refs['vFormRef'].setFieldValue('orderRawCode', data.orderRawCode)
      this.$refs['vFormRef'].setFieldValue('orderId', data.orderId)
      this.$refs['vFormRef'].setFieldValue('produceDeptName', data.produceDeptName)
      this.$refs['vFormRef'].setFieldValue('produceDeptId', data.produceDeptId)
    },
    // 确认选中项目事件
    handleConfirmProject(row) {
      this.$refs['vFormRef'].setFormData({ ...row, projectId: row.id });
    },

    // 表单按钮权限设置
    buttonShow({ buttonCode, type }) {
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
      let { type, name, id, tableType = '1', auditArr, ids, isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
      this.queryName = name
      this.tableType = tableType
      this.isQuery = isQuery
      this.getWarehouseTree()
      this.$nextTick(async () => {
        await this.formFillInPage()
        this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true);
        this.$refs['vFormRef'].resetForm()
        await this.getUnitTree()
        if (this.tableType != '1') {
          this.$refs['vFormRef'].hideWidgets(['card38733'])
        }
        if (['update', 'view'].includes(this.queryType)) {
          this.getOperateDetail(id, ids)
        }
        'create' == this.queryType && this.initUnitInfo()
      })
    },
    // 加载表单配置项
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('productionRejected').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    async getUnitTree() {
      const res = await getUnitTree({ status: 0 })
      this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
    },
    // 部门树选择
    async treeSelectSelect(vm, node) {
      let {
        field: {
          options: { name },
        },
      } = vm || {};
      if (name === 'unitId') {
        this.$refs.vFormRef.setFieldValue('unitName', node.deptName)
      }
    },
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
    // 加载详情数据
    async getOperateDetail(id, ids) {
      try {
        this.loading = true
        this.loaded = false
        const api = this.tableType == '2' ? detailView : getDetail;
        const ID = this.tableType == '2' ? { ids: ids.split(',') } : id;
        const { data } = await api(ID)
        if (this.tableType == '2') {
          this.validateTable.detailList = data.map(item => ({ ...item, uid: generateUUID() }))
        } else {
          const { detailList, fileList, ...form } = data
          this.status = form.status;
          this.unitId = form.unitId
          this.$refs['vFormRef'].setFormData({ ...form });
          this.fileList = !!fileList.length ? fileList.map(f => ({ ...f, uid: generateUUID() })) : []
          this.$nextTick(() => {
            this.validateTable.detailList = detailList.map(item => ({ ...item, uid: generateUUID() }))

          })
        }
       this.$nextTick(() => {
        this.loaded = true
       })

      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async selectReturnWarehouseChange(arr) {
     const {data} = await getReturnQuoteDetail({outDetailIds: arr.map(item => item.id)})
     const list = data.map(item => ({ ...item, uid: generateUUID() }))
      this.validateTable.detailList = this.validateTable.detailList.concat(list)
      this.asyncCodes([...this.validateTable.detailList])
    },
    // 表单追加按钮事件处理器
    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
      if (name === 'orderRawCode') {
        if (!this.unitId) {
          this.$modal.msgError('请先选择所属组织')
          return
        }
        const produceCode = this.$refs.vFormRef.getFieldValue('orderRawCode');
        this.$refs.choiceProduction.init(produceCode);
        return
      } else if (name === 'outCode') {
        const produceCode = this.$refs.vFormRef.getFieldValue('orderRawCode');
        if(!produceCode) {
          this.$modal.msgError('请先选择生产单号')
          return
        }
        const orderRawId = this.$refs.vFormRef.getFieldValue('orderRawId');
        this.propsFormData = {sourceDetailId: orderRawId}
        this.$nextTick(() => {
          this.$refs.selectReturnWarehouse.init([])
        })
       
      }
    },
    // 表单字段改变事件处理器
    handleFormChange(fieldName, newValue, oldValue) {
      if (fieldName === 'borrowUserId') {
        if (newValue) {
          const optionLabel = this.$refs['vFormRef'].getWidgetRef('borrowUserId').optionLabel
          this.$refs['vFormRef'].setFieldValue('borrowUserName', optionLabel)
        } else {
          this.$refs['vFormRef'].setFieldValue('borrowUserName', '')
        }
      }
      if (fieldName == 'unitId' && newValue != oldValue && this.loaded) {
        this.unitId = newValue
        this.$refs.vFormRef.setFieldValue('orderRawCode', '')
        this.$refs.vFormRef.setFieldValue('orderId', '')
        this.$refs.vFormRef.setFieldValue('orderRawId', '')
        this.validateTable.detailList = []
      }
    },
    // 表格按钮事件处理器
    handleTableButton(buttonCode, _1, _2, _3, row) {
      if (buttonCode === 'delete') {
        const uids = this.selection.map(({ uid }) => uid)
        this.validateTable.detailList = this.validateTable.detailList.filter(item => !uids.includes(item.uid))
        this.asyncCodes([...this.validateTable.detailList])
      }
    },
    // 物料选择事件
    handleConfirmMaterial(data = []) {
      const arr = data.map(item => ({ ...item, uid: generateUUID(), lendNum: undefined }))
      this.validateTable.detailList = this.validateTable.detailList.concat(arr)
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
              type: ACTIVITI_ASSUGNEE.MM_RETURN,
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