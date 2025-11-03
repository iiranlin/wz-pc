<template>
  <div
    class="collapse"
    :class="{
      collapse_show: isCollapse,
      collapse_hidden: !isCollapse
    }"
    :style="{ width: currentWidth + 'px' }"
  >
    <slot></slot>

    <!-- 折叠/展开按钮 -->
    <div class="toggle_btn resize-handle" @mousedown="startResize">
      <div class="show_info" v-if="isCollapse" @click="handleToggle">
        <i class="el-icon-caret-left"></i>
      </div>
      <div class="hidden_info" v-else @click="handleToggle">
        <i class="el-icon-caret-right"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Collapse",
  props: {
    collapse: {
      type: Boolean,
      default: true
    },
    defaultWidth: {
      type: Number,
      default: 240 // 初始宽度
    },
    minWidth: {
      type: Number,
      default: 200
    },
    maxWidth: {
      type: Number,
      default: 1800
    }
  },
  data() {
    return {
      isCollapse: this.collapse,
      currentWidth: this.defaultWidth,
      startX: 0,
      startWidth: 0
    };
  },
  methods: {
    handleToggle() {
      this.isCollapse = !this.isCollapse;
    },
    startResize(e) {
      this.startX = e.clientX;
      this.startWidth = this.currentWidth;
      document.addEventListener("mousemove", this.doResize);
      document.addEventListener("mouseup", this.stopResize);
      document.body.style.cursor = "col-resize";
    },
    doResize(e) {
      const delta = e.clientX - this.startX;
      let newWidth = this.startWidth + delta;
    //   if (newWidth < this.minWidth) newWidth = this.minWidth;
    //   if (newWidth > this.maxWidth) newWidth = this.maxWidth;
      this.currentWidth = newWidth;
    },
    stopResize() {
      document.removeEventListener("mousemove", this.doResize);
      document.removeEventListener("mouseup", this.stopResize);
      document.body.style.cursor = "";
    }
  }
};
</script>

<style lang="scss" scoped>
.collapse {
  position: relative;
  overflow: hidden;
  transition: width 0.2s ease;
  background-color: #fff;
  border-right: 1px solid #ebeef5;

  .toggle_btn {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    width: 20px;
    font-size: 14px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .show_info,
    .hidden_info {
      writing-mode: sideways-rl;
      width: 20px;
      height: 40px;
      background-color: #c0c4cc;
      color: #fff;
      font-size: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 8px 0 0 8px;
      cursor: pointer;
      user-select: none;
    }

    .hidden_info {
      border-radius: 0 5px 5px 0;
    }
  }

  .resize-handle {
    position: absolute;
    right: 0;
    top: 0;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    background-color: transparent;
    z-index: 99;
    transition: background-color 0.1s;
  }
  .resize-handle:hover {
    background-color: rgba(64, 158, 255, 0.2);
  }
}

.collapse_show {
  display: block;
  .toggle_btn {
    left: calc(100% - 20px);
  }
}

.collapse_hidden {
  width: 20px !important;
  .toggle_btn {
    left: 0;
  }
}

.el-icon-caret-left {
  transform: rotate(-90deg);
}
.el-icon-caret-right {
  transform: rotate(-90deg);
}
</style>
