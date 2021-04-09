"use strict";
cc._RF.push(module, '9f75d52JM9EqZWYrJbF6hKl', 'GameRequestItem');
// scripts/Game/GameRequestItem.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    tableInfoLayer: cc.Node,
    requestLayer: cc.Node,
    resultLayer: cc.Node,
    fulltableid: cc.Label,
    creatorAddr: cc.Label,
    requestAvator: cc.Sprite,
    requestAccountAddr: cc.Label,
    requestBuyinNum: cc.Label,
    resultAvator: cc.Sprite,
    resultAccountAddr: cc.Label,
    resultBuyinNum: cc.Label,
    result: cc.Label
  },
  // use this for initialization
  init: function init(gameRequest) {
    Log.Trace("gameRequest: " + JSON.stringify(gameRequest));

    if (gameRequest.Type == "TableInfo") {
      this.tableInfoLayer.active = true;
      this.requestLayer.active = false;
      this.resultLayer.active = false;
      this.creatorAddr.string = gameRequest.CreatorAddr.substr(2, 8);
      var clubid = Math.floor(parseFloat(gameRequest.TableId) / 0x10000000);
      var tableid = parseFloat(gameRequest.TableId) - clubid * 0x10000000;
      this.fulltableid.string = clubid + " - ";

      if (tableid < 10) {
        this.fulltableid.string += '00' + tableid.toString();
      } else if (tableid < 100) {
        this.fulltableid.string += '0' + tableid.toString();
      } else {
        this.fulltableid.string += this.tableid.toString();
      }
    } else if (gameRequest.Type == "Request") {
      this.tableInfoLayer.active = false;
      this.requestLayer.active = true;
      this.resultLayer.active = false;
      var assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");
      var idx = parseInt(gameRequest.Addr.substr(2, 2), 16);

      if (isNaN(idx)) {
        idx = 0;
      }

      this.requestAvator.spriteFrame = assetMgr.heads[idx % 200];
      this.requestAccountAddr.string = gameRequest.Addr.substr(2, 8);
      this.requestBuyinNum.string = gameRequest.BuyinNum;
      this.accountAddr = gameRequest.Addr;
    } else if (gameRequest.Type == "Result") {
      this.tableInfoLayer.active = false;
      this.requestLayer.active = false;
      this.resultLayer.active = true;

      var _assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");

      var idx = parseInt(gameRequest.Addr.substr(2, 2), 16);

      if (isNaN(idx)) {
        idx = 0;
      }

      this.resultAvator.spriteFrame = _assetMgr.heads[idx % 200];
      this.resultAccountAddr.string = gameRequest.Addr.substr(2, 8);
      this.resultBuyinNum.string = gameRequest.BuyinNum;
      this.result.string = gameRequest.Sender.substr(2, 8);

      if (gameRequest.Result == 1) {
        this.result.string += " Approved";
      } else {
        this.result.string += " Denied";
      }
    }
  },
  // called every frame
  update: function update(dt) {},
  approve: function approve() {
    Log.Trace("[approve] scene: " + cc.director.getScene().name);
    var gameRequestMgr = cc.find(cc.director.getScene().name).getComponent("GameRequestMgr");
    gameRequestMgr.approve(this.accountAddr);
  },
  deny: function deny() {
    var gameRequestMgr = cc.find(cc.director.getScene().name).getComponent("GameRequestMgr");
    gameRequestMgr.deny(this.accountAddr);
  }
});

cc._RF.pop();