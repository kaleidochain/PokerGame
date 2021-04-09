"use strict";
cc._RF.push(module, 'f0b6ckF9aVHCYjq53WevV5R', 'ResultItem');
// scripts/Game/ResultItem.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    tableId: cc.Label,
    endTime: cc.Label,
    creatorName: cc.Label,
    blindInfo: cc.Label,
    chipsInfo: cc.Label,
    winAmount: cc.Label,
    avator: cc.Sprite,
    date: cc.Label
  },
  // use this for initialization
  init: function init(tableInfo) {
    Log.Trace("ResulItem init tableInfo:" + JSON.stringify(tableInfo));
    this.tableInfo = tableInfo;
    var clubid = Math.floor(tableInfo.TableId / 0x10000000);
    var displayTableId = tableInfo.TableId - clubid * 0x10000000;
    this.tableId.string = clubid + "-";

    if (displayTableId < 10) {
      this.tableId.string += '00' + displayTableId;
    } else if (displayTableId < 100) {
      this.tableId.string += '0' + displayTableId;
    } else {
      this.tableId.string += displayTableId;
    }

    this.endTime.string = cc.dgame.utils.timestampToHourMin(tableInfo.EndTime * 1000);
    this.creatorName.string = tableInfo.CreatorAddr.substr(2, 8);
    var assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");
    var idx = parseInt(tableInfo.CreatorAddr.substr(2, 2), 16);

    if (isNaN(idx)) {
      idx = 0;
    }

    this.avator.spriteFrame = assetMgr.heads[idx % 200];
    this.blindInfo.string = cc.dgame.utils.formatValue(tableInfo.SmallBlind) + "/" + cc.dgame.utils.formatValue(tableInfo.SmallBlind * 2).toString();

    if (tableInfo.Straddle !== 0) {
      this.blindInfo.string += "/" + cc.dgame.utils.formatValue(tableInfo.SmallBlind * 4).toString();
    }

    if (tableInfo.Ante > 0) {
      this.blindInfo.string += "(" + tableInfo.Ante + ")";
    }

    this.chipsInfo.string = cc.dgame.utils.formatValue(tableInfo.BuyinMin).toString() + "/" + cc.dgame.utils.formatValue(tableInfo.BuyinMax).toString();

    if (tableInfo.Win != undefined) {
      this.winAmount.string = tableInfo.Win;
    } else {
      this.winAmount.string = "0";
    }
  },
  initTime: function initTime(date) {
    var dateObj = new Date(date);
    var timeList = dateObj.toDateString().split(" ");
    this.date.string = timeList[2] + " " + timeList[1];
  },
  // called every frame
  update: function update(dt) {},
  selectSingleResult: function selectSingleResult() {
    Log.Trace("selectSingleResult1111");
    var resultHall = cc.find('Result').getComponent('ResultHall');
    Log.Trace("resultHall" + resultHall);
    resultHall.onBtnClickSingleResult(this.tableInfo.TableId);
  }
});

cc._RF.pop();