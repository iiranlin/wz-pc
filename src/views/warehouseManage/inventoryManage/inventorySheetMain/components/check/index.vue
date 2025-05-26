<template>
  <Dialog :loading="loading" :destroy-on-close="true" class="flex-dialog max-height-dialog" style="height: 900px;" :title="`盘点${{create: '', update: '修改', view: '查看'  }[queryType]}`" :visible.sync="visible" :close-on-click-modal="false" :close-on-press-escape="false" width="1300px" >
    <el-row>
      <el-col :span="4" class="left-wrapper">
        <div v-for="(item, index) in rowList" :key="index" class="row-item">
            <el-tooltip placement="top" :content="`${item.placeCode}-${item.matlCode}-${item.batchNo}`">
                <div :class="selectPos === index ? 'row-item-title-active' : 'row-item-title-normal'" @click="selectRow(index)">{{ `${item.placeCode}-${item.matlCode}-${item.batchNo}` }}</div>
            </el-tooltip>
            
        </div>
      </el-col>
      <el-col :span="20" class="right-wrapper">
        <div class="container_flex_form" style="overflow-x: hidden;">
            <VFormRender ref="vFormRef" :form-data="formData" @formChange="handleFormChange" :global-dsv="globalDsv">
                <template slot="fileList">
                    <div style="display: flex;flex-direction: column;" :key="selectPos">
                        <attachmentTable ref="attachmentTable" businessType="19" :queryType="queryType" v-model="fileListArray[selectPos]"></attachmentTable>
                    </div>
                </template>
            </VFormRender>
        </div>
      </el-col>
    </el-row>
    <template #footer>
      <el-button class="confirm" @click="saveSelection" v-if="queryType !== 'view'">确定</el-button>
      <el-button class="cancel" @click.native="cancel">取消</el-button>
    </template>
  </Dialog>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { getToken } from '@/utils/auth'
import { checkSave, detailView } from '@/api/warehouseManage/inventorySheet'
import attachmentTable from '@/views/components/attachmentTable'
import { generateUUID } from '@/utils'
import VFormRender from '@/components/form-render/index'
export default {
    name: 'Check',
    components: {attachmentTable, VFormRender},
    data(){
        return {
            visible: false,
            globalDsv: {
                VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
                VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
                Authorization: getToken(),
                businessType: '01',
            },
            rowList: [],
            formData: {},
            selectPos: 0,
            queryType: '',
            loading: false,
            fileListArray: []
        }
    },
    methods: {
        init(rowList, type) {
            this.queryType = type
            this.rowList = []
            this.fileListArray = []
            this.formData = {}
            this.visible = true;
            this.rowList = JSON.parse(JSON.stringify(rowList))
            this.formFillInPage(() => {
                this.$refs['vFormRef'].setReadMode(this.queryType === 'view')
                if(this.queryType === 'view' || this.queryType === 'update') {
                    let ids = this.rowList.map(row => row.id)
                    this.getCheckDetail(ids, () => {
                        this.selectRow(0)
                    })
                } else {
                    this.selectRow(0)
                }
                
            })
        },
    
        handleFormChange(fieldName, newValue, oldValue, formModel){
            this.formData[fieldName] = formModel[fieldName]
            if(fieldName === 'checkNum') {
                let diffNum = Number(formModel.checkNum) - Number(formModel.inventoryNum)
                this.$refs['vFormRef'].setFieldValue("diffNum", Math.abs(diffNum).toFixed(2));
                this.$refs['vFormRef'].setFieldValue("checkResult", diffNum > 0 ? '1' : diffNum === 0 ? '3' : '2');
                this.formData.checkNum = formModel.checkNum
                this.formData.diffNum = Math.abs(diffNum).toFixed(2)
                this.formData.checkResult = diffNum > 0 ? '1' : diffNum === 0 ? '3' : '2'
            } 
        },
        selectRow(index){
            if(Object.keys(this.formData).length !== 0) {
                this.rowList[this.selectPos] = this.formData
            }
            this.selectPos = index
            this.formData = this.rowList[this.selectPos]
            if(this.queryType === 'create') {
                // 盘点单默认数量为库存数量
                this.formData.checkNum = this.formData.inventoryNum
            }
            this.$refs['vFormRef'].setReadMode(this.queryType === 'view')
            this.formData.comments = this.formData.comments ? this.formData.comments : ''
            this.$nextTick(() => {
                // 盲盘点不显示库存数量
                if(this.formData.checkType == '1') {
                    this.$refs['vFormRef'].showWidgets(['inventoryNum'])
                } else {
                    this.$refs['vFormRef'].hideWidgets(['inventoryNum']);
                }
               const fileList =  !! this.formData.fileList && !! this.formData.fileList.length ?  this.formData.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
                this.$set( this.fileListArray, index, fileList)
                this.$refs['vFormRef'].setFormData(this.formData)
            })
        },
        getCheckDetail(id, callback){
            detailView({ids: id}).then(({success, data, message}) => {
                if(success) {
                    this.rowList = data
                    callback && callback()
                } else {
                    this.$message.error(message)
                }
            })
        },
        formFillInPage(callback) {
            return new Promise((resolve) => {
                formFillInPage('checkEnter').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    callback && callback()
                    resolve(true);
                })
            })
        },
        cancel(){
            this.visible = false
        },
        saveSelection(){
            for(let i = 0; i < this.rowList.length; i++){
                let item = this.rowList[i]
                if(!item.checkNum || Number(item.checkNum) < 0) {
                    this.$message.warning(`单据【${item.placeCode}-${item.matlCode}-${item.batchNo}】盘点数量必须大于或等于0`)
                    return
                }
                item.fileList = this.fileListArray[i]
            }
            this.loading = false
            checkSave(this.rowList).then((success, data, message) => {
                if(success) {
                    this.$message.success('保存成功')
                    this.$emit('getList')
                    this.visible = false
                } else {
                    this.$message.error(message)
                }
            }).finally(() => {
                this.loading = false
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.left-wrapper {
    border: 1px solid #DCDFE6;
    height: 700px;
    overflow-y: auto;
    padding: 5px;
    border-radius: 5px;
  .row-item {
    height: 35px;
    line-height: 35px;
    .row-item-title-active {
        color: #409EFF;
        cursor: pointer;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        height: 100%;
        &:hover {
            text-decoration: underline;
        }
    }
    .row-item-title-normal {
        color: #606266;
        cursor: pointer;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        height: 100%;
        &:hover {
            text-decoration: underline;
        }
    }
}
}
.right-wrapper {
    height: 700px;
    overflow-y: auto;
    padding: 5px 5px 150px 5px;
    border-radius: 5px;
    border: 1px solid #DCDFE6;
}
.confirm {
  height: 34px;
  border-radius: 50px;
  background: #227aff;
  color: #ffffff;
  min-width: 100px
}

.cancel {
  height: 34px;
  border-radius: 50px;
  min-width: 100px;
  margin-left: 10px;
}

</style>