<template>
  <Dialog class="max-height-dialog flex-dialog" :title="title" :visible.sync="openDataScope"
    :close-on-click-modal="false" width="1200px" append-to-body v-loading="loading">
    <div class="container_flex_form">
      <div class="container_flex_form_tree">
        <VFormRender ref="vFormRef" class="container_flex_form_dialog">
          <template slot="outboundNum">
            <el-form ref="elForm" :model="formData" :disabled="queryType === 'view'">
              <button-top v-if="queryType != 'view'" class="qualifiedFormList-button" ref="buttonTopRef" :buttonTopData="detailedButtonTop" @newButton="detailNewButton"
              :button-disable="handleTopButtonDisabled"></button-top>
              <el-table max-height="390px" style="margin: 0;" :data="formData.saveList" border row-key="id" @selection-change="(data) => selectData = data" class="saleOrderOperateEltable">
                <el-table-column align="center" key="selectable" type="selection" width="50" fixed="left" />
                <el-table-column label="序号" header-align="center" align="left" type="index" width="55px" />
                <el-table-column label="货位编码" align="left" prop="placeCode" min-width="160" />
                <el-table-column label="批次号" align="left" prop="batchNo" min-width="160">
                  <template slot-scope="{row}">
                    <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, { id: row.batchNo, refName: 'batchNoDetail' })">{{ row.batchNo }}</el-button>
                  </template>
                </el-table-column>
                <el-table-column label="库存数量" align="left" prop="inventoryNum" min-width="80" />
                <el-table-column label="下架数量" align="left" prop="offShelfNum" min-width="160">
                  <template slot="header">
                    <span>下架数量</span>
                    <!-- <tooltip content="系统按先进先出逻辑推荐;优先推荐有批次的;优先推荐合格品;同时支持自行调整" /> -->
                  </template>
                  <template slot-scope="scope">
                    <el-form-item :prop="'saveList.' + scope.$index + '.offShelfNum'" v-if="scope.row.assignStatus != '1'"
                      :rules="[{ required: true, message: '请输入下架数量', trigger: ['blur', 'change'] }]">
                      <el-input-number v-if="!['8', '3'].includes(outSource)" style="width: 100%;"
                        :max="scope.row.inventoryNum > outNum?outNum:scope.row.inventoryNum" v-model="scope.row.offShelfNum" :min="1" :precision="2"
                        controls-position="right"></el-input-number>
                      <span v-else>{{ scope.row.offShelfNum }}</span>
                    </el-form-item>
                    <span v-else>{{ scope.row.offShelfNum }}</span>
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
                    <el-form-item :prop="'saveList.' + scope.$index + '.applyCode'" :rules="[{ required: true, message: '请选择工作台', trigger: ['change', 'blur'] }]" v-if="scope.row.assignStatus != '1'">
                      <el-input readonly v-model="scope.row.applyCode"><el-button slot="append" icon="el-icon-search" @click="applyClick(scope)"></el-button></el-input>
                    </el-form-item>
                    <span v-else>{{ scope.row.applyCode }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="合格状态" align="center" prop="type" min-width="80">
                  <template slot-scope="{row}">
                    <span>{{ row.type | orderTypeFilter(dict.type.inventoryType) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="效期状态" align="center" prop="expireStatus" min-width="80">
                  <template slot-scope="{row}">
                    <span>{{ row.expireStatus | orderTypeFilter(dict.type.expireStatus) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="生产日期" align="center" prop="manufactureDate" min-width="100" />
                <el-table-column label="失效日期" align="center" prop="expireDate" min-width="100" />
                <el-table-column label="保质期天数" align="left" prop="qualityPeriod" min-width="100" />
                <el-table-column label="剩余有效期天数" align="left" prop="remainingDays" min-width="120" />
                <el-table-column label="操作" align="center" fixed="right" min-width="140" v-if="queryType != 'view'">
                  <template slot-scope="scope">
                    <el-button type="text" :disabled="scope.row.assignStatus == '1'" @click="issuedClick(scope.row, 'assignStatus')">下发<tooltip content="给机器人下发出库任务" style="padding-right: 5px;" /></el-button>
                    <el-button type="text" :disabled="scope.row.returnStatus == '1' || scope.row.assignStatus == '0'" @click="issuedClick(scope.row, 'returnStatus')">出库<tooltip content="机器人做出库" style="padding-right: 5px;" /></el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form>
          </template>
        </VFormRender>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitDataScope" v-if="queryType != 'view'">确 定</el-button>
      <el-button @click="openDataScope = false">取 消</el-button>
    </div>
    <ChoiceWorkbenches ref="ChoiceWorkbenches" :singleMode="true" @selections="selectionsWorkbenches"></ChoiceWorkbenches>
    <detail-dialog ref="detailDialogRef" />
  </Dialog>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { outMiniloadGetSuggestPlace, outMiniloadGroundingSave } from '@/api/warehouseManage/outboundMaintenance'
import VFormRender from '@/components/form-render/index'
import indexMixin from '@/views/mixins'
import tooltip from '@/components/tooltip'
export default {
  dicts: ['inventoryType', 'expireStatus', 'frameType'],
  mixins: [indexMixin],
  components: {
    VFormRender,
    tooltip,
    ChoiceWorkbenches: () => import('@/views/components/choice-workbenches'),
    DetailDialog: () => import('@/views/components/DetailDialog')
  },
  data() {
    return {
      loading: false,
      title: '下架操作',  //立体库下架
      openDataScope: false,
      detailedButtonTop: [
        { buttonName: '批量下发', buttonCode: 'issued', options: "{\"prompt\":\"可多选未下发任务，已下发的自动过滤掉。\"}" },
        { buttonName: '批量出库', buttonCode: 'returnWarehouse', options: "{\"prompt\":\"可多选已下发且未出库的任务，自动过滤掉已出库或未下发的任务。\"}" },
      ],
      queryType: '',
      rowArr: [],
      formData: {
        saveList: [],
        changeList: []
      },
      outSource: '',
      outNum: 0,
      selectData: [],
      indexDB: 0
    }
  },
  created() {
  },
  methods: {
    handleTopButtonDisabled(button) {
      return this.selectData.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
      if(['issued'].includes(button.buttonCode)) {
        return row.assignStatus == '1' 
      }
      if(['returnWarehouse'].includes(button.buttonCode)) {
        return row.returnStatus == '1' || row.assignStatus == '0'
      }
      return false
    },
    init(queryType = '', data = []) {
      this.openDataScope = true
      this.queryType = queryType
      this.rowArr = data
      this.$nextTick(async () => {
        await this.formFillInPage()
        this.$refs['vFormRef'].resetForm()
        this.getTreeData()
      })
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('offShelfDialog').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    getTreeData() {
      const id = this.rowArr[0].id
      outMiniloadGetSuggestPlace({ id }).then(({ success, data, message }) => {
        if (success) {
          const rows = data
          this.$refs['vFormRef'].setFormData({
            matlCode: rows.matlCode,
            matlName: rows.matlName,
            outCode: rows.outCode,
            warehouseName: rows.warehouseName,
            outNum: rows.outNum,
            outSource: rows.outSource
          })
          this.outSource = rows.outSource
          this.outNum = rows.outNum
          this.formData.saveList = rows.placeList
        } else {
          this.$modal.msgError(message)
        }
      })
    },
    detailNewButton(buttonCode) {
      if(!this.selectData.length){
        this.$modal.msgError('请选择数据')
        return
      }
      const buttonActions = {
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
    applyClick (scope) {
      this.indexDB = scope.$index
      this.$refs.ChoiceWorkbenches.init(scope.row.applyCode, [], {frameType: scope.row.frameType})
    },
    selectionsWorkbenches (data) {
      this.$set(this.formData.saveList, this.indexDB, Object.assign({}, this.formData.saveList[this.indexDB],
        {applyCode: data.applyCode, applyName: data.applyName, applyId: data.id}
      ))
    },
    issuedClick (data, code) {
      this.submitDataScope(data, code)
    },
    dataHandle (list, data, code) {
      if(Array.isArray(data)){
        this.formData.changeList = data
        list.forEach((item) => {
          data.forEach( (val) => {
            if(val.outDetailId === item.outDetailId){
              item[code] = '1'
            }
          })
        })
      }else{
        this.formData.changeList = [data]
        list.forEach((item) => {
          if(data.outDetailId === item.outDetailId){
            item[code] = '1'
          }
        })
      }
      return list
    },
    submitDataScope(data, code) {
      this.$refs.elForm.validate(valid => {
        if (valid) {
          let zNum = 0
          this.formData.saveList.map(item => { zNum += Number(item.offShelfNum) })
          if(zNum != this.outNum){
            this.$modal.msgError('出库数量必须等于下架数量之和')
            return
          }
          if(code){
            this.$modal.confirm('是否确定?').then(() => {
              this.formData.saveList = this.dataHandle(this.formData.saveList, data, code)
              this.outMiniloadGroundingSave(true)
            })
          }else{
            this.outMiniloadGroundingSave(false)
          }
        }
      })
    },
    outMiniloadGroundingSave (openDataScope) {
      this.loading = true
      outMiniloadGroundingSave(this.formData).then( ({message}) => {
        this.$modal.msgSuccess(message)
        this.$emit('operateSuccess')
      }).finally( () => {
        this.openDataScope = openDataScope
        this.loading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.table-wrapper {
  flex: 1;
}

.head-container {
  min-height: 350px;
  overflow: auto;
  border-right: 1px solid #e5e5e5;
}

.form {
  margin-top: 20px;
}

.flex_center {
  display: flex;
  align-items: center;
  margin-bottom: 25px;

  .icon {
    .plus {
      font-size: 24px;
      color: #1890ff;
      cursor: pointer;
    }
  }

  .left {
    text-align: left;
  }

  .right {
    text-align: right;
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
  color: #18223e !important;
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

::v-deep .grid-container {
  margin: 0 !important;
  padding: 0 8px 8px 8px !important;

  .el-form-item--medium {

    .el-form-item__label,
    .el-form-item__content {
      line-height: 20px;
    }
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
</style>
