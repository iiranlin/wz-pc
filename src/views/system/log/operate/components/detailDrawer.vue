<template>
  <el-drawer
    class="menuDrawer"
    size="500px"
    :show-close="false"
    :visible.sync="drawer"
    :before-close="handleClose">
    <div class="menuDrawer-box" v-if="!showJsonFormat">
      <el-form class="detail-form" :model="currentRow" label-position="right" label-width="100px" label-suffix=":">
        <el-form-item label="用户名">
          <span>{{ currentRow.username }}</span>
        </el-form-item>
        <el-form-item label="操作时间">
          <span>{{ parseTime(currentRow.createDate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </el-form-item>
        <el-form-item label="执行模块">
          <span>{{ currentRow.module }}</span>
        </el-form-item>
        <el-form-item label="业务">
          <span>{{ currentRow.business }}</span>
        </el-form-item>
        <el-form-item label="执行方法">
          <el-tooltip effect="dark" :content="currentRow.method" placement="top-start">
            <span>{{ currentRow.method }}</span>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="请求路径">
          <el-tooltip effect="dark" :content="currentRow.requestUrl" placement="top-start">
            <span>{{ currentRow.requestUrl }}</span>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="执行结果">
          <span v-if="currentRow.flag !== 2">{{ currentRow.flag === 1 ? '失败' : '成功' }}</span>
          <span v-else>{{ '系统异常' }}</span>
        </el-form-item>
        <el-form-item label="错误信息" v-if="currentRow.flag!==0" class="long-text">
          <el-tooltip effect="dark" :content="currentRow.errorMsg" placement="top-start">
            <span>{{ currentRow.errorMsg }}</span>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="请求参数" class="long-text">
          <el-tooltip effect="dark" :content="currentRow.params" placement="top-start">
            <span>{{ currentRow.params }}</span></el-tooltip>
        </el-form-item>
        <el-form-item label="请求结果" class="long-text">
          <el-tooltip effect="dark" :content="currentRow.result" placement="top-start">
            <span>{{ currentRow.result }}</span>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </div>
    <div class="json-box" v-else >
      <vue-json-pretty :data="JSON.parse(this.currentRow.params)" />
    </div>
    <div class="menuDrawer-footer">
      <div class="menuDrawer-footer-button" v-if="!showJsonFormat">
        <el-button @click="drawer = false">关闭</el-button>
        <el-button @click="showJsonFormat = true">参数格式化</el-button>
      </div>
      <div class="menuDrawer-footer-button" v-if="showJsonFormat">
        <el-button @click="showJsonFormat = false">返回</el-button>
        <el-button @click="handleDetail()">跳转详情</el-button>
      </div>
    </div>
    <router-operate ref="routerOperate" @routerOperateConfirm="routerOperateConfirm"></router-operate>
  </el-drawer>
</template>
<script>

import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import routerOperate from './routerOperate.vue'
import {FLOW_ROUTE} from '@/utils/constant'

export default {
  components: { VueJsonPretty,routerOperate },

  data() {
    return {
      checkbox: false,
      drawer: false,
      currentRow: {
        id: '',
        username: '',
        userId: '',
        business: "",
        createDate: "",
        message: "",
        flag: 0,
        clientIp: "",
        method: "",
        module: "",
        params: "",
        requestMethod: "",
        requestUrl: "",
        result: "",
      },
      showJsonFormat: false,
    };
  },
  methods: {
    init(row) {
      this.currentRow = row;
      this.drawer = true;
      this.showJsonFormat = false;
    },
    handleClose(done) {
      done();
    },
    handleDetail(){
      this.$refs.routerOperate.init();
    },
    routerOperateConfirm(data){
      const name = FLOW_ROUTE[data.businessType];
      // const auditArr = [
      //     {
      //         businessId: row.businessId,
      //         businessType: row.businessType,
      //         businessCode: row.businessCode,
      //         taskId: row.taskId,
      //     }
      // ];
      this.$router.push({ name, query: { type: 'view', id: data.id, name: 'operate' }});
      this.drawer = false;
    }
  }
}
</script>
<style lang="scss">
.detail-form {
  .el-form-item__content {
    width: 320px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.menuDrawer {
  .el-drawer__body {
    height: 100%;
    overflow: initial;
  }

  .menuDrawer-box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    padding: 10px 10px 70px 10px;
  }

  .menuDrawer-div {
    flex: 1;
    overflow-y: auto;

    .el-radio-group {
      width: 230px;
      float: left;
      border-right: 1px solid #f5f5f5;

      .el-radio-button {
        width: 200px;
        height: 40px;
        line-height: 40px;
        margin-left: 15px;

        .el-radio-button__inner {
          width: 100%;
          height: 100%;
          border: 0px;
          padding: 0px;
          padding-left: 5px;
          font-family: Microsoft YaHei;
          font-size: 14px;
          line-height: 40px;
          text-align: inherit;
        }

        .menuDrawer-span {
          position: absolute;
          right: 5px;
          font-size: 12px;
        }

        .menuDrawer-span-color {
          color: #c4c4c4;
        }
      }

      .is-active {
        .menuDrawer-span-color {
          color: #ffffff;
        }
      }
    }

    .menuDrawer-tree {
      width: 210px;
      float: left;
      margin-left: 20px;
    }
  }

  .el-drawer__header {
    margin-bottom: 0px;
    padding: 0px;
    font-family: Microsoft YaHei;
    color: #292b32;
    font-size: 18px;
  }

  p:nth-child(1) {
    width: 100%;
    height: 19px;
    margin-left: 20px;
    font-family: Microsoft YaHei;
    color: #292b32;
    font-size: 18px;
  }

  p:nth-child(2) {
    margin-left: 20px;
    height: 25px;
    font-family: Microsoft YaHei;
    color: #292b32;
    font-size: 14px;
  }

  .menuDrawer-footer {
    width: 100%;
    text-align: center;
    position: absolute;
    bottom: 20px;

    .menuDrawer-footer-button {
      .el-button {
        height: 40px;
        width: 30%;
        margin-left: 0px;

        &:first-child {
          margin-right: 10%;
        }
      }
    }
  }
}
.json-box {
  height: 100%;
  padding: 10px 10px 70px 10px;
}
.vjs-tree {
  height: 100%;
  padding: 10px 10px 70px 10px;
  overflow: auto;
}
</style>
