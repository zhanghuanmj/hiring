const express = require('express');
const router = express.Router();
const path = require('path');
const billFilePath = path.resolve('bill.csv');
const categoriesFilePath = path.resolve('categories.csv');
const csv = require('csvtojson');
const moment = require('moment');

/**
 * 获取账单列表
 */
router.get('/list', async function (req, res, next) {
    try {
        const { category, month } = req.query;
        let data = await csv().fromFile(billFilePath) || [];
        // 如果传了账单分类
        if (category && category.trim()) {
            data = data.filter(item => {
                return item.category === category;
            });
        }

        // 如果传了月份
        if (month && month.trim()) {
            data = data.filter(item => {
                return moment(Number.parseInt(item.time)).format('YYYY-MM') === month;
            });
        }

        // 给数据加一个id值 
        data = data.map((item, i) => {
            return { id: i, ...item };
        });
        res.send({ code: 200, msg: "成功", data: data, total: data.length });
    } catch (error) {
        res.send({ code: 201, msg: "查询失败" });
    }
});

router.get('/inOrOutTotal', async function (req, res, next) {
    try {
        const { month } = req.query;
        let data = await csv().fromFile(billFilePath) || [];
        let inTotal = 0;
        let outTotal = 0;

        // 如果传了月份
        if (month && month.trim()) {
            data = data.filter(item => {
                return moment(Number.parseInt(item.time)).format('YYYY-MM') === month;
            });
        }

        data.forEach(item => {
            if (item.type === '1') {
                inTotal += (Number.parseFloat(item.amount) || 0);
            } else {
                outTotal += (Number.parseFloat(item.amount) || 0);
            }
        });
        
        res.send({ code: 200, msg: "成功", data: { inTotal, outTotal } });
    } catch (error) {
        res.send({ code: 201, msg: "查询失败" });
    }
});

router.get('/categories', async function (req, res, next) {
    try {
        const jsonArray = await csv().fromFile(categoriesFilePath);
        res.send({ code: 200, msg: "成功", data: jsonArray, total: jsonArray.length });
    } catch (error) {
        res.send({ code: 201, msg: "查询失败" });
    }
});

module.exports = router;
