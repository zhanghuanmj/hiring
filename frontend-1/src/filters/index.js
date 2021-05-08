import Vue from 'vue';
import { comdify } from '@/utils';

Vue.filter('money', comdify);