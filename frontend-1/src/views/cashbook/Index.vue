<!--
 * 记账本
 * @module cashbook
 * @author its-wild
 * @date 2021/05/06
-->
<template>
    <a-card :bordered="false">
        <a-divider class="page-top-divider" orientation="left">
            账本列表
        </a-divider>

        <!-- 查询区域 -->
        <div class="page-search-wrapper">
            <a-form layout="inline">
                <a-row :gutter="24">
                    <a-col v-bind="span">
                        <a-form-item label="月份">
                            <a-month-picker
                                placeholder="请选择月份"
                                @change="onMonthChange"
                                style="width: 100%"
                            />
                        </a-form-item>
                    </a-col>

                    <a-col v-bind="span">
                        <a-form-item label="账单分类">
                            <a-select
                                v-model="params.category"
                                placeholder="请选择账单分类"
                            >
                                <a-select-option
                                    v-for="item in typeArr"
                                    :key="item.id"
                                    :value="item.id"
                                >
                                    {{ item.name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>

                    <a-col v-bind="span">
                        <span
                            style="float: left; overflow: hidden"
                            class="page-search-buttons"
                        >
                            <a-button
                                type="primary"
                                @click="onSearch"
                                icon="search"
                            >
                                查询
                            </a-button>
                            <a-button
                                type="primary"
                                @click="searchReset"
                                icon="reload"
                                style="margin-left: 8px"
                            >
                                重置
                            </a-button>
                        </span>
                    </a-col>
                </a-row>
            </a-form>
        </div>

        <!-- 操作按钮区域-begin -->
        <div class="page-operator">
            <a-button @click="handleAdd" type="primary" icon="plus">
                新增
            </a-button>
        </div>
        <!-- 操作按钮区域-end -->

        <!-- table区域-begin -->
        <a-table
            ref="table"
            bordered
            size="middle"
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="pagination"
            :loading="loading"
            @change="handleTableChange"
        >
            <span slot="typeName" slot-scope="text">
                {{ getTypeName(text) }}
            </span>

            <template slot="amount" slot-scope="text">
                {{ text | money }}
            </template>

            <span slot="action" slot-scope="text, record">
                <a-button size="small" @click="handleEdit(record)">
                    编辑
                </a-button>

                <a-divider type="vertical" />
                <a-popconfirm
                    title="确定删除吗?"
                    @confirm="() => onDelete(record)"
                >
                    <a-button size="small" type="danger" ghost>删除</a-button>
                </a-popconfirm>
            </span>
        </a-table>
        <!-- table区域-end -->
        <a-row :gutter="24">
            <a-col :span="10">
                <a-card
                    :loading="loading"
                    :title="
                        '总收入/总支出' +
                        (params.month ? '（' + params.month + '）' : '（全部）')
                    "
                    size="small"
                >
                    <div class="pie" id="in-out-total" ref="pie"></div>
                </a-card>
            </a-col>
            <a-col :span="14">
                <a-card
                    :loading="loading"
                    :title="
                        '分类总支出' +
                        (params.month ? '（' + params.month + '）' : '（全部）')
                    "
                    size="small"
                >
                    <div class="bar" id="type-out-total" ref="bar"></div>
                </a-card>
            </a-col>
        </a-row>

        <cashbook-modal
            ref="modalForm"
            @ok="modalOk"
            :categoryOptions="typeArr"
        />
    </a-card>
</template>

<script>
import { ListMixin } from "@/mixins/ListMixin";
import {
    list,
    del,
    getCategories,
    getInOrOutTotal,
    getCategoriesOutTotal,
} from "@/apis/cashbook";
import moment from "moment";
import * as echarts from "echarts";
import { comdify } from "@/utils";
import CashbookModal from "./modules/CashbookModal.vue";

export default {
    components: { CashbookModal },
    name: "Cashbook",
    mixins: [ListMixin],
    data() {
        return {
            span: {
                md: 6,
                sm: 8,
            },
            columns: [
                {
                    title: "#",
                    dataIndex: "id",
                    width: 60,
                    align: "center",
                    customRender: function (text, record, index) {
                        return parseInt(text) + 1;
                    },
                },
                {
                    title: "账单时间",
                    align: "left",
                    dataIndex: "time",
                    customRender: function (text, record, index) {
                        return moment(Number.parseInt(text)).format();
                    },
                },
                {
                    title: "账单类型",
                    align: "left",
                    dataIndex: "type",
                    customRender: function (text) {
                        let map = {
                            0: "支出",
                            1: "收入",
                        };
                        return map[text];
                    },
                },
                {
                    title: "账单分类",
                    align: "left",
                    dataIndex: "category",
                    scopedSlots: { customRender: "typeName" },
                },
                {
                    title: "账单金额",
                    align: "left",
                    dataIndex: "amount",
                    scopedSlots: { customRender: "amount" },
                },
                {
                    title: "操作",
                    dataIndex: "",
                    scopedSlots: { customRender: "action" },
                    align: "left",
                    width: 160,
                },
            ],
            typeArr: [],
            urls: {
                list,
                delete: del,
            },
            pieChart: null,
            barChart: null,
        };
    },
    methods: {
        /**
         * 点击查询按钮
         */
        onSearch() {
            this.search();
            this.getInOrOutTotalData();
            this.getCategoriesOutTotalData();
        },
        /**
         * 加载账单分类
         */
        loadType() {
            getCategories().then((res) => {
                if (res.code === 200) {
                    this.typeArr = res.data;
                }
            });
        },
        /**
         * 获取账单分类名称
         * @param { string } id 账单分类id
         * @returns { string } 账单分类名称
         */
        getTypeName(id) {
            let currItem = this.typeArr.filter((item) => {
                return item.id === id;
            });

            return currItem[0] && currItem[0].name;
        },
        /**
         * 选择月份
         * @param { object } date moment时间对象
         * @param { string } dateString 时间字符串 YYYY-MM
         */
        onMonthChange(date, dateString) {
            this.params.month = dateString;
        },
        /**
         * 获取当前月的总收入和总支出，默认全部的
         */
        getInOrOutTotalData() {
            getInOrOutTotal({
                month: this.params.month,
            }).then((res) => {
                if (res.code === 200) {
                    if (!this.pieChart) {
                        setTimeout(() => {
                            this.pieChart = echarts.init(this.$refs.pie);
                            this.setPieOption(res.data);
                        }, 100);
                        return;
                    }
                    this.setPieOption(res.data);
                }
            });
        },
        /**
         * 设置饼图
         */
        setPieOption(data) {
            let option = {
                tooltip: {
                    trigger: "item",
                    formatter: function (params) {
                        let value = comdify(params.value);
                        return (
                            params.name +
                            "：" +
                            value +
                            " 元（" +
                            params.percent +
                            "%）"
                        );
                    },
                    textStyle: {
                        color: "#fff",
                    },
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                },
                color: [
                    "#1999F6",
                    "#24D5F2",
                    "#0EE0BE",
                    "#FFD628",
                    "#FF8562",
                    "#E7BCF3",
                    "#7B6BF2",
                ],
                legend: {
                    right: "3%",
                    top: "10%",
                    itemWidth: 12,
                    itemHeight: 12,
                    orient: "vertical",
                    textStyle: {
                        color: "#",
                    },
                    data: data.legend,
                },
                series: [
                    {
                        name: "总收入/总支出",
                        type: "pie",
                        radius: ["0%", "70%"],
                        center: ["40%", "50%"],
                        data: data.data,
                        roseType: "radius",
                        label: {
                            normal: {
                                textStyle: {
                                    color: "#000",
                                },
                                formatter: function (params) {
                                    let value = comdify(params.value);
                                    return params.name + "：" + value + " 元";
                                },
                            },
                        },
                        labelLine: {
                            normal: {
                                lineStyle: {
                                    color: "#5EB9FF",
                                },
                                smooth: 0.2,
                                length: 5,
                                length2: 10,
                            },
                        },
                        animationType: "scale",
                        animationEasing: "elasticOut",
                        animationDelay: function (idx) {
                            return Math.random() * 200;
                        },
                    },
                ],
            };
            // 绘制图表
            this.pieChart.setOption(option);
        },
        /**
         * 获取当前月的分类总支出，默认全部的
         */
        getCategoriesOutTotalData() {
            getCategoriesOutTotal({
                month: this.params.month,
            }).then((res) => {
                if (res.code === 200) {
                    if (!this.barChart) {
                        setTimeout(() => {
                            this.barChart = echarts.init(this.$refs.bar);
                            this.setBarOption(res.data);
                        }, 100);
                        return;
                    }
                    this.setBarOption(res.data);
                }
            });
        },
        /**
         * 设置柱形图
         */
        setBarOption(data) {
            let option = {
                tooltip: {
                    formatter: function (params) {
                        params = params[0];
                        let value = comdify(params.value);
                        return params.name + "：" + value + " 元";
                    },
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    textStyle: {
                        color: "#fff",
                    },
                    trigger: "axis",
                    axisPointer: {
                        // 坐标轴指示器，坐标轴触发有效
                        type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
                    },
                },
                color: {
                    type: "linear",
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                        {
                            offset: 0,
                            color: "#AD4ECC", // 0% 处的颜色
                        },
                        {
                            offset: 1,
                            color: "#4473DC", // 100% 处的颜色
                        },
                    ],
                },
                xAxis: {
                    data: data.keys,
                },
                yAxis: [
                    {
                        type: "value",
                        name: "（元）",
                        nameLocation: "end",
                    },
                ],
                series: [
                    {
                        name: "分类总支出",
                        type: "bar",
                        data: data.values,
                    },
                ],
                grid: {
                    left: "3%",
                    right: "3%",
                    bottom: "6%",
                    top: "12%",
                    containLabel: true,
                },
            };
            // 绘制图表
            this.barChart.setOption(option);
        },
        /**
         * 新增和更新完成
         */
        modalOk() {
            this.getInOrOutTotalData();
            this.getCategoriesOutTotalData();
            this.modalFormOk();
        },
        /**
         * 删除
         */
        onDelete(record) {
            this.getInOrOutTotalData();
            this.getCategoriesOutTotalData();
            this.handleDelete(record.id);
        },
    },
    mounted() {
        this.loadType();
        this.getInOrOutTotalData();
        this.getCategoriesOutTotalData();
    },
};
</script>

<style scoped lang="less">
/deep/ .pie,
/deep/ .bar {
    width: 100%;
    height: 300px;
}

/deep/ .ant-card-head {
    background: #fafafa !important;
}
</style>
