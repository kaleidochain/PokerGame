"use strict";
cc._RF.push(module, '2a0d0437PNMtbBjsfnH7dv6', 'GameReviewGameItem');
// scripts/Game/GameReviewGameItem.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    pokerPrefab: cc.Prefab,
    background: cc.Node,
    gameitem: cc.Node,
    winloss: cc.RichText,
    cardtype: cc.Label,
    roomID: cc.Label,
    gameTime: cc.Label,
    holecards: [cc.Node],
    communitycards: [cc.Node],
    gameitemTips: cc.Node // ...

  },
  // use this for initialization
  // {"TableId":"Free003","Hand":1,"BlindInfo":"100/200","Pot":3600,"GameTime":"2019-08-27 17:37:45","PlayerInfo":[{"Addr":"0x0FB5dA2aF89CCB269421E9bB1EfCc1D915F871dF","HoleCards":[27,41],"DeskCards":[19,7,46,5,40],"CardType":"Two pairs","WinLoss":-1800},{"Addr":"0x8E03bA3326c7c38217A80cfa68A23cEca2e1d556","HoleCards":[24,33],"DeskCards":[19,7,46,5,40],"CardType":"Three of a kind","WinLoss":1800}],"HoleCards":[24,33],"CommunityCards":[19,7,46,5,40],"GameItemTips":false}
  init: function init(gameInfo) {
    Log.Trace("[GameReviewGameItem:init] " + JSON.stringify(gameInfo));

    if (gameInfo.Index % 2 == 0) {
      this.background.opacity = 0;
    }

    if (gameInfo.GameItemTips) {
      this.gameitem.active = false;
      this.gameitemTips.active = true;
    } else {
      this.gameitem.active = true;
      this.gameitemTips.active = false;
      this.hand = gameInfo.Hand;
      this.tableid = gameInfo.TableId;
      this.roomID.string = gameInfo.FullTableId;
      this.gameTime.string = gameInfo.GameTime;

      if (!!gameInfo.CardType) {
        this.cardtype.string = gameInfo.CardType;
      } else {
        this.cardtype.string = "";
      }

      if (!!gameInfo.WinLoss) {
        var val = cc.dgame.utils.formatValue(Math.abs(gameInfo.WinLoss));

        if (gameInfo.WinLoss > 0) {
          this.winloss.string = cc.dgame.utils.formatRichText('+' + val, "#67D067", true, false);
        } else if (gameInfo.WinLoss == 0) {
          this.winloss.string = cc.dgame.utils.formatRichText(0, "#D6D6D6", true, false);
        } else {
          this.winloss.string = cc.dgame.utils.formatRichText('-' + val, "#FF6E6E", true, false);
        }
      } else {
        this.winloss.string = "";
      }

      for (var i = 0; i < 2; i++) {
        var cardNode = cc.instantiate(this.pokerPrefab);
        this.holecards[i].addChild(cardNode);
        var poker = cardNode.getComponent('Poker');
        poker.init(0, 0);

        if (gameInfo.HoleCards[i] != null && gameInfo.HoleCards[i] != undefined) {
          poker.setCardPoint(gameInfo.HoleCards[i]);
          poker.setFaceUp(true);
        } else {
          poker.setFaceUp(false);
        }
      }

      for (var _i = 0; _i < gameInfo.CommunityCards.length && _i < this.communitycards.length; _i++) {
        if (gameInfo.CommunityCards[_i] != null && gameInfo.CommunityCards[_i] != undefined) {
          var _cardNode = cc.instantiate(this.pokerPrefab);

          this.communitycards[_i].addChild(_cardNode);

          var _poker = _cardNode.getComponent('Poker');

          _poker.init(0, 0);

          _poker.setCardPoint(gameInfo.CommunityCards[_i]);

          _poker.setFaceUp(true);
        }
      }
    }
  },
  onBtnGameItemClicked: function onBtnGameItemClicked() {
    var boardRecords = cc.find('BoardRecords').getComponent('BoardRecords');

    if (this.gameitem.active) {
      boardRecords.review(this.roomID.string, this.hand, this.tableid);
    }
  },
  // called every frame
  update: function update(dt) {}
});

cc._RF.pop();