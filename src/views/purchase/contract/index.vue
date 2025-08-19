<template>
	<div class="app-container container_flex">
		<button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
			:buttonDisable="buttonDisable"></button-top>
		<form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery"
			:formData="formData">
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
					<el-option v-for="item in dict.type.flowStatus" :key="item.value" :label="item.label"
						:value="item.value">
					</el-option>
				</el-select>
			</template>
		</form-data>
		<el-row type="flex" class="container_h">
			<!--用户数据-->
			<el-col :span="20" :xs="24" class="container_flex">
				<right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
					:showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
					@handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
					@cleanClick="cleanClick"></right-toolbar>
				<table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
					:property="property" :numberShow="numberShow" @handleSelectionChange="handleSelectionChange"
					@selectChange="selectChange" @emitAblFilter="emitAblFilter" @handleButton="handleButton">
					<!-- 合同状态 -->
					<template #status="scope">
						{{ status[scope.value] }}
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
					<fileUpload v-model="contractLicense.attachmentFile" :limit="10" :fileSize="500" :fileType="['pdf']"
						:preview="type === 'view'" />
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
	import {
		purchaseItemFindAllList
	} from '@/api/purchase/item.js'
	import {
		purchaseTypeFindAllList
	} from '@/api/purchase/type.js'
	import indexMixin from "@/views/mixins";
	import Add from './components/add.vue'
	import fileUpload from '@/components/upload'
	import workFlowView from '@/components/workFlowView'
	import dayjs from 'dayjs'
	export default {
		// 自购物资文件核备
		name: "purchaseFile",
		dicts: ["purchase_code", "flowStatus"],
		components: {
			Add,
			fileUpload,
			workFlowView
		},
		mixins: [indexMixin],

		data() {
			return {
				status: {
					'1': '未提交',
					'2': '审核中',
					'3': '已同意',
					'0': '不同意'
				},
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
		async created() {
			let id = this.$route.meta.id;
			this.$store.dispatch("menuProperty", id).then((data) => {
				this.property = data;
			});
			this.findAllListData();
		},
		filters: {
			formatDate(value) {
				if (!value) return ''
				return dayjs(value).format('YYYY-MM-DD')
			}
		},
		methods: {
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
				}
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
						if(this.contractLicense.validityGuarantee != null){
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
				this.$modal.confirm("是否确认删除?").then(function() {
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