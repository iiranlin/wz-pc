<template>
    <Dialog :title="title" :visible.sync="openDataScope" width="900px" :close-on-click-modal="false" append-to-body >
        <el-form ref="elForm" :model="form" :rules="rules" label-width="85px">
            <el-row>
                <el-col :span="12">
                    <el-form-item label="上级字典:" prop="parentId">
                        <treeselect v-model="form.parentId" @select="handleTreeSelectSelectEvent" :options="deptOptions"
                            :normalizer="normalizer" placeholder="选择上级字典" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="排序:" prop="seq">
                        <el-input-number v-model="form.seq" controls-position="right" :min="1"
                            :max="99"></el-input-number>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="字典编号:" prop="code">
                        <el-input v-model="form.code" placeholder="请输入字典编号" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="字典名称:" prop="name">
                        <el-input v-model="form.name" placeholder="请输入字典名称" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="备注:" prop="remark">
                        <el-input v-model="form.remark" placeholder="请输入备注" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="状态:" prop="status">
                        <el-radio-group v-model="form.status">
                            <el-radio :label="0">启用</el-radio>
                            <el-radio :label="1">停用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <!-- <el-divider></el-divider>
        <el-button type="primary" size="mini" @click="addChild">添加</el-button>
        <el-table class="container_table batchList" :data="tableData" border stripe height="400">
            <el-table-column type="index" align="center" prop="id" width="50">
                <i class="el-icon-s-operation drag"></i>
            </el-table-column>
            <el-table-column prop="code" label="字典编号" align="center" width="150">
                <template slot-scope="{ row }">
                    <el-input v-model="row.code" size="small"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="name" label="字典名称" align="center" width="150">
                <template slot-scope="{ row }">
                    <el-input v-model="row.name" size="small"></el-input>
                </template>
            </el-table-column>
            <el-table-column label="状态" align="center">
                <template slot-scope="{ row }">
                    <el-switch v-model="row.status" :active-value="0" :inactive-value="1"></el-switch>
                </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" align="center" width="250">
                <template slot-scope="{ row }">
                    <el-input v-model="row.remark" size="small"></el-input>
                </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" align="center" width="80">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.$index)">
                    </el-button>
                </template>
            </el-table-column>
        </el-table> -->
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="type == 'create' ? submitDataScope() : commonModify()">确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>

<script>
import { commonCreate, commonDetail, commonModify, getMaxSeqByParentId, getChildListByParentId } from "@/api/system/dict"
import Sortable from 'sortablejs'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
    props: {
        deptOptions: {
            type: Array,
            default: () => [],
        },
    },
    components: {Treeselect},
    data() {
        return {
            loading: false,
            title: '新增字典',
            type: 'add',
            id: '',
            openDataScope: false,
            form: {
                name: '',
                code: '',
                seq: 0,
                parentId: undefined,
                remark: '',
                status: 0
            },
            tableData: [],
            // 表单校验
            rules: {
                code: [
                    { required: true, message: "字典编号不能为空", trigger: "blur" }
                ],
                name: [
                    { required: true, message: "字典名称不能为空", trigger: "blur" }
                ],
            }
        }
    },
    created() {
    },
    methods: {
        /** 提交按钮（数据权限） */
        init(type, id) {
            this.type = type;
            this.id = id;
            this.openDataScope = true;
            this.$nextTick(() => {
                this.$refs.elForm.resetFields();
                this.tableData = []
                if (type === 'update') {
                    this.title = "修改字典";
                    this.commonDetail(id);
                } else {
                    this.getMaxSeqByParentId();
                }
                // this.rowDropPage();
            })
            this.form.parentId = id || undefined;
        },
        /** 转换部门数据结构 */
        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children;
            }
            return {
                id: node.id,
                label: node.name,
                children: node.children
            };
        },
        commonDetail(id) {
            commonDetail(id).then(({ data }) => {
                this.form = data
                this.form.parentId = data.parentId || undefined;
                this.getChildrenList();
            })
        },
        handleTreeSelectSelectEvent() {
            this.$nextTick(() => {
                this.getMaxSeqByParentId();
            })
        },
        getMaxSeqByParentId() {
            const parentId = this.form.parentId;
            getMaxSeqByParentId({ parentId }).then(({ data }) => {
                this.form.seq = data;
            })
        },
        getChildrenList() {
            const parentId = this.form.id;
            if (!!parentId) {
                getChildListByParentId({ parentId }).then((res) => {
                    this.tableData = res.data
                })
            } else {
                this.tableData = []
            }
        },
        submitDataScope() {
            this.$refs["elForm"].validate(valid => {
                if (valid) {
                    this.loading = true;
                    this.form.children = this.tableData
                    commonCreate(this.form).then(({ success, message }) => {
                        this.loading = false;
                        if (success) {
                            this.$modal.msgSuccess(message);
                            this.openDataScope = false;
                            this.$emit("operateSuccess");
                        } else {
                            this.$modal.msgError(message);
                        }
                    });
                }
            })
        },
        commonModify() {
            this.$refs["elForm"].validate(valid => {
                if (valid) {
                    this.loading = true;
                    this.form.children = this.tableData
                    commonModify(Object.assign({}, this.form, { id: this.id })).then(({ success, message }) => {
                        this.loading = false;
                        if (success) {
                            this.$modal.msgSuccess(message);
                            this.openDataScope = false;
                            this.$emit("operateSuccess");
                        } else {
                            this.$modal.msgError(message);
                        }
                    });
                }
            })
        },
        rowDropPage() { // 行拖拽
            const tbodys = document.querySelector('.batchList .el-table__body-wrapper tbody')
            const that = this

            Sortable.create(tbodys, {
                handle: '.drag',
                onEnd({ newIndex, oldIndex }) {
                    let tableData = that.tableData
                    const currRow = tableData.splice(oldIndex, 1)[0]
                    tableData.splice(newIndex, 0, currRow)
                    that.tableData = []
                    that.$nextTick(() => {
                        that.tableData = tableData
                    })
                }
            })
        },
        addChild() {
            const child = {
                name: '',
                code: '',
                remark: '',
                status: 0
            }
            this.tableData.push(child)
        },
        handleDelete(index) {
            let that = this
            this.$modal.confirm('是否确认删除?').then(function () {
                that.tableData.splice(index, 1)
            }).then(() => {
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        }
    }
};
</script>
<style lang="scss" scoped>
.el-divider--horizontal {
    margin: 10px 0;
}

.drag {
    cursor: move;
    font-size: 20px;
}

.el-table {
    margin: 0;
}
</style>