<template>
  <Dialog class="max-height-dialog flex-dialog" :title="title" :visible.sync="openDataScope"
    :close-on-click-modal="false" width="900px" append-to-body>
    <div class="table-wrapper">
      <el-table :data="tableData" border height="100%" v-loading="loading">
          <el-table-column label="序号" align="left" width="50" type="index" />
          <el-table-column prop="unqualifiedNum" label="不合格数量" align="left" show-overflow-tooltip></el-table-column>
          <el-table-column prop="unqualifiedReason" label="不合格原因" align="left" show-overflow-tooltip>
              <template slot-scope="{row}">
                <span>{{ row.unqualifiedReason | orderTypeFilter(dict.type.unqualifiedReason) }}</span>
              </template>
          </el-table-column>
      </el-table>
    </div>
  </Dialog>
</template>

<script>
import { qiRecordList } from '@/api/prodmgr-inv/qi';
import indexMixin from './mixins';
export default {
  dicts: ['unqualifiedReason'],
  mixins: [indexMixin],
  data() {
    return {
      loading: false,
      openDataScope: false,
      title: "查看",
      tableData: []
    };
  },
  methods: {
    init(id) {
      this.openDataScope = true
      this.qiRecordList(id)
    },
    qiRecordList (id) {
      this.loading = true
      qiRecordList(id).then(({data}) => {
        this.tableData = data || []
        this.loading = false
      })
    }
  },
};
</script>
<style scoped lang="scss">
.table-wrapper {
  flex: 1;
}
</style>