<template>
    <div class="statistics">
        <div class="statistics-header">
            <div :class="[item.class ? item.class : '', 'statistics-header-item']" v-for="item in headers"
                :key="item.id">
                <div class="statistics-header-item-label">{{ item.label }}</div>
                <div class="statistics-header-item-value">

                    <span v-if="item.dict">
                        <icon-svg v-if="item.field == 'status'" :class="iconClassSize(contract[item.field])"
                            :icon-class="iconClass(contract[item.field])" />
                        {{ contract[item.field] | orderTypeFilter(dict.type[item.dict]) }}
                    </span>
                    <span v-else>{{ contract[item.field] }}</span>
                </div>
            </div>
        </div>
        <div class="statistics-content">
            <div v-for="item in cards" :key="item.id" class="statistics-item" :style="{ background: item.bgCor }">
                <div class="statistics-item-icon">
                    <img :src="item.icon" />
                </div>
                <div class="statistics-item-info">
                    <div class="info-label">{{ item.label }}</div>
                    <div class="info-value" v-if="item.dict">
                        {{ contract[item.field] | orderTypeFilter(dict.type[item.dict]) }}
                    </div>
                    <div class="info-value" v-else>{{ item.unit && contract[item.field] ? contract[item.field].toLocaleString() : contract[item.field] }}</div>
                    <div v-if="item.unit" class="info-unit">{{ item.unit }}</div>
                    <div v-if="item.price" class="info-deal" :style="{color: item.fCor}">
                    {{ Number(contract[item.field]) | dealBigMoney }}
                </div>
                </div>
                
            </div>
        </div>
    </div>
</template>
<script>
import indexMixin from '@/views/mixins'

import field1Icon from '@/assets/images/field1.png'
import field2Icon from '@/assets/images/field2.png'
import field3Icon from '@/assets/images/field3.png'
import field4Icon from '@/assets/images/field4.png'
import field5Icon from '@/assets/images/field5.png'
export default {
    name: 'statistics',
    mixins: [indexMixin],
    dicts: ['flowStatus', 'contractManagementType', 'amountType', 'currencyType'],
    props: {
        contract: {
            type: Object,
            default: () => {
                return {

                }
            }
        }
    },
    data() {
        return {
            headers: [
                {
                    id: '1',
                    label: '合同名称：',
                    field: 'ctName',
                    class: 'ctName'

                },
                {
                    id: '2',
                    label: '合同编号：',
                    field: 'ctCode',
                    class: 'ctCode'
                },
                {
                    id: '3',
                    label: '状态：',
                    field: 'status',
                    dict: 'flowStatus'
                },
                {
                    id: '4',
                    label: '合同类型：',
                    field: 'ctType',
                    class: 'ctType',
                    dict: 'contractManagementType'
                }
            ],
            cards: [
                {
                    id: '1',
                    label: '合同金额类型：',
                    icon: field1Icon,
                    bgCor: '#edf5ff',
                    field: 'amountType',
                    dict: 'amountType'
                },
                {
                    id: '2',
                    label: '支付币种类型：',
                    icon: field2Icon,
                    bgCor: '#edfffd',
                    field: 'payCurrency',
                    dict: 'currencyType'
                },
                {
                    id: '3',
                    label: '合同总金额：',
                    icon: field3Icon,
                    bgCor: '#fffaed',
                    // field: 'ctSumCountTax',
                    field: 'total2',
                    unit: '元',
                    price: true,
                    fCor: '#bc8056'
                },
                {
                    id: '4',
                    label: '对应下游订单数量：',
                    icon: field4Icon,
                    bgCor: '#edefff',
                    field: 'downstreamCount',
                    unit: '笔',
                },
                {
                    id: '5',
                    label: '下游订单对应金额：',
                    icon: field5Icon,
                    bgCor: '#d3f5ff',
                    field: 'downStreamAmount',
                    unit: '元',
                    price: true,
                    fCor: '#3160b9'
                },
            ]
        }
    },
    methods: {
        iconClassSize(value) {
            if (value !== '3') {
                return 'icon-size'
            }
            return 'icon-size'
        },
    }
}
</script>
<style lang="scss" scoped>
.statistics {
    box-sizing: border-box;
    border-top: 1px solid #E5E6EB;
    .statistics-header {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        margin-bottom: 10px;
        padding-left: 7px;
        height: 35px;
        .statistics-header-item {
            display: inline-flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            margin-right: 50px;

            .statistics-header-item-label {
                font-weight: 400;
                color: #18223e;
                font-size: 14px;
            }

            .statistics-header-item-value {
                font-weight: 400;
                color: #18223e;
                font-size: 14px;
            }
        }

        .ctName {
            .statistics-header-item-label {
                font-weight: 600;
                color: #18223e;
                font-size: 18px;
            }

            .statistics-header-item-value {
                font-weight: 600;
                color: #18223e;
                font-size: 18px;
            }
        }

        .ctType,
        .ctCode {
            .statistics-header-item-label {
                font-weight: 400;
                color: #18223e;
                font-size: 14px;
            }

            .statistics-header-item-value {
                font-weight: 500;
                color: #2054d0;
                font-size: 14px;
            }

        }

    }

    .statistics-content {
        display: flex;
        flex-direction: row;
        width: 100%;
        padding-bottom: 10px;
        .statistics-item {
            display: flex;
            flex-direction: row;
            width: calc((100% - 70px) / 5);
            margin: 0 7px;
            border-radius: 5px;
            align-items: center;

            .statistics-item-icon {
                img {
                    width: 118px;
                    height: 118px;
                    object-fit: cover;
                }
            }

            .statistics-item-info {
                .info-label {
                    color: #18223e;
                    font-size: 14px;
                    margin-bottom: 5px;
                }

                .info-value {
                    font-weight: 600;
                    color: #18223e;
                    font-size: 20px;
                    display: inline-block;
                }
                .info-unit {
                    font-weight: 600;
                    color: #18223e;
                    font-size: 20px;
                    display: inline-block;
                }
                .info-deal {
                    
font-size:12px;
margin-top: 5px;
                }
            }
        }
    }

}
</style>