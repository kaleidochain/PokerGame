"use strict";
cc._RF.push(module, '0c209opzSdCyaKQXp7H2Jgh', 'GameReplayPopup');
// scripts/components/GameReplayPopup.js

"use strict";

var Log = require('Log');

var PositionData = require('PositionData');

var Types = require('Types');

cc.Class({
  "extends": cc.Component,
  properties: {
    //预制资源
    playerPrefab: cc.Prefab,
    //玩家预制资源
    pokerPrefab: cc.Prefab,
    //牌预制资源
    _gameReplayPopup: cc.Node,
    _btnPlay: cc.Node,
    _btnPause: cc.Node,
    _btnReplay: cc.Node,
    _btnPrevHand: cc.Node,
    _btnPrevMove: cc.Node,
    _btnNextMove: cc.Node,
    _btnNextHand: cc.Node,
    _replayPotLayer: cc.Node,
    _replayCurrentRoundPotNum: cc.RichText,
    //牌局回放本轮下注筹码与底池的总和，即总底池数
    _replaySidePots: [cc.Node],
    //牌局回放边池图层
    _replaySidePotNums: [cc.RichText],
    //牌局回放边池筹码数
    _replayTableFor4Layer: cc.Node,
    //牌局回放4人桌图层
    _replayPlayerAnchorsFor4: [cc.Node],
    //牌局回放4人桌各玩家位置
    _replayTableFor6Layer: cc.Node,
    //牌局回放8人桌图层
    _replayPlayerAnchorsFor6: [cc.Node],
    //牌局回放8人桌各玩家位置
    _replayTableFor8Layer: cc.Node,
    //牌局回放8人桌图层
    _replayPlayerAnchorsFor8: [cc.Node],
    //牌局回放8人桌各玩家位置
    _replayTableFor9Layer: cc.Node,
    //牌局回放9人桌图层
    _replayPlayerAnchorsFor9: [cc.Node],
    //牌局回放9人桌各玩家位置
    _replayCommunityCards: [cc.Node],
    //牌局回放公共牌
    _replayRMTCommunityCards1: [cc.Node],
    //牌局回放RMT第一副公共牌
    _replayRMTCommunityCards2: [cc.Node],
    //牌局回放RMT第二副公共牌
    _replayRMTCommunityCards3: [cc.Node],
    //牌局回放RMT第三副公共牌
    _replayRMTCommunityCards4: [cc.Node],
    //牌局回放RMT第四副公共牌
    _replayHighlightCommunityCards: [cc.Node],
    //牌局回放高亮公共牌
    _replayRMTOperateLayer: cc.Node,
    //牌局回放多牌领先者次数选择界面
    _replayRMTLeaderHead: cc.Sprite,
    //牌局回放多牌领先者头像
    _replayRMTLeaderAddr: cc.Label,
    //牌局回放多牌领先者地址
    _replayRMTTimesResults: [cc.Node],
    //牌局回放多牌次数结果
    _replayRMTResultTips: cc.Label,
    //牌局回放多牌次数结果界面
    _replayINSOperateLayer: cc.Node,
    //牌局回放保险选择界面
    _replayINSLeaderHead: cc.Sprite,
    //牌局回放保险领先者头像
    _replayINSLeaderAddr: cc.Label,
    //牌局回放保险领先者地址
    _replayINSOnePotLayer: cc.Node,
    //牌局回放只有主池的保险信息界面
    _replayINSTwoPotsLayer: cc.Node,
    //牌局回放主池边池的保险信息界面
    _replayINSFullPot: cc.Label,
    //牌局回放当前全部底池保费
    _replayINSSecure: cc.Label,
    //牌局回放保本保费
    _replayINSOnePotMainPotOuts: cc.Node,
    //牌局回放单个池主池Outs
    _replayINSOnePotPotNum: cc.Label,
    //牌局回放单个池底池金额
    _replayINSOnePotOdds: cc.Label,
    //牌局回放单个池底池Odds
    _replayINSOnePotOutsNum: cc.Label,
    //牌局回放单个池底池Outs
    _replayINSTwoPotsMainPotOuts: cc.Node,
    //牌局回放两个池主池Outs
    _replayINSTwoPotsMainPotNum: cc.Label,
    //牌局回放两个池主池金额
    _replayINSTwoPotsMainPotOdds: cc.Label,
    //牌局回放两个池主池Odds
    _replayINSTwoPotsMainPotOutsNum: cc.Label,
    //牌局回放两个池主池Outs
    _replayINSTwoPotsSidePotOuts: cc.Node,
    //牌局回放两个池边池Outs
    _replayINSTwoPotsSidePotNum: cc.Label,
    //牌局回放两个池边池金额
    _replayINSTwoPotsSidePotOdds: cc.Label,
    //牌局回放两个池边池Odds
    _replayINSTwoPotsSidePotOutsNum: cc.Label //牌局回放两个池边池Outs

  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    if (!cc.dgame) {
      return;
    }

    this._assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");
    this._gameReplayPopup = cc.find("Canvas/MenuLayer/GameReplayPopup");
    this._btnPlay = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnPlay", this._gameReplayPopup);
    this._btnPause = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnPause", this._gameReplayPopup);
    this._btnReplay = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnReplay", this._gameReplayPopup); // this._btnPrevHand = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnPrevHand", this._gameReplayPopup);

    this._btnFirstStep = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnFirstStep", this._gameReplayPopup);
    this._btnPrevMove = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnPrevMove", this._gameReplayPopup);
    this._btnNextMove = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnNextMove", this._gameReplayPopup); // this._btnNextHand = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnNextHand", this._gameReplayPopup);

    this._btnEndStep = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnEndStep", this._gameReplayPopup);
    this._replayCurrentRoundPot = cc.find("bg_replay_white/bg_replay_table/PotLayer/Pot", this._gameReplayPopup);
    this._replayCurrentRoundPotNum = cc.find("bg_replay_white/bg_replay_table/PotLayer/Pot/potNum", this._gameReplayPopup).getComponent(cc.RichText);
    this._replaySidePots = new Array();
    this._replaySidePotNums = new Array();

    for (var i = 0; i < 9; i++) {
      this._replaySidePots.push(cc.find("bg_replay_white/bg_replay_table/PotLayer/SidePotLayer/SidePot_" + (i + 1), this._gameReplayPopup));

      this._replaySidePotNums.push(cc.find("bg_replay_white/bg_replay_table/PotLayer/SidePotLayer/SidePot_" + (i + 1) + "/potNum", this._gameReplayPopup).getComponent(cc.RichText));
    }

    this._replayTableFor4Layer = cc.find("bg_replay_white/bg_replay_table/TableFor4Layer", this._gameReplayPopup);
    this._replayTableFor6Layer = cc.find("bg_replay_white/bg_replay_table/TableFor6Layer", this._gameReplayPopup);
    this._replayTableFor8Layer = cc.find("bg_replay_white/bg_replay_table/TableFor8Layer", this._gameReplayPopup);
    this._replayTableFor9Layer = cc.find("bg_replay_white/bg_replay_table/TableFor9Layer", this._gameReplayPopup);
    this._replayPlayerAnchorsFor4 = new Array();
    this._replayPlayerAnchorsFor6 = new Array();
    this._replayPlayerAnchorsFor8 = new Array();
    this._replayPlayerAnchorsFor9 = new Array();

    for (var _i = 0; _i < 4; _i++) {
      this._replayPlayerAnchorsFor4.push(cc.find("PlayerAnchor_" + _i, this._replayTableFor4Layer));
    }

    for (var _i2 = 0; _i2 < 6; _i2++) {
      this._replayPlayerAnchorsFor6.push(cc.find("PlayerAnchor_" + _i2, this._replayTableFor6Layer));
    }

    for (var _i3 = 0; _i3 < 8; _i3++) {
      this._replayPlayerAnchorsFor8.push(cc.find("PlayerAnchor_" + _i3, this._replayTableFor8Layer));
    }

    for (var _i4 = 0; _i4 < 9; _i4++) {
      this._replayPlayerAnchorsFor9.push(cc.find("PlayerAnchor_" + _i4, this._replayTableFor9Layer));
    }

    this._replayCommunityCards = new Array();

    this._replayCommunityCards.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/CommunityCards/FlopCard_1", this._gameReplayPopup));

    this._replayCommunityCards.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/CommunityCards/FlopCard_2", this._gameReplayPopup));

    this._replayCommunityCards.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/CommunityCards/FlopCard_3", this._gameReplayPopup));

    this._replayCommunityCards.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/CommunityCards/TurnCard", this._gameReplayPopup));

    this._replayCommunityCards.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/CommunityCards/RiverCard", this._gameReplayPopup));

    this._replayRMTCommunityCards1 = new Array();

    this._replayRMTCommunityCards1.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards1/FlopCard_1", this._gameReplayPopup));

    this._replayRMTCommunityCards1.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards1/FlopCard_2", this._gameReplayPopup));

    this._replayRMTCommunityCards1.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards1/FlopCard_3", this._gameReplayPopup));

    this._replayRMTCommunityCards1.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards1/TurnCard", this._gameReplayPopup));

    this._replayRMTCommunityCards1.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards1/RiverCard", this._gameReplayPopup));

    this._replayRMTCommunityCards2 = new Array();

    this._replayRMTCommunityCards2.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards2/FlopCard_1", this._gameReplayPopup));

    this._replayRMTCommunityCards2.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards2/FlopCard_2", this._gameReplayPopup));

    this._replayRMTCommunityCards2.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards2/FlopCard_3", this._gameReplayPopup));

    this._replayRMTCommunityCards2.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards2/TurnCard", this._gameReplayPopup));

    this._replayRMTCommunityCards2.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards2/RiverCard", this._gameReplayPopup));

    this._replayRMTCommunityCards3 = new Array();

    this._replayRMTCommunityCards3.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards3/FlopCard_1", this._gameReplayPopup));

    this._replayRMTCommunityCards3.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards3/FlopCard_2", this._gameReplayPopup));

    this._replayRMTCommunityCards3.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards3/FlopCard_3", this._gameReplayPopup));

    this._replayRMTCommunityCards3.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards3/TurnCard", this._gameReplayPopup));

    this._replayRMTCommunityCards3.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards3/RiverCard", this._gameReplayPopup));

    this._replayRMTCommunityCards4 = new Array();

    this._replayRMTCommunityCards4.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards4/FlopCard_1", this._gameReplayPopup));

    this._replayRMTCommunityCards4.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards4/FlopCard_2", this._gameReplayPopup));

    this._replayRMTCommunityCards4.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards4/FlopCard_3", this._gameReplayPopup));

    this._replayRMTCommunityCards4.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards4/TurnCard", this._gameReplayPopup));

    this._replayRMTCommunityCards4.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/RMTCommunityCards4/RiverCard", this._gameReplayPopup));

    this._replayHighlightCommunityCards = new Array();

    this._replayHighlightCommunityCards.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/HighlightCommunityCards/FlopCard_1", this._gameReplayPopup));

    this._replayHighlightCommunityCards.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/HighlightCommunityCards/FlopCard_2", this._gameReplayPopup));

    this._replayHighlightCommunityCards.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/HighlightCommunityCards/FlopCard_3", this._gameReplayPopup));

    this._replayHighlightCommunityCards.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/HighlightCommunityCards/TurnCard", this._gameReplayPopup));

    this._replayHighlightCommunityCards.push(cc.find("bg_replay_white/bg_replay_table/CommunityCardsLayer/HighlightCommunityCards/RiverCard", this._gameReplayPopup));

    this._replayRMTCommunityCards = new Array();

    this._replayRMTCommunityCards.push(this._replayRMTCommunityCards1);

    this._replayRMTCommunityCards.push(this._replayRMTCommunityCards2);

    this._replayRMTCommunityCards.push(this._replayRMTCommunityCards3);

    this._replayRMTCommunityCards.push(this._replayRMTCommunityCards4);

    this._replayRMTOperateLayer = cc.find("bg_replay_white/bg_replay_table/RMTOperateLayer/RMTOperateLayer", this._gameReplayPopup);
    this._replayRMTLeaderHead = cc.find("bg_replay_white/bg_replay_table/RMTOperateLayer/RMTOperateLayer/leaderHead", this._gameReplayPopup).getComponent(cc.Sprite);
    this._replayRMTLeaderAddr = cc.find("bg_replay_white/bg_replay_table/RMTOperateLayer/RMTOperateLayer/playerName", this._gameReplayPopup).getComponent(cc.Label);
    this._replayRMTTimesResults = new Array();

    this._replayRMTTimesResults.push(cc.find("bg_replay_white/bg_replay_table/RMTOperateLayer/RMTOperateLayer/Once/Background/blackMask", this._gameReplayPopup));

    this._replayRMTTimesResults.push(cc.find("bg_replay_white/bg_replay_table/RMTOperateLayer/RMTOperateLayer/Twice/Background/blackMask", this._gameReplayPopup));

    this._replayRMTTimesResults.push(cc.find("bg_replay_white/bg_replay_table/RMTOperateLayer/RMTOperateLayer/3Times/Background/blackMask", this._gameReplayPopup));

    this._replayRMTTimesResults.push(cc.find("bg_replay_white/bg_replay_table/RMTOperateLayer/RMTOperateLayer/4Times/Background/blackMask", this._gameReplayPopup));

    this._replayRMTResultTips = cc.find("bg_replay_white/bg_replay_table/RMTOperateLayer/RMTOperateLayer/labelResultTips", this._gameReplayPopup).getComponent(cc.Label);
    this._replayINSOperateLayer = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer", this._gameReplayPopup);
    this._replayINSLeaderHead = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/INSOperateInfoLayer/leaderHead", this._gameReplayPopup).getComponent(cc.Sprite);
    this._replayINSLeaderAddr = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/INSOperateInfoLayer/playerName", this._gameReplayPopup).getComponent(cc.Label);
    this._replayINSOnePotLayer = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/OnePotInsuranceLayer", this._gameReplayPopup);
    this._replayINSTwoPotsLayer = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/TwoPotsInsuranceLayer", this._gameReplayPopup);
    this._replayINSFullPot = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/INSOperateInfoLayer/full_pot/label", this._gameReplayPopup).getComponent(cc.Label);
    this._replayINSSecure = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/INSOperateInfoLayer/secure/label", this._gameReplayPopup).getComponent(cc.Label);
    this._replayINSOnePotMainPotOuts = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/OnePotInsuranceLayer/mainpot_outs_layout", this._gameReplayPopup);
    this._replayINSOnePotPotNum = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/OnePotInsuranceLayer/MainPotInfo/top/label", this._gameReplayPopup).getComponent(cc.Label);
    this._replayINSOnePotOdds = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/OnePotInsuranceLayer/MainPotInfo/Odds/odds_value", this._gameReplayPopup).getComponent(cc.Label);
    this._replayINSOnePotOutsNum = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/OnePotInsuranceLayer/MainPotInfo/Outs/outs_value", this._gameReplayPopup).getComponent(cc.Label);
    this._replayINSTwoPotsMainPotOuts = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/TwoPotsInsuranceLayer/MainPotInsurance/mainpot_outs_layout", this._gameReplayPopup);
    this._replayINSTwoPotsMainPotNum = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/TwoPotsInsuranceLayer/MainPotInsurance/MainPotInfo/top/label", this._gameReplayPopup).getComponent(cc.Label);
    this._replayINSTwoPotsMainPotOdds = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/TwoPotsInsuranceLayer/MainPotInsurance/MainPotInfo/Odds/odds_value", this._gameReplayPopup).getComponent(cc.Label);
    this._replayINSTwoPotsMainPotOutsNum = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/TwoPotsInsuranceLayer/MainPotInsurance/MainPotInfo/Outs/outs_value", this._gameReplayPopup).getComponent(cc.Label);
    this._replayINSTwoPotsSidePotOuts = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/TwoPotsInsuranceLayer/SidePotInsurance/sidepot_outs_layout", this._gameReplayPopup);
    this._replayINSTwoPotsSidePotNum = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/TwoPotsInsuranceLayer/SidePotInsurance/SidePotInfo/top/label", this._gameReplayPopup).getComponent(cc.Label);
    this._replayINSTwoPotsSidePotOdds = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/TwoPotsInsuranceLayer/SidePotInsurance/SidePotInfo/Odds/odds_value", this._gameReplayPopup).getComponent(cc.Label);
    this._replayINSTwoPotsSidePotOutsNum = cc.find("bg_replay_white/bg_replay_table/INSLayer/INSOperateLayer/TwoPotsInsuranceLayer/SidePotInsurance/SidePotInfo/Outs/outs_value", this._gameReplayPopup).getComponent(cc.Label);
    cc.dgame.utils.addClickEvent(cc.find("bg_replay_white/btn_close", this._gameReplayPopup), this.node, "GameReplayPopup", "onBtnCloseClicked");
    cc.dgame.utils.addClickEvent(this._btnPlay, this.node, "GameReplayPopup", "onBtnPlayClicked");
    cc.dgame.utils.addClickEvent(this._btnPause, this.node, "GameReplayPopup", "onBtnPauseClicked");
    cc.dgame.utils.addClickEvent(this._btnReplay, this.node, "GameReplayPopup", "onBtnReplayClicked"); // cc.dgame.utils.addClickEvent(this._btnPrevHand, this.node, "GameReplayPopup", "onBtnPrevHandClicked");

    cc.dgame.utils.addClickEvent(this._btnFirstStep, this.node, "GameReplayPopup", "onBtnFirstStepClicked");
    cc.dgame.utils.addClickEvent(this._btnPrevMove, this.node, "GameReplayPopup", "onBtnPrevMoveClicked");
    cc.dgame.utils.addClickEvent(this._btnNextMove, this.node, "GameReplayPopup", "onBtnNextMoveClicked"); // cc.dgame.utils.addClickEvent(this._btnNextHand, this.node, "GameReplayPopup", "onBtnNextHandClicked");

    cc.dgame.utils.addClickEvent(this._btnEndStep, this.node, "GameReplayPopup", "onBtnEndStepClicked");

    for (var _i5 = 0; _i5 < this._replayCommunityCards.length; _i5++) {
      var cardNode = cc.instantiate(this.pokerPrefab);

      this._replayCommunityCards[_i5].addChild(cardNode);

      var poker = cardNode.getComponent('Poker');
      poker.init(0, 0);
      poker.setFaceUp(false);
      this._replayCommunityCards[_i5].scale = 0.8;
    }

    for (var _i6 = 0; _i6 < this._replayRMTCommunityCards.length; _i6++) {
      for (var j = 0; j < this._replayRMTCommunityCards[_i6].length; j++) {
        var _cardNode = cc.instantiate(this.pokerPrefab);

        this._replayRMTCommunityCards[_i6][j].addChild(_cardNode);

        var _poker = _cardNode.getComponent("Poker");

        _poker.init(0, 0);

        _poker.setFaceUp(false);

        this._replayRMTCommunityCards[_i6][j].scale = 0.8;
      }
    }

    for (var _i7 = 0; _i7 < this._replayHighlightCommunityCards.length; _i7++) {
      var _cardNode2 = cc.instantiate(this.pokerPrefab);

      this._replayHighlightCommunityCards[_i7].addChild(_cardNode2);

      var _poker2 = _cardNode2.getComponent("Poker");

      _poker2.init(0, 0);

      _poker2.setFaceUp(false);

      this._replayHighlightCommunityCards[_i7].scale = 0.8;
    }

    this.GameReplays = {};
    cc.dgame.gameReplayPopup = this;
  },
  start: function start() {},
  _highlightCommunityCards: function _highlightCommunityCards(suit, genCards) {
    var genCardsPTArr = new Array();

    for (var i = 0; i < genCards.length; i++) {
      genCardsPTArr.push(cc.dgame.utils.getCard(genCards[i]));
    }

    for (var _i8 = 0; _i8 < this._replayCommunityCards.length; _i8++) {
      var poker = this._replayCommunityCards[_i8].getChildren()[0].getComponent("Poker");

      if (this._replayCommunityCards[_i8].active) {
        poker.disable();

        this._replayHighlightCommunityCards[_i8].setPosition(this._replayCommunityCards[_i8].getPosition());

        var highlightPoker = this._replayHighlightCommunityCards[_i8].getChildren()[0].getComponent("Poker");

        highlightPoker.setCardPoint(poker.getCardPoint());
      }
    }

    for (var _i9 = 0; _i9 < this._replayRMTCommunityCards.length; _i9++) {
      for (var j = 0; j < this._replayRMTCommunityCards[_i9].length; j++) {
        var _poker3 = this._replayRMTCommunityCards[_i9][j].getChildren()[0].getComponent("Poker");

        if (this._replayRMTCommunityCards[_i9][j].active) {
          _poker3.disable();

          if (suit == _i9) {
            this._replayHighlightCommunityCards[j].setPosition(this._replayRMTCommunityCards[_i9][j].getPosition());

            var _highlightPoker = this._replayHighlightCommunityCards[j].getChildren()[0].getComponent("Poker");

            _highlightPoker.setCardPoint(_poker3.getCardPoint());
          }
        }
      }
    }

    for (var _i10 = 0; _i10 < this._replayHighlightCommunityCards.length; _i10++) {
      this._replayHighlightCommunityCards[_i10].active = true;

      var _poker4 = this._replayHighlightCommunityCards[_i10].getChildren()[0].getComponent("Poker");

      _poker4.setFaceUp(true);

      if (genCardsPTArr.indexOf(_poker4.getCardPoint()) == -1) {
        _poker4.disable();
      } else {
        _poker4.enable();
      }
    }
  },
  replay: function replay(hand) {
    this._replayIdx = 0;
    var gameReplayStr = cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_" + cc.dgame.gameReviewPopup.TableId + "_" + hand + "_replay");

    if (!gameReplayStr) {
      return;
    }

    Log.Trace(cc.dgame.settings.account.Addr + "_" + cc.dgame.gameReviewPopup.TableId + "_" + hand + "_replay load: " + gameReplayStr);
    this.GameReplay = JSON.parse(gameReplayStr);
    Log.Trace("len(" + cc.dgame.settings.account.Addr + "_" + cc.dgame.gameReviewPopup.TableId + "_" + hand + "_replay) = " + this.GameReplay.length);
    this._gameReplayPopup.active = true;

    this._showReplayAction();

    var replayPotLayer = cc.find("bg_replay_white/bg_replay_table/PotLayer", this._gameReplayPopup);
    replayPotLayer.scale = 0.8;

    this._startReplay();

    this._replayIdx++;
  },
  _startReplay: function _startReplay() {
    this.schedule(this._showReplayActions, 1);
    this._btnPlay.active = false;
    this._btnPause.active = true;
  },
  _stopReplay: function _stopReplay() {
    this.unschedule(this._showReplayActions);
    this._btnPlay.active = true;
    this._btnPause.active = false;
  },
  _showReplayAction: function _showReplayAction() {
    var _this = this;

    var gameReplayPlayerAction = this.GameReplay[this._replayIdx]; //let replayProgessbar = cc.find('mask/progressBar', this.gameReplayPopup).getComponent(cc.ProgressBar);
    //replayProgessbar.progress = this._replayIdx / (this.GameReplay.length - 1);

    if (this._replayIdx == 0) {
      this._replayPlayerTables = {};
      this._replayPlayerAnchors = {}; //4人桌各位置使用的预制资源

      this._replayPlayerTables['4'] = this._replayTableFor4Layer;
      this._replayPlayerAnchors['4'] = this._replayPlayerAnchorsFor4; //6人桌各位置使用的预制资源

      this._replayPlayerTables['6'] = this._replayTableFor6Layer;
      this._replayPlayerAnchors['6'] = this._replayPlayerAnchorsFor6; //8人桌各位置使用的预制资源

      this._replayPlayerTables['8'] = this._replayTableFor8Layer;
      this._replayPlayerAnchors['8'] = this._replayPlayerAnchorsFor8; //9人桌各位置使用的预制资源

      this._replayPlayerTables['9'] = this._replayTableFor9Layer;
      this._replayPlayerAnchors['9'] = this._replayPlayerAnchorsFor9; //根据最大玩家数显示各玩家位置

      this._replayPlayerTables['9'].active = true; //初始状态显示玩家头像上的底牌、庄家位置

      for (var i = 0; i < 9; i++) {
        var playerAnchor = this._replayPlayerAnchors['9'][i];
        playerAnchor.setPosition(PositionData.ReplayPlayerAnchorPositions[i].x, PositionData.ReplayPlayerAnchorPositions[i].y);
        playerAnchor.removeAllChildren();
        var playerNode = cc.instantiate(this.playerPrefab);
        playerAnchor.addChild(playerNode);
        var player = playerNode.getComponent('Player');
        player.initReplayPlayerByTablePos(9, i);
        playerNode.scale = 0.8;

        if (!!gameReplayPlayerAction.PlayerInfo[i + ""]) {
          player.initPlayerInfo(i, gameReplayPlayerAction.PlayerInfo[i + ""].PlayerAddr, gameReplayPlayerAction.PlayerInfo[i + ""].PlayerAddr.substr(2, 8), gameReplayPlayerAction.PlayerInfo[i + ""].Balance, Types.ContractStatus.PLAYING);
          player.setBet(gameReplayPlayerAction.PlayerInfo[i + ""].TurnBet);

          if (!!gameReplayPlayerAction.PlayerInfo[i + ""].Operate) {
            player.showAction(gameReplayPlayerAction.PlayerInfo[i + ""].Operate);
          }

          if (i == gameReplayPlayerAction.Dealer) {
            player.setDealerMark();
          }

          player.recoverDealCards();

          if (gameReplayPlayerAction.PlayerInfo[i + ""].HoleCards.length == 2) {
            player.revealHoleCards(gameReplayPlayerAction.PlayerInfo[i + ""].HoleCards[0], gameReplayPlayerAction.PlayerInfo[i + ""].HoleCards[1]);
          } else {
            player.hideDealCards();
          }
        } else {
          player.initPlayerInfo(i, '', '', 0, Types.ContractStatus.NOTJOIN);
          player.disable();
        }
      } //初始状态隐藏公共牌、高亮公共牌、多牌


      for (var _i11 = 0; _i11 < 5; _i11++) {
        this._replayCommunityCards[_i11].active = false;
        this._replayHighlightCommunityCards[_i11].active = false;
      }

      for (var _i12 = 0; _i12 < this._replayRMTCommunityCards.length; _i12++) {
        for (var j = 0; j < this._replayRMTCommunityCards[_i12].length; j++) {
          this._replayRMTCommunityCards[_i12][j].active = false;
        }
      }

      return; //        } else if (this._replayIdx == this.GameReplay.length - 1) {
    } else if (!!gameReplayPlayerAction.StageChange) {
      if (!!gameReplayPlayerAction.WinGenCards) {
        var _loop = function _loop(_i13) {
          if (!!gameReplayPlayerAction.WinGenCards[_i13].length) {
            _this.scheduleOnce(function () {
              this._highlightCommunityCards(_i13, gameReplayPlayerAction.WinGenCards[_i13]);
            }, _i13 * 3 + 0.1);
          }
        };

        for (var _i13 = 0; _i13 < gameReplayPlayerAction.WinGenCards.length; _i13++) {
          _loop(_i13);
        }
      }

      var _loop2 = function _loop2() {
        var playerNode = _this._replayPlayerAnchors['9'][i].getChildren()[0];

        var player = playerNode.getComponent('Player');
        player.setBet(0);
        player.hideActions();

        if (!!gameReplayPlayerAction.PlayerInfo[i + ""]) {
          var clearPlayerInfoDelay = 4;

          if (!!gameReplayPlayerAction.PlayerInfo[i + ""].Win && gameReplayPlayerAction.PlayerInfo[i + ""].Win.length > 1) {
            clearPlayerInfoDelay = gameReplayPlayerAction.PlayerInfo[i + ""].Win.length * 3 + 1;
          }

          _this.scheduleOnce(function () {
            player.hideWinloss();
            player.hideRMTWinner();
            player.hideCardType();
          }, clearPlayerInfoDelay);
        }

        if (!!gameReplayPlayerAction.PlayerInfo[i + ""] && !!gameReplayPlayerAction.PlayerInfo[i + ""].Win) {
          if (gameReplayPlayerAction.PlayerInfo[i + ""].Win.length == 1) {
            if (gameReplayPlayerAction.PlayerInfo[i + ""].Win[0] > 0) {
              if (!!gameReplayPlayerAction.PlayerInfo[i + ""].LevelName && gameReplayPlayerAction.PlayerInfo[i + ""].LevelName[0] != "") {
                player.setCardType(cc.dgame.utils.getCardType(gameReplayPlayerAction.PlayerInfo[i + ""].LevelName[0]));
              } else {
                player.hideCardType();
              }

              player.setWinloss(gameReplayPlayerAction.PlayerInfo[i + ""].Win[0]);
              player.setWinlight();
              player.hideAllActions();

              _this.scheduleOnce(function () {
                player.hideWinlight();
              }, 4);
            } else {
              player.hideWinloss();
            }
          } else {
            var _loop3 = function _loop3(_j) {
              var gameReplayPlayer = gameReplayPlayerAction.PlayerInfo[i + ""];

              _this.scheduleOnce(function () {
                player.setCardType(cc.dgame.utils.getCardType(gameReplayPlayer.LevelName[_j]));
                player.highlightHoleCards(gameReplayPlayerAction.WinGenCards[_j]);

                if (gameReplayPlayer.Win[_j] > 0) {
                  player.showRMTWinner();
                  player.setWinloss(gameReplayPlayer.Win[_j]);
                }
              }, _j * 3 + 0.1);

              _this.scheduleOnce(function () {
                if (gameReplayPlayer.Win[_j] > 0) {
                  player.hideRMTWinner();
                  player.hideWinloss();
                }
              }, (_j + 1) * 3);
            };

            for (var _j = 0; _j < gameReplayPlayerAction.PlayerInfo[i + ""].Win.length; _j++) {
              _loop3(_j);
            }
          }
        }
      };

      for (var i = 0; i < 9; i++) {
        _loop2();
      }
    } //隐藏公共牌、高亮公共牌与多牌


    for (var _i14 = 0; _i14 < 5; _i14++) {
      if (_i14 < gameReplayPlayerAction.CommunityCards.length) {
        this._replayCommunityCards[_i14].active = true;

        var poker = this._replayCommunityCards[_i14].getChildren()[0].getComponent('Poker');

        poker.setCardPoint(gameReplayPlayerAction.CommunityCards[_i14]);
        poker.setFaceUp(true);
        poker.enable();
      } else {
        this._replayCommunityCards[_i14].active = false;
      }
    } //显示多牌


    if (!!gameReplayPlayerAction.RmtCard) {
      for (var _i15 = 0; _i15 < gameReplayPlayerAction.RmtCard.length; _i15++) {
        for (var _j2 = 5 - gameReplayPlayerAction.RmtCard[_i15].length; _j2 < 5; _j2++) {
          this._replayRMTCommunityCards[_i15][_j2].active = true;

          var _poker5 = this._replayRMTCommunityCards[_i15][_j2].getChildren()[0].getComponent("Poker");

          _poker5.setCardPoint(cc.dgame.utils.getCard(gameReplayPlayerAction.RmtCard[_i15][_j2 - (5 - gameReplayPlayerAction.RmtCard[_i15].length)]));

          _poker5.setFaceUp(true);

          _poker5.enable();
        }
      }
    } else {
      for (var _i16 = 0; _i16 < this._replayRMTCommunityCards.length; _i16++) {
        for (var _j3 = 0; _j3 < this._replayRMTCommunityCards[_i16].length; _j3++) {
          this._replayRMTCommunityCards[_i16][_j3].active = false;
        }
      }
    } //非结算的GameReplayAction隐藏高亮公共牌


    if (!gameReplayPlayerAction.WinGenCards) {
      for (var _i17 = 0; _i17 < this._replayHighlightCommunityCards.length; _i17++) {
        this._replayHighlightCommunityCards[_i17].active = false;
      }
    } //处理每个玩家下注、动作、余额、底牌、是否Allin，并计算当前轮下注总额


    for (var i = 0; i < 9; i++) {
      if (!!gameReplayPlayerAction.PlayerInfo[i + ""]) {
        var _playerNode = this._replayPlayerAnchors['9'][i].getChildren()[0];

        var _player = _playerNode.getComponent('Player');

        if (!!gameReplayPlayerAction.PlayerInfo[i + ""].Operate) {
          if (this._replayIdx == this.GameReplay.length - 1) {
            _player.hideAllActions();
          } else {
            _player.showAction(gameReplayPlayerAction.PlayerInfo[i + ""].Operate);

            if (gameReplayPlayerAction.PlayerInfo[i + ""].Operate == Types.PlayerOP.ALLIN) {
              _player.setAllinHead();
            } else {
              _player.hideAllinHead();
            }
          }
        }

        if (!!gameReplayPlayerAction.PlayerInfo[i + ""].TurnBet) {
          _player.setBet(gameReplayPlayerAction.PlayerInfo[i + ""].TurnBet);
        } else {
          _player.setBet(0);
        }

        if (gameReplayPlayerAction.PlayerInfo[i + ""].HoleCards.length == 2) {
          _player.revealHoleCards(gameReplayPlayerAction.PlayerInfo[i + ""].HoleCards[0], gameReplayPlayerAction.PlayerInfo[i + ""].HoleCards[1]);
        } else {
          _player.hideDealCards();
        }

        _player.setStack(gameReplayPlayerAction.PlayerInfo[i + ""].Balance);

        _player.hideINSFlag();
      }
    } //显示底池与边池


    if (!!gameReplayPlayerAction.Pots[0]) {
      this._replayCurrentRoundPot.active = true;
      this._replayCurrentRoundPotNum.string = cc.dgame.utils.formatRichText(gameReplayPlayerAction.Pots[0], "#FFBC1D", true, false);
    } else {
      this._replayCurrentRoundPot.active = false;
    }

    if (gameReplayPlayerAction.Pots.length > 1) {
      for (var _i18 = 1; _i18 < gameReplayPlayerAction.Pots.length; _i18++) {
        this._replaySidePotNums[_i18 - 1].string = cc.dgame.utils.formatRichText(gameReplayPlayerAction.Pots[_i18], "#FFBC1D", true, false);
        this._replaySidePots[_i18 - 1].active = true;
      }
    } else {
      for (var _i19 = 0; _i19 < this._replaySidePots.length; _i19++) {
        this._replaySidePots[_i19].active = false;
      }
    } //显示多牌保险操作


    if (!!gameReplayPlayerAction.RmtIns) {
      if (!!gameReplayPlayerAction.RmtIns.ShowRMTOption || !!gameReplayPlayerAction.RmtIns.RMTTimesChoose || !!gameReplayPlayerAction.RmtIns.RMTTimesResult) {
        this._replayRMTOperateLayer.active = true;
        this._replayINSOperateLayer.active = false;

        if (!!gameReplayPlayerAction.RmtIns.ShowRMTOption) {
          var playerAddr = gameReplayPlayerAction.PlayerInfo[gameReplayPlayerAction.RmtIns.ShowRMTOption.seatTurn + ""].PlayerAddr;
          this._replayRMTLeaderAddr.string = playerAddr.substr(2, 8);
          var idx = parseInt(playerAddr.substr(2, 2), 16);

          if (isNaN(idx)) {
            idx = 0;
          }

          this._replayRMTLeaderHead.spriteFrame = this._assetMgr.heads[idx % 200];
          this._replayRMTResultTips.node.active = false;

          for (var _i20 = 0; _i20 < this._replayRMTTimesResults.length; _i20++) {
            this._replayRMTTimesResults[_i20].active = false;
          }
        } else if (!!gameReplayPlayerAction.RmtIns.RMTTimesChoose && !gameReplayPlayerAction.RmtIns.RMTTimesResult) {
          var _playerAddr = gameReplayPlayerAction.PlayerInfo[gameReplayPlayerAction.RmtIns.RMTTimesChoose.seatTurn + ""].PlayerAddr;
          this._replayRMTLeaderAddr.string = _playerAddr.substr(2, 8);

          var _idx = parseInt(_playerAddr.substr(2, 2), 16);

          if (isNaN(_idx)) {
            _idx = 0;
          }

          this._replayRMTLeaderHead.spriteFrame = this._assetMgr.heads[_idx % 200];
          this._replayRMTResultTips.node.active = false;
          this._replayRMTTimesResults[gameReplayPlayerAction.RmtIns.RMTTimesChoose.Times - 1].active = true;
        } else if (!!gameReplayPlayerAction.RmtIns.RMTTimesChoose && !!gameReplayPlayerAction.RmtIns.RMTTimesResult) {
          var _playerAddr2 = gameReplayPlayerAction.PlayerInfo[gameReplayPlayerAction.RmtIns.RMTTimesChoose.seatTurn + ""].PlayerAddr;
          this._replayRMTLeaderAddr.string = _playerAddr2.substr(2, 8);

          var _idx2 = parseInt(_playerAddr2.substr(2, 2), 16);

          if (isNaN(_idx2)) {
            _idx2 = 0;
          }

          this._replayRMTLeaderHead.spriteFrame = this._assetMgr.heads[_idx2 % 200];
          this._replayRMTTimesResults[gameReplayPlayerAction.RmtIns.RMTTimesChoose.Times - 1].active = true;

          if (gameReplayPlayerAction.RmtIns.RMTTimesChoose.Times != gameReplayPlayerAction.RmtIns.RMTTimesResult.Times) {
            this._replayRMTResultTips.string = "Some players disagree with runing it " + gameReplayPlayerAction.RmtIns.RMTTimesChoose.Times + " times";
          } else {
            this._replayRMTResultTips.string = "All players agree with running it " + gameReplayPlayerAction.RmtIns.RMTTimesChoose.Times + " times";
          }

          this._replayRMTResultTips.node.active = true;
        }
      } else if (!!gameReplayPlayerAction.RmtIns.ShowINS || !!gameReplayPlayerAction.RmtIns.ShowPlayerINS || !!gameReplayPlayerAction.RmtIns.InsWinInfo) {
        this._replayRMTOperateLayer.active = false;
        this._replayINSOperateLayer.active = false;

        if (!!gameReplayPlayerAction.RmtIns.ShowINS) {
          this._replayINSOperateLayer.active = true;
          var _playerAddr3 = gameReplayPlayerAction.PlayerInfo[gameReplayPlayerAction.RmtIns.ShowINS.seatTurn + ""].PlayerAddr;
          this._replayINSLeaderAddr.string = _playerAddr3.substr(2, 8);

          var _idx3 = parseInt(_playerAddr3.substr(2, 2), 16);

          if (isNaN(_idx3)) {
            _idx3 = 0;
          }

          this._replayINSLeaderHead.spriteFrame = this._assetMgr.heads[_idx3 % 200];
          var totalSecureBuy = 0;
          var totalFullPotBuy = 0;

          if (!!gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot) {
            totalSecureBuy += gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.SecureBuy;
            totalFullPotBuy += gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.FullPotBuy;
          }

          if (!!gameReplayPlayerAction.RmtIns.ShowINS.Pots.SidePot) {
            totalSecureBuy += gameReplayPlayerAction.RmtIns.ShowINS.Pots.SidePot.SecureBuy;
            totalFullPotBuy += gameReplayPlayerAction.RmtIns.ShowINS.Pots.SidePot.FullPotBuy;
          }

          this._replayINSFullPot.string = totalFullPotBuy;
          this._replayINSSecure.string = totalSecureBuy;

          if (!!gameReplayPlayerAction.RmtIns.ShowINS.Pots.SidePot) {
            this._replayINSOnePotLayer.active = false;
            this._replayINSTwoPotsLayer.active = true;
            this._replayINSTwoPotsMainPotNum.string = gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.PotNum;
            this._replayINSTwoPotsMainPotOdds.string = gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.OddsValue;
            this._replayINSTwoPotsMainPotOutsNum.string = gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.Outs.length;
            this._replayINSTwoPotsSidePotNum.string = gameReplayPlayerAction.RmtIns.ShowINS.Pots.SidePot.PotNum;
            this._replayINSTwoPotsSidePotOdds.string = gameReplayPlayerAction.RmtIns.ShowINS.Pots.SidePot.OddsValue;
            this._replayINSTwoPotsSidePotOutsNum.string = gameReplayPlayerAction.RmtIns.ShowINS.Pots.SidePot.Outs.length;
            var assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");

            for (var _i21 = 0; _i21 < this._replayINSTwoPotsMainPotOuts.childrenCount; _i21++) {
              this._replayINSTwoPotsMainPotOuts.children[_i21].active = false;
            }

            for (var _i22 = 0; _i22 < gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.Outs.length && _i22 < this._replayINSTwoPotsMainPotOuts.children.length; _i22++) {
              var carNode = this._replayINSTwoPotsMainPotOuts.children[_i22];
              carNode.getComponent(cc.Sprite).spriteFrame = assetMgr.cards0[gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.Outs[_i22]];
              carNode.active = true;
            }

            for (var _i23 = 0; _i23 < this._replayINSTwoPotsSidePotOuts.childrenCount; _i23++) {
              this._replayINSTwoPotsSidePotOuts.children[_i23].active = false;
            }

            for (var _i24 = 0; _i24 < gameReplayPlayerAction.RmtIns.ShowINS.Pots.SidePot.Outs.length && _i24 < this._replayINSTwoPotsSidePotOuts.children.length; _i24++) {
              var _carNode = this._replayINSTwoPotsSidePotOuts.children[_i24];
              _carNode.getComponent(cc.Sprite).spriteFrame = assetMgr.cards0[gameReplayPlayerAction.RmtIns.ShowINS.Pots.SidePot.Outs[_i24]];
              _carNode.active = true;
            }
          } else {
            this._replayINSOnePotLayer.active = true;
            this._replayINSTwoPotsLayer.active = false;
            this._replayINSOnePotPotNum.string = gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.PotNum;
            this._replayINSOnePotOdds.string = gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.OddsValue;
            this._replayINSOnePotOutsNum.string = gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.Outs.length;

            var _assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");

            for (var _i25 = 0; _i25 < this._replayINSOnePotMainPotOuts.childrenCount; _i25++) {
              this._replayINSOnePotMainPotOuts.children[_i25].active = false;
            }

            for (var _i26 = 0; _i26 < gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.Outs.length && _i26 < this._replayINSOnePotMainPotOuts.children.length; _i26++) {
              var _carNode2 = this._replayINSOnePotMainPotOuts.children[_i26];
              _carNode2.getComponent(cc.Sprite).spriteFrame = _assetMgr.cards0[gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.Outs[_i26]];
              _carNode2.active = true;
            }
          }
        } else if (!!gameReplayPlayerAction.RmtIns.ShowPlayerINS) {
          var totalAmount = 0;

          for (var _i27 = 0; _i27 < gameReplayPlayerAction.RmtIns.ShowPlayerINS.amount.length; _i27++) {
            totalAmount += gameReplayPlayerAction.RmtIns.ShowPlayerINS.amount[_i27];
          }

          var _playerNode2 = this._replayPlayerAnchors['9'][gameReplayPlayerAction.RmtIns.ShowPlayerINS.seatTurn].getChildren()[0];

          var _player2 = _playerNode2.getComponent('Player');

          _player2.showINSFlag(totalAmount, true);
        } else if (!!gameReplayPlayerAction.RmtIns.InsWinInfo) {
          var _playerNode3 = this._replayPlayerAnchors['9'][gameReplayPlayerAction.RmtIns.InsWinInfo.BuyerSeat].getChildren()[0];

          var _player3 = _playerNode3.getComponent('Player');

          var mainWin = gameReplayPlayerAction.RmtIns.InsWinInfo.InsWin[0];

          if (mainWin > 0) {
            _player3.insurancePayToPlayer(cc.v2(cc.winSize.width / 2, cc.winSize.height - 350), 0.6);
          } else if (mainWin < 0) {
            _player3.playerPayToInsurance(cc.v2(cc.winSize.width / 2, cc.winSize.height - 350), 0.6);
          }

          var sideWin = gameReplayPlayerAction.RmtIns.InsWinInfo.InsWin[1];

          if (sideWin != 0) {
            this.scheduleOnce(function () {
              if (sideWin > 0) {
                _player3.insurancePayToPlayer(cc.v2(cc.winSize.width / 2, cc.winSize.height - 350), 0.6);
              } else if (sideWin < 0) {
                _player3.playerPayToInsurance(cc.v2(cc.winSize.width / 2, cc.winSize.height - 350), 0.6);
              }
            }, 1);
          }
        }
      } else {
        this._replayRMTOperateLayer.active = false;
        this._replayINSOperateLayer.active = false;
      }
    } else {
      this._replayRMTOperateLayer.active = false;
      this._replayINSOperateLayer.active = false;
    }
  },
  _showReplayActions: function _showReplayActions() {
    this._showReplayAction();

    if (this._replayIdx + 1 >= this.GameReplay.length) {
      this._stopReplay();
    } else {
      this._replayIdx++;
    }
  },
  onBtnCloseClicked: function onBtnCloseClicked() {
    this._gameReplayPopup.active = false;
  },
  onBtnPlayClicked: function onBtnPlayClicked() {
    this._startReplay();
  },
  onBtnPauseClicked: function onBtnPauseClicked() {
    this._stopReplay();
  },
  onBtnReplayClicked: function onBtnReplayClicked() {
    var gameResult = cc.dgame.gameReviewPopup.GameResults[cc.dgame.gameReviewPopup.Idx];
    Log.Trace('[onBtnReplayClicked] Play TableId: ' + gameResult.TableId + ', Hand: ' + gameResult.Hand);
    this.replay(gameResult.Hand);
  },
  onBtnPrevHandClicked: function onBtnPrevHandClicked() {
    if (cc.dgame.gameReviewPopup.Idx > 0 && !!cc.dgame.gameReviewPopup.GameResults[cc.dgame.gameReviewPopup.Idx - 1]) {
      this._stopReplay();

      cc.dgame.gameReviewPopup.Idx--;
      this.onBtnReplayClicked();
    }
  },
  onBtnPrevMoveClicked: function onBtnPrevMoveClicked() {
    if (this._replayIdx > 0 && !!this.GameReplay[this._replayIdx - 1]) {
      this._stopReplay();

      this._replayIdx--;

      this._showReplayAction();
    }
  },
  onBtnNextMoveClicked: function onBtnNextMoveClicked() {
    if (this._replayIdx < this.GameReplay.length - 1 && !!this.GameReplay[this._replayIdx + 1]) {
      this._stopReplay();

      this._replayIdx++;

      this._showReplayAction();
    }
  },
  onBtnNextHandClicked: function onBtnNextHandClicked() {
    if (cc.dgame.gameReviewPopup.Idx < cc.dgame.gameReviewPopup.GameResults.length - 1 && !!cc.dgame.gameReviewPopup.GameResults[cc.dgame.gameReviewPopup.Idx + 1]) {
      this._stopReplay();

      cc.dgame.gameReviewPopup.Idx++;
      this.onBtnReplayClicked();
    }
  },
  onBtnFirstStepClicked: function onBtnFirstStepClicked() {
    this._stopReplay();

    this._replayIdx = 0;

    this._showReplayAction();
  },
  onBtnEndStepClicked: function onBtnEndStepClicked() {
    this._stopReplay();

    this._replayIdx = this.GameReplay.length - 1;

    this._showReplayAction();
  },
  onDestroy: function onDestroy() {
    if (!!cc.dgame) {
      cc.dgame.gameReplayPopup = null;
    }
  } // update (dt) {},

});

cc._RF.pop();