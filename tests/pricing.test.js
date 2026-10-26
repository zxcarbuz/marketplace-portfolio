import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculate} from '../config.js';
test('базовые предложения совпадают с тарифами',()=>{assert.equal(calculate({slides:1}).total,1200);assert.equal(calculate({slides:5}).total,3600);});
test('полный заказ, включая срочность',()=>{assert.deepEqual(calculate({slides:5,style:'premium',extras:['retouch','copy','adaptation'],urgent:true}),{count:5,base:3600,styling:500,additions:1500,surcharge:2800,total:8400});});
test('границы количества и неизвестные опции',()=>{assert.equal(calculate({slides:-1}).count,1);assert.equal(calculate({slides:999}).count,20);assert.equal(calculate({slides:'n/a',style:'invalid',extras:['invalid']}).total,1200);assert.equal(calculate({slides:2.9}).count,2);});
test('дубли допуслуг не увеличивают цену',()=>{assert.equal(calculate({slides:1,extras:['retouch','retouch']}).total,1700);});
