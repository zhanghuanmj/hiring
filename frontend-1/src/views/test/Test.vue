<!--
 * 测试
 * @module test
 * @author zhanghuan
 * @date 2021/01/30
-->
<template>
    <div>
        测试
    </div>
</template>

<script>
    import { getList } from '@/apis/test'

    export default {
        name: "test",
        data() {
            return {
                
            }
        },
        methods: {
            getData() {
                // 假数据接口
                getList().then(res => {
                    console.log(res)
                    return res
                }).then(val => {
                    console.log('v', val)
                })
            },
        },
        mounted() {
            this.getData()
        }
    }
</script>

<style scoped lang="less">

</style>