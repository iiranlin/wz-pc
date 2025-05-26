<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
      @newButton="handleButton"></button-top>
    <div class="container_flex_form">

      <el-switch v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
      </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" @appendButtonClick="handleAppendButtonClick"
        :class="{ 'formRender_view': queryType === 'view' }" @selectChange="handleFormChange"
        @treeSelectSelect="treeSelectSelect" @formChange="handleFormChange">
        <template v-slot:rawList>
          <div style="height: 400px;display: flex;flex-direction: column;">
            <button-top v-if="procedureDatailProperty.buttonTop && queryType != 'view'"
              :buttonTopData="procedureDatailProperty.buttonTop" @newButton="handleTableButton" />
            <el-table ref="procedureTableIndex" border :data="procedureList" row-key="uid" @row-click="rawRowClick"
              height="450" :styles="{ width: '100%', margin: '0', 'overflow-y': 'auto' }">
              <el-table-column align="center" width="50">
                <template slot-scope="{row}">
                  <el-radio v-model="currentProcedureRow" :label="row" class="table-radio"></el-radio>
                </template>
              </el-table-column>
              <el-table-column type="index" width="70" label="排序" align="left">
                <template slot-scope="scope">
                  <span class="sortHandle">{{ scope.$index + 1 }}
                    <i class="el-icon-rank"></i>
                  </span>
                </template>
              </el-table-column>
              <el-table-column :prop="field.fieldCode" :align="field.align" :label="field.fieldName"
                v-for="field in procedureDatailProperty.fields" :key="field.fieldCode">
                <template slot-scope="{row}">
                  <span v-if="field.fieldCode == 'processType'">{{ row.processType |
                    orderTypeFilter(dict.type.processType) }}</span>
                  <span v-else-if="field.fieldCode == 'fileList'">
                    <el-link :disabled="!row.fileList || !row.fileList.length"
                      :type="!row.fileList || !row.fileList.length ? 'info' : 'primary'"
                      @click.stop="handlePreview(row.fileList)">查看</el-link>
                  </span>
                  <span v-else>{{ row[field.fieldCode] }}</span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="queryType != 'view' && procedureDatailProperty.buttonRow && !!procedureDatailProperty.buttonRow.length"
                fixed="right" align="center" label="操作" width="120">
                <template slot-scope="{row}">
                  <el-button v-for="action in procedureDatailProperty.buttonRow" :key="action.buttonCode"
                    @click.native.prevent="handleTableButton(action.buttonCode, '', '', '', row)" type="text"
                    size="small">
                    {{ action.buttonName }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
        <template v-slot:material>
          <div style="height: 400px;display: flex;flex-direction: column;" :key="materKey">
            <button-top v-if="materialDatailProperty.buttonTop && queryType != 'view'"
              :buttonTopData="materialDatailProperty.buttonTop" @newButton="handleTableButton" />
            <table-index numberShow :styles="{ width: '100%', height: '454px', margin: '0', 'overflow-y': 'auto' }"
              ref="tableIndex" @handleSelectionChange="handleSelectionMaterialChange"
              :visibleAction="queryType != 'view'" :tableData="currentProcedureRow.rawList" row-key="uid"
              :property="materialDatailProperty" @handleButton="handleTableButton">
            </table-index>
          </div>
        </template>
      </VFormRender>
    </div>
    <choice-material ref="choiceMaterial" :propsFormData="propsFormMaterData"
      @choiceMaterialClick="handleConfirmMaterial" />
    <choice-material ref="choicePlan" :singleMode="true" @choiceMaterialClick="handleConfirmPlan" />
    <choice-bom ref="choiceBom" :singleMode="true" @change="handleConfirmBom" />
    <choice-procedure ref="choiceProcedure" @change="handleConfirmProcedure" />
    <Dialog title="提示" :visible.sync="upLevelVisible" width="40%">
      <div style="text-align: center;margin-bottom: 20px;">本次工艺变更是否需要升级版本？</div>
      <div>
        <el-radio v-model="upLevel" label="1"></el-radio>

        .升级为新版本，新版本审批通过后生效；老版本在历史版本中查看。
      </div>
      <div style="margin-top: 10px;">
        <el-radio v-model="upLevel" label="2"></el-radio>
        .不升级新版本，工艺将不审核直接被修改；如果变更前该版本已经被业务环节引用，比如被生产引用，查看该版本号的工艺时，将不能查看变更前的工艺信息，只能查看变更后的工艺信息。
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleButton('save')">确 定</el-button>
        <el-button @click="upLevelVisible = false">取 消</el-button>
      </div>
    </Dialog>
    <fileList ref="fileList" />
    <toBeReviewed ref="toBereview" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import choiceMaterial from '@/views/components/choice-material'
import choiceProcedure from '@/views/components/choice-procedure'
import choicePlan from '@/views/components/choice-plan'
import choiceBom from '@/views/components/choice-bom'
import indexMixin from '@/views/mixins';
import Sortable from "sortablejs";
import fileList from '@/views/components/fileList/index'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import { formFillInPage } from '@/api/form/form'
import {
  saveChange,
  saveModify,
  saveCreate,
  saveSubmit,
  detail,
} from '@/api/prodmgr-mm/processRoute'
import { getUserInfo } from '@/utils/user-info'
import { menuConfig, generateUUID } from '@/utils'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
export default {
  name: 'processRouteCreate',
  components: {
    choiceMaterial,
    choicePlan,
    choiceBom,
    choiceProcedure,
    fileList,
    toBeReviewed,
    VFormRender
  },
  mixins: [indexMixin],
  dicts: ['processType'],
  data() {
    return {
      propsFormMaterData: {},
      selectRow: null,
      materKey: '1',
      loading: false,
      queryId: '',
      queryName: '',
      queryType: '',
      formJson: {},
      formData: {},
      propsFormData: {},
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update, change' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'change', buttonIcon: 'Blue-Save', type: 'change' },
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
        { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
        { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
        { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'update, create,view' }
      ],

      userInfo: getUserInfo(),
      activeOtherName: 'material',
      materialDatailProperty: {}, // MENU_PRODUCT_MATER_TABLE
      procedureDatailProperty: {},// MENU_PRODUCT_PROCEDURE_TABLE
      procedureList: [],
      currentProcedureRow: { rawList: [] },
      upLevel: '1',
      upLevelVisible: false,
      status: '',
      checked: false,
      queryAuditArr: null,
    }
  },
  watch: {
  },
  computed: {
    ...mapGetters(['infoData']),
  },
  async created() {
    this.init()
  },
  methods: {
    checkoutStatus(flag) {
      const widgets = ['bomName', 'grid59496', 'grid76267', 'grid63971', 'grid27037', 'pathCode', 'version']
      if (flag) {
        this.$refs.vFormRef.hideWidgets(widgets)
      } else {
        this.$refs.vFormRef.showWidgets(widgets)
      }
    },
    async handlePreview(fileList) {
      try {
        this.$refs.fileList.init(fileList)

      } catch (err) {
        console.error(err)
      }


    },
    handleTopButtonDisabled() {
      return true
    },
    // 加载表格配置项
    async menuProperty(menuId, prop) {
      let property = await this.$store.dispatch('menuProperty', menuId)
      if (prop === 'materialDatailProperty') {
        property.buttonTop = [
          { buttonCode: 'materialAdd', buttonName: '新增', isTop: 1 },
        ]
        property.buttonRow = [
          { buttonCode: 'materialRemove', buttonName: '删除', isRow: 1, isTop: '' }
        ]
        property.fields.forEach((field) => {
          if (['matlCode', 'matlName', 'matlType', 'matlUnit'].includes(field.fieldCode)) {
            field.isHide = 0
          } else {
            field.isHide = 1
          }
        })
      }
      if (prop === 'procedureDatailProperty') {
        property.buttonTop = [
          { buttonCode: 'procedureAdd', buttonName: '新增', isTop: 1 },
        ]
        property.buttonRow = [
          { buttonCode: 'procedureRemove', buttonName: '删除', isRow: 1 }
        ]
        property.fields.forEach((field) => {
          if (['sort'].includes(field.fieldCode)) {
            field.listSlot = 1
          }
        })
      }
      this[prop] = property
    },
    // 表单按钮权限设置
    buttonShow({ buttonCode, type }) {
      if (['cancel'].includes(buttonCode) && type.includes(this.queryType)) {
        return true
      }
      if (['edit', 'saveSubmit'].includes(buttonCode) && type.includes(this.queryType) && ['2', '3'].includes(this.status)) {
        return false
      }
      if (type.includes(this.queryType) && ['saveSubmit'].includes(buttonCode) && !this.queryAuditArr) {
        return true
      }
      if (type.includes(this.queryType) && ['edit', 'saveSubmit'].includes(buttonCode) && !['3'].includes(this.status) && !this.queryAuditArr) {
        return true
      }
      if (type.includes(this.queryType) && !['saveSubmit', 'edit'].includes(buttonCode) && !this.queryAuditArr) {
        return true
      }
      if (this.queryAuditArr && ['pass', 'reject'].includes(buttonCode)) {
        return true
      } else {
        return false
      }
    },
    // 加载初始化数据
    async init() {
      let { type, name, id, auditArr } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryName = name

      this.$nextTick(async () => {
        this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true);
        this.$refs['vFormRef'].resetForm()
        await this.formFillInPage()
        this.$refs['vFormRef'].disableWidgets('bomName');
        if (this.queryType == 'change') {
          this.$refs['vFormRef'].showWidgets('changeNote');
          this.$refs['vFormRef'].disableWidgets('matlName');
          this.$refs['vFormRef'].disableWidgets('bomName');

        }

        await this.menuProperty(menuConfig.MENU_PRODUCT_PROCEDURE_TABLE, 'procedureDatailProperty');
        await this.menuProperty(menuConfig.MENU_PRODUCT_MATER_TABLE, 'materialDatailProperty');
        this.sortDrag()
        if (!['create'].includes(this.queryType)) {
          this.getOperateDetail(id)
        } else {
        }
      })
    },

    sortDrag() {
      let that = this
      this.$nextTick(() => {
        const table = this.$refs.procedureTableIndex.$el.querySelectorAll(".el-table__body-wrapper > table > tbody")[0];
        Sortable.create(table, {
          animation: 1000,
          handle: '.sortHandle',
          onEnd({ newIndex, oldIndex }) {
            // 拖拽排序数据
            that.procedureList.splice(newIndex, 0, that.procedureList.splice(oldIndex, 1)[0])
            const newArray = that.procedureList.slice(0)
            that.procedureList = [] // 必须有此步骤，不然拖拽后回弹
            that.$nextTick(function () {
              that.procedureList = newArray // 重新赋值，用新数据来刷新视图
              this.updateIndex(that.procedureList)//更改列表中的序号，使序号1.2.3.4.....显示，不然就是行拖拽后乱序显示如:3.2.4.1...
            })
          }
        });
      })
    },
    updateIndex(arr) {
      arr.forEach((item, index) => {
        item.sort = index + 1;
      });
    },
    // 加载表单配置项
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('processRouteOperate').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },


    // 加载详情数据
    async getOperateDetail(id) {
      try {
        this.loading = true
        const { data: { rawList = [], ...form } } = await detail(id)
        this.$refs['vFormRef'].setFormData(form);
        this.propsFormMaterData.bomId = form.bomId || ''
        this.status = form.status
        this.procedureList = !!rawList.length ? rawList.map(item => ({ ...item, uid: generateUUID() })) : []
        if (!!this.procedureList.length) {
          this.currentProcedureRow = this.procedureList[0]

        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    rawRowClick(row) {
      this.currentProcedureRow = row
    },

    // 表单追加按钮事件处理器
    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
      if (name === 'matlName') {
        const matlCode = this.$refs['vFormRef'].getFieldValue('matlCode')
        let row = []
        if (matlCode) {
          row.push({ matlCode })
        }
        const bomCode = this.$refs['vFormRef'].getFieldValue('bomCode')
        this.$refs.choicePlan.init(!!row.length ? row[0].matlCode : null, [], [])

      } else if (name === 'bomCode') {
        const code = this.$refs['vFormRef'].getFieldValue('bomCode')
        const matlCode = this.$refs['vFormRef'].getFieldValue('matlCode')
        const query = {}

        if (!!matlCode) {
          query.matlCode = matlCode
        }
        this.$refs.choiceBom.init(code, [], query)
      }
    },
    // 表单字段改变事件处理器
    handleFormChange(fieldName, newValue) {
      if (fieldName === 'borrowUserId') {
        if (newValue) {
          const optionLabel = this.$refs['vFormRef'].getWidgetRef('borrowUserId').optionLabel
          this.$refs['vFormRef'].setFieldValue('borrowUserName', optionLabel)
        } else {
          this.$refs['vFormRef'].setFieldValue('borrowUserName', '')
        }
      } else if (fieldName == 'bomCode') {
        if (!newValue) {
          this.$refs['vFormRef'].setFieldValue('bomCode', '')
          this.$refs['vFormRef'].setFieldValue('bomId', '')
          this.propsFormMaterData.bomId = ''
        }
      } else if (fieldName == 'matlName') {
        const version = this.$refs['vFormRef'].getFieldValue('version')
        if (this.queryType === 'change' || !['', 'V001'].includes(version)) {
          this.$refs['vFormRef'].disableWidgets('matlName');
        } else {
          if (!newValue) {
            this.$refs['vFormRef'].setFieldValue('bomCode', '')
            this.$refs['vFormRef'].setFieldValue('bomId', '')
            this.propsFormMaterData.bomId = ''
            this.$refs['vFormRef'].setFieldValue('bomName', '')
            this.$refs['vFormRef'].disableWidgets('bomName');

          } else {

            const version = this.$refs['vFormRef'].getFieldValue('version')

            if (this.queryType != 'change' && ['', 'V001'].includes(version)) {
              this.$refs['vFormRef'].enableWidgets('bomName');
            }

          }
        }


      }
    },
    handleSelectionProcedureChange(ids, single, multiple, selection) {
      this._selectionProcedure = selection
    },
    handleSelectionMaterialChange(ids, single, multiple, selection) {
      this._selectionMaterial = selection
    },
    // 表格按钮事件处理器
    handleTableButton(buttonCode, _1, _2, _3, row) {
      if (buttonCode === 'materialAdd') {
        this.$refs.choiceMaterial.init(null, [], this.currentProcedureRow.rawList);
      } else if (buttonCode === 'deleteMaterial') {
        const arr = this.currentProcedureRow.rawList.filter(({ uid }) => row.uid != uid);
        this.currentProcedureRow.rawList = arr
      } else if (buttonCode === 'procedureAdd') {
        this.$refs.choiceProcedure.init(null, this.procedureList);
      } else if (buttonCode === 'procedureRemove') {

        for (let i = 0; i < this.procedureList.length; i++) {
          if (row.uid == this.procedureList[i].uid) {
            this.procedureList.splice(i, 1)
            const timer = setTimeout(() => {
              clearTimeout(timer)
              this.currentProcedureRow = this.procedureList[0] ? this.procedureList[0] : { rawList: [] }
            }, 300);

            break
          }
        }
      } else if (buttonCode == 'materialRemove') {
        const raw = this.currentProcedureRow
        const rawList = raw && Array.isArray(raw.rawList) ? raw.rawList.filter(item => item.uid != _2[0].uid) : []
        this.$set(this.currentProcedureRow, 'rawList', rawList)
      }
    },
    // 物料选择事件
    handleConfirmMaterial(data = []) {
      const arr = data.map(item => ({ ...item, processId: this.currentProcedureRow.processId, processName: this.currentProcedureRow.processName, uid: generateUUID() }))
      this.currentProcedureRow.rawList = this.currentProcedureRow.rawList.concat(arr)
      for (let i = 0; i < this.procedureList.length; i++) {
        if (this.procedureList[i]['uid'] === this.currentProcedureRow['uid']) {
          this.$set(this.procedureList, i, this.currentProcedureRow)
          break
        }
      }
    },
    // 计划选择事件
    handleConfirmPlan(data) {
      this.$refs['vFormRef'].setFieldValue('matlCode', data.matlCode)
      this.$refs['vFormRef'].setFieldValue('matlName', data.matlName)
      this.$refs['vFormRef'].setFieldValue('bomCode', '')
      this.$refs['vFormRef'].setFieldValue('bomId', '')
      this.propsFormMaterData.bomId = ''
      this.$refs['vFormRef'].setFieldValue('bomName', '')

    },
    // BOM选择事件
    handleConfirmBom(data = null) {
      if (!!data) {
        this.$refs['vFormRef'].setFieldValue('bomCode', data.bomCode)
        this.$refs['vFormRef'].setFieldValue('bomName', data.bomName)
        this.$refs['vFormRef'].setFieldValue('bomId', data.bomId)
        this.propsFormMaterData.bomId = data.bomId
        this.$refs['vFormRef'].setFieldValue('matlName', data.matlName)
        this.$refs['vFormRef'].setFieldValue('matlCode', data.matlCode)

      }
    },
    handleConfirmProcedure(data = []) {
      const arr = data.map(item => ({ ...item, rawList: [], uid: generateUUID() }))
      this.procedureList = this.procedureList.concat(arr)
      this.currentProcedureRow = this.procedureList[this.procedureList.length - 1]
    },
    // 顶部按钮事件处理器
    handleButton(buttonCode) {
      switch (buttonCode) {
        case 'change':
          this.upLevelVisible = true
          break;
        case 'cancel':
          this.handleCancel()
          break;
        case 'reject':
        case 'pass':
          this.$refs.toBereview.init(buttonCode, this.queryAuditArr, this.queryName)
          break;
        case 'save':
        case 'saveSubmit':
          this.handleSave(buttonCode)
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
          this.$modal.msgError('表单数据校验失败');
          return
        }
        if (!this.procedureList.length) {
          this.$modal.msgError('请选择工序信息')
          return
        }

        const formData = await this.$refs.vFormRef.getFormData()
        const param = {
          ...formData,
          rawList: this.procedureList
        }
        if (this.queryType == 'change') {
          param.upLevel = { 1: true, 2: false }[this.upLevel]
        }
        const saveObj = {
          'save': () => { this.saveOrder({ create: saveCreate, update: saveModify, change: saveChange }[this.queryType], param) },
          'saveSubmit': () => {
            this.$reviewerDialog({
              type: ACTIVITI_ASSUGNEE.MM_PATH,
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
      if (name === 'borrowDeptId') {
        this.$refs['vFormRef'].setFieldValue('borrowUserId', '')
        this.$refs['vFormRef'].setFieldValue('borrowUserName', '')
        this.$refs.vFormRef.setFieldValue('borrowDeptName', node.deptName)
        this.getUserListAll(node.id)
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

.sortHandle {
  cursor: move;
  display: inline-block;
  width: 100%;
}
</style>