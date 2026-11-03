<template>
  <div class="app-container container_flex">
    <button-top v-if="!this.isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
    <div class="container_flex_form">
       
        <el-switch v-if="!this.isDialog" v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
        </el-switch>
      <VFormRender
        ref="vFormRef"
        :form-data="formData"
        :global-dsv="globalDsv"
        @formChange="handleFormChange"
        @selectChange="selectChange"
        :class="{'formRender_view': queryType === 'view'}"
      >
        <template slot="design_p1">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />基本信息</p>
        </template>
      <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
              <attachmentTable ref="attachmentTable" businessType="35" :queryType="queryType" v-model="fileList"></attachmentTable>
          </div>
      </template>
      </VFormRender>
    </div>
    <toBeReviewed ref="toBereview"/>
  </div>
</template>

<script>
import attachmentTable from '@/views/components/attachmentTable'
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { getProfileDetail, profileSave, profileSaveSubmmit } from '@/api/saleManage/customerProfile'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import { generateUUID } from '@/utils'
import indexMixin from '@/views/mixins';
import {ACTIVITI_ASSUGNEE} from '@/utils/constant'
import VFormRender from '@/components/form-render/index'
export default {
  name: 'customerProfileAdd',
  mixins: [indexMixin],
  components: {
    toBeReviewed,
    attachmentTable,
    VFormRender
  },
  data() {
    return {
      loading: false,
      queryType: '',
      queryId: '',
      queryName: '',
      formJson: {},
      formData: {},
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
      queryAuditArr: null,
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: '01'
      },
      id: null,
      type: '',
      fileList: [],
      checked: false
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
        const arrId = ['csName', 'registerCapi', 'registerAddr', 'fileList', 'cuType', 'cuCode', 'marketArea',
        'industry', 'customerValue', 'creditRate', 'builDate', 'mainPro', 'card25989', 'card107889','card92047']
        if (this.checked) {
            this.$refs['vFormRef'].hideWidgets(arrId);
        } else {
            this.$refs['vFormRef'].showWidgets(arrId);
        }
    },
    buttonShow(item) {
      if (item.buttonCode === 'rollbackToPrevious') {
        const query = this.isDialog ? this.dialogQuery : this.$route.query
        return query.name === 'audit' && query.type === 'view' && Array.isArray(this.queryAuditArr)
          && this.queryAuditArr.length === 1 && !!this.queryAuditArr[0]?.taskId
          && this.buttonShow({ ...item, buttonCode: 'reject' })
      }
      if(['saveSubmit'].includes(item.buttonCode) && this.queryType === 'create'){
            return true
        }
        if(['saveSubmit', 'edit'].includes(item.buttonCode) && !['0', '1'].includes(this.formData.status)){
            return false
        }
        if(['saveSubmit', 'edit'].includes(item.buttonCode) && this.queryName == 'toBeDeal'){
            return false
        }
        if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
            return true
        } else {
            return false
        }
    },
    init() {
      let { type, id, auditArr, name } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
        this.queryName = name || 'customerProfile';
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;

      this.$nextTick(async() => {
        this.$refs['vFormRef'].resetForm()
        /*默认禁用销售负责人*/
        await this.formFillInPage()
        if (this.queryType === 'update') {
          this.$refs['vFormRef'].setReadMode(false)
          this.saleOrderOperateDetail()
        } else if (this.queryType === 'view') {
          this.$refs['vFormRef'].setReadMode(true)
          this.saleOrderOperateDetail()
        } else {
          this.$refs['vFormRef'].setReadMode(false)
        }
      })
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('customerProfileAdd').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    saleOrderOperateDetail() {
      this.loading = true
      getProfileDetail({ id: this.queryId }).then(({ data }) => {
        let showData = { ...data }
        this.formData = showData
        this.fileList = data.fileList && !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
        this.$refs['vFormRef'].setFormData(showData)
      }).finally(() => {
        this.loading = false
      })
    },
    newButton(buttonCode) {
      if (buttonCode === 'rollbackToPrevious') {
        this.$refs.toBereview.init('rollbackToPrevious', this.queryAuditArr, this.queryName || this.name)
        return
      }
      if (buttonCode === 'cancel') {
        this.cancel(this.queryName)
      } else if (buttonCode === 'save') {
        this.handleSave(buttonCode)
      } else if (buttonCode === 'edit') {
        this.$refs['vFormRef'].setReadMode(false)
        this.queryType = 'update'
      }else if (buttonCode === 'saveSubmit') {
        this.handleSave(buttonCode)
      }else if (buttonCode === 'pass') {
            this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName);
        } else if (buttonCode === 'reject') {
            this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName);
        }
    },
    handleSave(buttonCode) {
      try {
        this.$refs['vFormRef'].getFormData().then(formData => {
          formData.fileList = this.fileList
          let api = profileSave
          const param = Object.assign({}, formData)
          if(this.queryId) {
            param.id = this.queryId
          }
          const saveObj = {
              'save': () => { this.saveOrder(api, param) },
              'saveSubmit': () => {
                this.$reviewerDialog({
                  type: ACTIVITI_ASSUGNEE.SA_CU,
                  multiple: false,
                  success: (assignee) => {
                    this.saveOrder(profileSaveSubmmit, param, assignee)
                  }
                })
              }
            }
            saveObj[buttonCode] && saveObj[buttonCode]()

        }).catch(error => {
          this.$message.error(error)
        })
      }catch(err){
        console.error(err)
      }
    },
    async saveOrder(url, param, assignee) {
      if(!this.resOk) {
      const res = await url({ ...param, assignee })
      res.success && this.$modal.msgSuccess(`${res.message}`)
      this.resOk = true
      this.cancel(this.queryName)
      }
    },
    cancel(name) {
        // 关闭当前tabs
        this.$tab.closeOpenPage({ name });
    },
 
    handleFormChange() {
    },
    selectChange() {
    },
 
  }
}
</script>
<style lang="scss" scoped>
</style>
