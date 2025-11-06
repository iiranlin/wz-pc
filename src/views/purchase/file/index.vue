<template>
	<div class="app-container container_flex">
		<button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
			:buttonDisable="buttonDisable"></button-top>
		<form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery"
			:formData="formData">
			<template #name>
				<el-select v-model="formData.code" filterable required style="width: 100%" placeholder="请选择" @change="(val) => selectDataChange(dict.type.purchase_code, val, 'code')" clearable>
					<el-option v-for="item in dict.type.purchase_code" :key="item.value" :label="item.label"
						:value="item.value">
					</el-option>
				</el-select>
			</template>
			<template #purchaseName>
				<el-select v-model="formData.purchaseCode" filterable required style="width: 100%" placeholder="请选择"
					clearable>
					<el-option v-for="item in purchaseItem" :key="item.purchaseCode" :label="item.purchaseName"
						:value="item.purchaseCode">
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
					<template #registration="scope">
						<fileUpload :value="fileListStr(scope.value)" :limit="9999" :fileSize="500" :fileType="['pdf','jpg','png','jpeg','doc','docx']"
							:preview="true" />
					</template>
					<template #scheme="scope">
						<fileUpload :value="fileListStr(scope.value)" :limit="9999" :fileSize="500" :fileType="['pdf','jpg','png','jpeg','doc','docx']"
							:preview="true" />
					</template>
					<template #schemeApproval="scope">
						<fileUpload :value="fileListStr(scope.value)" :limit="9999" :fileSize="500" :fileType="['pdf','jpg','png','jpeg','doc','docx']"
							:preview="true" />
					</template>
					<template #bidDocument="scope">
						<fileUpload :value="fileListStr(scope.value)" :limit="9999" :fileSize="500" :fileType="['pdf','jpg','png','jpeg','doc','docx']"
							:preview="true" />
					</template>

					<!-- 招标归档资料链接跳转 -->
					 <template #archivedMaterials="scope">
						<el-link type="primary" @click.stop="goArchivedMaterials(scope.data)">
							归档资料
						</el-link>
					 </template>
				</table-index>
				<pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
					:limit.sync="listQuery.pageSize" @pagination="getList" />
			</el-col>
		</el-row>
		<workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
	</div>
</template>

<script>
	import * as Api from '@/api/purchase/file.js'
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
				statusOptions: [{
						label: '启用',
						value: '2'
					},
					{
						label: '未启用',
						value: '1'
					}
				],
				purchaseType: [],
				purchaseItem:[],
				treeCurrentKey: "",
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
				// 表格数据
				list: [],
				// 弹出层标题
				title: "",

				//列表显示字段
				property: {},
				defaultProps: {
					children: "children",
					label: "deptName",
				},
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
			};
		},
		async created() {
			let id = this.$route.meta.id;
			this.$store.dispatch("menuProperty", id).then((data) => {
				this.property = data;
			});
			this.findAllListData();
			this.findItemListData();
		},
		filters: {
			formatDate(value) {
				if (!value) return ''
				return dayjs(value).format('YYYY-MM-DD')
			}
		},
		methods: {
			goArchivedMaterials(data) {
				this.$router.push({
					name: 'updatePurchase',
					query: {
						type:'update',
						id: data.id
					}
				})
			},
			fileListStr(val) {
				if (val) {
					return JSON.parse(val);
				}
			},
			findAllListData() {
				purchaseTypeFindAllList().then(res => {
					this.purchaseType = res.data;
				});

			},
			findItemListData(code) {
				purchaseItemFindAllList({code: code}).then(res => {
					this.purchaseItem = res.data;
				});
			},
			selectDataChange(options, val, key) {
				this.findItemListData(val);
			},
			selectable(row) {
				// 履约比例等于0允许删除
				return row.materialUsedRatio == 0
			},
			buttonDisable(btn) {
				if (btn.buttonCode === 'submit') {
					return this.selection[0].status != 1 && this.selection[0].status != 0
				}
				if (btn.buttonCode === 'update') {
					return this.selection[0].status == 2
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
							name: 'addPurchase',
							query: {
								type: 'create'
							}
						})
						break;
					case "update":
						this.$router.push({
							name: 'addPurchase',
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
							name: 'detailPurchase',
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
							businessType: 'CGWJ',
						})
						break;
					case 'flowSee':
						this.workFlowViewVisible = true
						this.selectedRow = {
							businessId: idArr[0]
						}
						break;
					case "download":
						this.handleExport(rowArr[0])
						break;
				}
			},
			handleExport(obj) {
				Api.downloadExport(obj.id)
			},
			handSubmit(idArr) {
				this.$modal.confirm("是否确认提交审核?").then(() => {
					this.$reviewerDialog({
						type: 'CGWJ',
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