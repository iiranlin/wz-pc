<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
    <div :class="{ container_flex_form: true }">
      <VFormRender :form-json="formJson" :form-data="formData" :option-data="optionData" ref="vFormRef"
        :global-dsv="globalDsv" :class="{ formRender_view: true }">
        <template #table>
          <detailTable ref="itemTableRef" :tableData="tableData" />
        </template>
      </VFormRender>
      <toBeReviewed ref="toBereview" />
      <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
    </div>
  </div>
</template>

<script>
import * as Api from '@/api/prodmgr-inv/project/itemAudit.js'
import * as SectionApi from '@/api/prodmgr-inv/project/section.js'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import workFlowView from '@/components/workFlowView'

import VFormRender from '@/components/form-render/index'
import { formFillInPage } from '@/api/form/form'
import { getToken } from '@/utils/auth'
import attachmentTable from '@/views/components/attachmentTable'
import detailTable from './detailTable.vue'
import { mapState } from 'vuex'
import dayjs from 'dayjs'
import router from '@/router';

export default {
  // 需求审核详情
  components: {
    VFormRender,
    attachmentTable,
    detailTable,
    toBeReviewed,
    workFlowView
  },
  data() {
    return {
      selectedRow: null,
      workFlowViewVisible: false,
      loading: false,
      title: '新增',
      checked: false,
      fileList: [],
      formJson: {
      },
      formData: {},
      optionData: {},
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: '24'
      },
      lineOptions: [],
      constructionCompanyOptions: [],
      supervisionUnitOptions: [],
      materialAgentCompanyOptions: [],
      // 菜单按钮、字段等数据
      buttonTop: [
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
        // { buttonName: '修改后通过', buttonCode: 'passEdit', buttonIcon: 'Blue-Edit', type: '' },
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
        // { buttonName: '修改', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
        { buttonName: '流程查看', buttonCode: 'flowSee', buttonIcon: 'Blue-Flow', type: '' }
      ],
      constructionOptions: [],
      selectRows: [],
      tableData: [],
      detail: {}
    }
  },
  computed: {
    type() {
      return this.$route.query.type
    },
    id() {
      return this.$route.query?.id || ''
    },
    projectId() {
      return this.$route.query?.projectId || ''
    },
    ...mapState(['request']),
    queryAuditArr() {
      return JSON.parse(this.$route.query.auditArr || '[]')
    },
    name() {
      return this.$route.query?.name || ''
    }
  },

  mounted() {

    if (['view', 'update'].includes(this.type)) {
      this.updateInit(this.id)
      return
    }

    if (this.type === 'create') {
      this.init()
      return
    }

  },
  methods: {
    async getCurrentSection() {
      const res = await SectionApi.getCurrentSection()
      this.sectionInfo = res.data
      this.$refs.vFormRef.setFormData({
        sectionName: this.sectionInfo.sectionName,
        title: this.sectionInfo.constructionCompany + this.sectionInfo.sectionName + dayjs().format('YYYY年MM月') + '甲供物资需求'
      })
    },


    //初始化
    init() {
      this.$nextTick(async () => {
        this.title = "新建";
        await this.formFillInPage()
        this.getCurrentSection()

      });
    },
    // 编辑初始化
    async updateInit(id) {
      await Api.detail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";
          await this.formFillInPage()
          this.tableData = data.details
          this.$refs.vFormRef.setFormData({ ...data, createDate: dayjs(data.createDate).format('YYYY-MM-DD HH:mm') })
          this.detail = data
          //   form action
          this.$refs.vFormRef.setReadMode(true)

        });
      });
    },

    async newButton(buttonCode) {
      if (buttonCode === 'cancel') {
        this.cancel()
      } else if (buttonCode === 'pass') {
        this.$refs.toBereview.init('pass', this.queryAuditArr, this.name)
      } else if (buttonCode === 'reject') {
        this.$refs.toBereview.init('reject', this.queryAuditArr, this.name)
      } else if (buttonCode === 'passEdit') {
        this.$refs.toBereview.init('passEdit', this.queryAuditArr, this.name, [this.id])
      } else if (buttonCode === 'edit') {
        this.$tab.closePage(router.currentRoute)
        this.$router.push({
          name: 'requestUpdate',
          query: {
            id: this.id,
            type: 'update',
            from: 'list'
          }
        })

      } else if (buttonCode === 'flowSee') {
        this.workFlowViewVisible = true
        this.selectedRow = { businessId: this.id }
      }

    },
    cancel() {
      this.$tab.closeOpenPage(true)
    },

    buttonShow(item) {
      //   const status = {
      //   0: "已驳回",
      //   1: "未提交",
      //   2: "已提交",
      //   3: "已生效",
      // };
      if (item.buttonCode === 'save') {
        return this.type !== 'view'
      }

      if (item.buttonCode === 'cancel') {
        return true
      }
      // 修改
      if (item.buttonCode === 'edit') {
        return ['0'].includes(this.detail.status)
      }
      // 同意
      if (item.buttonCode === 'pass') {
        return ['2'].includes(this.detail.status)
      }
      // 修改后同意
      // if (item.buttonCode === 'passEdit') {
      //   return ['2'].includes(this.detail.planStatus)
      // }
      // 不同意
      if (item.buttonCode === 'reject') {
        return ['2'].includes(this.detail.status)
      }

      // 已提交、已生效、修改后同意、已驳回、允许查看流程
      // 流程查看 
      if (item.buttonCode === 'flowSee') {
        return !['1'].includes(this.detail.status) && ['handle', 'toBeDeal', 'audit'].includes(this.name)
      }


      return false
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('itemAuditDetail').then(res => {

          this.$refs['vFormRef'].setFormJson(res.data)
          //   form action
          this.$refs['vFormRef'].setReadMode(true)


          resolve(true)
        })
      })
    },


  },
}
</script>

<style lang="scss" scoped>
.slotIcon-color-content {
  color: red;
}

.slotIcon-color {
  color: #1890ff;
}

.ml-20 {
  margin-left: 20px !important;
}

.mt-20 {
  margin-top: 20px !important;
}

::v-deep .label-right-align .el-form-item__label {
  text-align: right;
}
</style>