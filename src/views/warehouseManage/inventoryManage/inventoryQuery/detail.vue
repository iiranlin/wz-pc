<template>
    <div class="app-container container_flex">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
        <div class="container_flex_form">
            <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv" :class="{'formRender_view': queryType === 'view'}">
              <template slot="design_p1">
                <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="供应商信息" />供应商信息</p>
              </template>
              <template slot="design_p2">
                <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="物料信息" />物料信息</p>
              </template>
              <template slot="design_p3">
                <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="货主信息" />组织信息</p>
              </template>
              <template slot="design_p4">
                <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="项目信息" />项目信息</p>
              </template>
              <template slot="design_p5">
                <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="有效期信息" />有效期信息</p>
              </template>
            </VFormRender>
        </div>
    </div>
  </template>
  
  <script>
  import { formFillInPage } from '@/api/form/form'
  import { mapGetters } from 'vuex'
  import { getToken } from '@/utils/auth'
  import { getBatchDetail } from '@/api/warehouseManage/inventoryManage'
  import indexMixin from '@/views/mixins';
  import VFormRender from '@/components/form-render/index'
  export default {
    name: "operate",
    mixins: [indexMixin],
    components: { VFormRender },
    dicts: ['inMaintenance'],
    data() {
        return {
            detailList: [],
            loading: false,
            queryType: '',
            queryId: '',
            queryName: '',
            formJson: {},
            formData: {},
            // 菜单按钮、字段等数据
            buttonTop: [
                { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
            ],
            queryAuditArr: null,
            globalDsv: {
                VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
                VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
                Authorization: getToken(),
                businessType: '01',
            }
        }
    },
    computed: {
        ...mapGetters(['infoData']),
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            let { type, name, id, auditArr, operateType } = this.isDialog ? this.dialogQuery : this.$route.query;
            this.queryType = type || 'create';
            this.operateType = operateType || 'out',
            this.queryId = id || '';
            this.queryName = name || 'inventoryQuery';
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm();
                await this.formFillInPage(() => {
                    this.getBatchDetail()
                });
                this.$refs['vFormRef'].setReadMode(true);
            })
            
        },
        formFillInPage(callback) {
            return new Promise((resolve) => {
                formFillInPage('batchNoDetail').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    callback && callback();
                    resolve(true);
                })
            })
        },
        newButton(buttonCode){
            if (buttonCode === 'cancel') {
                this.$tab.closeOpenPage({ name: this.queryName })
            }
        },
        buttonShow(item) {
            if (['submit', 'update'].includes(item.buttonCode) && !['0', '1'].includes(this.formData.status)) {
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
        reviewMethodFilter(val, code) {
            for (let key of code) {
                if (key.value == val) {
                    return key.label
                }
            }
        },
        getBatchDetail() {
            this.loading = true;
            getBatchDetail(this.queryId).then(({ data }) => {
                let showData = { ...data }
                this.dict.type.inMaintenance.map(item => {
                    if(showData.inSource === item.value) {
                        showData.inSource = item.label
                    }
                })
                setTimeout(() =>{
                    this.$refs['vFormRef'].setFormData(Object.assign(showData));
                }, 100)
            }).finally(() => {
                this.loading = false;
            });
        }
    }
  };
  </script>
  <style lang="scss" scoped>
  </style>
  