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
          <ItemTableView ref="itemTableViewRef" :allData="allData" />
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
import ItemTableView from './itemTableView.vue'
import { getUserInfo } from '@/utils/user-info'
import { mapState } from 'vuex'
import dayjs from 'dayjs'
export default {
  // 需求填报物资选择-页面
  components: {
    VFormRender,
    attachmentTable,
    ItemTableView
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

      // 菜单按钮、字段等数据
      buttonTop: [
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update, view' },
      ],
      constructionOptions: [],
      selectRows: [],
      userInfo: getUserInfo(),
      sectionInfo: {},
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
    ...mapState(['requestPlan'])
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
    onSelectRow (rows) {
      console.log(rows, 'rowssss')
      this.selectRows = rows;
    },
    //初始化
    init () {
      this.$nextTick(async () => {
        this.title = "新建";
        await this.formFillInPage()
      });
    },
    // 编辑初始化
    async updateInit (id) {
      await Api.detail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";
          await this.formFillInPage()
          this.$refs.vFormRef.setFormData(data)


          //   form action
          this.$refs.vFormRef.setReadMode(true)

        });
      });

      if (this.getSelecList().length === 0) {
        this.$message.warning('请先选择计划')
        return
      }
      await Api.getAllDetail(this.getSelecList()).then(({ data }) => {
        this.allData = data
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
      return true
    },
    //新建
    handleCreate () {
      const valid = this.$refs.itemTableViewRef.onCheck()
      if (valid) {
        // 存Col json 配置
        Api.submit({
          columnConfig: JSON.stringify(this.$refs.itemTableViewRef.cols),
          detailsModifyParams: this.$refs.itemTableViewRef.allData,
          childrenIds: this.getSelecList(),
        }).then(() => {
          this.$modal.msgSuccess("提交成功");
          this.$router.push({
            name:'jgPlanList'
          })
        })
      }
    },
    formFillInPage () {
      return new Promise((resolve) => {
        formFillInPage('planAddRequest').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          //   form action
          this.$refs['vFormRef'].setReadMode(true)


          resolve(true)
        })
      })
    },

    getSelecList () {
      return this.requestPlan.selectList
    }

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