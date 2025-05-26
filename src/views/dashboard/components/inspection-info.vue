<template>
    <div>
        <Dialog title="系统巡检" :visible.sync="dialogVisible" width="40%" @close="" v-if="dialogVisible" >
            <el-table :data="inspectionData" border stripe>
                <el-table-column prop="appName" label="系统名称" align="left">
                </el-table-column>
                <el-table-column prop="platType" label="平台类型" width="150" align="left">
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="150" align="center">
                    <template slot-scope="{ row }">
                        <el-button type="primary" size="small" @click="operateInspection(row, 1)">
                            正常
                        </el-button>
                        <el-button type="danger" size="small" @click="operateInspection(row, 0)">
                            异常
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <span slot="footer">
                <el-button @click="dialogVisible = false">取消</el-button>
            </span>
        </Dialog>
        <!-- 异常处理 -->
    </div>
</template>

<script>
import { checkInspectionUser, checkInspectionInfo, addInspectionInfo } from '@/api/passport'

export default {
    name: "inspection-info",
    data() {
        return {
            dialogVisible: false,
            inspectionData: []
        }
    },
    methods: {
        init(userCode) {
            checkInspectionUser().then(({ success, data }) => {
                if (success) {
                    if (data.indexOf(userCode) != -1) {
                        this.checkInspectionInfo();
                    } else {
                        this.$message.error(`操作失败：您没有操作权限`);
                    }
                } else {
                    this.$message.error(`操作失败：请稍后再试或联系管理员`);
                }
            })
        },
        checkInspectionInfo() {
            checkInspectionInfo().then(({ success, message, data }) => {
                if (success) {
                    if (!!data) {
                        this.dialogVisible = true;
                        const platType = data['platType'];

                        const list = platType.split(',').map((res) => {
                            return {
                                appName: data.appName,
                                platType: res
                            }
                        })

                        this.inspectionData = list;
                    } else {
                        this.$alert('今日系统巡检已经完成！', '系统巡检');
                    }
                } else {
                    this.inspectionData = []
                    this.$message.warning(`${message}`);
                }
            })
        },
        operateInspection(row, isNormal) {

            let platType = row.platType;
            switch (platType) {
                case "APP":
                    platType = "H5";
                    break
                case "PC":
                    platType = "WEB";
                    break
                default:
                    platType = "unknown";
            }

            if (isNormal == 0) {
                // 异常
                this.$prompt('请输入该平台异常原因', '上报巡检状态', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                }).then(({ value }) => {
                    if (!!value) {
                        this.$message.warning(`请输入异常原因`);
                    } else {
                        submit(isNormal, value)
                    }
                });
            } else {
                // 正常
                this.$modal.confirm('是否确认此平台正常？', '上报巡检状态', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    submit(isNormal)
                });
            }

            const submit = (isNormal, remark = '') => {
                addInspectionInfo({ platType, isNormal, remark }).then(({ success, message }) => {
                    if (success) {
                        this.$message.success(`上报成功：${message}`);
                        this.checkInspectionInfo()
                    } else {
                        this.$message.error(`上报失败：${message}`);
                    }
                })
            }
        },
    },
}
</script>

<style lang="scss" scoped></style>