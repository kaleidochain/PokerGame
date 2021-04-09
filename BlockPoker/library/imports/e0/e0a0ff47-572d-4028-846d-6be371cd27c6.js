"use strict";
cc._RF.push(module, 'e0a0f9HVy1AKIRta+NxzSfG', 'ResultPlayerItem');
// scripts/Game/ResultPlayerItem.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    rank: cc.Label,
    playerName: cc.Label,
    win: cc.Label,
    buyinNum: cc.Label,
    avator: cc.Sprite,
    myselfMark: cc.Node
  },
  // use this for initialization
  init: function init(rank, data) {
    Log.Trace("ResultPlayerItem init rank:" + rank + " data:" + data);
    this.rank.string = rank;
    this.playerName.string = data[0].substr(2, 8);

    if (cc.dgame.settings.account.Addr == data[0]) {
      this.myselfMark.active = true;
    } else {
      this.myselfMark.active = false;
    }

    var assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");
    var idx = parseInt(data[0].substr(2, 2), 16);

    if (isNaN(idx)) {
      idx = 0;
    }

    this.avator.spriteFrame = assetMgr.heads[idx % 200];

    if (data[1] > 0) {
      this.win.string = "+" + data[1];
      this.win.node.color = new cc.color(103, 208, 103, 255);
    } else if (data[1] < 0) {
      this.win.string = data[1];
      this.win.node.color = new cc.color(255, 110, 110, 255);
    } else {
      this.win.string = data[1];
    }

    this.buyinNum.string = data[2];
  },
  // called every frame
  update: function update(dt) {}
});

cc._RF.pop();