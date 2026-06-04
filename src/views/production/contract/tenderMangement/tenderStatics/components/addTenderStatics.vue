<template>
  <div class="app-container container_flex">
    <button-top
      :buttonTopData="buttonTop"
      :buttonShow="buttonShow"
      @newButton="newButton"
    ></button-top>
    <div :class="{ container_flex_form: type === 'view' }">
      <VFormRender
        :form-json="formJson"
        :form-data="formData"
        :option-data="optionData"
        ref="vFormRef"
        :global-dsv="globalDsv"
        :class="{ formRender_view: type === 'view' }"
      >
        <template #unitNameSlot="{ formModel }">
          <el-form-item prop="tenderUnit" label="填报单位：" class="label-right-align"
          :rules=" [{ required: true, message: '请输入填报单位', trigger: 'blur' }, { max: 100, message: '填报单位长度不能超过50个字符', trigger: 'blur' }]">
          <el-input v-if="type !== 'view'" v-model="formModel.tenderUnit" placeholder="请输入填报单位"/>
            <el-tooltip v-else :content="formModel.tenderUnit" placement="top" effect="dark">
              <span class="ellipsis-text" style="width: 100%;">
                <span >{{ formModel.tenderUnit }}</span>
               </span>
            </el-tooltip>
          </el-form-item>
         </template>
         <template #tenderYearSlot="{ formModel }">
          <el-form-item prop="tenderYear" label="招标年度：" class="label-right-align"
            :rules=" { required: true, message: '请选择招标年度', trigger: 'blur' }">
              <el-date-picker v-if="type !== 'view'" v-model="formModel.tenderYear" type="year" placeholder="请选择招标年度" @change="handleTenderYearChange" style="width: 100%;"/>
              <span v-else>{{ formModel.tenderYear }}</span>
            </el-form-item>
        </template>
         <template #fillDateSlot="{ formModel}">
             <el-form-item  prop="fillReportTime" label="填报时间：" class="label-right-align"
             :rules=" { required: true, message: '请选择填报时间', trigger: 'blur' }">
               <el-date-picker v-if="type !== 'view'" v-model="formModel.fillReportTime" type="date" placeholder="请选择填报日期" style="width: 100%;"/>
                <span v-else>{{ formatTimestamp(formModel.fillReportTime) }}</span>
              </el-form-item>

         </template>
         <template #personNameSlot="{ formModel }">
           <el-form-item  prop="fillPerson" label="填表人：" class="label-right-align"
           :rules=" [{ required: true, message: '请输入填表人', trigger: 'blur' }, { max: 50, message: '填表人长度不能超过50个字符', trigger: 'blur' }]">
             <el-input v-if="type !== 'view'" v-model="formModel.fillPerson" placeholder="请输入填表人"/>
             <span v-else>{{ formModel.fillPerson }}</span>
           </el-form-item>

         </template>
         <template #relatePersonlSlot="{ formModel }">
           <el-form-item  prop="contactPerson" label="联系人：" class="label-right-align"
           :rules=" [{ required: true, message: '请输入联系人', trigger: 'blur' }, { max: 50, message: '联系人长度不能超过50个字符', trigger: 'blur' }]">
              <el-input v-if="type !== 'view'" v-model="formModel.contactPerson" placeholder="请输入联系人"/>
              <span v-else>{{ formModel.contactPerson }}</span>
           </el-form-item>
         </template>

         <!-- 甲供物资列表 -->
         <template #tableSlot="{formModel}">
          <ItemsTable v-model="formData" ref="tableRef" :isView="type === 'view'" :tenderUnit="formModel.tenderUnit" :tenderYear="formModel.tenderYear ? (typeof formModel.tenderYear === 'object' ? formModel.tenderYear.getFullYear().toString() : formModel.tenderYear.toString()) : ''" :id="id" @input="handleTableInput" />
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import * as Api from '@/api/prodmgr-inv/project/contract.js'
import * as LineApi from '@/api/prodmgr-inv/project/line.js'
import VFormRender from '@/components/form-render/index'
import { formFillInPage } from '@/api/form/form'
import { getToken } from '@/utils/auth'
import dayjs from 'dayjs'
import ItemsTable from './itemsTable.vue'
import { getUserInfo } from '@/utils/user-info'
export default {
  name: "addTenderStatics",
  dicts: ["MeasureUnit", "WZDL"],
  components: {VFormRender,ItemsTable},
  data () {
      return {
        loading: false,
        title: '新增',
        checked: false,
        fileList: [],
        formJson: {
        },
        formData: {
          materialTenderInfoDOList: [],
        },
        optionData: {},
        globalDsv: {
          VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
          VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
          Authorization: getToken(),
          businessType: '24'
        },
        // 菜单按钮、字段等数据
        buttonTop: [
          { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
          { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
        ],
        lineOptions: [],
        userInfo: getUserInfo(),
      }
    },
  computed: {
    type () {
      return this.$route.query.type
    },
    id () {
      return this.$route.query?.id || ''
    }
  },
 activated() {
    // 设置页面标题
     this.setPageTitle()
     if (this.type === 'create') {
          this.init()
      } else if (['view', 'update'].includes(this.type)) {
        this.updateInit(this.id)
      }
  },
  mounted () {
     // 设置页面标题
     this.setPageTitle()
     if (this.type === 'create') {
          this.init()
      } else if (['view', 'update'].includes(this.type)) {
        this.updateInit(this.id)
      }
  },
  methods: {
     // 设置页面标题
     setPageTitle() {
       let title = ''
       switch (this.type) {
         case 'create':
           title = '新增招标统计'
           break
         case 'update':
           title = '修改招标统计'
           break
         case 'view':
           title = '招标统计详情'
           break
         default:
           title = '招标统计'
       }
       // 更新路由meta标题
       this.$route.meta.title = title
       // 更新tagsView中的访问记录
       this.$store.dispatch('tagsView/updateVisitedView', this.$route)
     },
     formatTimestamp(timestamp) {
      // 如果是时间戳（数字类型），转换为年月日格式
      if (timestamp && typeof timestamp === 'number') {
        return dayjs(timestamp).format('YYYY-MM-DD');
      }
      // 如果已经是字符串格式，直接返回
      return timestamp;
    },

    //获取招标人名称
    async getTendererNames() {
      try {
        const response = await Api.getTendererNames();
        console.log(response)

        const tenderUnit = response.data[0].name || '';

        // 更新 formData
        this.formData.tenderUnit = tenderUnit;

        // 更新VFormRender中的表单数据
        if (this.$refs.vFormRef) {
          // 确保同时设置所有默认值，避免覆盖
          this.$refs.vFormRef.setFormData({
            ...this.formData
          });
        }
      } catch (error) {
        console.error('获取填报单位失败:', error);
      }
    },


    //初始化
    init () {
      this.$nextTick(async () => {
        this.title = "新建";
        await this.formFillInPage();
        // 获取招标人名称
        await this.getTendererNames();
        // 设置默认当前日期和年份
        const currentDate = dayjs().format('YYYY-MM-DD');
        const currentYear = dayjs().format('YYYY');
        // 初始化 formData
        this.formData = {
          fillReportTime: currentDate,
          tenderYear: currentYear,
          fillPerson: this.userInfo.nickName,
          contactPerson: this.userInfo.nickName,
          materialTenderInfoDOList: []
        };
        if (this.$refs.vFormRef) {
          // 初始化默认值
          this.$refs.vFormRef.setFormData(this.formData);
        }
      });
    },
    // 编辑初始化
    async updateInit (id) {
      await Api.tenderStatisticsDetail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";
          await this.formFillInPage()
          // 确保 tenderYear 是字符串类型
          if (data.tenderYear) {
            data.tenderYear = data.tenderYear.toString();
          }
          // 更新 formData
          this.formData = data;
          // 确保 materialTenderInfoDOList 是数组
          if (!this.formData.materialTenderInfoDOList) {
            this.formData.materialTenderInfoDOList = [];
          }
          this.$refs.vFormRef.setFormData(data)
          //   form action
          this.$refs.vFormRef.setReadMode(this.type === 'view')
        });
      });
    },
    newButton (buttonCode) {
      if (buttonCode === 'cancel') {
        this.cancel()
        return
      }
      if (buttonCode === 'save') {
        this.handleCreate()
        return
      }

    },
    cancel () {
       this.$router.go(-1);
    },

    buttonShow (item) {
      if (item.buttonCode === 'save') {
        return this.type !== 'view'
      }
      return true
    },
    //新建
    handleCreate () {
      this.$refs.vFormRef.validateForm(async (valid) => {
        if (valid) {
          this.loading = true;
           const vFormRefData = await this.$refs.vFormRef.getFormData();
          // 直接使用 this.formData，因为 VFormRender 可能不会包含 materialTenderInfoDOList
           const formData = this.formData;
           // 判断填报单位的长度不能超过100个字符
           if (formData.tenderUnit && formData.tenderUnit.length > 100) {
            this.loading = false;
            this.$modal.msgError('填报单位长度不能超过100个字符');
            return;
          }
          // 验证填表人和联系人长度
          if (formData.fillPerson && formData.fillPerson.length > 50) {
            this.loading = false;
            this.$modal.msgError('填表人长度不能超过50个字符');
            return;
          }
          if (formData.contactPerson && formData.contactPerson.length > 50) {
            this.loading = false;
            this.$modal.msgError('联系人长度不能超过50个字符');
            return;
          }
          // 验证联系电话长度（如果存在）
          if (formData.contactPhone && formData.contactPhone.length > 100) {
            this.loading = false;
            this.$modal.msgError('联系电话长度不能超过100个字符');
            return;
          }
          // 验证备注长度
          if (formData.remark && formData.remark.length > 1000) {
            this.loading = false;
            this.$modal.msgError('备注长度不能超过1000个字符');
            return;
          }

          // 验证表格中的长度限制
          const materialTenderInfoDOList = formData.materialTenderInfoDOList || [];
          for (let i = 0; i < materialTenderInfoDOList.length; i++) {
            const item = materialTenderInfoDOList[i];
            if (item.tendererName && item.tendererName.length > 100) {
              this.loading = false;
              this.$modal.msgError(`第${i + 1}行：招标人名称长度不能超过100个字符`);
              return;
            }
            if (item.tenderTradePlace && item.tenderTradePlace.length > 100) {
              this.loading = false;
              this.$modal.msgError(`第${i + 1}行：招标交易场所长度不能超过100个字符`);
              return;
            }
            // 验证备注长度
            if (item.remark && item.remark.length > 1000) {
              this.loading = false;
              this.$modal.msgError(`第${i + 1}行：备注长度不能超过1000个字符`);
              return;
            }
          }

          let submitData = {...formData,...vFormRefData};

          // 将日期字段转换为时间戳
          if (submitData.materialTenderInfoDOList) {
            submitData.materialTenderInfoDOList.forEach(item => {
              // 转换招标年度
              if (item.tenderYear) {
                item.tenderYear = new Date(item.tenderYear).getFullYear();
                item.tenderYear = item.tenderYear.toString();
              }
              // 转换招标发布公告时间
              if (item.tenderNoticePubTime) {
                item.tenderNoticePubTime = new Date(item.tenderNoticePubTime).getTime();
              }
              // 转换开标时间
              if (item.bidOpenTime) {
                item.bidOpenTime = new Date(item.bidOpenTime).getTime();
              }
              // 转换推荐中标候选人公示时间
              if (item.candidatePubTime) {
                item.candidatePubTime = new Date(item.candidatePubTime).getTime();
              }
              // 转换中标通知书时间
              if (item.bidNoticeTime) {
                item.bidNoticeTime = new Date(item.bidNoticeTime).getTime();
              }
              // 转换合同签订时间
              if (item.contractSignTime) {
                item.contractSignTime = new Date(item.contractSignTime).getTime();
              }
            });
          }
          // 将 fillReportTime 转换为时间戳
          if (submitData.fillReportTime) {
            submitData.fillReportTime = new Date(submitData.fillReportTime).getTime();
          }

          // 确保 submitData.tenderYear 是数字格式的 yyyy 格式
          if (submitData.tenderYear) {
            if (typeof submitData.tenderYear === 'object') {
              submitData.tenderYear = submitData.tenderYear.getFullYear();
            } else if (typeof submitData.tenderYear === 'string') {
              submitData.tenderYear = parseInt(submitData.tenderYear);
            }
          }

          await Api[`tenderStatisticsAdd`](Object.assign({ id: this.type === 'update' ? this.id : null }, submitData))
            .then(({ message }) => {
              this.loading = false;
              this.$modal.msgSuccess(message);
              this.cancel();
            })
            .finally((err) => {
              this.loading = false;
            });
        }
      });
    },
    formFillInPage () {
      return new Promise((resolve) => {
        formFillInPage('addTenderStatics').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },

    // 处理表格数据变化
    handleTableInput(newData) {
      console.log('handleTableInput called with:', newData);
    },
    // 处理招标年度变化，同步更新表格中的招标年度
    handleTenderYearChange(value) {
      if (this.formData.materialTenderInfoDOList && this.formData.materialTenderInfoDOList.length > 0) {
        this.formData.materialTenderInfoDOList.forEach(item => {
          item.tenderYear = value;
        });
      }
    },

  },
}
</script>

<style lang="scss" scoped>
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

.ellipsis-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
::v-deep .label-right-align .el-form-item__label {
  text-align: right;
}
</style>
