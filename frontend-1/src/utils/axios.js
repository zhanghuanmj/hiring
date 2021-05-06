/**
 * axios 的封装
 * @module utils
 * @author its-wild
 * @date 2021/05/06
 */

import axios from 'axios'
import { notification } from 'ant-design-vue'

// 创建 axios 实例
const service = axios.create({
    timeout: 60 * 1000 // 请求超时时间
})

// 在发送请求之前做某件事(添加请求拦截器)
service.interceptors.request.use(
    config => {
        if (config.method === 'get') {
            config.params = config.params || {};
            config.params._ = Date.parse(new Date()) / 1000; // get方法加时间标识，防止缓存
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 返回状态判断(添加响应拦截器)
service.interceptors.response.use(
    response => {
        if (response.data.code !== 200) {
            notification.error({
                message: '系统提示',
                description: response.data.msg
            })
        }
        return response.data
    },
    error => {
        if (error.response) {
            let data = error.response.data
            switch (error.response.status) {
                case 403:
                    notification.error({
                        message: '系统提示',
                        description: '拒绝访问',
                        duration: 4
                    })
                    break
                case 404:
                    notification.error({
                        message: '系统提示',
                        description: '很抱歉，资源未找到!',
                        duration: 4
                    })
                    break
                case 504:
                    notification.error({
                        message: '系统提示',
                        description: '网络超时'
                    })
                    break
                default:
                    notification.error({
                        message: '系统提示',
                        description: data.msg,
                        duration: 4
                    })
                    break
            }
        }
        return Promise.reject(error)
    }
)

service.install = function(Vue) {
    if (this.installed) return
    this.installed = true
    Vue.prototype.$axios = service
}

export default service;
