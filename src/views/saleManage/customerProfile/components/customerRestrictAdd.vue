<template>
  <Dialog title="限制合作" :visible.sync="showPreviewDialogFlag" v-if="showPreviewDialogFlag"
             :show-close="true" :close-on-click-modal="false" :close-on-press-escape="false" 
             :destroy-on-close="true" class="small-padding-dialog" width="75%"
             
            >
    <div>
      <div class="form-render-wrapper" :class="[layoutType === 'H5' ? 'h5-layout' : (layoutType === 'Pad' ? 'pad-layout' : '')]">
        <VFormRender ref="preForm" :form-json="formJson" :form-data="testFormData" :preview-state="true"
                     :option-data="testOptionData"
                     @appendButtonClick="testOnAppendButtonClick" @buttonClick="testOnButtonClick"
                     @formChange="handleFormChange">
        </VFormRender>
      </div>
    </div>
    <code-editor v-model="testFunc" style="display: none"></code-editor>
    <div slot="footer" class="dialog-footer">
      <el-button round type="primary" @click="getFormData">保存</el-button>
      <el-button round type="primary" @click="getFormData">提交</el-button>
      <el-button round @click="showPreviewDialogFlag = false">取消</el-button>
    </div>
  </Dialog>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { formDataCreate, formDataDetail, formDataModify } from '@/api/form/form-data'
import VFormRender from '@/components/form-render/index'
import CodeEditor from '@/components/code-editor/index'
import {createDesigner} from "@/components/form-designer/designer"
import i18n from "@/utils/i18n"
export default {
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
      type: ''
    };
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
    },
  },
  created() {},
  methods: {
    async init(type, formCode, id) {
      // 根据业务编号获得样式
      const data = await this.formFillInPage(formCode);
      this.setFormJson(data);
      this.formCode = formCode;
      this.id = id;
      this.type = type;
      if(type === 'update' || type === 'detail'){
        const dataDetail = await this.formDataDetail();
        this.testFormData = JSON.parse(dataDetail.jsonData);
      } else if (type === 'create'){
        this.testFormData = {};
      }
      this.showPreviewDialogFlag = true;
      if(type === 'detail'){
        this.$nextTick( () => {
          if (this.$refs['preForm']) this.$refs['preForm'].disableForm();
        })
      }
    },
    formFillInPage (formCode) {
      return new Promise((resolve, reject) => {
        formFillInPage(formCode).then( ({data}) => {
          resolve(data);
        })
      })
    },
    formDataDetail () {
      return new Promise((resolve, reject) => {
        formDataDetail(this.id, this.formCode).then( ({data}) => {
          resolve(data);
        })
      })
    },
    setFormJson(formJson) {
      let modifiedFlag = false;
      if (!!formJson) {
        if (typeof formJson === 'string') {
          modifiedFlag = this.designer.loadFormJson( JSON.parse(formJson) )
        } else if (formJson.constructor === Object) {
          modifiedFlag = this.designer.loadFormJson(formJson);
        }

        if (modifiedFlag) {
          this.designer.emitHistoryChange();
        }
      }
    },
    getFormData() {
      this.$refs['preForm'].getFormData().then(formData => {
        if(this.type == 'update'){
          this.formDataModify(Object.assign({}, formData, {id: this.id}));
        } else if (this.type === 'create'){
          this.formDataCreate(formData);
        }
      }).catch(error => {
        this.$message.error(error);
      })
    },
    formDataCreate (formData) {
      formDataCreate(formData, this.formCode).then( ({success}) => {
        if(success){
          this.$modal.msgSuccess("新增成功");
          this.showPreviewDialogFlag = false;
          this.$emit('operateSuccess');
        }
      })
    },
    formDataModify (formData) {
      formDataModify(formData, this.formCode).then( ({success, data}) => {
        if(success){
          this.$modal.msgSuccess("修改成功");
          this.showPreviewDialogFlag = false;
          this.$emit('operateSuccess');
        }
      })
    },
    testOnButtonClick(button) {
    },
    testOnAppendButtonClick(clickedWidget) {
    },
    handleFormChange(fieldName, newValue, oldValue, formModel) {

    },
  },
};
</script>
