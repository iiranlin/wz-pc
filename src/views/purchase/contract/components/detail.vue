<template>
	<div class="app-container container_flex">
		<button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
		<div :class="{ container_flex_form: type === 'view' }">
			<VFormRender :form-json="formJson" :form-data="formData" :option-data="optionData" ref="vFormRef"
				:global-dsv="globalDsv" :class="{ formRender_view: type === 'view' }">
				<template #projefctNameSolt="{ formModel }">
					<el-form-item prop="projefctName" label-width="110px" label="标段项目:" class="label-right-align">
						<template v-if="type === 'create'">
							<span class="titleCss" :title="projectData.projectName">{{ projectData.projectName }}</span>
						</template>
						<template v-else>
							<span class="titleCss" :title="formModel.projefctName">{{ formModel.projefctName }}</span>
						</template>
					</el-form-item>
				</template>

				<template #unitNameSlot="{ formModel }">
					<el-form-item prop="unitName" label="买方:" class="label-right-align">
						<template v-if="type === 'create'">
							<span class="titleCss" :title="projectData.constructionCompany">{{
								projectData.constructionCompany }}</span>
						</template>
						<template v-else>
							<span class="titleCss" :title="formModel.unitName">{{ formModel.unitName }}</span>
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
						label-width="110px" label="类别" class="label-right-align">
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

				<template #titleSolt="{formModel, sfrIdx}">
					<el-card class="box-card">许可/认证证书  - {{ sfrIdx + 1}}</el-card>
				</template>
				<template #attachmentFileSolt="{ formModel, sfrIdx }">
					<el-form-item prop="attachmentFile" label-width="150px" label="核备附件(支持多个)"
						class="label-right-align">
						<fileUpload v-model="formModel.contractLicense[sfrIdx].attachmentFile" :limit="9999"
						 :fileType="['pdf','jpg','png','jpeg','doc','docx']" :preview="type === 'view'"   />
					</el-form-item>
				</template>
				<template #table>
					<TabTable ref="tabTableRef" :tableData="tableData" @data-change="onDataChange"
						:sellerName="currentSellerName" />
				</template>
			</VFormRender>
			
      	<toBeReviewed ref="toBereview" />
		</div>
	</div>
</template>

<script>
import Vue from 'vue'
import * as Api from '@/api/purchase/contract.js'
import {
	getCurrentSection
} from '@/api/prodmgr-inv/project/section.js'
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
	getUserInfo
} from '@/utils/user-info'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
export default {
	name: "SectionAdd",
	dicts: ["purchase_code", "flowStatus"],
	components: {
		VFormRender,
		fileUpload,
		toBeReviewed
	},
	data() {
		const userInfo = getUserInfo()
		return {
			detail:null,
			code: null,
			purchaseCode: null,
			purchaseTypeCode: null,
			purchaseDetailCode: null,
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
			{ buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
			{ buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' }
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
		},
		name () {
		return this.$route.query?.name || ''
		},
		queryAuditArr() {
			return JSON.parse(this.$route.query.auditArr || '[]')
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
			// purchaseItemFindAllList().then(res => {
			// 	this.purchaseItem = res.data;
			// });
			// purchaseTypeFindAllList().then(res => {
			// 	this.purchaseType = res.data;
			// });
			// purchaseDetailFindAllList().then(res => {
			// 	this.purcahseDetail = res.data;
			// });
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
		onAdd() { },
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
					this.detail = res.data;
					await this.formFillInPage();
					this.getItemList(res.data.code);
					this.getTypeData(res.data.code, res.data.purchaseCode);
					this.getDetailDate(res.data.code, res.data.purchaseCode, res.data.purchaseTypeCode);
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
					this.$refs.vFormRef.setReadMode(this.type === 'view')
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
			if (buttonCode === 'pass') {
				this.$refs.toBereview.init('pass', this.queryAuditArr, this.name)
			} 
			if (buttonCode === 'reject') {
				this.$refs.toBereview.init('reject', this.queryAuditArr, this.name)
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
			// 同意
			if (item.buttonCode === 'pass') {
				return this.detail.status === 2
			}
			// 不同意
			if (item.buttonCode === 'reject') {
				return this.detail.status === 2
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
					formData.projectId = this.projectData.projectId;
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
		getItemList(code) {
			purchaseItemFindAllList({ code: code }).then(res => {
				this.purchaseItem = res.data;
			});
		},

		getTypeData(code, purchaseCode) {
			purchaseTypeFindAllList({ code: code, purchaseCode, purchaseCode }).then(res => {
				this.purchaseType = res.data;
			});
		},

		getDetailDate(code, purchaseCode, purchaseTypeCode) {
			purchaseDetailFindAllList({ code: code, purchaseCode: purchaseCode, purchaseTypeCode: purchaseTypeCode }).then(res => {
				this.purcahseDetail = res.data;
			});
		},
		selectDataChange(options, val, key) {
			if (key == 'code') {
				this.code = val;
				this.getItemList(val);
				this.$refs['vFormRef'].setFormData({
					name: options.find(item => item.value === val).label
				})
			}
			if (key == 'purchaseCode') {
				this.purchaseCode = val;
				this.getTypeData(this.code, this.purchaseCode);
				this.$refs['vFormRef'].setFormData({
					purchaseName: options.find(item => item.purchaseCode === val).purchaseName
				})
			}
			if (key == 'purchaseTypeCode') {
				this.purchaseTypeCode = val;
				this.getDetailDate(this.code, this.purchaseCode, this.purchaseTypeCode);
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
		beforeUpload(file) {
			console.log(file, 'beforeUpload')
			// const isJPG = file.type === 'pdf';
			// const size = file.size / 1024 / 1024 < 500;
			// if (!isJPG) {
			// 	this.$message.error('文件只能是 PDF 格式!');
			// }
			// if (!size) {
			// 	this.$message.error('上传头像图片大小不能超过 500MB!');
			// }
			// return isJPG && size;
		},
		uploadFile(file) {
			// try {
			// 	const client = new OSS({
			// 		region: 'cn-hangzhou"',
			// 		accessKeyId: 'LTAI5tC37nKnUEPeszGoveX8',
			// 		accessKeySecret: 'vi26hami9gwgWES8jwkLEP8Zd0gM2v',
			// 		bucket: 'yc-mat',
			// 		endpoint: 'https://oss-cn-hangzhou.aliyuncs.com'
			// 	}).put(file.name, file)
			// 	console.log(client, 'oss')
			// } catch (e) {
			// 	console.log(e)
			// }
		},
		handleUploadSuccess(res, file) {
			console.log(res, file, 'res, file')
		},
		handleExceed(files, fileList) {
			this.$message.error(`最多只能上传 10 个文件`);
		},
		handleRemove(file, fileList) {
			console.log(file, fileList, 'file, fileList')
		},
		handlePreview(file) {
			console.log(file, 'file')
		},
		beforeRemove(file, fileList) {
			return this.$confirm(`确定移除 ${file.name}？`);
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

.titleCss {
	display: inline-block;
	/* 或者 block */
	width: 260px;
	/* 设置一个具体的宽度 */
	white-space: nowrap;
	/* 防止文本换行 */
	overflow: hidden;
	/* 隐藏溢出的内容 */
	text-overflow: ellipsis;
	/* 显示省略符号来代表被修剪的文本 */
}
</style>