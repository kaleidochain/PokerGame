"use strict";
cc._RF.push(module, '7d8f8DJP1lC/rB2UpSiE3BP', 'Poker');
// scripts/Game/Poker.js

"use strict";

var Log = require('Log');

cc.Class({
  "extends": cc.Component,
  properties: {
    allinFrame: cc.Node,
    //Allin动画，只有SelfHoleCard才有的效果
    card: cc.Node,
    //牌正反面
    blackMask: cc.Node,
    //弃牌灰色蒙层
    frontCard: cc.SpriteFrame,
    //牌正面
    backCard: cc.SpriteFrame //牌背面

  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    this.dealCardDuration = 0.2;
    Log.Trace("Poker:onLoad");
  },
  start: function start() {},
  onDestroy: function onDestroy() {
    Log.Trace("Poker:onDestroy");
  },
  //初始化使用哪套牌的正面和背面
  init: function init(frontidx, backidx) {
    var assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");

    if (frontidx < 0 || frontidx > 3) {
      frontidx = 0;
    }

    if (backidx < 0 || backidx > 3) {
      backidx = 0;
    }

    this.frontSuit = frontidx;
    this.backSuit = backidx;

    if (this.backSuit == 0) {
      this.backCard = assetMgr.back0;
    } else if (this.backSuit == 1) {
      this.backCard = assetMgr.back1;
    } else if (this.backSuit == 2) {
      this.backCard = assetMgr.back2;
    } else if (this.backSuit == 3) {
      this.backCard = assetMgr.back3;
    }
  },
  //设置牌点
  setCardPoint: function setCardPoint(point) {
    Log.Trace('[setCardPoint] point: ' + point + ', frontSuit: ' + this.frontSuit);
    this.point = point;
    var assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");

    if (this.frontSuit == 0) {
      this.frontCard = assetMgr.cards0[point];
    } else if (this.frontSuit == 1) {
      this.frontCard = assetMgr.cards1[point];
    } else if (this.frontSuit == 2) {
      this.frontCard = assetMgr.cards2[point];
    } else if (this.frontSuit == 3) {
      this.frontCard = assetMgr.cards3[point];
    }
  },
  getCardPoint: function getCardPoint() {
    return this.point;
  },
  //设置正面朝上还是背面朝上
  setFaceUp: function setFaceUp(faceUp) {
    var cardface = this.card.getComponent(cc.Sprite);

    if (faceUp) {
      cardface.spriteFrame = this.frontCard;
    } else {
      cardface.spriteFrame = this.backCard;
    }
  },
  //从背面往正面翻牌，传入原始scale大小
  flipCard: function flipCard(dstv2, scale) {
    this.card.stopAllActions();
    this.card.angle = 0;
    this.card.setPosition(cc.v2(0, 0));
    this.card.scale = 1;
    var cardface = this.card.getComponent(cc.Sprite);
    cardface.spriteFrame = this.backCard;
    var dstpos = this.card.parent.convertToNodeSpaceAR(dstv2);
    Log.Trace('[poker.flipCard] dstv2: ' + dstv2 + ', dstpos: ' + dstpos);
    var scaleX = scale;
    var scaleY = scale;
    this.card.setPosition(dstpos);
    this.card.opacity = 255;
    this.card.scale = scale;
    var backEnd = cc.callFunc(function () {
      cardface.spriteFrame = this.frontCard;
    }, this);
    this.card.runAction(cc.sequence(cc.delayTime(0.025), cc.scaleTo(this.dealCardDuration, 0.1 * scaleX, scaleY), backEnd, cc.scaleTo(this.dealCardDuration, scaleX, scaleY)));
    this.card.active = true;
  },
  //恢复发牌，从原始位置到终点位置，终点角度，原始scale大小和终点scale大小
  recoverDealCard: function recoverDealCard(dstv2, dstAngle, dstScale) {
    var cardface = this.card.getComponent(cc.Sprite);
    cardface.spriteFrame = this.backCard;
    var dstpos = this.card.parent.convertToNodeSpaceAR(dstv2);
    Log.Trace('[poker.recoverDealCard] dst: ' + dstpos);
    this.card.setPosition(dstpos);
    this.card.angle = dstAngle;
    this.card.opacity = 255;
    this.card.scale = dstScale;
    this.card.active = true;
  },
  //发牌，从原始位置到终点位置，终点角度，原始scale大小和终点scale大小
  dealCard: function dealCard(srcv2, dstv2, dstAngle, srcScale, dstScale) {
    this.card.stopAllActions();
    this.card.angle = 0;
    this.card.setPosition(cc.v2(0, 0));
    this.card.scale = 1;
    var cardface = this.card.getComponent(cc.Sprite);
    cardface.spriteFrame = this.backCard;
    cc.dgame.audioMgr.playDealCard();
    var srcpos = this.card.parent.convertToNodeSpaceAR(srcv2);
    var dstpos = this.card.parent.convertToNodeSpaceAR(dstv2);
    Log.Trace('[poker.dealCard] src: ' + srcpos + ', dst: ' + dstpos);
    this.card.setPosition(srcpos);
    this.card.angle = 0;
    this.card.opacity = 0;
    this.card.scale = srcScale;
    this.card.runAction(cc.spawn(cc.fadeIn(this.dealCardDuration), cc.rotateBy(this.dealCardDuration, 360 + dstAngle), cc.moveTo(this.dealCardDuration, dstpos), cc.scaleTo(this.dealCardDuration, dstScale)));
    this.card.active = true;
  },
  //弃牌，从原始位置到终点位置，原始角度，原始scale大小和终点scale大小
  foldCard: function foldCard(srcv2, dstv2, srcAngle, srcScale, dstScale) {
    this.card.stopAllActions();
    this.card.angle = 0;
    this.card.setPosition(cc.v2(0, 0));
    this.card.scale = 1;
    var cardface = this.card.getComponent(cc.Sprite);
    cardface.spriteFrame = this.backCard;
    var srcpos = this.card.parent.convertToNodeSpaceAR(srcv2);
    var dstpos = this.card.parent.convertToNodeSpaceAR(dstv2);
    this.card.setPosition(srcpos);
    this.card.angle = srcAngle;
    this.card.opacity = 255;
    this.card.scale = srcScale;
    this.card.runAction(cc.spawn(cc.fadeOut(this.dealCardDuration), cc.moveTo(this.dealCardDuration, dstpos), cc.scaleTo(this.dealCardDuration, dstScale)));
    this.card.active = true;
  },
  //牌面灰掉
  disable: function disable() {
    this.blackMask.active = true;
  },
  //牌面恢复
  enable: function enable() {
    this.blackMask.active = false;
  },
  //Allin
  playAllin: function playAllin() {
    this.allinFrame.active = true;
  },
  stopAllin: function stopAllin() {
    this.allinFrame.active = false;
  } // update (dt) {},

});

cc._RF.pop();