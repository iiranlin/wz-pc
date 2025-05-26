<template>
    <div class="scheduleCenter">
        <div class="header">
            <img class="logo" src="@/assets/scheduleCenter/Logo.png" />
            <img src="@/assets/scheduleCenter/Center.png" />
        </div>
        <div class="plan">
            <div class="plan-left">
                <img src="@/assets/scheduleCenter/device.png" />
            </div>
            <div class="plan-right">
                <div class="plan-right-top">
                    <div class="planDate">
                        <span>数据日期：</span>
                        <img src="@/assets/scheduleCenter/selectDate.png" />
                    </div>
                    <div class="planMonth">
                        <img src="@/assets/scheduleCenter/month.png" />
                    </div>
                </div>
                <div class="plan-right-tottom">
                    <div v-for="item in tabList" :key="item.id" class="planCard">
                        <div class="planCardIcon">
                            <img :src="item.icon" />
                        </div>
                        <div class="planCardContent">
                            <div class="planCardContentLabel">{{ item.label }}</div>
                            <div class="planCardContentCount">{{ item.count }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="table">
            <div class="tableView">
                <div class="tableViewHeader">
                    <div class="tableIcon">
                        <img class="icon" src="@/assets/scheduleCenter/TableIcon1.png" />
                        <img class="label" src="@/assets/scheduleCenter/zhuangpeichejian.png" />
                    </div>
                    <div class="tableSet" @click="handleSetClick(tData1, 'tData1')">
                        <img src="@/assets/scheduleCenter/set.png" />
                    </div>

                </div>
                <div class="tbg">
                    <div v-for="th in tHeader" :key="th.prop"
                        :style="{ width: th.width, paddingLeft: th.prop === 'a' ? '50px' : '10px' }" class="tbgh">{{
                            th.label
                        }}
                    </div>
                </div>
                <div class="tbc">
                    <div v-for="thr in tData1.filter(ss => ss.s)" :key="thr.id" class="tbgr"
                        @click="handleRowClick(thr)">
                        <div v-for="th in tHeader" :key="th.prop"
                            :style="{ width: th.width, paddingLeft: th.prop === 'a' ? '50px' : '10px' }" class="tbgc">
                            <div v-if="th.prop === 'a'" class="point"></div>
                            {{ th.prop != 'e' ? thr[th.prop] : '' }}
                            <div v-if="th.prop === 'e'" :id="`table1${[thr.id]}`" class="techarts"></div>
                        </div>
                    </div>
                </div>
                <div class="tbf">
                    <div v-for="th in tHeader" :key="th.prop"
                        :style="{ width: th.width, paddingLeft: th.prop === 'a' ? '50px' : '10px' }" class="tbgc">
                        <div v-if="th.prop === 'a'" class="point"></div>
                        {{th.prop === 'a' ? '总数：' : th.prop != 'e' ? tData2.reduce((n, b) => n + b[th.prop], 0) : ''}}
                    </div>
                </div>
            </div>
            <div class="tableView">
                <div class="tableViewHeader">
                    <div class="tableIcon">
                        <img class="icon" src="@/assets/scheduleCenter/TableIcon2.png" />
                        <img class="label" src="@/assets/scheduleCenter/zhengbeichejian.png" />
                    </div>
                    <div class="tableSet" @click="handleSetClick(tData2, 'tData2')">
                        <img src="@/assets/scheduleCenter/set.png" />
                    </div>

                </div>
                <div class="tbg">
                    <div v-for="th in tHeader" :key="th.prop"
                        :style="{ width: th.width, paddingLeft: th.prop === 'a' ? '50px' : '10px' }" class="tbgh">{{
                            th.label
                        }}
                    </div>
                </div>
                <div class="tbc">
                    <div v-for="thr in tData2.filter(ss => ss.s)" :key="thr.id" class="tbgr"
                        @click="handleRowClick(thr)">
                        <div v-for="th in tHeader" :key="th.prop"
                            :style="{ width: th.width, paddingLeft: th.prop === 'a' ? '50px' : '10px' }" class="tbgc">
                            <div v-if="th.prop === 'a'" class="point"></div>
                            {{ th.prop != 'e' ? thr[th.prop] : '' }}
                            <div v-if="th.prop === 'e'" :id="`table2${[thr.id]}`" class="techarts"></div>
                        </div>
                    </div>
                </div>
                <div class="tbf">
                    <div v-for="th in tHeader" :key="th.prop"
                        :style="{ width: th.width, paddingLeft: th.prop === 'a' ? '50px' : '10px' }" class="tbgc">
                        <div v-if="th.prop === 'a'" class="point"></div>
                        {{th.prop === 'a' ? '总数：' : th.prop != 'e' ? tData2.reduce((n, b) => n + b[th.prop], 0) : ''}}
                    </div>
                </div>
            </div>
        </div>
        <div class="footer">
            <img src="@/assets/scheduleCenter/BottomContent.png">
        </div>
        <el-dialog class="tableDialogSet" :visible.sync="showSet" :show-close="false">
            <div slot="title" class="tableDialogSetHeader">
                <div class="tableDialogSetHeaderClose" @click="handleSetClose">
                    <img src="@/assets/scheduleCenter/BtnClose.png" />
                </div>
            </div>
            <div class="tableDialogSetBody">
                <div v-for="row in currentList" :key="row.id" class="tableDialogSetBodyRow">
                    <div class="tableDialogSetBodyRowName">
                        <img src="@/assets/scheduleCenter/drap.png" />
                        <div>{{ row.a }}</div>
                    </div>
                    <div class="tableDialogSetBodySwich">
                        <el-switch v-model="row.s" active-color="rgba(156, 219, 29, 1)" inactive-color="#0c1b44"
                            active-text="显示" inactive-text="">
                        </el-switch>
                    </div>
                </div>
            </div>
            <div slot="footer" class="tableDialogSetFooter">
                <div class="tableDialogSetFooterBtn tableDialogSetConfirm" @click="handleConfirm">
                    确定
                </div>
                <div class="tableDialogSetFooterBtn tableDialogSetFooterCancel" @click="handleSetClose">
                    取消
                </div>
            </div>
        </el-dialog>
        <el-dialog class="tableDialogRowSet" :visible.sync="showRowSet" :show-close="false">
            <div slot="title" class="tableDialogRowSetHeader">
                <div class="tableDialogRowSetHeaderTitle">
                    <img src="@/assets/scheduleCenter/chejiantitle.png" />
                    <span v-if="currentRow">{{ currentRow.a }}</span>
                </div>
                <div class="tableDialogRowSetHeaderClose" @click="handleRowSetClose">
                    <img src="@/assets/scheduleCenter/BtnClose.png" />
                </div>
            </div>
            <div class="tableDialogRowSetBody">
                <div class="tableDialogRowSetBodyTitle">
                    <img src="@/assets/scheduleCenter/leftHeader.png" />
                </div>
                <div class="tableDialogRowSetBodyContent">
                    <div class="tableDialogRowSetBodyContentList">
                        <div v-for="item in list" :class="['gsdhjgas12', acListKey == item.id ? 'gsdhjgas12sd': '' ]" :key="item.id" @click="handleTab(item)">
                            <div class="sdjhjk23">
                                <div class="sdghjgh23">工序卡号：{{ item.name }}</div>
                                <div class="kjhjksdh7">物料编码：{{ item.desc }}</div>
                            </div>
                            <div class="jhsdjk" :id="`list${item.id}`"></div>
                        </div>
                    </div>
                    <div class="tableDialogRowSetBodyContentC">
                        <div class="ashasgas">
                            <div class="jkasghhjkdsgsd">
                                <div class="jkasghhjkdsgsdfddf">
                                    <div class="jkhjksd">班组生产统计</div>
                                    <div class="hsdjkhsd">
                                        <div class="asghjg">计划</div>
                                        <div class="kjhwe">当前</div>
                                    </div>
                                </div>
                                <div class="gjwehgqw12" id="lineData">
                                </div>
                            </div>
                            <div class="hkjsdhjksd">
                                <div class="hkjsdhjksddssd">
                                    <div class="hgsdjgdjs7yu32">工序卡号：SCDDBM0001-2</div>
                                    <div class="jhksdh89">物料编码：WLBM00006890</div>
                                </div>
                                <div class="hgjsdgwe">
                                    <div class="sdhjgsdg">工序编码：GXBM098-01</div>
                                    <div class="sdhjgsdg">预计加工数量：4334</div>
                                    <div class="sdhjgsdg">工序名称：精抛光处理</div>
                                    <div class="sdhjgsdg">实际加工数量：23</div>
                                    <div class="sdhjgsdg">开工时间：2025-09-09</div>
                                    <div class="sdhjgsdg">合格品数量：23</div>
                                    <div class="sdhjgsdg">完工时间：2025-10-10</div>
                                    <div class="sdhjgsdg">不良品数量：23</div>
                                    <div class="sdhjgsdg">上一道序：倒圆角处理</div>
                                    <div class="sdhjgsdg">返工品数量：21</div>
                                    <div class="sdhjgsdg">下一道序：组装主电机</div>
                                </div>
                            </div>
                        </div>
                        <div class="tdrsbc">
                            <div class="tdrsbctiti">智能预警</div>
                            <div class="ashgj32">
                                <div class="jkshdj980">
                                    <img src="@/assets/scheduleCenter/Radar.png" />
                                </div>
                                <div class="jkhsdjkhsd">
                                    <div v-for="item in divece" :key="item.name" class="sdjhksd">
                                        <div v-if="item.type == 0" class="jksdh32"></div>
                                        <div v-if="item.type == 1" class="jkhsd8"></div>
                                        <div class="sdjhkjhsdjk78">{{ item.name }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div slot="footer" class="tableDialogRowSetFooter">
                <div class="tableDialogRowSetFooterBtn tableDialogRowSetConfirm" @click="handleRowConfirm">
                    确定
                </div>
                <div class="tableDialogRowSetFooterBtn tableDialogRowSetFooterCancel" @click="handleRowSetClose">
                    取消
                </div>
            </div>
        </el-dialog>
    </div>
</template>
<script>

import Icon1 from '@/assets/scheduleCenter/Icon1.png'
import Icon2 from '@/assets/scheduleCenter/Icon2.png'
import Icon3 from '@/assets/scheduleCenter/Icon3.png'
import Icon4 from '@/assets/scheduleCenter/Icon4.png'
import Icon5 from '@/assets/scheduleCenter/Icon5.png'
import * as echarts from 'echarts'
export default {
    data() {
        return {
            tabList: [
                {
                    id: '1', label: '待排产总数量：', count: 3056, icon: Icon1
                },
                {
                    id: '2', label: '已排产总数量：', count: 6000, icon: Icon2
                },
                {
                    id: '3', label: '待开工总数量：', count: 2000, icon: Icon3
                },
                {
                    id: '4', label: '生产中总数量：', count: 7000, icon: Icon4
                },
                {
                    id: '5', label: '已完工总数量：', count: 3500, icon: Icon5
                },

            ],
            tHeader: [
                { label: '车间名称', prop: 'a', width: '40%' },
                { label: '待开工', prop: 'b', width: '15%' },
                { label: '生产中', prop: 'c', width: '15%' },
                { label: '已完工', prop: 'd', width: '15%' },
                { label: '完成率', prop: 'e', width: '15%' },
            ],
            tData1: [
                { id: '1', a: '车间名称1', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '2', a: '车间名称2', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '3', a: '车间名称3', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '4', a: '车间名称4', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '5', a: '车间名称5', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '6', a: '车间名称6', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '7', a: '车间名称7', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '8', a: '车间名称8', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '9', a: '车间名称9', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '10', a: '车间名称9', b: 89, c: 90, d: 67, e: 34, s: true },
            ],
            tData2: [
                { id: '1', a: '车间名称11', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '2', a: '车间名称22', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '3', a: '车间名称33', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '4', a: '车间名称44', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '5', a: '车间名称55', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '6', a: '车间名称66', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '7', a: '车间名称77', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '8', a: '车间名称88', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '9', a: '车间名称99', b: 89, c: 90, d: 67, e: 34, s: true },
                { id: '9', a: '车间名称110', b: 89, c: 90, d: 67, e: 34, s: true },

            ],
            showSet: false,
            currentList: [],
            showRowSet: false,
            currentRow: null,
            divece: [
                { name: '01#设备', type: 0 },
                { name: '02#设备', type: 0 },
                { name: '03#设备', type: 0 },
                { name: '04#设备', type: 1 },
                { name: '05#设备', type: 0 },
                { name: '06#设备', type: 0 },
                { name: '07#设备', type: 0 },
                { name: '08#设备', type: 0 },
                { name: '09#设备', type: 0 },
                { name: '10#设备', type: 0 },
                { name: '11#设备', type: 0 },
                { name: '12#设备', type: 0 },
                { name: '13#设备', type: 0 },
                { name: '14#设备', type: 0 },
            ],
            list: [
                { id: '1', name: 'SCDDBM0001-1', desc: 'WLBM00006890', jindu: 40 },
                { id: '2', name: 'SCDDBM0001-2', desc: 'WLBM00006891', jindu: 90 },
                { id: '3', name: 'SCDDBM0001-3', desc: 'WLBM00006892', jindu: 40 },
                { id: '4', name: 'SCDDBM0001-4', desc: 'WLBM00006893', jindu: 40 },
                { id: '5', name: 'SCDDBM0001-5', desc: 'WLBM00006894', jindu: 40 },
                { id: '6', name: 'SCDDBM0001-6', desc: 'WLBM00006895', jindu: 40 },
                { id: '7', name: 'SCDDBM0001-7', desc: 'WLBM00006896', jindu: 40 },
            ],
            acListKey: '' 

        };
    },
    mounted() {
        this.loadPie()

    },
    methods: {
        loadLine() {
            const chartDom = document.getElementById(`lineData`);
            const myChart = echarts.init(chartDom);
            const option = {
                title: {
                    show: false,
                    text: 'Stacked Area Chart'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#6a7985'
                        }
                    }
                },
                legend: {
                    show: false,
                    data: ['计划', '当前',]
                },
                toolbox: {
                    show: false,
                    feature: {
                        saveAsImage: {}
                    }
                },
                grid: {
                    top: 40,
                    left: '3%',
                    right: '4%',
                    bottom: '8%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        data: ['SCDDBM001-1', 'SCDDBM001-2', 'SCDDBM001-3', 'SCDDBM001-4', 'SCDDBM001-5', 'SCDDBM001-6'],
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#547fa7',
                                width: 2,
                                type: 'solid'
                            }
                        },
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: '#1BE0D3'
                            }
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        name: '单位：件',
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#547fa7',
                                width: 2,
                                type: 'solid'
                            }
                        },
                        splitLine: {
                            show: true,
                            lineStyle: {
                                type: 'dashed'
                            }

                        },
                        nameTextStyle: {
                            color: '#1BE0D3'
                        },
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: '#1BE0D3'
                            }
                        }
                    }
                ],
                series: [
                    {
                        name: '计划',
                        type: 'line',
                        stack: 'Total',
                        areaStyle: {
                            color: {
                                //线性渐变
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [{
                                    offset: 0, color: '#0DFFB6', // 0% 处的颜色
                                }, {
                                    offset: 0.6, color: 'rgba(1, 255, 255,0)', // 100% 处的颜色
                                }],
                                global: false, // 缺省为 false
                            },
                        },
                        itemStyle: {
                            normal: {
                                color: '#0DFFB6',
                                lineStyle: {
                                    color: '#0DFFB6'
                                }
                            }
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [220, 532, 201, 434, 490, 430]
                    },
                    {
                        name: '当前',
                        type: 'line',
                        stack: 'Total',
                        areaStyle: {
                            color: {
                                //线性渐变
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [{
                                    offset: 0, color: '#D257FF', // 0% 处的颜色
                                }, {
                                    offset: 0.6, color: 'rgba(1, 255, 255,0)', // 100% 处的颜色
                                }],
                                global: false, // 缺省为 false
                            },
                        },
                        itemStyle: {
                            normal: {
                                color: '#D257FF',
                                lineStyle: {
                                    color: '#D257FF'
                                }
                            }
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [120, 182, 191, 234, 290, 330]
                    },
                ]
            };
            option && myChart.setOption(option);
        },
        loadPieItem() {
            for (let i = 0; i < this.list.length; i++) {
                const item = this.list[i]
                const chartDom = document.getElementById(`list${item.id}`);
                const myChart = echarts.init(chartDom);
                const option = {
                    title: {
                        show: true,
                        text: item.jindu + '%',   //图中间的值
                        x: 'center',          //居中
                        y: 'center',
                        textStyle: {
                            fontSize: '12',
                            color: 'white',
                            fontWeight: '500'
                        }
                    },
                    color: ['#81DB2C', '#2B81A6'],
                    series: [
                        {
                            type: 'pie',
                            avoidLabelOverlap: true,
                            hoverAnimation: false,
                            label: {
                                normal: {
                                    show: false,
                                    position: 'center'
                                },
                                emphasis: {
                                    show: false
                                }
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            radius: ['80%', '100%'],
                            data: [
                                { value: item.jindu, name: '已完成' },
                                { value: 100 - item.jindu, name: '未完成' }

                            ]
                        }
                    ]
                };
                option && myChart.setOption(option);
            }
        },
        handleTab(row) {
            this.acListKey = row['id']
        },
        handleRowClick(row) {
            this.currentRow = { ...row }
            this.showRowSet = true
            this.acListKey = this.list[0]['id']
            this.$nextTick(() => {
                this.loadPieItem()
                this.loadLine()
            })

        },
        handleRowConfirm() {
            this.handleRowSetClose()
        },
        handleRowSetClose() {
            this.showRowSet = false
            this.currentRow = null
        },
        loadPie() {
            this.$nextTick(() => {
                this.renderTEcharts('table1', this.tData1)
                this.renderTEcharts('table2', this.tData2)
            })
        },
        handleConfirm() {
            this[this._curT] = [...this.currentList]
            this.handleSetClose()
            this.loadPie()
        },
        handleSetClose() {
            this.showSet = false
            this.currentList = []
        },
        handleSetClick(arr, key) {
            this._curT = key
            this.currentList = JSON.parse(JSON.stringify(arr))
            this.showSet = true
        },
        renderTEcharts(pre, arr) {
            for (let i = 0; i < arr.length; i++) {
                const item = arr[i]
                const chartDom = document.getElementById(`${pre}${item.id}`);
                const myChart = echarts.init(chartDom);
                const n = item.d + item.b + item.c
                const v = ((item.d / n) * 100).toFixed(0)
                const option = {
                    title: {
                        show: true,
                        text: v + '%',   //图中间的值
                        x: 'center',          //居中
                        y: 'center',
                        textStyle: {
                            fontSize: '12',
                            color: 'white',
                            fontWeight: '500'
                        }
                    },
                    color: ['#81DB2C', '#2B81A6'],
                    series: [
                        {
                            type: 'pie',
                            avoidLabelOverlap: true,
                            hoverAnimation: false,
                            label: {
                                normal: {
                                    show: false,
                                    position: 'center'
                                },
                                emphasis: {
                                    show: false
                                }
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            radius: ['80%', '100%'],
                            data: [
                                { value: item.d, name: '已完成' },
                                { value: item.b + item.c, name: '未完成' }

                            ]
                        }
                    ]
                };
                option && myChart.setOption(option);
            }



        },
    },
};
</script>
<style lang="scss" scope>
.scheduleCenter {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    background-image: url(../../../assets/scheduleCenter/girdbg.png);
    background-size: 100% 100%;
    background-color: #041129;
    background-repeat: no-repeat;

    .header {
        height: 90px;
        width: 80%;
        margin: 0 10%;
        position: relative;
        .logo {
            position: absolute;
            left: -10%;
            top: 11px;
            width: 110px;
            height: 50px;
        }
        img {
            width: 100%;
            height: 100%;
            object-fit: fill;
        }
    }

    .plan {
        height: 230px;
        display: flex;
        flex-direction: row;
        width: 100%;
        padding: 0 50px;
        box-sizing: border-box;
        align-items: center;

        .plan-left {
            width: 322px;

            img {
                width: 322px;
                height: 183px;
            }
        }

        .plan-right {
            display: flex;
            flex-direction: column;
            flex: 1;
            margin-left: 22px;
            height: 183px;

            .plan-right-top {
                height: 34px;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;

                .planDate {
                    position: relative;

                    height: 34px;

                    span {
                        font-size: 14px;
                        font-weight: 400;
                        letter-spacing: 0px;
                        color: rgba(255, 255, 255, 1);
                        text-align: left;
                        display: inline-block;
                        line-height: 34px;
                        height: 34px;
                    }

                    img {
                        position: absolute;
                        left: 20px;
                        width: 297px;
                        height: 34px;
                        object-fit: contain;
                    }
                }

                .planMonth {
                    width: 500px;
                    height: 34px;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }
            }

            .plan-right-tottom {
                flex: 1;
                background-image: url(../../../assets/scheduleCenter/DataBg.png);
                background-size: 100% 100%;
                background-repeat: no-repeat;
                display: flex;
                flex-direction: row;
                align-items: center;
                height: 149px;

                .planCard {
                    width: calc(100% / 5);
                    display: flex;
                    flex-direction: row;
                    align-items: center;

                    .planCardIcon {
                        position: relative;
                        top: 10px;

                        img {
                            width: 110px;
                            height: 110px;
                            object-fit: cover;
                        }
                    }

                    .planCardContent {
                        .planCardContentLabel {
                            font-size: 16px;
                            font-weight: 500;
                            letter-spacing: 0px;
                            line-height: 22.4px;
                            color: rgba(255, 255, 255, 1);
                            text-align: left;
                            vertical-align: top;
                        }

                        .planCardContentCount {
                            font-size: 44px;
                            font-weight: 400;
                            letter-spacing: 0px;
                            line-height: 52.79px;
                            color: rgba(255, 255, 255, 1);
                            text-align: left;
                            vertical-align: top;
                        }
                    }
                }
            }
        }
    }

    .table {
        flex: 1;
        display: flex;
        flex-direction: row;
        padding: 20px 50px;
        box-sizing: border-box;
        width: 100%;
        justify-content: space-between;
        overflow: hidden;

        .tableView {
            width: calc(50% - 15px);
            background-image: url(../../../assets/scheduleCenter/TableBg.png);
            background-size: 100% 100%;
            background-repeat: no-repeat;
            padding: 16px;
            box-sizing: border-box;
            overflow: hidden;
            display: flex;
            flex-direction: column;

            .techarts {
                width: 40px;
                height: 40px;
            }

            .tableViewHeader {
                height: 35px;
                width: 100%;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;

                .tableIcon {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;

                    .icon {
                        width: 26px;
                        height: 26px;

                        img {
                            height: 100%;
                            width: 100%;
                            object-fit: contain;
                        }
                    }

                    .label {
                        height: 32px;
                        margin-left: 10px;
                        object-fit: contain;
                    }
                }

                .tableSet {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-end;
                    align-items: center;
                    cursor: pointer;

                    img {
                        width: 54px;
                        height: 24px;
                        object-fit: contain;
                    }
                }
            }

            .tbg {
                background-image: url(../../../assets/scheduleCenter/tbg.png);
                background-size: 100% 100%;
                background-repeat: no-repeat;
                height: 34px;
                width: 100%;
                display: flex;
                flex-direction: row;
                align-items: center;

                .tbgh {
                    font-size: 16px;
                    font-weight: 500;
                    letter-spacing: 1px;
                    color: rgba(255, 255, 255, 1);
                    text-align: left;
                    box-sizing: border-box;
                }
            }

            .tbc {
                flex: 1;
                overflow: hidden;

                .tbgr {
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    height: 60px;
                    background-image: url(../../../assets/scheduleCenter/rowBg.png);
                    background-size: 100% 100%;
                    background-repeat: no-repeat;
                    cursor: pointer;

                    .tbgc {
                        font-size: 14px;
                        font-weight: 500;
                        letter-spacing: 1px;
                        color: rgba(255, 255, 255, 1);
                        box-sizing: border-box;
                        position: relative;

                        .point {
                            position: absolute;
                            width: 5px;
                            height: 5px;
                            left: 35px;
                            top: 7px;
                            background: rgba(36, 255, 226, 1);
                        }
                    }
                }
            }

            .tbc::-webkit-scrollbar {
                width: 12px;
                height: 12px;
            }

            .tbc::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
            }

            .tbc::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 10px;
            }

            .tbc::-webkit-scrollbar-thumb:hover {
                background: #555;
            }

            .tbc::-webkit-scrollbar-corner {
                background: #f1f1f1;
            }

            .tbf {
                height: 60px;
                display: flex;
                flex-direction: row;
                align-items: center;

                .tbgc {
                    box-sizing: border-box;
                    font-size: 14px;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 1);
                    text-align: left;
                    position: relative;

                    .point {
                        position: absolute;
                        width: 5px;
                        height: 5px;
                        left: 35px;
                        top: 7px;
                        background: rgba(36, 255, 226, 1);
                    }
                }
            }
        }
    }

    .footer {
        height: 35px;
        width: 100%;

        img {
            width: 100%;
            height: 100%;
            object-fit: fill;
        }

    }
}
</style>
<style>
.tableDialogSet .el-dialog {
    background-image: url(../../../assets/scheduleCenter/LayerBG.png);
    background-size: 100% auto;
    background-repeat: no-repeat;
    height: 648px;
    width: 710px;
    top: 15% !important;
    background-color: #0c1b44;
}

.tableDialogSet .el-dialog__header {
    background-color: transparent;
}

.tableDialogSet .el-dialog__header {
    height: 60px;
    padding: 0 10px;
    box-sizing: border-box;
}

.tableDialogSet .el-dialog__body {
    height: calc(100% - 120px);
    padding: 0 16px;
    box-sizing: border-box;
}

.tableDialogSet .el-dialog__footer {
    height: 60px;
    padding: 0 16px;
    box-sizing: border-box;
}

.tableDialogSetHeader {
    background-image: url(../../../assets/scheduleCenter/dialogT.png);
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-position: left 10px top 10px;
    height: 100%;
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
}

.tableDialogSetFooter {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    height: 100%;
}

.tableDialogSetBody {
    height: 100%;
    overflow: hidden;
}

.tableDialogSetBodyRow {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-image: url(../../../assets/scheduleCenter/rowBg.png);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    height: 54px;
    width: 100%;
    padding: 0 12px;
    box-sizing: border-box;
}

.tableDialogSetBodyRowName {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.tableDialogSetBodyRowName img {
    width: 20px;
    height: 20px;
}

.tableDialogSetBodyRowName div {
    margin-left: 13px;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 1px;
    line-height: 16px;
    color: rgba(255, 255, 255, 1);
}

.tableDialogSetFooterBtn {
    background-image: url(../../../assets/scheduleCenter/btn.png);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    width: 118px;
    height: 34px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 1px;
    line-height: 16px;
    color: rgba(255, 255, 255, 1);
    text-align: center;
    cursor: pointer;
}

.tableDialogSetConfirm {
    position: relative;
}

.tableDialogSetConfirm::before {
    content: '';
    position: absolute;
    left: 10px;
    width: 2px;
    height: 15.11px;
    opacity: 1;
    background: rgba(165, 214, 63, 1);
}

.tableDialogSetFooterCancel {
    position: relative;
    margin-left: 8px;


}

.tableDialogSetFooterCancel::before {
    content: '';
    position: absolute;
    left: 10px;
    width: 2px;
    height: 15.11px;
    opacity: 1;
    background: rgba(217, 63, 63, 1);
}

.tableDialogSetHeaderClose {
    width: 24px;
    height: 24px;
    position: absolute;
    right: 0;
    cursor: pointer;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;

    }
}
</style>
<style>
.tableDialogRowSet .el-dialog {
    background-image: url(../../../assets/scheduleCenter/LayerBG.png);
    background-size: 100% auto;
    background-repeat: no-repeat;
    height: 700px;
    width: 1220px;
    top: 15% !important;
    background-color: #0c1b44;
}

.tableDialogRowSet .el-dialog__header {
    background-color: transparent;
}

.tableDialogRowSet .el-dialog__header {
    height: 50px;
    padding: 10px 20px 0;
    box-sizing: border-box;
}

.tableDialogRowSet .el-dialog__body {
    height: calc(100% - 120px);
    padding: 0 16px;
    box-sizing: border-box;
}

.tableDialogRowSet .el-dialog__footer {
    height: 60px;
    padding: 0 16px;
    box-sizing: border-box;
}

.tableDialogRowSetHeader {
    height: 100%;
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    height: 40px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.tableDialogRowSetHeaderTitle {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.tableDialogRowSetHeaderTitle img {
    width: 93px;
    height: 32px;
}

.tableDialogRowSetHeaderTitle span {
    padding-left: 20px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
    line-height: 16px;
    color: rgba(255, 255, 255, 1);
    text-align: left;
}

.tableDialogRowSetFooter {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    height: 100%;
}

.tableDialogRowSetBody {
    height: 100%;
    overflow: hidden;
    padding-top: 20px;
    box-sizing: border-box;
}

.tableDialogRowSetBodyTitle img {
    width: 300px;
    height: 36px;
    padding-right: 8px;
    box-sizing: border-box;
    position: relative;
    bottom: -4px;
}

.tableDialogRowSetBodyContent {
    display: flex;
    flex-direction: row;
    width: 100%;
}

.tableDialogRowSetBodyContentList {
    width: 300px;
    border: 1px solid rgba(18, 133, 199, 1);
    padding: 10px 12px;
    box-sizing: border-box;
}

.gsdhjgas12 {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    opacity: 1;
    border-radius: 5px;
    background: linear-gradient(180deg, #1887D6 0%, #0F3891 100%);
    padding: 10px;
    box-sizing: border-box;
    margin-bottom: 10px;
    cursor: pointer;
}
.gsdhjgas12sd {
    background: #1840B8;

border: 1px solid #33F2E5;
}
.sdjhjk23 {
    flex: 1;
}

.sdghjgh23 {
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 1px;
    line-height: 16px;
    color: rgba(255, 255, 255, 1);
    text-align: left;
}

.kjhjksdh7 {
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 1px;
    line-height: 16px;
    color: rgba(27, 224, 211, 1);
    margin-top: 4px;
}

.jhsdjk {
    width: 50px;
    height: 50px;
}

.tableDialogRowSetBodyContentC {
    flex: 1;
    display: flex;
    flex-direction: row;
}

.ashasgas {
    flex: 1;
    margin: 0 14px;
}

.jkasghhjkdsgsd {
    border: 1px solid rgba(18, 133, 199, 1);
}

.jkasghhjkdsgsdfddf {
    display: flex;
    flex-direction: row;
    width: calc(100% - 20px);
    margin: 0 auto;
    border-bottom: 1px solid rgba(18, 133, 199, 1);
    height: 44px;
    justify-content: space-between;
    align-items: center;
}

.gjwehgqw12 {
    height: 220px;
}

.jkhjksd {
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 1px;
    line-height: 16px;
    color: rgba(255, 255, 255, 1);
}

.hsdjkhsd {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
}

.asghjg {
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 1px;
    line-height: 14px;
    color: rgba(255, 255, 255, 1);
    position: relative;
    padding-left: 5px;
    width: 50px;
}

.asghjg::before {
    position: absolute;
    left: -16px;
    top: 2px;
    content: '';
    display: inline-block;
    width: 16px;
    height: 8px;
    border-radius: 1px;
    background: rgba(13, 255, 182, 1);

}

.kjhwe {
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 1px;
    line-height: 14px;
    color: rgba(255, 255, 255, 1);
    position: relative;
    padding-left: 5px;
    width: 50px;
    margin-left: 20px;
}

.kjhwe::before {
    position: absolute;
    left: -16px;
    top: 2px;
    content: '';
    display: inline-block;
    width: 16px;
    height: 8px;
    opacity: 1;
    border-radius: 1px;
    background: rgba(210, 87, 255, 1);
}


.hkjsdhjksd {
    border: 1px solid rgba(18, 133, 199, 1);
    margin-top: 16px;
}

.hkjsdhjksddssd {
    width: calc(100% - 20px);
    margin: 0 auto;
    height: 44px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(18, 133, 199, 1);
}

.hgjsdgwe {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 10px 0;
    box-sizing: border-box;
}

.sdhjgsdg {
    width: 50%;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 1px;
    line-height: 16px;
    color: rgba(255, 255, 255, 1);
    margin: 5px 0;
    padding: 0 30px;
    box-sizing: border-box;
}

.hgsdjgdjs7yu32 {
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 1px;
    line-height: 16px;
    color: rgba(255, 255, 255, 1);
}

.jhksdh89 {
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 1px;
    line-height: 16px;
    color: rgba(27, 224, 211, 1);
}

.tdrsbc {
    width: 212px;
    border: 1px solid rgba(18, 133, 199, 1);
}

.tdrsbctiti {
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 1px;
    line-height: 16px;
    color: rgba(255, 255, 255, 1);
    padding: 0 12px;
    box-sizing: border-box;
    height: 44px;
    line-height: 44px;
    margin: 0 10px;
    width: calc(100% - 20px);
    border-bottom: 1px solid rgba(18, 133, 199, 1);
    ;
}

.ashgj32 {
    padding: 10px;
    box-sizing: border-box;
}

.jkshdj980 {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.jkshdj980 img {
    width: 156px;
    height: 156px;
}

.jkhsdjkhsd {
    display: flex;
    flex-wrap: wrap;
    margin-top: 26px;
    padding: 0 15px;
    box-sizing: border-box;
}

.sdjhksd {
    width: 50%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 2px 0;
    box-sizing: border-box;
    margin: 4px 0;
}

.sdjhkjhsdjk78 {
    margin-left: 6px;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0px;
    line-height: 16px;
    color: rgba(255, 255, 255, 1);
}

.jksdh32 {
    width: 14px;
    height: 6px;
    opacity: 1;
    border-radius: 1px;
    background: #0DFFB6;
}

.jkhsd8 {
    width: 14px;
    height: 6px;
    opacity: 1;
    border-radius: 1px;
    background: #FFBE0D;
}

.tableDialogRowSetFooterBtn {
    background-image: url(../../../assets/scheduleCenter/btn.png);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    width: 118px;
    height: 34px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 1px;
    line-height: 16px;
    color: rgba(255, 255, 255, 1);
    text-align: center;
    cursor: pointer;
}

.tableDialogRowSetConfirm {
    position: relative;
}

.tableDialogRowSetConfirm::before {
    content: '';
    position: absolute;
    left: 10px;
    width: 2px;
    height: 15.11px;
    opacity: 1;
    background: rgba(165, 214, 63, 1);
}

.tableDialogRowSetFooterCancel {
    position: relative;
    margin-left: 8px;


}

.tableDialogRowSetFooterCancel::before {
    content: '';
    position: absolute;
    left: 10px;
    width: 2px;
    height: 15.11px;
    opacity: 1;
    background: rgba(217, 63, 63, 1);
}

.tableDialogRowSetHeaderClose {
    width: 24px;
    height: 24px;
    position: absolute;
    right: 0;
    cursor: pointer;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;

    }
}
</style>