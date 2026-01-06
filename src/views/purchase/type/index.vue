<template>
	<div class="app-container container_flex">
		<button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
			:button-disable="handleTopButtonDisabled"></button-top>
		<form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
			@handleQuery="handleQuery" @handleResetField="handleResetField">
			<template #name>
				<el-select v-model="formData.code" filterable required style="width: 100%" placeholder="请选择" @change="(val) => getItemData(val)" clearable>
					<el-option v-for="item in dict.type.purchase_code" :key="item.value" :label="item.label"
						:value="item.value">
					</el-option>
				</el-select>
			</template>
			<template #purchaseName>
				<el-select v-model="formData.purchaseCode" filterable required style="width: 100%" placeholder="请选择"
					clearable>
					<el-option v-for="item in purchaseItemData" :key="item.purchaseCode" :label="item.purchaseName"
						:value="item.purchaseCode">
					</el-option>
				</el-select>
			</template>
		</form-data>

		<el-row type="flex" class="container_h">
			<!--用户数据-->
			<el-col :span="18" :xs="24" class="container_flex">
				<right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
					:showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
					@handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
					@cleanClick="cleanClick"></right-toolbar>

				<table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
					:buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
					@handleSelectionChange="handleSelectionChange" @handleButton="handleButton"
					@selectChange="selectChange" @emitAblFilter="emitAblFilter">
					<template slot="status" slot-scope="scope">
						<icon-svg :class="iconClassSize({ 0: 0, 1: 3 }[+scope.value])"
							:icon-class="iconEnableStautsClass({ 0: 0, 1: 3 }[+scope.value])" />{{ scope.value == 1 ?
								"已开启" : "已关闭" }}
					</template>
				</table-index>
				<pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
					:limit.sync="listQuery.pageSize" @pagination="getList" />
			</el-col>
		</el-row>

		<Add ref="addRef" @createSuccess="onDialogOk" />
		<BatchDialog ref="batchDialogRef" @onOk="onDialogOk" />
	</div>
</template>

<script>
import {
	purchaseTypePage
} from "@/api/purchase/type.js";
import * as Api from '@/api/purchase/type.js'
import {
	purchaseItemFindAllList
} from '@/api/purchase/item.js'
import indexMixin from "@/views/mixins";
import Add from "./components/add.vue";
import BatchDialog from "./components/batchDialog.vue";
export default {
	// 物资列表
	name: "/purchase/type",
	mixins: [indexMixin],
	dicts: ['purchase_code'],
	components: {
		Add,
		BatchDialog,
	},
	data() {
		return {
			// 遮罩层
			loading: false,
			purchaseItemData: [],
			// 选中数组
			ids: [],
			// 非单个禁用
			single: true,
			// 非多个禁用
			multiple: true,
			// 显示搜索条件
			showSearch: true,
			// 表格数据
			list: [],
			//列表选中数据
			selection: [],
			// 表格序号是否展示
			numberShow: true,
			// 页面属性
			property: {},
			total: 0,
			// 查询参数
			listQuery: {
				pageNum: 1,
				pageSize: 30,
			},
			// 表单参数
			formData: {
				areaId: "",
			},
			formDataClick: {},
			// 部门树选项
			treeLoading: false,
			filterText: "",
			areaList: [],
		};
	},
	watch: {
		filterText(val) {
			this.$refs.tree.filter(val);
		},
	},
	created() {
		this.menuProperty();
	},
	methods: {
		filterNode(value, data) {
			if (!value) return true;
			return (
				!!this.$py.match(data.deptName, value) ||
				data.deptCode.indexOf(value) !== -1
			);
		},
		menuProperty() {
			let id = this.$route.meta.id;
			this.$store.dispatch("menuProperty", id).then((data) => {
				this.listQuery.pageSize = data.defaultPageSize || 30;
				this.property = data;
			});
		},
		handleTopButtonDisabled(button) {
			return this.selection.some((row) =>
				this.handleButtonDisable(button, row)
			);
		},
		handleButtonDisable(button, row) {
			if (button.buttonCode === "submit" || button.buttonCode === "delete") {
				return row.status === "2" || row.status === "3";
			} else if (button.buttonCode === "update") {
				return row.status === "2" || row.status === "3";
			}
			return false;
		},
		numberChange(val) {
			this.numberShow = val;
		},
		newButton(buttonCode, formId, buttonData) {
			this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData);
		},
		handleCheckAllChange(columns) {
			this.$refs.tableIndex.init(columns);
		},
		clickReset() {
			this.handleQuery();
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
		cleanClick(data) {
			for (const key of data) {
				if (key.indexOf("Start") != -1 || key.indexOf("End") != -1) {
					this.$refs.formData.resetQueryDateRange(key);
				}
				this.formData[key] = null;
			}
			this.handleQuery();
		},
		handleQuery(row = {}) {
			this.listQuery.pageNum = 1;
			this.formData = Object.assign({}, this.formData, row);
			this.formDataClick = Object.assign({}, this.formData, row);
			this.getList();
		},
		operateSuccess() {
			this.handleQuery();
		},
		emitAblFilter(listQuery) {
			this.listQuery = Object.assign({}, this.listQuery, listQuery);
			this.handleQuery();
		},
		handleSelectionChange(ids, single, multiple, selection) {
			this.ids = ids;
			this.single = single;
			this.multiple = multiple;
			this.selection = selection;
		},
		handleResetField() { },
		goAudit() {
			// 跳转到待审核页面
			this.$router.push({
				name: "itemAudit",
			});
		},
		onDialogOk(data) {
			this.getList();
			// this.goAudit()
		},
		handleButton(buttonCode, idArr, rowArr, {
			buttonData
		}) {
			if (buttonCode == "update") {
				this.$refs["addRef"].updateInit(idArr[0]);
			} else if (buttonCode === "create") {
				this.$refs["addRef"].init();
			} else if (buttonCode === "delete") {
				this.handleDelete(idArr);
			} else if (buttonCode === "batch") {
				this.$refs.batchDialogRef.open();
			}
		},
		handleDelete(ids) {
			this.$modal
				.confirm("是否确认删除?")
				.then(function () {
					return Api.purchaseTypeDeleteBatch({
						ids
					});
				})
				.then(() => {
					this.getList();
					this.$modal.msgSuccess("删除成功");
				});
		},
		/** 查询菜单列表 */
		getList() {
			this.loading = true;
			this.getItemData();
			purchaseTypePage(Object.assign({}, this.listQuery, this.formData))
				.then(({
					data
				}) => {
					this.list = data.list;
					this.total = data.total;
				})
				.finally(() => {
					this.loading = false;
				});
		},
		getItemData(code) {
			purchaseItemFindAllList({code, code}).then(res => {
				this.purchaseItemData = res.data;
			});
		},
		/*导出*/
		handleExport(obj) {
			const _this = this;
			let params = {
				pageSize: this.listQuery.pageSize,
				pageNum: this.listQuery.pageNum,
			};
			if (obj.exportType == "1") {
				params.pageNum = -1;
				params.pageSize = -1;
			}
			_this.loading = true;
			getProfileExport(Object.assign({}, obj, params, this.formData))
				.then((response) => {
					const fileName = "客户档案.xlsx";
					if (typeof window.navigator.msSaveBlob !== "undefined") {
						window.navigator.msSaveBlob(new Blob([response.data]), fileName);
					} else {
						let url = window.URL.createObjectURL(new Blob([response.data]));
						let link = document.createElement("a");
						link.style.display = "none";
						link.href = url;
						link.setAttribute("download", fileName);
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link); //下载完成移除元素
						window.URL.revokeObjectURL(url); //释放掉blob对象
					}
				})
				.finally(() => {
					_this.loading = false;
				});
		},

		handleClose() {
			this.open = false;
		},
	},
};
</script>

<style lang="scss" scoped></style>