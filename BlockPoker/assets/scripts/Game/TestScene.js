var Types = require('Types');
var PositionData = require('PositionData');
var Log = require('Log');

var GameTable = cc.Class({
    extends: cc.Component,

    properties: {
        //菜单栏
        mainMenuPopup: cc.Node,         //弹出式主菜单
        checkoutExitToast: cc.Node,     //结算离桌提示框
        buyinGoldDialog: cc.Node,       //带入金币对话框
        withdrawGoldDialog: cc.Node,    //撤回金币对话框
        KALExchangeToGoldDialog: cc.Node, //KAL转金币对话框
        gameReviewPopup: cc.Node,       //牌局回顾侧菜单
        gameReplayPopup: cc.Node,       //牌局回放界面
        debugInfo: cc.Label,            //调试信息
        //预制资源
        playerPrefab: cc.Prefab,        //玩家预制资源
        pokerPrefab: cc.Prefab,         //牌预制资源
        //底池区域
        potLayer: cc.Node,              //底池图层
        potNum: cc.RichText,            //本局底池筹码数
        currentPotLayer: cc.Node,       //本轮底池图层
        currentRoundPotNum: cc.RichText,//本轮下注筹码与底池的总和，即总底池数
        sidePots: [cc.Node],            //边池图层
        sidePotNums: [cc.RichText],        //边池筹码数
        dealerMark: cc.Node,            //庄家标识，BlindInfo盲注信息中有
        actionIdentifter: cc.Node,      //玩家行动指示标
        replayCurrentRoundPotNum: cc.Label,   //牌局回放本轮下注筹码与底池的总和，即总底池数
        replaySidePots: [cc.Node],      //牌局回放边池图层
        replaySidePotNums: [cc.Label],  //牌局回放边池筹码数
        //4人桌
        tableFor4Layer: cc.Node,        //4人桌图层
        playerAnchorsFor4: [cc.Node],   //4人桌各玩家位置
        replayTableFor4Layer: cc.Node,  //牌局回放4人桌图层
        replayPlayerAnchorsFor4: [cc.Node],   //牌局回放4人桌各玩家位置
        //6人桌
        tableFor6Layer: cc.Node,        //6人桌图层
        playerAnchorsFor6: [cc.Node],   //6人桌各玩家位置
        replayTableFor6Layer: cc.Node,  //牌局回放8人桌图层
        replayPlayerAnchorsFor6: [cc.Node],   //牌局回放8人桌各玩家位置
        //8人桌
        tableFor8Layer: cc.Node,        //8人桌图层
        playerAnchorsFor8: [cc.Node],   //8人桌各玩家位置
        replayTableFor8Layer: cc.Node,  //牌局回放8人桌图层
        replayPlayerAnchorsFor8: [cc.Node],   //牌局回放8人桌各玩家位置
        //9人桌
        tableFor9Layer: cc.Node,        //9人桌图层
        playerAnchorsFor9: [cc.Node],   //9人桌各玩家位置
        //盲注信息区域
        blindInfo: cc.Label,
        securityTipsBackground: cc.Node,
        securityTips: cc.Label,
        //公共牌区域
        dealPublicCards: [cc.Node],     //能发牌、移动翻转的公共牌
        replayPublicCards: [cc.Node],   //牌局回放公共牌
        //自身玩家操作区域
        selfHoleCards: [cc.Node],       //摊牌阶段两张底牌最终位置效果，Allin或到摊牌阶段会翻转显示，即holeCard_1、holeCard_2
        cardType: cc.Label,             //牌型，无论是否弃牌均显示
        disabledFold: cc.Node,          //禁用的弃牌，点击后到行动时间时自动弃牌
        btnFold: cc.Node,               //弃牌，带倒计时
        btnCheck: cc.Node,              //看牌，带倒计时
        btnCall: cc.Node,               //跟牌
        callNum: cc.RichText,           //跟注的筹码数
        btnFreeRaise: cc.Node,          //自由加注
        freeRaiseStackNum: cc.Label,    //玩家筹码数
        btnAllin: cc.Node,              //Allin
        allinStackNum: cc.Label,        //玩家筹码数
        btnHalfPotRaise: cc.Node,       //半池加注
        halfPotRaiseNum: cc.Label,      //半池加注筹码数
        btnTwoThirdPotRaise: cc.Node,   //2/3底池加注
        twoThirdPotRaiseNum: cc.Label,  //2/3底池加注筹码数
        btnPotRaise: cc.Node,           //底池加注
        potRaiseNum: cc.Label,          //底池加注筹码数
        freeRaiseSlider: cc.Slider,     //自由加注滑动条
        betRatio: cc.Label,             //下注筹码占财富额的比例
        freeRaiseChipsNum: cc.Label,    //自由加注筹码数
        winlightLayer: cc.Node,         //玩家赢了的动画效果
        //等待界面
        normalLoadingLayer: cc.Node,
        normalLoadingIcon: cc.Node,
    },

    statics: {
        instance: null
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log("TestScene: onLoad");
        cc.dgame.tableInfo = {"Ante":"0","BuyinMax":"40000","BuyinMin":"4000","CurrentStatu":2,"MaxNum":9,"MinNum":2,"PlayerNum":2,"SmallBlind":"100","Straddle":0,"TableId":4222124650659841};
        for (let i = 0; i < this.selfHoleCards.length; i++) {
            let cardNode = cc.instantiate(this.pokerPrefab);
            this.selfHoleCards[i].addChild(cardNode);
            let poker = cardNode.getComponent('Poker');
            poker.init(0, 0);
            poker.setFaceUp(false);
        }
        for (let i = 0; i < this.dealPublicCards.length; i++) {
            let cardNode = cc.instantiate(this.pokerPrefab);
            this.dealPublicCards[i].addChild(cardNode);
            let poker = cardNode.getComponent('Poker');
            poker.init(0, 0);
            poker.setFaceUp(false);
        }
/*        for (let i = 0; i < this.replayPublicCards.length; i++) {
            let cardNode = cc.instantiate(this.pokerPrefab);
            this.replayPublicCards[i].addChild(cardNode);
            let poker = cardNode.getComponent('Poker');
            poker.init(0, 0);
            poker.setFaceUp(false);
            this.replayPublicCards[i].scale = 0.8;
        }*/
        this._initFreeRaiseSlider();
        this.schedule(this._dispatchGameEvent, 1);  //此定时器检测本局游戏玩家及手牌都具备后开始发牌动画
        cc.dgame.tableInfo.RawGameEventQueue = {};   //以手数为下标的GameEvent消息队列，消息来临时插入手数为HandQueue[len(HandQueue)-1]的消息队列中
        cc.dgame.tableInfo.HandQueue = new Array();  //手数队列，HandQueue[0]为当前手数，onStartGame时退出第一个，插入新的手数
        cc.dgame.tableInfo.DealCardFlag = {};        //以手数为下标的发牌标志，收到当前手的BlindInfo和第一个TurnInfo才可以发牌
        cc.dgame.tableInfo.AnimationTimerCount = 0;    //动画定时器个数，需要长时间动画加一，动画结束减一，_dispatchGameEvent要等此值为零时才处理GameEvent消息
        cc.dgame.tableInfo.SelfReady = false;
        cc.dgame.tableInfo.ContractStatus = Types.ContractStatus.NOTJOIN;
        cc.dgame.tableInfo.ListenEvents = false;
        cc.dgame.tableInfo.IsRecover = false;
        this.gameReview = {};
        this.gameReview.GameResults = new Array();
        this.gameReview.GameReplays = {};
        cc.dgame.mainMenuPopup.updateStatus();
        this._resetGameTable();
        Log.Debug('[GameTable:onLoad] ' + JSON.stringify(cc.dgame.tableInfo));
        if (cc.dgame.tableInfo === null || cc.dgame.tableInfo.TableId === null || cc.dgame.tableInfo.TableId === undefined || parseInt(cc.dgame.tableInfo.TableId) == 0) {
            cc.director.loadScene('GameHall');
            return;
        }
        //座位编号规则：
        //最底为0号位，自身玩家的位置，后面的位置从0号位开始顺时针按顺序排号，玩家任意选座后会以距离0号位置最近的方向（顺时针/逆时针）旋转至0号位置坐下
        this.playerTables = {};
        this.playerAnchors = {};
        //4人桌各位置使用的预制资源
        this.playerTables['4'] = this.tableFor4Layer;
        this.playerAnchors['4'] = this.playerAnchorsFor4;
        //6人桌各位置使用的预制资源
        this.playerTables['6'] = this.tableFor6Layer;
        this.playerAnchors['6'] = this.playerAnchorsFor6;
        //8人桌各位置使用的预制资源
        this.playerTables['8'] = this.tableFor8Layer;
        this.playerAnchors['8'] = this.playerAnchorsFor8;
        //9人桌各位置使用的预制资源
        this.playerTables['9'] = this.tableFor9Layer;
        this.playerAnchors['9'] = this.playerAnchorsFor9;
        //根据最大玩家数显示各玩家位置
        this._maxPlayers = 9;
        this._maxPlayerStr = "9";
        this.playerTables[this._maxPlayerStr].active = true;
        console.log("screen: " + cc.winSize.width + "x" + cc.winSize.height);
        let gametable = cc.find("Canvas/bg_gamehall/bg_gametable");
        let gametable_long = cc.find("Canvas/bg_gamehall/bg_gametable_long");
        let btnmenu = cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BtnMainMenu");
        btnmenu.getComponent(cc.Widget).updateAlignment();  //使对齐生效，否则下面获取到的还是原设计的坐标
        let menuv2 = btnmenu.convertToWorldSpaceAR(cc.v2(0, 0));
        console.log("btnMenu: (" + menuv2.x + ", " + menuv2.y + "), " + btnmenu.width + "x" + btnmenu.height);
        let gametablev2 = gametable.convertToWorldSpaceAR(cc.v2(0, 0));
        console.log("gametable: (" + gametablev2.x + ", " + gametablev2.y + "), " + gametable.width + "x" + gametable.height);
        let gametable_longv2 = gametable_long.convertToWorldSpaceAR(cc.v2(0, 0));
        console.log("gametable_long: (" + gametable_longv2.x + ", " + gametable_longv2.y + "), " + gametable_long.width + "x" + gametable_long.height);
        let newOriginWorldPT = null;
        if (cc.winSize.height / cc.winSize.width > 2) {
            gametable.active = false;
            gametable_long.active = true;
            newOriginWorldPT = cc.v2(gametable_longv2.x, (menuv2.y - btnmenu.height / 2)/2);
            console.log("newOriginWorldPT: (" + newOriginWorldPT.x + ", " + newOriginWorldPT.y + ")");
            let newNodePT = gametable_long.parent.convertToNodeSpaceAR(newOriginWorldPT);
            console.log("newNodePT: (" + newNodePT.x + ", " + newNodePT.y + ")");
            gametable_long.setPosition(gametable_long.parent.convertToNodeSpaceAR(newOriginWorldPT));
        } else {
            gametable.active = true;
            gametable_long.active = false;
            newOriginWorldPT = cc.v2(gametablev2.x, (menuv2.y - btnmenu.height / 2)/2);
            console.log("newOriginWorldPT: (" + newOriginWorldPT.x + ", " + newOriginWorldPT.y + ")");
            let newNodePT = gametable_long.parent.convertToNodeSpaceAR(newOriginWorldPT);
            console.log("newNodePT: (" + newNodePT.x + ", " + newNodePT.y + ")");
            gametable.setPosition(gametable.parent.convertToNodeSpaceAR(newOriginWorldPT));
        }
        for (var i = 0; i < this._maxPlayers; i++) {
            let playerAnchor = this.playerAnchors[this._maxPlayerStr][i];
            if (gametable.active) {
                let newOrg = gametable.getPosition();
                playerAnchor.setPosition(PositionData.GameTablePlayerAnchorPositions[i].x + newOrg.x, PositionData.GameTablePlayerAnchorPositions[i].y + newOrg.y);
                console.log("player " + i + ", from: (" + PositionData.GameTablePlayerAnchorPositions[i].x + ", " + PositionData.GameTablePlayerAnchorPositions[i].y + ") to (" + (PositionData.GameTablePlayerAnchorPositions[i].x + newOrg.x) + ", " + (PositionData.GameTablePlayerAnchorPositions[i].y + newOrg.y) + ")");
            } else {
                let newOrg = gametable_long.getPosition();
                playerAnchor.setPosition(PositionData.GameTableLongPlayerAnchorPositions[i].x + newOrg.x, PositionData.GameTableLongPlayerAnchorPositions[i].y + newOrg.y);
                console.log("player " + i + ", from: (" + PositionData.GameTableLongPlayerAnchorPositions[i].x + ", " + PositionData.GameTableLongPlayerAnchorPositions[i].y + ") to (" + (PositionData.GameTableLongPlayerAnchorPositions[i].x + newOrg.x) + ", " + (PositionData.GameTableLongPlayerAnchorPositions[i].y + newOrg.y) + ")");
            }
            let playerNode = cc.instantiate(this.playerPrefab);
            playerAnchor.addChild(playerNode);
            let player = playerNode.getComponent('Player');
            player.initPlayerByTablePos(this._maxPlayers, i);
            // player.startCountDown(15);
            if (i == 0) {
                let holeCardsLayer = cc.find("Canvas/HoldCardsLayer");
                let selfHeadWorldPT = playerAnchor.convertToWorldSpaceAR(cc.v2(0, 0));
                let newHoleCardsWorldPT = cc.v2(selfHeadWorldPT.x, selfHeadWorldPT.y + 168);//168=牌高度一半+牌和头30+头高度一半
                holeCardsLayer.setPosition(holeCardsLayer.parent.convertToNodeSpaceAR(newHoleCardsWorldPT));
                //player.btnBackToPlay.active = true;
                //var seq = cc.sequence(cc.moveBy(0.5, 200, 0), cc.moveBy(0.5, -200, 0));                
                //playerNode.runAction(seq);
//                var spawn = cc.spawn(cc.moveBy(0.5, 0, 50), cc.scaleTo(0.5, 0.8, 1.4));
//                playerNode.runAction(spawn);
            }
        }
        //显示牌局盲注信息
        this.blindInfo.string = cc.dgame.tableInfo.SmallBlind + '/' + (cc.dgame.tableInfo.SmallBlind * 2).toString();
        if (cc.dgame.tableInfo.Straddle !== 0) {
            this.blindInfo.string += '/' + (cc.dgame.tableInfo.SmallBlind * 4).toString();
        }
        if (cc.dgame.tableInfo.Ante > 0) {
            this.blindInfo.string += '(' + cc.dgame.tableInfo.Ante + ')';
        }
        this.freeRaiseSlider.progress = 0;
        this.potLayer.active = true;
        this.currentPotLayer.active = true;
        this.testCase2();
    },

    start () {

    },

    //自由加注滑动条初始化
    _initFreeRaiseSlider () {
        let handler = cc.find('Canvas/OperatePanelLayer/btnFreeRaise/RaiseSlider/Handle');
        this.freeRaiseSlider.progress = 0;
        this._freeRaiseStartPos = handler.convertToWorldSpaceAR(cc.v2(0, 0));
        this.freeRaiseSlider.progress = 1;
        this._freeRaiseEndPos = handler.convertToWorldSpaceAR(cc.v2(0, 0));
        this.freeRaiseSlider.progress = 0;
        this.btnFreeRaise.on('touchstart', this._onBtnFreeRaiseTouchStart, this);
        this.btnFreeRaise.on('touchmove', this._onBtnFreeRaiseTouchMove, this);
        this.btnFreeRaise.on('touchend', this._onBtnFreeRaiseTouchEnd, this);
        this.btnFreeRaise.on('touchcancel', this._onBtnFreeRaiseTouchEnd, this);
    },

    //重置牌桌信息
    _resetGameTable () {
        cc.dgame.tableInfo.StartAction = false;    //_handleBlindInfo置为true
        cc.dgame.tableInfo.TurnInfoList = new Array;    //用于计算上个玩家操作了什么Action
        cc.dgame.tableInfo.SidePot = new Array();
        cc.dgame.tableInfo.Stage = Types.TexasStage.PREFLOP;
        this._dealCardPlayerPosArray = new Array;
        //公共牌牌面向下并隐藏
        for (let i = 0; i < this.dealPublicCards.length; i++) {
            let poker = this.dealPublicCards[i].getChildren()[0].getComponent('Poker');
            poker.setFaceUp(false);
            this.dealPublicCards[i].active = false;
        }
        //边池重置
        for (let i = 0; i < this.sidePots.length; i++) {
            this.sidePots[i].setPosition(PositionData.SidePotPositions[i].x, PositionData.SidePotPositions[i].y);
            this.sidePotNums[i].string = cc.dgame.utils.formatRichText(0, "#FFBC1D", true, false);
            this.sidePots[i].active = false;
        }
        this.selfHoleCards[0].active = false;
        this.selfHoleCards[1].active = false;
        this.selfHoleCards[0].getChildren()[0].getComponent('Poker').enable();
        this.selfHoleCards[1].getChildren()[0].getComponent('Poker').enable();
        this.selfHoleCards[0].getChildren()[0].getComponent('Poker').stopAllin();
        this.selfHoleCards[1].getChildren()[0].getComponent('Poker').stopAllin();
        this.potLayer.active = false;
        this.currentPotLayer.active = false;
        if (cc.dgame.tableInfo.AnimationTimerCount > 0) {
            cc.dgame.tableInfo.AnimationTimerCount--;
            Log.Trace('[_resetGameTable] AnimationTimerCount(-1): ' + cc.dgame.tableInfo.AnimationTimerCount);
        }
    },

    _dispatchGameEvent () {
    },

    testCase0 () {
        let potPos = cc.find('Canvas/PotLayer').convertToWorldSpaceAR(cc.v2(0, 0));
        let sidePotPos = cc.find('Canvas/PotLayer/SidePotLayer').convertToWorldSpaceAR(cc.v2(0, 0));
        for (let i = 0; i < cc.dgame.tableInfo.MaxNum; i++) {
            let playerAnchor = this.playerAnchors[this._maxPlayerStr][i];
            let player = playerAnchor.getChildren()[0].getComponent('Player');
            player.initPlayerInfo(i, '', 'test' + i, (i+1) * 1000, Types.ContractStatus.PLAYING);
            if (i != 0) {
                player.dealCards(0.05 * i, 0.05 * this._maxPlayers + 0.05 * i, potPos, 0.2);
            } else {
                let holeCard1Pos = cc.find('Canvas/HoldCardsLayer/HoldCard_1').convertToWorldSpaceAR(cc.v2(0, 0));
                let holeCard2Pos = cc.find('Canvas/HoldCardsLayer/HoldCard_2').convertToWorldSpaceAR(cc.v2(0, 0));
                player.dealCardsPlayerMyself(0.05 * i, 0.05 * this._maxPlayers + 0.05 * i, potPos, holeCard1Pos, holeCard2Pos, 0.2, 1);
                this.scheduleOnce(function () {
                    player.hideDealCards();
                    let pointsArr = new Array;
                    pointsArr.push(cc.dgame.utils.getCard('红心K'));
                    pointsArr.push(cc.dgame.utils.getCard('红心A'));
                    for (let j = 0; j < this.selfHoleCards.length; j++) {
                        this.selfHoleCards[j].active = true;
                        let poker = this.selfHoleCards[j].getChildren()[0].getComponent('Poker');
                        let dstv2 = this.selfHoleCards[j].convertToWorldSpaceAR(cc.v2(0, 0));
                        poker.setCardPoint(pointsArr[j]);
                        poker.flipCard(dstv2, this.selfHoleCards[j].scale);
                        poker.setFaceUp(true);
                    }
                }, 4);
            }
            if (i % 2 != 0) {
                this.scheduleOnce(function () {
                    player.revealHoleCards(cc.dgame.utils.getCard('黑桃K'), cc.dgame.utils.getCard('黑桃A'))
                    this.selfHoleCards[0].getChildren()[0].getComponent('Poker').playAllin();
                    this.selfHoleCards[1].getChildren()[0].getComponent('Poker').playAllin();
                }, 4);
            }
            this.scheduleOnce(function () {
                if (i == 0) {
                    player.setCardType("Royal flush");
                } else if (i == 1) {
                    player.setCardType("Straight flush");
                } else if (i == 2) {
                    player.setCardType("Four of a kind");
                } else if (i == 3) {
                    player.setCardType("Full house");
                } else if (i == 4) {
                    player.setCardType("Flush");
                } else if (i == 5) {
                    player.setCardType("Straight");
                } else if (i == 6) {
                    player.setCardType("Three of a kind");
                } else if (i == 7) {
                    player.setCardType("Two pairs");
                } else if (i == 8) {
                    player.setCardType("One pair");
                }
                player.setWinloss("+1000");
            });
            if (i != 0) {
                this.scheduleOnce(function () {
                    let playerARWorldPt = playerAnchor.convertToWorldSpaceAR(cc.v2(0, 0));
                    let angle = Math.atan2(sidePotPos.y - playerARWorldPt.y, sidePotPos.x - playerARWorldPt.x) * 180 / Math.PI - 90;
                    player.foldCards(playerARWorldPt, playerARWorldPt, sidePotPos, angle, 0.5);
                }, 12);
            } else {
                this.scheduleOnce(function () {
                    let holecard1ARWorldPt = this.selfHoleCards[0].convertToWorldSpaceAR(cc.v2(0, 0));
                    let holecard2ARWorldPt = this.selfHoleCards[1].convertToWorldSpaceAR(cc.v2(0, 0));
                    player.foldCards(holecard1ARWorldPt, holecard2ARWorldPt, sidePotPos, 0, 1);
                    this.selfHoleCards[0].getChildren()[0].getComponent('Poker').disable();
                    this.selfHoleCards[1].getChildren()[0].getComponent('Poker').disable();
                    this.selfHoleCards[0].getChildren()[0].getComponent('Poker').stopAllin();
                    this.selfHoleCards[1].getChildren()[0].getComponent('Poker').stopAllin();
                }, 12);
            }
        }
    },

    testCase2 () {
        this.securityTips.string = "Hello world";
        // 计算宽
        this.securityTips.overflow = cc.Label.Overflow.NONE;
        this.securityTips.node.setContentSize(new cc.Size(0, 42));
        this.securityTips._forceUpdateRenderData();
        let textWidth = Math.min(this.securityTips.node.width, 450);
        textWidth = Math.floor(textWidth / 30) * 30;

        // 计算高
        this.securityTips.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        this.securityTips.node.setContentSize(new cc.Size(textWidth, 0));
        this.securityTips._forceUpdateRenderData();
        let textHeight = this.securityTips.node.height;

        this.securityTips.node.width = textWidth;
        this.securityTips.node.height = textHeight;

        this.securityTipsBackground.parent.active = true;
        this.securityTipsBackground.width = this.securityTips.node.width + 60;
        this.securityTipsBackground.height = this.securityTips.node.height + 15;
        if (this.securityTipsBackground.parent.opacity == 255) {
            this.securityTipsBackground.parent.runAction(
                cc.sequence(
                    cc.delayTime(1.5),
                    cc.fadeOut(1),
                )
            );
        }
        this.scheduleOnce(function () {
            console.log("this.securityTipsBackground: " + this.securityTipsBackground);
            console.log("this.securityTips: " + this.securityTips);
        }, 5);
        this.scheduleOnce(function () {
            //this.currentPotLayer.active = false;
            this.currentRoundPotNum.string = cc.dgame.utils.formatRichText("300", "#ffffff", true, false);
            this.currentRoundPotNum.node.opacity = 153;
            //this.currentPotLayer.active = true;
        }, 4);
        this.scheduleOnce(function () {
            //this.currentPotLayer.active = false;
            this.currentRoundPotNum.string = cc.dgame.utils.formatRichText(400, "#ffffff", true, false);
            this.currentRoundPotNum.node.opacity = 153;
            //this.currentPotLayer.active = true;
        }, 8);
        this.scheduleOnce(function () {
            //this.currentPotLayer.active = false;
            this.currentRoundPotNum.string = cc.dgame.utils.formatRichText(500, "#ffffff", true, false);
            this.currentRoundPotNum.node.opacity = 153;
            //this.currentPotLayer.active = true;
        }, 12);
        this.actionIdentifter.active = true;
        let orgHeight = this.actionIdentifter.height;
        let srcPos = this.actionIdentifter.convertToWorldSpaceAR(cc.v2(0, 0));
        let playerAnchor = this.playerAnchors[this._maxPlayerStr][0];
        let dstPos = playerAnchor.convertToWorldSpaceAR(cc.v2(0, 0));
        this.actionIdentifter.height = dstPos.sub(srcPos).mag() + 140 / 2;
        for (let i = 0; i < this._maxPlayers; i+=2) {
            this.scheduleOnce(function () {
                let srcPos = this.actionIdentifter.convertToWorldSpaceAR(cc.v2(0, 0));
                let dstPos = this.playerAnchors[this._maxPlayerStr][(i+2) % this._maxPlayers].convertToWorldSpaceAR(cc.v2(0, 0));
                let lastPos = this.playerAnchors[this._maxPlayerStr][i].convertToWorldSpaceAR(cc.v2(0, 0));
                let oldVec = lastPos.sub(srcPos);
                let newVec = dstPos.sub(srcPos);
                let newHeight = dstPos.sub(srcPos).mag() + 135 / 2;
                this.actionIdentifter.stopAllActions();
                this.actionIdentifter.height = orgHeight;
                this.actionIdentifter.runAction(
                    cc.spawn(
                        cc.scaleTo(0.2, 1, newHeight / orgHeight),
                        cc.rotateBy(0.2, oldVec.signAngle(newVec) / Math.PI * 180),
                    )
                );
            }, 2 * (i+1));
        }
    },

    testCase_ () {
        cc.dgame.tableInfo = {};
        this._resetGameTable();
        this._maxPlayers = 8;
        this._maxPlayerStr = this._maxPlayers + '';
        this.playerTables = {};
        this.playerAnchors = {};
        //4人桌各位置使用的预制资源
        this.playerTables[this._maxPlayers] = this.tableFor8Layer;
        this.playerTables[this._maxPlayers].active = true;
        this.playerAnchors[this._maxPlayers] = this.playerAnchorsFor8;
        // this._selfPlayerWin(true);
        // this.scheduleOnce(function () {
        //     this._selfPlayerWin(false);
        // }, 4);
//         let potPos = cc.find('Canvas/PotLayer').convertToWorldSpaceAR(cc.v2(0, 0));
//         let sidePotPos = cc.find('Canvas/PotLayer/SidePotLayer').convertToWorldSpaceAR(cc.v2(0, 0));
//         for (var i = 0; i < 8; i++) {
//             let playerAnchor = this.playerAnchors[this._maxPlayers][i];
//             let playerNode = cc.instantiate(this.playerPrefab);
//             playerAnchor.addChild(playerNode);
//             let player = playerNode.getComponent('Player');
//             player.initPlayerByTablePos(this._maxPlayers, i);
//             // if (i == 5) {
//             //     player.initPlayerInfo(5, '', test', 2000, Types.ContractStatus.SEATED);
//             // } else {
//                 player.initPlayerInfo(i, '', 'test' + i, (i+1) * 1000, Types.ContractStatus.SEATED);
//                 // if (i != 0) {
//                 //     player.dealCards(0.05 * i, 0.05 * 8 + 0.05 * i, potPos, 0.2);
//                 // } else {
//                 //     let holeCard1Pos = cc.find('Canvas/HoldCardsLayer/HoldCard_1').convertToWorldSpaceAR(cc.v2(0, 0));
//                 //     let holeCard2Pos = cc.find('Canvas/HoldCardsLayer/HoldCard_2').convertToWorldSpaceAR(cc.v2(0, 0));
//                 //     player.dealCardsPlayerMyself(0.05 * i, 0.05 * 8 + 0.05 * i, potPos, holeCard1Pos, holeCard2Pos, 0.2, 1);
//                 //     this.scheduleOnce(function () {
//                 //         player.hideDealCards();
//                 //         let pointsArr = new Array;
//                 //         pointsArr.push(cc.dgame.utils.getCard('红心K'));
//                 //         pointsArr.push(cc.dgame.utils.getCard('红心A'));
//                 //         for (let j = 0; j < this.selfHoleCards.length; j++) {
//                 //             let poker = this.selfHoleCards[j].getChildren()[0].getComponent('Poker');
//                 //             let dstv2 = this.selfHoleCards[j].convertToWorldSpaceAR(cc.v2(0, 0));
//                 //             poker.setCardPoint(pointsArr[j]);
//                 //             poker.flipCard(dstv2, this.selfHoleCards[j].scale);
//                 //             this.selfHoleCards[j].active = true;
//                 //         }
//                 //     }, 4);
//                 // }
//                 // if (i % 2 != 0) {
//                 //     this.scheduleOnce(function () {
//                 //         player.revealHoleCards(cc.dgame.utils.getCard('黑桃K'), cc.dgame.utils.getCard('黑桃A'))
//                 //         this.selfHoleCards[0].getChildren()[0].getComponent('Poker').playAllin();
//                 //         this.selfHoleCards[1].getChildren()[0].getComponent('Poker').playAllin();
//                 //     }, 4);
//                 // }
//                 // if (i != 0) {
//                 //     this.scheduleOnce(function () {
//                 //         let playerARWorldPt = playerAnchor.convertToWorldSpaceAR(cc.v2(0, 0));
//                 //         let angle = Math.atan2(sidePotPos.y - playerARWorldPt.y, sidePotPos.x - playerARWorldPt.x) * 180 / Math.PI - 90;
//                 //         player.foldCards(playerARWorldPt, playerARWorldPt, sidePotPos, angle, 0.5);
//                 //     }, 8);
//                 // } else {
//                 //     this.scheduleOnce(function () {
//                 //         let holecard1ARWorldPt = this.selfHoleCards[0].convertToWorldSpaceAR(cc.v2(0, 0));
//                 //         let holecard2ARWorldPt = this.selfHoleCards[1].convertToWorldSpaceAR(cc.v2(0, 0));
//                 //         player.foldCards(holecard1ARWorldPt, holecard2ARWorldPt, sidePotPos, 0, 1);
//                 //         this.selfHoleCards[0].getChildren()[0].getComponent('Poker').disable();
//                 //         this.selfHoleCards[1].getChildren()[0].getComponent('Poker').disable();
//                 //         this.selfHoleCards[0].getChildren()[0].getComponent('Poker').stopAllin();
//                 //         this.selfHoleCards[1].getChildren()[0].getComponent('Poker').stopAllin();
//                 //     }, 8);
//                 // }
//                 player.setBet((i+1) * 100);
//                 this.scheduleOnce(function () {
//                     player.chipsToPot();
//                 }, 3);
//                 // this.scheduleOnce(function () {
//                 //     player.winPot(potPos, 2);
//                 // }, 4);
//                 // this.scheduleOnce(function () {
//                 //     player.winPot(potPos, 1);
//                 // }, 5);
//                 if (i == 0) {
//                     this.playerMyself = playerNode;
//                     // player.setWinlight();
//                     // this.scheduleOnce(function () {
//                     //     player.hideWinlight();
//                     // }, 4);
//                     //this.btnFreeRaise.active = true;
//                     //player.setFreeRaise();
//                     // player.setBet((i+1) * 100);
//                     // player.setDealerMark();
//                     // this.scheduleOnce(function () {
//                     //     player.hideBet();
//                     //     player.setBet(5000);
//                     // }, 5);
//                     // this.scheduleOnce(function () {
//                     //     player.hideBet();
//                     //     player.setBet(8000);
//                     // }, 8);
//                 }

// //            }
//         }

//         this.scheduleOnce(function () {
//             let sidePot = [8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000];
//             if (sidePot.length == 0) {
//                 this.potNum.string = totalPotNum - turnPotNum;
//             } else {
//                 let potPos = cc.find('Canvas/PotLayer').convertToWorldSpaceAR(cc.v2(0, 0));
//                 this.potLayer.active = true;
//                 this.potNum.string = sidePot[0];
//                 let srcv2 = this.sidePots[0].parent.convertToNodeSpaceAR(potPos);
//                 for (let i = 1; i < sidePot.length; i++) {
//                     if (this.sidePots[i - 1].active == false) {
//                         let dstv2 = this.sidePots[i - 1].getPosition();
//                         this.sidePots[i - 1].setPosition(srcv2);
//                         this.sidePots[i - 1].active = true;
//                         this.sidePotNums[i - 1].string = sidePot[i];
//                         this.sidePots[i - 1].runAction(
//                             cc.moveTo(0.2, dstv2),
//                         );
//                     } 
//                 }
//                 this.potNum.string = sidePot[0];
//             }
//         }, 2);
//         this.scheduleOnce(function () {
//             let obj = [
//                 {"Allot":[{"Seat":0,"Win":3500},{"Seat":1,"Win":1000},{"Seat":2,"Win":1000},{"Seat":3,"Win":1000},{"Seat":4,"Win":1000},{"Seat":5,"Win":1000},{"Seat":6,"Win":1000},{"Seat":7,"Win":1000}],"PotValue":8000},
//                 {"Allot":[{"Seat":0,"Win":3500},{"Seat":5,"Win":1000}],"PotValue":7000},
//                 {"Allot":[{"Seat":0,"Win":3500},{"Seat":2,"Win":1000}],"PotValue":6000},
//                 {"Allot":[{"Seat":0,"Win":3500},{"Seat":3,"Win":1000}],"PotValue":5000},
//                 {"Allot":[{"Seat":0,"Win":3500},{"Seat":6,"Win":1000}],"PotValue":4000},
//                 {"Allot":[{"Seat":0,"Win":3500},{"Seat":7,"Win":1000}],"PotValue":3000},
//                 {"Allot":[{"Seat":0,"Win":3500},{"Seat":1,"Win":1000},{"Seat":2,"Win":1000},{"Seat":3,"Win":1000},{"Seat":4,"Win":1000},{"Seat":5,"Win":1000},{"Seat":6,"Win":1000},{"Seat":7,"Win":1000}],"PotValue":2000},
//                 {"Allot":[{"Seat":0,"Win":3500}],"PotValue":1000},
//             ];
//             this._potsToPlayers(obj);
//         }, 3);
        // this.dealCards[0].opacity = 255;
        // this.dealCards[1].opacity = 255;
        // this.dealCards[0].scale = 1;
        // this.dealCards[1].scale = 1;
        // this._dealCardPlayerPosArray.push(0);
        // this._dealCardsInfo = {};
        // this._dealCardsInfo.scale = new Array();
        // this._dealCardsInfo.scale.push(1);
        // this._dealCardsInfo.scale.push(1);
        // this.scheduleOnce(this._selfPlayerFlipCards, 3);
        // cc.dgame.tableInfo.SeatId = 0;
        for (var i = 0; i < 8; i++) {
            let playerAnchor = this.playerAnchors[this._maxPlayers][i];
            let playerNode = cc.instantiate(this.playerPrefab);
            playerAnchor.addChild(playerNode);
            let player = playerNode.getComponent('Player');
            player.initPlayerByTablePos(this._maxPlayers, i);
        }
        this._dealCardPlayerPosArray.push(0);
        // this._dealCardPlayerPosArray.push(1);
        // this._dealCardPlayerPosArray.push(2);
        // this._dealCardPlayerPosArray.push(3);
        // this._dealCardPlayerPosArray.push(4);
        this._dealCardPlayerPosArray.push(5);
        cc.dgame.tableInfo.SeatId = 5;
        var dealInfo = '{"DeskCard":{"publicCard":[],"publicIndex":[]},"SelfCard":{"privateCard":[11,26],"privateIndex":[2,3]}}';
        this._recoverDealInfo(JSON.parse(dealInfo));
        // this._dealCardPlayerPosArray.push(6);
        // this._dealCardPlayerPosArray.push(7);
        // this.scheduleOnce(function () {
        //     this._dealFlopCards(cc.dgame.utils.getCard('黑桃Q'), cc.dgame.utils.getCard('黑桃K'), cc.dgame.utils.getCard('黑桃A'));
        // }, 1.5);
        // this.scheduleOnce(function () {
        //     this._dealTurnCard(cc.dgame.utils.getCard('红心Q'));
        // }, 3.5);
        // this.scheduleOnce(function () {
        //     this._dealRiverCard(cc.dgame.utils.getCard('红心A'));
        // }, 5.5);
        // this.scheduleOnce(this._dealCards, 4);
        // cc.dgame.tableInfo.TurnInfo = {};
        // cc.dgame.tableInfo.TurnInfo.HandCard = ['红心K', '红心A'];
        // cc.dgame.tableInfo.SeatId = 5;
        // this.scheduleOnce(this._shiftPlayerSeat, 2);
        // this.scheduleOnce(function () {
        //     this._dealFlopCards(cc.dgame.utils.getCard('黑桃Q'), cc.dgame.utils.getCard('黑桃K'), cc.dgame.utils.getCard('黑桃A'));
        // }, 1);
        // this.scheduleOnce(function () {
        //     this._dealTurnCard(cc.dgame.utils.getCard('红心Q'));
        // }, 2);
        // this.scheduleOnce(function () {
        //     this._dealRiverCard(cc.dgame.utils.getCard('红心A'));
        //     for (let i = 0; i < this._maxPlayers; i++) {
        //         let pos = this.playerAnchors[this._maxPlayers][i].getChildren()[0].getComponent('Player').getDealerMarkPos();
        //         Log.Trace('dealer ' + i + ' worldpt: (' + pos.x + ', ' + pos.y + ')');
        //         if (i == 0) {
        //             this.dealerMark.setPosition(this.dealerMark.parent.convertToNodeSpaceAR(pos));
        //             this.dealerMark.active = true;
        //         } else if (i == 5) {
        //             this.scheduleOnce(function () {
        //                 this.dealerMark.setPosition(this.dealerMark.parent.convertToNodeSpaceAR(pos));
        //                 this.dealerMark.active = true;
        //             }, 1);
        //         } else {
        //             this.playerAnchors[this._maxPlayers][i].getChildren()[0].getComponent('Player').disable();
        //             this.playerAnchors[this._maxPlayers][i].getChildren()[0].getComponent('Player').startAutoCheckoutCountDown(180);
        //             this.playerAnchors[this._maxPlayers][i].getChildren()[0].getComponent('Player').showAction(Types.PlayerOP.STANDBY);
        //         }
        //     }
        // }, 3);
        // this.btnFreeRaise.active = true;
        // this.btnFreeRaise.on('touchstart', this._onBtnFreeRaiseTouchStart, this);
        // this.btnFreeRaise.on('touchmove', this._onBtnFreeRaiseTouchMove, this);
        // this.btnFreeRaise.on('touchend', this._onBtnFreeRaiseTouchEnd, this);
        // this.btnFreeRaise.on('touchcancel', this._onBtnFreeRaiseTouchEnd, this);
        // player.setStack('1000');
        // this.scheduleOnce(function() {
        //     let stack = player.getStack();
        //     Log.Trace(stack);
        //     player.setStack(stack - parseFloat(2));
        // }, 3);

        // player.initPlayerInfo(1, '', helloworld', 1000, 3);
        // player.hideAllActions();
        // this.scheduleOnce(function () {
        //     Log.Trace('+100');
        //     player.setWinloss('+100');
        // }, 3);
        // this.scheduleOnce(function () {
        //     Log.Trace('nickname');
        //     player.hideWinloss();
        // }, 6);

        // player.setBet(5);
        // this.scheduleOnce(function () {
        //     player.setBet(10);
        // }, 3);

        return;
    },
});
