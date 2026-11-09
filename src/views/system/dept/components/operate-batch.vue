<template>
    <!-- 添加或修改部门对话框 -->
    <Dialog title="批量修改" :visible.sync="dialogVisible" :close-on-click-modal="false" width="1000px" append-to-body >
        <el-form ref="elForm" :model="form" label-width="85px" size="mini">
            <el-row>
                <el-col :span="12">
                    <el-form-item label="上级部门:" prop="parentId">
                        <treeselect v-model="form.parentId" :options="deptOptions" :normalizer="normalizer"
                            @select="selectChange" placeholder="选择上级部门" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="状态" prop="status">
                        <el-radio v-model="form.status" :label="0">启用</el-radio>
                        <el-radio v-model="form.status" :label="1">停用</el-radio>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-button type="primary" size="mini" @click="quickSort">一键排序</el-button>
            <el-button type="primary" size="mini" @click="resetList">重置列表</el-button>
        </el-form>
        <el-divider direction="horizontal" content-position="left"></el-divider>
        <el-table class="container_table batchList" :data="tableData" border stripe height="450">
            <el-table-column type="index" align="center" prop="id" width="50">
                <i class="el-icon-s-operation drag"></i>
            </el-table-column>
            <el-table-column prop="parentCode" label="上级编号" align="left"></el-table-column>
            <el-table-column prop="parentName" label="上级名称" show-overflow-tooltip width="200px" align="left"></el-table-column>
            <el-table-column prop="deptCode" label="部门编号" align="left"></el-table-column>
            <el-table-column prop="deptName" label="部门名称" align="left" show-overflow-tooltip width="200px">
                <template slot-scope="{ row }">
                    <el-input v-model="row.deptName" size="small"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="seq" label="排序" align="left" width="150px">
                <template slot-scope="{ row }">
                    <el-input-number v-model="row.seq" controls-position="right" :min="0" :max="999"
                        size="small"></el-input-number>
                </template>
            </el-table-column>
            <el-table-column label="状态" align="center">
                <template slot-scope="{ row }">
                    <el-switch v-model="row.status" active-color="#13ce66" inactive-color="#ff4949" :active-value="0"
                        :inactive-value="1">
                    </el-switch>
                </template>
            </el-table-column>
        </el-table>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="onSubmit">确定</el-button>
            <el-button @click="dialogVisible = false">取 消</el-button>
        </div>
    </Dialog>
</template>

<script>
import Sortable from 'sortablejs'
import { sysDeptModifyBatch } from '@/api/system/dept'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
    name: "operateBatch",
    props: {
        property: {
            type: Object,
            default: () => { }
        },
        deptOptions: {
            type: Array,
            default: () => [],
        },
    },
    components: {Treeselect},
    data() {
        return {
            dialogVisible: false,
            form: {
                status: null
            },
            originalList: [],
            tableData: []
        }
    },
    watch: {
        form: {
            immediate: true,
            deep: true,
            handler(newValue) {
                this.tableData.map(element => {
                    element.status = newValue.status
                });
            }
        }
    },
    created() {
    },
    methods: {
        init(data) {
            this.dialogVisible = true
            this.originalList = JSON.parse(JSON.stringify(data))
            this.tableData = JSON.parse(JSON.stringify(data))
            this.$nextTick(() => {
                this.$refs['elForm'].resetFields()
                this.rowDropPage();
            })
        },
        /** 转换部门数据结构 */
        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children;
            }
            return {
                id: node.id,
                label: node.deptName,
                children: node.children,
            };
        },
        selectChange(searchQuery, instanceId) {
            const { id, deptCode, deptName } = searchQuery
            this.tableData.map(element => {
                if (!!id) {
                    element.parentId = id
                    element.parentCode = deptCode
                    element.parentName = deptName
                }
            });
        },
        onSubmit() {
            const data = this.tableData
            sysDeptModifyBatch(data).then(({ success, message }) => {
                if (success) {
                    this.$modal.msgSuccess(message);
                    this.dialogVisible = false;
                    this.$emit("deptSuccess");
                } else {
                    this.$modal.msgError(message);
                }
            })
        },
        quickSort() {
            const list = this.tableData
            for (let i = 0; i < list.length; i++) {
                list[i]['seq'] = i + 1;
            }
            this.$message.success("排序成功")
        },
        resetList() {
            this.$refs['elForm'].resetFields()
            this.$nextTick(() => {
                this.tableData = JSON.parse(JSON.stringify(this.originalList))
                this.$message.success("重置成功")
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

    },
};
</script>
<style lang="scss" scoped>
.el-divider--horizontal {
    margin: 10px 0;
}

.el-table {
    margin: unset;
}

.drag {
    cursor: move;
    font-size: 20px;
}
</style>