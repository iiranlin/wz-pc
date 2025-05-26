<template>
  <Dialog class="flex-dialog max-height-dialog" title="上架" :visible.sync="visible" :close-on-click-modal="false"
    :close-on-press-escape="false" append-to-body width="1300px" v-loading="loading">
    <div class="wrapper_flex">
      <!-- <el-form :inline="true">
        <el-form-item label="来源单号：" class="container_flex_form_select">
          <el-select v-model="currentIndex" @change="tabSelectChange" style="width: 300px;">
            <el-option v-for="(item, index)  in rowDataList" :key="index"
              :label="`${item.inCode}${item.sourceRowNum ? '-' + item.sourceRowNum : ''}${item.qiCode ? '-' + item.qiCode : ''}`"
              :value="index" />
          </el-select>
        </el-form-item>
      </el-form> -->
      <div class="wrapper-form container_flex_form">
        <VFormRender ref="vFormRef" :form-data="formData">
          <div slot="qualified">
            <qualified-form-list v-if="visible" ref="qualifiedFormList" v-model="taskSeqMap" :dataAll="dataAll" :operateType="operateType" :qualifiedForm="dataAll.qualifiedInfo" name="合格" @issuedBtn="(data, code) => issuedBtn(data, code, 'qualifiedInfo')"></qualified-form-list>
          </div>
          <div slot="unQualified">
            <qualified-form-list v-if="visible" ref="unqualifiedFormList" v-model="taskSeqMap" :dataAll="dataAll" :operateType="operateType" :qualifiedForm="dataAll.unqualifiedInfo" name="不合格" @issuedBtn="(data, code) => issuedBtn(data, code, 'unqualifiedInfo')"></qualified-form-list>
          </div>
        </VFormRender>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <div class="dialog-footer-div" v-if="operateType !== 'view'">
        <el-button type="primary" @click="issuedBtn">确定</el-button>
        <tooltip content="保存时校验上架数量之和必须=入库数量"/>
      </div>
      <el-button @click.native="visible = false">取消</el-button>
    </div>
  </Dialog>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import qualifiedFormList from './components/qualifiedFormList'
import VFormRender from '@/components/form-render/index'
import { miniloadGroundingSingle, miniloadGroundingDetail, miniloadGroundingMultiple, miniloadGroundingSave } from '@/api/warehouseManage/inventoryMaintenance'
import { generateUUID } from '@/utils'
export default {
  name: 'LibraryUp',
  components: { VFormRender, qualifiedFormList, tooltip: () => import('@/components/tooltip')},
  props: {
  },
  data() {
    return {
      visible: false,
      loading: false,
      formData: {},
      currentIndex: 0,
      rowDataList: [],
      rowData: {},
      operateType: '',
      taskSeqMap: {},
      type: '',
      dataAll: {}
    }
  },
  methods: {
    init(type = '', rowArr = []) {
      this.operateType = type
      this.visible = true
      this.rowDataList = rowArr
      this.rowData = rowArr[0]
      this.dataAll = {}
      this.$nextTick(async () => {
        this.$refs['vFormRef'] && this.$refs['vFormRef'].resetForm()
        await this.formFillInPage()
        if(type === 'grounding'){
          this.$refs['vFormRef'].hideWidgets(['htmltext46914', 'grid117306', 'grid18847']);
        }
        this.miniloadGroundingSingle(this.rowData.id, rowArr)
      })
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('saveGrounding').then(res => {
          this.$refs['vFormRef'] && this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    miniloadGroundingSingle (detailId, rowArr) {
      let url = null, ids = null
      if(this.operateType === 'grounding'){ //批量上架
        url = miniloadGroundingMultiple
        detailId = null
        ids = rowArr.map(item => item.id)
      }else{                                //行内上架
        // if(this.rowData.bindPlace == '1'){  //行内上架已有货位
        //   url = miniloadGroundingDetail
        // }else{                              //行内上架没有货位
        //   url = miniloadGroundingSingle
        // }
        url = miniloadGroundingSingle
      }
      url({detailId, ids}).then( ({data}) => {
        this.taskSeqMap = data.taskSeqMap
        data.qualifiedInfo.placeList = data.qualifiedInfo.placeList.map((item)=> {
          return {...item, uId: generateUUID()}
        })
        data.unqualifiedInfo.placeList = data.unqualifiedInfo.placeList.map((item)=> {
          return {...item, uId: generateUUID()}
        })
        this.dataAll = data
        this.$refs['vFormRef'].setFormData(data)
        if(this.operateType != 'grounding'){
          data.qualifiedInfo.inNum == '0' && this.$refs['vFormRef'].hideWidgets(['qualified', 'htmltext50678'])
          data.unqualifiedInfo.inNum == '0' && this.$refs['vFormRef'].hideWidgets(['unQualified', 'htmltext44480'])
        }else{
          !data.qualifiedInfo.placeList.length && this.$refs['vFormRef'].hideWidgets(['qualified', 'htmltext50678'])
          !data.unqualifiedInfo.placeList.length && this.$refs['vFormRef'].hideWidgets(['unQualified', 'htmltext44480'])
        }
      })
    },
    // tabSelectChange() {

    // },
    issuedBtn (data, code, name) {
      const qualifiedFormListRef = this.$refs.qualifiedFormList
      const unqualifiedFormListRef = this.$refs.unqualifiedFormList
      const qualifiedFormList = new Promise((resolve, reject) => {
        if(!qualifiedFormListRef){
          resolve()
          return
        }
        return qualifiedFormListRef.$refs.qualifiedForm.validate(valid => {
          if (valid) {
            resolve()
          } else {
            reject()
          }
        }).catch(error => {
          reject()
        })
      })
      const unqualifiedFormList = new Promise((resolve, reject) => {
        if(!unqualifiedFormListRef){
          resolve()
          return
        }
        return unqualifiedFormListRef.$refs.qualifiedForm.validate(valid => {
          if (valid) {
            resolve()
          } else {
            reject()
          }
        })
      })
      Promise.all([qualifiedFormList, unqualifiedFormList]).then( (arrData) => {
        this.saveSelection(data, code, name)
      })
    },
    dataHandle (list, data, code) {
      if(Array.isArray(data)){
        this.dataAll.changeList = data
        // data = data.map(item => { return Object.assign({}, item, {[code]: '1'})})
        list.forEach((item) => {
          data.forEach( (val) => {
            if(val.placeCode === item.placeCode){
              item[code] = '1'
              item.groundingMode = this.operateType === 'grounding'?'2':'1'
            }
          })
        })
      }else{
        this.dataAll.changeList = [data]
        list.forEach((item) => {
          if(data.placeCode === item.placeCode){
            item[code] = '1'
            item.groundingMode = this.operateType === 'grounding'?'2':'1'
          }
        })
      }
      return list
    },
    saveSelection(data, code, name) {
      // if(this.operateType == 'up'){
      //   const inSum = this.$refs.qualifiedFormList.inSum
      //   const unInSum = this.$refs.unqualifiedFormList.inSum
      //   if(inSum > this.dataAll.qualifiedInfo.inNum){
      //     this.$modal.msgError('合格上架数量必须等于合格入库数量')
      //     return
      //   }
      //   if(unInSum > this.dataAll.unqualifiedInfo.inNum){
      //     this.$modal.msgError('不合格上架数量必须等于不合格入库数量')
      //     return
      //   }
      // }
      const qualifiedFormListRef = this.$refs.qualifiedFormList
      const unqualifiedFormListRef = this.$refs.unqualifiedFormList
      if(!this.numJudge(qualifiedFormListRef)){
        this.$modal.msgError('合格上架数量必须等于合格入库数量')
        return
      }
      if(!this.numJudge(unqualifiedFormListRef)){
        this.$modal.msgError('不合格上架数量必须等于不合格入库数量')
        return
      }
      if(code && name){
        this.$modal.confirm('是否确定?').then(() => {
          let listArr = []
          if(name === 'qualifiedInfo'){
            listArr = qualifiedFormListRef?qualifiedFormListRef.qualifiedForm.placeList:[]
          }else{
            listArr = unqualifiedFormListRef?unqualifiedFormListRef.qualifiedForm.placeList:[]
          }
          this.dataAll[name].placeList = this.dataHandle(listArr, data, code)
          this.miniloadGroundingSave(true)
        })
      }else{
        this.dataAll.qualifiedInfo.placeList = qualifiedFormListRef?qualifiedFormListRef.qualifiedForm.placeList:[]
        this.dataAll.unqualifiedInfo.placeList = unqualifiedFormListRef?unqualifiedFormListRef.qualifiedForm.placeList:[]
        this.miniloadGroundingSave(false)
      }
    },
    numJudge (zData) {
      if(!zData){
        return true
      }
      let isTrue = true
      const groupedById = zData.qualifiedForm.placeList.reduce((acc, item) => {
        const existingGroupWithId = acc.find(group => group.inDetailId === item.inDetailId);
        if (existingGroupWithId) {
          existingGroupWithId.items.push(item);
        } else {
          acc.push({ inDetailId: item.inDetailId, originalNum: item.originalNum, items: [item] });
        }
        return acc;
      }, []);
      for (const key of groupedById) {
        let zNum = 0
        key.items.forEach(val => {
          zNum += Number(val.groundingNum)
        })
        if(key.originalNum != zNum){
          isTrue = false 
        }
      }
      return isTrue
    },
    miniloadGroundingSave (visible) {
      this.loading = true
      miniloadGroundingSave(this.dataAll).then( ({message}) => {
        this.$modal.msgSuccess(message)
        this.$emit('refresh')
        // this.miniloadGroundingSingle(this.rowData.id, this.rowDataList)
      }).finally( () => {
        this.visible = visible
        this.loading = false
      })
    },
  }
}
</script>

<style scoped lang="scss">
::v-deep .el-dialog{
  border-radius: 16px;
  .el-dialog__title{
    color: #18223e;
  }
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
    margin-right: 2px !important;
  }
  .dialog-footer-div{
    display: inline-table;
    margin-right: 10px;
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

    .el-form-item {
      ::v-deep .el-input__inner {
        width: 220px;
      }
    }
  }
}
</style>