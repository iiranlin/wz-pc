<template>
  <!-- 添加或修改部门对话框 -->
  <Dialog :title="title" :visible.sync="openDataScope" width="1300px" :close-on-click-modal="false"
     append-to-body >
    <template slot="title">
      <div class="avue-crud__dialog__header">
        <span class="el-dialog__title">
          {{ title }}
        </span>
        <!-- <div class="avue-crud__dialog__menu" @click="dialogFull = !dialogFull">
          <i class="el-icon-full-screen"></i>
        </div> -->
      </div>
    </template>

    <el-form ref="elForm" :model="form" :rules="rules" label-width="115px" :style="{ '--theme': theme }">
      <div class="contTitle">
        <span @click="showForm('menu')">
          <i class="el-icon-caret-right" :style="isMenuShow ? 'transform:rotate(90deg)' : ''" />
          菜单信息配置
        </span>
      </div>
      <menu-info ref="menuForm" v-show="isMenuShow" :form="form"></menu-info>
      <div class="contTitle">
        <span @click="showForm('dataSource')">
          <i class="el-icon-caret-right" :style="isDataSourceShow ? 'transform:rotate(90deg)' : ''" />
          快速配置
        </span>
      </div>
      <template v-if="isDataSourceShow">
        <el-row>
          <el-col :span="8">
            <el-form-item label="数据来源:" prop="dataType">
              <el-select v-model="form.dataType" placeholder="数据来源" clearable @change="changeDataSourceType">
                <el-option v-for="dict in dataTypeData" :key="dict.code" :label="dict.label" :value="dict.code" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="数据表名称:">
              <el-select v-model="currentTableId" placeholder="数据表名称" clearable filterable @change="changeDbTable">
                <template v-for="dict in allListDbTable">
                  <el-option v-if="form.dataType === '0'" :key="dict.tableName"
                    :label="!dict.tableComment ? dict.tableName : `${dict.tableComment}【${dict.tableName}】`"
                    :value="dict.tableName" />
                    <el-option v-if="form.dataType === '6'" :key="dict.tableId"
                    :label="!dict.tableComment ? dict.tableName : `${dict.tableComment}【${dict.tableName}】`"
                    :value="dict.tableId" />
                     <el-option v-if="form.dataType === '7'" :key="dict.tableId"
                    :label="!dict.formName ? dict.formCode : `${dict.formName}【${dict.formCode}】`"
                    :value="dict.id" />
                </template>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </template>
      <div class="tableWrap">
        <el-tabs v-model="activeTab" :addable="activeTab !== '0'" @tab-add="handleClickAdd">
          <el-tab-pane label="数据属性">
            <dataProperty ref="dataProperty" :dataList="columnByTableNameList" @handleAddField="handleAddField"
              :dialogFull="dialogFull" :isMenuShow="isMenuShow" :isDataSourceShow="isDataSourceShow"
              v-if="this.form.dataType !== '6'" />
            <field-info ref="fieldInfo" :dataList="columnByTableNameList" @handleAddField="handleAddField"
              :dialogFull="dialogFull" :isMenuShow="isMenuShow" :isDataSourceShow="isDataSourceShow" v-else />
          </el-tab-pane>
          <el-tab-pane label="页面属性">
            <fieldProperty ref="fieldProperty" :tableData="form.fields" :dialogFull="dialogFull"
              :isMenuShow="isMenuShow" :isDataSourceShow="isDataSourceShow" :loading="loading"
              v-show="activeTab === '1'" />
          </el-tab-pane>
          <el-tab-pane label="按钮属性">
            <buttonProperty ref="buttonProperty" :buttonData="form.buttons" :dialogFull="dialogFull"
              :isMenuShow="isMenuShow" :isDataSourceShow="isDataSourceShow" />
          </el-tab-pane>
        </el-tabs>
        <div class="add" v-if="activeTab === '0'">
          <el-button type="primary" size="mini" @click="selectAdd">批量添加
          </el-button>
        </div>
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="type === 'create' || type === 'copy' ? submitDataScope() : menuModify()">确 定
      </el-button>
      <el-button @click="openDataScope = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import { menuCreate, menuDetail, menuModify } from '@/api/system/menu'
import { allListDbTable, columnByTableName } from '@/api/system/datatable'
import dataProperty from './dataProperty.vue'
import fieldInfo from './fieldInfo'
import {list as formList, getFormField} from '@/api/form/form'
import menuInfo from './menuInfo.vue'

const fieldProperty = resolve => (require(['./fieldProperty'], resolve))
const buttonProperty = resolve => (require(['./buttonProperty'], resolve))

export default {
  components: { fieldProperty, buttonProperty, dataProperty, fieldInfo, menuInfo },
  data() {
    return {
      loading: false,
      title: '新增菜单',
      type: 'add',
      dialogFull: false,
      id: '',
      openDataScope: false,
      isMenuShow: true,
      isDataSourceShow: true,
      allListDbTable: [],
      currentTableId: '',
      datasource: '',
      columnByTableNameList: [],
      selectionList: [],
      list: [],
      form: {
        'id': '',
        'parentId': undefined,
        'menuCode': '',
        'menuIcon': 'Menu-Setting',
        'menuName': '',
        'menuType': '1',
        'menuUrl': '',
        'bindTable': 'string',
        'buttons': [],
        'dataPath': 'string',
        'fields': [],
        'isHide': 0,
        'component': '',
        'seq': 0,
        'status': 0,
        'isAcl': 0,
        'datasource': '',
        'isCache': 0,
        'serviceCode': '',
      },
      // 表单校验
      rules: {
        menuName: [
          { required: true, message: '菜单名称不能为空', trigger: 'blur' }
        ],
        menuUrl: [
          { required: true, message: '菜单地址不能为空', trigger: 'blur' }
        ]
      },
      dataTypeData: [
        { code: '0', label: '数据表' },
        // { code: "1", label: "视图" },
        // { code: "2", label: "物化视图" },
        // { code: "3", label: "函数" },
        // { code: "4", label: "JSON" },
        // { code: "5", label: "API" },
        // { code: '6', label: '代码生成' },
        { code: '7', label: '表单设计' }
      ],
      datasourceList: [{ id: 'null', sourceName: '默认数据源' }],
      sheetNameData: [],
      editableTabs: [
        {
          title: '数据属性',
          name: '1',
          content: 'Tab 1 content'
        },
        {
          title: '页面属性',
          name: '2',
          content: 'Tab 2 content'
        }, {
          title: '按钮属性',
          name: '3',
          content: 'Tab 2 content'
        }
      ],
      activeTab: '1',

    }
  },
  computed: {
    theme() {
      return this.$store.state.settings.theme
    }
  },
  watch: {
    'openDataScope': {
      handler: function (newOpenDataScope) {
        if (!newOpenDataScope) {
          Object.assign(this.$data, this.$options.data.call(this))
        }
      }
    }
  },
  methods: {
    dialogHeight() {
      let windowHeight = document.body.clientHeight && document.documentElement.clientHeight
      return windowHeight - 50
    },
    // 选择图标
    selected(name,font_class) {
      this.form.menuIcon = name
      this.form.menuIconClass = font_class;
    },
    /** 提交按钮（数据权限） */
    init(type, id) {
      this.type = type
      this.id = id
      this.openDataScope = true
      this.$nextTick(() => {
        this.$refs.elForm.resetFields()
        if (type === 'update' || type === 'copy') {
          this.title = type === 'update'?'修改菜单':'复制菜单'
          this.menuDetail(id)
          this.$refs.fieldProperty.commonTree()
        }else{
            this.$refs['menuForm'].getMaxSeqByParentId()
        }
      })
    },
    menuDetail(id) {
      this.loading = true
      menuDetail(id).then(({ data }) => {
        let { buttons } = data
        for (let i = 0; i < buttons.length; i++) {
          const element = buttons[i]
          if (element.buttonCode == 'create' || element.buttonCode == 'update' || element.buttonCode == 'delete') {
            element.usuallyButton = element.buttonCode
          }
          if (element.buttonCode == 'print') {
            element.printTemplateId = element.printTemplateId ? element.printTemplateId.split(',') : []
          }
        }
        this.form = data
        this.form.fields.forEach(item=>{
          if(item.fieldType && item.fieldType.indexOf('date')>-1){
            item.fieldType = 'date'
          }
        })
        this.form.parentId = data.parentId || undefined
      }).finally(() => {
            this.loading = false
        })
    },
    submitDataScope() {
        this.form.fields = this.$refs.fieldProperty.tableData
        const buttons = this.$refs.buttonProperty.buttonData
        for(let i=0; i< buttons.length; i++) {
          if(buttons[i]['buttonCode'] == 'print') {
            buttons[i]['printTemplateId'] = buttons[i]['printTemplateId'].join(',')
          } else {
            buttons[i]['printTemplateId'] = ''
          }
        }
        this.form.buttons = buttons
        this.$refs['menuForm'].$refs['menuForm'].validate((valid) => {
            if (valid) {
                this.loading = true
                if(this.type === 'copy'){
                  delete this.form.id
                }
                menuCreate(this.form).then(({ success, message }) => {
                    if (success) {
                        this.$modal.msgSuccess(message)
                        this.openDataScope = false
                        this.$emit('menuSuccess')
                    } else {
                        this.$modal.msgError(message)
                    }
                }).finally(() => {
                    this.loading = false
                })
            }
        })
    },
    menuModify() {
      const buttons = this.$refs.buttonProperty.buttonData
        for(let i=0; i< buttons.length; i++) {
          if(buttons[i]['buttonCode'] == 'print') {
            buttons[i]['printTemplateId'] = buttons[i]['printTemplateId'].join(',')
          } else {
            buttons[i]['printTemplateId'] = ''
          }
        }
        this.form.buttons = buttons
        this.$refs['menuForm'].$refs['menuForm'].validate((valid) => {
            if (valid) {
                this.loading = true
                menuModify(this.form).then(({ success, message }) => {
                    if (success) {
                        this.$modal.msgSuccess(message)
                        this.openDataScope = false
                        this.$emit('menuSuccess')
                    } else {
                        this.$modal.msgError(message)
                    }
                }).finally(() => {
                    this.loading = false
                })
            }
        })
    },
    handleClickAdd(e) {
      let _this = this
      switch (_this.activeTab) {
        case '1':
          _this.$refs.fieldProperty.addPageProperty()
          break
        case '2':
          _this.$refs.buttonProperty.addButtonProperty()
          break
      }
    },
    selectAdd() {
      let selectionList = this.$refs.dataProperty.selectionList
      if (selectionList.length > 0) {
        this.$refs.fieldProperty.addPageProperty(selectionList)
      }
    },
    showForm(res) {
      switch (res) {
        case 'menu':
          this.isMenuShow = !this.isMenuShow
          break
        case 'dataSource':
          this.isDataSourceShow = !this.isDataSourceShow
          break
      }
    },
    // 数据属性行操作添加
    handleAddField(item) {
      this.$refs.fieldProperty.addPageProperty(item)
    },
    getDatasourceList() {
      this.datasourceList = [{ id: 'null', sourceName: '默认数据源' }]
      this.getAllListDbTable()
    },
    getFormList(){
      formList().then(({data}) =>{
        this.allListDbTable = data.list
      })
    },
    getAllListDbTable() {
      if (this.form.dataType === '0') {
        allListDbTable({ id: '' }).then(({ data }) => {
          this.allListDbTable = data
        })
      }
    },
    changeDataSourceType(val) {
      this.datasourceList = []
      this.allListDbTable = []
      this.columnByTableNameList = []
      this.datasource = ''
      this.currentTableId = ''
      switch (val) {
        case '0':
          this.getDatasourceList()
          break
        case '6':
          this.getDatasourceList()
          break
        case '7':
          this.getFormList();
          break
      }
    },
    /**数据表变更事件:根据表名称查询数据属性*/
    changeDbTable(tableInfo) {
      if (tableInfo !== '') {
        if (this.form.dataType === '0') {
          // tableInfo为表名称
          columnByTableName(tableInfo).then(({ data }) => {
            this.columnByTableNameList = data
          })
        } else if (this.form.dataType === '7') {
          getFormField(tableInfo).then(res => {
            let formFieldList = []
            if (res.data.length > 0) {
              res.data.forEach(item => {
                formFieldList.push({
                  columnName: item.name,
                  columnComment: item.label
                })
              })
            }
            this.columnByTableNameList = formFieldList
          })
        }
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.dialog {
  ::v-deep.el-dialog {
    height: 730px;
  }
}

.contTitle {
  font-weight: bold;
  font-size: 16px;
  color: #333;
  margin-bottom: 20px;
}

.el-icon-caret-right {
  color: #{'var(--theme)'};
}

::v-deep .container_table .el-input__inner {
  background: none;
  border: none;
}

.container_table2 {
  ::v-deep.cell {
    overflow: unset;
  }
}

.container_table2,
.container_table3 {
  ::v-deep tbody .el-table__cell {
    padding-top: 1px;
    padding-bottom: 1px;
  }
}

::v-deep .el-dialog__body {
  padding: 10px 20px;
}

::v-deep .el-tabs__new-tab {
  background: #{'var(--theme)'};
  border-color: #{'var(--theme)'};
  color: #ffffff;
}

.tableWrap {
  position: relative;
}

.add {
  position: absolute;
  right: 0;
  top: 5px;
}

::v-deep .el-tabs__nav-wrap {
  position: unset;
}

::v-deep .avue-crud__dialog__header {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
}

::v-deep .avue-crud__dialog__menu {
  padding-right: 25px;
  float: left;
}

::v-deep .avue-crud__dialog__menu i {
  color: #909399;
  font-size: 15px;
}
.svg-icon-font {
    vertical-align: -0.25em;
}
::v-deep .el-input__prefix .svg-icon {
  font-size: 24px;
  vertical-align: -0.3em;
}

.el-table {
    margin: 0;
}
</style>
