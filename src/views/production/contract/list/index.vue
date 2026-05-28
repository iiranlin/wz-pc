<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="contractStatusButtonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :buttonDisable="buttonDisable"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery"
      :formData="formData" @handleResetField="onResetField">
      <template #contractStatus>
        <el-select v-model="formData.contractStatus" filterable required style="width: 100%" placeholder="请选择">
          <el-option v-for="item in [
            { label: '已启用', value: '2' },
            { label: '未启用', value: '1' },
            { label: '已结算', value:'4'},
            { label: '已完成',value:'3' }
          ]" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </template>
      <!-- 保函有效期 -->
      <template #expireStatus>
        <el-select v-model="formData.expireStatus" filterable required style="width: 100%" placeholder="请选择">
          <el-option v-for="item in [
            { label: '执行中', value: '执行中' },
            { label: '已过期', value: '已过期' }
          ]" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </template>
      <template #projectName="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择建设项目'
          " clearable style="width: 100%" size="small">
          <el-option v-for="(item, key) in lineOptions" :key="key" :label="item.label" :value="item.label" />
        </el-select>
      </template>
    </form-data>
    <el-row type="flex" class="container_h">
      <!--用户数据-->
      <el-col :span="20" :xs="24" class="container_flex">
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
          :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
          @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
          @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
          :property="property" :numberShow="numberShow" @handleSelectionChange="handleSelectionChange"
          @selectChange="selectChange" @emitAblFilter="emitAblFilter" @handleButton="handleButton"
          :rowClassName="tableRowClassName">
          <!-- 补充合同比例 -->
          <template #supplementalRatio="scope">
            {{ scope.value }}%
          </template>
          <template #validityGuarantee="scope">
            {{ scope.data.validityGuarantee | formatDate }} 至 {{ scope.data.validityGuaranteeEnd | formatDate }}
          </template>
          <!-- 合同状态 -->
          <template #contractStatus="scope">
            <!-- 0: "State-Fail", //审核不通过
                1: "State-Waiting", //未提交
                2: "State-Audit", //审核中
                3: "State-Success" //审核通过 -->
            <icon-svg :class="iconClassSize({ '1': 0, '2': 3 ,'3':3,'4':3}[scope.value])" :icon-class="iconEnableStautsClass({ '1': 0, '2': 3,'3':3,'4':3 }[scope.value])
              " />{{ scope.value == 2 ? '已启用' : scope.value == 3 ? '已完成' : scope.value == 4 ? '已结算' : '未启用' }}
          </template>

          <template #materialUsedRatio="scope"> {{ scope.value }}% </template>

        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
  </div>
</template>

<script>

import * as Api from '@/api/prodmgr-inv/project/contract.js'
import * as LineApi from '@/api/prodmgr-inv/project/line.js'
import indexMixin from "@/views/mixins";
import Add from './components/add.vue'
import dayjs from 'dayjs'
import * as FileApi from "@/api/prodmgr-inv/project/file.js";
export default {
  // 建设项目
  name: "contractList",
  components: { Add },
  mixins: [indexMixin],
  computed: {
    deptName() {
      return this.$route.query?.deptName || ''
    },
    deptId() {
      return this.$route.query?.deptId || ''
    },
    startDate() {
      return this.$route.query?.startDate || ''
    },
    endDate() {
      return this.$route.query?.endDate || ''
    },
    projectId() {
      return this.$route.query?.projectId || ''
    },
    projectName() {
      return this.$route.query?.projectName || ''
    },
    fromUrl() {
      return this.$route.query?.fromUrl || ''
    },
    contractStatusButtonTop() {
      return (this.property.buttonTop || []).map(item => {
        if (item.buttonCode !== 'contractStatus') {
          return item
        }
        const currentRow = this.selection[0]
        if (currentRow?.closed == '1') {
          return {
            ...item,
            buttonName: '闭合'
          }
        }
        const action = this.getContractStatusAction(currentRow)
        return {
          ...item,
          buttonName: action === 'deactivate' ? '终止' : '启用'
        }
      })
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
      numberShow: true,
      // 表格数据
      list: [],
      // 弹出层标题
      title: "",
      lineOptions: [],
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
  activated() {
    this.getList();
  },
  async created() {
    let id = this.$route.meta.id;
    this.$store.dispatch("menuProperty", id).then((data) => {
      this.property = data;
    });
    this.getLineOptions()
    this.setQuery();

  },
  filters: {
    formatDate(value) {
      if (!value) return ''
      return dayjs(value).format('YYYY-MM-DD')
    }
  },
  methods: {
    isEnabledContract(row) {
      return String(row?.contractStatus) === '2'
    },
    canDeactivateContract(row) {
      return this.isEnabledContract(row) && row?.materialUsedRatio == 0
    },
    getContractStatusAction(row) {
      return this.isEnabledContract(row) ? 'deactivate' : 'enable'
    },
    // 将Url参数赋值到搜索内（使用 $set 保证响应式）
    setQuery() {
      if (this.deptId) {
        this.$set(this.formData, 'constructionUnitId', this.deptId)
      }
      if (this.deptName) {
        this.$set(this.formData, 'buyer', this.deptName)
        this.$set(this.formData, 'constructionUnitName', this.deptName)
      }
      if (this.startDate) {
        this.$set(this.formData, 'startDate', this.startDate)
      }
      if (this.endDate) {
        this.$set(this.formData, 'endDate', this.endDate)
      }
      if (this.projectId) {
        this.$set(this.formData, 'projectId', this.projectId)
      }
      if (this.projectName) {
        this.$set(this.formData, 'projectName', this.projectName)
      }
      if (this.fromUrl) {
        this.$set(this.formData, 'contractStatus', '2')
        this.$set(this.formData, 'bigScreenFlag', this.fromUrl === 'largeScreen' ? '1' : '0')
      }
    },
    /** 清空 URL 参数设置的搜索字段 */
    clearUrlQueryFields() {
      this.$set(this.formData, 'constructionUnitId', null);
      this.$set(this.formData, 'constructionUnitName', null);
      this.$set(this.formData, 'startDate', null);
      this.$set(this.formData, 'endDate', null);
      this.$set(this.formData, 'projectId', null);
      this.$set(this.formData, 'projectName', null);
      this.$set(this.formData, 'constructionUnit', null);
      this.$set(this.formData, 'buyer', null);
      this.$set(this.formData, 'contractStatus', null);
      this.$set(this.formData, 'bigScreenFlag', null);
    },
    /** 搜索栏“重置”按钮触发的事件 */
    onResetField() {
      this.clearUrlQueryFields();
    },
    getLineOptions() {
      LineApi.lineSelectOptions().then(({ data }) => {
        this.lineOptions = data.map(x => ({
          label: x.projectName,
          value: x.projectName
        }))
      })
    },
    tableRowClassName({ row, rowIndex }) {
      console.log(row, 'row')
      // 条件判断，返回类名
      if (row.supplementalRatio > 10) {
        return 'row-warn';
      }
      return '';
    },
    selectable(row) {
      // 履约比例等于0允许删除
      console.log(row, 'row')
      return row.materialUsedRatio == 0
    },
    buttonDisable(btn) {
      const currentRow = this.selection[0]
      // 履约比例等于0允许删除
      if (btn.buttonCode === 'delete') {
        return this.selection.some(x => x.contractStatus != 1)
      }
      /**
       * 合同状态 1-未启用 2-已启用 
       * 未启用仅修改，不能变更
       * 已启用只能变更
       */
      if (btn.buttonCode === 'update') {
        return currentRow?.contractStatus == 2 || currentRow?.contractStatus == '3' || currentRow?.contractStatus == '4'
      }
      if (btn.buttonCode === 'contractStatus') {
        if (currentRow?.contractStatus === '3' || currentRow?.contractStatus === '4') return true
        if (currentRow?.closed == '1') return false
        return this.isEnabledContract(currentRow) && !this.canDeactivateContract(currentRow)
      }
      // 变更 - 非启用不能变更
      if (btn.buttonCode === 'change') {
        return currentRow?.contractStatus == 1 || currentRow?.contractStatus == '4'
      }
      // 已启用允许新增合同
      if (btn.buttonCode === 'add') {
        return currentRow?.contractStatus != 2 || currentRow?.closed !== '0'
      }
      // 已启用允许新增保函
      if (btn.buttonCode === 'addBh') {
        return currentRow?.contractStatus == 1 || currentRow?.contractStatus == '3' || currentRow?.contractStatus == '4'
      }
      return false
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


    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery);
      this.handleQuery();
    },
    handleQuery(row = {}, type = '') {

      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true
      Api.itemList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
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
          if (rowArr[0]?.closed == '1') {
            this.handleClosed(rowArr[0])
          } else {
            this.changeStatus(rowArr[0])
          }
          break;
        case 'add':
          this.$router.push({ name: 'addSupplementContract', query: { type: 'create', parentId: idArr[0], projectId: rowArr[0].projectId } })
          break;
        // 新增保函
        case 'addBh':
          this.$router.push({ name: 'addValidityGuarantee', query: { type: 'create', contractId: idArr[0] } })
          break;
        case 'export':
          this.handleDonwload()
          break;
      }
    },
    async handleDonwload() {
      try {
        this.loading = true;
        const isAllSelected = this.selection.length > 0 && this.selection.length === this.list.length;
        const isNoneSelected = this.selection.length === 0;
        const idList = (isAllSelected || isNoneSelected) ? null : this.ids;
        await FileApi.customDownload({businessType:122,businessData : JSON.stringify({...this.formData,idList}) });
      } catch (error) {
        this.$modal.msgError("下载失败，请重试");
      } finally {
        this.loading = false;
      }
    },
    async changeStatus(row) {
      const action = this.getContractStatusAction(row)
      const actionText = action === 'deactivate' ? '终止' : '启用'
      const request = () => (action === 'deactivate'
        ? Api.deactivated(row.id)
        : Api.editStatus({ id: row.id, contractStatus: 2 }))
      this.$confirm(`确定要${actionText}吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => request())
        .then(() => {
          this.getList();
          this.$modal.msgSuccess(`${actionText}成功`);
        })
    },
    handleClosed(row) {
      this.$confirm('确定要闭合吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return Api.closedContract({ id: row.id })
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess('闭合成功');
      })
    },
    handleDelete(ids) {
      this.$modal.confirm("是否确认删除?").then(function () {
        return Api.batchRemove({ ids });
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      })
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
<style>
.row-warn {
  color: #ea0d0d !important;
}
</style>
