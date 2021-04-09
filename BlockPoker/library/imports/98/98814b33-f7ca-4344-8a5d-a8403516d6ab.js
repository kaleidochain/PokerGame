"use strict";
cc._RF.push(module, '98814sz98pDRIpdqEA1Ftar', 'INSPot');
// scripts/Game/INSPot.js

"use strict";

// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    potStatus: cc.Label,
    potNum: cc.Label,
    potName: cc.Label,
    oddsValue: cc.Label,
    outsValue: cc.Label,
    potSprite: cc.Sprite,
    unSelectSprite: cc.SpriteFrame,
    //未选择图片
    selectedSprite: cc.SpriteFrame //已选择图片

  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {},
  start: function start() {},
  init: function init(index, potInfo, newAmount) {
    this.potInfo = potInfo;
    this.potInfo.Index = index;
    this.potInfo.OutsLen = potInfo.Outs.length;

    if (index == 0) {
      //主池
      this.potName.string = "M";
    } else {
      this.potName.string = index;
    }

    this.potNum.string = potInfo.PotNum;
    this.oddsValue.string = potInfo.OddsValue;
    this.outsValue.string = this.potInfo.OutsLen;
    this.potInfo.Amount = newAmount;

    if (newAmount > 0) {
      this.potStatus.string = "Selected";
      this.potSprite.spriteFrame = this.selectedSprite;
    } else {
      this.potStatus.string = "Tap to select";
      this.potSprite.spriteFrame = this.unSelectSprite;
    }

    Log.Trace('this.potInfo.Amount: ' + this.potInfo.Amount);
  },
  UnSelected: function UnSelected(node) {
    this.potStatus.string = "Tap to select";
    this.potSprite.spriteFrame = this.unSelectSprite;
    this.potInfo.Amount = 0;
    cc.find("top/pot_sprite", node).getComponent(cc.Sprite).spriteFrame = this.unSelectSprite;
    Log.Trace('[UnSelected] this.potInfo ' + JSON.stringify(this.potInfo));
  },
  Selected: function Selected(node, amount) {
    this.potStatus.string = "Selected";
    this.potSprite.spriteFrame = this.selectedSprite;
    this.potInfo.Amount = amount;
    cc.find("top/pot_sprite", node).getComponent(cc.Sprite).spriteFrame = this.selectedSprite;
    Log.Trace('[Selected] this.potInfo ' + JSON.stringify(this.potInfo));
  },
  ChoosePot: function ChoosePot() {
    Log.Trace("selectSingleResult1111");
    var GameTable = cc.find('GameTable').getComponent('GameTable');
    Log.Trace("GameTable" + GameTable);
    GameTable.onBtnINSPotChoose(this.potInfo);
  } // update (dt) {},

});

cc._RF.pop();