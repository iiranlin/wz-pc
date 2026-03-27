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
        <template #projectSlot="{ formModel }">
          <el-form-item
            prop="tenderProjectId"
            :rules="[{ required: true, message: '请选择项目', trigger: 'change' }]"
            label="项目："
            class="label-right-align"
          >
              <el-select v-if="type !== 'view'"
                v-model="formModel.tenderProjectId"
                filterable
                style="width: 100%"
                placeholder="请选择"
                @change="handleProjectChange"
              >
                <el-option
                  v-for="item in lineOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
              <span v-else>{{ formModel.tenderProjectName }}</span>
          </el-form-item>
          
        </template>
        
         <template #personNameSlot>
          <el-form-item
            prop="tendererName"
            label="招标人名称："
            class="label-right-align"
          >
            <el-tooltip :content="formData.tendererName" placement="top" effect="dark">
              <span class="ellipsis-text">{{ formData.tendererName }}</span>
            </el-tooltip>
          </el-form-item>
         </template>

         <!-- 物资类别 -->
          <template #itemTypeSlot="{ formModel }">
          <el-form-item required
            prop="materialCategory"
            :rules="[{ required: true, message: '请选择物资类别', trigger: 'change' }]"
            label="物资类别："
            class="label-right-align"
          >
              <el-select
              v-if="type !== 'view'"
                v-model="formModel.materialCategory"
                filterable
                style="width: 100%"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in dict.type.WZDL"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <span v-else>{{ formModel.materialCategory }}</span>
          </el-form-item>
        </template>

        <!-- 计量单位选择插槽 -->
        <template #measurementUnitSlot="{ formModel }">
           <el-form-item label="计量单位：" prop="measureUnit" required class="label-right-align">
              <el-select
                v-model="formModel.measureUnit"
                placeholder="请选择"
                style="width: 100%"
                filterable
                v-if="type !== 'view'"
              >
                <el-option
                  v-for="item in dict.type.MeasureUnit"
                  :key="item.value"
                  :label="item.label"
                  :value="item.label"
                />
              </el-select>

              <span v-else>
                {{formModel.measureUnit}}
              </span>
            </el-form-item>
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
export default {
  name: "addBiddingInfo",
  dicts: ["MeasureUnit", "WZDL"],
  components: {
    VFormRender
  },
  data () {
    return {
      loading: false,
      title: '新增',
      checked: false,
      fileList: [],
      formJson: {
      },
      formData: {
        tendererName: ''
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
  created () {
    this.getLineOptions()
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
     getLineOptions() {
       LineApi.lineSelectOptions().then(({ data }) => {
        this.lineOptions = data.map(x => ({
          label: x.projectName,
          value: x.id
        }))
      })
    },

    //获取招标人名称
    async getTendererNames() {
      try {
        const response = await Api.getTendererNames();
        if (response.data && response.data.length > 0) {
          this.formData.tendererName = response.data[0].name || '默认招标人';
        }
        // 更新VFormRender中的表单数据
        if (this.$refs.vFormRef) {
          this.$refs.vFormRef.setFormData({ tendererName: this.formData.tendererName });
        }
      } catch (error) {
        console.error('获取招标人名称失败:', error);
      }
    },

    // 处理项目选择变化
    handleProjectChange(projectId) {
      // 根据选择的项目id找到对应的项目名字
      const selectedProject = this.lineOptions.find(item => item.value === projectId);
      if (selectedProject) {
        // 更新
        this.formData.tenderProjectName = selectedProject.label;
        // 更新VFormRender中的表单数据
        if (this.$refs.vFormRef) {
          this.$refs.vFormRef.setFormData({ tenderProjectName: selectedProject.label });
        }
      }
    },

    //初始化
    init () {
      this.$nextTick(async () => {
        this.title = "新建";
        await this.formFillInPage();
        // 获取招标人名称
        await this.getTendererNames();
      });
    },
    // 编辑初始化
    async updateInit (id) {
      await Api.biddingInfoDetail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";
          await this.formFillInPage()
           this.formData.tendererName = data.tendererName || ''
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
          const formData = await this.$refs.vFormRef.getFormData();
          await Api[`biddingInfoAdd`](Object.assign({ id: this.type === 'update' ? this.id : null }, formData))
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
        formFillInPage('addBidInfo').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
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

::v-deep .label-right-align .el-form-item__label {
  text-align: right;
}

.ellipsis-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
