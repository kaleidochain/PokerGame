"use strict";
cc._RF.push(module, 'd2e061wo3JFU6ECHj041bQt', 'TableResultPlayerItem');
// scripts/Game/TableResultPlayerItem.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    avator: cc.Sprite,
    playerName: cc.Label,
    buyIn: cc.Label,
    win: cc.Label
  },
  init: function init(data) {
    Log.Trace("TableResultPlayerItem data" + JSON.stringify(data));
    var assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");
    var idx = parseInt(data[0].substr(2, 2), 16);

    if (isNaN(idx)) {
      idx = 0;
    }

    this.avator.spriteFrame = assetMgr.heads[idx % 200];
    this.playerName.string = data[0].substr(2, 8);

    if (cc.dgame.settings.account.Addr == data[0]) {
      this.playerName.node.color = new cc.color(114, 237, 255, 255);
    } else {
      this.playerName.node.color = new cc.color(48, 118, 165, 255);
    }

    if (parseFloat(data[1]) > 0) {
      this.win.string = "+" + data[1];
      this.win.node.color = new cc.color(103, 208, 103, 255);
    } else {
      this.win.string = data[1];

      if (parseFloat(data[1]) == 0) {
        this.win.node.color = new cc.color(255, 255, 255, 255);
      } else {
        this.win.node.color = new cc.color(255, 110, 110, 255);
      }
    }

    this.buyIn.string = data[2];
  },
  // called every frame
  update: function update(dt) {}
});

cc._RF.pop();