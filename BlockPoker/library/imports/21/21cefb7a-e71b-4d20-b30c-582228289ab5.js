"use strict";
cc._RF.push(module, '21ceft65xtNILMMWCIoKJq1', 'SecurityInfoList');
// scripts/Game/SecurityInfoList.js

"use strict";

cc.Class({
  "extends": cc.Component,
  properties: {
    scrollView: cc.ScrollView,
    prefabSecurityInfoItem: cc.Prefab
  },
  // use this for initialization
  onLoad: function onLoad() {
    this.content = this.scrollView.content; //this.populateList();
  },
  addTips: function addTips(tips) {
    var item = cc.instantiate(this.prefabSecurityInfoItem);
    item.getComponent("SecurityInfoItem").init(tips);
    this.content.addChild(item);
    this.scrollView.scrollToTop();
  },
  populateList: function populateList(data) {
    this.content.removeAllChildren();

    for (var i in data) {
      var item = cc.instantiate(this.prefabSecurityInfoItem);
      item.getComponent("SecurityInfoItem").init(data[i]);
      this.content.addChild(item);
    }

    this.scrollView.scrollToTop();
  },
  clear: function clear() {
    this.content.removeAllChildren();
  },
  // called every frame
  update: function update(dt) {}
});

cc._RF.pop();