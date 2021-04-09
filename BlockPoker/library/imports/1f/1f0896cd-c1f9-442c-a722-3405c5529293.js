"use strict";
cc._RF.push(module, '1f089bNwflELKciNAXFUpKT', 'BlockchainTutorial');
// scripts/Game/BlockchainTutorial.js

"use strict";

// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
cc.Class({
  "extends": cc.Component,
  properties: {
    touchAnchor: cc.Node,
    fingerTipsLayer: cc.Node,
    arrow: cc.Node,
    fingerTips: cc.Node,
    fullscreen: [cc.Node],
    normalscreen: [cc.Node]
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    this.Index = 0;
    this.touchAnchor.on('touchstart', this._onTouchStart, this);
    this.touchAnchor.on('touchmove', this._onTouchMove, this);
    this.touchAnchor.on('touchend', this._onTouchEnd, this);
    this.touchAnchor.on('touchcancel', this._onTouchEnd, this);

    this._showGuidePage();

    this.fingerTips.runAction(cc.repeatForever(cc.sequence(cc.callFunc(function () {
      this.fingerTips.angle = -30;
    }, this), cc.delayTime(1), cc.rotateTo(0.2, 30), cc.delayTime(1))));
  },
  start: function start() {},
  _showGuidePage: function _showGuidePage() {
    if (cc.winSize.height / cc.winSize.width >= 2) {
      for (var i = 0; i < this.fullscreen.length; i++) {
        if (i == this.Index) {
          this.fullscreen[i].active = true;
        } else {
          this.fullscreen[i].active = false;
        }
      }
    } else {
      for (var _i = 0; _i < this.normalscreen.length; _i++) {
        if (_i == this.Index) {
          this.normalscreen[_i].active = true;
        } else {
          this.normalscreen[_i].active = false;
        }
      }
    }
  },
  //点击开始记录横坐标位置
  _onTouchStart: function _onTouchStart(event) {
    var worldPoint = event.getLocation();
    this._startX = worldPoint.x;

    if (this.fingerTipsLayer.active) {
      this.fingerTipsLayer.active = false;
      this.arrow.active = false;
      this.fingerTips.active = false;
    }
  },
  //根据左右滑动的x轴坐标计算往左还是往右
  _onTouchMove: function _onTouchMove(event) {},
  //触摸松开则结束并显示上一张或下一张图
  _onTouchEnd: function _onTouchEnd(event) {
    var worldPoint = event.getLocation(); //向左滑

    if (worldPoint.x < this._startX) {
      if (this.Index + 1 < this.fullscreen.length) {
        this.Index++;

        this._showGuidePage();
      } else {
        var tutorial = JSON.parse(cc.sys.localStorage.getItem("tutorial"));
        tutorial.Blockchain = true;
        cc.sys.localStorage.setItem("tutorial", JSON.stringify(tutorial));
        cc.director.loadScene("Splash");
      }
    } else if (worldPoint.x > this._startX) {
      //向右滑
      if (this.Index - 1 >= 0) {
        this.Index--;

        this._showGuidePage();
      }
    } else {//不动
    }
  } // update (dt) {},

});

cc._RF.pop();