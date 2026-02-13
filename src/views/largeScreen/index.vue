<template>
  <dv-full-screen-container class="large-screen">
    <dv-loading v-if="loading">加载中...</dv-loading>
    <article
      v-else
      class="large-view"
    >
      <header>
        <div class="nav-left">
          <p class="time-running">{{ time }}</p>
          <div class="nav-menu">{{ menuNm1 }}</div>
        </div>
        <div class="nav-mid">{{ title }}</div>
        <div class="nav-right">
          <div class="nav-menu">{{ menuNm2 }}</div>
          <p class="user-tools"></p>
        </div>
      </header>
      <div class="large-form">
        <el-date-picker
          v-model="queryDate"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :picker-options="pickerOptions"
          size="mini"
        >
        </el-date-picker>
        <el-select
          v-model="deptId"
          placeholder="请选择"
          size="mini"
        >
          <el-option
            v-for="item in deptOps"
            :key="item.id"
            :label="item.deptName"
            :value="item.id"
          >
          </el-option>
        </el-select>
        <el-select
          v-model="projectId"
          placeholder="请选择"
          size="mini"
        >
          <el-option
            v-for="item in projectOps"
            :key="item.id"
            :label="item.projectName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>

      <div class="large-grid">
        <div class="item item-1 "></div>
        <dv-border-box-8 class="item item-2"></dv-border-box-8>
        <div class="item item-3"></div>
        <div class="item item-4"></div>
        <div class="item item-5"></div>
        <div class="item item-6"></div>
        <div class="item item-7"></div>
        <div class="item item-8"></div>
      </div>
    </article>
  </dv-full-screen-container>
</template>

<script>
import './index.js'
import * as Api from '@/api/largeScreen/aSupplyMaterials'
export default {
  name: 'largeScreen',
  data () {
    return {
      loading: false,
      title: '铁路建设物资管理系统',
      menuNm1: '甲供物资',
      menuNm2: '自购物资',
      time: '2025/01/05  15:35:00',
      queryDate: '',
      deptId: '',
      projectId: '',
      deptOps: [],
      projectOps: [],
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick (picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick (picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick (picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
    }
  },
  create () {
    this.init()
  },
  methods: {
    async init () {
      const { data: deptOps } = await Api.newListByDeptCode()
      this.projectOps = deptOps
      console.log("deptOps ==> ", deptOps);
      const { data: projectOps } = await Api.getProjectByUser()
      this.projectOps = projectOps
      console.log("projectOps ==> ", projectOps);
    }
  }
}
</script>

<style lang="scss" scoped>
.large-screen {
  width: 100%;
  height: 100vh;
  background-color: rgba(229, 229, 229, 1);
  background-image: url("../../assets/large/bg.png");
  background-size: cover;
  background-position: center;
  position: relative;
  color: #fff;
  font-family: PingFangSC-bold;
  &::after {
    position: absolute;
    top: 0;
    left: 0;
    content: "";
    width: 100%;
    height: 100%;
    background-image: url("../../assets/large/v2_spjxax.png");
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    z-index: -1;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    height: 70px;
    & > div {
      width: 33.33%;
    }
  }
  .large-view {
    width: 100%;
    height: 100vh;
    padding: 0 40px;
  }
  .nav-mid {
    font-size: 36px;
    text-align: center;
  }
  .nav-left,
  .nav-right {
    display: flex;
    align-items: center;
  }
  .nav-right {
    justify-content: flex-end;
  }
  .nav-menu {
    background-image: url("../../assets/large/v2_spjxzk.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    width: 113px;
    height: 37px;
    line-height: 37px;
    text-align: center;
    cursor: pointer;
  }
  .large-form {
    height: 40px;
    display: flex;
    align-items: center;
  }
  .el-select {
    margin-left: 8px;
  }
}
.el-date-editor,
.el-select {
  background: #0310234b;
}
.el-date-editor {
  width: 234px !important;
}
.el-select {
  width: 160px;
}
::v-deep .el-range-input,
::v-deep .el-input__inner {
  background: transparent;
  color: #75f9fd;
}
.el-date-editor,
::v-deep .el-input__inner {
  border: 1px solid rgba(187, 187, 187, 1);
  border-radius: 6px;
}
.large-grid {
  display: grid;
  height: calc(100vh - 120px);
  grid-template-columns: 25% 47.8% 25%;
  gap: 20px;
}

.item-2 {
  grid-column-start: 2;
  grid-row-start: 1;
  grid-row-end: 3;
}
.item-1,
.item-3,
.item-4,
.item-5,
.item-6,
.item-8 {
  background-image: url("../../assets/large/v2_si3d0n.png");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}
.item-7 {
  background-image: url("../../assets/large/v2_shxttf.png");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}
</style>