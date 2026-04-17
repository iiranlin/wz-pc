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

        <template #projectNumberSlot="{ formModel }">
          <el-form-item prop="projectNumber" label="项目编号" class="label-right-align">

            <el-button type="text" @click="toDetail(formModel, 'project')">
              {{ formModel.projectNumber }}
            </el-button>
          </el-form-item>
        </template>

        <template #detailSlot>
          <div v-show="false" data-anchor="project">项目信息锚点</div>
        </template>
        <template #sectionSlot>
          <div v-show="false" data-anchor="section">标段信息锚点</div>
          <contract-attachment-table :fetch-api="SectionApi.itemList" :request-params="sectionQueryParams"
            :default-page-size="10" :columns="sectionColumns" search-field="sectionShortName"
            :tooltipConfig="{ input: '支持标段简称搜索' }" @search-change="handleSectionSearchChange">
            <template #sectionNumber="scoped">
              <el-button type="text" @click="toDetail(scoped.row, 'section')">
                {{ scoped.row.sectionNumber }}
              </el-button>
            </template>
          </contract-attachment-table>
        </template>
        <template #htfjSlot>
          <div v-show="false" data-anchor="contract">合同附件锚点</div>
          <contract-attachment-table :fetch-api="ArchiveQueryApi.contractFile" :request-params="contractQueryParams"
            :default-page-size="10" :columns="contractColumns" :tooltipConfig="{ input: '支持合同名称/合同编号搜索' }"
            :showDateRange="true">
            <template #contractNo="scoped">
              <el-button type="text" @click="toDetail(scoped.row, 'contract')">
                {{ scoped.row.contractNo }}
              </el-button>
            </template>
            <template #attachment="scoped">
              <fileUpload :value="[{ ...scoped.row }]" :limit="9999" :fileSize="500" :fileType="['pdf']"
                :preview="'view'" />
            </template>
            <template #signDate="scoped">
              {{ scoped.row.signDate | formatDate }}
            </template>
          </contract-attachment-table>
        </template>
        <template #jhfjSlot>
          <div v-show="false" data-anchor="requirement">需求计划附件锚点</div>
          <contract-attachment-table :fetch-api="ArchiveQueryApi.planFile" :request-params="relatedQueryParams"
            :default-page-size="10" :columns="planColumns" :tooltipConfig="{ input: '支持需求计划ID/标段项目/需求名称搜索/提报人搜索' }"
            :show-date-range="true">
            <template #planNumber="scoped">
              <el-button type="text" @click="toDetail(scoped.row, 'requirement')">
                {{ scoped.row.planNumber }}
              </el-button>
            </template>
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
          <contract-attachment-table :fetch-api="ArchiveQueryApi.customFile"
            :request-params="{ ...relatedQueryParams, type: 1 }" :default-page-size="10" :columns="deliveryColumns"
            :tooltipConfig="{ input: '支持发货ID/需求名称/标段项目/供应商名称/操作人搜索' }" :show-date-range="true">
            <template #shippingNumber="scoped">
              <el-button type="text" @click="toDetail(scoped.row, 'delivery')">
                {{ scoped.row.shippingNumber }}
              </el-button>
            </template>
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
          <contract-attachment-table :fetch-api="ArchiveQueryApi.customFile"
            :request-params="{ ...relatedQueryParams, type: 2 }" :default-page-size="10" :columns="receiptColumns"
            :tooltipConfig="{ input: '支持收货ID/需求名称/供应商/标段项目/操作人搜索' }" :show-date-range="true">
            <template #takeNumber="scoped">
              <el-button type="text" @click="toDetail(scoped.row, 'receipt')">
                {{ scoped.row.takeNumber }}
              </el-button>
            </template>
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
          <contract-attachment-table :fetch-api="ArchiveQueryApi.customFile"
            :request-params="{ ...relatedQueryParams, type: 3 }" :default-page-size="10" :columns="inspectionColumns"
            :tooltipConfig="{ input: '支持质检入库ID/标段项目/收货单号/需求名称/供应商/操作人搜索' }" :show-date-range="true">
            <template #storeNumber="scoped">
              <el-button type="text" @click="toDetail(scoped.row, 'inspection')">
                {{ scoped.row.storeNumber }}
              </el-button>
            </template>
            <template #takeNumber="scoped">
              <el-button type="text" @click="toDetail(scoped.row, 'receipt')">
                {{ scoped.row.takeNumber }}
              </el-button>
            </template>
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
          <contract-attachment-table :fetch-api="ArchiveQueryApi.supplierOutFileFile"
            :request-params="relatedQueryParams" :default-page-size="10" :columns="outboundColumns"
            :tooltipConfig="{ input: '支持出库ID/标段项目/需求名称/领用单位/领用人/发料人/操作人搜索' }" :show-date-range="true">
            <template #outNumber="scoped">
              <el-button type="text" @click="toDetail(scoped.row, 'outbound')">
                {{ scoped.row.outNumber }}
              </el-button>
            </template>
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
          <contract-attachment-table :fetch-api="ArchiveQueryApi.backFile" :request-params="relatedQueryParams"
            :default-page-size="10" :columns="returnColumns"
            :tooltipConfig="{ input: '支持退货ID/标段项目/退货环节/收货单号/发货单号/需求名称/供应商/操作人搜索', date: '支持退货时间范围搜索' }"
            :show-date-range="true">
            <template #backNumber="scoped">
              <el-button type="text" @click="toDetail(scoped.row, 'return')">
                {{ scoped.row.backNumber }}
              </el-button>
            </template>

            <template #takeNumber="scoped">
              <el-button type="text" @click="toDetail(scoped.row.cirId, 'SH')">
                {{ scoped.row.takeNumber }}
              </el-button>
            </template>
            <template #shipmentBatchNumber="scoped">
              <el-button type="text" @click="toDetail(scoped.row.cirId, 'FH')">
                {{ scoped.row.shipmentBatchNumber }}
              </el-button>
            </template>

            <template #attachment="scoped">
              <fileUpload :value="[{ ...scoped.row }]" :limit="9999" :fileSize="500" :fileType="['pdf']"
                :preview="'view'" />
            </template>
            <template #backDate="scoped">
              {{ scoped.row.backDate | formatDate }}
            </template>
            <template #shippingDate="scoped">
              {{ scoped.row.shippingDate | formatDate }}
            </template>
          </contract-attachment-table>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import * as Api from '@/api/prodmgr-inv/project/line.js'
import * as SectionApi from '@/api/prodmgr-inv/project/section.js'
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
  filters: {
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

        'qtzl': '其他资料',
        'zjd': '验收单',
        'jhd': '交货单',

        'jcbg': '报检结果材料',
        'lld': '领料单',

      }
      return map[value] || value
    }
  },
  data() {
    return {
      ArchiveQueryApi,
      SectionApi,
      loading: false,
      tableData: [],
      title: '新增',
      checked: false,
      activeAnchor: 'project',
      anchorList: [
        { label: '项目信息', value: 'project' },
        { label: '标段项目', value: 'section' },
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
      sectionColumns: [{ label: '序号', prop: '__index', width: 80, align: 'center' },
      { label: '项目编号', prop: 'sectionNumber', minWidth: 140, align: 'center', slot: 'sectionNumber' },
      { label: '项目名称', prop: 'sectionName', minWidth: 180, align: 'center' },
      { label: '项目简称', prop: 'projectShortName', minWidth: 160, align: 'center' },
      { label: '项目类型', prop: 'projectType', minWidth: 100, align: 'center' },
      { label: '施工单位', prop: 'constructionCompany', minWidth: 200, align: 'center' },
      { label: '监理单位', prop: 'supervisionUnit', minWidth: 200, align: 'center' },],
      contractColumns: [{ label: '序号', prop: '__index', width: 80, align: 'center' },
      { label: '合同编号', prop: 'contractNo', minWidth: 150, align: 'center', slot: 'contractNo' },
      { label: '合同名称', prop: 'contractName', minWidth: 200, align: 'center' },
      { label: '签订日期', prop: 'signDate', minWidth: 150, align: 'center', slot: 'signDate' },
      { label: '买方', prop: 'buyer', minWidth: 150, align: 'center' },
      { label: '卖方', prop: 'seller', minWidth: 150, align: 'center' },
      { label: '附件类型', prop: 'fileType', minWidth: 140, align: 'center' },
      { label: '附件', prop: 'attachment', width: 200, slot: 'attachment' },],
      planColumns: [{ label: '序号', prop: '__index', width: 80, align: 'center' },
      { label: '需求计划ID', prop: 'planNumber', minWidth: 130, align: 'center', slot: 'planNumber' },
      { label: '标段项目', prop: 'sectionShortName', minWidth: 150, align: 'center' },
      { label: '需求名称', prop: 'planName', minWidth: 200, align: 'center' },
      { label: '提交时间', prop: 'submitTime', minWidth: 120, align: 'center', slot: 'submitTime' },
      { label: '提报人', prop: 'createUserName', minWidth: 120, align: 'center' },
      { label: '附件', prop: 'attachment', width: 200, slot: 'attachment' },],
      deliveryColumns: [{ label: '序号', prop: '__index', width: 80, align: 'center' },
      { label: '发货ID', prop: 'shippingNumber', minWidth: 130, align: 'center', slot: 'shippingNumber' },
      { label: '需求名称', prop: 'planName', minWidth: 150, align: 'center' },
      { label: '标段项目', prop: 'sectionShortName', minWidth: 150, align: 'center' },
      { label: '供应商名称', prop: 'sellerName', minWidth: 200, align: 'center' },
      { label: '发货时间', prop: 'shippingDate', minWidth: 120, align: 'center', slot: 'shippingDate' },
      { label: '操作人', prop: 'createUserName', minWidth: 120, align: 'center' },
      { label: '附件类型', prop: 'fileType', minWidth: 140, align: 'center', slot: 'fileType' },
      { label: '附件', prop: 'attachment', width: 200, slot: 'attachment' },],
      receiptColumns: [{ label: '序号', prop: '__index', width: 80, align: 'center' },
      { label: '收货ID', prop: 'takeNumber', minWidth: 130, align: 'center', slot: 'takeNumber' },
      { label: '需求名称', prop: 'planName', minWidth: 150, align: 'center' },
      { label: '供应商', prop: 'sellerName', minWidth: 160, align: 'center' },
      { label: '标段项目', prop: 'sectionShortName', minWidth: 150, align: 'center' },
      { label: '收货时间', prop: 'takeDate', minWidth: 120, align: 'center', slot: 'takeDate' },
      { label: '操作人', prop: 'createUserName', minWidth: 120, align: 'center' },
      { label: '附件类型', prop: 'fileType', minWidth: 140, align: 'center', slot: 'fileType' },
      { label: '附件', prop: 'attachment', width: 200, slot: 'attachment' },],
      inspectionColumns: [{ label: '序号', prop: '__index', width: 80, align: 'center' },
      { label: '质检入库ID', prop: 'storeNumber', minWidth: 130, align: 'center', slot: 'storeNumber' },
      { label: '标段项目', prop: 'sectionShortName', minWidth: 150, align: 'center' },
      { label: '收货单号', prop: 'takeNumber', minWidth: 150, align: 'center', slot: 'takeNumber' },
      { label: '需求名称', prop: 'planName', minWidth: 150, align: 'center' },
      { label: '供应商', prop: 'sellerName', minWidth: 150, align: 'center' },
      { label: '报检时间', prop: 'storeDate', minWidth: 120, align: 'center', slot: 'storeDate' },
      { label: '操作人', prop: 'createUserName', minWidth: 120, align: 'center' },
      { label: '附件类型', prop: 'fileType', minWidth: 140, align: 'center', slot: 'fileType' },
      { label: '附件', prop: 'attachment', width: 200, slot: 'attachment' },],
      outboundColumns: [{ label: '序号', prop: '__index', width: 80, align: 'center' },
      { label: '出库ID', prop: 'outNumber', minWidth: 130, align: 'center', slot: 'outNumber' },
      { label: '标段项目', prop: 'sectionShortName', minWidth: 150, align: 'center' },
      { label: '需求名称', prop: 'planName', minWidth: 150, align: 'center' },
      { label: '领用单位', prop: 'receiveDeptName', minWidth: 150, align: 'center' },
      { label: '领用人', prop: 'pickUserName', minWidth: 150, align: 'center' },
      { label: '领料日期', prop: 'pickDate', minWidth: 120, align: 'center', slot: 'pickDate' },
      { label: '发料人', prop: 'issueUserName', minWidth: 150, align: 'center' },
      { label: '操作人', prop: 'createUserName', minWidth: 150, align: 'center' },
      { label: '附件类型', prop: 'fileType', minWidth: 140, align: 'center', },
      { label: '附件', prop: 'attachment', width: 200, slot: 'attachment' },],
      returnColumns: [{ label: '序号', prop: '__index', width: 80, align: 'center' },
      { label: '退货ID', prop: 'backNumber', minWidth: 130, align: 'center', slot: 'backNumber' },
      { label: '标段项目', prop: 'sectionShortName', minWidth: 150, align: 'center' },
      { label: '退货环节', prop: 'isQualNodeName', minWidth: 150, align: 'center' },
      { label: '收货单号', prop: 'takeNumber', minWidth: 150, align: 'center',slot:'takeNumber' },
      { label: '发货单号', prop: 'shipmentBatchNumber', minWidth: 150, align: 'center',slot:'shipmentBatchNumber' },
      { label: '需求名称', prop: 'planName', minWidth: 200, align: 'center' },
      { label: '发货时间', prop: 'shippingDate', minWidth: 150, align: 'center', slot: 'shippingDate' },
      { label: '退货时间', prop: 'backDate', minWidth: 120, align: 'center', slot: 'backDate' },
      { label: '供应商', prop: 'sellerName', minWidth: 200, align: 'center' },
      { label: '操作人', prop: 'backOperator', minWidth: 150, align: 'center' },
      { label: '附件类型', prop: 'fileType', minWidth: 140, align: 'center', },
      { label: '附件', prop: 'attachment', width: 200, slot: 'attachment' },],
      sectionShortName: '',
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
    },
    relatedQueryParams() {
      return {
        projectId: this.id,
        sectionShortName: this.sectionShortName
      }
    },
    sectionQueryParams() {
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
    toDetail(row, type) {
      switch (type) {
        case 'project':
          this.$router.push({
            name: 'detailLine',
            query: {
              id: row.id,
              type: 'view',
            }
          })
          break
        case 'section':
          this.$router.push({
            name: 'detailSection',
            query: {
              id: row.id,
              type: 'view',
            }
          })
          break
        case 'contract':
          this.$router.push({
            name: 'detailContract',
            query: {
              id: row.id,
              type: 'view',
            }
          })
          break
        case 'requirement':
          this.$router.push({
            name: 'requestDetail',
            query: {
              id: row.id,
              type: 'view',
            }
          })
          break
        case 'delivery':
          this.$router.push({
            name: 'addSend',
            query: {
              id: row.id,
              type: 'view',
            }
          })
          break
        case 'receipt':
          this.$router.push({
            name: 'receivePage',
            query: {
              id: row.id,
              takeStatus: 2,
              type: 'view',
            }
          })
          break
        case 'SH':
          this.$router.push({
            name: 'receivePage',
            query: {
              id: row,
              takeStatus: 2,
              type: 'view',
            }
          })
          break
        case 'FH':
          this.$router.push({
            name: 'addSend',
            query: {
              id: row,
              type: 'view',
            }
          })
          break
        case 'inspection':
          this.$router.push({
            name: 'imPage',
            query: {
              id: row.id,
              storeStatus: row.storeStatus,
              type: 'view',
            }
          })
          break
        case 'outbound':
          this.$router.push({
            name: 'omDetail',
            query: {
              id: row.id,
              type: 'view',
            }
          })
          break
        case 'return':
          if (row.isQualNode == 3) {

            this.$router.push({
              name: 'addSpok',
              query: {
                id: row.id,
                type: 'view',
                from: 'THXQ'
              }
            })
          } else {
            this.$router.push({
              name: "returnDetail_gys",
              query: {
                type: "view",
                id: row.id,
                backNode: row.issueType
              },
            });
          }
          break
      }
    },
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
    handleSectionSearchChange(val) {
      this.sectionShortName = val || ''
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
