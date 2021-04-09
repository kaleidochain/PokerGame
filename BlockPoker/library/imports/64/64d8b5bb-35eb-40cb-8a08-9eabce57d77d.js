"use strict";
cc._RF.push(module, '64d8bW7NetAy4oInqvOV9d9', 'ClubApplicationItem');
// scripts/Game/ClubApplicationItem.js

"use strict";

cc.Class({
  "extends": cc.Component,
  properties: {
    accountAddr: cc.Label,
    applyDate: cc.Label,
    avator: cc.Sprite
  },
  // use this for initialization
  init: function init(sceneName, clubid, applicationInfo) {
    var assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");
    var idx = parseInt(applicationInfo.Addr.substr(2, 2), 16);

    if (isNaN(idx)) {
      idx = 0;
    }

    this.sceneName = sceneName;
    this.clubid = clubid;
    this.avator.spriteFrame = assetMgr.heads[idx % 200];
    this.addr = applicationInfo.Addr;
    this.accountAddr.string = applicationInfo.Addr.substr(0, 10) + "...";
    this.applyDate.string = cc.dgame.utils.timestampToTime(applicationInfo.Date * 1000);
  },
  // called every frame
  update: function update(dt) {},
  approve: function approve() {
    if (this.sceneName == "ClubHall") {
      var clubHall = cc.find("ClubHall").getComponent("ClubHall");
      clubHall.approve(this.clubid, this.addr);
    } else {
      var clubRequestMgr = cc.find(this.sceneName).getComponent("ClubRequestMgr");
      clubRequestMgr.approve(this.clubid, this.addr);
    }
  },
  deny: function deny() {
    if (this.sceneName == "ClubHall") {
      var clubHall = cc.find("ClubHall").getComponent("ClubHall");
      clubHall.deny(this.clubid, this.addr);
    } else {
      var clubRequestMgr = cc.find(this.sceneName).getComponent("ClubRequestMgr");
      clubRequestMgr.deny(this.clubid, this.addr);
    }
  }
});

cc._RF.pop();