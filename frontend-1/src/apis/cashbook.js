/**
 * 记账本的接口
 * @module cashbook
 * @author its-wild
 * @date 2021/05/06
 */

import  axios from '@/utils/axios';
const { prefix } = window._CONFIG;

export const list = `${prefix}/cashbook/list`;
export const add = `${prefix}/cashbook/add`;
export const edit = `${prefix}/cashbook/edit`;
export const del = `${prefix}/cashbook/del`;
export const categories = `${prefix}/cashbook/categories`;
export const inOrOutTotal = `${prefix}/cashbook/inOrOutTotal`;
export const categoriesOutTotal = `${prefix}/cashbook/categoriesOutTotal`;

export const addData = (data) => {
    return axios.post(add, data);
}

export const editData = (data) => {
    return axios.put(edit, data);
}

export const getCategories = () => {
    return axios.get(categories);
}

export const getInOrOutTotal = (params) => {
    return axios.get(inOrOutTotal, { params });
}

export const getCategoriesOutTotal = (params) => {
    return axios.get(categoriesOutTotal, { params });
}