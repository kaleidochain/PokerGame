"use strict";
cc._RF.push(module, '695a4I5p+ZF/J2necRqQG+F', 'AccountList');
// scripts/Wallet/AccountList.js

"use strict";

cc.Class({
  "extends": cc.Component,
  properties: {
    scrollView: cc.ScrollView,
    prefabAccountItem: cc.Prefab,
    accountNum: 0
  },
  // use this for initialization
  onLoad: function onLoad() {
    this.content = this.scrollView.content; //this.populateList();
  },
  populateList: function populateList(data) {
    this.content.removeAllChildren();

    for (var i in data) {
      var accountInfo = {};
      accountInfo.Index = i;
      accountInfo.Addr = data[i].Addr;
      accountInfo.Nickname = data[i].Nickname;
      var item = cc.instantiate(this.prefabAccountItem);
      item.getComponent('AccountItem').init(accountInfo);
      this.content.addChild(item);
    }

    var accountInfo = {};
    accountInfo.Index = data.length;
    accountInfo.Newaccount = true;
    var item = cc.instantiate(this.prefabAccountItem);
    item.getComponent('AccountItem').init(accountInfo);
    this.content.addChild(item);
  },
  updateSelection: function updateSelection() {
    for (var i in this.content.getChildren()) {
      var item = this.content.getChildren()[i].getComponent("AccountItem");
      item.updateSelection();
    }
  },
  // called every frame
  update: function update(dt) {}
});

cc._RF.pop();