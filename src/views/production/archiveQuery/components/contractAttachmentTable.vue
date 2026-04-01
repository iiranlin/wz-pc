<template>
  <div class="contract-attachment-table">
    <div class="search-bar">
      <el-input
        v-model="queryField"
        :placeholder="searchPlaceholder"
        size="small"
        clearable
        style="width: 260px"
        @keyup.enter.native="handleSearch"
      />
      <el-button type="primary" size="small" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      <el-button size="small" icon="el-icon-refresh" @click="handleReset">重置</el-button>
    </div>
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      size="small"
      style="width: 100%"
    >
      <el-table-column
        v-for="col in mergedColumns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :min-width="col.minWidth || 120"
        :width="col.width"
        :align="col.align || 'left'"
      >
        <template slot-scope="scope">
           <slot
            v-if="col.slot"
            :name="col.slot"
            :row="scope.row"
            :column="col"
            :index="scope.$index"
          />
          <span v-else-if="col.prop === '__index'">
            {{ (pageNum - 1) * pageSize + scope.$index + 1 }}
          </span>
          <span v-else>{{ scope.row[col.prop] || '-' }}</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        background
        layout="total, prev, pager, next, sizes"
        :current-page.sync="pageNum"
        :page-size.sync="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        @current-change="loadData"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script>

const DEFAULT_COLUMNS = []

export default {
  name: 'contractAttachmentTable',
  props: {
    fetchApi:{
      type: Function,
      required: true
    },
    searchPlaceholder: {
      type: String,
      default: '请输入关键词搜索'
    },
    requestParams: {
      type: Object,
      default: () => ({})
    },
    searchField: {
      type: String,
      default: 'queryField'
    },
    columns: {
      type: Array,
      default: () => []
    },
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100]
    },
    defaultPageSize: {
      type: Number,
      default: 10
    },
    responseMap: {
      type: Object,
      default: () => ({
        list: 'records',
        total: 'total'
      })
    }
  },
  data () {
    return {
      loading: false,
      tableData: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      queryField: ''
    }
  },
  computed: {
    mergedColumns () {
      return this.columns?.length ? this.columns : DEFAULT_COLUMNS
    }
  },
  watch: {
    requestParams: {
      deep: true,
      handler () {
        this.pageNum = 1
        this.loadData()
      }
    }
  },
  created () {
    this.pageSize = this.defaultPageSize || 10
    this.loadData()
  },
  methods: {
    handleSizeChange (size) {
      this.pageSize = size
      this.pageNum = 1
      this.loadData()
    },
    getByPath (obj, path) {
      if (!path) return undefined
      return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
    },
    resolveList (data) {
      const mappedList = this.getByPath(data, this.responseMap.list)
      if (Array.isArray(mappedList)) return mappedList
      if (Array.isArray(data?.records)) return data.records
      if (Array.isArray(data?.list)) return data.list
      if (Array.isArray(data?.items)) return data.items
      return []
    },
    resolveTotal (data, list) {
      const mappedTotal = this.getByPath(data, this.responseMap.total)
      if (typeof mappedTotal === 'number') return mappedTotal
      if (typeof data?.total === 'number') return data.total
      if (typeof data?.count === 'number') return data.count
      return list.length
    },
    async loadData () {
      this.loading = true
      try {
      const params = {
          ...this.requestParams,
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          ...(this.queryField ? { [this.searchField]: this.queryField } : {})
        }
        const res = await this.fetchApi(params)
        const data = res?.data ?? res ?? {}
        const list = this.resolveList(data)
        this.tableData = list
        this.total = this.resolveTotal(data, list)
      } finally {
        this.loading = false
      }
    },
    handleSearch () {
      this.pageNum = 1
      this.$emit('search-change', this.queryField)
      this.loadData()
    },
    handleReset () {
      this.queryField = ''
      this.pageNum = 1
      this.$emit('search-change', this.queryField)
      this.loadData()
    },
    refresh () {
      this.pageNum = 1
      this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 12px;
}
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
