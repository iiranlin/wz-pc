<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :button-disable="handleTopButtonDisabled"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
      @handleQuery="handleQuery" @handleResetField="handleResetField"></form-data>

    <el-row type="flex" class="container_h">
      <collapse>
        <el-col :xs="24" class="container_flex_overflow">
          <div class="flex-row">
            <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
            </el-input>
            <div style="z-index: 999;">
              <i class="plus-icon el-icon-circle-plus"
                @click.stop="append({ classifyId: undefined, classifyName: undefined })"></i>
            </div>
          </div>
          <div class="head-container ov_head">
            <el-tree v-loading="treeLoading" class="drawer-tree" node-key="classifyId" :indent="0" :data="deptOptions"
              :props="defaultProps" :expand-on-click-node="false" ref="tree" :highlight-current="true"
              :filter-node-method="filterNode" @node-click="handleNodeClick">
             
                <span class="custom-tree-node" slot-scope="{ node, data }">
                  <!-- <el-tooltip :content="node.label" placement="top"> -->
                <span class="custom-tree-node-label">{{ node.label }}</span>
              <!-- </el-tooltip> -->
                <span class="hide">
                  <i class="el-icon-plus ml-5" @click.stop="() => append(data)"></i>
                  <i class="el-icon-edit ml-5" @click.stop="() => edit(data)"></i>
                  <i class="el-icon-delete ml-5 red" @click.stop="() => remove(data)"></i>
                </span>
              </span>
            </el-tree>
          </div>
        </el-col>
      </collapse>

      <!--用户数据-->
      <el-col :span="18" :xs="24" class="container_flex">
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []" :showSearch.sync="showSearch"
          :columns="property.fields" @queryTable="handleQuery" @handleCheckAllChange="handleCheckAllChange"
          @clickReset="clickReset" @numberChange="numberChange" @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
          :buttonDisable="handleButtonDisable" :property="property" idName="processId" :numberShow="numberShow"
          @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
          @emitAblFilter="emitAblFilter" @clickLink="clickLink">
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
    <Dialog title="新增工序分类" :visible.sync="matlClassifyVisible" width="30%" :before-close="handleMatlClassifyFormClose"  >
      <el-form :rules="matlClassifyRules" ref="matlClassifyForm" :model="matlClassifyForm" label-width="0px">
        <!-- <el-form-item label="工序编码" prop="matlClassifyCode">
          <el-input v-model.trim="matlClassifyForm.matlClassifyCode"></el-input>
        </el-form-item> -->
        <el-form-item label="" prop="classifyName">
          <el-input v-model.trim="matlClassifyForm.classifyName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleMatlClassifyFormClose">取 消</el-button>
        <el-button type="primary" @click="handleAppendSave">确 定</el-button>
      </span>
    </Dialog>
  </div>
</template>

<script>
import collapse from '@/components/Collapse'
import indexMixin from '@/views/mixins';
import { getList, remove, classTree, classCreate, classRemove, classModify } from '@/api/prodmgr-mm/standardProcess'
export default {
  name: "standardProcess",
  mixins: [indexMixin],
  components: { collapse },
  data() {
    return {
      matlClassifyForm: {
        parentId: '',
        parentName: '',
        classifyId: '',
        classifyName: ''
      },
      matlClassifyRules: {
        classifyId: [
          { required: true, message: '请输入工序编码', trigger: 'blur' },
        ],
        classifyName: [
          { required: true, message: '请输入工序名称', trigger: 'blur' },
        ],
      },
      matlClassifyVisible: false,
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
      numberShow: false,
      // 页面属性
      property: {},
      total: 0,
      // 查询参数
      listQuery: {
        pageNum: 1,
        pageSize:  30,
      },
      // 表单参数
      formData: {
        processClassify: ''
      },
      formDataClick: {},
      // 部门树选项
      treeLoading: false,
      filterText: "",
      deptOptions: [],
      defaultProps: {
        children: "children",
        label: "classifyName",
      },
    };

  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  created() {
    this.menuProperty();
    this.loadClassTree()
   
  },
  methods: {
    clickLink(row, code) {
      if(code === 'processCode') {
        this.$router.push({ name: 'standardProcessCreate', query: { type: 'view', id: row.processId } })
      }
     
    },
    async loadClassTree() {
      const { data } = await classTree()

      this.deptOptions = data
      // this.$nextTick(() => {
      //   const key = this.deptOptions[0]['classifyId']
      //   this.$refs.tree.setCurrentKey(key)
      //   this.formData.processClassify = key
      //   this.getList();
      // })
     
    },
    filterNode(value, data) {
      if (!value) return true;
      return !!this.$py.match(data.classifyName, value) || data.classifyName.indexOf(value) !== -1;
    },
    menuProperty() {
      let id = this.$route.meta.id;
      this.$store.dispatch('menuProperty', id).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30
        this.property = data;
      });
    },
    handleTopButtonDisabled(button) {
      return this.selection.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
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
    clickReset() {
      this.handleQuery();
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
    cleanClick(data) {
      for (const key of data) {
        if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
          this.$refs.formData.resetQueryDateRange(key);
        }
        this.formData[key] = null;
      }
      this.handleQuery();
    },
    handleQuery(row = {}, type) {
      if(type === 'queryForm') {
        const key = this.$refs.tree.getCurrentKey()
        row.processClassify = key
      }
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery)
      this.handleQuery();
    },
    handleSelectionChange(ids, single, multiple) {
      this.ids = ids
      this.single = single
      this.multiple = multiple
    },
    handleResetField() {
    
    },
    // 节点单击事件
    handleNodeClick({ classifyId }) {
      const row = { processClassify: classifyId }
      this.handleQuery(row);
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      const ids = rowArr.map(({ processId }) => processId)
      if (buttonCode == 'update') {
        this.$router.push({ name: 'standardProcessCreate', query: { type: buttonCode, id: ids[0] } })
      } else if (buttonCode === 'delete') {
        this.handleRemove(ids)
      } else if (buttonCode === 'create') {
        this.$router.push({ name: 'standardProcessCreate', query: {pc: this.formData.processClassify, type: buttonCode } })
      }
    },
    handleRemove(ids = []) {
      this.$modal.confirm('是否确定删除?').then(async () => {
        await remove({ ids: ids })
        this.$modal.msgSuccess(`删除成功`)
        this.getList();
      })
    },
    append({ classifyId, classifyName }) {
      this.matlClassifyForm = { ...this.matlClassifyForm, parentId: classifyId, parentName: classifyName }
      this.matlClassifyVisible = true
    },
    handleAppendSave() {
      this.$refs['matlClassifyForm'].validate((valid) => {
        if (valid) {
          classCreate({...this.matlClassifyForm,matlClassifyId: null, bizStatus: '1', sort: '', }).then(() => {
            this.$modal.msgSuccess(`创建成功`)
            this.loadClassTree();
            this.handleMatlClassifyFormClose()
          })
        }
      });


    },
    edit(node) {
      this.$prompt('', '修改工序分类', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: node.classifyName
      }).then(({ value }) => {
        classModify({
          ...node,
          classifyName: value
        }).then(() => {
          this.$modal.msgSuccess(`修改成功`)
          this.loadClassTree();
        }).catch(({ message }) => {
          this.$modal.msgError(message)
        })
      })
    },
    remove(node) {
      this.$modal.confirm('是否确定删除?').then(async () => {
        await classRemove(node.classifyId)
        this.$modal.msgSuccess(`删除成功`)
        this.loadClassTree();
      })

    },
    handleMatlClassifyFormClose() {
      this.matlClassifyVisible = false
      this.$refs['matlClassifyForm'].resetFields();
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      const param = Object.assign({}, this.listQuery, this.formData)
      
      getList({...param}).then(({ data }) => {
        this.list = data.list;
        this.total = data.total;
      }).finally(() => {
        this.loading = false;
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.flex-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .search-input {
    width: 80%
  }

  .plus-icon {
    cursor: pointer;
    margin-right: 5px;
    color: #52A2FF;
    font-size: 24px;
  }
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  width: calc(100% - 28px);
  .custom-tree-node-label {
    width: calc(100% - 60px);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
  }
  .red {
    color: red
  }

  .hide {
    display: none;
  }
}

.ml-5 {
  margin-left: 5px;
}


::v-deep .el-tree-node:hover {
  .custom-tree-node>.hide {
    display: block;
  }
}
</style>
