<template>
    <div class="app-container container_flex">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
            @newButton="newButton"></button-top>
        <div class="container_flex_form">
            <el-tabs @tab-click="handleTabchange" v-model="activeName"
                class="container_flex_form_tabs tab-pane-required-class">
                <el-tab-pane :label="item.label" v-for="(item, index) in tabList" :key="item.typeUrl"
                    :name="item.typeUrl">
                    <!-- <span slot="label"><span
                            :class="(activeName === 'materialArchivesOperateBasic' && index == 0) || (activeName === 'materialArchivesOperateBusiness' && index == 1) ? 'pane_iA' : 'pane_iB'">{{
                                index + 1 }}</span> {{ item.label }}</span> -->
                    <publicOperate :isDialog="isDialog" :dialogQuery="dialogQuery" :ref="item.typeUrl"
                        :queryType="queryType" :floorList="floorObj[index]" :typeUrl="item.typeUrl" :J="index + ''" />
                </el-tab-pane>
                <el-tab-pane disabled key="required" name="required">
                    <div slot="label" class="required-class">
                        <el-switch v-model="checked" @change="checkoutStatus" active-text="隐藏非必填项">
                        </el-switch>
                    </div>

                </el-tab-pane>
            </el-tabs>

        </div>
    </div>
</template>

<script>
import publicOperate from './components/publicOperate'
import { matlCreateModify } from '@/api/prodmgr-mm/matlMatl';
import indexMixin from '@/views/mixins';
export default {
    mixins: [indexMixin],
    name: "materialArchivesOperate",
    components: { publicOperate },
    beforeRouteEnter(top, from, next) {
        // console.log(top, from, next)
        next()
    },
    data() {
        return {
            checked: false,
            loading: false,
            queryType: '',
            queryName: '',
            queryId: '',
            // 菜单按钮、字段等数据
            buttonTop: [
                { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
                { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
                { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
            ],
            queryAuditArr: null,
            navItemIndex: 0,
            tabList: [
                { label: '基本信息', typeUrl: 'materialArchivesOperateBasic' },
                { label: '业务信息', typeUrl: 'materialArchivesOperateBusiness' },
            ],
            floorObj: {
                0: [
                    { id: 1, name: '基本信息' },
                    { id: 2, name: '物料性质' },
                    { id: 3, name: '计量单位' },
                    { id: 4, name: '物料图册' },
                ],
                1: [
                    { id: 1, name: '采购信息' },
                    { id: 2, name: '质检信息' },
                    { id: 3, name: '销售信息' },
                    { id: 4, name: '库存信息' },
                    { id: 5, name: '生产信息' },
                ]
            },
            activeName: 'materialArchivesOperateBasic',
            isQuery: ''
        }
    },
    created() {
        this.init();
    },
    methods: {
        handleTabchange(tab) {
            this.checkoutStatus(this.checked)
        },
        checkoutStatus(flag) {
            const widgets = {
                materialArchivesOperateBasic: ['matlCode', 'matlType', 'outsourceCode', 'orderBy', 'bizStatus', 'notes', 'grid116285', 'gridCol14127', 'card114492', 'matlAttribute'],
                materialArchivesOperateBusiness: ['card29669', 'card80267', 'card88694', 'defaultProductDeptCode', 'card57229', 'grid41362', 'batchProduct', 'batchMultiple', 'lossRate', 'gridCol37615', 'issueType']
            }[this.activeName]
            const ref = this.activeName
            const refs = this.$refs[`${ref}`][0].$refs.vFormRef
            if (flag) {
                refs.hideWidgets(widgets)
            } else {
                refs.showWidgets(widgets)
            }
        },
        buttonShow(item) {
          if(item.buttonCode === 'edit' && this.isQuery == 'query'){
            return false
          }
            if (this.queryName != 'materialArchives' && item.buttonCode === 'update') {
                return false
            }
            if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
                return true
            } else {
                return false
            }
        },
        init() {
            let { type, name, id, auditArr, isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query;
            this.queryType = type || 'create';
            this.queryName = name || 'materialArchives';
            this.queryId = id || '';
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            this.isQuery = isQuery
        },
        cancel(name) {
            // 关闭当前tabs
            this.$tab.closeOpenPage({ name });
        },
        newButton(buttonCode) {
            if (buttonCode === 'edit') {
                this.queryType = 'update';
                this.$refs['materialArchivesOperateBasic'][0].init('update');
                this.$refs['materialArchivesOperateBusiness'][0].init('update');
                return
            }
            if (buttonCode === 'cancel') {
                this.cancel(this.queryName);
            } else if (buttonCode === 'save') {
                const refBasic = this.$refs['materialArchivesOperateBasic'][0];
                const basic = new Promise((resolve, reject) => {
                    return refBasic.$refs.vFormRef.getFormData().then(formData => {
                        resolve(formData)
                    }).catch((error) => {
                        reject('请完善基本信息')
                    })
                })

                const refBusiness = this.$refs['materialArchivesOperateBusiness'][0];
                const business = new Promise((resolve, reject) => {
                    return refBusiness.$refs.vFormRef.getFormData().then(formData => {
                        resolve(formData)
                    }).catch((error) => {
                        reject('请完善业务信息')
                    })
                })
                Promise.all([basic, business]).then((data) => {
                    if(data[1].safetyStock > data[1].maxStockNum){
                        this.$modal.msgWarning("安全库存数量不能大于最高库存数量")
                        return
                    }
                    let type = 'create';
                    if (this.queryType == 'update') {
                        type = 'modify'
                    }
                    const fileList = refBasic.$data.fileList || []
                    const formData = Object.assign({}, data[0], { bizParam: data[1] });
                    this.loading = true;
                    matlCreateModify({ ...formData, bizStatus: refBasic.$data.bizStatus, fileList: fileList }, type).then(({ code, message }) => {
                        if (code === 0) {
                            this.$modal.msgSuccess(message);
                            this.cancel(this.queryName);
                        } else {
                            this.$modal.msgError(message);
                        }
                    }).finally(() => {
                        this.loading = false;
                    });
                }).catch((error) => {
                    this.$modal.msgError(`${error || '表单数据校验失败'}`);
                })
            }
        },
    }
};
</script>
<style>
.tab-pane-required-class #tab-required {
    border: none !important;
    position: absolute;
    right: 0;
}

.tab-pane-required-class .el-tabs__nav {
    width: 100%;
}

.required-class {
    display: inline-block;
}
</style>
<style lang="scss" scoped>
.container_flex_form {
    .el-tabs {
        height: 100%;
        display: flex;
        flex-direction: column;

        ::v-deep .el-tabs__content {
            flex: 1;
        }

        ::v-deep .el-tab-pane {
            height: 100%;
            display: flex;
        }

        // ::v-deep .el-tabs__item.is-active {
        //    background: #1890ff;
        //    color: #fff;
        // }

        ::v-deep .el-tabs__item {
          // border: 1px solid #DCDFE6;
          width: 200px;
          font-size: 16px;
          text-align: center;
        }

        .pane_iA {
            display: inline-block;
            width: 25px;
            height: 25px;
            border-radius: 15px;
            text-align: center;
            line-height: 25px;
            background: #fff;
            color: #1890ff;
            margin-right: 10px;
        }

        .pane_iB {
            display: inline-block;
            width: 25px;
            height: 25px;
            border-radius: 15px;
            text-align: center;
            line-height: 25px;
            background: #1890ff;
            color: #fff;
            margin-right: 10px;
        }
    }
}
</style>
