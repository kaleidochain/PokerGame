"use strict";
cc._RF.push(module, '8f556a+wKBFcrzoyoLiJcrH', 'NormalLoading');
// scripts/components/NormalLoading.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    _normalLoadingLayer: cc.Node,
    _loadingTips: cc.Node,
    _loadTimeoutTips: cc.Node
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    if (!cc.dgame) {
      return;
    }

    this._normalLoadingLayer = cc.find("Canvas/NormalLoadingLayer");
    this._loadingTips = cc.find("Canvas/NormalLoadingLayer/LoadingTips");
    this._loadTimeoutTips = cc.find("Canvas/NormalLoadingLayer/LoadTimeoutTips");
    cc.dgame.utils.addClickEvent(cc.find("Canvas/NormalLoadingLayer/LoadTimeoutTips/btnOK"), this.node, "NormalLoading", "onBtnOKClicked");
    cc.dgame.normalLoading = this;
  },
  startInvokeWaiting: function startInvokeWaiting() {
    this._normalLoadingLayer.active = true;
    this._loadingTips.active = true;
    this._loadTimeoutTips.active = false;
    this.scheduleOnce(this._loadTimeout, 10);
  },
  stopInvokeWaiting: function stopInvokeWaiting() {
    this.unschedule(this._loadTimeout);
    this._normalLoadingLayer.active = false;
  },
  showLoadTimeout: function showLoadTimeout() {
    this._normalLoadingLayer.active = true;
    this._loadingTips.active = false;
    this._loadTimeoutTips.active = true;
  },
  _loadTimeout: function _loadTimeout() {
    this._loadingTips.active = false;
    this._loadTimeoutTips.active = true;
  },
  onBtnOKClicked: function onBtnOKClicked() {
    this.stopInvokeWaiting();
  },
  start: function start() {},
  onDestroy: function onDestroy() {
    this.unschedule(this._loadTimeout);

    if (!!cc.dgame) {
      cc.dgame.normalLoading = null;
    }
  } // update (dt) {},

});

cc._RF.pop();