<template>
	<div class="app-container container_flex">
		<button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
		<div :class="{ container_flex_form: type === 'view' }">
			<VFormRender :form-json="formJson" :form-data="formData" :option-data="optionData" ref="vFormRef"
				:global-dsv="globalDsv" :class="{ formRender_view: type === 'view' }">
				<template #projefctNameSolt="{ formModel }">
					<el-form-item prop="projefctName" label-width="140px" label="标段项目" class="label-right-align">
						<template v-if="type === 'create'">
							<span class="titleCss" :title="projectData.sectionName">{{ projectData.sectionName }}</span>
						</template>
						<template v-else>
							<span class="titleCss" :title="formModel.projefctName">{{ formModel.projefctName }}</span>
						</template>
					</el-form-item>
				</template>

				<template #unitNameSlot="{ formModel }">
					<el-form-item prop="unitName" label="采购单位" class="label-right-align">
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
					<el-form-item prop="code" :rules="[{ required: false, message: '请选择物资大类', trigger: 'change' }]"
						label-width="140px" label="物资大类" class="label-right-align">
						<template v-if="type !== 'update'">
							<el-select :disabled="checked" v-model="formModel.code" filterable required
								style="width: 100%" placeholder="请选择"
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
					<el-form-item prop="purchaseCode"
						:rules="[{ required: false, message: '请选择类别', trigger: 'change' }]" label-width="140px"
						label="类别" class="label-right-align">
						<template v-if="type !== 'update'">
							<el-select :disabled="checked" v-model="formModel.purchaseCode" filterable required
								style="width: 100%" placeholder="请选择"
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
						:rules="[{ required: false, message: '请选择物资种类', trigger: 'change' }]" label="物资种类"
						class="label-right-align">
						<template v-if="type !== 'update'">
							<el-select :disabled="checked" v-model="formModel.purchaseTypeCode" filterable required
								style="width: 100%" placeholder="请选择"
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
						:rules="[{ required: false, message: '请选择物资细目', trigger: 'change' }]" label-width="140px"
						label="物资细目" class="label-right-align">
						<template v-if="type !== 'update'">
							<el-select :disabled="checked" v-model="formModel.purchaseDetailCode" filterable required
								style="width: 100%" placeholder="请选择"
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

				<template #purchaseFileNameSolt="{ formModel }">
					<el-form-item prop="purchaseFileName"
						:rules="[{ required: false, message: '请输入物资名称', trigger: 'change' }]" label="物资名称"
						label-width="140px" class="label-right-align">
						<template v-if="type !== 'update'">
							<el-input v-model="formModel.purchaseFileName" :disabled="checked" />
						</template>
						<template v-else>
							{{ formModel.purchaseFileName }}
						</template>
					</el-form-item>
				</template>
				<template #quantitySolt="{ formModel }">
					<el-form-item prop="quantity" :rules="[{ required: false, message: '请输入数量', trigger: 'change' }]"
						label="数量" class="label-right-align">
						<template v-if="type !== 'update'">
							<el-input type="text" min="0" v-model="formModel.quantity" :disabled="checked" />
						</template>
						<template v-else>
							{{ formModel.quantity }}
						</template>
					</el-form-item>
				</template>
				<template #amountSolt="{ formModel }">
					<el-form-item prop="amount" label-width="140px"
						:rules="[{ required: false, message: '请输入预估采购金额', trigger: 'change' }]" label=" 预估采购金额(万元)"
						class="label-right-align">
						<template v-if="type !== 'update'">
							<el-input type="number" min="0" v-model="formModel.amount" :disabled="checked" />
						</template>
						<template v-else>
							{{ formModel.amount }}
						</template>
					</el-form-item>
				</template>
				<template #registrationDateSlot="{ formModel }">
					<el-form-item prop="registrationDate" label-width="140px" label="预计采购完成日期"
						:rules="[{ required: true, message: '请选择', trigger: 'change' }]" class="label-right-align">
						<template v-if="type !== 'update'">
							<el-date-picker v-model="formModel.registrationDate" :value-format="timestamp"
								:disabled="checked" style="width:100%" type="date" placeholder="选择日期">
							</el-date-picker>
						</template>
						<template v-else>
							{{ formModel.registrationDate | dateFormat }}
						</template>
					</el-form-item>
				</template>
				<template #remakSolt="{ formModel }">
					<el-form-item prop="remak" label="备注" class="label-right-align">
						<template v-if="type !== 'update'">
							<el-input type="text" v-model="formModel.remak" />
						</template>
						<template v-else>
							{{ formModel.remak }}
						</template>
					</el-form-item>
				</template>

				<!-- 附件 -->
				<template #registrationSolt="{ formModel }">
					<el-form-item prop="registration" label-width="190px"
						:rules="[{ required: false, message: '请上传采购文件审查登记表', trigger: 'change' }]" label="采购文件审查登记表"
						class="label-right-align">
						<fileUpload :isShowTip="false" v-model="formModel.registration" :limit="1" :fileSize="500"
							:fileType="['pdf','jpg','png','jpeg','doc','docx']"   />
					</el-form-item>
				</template>

				<template #bidDocumentSolt="scope">
					<el-form-item prop="bidDocument" label-width="190px"
						:rules="[{ required: false, message: '请上传招标文件(含技术规格书)', trigger: 'change' }]"
						label="招标文件(含技术规格书)" class="label-right-align">
						<fileUpload :isShowTip="false" v-model="scope.formModel.bidDocument" :limit="1" :fileSize="500"
							:fileType="['pdf','jpg','png','jpeg','doc','docx']"   />
					</el-form-item>
				</template>

				<template #schemeSolt="scope">
					<el-form-item prop="scheme" label-width="170px"
						:rules="[{ required: false, message: '请上传采购方案或招标计划', trigger: 'change' }]" label="采购方案或招标计划"
						class="label-right-align">
						<fileUpload :isShowTip="false" v-model="scope.formModel.scheme" :limit="1" :fileSize="500"
							:fileType="['pdf','jpg','png','jpeg','doc','docx']"   />
					</el-form-item>
				</template>

				<template #schemeApprovalSolt="scope">
					<el-form-item prop="schemeApproval" label-width="190px"
						:rules="[{ required: false, message: '请上传采购方案（批复）文件', trigger: 'change' }]" label="采购方案（批复）"
						class="label-right-align">
						<fileUpload :isShowTip="false" v-model="scope.formModel.schemeApproval" :limit="1"
							:fileSize="500" :fileType="['pdf','jpg','png','jpeg','doc','docx']"   />
					</el-form-item>
				</template>

				<template #tenderAnnouncementSolt="scope">
					<el-form-item prop="tenderAnnouncement" label-width="170px" label="招标公告网页版"
						class="label-right-align">
						<fileUpload :isShowTip="false" v-model="scope.formModel.tenderAnnouncement" :limit="1"
							:fileSize="500" :fileType="['pdf','jpg','png','jpeg','doc','docx']" :preview="type === 'view'"   />
					</el-form-item>
				</template>
				<template #bidAddendumSolt="scope">
					<el-form-item prop="bidAddendum" label-width="190px" label="招标文件答疑、补遗" class="label-right-align">
						<fileUpload :isShowTip="false" v-model="scope.formModel.bidAddendum" :limit="1" :fileSize="500"
							:fileType="['pdf','jpg','png','jpeg','doc','docx']" :preview="type === 'view'"   />
					</el-form-item>
				</template>
				<template #bidEvaluationReportSolt="scope">
					<el-form-item prop="bidEvaluationReport" label-width="170px" label="评标报告" class="label-right-align">
						<fileUpload :isShowTip="false" v-model="scope.formModel.bidEvaluationReport" :limit="1"
							:fileSize="500" :fileType="['pdf','jpg','png','jpeg','doc','docx']" :preview="type === 'view'"   />
					</el-form-item>
				</template>
				<template #bidCandidateWebSolt="scope">
					<el-form-item prop="bidCandidateWeb" label-width="170px" label="中标候选人公示网页版"
						class="label-right-align">
						<fileUpload :isShowTip="false" v-model="scope.formModel.bidCandidateWeb" :limit="1"
							:fileSize="500" :fileType="['pdf','jpg','png','jpeg','doc','docx']" :preview="type === 'view'"   />
					</el-form-item>
				</template>
				<template #acceptanceSolt="scope">
					<el-form-item prop="acceptance" label-width="190px" label="中标通知书" class="label-right-align">
						<fileUpload :isShowTip="false" v-model="scope.formModel.acceptance" :limit="1" :fileSize="500"
							:fileType="[,'jpg','png','jpeg','doc','docx']" :preview="type === 'view'"   />
					</el-form-item>
				</template>
				<template #bidCopySolt="scope">
					<el-form-item prop="bidCopy" label-width="170px" label="中标人的投标副本" class="label-right-align">
						<fileUpload :isShowTip="false" v-model="scope.formModel.bidCopy" :limit="1" :fileSize="500"
							:fileType="['pdf','jpg','png','jpeg','doc','docx']" :preview="type === 'view'"   />
					</el-form-item>
				</template>
				<template #contractCopySolt="scope">
					<el-form-item prop="contractCopy" label-width="170px" label="合同副本" class="label-right-align">
						<fileUpload :isShowTip="false" v-model="scope.formModel.contractCopy" :limit="1" :fileSize="500"
							:fileType="['pdf','jpg','png','jpeg','doc','docx']" :preview="type === 'view'"   />
					</el-form-item>
				</template>
				<template #commitmentSolt="scope">
					<el-form-item prop="commitment" label-width="190px" label="供应商质量终身责任承诺书" class="label-right-align">
						<fileUpload :isShowTip="false" v-model="scope.formModel.commitment" :limit="1" :fileSize="500"
							:fileType="['pdf','jpg','png','jpeg','doc','docx']" :preview="type === 'view'"   />
					</el-form-item>
				</template>
				<template #otherSolt="scope">
					<el-form-item prop="other" label-width="170px" label="其他文件" class="label-right-align">
						<fileUpload :isShowTip="false" v-model="scope.formModel.other" :limit="100" :fileSize="500"
							:fileType="['pdf','jpg','png','jpeg','doc','docx']" :preview="type === 'view'"   />
					</el-form-item>
				</template>
			</VFormRender>
		</div>
	</div>
</template>

<script>
import Vue from 'vue'
import * as Api from '@/api/purchase/file.js'
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
import dayjs from 'dayjs'
export default {
	name: "SectionAdd",
	dicts: ["purchase_code", "flowStatus"],
	components: {
		VFormRender,
		fileUpload
	},
	filters: {
		dateFormat (value, format = 'YYYY-MM-DD') {
			if (!value) return ''
			return dayjs(value).format(format)
		}
	},
	data () {
		const userInfo = getUserInfo()
		return {
			purchaseItem: [],
			code: null,
			purchaseCode: null,
			purchaseTypeCode: null,
			purchaseDetailCode: null,
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
		type () {
			return this.$route.query.type
		},
		id () {
			return this.$route.query?.id || ''
		}
	},
	async created () {
		this.findAllListData();
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
		findAllListData () {
			getCurrentSection().then(res => {
				this.projectData = res.data;
				this.$refs['vFormRef'].setFormData({
					projefctName: res.data.projectName,
					unitName: res.data.constructionCompany
				})
			});
		},
		onDataChange (data) {
			if (['delete'].includes(data.type)) {
				this.tableData = this.tableData.filter(item => !data.row.includes(item.id + ''))
				return
			}
			if (data.type === 'add') {
				this.onAdd()
				return
			}
		},
		onAdd () { },
		//初始化
		init () {
			this.$nextTick(async () => {
				this.title = "新建";
				await this.formFillInPage()
			});
		},
		// 编辑初始化
		async updateInit (id) {
			await Api.detail(id).then(res => {
				this.$nextTick(async () => {
					this.title = '编辑';
					await this.formFillInPage();
					this.getItemList(res.data.code);
					this.getTypeData(res.data.code, res.data.purchaseCode);
					this.getDetailDate(res.data.code, res.data.purchaseCode, res.data.purchaseTypeCode);
					if (res.data.status === 3) {
						this.checked = true;
					}
					const newData = {
						...res.data
					}
					newData.bidDocument = JSON.parse(newData.bidDocument);
					newData.registration = JSON.parse(newData.registration);
					newData.scheme = JSON.parse(newData.scheme);
					newData.schemeApproval = JSON.parse(newData.schemeApproval);

					newData.tenderAnnouncement = newData.tenderAnnouncement != '' ? JSON.parse(newData.tenderAnnouncement) : [];
					newData.bidAddendum = newData.bidAddendum != '' ? JSON.parse(newData.bidAddendum) : [];
					newData.bidEvaluationReport = newData.bidAddendum != '' ? JSON.parse(newData.bidEvaluationReport) : [];
					newData.bidCandidateWeb = newData.bidCandidateWeb != '' ? JSON.parse(newData.bidCandidateWeb) : [];
					newData.acceptance = newData.acceptance != '' ? JSON.parse(newData.acceptance) : [];
					newData.bidCopy = newData.bidCopy != '' ? JSON.parse(newData.bidCopy) : [];
					newData.contractCopy = newData.contractCopy != '' ? JSON.parse(newData.contractCopy) : [];
					newData.commitment = newData.commitment != '' ? JSON.parse(newData.commitment) : [];
					newData.other = newData.other != '' ? JSON.parse(newData.other) : [];

					this.$refs.vFormRef.setFormData(newData);

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
			this.$tab.closeOpenPage(true);
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
				if (!valid) {
					this.$message.warning('请完善信息')
					return
				}

				if (valid) {
					this.loading = true;
					const formData = await this.$refs.vFormRef.getFormData();
					formData.projefctName = this.projectData.sectionName;
					formData.projectId = this.projectData.projectId;
					formData.unitName = this.projectData.constructionCompany;
					formData.bidDocument = JSON.stringify(formData.bidDocument);
					formData.registration = JSON.stringify(formData.registration);
					formData.scheme = JSON.stringify(formData.scheme);
					formData.schemeApproval = JSON.stringify(formData.schemeApproval);

					formData.tenderAnnouncement = JSON.stringify(formData.tenderAnnouncement);
					formData.bidAddendum = JSON.stringify(formData.bidAddendum);
					formData.bidEvaluationReport = JSON.stringify(formData.bidEvaluationReport);
					formData.bidCandidateWeb = JSON.stringify(formData.bidCandidateWeb);
					formData.acceptance = JSON.stringify(formData.acceptance);
					formData.bidCopy = JSON.stringify(formData.bidCopy);
					formData.contractCopy = JSON.stringify(formData.contractCopy);
					formData.commitment = JSON.stringify(formData.commitment);
					formData.other = JSON.stringify(formData.other);
					await Api[
						this.type === 'update' ? `modify` : `create`
					](Object.assign({
						id: this.type === 'update' ? this.id : ''
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
		formFillInPage () {
			return new Promise((resolve) => {
				formFillInPage('purchaseBackData').then(res => {
					this.$refs['vFormRef'].setFormJson(res.data)
					this.$refs['vFormRef'].setFormData({
						buyer: this.buyer
					})
					resolve(true)
				})
			})
		},
		getItemList (code) {
			purchaseItemFindAllList({ code: code }).then(res => {
				this.purchaseItem = res.data;
			});
		},

		getTypeData (code, purchaseCode) {
			purchaseTypeFindAllList({ code: code, purchaseCode, purchaseCode }).then(res => {
				this.purchaseType = res.data;
			});
		},

		getDetailDate (code, purchaseCode, purchaseTypeCode) {
			purchaseDetailFindAllList({ code: code, purchaseCode: purchaseCode, purchaseTypeCode: purchaseTypeCode }).then(res => {
				this.purcahseDetail = res.data;
			});
		},

		selectDataChange (options, val, key) {
			if (key == 'code') {
				this.code = val;
				this.purchaseCode = null;
				this.purchaseTypeCode = null;
				this.purchaseDetailCode = null;
				this.purchaseItem = [];
				this.purchaseType = [];
				this.purcahseDetail = [];
				this.$refs['vFormRef'].setFormData({
					name: options.find(item => item.value === val).label,
					purchaseCode: null,
					purchaseName: null,
					purchaseTypeCode: null,
					purchaseTypeName: null,
					purchaseDetailCode: null,
					purchaseDetailName: null,
				});
				this.getItemList(val);
			} else if (key == 'purchaseCode') {
				this.purchaseCode = val;
				this.purchaseTypeCode = null;
				this.purchaseDetailCode = null;
				this.purchaseType = [];
				this.purcahseDetail = [];
				this.$refs['vFormRef'].setFormData({
					purchaseName: options.find(item => item.purchaseCode === val).purchaseName,
					purchaseTypeCode: null,
					purchaseTypeName: null,
					purchaseDetailCode: null,
					purchaseDetailName: null,
				});
				this.getTypeData(this.code, this.purchaseCode);
			} else if (key == 'purchaseTypeCode') {
				this.purchaseTypeCode = val;
				this.purchaseDetailCode = null;
				this.purcahseDetail = [];
				this.$refs['vFormRef'].setFormData({
					purchaseTypeName: options.find(item => item.purchaseTypeCode === val).purchaseTypeName,
					purchaseDetailCode: null,
					purchaseDetailName: null,
				});
				this.getDetailDate(this.code, this.purchaseCode, this.purchaseTypeCode);
			} else if (key == 'purchaseDetailCode') {
				this.$refs['vFormRef'].setFormData({
					purchaseDetailName: options.find(item => item.purchaseDetailCode === val)
						.purchaseDetailName
				});
			}
		},
		selectChange (options, val, key) {
			this.$refs.vFormRef.setFormData({
				[key]: options.find(item => item.value === val)?.label
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
::v-deep .container-wrapper{
	margin-bottom:-16px;
}

.titleCss {
	display: inline-block;
	/* 或者 block */
	width: 250px;
	/* 设置一个具体的宽度 */
	white-space: nowrap;
	/* 防止文本换行 */
	overflow: hidden;
	/* 隐藏溢出的内容 */
	text-overflow: ellipsis;
	/* 显示省略符号来代表被修剪的文本 */
}
</style>