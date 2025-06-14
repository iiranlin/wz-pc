<template>
  <div :class="{ 'hidden': hidden }" class="pagination-container">
    <el-pagination :background="background" :current-page.sync="currentPage" :page-size.sync="pageSize" :layout="layout"
      :page-sizes="pageSizes" :pager-count="pagerCount" :total="total" v-bind="$attrs" @size-change="handleSizeChange"
      @current-change="handleCurrentChange">
      <span key="1" class="pagination-text">共<span class="blue-text">{{ total }}</span>条</span>
      <el-select size="mini" id="inputSubjectId" filterable :allow-create="true" :filter-method="inputSubjectLimit()"
        v-model="pageSize" @change="limitChange">
        <el-option v-for="item in pageSizesObj" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </el-pagination>
  </div>
</template>

<script>
import { scrollTo } from '../utils/scroll-to'
import { eventBus } from '../store'
export default {
  name: 'Pagination',
  props: {
    total: {
      required: true,
      type: Number
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number | String,
      default: 30
    },
    pageSizes: {
      type: Array,
      default() {
        return [10, 30, 50, 100, 300, 500]
      }
    },
    // 移动端页码按钮的数量端默认值5
    pagerCount: {
      type: Number,
      default: document.body.clientWidth < 992 ? 5 : 7
    },
    layout: {
      type: String,
      default: 'slot, prev, pager, next, jumper'
    },
    background: {
      type: Boolean,
      default: true
    },
    autoScroll: {
      type: Boolean,
      default: true
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      pageSizesObj: [
        { value: 10, label: '10条/页' },
        { value: 30, label: '30条/页' },
        { value: 50, label: '50条/页' },
        { value: 100, label: '100条/页' },
        { value: 300, label: '300条/页' },
        { value: 500, label: '500条/页' },
      ]
    }
  },
  created() {
    eventBus.$on('formDataChange', this.handleFormDataChange)
    this._currentPage = undefined

  },
  computed: {
    currentPage: {
      get() {
        return this.page
      },
      set(val) {
        if (this._currentPage) {
          val = this._currentPage
        }
        this.$emit('update:page', val)
      }
    },
    pageSize: {
      get() {
        return Number(this.limit)
      },
      set(val) {
        const num = Number(val);
        if (num) {
          this.$emit('update:limit', num)
        } else {
          this.$modal.msgWarning('请输入数字')
        }
      }
    }
  },
  watch: {
    page: {
      handler(newVal, oldVal) {
        this.debounceLoad(newVal,  this.pageSize)
      },
      immediate: true
    },
    limit: {
      handler(newVal, oldVal) {
        this.debounceLoad(this.currentPage, Number(newVal))
      },
      immediate: true
    }
  },
  methods: {
    debounceLoad(pageNum, pageSize) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.loadList(pageNum, pageSize);
      }, 300);
    },
    loadList(pageNum, pageSize) {
      this.$emit('pagination', { page: pageNum, limit: pageSize })
    },
    handleFormDataChange(page = undefined) {
      this._currentPage = page
    },
    handleSizeChange(val) {
      localStorage.setItem('pagination_' + this.$route.meta.id, val);
      this.$emit('pagination', { page: this.currentPage, limit: val })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    handleCurrentChange(val) {
      this._currentPage = undefined
      this.$emit('update:page', val)
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    limitChange() {
      this.$emit('pagination', { page: this.currentPage, limit: this.pageSize })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    inputSubjectLimit() {
      var inputSubjectId = document.querySelector('#inputSubjectId')
      if (inputSubjectId) {
        inputSubjectId.setAttribute('maxLength', 10)
      }
    }
  },
  destroyed() {
    eventBus.$off()
  } 
}
</script>
<style lang="scss" scoped>
.pagination-text {
  margin-right: 10px;

  .blue-text {
    color: rgba(61, 138, 255, 1);
    text-align: center;
    min-width: 20px !important;
  }
}

::v-deep #inputSubjectId {
  font-size: 13px;
}
</style>