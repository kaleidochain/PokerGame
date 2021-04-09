"use strict";
cc._RF.push(module, '21370q8Qj1GdbcS5JkfLUAj', 'ResultPlayersList');
// scripts/Game/ResultPlayersList.js

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
    Log.Trace("ResultPlayersList populateList");
    this.content.removeAllChildren();
    var rank = 0;

    for (var i in result) {
      var item = cc.instantiate(this.prefabResultPlayerItem);
      rank = rank + 1;
      item.getComponent('ResultPlayerItem').init(rank, result[i]);
      this.content.addChild(item);
    }

    this.scrollView.scrollToTop();
  },
  // called every frame
  update: function update(dt) {}
});

cc._RF.pop();