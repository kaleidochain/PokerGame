"use strict";
cc._RF.push(module, '81e9575bWhEbqmr5L0wGKJg', 'SecurityInfoItem');
// scripts/Game/SecurityInfoItem.js

"use strict";

var Log = require("Log"); // Learn cc.Class:
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
    layoutBackground: cc.Node,
    securityTips: cc.Label
  },
  // LIFE-CYCLE CALLBACKS:
  // onLoad () {},
  //https://blog.csdn.net/honey199396/article/details/98235800
  init: function init(securityTips) {
    this.securityTips.string = securityTips; // 计算宽

    this.securityTips.overflow = cc.Label.Overflow.NONE;
    this.securityTips.node.setContentSize(new cc.Size(0, 42));

    this.securityTips._forceUpdateRenderData();

    var textWidth = Math.min(this.securityTips.node.width, 420);
    textWidth = Math.round(textWidth / 30) * 30; // 计算高

    this.securityTips.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
    this.securityTips.node.setContentSize(new cc.Size(textWidth, 0));

    this.securityTips._forceUpdateRenderData();

    var textHeight = this.securityTips.node.height;
    this.securityTips.node.width = textWidth;
    this.securityTips.node.height = textHeight;
    this.layoutBackground.height = this.securityTips.node.height + 27;
    this.layoutBackground.parent.height = this.securityTips.node.height + 27;
    Log.Trace("[SecurityInfoItem:init] width: " + this.securityTips.node.width + ", height: " + this.securityTips.node.height + ", content: " + securityTips);
  },
  start: function start() {} // update (dt) {},

});

cc._RF.pop();