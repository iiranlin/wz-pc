<template>
  <div class="license-panel">

    <!-- 顶部标题 + 按钮 -->
    <div class="panel-header">
      <div class="title"> {{ !isView ? '操作' : '' }} </div>
      <div>
        <el-button v-if="!isView" type="primary" size="mini" @click="onImport"> 导入需求物资 </el-button>

        <el-button v-if="!isView" type="primary" size="mini" icon="el-icon-plus" @click="addItem">
          新增
        </el-button>

      </div>
    </div>

    <div>{{ contractDetailsList.length }}</div>
    <!-- 动态表单项 -->
    <div v-for="(item, index) of contractDetailsList" :key="item.id || index" class="panel-row">
      {{ index }}
      <div class="row-left">
        <h3>物资明细 {{ index + 1 }}</h3>
        <el-row :class="{ borderTop: isView }">
          <el-col :span="8">
            <el-form-item label="物资名称" :prop="`contractDetailsList.${index}.materialName`" class="label-right-align"
              :rules="[{ required: true, message: '请输入物资名称', trigger: 'blur' }]">
              <template v-if="!isView">
                <el-input v-model="item.materialName" placeholder="请输入物资名称" />
              </template>
              <template v-else>
                <span>{{ item.materialName }}</span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="规格型号" :prop="`contractDetailsList.${index}.specModel`" class="label-right-align"
              :rules="[{ required: true, message: '请输入规格型号', trigger: 'blur' }]">
              <template v-if="!isView">
                <el-input v-model="item.specModel" placeholder="请输入规格型号" />
              </template>
              <template v-else>
                <span>{{ item.specModel }}</span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="计量单位" :prop="`contractDetailsList.${index}.unit`" class="label-right-align"
              :rules="[{ required: true, message: '请输入计量单位', trigger: 'blur' }]">
              <template v-if="!isView">
                <el-input v-model="item.unit" placeholder="请输入计量单位" />
              </template>
              <template v-else>
                <span>{{ item.unit }}</span>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="数量" :prop="`contractDetailsList.${index}.amount`" class="label-right-align"
              :rules="[{ required: true, message: '请输入数量', trigger: 'blur' }]">
              <template v-if="!isView">
                <el-input type="number" v-model="item.amount" placeholder="请输入数量" />
              </template>
              <template v-else>
                <span>{{ item.amount }}</span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单价(万元)" :prop="`contractDetailsList.${index}.price`" class="label-right-align"
              :rules="[{ required: true, message: '请输入单价', trigger: 'blur' }]">
              <template v-if="!isView">
                <el-input type="number" v-model="item.price" placeholder="请输入单价" />
              </template>
              <template v-else>
                <span>{{ item.price }}</span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="税率(%)" :prop="`contractDetailsList.${index}.vatRate`" class="label-right-align"
              :rules="[{ required: true, message: '请输入税率', trigger: 'blur' }]">
              <template v-if="!isView">
                <el-input type="number" v-model="item.vatRate" placeholder="请输入税率" />
              </template>
              <template v-else>
                <span>{{ item.vatRate }}</span>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="合价(万元)" :prop="`contractDetailsList.${index}.totalAmount`" class="label-right-align"
              :rules="[{ required: true, message: '请输入合价', trigger: 'blur' }]">
              <template v-if="!isView">
                <el-input type="number" v-model="item.totalAmount" placeholder="请输入合价" @change="onAmountChange" />
              </template>
              <template v-else>
                <span>{{ item.totalAmount }}</span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :prop="`contractDetailsList.${index}.railwaySpecial`" label="铁路专用产品"
              class="label-right-align">
              <template v-if="!isView">
                <el-radio-group v-model="item.railwaySpecial" @change="onRailwayChange">
                  <el-radio label="1">是</el-radio>
                  <el-radio label="0">否</el-radio>
                </el-radio-group>
              </template>

              <template v-else>
                <span>{{ item.railwaySpecial == 1 ? "是" : "否" }}</span>
              </template>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-show="item.railwaySpecial == 1 && !isView">
          <el-col :span="24">
            <el-divider>许可/认证证书 </el-divider>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="item.railwaySpecial == 1">
          <el-col :span="8">
            <el-form-item :prop="`contractDetailsList.${index}.licenseCategory`" label="许可/认证类别"
              :rules="[{ required: true, message: '请输入许可/认证类别', trigger: 'blur' }]" class="label-right-align">
              <template v-if="!isView">
                <el-input v-model="item.licenseCategory" placeholder="请输入许可/认证类别" />
              </template>

              <template v-else>
                <span>{{ item.licenseCategory }}</span>
              </template>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item :prop="`contractDetailsList.${index}.issuanceUnit`" label="发证单位" class="label-right-align"
              :rules="[{ required: true, message: '请输入发证单位', trigger: 'blur' }]">
              <template v-if="!isView">
                <el-input v-model="item.issuanceUnit" placeholder="请输入发证单位" />
              </template>

              <template v-else>
                <span>{{ item.issuanceUnit }}</span>
              </template>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item :prop="`contractDetailsList.${index}.quantity`" label="证书编号" class="label-right-align"
              :rules="[{ required: true, message: '请输入证书编号', trigger: 'blur' }]">
              <template v-if="!isView">
                <el-input v-model="item.quantity" placeholder="请输入证书编号" />
              </template>

              <template v-else>
                <span>{{ item.quantity }}</span>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="item.railwaySpecial == 1">
          <el-col :span="8">
            <el-form-item :prop="`contractDetailsList.${index}.validityGuarantee`" label="有效日期"
              class="label-right-align" :rules="[{ required: true, message: '请选择有效日期', trigger: 'blur' }]">
              <template v-if="!isView">
                <el-date-picker v-model="item.validityGuarantee" type="daterange" range-separator="至"
                  start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-DD" value-format="yyyy-MM-DD">
                </el-date-picker>
              </template>

              <template v-else>
                <span>{{ item.validityGuarantee[0] | formatDate }} - {{ item.validityGuarantee[1] | formatDate }}</span>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div class="row-right" v-if="!isView">
        <el-button icon="el-icon-delete" size="mini" type="danger" circle @click="removeItem(index)"
          v-if="contractDetailsList.length > 1" />
      </div>
    </div>

    <BatchDialog ref="batchDialogRef" @onOk="onDialogOk" />
  </div>
</template>

<script>
import dayjs from 'dayjs';
import BatchDialog from './batchDialog.vue';

export default {
  props: {
    value: {
      type: Object,
      default: () => ({
        contractDetailsList: [],
        amount: 0
      })
    },
    isView: {
      type: Boolean,
      default: false
    },
    formRef: {
      type: Function,
      default: () => { }
    }
  },
  components: {
    BatchDialog,
  },
  computed: {
    contractDetailsList: {
      get() {
        return this.value.contractDetailsList;
      },
      set(val) {
        // 这里一定要把整个 form 对象 emit 回去
        this.$emit('input', {
          ...this.value,
          contractDetailsList: val
        });
      }
    }
  },
  filters: {
    formatDate(value) {
      if (!value) return "";
      return dayjs(value).format("YYYY-MM-DD");
    }
  },
  methods: {
    onDialogOk(data) {
      // 将批量上传的文件，导入到总的数据中

      setTimeout(() => {
        console.log(data, '便利签data')
        const list = data.map(x => ({
          ...x,
          validityGuarantee: x.startTime ? [x.startTime, x.endTime] : []
        }));
        this.value.contractDetailsList = list

        this.formRef.setFormData('contractDetailsList', list)

        console.log('批量导入的数据', this.contractDetailsList);
      }, 1500)

      //  this.contractDetailsList = data
    },
    onImport() {
      this.$refs.batchDialogRef.open();

    },
    onAmountChange(e) {
      console.log("amount changed:", e, this.value);
      // 将totalAmount 求和
      this.value.amount = this.contractDetailsList.reduce((sum, item) => {
        return sum + Number(item.totalAmount || 0);
      }, 0);
      this.formRef.setFormData('amount', this.value.amount);

    },
    async onRailwayChange(e) {
      console.log("railwaySpecial changed:", e);

    },
    addItem() {
      const list = this.contractDetailsList.slice();

      console.log('add', list)
      setTimeout(() => {
        list.push({
          materialName: "",
          specModel: "",
          unit: '',
          amount: '',
          price: '',
          vatRate: '',
          totalAmount: '',
          railwaySpecial: '0',
          id: crypto.randomUUID(),
        });
        this.contractDetailsList = list;

        this.formRef.setFormData('contractDetailsList', list)


      }, 1500)
    },
    removeItem(index) {
      const list = this.contractDetailsList.slice();
      list.splice(index, 1);
      this.value.contractDetailsList = list

      this.formRef.setFormData('contractDetailsList', list)

    }
  }
};
</script>

<style scoped>
.borderTop {
  border-top: 1px solid #ebeef5;
  ;
}

.license-panel {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f7fa;
  padding: 10px 14px;
  border-bottom: 1px solid #ebeef5;
}

.panel-header .title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.panel-table-header {
  display: flex;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
  font-weight: 500;
  color: #666;
}

.panel-table-header .col {
  padding: 8px 12px;
  border-right: 1px solid #ebeef5;
  text-align: center;
}

.col1,
.col2,
.col3 {
  flex: 1;
}

.col4 {
  flex: 1.2;
}

.col5 {
  width: 80px;
}

.panel-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  align-items: flex-start;
  padding: 10px 0;
}

.row-left {
  flex: 1;
  padding: 0 12px;
}

.row-right {
  width: 80px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 4px;
}
</style>
