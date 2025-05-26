<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :button-disable="handleTopButtonDisabled"></button-top>
    <form-data ref="formData" :formData="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery" />
    <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
      :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
      @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset"
      @numberChange="numberChange" @cleanClick="cleanClick"></right-toolbar>
    <table-index ref="tableIndex" :loading="loading" :tableData="roleList" :property="property" :numberShow="numberShow"
      :buttonDisable="handleButtonDisable" :selectable="selectable" @handleSelectionChange="handleSelectionChange"
      @selectChange="selectChange" @handleButton="handleButton" @emitAblFilter="emitAblFilter">
      <template slot="noticeMessage" slot-scope="scope">
        <el-link :type="!scope.data.fileList || !scope.data.fileList.length ? 'info' : 'primary'"
          :disabled="!scope.data.fileList || !scope.data.fileList.length" @click.stop="linkClick(scope)">查看</el-link>
      </template>
    </table-index>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />
    <operate ref="operate" @operateSuccess="handleQuery()" />
  </div>
</template>

<script>
import {
  serviceList,
  serviceRemove,
} from "@/api/system/frontend";
import indexMixin from "@/views/mixins";
import operate from "./components/operate";

export default {
  name: "frontendService",
  mixins: [indexMixin],
  components: { operate },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 角色表格数据
      roleList: [],
      // 页面属性
      property: {},
      // 是否展示序号
      numberShow: false,
      // 表单参数
      formData: {},
      formDataClick: {},
      //列表选中的数据
      selection: [],
    };
  },
  created() {
    this.menuProperty();
  },
  methods: {
    handleTopButtonDisabled(button) {
      return this.selection.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
      return false
    },
    selectable(item) {
      if (item.publish == '1') {
        return false
      } else {
        return true
      }
    },
    selectChange(row) {
      let { formData, isWatch } = row;
      if (!isWatch) {
        this.handleQuery(formData);
      } else {
        this.formData = Object.assign({}, this.formData, formData);
      }
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
    cleanClick(data) {
      for (const key of data) {
        if (key.indexOf("Start") != -1 || key.indexOf("End") != -1) {
          this.$refs.formData.resetQueryDateRange(key);
        }
        this.formData[key] = null;
      }
      this.handleQuery();
    },
    /** 搜索按钮操作 */
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1;
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    clickReset() {
      this.handleQuery();
    },
    menuProperty() {
      let id = this.$route.meta.id;
      this.$store.dispatch("menuProperty", id).then((data) => {
        this.property = data;
      });
    },
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery);
      this.handleQuery();
    },
    handleSelectionChange(ids, single, multiple, selection) {
      this.single = single;
      this.multiple = multiple;
      this.selection = selection;
    },
    /** 查询角色列表 */
    getList() {
      this.loading = true;
      serviceList(Object.assign({}, this.listQuery, this.formData)).then(
        ({ data }) => {
          this.roleList = data.list;
          this.total = data.total;
          this.loading = false;
        }
      );
    },
    handleCreate() {
      this.$refs.operate.init("create");
    },
    handleUpdate(id) {
      this.$refs.operate.init("update", id);
    },
    handleDelete(ids) {
      this.$modal.confirm("是否确认删除通知?").then(function () {
        return serviceRemove({ ids });
      }).then(() => {
        if ((this.total - ids.length) % (this.listQuery.pageSize) == 0) {
          this.listQuery.pageNum -= 1
        }
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      if (buttonCode === "update") {
        this.handleUpdate(idArr[0]);
      } else if (buttonCode === "delete") {
        this.handleDelete(idArr);
      } else if (buttonCode === "create") {
        this.handleCreate();
      }
    },
    linkClick(scope) {
      this.$refs.noticeMessage.init(scope.value);
    }
  },
};
</script>
