<template>
  <div class="app-container container_flex">

    <table-index ref="tableIndex"  :loading="loading" :selectShow="false"  idName="businessId" :tableData="dataList" :property="property"
      :numberShow="numberShow" @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" :button-disable="buttonDisabled"
      @selectChange="selectChange" @emitAblFilter="emitAblFilter" @clickLink="clickLink">
      <template slot="auditStatus" slot-scope="scope">
        {{ auditStatusMap[scope.value] || '--' }}
      </template>
    </table-index>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />
    <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
  </div>
</template>

<script>
import mixins from '@/views/mixins'
import dayjs from 'dayjs'
import workFlowView from '@/components/workFlowView'
import { auditList,urge } from '@/api/system/workflow'
import { FLOW_ROUTE } from '@/utils/constant'
import { menuConfig } from '@/utils'
import { findMenuByUrl } from "@/utils/index";
import { getUserMenu } from '@/api/system/menu'
export default {
  name: "todoList",
  mixins: [mixins],
  dicts: ['currency'],
  components: {
    workFlowView
  },
  data() {
    return {
      formDataClick: {},
      //是否展示序号
      numberShow: false,
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 表格数据
      dataList: [],
      // 弹出层标题
      title: "",
      //列表显示字段
      property: {},
      // 查询参数
      formData: {},
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 30,
      },
      // 勾选的数据
      selected: [],
      // 按钮状态
      disableFields: {},
      // 勾选的id
      ids: [],
      statusMap: {},
      auditStatusMap: {
        1: '审核中',
        2: '通过',
        3: '驳回'
      },
      workFlowViewVisible: false,
      selectedRow: null
    }
  },
  created() {
    this.menuProperty()
  },
  mounted() { },
  methods: {
    // 获取页面的属性
    menuProperty() {
      getUserMenu().then(menu => {

     console.log(menu.data,'sidebarMenu');
     const menuId = findMenuByUrl(menu.data,'todoList')?.id;
     this.$store.dispatch("menuProperty", menuId).then((data) => {
       this.listQuery.pageSize = data.defaultPageSize || 30;
       this.property = data;
     });
   })
    },
    // 展示序号
    numberChange(val) {
      this.numberShow = val
    },
    newButton(buttonCode, formId, buttonData) {
      this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
    },
    handleCheckAllChange(columns) {
      this.$refs.tableIndex.init(columns)
    },
    //选择框回调
    selectChange(row) {
      let { formData, isWatch } = row
      if (!isWatch) {
        this.handleQuery(formData)
      } else {
        this.formData = Object.assign({}, this.formData, formData)
      }
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.handleQuery()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      for (let key in this.formData) {
        this.formData[key] = null
      }
      this.handleQuery()
    },
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery)
      this.handleQuery()
    },
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row)
      // this.setCacheParams()
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList()
    },
    handleSelectionChange(ids, single, multiple, selected) {
      this.ids = ids
      this.single = single
      this.multiple = multiple
      this.selected = selected
    },
    //催办按钮控制
    buttonDisabled(button, row) {
      if (button.buttonCode == "urgeHandle" ) {
        if(!row.currentHandlerUserIds){   //判断有值的话，才可以选择
          return true; // 禁选
        } else if(row.isReminder === true){ //判断未催办的话，才可以选择
          return true; // 禁选
        } else if(!row.lastHandleDate){ //判断最后操作时间有值的话，才可以选择
          return true; // 禁选
        }

        const now = dayjs();
        const lastHandleTime = dayjs(row.lastHandleDate);
        const secondsDiff = now.diff(lastHandleTime, 'second'); // 改为秒级别计算
        // 获取字典配置时间默认小时
        const reminderTime = +this.dict.type.currency.find(x => x.value === 'reminderTime')?.raw.remark

        // ⚠️ 测试配置: 5秒后显示催办按钮 (正式环境改为: 72 * 60 * 60 = 259200秒)
        const URGE_THRESHOLD_SECONDS = reminderTime * 60 * 60; // 可手动调整此值进行测试

        console.log(`[催办] 业务编码: ${row.businessCode}, 时间差: ${secondsDiff}秒, 阈值: ${URGE_THRESHOLD_SECONDS}秒`);

        //间隔时间大于规定时间，才可以点击
        return secondsDiff < URGE_THRESHOLD_SECONDS;
      }
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      if (buttonCode == 'flowSee') { // 流程查看
        this.workFlowViewVisible = true
        this.selectedRow = rowArr[0]
      }
      if(buttonCode == 'urgeHandle'){ // 催办功能
        this.selectedRow = rowArr[0]
        const params = {
          businessId: this.selectedRow.businessId,
          businessCode: this.selectedRow.businessCode,
          businessType: this.selectedRow.businessType,
          currentHandlerUserIds: this.selectedRow.currentHandlerUserIds,
        };
        this.$modal.confirm("确定要发送催办提醒吗?",'催办确认').then(() => {
          return urge(params)
        }).then((data) => {
          if (data.success) {
            this.getList();
            this.$modal.msgSuccess("催办成功");
          } else {
            this.getList();
            this.$modal.msgError(data.message);
          }

        }).catch(() => {});
      }
    },
    clickReset() {
      this.handleQuery()
    },
    // 获取流程列表数据
    getList() {
      this.loading = true
      this.$emit("loading-change", true)
      auditList({...this.listQuery,...this.formData}).then((res) => {
        if (res.success && Array.isArray(res.data.list)) {
          let { list, total } = res.data
          this.dataList = list
          this.total = total
        } else {
          this.dataList = []
          this.total = 0
        }
      }).finally(() => {
        this.loading = false
        this.$emit("loading-change", false)
      })
    },
    clickLink(row) {
      const name = FLOW_ROUTE[row.businessType];
      this.$router.push({ name, query: { type: 'view', id: row.businessId, name: 'todoList' } });
    },
  },
}
</script>
<style lang="scss">
::v-deep {
  .el-button.is-disabled {
    -webkit-filter: none;
    color: none;
  }
}
</style>
