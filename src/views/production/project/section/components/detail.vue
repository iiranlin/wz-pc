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
              <el-tooltip
                :content="formModel.projectName"
                placement="bottom"
                effect="light"
              >
                <div
                  style="
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                  "
                >
                  {{ formModel.projectName }}
                </div>
              </el-tooltip>
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
              <el-tooltip
                :content="formModel.constructionCompany"
                placement="bottom"
                effect="light"
              >
                <div
                  style="
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                  "
                >
                  {{ formModel.constructionCompany }}
                </div>
              </el-tooltip>
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
                multiple
                style="width: 100%"
                placeholder="请选择"
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
              <el-tooltip
                :content="formModel.supervisionUnit"
                placement="bottom"
                effect="light"
              >
                <div
                  style="
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                  "
                >
                  {{ formModel.supervisionUnit }}
                </div>
              </el-tooltip>
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
              <el-tooltip
                :content="formModel.materialAgentCompany"
                placement="bottom"
                effect="light"
              >
                <div
                  style="
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                  "
                >
                  {{ formModel.materialAgentCompany }}
                </div>
              </el-tooltip>
            </template>
          </el-form-item>
        </template>
        <template #submitDateConfigSlot="{ formModel }">
          <el-form-item
            prop="submitDateConfig"
            label="计划提交日期"
            class="label-right-align"
          >
            <div class="submit-date-calendar">
              <span
                v-for="day in submitDateOptions"
                :key="day"
                class="submit-date-calendar__day"
                :class="{ 'is-selected': isSubmitDateSelected(formModel, day) }"
              >
                {{ day }}号
              </span>
            </div>
            <div class="submit-date-calendar__tip">
              {{ getSubmitDateConfig(formModel).length ? '高亮日期为允许提交日期' : '无限制' }}
            </div>
          </el-form-item>
        </template>
        <template #table>
          <TabTable
            ref="tabTableRef"
            :tableData="tableData"
            :sellerName="$refs.vFormRef.getFieldValue('seller')"
          />
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
import { listByDeptCode } from '@/api/system/dept.js'
import { extractSelectOptions } from '@/utils/index'
import TabTable from './tabTable.vue'
export default {
  name: "SectionAdd",
  dicts: ['JLDW'],
  components: {
    VFormRender,
    attachmentTable,
    TabTable
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
      submitDateOptions: Array.from({ length: 31 }, (_, index) => String(index + 1)),
      // 菜单按钮、字段等数据
      buttonTop: [
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
      ],
      constructionOptions: [],
      tableData: [],
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
    this.getLineOptions()


    this.constructionCompanyOptions = await this.getDeptTree('SGDW')
    this.supervisionUnitOptions = await this.getDeptTree('JLDW')
    this.materialAgentCompanyOptions = await this.getDeptTree('WZDLGS')
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
      });
    },
    // 编辑初始化
    async updateInit (id) {
      await Api.detail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";
           // 处理监理单位数据：将逗号分隔的字符串转换为数组
          if (data.supervisionUnitId && typeof data.supervisionUnitId === 'string') {
            data.supervisionUnitId = data.supervisionUnitId.split(',')
          }
          if(data.supervisionUnit && typeof data.supervisionUnit === 'string'){
            data.supervisionUnit = data.supervisionUnit
          }
          if(data.projectType && typeof data.projectType === 'string'){
            data.projectType = data.projectType
          }
          data.submitDateConfig = this.parseSubmitDateConfig(data.submitDateConfig)
          await this.formFillInPage()
          this.$refs.vFormRef.setFormData(data)

          this.tableData = data.materialList
          //   form action
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
    },
    async getDeptTree (deptCode) {
      const res = await listByDeptCode({
        deptCode
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
      this.$tab.closeOpenPage(true)
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
          await Api[
            this.type === 'update' ? `edit` : `save`
          ](Object.assign({ id: this.type === 'update' ? this.id : null }, formData))
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
        formFillInPage('sectionProjectDetail').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          //   form action
          this.$refs['vFormRef'].setReadMode(false)

          // 如果有projectId 则默认赋值归属项目，并且禁用归属建设项目选项
          if (this.projectId) {
            this.$refs['vFormRef'].setFormData({
              projectId: this.projectId,
              projectName: this.lineOptions.find(item => item.value === this.projectId).label
            })
          }
          resolve(true)
        })
      })
    },
    selectChange (options, val, key) {
      this.$refs.vFormRef.setFormData({
        [key]: options.find(item => item.value === val)?.label
      })
    },
    // 将后端日期配置转换为详情日历使用的字符串数组
    parseSubmitDateConfig (value) {
      if (Array.isArray(value)) {
        return value.map(String)
      }
      if (!value) {
        return []
      }
      try {
        const parsedValue = JSON.parse(value)
        return Array.isArray(parsedValue) ? parsedValue.map(String) : []
      } catch (error) {
        return []
      }
    },
    // 获取详情中配置的计划提交日期
    getSubmitDateConfig (formModel) {
      return Array.isArray(formModel.submitDateConfig)
        ? formModel.submitDateConfig
        : this.parseSubmitDateConfig(formModel.submitDateConfig)
    },
    // 判断指定日期是否需要高亮展示
    isSubmitDateSelected (formModel, day) {
      return this.getSubmitDateConfig(formModel).includes(day)
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  color: #c0c4cc;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.submit-date-calendar__day.is-selected {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

.submit-date-calendar__tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}
</style>
