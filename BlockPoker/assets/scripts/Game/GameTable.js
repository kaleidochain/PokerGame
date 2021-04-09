var Types = require('Types');
var PositionData = require('PositionData');
var Log = require('Log');

cc.Class({
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
        sidePotNums: [cc.RichText],     //边池筹码数
        dealerMark: cc.Node,            //庄家标识，BlindInfo盲注信息中有
        actionIdentifier: cc.Node,      //玩家行动指示标
        //4人桌
        tableFor4Layer: cc.Node,        //4人桌图层
        playerAnchorsFor4: [cc.Node],   //4人桌各玩家位置
        //6人桌
        tableFor6Layer: cc.Node,        //6人桌图层
        playerAnchorsFor6: [cc.Node],   //6人桌各玩家位置
        //8人桌
        tableFor8Layer: cc.Node,        //8人桌图层
        playerAnchorsFor8: [cc.Node],   //8人桌各玩家位置
        //9人桌
        tableFor9Layer: cc.Node,        //9人桌图层
        playerAnchorsFor9: [cc.Node],   //9人桌各玩家位置
        //盲注信息区域
        fulltableid: cc.Label,
        blindInfo: cc.Label,
        roundTips: cc.RichText,
        tipsBackground: cc.Node,
        tips: cc.Label,
        securityTipsBackground: cc.Node,
        securityTips: cc.Label,
        //公共牌区域
        dealCommunityCards: [cc.Node],      //能发牌、移动翻转的公共牌
        dealRMTCommunityCards1: [cc.Node],  //能移动的多牌公共牌
        dealRMTCommunityCards2: [cc.Node],  //能移动的多牌公共牌
        dealRMTCommunityCards3: [cc.Node],  //能移动的多牌公共牌
        dealRMTCommunityCards4: [cc.Node],  //能移动的多牌公共牌
        highlightCommunityCards: [cc.Node], //高亮公共牌，用于结算时高亮成牌，遇到多牌情况时可移动
        //自身玩家操作区域
        selfHoleCards: [cc.Node],       //摊牌阶段两张底牌最终位置效果，Allin或到摊牌阶段会翻转显示，即holeCard_1、holeCard_2
        cardType: cc.Label,             //牌型，无论是否弃牌均显示
        disabledFold: cc.Node,          //禁用的弃牌，点击后到行动时间时自动弃牌
        btnFold: cc.Node,               //弃牌，带倒计时
        btnCheck: cc.Node,              //看牌，带倒计时
        btnCall: cc.Node,               //跟牌
        callNum: cc.RichText,           //跟注的筹码数
        btnAheadOfCheckOrFold: cc.Node, //预操作-看/弃牌
        CheckOrFold: cc.RichText,       //预操作-看/弃牌的文案显示
        btnAheadOfCall: cc.Node,        //预操作-跟牌-有人下注
        aheadOfCallNum: cc.RichText,    //预操作-跟注的筹码数
        btnAheadOfCallAny: cc.Node,     //预操作-跟牌-没人下注
        AheadOfSprites:[cc.SpriteFrame], //预操作-未选及选中的图标集合
        btnFreeRaiseDisable: cc.Node,   //自由加注置灰
        btnFreeRaise: cc.Node,          //自由加注
        freeRaiseStackNum: cc.Label,    //玩家筹码数
        btnAllin: cc.Node,              //Allin
        allinStackNum: cc.Label,        //玩家筹码数
        bigBlindRaiseLayer: cc.Node,    //大盲加注图层
        btn2BBRaise: cc.Node,           //2倍大盲加注
        twoBBRaiseNum: cc.Label,        //2倍大盲加注筹码数
        btn3BBRaise: cc.Node,           //3倍大盲加注
        threeBBRaiseNum: cc.Label,      //3倍大盲加注筹码数
        btn5BBRaise: cc.Node,           //5倍大盲加注
        fiveBBRaiseNum: cc.Label,       //5倍大盲加注筹码数
        potRaiseLayer: cc.Node,         //底池加注图层
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
        RMTOperateLayer: cc.Node,       //多牌领先玩家操作界面
        RMTOperateWaitingLayer: cc.Node,//多牌其他玩家等待领先玩家操作界面
        RMTNegotiateLayer: cc.Node,     //多牌其他玩家操作界面
        RMTNegotiateWaitingLayer: cc.Node,//多牌领先玩家等待其他玩家同意界面
        INSOperateLayer:cc.Node,        //保险操作界面
        INSOperateWaitingLayer: cc.Node,//保险其他玩家等待领先玩家操作界面
        INSOperateDetails:cc.Node,      //保险详情界面(主池或边池）
        INSMainPotDetails:cc.Node,      //保险主池详情界面
        INSSidePotDetails:cc.Node,      //保险边池详情界面
        INSToggleContainer:cc.Node,     //保险共用操作按钮列表
        INSPotPrefab:cc.Prefab,         //保险底池预制资源

        //等待界面
        normalLoadingLayer: cc.Node,
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 增加value字段存储原始值
        this.potNum.value = "0";
        this.currentRoundPotNum.value = "0";
        this.callNum.value = "0";
        this.twoBBRaiseNum.value = "0";
        this.threeBBRaiseNum.value = "0";
        this.fiveBBRaiseNum.value = "0";
        this.twoThirdPotRaiseNum.value = "0";
        this.potRaiseNum.value = "0";
        this.freeRaiseChipsNum.value = "0";
        this._actionIdentifierOrgHeight = this.actionIdentifier.height;
        this._actionIdentifierAngles = new Array();
        this._actionIdentifierHeights = new Array();
        this._delayPlayersInfo = false;

        for (let i = 0; i < this.selfHoleCards.length; i++) {
            let cardNode = cc.instantiate(this.pokerPrefab);
            this.selfHoleCards[i].addChild(cardNode);
            let poker = cardNode.getComponent('Poker');
            poker.init(0, 0);
            poker.setFaceUp(false);
        }
        for (let i = 0; i < this.dealCommunityCards.length; i++) {
            let cardNode = cc.instantiate(this.pokerPrefab);
            this.dealCommunityCards[i].addChild(cardNode);
            let poker = cardNode.getComponent('Poker');
            poker.init(0, 0);
            poker.setFaceUp(false);
        }
        let dealRMTCommunityCards = new Array();
        dealRMTCommunityCards.push(this.dealRMTCommunityCards1);
        dealRMTCommunityCards.push(this.dealRMTCommunityCards2);
        dealRMTCommunityCards.push(this.dealRMTCommunityCards3);
        dealRMTCommunityCards.push(this.dealRMTCommunityCards4);
        for (let i = 0; i < dealRMTCommunityCards.length; i++) {
            for (let j = 0; j < dealRMTCommunityCards[i].length; j++) {
                let cardNode = cc.instantiate(this.pokerPrefab);
                dealRMTCommunityCards[i][j].addChild(cardNode);
                let poker = cardNode.getComponent('Poker');
                poker.init(0, 0);
                poker.setFaceUp(false);
            }
        }
        for (let i = 0; i < this.highlightCommunityCards.length; i++) {
            let cardNode = cc.instantiate(this.pokerPrefab);
            this.highlightCommunityCards[i].addChild(cardNode);
            let poker = cardNode.getComponent('Poker');
            poker.init(0, 0);
            poker.setFaceUp(false);
        }
        this._initFreeRaiseSlider();
        this.schedule(this._dispatchGameEvent, 1);  //此定时器检测本局游戏玩家及手牌都具备后开始发牌动画
        this.schedule(this._updateMenuStatus, 60);  //定时更新玩家自身状态更新左上角菜单
        cc.dgame.tableInfo.RawGameEventQueue = new Array();   //GameEvent消息队列
        this._resendQueue = new Array();
        cc.dgame.tableInfo.DealCardFlag = {};        //以手数为下标的发牌标志，收到当前手的BlindInfo和第一个TurnInfo才可以发牌
        this._animationTimerDelay = {}; //记录动画定时器个数与延时，_dispatchGameEvent要等此值为零时才处理GameEvent消息
        this._delayShiftSeatArray = new Array;
        this._RMTTimes = 1;
        this._isBackground = false;
        this._joinReq = {};
        cc.dgame.tableInfo.SelfReady = false;
        cc.dgame.tableInfo.ContractStatus = Types.ContractStatus.NOTJOIN;
        cc.dgame.tableInfo.IsRecover = false;
        cc.dgame.tableInfo.ShiftSeat = false;
        cc.dgame.tableInfo.SecurityTipsList = new Array();
        cc.dgame.gameReviewPopup.FullTableId = cc.dgame.tableInfo.FullTableId;
        cc.dgame.gameReviewPopup.TableId = cc.dgame.tableInfo.TableId;
        cc.dgame.mainMenuPopup.updateStatus();
        this._resetGameInfo();
        this._resetGameTable();
        this.debugInfo.active = false;
        cc.find("Canvas/TableInfoLayer/layoutTableInfo/btnTableInfo/btn_tableinfo_on").active = cc.find("Canvas/TableInfoDetailLayer").active;
        cc.find("Canvas/TableInfoLayer/layoutTableInfo/btnTableInfo/btn_tableinfo_off").active = !cc.find("Canvas/TableInfoDetailLayer").active;
        Log.Debug('[GameTable:onLoad] ' + JSON.stringify(cc.dgame.tableInfo));
        if (!cc.dgame.tableInfo || !cc.dgame.tableInfo.TableId || parseInt(cc.dgame.tableInfo.TableId) == 0) {
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
        this._maxPlayers = cc.dgame.tableInfo.MaxNum;
        this._maxPlayerStr = cc.dgame.tableInfo.MaxNum + '';
        this.playerTables[this._maxPlayerStr].active = true;
        let gametable = cc.find("Canvas/bg_gamehall/bg_gametable");
        let gametable_long = cc.find("Canvas/bg_gamehall/bg_gametable_long");
        let btnmenu = cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BtnMainMenu");
        btnmenu.getComponent(cc.Widget).updateAlignment();  //使对齐生效，否则下面获取到的还是原设计的坐标
        let menuv2 = btnmenu.convertToWorldSpaceAR(cc.v2(0, 0));
        let gametablev2 = gametable.convertToWorldSpaceAR(cc.v2(0, 0));
        let gametable_longv2 = gametable_long.convertToWorldSpaceAR(cc.v2(0, 0));
        let newOriginWorldPT = null;
        Log.Trace("WxH: " + cc.winSize.width + "x" + cc.winSize.height + ", ratio: " + cc.winSize.height / cc.winSize.width);
        if (cc.winSize.height / cc.winSize.width >= 2) {
            gametable.active = false;
            gametable_long.active = true;
            newOriginWorldPT = cc.v2(gametable_longv2.x, (menuv2.y - btnmenu.height / 2)/2);
            let newNodePT = gametable_long.parent.convertToNodeSpaceAR(newOriginWorldPT);
            gametable_long.setPosition(gametable_long.parent.convertToNodeSpaceAR(newOriginWorldPT));
        } else {
            gametable.active = true;
            gametable_long.active = false;
            newOriginWorldPT = cc.v2(gametablev2.x, (menuv2.y - btnmenu.height / 2)/2);
            let newNodePT = gametable_long.parent.convertToNodeSpaceAR(newOriginWorldPT);
            gametable.setPosition(gametable.parent.convertToNodeSpaceAR(newOriginWorldPT));
        }
        Log.Trace("newOriginWorldPT: " + newOriginWorldPT);
        for (var i = 0; i < this._maxPlayers; i++) {
            let playerAnchor = this.playerAnchors[this._maxPlayerStr][i];
            if (gametable.active) {
                let newOrg = gametable.getPosition();
                playerAnchor.setPosition(PositionData.GameTablePlayerAnchorPositions[i].x + newOrg.x, PositionData.GameTablePlayerAnchorPositions[i].y + newOrg.y);
            } else {
                let newOrg = gametable_long.getPosition();
                playerAnchor.setPosition(PositionData.GameTableLongPlayerAnchorPositions[i].x + newOrg.x, PositionData.GameTableLongPlayerAnchorPositions[i].y + newOrg.y);
            }
            let playerNode = cc.instantiate(this.playerPrefab);
            playerAnchor.addChild(playerNode);
            let player = playerNode.getComponent('Player');
            player.initPlayerByTablePos(this._maxPlayers, i);

            //计算玩家指示器长度和角度
            let srcPos = this.actionIdentifier.convertToWorldSpaceAR(cc.v2(0, 0));
            let dstPos = this.playerAnchors[this._maxPlayerStr][i].convertToWorldSpaceAR(cc.v2(0, 0));
            let lastPos = this.playerAnchors[this._maxPlayerStr][0].convertToWorldSpaceAR(cc.v2(0, 0));
            let oldVec = lastPos.sub(srcPos);
            let newVec = dstPos.sub(srcPos);
            this._actionIdentifierHeights.push(dstPos.sub(srcPos).mag() + 136 / 2);
            this._actionIdentifierAngles.push(newVec.signAngle(oldVec) / Math.PI * 180);

            // player.startCountDown(15);
            if (i == 0) {
                let holeCardsLayer = cc.find("Canvas/HoldCardsLayer");
                let selfHeadWorldPT = playerAnchor.convertToWorldSpaceAR(cc.v2(0, 0));
                let newHoleCardsWorldPT = cc.v2(selfHeadWorldPT.x, selfHeadWorldPT.y + 178);//178=牌高度一半+牌和头40+头高度一半
                holeCardsLayer.setPosition(holeCardsLayer.parent.convertToNodeSpaceAR(newHoleCardsWorldPT));

                let operateLayer = cc.find("Canvas/OperatePanelLayer");
                let newOperateWorldPT = cc.v2(newHoleCardsWorldPT.x, newHoleCardsWorldPT.y - 15);//操作层比底牌低15
                operateLayer.setPosition(operateLayer.parent.convertToNodeSpaceAR(newOperateWorldPT));

                let winLightLayer = cc.find("Canvas/WinlightLayer");
                let newWinLightWorldPT = cc.v2(newHoleCardsWorldPT.x, newHoleCardsWorldPT.y + 300);//WinLight层比底牌高300
                winLightLayer.setPosition(winLightLayer.parent.convertToNodeSpaceAR(newWinLightWorldPT));

                let communityCardLayer = cc.find("Canvas/CommunityCardsLayer");
                let newCommunityCardWorldPT = cc.v2(newHoleCardsWorldPT.x, newHoleCardsWorldPT.y + 550);//公共牌层比底牌高550
                communityCardLayer.setPosition(communityCardLayer.parent.convertToNodeSpaceAR(newCommunityCardWorldPT));

                let securityTipsLayer = cc.find("Canvas/SecurityTipsLayer");
                let newSecurityTipsWorldPT = cc.v2(newHoleCardsWorldPT.x, newHoleCardsWorldPT.y + 550);//安全提示层比底牌高550
                securityTipsLayer.setPosition(securityTipsLayer.parent.convertToNodeSpaceAR(newSecurityTipsWorldPT));

                let roundTipsLayer = cc.find("Canvas/RoundTips");
                let newRoundTipsWorldPT = null;
                if (gametable.active) {
                    newRoundTipsWorldPT = cc.v2(newCommunityCardWorldPT.x, newCommunityCardWorldPT.y + 158);//轮次提示层比公共牌高158
                } else {
                    newRoundTipsWorldPT = cc.v2(newCommunityCardWorldPT.x, newCommunityCardWorldPT.y + 308);//轮次提示层比公共牌高308
                }
                roundTipsLayer.setPosition(roundTipsLayer.parent.convertToNodeSpaceAR(newRoundTipsWorldPT));

                let tipsLayer = cc.find("Canvas/TipsLayer");
                let newTipsWorldPT = null;
                if (gametable.active) {
                    newTipsWorldPT = cc.v2(newCommunityCardWorldPT.x, newCommunityCardWorldPT.y + 158);//轮次提示层比公共牌高158
                } else {
                    newTipsWorldPT = cc.v2(newCommunityCardWorldPT.x, newCommunityCardWorldPT.y + 308);//轮次提示层比公共牌高308
                }
                tipsLayer.setPosition(tipsLayer.parent.convertToNodeSpaceAR(newTipsWorldPT));

                let tableinfo = cc.find("Canvas/TableInfoLayer");
                tableinfo.getComponent(cc.Widget).updateAlignment();  //使对齐生效，否则下面获取到的还是原设计的坐标
                let tableinfov2 = tableinfo.convertToWorldSpaceAR(cc.v2(0, 0));
                tableinfov2.y = tableinfov2.y - 35 - 6;
                let tableinfodetail = cc.find("Canvas/TableInfoDetailLayer/scrollview");
                tableinfodetail.setPosition(tableinfodetail.parent.convertToNodeSpaceAR(tableinfov2));

                let potLayer = cc.find("Canvas/PotLayer");
                let newPotWorldPT = null;
                if (gametable.active) {
                    newPotWorldPT = cc.v2(newCommunityCardWorldPT.x, newCommunityCardWorldPT.y + 340);//轮次提示层比公共牌高340
                } else {
                    newPotWorldPT = cc.v2(newCommunityCardWorldPT.x, newCommunityCardWorldPT.y + 490);//轮次提示层比公共牌高490
                }
                potLayer.setPosition(potLayer.parent.convertToNodeSpaceAR(newPotWorldPT));
                //player.btnBackToPlay.active = true;
                //var seq = cc.sequence(cc.moveBy(0.5, 200, 0), cc.moveBy(0.5, -200, 0));                
                //playerNode.runAction(seq);
//                var spawn = cc.spawn(cc.moveBy(0.5, 0, 50), cc.scaleTo(0.5, 0.8, 1.4));
//                playerNode.runAction(spawn);
            }
        }
        //显示牌局盲注信息
        this.fulltableid.string = cc.dgame.tableInfo.FullTableId;
        this.blindInfo.string = cc.dgame.utils.formatValue(cc.dgame.tableInfo.SmallBlind) + '/' + cc.dgame.utils.formatValue(cc.dgame.tableInfo.SmallBlind * 2).toString();
        if (cc.dgame.tableInfo.Straddle !== 0) {
            this.blindInfo.string += '/' + cc.dgame.utils.formatValue(cc.dgame.tableInfo.SmallBlind * 4).toString();
        }
        if (cc.dgame.tableInfo.Ante > 0) {
            this.blindInfo.string += '(' + cc.dgame.utils.formatValue(cc.dgame.tableInfo.Ante) + ')';
        }
        this.freeRaiseSlider.progress = 0;
        this.scheduleOnce(function () {
            cc.dgame.net.gameCall(["Play_GetRecoverData", ""], this._onGetRecoverData.bind(this));
        }, 0.1);
        cc.dgame.gametable = this;
        cc.dgame.roomEventMgr.startListen();
        let subGameTable_cmd = {
            TableId: cc.dgame.tableInfo.TableId,
        }
        cc.dgame.net.gameCall(["subscribeGameTable", JSON.stringify(subGameTable_cmd)]);
        cc.dgame.net.addEventListener(['gameEvent', parseInt(cc.dgame.tableInfo.TableId)], this._onGameEvent.bind(this));
        cc.dgame.gameRequestMgr.startCheckGameRequest();
        cc.dgame.gameRequestMgr.handleCountDownTimeout = this.onClickExitTableItem.bind(this);
        cc.dgame.clubRequestMgr.startCheckClubRequest();
        if (cc.sys.isNative) {
            if (cc.sys.isMobile) {
                if (cc.sys.os === cc.sys.OS_IOS) {
                    jsb.reflection.callStaticMethod("NativeGengine", "keepScreenOn:", true);
                }
            }
        }

        cc.game.on(cc.game.EVENT_HIDE, this._gameSwitchBackground.bind(this), this);

        cc.game.on(cc.game.EVENT_SHOW, this._gameSwitchForeground.bind(this), this);

        if (parseInt(cc.dgame.tableInfo.TableId) < 0xE000000000000 && parseInt(cc.dgame.tableInfo.LeftTime) > 0) {
            this._endTime = Math.floor(new Date().getTime() / 1000) + parseInt(cc.dgame.tableInfo.LeftTime);
        } else {
            this._endTime = 0;
        }
        // this._handleRmtCards(JSON.parse('{"CurnSeat":-1,"DeskCard":{},"Hand":6,"HandCard":["梅花9","梅花5"],"IsMyTurn":false,"OP":{"Bet":false,"Call":{"Flag":false,"Value":0},"Check":false,"Fold":false,"Raise":{"Flag":false,"Value":0}},"PlayerInfo":[{"Allin":true,"Balance":0,"Fold":false,"ID":2,"TotalBet":699,"TurnBet":699},{"Allin":true,"Balance":0,"Fold":false,"ID":7,"TotalBet":400,"TurnBet":400}],"Pot":[800,299],"RmtCard":[["梅花7","黑桃10","黑桃8","梅花4","方块7"],["方块Q","方块8","梅花8","黑桃2","方块4"],["黑桃J","方块3","梅花Q","红心K","方块2"],["梅花K","黑桃6","黑桃A","梅花A","方块J"]]}'));
        // this.scheduleOnce(function () {
        //     this._highlightCommunityCards(0, ["梅花7","黑桃10","黑桃8","梅花4","方块7"]);
        // }, 5);
        // cc.dgame.utils.setOriginValue(this.potNum, 534, "yellow");
        // cc.dgame.utils.setOriginValue(this.sidePotNums[0], 1466,"yellow");
        // this.potLayer.active = true;
        // this.sidePots[0].active = true;
        // this.scheduleOnce(function () {
        //     this._potsToPlayers(JSON.parse('[[{"Allot":[{"Seat":7,"Win":178}],"PotValue":178},{"Allot":[{"Seat":7,"Win":489}],"PotValue":489}],[{"Allot":[{"Seat":7,"Win":178}],"PotValue":178},{"Allot":[{"Seat":7,"Win":489}],"PotValue":489}],[{"Allot":[{"Seat":2,"Win":178}],"PotValue":178},{"Allot":[{"Seat":7,"Win":488}],"PotValue":488}]]'));
        // }, 2);
        //this._onGetRecoverData('{"ConsensusState":3,"DealInfo":{"DeskCard":{"publicCard":[25,14,38],"publicIndex":[4,5,6]},"SelfCard":{"privateCard":[],"privateIndex":[]}},"Flop":{"BetSignflag":false,"Betflag":false,"Dealcardflag":true},"FlopFlag":false,"GameOverFlag":false,"Hand":1,"HandDiffFlag":false,"Preflop":{"BetSignflag":true,"Betflag":true,"BlindInfo":{"BigBlind":2,"Dealer":7,"SmallBlind":7,"SmallBlindBet":1,"TotalAnteBet":0},"Dealcardflag":true,"ForceBetflag":true},"PreflopFlag":true,"RiverFlag":false,"SeatStatus":0,"SettleFlag":false,"TableInfo":{"Ante":0,"BigBlindPos":2,"CurrentStatus":2,"DealerPos":7,"Maximum":9,"Minimum":2,"NeedChips":200,"Players":[{"Amount":"400","Hand":0,"PlayerAddr":"0xe2A04360345EeCE3d7e781B652A998cfaaD559A8","Pos":0,"Status":3},{"Amount":"400","Hand":1,"PlayerAddr":"0x5806dc6556C3b2343ECC150A5eA8D3cB3ABA41F5","Pos":2,"Status":6},{"Amount":"400","Hand":1,"PlayerAddr":"0x2b9B0f95f131d7F254bb9B3674641fE64738ff10","Pos":7,"Status":6}],"SmallBlind":1,"SmallBlindPos":7,"Straddle":0,"TableID":261318426755078},"TurnFlag":false}');
    },

    _gameSwitchBackground () {
        Log.Trace("游戏进入后台");
        this._isBackground = true;
        let gameSwitch_cmd = {
            Action: "Background"
        }
        cc.dgame.net.gameCall(["gameSwitch",JSON.stringify(gameSwitch_cmd)], this._onGameSwitchBackground.bind(this));
    },

    _gameSwitchForeground () {
        Log.Trace("游戏进入前台");
        this._isBackground = false;
        let gameSwitch_cmd = {
            Action: "Foreground"
        }
        cc.dgame.net.gameCall(["gameSwitch",JSON.stringify(gameSwitch_cmd)], this._onGameSwitchForeground.bind(this));
    },

    _onGameSwitchBackground (data) {
        Log.Trace('[_onGameSwitchBackground] ' + data);
        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
    },

    _onGameSwitchForeground (data) {
        Log.Trace('[_onGameSwitchForeground] ' + JSON.stringify(data));
        if (data.Info == "SwitchForegroundBeforeSwitchBackground") {
            return;
        }

        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            this._resendQueue.push({"type":"gameSwitchForeground"});
            Log.Trace("[_onGameSwitchForeground] this._resendQueue: " + JSON.stringify(this._resendQueue));
            return;
        }

        this._updateMenuStatus();
        if (data.Info == "NotInAnyTable" || data.Info == "NotInGame") {
            this._resetGameInfo();
            this._resetGameTable();
            this._restoreOperatePanel();
            cc.dgame.tableInfo.RawGameEventQueue = new Array();
            this.debugInfo.string = this._getAllMsgCount();
            var seatinfo_cmd = {
                TableId: cc.dgame.tableInfo.TableId,
            };
            cc.dgame.net.gameCall(['seatInfoEx', JSON.stringify(seatinfo_cmd)], this._onSeatInfoEx.bind(this));
        }
    },

    _getAnimationTimerDelay () {
        let totalCount = 0;
        let now = new Date().getTime();
        let maxTick = now;
        for (let key in this._animationTimerDelay) {
            if (this._animationTimerDelay[key] > maxTick) {
                maxTick = this._animationTimerDelay[key];
            }
            totalCount++;
        }
        let result = {};
        result.count = totalCount;
        result.endTick = maxTick;
        result.duration = maxTick - now;
        Log.Trace("[_getAnimationTimerDelay] " + JSON.stringify(result) + ", " + JSON.stringify(this._animationTimerDelay));
        return result;
    },

    start () {

    },

    onDestroy () {
        if (cc.sys.isNative) {
            if (cc.sys.isMobile) {
                if (cc.sys.os === cc.sys.OS_IOS) {
                    jsb.reflection.callStaticMethod("NativeGengine", "keepScreenOn:", false);
                }
            }
        }
        if (!!cc.dgame) {
            cc.dgame.gametable = null;
            cc.dgame.net.gameCall(["unsubscribeGameTable", ""]);
            cc.dgame.net.removeAllMsg();
            cc.dgame.net.removeEventListener(["gameEvent"]);
            delete this._exitRoomFlag;
        }
        cc.game.off(cc.game.EVENT_HIDE);
        cc.game.off(cc.game.EVENT_SHOW);
        Log.Trace("GameTable:onDestroy");
    },

    _recoverDealInfo (dealInfo) {
        Log.Trace("GameTable:_recoverDealInfo:" + JSON.stringify(dealInfo));
        for (let i = 0; i < this._dealCardPlayerPosArray.length; i++) {
            let playerPos = this._dealCardPlayerPosArray[i];
            let player = this.playerAnchors[this._maxPlayerStr][playerPos].getChildren()[0].getComponent('Player');
            if (playerPos != cc.dgame.tableInfo.SeatId) {
                //其他玩家发牌，发到玩家头像FirstCard、SecondCard
                player.recoverDealCards();
            } else {
                //自身玩家发牌，发到HoleCard位置，然后隐藏，使用GameTable的HoleCard来翻转，弃牌的时候用Player的DealCard来弃牌
                for (let j = 0; j < this.selfHoleCards.length; j++) {
                    this.selfHoleCards[j].active = true;
                    let poker = this.selfHoleCards[j].getChildren()[0].getComponent('Poker');
                    poker.setCardPoint(dealInfo.SelfCard.privateCard[j]);
                    poker.setFaceUp(true);
                }
            }
        }

        if (dealInfo.DeskCard.publicCard.length >= 3) {
            this._dealFlopCards(dealInfo.DeskCard.publicCard[0], dealInfo.DeskCard.publicCard[1], dealInfo.DeskCard.publicCard[2], false);
            this.roundTips.string = cc.dgame.utils.formatRichText("Flop round", "#ffffff", true, true);
            if (dealInfo.DeskCard.publicCard.length >= 4) {
                this._dealTurnCard(dealInfo.DeskCard.publicCard[3], false);
                this.roundTips.string = cc.dgame.utils.formatRichText("Turn round", "#ffffff", true, true);
                if (dealInfo.DeskCard.publicCard.length == 5) {
                    this._dealRiverCard(dealInfo.DeskCard.publicCard[4], false);
                    this.roundTips.string = cc.dgame.utils.formatRichText("River round", "#ffffff", true, true);
                }
            }
        }
    },

    _recoverBlindInfo (blindInfo) {
        cc.dgame.tableInfo.BlindInfo = blindInfo;
        this.currentPotLayer.active = true;
        cc.dgame.utils.setOriginValue(this.currentRoundPotNum,cc.dgame.tableInfo.BlindInfo.TotalAnteBet);
        cc.dgame.tableInfo.LastDealer = cc.dgame.tableInfo.BlindInfo.Dealer;
        let i = (cc.dgame.tableInfo.BlindInfo.Dealer + 1) % this._maxPlayers;
        let newDealCardArr = new Array();
        //从庄家的下一位开始转一圈，判断每个位置上玩家状态，PLAYING则按顺序加入列表中
        while (i != cc.dgame.tableInfo.BlindInfo.Dealer) {
            if (this._isPlaying(i)) {
                newDealCardArr.push(i);
            }
            i = (i + 1) % this._maxPlayers;
        }
        //最后判断是否是空Dealer
        if (this._isPlaying(i)) {
            newDealCardArr.push(i)
        }
        this._dealCardPlayerPosArray = newDealCardArr;
        Log.Debug('[_recoverBlindInfo] _dealCardPlayerPosArray: ' + JSON.stringify(this._dealCardPlayerPosArray));
        //扣除前注
        for (let i = 0; i < this._dealCardPlayerPosArray.length; i++) {
            let anchorNode = this.playerAnchors[this._maxPlayerStr][this._dealCardPlayerPosArray[i]].getChildren()[0];
            let player = anchorNode.getComponent('Player');
            let stack = player.getStack();
            player.setStack(stack - parseFloat(cc.dgame.tableInfo.Ante));
        }
        if (!this.potLayer.active) {
            this.potLayer.active = true;
        }
    },

    _onGetRecoverData (data) {
        //{"ConsensusState":3,"DealInfo":{"DeskCard":{"publicCard":[],"publicIndex":[]},"SelfCard":{"privateCard":[35,20],"privateIndex":[2,3]}},"FlopFlag":false,"GameOverFlag":false,"Hand":145,"HandDiffFlag":false,"Preflop":{"BetSignflag":false,"Betflag":false,"BlindInfo":{"BigBlind":5,"Dealer":0,"SmallBlind":0,"SmallBlindBet":5,"TotalAnteBet":4},"Dealcardflag":true,"ForceBetflag":true},"PreflopFlag":false,"RiverFlag":false,"SeatStatus":6,"SettleFlag":false,"TableInfo":{"Players":[{"Amount":"2500","Hand":145,"PlayerAddr":"0x0ec426721669CB0ddA2f23CdD74ff5cf78D3D5f9","Pos":0,"Status":6},{"Amount":"1000","Hand":145,"PlayerAddr":"0x515728cD4A9E1F1B084F0A13477e1eB82baBB36b","Pos":5,"Status":6}],"TableID":1},"TurnFlag":false}
        //data = '{"SeatStatus":0,"TableInfo":{"Ante":0,"BigBlindPos":8,"CurrentStatus":2,"DealerPos":5,"Maximum":9,"Minimum":2,"NeedChips":200,"Players":[{"Amount":"421","Hand":12,"PlayerAddr":"0xabE6510cce65383B7fC4CFaf767638160F13729C","Pos":0,"Status":6},{"Amount":"388","Hand":0,"PlayerAddr":"0x834d2B2ee9B9261f38724FE37527332D2a8FE306","Pos":1,"Status":9},{"Amount":"384","Hand":12,"PlayerAddr":"0xe2A04360345EeCE3d7e781B652A998cfaaD559A8","Pos":2,"Status":6},{"Amount":"400","Hand":0,"PlayerAddr":"0x623849eb70CF988f279C0ab888037E32391d89D0","Pos":3,"Status":3},{"Amount":"534","Hand":12,"PlayerAddr":"0xCF1467f2b3716700C7AcFabc269e6192f5EA75b2","Pos":5,"Status":6},{"Amount":"340","Hand":12,"PlayerAddr":"0x65AFA55bb04B92672470826588887e7CBe0014B0","Pos":7,"Status":6},{"Amount":"333","Hand":12,"PlayerAddr":"0xeabf753cCfB9f6C23A2866D0d3108AFc807703D5","Pos":8,"Status":6}],"SmallBlind":1,"SmallBlindPos":7,"Straddle":0,"TableID":21715891519489}}';
        Log.Trace('[_onGetRecoverData] ' + data);
        if (parseInt(data) === -1) {
            Log.Trace('[_onGetRecoverData] fail');
            return;
        }
        let recoverData = JSON.parse(data);
        Log.Trace('[_onGetRecoverData] SeatStatus: ' + recoverData.SeatStatus);
        if (!recoverData.TableInfo) {
            cc.dgame.normalLoading.startInvokeWaiting();
            let self = this;
            this.scheduleOnce(function () {
                //获取当前牌桌的玩家信息，包括自己创建自动坐下
                var seatinfo_cmd = {
                    TableId: cc.dgame.tableInfo.TableId,
                };
                cc.dgame.net.gameCall(['seatInfoEx', JSON.stringify(seatinfo_cmd)], self._onSeatInfoEx.bind(self));
            }, 0.05);
            return;
        }
        Log.Trace('[_onGetRecoverData] CurrentStatus: ' + recoverData.TableInfo.CurrentStatus);
        this._dealCardPlayerPosArray = new Array;
        cc.dgame.tableInfo.IsRecover = true;
        cc.dgame.tableInfo.StartAction = true;
        this._onPlayersInfo(recoverData.TableInfo.Players);
        let hand = 0;
        for (let i = 0; i < recoverData.TableInfo.Players.length; i++) {
            if (recoverData.TableInfo.Players[i].Status >= Types.ContractStatus.PLAYING && recoverData.TableInfo.Players[i].Hand > hand) {
                hand = recoverData.TableInfo.Players[i].Hand;
            }
        }
        if (recoverData.SeatStatus == Types.ContractStatus.PLAYING) {
            cc.dgame.tableInfo.SelfReady = true;
        }
        cc.dgame.tableInfo.RawGameEventQueue = new Array();
        cc.dgame.tableInfo.DealCardFlag[hand] = {};
        cc.dgame.tableInfo.DealCardFlag[hand].RecvFirstTurnInfo = false;
        cc.dgame.tableInfo.DealCardFlag[hand].NeedDealCard = false;
        let blindInfo = {};
        blindInfo.BigBlind = recoverData.TableInfo.BigBlindPos;
        blindInfo.Dealer = recoverData.TableInfo.DealerPos;
        blindInfo.SmallBlind = recoverData.TableInfo.SmallBlindPos;
        blindInfo.SmallBlindBet = recoverData.TableInfo.SmallBlind;
        blindInfo.TotalAnteBet = recoverData.TableInfo.BigBlindPos;
        this._recoverBlindInfo(blindInfo);
        cc.dgame.tableInfo.ShiftSeat = true;
        this._shiftPlayerSeat();
        var seatinfo_cmd = {
            TableId: cc.dgame.tableInfo.TableId,
        };
        cc.dgame.net.gameCall(['seatInfoEx', JSON.stringify(seatinfo_cmd)], this._onSeatInfoEx.bind(this));
        this._delayShiftSeatArray.push({"type":"Play_Recover"});
    },

    _onBalanceOf (data) {
        Log.Trace('[_onBalanceOf] ' + JSON.stringify(data));
        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
        cc.dgame.settings.account.Chips = data.Balance;
    },

    _onSeatInfoEx (seats) {
        Log.Trace('[_onSeatInfoEx] cc.dgame.tableInfo.ShiftSeat: ' + cc.dgame.tableInfo.ShiftSeat + ", " + JSON.stringify(seats));
        if (seats == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
        if (cc.dgame.tableInfo.ShiftSeat) {
            this._delayShiftSeatArray.push({"type":"onSeatInfoEx", "data": seats});
            return;
        }
        this._querySetSelfSeatId(seats.SeatsInfo);
        Log.Trace('[_onSeatInfoEx] cc.dgame.tableInfo.SeatId:' + cc.dgame.tableInfo.SeatId + ", cc.dgame.tableInfo.SelfReady: " + cc.dgame.tableInfo.SelfReady);

        let playingNum = 0;
        for (let i = 0; i < this._maxPlayers; i++) {
            let playerNode = this.playerAnchors[this._maxPlayerStr][i].getChildren()[0];
            let player = playerNode.getComponent('Player');
            player.setTableStatus(seats.CurrentStatus);
            let found = false;
            let j = 0;
            for (; j < seats.SeatsInfo.length; j++) {
                let seatId = seats.SeatsInfo[j].Pos;  //根据合约位置显示玩家信息
                if (seatId == i && seats.SeatsInfo[j].PlayerAddr != '0x0000000000000000000000000000000000000000') {
                    player.initPlayerInfo(seats.SeatsInfo[j].Pos, seats.SeatsInfo[j].PlayerAddr, seats.SeatsInfo[j].PlayerAddr.substr(2, 8), seats.SeatsInfo[j].Amount, seats.SeatsInfo[j].Status);
                    if (seats.SeatsInfo[j].Status >= Types.ContractStatus.PLAYING) {
                        playingNum++;
                    }
                    if (seats.SeatsInfo[j].Status == Types.ContractStatus.SEATED) {
                        player.showAction(Types.PlayerOP.STANDBY);
                        if (seatId == cc.dgame.tableInfo.SeatId && !cc.dgame.tableInfo.SelfReady) {
                            player.showBtnResitDown();
                        }
                    }
                    found = true;
                    break;
                }
            }

            if (!found) {
                player.initPlayerInfo(i, '', '', 0, Types.ContractStatus.NOTJOIN);
                if (cc.dgame.tableInfo.SeatId > -1) {   //自己坐了，其他位置不可点击
                    Log.Trace('[_onSeatInfoEx] player.disable()');
                    player.disable();
                } else {
                    Log.Trace('[_onSeatInfoEx] player.enable()');
                    player.enable();
                }
            } else {
                if (cc.dgame.tableInfo.SeatId == i) {
                    if (seats.SeatsInfo[j].Status >= Types.ContractStatus.PLAYING) {
                        player.operateLayer.setPosition(PositionData.PlayerComponentPositions[this._maxPlayers][0].PlayingOperateLayer.x, PositionData.PlayerComponentPositions[this._maxPlayers][0].PlayingOperateLayer.y);
                        Log.Trace("(x, y) = (" + PositionData.PlayerComponentPositions[this._maxPlayers][0].PlayingOperateLayer.x + "," + PositionData.PlayerComponentPositions[this._maxPlayers][0].PlayingOperateLayer.y + ")");
                    } else {
                        player.operateLayer.setPosition(PositionData.PlayerComponentPositions[this._maxPlayers][0].OperateLayer.x, PositionData.PlayerComponentPositions[this._maxPlayers][0].OperateLayer.y);
                        Log.Trace("(x, y) = (" + PositionData.PlayerComponentPositions[this._maxPlayers][0].OperateLayer.x + "," + PositionData.PlayerComponentPositions[this._maxPlayers][0].OperateLayer.y + ")");
                    }
                    cc.dgame.tableInfo.ContractStatus = seats.SeatsInfo[j].Status;
                    cc.dgame.mainMenuPopup.updateStatus();
                }
            }
        }

        if (playingNum == 0) {
            this.dealerMark.active = false;
        }

        cc.dgame.normalLoading.stopInvokeWaiting();
    },

    _onSeatInfo (seats) {
        //[{'Amount':10000,'PlayerAddr':'0xaD0fa5E70681062B20dC5162eeB8b16A9fA8ee2D','Pos':0,'Status':3},
        //{'Amount':0,'PlayerAddr':'0x0000000000000000000000000000000000000000','Pos':0,'Status':0},
        //{'Amount':0,'PlayerAddr':'0x0000000000000000000000000000000000000000','Pos':0,'Status':0},
        //{'Amount':0,'PlayerAddr':'0x0000000000000000000000000000000000000000','Pos':0,'Status':0},
        //{'Amount':0,'PlayerAddr':'0x0000000000000000000000000000000000000000','Pos':0,'Status':0},
        //{'Amount':0,'PlayerAddr':'0x0000000000000000000000000000000000000000','Pos':0,'Status':0},
        //{'Amount':0,'PlayerAddr':'0x0000000000000000000000000000000000000000','Pos':0,'Status':0},
        //{'Amount':0,'PlayerAddr':'0x0000000000000000000000000000000000000000','Pos':0,'Status':0}]
        Log.Trace('[_onSeatInfo] ' + JSON.stringify(seats));
        if (seats == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }

        this._querySetSelfSeatId(seats);
        Log.Trace('[_onSeatInfo] cc.dgame.tableInfo.SeatId:' + cc.dgame.tableInfo.SeatId);
        for (let i = 0; i < this._maxPlayers; i++) {
            let playerNode = this.playerAnchors[this._maxPlayerStr][i].getChildren()[0];
            let player = playerNode.getComponent('Player');
            let found = false;
            let j = 0;
            for (; j < seats.length; j++) {
                let seatId = seats[j].Pos;  //根据合约位置显示玩家信息
                if (seatId == i && seats[j].PlayerAddr != '0x0000000000000000000000000000000000000000') {
                    player.initPlayerInfo(seats[j].Pos, seats[j].PlayerAddr, seats[j].PlayerAddr.substr(2, 8), seats[j].Amount, seats[j].Status);
                    if (seats[j].Status == Types.ContractStatus.SEATED) {
                        player.showAction(Types.PlayerOP.STANDBY);
                        if (seatId == cc.dgame.tableInfo.SeatId) {
                            player.showBtnResitDown();
                        }
                    }
                    found = true;
                    break;
                }
            }

            if (!found) {
                player.initPlayerInfo(i, '', '', 0, Types.ContractStatus.NOTJOIN);
                if (cc.dgame.tableInfo.SeatId > -1) {   //自己坐了，其他位置不可点击
                    Log.Trace('[_onSeatInfo] player.disable()');
                    player.disable();
                } else {
                    Log.Trace('[_onSeatInfo] player.enable()');
                    player.enable();
                }
            } else {
                if (cc.dgame.tableInfo.SeatId == i) {
                    if (seats[j].Status >= Types.ContractStatus.PLAYING) {
                        player.operateLayer.setPosition(PositionData.PlayerComponentPositions[this._maxPlayers][0].PlayingOperateLayer.x, PositionData.PlayerComponentPositions[this._maxPlayers][0].PlayingOperateLayer.y);
                    } else {
                        player.operateLayer.setPosition(PositionData.PlayerComponentPositions[this._maxPlayers][0].OperateLayer.x, PositionData.PlayerComponentPositions[this._maxPlayers][0].OperateLayer.y);
                    }
                    cc.dgame.tableInfo.ContractStatus = seats[j].Status;
                    cc.dgame.mainMenuPopup.updateStatus();
                }
            }
        }
        cc.dgame.normalLoading.stopInvokeWaiting();
    },

    _querySetSelfSeatId (seats) {
        for (let j = 0; j < seats.length; j++) {
            let seatId = seats[j].Pos;
            if (cc.dgame.settings.account.Addr.toLowerCase() === seats[j].PlayerAddr.toLowerCase()) {
                cc.dgame.tableInfo.SeatId = seatId;
                break;
            }
        }
    },

    _showAnteAndBlindBetThenStartDealCards () {
        //显示顺序：
        //移动Dealer标识，同时扣除前注，并显示前注后的总底池；
        //1秒后前注入底池，大小盲straddle同时推筹码，并扣除相应筹码，修改总底池；
        //1秒后发牌，发牌结束后第一位玩家开始倒计时
        let dealerNode = this.playerAnchors[this._maxPlayerStr][cc.dgame.tableInfo.BlindInfo.Dealer].getChildren()[0];
        let dealer = dealerNode.getComponent('Player');
        let dealerMarkPos = this.dealerMark.getPosition();
        Log.Info('[_showAnteAndBlindBetThenStartDealCards] dealer: ' + cc.dgame.tableInfo.BlindInfo.Dealer + ', (' + dealerMarkPos.x + ', ' + dealerMarkPos.y + '), lastDealer: ' + cc.dgame.tableInfo.LastDealer);
        let newpos = this.dealerMark.parent.convertToNodeSpaceAR(dealer.getDealerMarkPos());
        if (cc.dgame.tableInfo.LastDealer == null) { //第一局，庄家标识直接闪现
            Log.Debug('[_showAnteAndBlindBetThenStartDealCards] dealer new pos: (' + newpos.x + ', ' + newpos.y + ')');
            this.dealerMark.setPosition(newpos);
            this.dealerMark.active = true;
        } else {    //后面庄家位置按顺时针顺序轮庄，庄的位置有可能为空
            this.dealerMark.runAction(
                cc.moveTo(0.2, newpos),
            );
        }
        cc.dgame.tableInfo.LastDealer = cc.dgame.tableInfo.BlindInfo.Dealer;
        //扣除前注
        for (let i = 0; i < this._dealCardPlayerPosArray.length; i++) {
            let anchorNode = this.playerAnchors[this._maxPlayerStr][this._dealCardPlayerPosArray[i]].getChildren()[0];
            let player = anchorNode.getComponent('Player');
            let stack = player.getStack();
            player.setStack(stack - parseFloat(cc.dgame.tableInfo.Ante));
        }
        //前注后的总底池
        cc.dgame.utils.setOriginValue(this.currentRoundPotNum,cc.dgame.tableInfo.BlindInfo.TotalAnteBet);

        //大小盲straddle
        this.scheduleOnce(this._animateBlindInfo, 1);
        this._animationTimerDelay["_animateBlindInfo"] = new Date().getTime() + 1000;

        //发牌
        this.scheduleOnce(this._dealCards, 2);
        this._animationTimerDelay["_dealCards"] = new Date().getTime() + 2000 + (0.1 * this._dealCardPlayerPosArray.length + 0.2) * 1000;
        this._getAnimationTimerDelay();
    },

    _animateBlindInfo () {
        if (!this.potLayer.active) {
            this.potLayer.active = true;
            this.roundTips.string = cc.dgame.utils.formatRichText("Preflop round", "#ffffff", true, true);
            this.roundTips.node.active = true;
        }

        let turnInfo = cc.dgame.tableInfo.RawGameEventQueue[0].Params;
        let totalBet = 0;
        Log.Trace("[_animateBlindInfo] turnInfo: " + JSON.stringify(turnInfo));
        for (let seatId in turnInfo.PlayerInfo) {
            if (turnInfo.PlayerInfo[seatId].TurnBet > 0) {
                let playerNode = this.playerAnchors[this._maxPlayerStr][seatId].getChildren()[0];
                let player = playerNode.getComponent('Player');
                player.setBet(turnInfo.PlayerInfo[seatId].TurnBet, true);
                player.setStack(turnInfo.PlayerInfo[seatId].Balance);
                totalBet = totalBet + turnInfo.PlayerInfo[seatId].TotalBet;
                if (seatId == cc.dgame.tableInfo.BlindInfo.Straddle) {  //Straddle位
                    player.showAction(Types.PlayerOP.STRADDLE);
                } else if (seatId != cc.dgame.tableInfo.BlindInfo.SmallBlind && seatId != cc.dgame.tableInfo.BlindInfo.BigBlind) {  //非大小盲、非Straddle位
                    player.showAction(Types.PlayerOP.BUSTRADDLE);
                }
            }
        }
        cc.dgame.utils.setOriginValue(this.potNum,cc.dgame.utils.getOriginValue(this.currentRoundPotNum),"yellow");
        cc.dgame.utils.setOriginValue(this.currentRoundPotNum,totalBet);
        //第一轮下注从大小盲开始
        //TurnInfoList存储TurnInfo消息中的CurnSeat、PlayerInfo、DeskCard，根据两个TurnInfo中DeskCard长度的变化决定这个消息在哪个Stage（Preflop、Flop、Turn、River）
        //DeskCard长度出现变化，这个消息还是归到上一个Stage，然后改变当前Stage
        Log.Debug('[_animateBlindInfo]' + JSON.stringify(cc.dgame.tableInfo));
        delete this._animationTimerDelay["_animateBlindInfo"];
        this._getAnimationTimerDelay();
    },

    _onPlayersInfo (players) {
        //[{"Amount":2500,"Hand":0,"PlayerAddr":"0x90FC0EE5AE41a7296E249088312a17078CB7C64f","Pos":0,"Status":5},
        //{"Amount":1000,"Hand":0,"PlayerAddr":"0x5030BdC5d71ea71B9cbeD4c4411EB6826caF6a97","Pos":5,"Status":3}]
        Log.Trace('[_onPlayersInfo] ' + JSON.stringify(players));
        if (players == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            this._delayPlayersInfo = true;
            return;
        }

        Log.Trace("[_onPlayersInfo] this._joinReq: " + JSON.stringify(this._joinReq));
        if (!!this._joinReq.TableId) {
            players.push({"Amount": this._joinReq.Amount, "Hand": 0, "PlayerAddr": cc.dgame.settings.account.Addr, "Pos": this._joinReq.Pos, "Status": 4});
        }
        this._delayPlayersInfo = false;
        this._querySetSelfSeatId(players);
        Log.Trace('[_onPlayersInfo] cc.dgame.tableInfo.SeatId:' + cc.dgame.tableInfo.SeatId + ", cc.dgame.tableInfo.SelfReady: " + cc.dgame.tableInfo.SelfReady);

        for (let i = 0; i < this._maxPlayers; i++) {
            let playerNode = this.playerAnchors[this._maxPlayerStr][i].getChildren()[0];
            let player = playerNode.getComponent('Player');
            let found = false;
            let j = 0;
            for (; j < players.length; j++) {
                let seatId = players[j].Pos;
                if (seatId == i) {
                    player.initPlayerInfo(players[j].Pos, players[j].PlayerAddr, players[j].PlayerAddr.substr(2, 8), players[j].Amount, players[j].Status);
                    if (players[j].Status == Types.ContractStatus.SEATED) {
                        player.showAction(Types.PlayerOP.STANDBY);
                        if (seatId == cc.dgame.tableInfo.SeatId && !cc.dgame.tableInfo.SelfReady) {
                            player.showBtnResitDown();
                        }
                    }
                    found = true;
                    break;
                }    
            }

            if (!found) {
                player.initPlayerInfo(i, '', '', 0, Types.ContractStatus.NOTJOIN);
                if (cc.dgame.tableInfo.SeatId > -1) {   //自己坐了，其他位置不可点击
                    player.disable();
                } else {
                    player.enable();
                }
            } else {
                if (cc.dgame.tableInfo.SeatId == i) {
                    cc.dgame.tableInfo.ContractStatus = players[j].Status;
                    cc.dgame.mainMenuPopup.updateStatus();
                }
                if (cc.dgame.tableInfo.StartAction && players[j].Status >= Types.ContractStatus.PLAYING) {
                    player.enable();
                    player.hideAllActions();         //在本局中的玩家隐藏等待中提示
                    if (cc.dgame.tableInfo.SeatId == i) {
                        this.playerMyself = playerNode;
                        Log.Info('[_onPlayersInfo] playerMyself: ' + i);
                    }
                }
            }
        }

        if (cc.dgame.tableInfo.StartAction) {
            cc.dgame.tableInfo.StartAction = false;
        }
    },

    _onAddChipsSelfReady (data) {
        Log.Trace('[_onAddChipsSelfReady]');
        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
        Log.Trace('[_onAddChipsSelfReady] this._maxPlayerStr:' + this._maxPlayerStr);
        let playerNode = this.playerAnchors[this._maxPlayerStr][cc.dgame.tableInfo.SeatId].getChildren()[0];
        let player = playerNode.getComponent('Player');
        player.showAction(Types.PlayerOP.WAITING);
        cc.dgame.tableInfo.SelfReady = true;
        cc.dgame.normalLoading.stopInvokeWaiting();
    },

    _onSelfReady (data) {
        Log.Trace('[_onSelfReady] currentScene: ' + cc.director.getScene().name);
        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
        if (cc.dgame.tableInfo.SeatId == null  || cc.dgame.tableInfo.SeatId == undefined) {
            Log.Warn('[_onSelfReady] cc.dgame.tableInfo.SeatId: ' + cc.dgame.tableInfo.SeatId);
            return;
        }
        Log.Trace('[_onSelfReady] this._maxPlayerStr:' + this._maxPlayerStr);
        let playerNode = this.playerAnchors[this._maxPlayerStr][cc.dgame.tableInfo.SeatId].getChildren()[0];
        let player = playerNode.getComponent('Player');
        player.showAction(Types.PlayerOP.WAITING);
        player.hideBtnResitDown();
        cc.dgame.tableInfo.SelfReady = true;
        cc.dgame.tableInfo.ShiftSeat = true;
        this._shiftPlayerSeat();
        cc.dgame.normalLoading.stopInvokeWaiting();
    },

    _handleJoin (data) {
        //{"Addr":"0x5030BdC5d71ea71B9cbeD4c4411EB6826caF6a97","Amount":1000,"Pos":5,"Tableid":2}
        Log.Trace('[_handleJoin] ' + JSON.stringify(data));
        var playersinfo_cmd = {
            TableId: cc.dgame.tableInfo.TableId,
        };
        if (cc.dgame.settings.account.Addr.toLowerCase() === data.Addr.toLowerCase()) {
            delete cc.dgame.tableInfo.SittingSeatId;
            this._joinReq = {};
            this.securityTipsBackground.parent.stopAllActions();
            this.securityTipsBackground.parent.active = false;
            if (parseInt(cc.dgame.tableInfo.TableId) < 0xE000000000000 && (cc.dgame.tableInfo.TableProps & 0x1) == 0) {
                cc.dgame.gameRequestMgr.hideWaitingTips();
            }
            if (data.Errstr == undefined || data.Errstr == "") {
                cc.dgame.tableInfo.SeatId = data.Pos;
                if (!cc.dgame.tableInfo.SelfReady && this._exitRoomFlag != true) {
                    cc.dgame.normalLoading.startInvokeWaiting();
                    cc.dgame.net.gameCall(['ready', ''], this._onSelfReady.bind(this));
                }
            } else {
                cc.dgame.tableInfo.SeatId = -1;
                let msg = data.Errstr;
                if (msg == "error pos") {
                    msg = "The location has been seated";
                }
                this._showNotice(msg);
                cc.dgame.gameRequestMgr.hideWaitingTips();
                cc.dgame.net.gameCall(['playersinfo', JSON.stringify(playersinfo_cmd)], this._onPlayersInfo.bind(this));
            }
        } else {
            if (data.Errstr == undefined || data.Errstr == "") {
                cc.dgame.net.gameCall(['playersinfo', JSON.stringify(playersinfo_cmd)], this._onPlayersInfo.bind(this));
            }
        }
    },

    _handleLeave (data) {
        let animationTimerInfo = this._getAnimationTimerDelay();
        Log.Trace('[_handleLeave] ' + cc.director.getScene().name + ', tableInfo: ' + JSON.stringify(cc.dgame.tableInfo) + ', data: ' + JSON.stringify(data));
        if (animationTimerInfo.count > 0 || this._getTypeInGameEventQueueCount("GameOverInfo") == 1) {
            let leaveGameEvent = {};
            leaveGameEvent.Event = "Leave";
            leaveGameEvent.Params = data;
            cc.dgame.tableInfo.RawGameEventQueue.push(leaveGameEvent);
            Log.Trace('[_handleLeave] new: ' + this._getAllMsgCount());
            return;
        }
        //_handleLeave {"Addr":"0x0A964B7178e69B118F71d87D4B16A36bb8aeCD51","Pos":5,"Tableid":3}
        Log.Trace('[_handleLeave] cc.dgame.tableInfo.SeatId:' + cc.dgame.tableInfo.SeatId +
            ', cc.dgame.tableInfo.SittingSeatId: ' + cc.dgame.tableInfo.SittingSeatId +
            ', data.Pos: ' + data.Pos + ', data.Errstr: ' + data.Errstr + ', data.Addr.toLowerCase(): ' + data.Addr.toLowerCase()
        + ', cc.dgame.settings.account.Addr.toLowerCase():' + cc.dgame.settings.account.Addr.toLowerCase() + ', this._exitRoomFlag:' + this._exitRoomFlag);
        if (data.Errstr != "") {
            if (data.Addr.toLowerCase() == cc.dgame.settings.account.Addr.toLowerCase()) {
                if (this._exitRoomFlag == true) {
                    delete this._exitRoomFlag;
                    cc.dgame.normalLoading.stopInvokeWaiting();
                }
            }
            return
        }
        if (data.Addr.toLowerCase() == cc.dgame.settings.account.Addr.toLowerCase()) {
            delete cc.dgame.tableInfo.SittingSeatId;
            delete cc.dgame.tableInfo.SeatId;
            cc.dgame.tableInfo.SelfReady = false;
            this.playerMyself = null;
            cc.dgame.tableInfo.ContractStatus = Types.ContractStatus.NOTJOIN;
            this.dealerMark.active = false;
            cc.dgame.mainMenuPopup.updateStatus();
            if (!!this.playerMyself) {
                let player = this.playerMyself.getComponent('Player');
                if (!!player) {
                    player.stopAutoCheckoutCountDown();
                }
            } else {
                Log.Warn("this.playerMyself == null")
            }
            if (this._exitRoomFlag == true) {
                delete this._exitRoomFlag;
                cc.dgame.normalLoading.stopInvokeWaiting();
                if (this.fulltableid.string.indexOf("Free") != -1 || this.fulltableid.string.indexOf("Small") != -1 || this.fulltableid.string.indexOf("Medium") != -1 || this.fulltableid.string.indexOf("Large") != -1) {
                    cc.director.loadScene("GameHall");
                } else {
                    cc.director.loadScene("ClubHall");
                }
            }
            this._resetGameInfo();
            this._resetGameTable();
        }
        let playerNode = this.playerAnchors[this._maxPlayerStr][data.Pos].getChildren()[0];
        if (playerNode != null) {
            let player = playerNode.getComponent('Player');
            if (player != null) {
                player.initPlayerInfo(data.Pos, '', '', 0, Types.ContractStatus.NOTJOIN);
                player.stopAutoCheckoutCountDown();
                if (cc.dgame.tableInfo.SelfReady) {
                    player.disable();
                } else {
                    player.enable();
                }
            } else {
                Log.Warn("player == null")
            }
        } else {
            Log.Warn("playerNode == null")
        }
        delete cc.dgame.tableInfo.LastDealer;
        //旁观和正在玩的情况下不重置其他位置的状态
        if (!cc.dgame.tableInfo.SelfReady) {
            var seatinfo_cmd = {
                TableId: cc.dgame.tableInfo.TableId,
            };
            cc.dgame.net.gameCall(['seatInfoEx', JSON.stringify(seatinfo_cmd)], this._onSeatInfoEx.bind(this));
        }
    },

    _handleClearGame(clearInfo) {
        Log.Trace('[_handleClearGame] clearInfo:' + JSON.stringify(clearInfo) +
            ' ,cc.dgame.tableInfo.SeatId:' + cc.dgame.tableInfo.SeatId);
        if (cc.dgame.tableInfo.SeatId != clearInfo.Pos) {
            return
        }
        let animationTimerInfo = this._getAnimationTimerDelay();
        if (animationTimerInfo.count > 0 || this._getTypeInGameEventQueueCount("GameOverInfo") == 1) {
            let clearGameEvent = {};
            clearGameEvent.Event = "ClearGame";
            clearGameEvent.Params = clearInfo;
            cc.dgame.tableInfo.RawGameEventQueue.push(clearGameEvent);
            Log.Trace('[_handleClearGame] new: ' + this._getAllMsgCount());
            return;
        }
        this._restoreOperatePanel();
        this._resetINS();
        for (let i = 0; i < this._maxPlayers; i++) {
            var sitdownPlayerNode = this.playerAnchors[this._maxPlayerStr][i].getChildren()[0];
            var sitdownPlayer = sitdownPlayerNode.getComponent('Player');
            let isEmpty = sitdownPlayer.isEmpty();
            if (isEmpty == false) {
                Log.Trace('[_handleClearGame] clear pos:' + i);
                sitdownPlayer.stopCountDown();
                sitdownPlayer.hideAllActions();
                sitdownPlayer.hideBet();
                sitdownPlayer.hideDealCards();
                sitdownPlayer.hideWinloss();
                sitdownPlayer.hideCardType();
                sitdownPlayer.hideINSFlag();
            }
        }
    },

    _handleStart (data) {
        //{"Addr":"0x5030BdC5d71ea71B9cbeD4c4411EB6826caF6a97","Errstr":"","Pos":5,"Tableid":2}
        Log.Trace('[_handleStart] ' + JSON.stringify(data));
        var playerNode = this.playerAnchors[this._maxPlayerStr][data.Pos].getChildren()[0];
        var player = playerNode.getComponent('Player');
        if (player.getPlayerAddr() != "") {
            if (data.Errstr != "") {
                if (data.Errstr == "table timeout") {
                    cc.find("Canvas/TableTimeoutLayer/bg_tips/label").getComponent(cc.Label).string = "This table is over. Please select another table to play";
                    cc.find("Canvas/TableTimeoutLayer").active = true;
                    return;
                }
                player.showAction(Types.PlayerOP.STANDBY);
                if (cc.dgame.settings.account.Addr.toLowerCase() === data.Addr.toLowerCase()) {
                    cc.dgame.tableInfo.SelfReady = false;
                    player.showBtnResitDown();
                }
            } else {
                player.showAction(Types.PlayerOP.WAITING);
                player.stopAutoCheckoutCountDown();
                if (cc.dgame.settings.account.Addr.toLowerCase() === data.Addr.toLowerCase()) {
                    cc.dgame.tableInfo.SelfReady = true;
                }
            }
        }
    },

    _getTypeInGameEventQueueCount (type) {
        let count = 0;
        for (let i = 0; i < cc.dgame.tableInfo.RawGameEventQueue.length; i++) {
            if (cc.dgame.tableInfo.RawGameEventQueue[i].Event == type) {
                count++;
            }
        }
        return count;
    },

    _handleStartGame (data) {
        //{"Errstr":"","Hand":4,"Player":"0x90FC0EE5AE41a7296E249088312a17078CB7C64f","Pos":0,"Tableid":2}
        let animationTimerInfo = this._getAnimationTimerDelay();
        Log.Trace('[_handleStartGame] ' + JSON.stringify(data));
        if (animationTimerInfo.count > 0 || this._getTypeInGameEventQueueCount("Settle") == 1) {
            let startGameEvent = {};
            startGameEvent.Event = "StartGame";
            startGameEvent.Params = data;
            cc.dgame.tableInfo.RawGameEventQueue.push(startGameEvent);
            Log.Trace('[_handleStartGame] new: ' + this._getAllMsgCount());
            return;
        }

        Log.Trace('[_handleStartGame] ' + this._getAllMsgCount());

        cc.dgame.tableInfo.StartAction = true;

        //这次调用playersinfo为了确定本局有哪些玩家
        var playersinfo_cmd = {
            TableId: cc.dgame.tableInfo.TableId,
        };
        cc.dgame.net.gameCall(['playersinfo', JSON.stringify(playersinfo_cmd)], this._onPlayersInfo.bind(this));

        cc.dgame.tableInfo.CurrentHand = data.Hand;
        cc.dgame.tableInfo.DealCardFlag[data.Hand] = {};
        cc.dgame.tableInfo.DealCardFlag[data.Hand].RecvFirstTurnInfo = false;
        cc.dgame.tableInfo.DealCardFlag[data.Hand].NeedDealCard = true;
        this.debugInfo.string = this._getAllMsgCount();
    },

    _handleBlindInfo (blindInfo) {
        //{"BigBlind":5,"Dealer":0,"Hand":153,"SmallBlind":0,"SmallBlindBet":5,"TotalAnteBet":4}
        Log.Trace('[_handleBlindInfo] ' + JSON.stringify(blindInfo));
        let curHand = blindInfo.Hand;
        Log.Debug('[_handleBlindInfo] curHand: ' + curHand);
        cc.dgame.tableInfo.BlindInfo = blindInfo;
        cc.dgame.utils.setOriginValue(this.currentRoundPotNum,cc.dgame.tableInfo.BlindInfo.TotalAnteBet);
        this.currentPotLayer.active = true;
        this._dealCardPlayerPosArray = blindInfo.DealCardSequence;

        Log.Trace("[_handleBlindInfo] this.securityTipsBackground.parent.opacity: " + this.securityTipsBackground.parent.opacity);
        if (this.securityTipsBackground.parent.opacity == 255) {
            this.securityTipsBackground.parent.runAction(
                cc.sequence(
                    cc.delayTime(1.5),
                    cc.fadeOut(1),
                )
            );
        }
    },

    _handleSyncGameReplaysBlindInfo (blindInfo) {
        //旁观/切后台后切回来/杀进程后恢复找fc同步GameReplays不会收到StartGame事件，需要在这里初始化
        Log.Trace('[_handleSyncGameReplaysBlindInfo] ' + JSON.stringify(blindInfo));
        let curHand = blindInfo.Hand;
        Log.Debug('[_handleSyncGameReplaysBlindInfo] curHand: ' + curHand);
        cc.dgame.tableInfo.BlindInfo = blindInfo;
        this.currentPotLayer.active = true;
        this._dealCardPlayerPosArray = blindInfo.DealCardSequence;
        var playersinfo_cmd = {
            TableId: cc.dgame.tableInfo.TableId,
        };
        cc.dgame.net.gameCall(['playersinfo', JSON.stringify(playersinfo_cmd)], this._onPlayersInfo.bind(this));
    },

    _handleSelfHoleCards (selfHoleCards) {
        Log.Trace("[_handleSelfHoleCards] " + JSON.stringify(selfHoleCards));
        if (!cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_holecardslist")) {
            cc.sys.localStorage.setItem(cc.dgame.settings.account.Addr + "_holecardslist", "[]");
        }
        let holecardslist = JSON.parse(cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_holecardslist"));
        if (holecardslist.length >= 5) {
            let removeHoleCards = holecardslist.pop();
            cc.sys.localStorage.removeItem(cc.dgame.settings.account.Addr + "_" + removeHoleCards + "_SelfHoleCards");
        }
        holecardslist.unshift(selfHoleCards.TableId + "_" + selfHoleCards.Hand);
        Log.Trace("[_handleSelfHoleCards] holecardslist: " + JSON.stringify(holecardslist));
        cc.sys.localStorage.setItem(cc.dgame.settings.account.Addr + "_holecardslist", JSON.stringify(holecardslist));
        cc.sys.localStorage.setItem(cc.dgame.settings.account.Addr + "_" + selfHoleCards.TableId + "_" + selfHoleCards.Hand + "_SelfHoleCards", JSON.stringify(selfHoleCards.HoleCards));
    },

    _quickBetType () {
        let turnInfo = cc.dgame.tableInfo.TurnInfoList[cc.dgame.tableInfo.TurnInfoList.length - 1];
        if (turnInfo.Stage == Types.TexasStage.PREFLOP) {
            let maxTurnBet = 0;
            for (let seatId in turnInfo.PlayerInfo) {
                if (turnInfo.PlayerInfo[seatId].TurnBet > maxTurnBet) {
                    maxTurnBet = turnInfo.PlayerInfo[seatId].TurnBet;
                }
            }
            if (maxTurnBet == 2 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet) {
                return "bbraise";
            }
        }
        return "potraise";
    },

    _processMyTurn (turnInfo) {
        Log.Debug('[_processMyTurn] this.chooseAheadOfCheckOrFold :' + this.chooseAheadOfCheckOrFold
            + ', this.chooseAheadOfCall :' + this.chooseAheadOfCall +
            + ', this.chooseAheadOfCallAny :' + this.chooseAheadOfCallAny +
        ', turnInfo.OP:' + JSON.stringify(turnInfo.OP));
        this._reSetAheadOfNode();
        let player = this.playerMyself.getComponent('Player');
        player.hideActions();
        if (this.chooseAheadOfCall == true || this.chooseAheadOfCallAny == true) {
            this.chooseAheadOfCall = false;
            this.chooseAheadOfCallAny = false;
            cc.dgame.utils.setOriginValue(this.callNum,turnInfo.OP.Call.Value,"brown");
            this.onClickBtnCall();
            return
        } else if (this.chooseAheadOfCheckOrFold == true) {
            this.chooseAheadOfCheckOrFold = false;
            if (turnInfo.OP.Call.Value > 0) {
                this.onClickBtnFold();
            } else {
                this.onClickBtnCheck();
            }
            return
        }
        this.btnFold.active = turnInfo.OP.Fold;
        this.btnCheck.active = turnInfo.OP.Check;
        this.btnCall.active = turnInfo.OP.Call.Flag;
        if (this.btnCall.active) {
            this.btnCall.getComponent(cc.Button).interactable = true;
            cc.dgame.utils.setOriginValue(this.callNum,turnInfo.OP.Call.Value,"brown");
        }
        this.btnFreeRaise.active = turnInfo.OP.Raise.Flag || turnInfo.OP.Bet;
        let stack = player.getStack();
        Log.Trace('[_processMyTurn] stack: ' + stack);
        let callNumVal = cc.dgame.utils.getOriginValue(this.callNum);
        if (callNumVal >= stack) {
            cc.dgame.utils.setOriginValue(this.callNum,stack,"brown");
            this.btnCall.active = false;
            this.btnAllin.active = true;
            this.btnFreeRaise.active = false;
            this.btnFreeRaiseDisable.active = true;
        }
        this.raiseMinVal = turnInfo.OP.Raise.Value;
        if (this.raiseMinVal >= stack) {
            this.raiseMinVal = stack;
        }
        if (this.btnFreeRaise.active) {
            //player.setFreeRaise();
            //this.freeRaiseStackNum.string = player.getStack();
            //this.allinStackNum.string = player.getStack();
            //计算底池加注
            let quickBetType = this._quickBetType();
            if (quickBetType == "potraise") {
                this.potRaiseLayer.active = true;
                this.bigBlindRaiseLayer.active = false;
                let roundPotNumVal = cc.dgame.utils.getOriginValue(this.currentRoundPotNum);
                let pot = roundPotNumVal + callNumVal;
                let halfPot = Math.round(pot * 0.5 + callNumVal);
                let twoThirdPot = Math.round(pot * 2 / 3 + callNumVal);
                let fullPot = pot + callNumVal;
                Log.Trace('[_processMyTurn] halfPot: ' + halfPot + ', twoThirdPot: ' + twoThirdPot + ', fullPot: ' + fullPot + ', pot: ' + pot  + ', callNum: ' + callNumVal + ', stack: ' + stack);
                if (halfPot > 0 && halfPot <= stack) {
                    this.btnHalfPotRaise.active = true;
                    cc.dgame.utils.setOriginValue(this.halfPotRaiseNum,halfPot,"none");
                } else {
                    this.btnHalfPotRaise.active = false;
                }
                if (twoThirdPot > 0 && twoThirdPot <= stack) {
                    this.btnTwoThirdPotRaise.active = true;
                    cc.dgame.utils.setOriginValue(this.twoThirdPotRaiseNum,twoThirdPot,"none");
                } else {
                    this.btnTwoThirdPotRaise.active = false;
                }
                if (fullPot > 0 && fullPot <= stack) {
                    this.btnPotRaise.active = true;
                    cc.dgame.utils.setOriginValue(this.potRaiseNum,fullPot,"none");
                } else {
                    this.btnPotRaise.active = false;
                }
            } else {
                this.potRaiseLayer.active = false;
                this.bigBlindRaiseLayer.active = true;
                let twoTimesBB = Math.round(2 * 2 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet);
                let threeTimesBB = Math.round(3 * 2 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet);
                let fiveTimesBB = Math.round(5 * 2 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet);
                Log.Trace('[_processMyTurn] 2BB: ' + twoTimesBB + ', 3BB: ' + threeTimesBB + ', 5BB: ' + fiveTimesBB + ', raiseMinVal: ' + this.raiseMinVal + ', stack: ' + stack);
                if (twoTimesBB <= stack) {
                    this.btn2BBRaise.active = true;
                    cc.dgame.utils.setOriginValue(this.twoBBRaiseNum,twoTimesBB,"none");
                } else {
                    this.btn2BBRaise.active = false;
                }
                if (threeTimesBB <= stack) {
                    this.btn3BBRaise.active = true;
                    cc.dgame.utils.setOriginValue(this.threeBBRaiseNum,threeTimesBB,"none");
                } else {
                    this.btn3BBRaise.active = false;
                }
                if (fiveTimesBB <= stack) {
                    this.btn5BBRaise.active = true;
                    cc.dgame.utils.setOriginValue(this.fiveBBRaiseNum,fiveTimesBB,"none");
                } else {
                    this.btn5BBRaise.active = false;
                }
            }
        }

        let elapsedSecs = 0;
        if (!!turnInfo.CurTick && !!turnInfo.Tick) {
            elapsedSecs = turnInfo.CurTick - turnInfo.Tick;
        }
        if (this.btnCheck.active) {
            this._startAutoCheckCountDown(elapsedSecs);
        } else {
            this._startAutoFoldCountDown(elapsedSecs);
        }

        let managed = cc.find('Canvas/MenuLayer/LeftTopMemuLayer/BtnManaged/Managed');
        if (managed.active) {
            let actions = new Array();
            if (this.btnFold.active) {
                actions.push(this.onClickBtnFold);
            }
            if (this.btnCheck.active) {
                actions.push(this.onClickBtnCheck);
            }
            if (this.btnCall.active) {
                actions.push(this.onClickBtnCall);
            }
            if (this.btnHalfPotRaise.active) {
                actions.push(this.onClickBtnHalfPotRaise);
            }
            if (this.btnCheck.active) {
                actions.push(this.onClickBtnCheck);
            }
            if (this.btnCall.active) {
                actions.push(this.onClickBtnCall);
            }
            if (this.btnTwoThirdPotRaise.active) {
                actions.push(this.onClickBtnTwoThirdPotRaise);
            }
            if (this.btnCheck.active) {
                actions.push(this.onClickBtnCheck);
            }
            if (this.btnCall.active) {
                actions.push(this.onClickBtnCall);
            }
            if (this.btnPotRaise.active) {
                actions.push(this.onClickBtnPotRaise);
            }
            if (this.btnCheck.active) {
                actions.push(this.onClickBtnCheck);
            }
            if (this.btnCall.active) {
                actions.push(this.onClickBtnCall);
            }
            this.scheduleOnce(actions[parseInt(Math.random() * actions.length)], 0.1);
        }
    },

    _processAHeadOfOP (turnInfo) {
        if (turnInfo.CurnSeat == -1) {
            Log.Debug('[_processAHeadOfOP] urnInfo.CurnSeat == -1');
            this._reSetAheadOfNode();
            this.chooseAheadOfCheckOrFold = false;
            this.chooseAheadOfCallAny = false;
            this.chooseAheadOfCall = false;
            return
        }
        Log.Debug('[_processAHeadOfOP] turnInfo.OP: ' + JSON.stringify(turnInfo.OP));
        if (turnInfo.OP.AheadOfFold == true) {
            this.btnAheadOfCheckOrFold.active = true;
            if (turnInfo.OP.AheadOfCheck == true) {
                this.CheckOrFold.string = cc.dgame.utils.formatRichText("Check/fold", "#ffffff", true, false);
                this.btnAheadOfCallAny.active = true;
                this.btnAheadOfCall.active = false;
            } else {
                this.CheckOrFold.string = cc.dgame.utils.formatRichText("Fold", "#ffffff", true, false);
                this.btnAheadOfCall.active = true;
                this.btnAheadOfCallAny.active = false;
                Log.Debug('[_processAHeadOfOP] chooseAheadOfCallAny: ' + this.chooseAheadOfCallAny);
                Log.Debug('[_processAHeadOfOP] chooseAheadOfCall: ' + this.chooseAheadOfCall);
                if (this.chooseAheadOfCallAny == true) { //预操作-CallAny按钮之前被选中,有人下注则CallAny的UI表现及状态传递给Call,所见即所得
                    this.showAheadOfCallAny(false); //若再次加注按下条规则处理,即只选中CallNum一次
                    this.showAheadOfCall(true);
                } else if (this.chooseAheadOfCall == true) { //预操作-Call按钮之前被选中，若有加注需取消选中
                    let oldAheadOfCallNum = cc.dgame.utils.getOriginValue(this.aheadOfCallNum);
                    Log.Debug('[_processAHeadOfOP] oldAheadOfCallNum: ' + oldAheadOfCallNum);
                    if (oldAheadOfCallNum > 0 && turnInfo.OP.AheadOfCall.Value > oldAheadOfCallNum) {
                        this.showAheadOfCall(false);
                    }
                }
                cc.dgame.utils.setOriginValue(this.aheadOfCallNum,turnInfo.OP.AheadOfCall.Value,"brown");
            }
            Log.Debug('[_processAHeadOfOP] CheckOrFoldText: ' + this.CheckOrFold.string);
        } else {
            if (this.chooseAheadOfCall == true) { //预操作-Call按钮之前被选中，若上一个加注则刚好轮到自己要取消选中
                let oldAheadOfCallNum = cc.dgame.utils.getOriginValue(this.aheadOfCallNum);
                Log.Debug('[_processAHeadOfOP] oldAheadOfCallNum2: ' + oldAheadOfCallNum);
                if (oldAheadOfCallNum > 0 && turnInfo.OP.Call.Value > oldAheadOfCallNum) {
                    this.showAheadOfCall(false);
                }
            }
        }
    },

    _getShownPublicCardNum () {
        let result = 0;
        for (let i = 0; i < this.dealCommunityCards.length; i++) {
            if (this.dealCommunityCards[i].active) {
                result += 1;
            }
        }
        return result;
    },

    _isAllinDealCard () {
        if (cc.dgame.tableInfo.TurnInfoList.length < 2) {
            return false;
        }
        let turnInfo = cc.dgame.tableInfo.TurnInfoList[cc.dgame.tableInfo.TurnInfoList.length - 1];
        let lastTurnInfo = cc.dgame.tableInfo.TurnInfoList[cc.dgame.tableInfo.TurnInfoList.length - 2];
        let lastPublicCardNum = 0;
        let nowPublicCardNum = 0;
        if (lastTurnInfo.DeskCard != undefined && lastTurnInfo.DeskCard.length != undefined) {
            lastPublicCardNum = lastTurnInfo.DeskCard.length;
        }
        if (turnInfo.DeskCard != undefined && turnInfo.DeskCard.length != undefined) {
            nowPublicCardNum = turnInfo.DeskCard.length;
        }

        if (lastPublicCardNum == 0 && nowPublicCardNum >= 4 || lastPublicCardNum == 3 && nowPublicCardNum == 5) {
            Log.Info('[_isAllinDealCard] lastPublicCardNum: ' + lastPublicCardNum + ', nowPublicCardNum: ' + nowPublicCardNum);
            return true;
        }

        return false;
    },

    _handleNewTurn (turnInfo) {
        Log.Trace('[_handleNewTurn] ' + JSON.stringify(turnInfo));
        // if (cc.dgame.tableInfo.TurnInfoList.length < 1) {
        //     //安卓切后台后Cocos驱动的js动不了，但通知过来的消息JS能够处理，譬如被公证离线，离桌，调用resetGameTable会清除牌局数据，再切回前台cocos驱动的js能动后牌局早就不存在了
        //     delete this._animationTimerDelay["_handleNewTurn"];
        //     this._getAnimationTimerDelay();
        //     return;
        // }
        // let turnInfo = cc.dgame.tableInfo.TurnInfoList[cc.dgame.tableInfo.TurnInfoList.length - 1];
        let identifierDelay = 0.6;

        //桌上筹码推至底池
        this._chipsToPot(turnInfo);
        let bAllinDealCard = this._isAllinDealCard();
        let pubCards = this._getShownPublicCardNum();
        Log.Trace("[_handleNewTurn] bAllinDealCard: " + bAllinDealCard + ", getShownPublicCardNum: " + pubCards);
        if (!bAllinDealCard) {
            if (turnInfo.DeskCard.length == 3 && pubCards == 0) {
                this._dealFlopCards(cc.dgame.utils.getCard(turnInfo.DeskCard[0]), cc.dgame.utils.getCard(turnInfo.DeskCard[1]), cc.dgame.utils.getCard(turnInfo.DeskCard[2]), true);
                this.roundTips.string = cc.dgame.utils.formatRichText("Flop round", "#ffffff", true, true);
                identifierDelay = 0.7;
            } else if (turnInfo.DeskCard.length == 4 && pubCards == 3) {
                this._dealTurnCard(cc.dgame.utils.getCard(turnInfo.DeskCard[3]), true);
                this.roundTips.string = cc.dgame.utils.formatRichText("Turn round", "#ffffff", true, true);
                identifierDelay = 0.3;
            } else if (turnInfo.DeskCard.length == 5 && pubCards == 4) {
                this._dealRiverCard(cc.dgame.utils.getCard(turnInfo.DeskCard[4]), true);
                this.roundTips.string = cc.dgame.utils.formatRichText("River round", "#ffffff", true, true);
                identifierDelay = 0.3;
            }
        }
        let elapsedSecs = 0;
        if (!!turnInfo.CurTick && !!turnInfo.Tick) {
            elapsedSecs = turnInfo.CurTick - turnInfo.Tick
        }
        let curSeatId = turnInfo.CurnSeat;
        //当前行动的玩家非玩家自己则在头像上显示倒计时
        if (curSeatId != cc.dgame.tableInfo.SeatId) {
            if (curSeatId != -1) {
                let anchorCurPlayer = this.playerAnchors[this._maxPlayerStr][curSeatId].getChildren()[0];
                let curPlayer = anchorCurPlayer.getComponent('Player');
                curPlayer.startCountDown(15, elapsedSecs);
            }
            this.scheduleOnce(function () {
                let lastActionSeatId = -1;
                if (cc.dgame.tableInfo.TurnInfoList.length >= 2) {
                    let lastTurnInfo = cc.dgame.tableInfo.TurnInfoList[cc.dgame.tableInfo.TurnInfoList.length - 2];
                    lastActionSeatId = lastTurnInfo.CurnSeat;
                }

                //玩家指示标指向当前行动玩家
                if (this.actionIdentifier.active == false) {
                    this.actionIdentifier.active = true;
                }

                if (curSeatId != -1) {
                    let seatActualPos = this._getAnchorPosByContractPos(curSeatId);
                    if (seatActualPos < this._maxPlayers) {
                        let newHeight = this._actionIdentifierHeights[seatActualPos];
                        this.actionIdentifier.stopAllActions();
                        this.actionIdentifier.height = this._actionIdentifierOrgHeight;
                        if (lastActionSeatId == -1) {
                            this.actionIdentifier.angle = -this._actionIdentifierAngles[seatActualPos];
                            this.actionIdentifier.scale = 1;
                            this.actionIdentifier.height = newHeight;
                        } else {
                            this.actionIdentifier.runAction(
                                cc.spawn(
                                    cc.scaleTo(0.2, 1, newHeight / this._actionIdentifierOrgHeight),
                                    cc.rotateTo(0.2, this._actionIdentifierAngles[seatActualPos]),
                                )
                            );
                        }
                    }
                } else {
                    this.actionIdentifier.active = false;
                }
            }, identifierDelay);
        } else {
            this.actionIdentifier.active = false;
        }
        if (turnInfo.IsMyTurn) {
            this._processMyTurn(turnInfo);
        }
        if (!!turnInfo.RmtCard) {
            this._handleRmtCards(turnInfo);
        }
        delete this._animationTimerDelay["_handleNewTurn" + turnInfo.Stage];
        this._getAnimationTimerDelay();
    },

    _handleRmtCards (turnInfo) {
        cc.dgame.tableInfo.RMTCards = turnInfo.RmtCard;
        let dealRMTCommunityCards = new Array();
        dealRMTCommunityCards.push(this.dealRMTCommunityCards1);
        dealRMTCommunityCards.push(this.dealRMTCommunityCards2);
        dealRMTCommunityCards.push(this.dealRMTCommunityCards3);
        dealRMTCommunityCards.push(this.dealRMTCommunityCards4);

        //i，每一副多牌
        for (let i = 0; i < turnInfo.RmtCard.length; i++) {
            let pokerPtArr = new Array(5);
            //按照公共牌的位置设置每副多牌的牌点
            for (let j = 0; j < turnInfo.RmtCard[i].length; j++) {
                pokerPtArr[5 - turnInfo.RmtCard[i].length + j] = cc.dgame.utils.getCard(turnInfo.RmtCard[i][j]);
            }
            let k = 0;
            for (let j = 5 - turnInfo.RmtCard[i].length; j < 5; j++) {
                dealRMTCommunityCards[i][j].setPosition(dealRMTCommunityCards[i][5 - turnInfo.RmtCard[i].length].getPosition());
                dealRMTCommunityCards[i][j].active = true;
                let poker = dealRMTCommunityCards[i][j].getChildren()[0].getComponent('Poker');
                poker.setCardPoint(pokerPtArr[j]);
                poker.setFaceUp(true);
                if (k != 0) {
                    let moveEnd = cc.callFunc(function () {
                        delete this._animationTimerDelay["_handleRmtCards_moveEnd_" + i + "_" + j];
                        this._getAnimationTimerDelay();
                    }, this);
                    this.scheduleOnce(function () {
                        dealRMTCommunityCards[i][j].runAction(
                            cc.sequence(
                                cc.moveTo(0.2 * k, PositionData.RMTCommunityCardPositions[i][j].x, PositionData.RMTCommunityCardPositions[i][j].y),
                                moveEnd,
                            ),
                        );
                    }, 0.2 * (i + 1));
                    this._animationTimerDelay["_handleRmtCards_moveEnd_" + i + "_" + j] = new Date().getTime() + (0.2 * (i + 1)) * 1000 + 0.2 * k * 1000;
                    this._getAnimationTimerDelay();
                }
                k++;
            }
        }
    },

    _handleTurnInfo (turnInfo) {
        //{"CurnSeat":0,"DeskCard":{},"HandCard":["红心J","黑桃7"],"CardsLevelName":"皇家同花顺",IsMyTurn":true,
        //"OP":{"Bet":false,"Call":{"Flag":true,"Value":5},"Check":false,"Fold":true,"Raise":{"Flag":true,"Value":5}},
        //"PlayerInfo":[{"Allin":false,"Balance":2493,"Fold":false,"ID":0,"TotalBet":7,"TurnBet":5},
        //{"Allin":false,"Balance":2388,"Fold":false,"ID":5,"TotalBet":12,"TurnBet":10}]}
        //收到BlindInfo以后需要调用PlayersInfo来确认参与本局的所有玩家，确定发牌动画的顺序，BlindInfo和TurnInfo间隔过短会引发TurnInfo在PlayersInfo回应之前，此时需要将TurnInfo延迟一下
        let curHand = turnInfo.Hand;
        Log.Trace('[_handleTurnInfo] curHand: ' + curHand + ', isPlaying: ' + this._isPlaying() + ', TurnInfo: ' + JSON.stringify(turnInfo) + ', DealCardFlag: ' + JSON.stringify(cc.dgame.tableInfo.DealCardFlag) + ', SelfReady: ' + cc.dgame.tableInfo.SelfReady);
        //isPlaying为false有可能在旁观，但cc.dgame.tableInfo.SelfReady为false一定是已经离桌了，所以消息不处理
        if (turnInfo.Stage < Types.TexasStage.PREFLOP) {
            Log.Warn("[_handleTurnInfo] invalid stage")
            return true;
        }
        //{"Hand":8,"PlayerInfo":{},"Stage":2}  洗牌阶段切后台切前台会得到这样的turnInfo
        if (!turnInfo.PlayerInfo) {
            Log.Warn("[_handleTurnInfo] invalid turninfo");
            return true;
        }
        if (turnInfo.PlayerInfo.length == 0) {
            Log.Warn("[_handleTurnInfo] invalid turninfo");
            return true;
        }
        if (!!turnInfo.CardsLevelName && this._isPlaying()) {
            let cardtype = cc.dgame.utils.getCardType(turnInfo.CardsLevelName);
            if (cardtype != this.cardType.string) {
                let delay = 0.6;
                if (turnInfo.Stage == Types.TexasStage.FLOP) {
                    delay = 0.6;
                } else if (turnInfo.Stage == Types.TexasStage.Turn || turnInfo.Stage == Types.TexasStage.RIVER) {
                    delay = 0.4;
                }
                this.scheduleOnce(function () {
                    this.cardType.string = cardtype;
                }, delay + 1.4);
            }
        }
        let spectatorFirstTurn = false;
        if (cc.dgame.tableInfo.DealCardFlag[curHand].RecvFirstTurnInfo == false) {
            cc.dgame.tableInfo.DealCardFlag[curHand].RecvFirstTurnInfo = true;
            if (this._isPlaying() && cc.dgame.tableInfo.DealCardFlag[curHand].NeedDealCard) {
                if (turnInfo.IsMyTurn) {
                    cc.dgame.net.gameCall(["Play_ExtendDeclareTime", ""]);
                }
                this._resetCommunityCards();
                this._resetPlayerBets();
                this._resetTips();
                this._resetSelfHoleCards();
                this._showAnteAndBlindBetThenStartDealCards();
                var seatinfo_cmd = {
                    TableId: cc.dgame.tableInfo.TableId,
                };
                cc.dgame.net.gameCall(['seatInfoEx', JSON.stringify(seatinfo_cmd)], this._onSeatInfoEx.bind(this));
                return false;
            } else {
                spectatorFirstTurn = true;
                this._resetCommunityCards();
                this._resetPlayerBets();
                this._resetTips();
                this._resetSelfHoleCards();
                this.potLayer.active = true;
                this.currentPotLayer.active = true;
                switch (turnInfo.Stage) {
                case Types.TexasStage.PREFLOP:
                    this.roundTips.string = cc.dgame.utils.formatRichText("Preflop round", "#ffffff", true, true);
                    break;
                case Types.TexasStage.FLOP:
                    this.roundTips.string = cc.dgame.utils.formatRichText("Flop round", "#ffffff", true, true);
                    break;
                case Types.TexasStage.TURN:
                    this.roundTips.string = cc.dgame.utils.formatRichText("Turn round", "#ffffff", true, true);
                    break;
                case Types.TexasStage.RIVER:
                case Types.TexasStage.SHOWDOWN:
                    this.roundTips.string = cc.dgame.utils.formatRichText("River round", "#ffffff", true, true);
                    break;
                }
                this.roundTips.node.active = true;
                let dealer = this.playerAnchors[this._maxPlayerStr][cc.dgame.tableInfo.BlindInfo.Dealer].getChildren()[0].getComponent('Player');
                let newpos = this.dealerMark.parent.convertToNodeSpaceAR(dealer.getDealerMarkPos());
                Log.Info('[_handleTurnInfo] dealer: ' + cc.dgame.tableInfo.BlindInfo.Dealer + ', (' + newpos.x + ', ' + newpos.y + ')');
                this.dealerMark.setPosition(newpos);
                this.dealerMark.active = true;
                //旁观恢复在玩玩家头像右下角两张牌
                for (let i = 0; i < this._dealCardPlayerPosArray.length; i++) {
                    let playerPos = this._dealCardPlayerPosArray[i];
                    let player = this.playerAnchors[this._maxPlayerStr][playerPos].getChildren()[0].getComponent('Player');
                    if (playerPos != cc.dgame.tableInfo.SeatId) {
                        //其他玩家发牌，发到玩家头像FirstCard、SecondCard
                        player.recoverDealCards();
                    } else {
                        let selfHoleCardsStr = cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_" + turnInfo.TableId + "_" + curHand + "_SelfHoleCards");
                        if (!!selfHoleCardsStr) {
                            let selfHoleCards = JSON.parse(selfHoleCardsStr);
                            let selfHoleCardsInfo = {};
                            selfHoleCardsInfo.TableId = turnInfo.TableId;
                            selfHoleCardsInfo.Hand = curHand;
                            selfHoleCardsInfo.HoleCards = selfHoleCards;
                            cc.dgame.net.gameCall(["selfHoleCards", JSON.stringify(selfHoleCardsInfo)]);
                            //自身玩家发牌，发到HoleCard位置，然后隐藏，使用GameTable的HoleCard来翻转，弃牌的时候用Player的DealCard来弃牌
                            for (let j = 0; j < this.selfHoleCards.length; j++) {
                                this.selfHoleCards[j].active = true;
                                let poker = this.selfHoleCards[j].getChildren()[0].getComponent('Poker');
                                poker.setCardPoint(selfHoleCardsInfo.HoleCards[j]);
                                poker.setFaceUp(true);
                                if (turnInfo.PlayerInfo[playerPos + ""].Fold) {
                                    poker.disable();
                                } else {
                                    poker.enable();
                                }
                            }
                        } else {
                            Log.Trace("[_handleTurnInfo] empty " + cc.dgame.settings.account.Addr + "_" + turnInfo.TableId + "_" + curHand + "_SelfHoleCards");
                            player.recoverDealCards();
                        }
                    }
                    player.setBet(turnInfo.PlayerInfo[playerPos + ""].TurnBet);
                }
                let totalBet = 0;
                let turnTotalBet = 0;
                for (let seatId in turnInfo.PlayerInfo) {
                    if (turnInfo.PlayerInfo[seatId].TurnBet > 0) {
                        totalBet = totalBet + turnInfo.PlayerInfo[seatId].TotalBet;
                        turnTotalBet = turnTotalBet + turnInfo.PlayerInfo[seatId].TurnBet;
                    }
                }
                cc.dgame.utils.setOriginValue(this.potNum,turnTotalBet,"yellow");
                cc.dgame.utils.setOriginValue(this.currentRoundPotNum,totalBet);
                for (let i = 0; i < this.dealCommunityCards.length; i++) {
                    let poker = this.dealCommunityCards[i].getChildren()[0].getComponent("Poker");
                    let pokerPT = poker.getCardPoint();
                    if (!!turnInfo.DeskCard && !!turnInfo.DeskCard.length && !!turnInfo.DeskCard[i]) {
                        let turnInfoPT = cc.dgame.utils.getCard(turnInfo.DeskCard[i]);
                        Log.Trace("poker[" + i + "]: " + pokerPT + ", turnInfo.DeskCard[" + i + "]: " + turnInfo.DeskCard[i]);
                        if (pokerPT != turnInfoPT) {
                            poker.setCardPoint(turnInfoPT);
                        }
                        poker.setFaceUp(true);
                        poker.enable();
                        this.dealCommunityCards[i].active = true;
                    } else {
                        Log.Trace("poker[" + i + "]: " + pokerPT);
                        poker.setCardPoint(52);
                        this.dealCommunityCards[i].active = false;
                    }
                }
                var seatinfo_cmd = {
                    TableId: cc.dgame.tableInfo.TableId,
                };
                cc.dgame.net.gameCall(['seatInfoEx', JSON.stringify(seatinfo_cmd)], this._onSeatInfoEx.bind(this));
            }
        }

        if (turnInfo.CurnSeat == -1) {
            for (let seatId in turnInfo.PlayerInfo) {
                let playerNode = this.playerAnchors[this._maxPlayerStr][parseInt(seatId)].getChildren()[0];
                let player = playerNode.getComponent('Player');
                if (turnInfo.PlayerInfo[seatId].Operate < Types.PlayerOP.END) {
                    player.showAction(turnInfo.PlayerInfo[seatId].Operate);
                }
                if (!!turnInfo.PlayerInfo[seatId].HoleCards && turnInfo.PlayerInfo[seatId].HoleCards.length > 0 && cc.dgame.tableInfo.SeatId != parseInt(seatId)) {
                    player.revealHoleCards(turnInfo.PlayerInfo[seatId].HoleCards[0], turnInfo.PlayerInfo[seatId].HoleCards[1]);
                }
            }
            if (!!turnInfo.RmtCard) {
                this._handleRmtCards(turnInfo);
                return true;
            }
        }

        let newTurn = false;
        //新的一轮开始了
        Log.Trace("[_handleTurnInfo] cc.dgame.tableInfo.TurnInfoList.length: " + cc.dgame.tableInfo.TurnInfoList.length);
        if (cc.dgame.tableInfo.TurnInfoList.length > 0) {
            let lastTurnInfo = cc.dgame.tableInfo.TurnInfoList[cc.dgame.tableInfo.TurnInfoList.length - 1];
            let lastHoleCardCount = 0;
            let curHoleCardCount = 0;
            for (let seatId in lastTurnInfo.PlayerInfo) {
                if (!!lastTurnInfo.PlayerInfo[seatId].HoleCards && lastTurnInfo.PlayerInfo[seatId].HoleCards.length > 0) {
                    lastHoleCardCount++;
                }
            }
            for (let seatId in turnInfo.PlayerInfo) {
                if (!!turnInfo.PlayerInfo[seatId].HoleCards && turnInfo.PlayerInfo[seatId].HoleCards.length > 0) {
                    curHoleCardCount++;
                }
            }
            Log.Info('[_handleTurnInfo] last holecard count: ' + lastHoleCardCount + ', holecard count: ' + curHoleCardCount + ", last Stage: " + lastTurnInfo.Stage + ", Stage: " + turnInfo.Stage);
            if (lastTurnInfo.Stage != turnInfo.Stage || lastHoleCardCount != curHoleCardCount && curHoleCardCount >= 2) {
                newTurn = true;
                //本轮下注结束，各玩家下的注归入底池
                let animationTimerInfo = this._getAnimationTimerDelay();
                let delay = animationTimerInfo.duration + 1200;
                this.scheduleOnce(this._handleNewTurn.bind(this, turnInfo), delay / 1000);
                this._animationTimerDelay["_handleNewTurn" + turnInfo.Stage] = new Date().getTime() + delay;
                this._getAnimationTimerDelay();
            }
        }

        let elapsedSecs = 0;
        if (!!turnInfo.CurTick && !!turnInfo.Tick) {
            elapsedSecs = turnInfo.CurTick - turnInfo.Tick
        }

        if (!!turnInfo.RmtIns) {
            if (!!turnInfo.RmtIns.ShowRMTOption) {
                this._handleShowRMTOption(turnInfo.RmtIns.ShowRMTOption, elapsedSecs);
            } else if (!!turnInfo.RmtIns.RMTTimesResult) {
                this._handleRMTTimesResult(turnInfo.RmtIns.RMTTimesResult);
            } else if (!!turnInfo.RmtIns.RMTTimesChoose) {
                this._handleRMTTimesChoose(turnInfo.RmtIns.RMTTimesChoose, elapsedSecs);
            } else if (!!turnInfo.RmtIns.ShowINS) {
                this._handleShowINS(turnInfo.RmtIns.ShowINS, elapsedSecs);
            } else if (!!turnInfo.RmtIns.ShowPlayerINS) {
                this._showPlayerINSFlag(turnInfo.RmtIns.ShowPlayerINS);
            } else if (!!turnInfo.RmtIns.InsWinInfo) {
                this._handleINSWinInfo(turnInfo.RmtIns.InsWinInfo);
            }
        }
        cc.dgame.tableInfo.TurnInfoList.push(turnInfo);
        //计算底池与跟注大小
        let turnPotNum = 0;
        let totalPotNum = 0;
        for (let seatId in turnInfo.PlayerInfo) {
            Log.Trace('[_handleTurnInfo] player ' + seatId + ', stack: ' + turnInfo.PlayerInfo[seatId].Balance + ', bet: ' + turnInfo.PlayerInfo[seatId].TurnBet);
            let playerNode = this.playerAnchors[this._maxPlayerStr][seatId].getChildren()[0];
            let player = playerNode.getComponent('Player');
            player.setStack(turnInfo.PlayerInfo[seatId].Balance);
            player.showAction(turnInfo.PlayerInfo[seatId].Operate);
            totalPotNum += turnInfo.PlayerInfo[seatId].TotalBet;
            turnPotNum += turnInfo.PlayerInfo[seatId].TurnBet;
        }
        if (newTurn == false && turnInfo.CurnSeat != -1) {
            cc.dgame.utils.setOriginValue(this.potNum,totalPotNum - turnPotNum,"yellow");
        }
        cc.dgame.utils.setOriginValue(this.currentRoundPotNum,totalPotNum);

        //显示弃牌或Allin的玩家
        let lastActionSeatId = -1;
        if (cc.dgame.tableInfo.TurnInfoList.length >= 2) {
            let lastTurnInfo = cc.dgame.tableInfo.TurnInfoList[cc.dgame.tableInfo.TurnInfoList.length - 2];
            lastActionSeatId = lastTurnInfo.CurnSeat;
        }

        let curSeatId = turnInfo.CurnSeat;
        if (curSeatId != cc.dgame.tableInfo.SeatId && newTurn == false) {
            //当前行动的玩家非玩家自己则在头像上显示倒计时
            if (newTurn == false && curSeatId != -1) {
                let anchorCurPlayer = this.playerAnchors[this._maxPlayerStr][curSeatId].getChildren()[0];
                let curPlayer = anchorCurPlayer.getComponent('Player');
                curPlayer.startCountDown(15, elapsedSecs);
            }
            //玩家指示标指向当前行动玩家（非自己）
            if (this.actionIdentifier.active == false) {
                this.actionIdentifier.active = true;
            }
            if (curSeatId != -1) {
                let seatActualPos = this._getAnchorPosByContractPos(curSeatId);
                Log.Trace("[_handleTurnInfo] curSeatId: " + curSeatId + ", seatActualPos: " + seatActualPos);
                if (seatActualPos < this._maxPlayers) {
                    let newHeight = this._actionIdentifierHeights[seatActualPos];
                    this.actionIdentifier.stopAllActions();
                    this.actionIdentifier.height = this._actionIdentifierOrgHeight;
                    if (lastActionSeatId == -1) {
                        this.actionIdentifier.angle = -this._actionIdentifierAngles[seatActualPos];
                        this.actionIdentifier.scale = 1;
                        this.actionIdentifier.height = newHeight;
                    } else {
                        this.actionIdentifier.runAction(
                            cc.spawn(
                                cc.scaleTo(0.2, 1, newHeight / this._actionIdentifierOrgHeight),
                                cc.rotateTo(0.2, this._actionIdentifierAngles[seatActualPos]),
                            )
                        );
                    }
                }
            } else {
                this.actionIdentifier.active = false;
            }
        } else {
            this.actionIdentifier.active = false;
        }

        //若记录了上一轮行动玩家的座位号，则停止该玩家的倒计时
        Log.Trace("lastActionSeatId: " + lastActionSeatId + ", cc.dgame.tableInfo.SeatId: " + cc.dgame.tableInfo.SeatId + ", spectatorFirstTurn: " + spectatorFirstTurn);
        if (lastActionSeatId != -1 && lastActionSeatId != cc.dgame.tableInfo.SeatId && !spectatorFirstTurn) {
            let lastTurnInfo = cc.dgame.tableInfo.TurnInfoList[cc.dgame.tableInfo.TurnInfoList.length - 2];
            let lastPlayerNode = this.playerAnchors[this._maxPlayerStr][lastActionSeatId].getChildren()[0];
            let lastPlayer = lastPlayerNode.getComponent('Player');
            lastPlayer.stopCountDown();
            if (turnInfo.PlayerInfo[lastActionSeatId + ""].Fold && lastTurnInfo.PlayerInfo[lastActionSeatId + ""].Fold == false) {
                lastPlayer.showAction(Types.PlayerOP.FOLD);
                let sidePotPos = cc.find('Canvas/PotLayer/SidePotLayer').convertToWorldSpaceAR(cc.v2(0, 0));
                let playerWorldPt = lastPlayerNode.convertToWorldSpaceAR(cc.v2(0, 0));
                let angle = Math.atan2(sidePotPos.y - playerWorldPt.y, sidePotPos.x - playerWorldPt.x) * 180 / Math.PI - 90;
                lastPlayer.foldCards(playerWorldPt, playerWorldPt, sidePotPos, angle, 0.5);
            } else if (turnInfo.PlayerInfo[lastActionSeatId + ""].Allin && lastTurnInfo.PlayerInfo[lastActionSeatId + ""].Allin == false) {
                lastPlayer.showAction(Types.PlayerOP.ALLIN);
                lastPlayer.setAllinHead();
                if (lastActionSeatId != cc.dgame.tableInfo.SeatId) {
                    //自身玩家已经把筹码推到牌桌上了，这里不需要重复再推
                    let bet = lastPlayer.getBet();
                    let lastTotalBet = lastTurnInfo.PlayerInfo[lastActionSeatId + ""].TotalBet;
                    let curTotalBet = turnInfo.PlayerInfo[lastActionSeatId + ""].TotalBet;
                    lastPlayer.setBet(bet + curTotalBet - lastTotalBet, true);
                }
            } else {
                let lastTotalBet = lastTurnInfo.PlayerInfo[lastActionSeatId + ""].TotalBet;
                let curTotalBet = turnInfo.PlayerInfo[lastActionSeatId + ""].TotalBet;
                let action = turnInfo.PlayerInfo[lastActionSeatId + ""].Operate;
                let bet = lastPlayer.getBet();
                if (action < Types.PlayerOP.END) {
                    lastPlayer.showAction(action);
                    switch (action) {
                    case Types.PlayerOP.CHECK:
                        if (lastActionSeatId != cc.dgame.tableInfo.SeatId) {
                            cc.dgame.audioMgr.playCheckSound();
                        }
                        break;
                    case Types.PlayerOP.CALL:
                    case Types.PlayerOP.BET:
                    case Types.PlayerOP.RAISE:
                        if (lastActionSeatId != cc.dgame.tableInfo.SeatId) {
                            //自身玩家已经把筹码推到牌桌上了，这里不需要重复再推
                            lastPlayer.setBet(bet + curTotalBet - lastTotalBet, true);
                        }
                        break;
                    }
                }
                Log.Trace('lastAction: ' + lastActionSeatId + ', Stage: ' + turnInfo.Stage + ', curTotalBet: ' + curTotalBet + ', lastTotalBet: ' + lastTotalBet + ', Op: ' + action + ', CurrentTurnBet: ' + (bet + curTotalBet - lastTotalBet));
            }
        }
        this._processAHeadOfOP(turnInfo);
        if (turnInfo.IsMyTurn && newTurn == false) {
            this._processMyTurn(turnInfo);
        }

        Log.Trace("[_handleTurnInfo] newTurn: " + newTurn);
        if (newTurn == false) {
            //检查turnInfo中的公共牌和显示的是否一致
            for (let i = 0; i < this.dealCommunityCards.length; i++) {
                let poker = this.dealCommunityCards[i].getChildren()[0].getComponent("Poker");
                let pokerPT = poker.getCardPoint();
                if (!!turnInfo.DeskCard && !!turnInfo.DeskCard.length && !!turnInfo.DeskCard[i]) {
                    let turnInfoPT = cc.dgame.utils.getCard(turnInfo.DeskCard[i]);
                    Log.Trace("poker[" + i + "]: " + pokerPT + ", turnInfo.DeskCard[" + i + "]: " + turnInfo.DeskCard[i]);
                    if (pokerPT != turnInfoPT) {
                        poker.setCardPoint(turnInfoPT);
                    }
                    poker.setFaceUp(true);
                    poker.enable();
                    this.dealCommunityCards[i].active = true;
                } else {
                    Log.Trace("poker[" + i + "]: " + pokerPT);
                    poker.setCardPoint(52);
                    this.dealCommunityCards[i].active = false;
                }
            }
        }
        return true;
    },

    _handleLeaveNext (data) {
        Log.Trace('[_handleLeaveNext] ' + JSON.stringify(data));
        this._showTips('[' + data.Addr.substr(2, 8) + '] Has applied for settlement to leave the table, will automatically stand up after the end of this hand', true);
    },

    //处理非本玩家的暂离事件
    _handleStandupNext (data) {
        Log.Trace("[_handleStandupNext] " + JSON.stringify(data));
        let seatId = this._getSeatIdByPlayerAddr(data.Addr);
        Log.Trace("[_handleStandupNext] SeatId: " + seatId + ", cc.dgame.tableInfo.SeatId: " + cc.dgame.tableInfo.SeatId);
    },

    _potsToPlayers (potallot) {
        if (!potallot || !potallot.length) {
            Log.Warn("[_potsToPlayers] PotAllot is illegal");
            return;
        }
        //计算每个玩家赢得底池和边池个数来决定动画播放速度，由于每个边池消失时同时往所有赢得该边池的玩家发筹码，所以所有玩家动画播放速度以赢得边池数量最多的玩家为准
        //玩家赢后展示4秒，_resetGameTable在GameOverInfo后3秒执行，会重置边池状态，winPot正常速度0.95秒
        let maxPotNum = 0;
        let playerWinPotNum = new Array();
        let speed = 1;
        let interval = 1;   //1s
        //计算每一副牌各玩家赢取的底池个数
        for (let k = 0; k < potallot.length; k++) {
            playerWinPotNum.push({});
            for (let i = 0; i < potallot[k].length; i++) {
                let potAllot = potallot[k][i].Allot;
                for (let j = 0; j < potAllot.length; j++) {
                    let seatId = potAllot[j].Seat;
                    if (playerWinPotNum[k][seatId] == null) {
                        playerWinPotNum[k][seatId] = 0;
                    }
                    playerWinPotNum[k][seatId] = playerWinPotNum[k][seatId] + 1;
                }
            }
        }

        for (let k = 0; k < playerWinPotNum.length; k++) {
            for (let seatId in playerWinPotNum) {
                if (playerWinPotNum[k][seatId] > maxPotNum) {
                    maxPotNum = playerWinPotNum[k][seatId];
                }
            }
        }

        if (maxPotNum > 3 && maxPotNum < 7) {
            speed = 2;
            interval = 0.5;
        } else if (maxPotNum >= 7) {
            speed = 3;
            interval = 0.3;
        }

        for (let k = 0; k < potallot.length; k++) {
            //遍历每一副牌，每副牌显示时间3秒
            for (let i = 0; i < potallot[k].length; i++) {
                //遍历每一个池，每一个池的显示
                this.scheduleOnce(function () {
                    let potAllot = potallot[k][i].Allot;
                    if (i == 0) {   //主池
                        let potNum = cc.dgame.utils.getOriginValue(this.potNum);
                        for (let j = 0; j < potAllot.length; j++) {
                            let seatId = potAllot[j].Seat;
                            potNum = potNum - potAllot[j].Win;
                            if (potNum > 0) {
                                cc.dgame.utils.setOriginValue(this.potNum,potNum,"yellow");
                            } else {
                                this.potLayer.active = false;
                            }
                            let playerNode = this.playerAnchors[this._maxPlayerStr][seatId].getChildren()[0];
                            let player = playerNode.getComponent('Player');
                            let potPos = cc.find('Canvas/PotLayer').convertToWorldSpaceAR(cc.v2(0, 0));
                            player.winPot(potPos, speed);
                        }
                    } else {
                        this.scheduleOnce(function () {
                            let sidePotNum = cc.dgame.utils.getOriginValue(this.sidePotNums[i - 1]);
                            for (let j = 0; j < potAllot.length; j++) {
                                let seatId = potAllot[j].Seat;
                                sidePotNum = sidePotNum - potAllot[j].Win;
                                if (sidePotNum > 0) {
                                    cc.dgame.utils.setOriginValue(this.sidePotNums[i - 1],sidePotNum,"yellow");
                                } else {
                                    this.sidePots[i - 1].active = false;
                                }
                                let playerNode = this.playerAnchors[this._maxPlayerStr][seatId].getChildren()[0];
                                let player = playerNode.getComponent('Player');
                                let potPos = this.sidePots[i - 1].convertToWorldSpaceAR(cc.v2(0, 0));
                                player.winPot(potPos, speed);
                            }
                            delete this._animationTimerDelay["_winPot_" + k + "_" + i];
                            this._getAnimationTimerDelay();
                        }, interval * i);
                        this._animationTimerDelay["_winPot_" + k + "_" + i] = new Date().getTime() + interval * (i + 1) * 1000;
                        this._getAnimationTimerDelay();
                    }
                    delete this._animationTimerDelay["_winPot_" + k];
                    this._getAnimationTimerDelay();
                }, k * 3 + 0.1);
                this._animationTimerDelay["_winPot_" + k] = new Date().getTime() + (k * 3 + 0.1 + interval) * 1000;
                this._getAnimationTimerDelay();
            }
        }
    },

    _onGetGameReplays (gameReplayID, data) {
        Log.Trace("[_onGetGameReplays]" + JSON.stringify(data));
        cc.sys.localStorage.setItem(gameReplayID, JSON.stringify(data));
    },

    //将牌局结果存入牌局回顾中
    _saveGameResult (gameOverInfo) {
        let gameResult = {};
        gameResult.FullTableId = cc.dgame.tableInfo.FullTableId;
        gameResult.TableId = cc.dgame.tableInfo.TableId;
        gameResult.Hand = gameOverInfo.Hand;
        gameResult.BlindInfo = this.blindInfo.string;
        let val = cc.dgame.utils.getOriginValue(this.currentRoundPotNum);
        gameResult.Pot = val;
        gameResult.GameTime = cc.dgame.utils.getNowFormatDate();
        gameResult.PlayerInfo = new Array;
        gameResult.HoleCards = new Array;
        gameResult.CommunityCards = new Array;
        if (gameOverInfo.DeskCard.length != undefined && gameOverInfo.DeskCard.length > 0) {
            for (let j = 0; j < gameOverInfo.DeskCard.length; j++) {
                gameResult.CommunityCards.push(cc.dgame.utils.getCard(gameOverInfo.DeskCard[j]));
            }
            if (!!cc.dgame.tableInfo.RMTCards && cc.dgame.tableInfo.RMTCards.length == 1) {
                for (let j = 0; j < cc.dgame.tableInfo.RMTCards[0].length; j++) {
                    gameResult.CommunityCards.push(cc.dgame.utils.getCard(cc.dgame.tableInfo.RMTCards[0][j]));
                }
            }
        }
        if (!!gameOverInfo.InsWinList) {
            gameResult.INSSelfWin = 0;  //保险自身输赢
            gameResult.INSPlayerWin = {};   //买保险的玩家输赢
            if (!!gameOverInfo.InsBuyerList) {
                for (let order in gameOverInfo.InsBuyerList)
                {
                    let seatId = gameOverInfo.InsBuyerList[order] + "";
                    Log.Trace('[_saveGameResult] seatId:' + seatId + ', gameResult.INSPlayerWin[' + seatId + '] ' + gameResult.INSPlayerWin[seatId]);
                    if (gameResult.INSPlayerWin[seatId] == undefined) {
                        gameResult.INSPlayerWin[seatId] = 0;
                    }
                    let winList = gameOverInfo.InsWinList[order];
                    if (winList != null) {
                        for (let j = 0; j < winList.length; j++) {
                            gameResult.INSPlayerWin[seatId] += winList[j];
                        }
                    }
                }
                for (let seatId in gameResult.INSPlayerWin) {
                    gameResult.INSSelfWin -= gameResult.INSPlayerWin[seatId];
                }
            }
            Log.Trace('[_saveGameResult] gameOverInfo.INSPlayerWin ' + JSON.stringify(gameResult.INSPlayerWin));
            Log.Trace('[_saveGameResult] gameOverInfo.INSSelfWin ' + gameResult.INSSelfWin);
        }
        for (let seatId in gameOverInfo.PlayerInfo) {
            let playerNode = this.playerAnchors[this._maxPlayerStr][seatId].getChildren()[0];
            let player = playerNode.getComponent('Player');
            let playerInfo = {};
            playerInfo.Addr = player.getPlayerAddr();
            playerInfo.HoleCards = new Array;
            if (gameOverInfo.PlayerInfo[seatId].HandCard.length != undefined && gameOverInfo.PlayerInfo[seatId].HandCard.length > 0) {
                playerInfo.HoleCards.push(cc.dgame.utils.getCard(gameOverInfo.PlayerInfo[seatId].HandCard[0]));
                playerInfo.HoleCards.push(cc.dgame.utils.getCard(gameOverInfo.PlayerInfo[seatId].HandCard[1]));
            }
            playerInfo.RMTCommunityCards = new Array(gameOverInfo.PlayerInfo[seatId].Win.length);
            for (let j = 0; j < playerInfo.RMTCommunityCards.length; j++) {
                playerInfo.RMTCommunityCards[j] = new Array();
            }
            if (gameOverInfo.DeskCard.length != undefined && gameOverInfo.DeskCard.length > 0) {
                for (let k = 0; k < playerInfo.RMTCommunityCards.length; k++) {
                    for (let j = 0; j < gameOverInfo.DeskCard.length; j++) {
                        playerInfo.RMTCommunityCards[k].push(cc.dgame.utils.getCard(gameOverInfo.DeskCard[j]));
                    }
                }
            }
            if (!!cc.dgame.tableInfo.RMTCards) {
                for (let k = 0; k < playerInfo.RMTCommunityCards.length; k++) {
                    for (let j = 0; j < cc.dgame.tableInfo.RMTCards[k].length; j++) {
                        playerInfo.RMTCommunityCards[k].push(cc.dgame.utils.getCard(cc.dgame.tableInfo.RMTCards[k][j]));
                    }
                }
            }
            playerInfo.CardType = new Array;
            playerInfo.WinLoss = new Array;
            let totalWin = 0;
            for (let j = 0; j < gameOverInfo.PlayerInfo[seatId].Win.length; j++) {
                playerInfo.CardType.push(gameOverInfo.PlayerInfo[seatId].Fold ? "Fold" : cc.dgame.utils.getCardType(gameOverInfo.PlayerInfo[seatId].LevelName[j]));
                let win = gameOverInfo.PlayerInfo[seatId].Win[j];
                Log.Trace('[_saveGameResult] win ' + win);
                if (gameResult.INSPlayerWin != null && gameResult.INSPlayerWin[seatId] != null) {
                    win += gameResult.INSPlayerWin[seatId];
                }
                Log.Trace('[_saveGameResult] win2 ' + win);
                playerInfo.WinLoss.push(win);
                totalWin += parseFloat(win);
            }
            gameResult.PlayerInfo.push(playerInfo);
            //MySettings Records显示
            if (cc.dgame.tableInfo.SeatId == seatId) {
                gameResult.HoleCards.push(cc.dgame.utils.getCard(gameOverInfo.PlayerInfo[seatId].HandCard[0]));
                gameResult.HoleCards.push(cc.dgame.utils.getCard(gameOverInfo.PlayerInfo[seatId].HandCard[1]));
                gameResult.WinLoss = totalWin;
                gameResult.CardType = playerInfo.CardType[0];
            }
        }
        if (!cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_gamelist")) {
            cc.sys.localStorage.setItem(cc.dgame.settings.account.Addr + "_gamelist", "[]");
        }
        let gamelist = JSON.parse(cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_gamelist"));
        if (gamelist.length >= 30) {
            let removeGameResult = gamelist.pop();
            cc.sys.localStorage.removeItem(cc.dgame.settings.account.Addr + "_" + removeGameResult + "_result");
            cc.sys.localStorage.removeItem(cc.dgame.settings.account.Addr + "_" + removeGameResult + "_replay");
        }
        gamelist.unshift(gameResult.TableId + "_" + gameResult.Hand);
        Log.Trace("[_saveGameResult] gamelist: " + JSON.stringify(gamelist));
        cc.sys.localStorage.setItem(cc.dgame.settings.account.Addr + "_gamelist", JSON.stringify(gamelist));
        cc.sys.localStorage.setItem(cc.dgame.settings.account.Addr + "_" + gameResult.TableId + "_" + gameResult.Hand + "_result", JSON.stringify(gameResult));
        Log.Trace("[_saveGameResult] " + cc.dgame.settings.account.Addr + "_" + gameResult.TableId + "_" + gameResult.Hand + "_result save: " + JSON.stringify(gameResult));
        cc.dgame.net.gameCall(["Play_GetGameReplays", ""], this._onGetGameReplays.bind(this, cc.dgame.settings.account.Addr + "_" + gameResult.TableId + "_" + gameResult.Hand + "_replay"));
        // cc.sys.localStorage.setItem(cc.dgame.settings.account.Addr + "_" + gameResult.TableId + "_" + gameResult.Hand + "_replay", JSON.stringify(cc.dgame.gameReplayPopup.GameReplays[gameResult.Hand]));
        // console.log(cc.dgame.settings.account.Addr + "_" + gameResult.TableId + "_" + gameResult.Hand + "_replay save: " + JSON.stringify(cc.dgame.gameReplayPopup.GameReplays[gameResult.Hand]));
// [{
//     "Players": {
//         "2": {
//             "PlayerAddr": "0xe2A04360345EeCE3d7e781B652A998cfaaD559A8",
//             "Balance": 397,
//             "HoleCards": [],
//             "Bet": 1
//         },
//         "7": {
//             "PlayerAddr": "0x5806dc6556C3b2343ECC150A5eA8D3cB3ABA41F5",
//             "Balance": 800,
//             "HoleCards": [45, 44],
//             "Bet": 2
//         }
//     },
//     "Stage": 0,
//     "Dealer": 2,
//     "CommunityCards": [],
//     "Pots": []
// }, {
//     "Players": {
//         "2": {
//             "PlayerAddr": "0xe2A04360345EeCE3d7e781B652A998cfaaD559A8",
//             "Balance": 396,
//             "HoleCards": [],
//             "Bet": 2,
//             "Action": 5
//         },
//         "7": {
//             "PlayerAddr": "0x5806dc6556C3b2343ECC150A5eA8D3cB3ABA41F5",
//             "Balance": 800,
//             "HoleCards": [45, 44],
//             "Bet": 2
//         }
//     },
//     "Stage": 0,
//     "Dealer": 2,
//     "CommunityCards": [],
//     "Pots": []
// }, {
//     "Players": {
//         "2": {
//             "PlayerAddr": "0xe2A04360345EeCE3d7e781B652A998cfaaD559A8",
//             "Balance": 396,
//             "HoleCards": [],
//             "Bet": 2,
//             "Action": 5
//         },
//         "7": {
//             "PlayerAddr": "0x5806dc6556C3b2343ECC150A5eA8D3cB3ABA41F5",
//             "Balance": 800,
//             "HoleCards": [45, 44],
//             "Bet": 2,
//             "Action": 6
//         }
//     },
//     "Stage": 0,
//     "Dealer": 2,
//     "CommunityCards": [],
//     "Pots": []
// }, {
//     "Players": {
//         "2": {
//             "PlayerAddr": "0xe2A04360345EeCE3d7e781B652A998cfaaD559A8",
//             "Balance": 396,
//             "HoleCards": []
//         },
//         "7": {
//             "PlayerAddr": "0x5806dc6556C3b2343ECC150A5eA8D3cB3ABA41F5",
//             "Balance": 800,
//             "HoleCards": [45, 44]
//         }
//     },
//     "Stage": 1,
//     "Dealer": 2,
//     "CommunityCards": [24, 27, 41],
//     "Pots": [4],
//     "StageChange": true
// }, {
//     "Players": {
//         "2": {
//             "PlayerAddr": "0xe2A04360345EeCE3d7e781B652A998cfaaD559A8",
//             "Balance": 396,
//             "HoleCards": []
//         },
//         "7": {
//             "PlayerAddr": "0x5806dc6556C3b2343ECC150A5eA8D3cB3ABA41F5",
//             "Balance": 0,
//             "HoleCards": [45, 44],
//             "Action": 9,
//             "Bet": 800
//         }
//     },
//     "Stage": 1,
//     "Dealer": 2,
//     "CommunityCards": [24, 27, 41],
//     "Pots": [4]
// }, {
//     "Players": {
//         "2": {
//             "PlayerAddr": "0xe2A04360345EeCE3d7e781B652A998cfaaD559A8",
//             "Balance": 0,
//             "HoleCards": [],
//             "Action": 9,
//             "Bet": 396
//         },
//         "7": {
//             "PlayerAddr": "0x5806dc6556C3b2343ECC150A5eA8D3cB3ABA41F5",
//             "Balance": 0,
//             "HoleCards": [45, 44],
//             "Action": 9,
//             "Bet": 800
//         }
//     },
//     "Stage": 1,
//     "Dealer": 2,
//     "CommunityCards": [24, 27, 41],
//     "Pots": [4]
// }, {
//     "Players": {
//         "2": {
//             "PlayerAddr": "0xe2A04360345EeCE3d7e781B652A998cfaaD559A8",
//             "Balance": 0,
//             "HoleCards": [],
//             "Action": 9
//         },
//         "7": {
//             "PlayerAddr": "0x5806dc6556C3b2343ECC150A5eA8D3cB3ABA41F5",
//             "Balance": 0,
//             "HoleCards": [45, 44],
//             "Action": 9
//         }
//     },
//     "Stage": 3,
//     "Dealer": 2,
//     "CommunityCards": [24, 27, 41],
//     "Pots": [796, 404],
//     "StageChange": true,
//     "RMTCards": [
//         [23, 35],
//         [19, 39],
//         [13, 7],
//         [28, 18]
//     ]
// }, {
//     "Players": {
//         "2": {
//             "PlayerAddr": "0xe2A04360345EeCE3d7e781B652A998cfaaD559A8",
//             "Balance": 398,
//             "HoleCards": [10, 38],
//             "Action": 9,
//             "Win": [99, -100, 99, -98],
//             "CardType": ["对子", "高牌", "高牌", "对子"]
//         },
//         "7": {
//             "PlayerAddr": "0x5806dc6556C3b2343ECC150A5eA8D3cB3ABA41F5",
//             "Balance": 802,
//             "HoleCards": [45, 44, 45, 44],
//             "Action": 9,
//             "Win": [-100, 99, -100, 101],
//             "CardType": ["高牌", "对子", "高牌", "两对"]
//         }
//     },
//     "Stage": 3,
//     "Dealer": 2,
//     "CommunityCards": [24, 27, 41],
//     "Pots": [0],
//     "StageChange": true,
//     "RMTCards": [
//         [23, 35],
//         [19, 39],
//         [13, 7],
//         [28, 18]
//     ],
//     "WinGenCards": [
//         ["红心Q", "黑桃Q", "梅花A", "红心K", "梅花J"],
//         ["红心8", "方块8", "红心K", "方块7", "方块4"],
//         ["梅花A", "红心K", "黑桃Q", "黑桃9", "方块4"],
//         ["红心7", "方块7", "方块4", "梅花4", "红心K"]
//     ]
// }]
        // console.log("replay\n" + JSON.stringify(cc.dgame.gameReplayPopup.GameReplays[gameResult.Hand]));
// {
//     "FullTableId": "895970-001",
//     "TableId": 240510115512321,
//     "Hand": 1,
//     "BlindInfo": "1/2",
//     "Pot": 800,
//     "GameTime": "2019-12-11 16:21:17",
//     "PlayerInfo": [{
//         "Addr": "0xe2A04360345EeCE3d7e781B652A998cfaaD559A8",
//         "HoleCards": [23, 51],
//         "RMTCommunityCards": [
//             [2, 41, 46, 48, 4],
//             [28, 24, 42, 44, 17],
//             [14, 43, 9, 0, 21],
//             [45, 34, 5, 18, 37]
//         ],
//         "CardType": ["One pair", "High card", "High card", "One pair"],
//         "WinLoss": [-100, -100, -100, 100]
//     }, {
//         "Addr": "0x5806dc6556C3b2343ECC150A5eA8D3cB3ABA41F5",
//         "HoleCards": [35, 15],
//         "RMTCommunityCards": [
//             [2, 41, 46, 48, 4],
//             [28, 24, 42, 44, 17],
//             [14, 43, 9, 0, 21],
//             [45, 34, 5, 18, 37]
//         ],
//         "CardType": ["Full house", "One pair", "One pair", "One pair"],
//         "WinLoss": [100, 100, 100, -100]
//     }],
//     "HoleCards": [35, 15],
//     "CommunityCards": [],
//     "WinLoss": 200,
//     "CardType": "Full house"
// }
        Log.Trace('[_saveGameResult] ' + JSON.stringify(gameResult));
    },

    _isPlaying (seatId) {
        if (seatId != undefined) {
            if (this._dealCardPlayerPosArray.indexOf(seatId) != -1) {
                return true;
            }
        } else {
            if (cc.dgame.tableInfo.SeatId != null && cc.dgame.tableInfo.SeatId != undefined && this._dealCardPlayerPosArray.indexOf(cc.dgame.tableInfo.SeatId) != -1 && cc.dgame.tableInfo.ContractStatus >= Types.ContractStatus.PLAYING) {
                return true;
            }
        }
        return false;
    },

    _highlightCommunityCards (suit, genCards) {
        Log.Trace("[_highlightCommunityCards] suit: " + suit + ", genCards: " + JSON.stringify(genCards));
        let genCardsPTArr = new Array();
        for (let i = 0; i < genCards.length; i++) {
            genCardsPTArr.push(cc.dgame.utils.getCard(genCards[i]));
        }
        for (let i = 0; i < this.dealCommunityCards.length; i++) {
            let poker = this.dealCommunityCards[i].getChildren()[0].getComponent("Poker");
            if (this.dealCommunityCards[i].active) {
                poker.disable();
                this.highlightCommunityCards[i].setPosition(this.dealCommunityCards[i].getPosition());
                let highlightPoker = this.highlightCommunityCards[i].getChildren()[0].getComponent("Poker");
                highlightPoker.setCardPoint(poker.getCardPoint());
            }
        }
        let dealRMTCommunityCards = new Array();
        dealRMTCommunityCards.push(this.dealRMTCommunityCards1);
        dealRMTCommunityCards.push(this.dealRMTCommunityCards2);
        dealRMTCommunityCards.push(this.dealRMTCommunityCards3);
        dealRMTCommunityCards.push(this.dealRMTCommunityCards4);
        for (let i = 0; i < dealRMTCommunityCards.length; i++) {
            for (let j = 0; j < dealRMTCommunityCards[i].length; j++) {
                let poker = dealRMTCommunityCards[i][j].getChildren()[0].getComponent("Poker");
                if (dealRMTCommunityCards[i][j].active) {
                    poker.disable();
                    if (suit == i) {
                        this.highlightCommunityCards[j].setPosition(dealRMTCommunityCards[i][j].getPosition());
                        let highlightPoker = this.highlightCommunityCards[j].getChildren()[0].getComponent("Poker");
                        highlightPoker.setCardPoint(poker.getCardPoint());
                    }
                }
            }
        }
        for (let i = 0; i < this.highlightCommunityCards.length; i++) {
            this.highlightCommunityCards[i].active = true;
            let poker = this.highlightCommunityCards[i].getChildren()[0].getComponent("Poker");
            poker.setFaceUp(true);
            if (genCardsPTArr.indexOf(poker.getCardPoint()) == -1) {
                poker.disable();
            } else {
                poker.enable();
            }
        }
    },

    _highlightSelfHoleCards (genCards) {
        let genCardsPTArr = new Array();
        for (let i = 0; i < genCards.length; i++) {
            genCardsPTArr.push(cc.dgame.utils.getCard(genCards[i]));
        }
        for (let i = 0; i < this.selfHoleCards.length; i++) {
            let poker = this.selfHoleCards[i].getChildren()[0].getComponent("Poker");
            if (genCardsPTArr.indexOf(poker.getCardPoint()) == -1) {
                poker.disable();
            } else {
                poker.enable();
            }
        }
    },

    _handleGameOverInfo (gameOverInfo) {
        Log.Trace('[_handleGameOverInfo] ' + JSON.stringify(gameOverInfo) + ', cc.dgame.tableInfo.SelfReady: ' + cc.dgame.tableInfo.SelfReady);
        let animationTimerInfo = this._getAnimationTimerDelay();
        if (animationTimerInfo.count > 0) {
            let gameOverEvent = {};
            gameOverEvent.Event = "GameOverInfo";
            gameOverEvent.Params = gameOverInfo;
            cc.dgame.tableInfo.RawGameEventQueue.push(gameOverEvent);
            Log.Trace('[_handleGameOverInfo] new: ' + this._getAllMsgCount());
            return;
        }
        this.actionIdentifier.active = false;
        this.actionIdentifier.angle = 0;
        //桌上筹码推至底池
        let turnBets = this._chipsToPot(cc.dgame.tableInfo.TurnInfoList[cc.dgame.tableInfo.TurnInfoList.length - 1]);
        let delay = turnBets > 0 ? 1 : 0;
        let bAllinDealCard = this._isAllinDealCard();
        Log.Trace("[_handleGameOverInfo] after _chipsToPot, delay: " + delay + ", AllinDealCard: " + bAllinDealCard);
        //生成每副牌赢牌或平局的成牌
        let winGenCards = new Array(gameOverInfo.PotAllot.length);
        Log.Trace("[_handleGameOverInfo] before winGenCards: " + JSON.stringify(winGenCards));
        if (gameOverInfo.PotAllot.length == 1 && bAllinDealCard) {
            let pubCards = this._getShownPublicCardNum();
            if (pubCards == 0) {
                delay += 4.5;
            } else if (pubCards == 3) {
                delay += 3;
            } else if (pubCards == 4) {
                delay += 1.5;
            }
        }
        Log.Trace("[_handleGameOverInfo] after winGenCards, delay: " + delay);
        for (let k = 0; k < gameOverInfo.PotAllot.length; k++) {
            for (let seatId in gameOverInfo.PlayerInfo) {
                Log.Trace("[_handleGameOverInfo] gameOverInfo.PlayerInfo[" + seatId + "].GenCards[" + k + "]: " + JSON.stringify(gameOverInfo.PlayerInfo[seatId].GenCards[k]));
                if (gameOverInfo.PlayerInfo[seatId].Win[k] >= 0) {
                    winGenCards[k] = gameOverInfo.PlayerInfo[seatId].GenCards[k];
                    if (!!gameOverInfo.PlayerInfo[seatId].GenCards[k].length) {
                        this.scheduleOnce(function () {
                            this._highlightCommunityCards(k, winGenCards[k]);
                            delete this._animationTimerDelay["_highlightCommunityCards" + k];
                            this._getAnimationTimerDelay();
                        }, delay + k * 3 + 0.1);
                        this._animationTimerDelay["_highlightCommunityCards" + k] = new Date().getTime() + (delay + k * 3 + 0.1) * 1000;
                        this._getAnimationTimerDelay();
                        Log.Trace("[_handleGameOverInfo] _highlightCommunityCards after " + (delay + k * 3 + 0.1) + "s")
                    }
                }
            }
        }
        Log.Trace("[_handleGameOverInfo] after winGenCards: " + JSON.stringify(winGenCards));
        this._saveGameResult(gameOverInfo);
        //Allin后已揭晓底牌的发牌
        if (bAllinDealCard) {
            for (let seatId in gameOverInfo.PlayerInfo) {
                let playerNode = this.playerAnchors[this._maxPlayerStr][seatId].getChildren()[0];
                let player = playerNode.getComponent('Player');
                if (seatId != cc.dgame.tableInfo.SeatId && gameOverInfo.PlayerInfo[seatId].HandCard.length != undefined
                    && gameOverInfo.PlayerInfo[seatId].HandCard.length > 0 && gameOverInfo.PlayerInfo[seatId].GenCards.length != undefined
                    && gameOverInfo.PlayerInfo[seatId].GenCards.length > 0) {
                    player.revealHoleCards(cc.dgame.utils.getCard(gameOverInfo.PlayerInfo[seatId].HandCard[0]), cc.dgame.utils.getCard(gameOverInfo.PlayerInfo[seatId].HandCard[1]));
                }
            }
            let pubCards = this._getShownPublicCardNum();
            if (pubCards == 0) {
                delay = 4.5;
            } else if (pubCards == 3) {
                delay = 3;
            } else if (pubCards == 4) {
                delay = 1.5;
            }
            if (pubCards == 0) {
                this._dealFlopCards(cc.dgame.utils.getCard(gameOverInfo.DeskCard[0]), cc.dgame.utils.getCard(gameOverInfo.DeskCard[1]), cc.dgame.utils.getCard(gameOverInfo.DeskCard[2]), true);
                this.roundTips.string = cc.dgame.utils.formatRichText("Flop round", "#ffffff", true, true);
                this.scheduleOnce(function () {
                    this._dealTurnCard(cc.dgame.utils.getCard(gameOverInfo.DeskCard[3]), true);
                    this.roundTips.string = cc.dgame.utils.formatRichText("Turn round", "#ffffff", true, true);
                    delete this._animationTimerDelay["_dealTurnCard"];
                    this._getAnimationTimerDelay();
                }, 1.5);
                this._animationTimerDelay["_dealTurnCard"] = new Date().getTime() + 1500;

                this.scheduleOnce(function () {
                    this._dealRiverCard(cc.dgame.utils.getCard(gameOverInfo.DeskCard[4]), true);
                    this.roundTips.string = cc.dgame.utils.formatRichText("River round", "#ffffff", true, true);
                    delete this._animationTimerDelay["_dealRiverCard"];
                    this._getAnimationTimerDelay();
                }, 3);
                this._animationTimerDelay["_dealRiverCard"] = new Date().getTime() + 3000;
                this._getAnimationTimerDelay();
            } else if (pubCards == 3) {
                this._dealTurnCard(cc.dgame.utils.getCard(gameOverInfo.DeskCard[3]), true);
                this.roundTips.string = cc.dgame.utils.formatRichText("Turn round", "#ffffff", true, true);
                this.scheduleOnce(function () {
                    this._dealRiverCard(cc.dgame.utils.getCard(gameOverInfo.DeskCard[4]), true);
                    this.roundTips.string = cc.dgame.utils.formatRichText("River round", "#ffffff", true, true);
                    delete this._animationTimerDelay["_dealRiverCard"];
                    this._getAnimationTimerDelay();
                }, 1.5);
                this._animationTimerDelay["_dealRiverCard"] = new Date().getTime() + 1500;
                this._getAnimationTimerDelay();
            } else if (pubCards == 4) {
                this._dealRiverCard(cc.dgame.utils.getCard(gameOverInfo.DeskCard[4]), true);
                this.roundTips.string = cc.dgame.utils.formatRichText("River round", "#ffffff", true, true);
            }
        }
        this.scheduleOnce(function () {
            Log.Trace('[_handleGameOverInfo] GameOverInfo in schedule: ' + JSON.stringify(gameOverInfo));
// {
//     "DeskCard": "[]",
//     "Hand": 3,
//     "PlayerInfo": [{
//         "Balance": 200,
//         "Fold": false,
//         "GenCards": [
//             ["黑桃K", "梅花K", "黑桃Q", "红心10", "方块9"],
//             ["红心5", "方块5", "红心J", "方块9", "红心6"],
//             ["黑桃5", "方块6", "方块7", "梅花8", "方块9"],
//             ["红心9", "方块9", "红心K", "梅花J", "红心6"]
//         ],
//         "HandCard": ["红心6", "方块9"],
//         "Id": 2,
//         "Level": [1, 1, 4, 1],
//         "LevelName": ["对子", "对子", "顺子", "对子"],
//         "Win": [50, -150, 50, 50]
//     }, {
//         "Balance": 0,
//         "Fold": false,
//         "GenCards": [
//             ["黑桃K", "梅花K", "黑桃Q", "红心10", "红心8"],
//             ["梅花3", "黑桃4", "红心5", "梅花6", "黑桃7"],
//             ["方块7", "黑桃7", "方块6", "梅花6", "梅花A"],
//             ["红心K", "梅花J", "红心9", "黑桃7", "梅花6"]
//         ],
//         "HandCard": ["黑桃7", "梅花6"],
//         "Id": 7,
//         "Level": [1, 4, 2, 0],
//         "LevelName": ["对子", "顺子", "两对", "高牌"],
//         "Win": [-50, 150, -50, -50]
//     }],
//     "PotAllot": [
//         [{
//             "Allot": [{
//                 "Seat": 2,
//                 "Win": 100
//             }],
//             "PotValue": 100
//         }, {
//             "Allot": [{
//                 "Seat": 2,
//                 "Win": 100
//             }],
//             "PotValue": 100
//         }],
//         [{
//             "Allot": [{
//                 "Seat": 7,
//                 "Win": 100
//             }],
//             "PotValue": 100
//         }, {
//             "Allot": [{
//                 "Seat": 7,
//                 "Win": 100
//             }],
//             "PotValue": 100
//         }],
//         [{
//             "Allot": [{
//                 "Seat": 2,
//                 "Win": 100
//             }],
//             "PotValue": 100
//         }, {
//             "Allot": [{
//                 "Seat": 2,
//                 "Win": 100
//             }],
//             "PotValue": 100
//         }],
//         [{
//             "Allot": [{
//                 "Seat": 2,
//                 "Win": 100
//             }],
//             "PotValue": 100
//         }, {
//             "Allot": [{
//                 "Seat": 2,
//                 "Win": 100
//             }],
//             "PotValue": 100
//         }]
//     ]
// }
            this._restoreOperatePanel();
            this._resetINS();

            let rakeRate = cc.dgame.settings.rake;
            for (let seatId in gameOverInfo.PlayerInfo) {
                if (gameOverInfo.PlayerInfo[seatId].Win.length == 1 && gameOverInfo.PlayerInfo[seatId].Win[0] > 0) {
                    let rakeNum = parseInt(rakeRate * gameOverInfo.PlayerInfo[seatId].Win[0] / 100);
                    if (rakeNum > 0) {
                        gameOverInfo.PlayerInfo[seatId].Win[0] -= rakeNum;
                        gameOverInfo.PlayerInfo[seatId].Balance -= rakeNum;
                    }
                } else {
                    let totalWin = 0;
                    let totalWinTimes = 0;
                    for (let j = 0; j < gameOverInfo.PlayerInfo[seatId].Win.length; j++) {
                        if (gameOverInfo.PlayerInfo[seatId].Win[j] > 0) {
                            totalWin += gameOverInfo.PlayerInfo[seatId].Win[j];
                            totalWinTimes++;
                        }
                    }
                    let winTimes = 0;
                    let rakeNum = parseInt(rakeRate * totalWin / 100);
                    if (rakeNum > 0) {
                        for (let j = 0; j < gameOverInfo.PlayerInfo[seatId].Win.length; j++) {
                            if (gameOverInfo.PlayerInfo[seatId].Win[j] > 0) {
                                let rakenum = parseInt(rakeRate * gameOverInfo.PlayerInfo[seatId].Win[j] / 100);
                                if (rakenum > 0) {
                                    gameOverInfo.PlayerInfo[seatId].Win[j] -= rakenum;
                                    winTimes++;
                                }
                            }
                        }
                        gameOverInfo.PlayerInfo[seatId].Balance -= rakeNum;
                    }
                }
            }
            //this.potLayer.active = false;
            for (let seatId in gameOverInfo.PlayerInfo) {
                let playerNode = this.playerAnchors[this._maxPlayerStr][seatId].getChildren()[0];
                let player = playerNode.getComponent('Player');
                //player.setStack(gameOverInfo.PlayerInfo[i].Balance);
                //所有玩家停止操作
                player.stopCountDown();
                player.hideAllActions();
                if (seatId != cc.dgame.tableInfo.SeatId && !!gameOverInfo.PlayerInfo[seatId].HandCard.length &&
                    gameOverInfo.PlayerInfo[seatId].HandCard.length > 0 && !!gameOverInfo.PlayerInfo[seatId].GenCards.length
                    && gameOverInfo.PlayerInfo[seatId].GenCards.length > 0) {
                    player.revealHoleCards(cc.dgame.utils.getCard(gameOverInfo.PlayerInfo[seatId].HandCard[0]), cc.dgame.utils.getCard(gameOverInfo.PlayerInfo[seatId].HandCard[1]));
                }
                //只有一副牌
                if (gameOverInfo.PlayerInfo[seatId].Win.length == 1 && gameOverInfo.PlayerInfo[seatId].Win[0] > 0) {
                    if (gameOverInfo.PlayerInfo[seatId].LevelName[0] != '') {
                        player.setCardType(cc.dgame.utils.getCardType(gameOverInfo.PlayerInfo[seatId].LevelName[0]));
                    }
                    player.setWinloss(gameOverInfo.PlayerInfo[seatId].Win[0]);
                    //player.winPot();
                    if (seatId == cc.dgame.tableInfo.SeatId) {
                        this._selfPlayerWin(true);
                        this.scheduleOnce(function () {
                            this._selfPlayerWin(false);
                            delete this._animationTimerDelay["_hideSelfPlayerWin"];
                            this._getAnimationTimerDelay();
                        }, 4);
                        this._animationTimerDelay["_hideSelfPlayerWin"] = new Date().getTime() + 4000;
                        this._getAnimationTimerDelay();
                    } else {
                        player.setWinlight();
                        this.scheduleOnce(function () {
                            player.hideWinlight();
                            delete this._animationTimerDelay["_hidePlayer" + seatId + "Win"];
                            this._getAnimationTimerDelay();
                        }, 4);
                        this._animationTimerDelay["_hidePlayer" + seatId + "Win"] = new Date().getTime() + 4000;
                        this._getAnimationTimerDelay();
                    }
                } else if (gameOverInfo.PotAllot.length > 1) { //多牌情况
                    for (let j = 0; j < gameOverInfo.PotAllot.length; j++) {
                        this.scheduleOnce(function () {
                            player.setCardType(cc.dgame.utils.getCardType(gameOverInfo.PlayerInfo[seatId].LevelName[j]));
                            if (seatId == cc.dgame.tableInfo.SeatId) {
                                this._highlightSelfHoleCards(winGenCards[j]);
                            } else {
                                player.highlightHoleCards(winGenCards[j]);
                            }
                            if (gameOverInfo.PlayerInfo[seatId].Win[j] > 0) {
                                player.showRMTWinner();
                                player.setWinloss(gameOverInfo.PlayerInfo[seatId].Win[j]);
                            }
                            delete this._animationTimerDelay["_showRmtPlayer" + seatId + "Win"];
                            this._getAnimationTimerDelay();
                        }, j * 3 + 0.1);
                        this._animationTimerDelay["_showRmtPlayer" + seatId + "Win"] = new Date().getTime() + (j * 3 + 0.1) * 1000;
                        this.scheduleOnce(function () {
                            if (gameOverInfo.PlayerInfo[seatId].Win[j] > 0) {
                                player.hideRMTWinner();
                                player.hideWinloss();
                            }
                            delete this._animationTimerDelay["_hideRmtPlayer" + seatId + "Win"];
                            this._getAnimationTimerDelay();
                        }, (j + 1) * 3);
                        this._animationTimerDelay["_hideRmtPlayer" + seatId + "Win"] = new Date().getTime() + (j + 1) * 3 * 1000;
                        this._getAnimationTimerDelay();
                    }
                }
                let clearPlayerInfoDelay = 4;
                if (gameOverInfo.PlayerInfo[seatId].Win.length > 1) {
                    clearPlayerInfoDelay = gameOverInfo.PlayerInfo[seatId].Win.length * 3 + 1;
                }
                this.scheduleOnce(function () {
                    player.setStack(gameOverInfo.PlayerInfo[seatId].Balance);
                    player.hideDealCards();
                    player.hideWinloss();
                    player.hideCardType();
                    player.hideRMTWinner();
                    delete this._animationTimerDelay["_resetPlayer" + seatId];
                    this._getAnimationTimerDelay();
                }, clearPlayerInfoDelay);
                this._animationTimerDelay["_resetPlayer" + seatId] = new Date().getTime() + clearPlayerInfoDelay * 1000;
                this._getAnimationTimerDelay();

                //筹码打光了的处理
                if (gameOverInfo.PlayerInfo[seatId].Balance < 5 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet + cc.dgame.tableInfo.Ante) {
                    if (seatId == cc.dgame.tableInfo.SeatId) {
                        cc.dgame.tableInfo.SelfReady = false;
                        player.showBtnBackToPlay();
                        player.hideBtnResitDown();
                    }
                    player.showAction(Types.PlayerOP.STANDBY);
                    player.startAutoCheckoutCountDown(180, 0);
                }
            }

            this._potsToPlayers(gameOverInfo.PotAllot);
            this._resetGameInfo();
            let resetGameTableEvent = {};
            resetGameTableEvent.Event = "resetGameTable";
            cc.dgame.tableInfo.RawGameEventQueue.push(resetGameTableEvent);
            Log.Trace('[_handleGameOverInfo] new: ' + this._getAllMsgCount());

            delete this._animationTimerDelay["_handleGameOverInfo"];
            this._getAnimationTimerDelay();
        }, delay);
        this._animationTimerDelay["_handleGameOverInfo"] = new Date().getTime() + delay * 1000;
        this._getAnimationTimerDelay();
        Log.Trace("resetGameTable will run after " + delay + "s");
    },

    _showSecurityTips (content) {
        Log.Trace("[_showSecurityTips] content: " + content);
        this.securityTipsBackground.parent.stopAllActions();
        this.securityTips.string = content;
        // 计算宽
        this.securityTips.overflow = cc.Label.Overflow.NONE;
        this.securityTips.node.setContentSize(new cc.Size(0, 42));
        this.securityTips._forceUpdateRenderData();
        let textWidth = Math.min(this.securityTips.node.width, 450);
        textWidth = Math.round(textWidth / 30) * 30;

        // 计算高
        this.securityTips.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        this.securityTips.node.setContentSize(new cc.Size(textWidth, 0));
        this.securityTips._forceUpdateRenderData();
        let textHeight = this.securityTips.node.height;

        this.securityTips.node.width = textWidth;
        this.securityTips.node.height = textHeight;

        this.securityTipsBackground.parent.opacity = 255;
        this.securityTipsBackground.parent.active = true;
        this.securityTipsBackground.width = this.securityTips.node.width + 60;
        this.securityTipsBackground.height = this.securityTips.node.height + 15;
    },

    _handleSecurityTips (tipsInfo) {
        Log.Trace('[_handleSecurityTips] ' + JSON.stringify(tipsInfo));
        if (this.securityTips == null || this.securityTips == undefined) {
            Log.Warn('[_handleSecurityTips] this.securityTips: ' + this.securityTips);
            return;
        }
        if (tipsInfo.Content == "Communicating With The Chain..." ||
            tipsInfo.Content == "Safe Private Network Is Being Set Up...") {
            cc.dgame.utils.tipsCarousel(this.securityTipsBackground.parent, this.securityTips, tipsInfo.Content.substring(0, tipsInfo.Content.length - 3), 1.5);
        } else if (tipsInfo.Content == "Create Card Stacks Randomly & Shuffled by players one by one." ||
                   tipsInfo.Content == "Cards have been Shuffled and Encrypted, Completely Random & Unrecognizable") {
            let animationTimerInfo = this._getAnimationTimerDelay();
            Log.Trace('[_handleSecurityTips] old: ' + this._getAllMsgCount());
            let needDelay = false
            for (let i = 0; i < cc.dgame.tableInfo.RawGameEventQueue.length; i++) {
                let gameEvent = cc.dgame.tableInfo.RawGameEventQueue[i];
                if (gameEvent.Event == "SecurityTips" && gameEvent.Params.Content == "Create Card Stacks Randomly & Shuffled by players one by one." && tipsInfo.Content == "Cards have been Shuffled and Encrypted, Completely Random & Unrecognizable") {
                    needDelay = true;
                    break;
                }
            }
            if (animationTimerInfo.count > 0 || this._getTypeInGameEventQueueCount("StartGame") == 1 || needDelay) {
                let securityTipsEvent = {};
                securityTipsEvent.Event = "SecurityTips";
                securityTipsEvent.Params = tipsInfo;
                cc.dgame.tableInfo.RawGameEventQueue.push(securityTipsEvent);
                Log.Trace('[_handleSecurityTips] new: ' + this._getAllMsgCount());
                return;
            }
            this._showSecurityTips(tipsInfo.Content);
            if (tipsInfo.Content == "Cards have been Shuffled and Encrypted, Completely Random & Unrecognizable") {
                Log.Trace("[_dispatchGameEvent] this.securityTipsBackground.parent.opacity: " + this.securityTipsBackground.parent.opacity);
                if (this.securityTipsBackground.parent.opacity == 255) {
                    this.securityTipsBackground.parent.runAction(
                        cc.sequence(
                            cc.delayTime(1.5),
                            cc.fadeOut(1),
                        )
                    );
                }
            }
        } else {
            cc.dgame.tableInfo.SecurityTipsList.unshift(tipsInfo.Content);
            if (cc.find("Canvas/TableInfoDetailLayer").active) {
                let securityInfoList = cc.find("Canvas/TableInfoDetailLayer/scrollview").getComponent("SecurityInfoList");
                securityInfoList.populateList(cc.dgame.tableInfo.SecurityTipsList);
            }
        }
    },

    _handleNotaryInfo (notaryInfo) {
        Log.Trace('[_handleNotaryInfo] ' + JSON.stringify(notaryInfo));
        if (notaryInfo.Type == "dismissTable") {
            cc.find("Canvas/DismissTableLayer/bg_tips/label").getComponent(cc.Label).string = notaryInfo.Content;
            cc.find("Canvas/DismissTableLayer").active = true;
        }
    },

    _handleConnectStatus (statusInfo) {
        Log.Trace("[_handleConnectStatus] " + JSON.stringify(statusInfo) + ", this._resendQueue: " + JSON.stringify(this._resendQueue));
        if (cc.director.getScene().name != 'GameTable') {
            Log.Trace("[_handleConnectStatus] not in GameTable");
            return
        }
        if (!!statusInfo.Status) {  //网络恢复
            for (var i = 0; i < this._resendQueue.length; i++) {
                if (this._resendQueue[i].type == "gameSwitchForeground") {
                    this._gameSwitchForeground();
                }
                this._resendQueue.splice(i, 1);
                i--;
            }
        }
        if (this._isPlaying()) {
            let player = this.playerMyself.getComponent('Player');
            if (statusInfo.Status == false) {
                player.setDisconnectMark();
            } else {
                player.hideDisconnectMark();
            }
        }
    },

    _dispatchGameEvent () {
        let animationTimerInfo = this._getAnimationTimerDelay();
        Log.Trace('[_dispatchGameEvent] msgs: ' + cc.dgame.tableInfo.RawGameEventQueue.length + ', now: ' + Math.floor(new Date().getTime() / 1000) + ", _endTime: " + this._endTime + ", _isPlaying: " + this._isPlaying());
        if (this._delayPlayersInfo) {
            cc.dgame.net.gameCall(['playersinfo', JSON.stringify(playersinfo_cmd)], this._onPlayersInfo.bind(this));
        }
        //俱乐部桌没在玩超时提示
        if (this._endTime > 0 && Math.floor(new Date().getTime() / 1000) > this._endTime + 10 && !this._isPlaying() && cc.find("Canvas/TableTimeoutLayer").active == false) {
            Log.Info("[_dispatchGameEvent] This table is over. Please select another table to play");
            cc.find("Canvas/TableTimeoutLayer/bg_tips/label").getComponent(cc.Label).string = "This table is over. Please select another table to play";
            cc.find("Canvas/TableTimeoutLayer").active = true;
            return;
        }

        if (animationTimerInfo.count > 0) {
            Log.Trace('[_dispatchGameEvent] ' + animationTimerInfo.count + ' animation is still running');
            return;
        }
        if (cc.dgame.tableInfo.RawGameEventQueue.length == 0) {
            Log.Trace('[_dispatchGameEvent] Not receive new GameEvent ' + this._getAllMsgCount());
            return;
        }
        let gameEvent = cc.dgame.tableInfo.RawGameEventQueue[0];
        let needShift = true;
        if (gameEvent.Event === 'BlindInfo') {
            this._handleBlindInfo(gameEvent.Params);
        } else if (gameEvent.Event === 'SyncGameReplaysBlindInfo') {
            this._handleSyncGameReplaysBlindInfo(gameEvent.Params);
        } else if (gameEvent.Event === 'TurnInfo') {
            needShift = this._handleTurnInfo(gameEvent.Params);
        } else if (gameEvent.Event === 'GameOverInfo') {
            this._handleGameOverInfo(gameEvent.Params);
        } else if (gameEvent.Event == "Settle") {
            this._handleSettle(gameEvent.Params);
        } else if (gameEvent.Event == "StartGame") {
            this._handleStartGame(gameEvent.Params);
        } else if (gameEvent.Event == "SecurityTips") {
            this._handleSecurityTips(gameEvent.Params);
        } else if (gameEvent.Event == "resetGameTable") {
            this._resetGameTable();
        } else if (gameEvent.Event == "Leave") {
            this._handleLeave(gameEvent.Params);
        } else if (gameEvent.Event == "ClearGame") {
            this._handleClearGame(gameEvent.Params);
        } else if (gameEvent.Event == "NotaryInfo") {
            this._handleNotaryInfo(gameEvent.Params);
        }
        if (needShift) {
            cc.dgame.tableInfo.RawGameEventQueue.shift();
        } else {
            Log.Info('[_dispatchGameEvent] Unshift ' + gameEvent.Event + ' msg');
        }
        this.debugInfo.string = this._getAllMsgCount();
        Log.Trace('[_dispatchGameEvent] ' + this._getAllMsgCount());
    },

    _onGameEvent (data) {
        Log.Trace('[_onGameEvent] ' + JSON.stringify(data));
        if (this._isBackground && data.Event != "SelfHoleCards") {
            Log.Warn("[_onGameEvent] isBackground: " + this._isBackground);
            return;
        }
        if (data.Event === 'BlindInfo' || data.Event == "SyncGameReplaysBlindInfo" || data.Event == 'TurnInfo' || data.Event == 'GameOverInfo' || data.Event == 'NotaryInfo') {
            if (data.Event == "SyncGameReplaysBlindInfo") {
                if (!cc.dgame.tableInfo.DealCardFlag[data.Params.Hand]) {
                    cc.dgame.tableInfo.DealCardFlag[data.Params.Hand] = {};
                }
                cc.dgame.tableInfo.DealCardFlag[data.Params.Hand].RecvFirstTurnInfo = false;
                cc.dgame.tableInfo.DealCardFlag[data.Params.Hand].NeedDealCard = false;
            }

            cc.dgame.tableInfo.RawGameEventQueue.push(data);
            if (data.Event == 'GameOverInfo') {
                if (this._isPlaying()) {
                    cc.dgame.mainMenuPopup.disableCheckoutExit();
                }
                this._dispatchGameEvent();
            }
            Log.Trace('[_onGameEvent] ' + this._getAllMsgCount());
            this.debugInfo.string = this._getAllMsgCount();
        } else if (data.Event == "Join") {
            this._handleJoin(data.Params);
        } else if (data.Event == "Start") {
            this._handleStart(data.Params);
        } else if (data.Event == "Leave") {
            this._handleLeave(data.Params);
        } else if (data.Event === 'LeaveNext') {
            this._handleLeaveNext(data.Params);
        } else if (data.Event === "StandupNext") {
            this._handleStandupNext(data.Params);
        } else if (data.Event === 'AddChips') {
            this._handleAddChips(data.Params);
        } else if (data.Event === 'WithdrawChips') {
            this._handleWithdrawChips(data.Params);
        } else if (data.Event === 'ChangeSeats') {
            this._handleChangeSeats(data.Params);
        } else if (data.Event === "SelfHoleCards") {
            this._handleSelfHoleCards(data.Params);
        } else if (data.Event === 'Tips') {
            this._handleSecurityTips(data.Params);
        } else if (data.Event === 'GameTips') {
            this._showTips(data.Params.Content,data.Params.bFadeout);
        } else if (data.Event === "NotaryInfo") {
            this._handleNotaryInfo(data.Params);
        } else if (data.Event === "ConnectStatus") {
            this._handleConnectStatus(data.Params);
        } else if (data.Event === "ClearGame") {
            this._handleClearGame(data.Params);
        } else if (data.Event == "Settle") {
            this._handleSettle(data.Params);
        } else if (data.Event == "StartGame") {
            this._handleStartGame(data.Params);
        } else if (data.Event == "SecurityTips") {
            this._handleSecurityTips(data.Params);
        } else if (data.Event == "resetGameTable") {
            this._resetGameTable();
        }
    },

    _handleSettle (data) {
        let animationTimerInfo = this._getAnimationTimerDelay();
        Log.Trace('[_handleSettle] ' + JSON.stringify(data));
        if (animationTimerInfo.count > 0) {
            let settleGameEvent = {};
            settleGameEvent.Event = "Settle";
            settleGameEvent.Params = data;
            cc.dgame.tableInfo.RawGameEventQueue.push(settleGameEvent);
            Log.Trace('[_handleSettle] new: ' + this._getAllMsgCount());
            return;
        }

        Log.Trace('[_handleSettle] ' + this._getAllMsgCount());
        //当前局还有消息未处理完，放到这些消息后再处理Settle
        let foundSettle = false
        for (let i = 0; i < cc.dgame.tableInfo.RawGameEventQueue.length; i++) {
            if (cc.dgame.tableInfo.RawGameEventQueue[i].Event == "Settle") {
                foundSettle = true;
                break;
            }
        }

        if (!foundSettle) {
            let settleGameEvent = {};
            settleGameEvent.Event = "Settle";
            settleGameEvent.Params = data;
            cc.dgame.tableInfo.RawGameEventQueue.push(settleGameEvent);
            Log.Trace('[_handleSettle] new: ' + this._getAllMsgCount());
            return;
        }

        this._updateMenuStatus();
    },

    _onStandup (data) {
        Log.Trace('[_onStandup] ' + data);
    },

    _onJoinTable (data) {
        Log.Trace('[_onJoinTable] ' + JSON.stringify(data));
        //正在坐下时也不允许点击换座
        for (let i = 0; i < this._maxPlayers; i++) {
            let playerNode = this.playerAnchors[this._maxPlayerStr][i].getChildren()[0];
            let player = playerNode.getComponent('Player');
            if (player.getPlayerAddr() == "") {
                player.disable();
            }
        }
    },

    _joinTable (pos, buyinGold) {
        var jointable_cmd = {
            TableId: cc.dgame.tableInfo.TableId,
            NeedChips: buyinGold,
            Pos: pos,
        };
        cc.dgame.net.gameCall(['jointable', JSON.stringify(jointable_cmd)], this._onJoinTable.bind(this));
        this._joinReq.TableId = cc.dgame.tableInfo.TableId;
        this._joinReq.Amount = buyinGold;
        this._joinReq.Pos = pos;
    },

    _onAddChips (data) {
        Log.Trace('[_onAddChips] ' + JSON.stringify(data));
    },

    _addChips (buyinGold) {
        var addchips_cmd = {
            Chips: buyinGold,
        };
        cc.dgame.net.gameCall(['addChips', JSON.stringify(addchips_cmd)], this._onAddChips.bind(this));
    },

    onBtnBuyinChipsConfirmClicked () {
        let clubFlag = false;
        if (parseInt(cc.dgame.tableInfo.TableId) < 0xE000000000000 && (cc.dgame.tableInfo.TableProps & 0x1) == 0 && !this._isPlaying()) {
            clubFlag = true;
            if (cc.dgame.tableInfo.NeedApprove) {
                cc.dgame.gameRequestMgr.showWaitingTips();
            }
        }
        if (cc.dgame.tableInfo.WantSeatId == null || cc.dgame.tableInfo.WantSeatId == undefined) {
            this._addChips(cc.dgame.tableInfo.BuyinChips);
        } else {
            var sitdownPlayerNode = this.playerAnchors[this._maxPlayerStr][cc.dgame.tableInfo.WantSeatId].getChildren()[0];
            var sitdownPlayer = sitdownPlayerNode.getComponent('Player');
            let isEmpty = sitdownPlayer.isEmpty();
            let lastSeatId = this._getSeatIdByPlayerAddr(cc.dgame.settings.account.Addr);
            Log.Trace('[onClickBuyinGoldConfirm] wantSeatId: ' + cc.dgame.tableInfo.WantSeatId + ', lastSeatId: ' + lastSeatId + ', empty: ' + isEmpty + ', BuyinGoldType: ' + cc.dgame.tableInfo.BuyinGoldType);
            if (isEmpty && lastSeatId == -1 && cc.dgame.tableInfo.BuyinGoldType == Types.BuyinGoldType.SITDOWN) {
                cc.dgame.tableInfo.SittingSeatId = cc.dgame.tableInfo.WantSeatId;
                //调用将金币带入牌桌的合约
                this._joinTable(cc.dgame.tableInfo.WantSeatId, cc.dgame.tableInfo.BuyinChips);
                sitdownPlayer.initPlayerInfo(cc.dgame.tableInfo.WantSeatId, cc.dgame.settings.account.Addr, cc.dgame.settings.account.Addr.substr(2, 8), cc.dgame.tableInfo.BuyinChips, Types.ContractStatus.SEATED);
            } else {
                if (lastSeatId != cc.dgame.tableInfo.WantSeatId && cc.dgame.tableInfo.BuyinGoldType == Types.BuyinGoldType.SITDOWN) {
                    cc.dgame.tableInfo.SittingSeatId = cc.dgame.tableInfo.WantSeatId;
                    var lastSeatIdPlayerNode = this.playerAnchors[this._maxPlayerStr][lastSeatId].getChildren()[0];
                    var player = lastSeatIdPlayerNode.getComponent('Player');
                    player.initPlayerInfo(lastSeatId, '', '', 0, Types.ContractStatus.NOTJOIN);
                    player.enable();
                    player.hideAllActions();
                    this._changeSeats(cc.dgame.tableInfo.WantSeatId, cc.dgame.tableInfo.BuyinChips);
                    sitdownPlayer.initPlayerInfo(cc.dgame.tableInfo.WantSeatId, cc.dgame.settings.account.Addr, cc.dgame.settings.account.Addr.substr(2, 8), cc.dgame.tableInfo.BuyinChips, Types.ContractStatus.SEATED);
                } else if (cc.dgame.tableInfo.BuyinGoldType == Types.BuyinGoldType.BACKTOPLAY) {
                    sitdownPlayer.hideBtnBackToPlay();
                    sitdownPlayer.stopAutoCheckoutCountDown();
                    this._addChips(cc.dgame.tableInfo.BuyinChips);
                }
            }
            delete cc.dgame.tableInfo.WantSeatId;
        }
    },

    _onSelfLeave (data) {
        Log.Trace('[_onSelfLeave] ' + data);
    },

    _onSelfLeaveNext (data) {
        Log.Trace('[_onSelfLeaveNext] ' + JSON.stringify(data));
        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
    },

    //退出牌桌，先取消所有监听事件，从合约中退出，leave调用成功后返回游戏大厅
    onClickExitTableItem () {
        Log.Trace("[onClickExitTableItem]");
        cc.dgame.normalLoading.startInvokeWaiting();
        if (!!this.playerMyself) {
            let player = this.playerMyself.getComponent('Player');
            player.stopAutoCheckoutCountDown();
        }
        cc.dgame.net.gameCall(['checkLeave', ''], this._onCheckLeave.bind(this));
    },

    _onCheckLeave(data) {
        Log.Trace('[_onCheckLeave] ' + JSON.stringify(data));
        if (data.canLeave == true) {
            this.onClickExitTableItem2();
        } else {
            cc.dgame.normalLoading.stopInvokeWaiting();
        }
    },

    onClickExitTableItem2() {
        Log.Trace('[onClickExitTableItem2] ');
        //只删除部分，待合约真正离开触发Leave的时候再删除所有的
        Log.Trace("[onClickExitTableItem2] cc.dgame.tableInfo.SeatId:" + cc.dgame.tableInfo.SeatId);
        Log.Trace("[onClickExitTableItem2] cc.dgame.tableInfo.SittingSeatId:" + cc.dgame.tableInfo.SittingSeatId);
        if (cc.dgame.tableInfo.SeatId == undefined && cc.dgame.tableInfo.SittingSeatId == undefined) {
            cc.dgame.normalLoading.stopInvokeWaiting();
            if (this.fulltableid.string.indexOf("Free") != -1 || this.fulltableid.string.indexOf("Small") != -1 || this.fulltableid.string.indexOf("Medium") != -1 || this.fulltableid.string.indexOf("Large") != -1) {
                cc.director.loadScene("GameHall");
            } else {
                cc.director.loadScene("ClubHall");
            }
        } else {
            this._exitRoomFlag = true;
            var leave_cmd = {
                TableId: cc.dgame.tableInfo.TableId,
            };
            cc.dgame.net.gameCall(['leave', JSON.stringify(leave_cmd)], this._onSelfLeave.bind(this));
        }
    },

    onDirectExit() {
        Log.Trace("[onDirectExit]");
        var leave_cmd = {
            TableId: cc.dgame.tableInfo.TableId,
        };
        cc.dgame.net.gameCall(['leave', JSON.stringify(leave_cmd)], this._onSelfLeave.bind(this));
        if (this.fulltableid.string.indexOf("Free") != -1 || this.fulltableid.string.indexOf("Small") != -1 || this.fulltableid.string.indexOf("Medium") != -1 || this.fulltableid.string.indexOf("Large") != -1) {
            cc.director.loadScene("GameHall");
        } else {
            cc.director.loadScene("ClubHall");
        }
    },

    onClickConfirmCheckoutExit () {
        //this.checkoutExitToast.active = false;
        //this.mainMenuPopup.active = false;
        cc.dgame.net.gameCall(['leaveNext', '' + cc.dgame.tableInfo.TableId], this._onSelfLeaveNext.bind(this));
    },

    //自动弃牌倒计时处理函数
    _foldCountDownProc () {
        this._countDownTotal -= 1;
        if (this._countDownTotal <= 0) {
            this._stopAutoFoldCountDown();
            this.onClickBtnFold();
            return;
        }

        let progressBar = cc.find('Canvas/OperatePanelLayer/groupFold/btnFold/CountDownLayer/blackMask').getComponent(cc.ProgressBar);
        progressBar.progress = this._countDownTotal * 0.1 / this._operateCountDown;
        let countDownLabel = cc.find('Canvas/OperatePanelLayer/groupFold/btnFold/CountDownLayer/countDown').getComponent(cc.RichText);
        countDownLabel.string = cc.dgame.utils.formatRichText(parseInt(this._countDownTotal * 0.1), "#ffffff", true, false);
        if (parseInt(this._countDownTotal * 0.1) <= 3 && this._countDownOverTip == false) {
            this._countDownOverTip = true;
            cc.dgame.audioMgr.playTimeOverTip();
        }
    },

    //开始自动弃牌倒计时
    _startAutoFoldCountDown (elapsedSecs) {
        this._operateCountDown = 15;
        this._countDownOverTip = false;
        this._countDownTotal = (this._operateCountDown - elapsedSecs) * 10;
        let layerNode = cc.find('Canvas/OperatePanelLayer/groupFold/btnFold/CountDownLayer');
        layerNode.active = true;
        let countDownLabel = cc.find('Canvas/OperatePanelLayer/groupFold/btnFold/CountDownLayer/countDown').getComponent(cc.RichText);
        countDownLabel.string = cc.dgame.utils.formatRichText(this._operateCountDown, "#ffffff", true, false);
        this.schedule(this._foldCountDownProc, 0.1);
    },

    //停止自动弃牌倒计时
    _stopAutoFoldCountDown () {
        this.unschedule(this._foldCountDownProc);
        let layerNode = cc.find('Canvas/OperatePanelLayer/groupFold/btnFold/CountDownLayer');
        layerNode.active = false;
    },

    //自动看牌倒计时处理函数
    _checkCountDownProc () {
        this._countDownTotal -= 1;
        if (this._countDownTotal <= 0) {
            this._stopAutoCheckCountDown();
            this.onClickBtnCheck();
            return;
        }

        let progressBar = cc.find('Canvas/OperatePanelLayer/btnCheck/CountDownLayer/blackMask').getComponent(cc.ProgressBar);
        progressBar.progress = this._countDownTotal * 0.1 / this._operateCountDown;
        let countDownLabel = cc.find('Canvas/OperatePanelLayer/btnCheck/CountDownLayer/countDown').getComponent(cc.RichText);
        countDownLabel.string = cc.dgame.utils.formatRichText(parseInt(this._countDownTotal * 0.1), "#ffffff", true, false);
        if (parseInt(this._countDownTotal * 0.1) <= 3 && this._countDownOverTip == false) {
            this._countDownOverTip = true;
            cc.dgame.audioMgr.playTimeOverTip();
        }
    },

    //开始自动看牌倒计时
    _startAutoCheckCountDown (elapsedSecs) {
        this._operateCountDown = 15;
        this._countDownOverTip = false;
        this._countDownTotal = (this._operateCountDown - elapsedSecs) * 10;
        let layerNode = cc.find('Canvas/OperatePanelLayer/btnCheck/CountDownLayer');
        layerNode.active = true;
        let countDownLabel = cc.find('Canvas/OperatePanelLayer/btnCheck/CountDownLayer/countDown').getComponent(cc.RichText);
        countDownLabel.string = cc.dgame.utils.formatRichText(this._operateCountDown, "#ffffff", true, false);
        this.schedule(this._checkCountDownProc, 0.1);
    },

    //停止自动看牌倒计时
    _stopAutoCheckCountDown () {
        this.unschedule(this._checkCountDownProc);
        let layerNode = cc.find('Canvas/OperatePanelLayer/btnCheck/CountDownLayer');
        layerNode.active = false;
    },

    //给已坐下的玩家发牌
    _dealCards () {
        Log.Debug('[_dealCards] _dealCardPlayerPosArray: ' + JSON.stringify(this._dealCardPlayerPosArray));
        let potPos = cc.find('Canvas/PotLayer').convertToWorldSpaceAR(cc.v2(0, 0));
        for (let i = 0; i < this._dealCardPlayerPosArray.length; i++) {
            let playerPos = this._dealCardPlayerPosArray[i];
            let player = this.playerAnchors[this._maxPlayerStr][playerPos].getChildren()[0].getComponent('Player');
            if (playerPos != cc.dgame.tableInfo.SeatId) {
                //其他玩家发牌，发到玩家头像FirstCard、SecondCard
                player.dealCards(0.05 * i, 0.05 * this._dealCardPlayerPosArray.length + 0.05 * i, potPos, 0.2);
            } else {
                //自身玩家发牌，发到HoleCard位置，然后隐藏，使用GameTable的HoleCard来翻转，弃牌的时候用Player的DealCard来弃牌
                let holeCard1Pos = cc.find('Canvas/HoldCardsLayer/HoldCard_1').convertToWorldSpaceAR(cc.v2(0, 0));
                let holeCard2Pos = cc.find('Canvas/HoldCardsLayer/HoldCard_2').convertToWorldSpaceAR(cc.v2(0, 0));
                player.dealCardsPlayerMyself(0.05 * i, 0.05 * this._dealCardPlayerPosArray.length + 0.05 * i, potPos, holeCard1Pos, holeCard2Pos, 0.2, 1);
                player.operateLayer.setPosition(PositionData.PlayerComponentPositions[this._maxPlayers][0].PlayingOperateLayer.x, PositionData.PlayerComponentPositions[this._maxPlayers][0].PlayingOperateLayer.y);
                this.scheduleOnce(function () {
                    Log.Trace('player ' + playerPos + ' hideDealCards, tick: ' + new Date().getTime());
                    player.hideDealCards();
                    let selfHoleCardsStr = cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_" + cc.dgame.tableInfo.TableId + "_" + cc.dgame.tableInfo.CurrentHand + "_SelfHoleCards");
                    if (!!selfHoleCardsStr) {
                        let selfHoleCards = JSON.parse(selfHoleCardsStr);
                        for (let j = 0; j < this.selfHoleCards.length; j++) {
                            this.selfHoleCards[j].active = true;
                            let poker = this.selfHoleCards[j].getChildren()[0].getComponent('Poker');
                            let dstv2 = this.selfHoleCards[j].convertToWorldSpaceAR(cc.v2(0, 0));
                            poker.setCardPoint(selfHoleCards[j]);
                            poker.flipCard(dstv2, this.selfHoleCards[j].scale);
                        }
                    }
                    delete this._animationTimerDelay["player" + playerPos + "dealCards"];
                    this._getAnimationTimerDelay();
                }, 0.05 * this._dealCardPlayerPosArray.length * 2 + 0.3);
                Log.Trace("[_dealCards] " + playerPos + " start: " + new Date().getTime() + ", end: " + (new Date().getTime() + (0.05 * this._dealCardPlayerPosArray.length * 2 + 0.3) * 1000));
                this._animationTimerDelay["player" + playerPos + "dealCards"] = new Date().getTime() + (0.05 * this._dealCardPlayerPosArray.length * 2 + 0.3) * 1000;
                this._getAnimationTimerDelay();
            }
        }
        delete this._animationTimerDelay["_dealCards"];
        this._getAnimationTimerDelay();
    },

    update (dt) {
//        Log.Trace(this.selfHoleCard1.eulerAngles.y);
        return;
    },

    //根据合约位置获取牌桌位置
    _getAnchorPosByContractPos (contractPos) {
        let playerNode = this.playerAnchors[this._maxPlayerStr][contractPos].getChildren()[0];
        let curPos = playerNode.convertToWorldSpaceAR(cc.v2(0, 0));
        let result = "curPos: (" + curPos.x + ", " + curPos.y + ")\n";
        let playerPos = 0;
        let distanceArr = new Array();
        for (; playerPos < this._maxPlayers; playerPos++) {
            let pos = this.playerAnchors[this._maxPlayerStr][playerPos].convertToWorldSpaceAR(cc.v2(0, 0));
            result += playerPos + ": (" + pos.x + ", " + pos.y + ")\n";
            distanceArr.push(Math.sqrt(Math.pow(curPos.x - pos.x, 2) + Math.pow(curPos.y - pos.y, 2)));
            if (Math.abs(pos.x - curPos.x) < 1e-3 && Math.abs(pos.y - curPos.y) < 1e-3) {
                Log.Trace("[_getAnchorPosByContractPos] contractPos: " + contractPos + "\n" + result + "\n" + distanceArr.join(","));
                break;
            }
        }
        if (playerPos == this._maxPlayers) {
            Log.Warn("[_getAnchorPosByContractPos] can't getposition of contractPos: " + contractPos + "\n" + result + "\n" + distanceArr.join(","));
            let minDistance = Math.max(...distanceArr);
            for (let i = 0; i < distanceArr.length; i++) {
                if (distanceArr[i] < minDistance) {
                    minDistance = distanceArr[i];
                    playerPos = i;
                }
            }
        }
        return playerPos;
    },

    //旋转座位至最底部
    _shiftPlayerSeat () {
        Log.Trace('[_shiftPlayerSeat] start, cc.dgame.tableInfo.SeatId: ' + cc.dgame.tableInfo.SeatId);
        //playerAnchor的位置是不变的，0为最低，顺时针一圈，但playerAnchor下面挂的playerPrefab节点的位置可以转动
        //获取选定位子当前的位置位于哪个playerAnchors上
        if (cc.dgame.tableInfo.SeatId == null || cc.dgame.tableInfo.SeatId == undefined) { //sendMsg有延迟，可能已离开
            Log.Trace('[_shiftPlayerSeat] end');
            return
        }
        let playerPos = this._getAnchorPosByContractPos(cc.dgame.tableInfo.SeatId);

        //已移动到0位置上
        if (playerPos == 0) {
            cc.dgame.tableInfo.ShiftSeat = false;
            if (cc.dgame.tableInfo.IsRecover) {
                //状态恢复，庄家标识直接闪现
                let dealerNode = this.playerAnchors[this._maxPlayerStr][cc.dgame.tableInfo.BlindInfo.Dealer].getChildren()[0];
                let dealer = dealerNode.getComponent('Player');
                let newpos = this.dealerMark.parent.convertToNodeSpaceAR(dealer.getDealerMarkPos());
                this.dealerMark.setPosition(newpos);
                this.dealerMark.active = true;
                cc.dgame.tableInfo.IsRecover = false;
            } else {
                cc.dgame.net.gameCall(["Play_SyncGameReplays", ""]);
            }
            for (let i = 0; i < this._delayShiftSeatArray.length; i++) {
                if (this._delayShiftSeatArray[i].type == "onSeatInfoEx") {
                    this._onSeatInfoEx(this._delayShiftSeatArray[i].data);
                } else if (this._delayShiftSeatArray[i].type == "Play_Recover") {
                    cc.dgame.net.gameCall(["Play_Recover", ""]);
                }
                this._delayShiftSeatArray.splice(i, 1);
                i--;
            }
            Log.Trace('[_shiftPlayerSeat] end');
            return;
        }

        //在左侧则逆时针旋转，在右侧则顺时针旋转
        let nextSeat = playerPos <= this._maxPlayers / 2 ? -1 : +1;
        for (let i = 0; i < this._maxPlayers; i++) {
            let j = (i + this._maxPlayers + nextSeat) % this._maxPlayers;   //旋转到下一个新的位置
            let oldPlayerNode = this.playerAnchors[this._maxPlayerStr][i].getChildren()[0];
            let newPlayerNode = this.playerAnchors[this._maxPlayerStr][j].getChildren()[0];
            let oldPos = oldPlayerNode.convertToWorldSpaceAR(cc.v2(0, 0));  //老位置的世界坐标
            let newPos = newPlayerNode.convertToWorldSpaceAR(cc.v2(0, 0));  //新位置的世界坐标
            if (i != this._maxPlayers - 1) {
                //Log.Trace("Pos " + i + ": " + oldPos + " move to pos " + j + ": " + newPos);
                oldPlayerNode.runAction(
                    cc.moveBy(0.2, cc.v2(newPos.x - oldPos.x, newPos.y - oldPos.y)),
                );
            } else {
                //Log.Trace("Pos " + i + ": " + oldPos + " move to pos " + j + ": " + newPos);
                oldPlayerNode.runAction(
                    cc.sequence(
                        cc.moveBy(0.2, cc.v2(newPos.x - oldPos.x, newPos.y - oldPos.y)),
                        cc.callFunc(function() {
                            for (let k = 0; k < this._maxPlayers; k++) {
                                let playerNode = this.playerAnchors[this._maxPlayerStr][k].getChildren()[0];
                                let player = playerNode.getComponent('Player');
                                let curPos = this._getAnchorPosByContractPos(k);
                                player.initPlayerByTablePos(this._maxPlayers, curPos);
                            }
                            this.scheduleOnce(this._shiftPlayerSeat, 0.01);
                            Log.Trace('[_shiftPlayerSeat] need _shiftPlayerSeat again');
                        }, this)
                    )
                );
            }
        }
        Log.Trace('[_shiftPlayerSeat] end');
    },

    _handleChangeSeats (data) {
        Log.Trace('[_handleChangeSeats] ' + JSON.stringify(data));
        if (data.Errstr == "") {
            this._showNotice('ChangeSeat failed');
        } else {
            cc.dgame.tableInfo.SeatId = data.Pos;
            this._showNotice('ChangeSeat success');
        }
        var seatinfo_cmd = {
            TableId: cc.dgame.tableInfo.TableId,
        };
        cc.dgame.net.gameCall(['seatinfoEx', JSON.stringify(seatinfo_cmd)], this._onSeatInfoEx.bind(this));
    },

    _onChangeSeats (data) {
        Log.Trace('[_onChangeSeats] ' + JSON.stringify(data));
    },

    _changeSeats (pos, buyinGold) {
        var changeseats_cmd = {
            Chips: buyinGold,
            Pos: pos,
        };
        cc.dgame.net.gameCall(['changeseats', JSON.stringify(changeseats_cmd)], this._onChangeSeats.bind(this));
    },

    _handleAddChips (data) {
        let seatId = this._getSeatIdByPlayerAddr(data.Address);
        Log.Trace('[_handleAddChips] seatId: ' + seatId + ", cc.dgame.tableInfo.SeatId: " + cc.dgame.tableInfo.SeatId + ", data: " + JSON.stringify(data));
        let playerNode = this.playerAnchors[this._maxPlayerStr][seatId].getChildren()[0];
        let player = playerNode.getComponent('Player');
        if (seatId == cc.dgame.tableInfo.SeatId) {
            if (data.Errstr == "") {
                player.setStack(parseFloat(data.Amount));
                player.stopAutoCheckoutCountDown();
                player.hideBtnBackToPlay();
                player.enable();
                //this.allinStackNum.string = player.getStack();
                this._showTips('Buyin success', true);
                if (!cc.dgame.tableInfo.SelfReady) {
                    cc.dgame.net.gameCall(['ready', ''], this._onAddChipsSelfReady.bind(this));
                }
                cc.dgame.net.gameCall(['balanceOf', ''], this._onBalanceOf.bind(this));
            } else {
                this._showNotice('Buyin failed');
            }
            if (parseInt(cc.dgame.tableInfo.TableId) < 0xE000000000000 && (cc.dgame.tableInfo.TableProps & 0x1) == 0) {
                cc.dgame.gameRequestMgr.hideWaitingTips();
            }
        } else {
            if (data.Errstr == "") {
                player.setStack(parseFloat(data.Amount));
                player.stopAutoCheckoutCountDown();
                player.enable();
            }
        }
    },

    _onAddChips (data) {
        Log.Trace('[_onAddChips] ' + JSON.stringify(data));
    },

    _handleWithdrawChips (data) {
        Log.Trace('[_handleWithdrawChips] ' + JSON.stringify(data));
        if (data.Errstr == "") {
            let seatId = this._getSeatIdByPlayerAddr(data.Address);
            Log.Trace('[_handleWithdrawChips] seatId: ' + seatId);
            let playerNode = this.playerAnchors[this._maxPlayerStr][seatId].getChildren()[0];
            let player = playerNode.getComponent('Player');
            player.setStack(parseFloat(data.Amount));
            //this.allinStackNum.string = player.getStack();
            this._showTips('撤回成功', true);
            cc.dgame.net.gameCall(['balanceOf', ''], this._onBalanceOf.bind(this));
        } else {
            this._showNotice('撤回失败', true);
        }
    },

    _onWithdrawChips (data) {
        Log.Trace('[_onWithdrawChips] ' + JSON.stringify(data));
    },

    _withdrawChips (withdrawGold) {
        var withdrawchips_cmd = {
            Chips: withdrawGold,
        };
        cc.dgame.net.gameCall(['withdrawChips', JSON.stringify(withdrawchips_cmd)], this._onWithdrawChips.bind(this));
    },

    _onBet (data) {
        Log.Trace('[_onBet] ' + data);
        let betResult = JSON.parse(data)
        if (typeof(betResult) == 'object' && betResult.state != 0 && typeof(betResult.info) == 'string') {
            this._showNotice(betResult.info);
            if (betResult.info.indexOf("illegalisty Bet") != -1) {
                this._processMyTurn(cc.dgame.tableInfo.TurnInfoList[cc.dgame.tableInfo.TurnInfoList.length - 1]);
            }
        } else if (typeof(betResult) == 'object' && betResult.state == 0) {
            let player = this.playerMyself.getComponent('Player');
            player.showAction(betResult.op);
        }
    },

    _onFold (data) {
        Log.Trace('[_onFold]' + data);
    },

    onClickBtnFold () {
        let player = this.playerMyself.getComponent('Player');
        var fold_cmd = {
            ID: cc.dgame.tableInfo.SeatId
        };
        cc.dgame.net.gameCall(["Play_CheckOut", JSON.stringify(fold_cmd)], this._onFold.bind(this));
        player.showAction(Types.PlayerOP.FOLD);
        let sidePotPos = cc.find('Canvas/PotLayer/SidePotLayer').convertToWorldSpaceAR(cc.v2(0, 0));
        let holecard1ARWorldPt = this.selfHoleCards[0].convertToWorldSpaceAR(cc.v2(0, 0));
        let holecard2ARWorldPt = this.selfHoleCards[1].convertToWorldSpaceAR(cc.v2(0, 0));
        player.foldCards(holecard1ARWorldPt, holecard2ARWorldPt, sidePotPos, 0, 1);
        this.selfHoleCards[0].getChildren()[0].getComponent('Poker').disable();
        this.selfHoleCards[1].getChildren()[0].getComponent('Poker').disable();
        this._restoreOperatePanel();
    },

    onClickBtnCall () {
        let callNumVal = cc.dgame.utils.getOriginValue(this.callNum);
        let player = this.playerMyself.getComponent('Player');
        let bet = player.getBet();
        let stack = player.getStack();
        Log.Debug('[onClickBtnCall] stack: ' + stack + ', bet: ' + bet + ', callNum: ' + callNumVal);
        player.setBet(bet + callNumVal, true);
        player.setStack(stack - bet);
        player.showAction(Types.PlayerOP.CALL);
        var bet_cmd = {
            ID: cc.dgame.tableInfo.SeatId,
            Bet: callNumVal,
        };
        cc.dgame.net.gameCall(["Play_Bet", JSON.stringify(bet_cmd)], this._onBet.bind(this));
        this._restoreOperatePanel();
    },

    onChooseAheadOfCheckOrFold () {
        Log.Debug('[onChooseAheadOfCheckOrFold] this.chooseAheadOfCheckOrFold:' + this.chooseAheadOfCheckOrFold);
        if (this.chooseAheadOfCheckOrFold != true) {
            this.showAheadOfCheckOrFold(true);
            this.showAheadOfCall(false);
            this.showAheadOfCallAny(false);
        } else {
            this.showAheadOfCheckOrFold(false);
        }
    },

    showAheadOfCheckOrFold(isShow) {
        let unSelectSprite = this.AheadOfSprites[0];
        let selectedSprite = this.AheadOfSprites[1];
        Log.Debug('[showAheadOfCheckOrFold] unSelectSprite:' + unSelectSprite.name);
        Log.Debug('[showAheadOfCheckOrFold] selectedSprite:' + selectedSprite.name);
        Log.Debug('[showAheadOfCheckOrFold] this.btnAheadOfCallAny.getComponent(cc.Sprite).spriteFrame:'
            + this.btnAheadOfCallAny.getComponent(cc.Sprite).spriteFrame.name);
        if (isShow) {
            this.chooseAheadOfCheckOrFold = true;
            this.btnAheadOfCheckOrFold.getComponent(cc.Sprite).spriteFrame = selectedSprite;
        } else {
            this.chooseAheadOfCheckOrFold = false;
            this.btnAheadOfCheckOrFold.getComponent(cc.Sprite).spriteFrame = unSelectSprite;
        }
    },

    onChooseAheadOfCall () {
        Log.Debug('[onChooseAheadOfCall] this.chooseAheadOfCall:' + this.chooseAheadOfCall);
        if (this.chooseAheadOfCall != true) {
            this.showAheadOfCall(true);
            this.showAheadOfCallAny(false);
            this.showAheadOfCheckOrFold(false);
        } else {
            this.showAheadOfCall(false);
        }
    },

    showAheadOfCall(isShow) {
        let unSelectSprite = this.AheadOfSprites[2];
        let selectedSprite = this.AheadOfSprites[3];
        Log.Debug('[showAheadOfCall] unSelectSprite:' + unSelectSprite.name);
        Log.Debug('[showAheadOfCall] selectedSprite:' + selectedSprite.name);
        Log.Debug('[showAheadOfCall] this.btnAheadOfCallAny.getComponent(cc.Sprite).spriteFrame:'
            + this.btnAheadOfCallAny.getComponent(cc.Sprite).spriteFrame.name);
        if (isShow) {
            this.chooseAheadOfCall = true;
            this.btnAheadOfCall.getComponent(cc.Sprite).spriteFrame = selectedSprite;
        } else {
            this.chooseAheadOfCall = false;
            this.btnAheadOfCall.getComponent(cc.Sprite).spriteFrame = unSelectSprite;
        }
    },

    onChooseAheadOfCallAny () {
        Log.Debug('[onChooseAheadOfCallAny] this.chooseAheadOfCallAny:' + this.chooseAheadOfCallAny);
        if (this.chooseAheadOfCallAny != true) {
            this.showAheadOfCallAny(true);
            this.showAheadOfCall(false);
            this.showAheadOfCheckOrFold(false);
        } else {
            this.showAheadOfCallAny(false);
        }
    },

    showAheadOfCallAny(isShow) {
        let unSelectSprite = this.AheadOfSprites[4];
        let selectedSprite = this.AheadOfSprites[5];
        Log.Debug('[showAheadOfCallAny] unSelectSprite:' + unSelectSprite.name);
        Log.Debug('[showAheadOfCallAny] selectedSprite:' + selectedSprite.name);
        Log.Debug('[showAheadOfCallAny] this.btnAheadOfCallAny.getComponent(cc.Sprite).spriteFrame:'
            + this.btnAheadOfCallAny.getComponent(cc.Sprite).spriteFrame.name);
        if (isShow) {
            this.chooseAheadOfCallAny = true;
            this.btnAheadOfCallAny.getComponent(cc.Sprite).spriteFrame = selectedSprite;
        } else {
            this.chooseAheadOfCallAny = false;
            this.btnAheadOfCallAny.getComponent(cc.Sprite).spriteFrame = unSelectSprite;
        }
    },

    //注意：关闭界面还得把图标重置回来
    _reSetAheadOfNode() {
        Log.Debug('[_reSetAheadOfNode]');
        this.btnAheadOfCheckOrFold.active = false;
        let unSelectSprite = this.AheadOfSprites[0];
        this.btnAheadOfCheckOrFold.getComponent(cc.Sprite).spriteFrame = unSelectSprite;
        this.btnAheadOfCall.active = false;
        let unSelectSprite2 = this.AheadOfSprites[2];
        this.btnAheadOfCall.getComponent(cc.Sprite).spriteFrame = unSelectSprite2;
        cc.dgame.utils.setOriginValue(this.aheadOfCallNum,0,"brown");
        this.btnAheadOfCallAny.active = false;
        let unSelectSprite3 = this.AheadOfSprites[4];
        this.btnAheadOfCallAny.getComponent(cc.Sprite).spriteFrame = unSelectSprite3;
    },

    onClickBtnCheck () {
        let player = this.playerMyself.getComponent('Player');
        player.showAction(Types.PlayerOP.CHECK);
        var bet_cmd = {
            ID: cc.dgame.tableInfo.SeatId,
            Bet: 0,
        };
        cc.dgame.net.gameCall(["Play_Bet", JSON.stringify(bet_cmd)], this._onBet.bind(this));
        cc.dgame.audioMgr.playCheckSound();
        this._restoreOperatePanel();
    },

    onClickBtnAllin () {
        let player = this.playerMyself.getComponent('Player');
        let bet = player.getBet();
        let stack = player.getStack();
        //Log.Debug('[onClickBtnAllin] stack: ' + stack + ', bet: ' + bet + ', allin: ' + this.allinStackNum.string);
        //player.setBet(bet + parseFloat(this.allinStackNum.string), true);
        //player.setStack(stack - parseFloat(this.allinStackNum.string));
        player.setBet(bet + stack, true);
        player.setStack(0);
        player.showAction(Types.PlayerOP.ALLIN);
        player.setAllinHead();
        var bet_cmd = {
            ID: cc.dgame.tableInfo.SeatId,
            //Bet: parseFloat(this.allinStackNum.string),
            Bet: stack,
        };
        cc.dgame.net.gameCall(["Play_Bet", JSON.stringify(bet_cmd)], this._onBet.bind(this));
        this._restoreOperatePanel();
        this.selfHoleCards[0].getChildren()[0].getComponent('Poker').playAllin();
        this.selfHoleCards[1].getChildren()[0].getComponent('Poker').playAllin();
    },

    onBtn2BBRaiseClicked () {
        let player = this.playerMyself.getComponent('Player');
        let bet = player.getBet();
        let stack = player.getStack();
        player.setBet(2 * 2 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet, true);
        player.setStack(stack + bet - 2 * 2 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet);
        var bet_cmd = {
            ID: cc.dgame.tableInfo.SeatId,
            Bet: 2 * 2 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet - bet,
        };
        cc.dgame.net.gameCall(["Play_Bet", JSON.stringify(bet_cmd)], this._onBet.bind(this));
        this._restoreOperatePanel();
    },

    onBtn3BBRaiseClicked () {
        let player = this.playerMyself.getComponent('Player');
        let bet = player.getBet();
        let stack = player.getStack();
        player.setBet(3 * 2 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet, true);
        player.setStack(stack + bet - 2 * 2 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet);
        var bet_cmd = {
            ID: cc.dgame.tableInfo.SeatId,
            Bet: 3 * 2 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet - bet,
        };
        cc.dgame.net.gameCall(["Play_Bet", JSON.stringify(bet_cmd)], this._onBet.bind(this));
        this._restoreOperatePanel();
    },

    onBtn5BBRaiseClicked () {
        let player = this.playerMyself.getComponent('Player');
        let bet = player.getBet();
        let stack = player.getStack();
        player.setBet(5 * 2 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet, true);
        player.setStack(stack + bet - 2 * 2 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet);
        var bet_cmd = {
            ID: cc.dgame.tableInfo.SeatId,
            Bet: 5 * 2 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet - bet,
        };
        cc.dgame.net.gameCall(["Play_Bet", JSON.stringify(bet_cmd)], this._onBet.bind(this));
        this._restoreOperatePanel();
    },

    onClickBtnHalfPotRaise () {
        let player = this.playerMyself.getComponent('Player');
        let bet = player.getBet();
        let stack = player.getStack();
        let halfPotRaiseNumVal = cc.dgame.utils.getOriginValue(this.halfPotRaiseNum);
        player.setBet(halfPotRaiseNumVal, true);
        player.setStack(stack + bet - halfPotRaiseNumVal);
        var bet_cmd = {
            ID: cc.dgame.tableInfo.SeatId,
            Bet: halfPotRaiseNumVal - bet,
        };
        cc.dgame.net.gameCall(["Play_Bet", JSON.stringify(bet_cmd)], this._onBet.bind(this));
        this._restoreOperatePanel();
    },

    onClickBtnTwoThirdPotRaise () {
        let player = this.playerMyself.getComponent('Player');
        let bet = player.getBet();
        let stack = player.getStack();
        let twoThirdPotRaiseNumVal = cc.dgame.utils.getOriginValue(this.twoThirdPotRaiseNum);
        player.setBet(twoThirdPotRaiseNumVal, true);
        player.setStack(stack + bet - twoThirdPotRaiseNumVal);
        var bet_cmd = {
            ID: cc.dgame.tableInfo.SeatId,
            Bet: twoThirdPotRaiseNumVal - bet,
        };
        cc.dgame.net.gameCall(["Play_Bet", JSON.stringify(bet_cmd)], this._onBet.bind(this));
        this._restoreOperatePanel();
    },

    onClickBtnPotRaise () {
        let player = this.playerMyself.getComponent('Player');
        let bet = player.getBet();
        let stack = player.getStack();
        let potRaiseNumVal = cc.dgame.utils.getOriginValue(this.potRaiseNum);
        player.setBet(potRaiseNumVal, true);
        player.setStack(stack + bet - potRaiseNumVal);
        var bet_cmd = {
            ID: cc.dgame.tableInfo.SeatId,
            Bet: potRaiseNumVal - bet,
        };
        cc.dgame.net.gameCall(["Play_Bet", JSON.stringify(bet_cmd)], this._onBet.bind(this));
        this._restoreOperatePanel();
    },

    //点击图标显示自由加注滑动条，进度置为0
    _onBtnFreeRaiseTouchStart (event) {
        this.freeRaiseSlider.node.active = true;
        this.freeRaiseSlider.progress = 0;
        let player = this.playerMyself.getComponent('Player');
        //this.freeRaiseStackNum.string = player.getStack();
    },

    //根据上下滑动的y轴坐标计算百分比，超过限制则只为最高或最低
    _onBtnFreeRaiseTouchMove (event) {
        let worldPoint = event.getLocation();
        let stack = this.playerMyself.getComponent('Player').getStack();
        if (this.raiseMinVal >= stack) {
            Log.Trace("[_onBtnFreeRaiseTouchMove] _onBtnFreeRaiseTouchMove not move this.raiseMinVal: " + this.raiseMinVal + ', stack' + stack);
            worldPoint.y = this._freeRaiseEndPos.y;
        }
        if (worldPoint.y >= this._freeRaiseEndPos.y) {
            cc.dgame.audioMgr.playSliderTop();
            this.freeRaiseSlider.progress = 1;
            cc.dgame.utils.setOriginValue(this.freeRaiseChipsNum,this.playerMyself.getComponent('Player').getStack(),"none");
        } else if (worldPoint.y <= this._freeRaiseStartPos.y) {
            this.freeRaiseSlider.progress = 0;
            cc.dgame.utils.setOriginValue(this.freeRaiseChipsNum,this.raiseMinVal,"none");
        } else {
            cc.dgame.audioMgr.playSlider();
            let progress = (worldPoint.y - this._freeRaiseStartPos.y) / (this._freeRaiseEndPos.y - this._freeRaiseStartPos.y);
            //let slots = Math.round((parseFloat(this.freeRaiseStackNum.string) - parseFloat(this.callNum.string)) / (cc.dgame.tableInfo.SmallBlind * 2));
            let slots = Math.round((this.playerMyself.getComponent('Player').getStack() - this.raiseMinVal) / (cc.dgame.tableInfo.SmallBlind * 2));
            if (slots <= 0) {
                Log.Error("[_onBtnFreeRaiseTouchMove] cal error slots: " + slots);
                return;
            }
            this.freeRaiseSlider.progress = parseInt(progress * slots) / slots;
            //Log.Trace(parseInt(this.callNum.string), parseInt(this.freeRaiseSlider.progress * parseFloat(this.freeRaiseStackNum.string)));
            //this.freeRaiseChipsNum.string = parseInt(this.callNum.string) + parseInt(this.freeRaiseSlider.progress * (parseFloat(this.freeRaiseStackNum.string) - parseInt(this.callNum.string)));
            let val = this.raiseMinVal + parseInt(this.freeRaiseSlider.progress * (this.playerMyself.getComponent('Player').getStack() - this.raiseMinVal));
            Log.Trace("[_onBtnFreeRaiseTouchMove] this.raiseMinVal: " + this.raiseMinVal + ", progress: " + progress + ", slots: " + slots + ", val: " + val);
            cc.dgame.utils.setOriginValue(this.freeRaiseChipsNum,val,"none");
        }
    },

    //触摸松开则结束并下注/加注，若progress为0则简单关闭滑动条，并不加注
    _onBtnFreeRaiseTouchEnd (event) {
        this.freeRaiseSlider.node.active = false;
        if (this.freeRaiseSlider.progress == 1) {
            this.onClickBtnAllin();
        } else if (this.freeRaiseSlider.progress > 0) {
            let player = this.playerMyself.getComponent('Player');
            let bet = player.getBet();
            let stack = player.getStack();
            let freeRaiseChipsNumVal = cc.dgame.utils.getOriginValue(this.freeRaiseChipsNum);
            Log.Debug('[_onBtnFreeRaiseTouchEnd] stack: ' + stack + ', bet: ' + bet + ', raiseMinVal: ' + this.raiseMinVal + ', prog: ' + this.freeRaiseSlider.progress + ', freeRaise: ' + freeRaiseChipsNumVal);
            player.setBet(bet+freeRaiseChipsNumVal, true);
            player.setStack(stack - freeRaiseChipsNumVal);
            var bet_cmd = {
                ID: cc.dgame.tableInfo.SeatId,
                Bet: freeRaiseChipsNumVal,
            };
            cc.dgame.net.gameCall(["Play_Bet", JSON.stringify(bet_cmd)], this._onBet.bind(this));
            this._restoreOperatePanel();
        }
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

    _restoreOperatePanel () {
        Log.Trace("[_restoreOperatePanel] start");
        this.btnCall.active = false;
        cc.dgame.utils.setOriginValue(this.callNum,0,"brown");
        this.btnFold.active = false;
        this.btnFreeRaise.active = false;
        this.btnFreeRaiseDisable.active = false;
        this.freeRaiseSlider.node.active = false;
        this.btnAllin.active = false;
        this.btnCheck.active = false;
        this._stopAutoFoldCountDown();
        this._stopAutoCheckCountDown();
        this._reSetAheadOfNode();
        Log.Trace("[_restoreOperatePanel] end");
        //let player = this.playerMyself.getComponent('Player');
        //player.hideFreeRaise();
    },

    _chipsToPot (turnInfo) {
        if (!turnInfo) {
            return 0;
        }
        Log.Trace("[_chipsToPot] turnInfo.Pots: " + JSON.stringify(turnInfo.Pots));
        //计算底池
        let turnPotNum = 0;
        let totalPotNum = 0;
        for (let seatId in turnInfo.PlayerInfo) {
            totalPotNum += turnInfo.PlayerInfo[seatId].TotalBet;
            turnPotNum += turnInfo.PlayerInfo[seatId].TurnBet;
        }
        cc.dgame.utils.setOriginValue(this.currentRoundPotNum,totalPotNum);

        if (turnInfo.Pots.length >= 1) {
            //没有边池，桌面筹码直接入底池
            if (turnInfo.Pots.length == 1) {
                cc.dgame.utils.setOriginValue(this.potNum,totalPotNum - turnPotNum,"yellow");
                this._replayPots = new Array();
                this._replayPots.push(cc.dgame.utils.getOriginValue(this.potNum));
            } else {
                this.roundTips.node.active = false;
                //边池从底池分出去
                let potPos = cc.find('Canvas/PotLayer').convertToWorldSpaceAR(cc.v2(0, 0));
                let srcv2 = this.sidePots[0].parent.convertToNodeSpaceAR(potPos);
                for (let i = 1; i < turnInfo.Pots.length; i++) {
                    if (this.sidePots[i - 1].active == false) {
                        let dstv2 = this.sidePots[i - 1].getPosition();
                        this.sidePots[i - 1].setPosition(srcv2);
                        this.sidePots[i - 1].active = true;
                        Log.Trace("[_chipsToPot] sidePotNums[" + (i-1) + "]: " + turnInfo.Pots[i]);
                        cc.dgame.utils.setOriginValue(this.sidePotNums[i - 1],turnInfo.Pots[i],"yellow");
                        this.sidePots[i - 1].runAction(
                            cc.moveTo(0.2, dstv2),
                        );
                    }
                }
                Log.Trace("[_chipsToPot] potNum: " + turnInfo.Pots[0]);
                cc.dgame.utils.setOriginValue(this.potNum,turnInfo.Pots[0],"yellow");
                this._replayPots = JSON.parse(JSON.stringify(turnInfo.Pots));
            }
        }

        //各玩家桌面上的筹码入底池动画
        let turnBets = 0;
        for (let i = 0; i < this._maxPlayers; i++) {
            let playerNode = this.playerAnchors[this._maxPlayerStr][i].getChildren()[0];
            let player = playerNode.getComponent('Player');
            turnBets += player.chipsToPot();
        }

        Log.Trace("[_chipsToPot] turnBets: " + turnBets);
        if (turnBets > 0) {
            cc.dgame.audioMgr.playChipsToPot();
        }
        this.actionIdentifier.active = false;
        return turnBets;
    },

    //重置公共牌
    _resetCommunityCards () {
        Log.Trace("[_resetCommunityCards] start");
        //公共牌牌面向下并隐藏
        for (let i = 0; i < this.dealCommunityCards.length; i++) {
            let poker = this.dealCommunityCards[i].getChildren()[0].getComponent('Poker');
            poker.setFaceUp(false);
            poker.enable();
            this.dealCommunityCards[i].active = false;
        }
        //多牌公共牌牌面向下并隐藏
        let dealRMTCommunityCards = new Array();
        dealRMTCommunityCards.push(this.dealRMTCommunityCards1);
        dealRMTCommunityCards.push(this.dealRMTCommunityCards2);
        dealRMTCommunityCards.push(this.dealRMTCommunityCards3);
        dealRMTCommunityCards.push(this.dealRMTCommunityCards4);
        for (let i = 0; i < dealRMTCommunityCards.length; i++) {
            for (let j = 0; j < dealRMTCommunityCards[i].length; j++) {
                let poker = dealRMTCommunityCards[i][j].getChildren()[0].getComponent('Poker');
                poker.setFaceUp(false);
                poker.enable();
                dealRMTCommunityCards[i][j].active = false;
            }
        }
        delete cc.dgame.tableInfo.RMTCards;
        //高亮公共牌牌面向下并隐藏
        for (let i = 0; i < this.highlightCommunityCards.length; i++) {
            let poker = this.highlightCommunityCards[i].getChildren()[0].getComponent('Poker');
            poker.setFaceUp(false);
            poker.enable();
            this.highlightCommunityCards[i].active = false;
        }
        Log.Trace("[_resetCommunityCards] end");
    },

    //重置玩家下注信息
    _resetPlayerBets () {
        Log.Trace("[_resetPlayerBets] start");
        for (let i = 0; i < this._maxPlayers; i++) {
            let playerNode = this.playerAnchors[this._maxPlayerStr][i].getChildren()[0];
            let player = playerNode.getComponent('Player');
            player.setBet(0);
            player.stopCountDown();
            player.hideAllActions();
            player.hideBet();
            player.hideAllinHead();
        }
        this._restoreOperatePanel();
        Log.Trace("[_resetPlayerBets] end");
    },

    //重置底池边池信息
    _resetPotsSidePots () {
        //边池重置
        Log.Trace("[_resetPotsSidePots] start");
        for (let i = 0; i < this.sidePots.length; i++) {
            this.sidePots[i].setPosition(PositionData.SidePotPositions[i].x, PositionData.SidePotPositions[i].y);
            cc.dgame.utils.setOriginValue(this.sidePotNums[i],0,"yellow");
            this.sidePots[i].active = false;
        }
        this.potLayer.active = false;
        this.currentPotLayer.active = false;
        Log.Trace("[_resetPotsSidePots] end");
    },

    //重置自身玩家底牌
    _resetSelfHoleCards () {
        Log.Trace("[_resetSelfHoleCards] start");
        this.selfHoleCards[0].active = false;
        this.selfHoleCards[1].active = false;
        this.selfHoleCards[0].getChildren()[0].getComponent('Poker').enable();
        this.selfHoleCards[1].getChildren()[0].getComponent('Poker').enable();
        this.selfHoleCards[0].getChildren()[0].getComponent('Poker').stopAllin();
        this.selfHoleCards[1].getChildren()[0].getComponent('Poker').stopAllin();
        Log.Trace("[_resetSelfHoleCards] end");
    },

    //重置牌桌提示
    _resetTips () {
        Log.Trace("[_resetTips] start");
        this.securityTipsBackground.parent.opacity = 255;
        this.securityTipsBackground.parent.stopAllActions();
        this.securityTipsBackground.parent.active = false;
        this.roundTips.node.active = false;
        this.actionIdentifier.active = false;
        this.actionIdentifier.angle = 0;
        cc.find('Canvas/TipsLayer').active = false;
        cc.find('Canvas/TableTipsLayer').active = false;
        this.RMTOperateLayer.active = false;
        this.RMTOperateWaitingLayer.active = false;
        this.RMTNegotiateLayer.active = false;
        this.RMTNegotiateWaitingLayer.active = false;
        this.INSOperateLayer.active = false
        this.INSOperateWaitingLayer.active = false;
        Log.Trace("[_resetTips] end");
    },

    _resetGameInfo () {
        Log.Trace("[_resetGameInfo] start");
        cc.dgame.tableInfo.StartAction = false;    //_handleBlindInfo置为true
        cc.dgame.tableInfo.TurnInfoList = new Array;    //用于计算上个玩家操作了什么Action
        cc.dgame.tableInfo.SecurityTipsList = new Array();
        this._dealCardPlayerPosArray = new Array;
        this._RMTTimes = 1;
        Log.Trace("[_resetGameInfo] end");
    },

    //重置牌桌信息
    _resetGameTable () {
        Log.Trace("[_resetGameTable] start");
        this.cardType.string = "";
        this._resetCommunityCards();
        this._resetPlayerBets();
        this._resetPotsSidePots();
        this._resetSelfHoleCards();
        this._resetTips();
        var seatinfo_cmd = {
            TableId: cc.dgame.tableInfo.TableId,
        };
        cc.dgame.net.gameCall(['seatInfoEx', JSON.stringify(seatinfo_cmd)], this._onSeatInfoEx.bind(this));
        Log.Trace("[_resetGameTable] end");
    },

    //发前三张Flop牌，底朝上从第一张Flop牌位置往右平移，第二张flop牌到位时翻转第一张flop牌，第三张flop牌到位时翻转第二张flop牌，最后翻转第三张flop牌
    _dealFlopCards (flop1Pt, flop2Pt, flop3Pt, animate) {
        if (animate) {
            let flopPtArr = new Array;
            flopPtArr.push(flop1Pt);
            flopPtArr.push(flop2Pt);
            flopPtArr.push(flop3Pt);
            let flopWolrdPt = new Array;    //三张flop牌最终目标位置
            for (let i = 0; i < 3; i++) {
                this.dealCommunityCards[i].setPosition(PositionData.CommunityCardPositions[i].x, PositionData.CommunityCardPositions[i].y);
                this.dealCommunityCards[i].active = true;
                flopWolrdPt.push(this.dealCommunityCards[i].convertToWorldSpaceAR(cc.v2(0, 0)));
                this.dealCommunityCards[i].setPosition(this.dealCommunityCards[0].getPosition());
                let poker = this.dealCommunityCards[i].getChildren()[0].getComponent('Poker');
                poker.setCardPoint(flopPtArr[i]);
            }
            Log.Debug('[_dealFlopCards] flopWolrdPoint: ' + JSON.stringify(flopWolrdPt) + ', flopCardPoint: ' + JSON.stringify(flopPtArr));
            this.scheduleOnce(function () {
                let poker = this.dealCommunityCards[0].getChildren()[0].getComponent('Poker');
                poker.flipCard(flopWolrdPt[0], 1);
            }, 0.2);    //第二张牌预计0.2秒后移动到位，第一张牌翻转
            let flop2MoveEnd = cc.callFunc(function () {
                let poker = this.dealCommunityCards[1].getChildren()[0].getComponent('Poker');
                poker.flipCard(flopWolrdPt[1], 1);
            }, this);
            this.dealCommunityCards[1].runAction(
                //第二张牌移动到位以后翻转
                cc.sequence(
                    cc.moveTo(0.2, PositionData.CommunityCardPositions[1].x, PositionData.CommunityCardPositions[1].y),
                    flop2MoveEnd,
                )
            );
            let flop3MoveEnd = cc.callFunc(function () {
                let poker = this.dealCommunityCards[2].getChildren()[0].getComponent('Poker');
                poker.flipCard(flopWolrdPt[2], 1);
            }, this);
            this.dealCommunityCards[2].runAction(
                //第三张牌移动到位以后翻转
                cc.sequence(
                    cc.moveTo(0.4, PositionData.CommunityCardPositions[2].x, PositionData.CommunityCardPositions[2].y),
                    flop3MoveEnd,
                )
            );
        } else {
            let flopPtArr = new Array;
            flopPtArr.push(flop1Pt);
            flopPtArr.push(flop2Pt);
            flopPtArr.push(flop3Pt);
            for (let i = 0; i < 3; i++) {
                this.dealCommunityCards[i].setPosition(PositionData.CommunityCardPositions[i].x, PositionData.CommunityCardPositions[i].y);
                this.dealCommunityCards[i].active = true;
                let poker = this.dealCommunityCards[i].getChildren()[0].getComponent('Poker');
                poker.setCardPoint(flopPtArr[i]);
                poker.setFaceUp(true);
            }
        }
    },

    //发转牌，底池发牌至转牌位置并翻转
    _dealTurnCard (turnPt, animate) {
        if (animate) {
            let potPos = cc.find('Canvas/PotLayer').convertToWorldSpaceAR(cc.v2(0, 0));
            this.dealCommunityCards[3].setPosition(PositionData.CommunityCardPositions[3].x, PositionData.CommunityCardPositions[3].y);
            let dstv2 = this.dealCommunityCards[3].convertToWorldSpaceAR(cc.v2(0, 0));
            Log.Debug('[_dealTurnCard] ' + dstv2 + ', point: ' + turnPt);
            let poker = this.dealCommunityCards[3].getChildren()[0].getComponent('Poker');
            this.dealCommunityCards[3].active = true;
            cc.dgame.audioMgr.playDealCard();
            poker.setCardPoint(turnPt);
            poker.dealCard(potPos, dstv2, 0, 0.2, 1);
            this.scheduleOnce(function () {
                poker.flipCard(dstv2, 1);
            }, 0.3);
        } else {
            this.dealCommunityCards[3].setPosition(PositionData.CommunityCardPositions[3].x, PositionData.CommunityCardPositions[3].y);
            this.dealCommunityCards[3].active = true;
            let poker = this.dealCommunityCards[3].getChildren()[0].getComponent('Poker');
            poker.setCardPoint(turnPt);
            poker.setFaceUp(true);
        }
    },

    //发河牌，底池发牌至河牌位置并翻转
    _dealRiverCard (riverPt, animate) {
        if (animate) {
            let potPos = cc.find('Canvas/PotLayer').convertToWorldSpaceAR(cc.v2(0, 0));
            this.dealCommunityCards[4].setPosition(PositionData.CommunityCardPositions[4].x, PositionData.CommunityCardPositions[4].y);
            let dstv2 = this.dealCommunityCards[4].convertToWorldSpaceAR(cc.v2(0, 0));
            Log.Debug('[_dealRiverCard] ' + dstv2 + ', point: ' + riverPt);
            let poker = this.dealCommunityCards[4].getChildren()[0].getComponent('Poker');
            this.dealCommunityCards[4].active = true;
            cc.dgame.audioMgr.playDealCard();
            poker.setCardPoint(riverPt);
            poker.dealCard(potPos, dstv2, 0, 0.2, 1);
            this.scheduleOnce(function () {
                poker.flipCard(dstv2, 1);
            }, 0.3);
        } else {
            this.dealCommunityCards[4].setPosition(PositionData.CommunityCardPositions[4].x, PositionData.CommunityCardPositions[4].y);
            this.dealCommunityCards[4].active = true;
            let poker = this.dealCommunityCards[4].getChildren()[0].getComponent('Poker');
            poker.setCardPoint(riverPt);
            poker.setFaceUp(true);
        }
    },

    //玩家赢了
    _selfPlayerWin (show) {
        let node = cc.find('Canvas/WinlightLayer/winlight');
        if (show) {
            node.runAction(
                cc.repeatForever(
                    cc.rotateBy(20, 360)
                )
            );
            this.winlightLayer.active = true;
        } else {
            node.stopAllActions();
            this.winlightLayer.active = false;
        }
    },

    _getSeatIdByPlayerAddr (addr) {
        for (let i = 0; i < this._maxPlayers; i++) {
            let playerNode = this.playerAnchors[this._maxPlayerStr][i].getChildren()[0];
            let player = playerNode.getComponent('Player');
            if (player.getPlayerAddr().toLowerCase() == addr.toLowerCase()) {
                return i;
            }
        }
        return -1;
    },

    _showTips (msg, bFadeout) {
        this.tips.string = msg;
        // 计算宽
        this.tips.overflow = cc.Label.Overflow.NONE;
        this.tips.node.setContentSize(new cc.Size(0, 42));
        this.tips._forceUpdateRenderData();
        let textWidth = Math.min(this.tips.node.width, 450);
        textWidth = Math.round(textWidth / 30) * 30;

        // 计算高
        this.tips.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        this.tips.node.setContentSize(new cc.Size(textWidth, 0));
        this.tips._forceUpdateRenderData();
        let textHeight = this.tips.node.height;

        this.tips.node.width = textWidth;
        this.tips.node.height = textHeight;
        this.tips.node.color = new cc.color(255, 255, 255, 255);

        this.tipsBackground.parent.active = true;
        this.tipsBackground.width = this.tips.node.width + 60;
        this.tipsBackground.height = this.tips.node.height + 15;

        let tipsLayer = cc.find('Canvas/TableTipsLayer');
        tipsLayer.opacity = 255;
        tipsLayer.active = true;
        if (bFadeout) {
            tipsLayer.stopAllActions();
            tipsLayer.runAction(
                cc.sequence(
                    cc.delayTime(1.5),
                    cc.fadeOut(1),
                ),
            );
        }
    },

    _showNotice (msg) {
        this.tips.string = msg;
        // 计算宽
        this.tips.overflow = cc.Label.Overflow.NONE;
        this.tips.node.setContentSize(new cc.Size(0, 42));
        this.tips._forceUpdateRenderData();
        let textWidth = Math.min(this.tips.node.width, 450);
        textWidth = Math.round(textWidth / 30) * 30;

        // 计算高
        this.tips.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        this.tips.node.setContentSize(new cc.Size(textWidth, 0));
        this.tips._forceUpdateRenderData();
        let textHeight = this.tips.node.height;

        this.tips.node.width = textWidth;
        this.tips.node.height = textHeight;
        this.tips.node.color = new cc.color(255, 224, 152, 255);

        this.tipsBackground.parent.active = true;
        this.tipsBackground.width = this.tips.node.width + 60;
        this.tipsBackground.height = this.tips.node.height + 15;

        let noticeLayer = cc.find('Canvas/TableTipsLayer');
        noticeLayer.opacity = 255;
        noticeLayer.active = true;
        noticeLayer.stopAllActions();
        noticeLayer.runAction(
            cc.sequence(
                cc.delayTime(1.5),
                cc.fadeOut(1),
            ),
        );
    },

    onClickManaged () {
        let managed = cc.find('Canvas/MenuLayer/LeftTopMemuLayer/BtnManaged/Managed');
        let unmanaged = cc.find('Canvas/MenuLayer/LeftTopMemuLayer/BtnManaged/Unmanaged');
        if (managed.active) {
            managed.active = false;
            unmanaged.active = true;
        } else {
            managed.active = true;
            unmanaged.active = false;
        }
    },

    _getAllMsgCount () {
        let result = '';
        let eventArr = new Array();
        for (let i = 0; i < cc.dgame.tableInfo.RawGameEventQueue.length; i++) {
            eventArr.push(cc.dgame.tableInfo.RawGameEventQueue[i].Event);
        }
        result += 'count: ' + cc.dgame.tableInfo.RawGameEventQueue.length + ', [' + eventArr.join(',') + ']\n';
        return result;
    },

    onBtnTableInfoOnClicked () {
        cc.find("Canvas/TableInfoDetailLayer").active = false;
        cc.find("Canvas/TableInfoLayer/layoutTableInfo/btnTableInfo/btn_tableinfo_on").active = cc.find("Canvas/TableInfoDetailLayer").active;
        cc.find("Canvas/TableInfoLayer/layoutTableInfo/btnTableInfo/btn_tableinfo_off").active = !cc.find("Canvas/TableInfoDetailLayer").active;
    },

    onBtnTableInfoOffClicked () {
        cc.find("Canvas/TableInfoDetailLayer").active = true;
        cc.find("Canvas/TableInfoLayer/layoutTableInfo/btnTableInfo/btn_tableinfo_on").active = cc.find("Canvas/TableInfoDetailLayer").active;
        cc.find("Canvas/TableInfoLayer/layoutTableInfo/btnTableInfo/btn_tableinfo_off").active = !cc.find("Canvas/TableInfoDetailLayer").active;
        let securityInfoList = cc.find("Canvas/TableInfoDetailLayer/scrollview").getComponent("SecurityInfoList");
        //securityInfoList.addTips(tipsInfo.Content);
        securityInfoList.populateList(cc.dgame.tableInfo.SecurityTipsList);
    },

    _handleShowRMTOption (data, elapsedSecs) {
        Log.Trace('[_handleShowRMTOption] ' + JSON.stringify(data) + ", SeatId: " + cc.dgame.tableInfo.SeatId);
        if (data.seatTurn == cc.dgame.tableInfo.SeatId) {
            if (data.happenedINS == true) {
                this.RMTOperateLayer.y = 288;
            } else {
                this.RMTOperateLayer.y = -320;
            }
            this.RMTOperateLayer.active = true;
            this._startRMTChooseCountDown(elapsedSecs);
        } else {
            let playerNode = this.playerAnchors[this._maxPlayerStr][data.seatTurn].getChildren()[0];
            let player = playerNode.getComponent('Player');
            let RMTPlayer = cc.find("Canvas/RMTOperateLayer/RMTOperateWaitingLayer/layout/initiator").getComponent(cc.Label);
            RMTPlayer.string = player.getPlayerAddr().substr(2, 8);
            this.RMTOperateWaitingLayer.active = true;
        }
    },

    _handleRMTTimesChoose (data, elapsedSecs) {
        Log.Trace('[_handleRMTTimesChoose] ' + JSON.stringify(data) + ", SeatId: " + cc.dgame.tableInfo.SeatId);
        this._RMTTimes = data.Times;
        if (this._isPlaying()) {
            if (data.Times > 1) {
                if (data.seatTurn == cc.dgame.tableInfo.SeatId) {
                    this.RMTOperateWaitingLayer.active = false;
                    this.RMTNegotiateWaitingLayer.active = true;
                } else {
                    this.RMTOperateWaitingLayer.active = false;
                    this.INSOperateWaitingLayer.active = false;//多牌选了多次其他人等待保险界面会关掉，选了一次其他人等待保险界面不用关
                    let playerNode = this.playerAnchors[this._maxPlayerStr][data.seatTurn].getChildren()[0];
                    let player = playerNode.getComponent('Player');
                    let RMTPlayer = cc.find("Canvas/RMTOperateLayer/RMTNegotiateLayer/layout/initiator").getComponent(cc.Label);
                    RMTPlayer.string = player.getPlayerAddr().substr(2, 8);
                    let RMTTimes = cc.find("Canvas/RMTOperateLayer/RMTNegotiateLayer/layout/RMTTimes").getComponent(cc.Label);
                    RMTTimes.string = data.Times;
                    this.RMTNegotiateLayer.active = true;
                    this._startNegotiateYesCountDown(elapsedSecs);
                }
            }
        } else {
            this.RMTOperateWaitingLayer.active = false;
            this.RMTNegotiateWaitingLayer.active = true;
        }
    },

    _handleRMTTimesResp (data) {
        Log.Trace('[_handleRMTTimesResp] ' + JSON.stringify(data));
    },

    _handleRMTTimesResult (data) {
        Log.Trace('[_handleRMTTimesResult] ' + JSON.stringify(data) + ", this._RMTTimes: " + this._RMTTimes);
        this.RMTOperateLayer.active = false;
        this.RMTOperateWaitingLayer.active = false;
        this.RMTNegotiateLayer.active = false;
        this.RMTNegotiateWaitingLayer.active = false;
        if (this._RMTTimes > 1) {
            if (data.Times == 1) {
                this._showTips("Some players disagree with runing it " + this._RMTTimes + " times", true);
            } else {
                this._showTips("All players agree with running it " + data.Times + " times", true);
            }
        }
    },

    //显示保险界面
    _handleShowINS (data, elapsedSecs) {
        Log.Trace('[_handleShowINS] ' + JSON.stringify(data));
        if (data.seatTurn == cc.dgame.tableInfo.SeatId) {
            let totalSecureBuy = 0;
            let totalFullPotBuy = 0;
            let potsSum = 0;
            if (data.Pots.MainPot != undefined) {
                potsSum += 1;
                totalSecureBuy += data.Pots.MainPot.SecureBuy;
                totalFullPotBuy += data.Pots.MainPot.FullPotBuy;
            }
            if (data.Pots.SidePot != undefined) {
                potsSum += 1;
                totalSecureBuy += data.Pots.SidePot.SecureBuy;
                totalFullPotBuy += data.Pots.SidePot.FullPotBuy;
            }
            let pots = this.INSOperateLayer.getChildByName("pots");
            let newAmounts = this._getNewBuyAmount(data,pots,potsSum);
            pots.removeAllChildren();
            if (data.Pots.MainPot != undefined) {
                let mainPotNode = cc.instantiate(this.INSPotPrefab);
                if (data.Pots.SidePot != undefined) {
                    let sidePotNode = cc.instantiate(this.INSPotPrefab);
                    mainPotNode.setPosition(-140, 180);
                    sidePotNode.setPosition(140, 180);
                    let mainPot = mainPotNode.getComponent('INSPot');
                    mainPot.init(0,data.Pots.MainPot,newAmounts.newMainAmount);
                    this._initINSDetails(this.INSMainPotDetails,mainPot);
                    let sidePot = sidePotNode.getComponent('INSPot');
                    sidePot.init(1,data.Pots.SidePot,newAmounts.newSideAmount);
                    this._initINSDetails(this.INSSidePotDetails,sidePot);
                    pots.addChild(mainPotNode);
                    pots.addChild(sidePotNode);
                } else {
                    mainPotNode.setPosition(0, 180);
                    let mainPot = mainPotNode.getComponent('INSPot');
                    mainPot.init(0,data.Pots.MainPot,newAmounts.newMainAmount);
                    this._initINSDetails(this.INSMainPotDetails,mainPot);
                    pots.addChild(mainPotNode);
                }
            }
            else if (data.Pots.SidePot != undefined) {
                let sidePotNode = cc.instantiate(this.INSPotPrefab);
                sidePotNode.setPosition(0,180);
                let sidePot = sidePotNode.getComponent('INSPot');
                sidePot.init(1,data.Pots.SidePot,newAmounts.newSideAmount);
                this._initINSDetails(this.INSSidePotDetails,sidePot);
                pots.addChild(sidePotNode);
            }
            this._initBuyLayer(data,newAmounts.newMainAmount,newAmounts.newSideAmount,totalSecureBuy,totalFullPotBuy,potsSum, elapsedSecs);
            this.INSOperateLayer.active = true;
        } else {
            let playerNode = this.playerAnchors[this._maxPlayerStr][data.seatTurn].getChildren()[0];
            let player = playerNode.getComponent('Player');
            let INSPlayer = cc.find("layout/initiator",this.INSOperateWaitingLayer).getComponent(cc.Label);
            INSPlayer.string = player.getPlayerAddr().substr(2, 8);
            this.INSOperateWaitingLayer.active = true;
        }
    },

    _resetINS() {
        Log.Trace('[_resetINS] ');
        let pots = this.INSOperateLayer.getChildByName("pots");
        pots.removeAllChildren();
    },

    _stopWaitingINS(bBuyed) {
        Log.Trace('[_stopWaitingINS] bBuyed:' + bBuyed);
        this.INSOperateWaitingLayer.active = false;
        if (bBuyed == true) { //保险买了其他人等待多牌的界面会关掉,没买不用关
            this.RMTOperateWaitingLayer.active = false;
        }
    },

    //开始自动保险倒计时
    _startINSChooseCountDown (potsSum, buttonNode, buyMinAmount, elapsedSecs) {
        Log.Trace('[_startINSChooseCountDown] potsSum: ' + potsSum + " ,buyMinAmount:" + buyMinAmount);
        if (potsSum == 2) {
            this._INSoperateCountDown = 45;
        } else {
            this._INSoperateCountDown = 30;
        }
        this._INScountDownTotal = (this._INSoperateCountDown - elapsedSecs) * 10;
        let maskNode = cc.find('blackMask',buttonNode);
        maskNode.active = true;
        this._INSCDMask = maskNode;
        this._INSCDAmount = buyMinAmount;
        this.schedule(this._INSChooseCountDownProc, 0.1);
    },

    //自动保险倒计时处理函数
    _INSChooseCountDownProc () {
        this._INScountDownTotal -= 1;
        if (this._INScountDownTotal <= 0) {
            if (this._INSCDAmount > 0) {
                this.onBtnBuyINS(null,"custom_buy")
            } else {
                this.onBtnINSPass();
            }
            return;
        }
        let progressBar = this._INSCDMask.getComponent(cc.ProgressBar);
        progressBar.progress = this._INScountDownTotal * 0.1 / this._INSoperateCountDown;
    },

    //停止自动保险倒计时
    _stopINSChooseCountDown () {
        Log.Trace('[_stopINSChooseCountDown]');
        this.unschedule(this._INSChooseCountDownProc);
        cc.find('pass/blackMask',this.INSToggleContainer).active = false;
        cc.find('buy_ins/blackMask',this.INSToggleContainer).active = false;
    },

    _initINSDetails (INSOperateDetails,choosePot) {
        let potInfo = choosePot.potInfo;
        let outsCardsLayer = cc.find("detail_layer/outs/outs_layout", INSOperateDetails);
        let assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");
        for (let i = 0; i < outsCardsLayer.childrenCount; i++) {
            outsCardsLayer.children[i].active = false;
        }
        for (let i = 0; i < potInfo.Outs.length && i < outsCardsLayer.children.length; i++) {
            let carNode = outsCardsLayer.children[i];
            Log.Trace("[_initINSDetails] potInfo.Outs[i] " + potInfo.Outs[i])
            carNode.getComponent(cc.Sprite).spriteFrame = assetMgr.cards0[potInfo.Outs[i]];
            carNode.active = true;
        }
        let communityCardsLayer = cc.find("detail_layer/outs/community_cards_layout", INSOperateDetails);
        for (let i = 0; i < communityCardsLayer.childrenCount; i++) {
            communityCardsLayer.children[i].active = false;
        }
        for (let i = 0; i < potInfo.PublicCards.length; i++) {
            let carNode = communityCardsLayer.children[i];
            Log.Trace("[_initINSDetails] potInfo.PublicCards[i] " + potInfo.PublicCards[i]);
            carNode.getComponent(cc.Sprite).spriteFrame = assetMgr.cards0[potInfo.PublicCards[i]];
            carNode.active = true;
        }
        cc.find("top/pot_sprite/label", INSOperateDetails).getComponent(cc.Label).string = choosePot.potName.string;
        cc.find("top/label", INSOperateDetails).getComponent(cc.Label).string = potInfo.PotNum;
        cc.find("detail_layer/insure/odds_value", INSOperateDetails).getComponent(cc.Label).string = potInfo.OddsValue;
        cc.find("detail_layer/outs/outs_value", INSOperateDetails).getComponent(cc.Label).string = potInfo.OutsLen;
        cc.find("detail_layer/insure/insure_value", INSOperateDetails).getComponent(cc.Label).string = potInfo.Amount;
        cc.find("detail_layer/insure/claim_value", INSOperateDetails).getComponent(cc.Label).string = Math.floor(potInfo.OddsValue*potInfo.Amount);
        this._initINSRaiseSlider(INSOperateDetails,choosePot,potInfo.Amount);
    },

    _initINSRaiseSlider(INSOperateDetails,choosePot,buyMinAmount) {
        let slider = cc.find('detail_layer/slider', INSOperateDetails).getComponent(cc.Slider);
        slider.node.targetOff(this);
        slider.progress = 0;
        Log.Trace('[_initINSRaiseSlider] buyMinAmount:' + buyMinAmount);
        slider.node.on('slide', function(event) {
            Log.Trace('[_initINSRaiseSlider] on slide slider.progress ' + slider.progress);
            let totalLength = choosePot.potInfo.FullPotBuy - buyMinAmount;
            Log.Trace('[_initINSRaiseSlider] totalLength ' + totalLength);
            let amount = Math.floor(totalLength * slider.progress) + buyMinAmount;
            Log.Trace('[_initINSRaiseSlider] amount ' + amount);
            cc.find("detail_layer/insure/insure_value", INSOperateDetails).getComponent(cc.Label).string = amount.toString();
            cc.find("detail_layer/insure/claim_value", INSOperateDetails).getComponent(cc.Label).string = Math.floor(choosePot.potInfo.OddsValue*amount);
            if (amount > 0) {
                choosePot.Selected(INSOperateDetails,amount);
            } else {
                choosePot.UnSelected(INSOperateDetails);
            }
            this._changeBuyLayer(choosePot.potInfo);
        }, this);
    },

    _getNewBuyAmount(data, pots, potsSum) {
        let newMainAmount = 0;
        let newSideAmount = 0;
        if ( data.Order == 5) {
            if (pots.childrenCount > 0) {
                let oldMainAmount = 0;
                let oldSideAmount = 0;
                for (let i= 0; i < pots.childrenCount; i++) {
                    let pot = pots.children[i].getComponent('INSPot');
                    Log.Trace('[__getOldBuyAmount] pot.potInfo.Amount:' + pot.potInfo.Amount);
                    if (pot.potInfo.Amount > 0 ) {
                        if (pot.potInfo.Index == 0) {
                            oldMainAmount = pot.potInfo.Amount;
                            Log.Trace('[__getOldBuyAmount] oldMainAmount:' + oldMainAmount);
                        } else {
                            oldSideAmount = pot.potInfo.Amount;
                            Log.Trace('[__getOldBuyAmount] oldSideAmount:' + oldSideAmount);
                        }
                    }
                }
                if (potsSum == 1) { //只有主池或边池
                    if (data.Pots.MainPot != undefined) {
                        newMainAmount = Math.ceil((oldMainAmount + oldSideAmount) / data.Pots.MainPot.OddsValue);
                    } else {
                        newSideAmount = Math.ceil( (oldMainAmount + oldSideAmount) / data.Pots.SidePot.OddsValue);
                    }
                } else {
                    newMainAmount = Math.ceil(oldMainAmount/data.Pots.MainPot.OddsValue);
                    newSideAmount = Math.ceil(oldSideAmount/data.Pots.SidePot.OddsValue);
                }
            }
        }
        let newAmounts = {
            newMainAmount:newMainAmount,
            newSideAmount:newSideAmount,
        }
        return newAmounts;
    },

    _initBuyLayer(data, newMainAmount, newSideAmount, totalSecureBuy, totalFullPotBuy, potsSum, elapsedSecs) {
        let totalBuyAmount = newMainAmount + newSideAmount;
        if (totalSecureBuy < totalBuyAmount) {
            totalSecureBuy = totalBuyAmount
        }
        cc.find("secure/value", this.INSToggleContainer).getComponent(cc.Label).string = totalSecureBuy;
        cc.find("full_pot/value", this.INSToggleContainer).getComponent(cc.Label).string = totalFullPotBuy;
        let buyNode = cc.find("buy_ins", this.INSToggleContainer);
        let valueLabel = cc.find("buy_ins/value", this.INSToggleContainer).getComponent(cc.Label);
        let selectNode = cc.find("select_pots", this.INSToggleContainer);
        let passNode = cc.find('pass', this.INSToggleContainer);
        if ( totalBuyAmount > 0 ) {
            selectNode.active = false;
            valueLabel.string = totalBuyAmount.toString();
            buyNode.active = true;
            passNode.active = false;
            this._startINSChooseCountDown(potsSum, buyNode, totalBuyAmount, elapsedSecs);
        } else {
            buyNode.active = false;
            valueLabel.string = "0";
            selectNode.active = true;
            passNode.active = true;
            this._startINSChooseCountDown(potsSum, passNode, 0, elapsedSecs);
        }
        this.INSToggleContainer.y = -486;
        this.INSToggleContainer.active = true;
    },

    _changeBuyLayer(potInfo) {
        Log.Trace('[_changeBuyLayer] potInfo ' + JSON.stringify(potInfo));
        let pots = this.INSOperateLayer.getChildByName("pots");
        let oterPot;
        if (pots.childrenCount >= 2) {
            if (potInfo.Index == 0) {
                oterPot = pots.children[1].getComponent('INSPot');
            } else {
                oterPot = pots.children[0].getComponent('INSPot');
            }
            Log.Trace('[_changeBuyLayer] oterPot.potInfo ' + JSON.stringify(oterPot.potInfo));
        }
        let buyNode = cc.find("buy_ins", this.INSToggleContainer);
        let valueLabel = cc.find("buy_ins/value", this.INSToggleContainer).getComponent(cc.Label);
        let selectNode = cc.find("select_pots", this.INSToggleContainer);
        if (oterPot != null) {
            if (potInfo.Amount == 0 && oterPot.potInfo.Amount == 0) {
                buyNode.active = false;
                valueLabel.string = "0";
                selectNode.active = true;
            } else {
                buyNode.active = true;
                let newValue = potInfo.Amount + oterPot.potInfo.Amount;
                valueLabel.string = newValue.toString();
                selectNode.active = false;
            }
        } else {
            if (potInfo.Amount == 0) {
                buyNode.active = false;
                valueLabel.string = "0";
                selectNode.active = true;
            } else {
                buyNode.active = true;
                let newValue = potInfo.Amount;
                valueLabel.string = newValue.toString();
                selectNode.active = false;
            }
        }
    },

    onBtnINSPotChoose (potInfo) {
        Log.Trace('[onBtnINSPotChoose] potInfo.Index ' + potInfo.Index);
        this.INSOperateLayer.active = false;
        if (potInfo.Index == 0) {
            this.INSOperateDetails = this.INSMainPotDetails;
        } else {
            this.INSOperateDetails = this.INSSidePotDetails;
        }
        this.INSOperateDetails.active = true;
        this.INSToggleContainer.y = -640;
    },

    onBtnINSDetailsClose () {
        Log.Trace('[onBtnINSDetailsClose] ');
        this.INSOperateDetails.active = false;
        this.INSOperateLayer.active = true;
        this.INSToggleContainer.y = -486;
    },

    onBtnINSPass (event) {
        Log.Trace('[onBtnBuyINS] event:' + event);
        this._stopINSChooseCountDown();
        cc.dgame.net.gameCall(["Play_INSCancelBuy", ""], this._onINSCancelBuy.bind(this));
    },

    _onINSCancelBuy() {
        Log.Trace("[_onINSCancelBuy] ");
        if (this.INSOperateDetails != null) {
            this.INSOperateDetails.active = false;
        }
        this.INSOperateLayer.active = false;
        this.INSToggleContainer.active = false;
    },

    onBtnBuyINS(event, customEventData) {
        Log.Trace('[onBtnBuyINS] event:' + event + ", customEventData:" + customEventData);
        this._onRMTClose(); //先关闭多牌界面
        this._stopINSChooseCountDown(); //停止保险pass倒计时
        let mainAmount = 0;
        let sideAmount = 0;
        let pots = this.INSOperateLayer.getChildByName("pots");
        for (let i= 0; i < pots.childrenCount; i++) {
            let pot = pots.children[i].getComponent('INSPot');
            if (customEventData == "custom_buy") {

            } else if (customEventData == "secure") {
                pot.potInfo.Amount = pot.potInfo.SecureBuy;
            } else {
                pot.potInfo.Amount = pot.potInfo.FullPotBuy;
            }
            if (pot.potInfo.Index == 0) {
                mainAmount = pot.potInfo.Amount;
            } else {
                sideAmount = pot.potInfo.Amount;
            }
        }
        let ins_cmd = {
            Amount: [mainAmount,sideAmount],
        };
        cc.dgame.net.gameCall(["Play_INSBuy", JSON.stringify(ins_cmd)], this._onINSBuy.bind(this));
    },

    _onINSBuy (data) {
        Log.Trace("[_onINSBuy] " + JSON.stringify(data));
        this.INSOperateLayer.active = false;
        if (this.INSOperateDetails != null) {
            this.INSOperateDetails.active = false;
        }
        this.INSToggleContainer.active = false;
    },

    _showPlayerINSFlag (data) {
        Log.Trace('[_ShowPlayerINSFlag] ' + JSON.stringify(data));
        let totalAmount = 0;
        for (let i = 0; i < data.amount.length; i++) {
            totalAmount += data.amount[i]
        }
        let bBuyed = false;
        if (totalAmount > 0) {
            bBuyed = true;
        }
        this._stopWaitingINS(bBuyed);
        let playerNode = this.playerAnchors[this._maxPlayerStr][data.seatTurn].getChildren()[0];
        let player = playerNode.getComponent('Player');
        player.showINSFlag(totalAmount, false);
        this.scheduleOnce(function () {
            player.hideINSFlag();
        }, 3);
    },

    _handleINSWinInfo (data) {
        Log.Trace('[_handleINSWinInfo] ' + JSON.stringify(data));
        this._stopWaitingINS();
        if (data.Order == 5) {
            this.scheduleOnce(this._playINSEffect.bind(this,data),1);
        } else {
            this._playINSEffect(data);
        }
    },

    _playINSEffect(data) {
        Log.Trace('[_playINSEffect] ' + JSON.stringify(data));
        let playerNode = this.playerAnchors[this._maxPlayerStr][data.BuyerSeat].getChildren()[0];
        let player = playerNode.getComponent('Player');
        let mainWin = data.InsWin[0];
        if (mainWin > 0) {
            player.insurancePayToPlayer(cc.v2(cc.winSize.width/2,cc.winSize.height-100), 0.6);
        } else if (mainWin < 0) {
            player.playerPayToInsurance(cc.v2(cc.winSize.width/2,cc.winSize.height-100), 0.6);
        }
        let sideWin = data.InsWin[1];
        if ( sideWin != 0) {
            this.scheduleOnce( function () {
                if (sideWin > 0) {
                    player.insurancePayToPlayer(cc.v2(cc.winSize.width/2,cc.winSize.height-100), 0.6);
                } else if (sideWin < 0) {
                    player.playerPayToInsurance(cc.v2(cc.winSize.width/2,cc.winSize.height-100), 0.6);
                }
            },1);
        }
    },

    _onRMTChoose (data) {
        Log.Trace("[_onRMTChoose] " + JSON.stringify(data));
        this.RMTOperateLayer.active = false;
        this.RMTNegotiateWaitingLayer.active = true;
        this._stopRMTChooseCountDown();
    },

    _onRMTClose () {
        Log.Trace("[_onRMTClose] ");
        if (this.RMTOperateLayer.active == false) {
            return;
        }
        this.RMTOperateLayer.active = false;
        this.RMTNegotiateWaitingLayer.active = false;
        this._stopRMTChooseCountDown();
    },

    onBtnRMTOnceClicked () {
        let rmtchoose_cmd = {
            Times: 1,
        }
        this._RMTTimes = 1;
        cc.dgame.net.gameCall(["Play_RMTTimes", JSON.stringify(rmtchoose_cmd)], this._onRMTChoose.bind(this));
    },

    onBtnRMTTwiceClicked () {
        this._onINSCancelBuy(); //先关闭保险界面
        let rmtchoose_cmd = {
            Times: 2,
        }
        this._RMTTimes = 2;
        cc.dgame.net.gameCall(["Play_RMTTimes", JSON.stringify(rmtchoose_cmd)], this._onRMTChoose.bind(this));
    },

    onBtnRMT3TimesClicked () {
        this._onINSCancelBuy(); //先关闭保险界面
        let rmtchoose_cmd = {
            Times: 3,
        }
        this._RMTTimes = 3;
        cc.dgame.net.gameCall(["Play_RMTTimes", JSON.stringify(rmtchoose_cmd)], this._onRMTChoose.bind(this));
    },

    onBtnRMT4TimesClicked () {
        this._onINSCancelBuy(); //先关闭保险界面
        let rmtchoose_cmd = {
            Times: 4,
        }
        this._RMTTimes = 4;
        cc.dgame.net.gameCall(["Play_RMTTimes", JSON.stringify(rmtchoose_cmd)], this._onRMTChoose.bind(this));
    },

    //自动一次多牌倒计时处理函数
    _RMTChooseCountDownProc () {
        this._countDownTotal -= 1;
        if (this._countDownTotal <= 0) {
            this._stopRMTChooseCountDown();
            this.onBtnRMTOnceClicked();
            return;
        }

        let progressBar = cc.find('Canvas/RMTOperateLayer/RMTOperateLayer/Once/Background/blackMask').getComponent(cc.ProgressBar);
        progressBar.progress = this._countDownTotal * 0.1 / this._operateCountDown;
    },

    //开始自动一次多牌倒计时
    _startRMTChooseCountDown (elapsedSecs) {
        this._operateCountDown = 30;
        this._countDownTotal = (this._operateCountDown - elapsedSecs) * 10;
        let layerNode = cc.find('Canvas/RMTOperateLayer/RMTOperateLayer/Once/Background/blackMask');
        layerNode.active = true;
        this.schedule(this._RMTChooseCountDownProc, 0.1);
    },

    //停止自动一次多牌倒计时
    _stopRMTChooseCountDown () {
        this.unschedule(this._RMTChooseCountDownProc);
        let layerNode = cc.find('Canvas/RMTOperateLayer/RMTOperateLayer/Once/Background/blackMask');
        layerNode.active = false;
    },

    _onDeclareRMT (data) {
        Log.Trace("[_onDeclareRMT] " + JSON.stringify(data));
        this.RMTNegotiateLayer.active = false;
    },

    onBtnNegotiateYesClicked () {
        let declarermt_cmd = {
            Agree: true,
        }
        cc.dgame.net.gameCall(["Play_DeclareRMT", JSON.stringify(declarermt_cmd)], this._onDeclareRMT.bind(this));
        this._stopNegotiateYesCountDown();
        this.RMTNegotiateWaitingLayer.active = true;
    },

    onBtnNegotiateNoClicked () {
        let declarermt_cmd = {
            Agree: false,
        }
        cc.dgame.net.gameCall(["Play_DeclareRMT", JSON.stringify(declarermt_cmd)], this._onDeclareRMT.bind(this));
        this._stopNegotiateYesCountDown();
    },

    //自动同意倒计时处理函数
    _RMTNegotiateYesCountDownProc () {
        this._countDownTotal -= 1;
        if (this._countDownTotal <= 0) {
            this._stopNegotiateYesCountDown();
            this.onBtnNegotiateYesClicked();
            return;
        }

        let progressBar = cc.find('Canvas/RMTOperateLayer/RMTNegotiateLayer/Yes/Background/blackMask').getComponent(cc.ProgressBar);
        progressBar.progress = this._countDownTotal * 0.1 / this._operateCountDown;
    },

    //开始自动同意倒计时
    _startNegotiateYesCountDown (elapsedSecs) {
        this._operateCountDown = 15;
        this._countDownTotal = (this._operateCountDown - elapsedSecs) * 10;
        let layerNode = cc.find('Canvas/RMTOperateLayer/RMTNegotiateLayer/Yes/Background/blackMask');
        layerNode.active = true;
        this.schedule(this._RMTNegotiateYesCountDownProc, 0.1);
    },

    //停止自动同意倒计时
    _stopNegotiateYesCountDown () {
        this.unschedule(this._RMTNegotiateYesCountDownProc);
        let layerNode = cc.find('Canvas/RMTOperateLayer/RMTNegotiateLayer/Yes/Background/blackMask');
        layerNode.active = false;
    },

    onBtnRestart () {
        if (cc.sys.isNative) {
            if (cc.sys.isMobile) {
                if (cc.sys.os === cc.sys.OS_IOS) {
                    jsb.reflection.callStaticMethod("NativeGengine", "stopGameEngine")
                    cc.audioEngine.stopAll()
                    cc.game.restart()
                } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                    jsb.reflection.callStaticMethod("io/kaleidochain/NativeGengine", "stopGameEngine", "()Z")
                    cc.audioEngine.stopAll()
                    cc.game.restart()
                }
            } else {
                if (cc.sys.os === cc.sys.OS_WINDOWS||cc.sys.os === cc.sys.OS_OSX) {
                    StopNode();
                    cc.audioEngine.stopAll();
                    cc.game.restart();
                }
            }
        }
    },

    onBtnCloseDismissTableLayerClicked () {
        Log.Debug("[onBtnCloseDismissTableLayerClicked]");
        cc.find("Canvas/DismissTableLayer").active = false;
        delete cc.dgame.tableInfo.SittingSeatId;
        delete cc.dgame.tableInfo.SeatId;
        cc.dgame.tableInfo.SelfReady = false;
        cc.dgame.tableInfo.ContractStatus = Types.ContractStatus.NOTJOIN;
        this.dealerMark.active = false;
        cc.dgame.mainMenuPopup.updateStatus();
        this._resetGameInfo();
        this._resetGameTable();
        var seatinfo_cmd = {
            TableId: cc.dgame.tableInfo.TableId,
        };
        cc.dgame.net.gameCall(['seatInfoEx', JSON.stringify(seatinfo_cmd)], this._onSeatInfoEx.bind(this));
    },

    onBtnResitDownClicked () {
        cc.dgame.net.gameCall(["ready", ""], this._onSelfReady.bind(this));
    },

    _onSelfPlayingStatus (data) {
        Log.Trace("[_onSelfPlayingStatus] " + JSON.stringify(data));
        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }

        cc.dgame.tableInfo.ContractStatus = data.Status;
        if (data.Status == Types.ContractStatus.SEATED || data.Status == Types.ContractStatus.STANDBYNEXT || data.Status == Types.ContractStatus.OFFLINE || data.Status == Types.ContractStatus.SHOWDOWNOFFLINE) {
            cc.dgame.tableInfo.SelfReady = false;
            if (!!this.playerMyself) {
                let player = this.playerMyself.getComponent('Player');
                player.showAction(Types.PlayerOP.STANDBY);
                player.showBtnResitDown();
            }
        }
        cc.dgame.mainMenuPopup.updateStatus();
    },

    _updateMenuStatus () {
        cc.dgame.net.gameCall(["selfPlayingStatus", ""], this._onSelfPlayingStatus.bind(this));
    },
});
