"use strict";
cc._RF.push(module, '7a356q+w2RK7YOX3lvB81Gq', 'Promotion');
// scripts/components/Promotion.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {},
  // LIFE-CYCLE CALLBACKS:
  // onLoad () {},
  _onGiveMeToken: function _onGiveMeToken(data) {
    Log.Trace('[_onGiveMeToken] ' + JSON.stringify(data));
  },
  giveMeToken: function giveMeToken() {
    if (!cc.dgame) {
      return;
    }

    cc.dgame.net.gameCall(["givemetoken", ""], this._onGiveMeToken.bind(this));
  },
  start: function start() {} // update (dt) {},

});

cc._RF.pop();