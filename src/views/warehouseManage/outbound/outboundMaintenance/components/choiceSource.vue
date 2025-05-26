<template>
    <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="选择报价单" :visible.sync="visible"
        :close-on-click-modal="false" append-to-body width="1300px">
        <div slot="title" class="el-dialog__title">
            选择数据
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <el-tabs v-model="activeName" v-if="outSource == '9' || outSource == '4'" @tab-click="handleTabChange">
            <el-tab-pane label="按主单选择" name="main" :disabled="detailModeSelection.length > 0">
                <main-mode class="main-mode" 
                    v-if="visible"
                    ref="mainMode"
                    :singleMode="false" 
                    :outSource="outSource" 
                    :selectedRows="selectedRows"
                    @mainModeSelected="mainModeSelected"
                    @mainModeSelectionChange="mainModeSelectionChange"/>
            </el-tab-pane>
            <el-tab-pane label="按主单+明细选择" name="detail" :disabled="mainModeSelection.length > 0">
                <detail-mode class="detail-mode" 
                    v-if="visible"
                    ref="detailMode"
                    :singleMode="false" 
                    :outSource="outSource" 
                    :selectedRows="selectedRows"
                    @detailModeSelected="detailModeSelected"
                    @detailModeSelectionChange="detailModeSelectionChange"/>
            </el-tab-pane>
        </el-tabs>
        <div v-else style="flex: 1;">
            <detail-mode class="detail-mode" 
                v-if="visible"
                ref="detailMode"
                :singleMode="false" 
                :outSource="outSource" 
                :selectedRows="selectedRows"
                @detailModeSelected="detailModeSelected"
                @detailModeSelectionChange="detailModeSelectionChange"
                />
        </div >
        <template #footer>
            <el-button plain round type="primary" @click="saveSelection" v-preventReClick>确定</el-button>
            <el-button plain round @click.native="visible = false">取消</el-button>
        </template>
    </Dialog>
</template>
<script>
import DetailMode from './detailMode.vue'
import MainMode from './mainMode.vue'
import { pickingOutQuoteList } from '@/api/projectManagement/productionReview';
import { deliveryOutQuoteDtList } from '@/api/prodmgr-sa/delivery';

export default {
    components: {
        DetailMode,
        MainMode,
    },
    data() {
        return {
            activeName: 'main',
            visible: false,
            outSource:'',
            selectedRows:[],

            mainModeSelection:[],
            detailModeSelection:[],
        }
    },
    methods: {
        init(selectedRows = [], outSource = '') {
            this.activeName = 'main';
            this.visible = true;
            this.selectedRows = JSON.parse(JSON.stringify(selectedRows));
            this.outSource = outSource;
            this.mainModeSelection = [];
            this.detailModeSelection = [];

            this.$nextTick(() => {
                if(this.outSource == '9' || this.outSource == '4'){
                    this.$refs.mainMode.init();
                }else{
                    this.$refs.detailMode.init();
                }
            })
        },
        handleTabChange(tab, event){
            if(this.activeName == 'main'){
                this.$refs.mainMode.init();
            }else if(this.activeName == 'detail'){
                this.$refs.detailMode.init();
            }
        },
        searchData(){
            if(this.outSource == '9' || this.outSource == '4'){
                if(this.activeName == 'main'){
                    rows =  this.$refs.mainMode.handleQuery();
                }else if(this.activeName == 'detail'){
                    rows =  this.$refs.detailMode.handleQuery();
                }
            }else{
                rows =  this.$refs.detailMode.handleQuery();
            }
        },
        resetSearch(){
            if(this.outSource == '9' || this.outSource == '4'){
                if(this.activeName == 'main'){
                    rows =  this.$refs.mainMode.init();
                }else if(this.activeName == 'detail'){
                    rows =  this.$refs.detailMode.init();
                }
            }else{
                rows =  this.$refs.detailMode.init();
            }
        },
        mainModeSelectionChange(rows){
            this.mainModeSelection = rows;
        },
        detailModeSelectionChange(rows){
            this.detailModeSelection = rows;
        },
        mainModeSelected(rows){
            this.getDetailByMainId(rows);
        },
        detailModeSelected(rows){
            this.visible = false;
            this.$emit('choiceSource', rows);
        },
        saveSelection(){
            if(this.outSource == '9' || this.outSource == '4'){
                if(this.activeName == 'main'){
                    this.getDetailByMainId(this.mainModeSelection);
                }else if(this.activeName == 'detail'){
                    this.visible = false;
                    this.$emit('choiceSource', this.detailModeSelection);
                }
            }else{
                this.visible = false;
                this.$emit('choiceSource', this.detailModeSelection);
            }
        },
        getDetailByMainId(rows){
            let sourceIds = rows.map((item) => {
                return item.sourceId;
            })
            if(sourceIds.length == 0){
                this.visible = false;
                return
            }
            if(this.outSource == '9'){
                let params = {
                    sourceIds: sourceIds,
                    pageSize: -1,
                }
                pickingOutQuoteList(params).then(({data}) => {
                    this.visible = false;
                    this.$emit('choiceSource', data.list);
                }).finally(() => {
                    
                })
            }else if(this.outSource == '4'){
                let params = {
                    sourceIds: sourceIds,
                }
                deliveryOutQuoteDtList(params).then(({data}) => {
                    this.visible = false;
                    this.$emit('choiceSource', data);
                }).finally(() => {
                    
                })
            }
        },
    }
}
</script>
<style scoped lang="scss">
.main-mode {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.detail-mode {
    display: flex;
    flex-direction: column;
    height: 100%;
}
::v-deep .el-dialog__body {
    padding-top: 10px;
}
::v-deep .el-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;
}
::v-deep .el-tabs__content {
    flex: 1;
}
::v-deep .el-tab-pane {
    height: 100%;
}
::v-deep .el-tabs__nav-wrap::after {
    display: none;
}
</style>