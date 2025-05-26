<template>
  <Dialog class="max-height-dialog flex-dialog" :title="title" :visible.sync="openDataScope"
    :close-on-click-modal="false" width="1200px" append-to-body v-loading="loading" >
    <div class="container_flex_form">
      <div class="container_flex_form_tree">
        <el-form :inline="true">
          <el-form-item label="来源单号：" prop="startPageNum" class="container_flex_form_select">
            <el-select v-model="menuOptionsData" @change="handleNodeClick" style="width: 300px;" value-key="id">
              <el-option v-for="item in menuOptions" :key="item.id" :label=" `${item.sourceCode}-${item.sourceRowNum}-${item.batchNo}`" :value="item" />
            </el-select>
          </el-form-item>
        </el-form>
        <VFormRender ref="vFormRef" class="container_flex_form_dialog">
          <div slot="outboundNum">
            <div class="table-wrapper">
              <el-form ref="form" :model="form">
                <el-table max-height="390px" style="margin: 0;" :data="form.list" border row-key="id" class="saleOrderOperateEltable ">
                  <el-table-column label="序号" header-align="center" align="left" type="index" width="55px" />
                  <el-table-column label="货位编码" align="left" prop="placeCode"  width="80" />
                  <el-table-column label="批次号" align="left" prop="batchNo">
                    <template slot-scope="{row}">
                      <el-button type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { id: row.batchNo, refName: 'batchNoDetail' })">{{
                          row.batchNo }}</el-button>
                    </template>
                  </el-table-column>
                  <el-table-column label="库存数量" align="left" prop="inventoryNum"  width="80"/>
                  <el-table-column label="下架数量" align="left" prop="offShelfNum" >
                    <template slot="header">
                      <span>下架数量</span>
                      <tooltip content="系统按先进先出逻辑推荐;优先推荐有批次的;优先推荐合格品;同时支持自行调整" />
                    </template>
                    <template slot-scope="scope">
                      <el-form-item :prop="'list.' + scope.$index + '.offShelfNum'"
                        :rules="[{ required: true, message: '请输入下架数量', trigger: ['blur', 'change'] }]">
                        <el-input-number v-if="!['8', '3'].includes(outSource) && !isDisabled" style="width: 100%;"
                          :max="scope.row.inventoryNum" v-model="scope.row.offShelfNum" :min="0" :precision="2"
                          controls-position="right" :disabled="row.numberabled"></el-input-number>
                        <span v-else>{{ scope.row.offShelfNum }}</span>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column label="合格状态" align="center" prop="type" width="80">
                    <template slot-scope="{row}">
                      <span>{{ row.type | orderTypeFilter(dict.type.inventoryType) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="效期状态" align="center" prop="expireStatus"  width="80">
                    <template slot-scope="{row}">
                      <span>{{ row.expireStatus | orderTypeFilter(dict.type.expireStatus) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="生产日期" align="center" prop="manufactureDate"  width="100"/>
                  <el-table-column label="失效日期" align="center" prop="expireDate"  width="100"/>
                  <el-table-column label="保质期天数" align="left" prop="qualityPeriod"  width="100"/>
                  <el-table-column label="剩余有效期天数" align="left" prop="remainingDays"  width="120"/>
                </el-table>
              </el-form>

            </div>
          </div>
        </VFormRender>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitDataScope" v-if="queryType != 'view'">确 定</el-button>
      <el-button @click="openDataScope = false">取 消</el-button>
    </div>
    <detail-dialog ref="detailDialogRef" />
  </Dialog>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import {
  warehouseOutGetSuggestPlace,
  getWarehouseOffShelfView,
  warehouseGetOffShelfPlace,
  warehouseGetOffShelfBatchNo
} from '@/api/warehouseManage/outboundMaintenance'
import selectTree from '@/components/selectTree/index.vue'
import { warehouseSaveOffShelf } from '@/api/warehouseManage/outboundMaintenance'
import VFormRender from '@/components/form-render/index'
import indexMixin from '@/views/mixins'
import tooltip from '@/components/tooltip'
export default {
  dicts: ['inventoryType', 'expireStatus'],
  mixins: [indexMixin],
  data() {
    return {
      loading: false,
      openDataScope: false,
      outSource: '',
      title: '下架操作', //普通库下架
      menuOptions: [],
      menuOptionsA: [],
      inventoryNum: 0,  /*库存总数,需要从列表中获取*/
      defaultProps: {
        children: 'children',
        label: 'sourceCode'
      },
      id: null,
      formData: {},
      openDataScopeImg: false,
      queryType: '',
      form: {
        list: []
      },
      row: [],
      BatchNoArray: [],
      currentMatlCode: '',
      dataOptions: [],
      optionsProps: {
        children: 'children',
        label: 'name',
        value: 'id',
        disabled: (node, data) => {
          return data.level == 1
        }
      },
      isDisable: false,
      menuOptionsData: null
    }
  },
  components: {
    selectTree,
    VFormRender,
    tooltip,
    DetailDialog: () => import('@/views/components/DetailDialog')
  },
  created() {
  },
  methods: {
    init(data = [], queryType = '', isDisabled = false) {
      this.isDisabled = isDisabled
      this.queryType = queryType
      this.row = data
      this.id = data.map(item => item.id) || ''  /*获取选中的id集合*/
      this.openDataScope = true
      this.$nextTick(async () => {
        await this.formFillInPage()
        this.$refs['vFormRef'].resetForm()
        this.getTreeData()
      })
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.id = data.id
      this.menuOptionsA.forEach((item) => {
        if (data.id === item.id) {
          this.form.list = item.placeList.map(item => {
            if (this.isDisabled) {   /*查看下架是禁用的*/
              item.selectabled = true  /*联动select和number输入框,默认的都不是禁用的*/
              item.numberabled = true
              item.placeabled = true
            } else {
              item.selectabled = false  /*联动select和number输入框,默认的都不是禁用的*/
              item.numberabled = false
              item.placeabled = false
            }
            return item
          })
          if(this.queryType == 'view' || this.isDisabled) {
            this.form.list = this.form.list.filter((item) => !!item.offShelfNum )
          
          }
          this.currentMatlCode = item.matlCode
          this.outSource = item.outSource
          this.$refs['vFormRef'].setFormData({
            matlCode: item.matlCode,
            matlName: item.matlName,
            outCode: item.outCode,
            warehouseName: item.warehouseName,
            outNum: item.outNum,
            outSource: item.outSource
          })
        }
      })
      this.warehouseGetOffShelfPlace(
        {
          pageSize: 1,
          pageNum: -1,
          type: 1,
          matlCode: data.matlCode,
          warehouseId: data.warehouseId
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
      const api = this.isDisabled ? getWarehouseOffShelfView : warehouseOutGetSuggestPlace
      const param = this.isDisabled ? this.id : {ids: this.id}
      api(param).then(({ success, data, message }) => {
        if (success) {
          const arr = Array.isArray(data) ? data : [data]
          this.menuOptions = arr.map((item, index) => {
            if (index < 9) {
              item.batchNo = '00' + index + 1
            } else if (index < 99) {
              item.batchNo = '0' + index + 1
            } else {
              item.batchNo = index + 1
            }
            return item
          })
          this.menuOptionsA = arr
          /*初始化默认执行一次，选中树形的第一个*/
          this.$nextTick(() => {
            this.menuOptionsData = this.menuOptionsA[0]
            this.handleNodeClick(this.row[0])
          })
          /*默认调取批次号第一次*/
          this.warehouseGetOffShelfBatchNo({
            type: 1,
            matlCode: this.menuOptionsA[0].matlCode || '',
            placeId: this.menuOptionsA[0] &&   this.menuOptionsA[0].placeList[0] ? this.menuOptionsA[0].placeList[0].placeId : '',
            pageSize: 1,
            pageNum: -1
          })
        } else {
          this.$modal.msgError(message)
        }
      })
    },
    submitDataScope() {
      if(this.isDisabled) {
        this.openDataScope = false
        return
      }
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const outNum = this.$refs.vFormRef.getFieldValue('outNum')
          const totalNum = this.form.list.reduce((a, b) => a + b.offShelfNum, 0)
          if (totalNum !== outNum) {
            this.$modal.msgError('出库数量必须等于下架数量的合计')
            return
          }
          this.loading = true
          const list = this.menuOptions.reduce((a, b) => {
            return a.concat(b.placeList)
          }, []).map(item => ({ ...item, inventoryId: item.id,id: null, batchNo: item.batchNo == '无批次' ? '' : item.batchNo }))
          warehouseSaveOffShelf(list.filter(({offShelfNum}) => !!offShelfNum)).then(({ message }) => {
            this.$modal.msgSuccess(message)
            this.openDataScope = false
            this.$emit('operateSuccess')
          }).finally(() => {
            this.loading = false
          })
        } else {
          this.$modal.msgError('表单校验失败')
          return false
        }
      })
    },
    warehouseGetOffShelfPlace(obj) {
      warehouseGetOffShelfPlace(obj).then(({ message, data, success }) => {
        if (success) {
          this.dataOptions = data
        } else {
          this.$modal.msgError(message)
        }
      })
    },
    disabledFun(node) {
      return node.level !== 5
    },
    getUnQuAreaCodeValue(obj, treeIndex, valueId, item) {  /*item表示当前列的数据*/
      if (obj.level === 5) {
        /*获取批次号*/
        item.offShelfNum = ''
        item.batchNo = ''
        item.numberabled = true
        item.placeId = valueId
        item.placeCode = obj.code
        item.placeName = obj.name
        item.selectabled = false  /*联动效果,输入框可以选择*/
        this.warehouseGetOffShelfBatchNo({
          type: 1,
          matlCode: this.currentMatlCode,
          placeId: valueId,
          pageSize: 1,
          pageNum: -1
        })
      } else {
        /*清楚输入框,清空obj就是对应的第几个*/
        item.placeId = ''
        item.placeCode = ''
        item.placeName = ''
        item.offShelfNum = ''
        item.batchNo = ''
        item.selectabled = true
        item.numberabled = true
        //this.$set(this.form.list,obj,item)
      }
      this.$refs.form.validateField('placeId')
    },
    warehouseGetOffShelfBatchNo(obj) {
      warehouseGetOffShelfBatchNo(obj).then(({ message, data, success }) => {
        if (success) {
          this.BatchNoArray = Array.isArray(data) && !!data.length ? data : [{ batchNo: '无批次', }]
        } else {
          this.$modal.msgError(message)
        }
      })
    },
    /*select修改*/
    selectChange(val, item) {
      if (val !== '') {
        const cur = this.BatchNoArray.find(BatchNoitem => BatchNoitem.batchNo === val)
        item.inventoryNum = cur.inventoryNum
        item.numberabled = false  /*联动效果,输入框可以选择*/
        item.inventoryId = cur.id
        /*获取最大数量*/
      }
    },
    /*清空选择的下拉框,数量选择框禁用*/
    clearSelect(item) {
      item.numberabled = true
      item.inventoryNum = 1
    },
    add() {
      this.form.list.push({
        batchNo: '',
        id: '',
        inventoryNum: 10,
        offShelfNum: 1,
        outDetailId: '',
        placeCode: '',
        placeId: '',
        placeName: '',
        selectabled: true,
        numberabled: true
      })
    },
    deleteItem(index) {
      this.form.list.splice(index, 1)
      this.$nextTick(() => {
        this.$refs.form.validate()
      })
    },
    validatePass(rule, value, callback, RowIndex) {
      const currentItem = this.form.list[RowIndex]
      const flag = this.form.list.some((item, index) => {
        if (RowIndex !== index && item.batchNo === currentItem.batchNo && item.placeId === currentItem.placeId) {
          return true
        } else {
          return false
        }
      })
      if (flag) {
        callback(new Error('下拉货位和批次号不能重复'));
      } else {
        callback();
      }
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

::v-deep .el-dialog{
  border-radius: 16px;
  .el-dialog__title{
    color: #18223e;
  }
}
::v-deep .el-dialog__body{
  padding: 0 16px !important;
  color: #18223e !important;
}
::v-deep .el-dialog__header{
  padding: 12px 20px;
  background: none !important;
}
::v-deep .el-form-item__label{
  padding: 0;
}
::v-deep .container_flex_form_select{
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
.container_flex_form_tree{
  display: flex;
  flex-direction: column;
  height: 100%;
  .drawer-tree{
    width: 300px;
    height: 100%;
    border-right: 1px solid #dfe4ed;
    margin-right: 20px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .container_flex_form_dialog{
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
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
