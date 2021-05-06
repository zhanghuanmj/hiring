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
                                >查询</a-button
                            >
                            <a-button
                                type="primary"
                                @click="searchReset"
                                icon="reload"
                                style="margin-left: 8px"
                                >重置</a-button
                            >
                        </span>
                    </a-col>
                </a-row>
            </a-form>
        </div>

        <!-- 操作按钮区域-begin -->
        <div class="page-operator">
            <a-button @click="handleAdd" type="primary" icon="plus"
                >新增</a-button
            >
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
                <a-button size="small" @click="handleEdit(record)"
                    >编辑</a-button
                >

                <a-divider type="vertical" />
                <a-popconfirm
                    title="确定删除吗?"
                    @confirm="() => handleDelete(record.id)"
                >
                    <a-button size="small" type="danger" ghost>删除</a-button>
                </a-popconfirm>
            </span>
        </a-table>
        <!-- table区域-end -->

        <a-card :loading="loading" title="总收入/总支出" size="small">
            <div class="pie" id="in-out-total"></div>
        </a-card>
    </a-card>
</template>

<script>
import { ListMixin } from "@/mixins/ListMixin";
import { list, getCategories, getInOrOutTotal } from "@/apis/cashbook";
import moment from "moment";

export default {
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
            },
        };
    },
    methods: {
        /**
         * 点击查询按钮
         */
        onSearch() {
            this.search();
            this.getInOrOutTotalData();
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
        getInOrOutTotalData() {
            getInOrOutTotal({
                month: this.params.month,
            }).then((res) => {
                console.log(res);
            });
        },
    },
    created() {
        this.loadType();
    },
};
</script>

<style scoped lang="less">
/deep/ .pie {
    width: 100%;
    height: 137px;
}

/deep/ .ant-card-head {
    background: #fafafa !important;
}
</style>
