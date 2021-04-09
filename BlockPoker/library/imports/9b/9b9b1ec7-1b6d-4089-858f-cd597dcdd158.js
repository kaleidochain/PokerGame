"use strict";
cc._RF.push(module, '9b9b17HG21AiYWPzVl9zdFY', 'TableResultPlayersList');
// scripts/Game/TableResultPlayersList.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    scrollView: cc.ScrollView,
    prefabResultPlayerItem: cc.Prefab
  },
  // use this for initialization
  onLoad: function onLoad() {
    this.content = this.scrollView.content;
  },
  populateList: function populateList(result) {
    // Log.Trace("TableResultPlayersList populateList result:"  + JSON.stringify(result));
    var INSNode = cc.instantiate(this.content.children[0]);
    this.content.removeAllChildren();
    this.content.addChild(INSNode);

    for (var i in result) {
      var item = cc.instantiate(this.prefabResultPlayerItem);
      item.getComponent('TableResultPlayerItem').init(result[i]);
      this.content.addChild(item);
    }

    this.scrollView.scrollToTop();
  },
  // called every frame
  update: function update(dt) {}
});

cc._RF.pop();