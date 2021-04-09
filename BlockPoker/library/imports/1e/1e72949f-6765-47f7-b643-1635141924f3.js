"use strict";
cc._RF.push(module, '1e729SfZ2VH97ZDFjUUGSTz', 'OperationTips');
// scripts/components/OperationTips.js

"use strict";

var Log = require('Log');

cc.Class({
  "extends": cc.Component,
  properties: {
    _tipsLayer: cc.Node,
    _tipsBackground: cc.Node,
    _tips: cc.RichText,
    _reconnectTipsLayer: cc.Node,
    _reconnectTipsBackGround: cc.Node,
    _reconnectTipsLabel: cc.Label
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    if (!cc.dgame) {
      return;
    }

    this._tipsLayer = cc.find("Canvas/TipsLayer");
    this._tipsBackground = cc.find("Canvas/TipsLayer/bg_tips");
    this._tips = cc.find("Canvas/TipsLayer/bg_tips/richtext").getComponent(cc.RichText);
    this._reconnectTipsLayer = cc.find("Canvas/ReconnectTipsLayer");

    if (this._reconnectTipsLayer != null) {
      this._reconnectTipsBackGround = cc.find("Canvas/ReconnectTipsLayer/bg_reconnect_tips");
      this._reconnectTipsLabel = cc.find("Canvas/ReconnectTipsLayer/bg_reconnect_tips/label").getComponent(cc.Label);
    }

    cc.dgame.tips = this;
  },
  showTips: function showTips(tips, height) {
    if (!height) {
      height = 0.5;
    }

    this._tipsLayer.stopAllActions();

    this._tips.string = cc.dgame.utils.formatRichText(tips, "#AFC6DD", true, false);

    if (this._tips.node.width + 40 > 426) {
      this._tipsBackground.width = this._tips.node.width + 200;
      var pos = cc.v2(cc.winSize.width / 2, cc.winSize.height * height);

      this._tipsBackground.setPosition(this._tipsBackground.parent.convertToNodeSpaceAR(pos));
    }

    this._tipsLayer.opacity = 255;
    this._tipsLayer.active = true;

    this._tipsLayer.runAction(cc.sequence(cc.delayTime(1.5), cc.fadeOut(1), cc.callFunc(function () {
      this._tipsBackground.setPosition(0, 0);

      this._tipsBackground.width = 426;
      this._tipsLayer.active = false;
    }, this)));
  },
  showReConnecttingTips: function showReConnecttingTips() {
    Log.Trace('[showReConnecttingTips] this._reconnectTipsLayer: ' + this._reconnectTipsLayer);

    if (this._reconnectTipsLayer == null) {
      return;
    }

    this._reconnectTipsLayer.stopAllActions();

    this._reconnectTipsLabel.string = "Reconnecting...";
    this.resizeBackGround();
    this._reconnectTipsLayer.opacity = 255;
    this._reconnectTipsLayer.active = true;
    cc.dgame.utils.tipsCarousel(this._reconnectTipsLayer, this._reconnectTipsLabel, "Reconnecting", 1);
    Log.Trace('[showReConnecttingTips]');
  },
  showReConnectSuccessTips: function showReConnectSuccessTips() {
    Log.Trace('[showReConnectSuccessTips] this._reconnectTipsLayer: ' + this._reconnectTipsLayer);
    cc.dgame.normalLoading.onBtnOKClicked();

    if (this._reconnectTipsLayer == null) {
      return;
    }

    this._reconnectTipsLabel.string = "Reconnected successfully";

    this._reconnectTipsLayer.stopAllActions();

    this.resizeBackGround();
    this._reconnectTipsLayer.active = true;

    this._reconnectTipsLayer.runAction(cc.sequence(cc.delayTime(1.5), cc.fadeOut(1)));

    Log.Trace('[showReConnectSuccessTips]');
  },
  resizeBackGround: function resizeBackGround() {
    this._reconnectTipsLabel.overflow = cc.Label.Overflow.NONE;

    this._reconnectTipsLabel.node.setContentSize(new cc.Size(0, 42));

    this._reconnectTipsLabel._forceUpdateRenderData();

    var textWidth = Math.min(this._reconnectTipsLabel.node.width, 450);
    textWidth = Math.round(textWidth / 30) * 30;
    this._reconnectTipsLabel.overflow = cc.Label.Overflow.RESIZE_HEIGHT;

    this._reconnectTipsLabel.node.setContentSize(new cc.Size(textWidth, 0));

    this._reconnectTipsLabel._forceUpdateRenderData();

    var textHeight = this._reconnectTipsLabel.node.height;
    this._reconnectTipsLabel.node.width = textWidth;
    this._reconnectTipsLabel.node.height = textHeight;
    this._reconnectTipsBackGround.parent.active = true;
    this._reconnectTipsBackGround.width = this._reconnectTipsLabel.node.width + 60;
    this._reconnectTipsBackGround.height = this._reconnectTipsLabel.node.height + 15;
  },
  start: function start() {},
  onDestroy: function onDestroy() {
    if (!!cc.dgame) {
      cc.dgame.tips = null;
    }
  } // update (dt) {},

});

cc._RF.pop();