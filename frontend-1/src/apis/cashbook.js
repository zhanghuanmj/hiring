/**
 * 记账本的接口
 * @module cashbook
 * @author its-wild
 * @date 2021/05/06
 */

import  axios from '@/utils/axios';
const { prefix } = window._CONFIG;

export const list = `${prefix}/cashbook/list`;
export const categories = `${prefix}/cashbook/categories`;
export const inOrOutTotal = `${prefix}/cashbook/inOrOutTotal`;

export const getCategories = () => {
    return axios.get(categories);
}

export const getInOrOutTotal = (params) => {
    return axios.get(inOrOutTotal, { params });
}