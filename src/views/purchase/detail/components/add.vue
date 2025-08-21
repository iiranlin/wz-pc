<template>
	<Dialog :title="title" :visible.sync="visible" v-if="visible" :show-close="true" :close-on-click-modal="false"
		:close-on-press-escape="false" :append-to-body="true" :destroy-on-close="true" class="dialog-route"
		width="600px">
		<div class="form-render-wrapper" style="margin-top: 16px">
			<el-form ref="elform" class="process-form" label-position="right" labelWidth="120px" size="medium"
				:showMessage="true" :rules="rules" :model="form">
				<el-row>
					<el-col :span="24">
						<el-form-item :label="'物资大类'" prop="code">
							<el-select v-model="form.code" placeholder="请选择" style="width: 100%" filterable
								@change="codeChange">
								<el-option v-for="item in dict.type.purchase_code" :key="item.value" :label="item.label"
									:value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item :label="'物资类别'" prop="purchaseCode">
							<el-select v-model="form.purchaseCode" placeholder="请选择" style="width: 100%" filterable
								@change="speciesChange">
								<el-option v-for="item in purchaseListData" :key="item.purchaseCode"
									:label="item.purchaseName" :value="item.purchaseCode" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item :label="'物资种类'" prop="purchaseTypeCode">
							<el-select v-model="form.purchaseTypeCode" placeholder="请选择" style="width: 100%" filterable
								@change="purchaseTypeChange">
								<el-option v-for="item in purchaseTypeListData" :key="item.purchaseTypeCode"
									:label="item.purchaseTypeName" :value="item.purchaseTypeCode" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item :label="'细目编码'" prop="purchaseDetailCode">
							<el-input v-model="form.purchaseDetailCode" maxlength="240" placeholder="请输入"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item :label="'细目名称'" prop="purchaseDetailName">
							<el-input v-model="form.purchaseDetailName" maxlength="240" placeholder="请输入"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</div>

		<div slot="footer" class="dialog-footer" v-if="type !== 'view'">
			<el-button round type="primary" @click="handleCreate">确认</el-button>
			<el-button round @click="visible = false">取消</el-button>
		</div>
	</Dialog>
</template>

<script>
	import {
		purchaseItemFindAllList
	} from '@/api/purchase/item.js'
	import {
		purchaseTypeFindAllList
	} from '@/api/purchase/type.js'
	import * as Api from '@/api/purchase/detail.js'
	export default {
		name: "ItemAdd",
		dicts: ["purchase_code"],
		data() {
			return {
				title: '新增',
				visible: false,
				type: 'add',
				form: {},
				purchaseListData: [],
				purchaseTypeListData: [],
				rules: {
					code: [{
						required: true,
						message: '请输入',
						trigger: 'blur'
					}, ],
					purchaseCode: [{
						required: true,
						message: '请输入',
						trigger: 'blur'
					}, ],
					purchaseTypeCode: [{
						required: true,
						message: '请输入',
						trigger: 'blur'
					}, ],
					purchaseDetailCode: [{
						required: true,
						message: '请输入',
						trigger: 'blur'
					}, ],
					purchaseDetailName: [{
						required: true,
						message: '请输入',
						trigger: 'blur'
					}, ],
				},
			}
		},
		methods: {
			//初始化
			init() {
				// this.getAllListData();
				this.form = {};
				this.isEdit = false;
				this.visible = true;
				this.$nextTick(() => {
					this.title = "新建";

				});
			},
			// 编辑初始化
			async updateInit(id) {
				// this.getAllListData();
				this.isEdit = true;
				this.visible = true;
				await Api.purchaseDetailDetail(id).then(({
					data
				}) => {
					this.getItemData(data.code);
					this.getTypeDate(data.code, data.purchaseCode);
					this.form = Object.assign({}, data);
					this.$nextTick(() => {
						this.title = "编辑";
					});
				});
			},
			getItemData(code){
				purchaseItemFindAllList({code, code}).then(res => {
					this.purchaseListData = res.data;
				});
			},
			getTypeDate(code, purchaseCode){
				purchaseTypeFindAllList({code: code, purchaseCode, purchaseCode}).then(res => {
					this.purchaseTypeListData = res.data;
				});
			},
			//新建
			handleCreate() {
				this.$refs.elform.validate(async (valid) => {
					if (valid) {
						this.loading = true;
						await Api[
								this.isEdit ? `purchaseDetailModify` : `purchaseDetailCreate`
							](Object.assign({}, this.form))
							.then(({
								message
							}) => {
								this.loading = false;
								this.$modal.msgSuccess(message);
								this.visible = false;
								this.$emit("createSuccess");
							})
							.catch((err) => {
								this.loading = false;
							});
					}
				});
			},
			//取消
			handleCancel() {
				this.visible = false;
			},
			//关闭dialog回调
			handleDialogClose() {
				this.$refs.elform.resetFields();
			},
			speciesChange(val) {
				this.getTypeDate(this.form.code, val);
				this.form.purchaseName = this.purchaseListData.find((x) => x.purchaseCode == val)
					.purchaseName;
			},
			purchaseTypeChange(val) {
				this.form.purchaseTypeName = this.purchaseTypeListData.find((x) => x.purchaseTypeCode == val)
					.purchaseTypeName;
			},
			codeChange(val) {
				this.getItemData(val);
				this.form.name = this.dict.type.purchase_code.find((x) => x.value == val)
					.label;
			}
		},
	}
</script>