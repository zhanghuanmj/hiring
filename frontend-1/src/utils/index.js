/**
 * 公用方法
 * @module utils
 * @author its-wild
 * @date 2021/05/07
 */
export const comdify = (text, suffix="￥") => {
    //金额转换 分->元 保留2位小数 并每隔3位用逗号分开 1,234.56
    let str = Number.parseFloat(text).toFixed(2) + '';
    let intSum = str.substring(0, str.indexOf(".")).replace(/\B(?=(?:\d{3})+$)/g, ',');//取到整数部分
    let dot = str.substring(str.length, str.indexOf("."))//取到小数部分搜索
    let ret = suffix + intSum + dot;
    return ret;
}