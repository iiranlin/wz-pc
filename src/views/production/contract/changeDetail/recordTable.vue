<template>
  <div>
    <virtual-scroll
      :dynamic="false"
      ref="virtualScroll"
      :data="tableData"
      :item-size="62"
      key-prop="id"
      @change="(renderData) => (virtualList = renderData)"
    >
      <el-table :data="virtualList" border style="width: 100%" max-height="400">
        <!-- 序号 -->
        <virtual-column
          label="序号"
          width="88"
          align="center"
          type="index"
          fixed
        ></virtual-column>
        <el-table-column
          prop="updateContent"
          label="变更内容"
          align="center"
          width="150px"
        >
        </el-table-column>
        <el-table-column
          prop="updateType"
          label="变更类型"
          align="center"
          width="150px"
        >
        </el-table-column>
        <el-table-column
          prop="materialName"
          label="物资名称"
          align="center"
          width="200"
        >
        </el-table-column>
        <el-table-column
          prop="specModel"
          label="规格型号"
          align="center"
          width="180"
        >
        </el-table-column>
        <el-table-column
          prop="unit"
          label="计量单位"
          align="center"
          width="120"
        >
        </el-table-column>
        <el-table-column
          prop="updateBefore"
          label="变更前(数量/单价)"
          align="center"
          min-width="180"
        >
        </el-table-column>
        <el-table-column
          prop="updateAfter"
          label="变更后(数量/单价)"
          align="center"
          min-width="180"
        >
        </el-table-column>
      </el-table>
    </virtual-scroll>
  </div>
</template>

<script>
import VirtualScroll, { VirtualColumn } from 'el-table-virtual-scroll'

export default {
  // 记录变更表格
  name: "recordTable",
  props: {
    tableData: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    id () {
      return this.$route.query.id;
    }
  },
  data () {
    return {
      virtualList: []
    }
  },
  components: {
    VirtualScroll,
    VirtualColumn
  },
  methods: {
    handleDetails (row) {
      this.$router.push({
        name: 'changeDetailContract',
        query: {
          // id 合同名称 
          id: this.id,
          recordId: row.id,
          type: 'view'
        }
      })
    },
    open (data) {
      this.tableData = data;
    },
  }
}
</script>

<style lang="scss" scoped>
.slotIcon-color-content {
  color: red;
}

.slotIcon-color {
  color: #1890ff;
}

.ml-20 {
  margin-left: 20px !important;
}

.mt-20 {
  margin-top: 20px !important;
}
</style>