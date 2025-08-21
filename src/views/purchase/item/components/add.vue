<template>
	<Dialog :title="title" :visible.sync="visible" v-if="visible" :show-close="true" :close-on-click-modal="false"
		:close-on-press-escape="false" :append-to-body="true" :destroy-on-close="true" class="dialog-route"
		width="600px">
		<div class="form-render-wrapper" style="margin-top: 16px">
			<el-form ref="elform" class="process-form" label-position="right" labelWidth="120px" size="medium"
				:showMessage="true" :rules="rules" :model="form">
				<el-row :span="24" :gutter="20">
					<el-col :span="24">
						<el-form-item :label="'物资大类'" prop="code">
							<el-select v-model="form.code" placeholder="请选择" style="width: 100%" filterable
								@change="codeChange">
								<el-option v-for="item in dict.type.purchase_code" :key="item.value" :label="item.label"
									:value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<!-- <el-col :span="24">
						<el-form-item :label="'类别编码'" prop="purchaseCode">
							<el-input v-model="form.purchaseCode" maxlength="240" placeholder="请输入"></el-input>
						</el-form-item>
					</el-col> -->
					<el-col :span="24">
						<el-form-item :label="'类别名称'" prop="purchaseName">
							<el-input v-model="form.purchaseName" maxlength="240" placeholder="请输入"></el-input>
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
	import * as Api from '@/api/purchase/item.js'
	export default {
		name: "ItemAdd",
		dicts: ["purchase_code"],
		data() {
			return {
				title: '新增',
				visible: false,
				type: 'add',
				form: {},
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
					purchaseName: [{
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
				this.form = {};
				this.isEdit = false;
				this.visible = true;
				this.$nextTick(() => {
					this.title = "新建";
				});
			},
			// 编辑初始化
			async updateInit(id) {
				this.isEdit = true;
				this.visible = true;
				await Api.purchaseItemDetail(id).then(({
					data
				}) => {
					this.form = Object.assign({}, data);
					this.$nextTick(() => {
						this.title = "编辑";
					});
				});
			},

			//新建
			handleCreate() {
				this.$refs.elform.validate(async (valid) => {
					if (valid) {
						this.loading = true;
						await Api[
								this.isEdit ? `purchaseItemModify` : `purchaseItemCreate`
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
			codeChange(val) {
				this.form.name = this.dict.type.purchase_code.find((x) => x.value == val)
					.label;
			}
		},
	}
</script>