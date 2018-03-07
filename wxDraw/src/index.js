/*
 * @Author: Thunderball.Wu 
 * @Date: 2017-09-21 13:47:34 
 * @Last Modified by: Thunderball.Wu
 * @Last Modified time: 2018-01-14 22:00:52
 * 主要 引入对象
 * 
 * 写给开发者的:
 * 特别注意 
 *  由于微信小程序不稳定  注释太多,console太多会导致小程序无法加载此文件 
 *  如果是准备真机运行 建议使用 wxdraw的压缩版本
 *  还有在有些实机( 比如我的一加3 )小程序里面 使用console.log 一个构造函数 会显示null
 *  实际上是拿到了的，具体原因，还要找微信官方开发者解释
 */

import { guid } from "./util/utils.js";
import { Store } from "./store/store.js";
import { Shape } from "./shape/shape.js";
// import { AnimationFrame } from "./animation/animationFrame.js";
import { AnimationFrame } from "./animation/animationFrame.js";
import { Animation } from "./animation/animation.js";
import { eventBus } from "./util/eventBus.js"
/**
 * 
 * 
 * @param {any} canvas canvas对象
 * @param {any} x   由于小程序的无法获取 canvas 大小高宽 必须指定 x y 长宽 才能 去检测点击
 * @param {any} y 
 * @param {any} w 
 * @param {any} h 
 */


 
function WxDraw(canvas, x, y, w, h) {



    this.canvas = canvas;
    this.wcid = guid();
    this.store = new Store();
    this.bus = new eventBus();
    this.animation = new Animation(this.bus);
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    // 初始化 动画仓库 接收点 
    this.bus.add('addAnimation', this, this.addAnimationFrag);
    this.bus.add('update', this, this.update);
    this.bus.add('getDetectedLayers', this, this.getDetectedLayers);
    this.bus.add('clearDetectedLayers', this, this.clearDetectedLayers);
    this.bus.add('updateLayer', this, this.updateLayer);
    this.bus.add('destory', this, this.destroy);
    // //console.log(this.bus);
    this.animation.start();
    Shape.bus = this.bus;
    this.detectedLayers = [];
}

WxDraw.prototype = {
    add: function (item) {
        item.updateBus(this.bus)
        item._updateLayer(this.store.getLength());
        this.store.add(item);
    },
    draw: function () {
        this.store.store.forEach(function (item) {
            item.paint(this.canvas);
        }, this);
        // console.log(this.canvas.actions);
    },
    tapDetect: function (e) {
        //事件检测
        // touchstart
        // touchmove
        // touchup
        // longpress 
        // 
        
        this.bus.dispatch('clearDetectedLayers', 'no');//清空touchstart选中数组             
        let loc = this.getLoc(e.touches[0].pageX, e.touches[0].pageY);
        // console.log('tap',e.touches[0].pageX, e.touches[0].pageY)
        this.store.store.forEach(function (item) {
            item.detect(loc.x, loc.y, 'tap');
        }, this);
        // this.getLoc()

    },
    longpressDetect: function (e) {
        //外置
        this.bus.dispatch('clearDetectedLayers', 'no');//清空touchstart选中数组     
        let loc = this.getLoc(e.touches[0].pageX, e.touches[0].pageY);
        // console.log('longpress');
        this.store.store.forEach(function (item) {
            item.detect(loc.x, loc.y, 'longpress');
        }, this);
    },
    touchstartDetect: function (e) {
        //外置
        let loc = {x:e.touches[0].x, y:e.touches[0].y};
        // let loc = this.getLoc(e.touches[0].x, e.touches[0].y);
 
        // console.log(loc);
        this.store.store.forEach(function (item) {
            item.detect(loc.x, loc.y, 'touchstart');
        }, this);
    },
    touchendDetect: function (e) {
        //外置
        // let loc = this.getLoc(e.touches[0].x, e.touches[0].y);

        this.store.store.forEach(function (item) {
            item.upDetect();
        }, this);
    },
    touchmoveDetect: function (e) {
        let loc = {x:e.touches[0].x, y:e.touches[0].y};
        // console.log('move',loc);
        this.store.store.forEach(function (item) {
            item.moveDetect(loc.x, loc.y);
            // //console.log('item',item)ﬂ
        }, this);

        //  //console.log(loc);
        this.draw();
        this.canvas.draw();
    },
    // upDetect: function () {
    //     this.store.store.forEach(function (item) {
    //         item.upDetect();
    //     }, this);
    // },
    getLoc: function (x, y) {
        //获取点击相对位置

        // console.log(x,y);
        // console.log(x-this.x,y-this.y);
        return {
            x: (x - this.x) > 0 ? ((x - this.x) > this.w ? this.w : x - this.x) : 0,
            y: (y - this.y) > 0 ? ((y - this.y) > this.h ? this.h : y - this.y) : 0,
        }
    },
    update: function () {
        // 用户手动更新 
        this.draw();
        this.canvas.draw();
    },
    AnimationCenter: function () {

    },
    /**
     * 更新动画 
     * 每次创建的都是动画碎片
     * - 创建完整的动画包裹容器
     * - 创建动画碎片
     * 先是 创建容器 
     * 然后创建碎片
     * 只在start的时候 将其推送到动画空间里面 
     * 
     * @param {any} AnimationWraper  创建好的动画容器
     * @param {any} Shapeid  id
     */
    addAnimationFrag: function (AnimationWraper, Shapeid) {
        // //console.log(AnimationOption);
        // this.animation.animationFragStore.push(AnimationOption);// 添加 动画碎片 
        // this.animation.animationFragStore2.push(AnimationOption);// 添加 动画碎片 
        console.log('看下为什么了？？', this.animation.animationFragStore);
        console.log('看下animationWrapper', AnimationWraper);
        if (this.animation.animationFragStore[Shapeid]) {
            // 
            console.log('已经有动画了');
            this.animation.animationFragStore[Shapeid][this.animation.animationFragStore[Shapeid].length - 1].endCallWraper = AnimationWraper;
            this.animation.animationFragStore[Shapeid].push(AnimationWraper);
        } else {
            console.log('初始化 ');

            this.animation.animationFragStore[Shapeid] = [AnimationWraper];
        }

        // //console.log(this.animation.animationFragStore2);

    },
    getDetectedLayers: function (layers) {
        this.detectedLayers.push(layers);// 这个地方不能推一次 就 判断一次 应该全部推完了 之后再来判断 
        // console.log(this.detectedLayers);
        if (this.detectedLayers.length == this.store.getLength() && Math.max.apply(null, this.detectedLayers) != -1) {
            // console.log('选取层级');
            this.store.find(Math.max.apply(null, this.detectedLayers)).getChoosed();
        }

        if (this.detectedLayers.length == this.store.getLength() && Math.max.apply(null, this.detectedLayers) == -1) {
            this.clearDetectedLayers();
        }
        //   //console.log(this.detectedLayers);
    },
    clearDetectedLayers: function () {
        //console.log('清空选中层级');
        this.detectedLayers = [];//清空选中层级
    },
    updateLayer: function (who, oldIndex, index) {
        // console.log(this);
        let _index = 0, flag;
        _index = index;

        if (typeof index == 'string') {
            if (index.indexOf('-') === 0) flag = -1;
            else if (index.indexOf('+') === 0) flag = 1;
            else flag = false;
        }
        if (flag) {
            //相对增减
            // console.log('相对增减');
            _index = oldIndex + flag * parseInt(flag == -1 ? index.split('-')[1] : index.split('+')[1]);
            // console.log(_index);
        }
        else {

            _index = parseInt(index);
        }


        if (_index >= (this.store.store.length - 1)) {
            _index = (this.store.store.length - 1);
        }
        if (_index <= 0) {
            _index = 0;
        }
        // who._updateLayer(_index)
        this.store.changeIndex(who, oldIndex, _index);
        // console.log(this.store);
        this._updateLayer();

    },
    destroy: function (index) {
        this.store.store.splice(index, 1);
    },
    _updateLayer: function () {
        this.store.store.forEach(function (item, index) {
            item._updateLayer(index);//这里没写好 。。但现在没想到更好的办法
        })

    },
    clear:function(){
       this.canvas.clearActions();
       this.store.clear();
       this.canvas = null;
       this.bus.dispatch('clearAnimation','no','no');
    },
    reset: function() {
        this.store.clear();
        // this.bus.dispatch('clearAnimation', 'no', 'no');    
        // this.canvas.clearRect(this.x, this.y, this.w, this.h);
        // this.canvas.draw();
    }
}

var wxDraw = {
    wxDraw: WxDraw,
    Shape: Shape,
    AnimationFrame: AnimationFrame()
};




module.exports = wxDraw;