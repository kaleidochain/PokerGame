var Log = require('Log');
var PositionData = require('PositionData');
var Types = require('Types');

cc.Class({
    extends: cc.Component,

    properties: {
        //预制资源
        playerPrefab: cc.Prefab,        //玩家预制资源
        pokerPrefab: cc.Prefab,         //牌预制资源
        _gameReplayPopup: cc.Node,
        _btnPlay: cc.Node,
        _btnPause: cc.Node,
        _btnReplay: cc.Node,
        _btnPrevHand: cc.Node,
        _btnPrevMove: cc.Node,
        _btnNextMove: cc.Node,
        _btnNextHand: cc.Node,
        _replayPotLayer: cc.Node,
        _replayCurrentRoundPotNum: cc.RichText,   //牌局回放本轮下注筹码与底池的总和，即总底池数
        _replaySidePots: [cc.Node],      //牌局回放边池图层
        _replaySidePotNums: [cc.RichText],  //牌局回放边池筹码数
        _replayTableFor4Layer: cc.Node,  //牌局回放4人桌图层
        _replayPlayerAnchorsFor4: [cc.Node],   //牌局回放4人桌各玩家位置
        _replayTableFor6Layer: cc.Node,  //牌局回放8人桌图层
        _replayPlayerAnchorsFor6: [cc.Node],   //牌局回放8人桌各玩家位置
        _replayTableFor8Layer: cc.Node,  //牌局回放8人桌图层
        _replayPlayerAnchorsFor8: [cc.Node],   //牌局回放8人桌各玩家位置
        _replayTableFor9Layer: cc.Node,  //牌局回放9人桌图层
        _replayPlayerAnchorsFor9: [cc.Node],   //牌局回放9人桌各玩家位置
        _replayCommunityCards: [cc.Node],   //牌局回放公共牌
        _replayRMTCommunityCards1: [cc.Node],   //牌局回放RMT第一副公共牌
        _replayRMTCommunityCards2: [cc.Node],   //牌局回放RMT第二副公共牌
        _replayRMTCommunityCards3: [cc.Node],   //牌局回放RMT第三副公共牌
        _replayRMTCommunityCards4: [cc.Node],   //牌局回放RMT第四副公共牌
        _replayHighlightCommunityCards: [cc.Node],  //牌局回放高亮公共牌
        _replayRMTOperateLayer: cc.Node,        //牌局回放多牌领先者次数选择界面
        _replayRMTLeaderHead: cc.Sprite,        //牌局回放多牌领先者头像
        _replayRMTLeaderAddr: cc.Label,         //牌局回放多牌领先者地址
        _replayRMTTimesResults: [cc.Node],      //牌局回放多牌次数结果
        _replayRMTResultTips: cc.Label,         //牌局回放多牌次数结果界面
        _replayINSOperateLayer: cc.Node,        //牌局回放保险选择界面
        _replayINSLeaderHead: cc.Sprite,        //牌局回放保险领先者头像
        _replayINSLeaderAddr: cc.Label,         //牌局回放保险领先者地址
        _replayINSOnePotLayer: cc.Node,         //牌局回放只有主池的保险信息界面
        _replayINSTwoPotsLayer: cc.Node,        //牌局回放主池边池的保险信息界面
        _replayINSFullPot: cc.Label,            //牌局回放当前全部底池保费
        _replayINSSecure: cc.Label,             //牌局回放保本保费
        _replayINSOnePotMainPotOuts: cc.Node,   //牌局回放单个池主池Outs
        _replayINSOnePotPotNum: cc.Label,       //牌局回放单个池底池金额
        _replayINSOnePotOdds: cc.Label,         //牌局回放单个池底池Odds
        _replayINSOnePotOutsNum: cc.Label,      //牌局回放单个池底池Outs
        _replayINSTwoPotsMainPotOuts: cc.Node,  //牌局回放两个池主池Outs
        _replayINSTwoPotsMainPotNum: cc.Label,  //牌局回放两个池主池金额
        _replayINSTwoPotsMainPotOdds: cc.Label, //牌局回放两个池主池Odds
        _replayINSTwoPotsMainPotOutsNum: cc.Label, //牌局回放两个池主池Outs
        _replayINSTwoPotsSidePotOuts: cc.Node,  //牌局回放两个池边池Outs
        _replayINSTwoPotsSidePotNum: cc.Label,  //牌局回放两个池边池金额
        _replayINSTwoPotsSidePotOdds: cc.Label, //牌局回放两个池边池Odds
        _replayINSTwoPotsSidePotOutsNum: cc.Label, //牌局回放两个池边池Outs
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (!cc.dgame) {
            return;
        }

        this._assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");
        this._gameReplayPopup = cc.find("Canvas/MenuLayer/GameReplayPopup");
        this._btnPlay = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnPlay", this._gameReplayPopup);
        this._btnPause = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnPause", this._gameReplayPopup);
        this._btnReplay = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnReplay", this._gameReplayPopup);
        // this._btnPrevHand = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnPrevHand", this._gameReplayPopup);
        this._btnFirstStep = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnFirstStep", this._gameReplayPopup);
        this._btnPrevMove = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnPrevMove", this._gameReplayPopup);
        this._btnNextMove = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnNextMove", this._gameReplayPopup);
        // this._btnNextHand = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnNextHand", this._gameReplayPopup);
        this._btnEndStep = cc.find("bg_replay_white/bg_replay_table/ReplayControl/btnEndStep", this._gameReplayPopup);

        this._replayCurrentRoundPot = cc.find("bg_replay_white/bg_replay_table/PotLayer/Pot", this._gameReplayPopup);
        this._replayCurrentRoundPotNum = cc.find("bg_replay_white/bg_replay_table/PotLayer/Pot/potNum", this._gameReplayPopup).getComponent(cc.RichText);
        this._replaySidePots = new Array();
        this._replaySidePotNums = new Array();
        for (let i = 0; i < 9; i++) {
            this._replaySidePots.push(cc.find("bg_replay_white/bg_replay_table/PotLayer/SidePotLayer/SidePot_" + (i+1), this._gameReplayPopup));
            this._replaySidePotNums.push(cc.find("bg_replay_white/bg_replay_table/PotLayer/SidePotLayer/SidePot_" + (i+1) + "/potNum", this._gameReplayPopup).getComponent(cc.RichText));
        }

        this._replayTableFor4Layer = cc.find("bg_replay_white/bg_replay_table/TableFor4Layer", this._gameReplayPopup);
        this._replayTableFor6Layer = cc.find("bg_replay_white/bg_replay_table/TableFor6Layer", this._gameReplayPopup);
        this._replayTableFor8Layer = cc.find("bg_replay_white/bg_replay_table/TableFor8Layer", this._gameReplayPopup);
        this._replayTableFor9Layer = cc.find("bg_replay_white/bg_replay_table/TableFor9Layer", this._gameReplayPopup);

        this._replayPlayerAnchorsFor4 = new Array();
        this._replayPlayerAnchorsFor6 = new Array();
        this._replayPlayerAnchorsFor8 = new Array();
        this._replayPlayerAnchorsFor9 = new Array();

        for (let i = 0; i < 4; i++) {
            this._replayPlayerAnchorsFor4.push(cc.find("PlayerAnchor_" + i, this._replayTableFor4Layer));
        }

        for (let i = 0; i < 6; i++) {
            this._replayPlayerAnchorsFor6.push(cc.find("PlayerAnchor_" + i, this._replayTableFor6Layer));
        }

        for (let i = 0; i < 8; i++) {
            this._replayPlayerAnchorsFor8.push(cc.find("PlayerAnchor_" + i, this._replayTableFor8Layer));
        }

        for (let i = 0; i < 9; i++) {
            this._replayPlayerAnchorsFor9.push(cc.find("PlayerAnchor_" + i, this._replayTableFor9Layer));
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
        cc.dgame.utils.addClickEvent(this._btnReplay, this.node, "GameReplayPopup", "onBtnReplayClicked");
        // cc.dgame.utils.addClickEvent(this._btnPrevHand, this.node, "GameReplayPopup", "onBtnPrevHandClicked");
        cc.dgame.utils.addClickEvent(this._btnFirstStep, this.node, "GameReplayPopup", "onBtnFirstStepClicked");
        cc.dgame.utils.addClickEvent(this._btnPrevMove, this.node, "GameReplayPopup", "onBtnPrevMoveClicked");
        cc.dgame.utils.addClickEvent(this._btnNextMove, this.node, "GameReplayPopup", "onBtnNextMoveClicked");
        // cc.dgame.utils.addClickEvent(this._btnNextHand, this.node, "GameReplayPopup", "onBtnNextHandClicked");
        cc.dgame.utils.addClickEvent(this._btnEndStep, this.node, "GameReplayPopup", "onBtnEndStepClicked");

        for (let i = 0; i < this._replayCommunityCards.length; i++) {
            let cardNode = cc.instantiate(this.pokerPrefab);
            this._replayCommunityCards[i].addChild(cardNode);
            let poker = cardNode.getComponent('Poker');
            poker.init(0, 0);
            poker.setFaceUp(false);
            this._replayCommunityCards[i].scale = 0.8;
        }
        for (let i = 0; i < this._replayRMTCommunityCards.length; i++) {
            for (let j = 0; j < this._replayRMTCommunityCards[i].length; j++) {
                let cardNode = cc.instantiate(this.pokerPrefab);
                this._replayRMTCommunityCards[i][j].addChild(cardNode);
                let poker = cardNode.getComponent("Poker");
                poker.init(0, 0);
                poker.setFaceUp(false);
                this._replayRMTCommunityCards[i][j].scale = 0.8;
            }
        }
        for (let i = 0; i < this._replayHighlightCommunityCards.length; i++) {
            let cardNode = cc.instantiate(this.pokerPrefab);
            this._replayHighlightCommunityCards[i].addChild(cardNode);
            let poker = cardNode.getComponent("Poker");
            poker.init(0, 0);
            poker.setFaceUp(false);
            this._replayHighlightCommunityCards[i].scale = 0.8;
        }
        this.GameReplays = {};
        cc.dgame.gameReplayPopup = this;
    },

    start () {

    },

    _highlightCommunityCards (suit, genCards) {
        let genCardsPTArr = new Array();
        for (let i = 0; i < genCards.length; i++) {
            genCardsPTArr.push(cc.dgame.utils.getCard(genCards[i]));
        }
        for (let i = 0; i < this._replayCommunityCards.length; i++) {
            let poker = this._replayCommunityCards[i].getChildren()[0].getComponent("Poker");
            if (this._replayCommunityCards[i].active) {
                poker.disable();
                this._replayHighlightCommunityCards[i].setPosition(this._replayCommunityCards[i].getPosition());
                let highlightPoker = this._replayHighlightCommunityCards[i].getChildren()[0].getComponent("Poker");
                highlightPoker.setCardPoint(poker.getCardPoint());
            }
        }
        for (let i = 0; i < this._replayRMTCommunityCards.length; i++) {
            for (let j = 0; j < this._replayRMTCommunityCards[i].length; j++) {
                let poker = this._replayRMTCommunityCards[i][j].getChildren()[0].getComponent("Poker");
                if (this._replayRMTCommunityCards[i][j].active) {
                    poker.disable();
                    if (suit == i) {
                        this._replayHighlightCommunityCards[j].setPosition(this._replayRMTCommunityCards[i][j].getPosition());
                        let highlightPoker = this._replayHighlightCommunityCards[j].getChildren()[0].getComponent("Poker");
                        highlightPoker.setCardPoint(poker.getCardPoint());
                    }
                }
            }
        }
        for (let i = 0; i < this._replayHighlightCommunityCards.length; i++) {
            this._replayHighlightCommunityCards[i].active = true;
            let poker = this._replayHighlightCommunityCards[i].getChildren()[0].getComponent("Poker");
            poker.setFaceUp(true);
            if (genCardsPTArr.indexOf(poker.getCardPoint()) == -1) {
                poker.disable();
            } else {
                poker.enable();
            }
        }
    },

    replay (hand) {
        this._replayIdx = 0;
        let gameReplayStr = cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_" + cc.dgame.gameReviewPopup.TableId + "_" + hand + "_replay");
        if (!gameReplayStr) {
            return;
        }
        Log.Trace(cc.dgame.settings.account.Addr + "_" + cc.dgame.gameReviewPopup.TableId + "_" + hand + "_replay load: " + gameReplayStr);
        this.GameReplay = JSON.parse(gameReplayStr);
        Log.Trace("len(" + cc.dgame.settings.account.Addr + "_" + cc.dgame.gameReviewPopup.TableId + "_" + hand + "_replay) = " + this.GameReplay.length);
        this._gameReplayPopup.active = true;
        this._showReplayAction();
        let replayPotLayer = cc.find("bg_replay_white/bg_replay_table/PotLayer", this._gameReplayPopup);
        replayPotLayer.scale = 0.8;
        this._startReplay();
        this._replayIdx++;
    },

    _startReplay () {
        this.schedule(this._showReplayActions, 1);
        this._btnPlay.active = false;
        this._btnPause.active = true;
    },

    _stopReplay () {
        this.unschedule(this._showReplayActions);
        this._btnPlay.active = true;
        this._btnPause.active = false;
    },

    _showReplayAction () {
        let gameReplayPlayerAction = this.GameReplay[this._replayIdx];
        //let replayProgessbar = cc.find('mask/progressBar', this.gameReplayPopup).getComponent(cc.ProgressBar);
        //replayProgessbar.progress = this._replayIdx / (this.GameReplay.length - 1);
        if (this._replayIdx == 0) {
            this._replayPlayerTables = {};
            this._replayPlayerAnchors = {};
            //4人桌各位置使用的预制资源
            this._replayPlayerTables['4'] = this._replayTableFor4Layer;
            this._replayPlayerAnchors['4'] = this._replayPlayerAnchorsFor4;
            //6人桌各位置使用的预制资源
            this._replayPlayerTables['6'] = this._replayTableFor6Layer;
            this._replayPlayerAnchors['6'] = this._replayPlayerAnchorsFor6;
            //8人桌各位置使用的预制资源
            this._replayPlayerTables['8'] = this._replayTableFor8Layer;
            this._replayPlayerAnchors['8'] = this._replayPlayerAnchorsFor8;
            //9人桌各位置使用的预制资源
            this._replayPlayerTables['9'] = this._replayTableFor9Layer;
            this._replayPlayerAnchors['9'] = this._replayPlayerAnchorsFor9;
            //根据最大玩家数显示各玩家位置
            this._replayPlayerTables['9'].active = true;
            //初始状态显示玩家头像上的底牌、庄家位置
            for (var i = 0; i < 9; i++) {
                let playerAnchor = this._replayPlayerAnchors['9'][i];
                playerAnchor.setPosition(PositionData.ReplayPlayerAnchorPositions[i].x, PositionData.ReplayPlayerAnchorPositions[i].y);
                playerAnchor.removeAllChildren();
                let playerNode = cc.instantiate(this.playerPrefab);
                playerAnchor.addChild(playerNode);
                let player = playerNode.getComponent('Player');
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
            }
            //初始状态隐藏公共牌、高亮公共牌、多牌
            for (let i = 0; i < 5; i++) {
                this._replayCommunityCards[i].active = false;
                this._replayHighlightCommunityCards[i].active = false;
            }
            for (let i = 0; i < this._replayRMTCommunityCards.length; i++) {
                for (let j = 0; j < this._replayRMTCommunityCards[i].length; j++) {
                    this._replayRMTCommunityCards[i][j].active = false;
                }
            }
            return;
//        } else if (this._replayIdx == this.GameReplay.length - 1) {
        } else if (!!gameReplayPlayerAction.StageChange) {
            if (!!gameReplayPlayerAction.WinGenCards) {
                for (let i = 0; i < gameReplayPlayerAction.WinGenCards.length; i++) {
                    if (!!gameReplayPlayerAction.WinGenCards[i].length) {
                        this.scheduleOnce(function () {
                            this._highlightCommunityCards(i, gameReplayPlayerAction.WinGenCards[i]);
                        }, i * 3 + 0.1);
                    }
                }
            }
            for (var i = 0; i < 9; i++) {
                let playerNode = this._replayPlayerAnchors['9'][i].getChildren()[0];
                let player = playerNode.getComponent('Player');
                player.setBet(0);
                player.hideActions();
                if (!!gameReplayPlayerAction.PlayerInfo[i + ""]) {
                    let clearPlayerInfoDelay = 4;
                    if (!!gameReplayPlayerAction.PlayerInfo[i + ""].Win && gameReplayPlayerAction.PlayerInfo[i + ""].Win.length > 1) {
                        clearPlayerInfoDelay = gameReplayPlayerAction.PlayerInfo[i + ""].Win.length * 3 + 1;
                    }
                    this.scheduleOnce(function () {
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
                            this.scheduleOnce(function () {
                                player.hideWinlight();
                            }, 4);
                        } else {
                            player.hideWinloss();
                        }
                    } else {
                        for (let j = 0; j < gameReplayPlayerAction.PlayerInfo[i + ""].Win.length; j++) {
                            let gameReplayPlayer = gameReplayPlayerAction.PlayerInfo[i + ""];
                            this.scheduleOnce(function () {
                                player.setCardType(cc.dgame.utils.getCardType(gameReplayPlayer.LevelName[j]));
                                player.highlightHoleCards(gameReplayPlayerAction.WinGenCards[j]);
                                if (gameReplayPlayer.Win[j] > 0) {
                                    player.showRMTWinner();
                                    player.setWinloss(gameReplayPlayer.Win[j]);
                                }
                            }, j * 3 + 0.1);
                            this.scheduleOnce(function () {
                                if (gameReplayPlayer.Win[j] > 0) {
                                    player.hideRMTWinner();
                                    player.hideWinloss();
                                }
                            }, (j + 1) * 3);
                        }
                    }
                }
            }
        }
        //隐藏公共牌、高亮公共牌与多牌
        for (let i = 0; i < 5; i++) {
            if (i < gameReplayPlayerAction.CommunityCards.length) {
                this._replayCommunityCards[i].active = true;
                let poker = this._replayCommunityCards[i].getChildren()[0].getComponent('Poker');
                poker.setCardPoint(gameReplayPlayerAction.CommunityCards[i]);
                poker.setFaceUp(true);
                poker.enable();
            } else {
                this._replayCommunityCards[i].active = false;
            }
        }
        //显示多牌
        if (!!gameReplayPlayerAction.RmtCard) {
            for (let i = 0; i < gameReplayPlayerAction.RmtCard.length; i++) {
                for (let j = 5 - gameReplayPlayerAction.RmtCard[i].length; j < 5; j++) {
                    this._replayRMTCommunityCards[i][j].active = true;
                    let poker = this._replayRMTCommunityCards[i][j].getChildren()[0].getComponent("Poker");
                    poker.setCardPoint(cc.dgame.utils.getCard(gameReplayPlayerAction.RmtCard[i][j - (5 - gameReplayPlayerAction.RmtCard[i].length)]));
                    poker.setFaceUp(true);
                    poker.enable();
                }
            }
        } else {
            for (let i = 0; i < this._replayRMTCommunityCards.length; i++) {
                for (let j = 0; j < this._replayRMTCommunityCards[i].length; j++) {
                    this._replayRMTCommunityCards[i][j].active = false;
                }
            }
        }
        //非结算的GameReplayAction隐藏高亮公共牌
        if (!gameReplayPlayerAction.WinGenCards) {
            for (let i = 0; i < this._replayHighlightCommunityCards.length; i++) {
                this._replayHighlightCommunityCards[i].active = false;
            }
        }
        //处理每个玩家下注、动作、余额、底牌、是否Allin，并计算当前轮下注总额
        for (var i = 0; i < 9; i++) {
            if (!!gameReplayPlayerAction.PlayerInfo[i + ""]) {
                let playerNode = this._replayPlayerAnchors['9'][i].getChildren()[0];
                let player = playerNode.getComponent('Player');
                if (!!gameReplayPlayerAction.PlayerInfo[i + ""].Operate) {
                    if (this._replayIdx == this.GameReplay.length - 1) {
                        player.hideAllActions();
                    } else {
                        player.showAction(gameReplayPlayerAction.PlayerInfo[i + ""].Operate);
                        if (gameReplayPlayerAction.PlayerInfo[i + ""].Operate == Types.PlayerOP.ALLIN) {
                            player.setAllinHead();
                        } else {
                            player.hideAllinHead();
                        }
                    }
                }
                if (!!gameReplayPlayerAction.PlayerInfo[i + ""].TurnBet) {
                    player.setBet(gameReplayPlayerAction.PlayerInfo[i + ""].TurnBet);
                } else {
                    player.setBet(0);
                }
                if (gameReplayPlayerAction.PlayerInfo[i + ""].HoleCards.length == 2) {
                    player.revealHoleCards(gameReplayPlayerAction.PlayerInfo[i + ""].HoleCards[0], gameReplayPlayerAction.PlayerInfo[i + ""].HoleCards[1]);
                } else {
                    player.hideDealCards();
                }
                player.setStack(gameReplayPlayerAction.PlayerInfo[i + ""].Balance);
                player.hideINSFlag();
            }
        }
        //显示底池与边池
        if (!!gameReplayPlayerAction.Pots[0]) {
            this._replayCurrentRoundPot.active = true;
            this._replayCurrentRoundPotNum.string = cc.dgame.utils.formatRichText(gameReplayPlayerAction.Pots[0], "#FFBC1D", true, false);
        } else {
            this._replayCurrentRoundPot.active = false;
        }
        if (gameReplayPlayerAction.Pots.length > 1) {
            for (let i = 1; i < gameReplayPlayerAction.Pots.length; i++) {
                this._replaySidePotNums[i - 1].string = cc.dgame.utils.formatRichText(gameReplayPlayerAction.Pots[i], "#FFBC1D", true, false);
                this._replaySidePots[i - 1].active = true;
            }
        } else {
            for (let i = 0; i < this._replaySidePots.length; i++) {
                this._replaySidePots[i].active = false;
            }
        }
        //显示多牌保险操作
        if (!!gameReplayPlayerAction.RmtIns) {
            if (!!gameReplayPlayerAction.RmtIns.ShowRMTOption || !!gameReplayPlayerAction.RmtIns.RMTTimesChoose || !!gameReplayPlayerAction.RmtIns.RMTTimesResult) {
                this._replayRMTOperateLayer.active = true;
                this._replayINSOperateLayer.active = false;
                if (!!gameReplayPlayerAction.RmtIns.ShowRMTOption) {
                    let playerAddr = gameReplayPlayerAction.PlayerInfo[gameReplayPlayerAction.RmtIns.ShowRMTOption.seatTurn + ""].PlayerAddr;
                    this._replayRMTLeaderAddr.string = playerAddr.substr(2, 8);
                    let idx = parseInt(playerAddr.substr(2, 2), 16);
                    if (isNaN(idx)) {
                        idx = 0;
                    }
                    this._replayRMTLeaderHead.spriteFrame = this._assetMgr.heads[idx % 200];
                    this._replayRMTResultTips.node.active = false;
                    for (let i = 0; i < this._replayRMTTimesResults.length; i++) {
                        this._replayRMTTimesResults[i].active = false;
                    }
                } else if (!!gameReplayPlayerAction.RmtIns.RMTTimesChoose && !gameReplayPlayerAction.RmtIns.RMTTimesResult) {
                    let playerAddr = gameReplayPlayerAction.PlayerInfo[gameReplayPlayerAction.RmtIns.RMTTimesChoose.seatTurn + ""].PlayerAddr;
                    this._replayRMTLeaderAddr.string = playerAddr.substr(2, 8);
                    let idx = parseInt(playerAddr.substr(2, 2), 16);
                    if (isNaN(idx)) {
                        idx = 0;
                    }
                    this._replayRMTLeaderHead.spriteFrame = this._assetMgr.heads[idx % 200];
                    this._replayRMTResultTips.node.active = false;
                    this._replayRMTTimesResults[gameReplayPlayerAction.RmtIns.RMTTimesChoose.Times - 1].active = true;
                } else if (!!gameReplayPlayerAction.RmtIns.RMTTimesChoose && !!gameReplayPlayerAction.RmtIns.RMTTimesResult) {
                    let playerAddr = gameReplayPlayerAction.PlayerInfo[gameReplayPlayerAction.RmtIns.RMTTimesChoose.seatTurn + ""].PlayerAddr;
                    this._replayRMTLeaderAddr.string = playerAddr.substr(2, 8);
                    let idx = parseInt(playerAddr.substr(2, 2), 16);
                    if (isNaN(idx)) {
                        idx = 0;
                    }
                    this._replayRMTLeaderHead.spriteFrame = this._assetMgr.heads[idx % 200];
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
                    let playerAddr = gameReplayPlayerAction.PlayerInfo[gameReplayPlayerAction.RmtIns.ShowINS.seatTurn + ""].PlayerAddr;
                    this._replayINSLeaderAddr.string = playerAddr.substr(2, 8);
                    let idx = parseInt(playerAddr.substr(2, 2), 16);
                    if (isNaN(idx)) {
                        idx = 0;
                    }
                    this._replayINSLeaderHead.spriteFrame = this._assetMgr.heads[idx % 200];
                    let totalSecureBuy = 0;
                    let totalFullPotBuy = 0;
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
                        let assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");
                        for (let i = 0; i < this._replayINSTwoPotsMainPotOuts.childrenCount; i++) {
                            this._replayINSTwoPotsMainPotOuts.children[i].active = false;
                        }
                        for (let i = 0; i < gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.Outs.length && i < this._replayINSTwoPotsMainPotOuts.children.length; i++) {
                            let carNode = this._replayINSTwoPotsMainPotOuts.children[i];
                            carNode.getComponent(cc.Sprite).spriteFrame = assetMgr.cards0[gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.Outs[i]];
                            carNode.active = true;
                        }
                        for (let i = 0; i < this._replayINSTwoPotsSidePotOuts.childrenCount; i++) {
                            this._replayINSTwoPotsSidePotOuts.children[i].active = false;
                        }
                        for (let i = 0; i < gameReplayPlayerAction.RmtIns.ShowINS.Pots.SidePot.Outs.length && i < this._replayINSTwoPotsSidePotOuts.children.length; i++) {
                            let carNode = this._replayINSTwoPotsSidePotOuts.children[i];
                            carNode.getComponent(cc.Sprite).spriteFrame = assetMgr.cards0[gameReplayPlayerAction.RmtIns.ShowINS.Pots.SidePot.Outs[i]];
                            carNode.active = true;
                        }
                    } else {
                        this._replayINSOnePotLayer.active = true
                        this._replayINSTwoPotsLayer.active = false;
                        this._replayINSOnePotPotNum.string = gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.PotNum;
                        this._replayINSOnePotOdds.string = gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.OddsValue;
                        this._replayINSOnePotOutsNum.string = gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.Outs.length;
                        let assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");
                        for (let i = 0; i < this._replayINSOnePotMainPotOuts.childrenCount; i++) {
                            this._replayINSOnePotMainPotOuts.children[i].active = false;
                        }
                        for (let i = 0; i < gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.Outs.length && i < this._replayINSOnePotMainPotOuts.children.length; i++) {
                            let carNode = this._replayINSOnePotMainPotOuts.children[i];
                            carNode.getComponent(cc.Sprite).spriteFrame = assetMgr.cards0[gameReplayPlayerAction.RmtIns.ShowINS.Pots.MainPot.Outs[i]];
                            carNode.active = true;
                        }
                    }
                } else if (!!gameReplayPlayerAction.RmtIns.ShowPlayerINS) {
                    let totalAmount = 0;
                    for (let i = 0; i < gameReplayPlayerAction.RmtIns.ShowPlayerINS.amount.length; i++) {
                        totalAmount += gameReplayPlayerAction.RmtIns.ShowPlayerINS.amount[i]
                    }
                    let playerNode = this._replayPlayerAnchors['9'][gameReplayPlayerAction.RmtIns.ShowPlayerINS.seatTurn].getChildren()[0];
                    let player = playerNode.getComponent('Player');
                    player.showINSFlag(totalAmount, true);
                } else if (!!gameReplayPlayerAction.RmtIns.InsWinInfo) {
                    let playerNode = this._replayPlayerAnchors['9'][gameReplayPlayerAction.RmtIns.InsWinInfo.BuyerSeat].getChildren()[0];
                    let player = playerNode.getComponent('Player');
                    let mainWin = gameReplayPlayerAction.RmtIns.InsWinInfo.InsWin[0];
                    if (mainWin > 0) {
                        player.insurancePayToPlayer(cc.v2(cc.winSize.width/2,cc.winSize.height-350), 0.6);
                    } else if (mainWin < 0) {
                        player.playerPayToInsurance(cc.v2(cc.winSize.width/2,cc.winSize.height-350), 0.6);
                    }
                    let sideWin = gameReplayPlayerAction.RmtIns.InsWinInfo.InsWin[1];
                    if (sideWin != 0) {
                        this.scheduleOnce(function () {
                            if (sideWin > 0) {
                                player.insurancePayToPlayer(cc.v2(cc.winSize.width/2,cc.winSize.height-350), 0.6);
                            } else if (sideWin < 0) {
                                player.playerPayToInsurance(cc.v2(cc.winSize.width/2,cc.winSize.height-350), 0.6);
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

    _showReplayActions () {
        this._showReplayAction();
        if (this._replayIdx + 1 >= this.GameReplay.length) {
            this._stopReplay();
        } else {
            this._replayIdx++;
        }
    },

    onBtnCloseClicked () {
        this._gameReplayPopup.active = false;
    },

    onBtnPlayClicked () {
        this._startReplay();
    },

    onBtnPauseClicked () {
        this._stopReplay();
    },

    onBtnReplayClicked () {
        let gameResult = cc.dgame.gameReviewPopup.GameResults[cc.dgame.gameReviewPopup.Idx];
        Log.Trace('[onBtnReplayClicked] Play TableId: ' + gameResult.TableId + ', Hand: ' + gameResult.Hand);
        this.replay(gameResult.Hand);
    },

    onBtnPrevHandClicked () {
        if (cc.dgame.gameReviewPopup.Idx > 0 && !!cc.dgame.gameReviewPopup.GameResults[cc.dgame.gameReviewPopup.Idx - 1]) {
            this._stopReplay();
            cc.dgame.gameReviewPopup.Idx--;
            this.onBtnReplayClicked();
        }
    },

    onBtnPrevMoveClicked () {
        if (this._replayIdx > 0 && !!this.GameReplay[this._replayIdx - 1]) {
            this._stopReplay();
            this._replayIdx--;
            this._showReplayAction();
        }
    },

    onBtnNextMoveClicked () {
        if (this._replayIdx < this.GameReplay.length - 1 && !!this.GameReplay[this._replayIdx + 1]) {
            this._stopReplay();
            this._replayIdx++;
            this._showReplayAction();
        }
    },

    onBtnNextHandClicked () {
        if (cc.dgame.gameReviewPopup.Idx < cc.dgame.gameReviewPopup.GameResults.length - 1 && !!cc.dgame.gameReviewPopup.GameResults[cc.dgame.gameReviewPopup.Idx + 1]) {
            this._stopReplay();
            cc.dgame.gameReviewPopup.Idx++;
            this.onBtnReplayClicked();
        }
    },

    onBtnFirstStepClicked() {
        this._stopReplay();
        this._replayIdx = 0;
        this._showReplayAction();
    },

    onBtnEndStepClicked() {
        this._stopReplay();
        this._replayIdx = this.GameReplay.length - 1;
        this._showReplayAction();
    },
    
    onDestroy () {
        if (!!cc.dgame) {
            cc.dgame.gameReplayPopup = null;
        }
    }
    // update (dt) {},
});
