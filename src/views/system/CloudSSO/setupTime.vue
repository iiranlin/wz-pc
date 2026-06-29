<template>
  <Dialog :title="title" :visible.sync="visible" v-if="visible" :show-close="true" :close-on-click-modal="false"
    :close-on-press-escape="false" :append-to-body="true" :destroy-on-close="true" class="dialog-route" width="600px">
    <div class="form-render-wrapper" style="margin-top: 16px">
      <el-form ref="elform" class="process-form" label-position="right" labelWidth="135px" size="medium"
        :showMessage="true" :rules="rules" :model="form">
        <el-row :span="24" :gutter="20">
          <el-col :span="24">
            <el-form-item label="定时任务执行间隔时间(分钟)" prop="setupTime">
              <el-input-number v-model="form.setupTime" :step="2"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button round type="primary" @click="handleCreate" :loading="loading" :disabled="loading">确认</el-button>
      <el-button round @click="handleCancel">取消</el-button>
    </div>
  </Dialog>
</template>

<script>
import { updStaffTypeOutList } from '@/api/system/CloudSSO.js'
export default {
  name: "setupTime",

  props: {
    clickNum: {
      type: Number,
      default: 0
    },
  },

  data() {
    return {
      title: '调整定时任务执行间隔时间',
      visible: false,
      loading: false,
      form: {
        setupTime: 0,
      },
      rules: {
        setupTime: [
          { required: true, message: '请选择', trigger: 'change' },
        ],
      },
    }
  },
  methods: {
    //初始化
    init() {
      this.form = {};
      this.visible = true;

      this.$nextTick(() => {
        this.title = "调整定时任务执行间隔时间";
      });
    },

    // 调整定时任务执行间隔时间
    handleCreate() {
      this.$confirm('确定调整定时任务执行间隔时间吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.loading = true;

        try {
          const res = await updStaffTypeOutList({

            clickNum: this.clickNum
          })
          if (res.code === 0) {
            this.$message.success('修改成功');
            this.visible = false;
          } else {
            this.$message.error(res.msg);
          }
        } catch (error) {
          console.error('修改失败', error)
          this.$message.error('修改失败');
        } finally {
          this.loading = false;
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      }).finally(() => {
        this.loading = false;
      })
    },
    //取消
    handleCancel() {
      this.visible = false;
    },
  },
}
</script>

<style lang="scss" scoped>
.filter-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 15px;
}

::v-deep .el-table__header-wrapper .el-checkbox {
  display: none;
}

.container_table_div {
  margin-bottom: 10px;
}

.el-table {
  margin: 0 auto !important;
}

::v-deep .container_table_div .el-table--border .el-table__cell:first-child .cell {
  padding-left: 20px !important;
}
</style>