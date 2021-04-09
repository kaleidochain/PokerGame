"use strict";
cc._RF.push(module, '49786FnUMpCZrSZwMpfJuHa', 'ExchangeRate');
// scripts/components/ExchangeRate.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {},
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    if (!cc.dgame) {
      return;
    }

    cc.dgame.exchangeRate = this;
  },
  startCheckExchangeRate: function startCheckExchangeRate() {
    this._getExchangeRate();

    this.schedule(this._getExchangeRate, 60);
  },
  _onExchangeRate: function _onExchangeRate(data) {
    Log.Trace('[_onExchangeRate] ' + data);

    if (data == "Network disconnected") {
      cc.dgame.normalLoading.showLoadTimeout();
      return;
    }

    cc.dgame.settings.exchangeRate = parseFloat(data) / 1e18;
  },
  _getExchangeRate: function _getExchangeRate() {
    Log.Trace("onExchangeRateTimer");
    cc.dgame.net.gameCall(["rate", ""], this._onExchangeRate.bind(this));
  },
  start: function start() {},
  onDestroy: function onDestroy() {
    this.unschedule(this._getExchangeRate);

    if (!!cc.dgame) {
      cc.dgame.exchangeRate = null;
    }
  } // update (dt) {},

});

cc._RF.pop();