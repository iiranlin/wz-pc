<template>
  <Dialog
    tabindex="1"
    class="flex-dialog max-height-dialog"
    title="选择合同"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="1000px"
    height="600px"
    v-loading="loading"
    :append-to-body="true"
  >
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="queryParams" class="search-form">
      <el-form-item label="合同编号">
        <el-input
          v-model="queryParams.contCode"
          placeholder="请输入合同编号"
          clearable
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item label="合同名称">
        <el-input
          v-model="queryParams.contName"
          placeholder="请输入合同名称"
          clearable
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <el-table
        ref="contractTable"
        :data="tableData"
        border
        @row-click="rowClick"
        @row-dblclick="dbClick"
        v-loading="loading"
        row-key="id"
      >
        <el-table-column align="center" width="50" fixed="left" show-overflow-tooltip>
          <template v-slot="{ row }">
            <el-radio
              v-model="selectedContractId"
              :label="row.id"
              class="table-radio"
            ></el-radio>
          </template>
        </el-table-column>
        <el-table-column label="序号" align="center" type="index" width="60" fixed  show-overflow-tooltip/>

        <el-table-column
          prop="scontCode"
          label="合同编号"
          align="center"
          show-overflow-tooltip
          width="180"
        />
        <el-table-column
          prop="scontName"
          label="合同名称"
          align="center"
          show-overflow-tooltip
          width="200"
        />
        <el-table-column
          prop="sUnitName"
          label="录入单位名称"
          align="center"
          show-overflow-tooltip
          min-width="150"
        />
        <el-table-column
          prop="ncontAmount"
          label="合同金额"
          align="center"
          show-overflow-tooltip
          min-width="150"
        >
          <template slot-scope="{ row }">
            {{ row.ncontAmount | formatCurrency }}
          </template>
        </el-table-column>

        <el-table-column
          prop="dmakeDate"
          label="录入时间"
          align="center"
          show-overflow-tooltip
          min-width="150"
        >
          <template slot-scope="{ row }">
            {{ row.dmakeDate | dateTimeFormat }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel" style="margin-right: 10px"
        >取 消</el-button
      >
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "@/components/Dialog";
import indexMixin from "@/views/mixins";
import axios from "axios";
import dayjs from "dayjs";
import { getUserInfo } from "@/utils/user-info";

export default {
  name: "ContractNameSelect",
  mixins: [indexMixin],
  components: {
    Dialog,
  },
  filters: {
    formatCurrency(value) {
      if (!value) return 0;
      const formatter = new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: "CNY",
      });

      return formatter.format(+value);
    },
    dateTimeFormat(value) {
      if (!value) return "";
      return dayjs(value).format("YYYY-MM-DD HH:mm");
    },
  },
  data() {
    return {
      userInfo: getUserInfo(),
      // 遮罩层
      loading: false,
      // 显示状态
      visible: false,
      // 选中的合同ID
      selectedContractId: null,
      // 选中的合同数据
      selectedContract: null,
      // 总条数
      total: 0,
      // 表格数据
      tableData: [],
      queryParams: {
        contCode: "",
        contName: "",
      },
    };
  },
  methods: {
    // 打开弹窗
    open() {
      this.visible = true;
      this.reset();
      this.getList();
    },
    // 重置数据
    reset() {
      this.selectedContractId = null;
      this.selectedContract = null;
      this.resetQuery();
    },
    // 重置查询条件
    resetQuery() {
      this.listQuery.pageNum = 1;

      this.queryParams = {
        contCode: "",
        contName: "",
      };
    },
    // 查询按钮
    handleQuery() {
      this.listQuery.pageNum = 1;
      this.getList();
    },
    // 根据unitName匹配对应的unitCode
    matchUnitCode() {
      const unitName = this.userInfo.unitName || "";

      // 定义地区和对应的编码映射
      const unitCodeMap = {
        杭州: "3731", // 杭州枢纽指挥部
        上海: "3743", // 上海枢纽指挥部
        徐州: "3748", // 徐州枢纽指挥部
        南京: "3738", // 南京枢纽指挥部
        合肥: "3722", // 合肥枢纽指挥部
      };

      // 检查unitName是否包含地区名称和"指挥"关键词
      for (const [city, code] of Object.entries(unitCodeMap)) {
        if (unitName.includes(city) && unitName.includes("指挥")) {
          return code;
        }
      }

      // 默认返回上海枢纽指挥部编码
      return "3743";
    },
    // 获取列表数据
    async getList() {
      const data = {
        ...this.listQuery,
        // 路局编号写死
        rwCode: "3700",
        // 录入单位编号
        unitCode: this.matchUnitCode(),
        ...this.queryParams,
      };

      try {
        this.loading = true;
        // 内网地址：http://10.3.144.73:8000/api/data-share/outputService/service/contractMtInfo
        const res = await axios.post(
          "http://10.3.144.73:8000/api/data-share/outputService/service/contractMtInfo",
          data,
          {
            headers: {
              Token: "0scch18f23f7ce82",
            },
          }
        );
        this.tableData = res.data.data.list || [];
        this.total = res.data.data.total || 0;
      } catch (error) {
        this.$message.error("获取合同列表失败");
      } finally {
        this.loading = false;
      }
    },
    // 行点击事件
    rowClick(row) {
      this.selectedContractId = row.id;
      this.selectedContract = row;
    },
    // 双击行事件
    dbClick(row) {
      this.selectedContractId = row.id;
      this.selectedContract = row;
      this.handleConfirm();
    },
    // 取消按钮
    handleCancel() {
      this.visible = false;
    },
    // 确认按钮
    handleConfirm() {
      if (!this.selectedContractId) {
        this.$message.warning("请选择一条合同记录");
        return;
      }

      // 向父组件传递选中的合同数据
      this.$emit("select", this.selectedContract);
      this.visible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.search-form {
  margin-bottom: 15px;
}

.table-wrapper {
  margin-bottom: 15px;
}

.table-radio {
  margin-right: 0;
}

::v-deep .el-radio__label {
  display: none;
}
</style>
