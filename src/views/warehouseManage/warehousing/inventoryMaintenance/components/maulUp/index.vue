<template>
    <Dialog class="flex-dialog max-height-dialog" title="上架" :visible.sync="visible" :close-on-click-modal="false" :close-on-press-escape="false" append-to-body width="900px" @close="handleClose" >
        <div class="wrapper_flex">
            <el-form :inline="true">
              <el-form-item label="来源单号：" prop="startPageNum" class="container_flex_form_select">
                <el-select v-model="currentIndex" @change="tabSelectChange" style="width: 300px;">
                  <el-option v-for="(item, index)  in rowDataList" :key="index" :label="`${item.inCode}${item.sourceRowNum?'-' + item.sourceRowNum:''}${item.qiCode?'-' + item.qiCode:''}`" :value="index" />
                </el-select>
              </el-form-item>
            </el-form>
            <div class="wrapper-form container_flex_form">
                <VFormRender v-if="refresh" ref="vFormRef" :form-data="formData" :global-dsv="globalDsv"
                    @appendButtonClick="handleAppendButtonClick" @selectChange="selectChange"
                    @buttonClick="handleButtonClick" @treeSelectSelect="treeSelectSelect"
                    @treeSelectInput="treeSelectInput" @operationButtonClick="operationButtonClick">
                    <div slot="qualified">
                        <div>
                            <el-form class="qualified" :model="qualifiedForm" inline :rules="rules" ref="qualifiedForm" label-position="right">
                                <el-row class="qualified_row">
                                    <el-col :span="12">
                                        <el-form-item label="本次合格品待入库数量："><span class="qualified-num"> {{ rowData.qualifiedInNum }}</span></el-form-item>
                                    </el-col> 
                                    <el-col :span="12">
                                      <el-button class="qualified_row_button" @click="handleAppendQualified('qualified')" v-if="operateType != 'view'">
                                        <icon-svg icon-class="Blue-Receive" style="float: left;" />
                                        <span>添加货位</span>
                                      </el-button>
                                    </el-col> 
                                </el-row>
                                <el-row class="qualified_row" v-if=" rowData.qualifiedInNum && rowData.quWarehouseName">
                                    <el-col :span="12">
                                        <el-form-item label="本次合格品待入库仓库："><span class="qualified-warehouse">{{ rowData.quWarehouseName }}</span></el-form-item>
                                    </el-col> 
                                </el-row>
                                <el-row v-for="(item,index) in qualifiedForm.qualifiedList" :key="index">
                                    <el-col :span="10">
                                        <el-form-item label="上架货位：" :prop="`qualifiedList[${index}][placeCode]`" :rules="rules.placeCode">
                                            <selectTree
                                                :disable="operateType === 'view'"
                                                :index="index"
                                                :value="item.placeId"
                                                selectInputShow
                                                :options="qualifiedListWareList"
                                                :props="optionsProps"
                                                :disabledFun="disabledFun"
                                                @getValue="getQuAreaCodeValue"
                                            />
                                        </el-form-item> 
                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item label="上架数量：" :prop="`qualifiedList[${index}][groundingNum]`" :rules="rules.groundingNum">
                                            <el-input type="number" :min="0"  v-model="item.groundingNum" :disabled="operateType === 'view'"></el-input>
                                            <i class="el-icon-remove-outline icon-style" @click="handleReduceButtonClick('qualified', item, index)" v-if="operateType != 'view' && index !== 0"></i>
                                        </el-form-item> 
                                    </el-col>
                                </el-row>
                            </el-form>
                        </div>
                    </div>
                    <div slot="unQualified" v-if="Number(rowData.unqualifiedInNum) > 0">
                        <el-form class="qualified" :model="unqualifiedForm" inline :rules="rules" ref="unqualifiedForm" label-position="right">
                                <el-row class="qualified_row">
                                    <el-col :span="12">
                                        <el-form-item label="本次不合格品待入库数量："><span class="qualified-num">{{ rowData.unqualifiedInNum }}</span></el-form-item>
                                    </el-col> 
                                    <el-col :span="12">
                                      <el-button class="qualified_row_button" @click="handleAppendQualified('unqualified')" v-if="operateType != 'view' && !isDisabledUnQuail">
                                        <icon-svg icon-class="Blue-Receive" style="float: left;" />
                                        <span>添加货位</span>
                                      </el-button>
                                    </el-col> 
                                </el-row>
                                <el-row class="qualified_row" v-if="rowData.unqualifiedInNum && rowData.unquWarehouseName">
                                    <el-col :span="12">
                                        <el-form-item label="本次不合格品待入库仓库："><span class="qualified-warehouse">{{ rowData.unquWarehouseName }}</span></el-form-item>
                                    </el-col> 
                                </el-row>
                                <el-row v-for="(item,index) in unqualifiedForm.unqualifiedList" :key="index">
                                    <el-col :span="10">
                                        <el-form-item label="上架货位：" :prop="`unqualifiedList[${index}][placeCode]`" :rules="rules.placeCode">
                                            <selectTree
                                                :disable="operateType === 'view' || isDisabledUnQuail"
                                                :index="index"
                                                :clearable="false"
                                                selectInputShow
                                                :value="item.placeId"
                                                :options="unqualifiedListWareList"
                                                :props="optionsProps"
                                                :disabledFun="disabledFun"
                                                @getValue="getUnQuAreaCodeValue"
                                            />
                                        </el-form-item> 
                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item label="上架数量：" :prop="`unqualifiedList[${index}][groundingNum]`" :rules="rules.groundingNum">
                                            <el-input type="number" :min="0" v-model="item.groundingNum" :disabled="operateType === 'view' || isDisabledUnQuail"></el-input>
                                            <i class="el-icon-remove-outline icon-style" @click="handleReduceButtonClick('unqualified', item, index)" v-if="(operateType != 'view' && index !== 0) && !isDisabledUnQuail" ></i>
                                        </el-form-item> 
                                    </el-col>
                                </el-row>
                            </el-form>
                    </div>
                </VFormRender>
            </div>
        </div>
        
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="saveSelection" v-if="operateType !== 'view'">确定</el-button>
          <el-button @click.native="visible = false">取消</el-button>
        </div>
    </Dialog>
  </template>
  
  <script>
  
  import indexMixin from '@/views/mixins'
  import { formFillInPage } from '@/api/form/form'
  import { getToken } from '@/utils/auth'
  import selectTree from '@/components/selectTree/index.vue'
  import { basePlaceTree } from '@/api/warehouseManage/basePlace';
  import { inMaintenanceUpMaul, groundingView } from '@/api/warehouseManage/inventoryMaintenance';
  import VFormRender from '@/components/form-render/index'
  export default {
    name: 'MaulUp',
    mixins: [indexMixin],
    components: {selectTree, VFormRender},
    props: {
    },
    data() {
      return {
        visible: false,
        formData: {},
        operateType: '',
        currentIndex: 0,
        refresh: true,
        isDisabledQuail: false,
        isDisabledUnQuail: false,
        saveParams: [],
        optionsProps: {
            children: "children",
            label: "name",
            value: "id",
            checkStrictly: true
        },
        qualifiedForm: {
            qualifiedList: [
                {
                    "groundingNum": 0,
                    "placeCode": "",
                    "placeName": "",
                    "placeId": "",
                }
            ],
        },
        unqualifiedForm: {
            unqualifiedList: [
                {
                    "groundingNum": 0,
                    "placeCode": "",
                    "placeName": "",
                    "placeId": "",
                }
            ],
        },
        
        qualifiedListWareList: [],
        unqualifiedListWareList: [],
        rowData: {},
        rowDataList: [],
        rules: {
            placeCode: [
                { required: true, message: '请选择上架货位', trigger: 'change' }
            ],
            groundingNum: [
              { required: true, message: '请输入数量', trigger: 'change' }
            ],
        },
        validateGroundingNum(rule, value, callback) {
            if (typeof value !== 'string') {
                // 如果 value 不是字符串，尝试转换为字符串
                value = String(value);
            }
            if (value === '') {
                callback(new Error('请输入数字'));
            } else if (Number(value) < 0) {
                callback(new Error('数字必须大于零'));
            } else {
                callback();
            }
        },
        globalDsv: {
                VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
                VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
                Authorization: getToken(),
                businessType: '01',
            },
      }
    },
    watch: {
      rowData(val) {
        if(val.qualifiedInNum === 0){
            this.isDisabledQuail = true
        } else {
            this.isDisabledQuail = false
        }
        if(val.unqualifiedInNum === 0) {
            this.isDisabledUnQuail = true
        } else {
            this.isDisabledUnQuail = false
        }
      }
    },
    created(){
        this.init()
    },
    methods: {
        handleClose(){
            this.rowDataList = []
            this.rowData = {}
            this.visible = false
            this.operateType = ''
            this.saveParams = []
            this.qualifiedForm.qualifiedList = []
            this.qualifiedForm.qualifiedList.push({
                "groundingNum": 0,
                "placeCode": "",
                "placeName": "",
                "placeId": "",
            })
            this.unqualifiedForm.unqualifiedList = []
            this.unqualifiedForm.unqualifiedList.push({
                "groundingNum": 0,
                "placeCode": "",
                "placeName": "",
                "placeId": "",
            })
        },
        disabledFun(node){
            return node.level != 5
        },
        getQuAreaCodeValue(node, index, valueId){
            this.qualifiedForm.qualifiedList[index].placeCode = node.code
            this.qualifiedForm.qualifiedList[index].placeName = node.name
            this.qualifiedForm.qualifiedList[index].placeId = node.id
        },
        getUnQuAreaCodeValue(node, index, valueId){
            this.unqualifiedForm.unqualifiedList[index].placeCode = node.code
            this.unqualifiedForm.unqualifiedList[index].placeName = node.name
            this.unqualifiedForm.unqualifiedList[index].placeId = node.id
        },
        selectChange(){},
        handleAppendButtonClick(){},
        operationButtonClick(){},
        handleButtonClick(){},
        treeSelectInput(){},
        treeSelectSelect(){},
        /**
         * 加载仓库下拉框数据
         */
         loadingWarehouseById(type, warehouseId, callback){
            basePlaceTree({startId: warehouseId}).then(res => {
                if(res.success) {
                    const list = res.data
                    if(type === 'qualified') {
                        this.qualifiedListWareList = list
                    } else {
                        this.unqualifiedListWareList = list
                    }
                    callback && callback()
                } else {
                    this.$message.error(res.message)
                }
            })
        },
        handleAppendQualified(type, row, index){
            if(type === 'qualified'){
                const totalNum = this.rowData.qualifiedInNum
                const amountNum = this.qualifiedForm.qualifiedList.reduce((a, b) => a + b.groundingNum, 0)
                this.qualifiedForm.qualifiedList.push({
                    "groundingNum":  Math.max(totalNum - amountNum, 0),
                    "placeCode": "",
                    "placeName": "",
                    "placeId": "",
                })
            } else {
                const totalNum = this.rowData.unqualifiedInNum
                const amountNum = this.unqualifiedForm.unqualifiedList.reduce((a, b) => a + b.groundingNum, 0)
              
                this.unqualifiedForm.unqualifiedList.push({
                    "groundingNum": Math.max(totalNum - amountNum, 0),
                    "placeCode": "",
                    "placeName": "",
                    "placeId": "",
                })
            }
        },
        handleReduceButtonClick(type, row, index){
            if(type === 'qualified'){
                this.qualifiedForm.qualifiedList = this.qualifiedForm.qualifiedList.filter((item, i) => i !== index)
            } else {
                this.unqualifiedForm.unqualifiedList= this.unqualifiedForm.unqualifiedList.filter((item, i) => i !== index)
            }
        },
      tabSelectChange(index){
          this.saveParamsVerify(verfiy => {
            if(verfiy) {
                // 回显，先从保存的参数列表中取，取不到再初始化
                if(this.saveParams.length > 0){
                    const idx = this.saveParams.findIndex(item => item.inDetailId === this.rowDataList[index].id);
                    if(idx !== -1) {
                        this.rowData = this.rowDataList[index]
                        this.rowData.qualifiedList = this.saveParams[idx].qualifiedList
                        this.rowData.qualifiedList = this.saveParams[idx].qualifiedList
                        // 根据仓库获取下拉框数据
                        this.qualifiedListWareList = []
                        this.unqualifiedListWareList = []
                        this.loadingWarehouseById('qualified',this.rowData.quWarehouseId, () => {
                            this.loadingWarehouseById('unqualified',this.rowData.unquWarehouseId, () => {
                                this.$nextTick(() => {
                                    this.qualifiedForm.qualifiedList = this.saveParams[idx].qualifiedList
                                    this.unqualifiedForm.unqualifiedList = this.saveParams[idx].unqualifiedList
                                })
                            })
                        })
                    } else {
                        this.rowData = this.rowDataList[index]
                    // 表单清空
                    this.qualifiedForm.qualifiedList = []
                    this.qualifiedForm.qualifiedList.push({
                        "groundingNum": 0,
                        "placeCode": "",
                        "placeName": "",
                        "placeId": "",
                    })
                    this.unqualifiedForm.unqualifiedList = []
                    this.unqualifiedForm.unqualifiedList.push({
                        "groundingNum": 0,
                        "placeCode": "",
                        "placeName": "",
                        "placeId": "",
                    })
                    }
                }
                this.currentIndex = index
                this.$refs['vFormRef'] && this.$refs['vFormRef'].setFormData({
                  inCode: this.rowData.inCode,
                  matlCode: this.rowData.matlCode,
                  matlName: this.rowData.matlName
                });
            }
          }, true)
      },
      open(rowDataList, type) {
        this.currentIndex = 0
        if((type == 'view' || type == 'update') && rowDataList.length === 0) return
        this.handleClose()
        this.rowDataList = rowDataList
        this.rowData = rowDataList[0]
        this.visible = true
        this.operateType = type
        this.rowDataList.map(item => {
            this.saveParams.push({
                inDetailId: item.id,
                sourceCode: item.sourceCode,
                sourceRowNum: item.sourceRowNum,
                qualifiedInNum: item.qualifiedInNum,
                unqualifiedInNum: item.unqualifiedInNum,
                qiCode: item.qiCode,
                qualifiedList: [{
                        "groundingNum": item.qualifiedInNum,
                        "placeCode": "",
                        "placeName": "",
                        "placeId": "",
                    }],
                unqualifiedList: [{
                        "groundingNum": item.unqualifiedInNum,
                        "placeCode": "",
                        "placeName": "",
                        "placeId": "",
                    }]
            });
        })
        this.qualifiedForm.qualifiedList = []
            this.qualifiedForm.qualifiedList.push({
                "groundingNum": this.rowData.qualifiedInNum,
                "placeCode": "",
                "placeName": "",
                "placeId": "",
            })
            this.unqualifiedForm.unqualifiedList = []
            this.unqualifiedForm.unqualifiedList.push({
                "groundingNum": this.rowData.unqualifiedInNum,
                "placeCode": "",
                "placeName": "",
                "placeId": "",
            })
        this.init()
      },
      init() {
            this.loadingWarehouseById('qualified',this.rowData.quWarehouseId)
            this.loadingWarehouseById('unqualified',this.rowData.unquWarehouseId)
            let { type, name, id, auditArr } = this.$route.query;
            this.queryType = type || 'create';
            this.queryId = id || '';
            this.queryName = name || 'inventoryMaintenance';
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            this.$nextTick(async () => {
                this.$refs['vFormRef'] && this.$refs['vFormRef'].resetForm();
                await this.formFillInPage();
                if(Number(this.rowData.unqualifiedInNum) <= 0){
                  this.$refs['vFormRef'] && this.$refs['vFormRef'].hideWidgets('htmltext44480')
                }else{
                  this.$refs['vFormRef'] && this.$refs['vFormRef'].showWidgets('htmltext44480')
                }
                if(this.operateType === 'update' || this.operateType === 'view') {
                    this.groundingView()
                }
            })
        },
        groundingView(){
            groundingView(this.rowData.id).then(({success, data, message}) => {
                if(success) {
                    this.qualifiedForm.qualifiedList = data.qualifiedList 
                    this.unqualifiedForm.unqualifiedList = data.unqualifiedList
                } else {
                    this.$message.error(message);
                }
                
            })
        },
      // 保存选择
      saveSelection(){
        this.saveParamsVerify(validate => {
            if(validate) {
                // 判断总数量是否等于待入库数量
                for(let key in this.saveParams) {
                    let item = this.saveParams[key]
                    let itemName = `${item.sourceCode}-${item.sourceRowNum}-${item.qiCode}`
                    let isQuailWarehouse = item.qualifiedList.some((e) => !e.placeId)
                    let isUnQuailWarehouse = item.unqualifiedList.some((e) => !e.placeId)
                    if(isQuailWarehouse) {
                        this.$message.error(`单据【${itemName}】合格品货位不能为空`);
                        return
                    }
                    if(item.unqualifiedInNum != 0 && isUnQuailWarehouse) {
                        this.$message.error(`单据【${itemName}】不良品货位不能为空`);
                        return
                    }
                    const hasSampleQualified = item.qualifiedList.some((item, index, array) => {
                        return array.filter(innerItem => innerItem.placeId === item.placeId).length > 1;
                    });
                    const hasSampleUnQualified = item.unqualifiedList.some((item, index, array) => {
                        return array.filter(innerItem => innerItem.placeId === item.placeId).length > 1;
                    });
                    if(hasSampleQualified || hasSampleUnQualified) {
                        this.$message.error(`单据【${itemName}】同一类型，货位不能重复`);
                        return
                    }
                    // 逐条判断，上架的货位中，数量不能为0
                    // if(item.qualifiedList.some((item) => item.groundingNum === 0)) {
                    //     this.$message.error(`单据【${itemName}】，合格品仓库上架数量不能为0`);
                    //     return
                    // }
                    if(Number(item.unqualifiedInNum) != 0 && item.unqualifiedList.some((item) => item.groundingNum === 0)) {
                        this.$message.error(`单据【${itemName}】，不合格品仓库上架数量不能为0`);
                        return
                    }
                    const quailSum = item.qualifiedList.reduce((accumulator, current) => accumulator + Number(current.groundingNum), 0);
                    const unQuailSum = item.unqualifiedList.reduce((accumulator, current) => accumulator + Number(current.groundingNum), 0);
                    if(quailSum !=  Number(item.qualifiedInNum)) {
                        this.$message.error(`单据【${itemName}】合格品总上架数量需要与本次合格品待入库数量相等`);
                        return;
                    }
                    if(unQuailSum !=  Number(item.unqualifiedInNum)) {
                        this.$message.error(`单据【${itemName}】不合格品总上架数量需要与本次不合格品待入库数量相等`);
                        return;
                    }
                    if(Number(item.unqualifiedInNum) === 0) {
                        // 剔除掉支撑界面的空数据
                        this.saveParams[key].unqualifiedList = []
                    }
                }
                inMaintenanceUpMaul(this.saveParams).then(({success, message}) => {
                    if(success) {
                        this.$message.success('上架成功');
                        this.visible = false
                        this.$emit('refresh');
                    } else {
                        this.$message.error(message);
                    }
                })
            }
        })
      },
      saveParamsVerify(callback, isNotSave) {
        const qualifiedFormList = new Promise((resolve, reject) => {
          if(!this.$refs['qualifiedForm']){
            resolve(true)
            return
          }
          return this.$refs['qualifiedForm'].validate(valid => {
            resolve(valid)
          }).catch(error => {
            reject()
          })
        })
        const unqualifiedFormList = new Promise((resolve, reject) => {
          if(!this.$refs['unqualifiedForm']){
            resolve(true)
            return
          }
          return this.$refs['unqualifiedForm'].validate(valid => {
            resolve(valid)
          })
        })
        Promise.all([qualifiedFormList, unqualifiedFormList]).then( (arrData) => {
          const [quailValid, unquailValid] = arrData
          if(isNotSave || quailValid && (this.isDisabledUnQuail || unquailValid)) {
            const index = this.saveParams.findIndex(item => item.inDetailId === this.rowData.id);
            if (index !== -1) {
                this.saveParams[index].qualifiedList = this.qualifiedForm.qualifiedList;
                this.saveParams[index].unqualifiedList = this.unqualifiedForm.unqualifiedList;
            }
            callback && callback(true)
          } else {
            callback && callback(false)
          }
        })
      },
      formFillInPage() {
        return new Promise((resolve) => {
            formFillInPage('saveGrounding').then(res => {
                this.$refs['vFormRef'] && this.$refs['vFormRef'].setFormJson(res.data);
                this.$refs['vFormRef'] && this.$refs['vFormRef'].setFormData({
                    inCode: this.rowData.inCode,
                    matlCode: this.rowData.matlCode,
                    matlName: this.rowData.matlName
                });
                resolve(true);
            })
        })
        },
    }
  }
  </script>
  
  <style scoped lang="scss">
  ::v-deep .qualified .label-left-align .el-form-item__label {
    text-align: right !important;
  }
  .qualified{
    .icon-style {
      position: absolute;
      font-size: 18px;
      top: 9px;
      right: -22px;
    }
    .wrapper {
        display: flex;
        justify-content: space-between;
    }
    .content {
        color: #000000;
        font-size: 14px;
        font-weight: 600;
        margin-left: 15px;
    }
  }
  .confirm {
  height: 34px;
  border-radius: 50px;
  background: #227aff;
  color: #ffffff;
  min-width: 100px
}
.wrapper_flex {
  height: 100%;
    display: flex;
    flex-direction: column;
    .item-panel {
        width: 180px;
        border: 1px solid #e6e6e6;
        padding: 5px;
        border-radius: 5px;
        margin-right: 5px;
        cursor: pointer;
        .item-normal {
            font-size: 14px;
            color: #555555;
            height: 40px;
            line-height: 40px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 160px;
        }
        .item-active {
            color: #2F8BFC;
            font-size: 14px;
            height: 40px;
            line-height: 40px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 160px;
        }
    }
    .wrapper-form {
        overflow-y: auto;
        .el-form-item{
          ::v-deep .el-input__inner{
            width: 220px;
          }
        }
    }
}

.cancel {
  height: 34px;
  border-radius: 50px;
  min-width: 100px;
  margin-left: 10px;
}
.qualified-num {
    font-size: 14px;
    color: #1652db;
}
.qualified-warehouse{
  font-size: 14px;
  color: #18223e;
}

::v-deep .el-dialog{
  border-radius: 16px;
  .el-dialog__title{
    color: #18223e;
  }
}
::v-deep .el-dialog__body{
  padding: 0 16px !important;
  color: #18223e;
}
::v-deep .el-dialog__header{
  padding: 12px 20px;
  background: none !important;
}
::v-deep .el-form-item__label{
  padding: 0;
}
::v-deep .container_flex_form_select{
  margin: 0;
  .el-form-item__label{
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
::v-deep .dialog_p{
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
::v-deep .dialog-footer{
  .el-button--medium{
    padding: 8px 45px;
    font-size: 14px;
    border-radius: 5px;
  }
  .el-button--primary{
    background-color: #2054d0;
    border-color: #2054d0;
  }
}
.container_flex_form{
  overflow-x: hidden;
  margin: 0;
}
::v-deep .grid-container{
  margin: 0 !important;
  padding: 0 8px 8px 8px !important;
  .el-form-item--medium{
    .el-form-item__label, .el-form-item__content{
      line-height: 20px;
    }
  }
}
::v-deep .qualified_row{
  padding: 0 8px 8px 14px !important;
  .el-form-item--medium{
    .el-form-item__label, .el-form-item__content{
      line-height: 20px;
    }
  }
}
.qualified_row_button{
  float: right;
  width: 150px;
  padding: 4px 32px;
  line-height: 24px;
  color: rgb(24, 34, 62);
  position: absolute;
  top: 0;
  right: 0;
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
  </style>
  