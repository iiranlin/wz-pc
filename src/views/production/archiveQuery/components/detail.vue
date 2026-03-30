<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
    <div :class="{ container_flex_form: type === 'view' }">
      <VFormRender :form-json="formJson" :form-data="formData" :option-data="optionData" ref="vFormRef"
        :global-dsv="globalDsv" :class="{ formRender_view: type === 'view' }">
        <template #leftTab>
          <div ref="leftAnchorPlaceholder" class="left-anchor-placeholder">
            <div class="left-anchor-container" :style="leftAnchorStyle">
              <div v-for="(item, index) in anchorList" :key="index" class="anchor-item"
                :class="{ 'is-active': activeAnchor === item.value }" @click="handleAnchorClick(item.value)">
                {{ item.label }}
              </div>
            </div>
          </div>
        </template>

        <template #detailSlot>
          <div  v-show="false" data-anchor="project">项目详情锚点</div>
        </template>
        <template #htfjSlot>
          <div v-show="false" data-anchor="contract">合同附件锚点</div>
          <contract-attachment-table :fetch-api="ArchiveQueryApi.contractFile" :request-params="contractQueryParams"
            :default-page-size="10" :columns="contractColumns" searchPlaceholder="合同名称/合同编号搜索">
            <template #attachment="scoped">
              <fileUpload :value="[{ ...scoped.row }]" :limit="9999" :fileSize="500" :fileType="['pdf']"
                :preview="'view'" />
            </template>
          </contract-attachment-table>
        </template>
        <template #jhfjSlot>
          <div v-show="false" data-anchor="requirement">计划附件锚点</div>
           <contract-attachment-table :fetch-api="ArchiveQueryApi.planFile" :request-params="contractQueryParams"
            :default-page-size="10" :columns="planColumns" searchPlaceholder="需求计划ID/标段项目/需求名称搜索">
            <template #attachment="scoped">
              <fileUpload :value="[{ ...scoped.row }]" :limit="9999" :fileSize="500" :fileType="['pdf']"
                :preview="'view'" />
            </template>
            <template #submitTime="scoped">
              {{ scoped.row.submitTime | formatDate }}
            </template>
          </contract-attachment-table>
        </template>
        <template #fhfjSlot>
          <div v-show="false" data-anchor="delivery">发货附件锚点</div>
           <contract-attachment-table :fetch-api="ArchiveQueryApi.customFile" :request-params="{...contractQueryParams,type:1}"
            :default-page-size="10" :columns="deliveryColumns" searchPlaceholder="发货ID/标段项目/供应商名称搜索">
            <template #attachment="scoped">
              <fileUpload :value="[{ ...scoped.row }]" :limit="9999" :fileSize="500" :fileType="['pdf']"
                :preview="'view'" />
            </template>
            <template #shippingDate="scoped">
              {{ scoped.row.shippingDate | formatDate }}
            </template>
            <template #fileType="scoped">
              {{ scoped.row.fileType | mapFileType }}
            </template>
          </contract-attachment-table>
        </template>
        <template #cyshfjSlot>
          <div v-show="false" data-anchor="receipt">初验收附件锚点</div>
           <contract-attachment-table :fetch-api="ArchiveQueryApi.customFile" :request-params="{...contractQueryParams,type:2}"
            :default-page-size="10" :columns="receiptColumns" searchPlaceholder="收货ID/标段项目搜索">
            <template #attachment="scoped">
              <fileUpload :value="[{ ...scoped.row }]" :limit="9999" :fileSize="500" :fileType="['pdf']"
                :preview="'view'" />
            </template>
            <template #takeDate="scoped">
              {{ scoped.row.takeDate | formatDate }}
            </template>
            <template #fileType="scoped">
              {{ scoped.row.fileType | mapFileType }}
            </template>
          </contract-attachment-table>
        </template>
        <template #zjrkfjSlot>
          <div v-show="false" data-anchor="inspection">质检入库数据锚点</div>
           <contract-attachment-table :fetch-api="ArchiveQueryApi.customFile" :request-params="{...contractQueryParams,type:3}"
            :default-page-size="10" :columns="inspectionColumns" searchPlaceholder="质检入库ID/标段项目搜索">
            <template #attachment="scoped">
              <fileUpload :value="[{ ...scoped.row }]" :limit="9999" :fileSize="500" :fileType="['pdf']"
                :preview="'view'" />
            </template>
            <template #storeDate="scoped">
              {{ scoped.row.storeDate | formatDate }}
            </template>
            <template #fileType="scoped">
              {{ scoped.row.fileType | mapFileType }}
            </template>
          </contract-attachment-table>
        </template>
        <template #ckfjSlot>
          <div v-show="false" data-anchor="outbound">出库附件锚点</div>
            <contract-attachment-table :fetch-api="ArchiveQueryApi.supplierOutFileFile" :request-params="contractQueryParams"
            :default-page-size="10" :columns="outboundColumns" searchPlaceholder="出库ID/标段项目搜索">
            <template #attachment="scoped">
              <fileUpload :value="[{ ...scoped.row }]" :limit="9999" :fileSize="500" :fileType="['pdf']"
                :preview="'view'" />
            </template>
            <template #pickDate="scoped">
              {{ scoped.row.pickDate | formatDate }}
            </template>
          </contract-attachment-table>
        </template>
        <template #thfjSlot>
          <div v-show="false" data-anchor="return">退货附件锚点</div>
          <contract-attachment-table :fetch-api="ArchiveQueryApi.backFile" :request-params="contractQueryParams"
            :default-page-size="10" :columns="returnColumns" searchPlaceholder="退货ID/标段项目/供应商搜索">
            <template #attachment="scoped">
              <fileUpload :value="[{ ...scoped.row }]" :limit="9999" :fileSize="500" :fileType="['pdf']"
                :preview="'view'" />
            </template>
            <template #backDate="scoped">
              {{ scoped.row.backDate | formatDate }}
            </template>
          </contract-attachment-table>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import * as Api from '@/api/prodmgr-inv/project/line.js'
import { deptTreeAll } from '@/api/system/dept.js'
import VFormRender from '@/components/form-render/index'
import { formFillInPage } from '@/api/form/form'
import { getToken } from '@/utils/auth'
import attachmentTable from '@/views/components/attachmentTable'
import contractAttachmentTable from './contractAttachmentTable.vue'
import { extractSelectOptions } from '@/utils/index'
import fileUpload from '@/components/upload'
import * as ArchiveQueryApi from '@/api/prodmgr-inv/project/archiveQuery'


export default {
  name: "archiveQueryDetail",
  components: {
    VFormRender,
    attachmentTable,
    contractAttachmentTable,
    fileUpload
  },
  filters:{
    mapFileType(value) {
      const map = {
        'fhd': '发货单',
        'zczp': '装车照片',
        'thfj': '退货附件',
        'thfj_sh': '收货退货附件',
        'thfj_im': '入库退货附件',
        'htfj': '合同附件',
        'jhfj': '计划附件',
        'fhfj': '发货附件',
        'cyshfj': '初验收附件',
        'zjrkfj': '质检入库附件',
        'ckfj': '出库附件',

        'qtzl':'其他资料',
        'zjd':'验收单',
        'jhd':'交货单',

        'jcbg':'报检结果材料',
        'lld':'领料单',

      }
      return map[value] || value
    }
  },
  data() {
    return {
      ArchiveQueryApi,
      loading: false,
      tableData: [],
      title: '新增',
      checked: false,
      activeAnchor: 'project',
      anchorList: [
        { label: '项目详情', value: 'project' },
        { label: '合同附件', value: 'contract' },
        { label: '需求计划附件', value: 'requirement' },
        { label: '发货附件', value: 'delivery' },
        { label: '初验收货附件', value: 'receipt' },
        { label: '质检入库附件', value: 'inspection' },
        { label: '出库附件', value: 'outbound' },
        { label: '退货附件', value: 'return' }
      ],
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
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
      ],
      constructionOptions: [],
      leftAnchorStyle: {},
      contractColumns: [{ label: '序号', prop: '__index', width: 80, align: 'center' },
      { label: '合同名称', prop: 'contractName', minWidth: 200, align: 'center' },
      { label: '合同编号', prop: 'contractNo', minWidth: 150, align: 'center' },
      { label: '附件类型', prop: 'fileType', minWidth: 140, align: 'center' },
      { label: '附件', prop: 'attachment', minWidth: 140, slot: 'attachment' },],
       planColumns: [{ label: '序号', prop: '__index', width: 80, align: 'center' },
      { label: '需求计划ID', prop: 'planNumber', minWidth: 130, align: 'center' },
      { label: '标段项目', prop: 'sectionShortName', minWidth: 150, align: 'center' },
      { label: '需求名称', prop: 'planName', minWidth: 200, align: 'center' },
      { label: '提交时间', prop: 'submitTime', minWidth: 120, align: 'center', slot: 'submitTime' },
      { label: '附件', prop: 'attachment', minWidth: 150, slot: 'attachment' },],
      deliveryColumns:[{ label: '序号', prop: '__index', width: 80, align: 'center' },
      { label: '发货ID', prop: 'shippingNumber', minWidth: 130, align: 'center' },
      { label: '标段项目', prop: 'sectionShortName', minWidth: 150, align: 'center' },
      { label: '供应商名称', prop: 'sellerName', minWidth: 200, align: 'center' },
      { label: '发货时间', prop: 'shippingDate', minWidth: 120, align: 'center', slot: 'shippingDate' },
      { label: '附件类型', prop: 'fileType', minWidth: 140, align: 'center',slot:'fileType' },
      { label: '附件', prop: 'attachment', minWidth: 150, slot: 'attachment' },],
      receiptColumns:[{ label: '序号', prop: '__index', width: 80, align: 'center' },
      { label: '收货ID', prop: 'takeNumber', minWidth: 130, align: 'center' },
      { label: '标段项目', prop: 'sectionShortName', minWidth: 150, align: 'center' },
      { label: '收货时间', prop: 'takeDate', minWidth: 120, align: 'center', slot: 'takeDate' },
      { label: '附件类型', prop: 'fileType', minWidth: 140, align: 'center',slot:'fileType' },
      { label: '附件', prop: 'attachment', minWidth: 150, slot: 'attachment' },],
      inspectionColumns:[{ label: '序号', prop: '__index', width: 80, align: 'center' },
      { label: '质检入库ID', prop: 'storeNumber', minWidth: 130, align: 'center' },
      { label: '标段项目', prop: 'sectionShortName', minWidth: 150, align: 'center' },
      { label: '报检时间', prop: 'storeDate', minWidth: 120, align: 'center', slot: 'storeDate' },
      { label: '附件类型', prop: 'fileType', minWidth: 140, align: 'center',slot:'fileType' },
      { label: '附件', prop: 'attachment', minWidth: 150, slot: 'attachment' },],
      outboundColumns:[{ label: '序号', prop: '__index', width: 80, align: 'center' },
      { label: '出库ID', prop: 'outNumber', minWidth: 130, align: 'center' },
      { label: '标段项目', prop: 'sectionShortName', minWidth: 150, align: 'center' },
      { label: '领料日期', prop: 'pickDate', minWidth: 120, align: 'center', slot: 'pickDate' },
      { label: '附件类型', prop: 'fileType', minWidth: 140, align: 'center',},
      { label: '附件', prop: 'attachment', minWidth: 150, slot: 'attachment' },],
      returnColumns:[{ label: '序号', prop: '__index', width: 80, align: 'center' },
      { label: '退货ID', prop: 'backNumber', minWidth: 130, align: 'center' },
      { label: '标段项目', prop: 'sectionShortName', minWidth: 150, align: 'center' },
      { label: '退货时间', prop: 'backDate', minWidth: 120, align: 'center', slot: 'backDate' },
      { label: '供应商', prop: 'sellerName', minWidth: 200, align: 'center' },
      { label: '附件类型', prop: 'fileType', minWidth: 140, align: 'center', },
      { label: '附件', prop: 'attachment', minWidth: 150, slot: 'attachment' },],
    }
  },
  computed: {
    type() {
      return this.$route.query.type
    },
    id() {
      return this.$route.query?.id || ''
    },
    contractQueryParams() {
      return {
        projectId: this.id
      }
    }
  },
  created() {
  },
  mounted() {
    this.$nextTick(() => {
      this.updateLeftAnchorStyle()
    })
    window.addEventListener('resize', this.updateLeftAnchorStyle)

    if (['view', 'update'].includes(this.type)) {
      this.updateInit(this.id)
      return
    }

    if (this.type === 'create') {
      this.init()
      return
    }

  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateLeftAnchorStyle)
  },
  methods: {
    handleAnchorClick(anchorValue) {
      this.activeAnchor = anchorValue
      this.scrollToAnchor(anchorValue)
    },
    updateLeftAnchorStyle() {
      const placeholder = this.$refs.leftAnchorPlaceholder
      if (!placeholder) return
      const rect = placeholder.getBoundingClientRect()
      this.leftAnchorStyle = {
        left: `${rect.left}px`,
        width: `${rect.width}px`
      }
    },
    getAnchorElement(anchorValue) {
      return this.$el.querySelector(`[data-anchor="${anchorValue}"]`)
    },
    getScrollContainer(el) {
      let parent = el?.parentElement
      while (parent && parent !== document.body) {
        const { overflowY } = window.getComputedStyle(parent)
        if (/(auto|scroll|overlay)/.test(overflowY) && parent.scrollHeight > parent.clientHeight) {
          return parent
        }
        parent = parent.parentElement
      }
      return window
    },
    scrollToAnchor(anchorValue) {
      const targetEl = this.getAnchorElement(anchorValue)
      if (!targetEl) return

      // v-show="false" 导致元素 display:none，scrollIntoView 无效
      // 需要找到最近的可见父元素来计算滚动位置
      let visibleEl = targetEl
      while (visibleEl && visibleEl.offsetParent === null && visibleEl !== document.body) {
        visibleEl = visibleEl.parentElement
      }
      if (!visibleEl) return

      const offsetTop = 150
      const scrollContainer = this.getScrollContainer(visibleEl)

      if (scrollContainer === window) {
        const targetTop = visibleEl.getBoundingClientRect().top + window.pageYOffset - offsetTop
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        })
      } else {
        const containerRect = scrollContainer.getBoundingClientRect()
        const targetRect = visibleEl.getBoundingClientRect()
        const targetTop = targetRect.top - containerRect.top + scrollContainer.scrollTop - offsetTop
        scrollContainer.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        })
      }
    },
    onUnitChange(val) {
      this.$refs.vFormRef.setFormData({
        constructionUnit: this.constructionOptions.find(item => item.value === val)?.label
      })
    },

    //初始化
    init() {
      this.$nextTick(async () => {
        this.title = "新建";
        await this.formFillInPage()
        this.$nextTick(() => {
          this.updateLeftAnchorStyle()
        })
      });
    },
    // 编辑初始化
    async updateInit(id) {

      await Api.detail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";
          await this.formFillInPage()
          this.$refs.vFormRef.setFormData(data)

          this.tableData = data.materialList
          //   form action
          this.$refs.vFormRef.setReadMode(this.type === 'view')
          this.$nextTick(() => {
            this.updateLeftAnchorStyle()
          })
        });
      });
    },
    newButton(buttonCode) {
      if (buttonCode === 'cancel') {
        this.cancel()
        return
      }
      if (buttonCode === 'save') {
        this.handleCreate()
        return
      }

    },
    cancel() {
      this.$tab.closeOpenPage(true)
    },

    buttonShow(item) {
      if (item.buttonCode === 'save') {
        return this.type !== 'view'
      }
      return true
    },
    //新建
    handleCreate() {
      this.$refs.vFormRef.validateForm(async (valid) => {
        console.log(valid, 'valid')
        if (valid) {
          this.loading = true;
          const formData = await this.$refs.vFormRef.getFormData();
          await Api[
            this.type === 'update' ? `edit` : `save`
          ](Object.assign({ id: this.type === 'update' ? this.id : null }, formData))
            .then(({ message }) => {
              this.loading = false;
              this.$modal.msgSuccess(message);
              this.cancel();
            })
            .finally((err) => {
              this.loading = false;
            });
        }
      });
    },
    checkoutStatus(flag) {
      const widgets = ['scrapName', 'sugHandMethod', 'applyDeptId', 'applyUserId', 'comments', 'fileList', 'design_p2', 'projectCode', 'projectName', 'scrapCode', 'grid96921', 'grid45899', 'grid80913']
      if (flag) {
        this.$refs.vFormRef.hideWidgets(widgets)
      } else {
        this.$refs.vFormRef.showWidgets(widgets)
      }
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('archiveQuery').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)


          resolve(true)
        })
      })
    },
    async getDeptTree() {
      const res = await deptTreeAll({
        deptCodeQueryAll: 'JSDW'
      })
      this.constructionOptions = extractSelectOptions(res.data[0])

    }

  },
}
</script>
<style>
.mt {
  margin-top: -30px;
}
</style>

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

.left-anchor-container {
  position: fixed;
  top: 150px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* 垂直居中（如果需要） */
  align-items: center;
  /* 内部项水平居中 */
  margin: 0 auto;
  gap: 8px;
  padding: 20px 0;
}

.left-anchor-placeholder {
  width: 164px;
  margin: 0 auto;
}

.anchor-item {
  position: relative;
  width: 100%;
  padding: 8px 16px;
  text-align: center;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    color: #1890ff;
    background-color: #f5f7fa;
  }

  &.is-active {
    color: #1890ff;
    font-weight: 600;
    background-color: #e6f7ff;
    border-radius: 4px;

    &::after {
      content: "";
      position: absolute;
      left: 0;
      /* 改为左侧指示条或根据审美调整 */
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 14px;
      background-color: #1890ff;
      border-radius: 0 2px 2px 0;
    }
  }
}
</style>
