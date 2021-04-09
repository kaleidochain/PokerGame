"use strict";
cc._RF.push(module, '8180exC8PlL5LATfp1VgmYR', 'GametableList');
// scripts/Game/GametableList.js

"use strict";

cc.Class({
  "extends": cc.Component,
  properties: {
    scrollView: cc.ScrollView,
    prefabGametableItem: cc.Prefab,
    gametableNum: 0
  },
  // use this for initialization
  onLoad: function onLoad() {
    this.content = this.scrollView.content; //this.populateList();
  },
  populateList: function populateList(data) {
    this.content.removeAllChildren();

    for (var i in data) {
      var tableInfo = {};
      tableInfo.Index = i;
      tableInfo.TableId = data[i].TableId;
      tableInfo.DisplayTableId = data[i].DisplayTableId;
      tableInfo.Ante = data[i].Ante;
      tableInfo.PlayerNum = data[i].PlayerNum;
      tableInfo.MaxNum = data[i].MaxNum;
      tableInfo.Status = data[i].CurrentStatu;
      tableInfo.SmallBlind = data[i].SmallBlind;
      tableInfo.Straddle = data[i].Straddle;
      tableInfo.BuyinMin = data[i].BuyinMin;
      tableInfo.BuyinMax = data[i].BuyinMax;
      tableInfo.Type = data[i].Type;
      var item = cc.instantiate(this.prefabGametableItem);
      item.getComponent('GametableItem').init(tableInfo);
      this.content.addChild(item);
    }

    this.scrollView.scrollToTop();
  },
  selectGameTable: function selectGameTable(tableId) {
    for (var i in this.content.getChildren()) {
      var item = this.content.getChildren()[i].getComponent("GametableItem");

      if (tableId == item.tableInfo.TableId) {
        item.selectGametable();
        return;
      }
    }
  },
  // called every frame
  update: function update(dt) {}
});

cc._RF.pop();