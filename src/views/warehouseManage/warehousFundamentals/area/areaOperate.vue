<template>
  <!--  :fullscreen="(layoutType === 'H5') || (layoutType === 'Pad')" -->
  <Dialog :title="title" :visible.sync="showPreviewDialogFlag" v-if="showPreviewDialogFlag"
             :show-close="true" :close-on-click-modal="false" :close-on-press-escape="false"
             :destroy-on-close="true" class="small-padding-dialog" width="60%"
             
  >
    <div>
      <div class="form-render-wrapper"
           :class="[layoutType === 'H5' ? 'h5-layout' : (layoutType === 'Pad' ? 'pad-layout' : '')]"
      >
        <VFormRender ref="preForm" :form-json="formJson" :form-data="testFormData" :preview-state="true"
                     :option-data="testOptionData"
                     @appendButtonClick="testOnAppendButtonClick" @buttonClick="testOnButtonClick"
                     @formChange="handleFormChange"
        >
        </VFormRender>
      </div>
    </div>
    <code-editor v-model="testFunc" style="display: none"></code-editor>
    <div slot="footer" class="dialog-footer" v-if="type!=='view'">
      <el-button round type="primary" @click="getFormData">确认</el-button>
      <el-button round @click="showPreviewDialogFlag = false">取消</el-button>
    </div>
  </Dialog>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { formDataCreate, formDataDetail, formDataModify } from '@/api/form/form-data'
import VFormRender from '@/components/form-render/index'
import CodeEditor from '@/components/code-editor/index'
import { createDesigner } from '@/components/form-designer/designer'
import i18n from '@/utils/i18n'
import { BaseAreaSave,BaseAreaDetail } from '@/api/warehouseManage/area'

export default {
  name: "areaOperate",
  mixins: [i18n],
  components: {
    VFormRender,
    CodeEditor
  },
  data() {
    return {
      showPreviewDialogFlag: false,
      testFunc: '',
      testFormData: {},
      testOptionData: {},
      designer: createDesigner(this),
      formCode: null,
      id: null,
      type: '',
      title: '新增地区'
    }
  },
  computed: {
    formJson() {
      return {
        widgetList: this.designer.widgetList,
        formConfig: this.designer.formConfig
      }
    },
    layoutType() {
      return this.designer.getLayoutType()
    }
  },
  created() {
  },
  methods: {
    async init(type, formCode, id) {
      // 根据业务编号获得样式
      const data = await this.formFillInPage(formCode)
      this.setFormJson(data)
      this.formCode = formCode
      this.id = id || ''
      this.type = type
      if (type === 'update' || type === 'view') {
        const { data, message, success } = await BaseAreaDetail(this.id)
        if (success) {
          data.status = data.status === '0'
          this.testFormData = data
        } else {
          this.$modal.msgError(message)
        }
        this.title="修改地区"
      } else if (type === 'create') {
        this.testFormData = {}
        this.title="新增地区"
      }
      this.showPreviewDialogFlag = true
      if (type === 'view') {
        this.title="查看地区"
        this.$nextTick(() => {
          this.$refs['preForm'].setReadMode(true);
        })
      }
    },
    formFillInPage(formCode) {
      return new Promise((resolve, reject) => {
        formFillInPage(formCode).then(({ data }) => {
          resolve(data)
        })
      })
    },
    formDataDetail() {
      return new Promise((resolve, reject) => {
        formDataDetail(this.id, this.formCode).then(({ data }) => {
          resolve(data)
        })
      })
    },
    setFormJson(formJson) {
      let modifiedFlag = false
      if (!!formJson) {
        if (typeof formJson === 'string') {
          modifiedFlag = this.designer.loadFormJson(JSON.parse(formJson))
        } else if (formJson.constructor === Object) {
          modifiedFlag = this.designer.loadFormJson(formJson)
        }

        if (modifiedFlag) {
          this.designer.emitHistoryChange()
        }
      }
    },
    getFormData() {
      this.$refs['preForm'].getFormData().then(formData => {
        formData.status = formData.status ? 0 : 1  /*0是启用,1是禁用*/
        if (this.type == 'update') {
          this.formDataModify(Object.assign({}, formData, { id: this.id }))
        } else if (this.type === 'create') {
          this.formDataCreate(formData)
        }
      }).catch(error => {
        this.$message.error(error)
      })
    },
    formDataCreate(formData) {
      BaseAreaSave(formData).then(({ success, message }) => {
        if (success) {
          this.$modal.msgSuccess('新增成功')
          this.showPreviewDialogFlag = false
          this.$emit('operateSuccess')
        } else {
          this.$modal.msgError(message)
        }
      })
    },
    formDataModify(formData) {
      BaseAreaSave(formData).then(({ success, message }) => {
        if (success) {
          this.$modal.msgSuccess('修改成功')
          this.showPreviewDialogFlag = false
          this.$emit('operateSuccess')
        }else{
          this.$modal.msgError(message)
        }
      })
    },
    testOnButtonClick(button) {
    },
    testOnAppendButtonClick(clickedWidget) {
      let { field: { options: { name } } } = vm || {};
    },
    handleFormChange(fieldName, newValue, oldValue, formModel) {

    }
  }
}
</script>
