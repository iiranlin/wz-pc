<template>
    <div class="container_flex-basic" v-loading="loading">
        <div class="floor-nav">
            <ul class="nav-list">
                <li class="nav-list-item" :class="navItemIndex == index ? 'nav-list-item-color' : ''"
                    v-for="(item, index) in floorList" :key="item.id" @click="setFloorNavMountClick(index)"><i
                        class="el-icon-caret-right nav-list-item-icon" v-show="navItemIndex == index"></i>{{ item.name
                    }}</li>
            </ul>
        </div>
        <div :class="'container_flex_form_div' + J">
            <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv"
                :class="{ 'formRender_view': queryType === 'view' }" @selectChange="selectChange"
                @treeSelectSelect="treeSelectSelect" @treeSelectInput="treeSelectInput"
                @appendButtonClick="handleAppendButtonClick" @buttonClick="handleButtonClick"
                @formChange="handleFormChange" @operationButtonClick="operationButtonClick">
                <template slot="fileList">
                    <div style="display: flex;flex-direction: column;">
                        <attachmentTable ref="attachmentTable" businessType="03" :queryType="queryType"
                            v-model="fileList"></attachmentTable>
                    </div>
                </template>
                <template slot="directProductTips" v-if="typeUrl === 'materialArchivesOperateBusiness'">
                    <el-tooltip class="slotIcon-color-no" :class="{ 'slotIcon-color-yes-no': queryType == 'view' }"
                        placement="top" effect="light" v-if="directProduct == '0' || queryType != 'view'">
                        <div slot="content" class="slotIcon-color-content">
                            需求计划基于成品做全阶展开，产生成品/半成品的计划单，新增工单时，下推或拉取成品/半成品的计划单作为工单来源
                        </div>
                        <i class="el-icon-question"></i>
                    </el-tooltip>
                    <el-tooltip class="slotIcon-color-yes" :class="{ 'slotIcon-color-yes-no': queryType == 'view' }"
                        placement="top" effect="light" v-if="directProduct == '1' || queryType != 'view'">
                        <div slot="content" class="slotIcon-color-content">
                            物料需求计划只产生成品的计划单，新增工单时，只下推或拉取成品的计划单，由生产做半成品和原材料的全阶展开
                        </div>
                        <i class="el-icon-question"></i>
                    </el-tooltip>
                </template>
            </VFormRender>
        </div>
        <customUser ref="customUser" :singleMode="true" @customUserClick="customUserClick"></customUser>
        <choice-supplier ref="supplierRef" @selections="selectionsSupplier"></choice-supplier>
    </div>
</template>

<script>
import attachmentTable from '@/views/components/attachmentTable'
import { matlDetail } from '@/api/prodmgr-mm/matlMatl';
import { classTree } from '@/api/prodmgr-mm/matlClass';
import { formFillInPage } from '@/api/form/form'
import { deptTree } from '@/api/system/dept'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import customUser from '@/views/components/custom-user'
import { PuSuList } from '@/api/purchasingManagement/supplier'
import { getWarehouseTree } from '@/api/warehouseManage/warehouse';
import { generateUUID } from '@/utils'
import VFormRender from '@/components/form-render/index'
import ChoiceSupplier from '@/views/components/choice-supplier/index.vue'
export default {
    name: "publicOperate",
    components: { customUser, attachmentTable, VFormRender, ChoiceSupplier },
    props: {
        isDialog: {
            type: Boolean,
            default: false
        },
        dialogQuery: {
            type: Object,
            default: () => {
                return {}
            }
        },
        floorList: {
            type: Array,
            default: () => []
        },
        typeUrl: {
            type: String,
            default: () => ""
        },
        J: {
            type: String,
            default: () => "0"
        }
    },
    data() {
        return {
            loading: false,
            queryId: '',
            queryType: '',
            formJson: {},
            formData: {},
            globalDsv: {
                VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
                VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
                Authorization: getToken(),
                businessType: '07',
            },
            navItemIndex: 0,
            listBoxState: true,
            bizStatus: '0',
            directProduct: '1',
            buttonClickName: '',
            puSuData: [],
            matlCode: '',
            fileList: [],
        }
    },
    computed: {
        ...mapGetters(['infoData']),
    },
    created() {
        this.init();
    },
    mounted() {
        window.addEventListener("scroll", this.throttleFun, true)
    },
    methods: {
        throttleFun() {
            // 页面滚动停止100毫秒后才会执行下面的函数。
            let timeId;
            clearTimeout(timeId);
            timeId = setTimeout(() => {
                this.scrollToTop();
            }, 100);
        },
        init(types) {
            let { type, name, id, matlCode, matlClassifyId = '', matlClassifyName = '' } = this.isDialog ? this.dialogQuery : this.$route.query;
            this.queryType = types || type || 'create';
            this.queryId = id || '';
            this.matlCode = matlCode || '';
            this.$nextTick(async () => {
                await this.formFillInPage(this.typeUrl);
                this.$refs['vFormRef'].resetForm();
                if (this.queryType == 'view') {
                    this.$refs['vFormRef'].setReadMode(true);
                } else if (types == 'update') {
                    this.$refs['vFormRef'].setReadMode(false);
                }
                if (this.typeUrl === 'materialArchivesOperateBasic') {
                    const res = await classTree({ bizStatus: '0' });
                    this.$refs['vFormRef'].getWidgetRef('matlClassifyId').loadOptions(res.data || [])
                } else {
                    this.getWarehouseTree();
                    // this.PuSuList();
                    const res = await deptTree();
                    this.$refs['vFormRef'].getWidgetRef('defaultProductDeptCode').loadOptions(res.data || [])
                }
                if (this.queryType != 'create') {
                    this.matlDetail();
                } else {
                    if (matlClassifyId) {
                        this.$refs['vFormRef'].setFieldValue("matlClassifyId", matlClassifyId)
                        this.$refs['vFormRef'].setFieldValue("matlClassifyName", matlClassifyName)
                    }
                }
            })
        },
        handleFormChange(fieldName, newValue, oldValue, formModel) {
            if (fieldName === 'isQi') {
                if (newValue == '0') {
                    this.$refs.vFormRef.hideWidgets(['unqLimit']);
                } else {
                    this.$refs.vFormRef.showWidgets(['unqLimit']);
                }
            }
        },
        formFillInPage(type) {
            return new Promise((resolve) => {
                formFillInPage(type).then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        getWarehouseTree() {
            getWarehouseTree().then(({ data }) => {
                this.$refs['vFormRef'].getWidgetRef('defaultStorageCode').loadOptions(data || []);
            })
        },
        PuSuList() {
            this.loading = true
            PuSuList().then(({ data }) => {
                this.puSuData = data.list
                this.$refs['vFormRef'].getWidgetRef('defaultPurId').loadOptions(data.list || [])
            }).finally(() => {
                this.loading = false
            })
        },
        matlDetail() {
            matlDetail(this.matlCode).then(({ data }) => {
                if (data) {
                    this.bizStatus = data.bizStatus;
                    data.bizStatus = data.bizStatus == 0 ? true : false;
                    let formData = null;
                    if (this.typeUrl === 'materialArchivesOperateBasic') {
                        formData = data;

                    } else {
                        this.directProduct = data.bizParam?.directProduct || '1';
                        formData = Object.assign({}, data.bizParam, { defaultStorageCode: data.bizParam.defaultStorageCode || undefined });
                    }
                    this.fileList = !!data.fileList && !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
                    this.$refs["vFormRef"].setFormData(formData);
                    if (formData.isQi == '0') {
                        this.$refs.vFormRef.hideWidgets(['unqLimit']);
                    } else {
                        this.$refs.vFormRef.showWidgets(['unqLimit']);
                    }
                }
            }).finally(() => {
                this.loading = false;
            });
        },
        customUserClick(data) {
            if (this.buttonClickName === 'defaultPurManName') {
                this.$refs.vFormRef.setFieldValue("defaultPurManName", data.nickName);
                this.$refs.vFormRef.setFieldValue("defaultPurManId", data.id);
            } else if (this.buttonClickName === 'defaultSellerName') {
                this.$refs.vFormRef.setFieldValue("defaultSellerName", data.nickName);
                this.$refs.vFormRef.setFieldValue("defaultSellerId", data.id);
            }
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
            this.buttonClickName = name;
            if (name === 'defaultPurManName') {
                const defaultPurManId = this.$refs.vFormRef.getFieldValue("defaultPurManId");
                this.$refs.customUser.init(defaultPurManId);
            }
            if (name === 'defaultSellerName') {
                const defaultSellerId = this.$refs.vFormRef.getFieldValue("defaultSellerId");
                this.$refs.customUser.init(defaultSellerId);
            }
            if (name === "defaultPurName") {
                this.$refs.supplierRef.open()
                return
            }
        },
        selectionsSupplier(row) {
            this.$refs.vFormRef.setFieldValue("defaultPurId", row.suId);
            this.$refs.vFormRef.setFieldValue("defaultPurName", row.suName);
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
        },
        treeSelectInput(vm, node) {
            let {
                field: {
                    options: { name },
                },
            } = vm || {};
            if (!node) {
                if (name === "matlClassifyId") {
                    this.$refs.vFormRef.setFieldValue("matlClassifyName", "");
                    return
                }
                if (name === "defaultProductDeptCode") {
                    this.$refs.vFormRef.setFieldValue("defaultProductDeptName", "");
                    return
                }
                if (name === "defaultStorageCode") {
                    this.$refs.vFormRef.setFieldValue("defaultStorageName", "");
                    return
                }
            }
        },
        selectChange(name, node) {
            if (name === "bizStatus") {
                this.bizStatus = node ? '0' : '1';
                return
            }
        },
        // 部门树选择
        treeSelectSelect(vm, node) {
            let {
                field: {
                    options: { name },
                },
            } = vm || {};
            if (name === "matlClassifyId") {
                this.$refs.vFormRef.setFieldValue("matlClassifyName", node.matlClassifyName);
                return
            }
            if (name === "defaultProductDeptCode") {
                this.$refs.vFormRef.setFieldValue("defaultProductDeptName", node.deptName);
                return
            }
            if (name === "defaultStorageCode") {
                this.$refs.vFormRef.setFieldValue("defaultStorageName", node.name);
                this.$refs.vFormRef.setFieldValue("defaultStorageId", node.id);
                return
            }

        },
        operationButtonClick(dataTable, buttonName, rowIndex, row) {
            if (buttonName == 'delete') {
                this.$modal.confirm('是否确认删除?').then(() => {
                    let detailedList = JSON.parse(JSON.stringify(this.$refs['vFormRef'].getWidgetRef('detailedList').getTableData()));
                    detailedList.splice(rowIndex, 1);
                    let tableRef = this.$refs['vFormRef'].getWidgetRef('detailedList');
                    tableRef?.setTableData(detailedList);
                })
            }
        },
        setFloorNavMountClick(index) {
            this.navItemIndex = index;
            this.$el.querySelector(`.scrollId${this.J}${index}`).scrollIntoView({
                behavior: "smooth", // 平滑过渡
                block: "start", // 上边框与视窗顶部平齐。默认值
            });

            this.listBoxState = false;
            let timeId;
            clearTimeout(timeId);
            timeId = setTimeout(() => {
                this.listBoxState = true;
            }, 200);
        },
        scrollToTop() {
            const J = this.J;
            // dom滚动位置
            const div = document.querySelector(`.container_flex_form_div${J}`);
            if (!div) {
                return
            }
            const scrollTop = div.scrollTop;
            if (this.listBoxState) {
                //作用是点击导航栏时，延迟这里执行。
                this.floorList.map((v, i) => {
                    // 获取监听元素距离视窗顶部距离
                    const offsetTop = document.querySelector(`.scrollId${J}${i}`).offsetTop - 18;
                    // 获取监听元素本身高度
                    const scrollHeight = document.querySelector(`.scrollId${J}${i}`).scrollHeight;

                    // 如果 dom滚动位置 >= 元素距离视窗距离 && dom滚动位置 <= 元素距离视窗距离+元素本身高度
                    // 则表示页面已经滚动到可视区了。
                    if (scrollTop >= offsetTop && scrollTop <= offsetTop + scrollHeight) {
                        // 导航栏背景色选中
                        this.navItemIndex = i;
                    }
                });
            }
        }
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.throttleFun);
    }
};
</script>
<style lang="scss" scoped>
.container_flex-basic {
    display: flex;
    width: 100%;

    .floor-nav {
        width: 185px;
        overflow: auto;
        margin-right: 20px;
        border-right: 1px solid #DCDFE6;

        .nav-list {
            list-style-type: none;
            margin: 0 15px 0 0;
            padding: 0;

            .nav-list-item {
                position: relative;
                height: 40px;
                line-height: 40px;
                text-align: center;
                font-size: 16px;
                cursor: pointer;

                .nav-list-item-icon {
                    position: absolute;
                    left: 30px;
                    top: 11px;
                    color: #1890ff;
                    font-size: 16px;
                }
            }

            .nav-list-item-color {
                color: #1890ff;
            }
        }
    }

    .container_flex_form_div0,
    .container_flex_form_div1 {
        flex: 1;
        overflow: auto;
    }
}

.slotIcon-color-no {
    position: absolute;
    left: 162px;
    top: -25px;
    color: #1890ff;
    z-index: 10;
    font-size: 14px;
}

.slotIcon-color-yes {
    position: absolute;
    left: 229px;
    top: -25px;
    color: #1890ff;
    z-index: 10;
    font-size: 14px;
}

.slotIcon-color-yes-no {
    left: 147px;
    top: -26px;
}

::v-deep .directProductTips {
    display: inline !important;
}
</style>
