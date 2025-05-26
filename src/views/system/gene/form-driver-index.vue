<template>
    <div class="app-container container_flex">
      <el-row class="container_flex_button">
        <el-col :span="1.5">
          <el-button class="custom_button" type="primary" plain size="mini"
                     @click="add">
            <icon-svg icon-class="Blue-Edit" class="icon-svg-blue"/>
            新增
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="custom_button" type="primary" plain size="mini"
                     @click="handleGenTable">
            <icon-svg icon-class="Line-Download" class="icon-svg-blue"/>
            下载代码
          </el-button>
        </el-col>
      </el-row>
      <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery"/>
      <right-toolbar :formData="queryParams" :searchArr="property.search || []" :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
  
      <el-table class="container_table" height="100%" v-loading="loading" :data="tableList"
                @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" align="center" width="55"></el-table-column>
        <el-table-column label="序号" type="index" width="50" align="center">
          <template v-slot="scope">
            <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="表名称" align="left" prop="tableName" :show-overflow-tooltip="true" width="120"/>
        <el-table-column label="表描述" align="left" prop="tableComment" :show-overflow-tooltip="true" width="120"/>
        <el-table-column label="实体" align="left" prop="className" :show-overflow-tooltip="true" width="120"/>
        <el-table-column label="创建时间" align="center" prop="createTime" width="160"/>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="160"/>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template v-slot="scope">
            <el-button type="text" size="small" icon="el-icon-view" @click="handlePreview(scope.row)">预览
            </el-button>
            <el-button type="text" size="small" icon="el-icon-edit" @click="handleEditTable(scope.row)">编辑
            </el-button>
            <el-button type="text" size="small" icon="el-icon-delete" @click="handleRemove(scope.row)">删除
            </el-button>
            <el-button type="text" size="small" icon="el-icon-download" @click="handleGenTable(scope.row)">下载代码
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList"/>
      <!-- 预览界面 -->
      <Dialog :title="preview.title" :visible.sync="preview.open" width="80%" top="5vh" :close-on-click-modal="false" append-to-body class="code-preview-dialog" >
        <code-previewer :geneCode="preview.geneCode" :code="preview.code"/>
      </Dialog>
    </div>
  </template>
  
  <script>
  import { listTable, previewCode, remove } from '@/api/tool/gen'
  import codePreviewer from './components/code-previewer'
  
  export default {
    name: 'form-driver',
    components: { codePreviewer },
    data() {
      return {
        // 遮罩层
        loading: true,
        // 唯一标识符
        uniqueId: '',
        // 选中数组
        ids: [],
        // 选中表数组
        tableNames: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 显示搜索条件
        showSearch: true,
        // 总条数
        total: 0,
        // 表数据
        tableList: [],
        // 日期范围
        dateRange: '',
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          tableName: undefined,
          tableComment: undefined,
          type: '1'
        },
        //列表显示字段
        property: {},
        // 预览参数
        preview: {
          open: false,
          title: '代码预览',
          geneCode: {},
          code: ''
        }
      }
    },
    created() {
      let id = this.$route.meta.id
      this.$store.dispatch('menuProperty', id).then((data) => {
        this.queryParams.pageSize = data.defaultPageSize || 30
        this.property = data
      })
      this.getList()
    },
    activated() {
      const time = this.$route.query.t
      if (time != null && time != this.uniqueId) {
        this.uniqueId = time
        this.queryParams.pageNum = Number(this.$route.query.pageNum)
        this.getList()
      }
    },
    methods: {
      /** 查询表集合 */
      getList() {
        this.loading = true
        listTable(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
            this.tableList = response.data.list
            this.total = response.data.total
            this.loading = false
          }
        )
      },
      /** 搜索按钮操作 */
      handleQuery(row = {}) {
        this.queryParams = Object.assign({}, this.queryParams, row)
        this.queryParams.pageNum = 1
        this.getList()
      },
      /** 生成代码操作 */
      handleGenTable(row) {
        const tableNames = row.tableName || this.tableNames
        if (tableNames == '') {
          this.$modal.msgError('请选择要生成的数据')
          return
        }
        this.$download.zip(process.env.VUE_APP_BASE_SERVER + '/code/generate/generateCode?tables=' + tableNames, tableNames + '生成代码')
        this.$modal.msgSuccess('下载成功')
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.dateRange = []
        this.resetForm('queryForm')
        this.handleQuery()
      },
      /** 预览按钮 */
      handlePreview(row) {
        let obj = {
          genTableId: row.tableId
        }
        previewCode(obj).then(res => {
          this.preview.code = ''
          this.preview.geneCode = res.data
          this.preview.open = true
        })
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.tableId)
        this.tableNames = selection.map(item => item.tableName)
        this.single = selection.length != 1
        this.multiple = !selection.length
      },
      /** 修改按钮操作 */
      handleEditTable(row) {
        const tableId = row.tableId || this.ids[0]
        this.$router.push({ path: '/form-driver-edit', query: { tableId: tableId, pageNum: this.queryParams.pageNum } })
      },
      //新增
      add() {
        this.$router.push({ path: '/form-driver-edit'})
      },
      //删除
      handleRemove(row) {
        this.$modal.confirm('确定删除?', "删除", {
          distinguishCancelAndClose: true,
          confirmButtonText: '是',
          cancelButtonText: '否'
        }).then(() => {
          remove(row.tableId).then(res => {
            this.$modal.msgSuccess('删除成功')
            this.resetQuery()
          })
        })
      }
    }
  }
  </script>
  <style scoped lang="scss">
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
    border: 1px solid #fff;
    box-sizing: border-box;
    line-height: 22px;
    color: #1b1e22;
  }
  
  .custom_button:hover {
    color: #3d8aff;
    border: 1px solid rgba(61, 138, 255, 1);
  }
  
  .custom_button .svg-icon-font {
    float: left;
    margin-right: 3px;
    transform: translateY(-2px);
  }
  
  ::v-deep.el-button.is-disabled,
  ::v-deep.el-button.is-disabled:hover {
    border: 1px solid #fff;
  }
  
  .icon-svg-blue {
    color: #3d8aff;
  }
  
  .code-preview-dialog {
    ::v-deep .el-dialog {
      height: 90%;
      display: flex;
      flex-direction: column;
  
      .el-dialog__header {
        flex-shrink: 0;
      }
  
      .el-dialog__body {
        flex: 1;
        overflow: hidden;
  
        .code-preview-container {
          height: 100%;
        }
      }
    }
  }
  </style>
  