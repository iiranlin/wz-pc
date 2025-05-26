<template>
    <Dialog tabindex='1' class="flex-dialog" title="替代调整" :visible.sync="visible" :close-on-click-modal="false"
        append-to-body width="70%">
        <el-table default-expand-all :data="tableData.detailsList" row-key="uid" border style="width: 100%"
            max-height="500" :tree-props="{ children: 'replaceList' }">
            <el-table-column align="left" label="序号" width="50px" type="index" :index="tableIndex" />
            <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip
                width="240"></el-table-column>
            <el-table-column align="left" label="物料编码" prop="matlCode" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small" style="width: 100%;"
                        @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, id: row.matlId, refName: 'materialArchivesOperate' })">{{
                            row.matlCode }}</el-button>
                </template>
            </el-table-column>

            <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="计量单位" prop="matlUnit" show-overflow-tooltip>
                <template slot-scope="{row}">
                    {{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}
                </template>
            </el-table-column>
            <el-table-column align="left" label="计划属性" prop="planAttribute" show-overflow-tooltip width="100">
                <template slot-scope="scope">
                    <span
                        :class="[scope.row.planAttribute !== '1' ? `planAttribute-${scope.row.planAttribute}` : '']">{{
                            scope.row.planAttribute | orderTypeFilter(dict.type.planAttribute) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" label="需求数量" prop="demandNum" show-overflow-tooltip width="100">
            </el-table-column>
            <el-table-column align="left" label="库存数量" prop="inventoryNum" show-overflow-tooltip width="150">
            </el-table-column>
            <el-table-column align="left" label="计划数量" prop="planNum" width="220">
                <template slot="header">
                    <span>计划数量</span>
                </template>
                <template slot-scope="scope">
                    <el-input-number style="width: calc(100% - 10px);" v-model="scope.row.planNum" :min="0" :precision="0"
                        controls-position="right"></el-input-number>
                </template>
            </el-table-column>
            <el-table-column align="left" label="领料需求数量" prop="pickingDemandNum" width="220">
                <template slot="header">
                    <span>领料需求数量</span>
                </template>
                <template slot-scope="scope">
                    <el-input-number style="width: calc(100% - 10px);" v-model="scope.row.pickingDemandNum" :min="0" :precision="0"
                        controls-position="right"></el-input-number>
                </template>
            </el-table-column>
            <el-table-column align="left" prop="subOrReplace" label="子件/替代件" width="100">
                <template slot-scope="scope">
                    <span :class="[scope.row.subOrReplace == '2' ? `planAttribute-2` : '']">{{ {1: '子件', 2: '替代件'}[scope.row.subOrReplace]
                        }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" prop="replaceMethod" label="替代方式" width="100">
                <template slot-scope="scope">
                    <span>{{ (scope.row.replaceMethod || '--') | orderTypeFilter(dict.type.replaceMethod) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" prop="replaceOrder" label="替代次序" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.replaceOrder || '--' }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" prop="childNum" label="替代用量" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.childNum || '--' }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" prop="baseNum" label="子件底数" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.baseNum || '--' }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" prop="unitNum" label="单位用量" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.unitNum || '--' }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" prop="isMainMatl" label="是否主料" width="100">
                <template slot-scope="{row}">
                    {{ row.isMainMatl || '0' | orderTypeFilter(dict.type.YesNo) }}
                </template>
            </el-table-column>
        </el-table>

        <template #footer>
            <el-button plain round type="primary" @click="save">确认</el-button>
            <el-button plain round @click.native="visible = false">取消</el-button>
        </template>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>
import indexMixin from '@/views/mixins';
export default {
    mixins: [indexMixin],
    dicts: ['MeasureUnit', 'planAttribute', 'demandPlanSourceType', 'YesNo', 'replaceMethod'],
    components: { DetailDialog: () => import('@/views/components/DetailDialog') },
    data() {
        return {
            visible: false,
            tableData: {
                detailsList: [],
            },
        }
    },

    methods: {
        init(list = []) {
            this.visible = true;
            this.tableData.detailsList = [...list].map(item => ({ ...item, _planNum: item.planNum, _pickingDemandNum: item.pickingDemandNum, replaceList: item.replaceList.map(sub => ({ ...sub, _planNum: sub.planNum, _pickingDemandNum: sub.pickingDemandNum, })) }))

        },
        diffDataChange() {
            let flag = false
            for (let i = 0; i < this.tableData.detailsList.length; i++) {
                const { planNum, _planNum, pickingDemandNum, _pickingDemandNum, replaceList } = this.tableData.detailsList[i]
                if (planNum != _planNum || pickingDemandNum != _pickingDemandNum) {
                    flag = true
                    break;
                }
                if (Array.isArray(replaceList) && !!replaceList.length && replaceList.some(s => s.planNum !== s._planNum || s._pickingDemandNum !== s.pickingDemandNum)) {
                    flag = true
                    break;
                }
            }
            return flag
        },
        async save() {
            try {
                if (this.diffDataChange()) {
                    await this.$modal.confirm('数据有调整，是否以手动调整的为准？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    })
                }
                this.$emit('change', this.tableData.detailsList)
                this.visible = false
            } catch (err) {
                console.error(err)
            }

        },
    }
}
</script>
<style lang="scss" scoped>
.slotIcon-color {
    color: #1890ff;
    font-size: 16px;
    margin-left: 2px;
}

.slotIcon-color-content {
    color: red;
}
</style>