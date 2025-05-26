<template>
  <Dialog class="flex-dialog max-height-dialog" title="选择货位" :visible.sync="visible" :close-on-click-modal="false"
    :close-on-press-escape="false" tabindex='1' width="1300px" append-to-body>
    <div slot="title" class="el-dialog__title">
      选择货位
      <div class="flex-dialog-button">
        <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
        <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
      </div>
    </div>
    <el-form ref="searchInfo" :model="formData" label-suffix="：" label-width="105px">
      <el-row>
        <el-col :span="24">
          <el-row>
            <el-col :span="6">
              <el-form-item label="货位编码" prop="placeCode" class="border-radius50">
                <el-input v-model="formData.placeCode" placeholder="请输入货位编码" @keyup.enter.native="searchData"
                  clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="货位名称" prop="placeName" class="border-radius50">
                <el-input v-model="formData.placeName" placeholder="请输入货位名称" @keyup.enter.native="searchData"
                  clearable />
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-form>

    <div class="table-wrapper" v-if="visible">
      <el-table ref="contractCommonTable" :data="dataList" border height="100%"
        @row-dblclick="dbClick" @selection-change="handleSelectChange" v-loading="loading" row-key="id"
        @row-click="rowClick" @sort-change="sortableColumnChange">
        <el-table-column align="center" width="50" v-if="singleMode" fixed="left">
          <template v-slot="{ row }">
            <el-radio v-model="selectDataRow" :label="row.placeCode" class="table-radio"></el-radio>
          </template>
        </el-table-column>
        <el-table-column :selectable="isSelectable" :reserve-selection="true" type="selection" align="center" width="50"
          fixed="left" v-else></el-table-column>
        <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
        <el-table-column prop="placeCode" label="货位编码" align="center" show-overflow-tooltip min-width="200">
          <template slot-scope="{row}">
            <el-button type="text" size="small" @click="$refs.operateRef.init('view', {id: row.id});">{{ row.placeCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="placeName" label="货位名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="isOccupy" label="使用状态" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span :class="'span_is_occupy'+row.isOccupy">{{ row.isOccupy | orderTypeFilter(dict.type.isOccupy) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="placeType" label="货位类型" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.placeType | orderTypeFilter(dict.type.placeType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="frameCode" label="货架编码"  align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small" @click="$refs.frameOperateRef.init('view', {id: row.frameId});">{{ row.frameCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="frameType" label="货架机器类型"  align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.frameType | orderTypeFilter(dict.type.frameType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="passageCode" label="通道编码" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small" @click="$refs.passagewayOperateRef.init('view', {id: row.passageId});">{{ row.passageCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="storageCode" label="储区编码" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small" @click="$refs.storageAreaOperateRef.init('view', {id: row.storageId});">{{ row.storageCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="storageType" label="储区类型" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.storageType | orderTypeFilter(dict.type.storageType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="warehouseCode" label="仓库编码" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small" @click="$refs.warehouseOperateRef.init('view', 'warehouseOperate', row.warehouseId)">{{ row.warehouseCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="warehouseName" label="仓库名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="warehouseType" label="仓库类型" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.warehouseType | orderTypeFilter(dict.type.warehouseType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="areaName" label="地区" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="status" label="启用状态" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.status | orderTypeFilter(dict.type.enableStauts) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createDate" label="创建时间" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ parseTime(row.createDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateDate" label="修改时间" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ parseTime(row.updateDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="getList" />
    <template #footer>
      <el-button plain round type="primary" @click="saveSelection" v-preventReClick>保存</el-button>
      <el-button plain round @click.native="visible = false">取消</el-button>
    </template>
    <detail-dialog ref="detailDialogRef" />
    <operate ref="operateRef"></operate>
    <frameOperate ref="frameOperateRef"></frameOperate>
    <passagewayOperate ref="passagewayOperateRef"></passagewayOperate>
    <storageAreaOperate ref="storageAreaOperateRef"></storageAreaOperate>
    <warehouseOperate ref="warehouseOperateRef"></warehouseOperate>
  </Dialog>
</template>

<script>

import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'
import { basePlaceMiniloadPlaceList } from '@/api/warehouseManage/basePlace'
export default {
  dicts:['frameType', 'isOccupy', 'placeType', 'storageType', 'warehouseType', 'enableStauts'],
  name: 'ChoiceStorageLocation',
  components: {
    DetailDialog: () => import('@/views/components/DetailDialog'),
    operate: () => import('@/views/warehouseManage/warehousFundamentals/goodsPosition/components/operate'),
    frameOperate: () => import('@/views/warehouseManage/warehousFundamentals/frame/components/operate'),
    passagewayOperate: () => import('@/views/warehouseManage/warehousFundamentals/passageway/components/operate'),
    storageAreaOperate: () => import('@/views/warehouseManage/warehousFundamentals/storageArea/components/operate'),
    warehouseOperate: () => import('@/views/warehouseManage/warehousFundamentals/warehouse/warehouseOperate')
  },
  mixins: [indexMixin, inMixin],
  props: {
    filterCondition: {
      type: Object,
      default: function () {
        return {}
      }
    },
    singleMode: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      visible: false,
      formData: {
        placeCode: '',
        placeName: '',
      },
      loading: false,
      tableData: [],
      selectDataRow: null,
      total: 0,
      selectData: [],
      selected: [],
    }
  },
  methods: {
    handleSelectChange(arr) {
      this.selectData = arr
    },
    // changeDisabled({ row }) {
    //   const idList = this.selected.map((item) => item.placeCode)
    //   return idList.includes(row.placeCode) ? {
    //     opacity: "0.5",
    //     pointerEvents: "none"
    //   } : {}
    // },
    isSelectable(row) {
      const idList = this.selected.map((item) => item.placeCode)
      return !idList.includes(row.placeCode)
    },
    init(placeCode = null, selected = []) {
      this.visible = true
      this.selectDataRow = null
      if (this.singleMode) {
        this.selectDataRow = placeCode
      }
      this.selected = selected
      this.$nextTick( () => {
        this.$refs.searchInfo.resetFields()
        this.tableData = []
        this.getList()
      })
    },
    searchData() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    // 保存选择
    saveSelection() {
      if (this.singleMode) {
        if (!this.selectDataRow) {
          this.$message.warning('请选择货位')
          return
        }
        if(this.singleMode){
          const codeList = this.selected.map((item) => item.placeCode)
          if(codeList.includes(this.selectDataRow)){
            this.$message.warning('已选择该货位，不允许重复选择')
            return 
          }
        }
        const data = this.tableData.find(item => item.placeCode === this.selectDataRow)
        this.$emit('selections', data)
      } else {
        if (!this.selectData.length) {
          this.$message.warning('请选择货位')
          return
        }
        this.$emit('selections', this.selectData)
      }

      this.visible = false
    },
    dbClick(row) {
      if (!this.singleMode) {
        const flag = this.selected.some(item => item.placeCode === row.placeCode)
        if (flag) {
          this.$message.warning('此条数据已经添加')
          return
        }
      }else{
        const codeList = this.selected.map((item) => item.placeCode)
        if(codeList.includes(this.selectDataRow)){
          this.$message.warning('已选择该货位，不允许重复选择')
          return 
        }
      }
      this.$emit('selections', this.singleMode ? row : [row])
      this.visible = false
    },
    rowClick(row) {
      if (this.singleMode) {
        // 单选选中行
        this.selectDataRow = row.placeCode
      } else {
        const idList = this.selected.map((item) => item.placeCode)
        if (idList.includes(row.placeCode)) {
          return
        }
        // 多选选中行
        // 根据id判断当前点击的是否被选中
        const selected = this.selectData.some(item => item.placeCode === row.placeCode)
        if (!selected) {
          // 选择
          this.selectData.push(row)
          this.$refs.contractCommonTable.toggleRowSelection(row, true)
        } else {
          // 取消
          var finalArr = this.selectData.filter((item) => {
            return item.placeCode !== row.placeCode
          })
          // 取消后剩余选中的
          this.selectData = finalArr
          this.$refs.contractCommonTable.toggleRowSelection(row, false)
        }
      }
    },
    getList() {
      const param = Object.assign({}, this.formData, this.listQuery, this.filterCondition)
      this.loading = true
      basePlaceMiniloadPlaceList(param).then(({ data }) => {
        this.tableData = data?.list || []
        this.dataList = data?.list || []
        this.total = data?.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    resetSearch() {
      this.$refs.searchInfo.resetFields()
      this.getList()
    },
    emitAblFilter() {
      this.getList()
    }
  }
}
</script>

<style scoped lang="scss">
.table-wrapper {
  flex: 1;
}
.span_is_occupy0{
  display: inline-block;
  width: 69px;
  background: #dafe9e;
  border: 1px solid #95f204;
  color: #4B7902;
}
.span_is_occupy1{
  display: inline-block;
  width: 69px;
  background: rgba(251, 226, 189, 1);
  border: 1px solid rgba(250, 205, 145, 1);
  color: #A30014;
}
</style>
