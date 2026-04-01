<template>
  <div class="app-container container_flex">
    <button-top
      :buttonTopData="property.buttonTop"
      :multiple="multiple"
      :single="single"
      @newButton="newButton"
      :buttonDisable="buttonDisable"
    ></button-top>
    <form-data
      ref="formData"
      :showSearch="showSearch"
      :searchArr="property.search || []"
      @handleQuery="handleQuery"
      @handleResetField="handleResetField"
      :formData="formData"
    >
    
      <template #status="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择'" clearable style="width: 100%" size="small">
          <el-option v-for="(item, key) in statusOptions" :key="key" :label="item.label" :value="item.value" />
        </el-select>
      </template>
      <template #tenderYear="data">
        <el-date-picker v-model="formData[data.data.fieldCode]" type="year" placeholder="请选择" style="width: 100%"/>
      </template>
    </form-data>
    <el-row type="flex" class="container_h">
      <!--用户数据-->
      <el-col :span="20" :xs="24" class="container_flex">
        <right-toolbar
          ref="rightToolbar"
          :formData="formDataClick"
          :searchArr="property.search || []"
          :showSearch.sync="showSearch"
          :columns="property.fields"
          @queryTable="handleQuery"
          @handleCheckAllChange="handleCheckAllChange"
          @clickReset="clickReset"
          @numberChange="numberChange"
          @cleanClick="cleanClick"
        ></right-toolbar>
        <table-index
          ref="tableIndex"
          :loading="loading"
          :tableIndexs="tableIndex"
          :tableData="list"
          :property="property"
          :numberShow="numberShow"
          @handleSelectionChange="handleSelectionChange"
          @selectChange="selectChange"
          @emitAblFilter="emitAblFilter"
          @handleButton="handleButton"
          :customnDisabled="true"
        >
        <template #status="scoped">
          {{scoped.data.status === '0' ? '未提交' : '已提交'}}
        </template>
        <template #tenderNumber="scoped">
          <el-button type="text" @click="getDtail(scoped.data.id)">
            {{scoped.data.tenderNumber}}
          </el-button>
        </template>
        </table-index>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="listQuery.pageNum"
          :limit.sync="listQuery.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as Api from '@/api/prodmgr-inv/project/contract.js'
import * as FileApi from "@/api/prodmgr-inv/project/file.js";
import * as LineApi from '@/api/prodmgr-inv/project/line.js'
import indexMixin from "@/views/mixins";
export default {
  // 招标统计
  name: "tenderStatics",
  mixins: [indexMixin],
  activated() {
     this.getList();
  },
  data () {
    return {
      // 页面属性
      property: { fields: [{ isAdd: 1, isEdit: 1 }] },
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
      numberShow: true,
      // 表格数据
      list: [],
      // 弹出层标题
      title: "",
      // 部门树选项
      deptOptions: undefined,
      // 部门树遮罩
      treeLoading: false,
     
      // 查询参数
      formData: {},
      formDataClick: {},
      total: 0,
      selection: [],
      hasOwn: true,
      statusOptions: [
        {label: '未提交', value: '0'},
        {label: '已提交', value: '1'} 
      ],
    };
  },
  created () {
    let id = this.$route.meta.id;
    this.$store.dispatch("menuProperty", id).then((data) => {
      this.property = data;
    });
  },
  methods: {
    numberChange (val) {
      this.numberShow = val;
    },
    newButton (buttonCode, formId, buttonData) {
      this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
    },
    handleCheckAllChange (columns) {
      this.$refs.tableIndex.init(columns);
    },
    //选择框回调
    selectChange (row) {
      let { formData, isWatch } = row;
      if (!isWatch) {
        this.handleQuery(formData);
      } else {
        this.formData = Object.assign({}, this.formData, formData);
      }
    },
    emitAblFilter (listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery);
      this.handleQuery();
    },
    handleQuery (row = {}, type = '') {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    /** 查询菜单列表 */
    getList () {
      this.loading = true
      this.listQuery.orderByColumn = 'status,createTime'
      this.listQuery.isAsc = "false"
      // 处理tenderYear字段，确保它是数字类型
      const formDataWithYear = { ...this.formData };
      if (formDataWithYear.tenderYear) {
        if (typeof formDataWithYear.tenderYear === 'object') {
          formDataWithYear.tenderYear = formDataWithYear.tenderYear.getFullYear();
        } else if (typeof formDataWithYear.tenderYear === 'string') {
          formDataWithYear.tenderYear = parseInt(formDataWithYear.tenderYear);
        }
      }

      const queryParams = Object.assign({}, this.listQuery, formDataWithYear);
      Api.tenderStatisticsList(queryParams).then(({ data }) => {
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleSelectionChange (ids, single, multiple, selection) {
      this.ids = ids;
      this.single = single;
      this.multiple = multiple;
      this.selection = selection;
    },
    getDtail(id){
        this.$router.push({name: 'addTenderStatics', query: {type: 'view', id: id}})
    },
    buttonDisable (btn) {
       /**
         * 状态 0-未提交 1-已提交
         * 未提交可操作: 修改（单条操作），提交，删除（批量操作）
         * 已提交可操作: 撤回 （批量操作）
         * 
         * 新增按钮随时都可点击，下载按钮需要选中数据
         * **/
        
        // 新增按钮随时都可点击
        if (btn.buttonCode === 'create') {
          return false;
        }

        // 下载按钮需要选中且只能选中一条数据
        if (btn.buttonCode === 'export') {
          return !this.selection || this.selection.length !== 1;
        }

        // 如果没有选中行，禁用其他按钮
        if (!this.selection || this.selection.length === 0) {
          return true;
        }

        // 修改按钮只允许单条操作
        if (btn.buttonCode === 'update' && this.selection.length > 1) {
          return true;
        }

        const status = this.selection[0].status;
        // 未提交可操作: 修改，提交，删除
        if (status === '0') {
          return btn.buttonCode !== 'submit' && btn.buttonCode !== 'update' && btn.buttonCode !== 'delete';
        }
        // 已提交可操作: 撤回
        if (status === '1') {
          return btn.buttonCode !== 'withdraw';
        }
    },
    handleButton (buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      switch (buttonCode) {
        case "create":
          this.$router.push({name: 'addTenderStatics', query: {type: 'create'},
            meta: {
              title: "新增统计信息",
            }
          })
          break;
        case "update":
          this.$router.push({name: 'addTenderStatics', query: {type: 'update', id: rowArr[0].id},
            meta: {
              title: "修改统计信息",
            }
          })
          break;
        case "delete":
          this.handleDelete(idArr)
          break;
        case "submit":
          this.$modal.confirm("是否确认提交?").then(function () {
            return Api.batchUpdateStatus({ ids: idArr, status: '1' });
          }).then(() => {
            this.getList();
            this.$modal.msgSuccess("提交成功");
          })
          break;
        case "withdraw":
          this.$modal.confirm("是否确认撤回?").then(function () {
            return Api.batchUpdateStatus({ ids: idArr, status: '0' });
          }).then(() => {
            this.getList();
            this.$modal.msgSuccess("撤回成功");
          })
          break;
        case "export":
          this.handleDonwload(idArr[0])
          break;
      }
    },
     async handleDonwload(id) {
      try {
        this.loading = true;
        await FileApi.customDownload({businessType:136, businessData: id});

      } catch (error) {
        this.$modal.msgError("下载失败，请重试");
        console.error('下载统计信息失败:', error);
      } finally {
        this.loading = false;
      }
    },
    handleDelete (ids) {
      this.$modal.confirm("是否确认删除?").then(function () {
        return Api.batchRemoveTenderStatistics({ ids });
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      })
    },
    /** right-toolbar 触发的重置 */
    clickReset () {
      this.handleQuery();
    },
    // 重置表单时恢复默认日期
    handleResetField() {
      this.handleQuery();
    },
    cleanClick (data) {
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