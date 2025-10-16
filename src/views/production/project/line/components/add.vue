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
        <template #constructionUnitSlot="{ formModel }">
          <el-form-item
            prop="constructionUnitId"
            :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
            label="建设单位"
            class="label-right-align"
          >
            <template v-if="false">
              <el-select
                v-model="formModel.constructionUnitId"
                filterable
                style="width: 100%"
                placeholder="请选择"
                @change="onUnitChange"
              >
                <el-option
                  v-for="item in constructionOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </template>
            <template v-else>
              <span>{{ formModel.constructionUnit }}</span>
            </template>
          </el-form-item>
        </template>
        <!-- 计划工期 -->
        <template #plannedDurationSlot="{ formModel }">
          <el-form-item
            prop="plannedDuration"
            :rules="[
              {
                pattern:
                  /^(?:[1-9]\d{0,4})(?:\.\d{1,2})?$|^0\.(?:0[1-9]|[1-9]\d?)$/,
                message: '请输入正确的月份数量',
                trigger: 'blur',
              },
            ]"
            label="计划工期"
            class="label-right-align"
          >
            <template v-if="type !== 'view'">
              <el-input
                v-model="formModel.plannedDuration"
                filterable
                placeholder="请输入"
              >
                <template #append>
                  <span>月</span>
                </template>
              </el-input>
            </template>
            <template v-else>
              <span>{{ formModel.plannedDuration }} </span>
              <span v-if="formModel.plannedDuration">年</span>
            </template>
          </el-form-item>
        </template>
        <!-- 设计时速 -->
        <template #designSpeedSlot="{ formModel }">
          <el-form-item
            prop="designSpeed"
            :rules="[
              {
                pattern:
                  /^(0\.(0[1-9]|[1-9]\d?)|([1-9]\d{0,3}|0)(\.\d{1,4})?)$/,
                message: '请输入正确时速',
                trigger: 'blur',
              },
            ]"
            label="设计时速"
            class="label-right-align"
          >
            <template v-if="type !== 'view'">
              <el-input
                v-model="formModel.designSpeed"
                filterable
                placeholder="请输入"
              >
                <template #append>
                  <span>公里/小时</span>
                </template>
              </el-input>
            </template>
            <template v-else>
              <span>{{ formModel.designSpeed }} </span>
              <span v-if="formModel.designSpeed">公里/小时</span>
            </template>
          </el-form-item>
        </template>
        <!-- 指挥部负责人 -->
        <template #commandPostLeaderSlot="{ formModel }">
          <el-form-item
            prop="commandPostLeader"
            :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
            label="归属建设项目"
            class="label-right-align"
          >
            <template v-if="type !== 'view' && !commandPostLeader">
              <el-select
                v-model="formModel.commandPostLeader"
                filterable
                required
                style="width: 100%"
                placeholder="请选择"
                @change="selectChange"
              >
                <el-option
                  v-for="item in commandPostLeaderOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </template>
            <template v-else>
              <span>{{ formModel.commandPostLeaderName }}</span>
            </template>
          </el-form-item>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import * as Api from '@/api/prodmgr-inv/project/line.js'
import { deptTreeAll } from '@/api/system/dept.js'
import VFormRender from '@/components/form-render/index'
import { formFillInPage } from '@/api/form/form'
import { getToken } from '@/utils/auth'
import attachmentTable from '@/views/components/attachmentTable'
import { extractSelectOptions } from '@/utils/index'
import { getUserInfo } from '@/utils/user-info'
import {userPage} from '@/api/system/user'

export default {
  name: "SectionAdd",
  dicts: ['JLDW'],
  components: {
    VFormRender,
    attachmentTable
  },
  data () {
    return {
      userInfo:getUserInfo(),
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
      // 菜单按钮、字段等数据
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
      ],
      constructionOptions: [],
      commandPostLeaderOptions:[]
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
    // this.getDeptTree()
    this.getUserList()
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
  async   getUserList(){
    const res = await userPage({
        pageNum:1,
        pageSize:1000,
        deptId:this.userInfo.instituteId
      })
      if(res.code == 0){

        this.commandPostLeaderOptions = res.data.list.map(x => ({
          ...x,
          label:x.nickName,
          value:x.id
        })) 
      }
    },
    selectChange (val) {
      const selectItem = this.commandPostLeaderOptions.find(item => item.value === val)
      this.$refs.vFormRef.setFormData({
        commandPostLeaderName: selectItem?.label || ''
      })
    },
    onUnitChange (val) {
      this.$refs.vFormRef.setFormData({
        constructionUnit: this.constructionOptions.find(item => item.value === val)?.label
      })
    },

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
          await this.formFillInPage()
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
        formFillInPage('lineProject').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)

          this.$refs['vFormRef'].setFormData({
            constructionUnitId: this.userInfo.instituteId,
            constructionUnit: this.userInfo.instituteName
          })


          resolve(true)
        })
      })
    },
    async getDeptTree () {
      const res = await deptTreeAll({
        deptCodeQueryAll: 'JSDW'
      })
      this.constructionOptions = extractSelectOptions(res.data[0])

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
</style>