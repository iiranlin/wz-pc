<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :button-disable="handleTopButtonDisabled"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
      @handleQuery="handleQuery" @handleResetField="handleResetField">
      <template slot="matlClassifyId" slot-scope="scope">
        <el-input :disabled="true" v-model="formDataClick.matlClassifyId"></el-input>
      </template>
      <template v-slot:unitName="{ data, i18nData }">
        <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
      </template>
      <template v-slot:warehouseId="{ data, i18nData }">
        <FormWarehouseCode :formData="formData" :i18nData="i18nData" :fieldData="data" />
      </template>
    </form-data>
    <el-row type="flex" class="container_h">
      <collapse v-show="tableType === '2'">
        <el-col :xs="24" class="container_flex_overflow" v-loading="treeLoading">
          <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
          </el-input>
          <div class="head-container ov_head">
            <el-tree class="drawer-tree" node-key="matlClassifyId" :indent="0" :data="dataOptions" :props="defaultProps"
              :expand-on-click-node="false" ref="tree" :highlight-current="true" :filter-node-method="filterNode"
              @node-click="handleNodeClick" />
          </div>
        </el-col>
      </collapse>
      <!--用户数据-->
      <el-col :span="20" :xs="24" class="container_flex">
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []" :menuId="menuId"
          :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
          @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
          @cleanClick="cleanClick">
          <template v-slot:tab>
            <orderDetailType :value="tableType" @input="handleTableTypeChange" />
          </template>
        </right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
          :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
          @handleSelectionChange="handleSelectionChange" @clickLink="clickLink" @handleButton="handleButton"
          @selectChange="selectChange" @emitAblFilter="emitAblFilter">
          <template slot="applyStatus" slot-scope="scope">
            <span :class="'saleStatus-' + scope.value">{{ scope.value | fieldFormat(scope.fieldFormatArr)
            }}</span>
          </template>
          <template slot="status" slot-scope="scope">

            <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value |
              fieldFormat(scope.fieldFormatArr) }}
          </template>
          <template slot="fileList" slot-scope="scope">
            <el-link :type="!scope.data.fileList || !scope.data.fileList.length ? 'info' : 'primary'"
              :disabled="!scope.data.fileList || !scope.data.fileList.length"
              @click.stop="linkClick(scope)">查看</el-link>
          </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
    <fileList ref="fileList" />
  </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import { classTree } from '@/api/prodmgr-mm/matlClass';
import { applyQueryList, applyDetailQueryList, exportDetailQueryList } from '@/api/prodmgr-inv/scrapApply'
import fileList from '@/views/components/fileList/index'
import { menuConfig } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import collapse from '@/components/Collapse'
import FormUnitId from '@/views/components/form-unitId'
import FormWarehouseCode from '@/views/components/FormWarehouseCode'
export default {
  name: 'scrapApplyQuery',
  mixins: [indexMixin],
  props: {
    tableType: {
      type: String,
      default: '1'
    },
    tabChange: {
      type: Function,
      default: null
    }
  },
  components: { fileList, orderDetailType, collapse, FormUnitId, FormWarehouseCode },
  data() {
    const arg = this.tableType == '2' ? { matlClassifyId: '全部' } : {}
    return {
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 表格数据
      list: [],
      //列表选中数据
      selection: [],
      // 表格序号是否展示
      numberShow: true,
      // 页面属性
      property: {},
      total: 0,
      // 查询参数
      listQuery: {
        pageNum: 1,
        pageSize:  30
      },
      filterText: "",
      dataOptions: undefined,
      defaultProps: {
        children: "children",
        label: "matlClassifyName",
      },
      treeCurrentKey: '',
      // 表单参数
      formData: {},
      formDataClick: {
        ...arg
      },
      treeLoading: false,
      menuId: ''
    }

  },
  created() {
    this.menuProperty({ '1': '', '2': menuConfig.MENU_BFSQ_BRANCH_CX }[this.tableType])
    this.classTree();
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return !!this.$py.match(data.matlClassifyName, value) || data.matlClassifyCode.indexOf(value) !== -1;
    },
    menuProperty(id = '') {
      this.menuId = id || this.$route.meta.id
      this.$store.dispatch('menuProperty', this.menuId).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30
        for (let i = 0; i < data.search.length; i++) {
          if (["matlClassifyId"].includes(data.search[i].fieldCode)) {
            data.search[i]['clear'] = true
            break
          }
        }
        this.property = data
      })
    },
    handleTopButtonDisabled(button) {
      return this.selection.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
      return false
    },
    numberChange(val) {
      this.numberShow = val
    },
    newButton(buttonCode, formId, buttonData) {
      this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
    },
    handleCheckAllChange(columns) {
      this.$refs.tableIndex.init(columns)
    },
    clickReset() {
      this.handleQuery()
    },
    //选择框回调
    selectChange(row) {
      let { formData, isWatch } = row
      if (!isWatch) {
        this.handleQuery(formData)
      } else {
        this.formData = Object.assign({}, this.formData, formData)
      }
    },
    cleanClick(data) {
      for (const key of data) {
        if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
          this.$refs.formData.resetQueryDateRange(key)
        }
        this.formData[key] = null
      }
      this.handleQuery()
    },
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row)
      this.formDataClick = Object.assign({}, this.formData, row)
      if (this.tableType == '2') {
        if (!this.formDataClick.matlClassifyId) {
          this.formDataClick.matlClassifyId = '全部'
        } else {
          const node = this.$refs.tree.getCurrentNode()
          if (node && node.matlClassifyName) {
            this.formDataClick.matlClassifyId = node.matlClassifyName
          }

        }
      }
      this.getList()
    },
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery)
      this.handleQuery()
    },
    handleSelectionChange(ids, single, multiple, selection) {
      this.ids = ids
      this.single = single
      this.multiple = multiple
      this.selection = selection
    },
    handleResetField() {
      this.formData.matlClassifyId = null;
      this.$refs.tree.setCurrentKey(null);
      this.treeCurrentKey = "";
      this.formDataClick.matlClassifyId = '全部';
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      if (buttonCode === 'export') {
        this.handleExport();
      }
    },
    async handleExport() {
      try {
        const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
        await exportDetailQueryList(Object.assign({}, this.listQuery, this.formData, { exportColumns }))
      } catch (err) {
        console.error(err)
      }
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true
      if (this.tableType === '1') {
        applyQueryList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
          this.list = data.list
          this.total = data.total
        }).finally(() => {
          this.loading = false
        })
      } else {
        if (this.formData.matlClassifyId == '全部') {
          delete this.formData.matlClassifyId
        }
        applyDetailQueryList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
          this.list = data.list
          this.total = data.total
        }).finally(() => {
          this.loading = false
        })
      }
    },
    classTree() {
      this.treeLoading = true;
      classTree().then(({ data }) => {
        this.dataOptions = data || [];
        this.treeLoading = false;
      }).finally(() => {
        this.treeLoading = false;
      })
    },
    // 节点单击事件
    handleNodeClick(data) {
      if (data.matlClassifyId === this.treeCurrentKey) {
        // 再次点击当前节点取消选中,查询全部
        this.formData.matlClassifyId = null;
        this.$refs.tree.setCurrentKey(null);
        this.treeCurrentKey = "";
        this.formDataClick.matlClassifyId = '全部';
      } else {
        this.treeCurrentKey = data.matlClassifyId;
        this.formData.matlClassifyId = data.matlClassifyId;
        this.formDataClick.matlClassifyId = data.matlClassifyName;
      }
      this.getList();
    },
    async linkClick(scope) {
      this.$refs.fileList.init(scope.value)
    },
    clickLink(row, code) {
      const objPush = {
        scrapCode: () => {
          this.$router.push({
            name: 'scrapApplyOperate',
            query: { type: 'view', id: this.tableType == '1' ? row.id : row.applyId, name: 'scrapApplyQuery', isQuery: 'query' }
          })
        },
        batchNo: () => {
          this.$router.push({ name: 'batchNoDetail', query: { type: "view", id: row.batchNo, name: 'scrapApplyQuery', isQuery: 'query' } })
        },
        matlCode: () => {
          this.$router.push({ name: 'materialArchivesOperate', query: { type: "view", matlCode: row.matlCode, name: 'scrapApplyQuery', isQuery: 'query' } })
        },
        projectCode: () => {
          this.$router.push({ name: 'projectManagementOperate', query: { name: 'scrapApplyQuery', type: 'view', id: row.projectId, isQuery: 'query' } })
        }
      }
      objPush[code] && objPush[code]()
    }
  }
}
</script>

<style lang="scss" scope>
.purchaseOrder_radio {
  margin-left: 20px;
  margin-top: 16px;
}

.ov_head {
  flex: 1;
  height: 100%;
  overflow-y: scroll;
}
</style>
