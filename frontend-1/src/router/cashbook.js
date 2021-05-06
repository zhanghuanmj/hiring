/**
 * 记账本路由
 * @module cashbook
 * @author its-wild
 * @date 2021/05/06
 */
 const routes = [{
    path: '/cashbook',
    name: 'cashbook',
    component: () => import( /* webpackChunkName: "cashbook" */ '@/views/cashbook/Index.vue')
}]

export default routes