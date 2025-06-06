<template>
  <div class="app-container container_flex">
    <button-top
      :buttonTopData="buttonTop"
      :buttonShow="buttonShow"
      @newButton="newButton"
    ></button-top>
    <div :class="{ container_flex_form: true }">
      <VFormRender
        :form-json="formJson"
        :form-data="formData"
        :option-data="optionData"
        ref="vFormRef"
        :global-dsv="globalDsv"
        :class="{ formRender_view: true }"
      >
        <template #table>
          <item-table-update ref="itemTableRef" />
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import * as Api from '@/api/prodmgr-inv/project/planRest.js'
import * as LineApi from '@/api/prodmgr-inv/project/line.js'
import * as SectionApi from '@/api/prodmgr-inv/project/section.js'

import VFormRender from '@/components/form-render/index'
import { formFillInPage } from '@/api/form/form'
import { getToken } from '@/utils/auth'
import attachmentTable from '@/views/components/attachmentTable'
import { listByDeptCode } from '@/api/system/dept.js'
import ItemTableUpdate from './itemTableUpdate.vue'
import { getUserInfo } from '@/utils/user-info'
import { mapState } from 'vuex'
import dayjs from 'dayjs'
export default {
  // 需求填报更新
  components: {
    VFormRender,
    attachmentTable,
    ItemTableUpdate,
  },
  data () {
    return {
      loading: false,
      title: '新增',
      checked: false,
      //   fileList type
      // type: 'create', //update , view ,create
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
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
      ],
      constructionOptions: [],
      selectRows: [],
      userInfo: getUserInfo(),
      allData: [],
    }
  },
  computed: {
    type () {
      return this.$route.query.type
    },
    id () {
      return this.$route.query?.id || ''
    },
    projectId () {
      return this.$route.query?.projectId || ''
    },
    from () {
      return this.$route.query?.from || ''
    },
    ...mapState(['requestUpdate'])
  },
  async created () {

  },
  mounted () {

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
    onCheck (tableData) {
      const errors = [];

      tableData.forEach((row, index) => {
        const rowNum = index + 1;
        if (!row.planAmount && row.planAmount !== 0) {
          errors.push(`第${rowNum}行，本次计划数量未填写 `);
        }

        if (!row.supplyDate) {
          errors.push(`第${rowNum}行，供应时间未填写 `);
        }

        if (!row.addr || row.addr.trim() === '') {
          errors.push(`第${rowNum}行，使用地点未填写 `);
        }
        if (!row.receiver || row.receiver.trim() === '') {
          errors.push(`第${rowNum}行，收货人及联系方式未填写 `);
        }

        const plan = +row.planAmount || 0;
        const cumulative = +row.cumulativeAmount - +(row.backPlanAmount || 0)
        const contract = +row.amount || 0;

        if (plan <= 0) {
          errors.push(`第${rowNum}行，本次计划数量必须大于0 `);
        }

        if (plan + cumulative > contract) {
          errors.push(`第${rowNum}行，本次计划数量超出合同数量 `);
        }
      });

      if (errors.length > 0) {
        this.$message({
          message: errors.join('<br/> <br/>'),
          type: 'error',
          dangerouslyUseHTMLString: true
        });
        return false
      }
      // TODO: 提交逻辑放这里
      return true
    },
    async getCurrentSection () {
      const res = await SectionApi.getCurrentSection()
      this.sectionInfo = res.data
      this.$refs.vFormRef.setFormData({
        sectionName: this.sectionInfo.sectionName,
        title: this.sectionInfo.constructionCompany + this.sectionInfo.sectionName + dayjs().format('YYYY年MM月') + '甲供物资需求'
      })
    },

    //初始化
    init () {
      this.$nextTick(async () => {
        this.title = "新建";
        await this.formFillInPage()
        this.getCurrentSection()

      });
    },
    // 编辑初始化
    async updateInit (id) {
      await Api.detail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";

          await this.formFillInPage()
          this.getCurrentSection()
          this.$refs.vFormRef.setFormData(data)

          //   form action
          this.$refs.vFormRef.setReadMode(true)
          // 当选择数据后，不做数据回填
          if (this.getSelectedMaterialList().length > 0 && this.id === this.getUpdateId() && this.from === 'view') {
            return
          }
          this.setUpdateId(this.id)
          const details = data.details.map(x => ({
            ...x,
            supplyDate: dayjs(x.supplyDate).format('YYYY-MM-DD'),
            uid: x.allocationUniqueNumber,
            backPlanAmount: x.planAmount || 0,
          }))
          this.setSelectedMaterialList(details)
          this.$refs.itemTableRef.setTableData(details)
        });
      });
    },
    async getLineOptions () {
      const res = await LineApi.itemList({
        pageNum: 1,
        pageSize: -1,
      })
      this.lineOptions = res.data.list.map(item => {
        return {
          value: item.id,
          label: item.projectName
        }
      })
    },
    async getDeptTree (deptCode) {
      const res = await listByDeptCode({
        deptCode
      })
      const data = res.data.map(item => {
        return {
          value: item.id,
          label: item.deptName
        }
      })
      return Promise.resolve(data)
    },
    newButton (buttonCode) {
      if (buttonCode === 'cancel') {
        this.cancel()
        return
      }
      if (buttonCode === 'save') {
        this.handleCreate()
        return
      }

    },
    cancel () {
      this.$router.go(-1)
    },

    buttonShow (item) {
      if (item.buttonCode === 'save') {
        return this.type !== 'view'
      }
      return true
    },
    //新建
    async handleCreate () {
      if (this.getSelectedMaterialList().length === 0) {
        this.$modal.msgError('请选择物料')
        return
      }
      const tableData = this.$refs.itemTableRef.tableData
      const isValid = this.onCheck(tableData)
      if (!isValid) {
        return
      }
      this.loading = true;
      const data = {
        id: this.id,
        detailsModifyParams: tableData.map(x => ({
          ...x,
          id: null,
          allocationUniqueNumber: x.uniqueNumber || x.allocationUniqueNumber
        }))
      }
      await Api[`edit`](data)
        .then(({ message }) => {
          this.loading = false;
          this.$modal.msgSuccess(message);
          this.setSelectedMaterialList([])
          this.$router.push({
            name: 'wzxqList'
          })
        })
        .finally((err) => {
          this.loading = false;
        });


    },
    formFillInPage () {
      return new Promise((resolve) => {
        formFillInPage('addRequest').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          //   form action
          this.$refs['vFormRef'].setReadMode(true)


          resolve(true)
        })
      })
    },
    setSelectedMaterialList (data) {
      this.$store.dispatch('requestUpdate/setSelectedMaterialList', data)
    },
    getSelectedMaterialList () {
      return this.requestUpdate.selectedMaterialList
    },
    setUpdateId (data) {
      this.$store.dispatch('requestUpdate/setUpdateId', data)
    },
    getUpdateId () {
      return this.requestUpdate.updateId
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