<template>
  <el-container>
    <el-header class="header-box" style="display: flex; height: auto;">
      <div style="display: flex; flex-basis: 90%;">
        <el-steps style="width: 100%;" :active="active" align-center >
          <el-step title="选择表" @click.native="jump(0)"></el-step>
          <el-step title="基础配置" @click.native="jump(1)"></el-step>
          <el-step title="表单配置" @click.native="jump(2)"></el-step>
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
        <selectTable v-if="active === 0" ref="selectTableRef" :selectedTableName="selectedTableName" @selectTableChange="selectTableChange"/>
        <baseInfo v-else-if="active === 1" ref="baseInfoRef" :baseInfo="baseInfo" :onlFormInfo="onlFormInfo"/>
        <design-copy v-else-if="active === 2" @hook:mounted="initOnlForm" @hook:beforeDestroy="destroyOnlForm" ref="designCopy"/>
        <fieldProperty v-else-if="active === 3" class="field-property" @hook:mounted="copyCodeToList" ref="fieldRef" :tableData="fieldList"/>
        <buttonProperty v-if="active === 4" @hook:mounted="initButtonList" ref="buttonRef" :buttonData="buttonList" :isShowFormId="false"/>
        <menuProperty v-else-if="active === 5" :form="menuInfo" ref="menuRef"/>
        <tableColumn v-else-if="active === 6" :columnList="columnList"/>
        <codePreviewer v-else-if="active === 7" @hook:mounted="initPreviewer" ref="codePreviewerRef" :geneCode="geneCode"/>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { checkOnlFormCode, detail, previewCode, save, getBaseInfoAndTable } from '@/api/tool/gen'
import baseInfo from '@/views/system/gene/components/base-info'
import tableColumn from '@/views/system/gene/components/table-column'
import fieldProperty from '@/views/system/sys-menu/components/fieldProperty'
import buttonProperty from '@/views/system/sys-menu/components/buttonProperty'
import menuProperty from '@/views/system/sys-menu/components/menuInfo'
import designCopy from '@/views/form/components/designCopy.vue'
import codePreviewer from '@/views/system/gene/components/code-previewer'
import selectTable from '@/views/system/gene/components/select-table'

export default {
  name: 'geneStep',
  components: { baseInfo, tableColumn, buttonProperty, fieldProperty, menuProperty, designCopy, codePreviewer, selectTable },
  data() {
    return {
      //激活的步骤
      active: -1,
      //选中的表名
      selectedTableName: '',
      //基础信息
      baseInfo: {},
      //属性列表
      columnList: [],
      //列表配置列表
      fieldList: [],
      //按钮列表
      buttonList: [],
      //菜单信息
      menuInfo: {},
      //动态表单信息
      onlFormInfo: {},
      //所有生成的代码
      geneCode: {},
    }
  },
  created() {
    this.init()
  },
  methods: {
    //初始化
    init() {
      const tableId = this.$route.query && this.$route.query.tableId
      //明细
      if (tableId) {
        detail(tableId).then(res => {
          this.selectedTableName = res.data.genTable.tableName
          this.baseInfo = res.data.genTable
          this.columnList = res.data.genTableColumnList
          this.menuInfo = res.data.sysMenu
          this.fieldList = res.data.sysMenuFieldList
          this.buttonList = res.data.sysMenuButtonList
          this.onlFormInfo = res.data.onlForm
          this.active = 0
        })
      } else {
        this.active = 0
      }
    },
    //初始化按钮列表
    initButtonList() {
      if (!this.baseInfo.tableId && this.buttonList.length === 0) {
        this.buttonList = this.$refs.buttonRef.usuallyButtonList
      }
    },
    //初始化表单
    initOnlForm() {
      this.$refs.designCopy.init('form-setting', { 'tableSelected': [{ 'tableName': this.baseInfo.tableName }], 'columnList': this.columnList })
      this.$nextTick(() => {
        this.$refs.designCopy.$refs.vfDesignerRef.setFormJson(this.onlFormInfo.formContent)
      })
    },
    //表单内容保存
    destroyOnlForm() {
      this.onlFormInfo.formContent = JSON.stringify(this.$refs.designCopy.$refs.vfDesignerRef.getFormJson())
    },
    //初始化预览页
    initPreviewer() {
      this.preview()
    },
    //上一步
    preStep() {
      this.active--
    },
    //下一步
    nextStep() {
      if (this.active == 0) {
        if (!this.selectedTableName) {
          this.$modal.msgError('请选择表')
          return
        } else {
          this.initBaseInfo().then(() => {
            this.active++
          })
        }
      } else if (this.active == 1) {
        this.$refs.baseInfoRef.validForm().then(res => {
          if (res) {
            this.active++
          }
        })
      } else {
        this.active++
      }
    },
    //复制代码配置到列表配置
    copyCodeToList() {
      if (this.fieldList.length != 0) {
        return
      }
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
    //新增字段/按钮
    addRow() {
      if (this.active == 3) {
        this.$refs.fieldRef.addPageProperty()
      }
      if (this.active == 4) {
        this.$refs.buttonRef.addButtonProperty()
      }
    },
    //保存
    handlerSave() {
      if (!this.saveValid()) {
        return
      }
      this.baseInfo.type = 0
      let obj = {
        genTable: this.baseInfo,
        genTableColumnList: this.columnList,
        sysMenu: this.menuInfo,
        sysMenuFieldList: this.fieldList,
        sysMenuButtonList: this.buttonList,
        onlForm: this.onlFormInfo
      }
      // 同步修改打印模板id
      (obj?.sysMenuButtonList||[]).map(x => {
        if (x) {
          x.printTemplateId = ''
        }
      })
      save(obj).then(res => {
        this.$modal.msgSuccess(res.message)
        const obj = { path: '/system/tools/data-driver', query: { t: Date.now(), pageNum: this.$route.query.pageNum } }
        this.$tab.closeOpenPage(obj)
      })
    },
    //预览代码
    preview() {
      let obj = {
        genTableId: '',
        genTable: this.baseInfo,
        genTableColumnList: this.columnList
      }
      previewCode(obj).then(res => {
        this.geneCode = res.data
      })
    },
    //选中表
    selectTableChange(tableName) {
      this.selectedTableName = tableName
    },
    //初始化必要信息
    async initBaseInfo() {
      let obj = {
        tableName: this.selectedTableName,
        type: 0
      }
      await getBaseInfoAndTable(obj).then(res => {
        this.baseInfo = res.data.genTable
        this.columnList = res.data.genTableColumnList
      })
      return Promise.resolve()
    },
    //跳转
    jump(active) {
      if (this.active === 0) {
        if (!this.selectedTableName) {
          this.$modal.msgError('请选择表')
          return
        } else {
          this.initBaseInfo().then(() => {
            this.active = active
          })
        }
      } else if (this.active == 1) {
        this.$refs.baseInfoRef.validForm().then(res => {
          if (res) {
            this.active = active
          }
        })
      } else {
        this.active = active
      }
    },
    //验证表单编号是否已存在
    async checkFormCode() {
      await checkOnlFormCode(this.onlFormInfo).then(({ success }) => {
        return success
      })
    },
    //验证
    saveValid() {
      //验证表单
      if (this.onlFormInfo.formContent) {
        if (!this.onlFormInfo.formCode) {
          this.$modal.msgError('请填写表单编号')
          return false
        }
        if (!this.onlFormInfo.formName) {
          this.$modal.msgError('请填写表单名称')
          return false
        }
        if (!this.checkFormCode()) {
          this.$modal.msgError('表单编号已存在')
          return false
        }
      }    
      //验证菜单
      if (this.fieldList.length > 0 || this.buttonList.length > 0) {
        if (!this.menuInfo.menuName) {
          this.$modal.msgError('请填写菜单名称')
          return false
        }
        if (!this.menuInfo.menuUrl) {
          this.$modal.msgError('请填写菜单地址')
          return false
        }
      }
      return true
    }
  }
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
