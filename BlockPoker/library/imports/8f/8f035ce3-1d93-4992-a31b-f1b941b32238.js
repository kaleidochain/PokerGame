"use strict";
cc._RF.push(module, '8f035zjHZNJkqMb8blBsyI4', 'HeaderBar');
// scripts/components/HeaderBar.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    _batteryPercentage: cc.Label,
    _batteryPercentageImage: cc.Node
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    if (!cc.dgame) {
      return;
    }

    this._batteryPercentage = cc.find("Canvas/HeaderBar/BatteryArea/batteryPercentage").getComponent(cc.Label);
    this._batteryPercentageImage = cc.find("Canvas/HeaderBar/BatteryArea/power_01/power_02");
    this._timeLabel = cc.find("Canvas/HeaderBar/SignalArea/time").getComponent(cc.Label);
    this.schedule(this._updateBattery, 60);
    this.schedule(this._updateTime, 1);

    this._updateBattery();

    this._updateTime();

    cc.dgame.headerBar = this;
  },
  onDestroy: function onDestroy() {
    if (!!cc.dgame) {
      cc.dgame.headerBar = null;
    }
  },
  _updateBattery: function _updateBattery() {
    var percentage = 100;

    if (cc.sys.isNative) {
      if (cc.sys.isMobile) {
        if (cc.sys.os === cc.sys.OS_IOS) {
          percentage = jsb.reflection.callStaticMethod("NativeGengine", "getBatteryPercentage");
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
          percentage = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getBatteryPercentage", "()I");
        }
      }
    }

    this._batteryPercentage.string = percentage + "%";
    this._batteryPercentageImage.width = 55 * percentage / 100;
  },
  _updateTime: function _updateTime() {
    var date = new Date();
    var h = date.getHours();
    h = h < 10 ? "0" + h : h;
    var m = date.getMinutes();
    m = m < 10 ? "0" + m : m;
    var s = date.getSeconds();
    s = s < 10 ? "0" + s : s;
    this._timeLabel.string = "" + h + ":" + m + ":" + s;
  },
  start: function start() {} // update (dt) {},

});

cc._RF.pop();