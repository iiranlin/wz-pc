<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="handleButton"></button-top>
    <div class="container_flex_form">
      <VFormRender ref="vFormRef" :form-data="formData" :class="{'formRender_view': queryType === 'view'}">
        <template slot="design_p1">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="基本信息" />基本信息</p>
        </template>
        <template slot="design_p2">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="产品信息" />产品信息</p>
        </template>
        <template slot="design_p3">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="其他信息" />齐套信息</p>
        </template>
        <template slot="detail">
          <div style="height: 400px;display: flex;flex-direction: column;">
            <button-top key="detail" :buttonTopData="detailProperty.buttonTop" @newButton="handleTableButton" />
            <table-index numberShow :styles="{ width: '100%', height: '454px', margin: '0', 'overflow-y': 'auto' }"
              ref="tableIndex" idName="uid" :visibleAction="queryType != 'view'" :tableData="detailist"
              :property="detailProperty" @handleButton="handleTableButton">
              <template slot="singleNum" slot-scope="scope">
                <span>{{ scope.data.realUnitNeed * scope.data.groupNum }}</span>
              </template>
              <template slot="groupNum" slot-scope="scope">
                <span style="color: #5c9302;font-weight: 700;">{{ scope.data.realUnitNeed * scope.data.groupNum }}</span>
              </template>
              
            </table-index>
          </div>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import indexMixin from '@/views/mixins';
import { formFillInPage } from '@/api/form/form'
import { analysis } from '@/api/projectManagement/productionOrder'
import { getUserInfo } from '@/utils/user-info'
import { getToken } from '@/utils/auth'
import { menuConfig, generateUUID } from '@/utils'
import VFormRender from '@/components/form-render/index'
export default {
  name: 'operate',
  components: {
    VFormRender
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
      ],
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: '01'
      },
      userInfo: getUserInfo(),
      detailProperty: {},
      fileList: [],
      detailist: [],
    }
  },
  computed: {
    ...mapGetters(['infoData'])
  },
  async created() {
    this.init()
  },
  methods: {
    // 加载表格配置项
    async menuProperty(menuId, prop) {
      this[prop] = await this.$store.dispatch('menuProperty', menuId)

    },
    // 表单按钮权限设置
    buttonShow({ buttonCode, type }) {
      if (type.includes(this.queryType)) {
        return true
      }
      return false
    },
    // 加载初始化数据
    async init() {
      let { type, name, id } = this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryName = name

      this.$nextTick(async () => {
        this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true);
        this.$refs['vFormRef'].resetForm()
        await this.formFillInPage()
        await this.menuProperty(menuConfig.MENU_ANALYSIS_TABLE, 'detailProperty');
        this.getOperateDetail(id)
      })
    },
    // 加载表单配置项
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('productionAnalysis').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    // 加载详情数据
    async getOperateDetail(id) {
      try {
        this.loading = true
        const { data: { rawList, ...form } } = await analysis({ rawId: id })
        this.$refs['vFormRef'].setFormData({ ...form });
        this.detailist = rawList.map(item => ({
           ...item,
           uid: generateUUID(),
           needNum: item.needNum.toFixed(4),
           realUnitNeed:item.realUnitNeed.toFixed(4) ,
           invNum: item.inventoryNum.toFixed(4),
           singleNum: item.singleNum.toFixed(4),
           groupNum: item.groupNum.toFixed(4),
           groupNeedNum:item.groupNeedNum.toFixed(4) ,
          }))
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    // 表格按钮事件处理器
    handleTableButton(buttonCode, formId, buttonData) {
      if (buttonCode === 'search') {
        this.getOperateDetail(this.queryId)
        this.$modal.msgSuccess('存量查询成功')
      }
    },

    // 顶部按钮事件处理器
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      switch (buttonCode) {
        case 'cancel':
          this.handleCancel()
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
