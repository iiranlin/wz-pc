<template>
	<div class="app-container container_flex">
		<button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
		<div :class="{ container_flex_form: type === 'view' }">
			<VFormRender :form-json="formJson" :form-data="formData" :option-data="optionData" ref="vFormRef"
				:global-dsv="globalDsv" :class="{ formRender_view: type === 'view' }">
				<template #projefctNameSolt="{ formModel }">
					<el-form-item prop="projefctName" label="标段项目:" class="label-right-align">
						<template v-if="type === 'create'">
							<span>{{projectData.projectName}}</span>
						</template>
						<template v-else>
							<span>{{formModel.projefctName}}</span>
						</template>
					</el-form-item>
				</template>

				<template #unitNameSlot="{ formModel }">
					<el-form-item prop="unitName" label="采购单位:" class="label-right-align">
						<template v-if="type === 'create'">
							<span>{{projectData.constructionCompany}}</span>
						</template>
						<template v-else>
							<span>{{formModel.unitName}}</span>
						</template>
					</el-form-item>
				</template>
				<template #codeSolt="{ formModel }">
					<el-form-item prop="code" :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
						label="物资大类" class="label-right-align">
						<template v-if="type !== 'view'">
							<el-select v-model="formModel.code" filterable required style="width: 100%"
								placeholder="请选择"
								@change="(val) => selectDataChange(dict.type.purchase_code, val, 'code')">
								<el-option v-for="item in dict.type.purchase_code" :key="item.value" :label="item.label"
									:value="item.value">
								</el-option>
							</el-select>
						</template>
						<template v-else>
							<span>{{ formModel.name }}</span>
						</template>
					</el-form-item>
				</template>

				<template #purchaseCodeSolt="{ formModel }">
					<el-form-item prop="purchaseCode" :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
						label="类别" class="label-right-align">
						<template v-if="type !== 'view'">
							<el-select v-model="formModel.purchaseCode" filterable required style="width: 100%"
								placeholder="请选择"
								@change="(val) => selectDataChange(purchaseItem, val, 'purchaseCode')">
								<el-option v-for="item in purchaseItem" :key="item.purchaseCode"
									:label="item.purchaseName" :value="item.purchaseCode">
								</el-option>
							</el-select>
						</template>
						<template v-else>
							<span>{{ formModel.purchaseName }}</span>
						</template>
					</el-form-item>
				</template>

				<template #purchaseTypeCodeSolt="{ formModel }">
					<el-form-item prop="purchaseTypeCode"
						:rules="[{ required: true, message: '请选择', trigger: 'change' }]" label="物资种类"
						class="label-right-align">
						<template v-if="type !== 'view'">
							<el-select v-model="formModel.purchaseTypeCode" filterable required style="width: 100%"
								placeholder="请选择"
								@change="(val) => selectDataChange(purchaseType, val, 'purchaseTypeCode')">
								<el-option v-for="item in purchaseType" :key="item.purchaseTypeCode"
									:label="item.purchaseTypeName" :value="item.purchaseTypeCode">
								</el-option>
							</el-select>
						</template>
						<template v-else>
							<span>{{ formModel.purchaseTypeName }}</span>
						</template>
					</el-form-item>
				</template>

				<template #purchaseDetailCodeSolt="{ formModel }">
					<el-form-item prop="purchaseDetailCode" 
						:rules="[{ required: true, message: '请选择', trigger: 'change' }]" label="物资细目"
						class="label-right-align">
						<template v-if="type !== 'view'">
							<el-select v-model="formModel.purchaseDetailCode" filterable required style="width: 100%"
								placeholder="请选择"
								@change="(val) => selectDataChange(purcahseDetail, val, 'purchaseDetailCode')">
								<el-option v-for="item in purcahseDetail" :key="item.purchaseDetailCode"
									:label="item.purchaseDetailName" :value="item.purchaseDetailCode">
								</el-option>
							</el-select>
						</template>
						<template v-else>
							<span>{{ formModel.purchaseDetailName }}</span>
						</template>
					</el-form-item>
				</template>

				<template #attachmentFileSolt="{formModel, sfrIdx}">
					<el-form-item prop="attachmentFile" label="核备附件(支持多个)" class="label-right-align">
						<fileUpload v-model="formModel.contractLicense[sfrIdx].attachmentFile" :limit="10"
							:fileSize="500" :fileType="['pdf']" :preview="type === 'view'" />
					</el-form-item>
				</template>
				<template #table>
					<TabTable ref="tabTableRef" :tableData="tableData" @data-change="onDataChange"
						:sellerName="currentSellerName" />
				</template>
			</VFormRender>
		</div>
	</div>
</template>

<script>
	import Vue from 'vue'
	import * as Api from '@/api/purchase/contract.js'
	import {
		getCurrentSection
	} from '@/api/prodmgr-inv/project/section.js'
	import TabTable from './tabTable.vue'
	import VFormRender from '@/components/form-render/index'
	import {
		purchaseItemFindAllList
	} from '@/api/purchase/item.js'
	import {
		purchaseTypeFindAllList
	} from '@/api/purchase/type.js'
	import {
		purchaseDetailFindAllList
	} from '@/api/purchase/detail.js'
	import {
		formFillInPage
	} from '@/api/form/form'
	import {
		getToken
	} from '@/utils/auth'
	import fileUpload from '@/components/upload'
	import {
		listByDeptCode
	} from '@/api/system/dept.js'
	import {
		getUserInfo
	} from '@/utils/user-info'
	export default {
		name: "SectionAdd",
		dicts: ["purchase_code", "flowStatus"],
		components: {
			VFormRender,
			fileUpload,
			TabTable
		},
		data() {
			const userInfo = getUserInfo()
			return {
				purchaseItem: [],
				purchaseType: [],
				purcahseDetail: [],
				projectData: {},
				maxManualIndex: 1,
				buyer: userInfo?.instituteName,
				loading: false,
				title: '新增',
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
					businessType: '24'
				},
				lineOptions: [],
				// 菜单按钮、字段等数据
				buttonTop: [{
						buttonName: '返回',
						buttonCode: 'cancel',
						buttonIcon: 'Blue-Cancel',
						type: 'create, update'
					},
					{
						buttonName: '保存',
						buttonCode: 'save',
						buttonIcon: 'Blue-Save',
						type: 'create, update'
					},
				],
				constructionOptions: [],
				gysOptions: [],
				tableData: [],
				sellerName: '' // 添加sellerName数据属性
			}
		},
		computed: {
			type() {
				return this.$route.query.type
			},
			id() {
				return this.$route.query?.id || ''
			}
		},
		async created() {
			this.findAllListData();
		},
		mounted() {
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
			findAllListData() {
				getCurrentSection().then(res => {
					this.projectData = res.data;
					this.$refs['vFormRef'].setFormData({
						projefctName: res.data.projectName,
						unitName: res.data.constructionCompany
					})
				});
				purchaseItemFindAllList().then(res => {
					this.purchaseItem = res.data;
				});
				purchaseTypeFindAllList().then(res => {
					this.purchaseType = res.data;
				});
				purchaseDetailFindAllList().then(res => {
					this.purcahseDetail = res.data;
				});
			},
			onContractSelect(contract) {

			},
			handleContractNameSelect() {

			},
			onDataChange(data) {
				if (['delete'].includes(data.type)) {
					this.tableData = this.tableData.filter(item => !data.row.includes(item.id + ''))
					return
				}
				if (data.type === 'add') {
					this.onAdd()
					return
				}
			},
			onAdd() {},
			//初始化
			init() {
				this.$nextTick(async () => {
					this.title = "新建";
					await this.formFillInPage()
				});
			},
			// 编辑初始化
			async updateInit(id) {
				await Api.detail(id).then(res => {
					this.$nextTick(async () => {
						this.title = '编辑';
						await this.formFillInPage();
						const newData = {
							...res.data
						}
						const paramsContractLicense = [];
						newData.contractLicense.map((item, index) => {
							item.attachmentFile = item.attachmentFile != '' ? JSON.parse(
								item.attachmentFile) : [];
							paramsContractLicense.push(item);
						})
						newData.contractLicense = paramsContractLicense;
						this.$refs.vFormRef.setFormData(newData);
					});
				});
			},
			newButton(buttonCode) {
				if (buttonCode === 'cancel') {
					this.cancel()
					return
				}
				if (buttonCode === 'save') {
					this.handleCreate()
					return
				}
			},
			cancel() {
				this.$store.dispatch('setProjectId', '')
				this.$router.go(-1)
			},

			buttonShow(item) {
				if (item.buttonCode === 'save') {
					return this.type !== 'view'
				}
				return true
			},
			//新建
			handleCreate() {
				this.$refs.vFormRef.validateForm(async (valid) => {
					if (!valid) {
						this.$message.warning('请完善信息')
						return
					}
					if (valid) {
						this.loading = true;
						const formData = await this.$refs.vFormRef.getFormData();
						formData.projefctName = this.projectData.projectName;
						formData.unitName = this.projectData.constructionCompany;
						formData.bidDocument = JSON.stringify(formData.bidDocument);
						formData.registration = JSON.stringify(formData.registration);
						formData.scheme = JSON.stringify(formData.scheme);
						formData.schemeApproval = JSON.stringify(formData.schemeApproval);
						const paramsContractLicense = [];
						formData.contractLicense.map((item, index) => {
							item.attachmentFile = JSON.stringify(item.attachmentFile);
							paramsContractLicense.push(item);
						})
						formData.contractLicense = paramsContractLicense;
						await Api[
								this.type === 'update' ? `modify` : `create`
							](Object.assign({
								id: this.type === 'update' ? this.id : null
							}, formData, {}))
							.then(({
								message
							}) => {
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
			checkoutStatus(flag) {

			},
			formFillInPage() {
				return new Promise((resolve) => {
					formFillInPage('purchaseContract').then(res => {
						this.$refs['vFormRef'].setFormJson(res.data)
						this.$refs['vFormRef'].setFormData({
							buyer: this.buyer
						})
						resolve(true)
					})
				})
			},
			selectDataChange(options, val, key) {
				if (key == 'code') {
					this.$refs['vFormRef'].setFormData({
						name: options.find(item => item.value === val).label
					})
				}
				if (key == 'purchaseCode') {
					this.$refs['vFormRef'].setFormData({
						purchaseName: options.find(item => item.purchaseCode === val).purchaseName
					})
				}
				if (key == 'purchaseTypeCode') {
					this.$refs['vFormRef'].setFormData({
						purchaseTypeName: options.find(item => item.purchaseTypeCode === val).purchaseTypeName
					})
				}
				if (key == 'purchaseDetailCode') {
					this.$refs['vFormRef'].setFormData({
						purchaseDetailName: options.find(item => item.purchaseDetailCode === val)
							.purchaseDetailName
					})
				}
			},
			selectChange(options, val, key) {
				this.$refs.vFormRef.setFormData({
					[key]: options.find(item => item.value === val)?.label
				})
			},
			async getLineOptions() {

			},
			async getDeptTree(deptCode) {

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