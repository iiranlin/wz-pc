<template>
  <el-dialog
    title="请选择进入的项目"
    :visible.sync="dialogShow"
    width="650px"
    :close-on-click-modal="showCancelButton"
    :close-on-press-escape="showCancelButton"
    :show-close="showCancelButton"
    :modal-append-to-body="true"
    :append-to-body="true"
    custom-class="select-project-dialog"
    center
  >
    <div class="project-list">
      <div
        v-for="item in projects"
        :key="item.id"
        class="project-item"
        @click="enterProject(item)"
      >
        <div class="project-info">
          <div class="project-icon">
            <i class="el-icon-folder-opened"></i>
          </div>
          <div class="project-content">
            <el-tooltip 
              :content="item.unitName" 
              placement="top" 
              :open-delay="300"
              :disabled="item.unitName && item.unitName.length < 30"
            >
              <span class="project-name">{{ item.unitName }}</span>
            </el-tooltip>
          </div>
        </div>
        <el-button
          type="primary"
          size="medium"
          round
          @click.stop="enterProject(item)"
        >
          进入项目
        </el-button>
      </div>
      <div v-if="projects.length === 0" class="empty-tip">
        <i class="el-icon-folder"></i>
        <p>暂无可切换的项目</p>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { setToken } from '@/utils/auth'

export default {
  name: 'SelectProject',

  props: {
    showCancelButton: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      dialogShow: false
    }
  },

  computed: {
    projects() {
      return this.$store.getters.selectProjectUserData || []
    }
  },

  methods: {
    async enterProject(item) {
      this.dialogShow = false
      this.$store.commit('SET_SELECT_PROJECT_DIALOG', false)

      // 替换选中项目的 Token
      setToken(item.token)

      // 获取新的用户信息
      await this.$store.dispatch('GetInfo')

      // 跳转首页并刷新
      this.$router.replace({ path: '/', query: { _t: Date.now() } })
      window.location.reload()
    }
  }
}
</script>

<style lang="scss" scoped>
.project-list {
  max-height: 450px;
  overflow-y: auto;
  padding: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f7fa;
    border-radius: 3px;
  }
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
    transform: translateY(-2px);
    background: linear-gradient(135deg, #ecf5ff 0%, #ffffff 100%);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.project-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}

.project-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;

  i {
    font-size: 20px;
    color: #fff;
  }
}

.project-content {
  flex: 1;
  min-width: 0;
}

.project-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  display: block;
  line-height: 1.5;
  word-break: break-all;
}

.empty-tip {
  text-align: center;
  color: #909399;
  padding: 40px 0;

  i {
    font-size: 48px;
    color: #dcdfe6;
    margin-bottom: 12px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}
</style>

<style lang="scss">
/* 全局样式覆盖确保弹窗在最上层 */
.select-project-dialog {
  z-index: 3000 !important;
  border-radius: 12px;
  overflow: hidden;

  .el-dialog__header {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    padding: 20px;
    
    .el-dialog__title {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
    }

    .el-dialog__headerbtn {
      top: 20px;
      right: 20px;

      .el-dialog__close {
        color: #fff;
        font-size: 18px;

        &:hover {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  .el-dialog__body {
    padding: 20px 24px;
  }
}

.el-dialog__wrapper {
  &:has(.select-project-dialog) {
    z-index: 2999 !important;
  }
}
</style>
