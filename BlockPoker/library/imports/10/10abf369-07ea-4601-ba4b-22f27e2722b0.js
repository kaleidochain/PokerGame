"use strict";
cc._RF.push(module, '10abfNpB+pGAbpLIvJ+JyKw', 'GameReviewGameList');
// scripts/Game/GameReviewGameList.js

"use strict";

cc.Class({
  "extends": cc.Component,
  properties: {
    scrollView: cc.ScrollView,
    prefabGameReviewGameItem: cc.Prefab
  },
  // use this for initialization
  onLoad: function onLoad() {
    this.content = this.scrollView.content; //this.populateList();
  },
  populateList: function populateList(data) {
    this.content.removeAllChildren();

    for (var i = 0; i < data.length; i++) {
      var gameInfo = {};
      gameInfo.Index = i;
      gameInfo.GameItemTips = false;
      gameInfo.HoleCards = data[i].HoleCards;
      gameInfo.CommunityCards = data[i].CommunityCards;
      gameInfo.WinLoss = data[i].WinLoss;
      gameInfo.CardType = data[i].CardType;
      gameInfo.TableId = data[i].TableId;
      gameInfo.FullTableId = data[i].FullTableId;
      gameInfo.Hand = data[i].Hand;
      gameInfo.GameTime = data[i].GameTime;
      var item = cc.instantiate(this.prefabGameReviewGameItem);
      item.getComponent('GameReviewGameItem').init(gameInfo);
      this.content.addChild(item);
    }

    var gameInfo = {};
    gameInfo.Index = data.length;
    gameInfo.GameItemTips = true;
    var item = cc.instantiate(this.prefabGameReviewGameItem);
    item.getComponent('GameReviewGameItem').init(gameInfo);
    this.content.addChild(item);
    this.scrollView.scrollToTop();
  },
  // called every frame
  update: function update(dt) {}
});

cc._RF.pop();