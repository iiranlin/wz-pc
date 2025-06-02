<template>
    <div class="app-container">
        <div class="query-container">
            <el-form :model="formData" :rules="rules" ref="elform" label-width="120px" :inline="true">
                <el-form-item label="快递单号：" prop="mailNo">
                    <el-input v-model="formData.mailNo" placeholder="请输入快递单号" size="small" @change="handleInputChange"></el-input>
                </el-form-item>
                <el-form-item label="快递公司：" prop="cpCode">
                    <el-select v-model="formData.cpCode" filterable  placeholder="请选择快递公司" size="small">
                        <el-option
                            v-for="item in expressCompanyOptions"
                            :key="item.id"
                            :label="item.companyName"
                            :value="item.companyCode"
                            @click.native="handleCompanyChange(item)">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="寄件人电话：" prop="phone" v-if="formData.cpCode === 'SF'" >
                    <el-input v-model="formData.phone" placeholder="请输入寄件人电话" size="small"></el-input>
                </el-form-item>
                <el-button type="primary" size="small" @click="handleQueryClick()">查询</el-button>
            </el-form>
        </div>

        <div class="arcgis-container">
            <!-- <iframe ref="expressContainer" :src='arcgisMap'></iframe> -->
            <el-amap
                ref="map"
                class="map"
                :vid="'amap'"
                :zoom="10"
                :center="center">
                <el-amap-marker
                    :position="sendCenter"
                    icon="/map/images/send_point.png"
                    v-if="sendCenter.length > 0">
                </el-amap-marker>
                <el-amap-marker
                    :label="endLabel"
                    :position="endCenter"
                    icon="/map/images/express_car.png"
                    v-if="endCenter.length > 0">
                </el-amap-marker>
                <el-amap-polyline
                    lineJoin='round'
                    strokeWeight="6"
                    strokeColor="#13B347"
                    :path="routePath">
                </el-amap-polyline>
            </el-amap>
            <div class="timeline-container" v-if="routeDtos.length > 0">
                <div class="express-title">
                    <span>{{formData.cpName}} {{expressData.mailNo}}</span>
                </div>
                <el-timeline>
                    <el-timeline-item color="#4587ff" size="large">
                        <h3>{{expressData.logisticsStatusDesc}}</h3>
                    </el-timeline-item>
                    <el-timeline-item
                        v-for="(item, index) in routeDtos"
                        :key="index"
                        :timestamp="item.time">
                        {{item.context}}
                    </el-timeline-item>
                </el-timeline>
            </div>
        </div>
    </div>
</template>
<script>
import md5 from 'js-md5'
import axios from 'axios'
import qs from 'qs'

let that;
export default {
    name:'express',

    beforeCreate() {
        that = this
    },

    data() {
        return {
            appid:'bjhzcZ1hF8rR5gF5mK9qW',
            appSecret:'4c18253ddba74d30b1b74a692aab6606',

            formData:{
                mailNo:'',  //快递单号
                cpCode:'',  //快递公司编码
                cpName:'',  //快递公司名称
                phone:'',   //寄件人电话
            },
            //地图
            arcgisMap:'',
            //快递公司数据
            expressCompanyOptions:[],
            //物流数据
            expressData:{},
            //物流明细数据
            routeDtos:[],
            //首次进入
            firstIn:true,

            rules: {
                mailNo: [
                    { required: true, message: '快递单号不能为空', trigger: 'blur' }
                ],
                cpCode: [
                    { required: true, message: '快递公司不能为空', trigger: 'change' }
                ],
                phone: [
                    { required: true, message: '寄件人电话不能为空', trigger: 'blur' }
                ],
            },


            center: [116.397,39.909],
            endLabel: {
                content: '',
                offset: [10, -10],
            },
            routePath: [],
            sendCenter: [],
            endCenter: [],
        }
    },
    created() {
        this.queryExpressCompanyList();

        this.formData.mailNo = this.$route.query.courierNumber;
        // this.arcgisMap='/map/expressQueryMap.html';

        if(!!this.formData.mailNo){
            this.handleInputChange();
        }else{
            this.firstIn = false;
        }
    },
    methods: {
        //查询快递公司
        queryExpressCompanyList(){
            let params = {

            }
            axios.post('https://express.xuanquetech.com/express/comm/expressCompanyList',qs.stringify(params),{
                headers:{'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'}
            }).then((res) => {
                this.expressCompanyOptions = res.data.list;
                this.localExpressCompanyOptions = res.data.list;
            }).catch((err) => {

            })
        },
        //选择快递公司回调
        handleCompanyChange(item){
            this.formData.cpCode = item.companyCode;
            this.formData.cpName = item.companyName;
        },
        //快递单号改变后
        handleInputChange(){
            if(!this.formData.mailNo){
                return;
            }
            let obj = {
                mailNo: this.formData.mailNo,
            }
            let params = {
                appid: this.appid,
                sign: this.initSign(JSON.stringify(obj)),
                requestData: JSON.stringify(obj),
            }
            axios.post('https://express.xuanquetech.com/express/v2/exCompany',qs.stringify(params),{
                headers:{'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'}
            }).then((res) => {
                if(res.data.success){
                    this.expressCompanyOptions = [];

                    res.data.list.forEach((item) => {
                        let obj = {
                            companyName:item.cpName,
                            companyCode:item.cpCode
                        }
                        this.expressCompanyOptions.push(obj);
                    })
                    this.formData.cpCode = this.expressCompanyOptions[0].companyCode;
                    this.formData.cpName = this.expressCompanyOptions[0].companyName;

                    if(this.firstIn){
                        this.firstIn = false;
                        this.handleQueryClick();
                    }
                }else{
                    this.expressCompanyOptions = this.localExpressCompanyOptions;
                    this.formData.cpCode = '';
                    this.formData.cpName = '';
                }
            }).catch((err) => {

            })
        },
        //快递单号查询
        handleQueryClick(){
            this.$refs.elform.validate((valid) => {
                if(valid){
                    this.queryExpressMap();
                }
            });
        },
        //查询物流轨迹
        queryExpressMap(){
            let obj = {
                cpCode: this.formData.cpCode,
                mailNo: this.formData.mailNo,
                phone: this.formData.phone,
            }
            let params = {
                appid: this.appid,
                sign: this.initSign(JSON.stringify(obj)),
                requestData: JSON.stringify(obj),
            }
            axios.post('https://express.xuanquetech.com/express/v2/queryExpressMap',qs.stringify(params),{
                headers:{'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'}
            }).then((res) => {
                if(res.data.success){
                    this.expressData = res.data;
                    this.routeDtos = this.expressData.routeDtos;

                    if(this.expressData.routeLatLngs.length < 2){
                        this.$modal.msgWarning("当前暂无物流信息!")
                        return
                    }
                    // this.getRoute(this.expressData.routeLatLngs);
                    this.routePath = [];
                    this.center = [];
                    this.getRoutePath(this.expressData.routeLatLngs)
                }else{
                    this.$modal.msgWarning(res.data.errorMsg)
                }
            }).catch((err) => {

            })
        },
        //获取路径规划
        getRoutePath(routeLatLngs){
            let startLatLng = routeLatLngs[routeLatLngs.length-1].latAndLng;
            let endLatLng = routeLatLngs[0].latAndLng;

            let params = {
                key: '06541558d151d51375463a6fcb9192c2',
                origin: startLatLng,
                destination: endLatLng,
            }
            axios.get('https://restapi.amap.com/v3/direction/driving?',{ params: params }).then((res) => {
                let steps = res.data.route.paths[0].steps;

                steps.forEach((item) => {
                    let polylineArr = item.polyline.split(';');

                    polylineArr.forEach((childItem) => {
                        let arr =  childItem.split(',');
                        this.routePath.push(arr)
                    })
                })
                //显示发货地
                let sendPoint = this.expressData.routeLatLngs[this.expressData.routeLatLngs.length-1].latAndLng;
                this.sendCenter = sendPoint.split(',');
                //设置中心点
                this.center = sendPoint.split(',')

                //当前到达地
                let currentPoint = this.expressData.routeLatLngs[0].latAndLng;
                let currentName = this.expressData.routeLatLngs[0].location;
                this.endCenter = currentPoint.split(',')
                this.endLabel.content = '当前到达：'+ currentName;
            }).catch((err) => {

            })
        },
        //获取物流轨迹数据
        getRoute(routeLatLngs){
            // let origLatLng = routeLatLngs[0].latAndLng;
            // let destLatLng = routeLatLngs[routeLatLngs.length-1].latAndLng;
            // let midLatLng = '';

            // for (let i = 0; i < routeLatLngs.length; i++) {
            //     if(i!==0 && i!==routeLatLngs.length-1){
            //         midLatLng = midLatLng + routeLatLngs[i].latAndLng + ';'
            //     }
            // }
            // let params = {
            //     orig:origLatLng,
            //     dest:destLatLng,
            //     mid:midLatLng,
            //     style:"0",
            // }
            // let obj = {
            //     postStr:JSON.stringify(params),
            //     type:'search',
            //     tk:'29a23b1a52f22eb2c53238ffcd3bd329',
            // }
            // axios.get('https://api.tianditu.gov.cn/drive',{ params:obj }).then((res) => {
            //     const xml = res.data; // XML 字符串
            //     let obj = this.$x2js.xml2js(xml);

            //     let pointArr =  obj.result.routelatlon.split(';')

            //     setTimeout(function() {
            //         that.$refs.expressContainer.contentWindow.drawPoint(that.expressData);
            //         that.$refs.expressContainer.contentWindow.drawRoute(pointArr);
            //     }, 500)
            // }).catch((err) => {

            // })
        },
        //签名
        initSign(requestData){
            let str = requestData + this.appSecret;
            let sign = md5(str);
            return sign
        },
    },
}
</script>
<style lang="scss" scoped>
.app-container {
    overflow: hidden;
    position: relative;

    .query-container {
        padding-top: 10px;
    }
    .query-button {
        width: 100px;
    }
    .el-button--small {
        padding: 7px 10px;
        width: 100px;
        height: 30px;
        margin-top: 5px;
        margin-left: 20px;
        // border-radius: 20px;
    }
    .arcgis-container {
        width: 100%;
        height: 100%;
        position: relative;

        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        .timeline-container {
            background: #ffffff;
            width: 250px;
            height: 500px;
            position: absolute;
            right: 0px;
            top: 10px;
            padding: 20px 10px;
            overflow: auto;
            opacity:95%;

            .express-title {
                font-size: 14px;
                padding-bottom: 20px;
                color: #868686;
            }
            h3 {
                color: #4587ff;
            }
            .el-timeline {
                padding-left: 5px;
            }
        }
    }
}
::v-deep .amap-icon img {
    width: 26px;
    height: 26px;
}
</style>
