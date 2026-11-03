<template>
    <div class="app-container container_flex" v-loading="loading">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
            @newButton="newButton"></button-top>
        <div class="container_flex_form">

            <el-switch v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
            </el-switch>
            <VFormRender ref="vFormRef" :form-data="formData" @appendButtonClick="handleAppendButtonClick" :class="{'formRender_view': queryType === 'view'}"
                @buttonClick="handleButtonClick" @operationButtonClick="operationButtonClick"
                @selectChange="selectChange">
                <!-- <template slot="rejectRate" slot-scope="scope">
                    <el-input-number v-model.number="scope.formModel.rejectRate" :precision="2" controls-position="right" :min="0"
                        :max="100" style="width: 100%" :disabled="[ 'view'].includes(queryType)  "></el-input-number>
                </template> -->
                <div slot="details">
                    <sonList ref="sonList" :isReplaceMethod="!(replaceDataObj[nameMatlCode] && replaceDataObj[nameMatlCode].length)" :dict="dict.type" :queryType="queryType" @sonInput="sonInput" @isMainMatlChange="(scope) => isMainMatlChange(scope, 'sonList')"></sonList>
                </div>
                <div slot="replace">
                    <replaceList ref="replaceList" :dict="dict.type" :queryType="queryType"
                        @replaceInput="replaceInput" @isMainMatlChange="(scope) => isMainMatlChange(scope, 'replaceList')"></replaceList>
                </div>
            </VFormRender>
        </div>
        <choice-material ref="choiceMaterial" :propsFormData="propsFormData" :singleMode="singleMode"
            @choiceMaterialClick="choiceMaterialClick"></choice-material>
        <toBeReviewed ref="toBereview" />
        <el-dialog title="提示" :visible.sync="upLevelVisible" width="40%">
            <div style="text-align: center;margin-bottom: 20px;">本次BOM变更是否需要升级版本？</div>
            <div>
                <el-radio v-model="upLevel" label="1"></el-radio>

                .升级为新版本，新版本审批通过后生效；老版本在历史版本中查看。
            </div>
            <div style="margin-top: 10px;">
                <el-radio v-model="upLevel" label="2" disabled></el-radio>
                .不升级新版本，BOM将不审核直接被修改；如果变更前该版本已经被业务环节引用，比如被生产引用，查看该版本号的BOM时，将不能查看变更前的BOM信息，只能查看变更后的BOM信息。
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="newButton('save')">确 定</el-button>
                <el-button @click="upLevelVisible = false">取 消</el-button>
            </div>
        </el-dialog>
        <choice-bom-history ref="choiceBomHistory" singleMode @change="choiceClick" />
    </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import sonList from './components/sonList'
import replaceList from './components/replaceList'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import choiceMaterial from '@/views/components/choice-material'
import { bomModify, bomCreate, bomSubmit, bomDetail, bomChange } from '@/api/prodmgr-mm/bom';
import indexMixin from '@/views/mixins'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import VFormRender from '@/components/form-render/index'
import choiceBomHistory from "@/views/components/choice-bomHistory"
export default {
    name: "BOMAdministrationOperate",
    mixins: [indexMixin],
    dicts: ['planAttribute', 'hmMode', 'MeasureUnit', 'YesNo', 'replaceMethod'],
    components: { VFormRender, sonList, replaceList, choiceMaterial, toBeReviewed, choiceBomHistory },
    data() {
        return {
            loading: false,
            queryType: '',
            queryId: '',
            queryName: '',
            formJson: {},
            formData: {},
            // 菜单按钮、字段等数据
            buttonTop: [
                { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update, change' },
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
                { buttonName: '保存', buttonCode: 'change', buttonIcon: 'Blue-Save', type: 'change' },
                { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
                { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
                { buttonName: '退回上一步', buttonCode: 'rollbackToPrevious', buttonIcon: 'Blue-Cancel', type: '' },
                { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
                { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
                { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'view, update' }
            ],
            queryAuditArr: null,
            singleMode: true,
            buttonClickName: '',
            replaceDataObj: {},
            nameMatlCode: '',
            status: '',
            upLevel: '1',
            upLevelVisible: false,
            checked: false,
            propsFormData: {
              planAttributes: '1,3'
            },
            copyHistoryCreate: '',
        }
    },
    computed: {
        ...mapGetters(['infoData']),
    },
    created() {
        this.init();
    },
    activated () {
      this.$nextTick(() => {
        this.copyHistoryCreate3()
      })
    },
    methods: {
        checkoutStatus(flag) {
            const widgets = ['bomName', 'type', 'replaceFlag', 'rejectRate', 'notes', 'matlType', 'bomCode', 'matlUnit', 'matlName']
            if (flag) {
                this.$refs.vFormRef.hideWidgets(widgets)
            } else {
                this.$refs.vFormRef.showWidgets(widgets)
            }
        },
        buttonShow(item) {
          if (item.buttonCode === 'rollbackToPrevious') {
            const query = this.isDialog ? this.dialogQuery : this.$route.query
            return query.name === 'audit' && query.type === 'view' && Array.isArray(this.queryAuditArr)
              && this.queryAuditArr.length === 1 && !!this.queryAuditArr[0]?.taskId
              && this.buttonShow({ ...item, buttonCode: 'reject' })
          }
            if (['saveSubmit'].includes(item.buttonCode) && this.queryType == 'create') {
                return true
            }
            if (['saveSubmit', 'edit'].includes(item.buttonCode) && !['0', '1'].includes(this.status)) {
                return false
            }
            if (['saveSubmit', 'edit'].includes(item.buttonCode) && this.queryName == 'toBeDeal') {
                return false
            }
            if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
                return true
            } else {
                return false
            }
        },
        init() {
            let { type, name, id, auditArr, copyHistoryCreate = '' } = this.isDialog ? this.dialogQuery : this.$route.query;
            this.queryType = type || 'create';
            this.queryId = id || '';
            this.queryName = name || 'BOMAdministration';
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            this.copyHistoryCreate = copyHistoryCreate
            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm();
                await this.formFillInPage();
                if (this.queryType == 'change') {
                    this.$refs['vFormRef'].showWidgets('changeNote');
                    this.$refs.vFormRef.disableWidgets(['matlCode', 'useBy', 'type', 'rejectRate', 'planAttribute']);
                }
                if (this.queryType == 'view') {
                    this.$refs['vFormRef'].setReadMode(true);
                    this.$refs['vFormRef'].hideWidgets('detailsAdd');
                    this.$refs['vFormRef'].hideWidgets('replaceAdd');
                }
                if (this.queryType != 'create' || this.copyHistoryCreate == '2') {
                    this.bomDetail();
                }
                this.copyHistoryCreate3()
            })
        },
        bomDetail(id) {
            this.loading = true;
            bomDetail(id || this.queryId).then(({ data }) => {
                this.status = data.status;
                this.bomVersion = data.bomVersion
                data.rawList = data.rawList.map(item => {
                  this.replaceDataObj[item.matlCode] = item.replaceList;
                  return Object.assign({}, item, {isMainMatlShow: !(item.replaceList && item.replaceList.length), isReplaceMethod: !(item.replaceList && item.replaceList.length)})
                })
                this.$refs.sonList.init(data.rawList, false);
                delete data.rawList;
                this.$refs["vFormRef"].setFormData(data);
                if (data.type === '2') {
                    this.$refs.vFormRef.enableWidgets('replaceFlag');
                } else {
                    this.$refs.vFormRef.disableWidgets('replaceFlag');
                }
                if(this.copyHistoryCreate){
                  this.$refs['vFormRef'].setFieldValue('BOM', data.bomCode)
                  this.$refs['vFormRef'].setFieldValue('bomCode', '')
                }else{
                  if(data.bomVersion !== 'V001') {
                    this.$refs.vFormRef.disableWidgets(['matlCode', 'useBy', 'type', 'rejectRate', 'planAttribute']);
                  }
                }
            }).finally(() => {
                this.loading = false;
            });
        },
        formFillInPage() {
            return new Promise((resolve) => {
                const formName = ['1', '2'].includes(this.copyHistoryCreate) ? 'BOMAdministrationHistoryOperate': 'BOMAdministrationOperate'
                formFillInPage(formName).then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        selectChange(fieldName, newValue, oldValue, subFormName, subFormRowId) {
            if (fieldName === 'type') {
                if (newValue === '2') {
                    this.$refs.vFormRef.enableWidgets('replaceFlag');
                } else {
                    this.$refs.vFormRef.disableWidgets('replaceFlag');
                    this.$refs.vFormRef.setFieldValue('replaceFlag', '');
                }
            }
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
            this.buttonClickName = name;
            if (name === 'matlCode') {
                this.propsFormData.planAttributes = '1,3'
                this.singleMode = true;
                const matlCode = this.$refs.vFormRef.getFieldValue('matlCode');
                this.$refs.choiceMaterial.init(matlCode);
                return
            }
            if(name === 'BOM'){
              this.$refs.choiceBomHistory.init();
            }
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
            this.buttonClickName = name;
            //新增子件信息
            if (name === 'detailsAdd') {
                this.propsFormData.planAttributes = ''
                this.singleMode = false;
                const matlCode = this.$refs.vFormRef.getFieldValue('matlCode');
                const detailsList = this.$refs.sonList.tableData.detailsList;
                this.$refs.choiceMaterial.init(null, [], detailsList);
                return
            }
            //删除子件信息
            if (name === 'detailsDelete') {
                this.$refs.sonList.removeData();
                return
            }
            //显示替代料
            if (name === 'buttonReplace') {
                return
            }
            //新增替代
            if (name === 'replaceAdd') {
                this.propsFormData.planAttributes = ''
                const selectRow = this.$refs.sonList.selectRow;
                if (selectRow) {
                    this.singleMode = false;
                    const matlCode = this.$refs.vFormRef.getFieldValue('matlCode');
                    const replaceList = this.$refs.replaceList.tableData.detailsList;
                    const dataList = this.$refs.sonList.tableData.detailsList.filter( item => item.matlCode === this.nameMatlCode)
                    if(dataList[0] && dataList[0].planAttribute != '2'){
                      this.$modal.msgError('计划属性=采购的才能维护替代件');
                      return
                    }
                    // this.$refs.choiceMaterial.init(null, replaceList, [selectRow.matlCode, matlCode]);
                    this.$refs.choiceMaterial.init(null, [], replaceList);
                } else {
                    this.$modal.msgError('请先选择一条子件信息');
                }
                return
            }
            //删除替代
            if (name === 'replaceDelete') {
                this.$refs.replaceList.removeData();
                return
            }
        },
        choiceClick(data) {
          this.replaceDataObj = {}
          this.$refs.sonList.tableData.detailsList = []
          this.bomDetail(data.id)
        },
        choiceMaterialClick(data) {
            if (this.buttonClickName === 'matlCode') {
                this.$refs.vFormRef.setFormData({
                    matlCode: data.matlCode,
                    matlName: data.matlName,
                    matlType: data.matlType,
                    matlUnit: data.matlUnit,
                    planAttribute: data.bizParam.planAttribute,
                });
                return
            }
            if (this.buttonClickName === 'detailsAdd') {
                const arrData = data.map((item) => {
                    return Object.assign({}, item, item.bizParam, { isReplaceMethod: true,isMainMatlShow: true,isMainMatl: '', replaceMethod: '', lossRate: 0, childNum: 1, baseNum: 1, unitNum: 1, issueType: item.issueType || '1' })
                })
                this.$refs.sonList.init(arrData, true);
                return
            }
            if (this.buttonClickName === 'replaceAdd') {
                const arrData = data.map((item) => {
                    return Object.assign({}, item, item.bizParam, { isMainMatl: '0', lossRate: 0, childNum: 1, baseNum: 1, unitNum: 1, issueType: item.issueType || '1' })
                })
                this.$refs.replaceList.init(arrData, true);
                return
            }
        },
        sonInput(row, type) {
            if (!row || !row.matlCode) {
                return
            }
            this.nameMatlCode = row.matlCode;
            if (type === 'remove') {
                this.replaceDataObj[this.nameMatlCode] = [];
            }
            this.$refs.replaceList.init(this.replaceDataObj[this.nameMatlCode] || [], false);
        },
        replaceInput(data) {
          this.replaceDataObj[this.nameMatlCode] = data;
          const len = !(data && data.length)
          const replaceIsMainMatl = data.every(item => item.isMainMatl != '1')
          this.$refs.sonList.tableData.detailsList.forEach( (item) => {
            if(item.matlCode === this.nameMatlCode){
              item.isMainMatlShow = len
              item.isReplaceMethod = len
              if(!item.replaceMethod && !len && !item.replaceMethod){
                item.replaceMethod = '3'
              }
              if(len){
                item.isMainMatl = ''
                item.replaceMethod = ''
              }else if(replaceIsMainMatl){
                item.isMainMatl = '1'
              }else if(!replaceIsMainMatl){
                item.isMainMatl = '0'
              }
            }
          })
        },
        isMainMatlChange (scope, name) {
          if(scope.row.isMainMatl == '1'){
            if(name == 'replaceList'){
              this.replaceDataObj[this.nameMatlCode].forEach( (item) => {
                if(item.matlCode != scope.row.matlCode){
                  item.isMainMatl = '0'
                }
              })
            }else{
              this.replaceDataObj[scope.row.matlCode].forEach( (item) => {
                item.isMainMatl = '0'
              })
              if(scope.row.planAttribute != '2'){
                this.replaceDataObj[this.nameMatlCode] = []
                this.$refs.replaceList.tableData.detailsList = []
              }
            }
          }
        },
        cancel(name) {
            // 关闭当前tabs
            this.$tab.closeOpenPage({ name });
        },
        newButton(buttonCode) {
          if (buttonCode === 'rollbackToPrevious') {
            this.$refs.toBereview.init('rollbackToPrevious', this.queryAuditArr, this.queryName || this.name)
            return
          }
            if (buttonCode === 'edit') {
                this.queryType = 'update';
                this.$refs['vFormRef'].setReadMode(false);
                this.$refs['vFormRef'].showWidgets('detailsAdd');
                this.$refs['vFormRef'].showWidgets('replaceAdd');

            } else if (buttonCode === 'cancel') {
                this.cancel(this.queryName);
            } else if (buttonCode === 'change') {
                this.upLevelVisible = true
            } else if (buttonCode === 'save') {
                this.handleSave(buttonCode)
            } else if (buttonCode === 'saveSubmit') {
                this.handleSave(buttonCode)
            } else if (buttonCode === 'pass') {
                this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName);
            } else if (buttonCode === 'reject') {
                this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName);
            }
        },
        async handleSave(buttonCode) {
            this.upLevelVisible = false
            try {
                this.$refs.vFormRef.getFormData().then(formData => {
                    const sonList = this.$refs['sonList'];
                    if (!sonList.tableData.detailsList.length) {
                        this.$modal.msgError('子件信息不能为空');
                        return
                    }
                    let flag = true
                    sonList.$refs.elForm.validate(valid => {
                        flag = valid
                        // if (valid) {
                        //     resolve(sonList.tableData.detailsList)
                        // } else {
                        //     reject()
                        // }
                    })
                    if (!flag) {
                        return
                    }
                    const replaceData = this.$refs['replaceList'];
                    if (!!replaceData.tableData.detailsList.length) {
                        replaceData.$refs.elForm.validate(valid => {
                        flag = valid
                    })
                    }   
                    if (!flag) {
                        return
                    }

                    let api = bomCreate
                    const data = [formData, sonList.tableData.detailsList, replaceData.tableData.detailsList]
                    if (this.queryType == 'update') {
                        api = bomModify
                    }
                    data[1].forEach(item => {
                        item.replaceList = this.replaceDataObj[item.matlCode] || [];
                    });
                    const formParam = { ...data[0], rawList: data[1] }
                    if (this.queryType == 'change') {
                        formParam.upLevel = { 1: true, 2: false }[this.upLevel]
                        api = bomChange
                        formParam.bomVersion = this.bomVersion
                    }
                    const param = { ...formParam }
                    if (this.queryId && !this.copyHistoryCreate) {
                        param.bomId = this.queryId
                    }
                    const saveObj = {
                        'save': () => { this.saveOrder(api, param) },
                        'saveSubmit': () => {
                            this.$reviewerDialog({
                                type: ACTIVITI_ASSUGNEE.MM_BOM,
                                multiple: false,
                                success: (assignee) => {
                                    this.saveOrder(bomSubmit, param, assignee)
                                }
                            })
                        }
                    }
                    saveObj[buttonCode] && saveObj[buttonCode]()
                }).catch(err => {
                    this.$modal.msgError('表单数据校验失败');
                })
            } catch (err) {
                this.$modal.msgError(err.message);
                console.error(err)
            }
        },
        async saveOrder(url, param, assignee) {
            if (!this.resOk) {
                const res = await url({ ...param, assignee })
                res.success && this.$modal.msgSuccess(`${res.message}`)
                this.resOk = true
                this.cancel(this.queryName)
            }
        },
        operationButtonClick(dataTable, buttonName, rowIndex, row) {
            if (buttonName == 'delete') {
                this.$modal.confirm('是否确认删除?').then(() => {
                    let detailedList = JSON.parse(JSON.stringify(this.$refs['vFormRef'].getWidgetRef('detailedList').getTableData()));
                    detailedList.splice(rowIndex, 1);
                    let tableRef = this.$refs['vFormRef'].getWidgetRef('detailedList');
                    tableRef?.setTableData(detailedList);
                })
            }
        },
        copyHistoryCreate3 () {
          if(this.copyHistoryCreate === '3' && this.$refs.sonList){
            this.$refs.sonList.tableData.detailsList = []
            const data = this.$store.state.bom.copyBomData.concat(this.$store.state.bom.bomData)
            const uniqueArr = data.filter((item, index) => data.findIndex(i => i.matlCode === item.matlCode) === index)
            this.$refs.sonList.init(uniqueArr)
          }
        }
    },
    beforeRouteLeave(to, from, next) {
      const nameArr = this.$store.state.tagsView.visitedViews.map(item => item.name)
      if(this.queryType === 'create'){
        if(!nameArr.includes('BOMAdministrationOperate')){
          this.$store.dispatch('setBomData', [])
          this.$store.dispatch('setCopyBomData', [])
        }else{
          this.$store.dispatch('setBomData', this.$refs['sonList'].tableData.detailsList)
        }
      }
      next();
    }
};
</script>
<style lang="scss" scoped>
::v-deep .custom_button {
    .el-button {
        transform: translateY(-1px);
        background: #ffffff !important;
        border-radius: 50px;
        font-size: 12px;
        text-align: center;
        height: 32px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 5px 30px 5px 30px;
        position: relative;
        min-width: 100px;
        margin-right: 6px;
        border: 1px solid #1890ff;
        box-sizing: border-box;
        line-height: 22px;
    }
}

.slotIcon-color {
    position: absolute;
    right: 20px;
    top: 34px;
    color: #1890ff;
    z-index: 10;
}

.slotIcon-color-content {
    color: red;
}
</style>
