<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
      :buttonDisable="buttonDisable" @newButton="newButton" />
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []"
      :formData="formData" @handleQuery="handleQuery">
      <template #status>
        <el-select v-model="formData.status" clearable placeholder="请选择状态" style="width: 100%">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </template>
      <template #projectName="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" clearable
          placeholder="请选择建设项目" style="width: 100%" size="small">
          <el-option v-for="(item, key) in lineOptions" :key="key" :label="item.label" :value="item.value" />
        </el-select>
      </template>
      <template #catalogSupplier="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" clearable
          placeholder="请选择目录内厂家" style="width: 100%" size="small">
          <el-option label="是" value="1" />
          <el-option label="否" value="0" />
        </el-select>
      </template>
    </form-data>
    <el-row type="flex" class="container_h">
      <el-col :span="20" :xs="24" class="container_flex">
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
          :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
          @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset"
          @numberChange="numberChange" @cleanClick="cleanClick" />
        <table-index ref="tableIndex" :buttonDisable="tableButtonDisable" :loading="loading"
          :tableIndexs="tableIndex" :tableData="list" :property="property" :numberShow="numberShow"
          @handleSelectionChange="handleSelectionChange" @selectChange="selectChange"
          @emitAblFilter="emitAblFilter" @handleButton="handleButton">
          <template #status="scope">
            <span :class="['status-text', `status-${scope.value}`]">{{ statusMap[scope.value] || scope.value }}</span>
          </template>
          <template #billNo="scope">
            <el-button type="text" @click.stop="openPage('view', scope.data.id, scope.data.status)">{{ scope.value }}</el-button>
          </template>
          <template #receiptDate="scope">{{ formatDate(scope.value) }}</template>
          <template #createDate="scope">{{ formatDateTime(scope.value) }}</template>
          <template #catalogSupplier="scope">{{ catalogSupplierText(scope.value) }}</template>
          <template #proofFileList="scope">
            <file-upload :value="parseFileList(scope.value)" :limit="9999" :fileSize="500"
              :fileType="['pdf', 'jpg', 'png', 'jpeg', 'doc', 'docx', 'xls', 'xlsx']"
              :preview="true" :isShowTip="false" />
          </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
          :limit.sync="listQuery.pageSize" @pagination="getList" />
      </el-col>
    </el-row>
    <work-flow-view :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import * as Api from '@/api/prodmgr-inv/project/strategicProcurementGoodsReceipt.js'
import * as WzglApi from '@/api/prodmgr-inv/project/wzgl.js'
import * as FileApi from '@/api/prodmgr-inv/project/file.js'
import fileUpload from '@/components/upload'
import workFlowView from '@/components/workFlowView'
import indexMixin from '@/views/mixins'

const BUTTON_PERMISSIONS = {
  '1': ['update', 'delete', 'submit', 'export'],
  '2': ['update', 'withdraw', 'export', 'flowSee'],
  '3': ['update', 'export', 'flowSee'],
  '0': ['update', 'submit', 'export', 'flowSee']
}

export default {
  name: 'StrategicProcurementGoodsReceipt',
  components: { fileUpload, workFlowView },
  mixins: [indexMixin],
  data() {
    return {
      loading: false, list: [], total: 0, ids: [], selection: [], single: true, multiple: true,
      showSearch: true, numberShow: true, property: {}, formData: {}, formDataClick: {}, lineOptions: [],
      workFlowViewVisible: false, selectedRow: null,
      statusMap: { '1': '未提交', '2': '审核中', '3': '已完成', '0': '已驳回' },
      statusOptions: [
        { label: '未提交', value: '1' }, { label: '审核中', value: '2' },
        { label: '已完成', value: '3' }, { label: '已驳回', value: '0' }
      ]
    }
  },
  activated() { this.getList() },
  created() {
    this.$store.dispatch('menuProperty', this.$route.meta.id).then(data => { this.property = data })
    this.getLineOptions()
    this.getList()
  },
  methods: {
    getLineOptions() {
      WzglApi.lineSelectOptions({ pageStatus: '0' }).then(({ data }) => {
        this.lineOptions = (data || []).map(item => ({
          label: item.projectName,
          value: item.projectName
        }))
      })
    },
    formatDate(value) { return value ? dayjs(value).format('YYYY-MM-DD') : '' },
    formatDateTime(value) { return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '' },
    catalogSupplierText(value) {
      const normalizedValue = String(value)
      if (['是', '否'].includes(normalizedValue)) return normalizedValue
      return { '1': '是', '0': '否' }[normalizedValue] || ''
    },
    parseFileList(value) {
      if (Array.isArray(value)) return value
      if (!value) return []
      try { const result = JSON.parse(value); return Array.isArray(result) ? result : [] } catch (error) { return [] }
    },
    getList() {
      this.loading = true
      Api.itemList({ ...this.listQuery, ...this.formData }).then(({ data }) => {
        this.list = (data.list || []).map(item => ({
          ...item,
          catalogSupplierValue: String(item.catalogSupplier),
          catalogSupplier: this.catalogSupplierText(item.catalogSupplier)
        }))
        this.total = data.total || 0
      }).finally(() => { this.loading = false })
    },
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1
      this.formData = { ...this.formData, ...row }
      this.formDataClick = { ...this.formData }
      this.getList()
    },
    handleSelectionChange(ids, single, multiple, selection) {
      this.ids = ids; this.single = single; this.multiple = multiple; this.selection = selection
    },
    isButtonAllowed(buttonCode, row) {
      const code = buttonCode === 'download' ? 'export' : buttonCode
      const controlledButtons = ['update', 'delete', 'submit', 'withdraw', 'export', 'flowSee']
      if (!controlledButtons.includes(code)) return true
      return (BUTTON_PERMISSIONS[String(row.status)] || []).includes(code)
    },
    buttonDisable(button) {
      if (!this.selection.length) return false
      return this.selection.some(row => !this.isButtonAllowed(button.buttonCode, row))
    },
    tableButtonDisable(button, row) {
      return !this.isButtonAllowed(button.buttonCode, row)
    },
    newButton(buttonCode, formId, buttonData) {
      this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
    },
    handleButton(buttonCode, idArr) {
      if (buttonCode === 'create') return this.openPage('create')
      if (buttonCode === 'update') return this.openPage('update', idArr[0], this.getRowStatus(idArr[0]))
      if (buttonCode === 'view') return this.openPage('view', idArr[0], this.getRowStatus(idArr[0]))
      if (buttonCode === 'delete') return this.handleDelete(idArr)
      if (buttonCode === 'submit') return this.handleSubmit(idArr)
      if (buttonCode === 'withdraw') {
        return this.handleWithdraw({ businessId: idArr[0], businessType: 'ZLWZ' })
      }
      if (['download', 'export'].includes(buttonCode)) return this.handleDownload(idArr)
      if (buttonCode === 'flowSee') {
        this.selectedRow = { businessId: idArr[0] }
        this.workFlowViewVisible = true
      }
    },
    getRowStatus(id) {
      const row = this.list.find(item => String(item.id) === String(id))
      return row ? row.status : ''
    },
    openPage(type, id, status) {
      this.$router.push({
        name: 'addGoodsReceipt',
        query: { type, from: 'list', ...(id ? { id } : {}), ...(status !== '' && status != null ? { status } : {}) }
      })
    },
    handleDelete(ids) {
      this.$modal.confirm('是否确认删除所选记录？').then(() => {
        return ids.length === 1 ? Api.remove(ids[0]) : Api.batchRemove({ ids })
      }).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() })
    },
    handleSubmit(ids) {
      this.$modal.confirm('是否确认提交所选记录？').then(() => {
        return Api.submit({ ids })
      }).then(() => {
        this.$modal.msgSuccess('提交成功')
        this.getList()
      })
    },
    async handleDownload(ids = []) {
      try {
        this.loading = true
        const query = ids.length ? { idList: ids } : {}
        await FileApi.customDownload({ businessType: 17, businessData: JSON.stringify(query) })
      } catch (error) {
        this.$modal.msgError('下载失败，请重试')
      } finally {
        this.loading = false
      }
    },
    handleCheckAllChange(columns) { this.$refs.tableIndex.init(columns) },
    numberChange(value) { this.numberShow = value },
    selectChange({ formData, isWatch }) {
      if (isWatch) this.formData = { ...this.formData, ...formData }
      else this.handleQuery(formData)
    },
    emitAblFilter(listQuery) { this.listQuery = { ...this.listQuery, ...listQuery }; this.getList() },
    clickReset() { this.formData = {}; this.handleQuery() },
    cleanClick(fields) {
      fields.forEach(key => {
        if (key.includes('Start') || key.includes('End')) this.$refs.formData.resetQueryDateRange(key)
        this.$set(this.formData, key, null)
      })
      this.handleQuery()
    }
  }
}
</script>

<style lang="scss" scoped>
.status-text { font-weight: 500; }
.status-1 { color: #409eff; }
.status-2 { color: #409eff; }
.status-3 { color: #409eff; }
.status-0 { color: #409eff; }
</style>
