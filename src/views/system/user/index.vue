<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton">
      <template v-if="loginUser == '113362'">
        <el-button type="primary" plain size="mini" @click="handleExtend" class="custom_button">
          <icon-svg :icon-class="'Blue-Department'" />
          <span class="custom_button_text">扩展功能</span>
        </el-button>
      </template>
    </button-top>
    <form-data ref="formData" :treeList="treeList" :showSearch="showSearch" :searchArr="property.search || []"
      :formData="formData" @handleQuery="handleQuery" />
    <el-row type="flex" class="container_h">
      <!--部门数据-->
      <collapse>
        <el-col :xs="24" class="container_flex_overflow">
          <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
          </el-input>
          <div class="head-container ov_head">
            <el-tree class="drawer-tree" v-loading="treeLoading" node-key="id" :indent="0" :data="deptOptions"
              :props="defaultProps" :expand-on-click-node="false" ref="tree" :highlight-current="true"
              :filter-node-method="filterNode" @node-click="handleNodeClick"
              style="width: fit-content; min-width: 100%; overflow-x: auto;"
              >
              <template slot-scope="{ node }">
                <span class="el-tree-node__label" :title="node.label">{{ node.label }}</span>
              </template>
            </el-tree>
          </div>
        </el-col>
      </collapse>

      <!--用户数据-->
      <el-col :span="20" :xs="24" class="container_flex">
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
          :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
          @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
          @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="dataList"
          :property="property" :numberShow="numberShow" @handleSelectionChange="handleSelectionChange"
          @handleButton="handleButton" @selectChange="selectChange" @emitAblFilter="emitAblFilter" />
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
    <operate ref="operate" @operateSuccess="operateSuccess" />
    <role-drawer ref="roleDrawer" @userBindRoleSuccess="operateSuccess" />
    <extend-opt ref="extendOpt"></extend-opt>
    <unlock-user ref="unlockUser" />
  </div>
</template>

<script>
import components from './components'
import { userPage, userDeleteBatch, resetPwd } from "@/api/system/user";
import { getUserMenu } from "@/api/system/menu";
import { deptTree } from "@/api/system/dept";
import indexMixin from "@/views/mixins";
import collapse from '@/components/Collapse'
export default {
  name: "user",
  mixins: [indexMixin],
  components: { ...components, collapse },
  data() {
    return {
      // 遮罩层
      loading: false,
      treeLoading: false,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      dataList: [],
      defaultProps: {
        children: "children",
        label: "deptName",
      },
      // 部门列表
      deptOptions: [],
      property: {},
      formData: {
        deptId: ''
      },
      formDataClick: {},
      numberShow: false,
      // 菜单列表
      menuOptions: [],
      treeList: {},
      treeCurrentKey: "",
      filterText: "",
      loginUser: sessionStorage.getItem("username"),
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  created() {
    this.deptTree();
    this.getUserMenu();
    let id = this.$route.meta.id;
    this.$store.dispatch("menuProperty", id).then((data) => {
      this.property = data;
      this.property.search.forEach((item) => {
        if (item.fieldType == "tree") {
          if (item.fieldFormat == "deptId") {
            this.treeList[item.fieldFormat] = this.deptOptions;
          } else if (item.fieldFormat == "menuId") {
            this.treeList[item.fieldFormat] = this.menuOptions;
          }
        }
      });
    });
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return !!this.$py.match(data.deptName, value) || data.deptCode.indexOf(value) !== -1;
    },
    numberChange(val) {
      this.numberShow = val;
    },
    clickReset() {
      this.menuProperty();
      this.handleQuery();
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
      deptTree().then(({ data }) => {
        if (data[0].deptCode == "10000001") {
          this.deptOptions = data[0]["children"];
        } else {
          this.deptOptions = data;
        }
        this.treeLoading = false;
      });
    },
    getUserMenu() {
      getUserMenu().then(({ data }) => {
        this.menuOptions = data;
      });
    },
    // 节点单击事件
    handleNodeClick(data) {
      if (data.id === this.treeCurrentKey) {
        this.formData.deptId = null;
        this.$refs.tree.setCurrentKey(null);
        this.treeCurrentKey = "";
      } else {
        this.treeCurrentKey = data.id;
        this.formData.deptId = data.id;
      }
      this.getList();
    },
    handleQuery(row = {}, type = '') {
      if (type === 'queryForm') {
        this.treeCurrentKey = '';
        this.formData.deptId = '';
        this.$refs.tree.setCurrentKey(null);
      }
      this.listQuery.pageNum = 1;
      this.formData = Object.assign({}, this.formData, row)
      this.formDataClick = Object.assign({}, this.formData, row)
      this.getList();
    },
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery);
      this.handleQuery();
    },
    operateSuccess() {
      this.handleQuery();
    },
    handleTmplConfirm() {
      this.handleQuery();
    },
    handleSelectionChange(ids, single, multiple) {
      this.single = single;
      this.multiple = multiple;
    },
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      // if (this.listQuery.orderByColumn === '') {
      //   this.listQuery.orderByColumn = 'updateTime'
      //   this.listQuery.isAsc = "desc"
      // }
      userPage(Object.assign({}, this.listQuery, this.formData)).then(
        ({ data }) => {
          this.dataList = data.list;
          this.total = data.total;
          this.loading = false;
        }
      );
    },
    handleAuthRole(row) {
      this.$refs.roleDrawer.init(row, "user");
    },
   
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      let confirmMessage = "确定重置[" + row.nickName + "]的密码?";
      this.$modal.confirm(confirmMessage, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          resetPwd({ id: row.id }).then((res) => {
            this.$modal.msgSuccess(res.data || res.message);
          });
        })
        .catch(() => { });
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      switch (buttonCode) {
        case "create":
          this.$refs.operate.init("create", this.formData.deptId);
          break;
        case "update":
          this.$refs.operate.init("update", idArr[0]);
          break;
        case "tmpl":
          this.handleAuthTmpl(rowArr[0]);
          break;
        case "delete":
          this.$modal
            .confirm("是否确认删除用户?")
            .then(function () {
              return userDeleteBatch({ ids: idArr });
            })
            .then(() => {
              this.getList();
              this.$modal.msgSuccess("删除成功");
            });
          break;
        case "resetPwd":
          this.handleResetPwd(rowArr[0]);
          break;
        case "authRole":
          this.handleAuthRole(rowArr[0]);
          break;
        case "unlockUser":
          this.$refs["unlockUser"].init()
          break;
        default:
          break;
      }
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
    handleExtend() {
      this.$refs["extendOpt"].init();
    },
  },
};
</script>
<style lang="scss" scoped>
.custom_button {
  transform: translateY(-1px);
  background: #ffffff !important;
  border-radius: 50px;
  font-size: 12px;
  text-align: right;
  height: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 5px 30px 5px 24px;
  position: relative;
  min-width: 100px;
  margin-right: 6px;
  border: 1px solid #1890ff;
  box-sizing: border-box;
  line-height: 22px;
}

.svg-icon-font {
  float: left;
  margin-right: 3px;
  transform: translateY(-2px);
}

::v-deep.el-button.el-button--primary,
::v-deep.el-button.el-button--success,
::v-deep.el-button.el-button--info,
::v-deep.el-button.el-button--danger,
::v-deep.el-button.el-button--warning {
  color: #1b1e22;

  &:hover {
    color: #0A7DE8;
    border: 1px solid rgba(61, 138, 255, 1);
  }
}

::v-deep.el-button.is-disabled,
::v-deep.el-button.is-disabled:hover {
  border: 1px solid #ffffff;
}

.ov_head {
  flex: 1;
  height: 100%;
  overflow-y: scroll;
}
</style>
