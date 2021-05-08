const express = require('express');
const router = express.Router();
const path = require('path');
const { Parser } = require('json2csv');
const fs = require('fs');
const billFilePath = path.resolve('bill.csv');
const categoriesFilePath = path.resolve('categories.csv');
const csv = require('csvtojson');
const moment = require('moment');

/**
 * 新增账单
 */
router.post('/add', async function (req, res, next) {
    try {
        const { time = '', type = '', category = '', amount = '' } = req.body;
        const addData = { time, type, category, amount };
        const data = await csv().fromFile(billFilePath) || [];
        const fields = [
            {
                label: 'type',
                value: 'type',
            },
            {
                label: 'time',
                value: 'time',
            },
            {
                label: 'category',
                value: 'category',
            },
            {
                label: 'amount',
                value: 'amount',
            },
        ];
        const json2csvParser = new Parser({ fields });

        data.unshift(addData);
        
        let csvData = await new Promise((resolve, reject) => {
            let csv = json2csvParser.parse(data);
            if (csv) {
                resolve(csv)
            }
        });

        const csvRes = csvData.replace(/"/g, '');
        
        fs.writeFileSync(billFilePath, csvRes);

        res.send({ code: 200, data: addData, msg: "新增成功" });
    } catch (error) {
        res.send({ code: 201, msg: "新增失败" });
    }
});

/**
 * 更新账单
 */
router.put('/edit', async function (req, res, next) {
    try {
        const { time = '', type = '', category = '', amount = '', id } = req.body;
        const editData = { time, type, category, amount, id };
        const data = await csv().fromFile(billFilePath) || [];
        const fields = [
            {
                label: 'type',
                value: 'type',
            },
            {
                label: 'time',
                value: 'time',
            },
            {
                label: 'category',
                value: 'category',
            },
            {
                label: 'amount',
                value: 'amount',
            },
        ];
        const json2csvParser = new Parser({ fields });

        data.forEach((item, i) => {
            item.id = i;
        });

        const record = data.find(item => {
            return id === item.id
        });

        for (let key in record) {
            record[key] = editData[key] || record[key]
        }
        
        let csvData = await new Promise((resolve, reject) => {
            let csv = json2csvParser.parse(data);
            if (csv) {
                resolve(csv)
            }
        });

        const csvRes = csvData.replace(/"/g, '');
        
        fs.writeFileSync(billFilePath, csvRes);

        res.send({ code: 200, data: editData, msg: "更新成功" });
    } catch (error) {
        res.send({ code: 201, msg: "更新失败" });
    }
});

/**
 * 删除账单
 */
router.post('/del', async function (req, res, next) {
    try {
        const { time = '', type = '', category = '', amount = '', id } = req.body;
        const editData = { time, type, category, amount, id };
        const data = await csv().fromFile(billFilePath) || [];
        const fields = [
            {
                label: 'type',
                value: 'type',
            },
            {
                label: 'time',
                value: 'time',
            },
            {
                label: 'category',
                value: 'category',
            },
            {
                label: 'amount',
                value: 'amount',
            },
        ];
        const json2csvParser = new Parser({ fields });

        if (id > -1) {
            data.splice(id, 1);
        } else {
            res.send({ code: 201, msg: "删除失败" });
            return;
        }

        let csvData = await new Promise((resolve, reject) => {
            let csv = json2csvParser.parse(data);
            if (csv) {
                resolve(csv)
            }
        });

        const csvRes = csvData.replace(/"/g, '');
        
        fs.writeFileSync(billFilePath, csvRes);

        res.send({ code: 200, data: editData, msg: "删除成功" });
    } catch (error) {
        res.send({ code: 201, msg: "删除失败" });
    }
});

/**
 * 获取账单列表
 */
router.get('/list', async function (req, res, next) {
    try {
        const { category, month, pageNum, pageSize } = req.query;
        let num = Number.parseInt(pageNum) || 1;
        let size = Number.parseInt(pageSize) || 10;
        let data = await csv().fromFile(billFilePath) || [];
        let pageData = [];

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

        if (data.length <= size) {
            pageData = data;
            // 如果查到的数据只够一页，那num一定是1
            num = 1;
        } else {
            pageData = data.slice((num - 1) * size, num * size);
        }

        // 给数据加一个id值 
        pageData = pageData.map((item, i) => {
            return { id: (num - 1) * size + i, ...item };
        });
        res.send({ code: 200, msg: "成功", data: pageData, total: data.length });
    } catch (error) {
        res.send({ code: 201, msg: "查询失败" });
    }
});

/**
 * 获取当前月的总收入和总支出，默认全部的
 */
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

        res.send({ code: 200, msg: "成功", data: { legend: ['总收入', '总支出'], data: [{ value: inTotal, name: '总收入' }, { value: outTotal, name: '总支出' }] } });
    } catch (error) {
        res.send({ code: 201, msg: "查询失败" });
    }
});

/**
 * 获取当前月的分类总支出，降序排列，默认全部的
 */
router.get('/categoriesOutTotal', async function (req, res, next) {
    try {
        const { month } = req.query;
        let data = await csv().fromFile(billFilePath) || [];
        const categoriesList = await csv().fromFile(categoriesFilePath);
        let map = new Map()
        let keys = [];
        let values = [];
        let tempArr = [];

        // 如果传了月份
        if (month && month.trim()) {
            data = data.filter(item => {
                return moment(Number.parseInt(item.time)).format('YYYY-MM') === month;
            });
        }

        data.forEach(item => {
            if (item.type !== '0') {
                return;
            }
            if (!map.get(item.category)) {
                map.set(item.category, Number.parseFloat(item.amount) || 0);
            } else {
                map.set(item.category, map.get(item.category) + (Number.parseFloat(item.amount) || 0));
            }
        });

        map.forEach((value, key) => {
            let typeObj = categoriesList.find(item => {
                return item.id === key;
            });
            tempArr.push({
                name: typeObj.name,
                value: value
            });
        });

        tempArr.sort((a, b) => {
            return b.value - a.value;
        });

        tempArr.forEach(item => {
            values.push(item.value);
            keys.push(item.name);
        });

        res.send({ code: 200, msg: "成功", data: { keys, values } });
    } catch (error) {
        res.send({ code: 201, msg: "查询失败" });
    }
});

/**
 * 获取账单分类
 */
router.get('/categories', async function (req, res, next) {
    try {
        const jsonArray = await csv().fromFile(categoriesFilePath);
        res.send({ code: 200, msg: "成功", data: jsonArray, total: jsonArray.length });
    } catch (error) {
        res.send({ code: 201, msg: "查询失败" });
    }
});

module.exports = router;
