<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="handleButton"></button-top>
    <div class="container_flex_form">
      <VFormRender ref="vFormRef" :form-data="formData"  :class="{'formRender_view': queryType === 'view'}">
        <template slot="design_p1">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="基本信息" />基本信息</p>
        </template>
        <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
            <attachmentTable businessType="32" ref="attachmentTable" :queryType="queryType" v-model="fileList">
            </attachmentTable>
          </div>
        </template>
      </VFormRender>
    </div>
    <toBeReviewed ref="toBereview" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import indexMixin from '@/views/mixins';
import { formFillInPage } from '@/api/form/form'
import {
  detail,
  submit
} from '@/api/projectManagement/productionDamage'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import attachmentTable from '@/views/components/attachmentTable'
export default {
  name: 'productionDamageOperate',
  dicts: ['MeasureUnit'],
  components: {
    toBeReviewed,
    VFormRender,
    attachmentTable
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
      queryAuditArr: null,
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
        { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
        { buttonName: '提交', buttonCode: 'submit', buttonIcon: 'Blue-Submit', type: 'view' }
      ],
      status: '',
      checked: false,
      isQuery: '',
      fileList: []
    }
  },
  computed: {
    ...mapGetters(['infoData'])
  },
  async created() {
    this.init()
  },
  methods: {
    // 表单按钮权限设置
    buttonShow({ buttonCode, type }) {
      if(buttonCode == 'submit' && ['2', '3'].includes(this.status)) {
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
      let { type, name, id, tableType = '1', auditArr = '', isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
      this.queryName = name
      this.tableType = tableType
      this.isQuery = isQuery

      this.$nextTick(async () => {
        this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true);
        await this.formFillInPage()
        this.$refs['vFormRef'].resetForm()
        this.getOperateDetail(id)
      })
    },
    // 加载表单配置项
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('productionDamageOperate').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    // 加载详情数据
    async getOperateDetail(id) {
      try {
        this.loading = true
        const { data } = await detail(id)
        this.status = data.status;
        this.$refs['vFormRef'].setFormData({ ...data });
        this.fileList = Array.isArray(data.fileList) ? data.fileList : []
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    // 顶部按钮事件处理器
    handleButton(buttonCode) {
      switch (buttonCode) {
        case 'cancel':
          this.handleCancel()
          break;
        case 'submit':
          this.handleSubmit(buttonCode)
          break  
        case 'pass':
        case 'reject':
          this.$refs.toBereview.init(buttonCode, this.queryAuditArr, this.queryName)
          break;
        default:
      }
    },
    handleSubmit(buttonCode) {
      const saveObj = {
          'submit': () => {
            this.$reviewerDialog({
              type: ACTIVITI_ASSUGNEE.MM_ZSD,
              multiple: false,
              success: (assignee) => {
                this.saveOrder(submit, [this.queryId], assignee)
              }
            })
          }
        }
        saveObj[buttonCode] && saveObj[buttonCode]()
    },
    async saveOrder(url, ids, assignee) {
      if (!this.resOk) {
        const res = await url({ids, assignee })
        res.success && this.$modal.msgSuccess(`${res.message}`)
        this.resOk = true
        this.handleCancel()
      }
    },
    // 取消事件处理器
    handleCancel() {
      this.$tab.closeOpenPage({ name: this.queryName })
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