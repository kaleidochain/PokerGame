"use strict";
cc._RF.push(module, '81458xpKRRIRo+bu1PlrakQ', 'GameReviewPlayerList');
// scripts/Game/GameReviewPlayerList.js

"use strict";

cc.Class({
  "extends": cc.Component,
  properties: {
    scrollView: cc.ScrollView,
    prefabGameReviewPlayerItem: cc.Prefab,
    playerNum: 0
  },
  // use this for initialization
  onLoad: function onLoad() {
    this.content = this.scrollView.content; //this.populateList();
  },
  populateList: function populateList(data) {
    this.content.removeAllChildren();

    for (var i in data) {
      var playerInfo = {};
      playerInfo.Nickname = data[i].Nickname;
      playerInfo.Addr = data[i].Addr;
      playerInfo.HoleCards = data[i].HoleCards;
      playerInfo.RMTCommunityCards = data[i].RMTCommunityCards;
      playerInfo.WinLoss = data[i].WinLoss;
      playerInfo.CardType = data[i].CardType;
      var item = cc.instantiate(this.prefabGameReviewPlayerItem);
      item.getComponent('GameReviewPlayerItem').init(playerInfo);
      this.content.addChild(item);
    }
  },
  // called every frame
  update: function update(dt) {}
});

cc._RF.pop();