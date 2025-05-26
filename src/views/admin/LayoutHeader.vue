<template>
  <div>
    <div class="header">
      <el-menu :default-active="value" active-text-color="#409eff" class="el-menu-demo" mode="horizontal">
        <!-- <el-menu-item index="baseSetting" @click="to('baseSetting')">① 基础信息</el-menu-item> -->
        <!-- <el-menu-item index="formSetting" @click="to('formSetting')">② 审批表单</el-menu-item> -->
        <!-- <el-menu-item index="processDesign" @click="to('processDesign')"> -->
        <el-menu-item index="processDesign">
          <!-- ③  -->
          审批流程
        </el-menu-item>
        <!-- <el-menu-item index="proSetting" @click="to('proSetting')">④ 扩展设置</el-menu-item> -->
      </el-menu>
      <div class="publish">
        <el-button size="mini" @click="preview"><i class="el-icon-view"></i>预览</el-button>
        <el-button size="mini" type="primary" @click="publish"><i class="el-icon-s-promotion"></i>发布</el-button>
      </div>
      <div class="back">
        <el-button @click="exit" size="medium" icon="el-icon-arrow-left" circle></el-button>
        <span style="paddingLeft: 10px">
          <!-- <i :class="" :style="'background:' + setup.logo.background"></i> -->
          <span>{{ $route.query.modelName }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "LayoutHeader",
  props:{
    value: {
      type: String,
      default: 'baseSetup'
    }
  },
  data() {
    return {
      viewCode: false,
    };
  },
  computed: {
    setup() {
      return this.$store.state.process.design
    }
  },
  created() {
    this.check()
  },
  mounted() {
    if (document.body.offsetWidth <= 970) {
      this.$msgbox.alert("本设计器未适配中小屏幕，建议您在PC电脑端浏览器进行操作")
    }
    this.listener()
  },
  methods: {
    publish() {
      this.$emit('publish')
    },
    preview() {
      this.$emit('preview')
      //this.
      this.viewCode = true;
    },
    valid() {
      if (!this.$isNotEmpty(this.setup.group)) {
        this.$message.warning('请选择分组')
        this.$router.push('/layout/baseSetup')
        return false;
      }
      return true;
    },
    exit() {
      // this.$modal.confirm('未发布的内容将不会被保存，是否直接退出 ?', '提示', {
      //   confirmButtonText: '退出',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // }).then(() => {
        //window.location.reload()
        //this.$store.commit('clearTemplate')
        this.$router.go(-1)
      // })
    },
    to(path) {
      this.$emit('input', path)
    },
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    listener() {
      window.onunload = this.closeBefore()
      window.onbeforeunload = this.closeBefore()
      //window.on('beforeunload',this.closeBefore())
    },
    closeBefore() {
      //alert("您将要离开本页")
      return false
    },
    check() {
      if (this.$store.state.process.isEdit === null) {
        //this.$router.push("/workPanel");
      }
    }
  }
}
</script>
<style lang="scss" scoped>

::v-deep .header {

  // min-width: 980px;
  // position: relative;
  width: 100%;
  // min-width: 980px;
  position: absolute;

  .el-menu {
    top: 0;
    z-index: 999;
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .publish {
    position: absolute;
    top: 15px;
    right: 20px;
    z-index: 1000;

    i {
      margin-right: 6px;
    }

    button {
      border-radius: 15px;
      margin-right: 10px;
    }
  }

  .back {
    position: absolute;
    z-index: 1000;
    top: 10px;
    left: 20px;
    font-size: small;

    span {
      i {
        border-radius: 10px;
        padding: 7.8px;
        font-size: 20px;
        color: #ffffff;
        margin: 0 10px;
      }
    }

  }
}
</style>
