<template>
  <Dialog  tabindex='1' class="flex-dialog max-height-dialog" title="借出单选择"
    :visible.sync="visible"   :close-on-click-modal="false" :close-on-press-escape="false" width="1300px" >
    <div class="app-container container_flex">

      <form-data ref="formData" :treeList="treeList" :showSearch="showSearch" :searchArr="property.search || []"
        :formData="formData" @handleQuery="handleQuery" />

      <el-row type="flex" class="container_h">
        <el-col :xs="24" class="container_flex_overflow" v-loading="treeLoading">
          <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
          </el-input>
          <div class="head-container ov_head">
            <span class="ov_head_title">物料分类</span>
            <el-tree class="drawer-tree" node-key="matlClassifyId" :indent="0" :data="dataOptions" :props="defaultProps"
              :expand-on-click-node="false" ref="tree" :highlight-current="true" :filter-node-method="filterNode"
              @node-click="handleNodeClick" />
          </div>
        </el-col>
        <el-col :span="20" :xs="24" class="container_flex">
          <table-index ref="tableIndex" idName="lendDetailId" :visibleAction="false"  :loading="loading" :tableIndexs="tableIndex" :tableData="list"
            :property="property" :numberShow="numberShow" @handleSelectionChange="handleSelectionChange" @clickLink="clickLink">
            <!-- <template slot="matlCode" slot-scope="scope">
              <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {matlCode: scope.data.matlCode, refName: 'materialArchivesOperate'})">{{ scope.data.matlCode }}</el-button>
          </template>
          <template slot="lendCode" slot-scope="scope">
              <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {matlCode: scope.data.matlCode, refName: 'materialArchivesOperate'})">{{ scope.data.matlCode }}</el-button>
          </template> -->
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
import { menuConfig } from '@/utils'
import { classTree } from '@/api/prodmgr-mm/matlClass';
import {
  returnQuoteList,
} from '@/api/warehouseManage/lendManage'

export default {
  name: 'selectLend',
  mixins: [indexMixin],
  components: {
    DetailDialog: () => import('@/views/components/DetailDialog')
  },
  props: {
    // 是否只能选择相同借出单号
    oneLendCode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      showSearch: true,
      searchInfo: {
        projectCode: '',
        projectName: '',
        projectManagerName: ''
      },
      numberShow: true,
      property: {},
      filterText: "",
      dataOptions: undefined,
      treeLoading: false,
      treeList: {
        deptId: [],
      },
      list: [],
      loading: false,
      selectRowId: '',
      selectRow: {},
      total: 0,
      treeLoading: false,
      defaultProps: {
        children: "children",
        label: "matlClassifyName",
      },
      formData: {},
      listQuery: {
        pageNum: 1,
        pageSize:  30,
      },
      // 一个页面选择多个项目时，方便区分
      selectType: '',
      menuId: menuConfig.MENU_LEND_BRANCH
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.list = []
      } else {
        this.$nextTick(() => {
          this.list = []
          this.selectRow = []
          this.selectRowId = ''
          this.listQuery.pageNum = 1
          this.listQuery.pageSize = 30
          this.getList()
        })
      }
    }
  },
  methods: {
    clickLink(row, code) {
      if(code == 'lendCode') {
        this.clickRouterInDialog(this.$refs.detailDialogRef, {id: row.lendId, refName: 'createLendOrder'})
      }else if(code == 'matlCode') {
        this.clickRouterInDialog(this.$refs.detailDialogRef, {matlCode: row.matlCode, refName: 'materialArchivesOperate'})
      }
    },
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row);
      this.getList();
    },
    getTreeList() {
      this.treeLoading = true;
      classTree().then(({ data }) => {
        this.dataOptions = data || [];
      }).finally(() => {
        this.treeLoading = false;
      })
    },
    handleNodeClick(node) {
      this.formData.matlClassifyId = node.matlClassifyId
      this.getList()
    },
    filterNode(value, data) {
      if (!value) return true;
      return !!this.$py.match(data.matlClassifyName, value) || data.matlClassifyCode.indexOf(value) !== -1;
    },
    open(type, val) {
      this._val = val
      this.visible = true
      this.selectType = type
      this.menuProperty();
      this.getDeptTree();
      this.getTreeList()
    },
    async getDeptTree() {
      const unitOps = (await this.getDeptTreeByUserMixin()) || [];
      this.treeList.deptId = unitOps;
    },
    async menuProperty() {
      const property = await this.$store.dispatch('menuProperty', this.menuId)
      this.listQuery.pageSize = property.defaultPageSize || 30
      property.fields.forEach((field) => {
        if (['fileList'].includes(field.fieldCode)) {
          field.listSlot = field.fieldCode
        }
        if(['status', 'lendStatus'].includes(field.fieldCode)) {
          field.isHide = 1
        }

      })
      this.property = property
    },
    handleSelectionChange(ids, single, multiple, row) {
      this.selectRow = row
    },
    searchData() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    // 保存选择
    saveSelection() {
      if (!this.selectRow.length) {
        this.$message.warning('请选择借出单')
        return
      }
      if(this.oneLendCode){
        const lendCode = this.selectRow[0].lendCode
        const flag = this.selectRow.some(item => item.lendCode != lendCode)
        if (flag) {
          this.$message.warning('只能选择同一个借出单号的数据')
          return
        }
      }
      this.$emit('selections', this.selectRow, this.selectType)
      this.visible = false
    },

    // 查询物资
    getList() {
      this.loading = true
      returnQuoteList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data?.list || []
        this.total = data?.total || 0
        for(let i=0; i<this.list.length; i++ ) {
          if(this.list[i].lendCode == this._val) {
            this.$nextTick(() => {
              this.$refs.tableIndex.$refs.elTable.toggleRowSelection(this.list[i])
            })
           
            break
          }
        }
      }).finally(() => {
        this.loading = false
      })
    },
  }
}
</script>

<style scoped lang="scss">
.table-wrapper {
  flex: 1;
}
</style>
