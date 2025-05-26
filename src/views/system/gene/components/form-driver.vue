<template>
  <el-container>
    <el-header class="header-box" style="display: flex; height: auto;">
      <div style="display: flex; flex-basis: 90%;">
        <el-steps style="width: 100%;" :active="active" align-center >
          <el-step title="表单配置" @click.native="jump(0)"></el-step>
          <el-step title="数据库配置" @click.native="jump(1)"></el-step>
          <el-step title="基础配置" @click.native="jump(2)"></el-step>
          <el-step title="列表配置" @click.native="jump(3)"></el-step>
          <el-step title="按钮配置" @click.native="jump(4)"></el-step>
          <el-step title="菜单配置" @click.native="jump(5)"></el-step>
          <el-step title="代码配置" @click.native="jump(6)"></el-step>
          <el-step title="代码预览" @click.native="jump(7)"></el-step>
        </el-steps>
      </div>
      <div style="display: flex; flex-basis: 10%; float: right;">
        <el-button v-if="active != 0" type="primary" size="small" style="height: 40px;" @click="preStep">上一步</el-button>
        <el-button v-if="active != 7" type="primary" size="small" style="height: 40px;" @click="nextStep">下一步</el-button>
        <el-button v-if="active == 7" type="primary" size="small" style="height: 40px;" @click="handlerSave">保存</el-button>
      </div>
    </el-header>
    <el-main>
      <div class="btn-row" v-if="active === 3 || active === 4">
        <el-button type="primary" style="float: right;" @click="addRow">新增</el-button>
      </div>
      <div class="component-wrapper">
        <design-copy v-if="active === 0" @hook:mounted="initOnlForm" @hook:beforeDestroy="destroyOnlForm" ref="designCopy"/>
        <database-info v-else-if="active === 1" :databaseData="databaseData" ref="databaseInfoRef"/>
        <base-info v-else-if="active === 2" :baseInfo="baseInfo" :onlFormInfo="onlFormInfo" ref="baseInfoRef"/>
        <field-property v-else-if="active === 3" class="field-property" ref="fieldRef" :tableData="fieldList"/>
        <buttonProperty v-if="active === 4" @hook:mounted="initButtonList" ref="buttonRef" :buttonData="buttonList" :isShowFormId="false"/>
        <menuProperty v-else-if="active === 5" ref="menuRef" :form="menuInfo"/>
        <table-column v-else-if="active === 6" :columnList="columnList"/>
        <code-previewer v-else-if="active === 7" @hook:mounted="initPreviewer" ref="codePreviewerRef" :geneCode="geneCode"/>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { getFormTableColumn, getBaseInfoAndTable, previewCode, saveFormDriver, detail } from '@/api/tool/gen'
import designCopy from '@/views/form/components/designCopy'
import databaseInfo from '@/views/system/gene/components/database-info'
import baseInfo from '@/views/system/gene/components/base-info'
import fieldProperty from '@/views/system/sys-menu/components/fieldProperty'
import buttonProperty from '@/views/system/sys-menu/components/buttonProperty'
import menuProperty from '@/views/system/sys-menu/components/menuInfo'
import tableColumn from '@/views/system/gene/components/table-column'
import codePreviewer from '@/views/system/gene/components/code-previewer'
import { deepClone } from "@/utils/util"

export default {
  name: 'formDriver',
  components: { designCopy, databaseInfo, baseInfo, fieldProperty, buttonProperty, menuProperty, tableColumn, codePreviewer },
  data() {
    return {
      //激活的步骤
      active: -1,
      //动态表单信息
      onlFormInfo: {},
      //数据库表信息
      databaseData: [],
      //基础信息
      baseInfo: {},
      //生成代码列
      columnList: [],
      //列表配置列表
      fieldList: [],
      //按钮列表
      buttonList: [],
      //菜单信息
      menuInfo: {},
      //所有生成的代码
      geneCode: {},
      //是否覆盖
      isCover: false
    }
  },
  created() {
    this.init()
  },
  methods: {
    //初始化
    init() {
      const tableId = this.$route.query && this.$route.query.tableId
      if (tableId) {
        //明细
        detail(tableId).then(res => {
          this.baseInfo = res.data.genTable
          this.databaseData.push(res.data.databaseData)
          this.menuInfo = res.data.sysMenu
          this.fieldList = res.data.sysMenuFieldList
          this.buttonList = res.data.sysMenuButtonList
          this.onlFormInfo = res.data.onlForm
          getBaseInfoAndTable(this.databaseData[0]).then(res => {
            this.columnList = res.data.genTableColumnList
            this.active = 0
          })
        })
      } else {
        this.active = 0
      }
    },
    //上一步
    preStep() {
      this.active--
    },
    //下一步
    nextStep() {
      this.valid(this.active + 1)
    },
    //验证
    valid(active) {
      switch (this.active) {
        case 0 :
          let newFormContent = JSON.stringify(this.$refs.designCopy.$refs.vfDesignerRef.getFormJson())
          if (this.onlFormInfo.formContent != newFormContent && this.databaseData.length > 0) {
            this.$modal.confirm('是否使用新的表单信息覆盖已存在的配置', "确认信息", {
              distinguishCancelAndClose: true,
              confirmButtonText: '是',
              cancelButtonText: '否'
            }).then(() => {
              this.isCover = true
              this.getFormWidget().then(res => {
                this.formTableColumn(res).then(response => {
                  this.databaseData = []
                  this.databaseData.push(response)
                  this.active = active
                })
              })
            }).catch(action => {
              action === 'cancel' ? this.active = active : ''
            })
          } else {
            if (this.databaseData.length === 0) {
              this.getFormWidget().then(res => {
                this.formTableColumn(res).then(response => {
                  this.databaseData = []
                  this.databaseData.push(response)
                  this.active = active
                })
              })
            } else {
              this.active = active
            }
          }
          break
        case 1 :
          this.$refs.databaseInfoRef.validForm().then(valid => {
            if (valid) {
              this.initBaseAndTable()
              this.active = active
            } else {
              return
            }
          })
          break
        case 2 :
          this.$refs.baseInfoRef.validForm().then(res => {
            if (res) {
              this.active = active
            }
          })
          break
        case 3:
          this.$refs.fieldRef.validTable().then(res => {
            if (res) {
              this.active = active
            }
          })
          break
        case 5:
          this.$refs.menuRef.$refs.menuForm.validate(valid => {
            if (valid) {
              this.active = active
            }
          })
          break
        default :
          this.active = active
          break
      }
    },
    //初始化表单模板
    initOnlForm() {
      this.$refs.designCopy.init('form-setting', { 'tableSelected': [], 'columnList': [] })
      this.$nextTick(() => {
        this.$refs.designCopy.$refs.vfDesignerRef.setFormJson(this.onlFormInfo.formContent)
      })
    },
    //表单内容保存
    destroyOnlForm() {
      this.onlFormInfo.formContent = JSON.stringify(this.$refs.designCopy.$refs.vfDesignerRef.getFormJson())
    },
    //获取表单页面信息
    getFormWidget(){
      return new Promise((resolve, reject) => {
        let formInfo = []
        let widgetList = deepClone(this.$refs.designCopy.$refs.vfDesignerRef._data.designer.widgetList)
        let container = ["grid-sub-form","vf-dialog","vf-drawer","sub-form","card"]
        widgetList.forEach(item=>{
          if(item.type == "grid"){
            this.getGrid(item,formInfo)
          }else if(container.indexOf(item.type)!=-1){
            item.widgetList.forEach(gridItem=>{
              if(gridItem.type == "grid"){
                this.getGrid(gridItem,formInfo)
              }
              formInfo.push({ type:gridItem.type, options:gridItem.options })
            })
          }else if(item.type == "tab"){
            item.tabs.forEach(tabItem=>{
              tabItem.widgetList.forEach(widItem=>{
                if(widItem.type == "grid"){
                  this.getGrid(widItem,formInfo)
                }
                formInfo.push({ type:widItem.type, options:widItem.options })
              })
            })
          }else{
            formInfo.push({ type:item.type, options:item.options })
          }
        })
        resolve(formInfo)
      })
    },
    getGrid(item,arr){
      item.cols.forEach(colItem=>{
        colItem.widgetList.forEach(listItem=>{
          if(listItem.type == "grid"){
            this.getGrid(listItem,arr)
          }else{
            arr.push({ type:listItem.type, options:listItem.options }) 
          }
        })
      })
    },
    //获取表单表&列信息
    formTableColumn(formInfo) {
      return new Promise((resolve, reject) => {
        let obj = {
          fieldList: formInfo
        }
        getFormTableColumn(obj).then(res => {
          resolve(res.data)
        })
      })
    },
    //初始化基础配置、列表配置
    initBaseAndTable() {
      getBaseInfoAndTable(this.databaseData[0]).then(res => {
        this.columnList = res.data.genTableColumnList
        this.copyCodeToList()
        //新增或覆盖原有配置时
        if (!this.baseInfo.tableId || this.isCover) {
          let id = this.baseInfo.tableId
          this.baseInfo = res.data.genTable
          this.baseInfo.tableId = id
        }
      })
      this.baseInfo.tableName = this.databaseData[0].tableName
      this.baseInfo.tableComment = this.databaseData[0].tableComment
    },
    //复制代码配置到列表配置
    copyCodeToList() {
      this.fieldList = []
      this.columnList.forEach((item, index) => {
        let javaType = item.javaType
        let fieldType = ''
        if (javaType == 'BigDecimal' || javaType == 'Integer' ||
          javaType == 'Long' || javaType == 'Double') {
          fieldType = 'Number'
        } else if (javaType == 'Date') {
          fieldType = 'date'
        } else {
          fieldType = 'String'
        }
        let field = {
          id: index + 1,
          fieldCode: item.javaField,
          fieldName: item.columnComment,
          fieldType: fieldType,
          fieldFormat: '',
          status: 0,
          isOrder: 0,
          isSearchArea: 0,
          isSearchHeader: 0,
          isHide: 0,
          isSum: 0,
          isTotal: 0,
          align: 'center',
          fieldWidth: '',
          link: ''
        }
        this.fieldList.push(field)
      })
    },
    //初始化按钮列表
    initButtonList() {
      if (!this.baseInfo.tableId && this.buttonList.length === 0) {
        this.buttonList = this.$refs.buttonRef.usuallyButtonList
      }
    },
    //新增字段/按钮
    addRow() {
      if (this.active == 3) {
        this.$refs.fieldRef.addPageProperty()
      }
      if (this.active == 4) {
        this.$refs.buttonRef.addButtonProperty()
      }
    },
    //预览代码
    initPreviewer() {
      let obj = {
        genTable: this.baseInfo,
        genTableColumnList: this.columnList,
        databaseData: this.databaseData[0]
      }
      previewCode(obj).then(res => {
        this.geneCode = res.data
      })
    },
    //保存
    handlerSave() {
      this.baseInfo.type = 1
      let obj = {
        onlForm: this.onlFormInfo,
        databaseData: this.databaseData[0],
        genTable: this.baseInfo,
        genTableColumnList: this.columnList,
        sysMenuFieldList: this.fieldList,
        sysMenuButtonList: this.buttonList,
        sysMenu: this.menuInfo
      }
      saveFormDriver(obj).then(res => {
        this.$modal.msgSuccess(res.message)
        const obj = { path: '/system/tools/form-driver' }
        this.$tab.closeOpenPage(obj)
      })
    },
    //跳转
    jump(active) {
      if (this.baseInfo.tableId && !this.isCover) {
        this.valid(active)
      }
    }
  },
}
</script>

<style scoped lang="scss">

.el-container {
  height: 100%;

  .header-box {
    padding-top: 18px;
  }

  .el-main {
    display: flex;
    flex-direction: column;

    .btn-row {
      height: 40px;
      flex-shrink: 0;
    }

    .component-wrapper {
      flex: 1;
      overflow: hidden;

      & > div:first-child {
        height: 100% !important;
      }
    }
  }
}

</style>