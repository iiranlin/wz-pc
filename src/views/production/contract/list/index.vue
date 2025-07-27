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
      :formData="formData"
    >
      <template #contractStatus>
        <el-select
          v-model="formData.contractStatus"
          filterable
          required
          style="width: 100%"
          placeholder="请选择"
        >
          <el-option
            v-for="item in [
              { label: '启用', value: '2' },
              { label: '未启用', value: '1'}
            ]"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
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
        >
        <template #validityGuarantee="scope">
          {{ scope.data.validityGuarantee|formatDate }} 至 {{ scope.data.validityGuaranteeEnd|formatDate }}
        </template>
          <!-- 合同状态 -->
          <template #contractStatus="scope">
            <!-- 0: "State-Fail", //审核不通过
                1: "State-Waiting", //未提交
                2: "State-Audit", //审核中
                3: "State-Success" //审核通过 -->
            <icon-svg
              :class="iconClassSize({ '1': 0, '2': 3 }[scope.value])"
              :icon-class="
                iconEnableStautsClass({ '1': 0, '2': 3 }[scope.value])
              "
            />{{ scope.value == 2 ? '启用' : '未启用' }}
          </template>

          <template #materialUsedRatio="scope"> {{ scope.value }}% </template>
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
import indexMixin from "@/views/mixins";
import Add from './components/add.vue'
import dayjs from 'dayjs'
export default {
  // 建设项目
  name: "contractList",
  components: { Add },
  mixins: [indexMixin],

  data () {
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
      numberShow: true,
      // 表格数据
      list: [],
      // 弹出层标题
      title: "",

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
      selection: [],
      hasOwn: true,

    };
  },
  async created () {
    let id = this.$route.meta.id;
    this.$store.dispatch("menuProperty", id).then((data) => {
      this.property = data;
    });
  },
  filters: {
    formatDate (value) {
      if (!value) return ''
      return dayjs(value).format('YYYY-MM-DD')
    }
  },
  methods: {
    selectable (row) {
      // 履约比例等于0允许删除
      console.log(row, 'row')
      return row.materialUsedRatio == 0
    },
    buttonDisable (btn) {
      // 履约比例等于0允许删除
      if (btn.buttonCode === 'delete') {
        return this.selection.some(x => x.materialUsedRatio != 0)
      }
      /**
       * 合同状态 1-未启用 2-已启用 
       * 未启用仅修改，不能变更
       * 已启用只能变更
       */
      if (btn.buttonCode === 'update') {
        return this.selection[0].contractStatus == 2
      }
      if (btn.buttonCode === 'contractStatus') {
        return this.selection[0].contractStatus == 2
      }
      // 变更 - 非启用不能变更
      if (btn.buttonCode === 'change') {
        return this.selection[0].contractStatus == 1
      }
      // 已启用允许新增合同
      if (btn.buttonCode === 'add') {
        return this.selection[0].contractStatus != 2
      }
      return false
    },
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
      Api.itemList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
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
    handleButton (buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      switch (buttonCode) {
        case "create":
          this.$router.push({ name: 'addContract', query: { type: 'create' } })
          break;
        case "update":
          this.$router.push({ name: 'addContract', query: { id: idArr[0], type: 'update', projectId: rowArr[0].projectId } })
          break;
        case "delete":
          this.handleDelete(idArr)
          break;
        case 'view':
          this.$router.push({ name: 'detailContract', query: { id: idArr[0], type: 'view' } })
          break;
        case 'change':
          this.$router.push({ name: 'changeContract', query: { id: idArr[0], type: 'update', projectId: rowArr[0].projectId } })
          break;
        case 'contractStatus':
          this.changeStatus(rowArr[0])
          break;
        case 'add':
          this.$router.push({ name: 'addSupplementContract', query: { type: 'create',parentId: idArr[0],projectId: rowArr[0].projectId } })
          break;
      }
    },
    async changeStatus (row) {
      this.$confirm('确定要启用吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(Api.editStatus({ id: row.id, contractStatus: 2 }))
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("启用成功");
        })
    },
    handleDelete (ids) {
      this.$modal.confirm("是否确认删除?").then(function () {
        return Api.batchRemove({ ids });
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      })
    },


    clickReset () {
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