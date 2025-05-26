<template>
    <div class="app-container container_flex">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
            @newButton="newButton"></button-top>
        <div class="container_flex_form">

            <el-switch v-if="queryType === 'create'" v-model="checked" @change="checkoutStatus"
                class="checkbox_required" active-text="隐藏非必填项">
            </el-switch>
            <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv"
                :class="{ 'formRender_view': queryType === 'view' }" @appendButtonClick="handleAppendButtonClick"
                @selectChange="selectChange" @buttonClick="handleButtonClick" @treeSelectSelect="treeSelectSelect"
                @treeSelectInput="treeSelectInput" @operationButtonClick="operationButtonClick" @formChange="handleFormChange">
                <div slot="slotIcon">
                    <div class="button-with-tooltip" v-if="queryType === 'create'">
                        <div v-if="inSourceId == '99'">
                            <el-button class="un-quilt-btn" @click="handleChoiceMater">选择物料</el-button>
                        </div>
                        <div v-else>
                            <el-button class="un-quilt-btn" style="margin-left: 20px;"
                                :disabled="selectRowList.length === 0" @click="branchEdit">批改</el-button>
                            <tooltip content="批改可多选后批量维护" />
                        </div>
                        <el-button class="un-quilt-btn" style="margin-left: 20px;" @click="deleteRow"
                            :disabled="selectRowList.length === 0">删除</el-button>
                    </div>
                </div>
                <div slot="orderDetails" class="order-details">
                    <el-form ref="elForm" :model="validateTable" :rules="validateTable.rules">
                        <el-table :data="validateTable.detailData" border :height="screenHeight" ref="elTable"
                            @selection-change="handleSelectionChange">
                            <el-table-column fixed="left" align="center" width="50" type="selection" />
                            <el-table-column align="left" width="50" label="序号" type="index"></el-table-column>
                            <el-table-column align="left" width="170" label="来源单号"
                                prop="sourceCode"></el-table-column>
                            <el-table-column align="left" width="150" label="来源行号"
                                prop="sourceRowNum"></el-table-column>
                            <el-table-column align="left" width="150" label="质检单号" prop="qiCode"></el-table-column>
                            <el-table-column align="left" width="150" label="物料编码" prop="matlCode"></el-table-column>
                            <el-table-column align="left" width="240" label="物料名称" prop="matlName"></el-table-column>
                            <el-table-column align="left" width="150" label="规格型号" prop="matlType"></el-table-column>
                            <el-table-column align="left" width="80" label="计量单位" prop="matlUnit">
                                <template slot-scope="{row}">
                                    <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column align="left" width="260" label="所属组织" prop="unitId">
                                <template slot="header">
                                    <span style="color:red">*</span>
                                    <span>所属组织</span>
                                </template>
                                <template slot-scope="scope">
                                    <el-form-item v-if="queryType != 'view' && inSourceId == '99'"
                                        :prop="'detailData.' + scope.$index + '.unitId'"
                                        :rules="[{ required: true, message: '请选择', trigger: 'change' }]">
                                        <treeselect :appendToBody="true" z-index="9999" placeholder="请选择"
                                            v-model="scope.row.unitId"
                                            v-columnFormat="{
                                                index: scope.$index, 
                                                prop: 'unitId', 
                                                list: validateTable.detailData
                                            }"
                                            :options="unitTreeData" :normalizer="normalizera"
                                            @select="(data, idx) => { selectTreeselect(scope, data, idx) }" />
                                    </el-form-item>
                                    <span v-else>{{ scope.row.unitName }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column align="left" width="80" label="单据原量"
                                prop="originalNum"></el-table-column>
                            <el-table-column label="合格品入库">
                                <el-table-column align="left" width="150" label="合格品已生成入库单数量" prop="quAlreadyInNum">
                                    <template slot="header">
                                        合格品已生成入库单数量(累计)
                                        <tooltip content=">可以多次入库，已生成入库单的数量累计计算" />
                                    </template>
                                    <template slot-scope="{row}">
                                        {{ row.inSource == '99'?'0':queryType == 'update' ? row.quAlreadyInNum - row.qualifiedInNumA
                                        :row.quAlreadyInNum}}
                                    </template>
                                </el-table-column>
                                <el-table-column align="left" width="160" label="本次合格品待入库数量" prop="qualifiedInNum">
                                    <template slot="header">
                                        <span style="color:red">*</span>
                                        <span>本次合格品待入库数量</span>
                                        <tooltip :content="inSourceCode == '3' ?'始终=单据原量-合格品已生成入库单数量（累计）':'>如果线下换货，可自行改大数量'" />
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item v-if="queryType != 'view'"
                                            :prop="'detailData.' + scope.$index + '.qualifiedInNum'"
                                            :rules="validateTable.rules.qualifiedInNum">
                                            <el-input-number style="width: 100%;" v-model="scope.row.qualifiedInNum"
                                                @change="numChange('qualifiedInNum', scope)" controls-position="right"
                                                :min="0" :precision="2"></el-input-number>
                                        </el-form-item>
                                        <span v-else>{{ scope.row.qualifiedInNum }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column align="left" width="160" label="本次合格品入库仓库" prop="quAreaCode">
                                    <template slot="header">
                                        <span style="color:red">*</span>
                                        <span>本次合格品入库仓库</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item v-if="queryType != 'view' && inSourceCode != '3'"
                                            :prop="'detailData.' + scope.$index + '.quWarehouseId'"
                                            :rules="[{
                                                required: !!scope.row.qualifiedInNum, validator: validator, trigger: 'change'
                                            }]">
                                            <selectTree :index="scope.$index" v-model="scope.row.quWarehouseId"
                                                :options="scope.row.dataOptions || dataOptions" :props="optionsProps" @input="getQuAreaCodeValue"
                                                :disabledFun="disabledFun" />
                                        </el-form-item>
                                        <span v-else>{{ scope.row.quWarehouseName }}</span>
                                    </template>
                                </el-table-column>
                            </el-table-column>
                            <el-table-column label="不良品入库">
                                <el-table-column align="left" width="150" label="不良品已生成入库单数量" prop="unquAlreadyInNum">
                                    <template slot="header">
                                        不良品已生成入库单数量(累计)
                                        <tooltip content="可以多次入库，已生成入库单的数量累计计算" />
                                    </template>
                                    <template slot-scope="{row}">
                                        {{ row.inSource == '99'?'0': (queryType == 'update' ? row.unquAlreadyInNum - row.unqualifiedInNumA
                                        :row.unquAlreadyInNum) || ''}}
                                    </template>
                                </el-table-column>
                                <el-table-column align="left" width="160" label="本次不良品待入库数量" prop="unqualifiedInNum">
                                    <template slot="header">
                                        本次不良品待入库数量
                                        <tooltip content="如果不良品不入库，可自行改小数量" />
                                    </template>
                                    <template slot-scope="scope">
                                        <el-input-number v-if="queryType != 'view' && inSourceCode != '3'"
                                            @change="numChange('unqualifiedInNum', scope)" style="width: 100%;"
                                            v-model="scope.row.unqualifiedInNum" controls-position="right" :min="0"
                                            :precision="2"></el-input-number>
                                        <span v-else>{{ scope.row.unqualifiedInNum || '' }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column align="left" width="160" label="本次不良品入库仓库" prop="unquWarehouseCode">
                                    <template slot="header">
                                        <span>本次不良品入库仓库</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item v-if="queryType != 'view' && inSourceCode != '3'"
                                            :prop="'detailData.' + scope.$index + '.unquWarehouseId'" :rules="[{
                                                required: !!scope.row.unqualifiedInNum, validator: validator, trigger: 'change'
                                            }]">
                                            <selectTree :index="scope.$index" v-model="scope.row.unquWarehouseId"
                                                :options="scope.row.unquDataOptions || unquDataOptions" :props="optionsProps"
                                                :disabledFun="disabledFun" @input="getUnQuAreaCodeValue" />
                                        </el-form-item>
                                        <span v-else>{{ scope.row.unquWarehouseName }}</span>
                                    </template>
                                </el-table-column>
                            </el-table-column>
                            <el-table-column align="center" width="240" label="生产日期" prop="manufactureDate">
                                <template slot="header">
                                    <span>生产日期</span>
                                </template>
                                <template slot-scope="scope">
                                    <el-date-picker v-if="queryType != 'view'" style="width: 100%;"
                                        value-format="yyyy-MM-dd" v-model="scope.row.manufactureDate"></el-date-picker>
                                    <span v-else>{{ parseTime(scope.row.manufactureDate, '{y}-{m}-{d}') }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column align="center" width="240" label="失效日期" prop="expireDate">
                                <template slot="header">
                                    <span>失效日期</span>
                                </template>
                                <template slot-scope="scope">
                                    <el-date-picker v-if="queryType != 'view'" style="width: 100%;"
                                        value-format="yyyy-MM-dd" v-model="scope.row.expireDate"></el-date-picker>
                                    <span v-else>{{ parseTime(scope.row.expireDate, '{y}-{m}-{d}') }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column align="left" width="160" label="单价（不含税，单位：元）" prop="price"
                                v-if="inSourceId == '99'">
                                <template slot="header">
                                    <span style="color: red">*</span>
                                    <span>单价（不含税，单位：元）</span>
                                </template>
                                <template slot-scope="scope">
                                    <el-form-item v-if="queryType != 'view'"
                                        :prop="'detailData.' + scope.$index + '.price'"
                                        :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
                                        <el-input-number @change="numChange('price', scope)" style="width: 100%;"
                                            v-model="scope.row.price" controls-position="right" :min="0"
                                            :precision="2"></el-input-number>
                                    </el-form-item>
                                    <span v-else>{{ scope.row.price }}</span>
                                </template>
                            </el-table-column>

                            <el-table-column align="center" width="150" label="操作" prop="materialCount" fixed="right"
                                v-if="queryType === 'create'">
                                <template slot-scope="scope">
                                    <el-button type="text" @click="handleDeleteRow(scope.$index)">删行</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-form>

                </div>
            </VFormRender>
        </div>
        <select-quote ref="selectQuote" @selections="selections"></select-quote>
        <Dialog title="批量修改" close-on-click-modal :visible.sync="branchEditVis" width="896px">
            <el-form :model="branchEditForm" label-width="100px">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="合格品入库仓库" label-width="120px">
                            <selectTree :disable="queryType === 'view'" style="width: 300px;" :index="-1"
                                :value="branchEditForm.quWarehouseId" :options="dataOptions" :props="optionsProps"
                                @getValue="getQuAreaCodeValue" :disabledFun="disabledFun" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="不良品入库仓库" label-width="120px">
                            <selectTree :disable="queryType === 'view'" style="width: 300px;" :index="-1"
                                :value="branchEditForm.unquWarehouseId" :options="unquDataOptions" :props="optionsProps"
                                :disabledFun="disabledFun" @getValue="getUnQuAreaCodeValue" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button class="un-quilt-btn confirm" type="primary" @click="submitForm">确 定</el-button>
                <el-button class="un-quilt-btn cancel" @click="branchEditVis = false">取 消</el-button>
            </div>
        </Dialog>
        <choice-material ref="choiceMaterial" @choiceMaterialClick="choiceClick" :isInventory="true" />
    </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { deptTree, getUnitTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import selectQuote from './components/selectQuote/index.vue'
import { getWarehouseTree, inMaintenanceSave, getInDetail, detailSave, getMainDetail, productPrice } from '@/api/warehouseManage/inventoryMaintenance'
import selectTree from '@/components/selectTree/index.vue'
import { getUserInfo } from '@/utils/user-info'
import indexMixin from '@/views/mixins';
import { pushInList, reportIn } from '@/api/projectManagement/productionOrder'
import { rejectedRawIn } from '@/api/projectManagement/productionRejected'
import { uniqueArrByField } from '@/utils'
import { qiInQuoteList } from '@/api/prodmgr-inv/qi'
import choiceMaterial from "@/views/components/choice-material"
import VFormRender from '@/components/form-render/index'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
    name: "createInventoryMaintenance",
    components: { selectQuote, selectTree, choiceMaterial, VFormRender, Treeselect, tooltip: () => import('@/components/tooltip') },
    mixins: [indexMixin],
    dicts: ['MeasureUnit'],
    data() {

        return {
            loading: false,
            queryType: '',
            displayFormat: 'yyyy-MM-DD',
            modelFormat: 'yyyy-MM-DD',
            screenHeight: 300,
            branchEditVis: false,
            branchEditForm: {
                unquWarehouseId: '',
                unquWarehouseCode: '',
                unquWarehouseName: '',
                unquWarehouseMode: '',
                quWarehouseId: '',
                quWarehouseCode: '',
                quWarehouseName: '',
                quWarehouseMode: ''
            },
            queryId: '',
            queryName: '',
            formJson: {},
            formData: {},
            status: '',
            // 菜单按钮、字段等数据
            buttonTop: [
                { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update, product' },
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update, product' },
                { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
                { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
                { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
                // { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
            ],
            queryAuditArr: null,
            globalDsv: {
                VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
                VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
                Authorization: getToken(),
                businessType: '01',
            },
            validateTable: {
                detailData: [],
                rules: {
                    qualifiedNum: [{ required: true, message: '', trigger: 'blur' }],


                }
            },
            managerData: [],
            dataOptions: [],
            unquDataOptions: [],
            quAreaCode: null,
            selectRowList: [],
            inSourceId: null,
            inSourceCode: null,
            optionsProps: {
                children: "children",
                label: "name",
                value: "id",
                disabled: (node, data) => {
                    return data.level == 1;
                },
            },
            userInfo: getUserInfo(),
            checked: false,
            unitTreeData: []
        }
    },
    computed: {
        ...mapGetters(['infoData']),
    },
    created() {
        this.init();
    },
    methods: {
        /** 转换字段数据结构 */
        normalizera(node) {
            if (node.children && !node.children.length) {
                delete node.children
            }
            return {
                id: node.id,
                label: node.deptName,
                children: node.children
            }
        },
        validator(rule, value, callback) {
            if (!value && rule.required) {
                callback(new Error('请选择仓库'))
            } else {
                callback()
            }
        },
        checkoutStatus(flag) {
            const widgets = ['grid51735', 'grid63517', 'inCode']
            if (flag) {
                this.$refs.vFormRef.hideWidgets(widgets)
            } else {
                this.$refs.vFormRef.showWidgets(widgets)
            }
        },
        getViewportSize() {
            return {
                width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
            };
        },
        disabledFun(node) {
            return node.level !== 1
        },
        handleSelectionChange(rowList) {
            this.selectRowList = rowList
        },
        deleteRow() {
            if (this.selectRowList.length === 0) return;
            const selectRowMap = new Map(this.selectRowList.map(row => [row.matlCode, true]));
            this.validateTable.detailData = this.validateTable.detailData.filter(item => !selectRowMap.has(item.matlCode));
        },
        branchEdit() {
            if (this.selectRowList.length === 0) return
            this.branchEditVis = true
        },
        handleChoiceMater() {
            this.$refs.choiceMaterial.init(null, [], this.validateTable.detailData)
        },
        async choiceClick(data) {
            this.getWarehouseTree('1','')
            this.getWarehouseTree('2','')

            const arr = data.map(item => ({
                ...item,
                qualifiedInNum: undefined,
                unqualifiedInNum: undefined,
                unqualifiedInAmount: 0,
                qualifiedInAmount: 0,
                unitId: undefined,
                price: 0
            }))
            this.validateTable.detailData = this.validateTable.detailData.concat(arr)
        },
        unQuiltExclude() {
            if (this.selectRowList.length === 0) return;
            this.selectRowList.map(item => {
                this.validateTable.detailData.map(row => {
                    if (row.matlCode === item.matlCode) {
                        item.unqualifiedInNum = 0
                    }
                })
            })
            this.$modal.msgSuccess('操作成功')
        },
        handleDeleteRow(idx) {
            this.validateTable.detailData = this.validateTable.detailData.filter((_, index) => idx !== index)
            const codes = uniqueArrByField(this.validateTable.detailData, 'sourceCode')
            const idArr = uniqueArrByField(this.validateTable.detailData, 'sourceId')
            this.$refs['vFormRef'].setFieldValue('sourceCode', codes.join(','))
            this.$refs['vFormRef'].setFieldValue('sourceId', idArr.join(','))
        },
        getUnQuAreaCodeValue(node, index, valueId) {
            if (index === -1) {
                // 批改
                this.branchEditForm.unquWarehouseCode = !!valueId ? node.code : ''
                this.branchEditForm.unquWarehouseId = !!valueId ? node.id : ''
                this.branchEditForm.unquWarehouseName = !!valueId ? node.name : ''
                this.branchEditForm.unquWarehouseMode = !!valueId ? node.warehouseMode : ''
            } else {
                if (node) {
                    this.$set(this.validateTable.detailData, index, { ...this.validateTable.detailData[index], unquWarehouseCode: node.code, unquWarehouseId: node.id, unquWarehouseName: node.name, unquWarehouseMode: node.warehouseMode })
                } else {
                    this.$set(this.validateTable.detailData, index, { ...this.validateTable.detailData[index], unquWarehouseCode: '', unquWarehouseId: '', unquWarehouseName: '', unquWarehouseMode: '' })
                }
                this.$nextTick(() => {
                    this.$refs.elForm.validateField('unquWarehouseId')
                })

            }
        },
        getQuAreaCodeValue(node, index, valueId) {
            if (index === -1) {
                // 批改
                console.log(node)
                this.branchEditForm.quWarehouseCode = !!valueId ? node.code : ''
                this.branchEditForm.quWarehouseId = !!valueId ? node.id : ''
                this.branchEditForm.quWarehouseName = !!valueId ? node.name : ''
                this.branchEditForm.quWarehouseMode = !!valueId ? node.warehouseMode : ''
            } else {
                if (node) {
                    this.$set(this.validateTable.detailData, index, { ...this.validateTable.detailData[index], quWarehouseCode: node.code, quWarehouseId: node.id, quWarehouseName: node.name, quWarehouseMode: node.warehouseMode })
                } else {
                    this.$set(this.validateTable.detailData, index, { ...this.validateTable.detailData[index], quWarehouseCode: '', quWarehouseId: '', quWarehouseName: '', quWarehouseMode: '' })
                }
                this.$nextTick(() => {
                    this.$refs.elForm.validateField('quWarehouseId')
                })


            }


        },
        submitForm() {
            this.validateTable.detailData.map(item => {
                this.selectRowList.map(ele => {
                    if (item.sourceDetailId === ele.sourceDetailId) {
                        item.quWarehouseCode = this.branchEditForm.quWarehouseCode
                        item.quWarehouseId = this.branchEditForm.quWarehouseId
                        item.quWarehouseName = this.branchEditForm.quWarehouseName
                        item.quWarehouseMode = this.branchEditForm.quWarehouseMode
                        item.unquWarehouseCode = this.branchEditForm.unquWarehouseCode
                        item.unquWarehouseId = this.branchEditForm.unquWarehouseId
                        item.unquWarehouseName = this.branchEditForm.unquWarehouseName
                        item.unquWarehouseName = this.branchEditForm.unquWarehouseName
                        item.unquWarehouseMode = this.branchEditForm.unquWarehouseMode
                        
                    }
                })
            })
            this.branchEditVis = false
            for (let key in this.branchEditForm) {
                this.branchEditForm[key] = ''
            }
        },
        buttonShow(item) {
            if (['submit', 'update'].includes(item.buttonCode) && !['0', '1'].includes(this.formData.status)) {
                return false
            }
            if (['edit'].includes(item.buttonCode) && !['0', '1'].includes(this.status)) {
                return false
            }
            if (['submit', 'update'].includes(item.buttonCode) && this.queryName == 'toBeDeal') {
                return false
            }
            if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
                return true
            } else {
                return false
            }
        },
        init() {
            let { type, name, id, auditArr, inSource = '', ids = '' } = this.isDialog ? this.dialogQuery : this.$route.query;
            this.queryType = type || 'create';
            this.queryId = id || '';
            this.queryName = name || 'inventoryMaintenance';
            const idArr = !!ids ? ids.split(',') : []
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            if (this.queryType === 'update') {
                this.screenHeight = this.getViewportSize().height - 310;
            }

            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm();
                await this.formFillInPage();
                if (!!inSource) {
                    this.$refs['vFormRef'].setFieldValue('inSource', inSource)
                    this.$refs.vFormRef.disableWidgets(['inSource', 'sourceCode']);
                    this.$refs.vFormRef.getWidgetRef('sourceCode').setAppendButtonVisible(false);
                    if ((inSource == '1' || inSource == '2' || inSource == '3' || inSource == '4' || inSource == '7') && this.queryName === 'qualityTesting') {
                        this.qiInQuoteList(idArr);
                    } else if (inSource == '5') {
                        this.loadProductionReport(idArr);
                    } else if (inSource == '6') {
                        this.loadProductionOrder(idArr);
                    } else if (inSource == '7') {
                        this.loadRejectedOrder(idArr);
                    }
                }
                if (this.queryType === 'update') {
                    this.$refs['vFormRef'].hideWidgets('basicInfo')
                }
                await this.getDeptTreeData()
                await this.getUnitTree()
                if (this.queryType === 'update') {
                    this.$refs['vFormRef'].setReadMode(false);
                    this.getInDetail()
                } else if (this.queryType === 'view') {
                    this.$refs['vFormRef'].setReadMode(true);
                    this.getMainDetail()
                } else {
                    this.$refs['vFormRef'].setReadMode(false);
                    this.$refs['vFormRef'].setFieldValue('inDeptId', this.userInfo.deptId)
                    this.setUsersByDeptId(this.userInfo.deptId, this.userInfo.deptName, this.userInfo.nickName, false)
                    this.$refs['vFormRef'].setFieldValue('inUserId', this.userInfo.id)
                }
            })
        },
        
      handleFormChange(fieldName, newValue, oldValue, formModel) {
        if(fieldName === 'inSource') {
            this.inSourceCode = newValue
        }
      },
       async selectTreeselect(scope, data, idx = undefined) {
            if(!isNaN(idx)) {
                const row = this.validateTable.detailData[idx]
                scope.row.unitName = row.unitName
            }else{
                scope.row.unitName = data && data.deptName
            }
            scope.row.dataOptions = []
            scope.row.unquDataOptions = []
            scope.row.quWarehouseId = ''
            scope.row.unquWarehouseId = ''
            const res1 = await this.getWarehouseTree('1',data.id, true)
            const res2 = await this.getWarehouseTree('2',data.id, true)
            this.$set(this.validateTable.detailData, scope.$index, { ...this.validateTable.detailData[scope.$index], dataOptions: res1})
            this.$set(this.validateTable.detailData, scope.$index, { ...this.validateTable.detailData[scope.$index], unquDataOptions: res2})
     },
        async getUnitTree() {
            const res = await getUnitTree({ status: 0 })
            this.unitTreeData = res.data || []
        },
        async loadRejectedOrder(ids) {
            const { data: { list } } = await rejectedRawIn({ ids })
            if (!!list.length) {
                const codes = uniqueArrByField(list, 'sourceCode')
                const idArr = uniqueArrByField(list, 'sourceId')
                this.$refs['vFormRef'].setFieldValue('sourceCode', codes.join(','))
                this.$refs['vFormRef'].setFieldValue('sourceId', idArr.join(','))
                this.$nextTick(async () => {
                    await this.getWarehouseTree('1',list[0].unitId)
                    await this.getWarehouseTree('2',list[0].unitId)
                    this.validateTable.detailData = this.dataAmount(list)
                })
            }
        },
        async loadProductionOrder(ids) {
            const { data } = await pushInList({ ids: ids })
            if (!!data.length) {
                const codes = uniqueArrByField(data, 'sourceCode')
                const idArr = uniqueArrByField(data, 'sourceId')
                this.$refs['vFormRef'].setFieldValue('sourceCode', codes.join(','))
                this.$refs['vFormRef'].setFieldValue('sourceId', idArr.join(','))
                this.$nextTick(async () => {
                    await this.getWarehouseTree('1',data[0].unitId)
                    await this.getWarehouseTree('2',data[0].unitId)
                    this.validateTable.detailData = this.dataAmount(data)
                })
            }
        },
        async loadProductionReport(ids) {
            const { data: { list } } = await reportIn({ ids })
            if (!!list.length) {
                const codes = uniqueArrByField(list, 'sourceCode')
                const idArr = uniqueArrByField(list, 'sourceId')
                this.$refs['vFormRef'].setFieldValue('sourceCode', codes.join(','))
                this.$refs['vFormRef'].setFieldValue('sourceId', idArr.join(','))
                this.$nextTick(async () => {
                    await this.getWarehouseTree('1',list[0].unitId)
                    await this.getWarehouseTree('2',list[0].unitId)
                    this.validateTable.detailData = this.dataAmount(list)
                    this.productPrice(this.validateTable.detailData)
                })
            }
        },
        async qiInQuoteList(ids) {
            const { data } = await qiInQuoteList({ ids })
            if (!!data.length) {
                const codes = uniqueArrByField(data, 'sourceCode')
                const idArr = uniqueArrByField(data, 'sourceId')
                this.$refs['vFormRef'].setFieldValue('sourceCode', codes.join(','))
                this.$refs['vFormRef'].setFieldValue('sourceId', idArr.join(','))
                this.$nextTick(async () => {
                    await this.getWarehouseTree('1',data[0].unitId)
                    await this.getWarehouseTree('2',data[0].unitId)
                    this.validateTable.detailData = this.dataAmount(data)
                })
            }
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('inventoryMaintenance').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        selections(rowList = []) {
            if(this.inSourceCode == '3') {
                for(let i=0; i< rowList.length; i++) {
                    rowList[i]['qualifiedInNum'] = rowList[i]['originalNum'] - rowList[i]['quAlreadyInNum']
                    rowList[i]['unqualifiedInNum'] = 0
                }
            }
            const data = this.dataAmount(rowList)
            this.$nextTick(() => {
                this.validateTable.detailData = this.validateTable.detailData.concat(data);
                const codes = uniqueArrByField(this.validateTable.detailData, 'sourceCode')
                this.$refs['vFormRef'].setFieldValue('sourceCode', codes.join(','))
                const idArr = uniqueArrByField(this.validateTable.detailData, 'sourceId')
                this.$refs['vFormRef'].setFieldValue('sourceId', idArr.join(','))
                if (this.inSourceId == '5') {
                    this.productPrice(this.validateTable.detailData)
                }
            })
            this.getWarehouseTree('1',rowList[0].unitId)
            this.getWarehouseTree('2',rowList[0].unitId)
        },
        dataAmount(rowList) {
            const data = rowList.map(item => {
                return { ...item, qualifiedInAmount: item.price * item.qualifiedInNum, unqualifiedInAmount: item.price * item.unqualifiedInNum,
                  quWarehouseMode: item.warehouseMode || item.quWarehouseMode,
                  unquWarehouseMode: item.warehouseMode || item.unquWarehouseMode
                }
            })
            return data
        },
        getInDetail() {
            this.loading = true;
            getInDetail({ ids: [...this.queryId.split(',')] }).then(async({ data }) => {
                // if(data[0].inSource == '99'){
                // }else{
                //   await this.getWarehouseTree('1',data[0].unitId);
                //   await this.getWarehouseTree('2',data[0].unitId);
                // }
                const arr = await this.inDetailMap(data)
                this.validateTable.detailData = arr
            }).finally(() => {
                this.loading = false;
            });
        },
        inDetailMap (data) {
          return new Promise(async (resolve, reject) => {
            for (const i in data) {
              const dataOptions = await this.getWarehouseTree('1', data[i].unitId, true)
              const unquDataOptions = await this.getWarehouseTree('2', data[i].unitId, true)
              data[i].qualifiedInNumA = data[i].qualifiedInNum
              data[i].unqualifiedInNumA = data[i].qualifiedInNum
              data[i].dataOptions = dataOptions
              data[i].unquDataOptions = unquDataOptions
            }
            resolve(data)
          })
        },
        getMainDetail() {
            this.loading = true;
            getMainDetail(this.queryId).then(({ data }) => {
                this.validateTable.detailData = data.detailList
                this.status = data.status
                this.inSourceId = data.inSource
                this.setUsersByDeptId(data.inDeptId, data.inDeptName, data.inUserName, false)
                this.$refs['vFormRef'].setFormData(data)
            }).finally(() => {
                this.loading = false;
            });
        },
        async getDeptTreeData() {
            const res = await deptTree({ bizStatus: '1' });
            this.$refs['vFormRef'].getWidgetRef('inDeptId').loadOptions(res.data || [])
        },
        getWarehouseTree(warehouseType,unitId, type) {
            return new Promise((resolve, reject) => {
                this.loading = true;

                let params = {
                    ofOrgan: unitId,
                    warehouseType: warehouseType,
                }
                getWarehouseTree(params).then(({ data }) => {
                  if(type){
                    resolve(data || [])
                  }else{
                    if (warehouseType === '1') {
                        this.dataOptions = data || [];
                    } else {
                        this.unquDataOptions = data || [];
                    }
                  }
                }).finally(() => {
                    this.loading = false;
                    resolve()
                })
            })
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
            if (name === 'sourceCode') {
                if (!this.inSourceId) {
                    this.$message.warning('请先选择入库来源！');
                    return
                }
                this.$refs.selectQuote.open([...this.validateTable.detailData], this.inSourceId);
            }
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
        },
        cleanUp(name) {
            let getContainerWidgets = this.$refs['vFormRef'].getContainerWidgets();
            getContainerWidgets.forEach((item) => {
                if (name.includes(item.name)) {
                    item.container.widgetList[0].cols.forEach((val) => {
                        this.$refs['vFormRef'].setFieldValue(val.widgetList[0].options.name, '');
                    })
                }
            })
        },
        validateForm() {
            let flag = true
            this.$refs['elForm'].validate(valid => {
                if (!valid) {
                    flag = false
                }
            })
            return flag
        },
        saveDetailInfo(formData) {
            if (!this.validateForm()) {
                return
            }
            this.loading = true;
            detailSave(this.validateTable.detailData).then(({ success, message }) => {
                if (success) {
                    this.$message.success('保存成功');
                    setTimeout(() => {
                        this.cancel(this.queryName)
                    }, 100)
                } else {
                    this.$modal.msgError(message);
                }
            }).finally(() => {
                this.loading = false;
            });
        },
        saveOrderInfo(formData) {
            if (!this.validateForm()) {
                return
            }
            this.loading = true;
            inMaintenanceSave({ ...formData, ...this.formData, id: this.queryId, detailList: this.validateTable.detailData }).then(({ success, message }) => {
                if (success) {
                    this.$modal.msgSuccess(message);
                    setTimeout(() => {
                        this.cancel(this.queryName)
                    }, 100)
                } else {
                    this.$modal.msgError(message);
                }
            }).finally(() => {
                this.loading = false;
            });
        },
        newButton(buttonCode) {
            if (buttonCode === 'cancel') {
                this.cancel(this.queryName)
            } else if (buttonCode === 'save') {
                this.$refs.vFormRef.getFormData().then(formData => {
                    // 校验明细必填项
                    if (this.validateTable.detailData.length === 0) {
                        this.$modal.msgError('请选择明细数据');
                        return
                    }
                    if (!this.validateForm()) {
                        return
                    }
                    for (let i = 0; i < this.validateTable.detailData.length; i++) {
                        let item = this.validateTable.detailData[i]
                        // 1, 合格数量和不合格数量都为0时，不能保存
                        if (Number(item.unqualifiedInNum) === 0 && Number(item.qualifiedInNum) === 0) {
                            this.$modal.msgError('合格数量和不良品数量不能同时为0');
                            return
                        }
                        if (!item.qualifiedInNum && item.qualifiedInNum != 0) {
                            this.$modal.msgError('本次合格品待入库数量不能为空');
                            return
                        }
                        // 2, 合格或者不合格品为0时，仓库可以不选
                        if ((item.qualifiedInNum && Number(item.qualifiedInNum) != 0) && !item.quWarehouseId) {
                            this.$modal.msgError('请填写合格品入库仓库');
                            return
                        }
                        if ((item.unqualifiedInNum && Number(item.unqualifiedInNum) != 0) && !item.unquWarehouseId) {
                            this.$modal.msgError('请填写不良品入库仓库');
                            return
                        }

                    }
                    if (this.inSourceId == '5') {
                        this.$modal.confirm('<p style="color: red">因生产入库需要根据“消耗的材料成本”计算“产品的入库单价”，如果本次入库是“该生产单最后一笔入库”，有余料的请一定先维护退料单并完成入库，这样才能扣减掉退料成本；请务必确认清楚！</p>', '提示', {
                            confirmButtonText: '已确认，继续操作',
                            cancelButtonText: '先不继续，去确认',
                            confirmButtonClass: 'confirmButton',
                            cancelButtonClass: 'cancelButton',
                            dangerouslyUseHTMLString: true,
                            type: 'warning'
                        }).then(() => {
                            if (['product', 'create', 'receive'].includes(this.queryType)) {
                                this.saveOrderInfo(formData)
                            } else {
                                this.saveDetailInfo(formData)
                            }
                        })
                    } else {
                        if (['product', 'create', 'receive'].includes(this.queryType)) {
                            this.saveOrderInfo(formData)
                        } else {
                            this.saveDetailInfo(formData)
                        }
                    }
                }).catch(() => {
                    this.$modal.msgError('表单数据验证失败');
                })
                return
            } else if (buttonCode === 'update') {
                this.queryType = 'update';
                this.$refs['vFormRef'].setReadMode(false);
            }
            if (buttonCode === 'pass') {
                this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName);
                return
            }
            if (buttonCode === 'reject') {
                this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName);
                return
            }
        },
        cancel(name) {
            // 关闭当前tabs
            this.$tab.closeOpenPage({ name });
        },
        operationButtonClick(dataTable, buttonName, rowIndex, row) {
        },
        // 部门树选择
        async treeSelectSelect(vm, node) {
            let {
                field: {
                    options: { name },
                },
            } = vm || {};
            if (name === "inDeptId") {
                if (node.id) {
                    this.setUsersByDeptId(node.id, node.deptName, '', true)
                }
            }
        },
        async setUsersByDeptId(deptId, deptName, nickName, isClearUser) {
            const managerData = await userListAll({ deptId: deptId })
            this.formData.inDeptName = deptName
            this.formData.inUserName = nickName
            // 负责人清空
            if (isClearUser) {
                this.$refs['vFormRef'].setFieldValue('inUserId', '')
            }
            this.$refs['vFormRef'].enableWidgets('inUserId')
            this.$refs['vFormRef'].getWidgetRef('inUserId').loadOptions(managerData.data.list || [])
            this.managerData = managerData.data.list || []
        },
        treeSelectInput(name, newVal) {
            if (!newVal) {
                this.$refs['vFormRef'].setFieldValue("saleId", "")
                this.$refs['vFormRef'].disableWidgets('saleId')
            }
        },
        selectChange(name, node) {
            if (name === 'inUserId') {
                if (node !== '') {
                    this.formData.inUserName = this.managerData.find(item => item.id === node).username || ''
                }
            }
            if (name === 'inSource') {
                this.inSourceId = node
                if (this.inSourceId == '99') {
                    this.$refs['vFormRef'].hideWidgets('sourceCode')
                    this.$refs['vFormRef'].disableWidgets('sourceCode')
                    this.$nextTick(() => {
                        this.$refs.elTable.doLayout()
                    })
                } else {
                    this.$refs['vFormRef'].showWidgets('sourceCode')
                    this.$refs['vFormRef'].enableWidgets('sourceCode')
                }
                this.$refs['vFormRef'].setFieldValue('sourceCode', '')
                this.$refs['vFormRef'].setFieldValue('sourceId', '')
                this.validateTable.detailData = []
            }
        },
        numChange(code, scope) {
            const price = scope.row.price
            if (code === 'qualifiedInNum') {
                scope.row.qualifiedInAmount = price * scope.row.qualifiedInNum
            } else {
                scope.row.unqualifiedInAmount = price * scope.row.unqualifiedInNum
            }
            if (code === 'price') {
                scope.row.qualifiedInAmount = price * scope.row.qualifiedInNum
                scope.row.unqualifiedInAmount = price * scope.row.unqualifiedInNum
            }
            if (this.inSourceId == '5') {
                this.productPrice([scope.row])
            }
        },
        productPrice(data) {
            const dataArr = data.map(({ qualifiedInNum, unqualifiedInNum, sourceDetailId }) => {
                return { qualifiedInNum, unqualifiedInNum, sourceDetailId }
            })
            productPrice(dataArr).then(({ data }) => {
                this.validateTable.detailData.forEach((item) => {
                    data.forEach((val) => {
                        if (item.sourceDetailId === val.sourceDetailId) {
                            item.price = val.price
                            item.unqualifiedInAmount = val.unqualifiedInAmount
                            item.qualifiedInAmount = val.qualifiedInAmount
                        }
                    })
                })
            })
        }
    }
};
</script>
<style lang="scss" scoped>
.confirmButton {
    background: #FFFFFF;
}

.cancelButton {
    background: #46a6ff;
}

.slotIcon-color {
    color: #1890ff;
}

.slotIcon-color-content {
    color: red;
}

.order-details {
    margin-top: 10px;
}

.un-quilt-btn {
    min-width: 100px;
    height: 32px;
    border: #1890ff solid 1px;
    border-radius: 50px;
    padding: 0;
}

.button-with-tooltip {
    margin-left: 10px;
    display: flex;
    align-items: center;
}

.button-with-tooltip i {
    margin-left: 5px;
}

.confirm {
    height: 34px;
    border-radius: 50px;
    background: #227aff;
    color: #ffffff;
    min-width: 100px
}

.icon-color {
    color: #227aff;
}

.cancel {
    height: 34px;
    border-radius: 50px;
    min-width: 100px;
    margin-left: 10px;
}
</style>
