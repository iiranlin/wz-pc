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
        <template #lineSlot="{ formModel }">
          <el-form-item
            prop="projectId"
            :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
            label="归属建设项目"
            class="label-right-align"
          >
            <template v-if="type !== 'view' && !projectId">
              <el-select
                v-model="formModel.projectId"
                filterable
                required
                style="width: 100%"
                placeholder="请选择"
                @change="(val) => selectChange(lineOptions, val, 'projectName')"
              >
                <el-option
                  v-for="item in lineOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </template>
            <template v-else>
              <span>{{ formModel.projectName }}</span>
            </template>
          </el-form-item>
        </template>
        <!--施工单位  -->
        <template #constructionCompanySlot="{ formModel }">
          <el-form-item
            prop="constructionCompanyId"
            :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
            label="施工单位"
            class="label-right-align"
          >
            <template v-if="type !== 'view'">
              <el-select
                v-model="formModel.constructionCompanyId"
                filterable
                required
                style="width: 100%"
                placeholder="请选择"
                @change="
                  (val) =>
                    selectChange(
                      constructionCompanyOptions,
                      val,
                      'constructionCompany'
                    )
                "
              >
                <el-option
                  v-for="item in constructionCompanyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </template>
            <template v-else>
              <span>{{ formModel.constructionCompany }}</span>
            </template>
          </el-form-item>
        </template>
        <!-- 监理单位 -->
        <template #supervisionUnitSlot="{ formModel }">
          <el-form-item
            prop="supervisionUnitId"
            :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
            label="监理单位"
            class="label-right-align"
          >
            <template v-if="type !== 'view'">
              <el-select
                v-model="formModel.supervisionUnitId"
                filterable
                required
                style="width: 100%"
                placeholder="请选择"
                multiple
                @change="
                  (val) =>
                    selectChange(supervisionUnitOptions, val, 'supervisionUnit')
                "
              >
                <el-option
                  v-for="item in supervisionUnitOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </template>
            <template v-else>
              <span>{{ formModel.supervisionUnit }}</span>
            </template>
          </el-form-item>
        </template>
        <!-- 物资代理机构 -->
        <template #materialAgentCompanySlot="{ formModel }">
          <el-form-item
            prop="materialAgentCompanyId"
            :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
            label="物资代理机构"
            class="label-right-align"
          >
            <template v-if="type !== 'view'">
              <el-select
                v-model="formModel.materialAgentCompanyId"
                filterable
                required
                style="width: 100%"
                placeholder="请选择"
                @change="
                  (val) =>
                    selectChange(
                      materialAgentCompanyOptions,
                      val,
                      'materialAgentCompany'
                    )
                "
              >
                <el-option
                  v-for="item in materialAgentCompanyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </template>
            <template v-else>
              <span>{{ formModel.materialAgentCompany }}</span>
            </template>
          </el-form-item>
        </template>
        <!-- 物资代理机构联络人 -->
        <template #materialAgentLeaderSlot="{ formModel }">
          <el-form-item
            prop="materialAgentLeaderId"
            :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
            label="物资代理机构联络人"
            class="label-right-align"
          >
            <template v-if="type !== 'view'">
              <el-select
                v-model="formModel.materialAgentLeaderId"
                filterable
                required
                multiple
                style="width: 100%"
                placeholder="请选择"
                @change="
                  (val) =>
                    selectChange(
                      materialAgentLeaderOptions,
                      val,
                      'materialAgentLeader'
                    )
                "
              >
                <el-option
                  v-for="item in materialAgentLeaderOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </template>
            <template v-else>
              <span>{{ formModel.materialAgentLeader }}</span>
            </template>
          </el-form-item>
        </template>
        <template #submitDateConfigSlot="{ formModel }">
          <el-form-item
            prop="submitDateConfig"
            label="计划提交日期"
            class="label-right-align"
          >
            <el-popover
              v-if="type !== 'view'"
              v-model="submitDatePopoverVisible"
              placement="bottom-start"
              trigger="click"
              width="420"
              class="submit-date-popover"
            >
              <div class="submit-date-calendar">
                <button
                  v-for="day in submitDateOptions"
                  :key="day"
                  type="button"
                  class="submit-date-calendar__day"
                  :class="{ 'is-selected': isSubmitDateSelected(formModel, day) }"
                  @click="handleSubmitDateClick($event, formModel, day)"
                >
                  {{ day }}号
                </button>
              </div>
               <div class="submit-date-calendar__tip">
                选中的日期为允许计划提交日期，不选择表示无限制;
              </div>
              <div class="submit-date-calendar__tip">
                可多选，按住 Shift 可连续选择日期；
              </div>
              <div class="submit-date-calendar__actions">
                <el-button
                  size="mini"
                  @click="clearSubmitDateConfig(formModel)"
                >
                  清空
                </el-button>
                <el-button
                  type="primary"
                  size="mini"
                  @click="submitDatePopoverVisible = false"
                  style="margin-left: 8px"
                >
                  确定
                </el-button>
              </div>
              <el-button
                slot="reference"
                class="submit-date-trigger"
              >
                {{ getSubmitDateButtonText(formModel) }}
              </el-button>
            </el-popover>
            <div v-else class="submit-date-calendar">
              <span
                v-for="day in submitDateOptions"
                :key="day"
                class="submit-date-calendar__day is-readonly"
                :class="{ 'is-selected': isSubmitDateSelected(formModel, day) }"
              >
                {{ day }}号
              </span>
            </div>
            <div v-if="type === 'view'" class="submit-date-calendar__tip">
              {{ getSubmitDateConfig(formModel).length ? '高亮日期为允许提交日期' : '无限制' }}
            </div>
          </el-form-item>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import * as Api from '@/api/prodmgr-inv/project/section.js'
import * as LineApi from '@/api/prodmgr-inv/project/line.js'
import VFormRender from '@/components/form-render/index'
import { formFillInPage } from '@/api/form/form'
import { getToken } from '@/utils/auth'
import attachmentTable from '@/views/components/attachmentTable'
import { newListByDeptCode } from '@/api/system/dept.js'
import { extractSelectOptions } from '@/utils/index'
import { userListAll } from '@/api/system/user';
export default {
  name: "SectionAdd",
  dicts: ['JLDW'],
  components: {
    VFormRender,
    attachmentTable
  },
  data () {
    return {
      loading: false,
      title: '新增',
      checked: false,
      //   fileList type
      // type: 'create', //update , view ,create
      fileList: [],
      formJson: {
      },
      formData: {},
      optionData: {},
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: '24'
      },
      lineOptions: [],
      constructionCompanyOptions: [],
      supervisionUnitOptions: [],
      materialAgentCompanyOptions: [],
      materialAgentLeaderOptions: [],
      submitDateOptions: Array.from({ length: 31 }, (_, index) => String(index + 1)),
      submitDateAnchor: null,
      submitDatePopoverVisible: false,
      // 菜单按钮、字段等数据
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
      ],
      constructionOptions: [],
    }
  },
  computed: {
    type () {
      return this.$route.query.type
    },
    id () {
      return this.$route.query?.id || ''
    },
    projectId () {
      return this.$route.query?.projectId || ''
    },
  },
  async created () {
    // this.getDeptTree()
    // this.getLineOptions()


    this.constructionCompanyOptions = await this.getDeptTree('ZB')
    this.supervisionUnitOptions = await this.getDeptTree('JL')
    this.materialAgentCompanyOptions = await this.getDeptTree('WZDL')
  },
  mounted () {

    if (['view', 'update'].includes(this.type)) {
      this.updateInit(this.id)
      return
    }

    if (this.type === 'create') {
      this.init()
      return
    }

  },
  methods: {
    //初始化
    init () {
      this.$nextTick(async () => {
        this.title = "新建";
        await this.formFillInPage()
        this.getLineOptions()

      });
    },
    // 编辑初始化
    async updateInit (id) {
      await Api.detail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";
          await this.formFillInPage()
          this.getLineOptions()
          this.selectChange(this.materialAgentCompanyOptions, data.materialAgentCompanyId, 'materialAgentCompany')
          
          // 处理监理单位数据：将逗号分隔的字符串转换为数组
          if (data.supervisionUnitId && typeof data.supervisionUnitId === 'string') {
            data.supervisionUnitId = data.supervisionUnitId.split(',')
          }
          if(data.projectType && typeof data.projectType === 'string'){
            data.projectType = data.projectType.split(',')
          }
          if(data.materialAgentLeaderId && typeof data.materialAgentLeaderId === 'string'){
            data.materialAgentLeaderId = data.materialAgentLeaderId.split(',')
          }
          data.submitDateConfig = this.parseSubmitDateConfig(data.submitDateConfig)
          
          this.$refs.vFormRef.setFormData(data)
          this.$refs.vFormRef.setReadMode(this.type === 'view')
        });
      });
    },
    async getLineOptions () {
      const res = await LineApi.itemList({
        pageNum: 1,
        pageSize: -1,
      })
      this.lineOptions = res.data.list.map(item => {
        return {
          value: item.id,
          label: item.projectName
        }
      })

      this.$refs['vFormRef'].setFormData({
        projectName: this.lineOptions.find(item => item.value === this.projectId).label
      })

      // 如果有projectId 则默认赋值归属项目，并且禁用归属线路项目选项
      if (this.projectId) {
        this.$refs['vFormRef'].setFormData({
          projectId: this.projectId,
        })
      }
    },
    async getDeptTree (deptCodePrefix ,status = '') {
      const res = await newListByDeptCode({
        deptCodePrefix,
        status
      })
      const data = res.data.map(item => {
        return {
          value: item.id,
          label: item.deptName
        }
      })
      return Promise.resolve(data)
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
      this.$router.go(-1)
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
        console.log(valid, 'valid')
        if (valid) {
          this.loading = true;
          const formData = await this.$refs.vFormRef.getFormData();
          
          // 处理监理单位多选数据：将数组转换为逗号分隔的字符串
          if (Array.isArray(formData.supervisionUnitId)) {
            formData.supervisionUnitId = formData.supervisionUnitId.join(',')
          }
          if (Array.isArray(formData.projectType)) {
            formData.projectType = formData.projectType.join(',')
          }
          if (Array.isArray(formData.materialAgentLeaderId)) {
            formData.materialAgentLeaderId = formData.materialAgentLeaderId.join(',')
          }
          formData.submitDateConfig = Array.isArray(formData.submitDateConfig) && formData.submitDateConfig.length
            ? JSON.stringify(this.sortSubmitDates(formData.submitDateConfig).map(Number))
            : ''
          
          await Api[
            this.type === 'update' ? `edit` : `save`
          ](Object.assign({ id: this.type === 'update' ? this.id : null }, formData))
            .then(({ message }) => {
              this.loading = false;
              this.$modal.msgSuccess(message);
              this.cancel();
            })
            .catch(async ()=>{
               const formData = await this.$refs.vFormRef.getFormData();
              formData.supervisionUnitId = formData.supervisionUnitId.split(',')
              formData.projectType = formData.projectType.split(',')
              formData.materialAgentLeaderId = formData.materialAgentLeaderId.split(',')
              formData.submitDateConfig = this.parseSubmitDateConfig(formData.submitDateConfig)
            })
            .finally((err) => {
              this.loading = false;
            });
        }
      });
    },
    checkoutStatus (flag) {
      const widgets = ['scrapName', 'sugHandMethod', 'applyDeptId', 'applyUserId', 'comments', 'fileList', 'design_p2', 'projectCode', 'projectName', 'scrapCode', 'grid96921', 'grid45899', 'grid80913']
      if (flag) {
        this.$refs.vFormRef.hideWidgets(widgets)
      } else {
        this.$refs.vFormRef.showWidgets(widgets)
      }
    },
    formFillInPage () {
      return new Promise((resolve) => {
        formFillInPage('sectionProject').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          //   form action
          this.$refs['vFormRef'].setReadMode(false)


          resolve(true)
        })
      })
    },
    async selectChange (options, val, key) {
      if (Array.isArray(val)) {
        // 多选情况：将选中的值转换为逗号分隔的字符串
        const labels = val.map(v => options.find(item => item.value === v)?.label).filter(Boolean)
        this.$refs.vFormRef.setFormData({
          [key]: labels.join(',')
        })
      } else {
        // 单选情况
        this.$refs.vFormRef.setFormData({
          [key]: options.find(item => item.value === val)?.label
        })

        // 选择物资代理机构时，获取对应公司的物资代理机构联络人
        if (key === 'materialAgentCompany') {
          this.getmaterialAgentLeaderOptions(val);
        }
      }
    },
    async getmaterialAgentLeaderOptions(deptId) {

      // 变化后清空物资代理机构联络人选项和已选值
      this.materialAgentLeaderOptions = [];
      this.$refs.vFormRef.setFormData({
        materialAgentLeader: '',
        materialAgentLeaderId: ''
      });

      const params = {
        pageNum: 1,
        pageSize: -1,
        isAsc: '',
        orderByColumn: '',
        deptId: deptId,
        status: 0
      };

      await userListAll(params).then(({ data }) => {
        this.materialAgentLeaderOptions = data.list.map(item => {
          return {
            value: item.id,
            label: item.nickName
          }
        });
      })
    },
    // 将后端日期配置转换为日历组件使用的字符串数组
    parseSubmitDateConfig (value) {
      if (Array.isArray(value)) {
        return this.sortSubmitDates(value)
      }
      if (!value) {
        return []
      }
      try {
        const parsedValue = JSON.parse(value)
        return Array.isArray(parsedValue) ? this.sortSubmitDates(parsedValue) : []
      } catch (error) {
        return []
      }
    },
    // 去重、过滤并按日期先后顺序排列
    sortSubmitDates (dates) {
      return [...new Set(dates.map(String))]
        .filter(day => this.submitDateOptions.includes(day))
        .sort((a, b) => Number(a) - Number(b))
    },
    // 获取当前表单中已选择的日期
    getSubmitDateConfig (formModel) {
      return Array.isArray(formModel.submitDateConfig)
        ? formModel.submitDateConfig
        : this.parseSubmitDateConfig(formModel.submitDateConfig)
    },
    // 判断指定日期是否已选中
    isSubmitDateSelected (formModel, day) {
      return this.getSubmitDateConfig(formModel).includes(day)
    },
    // 根据已选日期数量生成选择按钮文字
    getSubmitDateButtonText (formModel) {
      const selectedCount = this.getSubmitDateConfig(formModel).length
      return selectedCount ? `已选择 ${selectedCount} 个日期` : '请选择计划提交日期'
    },
    // 清空全部计划提交日期
    clearSubmitDateConfig (formModel) {
      this.$set(formModel, 'submitDateConfig', [])
      this.submitDateAnchor = null
    },
    // 处理单个日期切换及 Shift 连续选择
    handleSubmitDateClick (event, formModel, day) {
      const selectedDates = this.getSubmitDateConfig(formModel)
      let nextDates = [...selectedDates]

      if (event.shiftKey && this.submitDateAnchor) {
        const start = Math.min(Number(this.submitDateAnchor), Number(day))
        const end = Math.max(Number(this.submitDateAnchor), Number(day))
        const range = Array.from({ length: end - start + 1 }, (_, index) => String(start + index))
        nextDates = this.sortSubmitDates([...nextDates, ...range])
      } else if (nextDates.includes(day)) {
        nextDates = nextDates.filter(item => item !== day)
      } else {
        nextDates.push(day)
      }

      this.$set(formModel, 'submitDateConfig', this.sortSubmitDates(nextDates))
      this.submitDateAnchor = day
    }
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

::v-deep .label-right-align .el-form-item__label {
  text-align: right;
}

.submit-date-calendar {
  display: grid;
  grid-template-columns: repeat(7, minmax(44px, 1fr));
  gap: 8px;
  width: 100%;
}

.submit-date-calendar__day {
  height: 34px;
  padding: 0;
  color: #606266;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

.submit-date-calendar__day:hover {
  color: #409eff;
  border-color: #409eff;
}

.submit-date-calendar__day.is-selected {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

.submit-date-calendar__day.is-readonly {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}

.submit-date-calendar__day.is-readonly:not(.is-selected) {
  color: #c0c4cc;
  background: #f5f7fa;
}

.submit-date-calendar__tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}

.submit-date-calendar__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.submit-date-trigger {
  width: 100%;
  overflow: hidden;
  color: #606266;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.submit-date-popover {
  display: block;
  width: 100%;
}
</style>
