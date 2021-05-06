/**
 * 测试的接口
 * @module test
 * @author its-wild
 * @date 2021/05/06
 */

import  axios from '@/utils/axios';
const { prefix } = window._CONFIG;

export const getList = () => {
    return axios.get(`${prefix}/cashbook/list`);
}