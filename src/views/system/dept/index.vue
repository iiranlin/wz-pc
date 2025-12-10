<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
      @newButton="newButton"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery"
      :formData="formData" />
    <el-row type="flex" class="container_h">
      <!--部门数据-->
      <collapse>
        <el-col :xs="24" class="container_flex_overflow">
          <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
          </el-input>
          <div class="head-container ov_head">
            <el-tree v-loading="treeLoading" class="drawer-tree" node-key="id" :indent="0" :data="deptOptions"
              :props="defaultProps" :expand-on-click-node="false" ref="tree" :highlight-current="true"
              :filter-node-method="filterNode" @node-click="handleNodeClick"
              style="width: fit-content; min-width: 100%; overflow-x: auto;">
              <template slot-scope="{ node }">
                <span class="el-tree-node__label" :title="node.label">{{ node.label }}</span>
              </template>
            </el-tree>
          </div>
        </el-col>
      </collapse>


      <!--用户数据-->
      <el-col :span="12" :xs="24" class="container_flex">
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
          :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
          @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
          @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="dataList"
          :property="property" :numberShow="numberShow" @handleSelectionChange="handleSelectionChange"
          @selectChange="selectChange" @emitAblFilter="emitAblFilter" @handleButton="handleButton">
          <template #unitType="scope">
            {{ scope.data.deptCode | filterDept }}
          </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
    <operate ref="operate" @deptSuccess="deptSuccess" :deptOptions="deptOptions" />
    <operate-batch ref="operateBatch" :property="property" :deptOptions="deptOptions" @deptSuccess="deptSuccess" />
    <flow-auth ref="flowAuth" />
  </div>
</template>

<script>
import { list, deptTree, deptDeleteBatch } from "@/api/system/dept";
import operate from "./components/operate";
import flowAuth from "./components/flow-auth";
import operateBatch from "./components/operate-batch";
import indexMixin from "@/views/mixins";
import collapse from '@/components/Collapse'
export default {
  name: "dept",
  components: { operate, flowAuth, operateBatch, collapse },
  mixins: [indexMixin],
  filters: {
    filterDept(value) {
      if (!value) return ''
      const deptEnums = {
        'TLJ': '路局',
        'SN': '指挥部',
        'WZDL': '物代公司',
        'ZB': '施工单位(局指)',
        'FB': '施工单位(分部)',
        'JL': '监理单位',
        'GYS': '供应商'
      }
      return deptEnums[value.split('_')[0]]
    }
  },
  data() {
    return {
      treeCurrentKey: "",
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
      // 表格序号是否展示
      numberShow: false,
      // 表格数据
      dataList: [],
      // 弹出层标题
      title: "",
      // 部门树选项
      deptOptions: undefined,
      // 部门树遮罩
      treeLoading: false,
      //列表显示字段
      property: {},
      defaultProps: {
        children: "children",
        label: "deptName",
      },
      // 查询参数
      formData: {
        parentId: null,
      },
      formDataClick: {},
      total: 0,
      filterText: "",
      selection: [],
      hasOwn: true,
    };
  },
  created() {
    let id = this.$route.meta.id;
    this.$store.dispatch("menuProperty", id).then((data) => {
      this.property = data;
    });
    this.deptTree();
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return !!this.$py.match(data.deptName, value) || data.deptCode.indexOf(value) !== -1;
    },
    numberChange(val) {
      this.numberShow = val;
    },
    newButton(buttonCode, formId, buttonData) {
      this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
    },
    handleCheckAllChange(columns) {
      this.$refs.tableIndex.init(columns);
    },
    //选择框回调
    selectChange(row) {
      let { formData, isWatch } = row;
      if (!isWatch) {
        this.handleQuery(formData);
      } else {
        this.formData = Object.assign({}, this.formData, formData);
      }
    },
    deptTree() {
      this.treeLoading = true;
      this.formData.parentId = null;
      deptTree().then(({ data }) => {
        this.deptOptions = data;
        this.treeLoading = false;
      });
    },
    // 节点单击事件
    handleNodeClick(data) {
      if (data.id === this.treeCurrentKey) {
        // 再次点击当前节点取消选中,查询全部
        this.formData.parentId = null;
        this.$refs.tree.setCurrentKey(null);
        this.treeCurrentKey = "";
      } else {
        this.treeCurrentKey = data.id;
        this.formData.parentId = data.id;
      }
      this.getList();
    },
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery);
      this.handleQuery();
    },
    handleQuery(row = {}, type = '') {
      if (type === 'queryForm') {
        this.treeCurrentKey = '';
        this.formData.parentId = '';
        this.$refs.tree.setCurrentKey(null);
      }
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    getList() {
      this.loading = true;
      //   if (this.listQuery.orderByColumn === '') {
      //     this.listQuery.orderByColumn = 'updateTime'
      //     this.listQuery.isAsc = "desc"
      //   }
      list(
        Object.assign(
          { RULE_MENU_ID: this.$route.meta.id },
          this.listQuery,
          this.formData
        )
      ).then(({ data }) => {
        this.dataList = data.list;
        this.total = data.total;
        this.loading = false;
      });
    },
    handleSelectionChange(ids, single, multiple, selection) {
      this.ids = ids;
      this.single = single;
      this.multiple = multiple;
      this.selection = selection;
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      switch (buttonCode) {
        case "create":
          this.$refs.operate.init("create", this.formData.parentId);
          break;
        case "update":
          this.$refs.operate.init("update", idArr[0]);
          break;
        case "delete":
          this.$modal
            .confirm("是否确认删除组织机构?")
            .then(() => {
              return deptDeleteBatch({ ids: idArr });
            })
            .then(() => {
              this.deptTree();
              this.getList();
              this.$modal.msgSuccess("删除成功");
            })
            .catch(() => { });
          break;
        case "flowAuth":
          this.$refs.flowAuth.init(idArr);
          break;
        case "updateBatch":
          const list = this.selection;
          if (list.length > 0) {
            this.$refs["operateBatch"].init(list);
          } else {
            this.$message.warning("操作失败：未选择数据");
          }
          break;
        default:
          this.$message.warning("操作失败：功能未完善或已停用");
          break;
      }
    },
    deptSuccess() {
      this.handleQuery();
      this.deptTree();
    },
    clickReset() {
      this.handleQuery();
    },
    cleanClick(data) {
      for (const key of data) {
        if (key.indexOf("Start") != -1 || key.indexOf("End") != -1) {
          this.$refs.formData.resetQueryDateRange(key);
        }
        this.formData[key] = null;
      }
      this.handleQuery();
    },
  },
};
</script>
<style lang="scss" scoped>
.ov_head {
  flex: 1;
  height: 100%;
  overflow-y: scroll;
}
</style>