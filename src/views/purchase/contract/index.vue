<template>
	<div class="app-container container_flex">
		<button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
			:buttonDisable="buttonDisable"></button-top>
		<form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery"
			:formData="formData" :labelWidth="'120px'" @cleanClick="cleanClick" @handleResetField="onResetField">
			<template #name>
				<el-select v-model="formData.code" filterable required style="width: 100%" placeholder="请选择" clearable>
					<el-option v-for="item in dict.type.purchase_code" :key="item.value" :label="item.label"
						:value="item.value">
					</el-option>
				</el-select>
			</template>
			<template #purchaseName>
				<el-select v-model="formData.purchaseCode" filterable required style="width: 100%" placeholder="请选择"
					clearable>
					<el-option v-for="item in purchaseType" :key="item.purchaseTypeCode" :label="item.purchaseTypeName"
						:value="item.purchaseTypeCode">
					</el-option>
				</el-select>
			</template>
			<template #status>
				<el-select v-model="formData.status" filterable required style="width: 100%" placeholder="请选择"
					clearable>
					<el-option v-for="item of Object.keys(status)" :key="status[item]" :label="status[item]"
						:value="item">
					</el-option>
				</el-select>
			</template>
			<!-- 建设物资 -->
			<template #projectName="data">
				<el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择建设项目'
					" clearable style="width: 100%" size="small">
					<el-option v-for="(item, key) in lineOptions" :key="key" :label="item.label" :value="item.label" />
				</el-select>
			</template>
			<!-- 日期范围搜索 -->
			<template #date>
				<el-date-picker v-model="formData.dateRange" type="daterange" value-format="yyyy-MM-dd"
					range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
			</template>
		</form-data>
		<el-row type="flex" class="container_h">
			<!--用户数据-->
			<el-col :span="20" :xs="24" class="container_flex">
				<right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
					:showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
					@handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
					@cleanClick="cleanClick"></right-toolbar>
				<table-index ref="tableIndex" :buttonDisable="tableButtonDisable" :loading="loading"
					:tableIndexs="tableIndex" :tableData="list" :property="property" :numberShow="numberShow"
					@handleSelectionChange="handleSelectionChange" @selectChange="selectChange"
					@emitAblFilter="emitAblFilter" @handleButton="handleButton">
					<!-- 合同状态 -->
					<template #status="scope">
						{{ status[scope.value] }}
					</template>
					<!-- 合同ID -->
					<template #purchaseNumber="scope">
						<!-- 跳转详情 -->
						<el-button type="text" @click.stop="handleClick(scope.data)">{{ scope.value }}</el-button>
					</template>
				</table-index>
				<pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
					:limit.sync="listQuery.pageSize" @pagination="getList" />
			</el-col>
		</el-row>

		<el-dialog :visible.sync="addStatus" title="添加证书" width="40%">
			<el-form ref="contractLicense" :rules="rules" :model="contractLicense" label-width="140px">
				<input type="hidden" v-model="contractLicense.contractNumber" />
				<el-form-item label="许可类别" prop="licenseCategory">
					<el-input v-model="contractLicense.licenseCategory"></el-input>
				</el-form-item>
				<el-form-item label="发证单位" prop="unit">
					<el-input v-model="contractLicense.unit"></el-input>
				</el-form-item>
				<el-form-item label="证书编号" prop="quantity">
					<el-input v-model="contractLicense.quantity"></el-input>
				</el-form-item>
				<el-form-item label="有效日期" prop="validityGuarantee">
					<el-date-picker v-model="contractLicense.validityGuarantee" type="daterange" range-separator="~"
						start-placeholder="开始日期" end-placeholder="结束日期">
					</el-date-picker>
				</el-form-item>
				<el-form-item label="核备附件(支持多个)" prop="attachmentFile">
					<fileUpload v-model="contractLicense.attachmentFile" :limit="9999" :fileSize="false"
						:fileType="['pdf', 'jpg', 'png', 'jpeg', 'doc', 'docx']" :preview="false" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="closeAddStatus()">取 消</el-button>
					<el-button type="primary" @click="submitForm()">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		<workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
	</div>
</template>

<script>
import * as Api from '@/api/purchase/contract.js'
import * as FileApi from '@/api/prodmgr-inv/project/file.js'
import {
	purchaseTypeFindAllList
} from '@/api/purchase/type.js'
import indexMixin from "@/views/mixins";
import Add from './components/add.vue'
import fileUpload from '@/components/upload'
import workFlowView from '@/components/workFlowView'
import dayjs from 'dayjs'
import * as WzglApi from '@/api/prodmgr-inv/project/wzgl.js'
export default {
	// 自购物资文件核备
	name: "/nuclear/contract",
	dicts: ["purchase_code", "flowStatus"],
	components: {
		Add,
		fileUpload,
		workFlowView
	},
	mixins: [indexMixin],
	computed: {
		deptName() {
			return this.$route.query?.deptName || ''
		},
		deptId() {
			return this.$route.query?.deptId || ''
		},
		startDate() {
			return this.$route.query?.startDate || ''
		},
		endDate() {
			return this.$route.query?.endDate || ''
		},
		projectId() {
			return this.$route.query?.projectId || ''
		},
		projectName() {
			return this.$route.query?.projectName || ''
		},
		fromUrl() {
			return this.$route.query?.fromUrl || ''
		},
		code() {
			return this.$route.query?.name || ''
		},
		sectionShortName() {
			return this.$route.query?.sectionShortName || ''
		},
		purchaseTypeName() {
			return this.$route.query?.purchaseTypeName || ''
		},
		month() {
			return this.$route.query?.month || ''
		}
	},
	data() {
		return {
			status: {
				'1': '未提交',
				'2': '审核中',
				'3': '已完成',
				'0': '已驳回'
			},
			lineOptions: [],
			purchaseType: [],
			// 遮罩层
			loading: false,
			// 选中数组
			ids: [],
			// 非单个禁用
			single: true,
			// 非多个禁用
			multiple: true,
			// 显示搜索条件
			showSearch: true,
			// 表格序号是否展示
			numberShow: true,
			addStatus: false, // 添加证书
			// 表格数据
			list: [],
			// 弹出层标题
			title: "",
			//列表显示字段
			property: {},
			// 查询参数
			formData: {
				parentId: null,
			},
			formDataClick: {},
			total: 0,
			selection: [],
			hasOwn: true,
			workFlowViewVisible: false,
			selectedRow: null,
			contractLicense: {
				contractNumber: null,
				licenseCategory: null,
				unit: null,
				quantity: null,
				startTime: null,
				endTime: null,
				attachmentFile: null,
				validityGuarantee: null
			},
			rules: {
				licenseCategory: [{
					required: true,
					message: '请输入许可类别',
					trigger: 'blur'
				}],
				unit: [{
					required: true,
					message: '请输入发证单位',
					trigger: 'blur'
				}],
				quantity: [{
					required: true,
					message: '请输入证书编号',
					trigger: 'blur'
				}],
				validityGuarantee: [{
					required: true,
					message: '请选择有效日期',
					trigger: 'blur'
				}]
			}

		};
	},
	activated() {
		this.getList();
	},
	async created() {
		let id = this.$route.meta.id;
		this.$store.dispatch("menuProperty", id).then((data) => {
			this.property = data;
		});
		this.findAllListData();
		this.getLineOptions()
		this.setQuery();
	},
	filters: {
		formatDate(value) {
			if (!value) return ''
			return dayjs(value).format('YYYY-MM-DD')
		}
	},
	methods: {
		// 将Url参数赋值到搜索内（使用 $set 保证响应式）
		setQuery() {
			if (this.deptId) {
				// this.$set(this.formData, 'constructionUnitId', this.deptId)
			}
			if (this.deptName) {
				// this.$set(this.formData, 'constructionUnitName', this.deptName)
			}
			if (this.startDate) {
				this.$set(this.formData, 'startDate', this.startDate)
				this.$set(this.formData, 'dateRange', [this.startDate, this.endDate])
			}
			if (this.endDate) {
				this.$set(this.formData, 'endDate', this.endDate)
			}
			if (this.projectId) {
				this.$set(this.formData, 'projectId', this.projectId)
			}
			if (this.projectName) {
				this.$set(this.formData, 'projectName', this.projectName)
			}
			if (this.fromUrl) {
				this.$set(this.formData, 'status', '3')
				this.$set(this.formData, 'bigScreenFlag', this.fromUrl === 'largeScreen' ? '1' : '0')
			}
			if (this.code) {
				this.$set(this.formData, 'code', this.code)
			}
			if (this.sectionShortName) {
				this.$set(this.formData, 'sectionShortName', this.sectionShortName)
			}
			if (this.purchaseTypeName) {
				this.$set(this.formData, 'purchaseTypeName', this.purchaseTypeName)
			}
			if (this.month) {
				this.$set(this.formData, 'month', this.month)
			}
		},
		/** 清空 URL 参数设置的搜索字段 */
		clearUrlQueryFields() {
			this.$set(this.formData, 'constructionUnitId', null);
			this.$set(this.formData, 'constructionUnitName', null);
			this.$set(this.formData, 'startDate', null);
			this.$set(this.formData, 'endDate', null);
			this.$set(this.formData, 'projectId', null);
			this.$set(this.formData, 'projectName', null);
			this.$set(this.formData, 'constructionUnit', null);
			this.$set(this.formData, 'dateRange', null);
			this.$set(this.formData, 'bigScreenFlag', null);
			this.$set(this.formData, 'code', null);
			this.$set(this.formData, 'sectionShortName', null);
			this.$set(this.formData, 'purchaseTypeName', null);
			this.$set(this.formData, 'month', null);
			this.$set(this.formData, 'status', null);
		},
		/** 搜索栏“重置”按钮触发的事件 */
		onResetField() {
			this.clearUrlQueryFields();
		},
		getLineOptions() {
			WzglApi.contractLineSelectOptions().then(({ data }) => {
				this.lineOptions = data.map(x => ({
					label: x.projectName,
					value: x.projectName
				}))
			})
		},
		handleClick(row) {
			this.$router.push({
				name: 'detailPurchaseContract',
				query: {
					id: row.id,
					type: 'view'
				}
			})
		},
		fileListStr(val) {
			if (val) {
				return JSON.parse(val)[0];
			}
		},
		findAllListData() {
			purchaseTypeFindAllList().then(res => {
				this.purchaseType = res.data;
			});

		},
		tableButtonDisable(buttonInfo, row) {
			if (buttonInfo.buttonCode === 'flowSee') {
				return row.status == 1
			}
		},
		buttonDisable(btn) {
			if (btn.buttonCode === 'submit') {
				return this.selection[0].status != 1 && this.selection[0].status != 0
			}
			if (btn.buttonCode === 'update') {
				return this.selection[0].status != 1 && this.selection[0].status != 0
			}
			if (btn.buttonCode === 'delete') {
				return this.selection[0].status != 1 && this.selection[0].status != 0
			}
			if (btn.buttonCode === 'withdraw') {
				return this.selection[0].status != 2
			}
			if (btn.buttonCode === 'flowSee') {
				return this.selection[0].status == 1
			}
			if (btn.buttonCode === 'download') {
				return this.selection[0].status != 3
			}
			if (btn.buttonCode === 'addCertificate') {
				return this.selection[0].status == 2 || this.selection[0].railwaySpecial == 0
			}
			return false
		},
		numberChange(val) {
			this.numberShow = val;
		},
		newButton(buttonCode, formId, buttonData) {
			this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
		},
		handleCheckAllChange(columns) {
			this.$refs.tableIndex.init(columns);
		},
		//选择框回调
		selectChange(row) {
			let {
				formData,
				isWatch
			} = row;
			if (!isWatch) {
				this.handleQuery(formData);
			} else {
				this.formData = Object.assign({}, this.formData, formData);
			}
		},
		emitAblFilter(listQuery) {
			this.listQuery = Object.assign({}, this.listQuery, listQuery);
			this.handleQuery();
		},
		handleQuery(row = {}, type = '') {
			// 如果projectName为空，则projectId也为空
			if (!this.formData.projectName) {
				this.$set(this.formData, 'projectId', null)
			}
			// 如果constructionUnitName为空，则constructionUnitId也为空
			if (!this.formData.constructionUnitName) {
				this.$set(this.formData, 'constructionUnitId', null)
			}

			if (this.formData.dateRange && this.formData.dateRange.length > 0) {
				this.formData.startDate = this.formData.dateRange[0]
				this.formData.endDate = this.formData.dateRange[1]
			} else {
				this.$set(this.formData, 'startDate', null)
				this.$set(this.formData, 'endDate', null)
			}
			this.listQuery.pageNum = 1
			this.formData = Object.assign({}, this.formData, row);
			this.formDataClick = Object.assign({}, this.formData, row);
			this.getList();
		},
		/** 查询菜单列表 */
		getList() {
			this.loading = true
			Api.page(Object.assign({}, this.listQuery, this.formData)).then(({
				data
			}) => {
				this.list = data.list
				this.total = data.total
			}).finally(() => {
				this.loading = false
			})
		},
		handleSelectionChange(ids, single, multiple, selection) {
			this.ids = ids;
			this.single = single;
			this.multiple = multiple;
			this.selection = selection;
		},
		handleButton(buttonCode, idArr, rowArr, {
			buttonData
		}) {
			this.proxyPrint(buttonCode, rowArr, buttonData)
			switch (buttonCode) {
				case "create":
					this.$router.push({
						name: 'addPurchaseContract',
						query: {
							type: 'create'
						}
					})
					break;
				case "update":
					this.$router.push({
						name: 'addPurchaseContract',
						query: {
							id: idArr[0],
							type: 'update'
						}
					})
					break;
				case "delete":
					this.handleDelete(idArr)
					break;
				case 'view':
					this.$router.push({
						name: 'detailPurchaseContract',
						query: {
							id: idArr[0],
							type: 'view'
						}
					})
					break;
				case 'detailView':
					this.$router.push({
						name: 'selfContractList',
						query: {
							id: idArr[0]
						}
					})
					break;
				case 'submit':
					this.handSubmit(idArr)
					break;
				case 'withdraw':
					this.handleWithdraw({
						businessId: idArr[0],
						businessType: 'CGHT',
					})
					break;
				case 'flowSee':
					this.workFlowViewVisible = true
					this.selectedRow = {
						businessId: idArr[0]
					}
					break;
				case 'addCertificate':
					this.handAddCertificate(rowArr[0]);
					break;
				case "download":
					this.handleExport(rowArr[0])
					break;
				case 'export':
					this.handleDonwload()
					break;
			}
		},
		async handleDonwload() {
			try {
				this.loading = true;
				const isAllSelected = this.selection.length > 0 && this.selection.length === this.list.length;
        		const isNoneSelected = this.selection.length === 0;
        		const idList = (isAllSelected || isNoneSelected) ? null : this.ids;
				await FileApi.customDownload({ businessType: 128, businessData: JSON.stringify({...this.formData,idList}) });
			} catch (error) {
				this.$modal.msgError("下载失败，请重试");
			} finally {
				this.loading = false;
			}
		},
		// 下载合同核备单据信息
		handleExport(obj) {
			FileApi.customDownload({ businessType: 111, businessData: obj.id })
		},
		handAddCertificate(row) {
			if (row != undefined) {
				this.addStatus = true;
				this.contractLicense.contractNumber = row.contractNumber;
			}
		},
		closeAddStatus() {
			this.addStatus = false
			this.contractLicense.contractNumber = null;
		},
		submitForm() {
			this.$refs['contractLicense'].validate((valid) => {
				if (valid) {
					if (this.contractLicense.attachmentFile != null) {
						this.contractLicense.attachmentFile = JSON.stringify(this.contractLicense
							.attachmentFile);
					}
					if (this.contractLicense.validityGuarantee != null) {
						this.contractLicense.startTime = this.contractLicense.validityGuarantee[0];
						this.contractLicense.endTime = this.contractLicense.validityGuarantee[1];
					}
					Api.licenseCreate(this.contractLicense).then(res => {
						this.$modal.msgSuccess("添加证书成功");
						this.addStatus = false
						this.contractLicense.contractNumber = null;
					})
				}
			});
		},
		handSubmit(idArr) {
			this.$modal.confirm("是否确认提交审核?").then(() => {
				this.$reviewerDialog({
					type: 'CGHT',
					success: async (assignee) => {
						await Api.submit({
							ids: idArr,
							assignee: assignee
						})
						this.$modal.msgSuccess("提交审核成功");
						this.getList();
					}
				})
			})
		},
		async changeStatus(row) {
			this.$confirm('确定要启用吗？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => Api.editStatus({
				id: row.id,
				contractStatus: 2
			}))
				.then(() => {
					this.getList();
					this.$modal.msgSuccess("启用成功");
				})
		},
		handleDelete(ids) {
			this.$modal.confirm("是否确认删除?").then(function () {
				return Api.deleteBatch({
					ids
				});
			}).then(() => {
				this.getList();
				this.$modal.msgSuccess("删除成功");
			})
		},
		clickReset() {
			this.handleQuery();
		},
		cleanClick(data) {
			for (const key of data) {
				if (key.indexOf("Start") != -1 || key.indexOf("End") != -1) {
					this.$refs.formData.resetQueryDateRange(key);
				}
				this.formData[key] = null;
			}
			this.handleQuery();
		},

	},
};
</script>
<style lang="scss" scoped>
.ov_head {
	flex: 1;
	height: 100%;
	overflow-y: scroll;
}
</style>
