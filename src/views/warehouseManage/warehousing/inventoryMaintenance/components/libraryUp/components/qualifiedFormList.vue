<template>
  <el-form class="qualified" :model="qualifiedForm" inline :rules="rules" ref="qualifiedForm" label-position="right" :disabled="operateType === 'view'">
    <el-row class="qualified_row" v-if="operateType != 'grounding'">
      <el-col :span="12">
        <el-form-item :label="`本次${name}品待入库数量：`"><span class="qualified-num">{{ qualifiedForm.inNum }}</span></el-form-item>
      </el-col>
    </el-row>
    <el-row class="qualified_row" v-if="operateType != 'grounding'">
      <el-col :span="12">
        <el-form-item :label="`本次${name}品待入库仓库：`"><span class="qualified-warehouse">{{ qualifiedForm.warehouseName}}</span></el-form-item>
      </el-col>
    </el-row>
    <button-top class="qualifiedFormList-button" ref="buttonTopRef" :buttonTopData="detailedButtonTop" @newButton="detailNewButton" :button-disable="handleTopButtonDisabled"></button-top>
    <el-table ref="elTable" border :data="qualifiedForm.placeList" max-height="400px" @selection-change="(data) => selectData = data">
      <el-table-column align="center" key="selectable" type="selection" width="50" fixed="left" />
      <el-table-column type="index" width="50" align="center" label="序号" />
      <template v-if="operateType === 'grounding'">
        <el-table-column label="物料编码" align="center" prop="matlCode" min-width="180" />
        <el-table-column label="物料名称" align="center" prop="matlName" min-width="180" />
        <el-table-column label="规格型号" align="center" prop="matlType" min-width="180" />
        <el-table-column label="待入库数量" align="center" prop="originalNum" min-width="180" />
      </template>
      <el-table-column label="任务号" align="center" prop="taskNo" min-width="180">
        <template slot="header">
          <span>任务号</span>
          <tooltip content="自动生成，规则：入库单号+序号"/>
        </template>
      </el-table-column>
      <el-table-column label="上架货位" align="center" prop="placeCode" min-width="150">
        <template slot="header">
          <span style="color: red">*</span>
          <span>上架货位</span>
          <tooltip content="系统自动推荐一个空的或存量最少的货位"/>
        </template>
        <template slot-scope="scope">
          <el-form-item :prop="'placeList.' + scope.$index + '.placeCode'" :rules="[{ required: true, message: '请选择上架货位', trigger: ['change', 'blur'] }]" v-if="scope.row.assignStatus != '1'">
            <el-input readonly v-model="scope.row.placeCode"><el-button slot="append" icon="el-icon-search" @click="placeClick(scope)"></el-button></el-input>
          </el-form-item>
          <span v-else>{{ scope.row.placeCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前存量" align="right" prop="inventoryNum" min-width="120">
        <template slot="header">
          <span>当前存量</span>
          <tooltip content="默认展示当前物料当前货位的存量之和"/>
        </template>
      </el-table-column>
      <el-table-column label="上架数量" align="right" prop="groundingNum" min-width="160">
        <template slot="header">
          <span style="color: red">*</span>
          <span>上架数量</span>
          <tooltip content="默认=待入库数量，如果超负荷、可手动添加货位、修改数量"/>
        </template>
        <template slot-scope="scope">
          <el-form-item :prop="'placeList.' + scope.$index + '.groundingNum'" :rules="rules.groundingNum" v-if="scope.row.assignStatus != '1'">
            <el-input v-model="scope.row.groundingNum" v-number-input.float="2" @change="groundingNumChange(scope)"></el-input>
          </el-form-item>
          <span v-else>{{ scope.row.groundingNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="货架机器类型" align="center" prop="frameType" min-width="120">
        <template slot="header">
          <span>货架机器类型</span>
          <tooltip content="自动关联该货位所属货架的机器类型"/>
        </template>
        <template slot-scope="{row}">
          <span>{{ row.frameType | orderTypeFilter(dict.type.frameType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工作台" align="center" prop="applyCode" min-width="150">
        <template slot="header">
          <span style="color: red">*</span>
          <span>工作台</span>
          <tooltip content="如果工作台唯一，系统自动带出；如果多个需手动选择"/>
        </template>
        <template slot-scope="scope">
          <el-form-item :prop="'placeList.' + scope.$index + '.applyCode'" :rules="[{ required: true, message: '请选择工作台', trigger: ['change', 'blur'] }]" v-if="scope.row.assignStatus != '1'">
            <el-input readonly v-model="scope.row.applyCode"><el-button slot="append" icon="el-icon-search" @click="applyClick(scope)"></el-button></el-input>
          </el-form-item>
          <span v-else>{{ scope.row.applyCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" min-width="140" v-if="operateType != 'view'">
        <template slot-scope="scope">
          <el-button type="text" :disabled="scope.row.assignStatus == '1'" @click="issuedClick(scope.row, 'assignStatus')">下发<tooltip content="下发机器人去工作台领取任务" style="padding-right: 5px;" /></el-button>
          <el-button type="text" :disabled="scope.row.returnStatus == '1' || scope.row.assignStatus == '0'" @click="issuedClick(scope.row, 'returnStatus')">回库<tooltip content="机器人接货后回库上架到货位上" style="padding-right: 5px;" /></el-button>
        </template>
      </el-table-column>
    </el-table>
    <choice-storage-location ref="ChoiceStorageLocation" :filterCondition="filterCondition" :singleMode="true" @selections="selections"></choice-storage-location>
    <ChoiceWorkbenches ref="ChoiceWorkbenches" :singleMode="true" @selections="selectionsWorkbenches"></ChoiceWorkbenches>
  </el-form>
</template>

<script>
import indexMixin from '@/views/mixins'
import { generateUUID } from '@/utils'
// import { miniloadGroundingChange } from '@/api/warehouseManage/inventoryMaintenance'
import { getInventoryNum } from "@/api/prodmgr-inv/inventory"
export default {
  mixins: [indexMixin],
  dicts:['frameType'],
  components: {
    tooltip: () => import('@/components/tooltip'),
    ChoiceStorageLocation: () => import('@/views/components/choice-storage-location'),
    ChoiceWorkbenches: () => import('@/views/components/choice-workbenches'),
  },
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    },
    qualifiedForm: {
      type: Object,
      default: () => {
        return {}
      }
    },
    rowData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    name: {
      type: String,
      default: () => {
        return '合格'
      }
    },
    operateType: {
      type: String,
      default: () => {
        return ''
      }
    },
    dataAll: {
      type: Object,
      default: () => {
        return {}
      }
    },
  },
  data() {
    return {
      detailedButtonTop: [
        { buttonName: '添加货位', buttonCode: 'addStorageLocation', options: this.operateType === 'grounding'?"{\"prompt\":\"需要勾选一条数据，添加该行货位，上架数量自动=余量\"}":"{\"prompt\":\"如果数量多，可添加货位，分货位上架。\"}"},
        { buttonName: '删除', buttonCode: 'delete', options: "{\"prompt\":\"一旦下发不可删除\"}" },
        { buttonName: '批量下发', buttonCode: 'issued', options: "{\"prompt\":\"可多选未下发任务，已下发的自动过滤掉。\"}" },
        { buttonName: '批量回库', buttonCode: 'returnWarehouse', options: "{\"prompt\":\"可多选已下发且未回库的任务，自动过滤掉已回库或未下发的任务。\"}" },
      ],
      selectData: [],
      rules: {
        groundingNum: [{ required: true, message: '请输入上架数量', trigger: ['change', 'blur'] },{
          trigger: ['change', 'blur'],
          validator: (rule, value, callback) => {
            if (Number(value) <= 0 || !value) {
              callback(new Error('上架数量不能为0或空'));
            } else {
              callback();
            }
          }
        }]
      },
      indexDB: 0,
      // inSum: 0,
      filterCondition: {
        matlCode: '',
        warehouseId: ''
      }
    }
  },
  methods: {
    handleTopButtonDisabled(button) {
      return this.selectData.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
      if(['addStorageLocation', 'delete', 'issued'].includes(button.buttonCode)) {
        return row.assignStatus == '1' 
      }
      if(['returnWarehouse'].includes(button.buttonCode)) {
        return row.returnStatus == '1' || row.assignStatus == '0'
      }
      return false
    },
    detailNewButton(buttonCode) {
      if(!this.selectData.length){
        this.$modal.msgError('请选择数据')
        return
      }
      const buttonActions = {
        addStorageLocation: () => {
          if(this.selectData.length != 1){
            this.$modal.msgError('请选择一条数据添加货位')
            return
          }
          const data = this.selectData[0]
          let index = 0, zNum = 0
          this.qualifiedForm.placeList.forEach((item, i) => {
            if(item.inDetailId === data.inDetailId){
              zNum += Number(item.groundingNum)
            }
            if(item.uId === data.uId){
              index = i
            }
          })
          data.originalNum
          if(zNum >= data.originalNum){
            this.$modal.msgError('请选择有余量的数据')
            return
          }
          const key = data.taskNo.split('-')[0]
          let maxNum = this.value[key]+1
          this.value[key] = maxNum
          const taskNo = `${data.taskNo.split('-')[0]}-${(maxNum).toString().padStart(3, '0')}`
          this.qualifiedForm.placeList.splice(index+1, 0, Object.assign({}, data, {uId: generateUUID(), placeCode: '', applyCode: '', groundingNum: data.originalNum - zNum, taskNo}))
          this.$emit('input', this.value)
          // this.qualifiedForm.placeList.forEach((item, i) => {
          //   item.taskNo = `${item.taskNo.split('-')[0]}-${(i+1).toString().padStart(3, '0')}`
          // })
          this.$refs.elTable.clearSelection()
        },
        delete: () => {
          const ids = this.selectData.map(({ uId }) => uId)
          this.qualifiedForm.placeList = this.qualifiedForm.placeList.filter(({ uId }) => !ids.includes(uId))
          this.$refs.elTable.clearSelection()
        },
        issued: () => {
          this.issuedClick(this.selectData, 'assignStatus')
        },
        returnWarehouse: () => {
          this.issuedClick(this.selectData, 'returnStatus')
        },
      };
      const action = buttonActions[buttonCode];
      action && action();
    },
    placeClick (scope) {
      this.filterCondition.matlCode = scope.row.matlCode
      this.filterCondition.warehouseId = scope.row.warehouseId
      this.indexDB = scope.$index
      const dataArr = this.qualifiedForm.placeList.filter( item => item.inDetailId === scope.row.inDetailId)
      this.$refs.ChoiceStorageLocation.init(scope.row.placeCode, dataArr)
    },
    async selections (data) {
      try {
        let {matlCode, unitId} = this.qualifiedForm.placeList[this.indexDB]
        const res = await getInventoryNum({matlCodeList: [matlCode], placeId: data.id, unitId})
        this.$set(this.qualifiedForm.placeList, this.indexDB, Object.assign({}, this.qualifiedForm.placeList[this.indexDB],
          {placeCode: data.placeCode, placeName: data.placeName, placeId: data.id, frameType: data.frameType, inventoryNum: res.data[matlCode], applyCode: '', applyName: '', applyId: ''}
        ))
      } catch (err) {
        console.error(err)
      }
    },
    groundingNumChange (scope) {
      // let num = 0
      // this.qualifiedForm.placeList.forEach(item => {
      //   num += Number(item.groundingNum)
      // })
      // this.inSum = num
    },
    applyClick (scope) {
      this.indexDB = scope.$index
      if(!scope.row.frameType){
        this.$modal.msgError('请先选择货架')
        return
      }
      this.$refs.ChoiceWorkbenches.init(scope.row.applyCode, [], {frameType: scope.row.frameType})
    },
    selectionsWorkbenches (data) {
      this.$set(this.qualifiedForm.placeList, this.indexDB, Object.assign({}, this.qualifiedForm.placeList[this.indexDB],
        {applyCode: data.applyCode, applyName: data.applyName, applyId: data.id}
      ))
    },
    issuedClick (data, code) {
      this.$emit('issuedBtn', data, code)
      // if(Array.isArray(scope)){
      //   scope = scope.filter(item => item[code] != '1')
      //   let indexArr = []
      //   let groundingNum = 0
      //   this.qualifiedForm.placeList.forEach((item, i) => {
      //     groundingNum = 0
      //     scope.forEach( val => {
      //       groundingNum += val.groundingNum
      //       if(val.taskNo === item.taskNo){
      //         indexArr.push(i)
      //       }
      //     })
      //   })
      //   let validArrs = []
      //   indexArr.forEach(($index) => {
      //     const placeListValid = [`placeList.${$index}.placeCode`, `placeList.${$index}.groundingNum`, `placeList.${$index}.applyCode`]
      //     this.$refs.qualifiedForm.validateField(placeListValid, (err) => {
      //       validArrs.push(!err)
      //     })
      //   })
      //   if(!(validArrs.every(item => item == true))){
      //     return
      //   }
      //   if(groundingNum > this.qualifiedForm.inNum){
      //     this.$modal.msgError('上架数量合计不能大于入库数量')
      //     return
      //   }
      //   scope = scope.map(item => {
      //     return Object.assign({}, item, {[code]: '1'})
      //   })
      //   this.miniloadGroundingChange(scope)
      // }else{
      //   const placeListValid = [`placeList.${scope.$index}.placeCode`, `placeList.${scope.$index}.groundingNum`, `placeList.${scope.$index}.applyCode`]
      //   let validArr = []
      //   this.$refs.qualifiedForm.validateField(placeListValid, (err) => {
      //     validArr.push(!err)
      //   })
      //   if(!(validArr.every(item => item == true))){
      //     return
      //   }
      //   if(scope.row.groundingNum > this.qualifiedForm.inNum){
      //     this.$modal.msgError('上架数量不能大于入库数量')
      //     return
      //   }
      //   this.miniloadGroundingChange([Object.assign({}, scope.row, {[code]: '1'})])
      // }
    },
    // miniloadGroundingChange (dataArr = []) {
    //   miniloadGroundingChange(dataArr).then(({data, message}) => {
    //     this.qualifiedForm.placeList = this.qualifiedForm.placeList.map(item => {
    //       const update = data.find(u => u.taskNo === item.taskNo)
    //       if (update) {
    //         return Object.assign({}, item, update)
    //       }
    //       return item; // 如果找不到匹配的更新，则返回原对象
    //     });
    //     // this.qualifiedForm.placeList.forEach( (item, i) => {
    //     //   data.forEach( (val) => {
    //     //     if(item.taskNo === val.taskNo){
    //     //       this.$set(this.qualifiedForm.placeList, i, val)
    //     //     }
    //     //   })
    //     // })
    //     this.$modal.msgSuccess(message)
    //   })
    // }
  }
}
</script>

<style scoped lang="scss">
::v-deep .qualified .label-left-align .el-form-item__label {
  text-align: right !important;
}

.qualified {
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

  .qualified-num {
    font-size: 14px;
    color: #1652db;
  }

  .qualified-warehouse {
    font-size: 14px;
    color: #18223e;
  }

  ::v-deep .qualified_row {
    padding: 0 8px 8px 14px !important;

    .el-form-item--medium {

      .el-form-item__label,
      .el-form-item__content {
        line-height: 20px;
      }
    }
  }
}
.qualifiedFormList-button{
  margin: 0 12px;
}
</style>