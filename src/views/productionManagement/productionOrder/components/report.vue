<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="handleButton"></button-top>
    <div class="container_flex_form">
      <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv" @formChange="handleFormChange"
        :class="{ 'formRender_view': queryType === 'view' }">
        <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
            <attachmentTable ref="attachmentTable" businessType="34"
              :queryType="['2', '3'].includes(status) ? 'view' : queryType" v-model="fileList">
            </attachmentTable>
          </div>
        </template>
        <template slot="workshop">
          <reportDetail ref="workshopDetail" :queryType="queryType" @tableUpdate="tableUpdate"></reportDetail>
        </template>
      </VFormRender>
    </div>
    <toBeReviewed ref="toBereview" />
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import attachmentTable from '@/views/components/attachmentTable'
import indexMixin from '@/views/mixins';
import { formFillInPage } from '@/api/form/form'
import { getUserInfo } from '@/utils/user-info'
import { getToken } from '@/utils/auth'
import { generateUUID } from '@/utils'
import { saveReport, byRaw, detail, saveAndSubmit } from '@/api/projectManagement/productionReport'
import VFormRender from '@/components/form-render/index'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import reportDetail from './reportDetail.vue';

export default {
  name: 'productionOrderReport',
  components: {
    attachmentTable,
    VFormRender,
    toBeReviewed,
    reportDetail,
  },
  mixins: [indexMixin],
  data() {
    return {
      loading: false,
      queryId: '',
      queryName: '',
      queryType: '',
      formJson: {},
      formData: {},
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
        { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
        { buttonName: '退回上一步', buttonCode: 'rollbackToPrevious', buttonIcon: 'Blue-Cancel', type: '' },
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
        { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
        { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-NewDepartment', type: 'update, create' },
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
      queryRawId: '',
      bizStatus: '1',
      status: '',
      queryAuditArr: null,
      produceNum: '',
    }
  },
  computed: {
    ...mapGetters(['infoData'])
  },
  async created() {
    this.init()
  },
  methods: {
    handleFormChange(fieldName, newval, oldval) {
      // 实际生产数量 completionRate produceNum
      if (fieldName == 'finishNum') {
        if (newval < 0) {
          this.$refs['vFormRef'].setFieldValue("finishNum", 0);
        } else {
          // 合格品数量
          const qualifiedNum = Number(this.$refs['vFormRef'].getFieldValue("qualifiedNum") || 0);
          // 不良品数量
          const unqualifiedNum = Number(this.$refs['vFormRef'].getFieldValue("unqualifiedNum") || 0);
          // 预计生产数量
          const produceNum = Number(this.$refs['vFormRef'].getFieldValue("produceNum") || 0);
          // 生产完工率
          this.$refs['vFormRef'].setFieldValue("completionRate", ((newval / produceNum) * 100).toFixed(0));
          this.$refs['vFormRef'].setFieldValue("qualifiedNum", newval - unqualifiedNum);
        }

        // if (newval < qualifiedNum) {
        //   this.$refs['vFormRef'].setFieldValue("unqualifiedNum", 0);
        //   this.$refs['vFormRef'].setFieldValue("qualifiedNum", 0);
        // } else {
        //   // const val = Number(newval) - Number(qualifiedNum)
        //   // this.$refs['vFormRef'].setFieldValue("scrapNum", val);
        //   this.$refs['vFormRef'].setFieldValue("qualifiedNum", newval - unqualifiedNum);
        // }

      }
      // 合格数量
      if (fieldName == 'qualifiedNum') {
        const finishNum = Number(this.$refs['vFormRef'].getFieldValue("finishNum") || 0);
        if (newval <= finishNum) {
          this.$refs['vFormRef'].setFieldValue("unqualifiedNum", finishNum - newval)
        } else {
          this.$nextTick(() => {
            this.$refs['vFormRef'].setFieldValue("qualifiedNum", finishNum)
            this.$refs['vFormRef'].setFieldValue("unqualifiedNum", 0);
          })

        }
        // if (newval > finishNum) {
        //   this.$refs['vFormRef'].setFieldValue("qualifiedNum", finishNum);
        //   this.$refs['vFormRef'].setFieldValue("unqualifiedNum", 0);
        // } else {
        //   const val = Number(finishNum) - Number(newval)
        //   this.$refs['vFormRef'].setFieldValue("unqualifiedNum", val);
        // }
      }
    },
    // 加载表格配置项
    async menuProperty(menuId, prop) {
      this[prop] = await this.$store.dispatch('menuProperty', menuId)
     
    },
    // 表单按钮权限设置
    buttonShow({ buttonCode, type }) {
      if (buttonCode === 'rollbackToPrevious') {
        const query = this.isDialog ? this.dialogQuery : this.$route.query
        return query.name === 'audit' && query.type === 'view' && Array.isArray(this.queryAuditArr)
          && this.queryAuditArr.length === 1 && !!this.queryAuditArr[0]?.taskId
          && this.buttonShow({ buttonCode: 'reject', type })
      }
      if (['saveSubmit', 'save'].includes(buttonCode) && ['3'].includes(this.status)) {
        return false
      }
      if (type.includes(this.queryType) && ['saveSubmit'].includes(buttonCode) && !this.queryAuditArr) {
        return true
      }
      if (type.includes(this.queryType) && !['saveSubmit', 'edit'].includes(buttonCode)) {
        return true
      }
      if (['edit', 'saveSubmit'].includes(buttonCode) && (!['0', '1'].includes(this.status))) {
        return false
      }
      // if (['saveSubmit'].includes(buttonCode) && ['0', '1'].includes(this.status)) {
      //   return true
      // }
      if (['edit'].includes(buttonCode) && ['0', '1'].includes(this.status) && this.queryType == 'view') {
        return true
      }
      if (type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(buttonCode))) {
        return true
      }
      return false
    },
    // 加载初始化数据
    async init() {
      let { type, name, rawId, id, auditArr } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
     
      this.queryRawId = rawId || ''
      this.queryId = id || ''
      this.queryName = name
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
      this.$nextTick(async () => {
        this.$refs['vFormRef'].resetForm()
        await this.formFillInPage()
        await this.getOperateDetail()
        this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true)
      })
    },
    // 加载表单配置项
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('productionReport').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    // 加载详情数据
    async getOperateDetail() {
      try {
        this.loading = true
        const req = !!this.queryRawId ? byRaw : detail
        const id = !!this.queryRawId ? this.queryRawId : this.queryId
        const { data } = await req(id)
        const { detailList, fileList, status, actualEndDate = '', actualStartDate = '', planStartDate = '', planEndDate = '', ...form } = data
        this.status = status
        this._otherData = data
        this.$refs['vFormRef'].setReadMode(true);
        if (!['2', '3'].includes(this.status)) {
          this.$refs['vFormRef'].setReadMode(false);
        }
        if (!!this.queryRawId && !['2', '3'].includes(this.status)) {
          this.queryType = 'update';
        }
        // 报告来源是手动 自动初始化
        if (!form.finishNum && form.reportSource == '1') {
          form.finishNum = form.produceNum
        }
        if (!form.qualifiedNum && form.reportSource == '1') {
          form.qualifiedNum = form.produceNum
        }
        const formData = {
          ...form,
          status: status,
          completionRate: (form.finishNum / form.produceNum).toFixed(0) * 100,
          actualEndDate: actualEndDate ? moment(actualEndDate).format('YYYY-MM-DD') : null,
          actualStartDate: actualStartDate ? moment(actualStartDate).format('YYYY-MM-DD') : null,
          planStartDate: planStartDate ? moment(planStartDate).format('YYYY-MM-DD') : null,
          planEndDate: planEndDate ? moment(planEndDate).format('YYYY-MM-DD') : null,
          produceCode: form.orderCode
        }

        this.$refs['vFormRef'].setFormData(formData);
        this.$refs['vFormRef'].setFieldValue("produceCode", form.produceCode);
        this.fileList = !!fileList.length ? fileList.map(f => ({ ...f, uid: generateUUID() })) : []
        this.produceNum = form.produceNum
        this.$refs.workshopDetail.init(detailList)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    // 表格按钮事件处理器
    handleTableButton(buttonCode, _1, _2, _3, row) {
      if (buttonCode === 'choiceMaterial') {
        this.$refs.choiceMaterial.init(null, this.materialList);
      } else if (buttonCode === 'deleteMaterial') {
        this.materialList = this.materialList.filter(item => item.uid != row.uid)
      } else if (buttonCode === 'choicePlan') {
        this.$refs.choicePlan.init(null, this.productList);
      } else if (buttonCode === 'deletePlan') {

      } else if (buttonCode === 'choiceBom') {
        this.$refs.choiceBom.init(null, this.productList);
      } else if (buttonCode === 'refurbish') {

      } else if (buttonCode === 'query') {

      }
    },


    // 顶部按钮事件处理器
    handleButton(buttonCode) {
      if (buttonCode === 'rollbackToPrevious') {
        this.$refs.toBereview.init('rollbackToPrevious', this.queryAuditArr, this.queryName || this.name)
        return
      }
      switch (buttonCode) {
        case 'cancel':
          this.handleCancel()
          break;
        case 'edit':
          this.queryType = 'update';
          this.$refs['vFormRef'].setReadMode(false);
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
        this.loading = true
        const formData = await this.$refs.vFormRef.getFormData()
        const other = this._otherData || {}
        const param = {
          ...other,
          ...formData,
          fileList: this.fileList,
          detailList: this.detailList
        }
        const saveObj = {
          'save': () => { this.saveOrder(saveReport, param) },
          'saveSubmit': () => {
            this.$reviewerDialog({
              type: ACTIVITI_ASSUGNEE.MM_WGBG,
              multiple: false,
              success: (assignee) => {
                this.saveOrder(saveAndSubmit, param, assignee)
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
        const valid = await this.$refs.workshopDetail.$refs.elForm.validate()
        if (!valid) {
          this.$modal.msgError('请填写完整的车间信息')
          return
        }
        const detailList = this.$refs.workshopDetail.tableData.detailList
        const res = await url({ ...param, assignee, detailList })
        res.success && this.$modal.msgSuccess(`${res.message}`)
        this.resOk = true
        this.handleCancel()
      }
    },
    tableUpdate(data) {
      let finishNum = data.map(item => item.finishNum).reduce((prev, next) => prev + next, 0)
      if (finishNum) {
        this.$refs['vFormRef'].setFieldValue("finishNum", finishNum)
      }
      let qualifiedNum = data.map(item => item.qualifiedNum).reduce((prev, next) => prev + next, 0)
      if (qualifiedNum) {
        this.$refs['vFormRef'].setFieldValue("qualifiedNum", qualifiedNum)
      }
      if (finishNum && qualifiedNum) {
        let unqualifiedNum = finishNum - qualifiedNum
        this.$refs['vFormRef'].setFieldValue("unqualifiedNum", unqualifiedNum)
      }
      let reworkNum = data.map(item => item.reworkNum).reduce((prev, next) => prev + next, 0)
      this.$refs['vFormRef'].setFieldValue("reworkNum", reworkNum)
      if (finishNum) {
        this.$refs['vFormRef'].setFieldValue("completionRate", (finishNum / this.produceNum * 100).toFixed(2))
      }
    }
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