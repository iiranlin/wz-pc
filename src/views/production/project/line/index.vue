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
      @handleResetField="onResetField"
      :formData="formData"
    />
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
          <!-- 标段数量 -->
          <template #sectionList="scoped">
            <el-button
              type="text"
              @click="
                () => {
                  if (scoped.data.sectionList.length)
                    $refs.sectionDialogRef.open(
                      scoped.data.sectionList.map((x) => ({
                        name: x.sectionName,
                      }))
                    );
                }
              "
            >
              {{ scoped.data.sectionList.length }}
            </el-button>
          </template>
          <!-- 合同数量 -->
          <template #contractList="scoped">
            <el-button
              type="text"
              @click="
                () => {
                  if (scoped.data.contractList.length)
                    $refs.constrctDialogRef.open(
                      scoped.data.contractList.map((x) => ({
                        name: x.contractName,
                      }))
                    );
                }
              "
            >
              {{ scoped.data.contractList.length }}
            </el-button>
          </template>
          <template #materialUsedRatio="scoped">
            {{scoped.data.materialUsedRatio || 0}}%
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
    <SectionDialog ref="sectionDialogRef" />
    <ConstrctDialog ref="constrctDialogRef" />
  </div>
</template>

<script>
import { list, deptTree, deptDeleteBatch } from "@/api/system/dept";
import * as Api from '@/api/prodmgr-inv/project/line.js'
import indexMixin from "@/views/mixins";
import Add from './components/add.vue'
import SectionDialog from './components/sectionDialog.vue'
import ConstrctDialog from './components/constrctDialog.vue'
export default {
  // 建设项目
  name: "line",
  components: { Add, SectionDialog, ConstrctDialog },
  mixins: [indexMixin],
  computed:{
    deptName(){
      return this.$route.query?.deptName || ''
    },
    deptId(){
      return this.$route.query?.deptId || ''
    },
    startDate(){
      return this.$route.query?.startDate || ''
    },
    endDate(){
      return this.$route.query?.endDate || ''
    },
    projectId(){
      return this.$route.query?.projectId || ''
    },
    projectName(){
      return this.$route.query?.projectName || ''
    },
    fromUrl(){
      return this.$route.query?.fromUrl  || ''
    }

  },
  activated() {
    this.getList();
  },
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
  created () {
    let id = this.$route.meta.id;
    this.$store.dispatch("menuProperty", id).then((data) => {
      this.property = data;
    });
    this.setQuery();
  },
  watch: {
    filterText (val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
      // 将Url参数赋值到搜索内（使用 $set 保证响应式）
     setQuery(){
      if(this.deptId){
        this.$set(this.formData, 'constructionUnitId', this.deptId)
      }
      if(this.deptName){
        this.$set(this.formData, 'constructionUnit', this.deptName)
        this.$set(this.formData, 'constructionUnitName', this.deptName)
      }
      if(this.startDate){
        this.$set(this.formData, 'startDate', this.startDate)
      }
      if(this.endDate){
        this.$set(this.formData, 'endDate', this.endDate)
      }
      if(this.projectId){
        this.$set(this.formData, 'projectId', this.projectId)
      }
      if(this.projectName){
        this.$set(this.formData, 'projectName', this.projectName)
      }
      if(this.fromUrl){ // 如果fromUrl=largeScreen 则表示是大屏-传1给后端，否则传0
        this.$set(this.formData, 'bigScreenFlag', this.fromUrl === 'largeScreen'?'1':'0')
      }
     },
     buttonDisable (btn) {
      // 没有合同物资才允许删除
      if (btn.buttonCode === 'delete') {
        return this.selection.some(x => x.sectionList.length != 0)
      }
      return false
    },
    filterNode (value, data) {
      if (!value) return true;
      return !!this.$py.match(data.deptName, value) || data.deptCode.indexOf(value) !== -1;
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
    deptTree () {
      this.treeLoading = true;
      this.formData.parentId = null;
      deptTree().then(({ data }) => {
        this.deptOptions = data;
        this.treeLoading = false;
      });
    },
    // 节点单击事件
    handleNodeClick (data) {
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
          this.$router.push({ name: 'addLine', query: { type: 'create' } })
          break;
        case "update":
          this.$router.push({ name: 'addLine', query: { id: idArr[0], type: 'update' } })
          break;
        case "delete":
          this.handleDelete(idArr)
          break;
        case 'view':
          this.$router.push({ name: 'detailLine', query: { id: idArr[0], type: 'view' } })
          break;
        case 'createSection':
          console.log(rowArr, 'rowArr')
          this.$router.push({ name: 'addSection', query: { type: 'create', projectId: rowArr[0].id } })
          break;
        case 'createContract':
          this.$router.push({ name: 'addContract', query: { type: 'create', projectId: rowArr[0].id } })
          break;
      }
    },
    handleDelete (ids) {
      this.$modal.confirm("是否确认删除?").then(function () {
        return Api.batchRemove({ ids });
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      })
    },
    deptSuccess () {
      this.handleQuery();
      this.deptTree();
    },
    /** 清空 URL 参数设置的搜索字段 */
    clearUrlQueryFields () {
      this.$set(this.formData, 'constructionUnitId', null);
      this.$set(this.formData, 'constructionUnitName', null);
      this.$set(this.formData, 'startDate', null);
      this.$set(this.formData, 'endDate', null);
      this.$set(this.formData, 'projectId', null);
      this.$set(this.formData, 'projectName', null);
      this.$set(this.formData, 'constructionUnit', null);
      this.$set(this.formData, 'bigScreenFlag', null);
    },
    /** right-toolbar 触发的重置 */
    clickReset () {
      this.handleQuery();
    },
    /** 搜索栏“重置”按钮触发的事件 */
    onResetField () {
      this.clearUrlQueryFields();
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