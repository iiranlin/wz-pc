<template>
  <div class="app-container container_flex" v-loading="loading">
    <button-top
      :buttonTopData="buttonTop"
      :buttonShow="buttonShow"
      @newButton="newButton"
    ></button-top>
    <div :class="{ container_flex_form: type === 'view' || preview }">
      <VFormRender
        :form-json="formJson"
        :form-data="formData"
        :option-data="optionData"
        ref="vFormRef"
        :global-dsv="globalDsv"
        :class="{ formRender_view: type === 'view' || preview }"
      >
        <!-- 附件 -->
        <template #fileSlot="scope">
          <el-form-item
            prop="fileList"
            label="领料单"
            class="label-right-align"
            :rules="[{ required: true, message: '请上传', trigger: 'change' }]"
          >
            <fileUpload
              v-model="scope.formModel.fileList"
              :preview="type == 'view' || preview"
              :limit="9999"
              :fileSize="500"
              :isShowTip="false"
              :fileType="['pdf','jpg','png','jpeg']"

            />
          </el-form-item>
        </template>
        <template #detailSlot>
          <div class="flex">
            <span class="title">
              物资明细 （共{{ tableData.length }}
              项）
            </span>
            <el-input
              v-if="type != 'view' && !preview"
              v-model="searchKeyword"
              placeholder="请输入物资规格型号"
              style="width: 300px"
              @input="handleSearch"
              prefix-icon="el-icon-search"
              clearable
            >
              
            ></el-input>
          </div>
          <el-table
            :data="tableData"
            border
            style="width: 100%"
            :max-height="400"
            ref="dataTable"
            :lazy="true"
            :load="load"
            row-key="id"
            :tree-props="{ children: 'children'}"
            @expand-change="handleExpandChange"
          >
            <el-table-column
              type="index"
              label="序号"
              width="55"
              align="center"
              fixed="left"
            />
            <el-table-column prop="sellerName" label="供应商" width="250" fixed>
            </el-table-column>
            <el-table-column prop="materialName" label="物资名称" width="200" fixed>
            </el-table-column>
            <el-table-column
              prop="specModel"
              label="规格型号"
              width="200"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="unit"
              label="计量单位"
              width="100"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="planAmount"
              label="需求数量"
              width="120"
              align="center"
            >
              <template slot-scope="scope">
                <span v-if="isParentRow(scope.row)">
                  {{ scope.row.planAmount || "" }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="stockStatus"
              label="当前库存数量"
              width="120"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="storeNumber"
              label="入库单号"
              width="150"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="manufactureDate"
              label="生产日期"
              width="150"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="expirationDate"
              label="有效期截止日期"
              width="150"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="outTotal"
              label="出库数量"
              width="150"
              align="center"
              fixed="right"
            >
              <template slot-scope="scope">
                <div v-if="isParentRow(scope.row)" style="display: flex; justify-content: center; align-items: center;">
                  <el-button 
                    v-if="scope.row.hasChildren"
                    type="text" 
                    size="mini"
                    @click.stop="toggleExpand(scope.row)"
                  >
                    <i :class="scope.row.isExpanded ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"></i>
                    {{ scope.row.isExpanded ? '收起' : '展开' }}
                  </el-button>
                </div>
                <el-input-number
                  v-model="scope.row.outTotal"
                  :min="0"
                  :max="+scope.row.remainingStock || 0"
                  size="mini"
                  style="width: 100%"
                  v-if="type != 'view' && !preview && !isParentRow(scope.row)"
                  @change="handleOutTotalChange(scope.row)"
                ></el-input-number>
                <span v-else>
                  {{ scope.row.outTotal || "" }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" width="200" fixed="right">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.remark"
                  size="mini"
                  style="width: 100%"
                  v-if="type != 'view' && !preview && !isParentRow(scope.row)"
                ></el-input>
                <span v-else>
                  {{ scope.row.remark }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import * as Api from "@/api/prodmgr-inv/project/wms.js";
import * as Lzmx from "@/api/prodmgr-inv/project/lzmx.js";
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import fileUpload from "@/components/upload";
import { getUserInfo } from "@/utils/user-info";
import dayjs from "dayjs";
export default {
  name: "omPage",
  components: {
    VFormRender,
    fileUpload,
  },
  data() {
    const userInfo = getUserInfo();
    return {
      maxManualIndex: 1,
      buyer: userInfo?.deptName,
      loading: false,
      title: "新增",
      checked: false,
      //   fileList type
      // type: 'create', //update , view ,create
      fileList: [],
      formJson: {},
      formData: {},
      optionData: {},
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: "24",
      },
      lineOptions: [],
      // 菜单按钮、字段等数据
      buttonTop: [
        {
          buttonName: "返回",
          buttonCode: "cancel",
          buttonIcon: "Blue-Cancel",
          type: "create, update",
        },
        {
          buttonName: "出库预览",
          buttonCode: "save",
          buttonIcon: "Blue-Save",
          type: "create, update",
        },
      ],
      constructionOptions: [],
      gysOptions: [],
      tableData: [],
      selection: [],
      form: {},
      materialName: "",
      searchKeyword: "",
      originalTableData: [], // 保存原始数据
      allDataBackup: new Map(), // 备份所有数据状态，包括展开的子树和填写的数量
      expandedRowKeys: new Set(), // 缓存已展开的行的key
      preview: false, //出库页还是预览页
    };
  },
  computed: {
    type() {
      return this.$route.query.type;
    },
    id() {
      return this.$route.query?.id || "";
    },
  },
  watch: {
    preview: {
      handler(newVal) {
        if (newVal) {
          // 预览模式
          this.buttonTop[1].buttonName = "确定出库";
          this.$refs.vFormRef.setReadMode(true);

          this.$tab.updatePage({
            path: "/wms/omPage",
            meta: {
              title: "出库预览",
            },
          });

          // 预览模式下恢复完整的原始数据，清空搜索关键词
          this.searchKeyword = "";
          this.tableData = [...this.originalTableData];
          
          // 隐藏折叠按钮
          this.tableData = this.tableData.map((x) => {
            x.hasChildren = x.children.length > 0;
            return x;
          });
        } else {
          // 填写模式
          this.buttonTop[1].buttonName = "出库预览";
          this.$refs.vFormRef.setReadMode(false);

          this.$tab.updatePage({
            path: "/wms/omPage",
            meta: {
              title: "物资出库",
            },
          });

          //恢复折叠按钮
          this.tableData = this.tableData.map((x) => {
            x.hasChildren = +x.stockStatus > 0;
            return x;
          });
        }
      },
    },
  },
  async created() {},
  mounted() {
    this.init(this.id);
  },
  methods: {
    //初始化
    init(id) {
      this.loading = true;
      this.$nextTick(async () => {
        await Api.detailOut(id).then(({ data }) => {
          this.loading = false;
          this.$nextTick(async () => {
            await this.formFillInPage();
            this.$refs.vFormRef.setFormData({
              sectionName: data.sectionName,
              planName: data.planName,
              deptName: data.deptName,
            });
            const detail = data.details.map((x) => ({
              ...x,
              hasChildren: +x.stockStatus > 0,
              children: [],
              expirationDate: x.expirationDate
                ? dayjs(x.expirationDate).format("YYYY-MM-DD")
                : "",
              outTotal: x.storeTotal, //默认出库数量=库存数量
              // 父级不展示字段
              manufactureDate: "",
            }));
            this.tableData = detail;
            this.originalTableData = [...detail]; // 保存原始数据
          });
        });
      });
    },
    newButton(buttonCode) {
      if (buttonCode === "cancel") {
        this.cancel();
        return;
      }
      if (buttonCode === "save") {
        this.handleCreate();
        return;
      }
    },
    cancel() {
      if (this.preview) {
        this.preview = false;
      } else {
        this.$router.go(-1);
      }
    },

    buttonShow(item) {
      if (item.buttonCode === "save") {
        return this.type !== "view";
      }
      return true;
    },
    //新建
    async handleCreate() {
      console.log(this.preview, "=====this.preview====");
      if (!this.preview) {
        //进行预览
        this.$refs.vFormRef.validateForm(async (valid) => {
          if (!valid) {
            this.$message.warning("请完善信息");
            return;
          }

          const childrenList = this.getChildrenList(this.tableData);

          // 如果出库数量没有或者为0 则提示
          if (childrenList.length === 0) {
            this.$message.error("未选择出库物资！");
            return;
          }
          this.preview = !this.preview;
        });
      } else {
        const formData = await this.$refs.vFormRef.getFormData();
        //组装附件
        var fileByList = formData.fileByList ? JSON.parse(formData.fileByList) : {};
        //领料单
        if (formData.fileList.length > 0) {
          this.$set(fileByList, "lld", formData.fileList);
        }

        formData.fileByList = JSON.stringify(fileByList);
        this.loading = true;
        Api.outSave(
          Object.assign(
            {
              id: this.id,
            },
            formData,
            {
              materialSupplierOutDetailParams: this.getChildrenList(this.tableData),
            }
          )
        )
          .then(({ message }) => {
            this.loading = false;
            this.$modal.msgSuccess(message);
            //出完库跳到出库列表
            this.$router.push({
              name: "omList",
            });
          })
          .finally((err) => {
            this.loading = false;
          });
      }
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("om").then((res) => {
          this.$refs["vFormRef"].setFormJson(res.data);
          resolve(true);
        });
      });
    },
    getChildrenList(arr) {
      const validChildren = [];
      
      // 从当前表格数据中获取有效子项
      arr.forEach(item => {
        if (Array.isArray(item.children)) {
          const children = item.children.filter(
            (child) => Number(child.outTotal) > 0
          );
          validChildren.push(...children);
        }
      });
      
      // 从备份数据中获取所有有效子项（包括搜索时不在当前表格中的数据）
      this.allDataBackup.forEach((backupItem) => {
        if (Array.isArray(backupItem.children)) {
          const children = backupItem.children.filter(
            (child) => Number(child.outTotal) > 0 && 
            !validChildren.some(existing => existing.id === child.id)
          );
          validChildren.push(...children);
        }
      });
      
      return validChildren;
    },
    async load(tree, treeNode, resolve) {
      // 检查是否已有缓存的子树数据
      const cachedTree = this.allDataBackup.get(tree.id);
      if (cachedTree && cachedTree.children && cachedTree.children.length > 0) {
        // 如果有缓存数据，直接使用缓存的子树数据（包含用户填写的数量）
        tree.children = cachedTree.children;
        this.expandedRowKeys.add(tree.id);
        resolve(cachedTree.children);
        return;
      }
      
      // 如果没有缓存数据，从服务器获取新数据
      try {
        const res = await Lzmx.detail(tree.id);
        const data = res.data.map((x) => ({
          ...x,
          isChildren: true,
          manufactureDate: dayjs(x.manufactureDate).format("YYYY-MM-DD"),
          expirationDate: x.expirationDate
            ? dayjs(x.expirationDate).format("YYYY-MM-DD")
            : "",
          outTotal: +x.remainingStock, //默认出库数量=库存数量
          stockStatus: x.remainingStock,
        }));
        // 更新树节点的子数据
        tree.children = data;
        
        // 记录已展开的行
        this.expandedRowKeys.add(tree.id);
        // 更新备份数据
        this.allDataBackup.set(tree.id, JSON.parse(JSON.stringify(tree)));
        // 调用resolve回调函数返回子数据
        resolve(data);
      } catch (error) {
        console.error("加载子树数据失败:", error);
        resolve([]);
      }
    },
    isParentRow(row) {
      return !row.isChildren;
    },
    // 搜索功能
    handleSearch() {
      // 在搜索前，先备份当前所有数据状态
      this.backupAllData();
      
      if (!this.searchKeyword.trim()) {
        // 如果搜索关键词为空，恢复所有原始数据，但从备份中恢复已展开的子树数据
        this.tableData = this.originalTableData.map(originalItem => {
          const backupItem = this.allDataBackup.get(originalItem.id);
          // 如果备份中存在该项且有子树数据，使用备份数据
          if (backupItem && backupItem.children && backupItem.children.length > 0) {
            return backupItem;
          }
          return originalItem;
        });
        // 恢复展开状态
        this.$nextTick(() => {
          this.restoreExpandedState();
        });
        return;
      }
      
      const keyword = this.searchKeyword.toLowerCase();
      // 从原始数据中过滤，但从备份中恢复已展开的子树数据
      this.tableData = this.originalTableData
        .filter(item => item.specModel && item.specModel.toLowerCase().includes(keyword))
        .map(item => {
          const backupItem = this.allDataBackup.get(item.id);
          // 如果备份中存在该项且有子树数据，使用备份数据
          if (backupItem && backupItem.children && backupItem.children.length > 0) {
            return backupItem;
          }
          return item;
        });
      
      // 恢复展开状态
      this.$nextTick(() => {
        this.restoreExpandedState();
      });
    },
    
    // 处理出库数量变化
    handleOutTotalChange(row) {
      // 找到该子项所属的父项
      const parentRow = this.tableData.find(item => 
        item.children && item.children.some(child => child.id === row.id)
      );
      if (parentRow) {
        // 更新备份数据中的对应项
        this.allDataBackup.set(parentRow.id, JSON.parse(JSON.stringify(parentRow)));
      }
    },
    
    // 处理表格行展开/折叠状态变化
    handleExpandChange(row, expandedRows) {
      // 直接使用el-table的内部状态来判断行是否展开
      const isExpanded = this.$refs.dataTable.store.states.expandRows.some(
        expandedRow => expandedRow.id === row.id
      );
      
      if (isExpanded) {
        // 行被展开，添加到expandedRowKeys
        this.expandedRowKeys.add(row.id);
      } else {
        // 行被折叠，从expandedRowKeys中移除
        this.expandedRowKeys.delete(row.id);
      }
    },
    
    // 恢复展开状态的方法
    restoreExpandedState() {
      this.expandedRowKeys.forEach(rowKey => {
        const row = this.tableData.find(item => item.id === rowKey);
        if (row && row.children && row.children.length > 0) {
          // 使用el-table的toggleRowExpansion方法展开行
          this.$refs.dataTable.toggleRowExpansion(row, true);
        }
      });
    },
    
    // 备份所有数据状态的方法
    backupAllData() {
      this.tableData.forEach(item => {
        // 使用深拷贝保存当前数据状态，包括子树数据
        this.allDataBackup.set(item.id, JSON.parse(JSON.stringify(item)));
      });
    },
    toggleExpand(row) {
      if (!this.$refs.dataTable) return;
      
      // 如果isExpanded字段不存在，初始化为false
      if (row.isExpanded === undefined) {
        this.$set(row, 'isExpanded', false);
      }
      
      // 切换展开状态
      row.isExpanded = !row.isExpanded;
      
      // 检查是否已有子树数据
      if (!row.children || row.children.length === 0) {
        // 如果没有子树数据，先加载数据
        this.load(row, null, (children) => {
          // 数据加载完成后展开行
          this.$nextTick(() => {
            this.$refs.dataTable.toggleRowExpansion(row, row.isExpanded);
          });
        });
      } else {
        // 如果已有子树数据，直接切换展开状态
        this.$refs.dataTable.toggleRowExpansion(row, row.isExpanded);
      }
    },
    isExpanded(row) {
      // 检查行是否已展开 - 直接从表格组件获取展开状态
      if (!this.$refs.dataTable) return false;
      
      // 获取表格的展开行数组
      const expandedRows = this.$refs.dataTable.store.states.expandRows;
      
      // 检查当前行是否在展开行数组中
      return expandedRows.some(expandedRow => expandedRow.id === row.id);
    },
  },
};
</script>

<style lang="scss" scoped>
.flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}
.flex .title {
  font-weight: 600;
  color: #000;
  padding-left: 12px;
  font-size: 16px;
}
.slotIcon-color-content {
  color: red;
}

.slotIcon-color {
  color: #1890ff;
}

.ml-20 {
  margin-left: 20px !important;
}

.mt-20 {
  margin-top: 20px !important;
}

::v-deep .label-right-align .el-form-item__label {
  text-align: right;
}

::v-deep .el-table__expand-icon {
  display: none !important;
}
</style>
