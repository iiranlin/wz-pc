<template>
  <Dialog class="max-height-dialog flex-dialog" :title="title" :visible.sync="openDataScope"
    :close-on-click-modal="false" width="900px" append-to-body v-loading="loading">
    <div class="container_flex_form">
      <div class="container_flex_form_tree">
        <el-form :inline="true">
          <el-form-item label="来源单号：" prop="startPageNum" class="container_flex_form_select">
            <el-select v-model="id" @change="handleNodeClick" style="width: 300px;">
              <el-option v-for="item  in menuOptions" :key="item.id"
                :label="`${item.sourceCode}${item.sourceRowNum ? '-' + item.sourceRowNum : ''}${item.batchNo ? '-' + item.batchNo : ''}`"
                :value="item.id" />
            </el-select>
          </el-form-item>
        </el-form>
        <VFormRender ref="vFormRef" class="container_flex_form_dialog" :global-dsv="globalDsv"
          @selectChange="handleSelectChange" @formChange="handleFormChange">
          <template slot="fileList">
            <div style="display: flex;flex-direction: column;">
              <attachmentTable ref="attachmentTable" businessType="06" :queryType="queryType" v-model="fileList"
                @input="(fileList) => handleFormChange('fileList', fileList)"></attachmentTable>
            </div>
          </template>
          <template slot="qiOrderRecordList">
            <el-form ref="elForm" class="qiOrderRecordList" v-loading="loading" label-suffix="：" label-position="right" :model="formDataObj" :rules="formDataObj.rules" label-width="144px">
              <el-row v-for="(item, i) in formDataObj.qiOrderRecordList" :key="i">
                <el-col :span="12">
                  <el-form-item label="不合格数量" :prop="'qiOrderRecordList.' + i + '.unqualifiedNum'" :rules="formDataObj.rules.unqualifiedNum">
                    <span v-if="queryType === 'view'">{{ item.unqualifiedNum }}</span>
                    <el-input-number v-else style="width: 100%;" v-model="item.unqualifiedNum" :min="0" controls-position="right" @change="unqualifiedNumChange(i); handleFormChange('qiOrderRecordList', formDataObj.qiOrderRecordList)"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="不合格原因" :prop="'qiOrderRecordList.' + i + '.unqualifiedReason'" :rules="formDataObj.rules.unqualifiedReason">
                    <span v-if="queryType === 'view'">{{ item.unqualifiedReason | orderTypeFilter(dict.type.unqualifiedReason) }}</span>
                    <el-select v-else style="width: 87%;" v-model="item.unqualifiedReason" @change="unqualifiedReasonChange(item, i); handleFormChange('qiOrderRecordList', formDataObj.qiOrderRecordList)">
                      <el-option v-for="item in dict.type.unqualifiedReason" :key="item.value"
                        :label="item.label"
                        :value="item.value" />
                    </el-select>
                    <template v-if="queryType != 'view'">
                      <i class="el-icon-circle-plus-outline icon-style" @click="addButtonClick" v-if="!i"></i>
                      <i class="el-icon-remove-outline icon-style" @click="handleReduceButtonClick(item, i)" v-if="i && formDataObj.qiOrderRecordList.length > 1"></i>
                    </template>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </template>
        </VFormRender>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitDataScope" v-if="queryType != 'view'">确 定</el-button>
      <el-button @click="openDataScope = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import attachmentTable from '@/views/components/attachmentTable'
import { qiQiSave, qiDetailView } from '@/api/prodmgr-inv/qi';
import { formFillInPage } from '@/api/form/form'
import { getToken } from '@/utils/auth'
import VFormRender from '@/components/form-render/index'
import { generateUUID } from '@/utils'
import indexMixin from './mixins';
export default {
  mixins: [indexMixin],
  dicts: ['unqualifiedReason'],
  components: { attachmentTable, VFormRender },
  data() {
    return {
      loading: false,
      openDataScope: false,
      title: "质检填报",
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: '06',
      },
      menuOptions: [],
      menuOptionsA: [],
      id: null,
      formData: {},
      queryType: '',
      fileList: [],
      formDataObj: {
        qiOrderRecordList: [],
        rules: {
          unqualifiedNum: [{ required: true, message: "请输入不合格数量", trigger: ['blur', 'change'] }],
          unqualifiedReason: [{ required: true, message: "请选择不合格原因", trigger: ['blur', 'change'] }],
        }
      },
    };
  },
  created() { },
  methods: {
    init(data = [], queryType = 'create') {
      this.queryType = queryType;
      this.openDataScope = true;
      this.$nextTick(async () => {
        await this.formFillInPage();
        this.$refs['vFormRef'].resetForm();
        const ids = data.map((item) => item.id);
        this.qiDetailView(ids);
        if (queryType == 'view') {
          this.$refs['vFormRef'].setReadMode(true);
        } else if (queryType == 'updateTesting') {
          this.$refs.vFormRef.disableWidgets(['qiType', 'simplingRatio', 'comments']);
          this.$refs['vFormRef'].setReadMode(false);
        } else {
          this.$refs['vFormRef'].setReadMode(false);
        }
      });
    },
    qiDetailView(ids) {
      qiDetailView({ ids: ids }).then(({ data }) => {
        this.menuOptions = JSON.parse(JSON.stringify(data));
        this.menuOptionsA = JSON.parse(JSON.stringify(data));
        if (this.queryType == 'create') {
          this.menuOptionsA = this.menuOptionsA.map((item) => { return Object.assign({}, item, { totalQualifiedNum: item.qiNum, simplingNum: item.qiNum, qualifiedNum: item.qiNum, simplingRatio: 100,
            qiOrderRecordList: [{
              "unqualifiedNum": 0,
              "unqualifiedReason": "2",
            }]
          })});
        }
        this.formData = this.menuOptionsA[0];
        this.formDataObj.qiOrderRecordList = this.menuOptionsA[0].qiOrderRecordList
        this.id = data[0].id;
        this.qiSource = data[0].qiSource;
        if (this.qiSource == '5' || this.queryType == 'updateTesting') {
          this.$refs.vFormRef.disableWidgets(['qiType']);
        } else {
          this.$refs.vFormRef.enableWidgets(['qiType']);
        }
        this.fileList = this.formData.fileList
        this.$refs['vFormRef'].setFormData(this.formData);
        if (this.queryType == 'create') {
          this.$refs.vFormRef.setFieldValue('qiType', '1')
          this.$refs.vFormRef.setFieldValue('simplingRatio', 100)
          this.$refs.vFormRef.disableWidgets('simplingRatio')
          this.$refs.vFormRef.setFieldValue('unqualifiedNum', '0')
        }
        this.inputValidate()
      })
    },
    // 节点单击事件
    handleNodeClick(id) {
      this.id = id;
      this.menuOptionsA.forEach((item, i) => {
        if (id == item.id) {
          this.qiSource = item.qiSource;
          this.$refs['vFormRef'].setFormData({
            matlCode: item.matlCode,
            matlName: item.matlName,
            qiNum: item.qiNum,
            unQuRatioLower: item.unQuRatioLower,
            simplingNum: item.simplingNum,
            qualifiedNum: item.qualifiedNum,
            unqualifiedNum: item.unqualifiedNum,
            unqualifiedRatio: item.unqualifiedRatio,
            qiResult: item.qiResult,
            totalQualifiedNum: item.totalQualifiedNum,
            totalUnqualifiedNum: item.totalUnqualifiedNum,
          });
          this.fileList = !!item.fileList && !!item.fileList.length ? item.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
          this.formDataObj.qiOrderRecordList = item.qiOrderRecordList
          const simplingRatio = this.$refs.vFormRef.getFieldValue('simplingRatio')
          if (Number(item.simplingRatio) != Number(simplingRatio)) {
            item.simplingRatio = simplingRatio
            this.handleSelectChange('simplingRatio', simplingRatio)
          }
        }
      })
      if (this.qiSource == '5') {
        this.$refs.vFormRef.disableWidgets(['qiType']);
      } else {
        this.$refs.vFormRef.enableWidgets(['qiType']);
      }
    },
    basePassageDtail(id) {
      this.loading = true;
      basePassageDtail(id).then(({ data }) => {
        this.$refs['vFormRef'].setFormData(Object.assign({}, data, { warehouseId: data.warehouseId || undefined }));
      }).finally(() => {
        this.loading = false;
      });
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('qualityTestingFillIn').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data);
          resolve(true);
        })
      })
    },
    handleSelectChange(fieldName, newValue) {
      const qiNum = this.$refs.vFormRef.getFieldValue('qiNum');
      if (fieldName === 'qiType') {
        if (newValue == '1') {
          this.$refs.vFormRef.setFieldValue('simplingRatio', 100);
          this.$refs.vFormRef.disableWidgets('simplingRatio');
          this.$refs.vFormRef.setFieldValue('simplingNum', qiNum.toFixed('2'));
          this.$refs.vFormRef.setFieldValue('qualifiedNum', qiNum.toFixed('2'));
          this.$refs.vFormRef.setFieldValue('totalQualifiedNum', qiNum.toFixed('2'));
        } else {
          const simplingRatio = this.$refs.vFormRef.getFieldValue('simplingRatio');
          this.$refs.vFormRef.enableWidgets('simplingRatio');
          const simplingNum = simplingRatio && Math.ceil(simplingRatio * qiNum / 100);
          this.$refs.vFormRef.setFieldValue('simplingNum', simplingNum);
          this.$refs.vFormRef.setFieldValue('qualifiedNum', simplingNum);
          this.$refs.vFormRef.setFieldValue('totalQualifiedNum', simplingNum);
        }
        this.$refs.vFormRef.setFieldValue('qiResult', '');
        this.$refs.vFormRef.setFieldValue('totalUnqualifiedNum', 0);
        this.$refs.vFormRef.setFieldValue('unqualifiedNum', 0);
        this.$refs.vFormRef.setFieldValue('unqualifiedRatio', 0);
        this.formDataObj.qiOrderRecordList = [{
          "unqualifiedNum": 0,
          "unqualifiedReason": "2",
        }]
      }
      if (fieldName === 'simplingRatio') {
        const qiType = this.$refs.vFormRef.getFieldValue('qiType');
        if (!newValue || !qiType) {
          this.$refs.vFormRef.disableWidgets(['unqualifiedNum', 'qualifiedNum']);
        } else {
          this.$refs.vFormRef.enableWidgets(['unqualifiedNum', 'qualifiedNum']);
          const simplingNum = newValue && newValue * qiNum / 100;
          this.$refs.vFormRef.setFieldValue('simplingNum', simplingNum);
          this.$refs.vFormRef.setFieldValue('qualifiedNum', simplingNum);
          this.$refs.vFormRef.setFieldValue('totalQualifiedNum', simplingNum);
        }
        this.$refs.vFormRef.setFieldValue('qiResult', '');
        this.$refs.vFormRef.setFieldValue('totalUnqualifiedNum', 0);
        this.$refs.vFormRef.setFieldValue('unqualifiedNum', 0);
        this.$refs.vFormRef.setFieldValue('unqualifiedRatio', 0);
        this.formDataObj.qiOrderRecordList = [{
          "unqualifiedNum": 0,
          "unqualifiedReason": "2",
        }]
      }
      if (fieldName === 'unQuRatioLower') {
        this.inputValidate();
      }
    },
    inputValidate() {
      const qiNum = this.$refs.vFormRef.getFieldValue('qiNum');
      const unQuRatioLower = this.$refs.vFormRef.getFieldValue('unQuRatioLower');
      const unqualifiedNum = this.$refs.vFormRef.getFieldValue('unqualifiedNum');
      const unqualifiedRatio = this.$refs.vFormRef.getFieldValue('unqualifiedRatio');
      if (unqualifiedNum == 0) {
        this.$refs.vFormRef.setFieldValue('qiResult', '1');
        this.$refs.vFormRef.setFieldValue('totalUnqualifiedNum', 0);
        this.$refs.vFormRef.setFieldValue('totalQualifiedNum', qiNum);
      } else if (Number(unqualifiedRatio) == 100 || (unQuRatioLower && unqualifiedRatio >= Number(unQuRatioLower))) {
        this.$refs.vFormRef.setFieldValue('qiResult', '3');
        this.$refs.vFormRef.setFieldValue('totalUnqualifiedNum', qiNum);
        this.$refs.vFormRef.setFieldValue('totalQualifiedNum', 0);
      } else if (!unQuRatioLower || Number(unqualifiedRatio) < Number(unQuRatioLower)) {
        this.$refs.vFormRef.setFieldValue('qiResult', '2');
        this.$refs.vFormRef.setFieldValue('totalQualifiedNum', qiNum - unqualifiedNum);
        const totalQualifiedNum = this.$refs.vFormRef.getFieldValue('totalQualifiedNum');
        this.$refs.vFormRef.setFieldValue('totalUnqualifiedNum', qiNum - totalQualifiedNum);
      }
    },
    handleFormChange(key, value) {
      this.menuOptionsA.forEach((item, index) => {
        if (item.id == this.id) {
          const tempObj = {}
          if (key && value) {
            tempObj[key] = value
          }
          this.menuOptionsA[index] = Object.assign({}, item, this.$refs['vFormRef'].formDataModel, tempObj);
        }
      })
    },
    submitDataScope() {
      const vFormRefData = new Promise((resolve, reject) => {
          return this.$refs.vFormRef.getFormData().then(formData => {
              resolve(formData)
          }).catch(error => {
              reject()
          })
      })
      const elForm = new Promise((resolve, reject) => {
          return this.$refs.elForm.validate(valid => {
              if (valid) {
                  resolve(this.menuOptionsA)
              } else {
                  reject()
              }
          })
      })
      Promise.all([vFormRefData, elForm]).then((data) => {
        const formData = data[0]
        const qiList = data[1]
        const saveData = {
          qiType: formData.qiType,
          simplingRatio: formData.simplingRatio,
          comments: formData.comments,
          qiList
        }
        // if (Number(formData.simplingNum) != (Number(formData.unqualifiedNum) + Number(formData.qualifiedNum))) {
        //   this.$message.error(`合格数量和不合格数量不能同时为0`);
        //   return
        // }
        this.loading = true;
        qiQiSave(saveData).then(({ message }) => {
          this.$modal.msgSuccess(message);
          this.openDataScope = false;
          this.$emit('qualityTestingFillInSuccess');
        }).finally(() => {
          this.loading = false;
        });
      }).catch(err => {
        this.$modal.msgError('表单数据校验失败');
      })
    },
    handleReduceButtonClick(row, index){
      this.formDataObj.qiOrderRecordList = this.formDataObj.qiOrderRecordList.filter((item, i) => i !== index)
      this.handleFormChange('qiOrderRecordList', this.formDataObj.qiOrderRecordList)
      this.unqualifiedNumChange(index)
    },
    addButtonClick(){
      this.formDataObj.qiOrderRecordList.push({
        "unqualifiedNum": 0,
        "unqualifiedReason": "",
      })
      this.handleFormChange('qiOrderRecordList', this.formDataObj.qiOrderRecordList)
    },
    unqualifiedNumChange (i) {
      this.$nextTick(()=>{
        const simplingNum = this.$refs.vFormRef.getFieldValue('simplingNum')
        let totalNum = 0
        this.formDataObj.qiOrderRecordList.map( item => {
          totalNum += item.unqualifiedNum
        })
        if(totalNum <= simplingNum){
          this.$refs.vFormRef.setFieldValue('qualifiedNum', (simplingNum - totalNum).toFixed(2))
          this.$refs.vFormRef.setFieldValue('unqualifiedNum', totalNum)
        }else{
          let totalNumA = 0
          this.formDataObj.qiOrderRecordList.map( (item, index) => {
            if(i != index){
              totalNumA += item.unqualifiedNum
            }
          })
          this.$set(this.formDataObj.qiOrderRecordList[i], 'unqualifiedNum', simplingNum - totalNumA)
          this.$refs.vFormRef.setFieldValue('qualifiedNum', 0)
          this.$refs.vFormRef.setFieldValue('unqualifiedNum', simplingNum)
        }
        const unqualifiedNum = this.$refs.vFormRef.getFieldValue('unqualifiedNum')
        const unqualifiedRatio = (Number(unqualifiedNum) / simplingNum * 100).toFixed('2') || 0;
        this.$refs.vFormRef.setFieldValue('unqualifiedRatio', unqualifiedRatio)
        this.inputValidate()
      })
    },
    unqualifiedReasonChange (row, i) {
      this.formDataObj.qiOrderRecordList.forEach((item, index) => {
        if(i != index && row.unqualifiedReason == item.unqualifiedReason){
          row.unqualifiedReason = ''
        }
      })
    }
  },
};
</script>
<style lang="scss" scoped>
.qiOrderRecordList.el-form--label-right{
  ::v-deep .el-form-item__label{
    text-align: right !important;
  }
  .el-row{
    margin-right: -6px;
    margin-left: -6px;
    .el-col{
      padding-left: 6px;
      padding-right: 6px;
      .icon-style {
        position: absolute;
        font-size: 18px;
        top: 9px;
        right: 8px;
        cursor: pointer;
        color: #409EFF;
      }
    }
  }
}
::v-deep .el-dialog {
  border-radius: 16px;

  .el-dialog__title {
    color: #18223e;
  }
}

::v-deep .el-dialog__body {
  padding: 0 16px !important;
}

::v-deep .el-dialog__header {
  padding: 12px 20px;
  background: none !important;
}

::v-deep .el-form-item__label {
  padding: 0;
}

::v-deep .container_flex_form_select {
  .el-form-item__label {
    &::before {
      content: "";
      width: 4px;
      height: 4px;
      background: #3185ff;
      display: inline-block;
      margin-right: 5px;
      margin-bottom: 3px;
    }
  }
}

::v-deep .dialog_p {
  width: 100%;
  height: 32px;
  line-height: 32px;
  background: #f2f2f2;
  margin: 12px 0;
  padding: 0;
  color: #18223e;
  font-size: 12px;
  text-indent: 14px;
}

::v-deep .dialog-footer {
  .el-button--medium {
    padding: 8px 45px;
    font-size: 14px;
    border-radius: 5px;
  }

  .el-button--primary {
    background-color: #2054d0;
    border-color: #2054d0;
  }
}

.container_flex_form {
  overflow-x: hidden;
  margin: 0;
}

.container_flex_form_tree {
  display: flex;
  flex-direction: column;
  height: 100%;

  .drawer-tree {
    width: 300px;
    height: 100%;
    border-right: 1px solid #dfe4ed;
    margin-right: 20px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .container_flex_form_dialog {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
}

::v-deep .el-select__caret.el-icon-arrow-up::before {
  content: '';
  display: block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 6px solid #141a30;
  position: absolute;
  top: 13px;
  left: 7px;
}

::v-deep .fileList {
  width: calc(100% - 20px) !important;
}
</style>