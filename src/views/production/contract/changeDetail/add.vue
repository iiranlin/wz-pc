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
        <template #table>
          <TabTable
            ref="tabTableRef"
            :tableData="tableData"
            @data-change="onDataChange"
            :sellerName="currentSellerName"
          />
        </template>
        <!-- 合同变更内容 -->
        <template #changeTable>
          <RecordTable :tableData="recordData" />
        </template>
        <!-- 附件 -->
        <template #fileListSlot="scope">
          <el-form-item
            prop="fileList"
            label="合同附件"
            class="label-right-align"
          >
            <fileUpload
              v-model="scope.formModel.fileList"
              :limit="1"
              :fileSize="500"
              :fileType="['pdf']"
              :preview="type === 'view'"
            />
          </el-form-item>
        </template>
         <template #fileListGgSlot="scope">
          <el-form-item prop="fileList1" label="技术规格书" class="label-right-align">
            <fileUpload v-model="scope.formModel.fileList1" :limit="1" :fileSize="500" :fileType="['pdf']"
              :preview="type === 'view'" />
          </el-form-item>

        </template>
          <!--卖方单位  -->
        <template #sellerSlot="{ formModel }">
          <el-form-item
            prop="sellerId"
            :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
            label="卖方"
            class="label-right-align"
          >
            <template v-if="type !== 'view'">
              <el-select
                v-model="formModel.sellerId"
                filterable
                required
                style="width: 100%"
                placeholder="请选择"
                @change="(val) => selectChange(gysOptions, val, 'seller')"
              >
                <el-option
                  v-for="item in gysOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </template>
            <template v-else>
              <span>{{ formModel.seller }}</span>
            </template>
          </el-form-item>
        </template>
        <template #lineSlot="{ formModel }">
          <el-form-item
            prop="projectId"
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
      </VFormRender>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import * as Api from '@/api/prodmgr-inv/project/contract.js'
import * as LineApi from '@/api/prodmgr-inv/project/line.js'
import TabTable from './tabTable.vue'
import VFormRender from '@/components/form-render/index'
import { formFillInPage } from '@/api/form/form'
import { getToken } from '@/utils/auth'
import fileUpload from '@/components/upload'
import { listByDeptCode } from '@/api/system/dept.js'
import { getUserInfo } from '@/utils/user-info'
import RecordTable from './recordTable.vue'
export default {
  // 1: 变更保存预览   2：变更内容查看  顶部按钮不同
  name: "ChangeTable",
  components: {
    VFormRender,
    fileUpload,
    TabTable,
    RecordTable
  },
  data () {
    const userInfo = getUserInfo()
    return {
      userInfo,
      maxManualIndex: 1,
      buyer: userInfo?.instituteName,
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
      gysOptions: [],
      tableData: [],
      removeMaterial: [],
      updateMaterial: {},
      recordData: [],
      sellerName: '' // 添加sellerName数据属性
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
    // 1: 变更保存预览   2：变更内容查看  顶部按钮不同
    status () {
      return this.$route.query?.status || ''
    },
    currentSellerName () {
      // 确保返回字符串类型的卖方名称
      const sellerValue = this.$refs.vFormRef?.getFieldValue('seller');
      if (Array.isArray(sellerValue)) {
        // 如果返回数组，取第一个元素或空字符串
        return sellerValue.length > 0 ? String(sellerValue[0]) : '';
      }

      return String(sellerValue || '');
    }
  },
  async created () {
    this.getLineOptions()
    this.gysOptions = await this.getDeptTree('GYS')
  },
  mounted () {
    this.$refs['vFormRef'].setFormData({
      buyer: this.buyer
    })

    if (this.status == '1') {
      this.buttonTop = [
        { buttonName: '取消变更', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'view' },
        { buttonName: '确定变更', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'view' },
      ]
    } else {
      this.buttonTop = [
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'view' },

      ]
    }


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
    onDataChange (data) {
      if (data.type === 'delete') {
        this.tableData = this.tableData.filter(item => !data.row.includes(item.id + ''))
        this.removeMaterial.push(...data.row.map(x => ({ id: x ,...x})))
        return
      }

      if (data.type === 'add') {
        this.onAdd()
        return
      }
      if (!['delete', 'add'].includes(data.type)) {

        // 修改的数据，将整条数据存储
        const rows = this.tableData.find(item => item.id === data.row.id && item.type !== 'add')
        if (rows) {
          this.updateMaterial[rows.id] = rows
        }

      }
    },
    onAdd () {
      this.maxManualIndex += 1
      const newId = this.maxManualIndex + ''
      // 创建新行数据模板
      const newRow = {
        id: newId,
        isManual: true, // 标记为手动添加的行
        materialName: '', // 物资名称
        projectShortName: '', // 项目简称
        sectionName: '', // 标段项目名称
        sellerName: this.currentSellerName, // 卖方名称 - 修复：使用计算属性确保返回字符串
        specModel: '', // 规格型号
        standardCode: '', // 标准或图号
        unit: '', // 计量单位
        amount: 0, // 数量
        price: 0, // 到站不含税单价
        vatRate: '', // 物资增值税率
        taxPrice: 0, // 到站含税单价
        totalAmount: 0, // 到站合价含税
        deliveryLocation: '', // 交货地点
        receiver: '', // 收货人
        deliveryStatus: '', // 交货状态
        deliveryTerms: '', // 交货条件
        deliveryDate: '', // 交货期
        type: 'add',//增加操作标识符
      };
      // 将新行添加到表格数据中
      this.tableData.push(newRow);
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
          const backChangeData = this.$store.state.project.backChangeData
          // fileList回显
          const newData = {
            ...data,
            ...backChangeData,
            fileList: this.status == '1' ? backChangeData?.fileList : data.fileList[0].fileList,
            fileList1: this.status == '1' ? backChangeData?.fileList1 : data.fileList[1].fileList,
            contractStatus: data.contractStatus == '2',
          }
          this.$refs.vFormRef.setFormData(newData)

          // 设置 sellerName 数据属性，确保新增行时能正确获取卖方名称
          this.sellerName = data.seller;

          //   form action
          this.$refs.vFormRef.setReadMode(this.type === 'view')

          this.tableData = this.status == '1'? this.$store.state?.project?.selectList : data?.materialList
          this.recordData = this.status == '1' ? this.$store.state.project.contractChangeDetail : data.updateDetails
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
      this.$store.dispatch('setProjectId', '')
      this.$store.dispatch('setBackChangeData', {})
      this.$store.dispatch('setContractChangeDetail', {})
      this.$store.dispatch('setSelectList', [])
      this.$tab.closeOpenPage({ name: 'changeViewContract' });
    },

    buttonShow (item) {
      // if (item.buttonCode === 'save') {
      //   return this.type !== 'view'
      // }
      return true
    },
    //新建
    handleCreate () {
      this.$refs.vFormRef.validateForm(async (valid) => {
        if (!valid) {
          this.$message.warning('请完善变更信息')
          return
        }
        // 校验表格
        const tableValid = this.$refs.tabTableRef.onCheck()
        if (!tableValid) {
          return
        }

        // 如果表格内数据为空，则提示
        if (this.tableData.length === 0) {
          this.$message.warning('请添加合同物资科目')
          return
        }

        if (valid) {
          this.loading = true;
          const formData = await this.$refs.vFormRef.getFormData();
          formData.contractStatus = formData.contractStatus ? '2' : '1'
          // 后端存入嵌套数组
          const fileList = formData.fileList
          const fileList1 = formData.fileList1.map(x => ({...x,id:null}))
          await Api[
            `changeList`
          ]({
            ...this.$store.state.project.backChangeData,
            fileList: [{ fileList },{fileList:fileList1}],
            saveStatus: true
          })
            .then(({ message }) => {
              this.loading = false;
              this.$modal.msgSuccess(message);

              this.$router.push({
                name: 'contractList'
              })
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
        formFillInPage('contractChangeDetail').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)

          // 如果有projectId 则默认赋值归属项目，并且禁用归属建设项目选项
          if (this.projectId) {
            this.$refs['vFormRef'].setFormData({
              projectId: this.projectId,
              projectName: this.lineOptions.find(item => item.value === this.projectId).label
            })
          }

          this.$refs['vFormRef'].setFormData({
            buyer: this.buyer
          })

          resolve(true)
        })
      })
    },
    selectChange (options, val, key) {
      this.$refs.vFormRef.setFormData({
        [key]: options.find(item => item.value === val)?.label
      })

      if (key === 'projectName') {
        this.$store.dispatch('setProjectId', val)
      }
      // 当选择卖方时，同步更新tabTable中所有行的卖方数据
      if (key === 'seller') {
        const selectedSeller = options.find(item => item.value === val)
        if (selectedSeller) {
          // 更新sellerName数据属性
          this.sellerName = selectedSeller.label;
          // 更新tableData中所有行的卖方信息
          this.tableData.forEach(row => {
            row.sellerName = selectedSeller.label
          })
        }
      }

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