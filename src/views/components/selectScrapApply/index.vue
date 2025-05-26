<template>
  <Dialog  tabindex='1' class="flex-dialog max-height-dialog" title="选择报废单"
    :visible.sync="visible"   :close-on-click-modal="false" :close-on-press-escape="false" width="1300px">
    <form-data ref="formData" :showSearch="true" :searchArr="property.search || []" :formData="formData"
      @handleQuery="handleQuery" @handleResetField="handleResetField">
      <template slot="matlClassifyId">
          <el-input :disabled="true" v-model="matlClassify"></el-input>
      </template>
      <template slot="unitName">
        <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData"
            :fieldData="{ fieldCode: 'unitName', fieldName: '所属组织' }" z-index="99999"/>
      </template>
      <template v-slot:warehouseId="{ data, i18nData }">
        <FormWarehouseCode :formData="formData" :i18nData="i18nData" :fieldData="data" z-index="99999"/>
      </template>
    </form-data>

    <div class="table-wrapper" style="height: 100%;">
      <el-row class="table-wrapper" style="height: 100%;">
        <el-col :span="6" v-loading="treeLoading">
          <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
          </el-input>
          <div class="head-container ov_head">
            <el-tree class="drawer-tree" node-key="matlClassifyId" :indent="0" :data="dataOptions" :props="defaultProps"
              :expand-on-click-node="false" ref="tree" :highlight-current="true" :filter-node-method="filterNode"
              @node-click="handleNodeClick" />
          </div>
        </el-col>
        <el-col :span="18" class="container_flex table-wrapper">
          <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :visibleAction="false"
            :tableData="tableData" customnDisabled :property="property" :numberShow="true"
            :selectable="isSelectable" :row-style="changeDisabled" :reserve-selection="true" @handleSelectionChange="handleSelectionChange">
            <template slot="matlCode" slot-scope="scope">
              <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {matlCode: scope.data.matlCode, refName: 'materialArchivesOperate'})">{{ scope.data.matlCode }}</el-button>
            </template>
            <template slot="projectCode" slot-scope="scope">
              <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {id: scope.data.projectId, refName: 'projectManagementOperate'})">{{ scope.data.projectCode }}</el-button>
            </template> 
            <template slot="scrapCode" slot-scope="scope">
                <span>{{ scope.data.scrapCode }}</span>
            </template> 
            <template slot="batchNo" slot-scope="scope">
              <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {id: scope.data.batchNo, refName: 'batchNoDetail'})">{{ scope.data.batchNo }}</el-button>
            </template> 
          </table-index>
          <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        </el-col>
      </el-row>

    </div>

    <template #footer>
      <el-button plain round type="primary" @click="saveSelection" v-preventReClick>保存</el-button>
      <el-button plain round @click.native="visible = false">取消</el-button>
    </template>
    <detail-dialog ref="detailDialogRef"/>
  </Dialog>
</template>

<script>

import indexMixin from '@/views/mixins'
import { getQuoteList } from '@/api/prodmgr-inv/scrapApply'
import { classTree } from '@/api/prodmgr-mm/matlClass';

export default {
  name: 'selectScrapApply',
  mixins: [indexMixin],
  components: {
    FormUnitId: () => import('@/views/components/form-unitId'),
    DetailDialog: () => import('@/views/components/DetailDialog'),
    FormWarehouseCode: () => import( '@/views/components/FormWarehouseCode')
  },
  data() {
    return {
      dialogParam: {},
      visible: false,
      filterText: '',
      defaultProps: {
        children: "children",
        label: "matlClassifyName",
      },
      formData: {},
      treeLoading: false,
      treeCurrentKey: '',
      loading: false,
      tableData: [],
      dataOptions: [],
      selectRow: [],
      total: 0,
      property: {},
      listQuery: {
        pageNum: 1,
        pageSize:  30
      },
      menuId: '1820284628970549248',
      selected: [],
      matlClassify:'全部'
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.tableData = []
      } else {
        this.$nextTick(() => {
          this.tableData = []
          this.selectRow = []
          this.listQuery.pageNum = 1
          this.listQuery.pageSize = 30
          this.getList()
        })
      }
    }
  },
  methods: {
    changeDisabled({row}) {
            const idList = this.selected.map((item) => item.id)
            return idList.includes(row.id) ? {
                opacity: "0.5",
                pointerEvents: "none"
            } : {}
    },
    isSelectable(row) {
            const idList = this.selected.map((item) => item.id)
            return !idList.includes(row.id)
        },
    // 节点单击事件
    handleNodeClick(data) {
      if (data.matlClassifyId === this.treeCurrentKey) {
        // 再次点击当前节点取消选中,查询全部
        this.formData.matlClassifyId = null;
        this.$refs.tree.setCurrentKey(null);
        this.treeCurrentKey = "";
      } else {
        this.treeCurrentKey = data.matlClassifyId;
        this.formData.matlClassifyId = data.matlClassifyId;
      }
      if(this.formData.matlClassifyId == null){
        this.matlClassify = '全部'
      }else{
        this.matlClassify = data.matlClassifyName;
      }
      this.getList();
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
    filterNode(value, data) {
      if (!value) return true;
      return !!this.$py.match(data.matlClassifyName, value) || data.matlClassifyCode.indexOf(value) !== -1;
    },
    async menuProperty() {
      try {
        const data = await this.$store.dispatch('menuProperty', this.menuId)
        this.listQuery.pageSize = data.defaultPageSize || 30
        data.fields.forEach(ele => {
          if(['scrapCode', 'batchNo', 'matlCode', 'projectCode'].includes(ele.fieldCode)) {
            ele.listSlot=ele.fieldCode
          }
          if(['scrapCode', "rowNum", "scrapName", "scrapReason", "sugHandMethod", "warehouseName", "placeName", "batchNo", "matlCode", "matlName", "matlType", "matlUnit", "type","expireStatus", "scrapNum","unitName", "projectCode", "projectName", "createUserName", "createDate", "identifyDate", "handleNum"].includes(ele.fieldCode)) {
            ele.isHide = 0
          }else {
            ele.isHide = 1
          }
        });
        this.property = data
      } catch (err) {
        console.error(err)
      }
    },
    handleSelectionChange(arr) {
      this.selectRow = arr
    },
    async open(arr = []) {
      this.visible = true
      this._selectRow = arr.map(({id}) => id)
      this.selected = arr
      this.classTree();
      this.menuProperty()
    },
    onChange(val) {
      this.selectRow = this.tableData.find(item => item.id == this.selectRowId)
    },
    searchData() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    saveSelection() {
      if (!this.selectRow.length) {
        this.$message.warning('请选择报废单')
        return
      }
      const arr = this.tableData.filter(({ id }) => this.selectRow.includes(id))

      //同项目 同所属组织
      let unitId = arr[0].unitId;
      let projectId = arr[0].projectId;

      let findResult =  arr.some((item) => {
        return item.unitId != unitId || item.projectId != projectId;
      })
      if(findResult){
        this.$modal.msgError('请选择同一项目并且同一所属组织的单据!');
      }else{
        this.$emit('selections', arr)
        this.visible = false  
      }
    },
    dbClick(row) {
      this.$emit('selections', row)
      this.visible = false
    },
    async getList() {
      try {
        this.loading = true
        const param = Object.assign({}, this.listQuery, this.formData)
        const { data: { list, total } } = await getQuoteList(param)
        this.tableData = list || []
        this.total = total || 0
        // this.$nextTick(() => {
        //   if(!!this._selectRow.length) {
        //     const selected = list.filter(({id}) => this._selectRow.includes(id))
        //    this.$refs.tableIndex.updateSelection(selected)
        //   }
        // })
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row)
      this.getList()
    },
    handleResetField() {
      this.matlClassify = '全部'
    },
  }
}
</script>

<style scoped lang="scss">
.table-wrapper {
  flex: 1;
}
</style>
