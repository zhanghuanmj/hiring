<!--
 * 新增、编辑
 * @module cashbook
 * @author zhanghuan
 * @date 2021/05/07
-->
<template>
    <right-drawer
        :visible="visible"
        :title="title"
        @ok="handleSubmit"
        @cancel="close"
    >
        <a-spin :spinning="confirmLoading">
            <a-form :form="form">
                <a-form-item
                    label="账单时间"
                    :label-col="labelCol"
                    :wrapper-col="wrapperCol"
                >
                    <a-date-picker
                        v-decorator="['time', rules.time]"
                        value-format=""
                        placeholder="请选择账单时间"
                        :style="{ width: '100%' }"
                    />
                </a-form-item>
                <a-form-item
                    label="账单类型"
                    :label-col="labelCol"
                    :wrapper-col="wrapperCol"
                >
                    <a-select
                        v-decorator="['type', rules.type]"
                        placeholder="请选择账单类型"
                    >
                        <a-select-option value="0">支出</a-select-option>
                        <a-select-option value="1">收入</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item
                    label="账单分类"
                    :label-col="labelCol"
                    :wrapper-col="wrapperCol"
                >
                    <a-select
                        v-decorator="['category']"
                        placeholder="请选择账单分类"
                    >
                        <a-select-option
                            v-for="opt in categoryOptions"
                            :key="opt.id"
                            :value="opt.id"
                            >{{ opt.name }}</a-select-option
                        >
                    </a-select>
                </a-form-item>
                <a-form-item
                    label="账单金额"
                    :label-col="labelCol"
                    :wrapper-col="wrapperCol"
                >
                    <a-input
                        v-decorator="['amount', rules.amount]"
                        placeholder="请输入账单金额"
                    />
                </a-form-item>
            </a-form>
        </a-spin>
    </right-drawer>
</template>

<script>
import pick from "lodash.pick";
import { addData, editData } from "@/apis/cashbook";
import RightDrawer from "@/components/common/RightDrawer";
import moment from 'moment';

export default {
    name: "CashbookModal",
    components: {
        RightDrawer,
    },
    props: {
        categoryOptions: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            title: "操作",
            visible: false,
            confirmLoading: false,
            model: {},
            form: this.$form.createForm(this),
            labelCol: {
                xs: { span: 24 },
                sm: { span: 5 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
            rules: {
                time: {
                    rules: [
                        {
                            required: true,
                            message: "请选择账单时间！",
                        },
                    ],
                },
                type: {
                    initialValue: "0",
                    rules: [
                        {
                            required: true,
                            message: "请选择账单类型！",
                        },
                    ],
                },
                amount: {
                    rules: [
                        {
                            required: true,
                            message: "请输入账单金额！",
                        },
                    ],
                },
            },
        };
    },
    methods: {
        /**
         * 新增
         */
        add() {
            this.edit({});
        },
        /**
         * 编辑
         * @param {object} record 当前数据
         */
        edit(record) {
            this.visible = true;
            this.model = Object.assign({}, record);
            if (this.model.time) {
                this.model.time = moment(Number.parseInt(this.model.time));
            }
            
            this.$nextTick(() => {
                this.form.setFieldsValue(pick(this.model, "time", "type", "category", "amount"));
            });
        },
        /**
         * 触发表单验证
         */
        handleSubmit() {
            this.form.validateFields((err, values) => {
                if (!err) {
                    let formData = Object.assign({}, this.model, values);
                    let fn = addData;

                    if (this.model.id || this.model.id === 0) {
                        // 编辑
                        fn = editData;
                    }

                    formData.time = formData.time.valueOf();

                    this.confirmLoading = true;
                    fn(formData)
                        .then((res) => {
                            if (res.code === 200) {
                                this.$message.success(res.msg);
                                this.$emit("ok");
                            }
                        })
                        .finally(() => {
                            this.confirmLoading = false;
                            this.close();
                        });
                }
            });
        },
        /**
         * 关闭弹出框
         */
        close() {
            this.form.resetFields();
            this.visible = false;
        },
    },
};
</script>

<style scoped lang="less">
</style>