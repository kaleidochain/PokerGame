var Types = require('Types');
var PositionData = require('PositionData');
var Log = require('Log');

cc.Class({
    extends: cc.Component,

    properties: {
        //预制资源
        playerPrefab: cc.Prefab,        //玩家预制资源
        pokerPrefab: cc.Prefab,         //牌预制资源
        //底池区域
        potLayer: cc.Node,              //底池图层
        potNum: cc.RichText,            //本局底池筹码数
        currentPotLayer: cc.Node,       //本轮底池图层
        currentRoundPotNum: cc.RichText,//本轮下注筹码与底池的总和，即总底池数
        dealerMark: cc.Node,            //庄家标识，BlindInfo盲注信息中有
        //9人桌
        tableFor9Layer: cc.Node,        //9人桌图层
        playerAnchorsFor9: [cc.Node],   //9人桌各玩家位置
        //盲注信息区域
        roundTips: cc.RichText,
        //公共牌区域
        dealPublicCards: [cc.Node],     //能发牌、移动翻转的公共牌
        //自身玩家操作区域
        selfHoleCards: [cc.Node],       //摊牌阶段两张底牌最终位置效果，Allin或到摊牌阶段会翻转显示，即holeCard_1、holeCard_2
        cardType: cc.Label,             //牌型，无论是否弃牌均显示
        //触摸快进层
        touchLayer: cc.Node,            //点击后跳过引导等待时间，Button层出现后消失
        buttonLayer: cc.Node,           //引导结束层
        //Preflop轮提示
        preflopTutorial: cc.Node,       //preflop轮提示层
        preflopBigBlindFocus: cc.Node,  //preflop轮大盲提示层
        preflopBigBlindUntips: cc.Node, //preflop轮大盲未提示
        preflopBigBlindTextTips: cc.Node,//preflop轮大盲文字提示
        preflopBigBlindFocusMask: cc.Node,//preflop轮大盲提示蒙层
        preflopBigBlindFocusShadow: cc.Node,//preflop轮大盲提示阴影
        preflopSmallBlindFocus: cc.Node,  //preflop轮小盲提示层
        preflopSmallBlindUntips: cc.Node, //preflop轮小盲未提示
        preflopSmallBlindTextTips: cc.Node,//preflop轮小盲文字提示
        preflopSmallBlindFocusMask: cc.Node,//preflop轮小盲提示蒙层
        preflopSmallBlindFocusShadow: cc.Node,//preflop轮小盲提示阴影
        preflopDealerFocus: cc.Node,    //preflop轮小盲提示层
        preflopDealerUntips: cc.Node,   //preflop轮小盲未提示
        preflopDealerTextTips: cc.Node, //preflop轮小盲文字提示
        preflopDealerFocusMask: cc.Node,//preflop轮小盲提示蒙层
        preflopDealerFocusShadow: cc.Node,//preflop轮小盲提示阴影
        //Pop提示
        potTutorial: cc.Node,           //底池提示
        potTextTips: cc.Node,           //底池文字提示，Y坐标=底牌Y坐标+75
        potFocusMask: cc.Node,          //底池提示蒙层，Y坐标=底池Y坐标
        potFocusShadow: cc.Node,        //底池提示阴影，Y坐标=-底池Y坐标
        //HoleCards提示
        holeCardsTutorial: cc.Node,     //底牌提示
        holeCardsTextTips: cc.Node,     //底牌文字提示，Y坐标=底牌Y坐标+150
        holeCardsFocusMask: cc.Node,    //底牌提示蒙层，Y坐标=底牌Y坐标+60
        holeCardsFocusShadow: cc.Node,  //底牌提示阴影，Y坐标=-(底牌Y坐标+60)
        //Flop轮提示
        flopTutorial: cc.Node,          //Flop牌提示
        flopTextTips: cc.Node,          //Flop牌文字提示，Y坐标=第二张Flop牌Y坐标+140
        flopFocusMask: cc.Node,         //Flop牌提示蒙层，Y坐标=第二张Flop牌Y坐标+50
        flopFocusShadow: cc.Node,       //Flop牌提示阴影，Y坐标=-(第二张Flop牌Y坐标+50)
        //Turn轮提示
        turnTutorial: cc.Node,          //Turn牌提示
        turnTextTips: cc.Node,          //Turn牌文字提示，Y坐标=Turn牌Y坐标+140
        turnFocusMask: cc.Node,         //Turn牌提示蒙层，Y坐标=Turn牌Y坐标+50
        turnFocusShadow: cc.Node,       //Turn牌提示阴影，Y坐标=-(Turn牌Y坐标+50)
        //River轮提示
        riverTutorial: cc.Node,         //River牌提示
        riverTextTips: cc.Node,         //River牌文字提示，Y坐标=River牌Y坐标+140
        riverFocusMask: cc.Node,        //River牌提示蒙层，Y坐标=River牌Y坐标+50
        riverFocusShadow: cc.Node,      //River牌提示阴影，Y坐标=-(River牌Y坐标+50)
        //摊牌轮提示
        showdownTutorial: cc.Node,              //摊牌轮提示层
        showdownCommunityFocusMask: cc.Node,    //摊牌轮公共牌提示蒙层
        showdownCommunityFocusShadow: cc.Node,  //摊牌轮公共牌提示蒙层阴影
        showdownHoleCardsFocusMask: cc.Node,    //摊牌轮底牌提示蒙层
        showdownHoleCardsFocusShadow: cc.Node,  //摊牌轮底牌提示蒙层阴影
        showdownCardTypeTextTips: cc.Node,      //摊牌轮牌型文字提示
        showdownCardTypeFocusMask: cc.Node,     //摊牌轮牌型提示蒙层
        showdownCardTypeFocusShadow: cc.Node,   //摊牌轮牌型提示蒙层阴影
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 增加value字段存储原始值
        this.potNum.value = "0";
        this.currentRoundPotNum.value = "0";

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
        cc.find("Canvas/TableInfoLayer/layoutTableInfo/btnTableInfo/btn_tableinfo_on").active = cc.find("Canvas/TableInfoDetailLayer").active;
        cc.find("Canvas/TableInfoLayer/layoutTableInfo/btnTableInfo/btn_tableinfo_off").active = !cc.find("Canvas/TableInfoDetailLayer").active;
        //座位编号规则：
        //最底为0号位，自身玩家的位置，后面的位置从0号位开始顺时针按顺序排号，玩家任意选座后会以距离0号位置最近的方向（顺时针/逆时针）旋转至0号位置坐下
        this.playerTables = {};
        this.playerAnchors = {};
        //9人桌各位置使用的预制资源
        this.playerTables['9'] = this.tableFor9Layer;
        this.playerAnchors['9'] = this.playerAnchorsFor9;
        //根据最大玩家数显示各玩家位置
        this._maxPlayers = 9;
        this._maxPlayerStr = "9";
        this.playerTables[this._maxPlayerStr].active = true;
        let gametable = cc.find("Canvas/bg_gamehall/bg_gametable");
        let gametable_long = cc.find("Canvas/bg_gamehall/bg_gametable_long");
        let btnmenu = cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BtnMainMenu");
        btnmenu.getComponent(cc.Widget).updateAlignment();  //使对齐生效，否则下面获取到的还是原设计的坐标
        let menuv2 = btnmenu.convertToWorldSpaceAR(cc.v2(0, 0));
        let gametablev2 = gametable.convertToWorldSpaceAR(cc.v2(0, 0));
        let gametable_longv2 = gametable_long.convertToWorldSpaceAR(cc.v2(0, 0));
        let newOriginWorldPT = null;
        //console.log("WxH: " + cc.winSize.width + "x" + cc.winSize.height);
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
        let playerInfos = [
            {"pos": 0, "addr": "0xe2A04360", "nickname": "e2A04360", "stackNum": 20000, "status": Types.ContractStatus.PLAYING},
            {"pos": 1, "addr": "0x5806dc65", "nickname": "5806dc65", "stackNum": 20000, "status": Types.ContractStatus.PLAYING},
            {"pos": 1, "addr": "0x54ABf71B", "nickname": "54ABf71B", "stackNum": 20000, "status": Types.ContractStatus.PLAYING},
            {"pos": 1, "addr": "0x2cD3A6D1", "nickname": "2cD3A6D1", "stackNum": 20000, "status": Types.ContractStatus.PLAYING},
            {"pos": 1, "addr": "0x9821Fcc8", "nickname": "9821Fcc8", "stackNum": 20000, "status": Types.ContractStatus.PLAYING},
            {"pos": 1, "addr": "0x56725d4A", "nickname": "56725d4A", "stackNum": 20000, "status": Types.ContractStatus.PLAYING},
            {"pos": 1, "addr": "0xD23FDeC7", "nickname": "D23FDeC7", "stackNum": 20000, "status": Types.ContractStatus.PLAYING},
            {"pos": 1, "addr": "0xA4Fecb02", "nickname": "A4Fecb02", "stackNum": 20000, "status": Types.ContractStatus.PLAYING},
            {"pos": 1, "addr": "0xd3A221a1", "nickname": "d3A221a1", "stackNum": 20000, "status": Types.ContractStatus.PLAYING}];
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
            player.initPlayerInfo(playerInfos[i].pos, playerInfos[i].addr, playerInfos[i].nickname, playerInfos[i].stackNum, playerInfos[i].status);

            // player.startCountDown(15);
            if (i == 0) {
                let holeCardsLayer = cc.find("Canvas/HoldCardsLayer");
                let selfHeadWorldPT = playerAnchor.convertToWorldSpaceAR(cc.v2(0, 0));
                let newHoleCardsWorldPT = cc.v2(selfHeadWorldPT.x, selfHeadWorldPT.y + 178);//178=牌高度一半+牌和头40+头高度一半
                holeCardsLayer.setPosition(holeCardsLayer.parent.convertToNodeSpaceAR(newHoleCardsWorldPT));

                let communityCardLayer = cc.find("Canvas/PublicCardsLayer");
                let newCommunityCardWorldPT = cc.v2(newHoleCardsWorldPT.x, newHoleCardsWorldPT.y + 550);//公共牌层比底牌高550
                communityCardLayer.setPosition(communityCardLayer.parent.convertToNodeSpaceAR(newCommunityCardWorldPT));

                let roundTipsLayer = cc.find("Canvas/RoundTips");
                let newRoundTipsWorldPT = null;
                if (gametable.active) {
                    newRoundTipsWorldPT = cc.v2(newCommunityCardWorldPT.x, newCommunityCardWorldPT.y + 158);//轮次提示层比公共牌高158
                } else {
                    newRoundTipsWorldPT = cc.v2(newCommunityCardWorldPT.x, newCommunityCardWorldPT.y + 308);//轮次提示层比公共牌高308
                }
                roundTipsLayer.setPosition(roundTipsLayer.parent.convertToNodeSpaceAR(newRoundTipsWorldPT));

                let potLayer = cc.find("Canvas/PotLayer");
                let newPotWorldPT = null;
                if (gametable.active) {
                    newPotWorldPT = cc.v2(newCommunityCardWorldPT.x, newCommunityCardWorldPT.y + 340);//轮次提示层比公共牌高340
                } else {
                    newPotWorldPT = cc.v2(newCommunityCardWorldPT.x, newCommunityCardWorldPT.y + 490);//轮次提示层比公共牌高490
                }
                potLayer.setPosition(potLayer.parent.convertToNodeSpaceAR(newPotWorldPT));
                let newpos = this.dealerMark.parent.convertToNodeSpaceAR(player.getDealerMarkPos());
                this.dealerMark.setPosition(newpos);
                this.dealerMark.active = true;    
            } else {
                player.recoverDealCards();
                if (i == 1) {
                    player.setBet(100, false);
                    player.setStack(20000 - 100);
                } else if (i == 2) {
                    player.setBet(200, false);
                    player.setStack(20000 - 200);
                }
            }
        }

        this.touchLayer.on('touchstart', this._onTouchStart, this);

        this._index = 0;
        this.schedule(this._countTimer, 0.1);
    },

    start () {

    },

    onBtnPlayNowClicked () {
        let tutorial = JSON.parse(cc.sys.localStorage.getItem("tutorial"));
        tutorial.TexasHoldem = true;
        cc.sys.localStorage.setItem("tutorial", JSON.stringify(tutorial));
        cc.director.loadScene("GameHall");
    },

    onBtnLearnMoreRulesClicked () {
        let tutorial = JSON.parse(cc.sys.localStorage.getItem("tutorial"));
        tutorial.TexasHoldem = true;
        cc.sys.localStorage.setItem("tutorial", JSON.stringify(tutorial));
        cc.dgame.helpAndRulesScene = cc.director.getScene().name;
        cc.director.loadScene("HelpAndRules");
    },

    onDestroy () {
    },

    _onTouchStart () {
        if (this._index < 3) {
            this._index = 3 - 1;
        } else if (this._index < 11) {
            this._index = 11 - 1;
        } else if (this._index < 19) {
            this._index = 19 - 1;
        } else if (this._index < 49) {
            this._index = 49 - 1;
        } else if (this._index < 74) {
            this._index = 74 - 1;
        } else if (this._index < 99) {
            this._index = 99 - 1;
        } else if (this._index < 107) {
            this._index = 107 - 1;
        } else if (this._index < 115) {
            this._index = 115 - 1;
        } else if (this._index < 140) {
            this._index = 140 - 1;
        } else if (this._index < 170) {
            this._index = 170 - 1;
        }
        this._countTimer();
    },

    _countTimer () {
        this._index++;
        if (this._index == 1) {
            this._initPreflopTutorial();
            this._initPotTutorial();
            this._initHoleCardsTutorial();
            this._initFlopTutorial();
            this._initTurnTutorial();
            this._initRiverTutorial();
            this._initShowdownTutorial();   
            this._initButtonLayer(); 
        } else if (this._index == 3) { //0.3秒后开始展示庄家
            this.preflopTutorial.active = true;
            this.preflopDealerUntips.active = false;
            this.preflopDealerTextTips.active = true;
            this.preflopDealerFocusMask.active = true;
        } else if (this._index == 11) {  //0.8秒后展示小盲
            this.preflopSmallBlindUntips.active = false;
            this.preflopSmallBlindTextTips.active = true;
            this.preflopSmallBlindFocusMask.active = true;
        } else if (this._index == 19) {  //0.8秒后展示大盲
            this.preflopBigBlindUntips.active = false;
            this.preflopBigBlindTextTips.active = true;
            this.preflopBigBlindFocusMask.active = true;
        } else if (this._index == 49) { //3秒后展示底池
            this.preflopTutorial.active = false;
            for (let i = 3; i < 9; i++) {
                let playerAnchor = this.playerAnchors[this._maxPlayerStr][i];
                let player = playerAnchor.getChildren()[0].getComponent('Player');
                player.setBet(200, false);
                player.setStack(20000 - 200);
                player.showAction(Types.PlayerOP.CALL);
            }
            //玩家0
            let playerAnchor0 = this.playerAnchors[this._maxPlayerStr][0];
            let player0 = playerAnchor0.getChildren()[0].getComponent('Player');
            player0.setBet(200, false);
            player0.setStack(20000 - 200);
            //小盲
            let playerAnchor1 = this.playerAnchors[this._maxPlayerStr][1];
            let player1 = playerAnchor1.getChildren()[0].getComponent('Player');
            player1.setBet(200, false);
            player1.setStack(20000 - 200);
            player1.showAction(Types.PlayerOP.CALL);
            //大盲
            let playerAnchor2 = this.playerAnchors[this._maxPlayerStr][2];
            let player2 = playerAnchor2.getChildren()[0].getComponent('Player');
            player2.setBet(200, false);
            player2.setStack(20000 - 200);
            player2.showAction(Types.PlayerOP.CHECK);

            cc.dgame.utils.setOriginValue(this.potNum, 1800, "yellow");
            cc.dgame.utils.setOriginValue(this.currentRoundPotNum, 1800);

            for (let i = 0; i < 9; i++) {
                let playerAnchor = this.playerAnchors[this._maxPlayerStr][i];
                let player = playerAnchor.getChildren()[0].getComponent('Player');
                player.setBet(0, false);
            }

            this.selfHoleCards[0].active = true;
            this.selfHoleCards[1].active = true;
            this.potTutorial.active = true;
        } else if (this._index == 74) { //2.5秒后展示手牌
            this.potTutorial.active = false;
            this.holeCardsTutorial.active = true;
        } else if (this._index == 99) { //2.5秒后展示翻牌
            this.holeCardsTutorial.active = false;
            this.dealPublicCards[0].active = true;
            this.dealPublicCards[1].active = true;
            this.dealPublicCards[2].active = true;
            this.flopTutorial.active = true;
            this.cardType.string = "Three of a kind";
        } else if (this._index == 107) {    //0.8秒后展示Turn
            this.flopTutorial.active = false;
            this.dealPublicCards[3].active = true;
            this.turnTutorial.active = true;
        } else if (this._index == 115) {    //0.8秒后展示River
            this.turnTutorial.active = false;
            this.dealPublicCards[4].active = true;
            this.riverTutorial.active = true;
            this.cardType.string = "Royal flush";
        } else if (this._index == 140) {    //2.5秒后展示牌型
            this.riverTutorial.active = false;
            this.dealPublicCards[4].active = true;
            this.showdownTutorial.active = true;
        } else if (this._index >= 170) {    //3秒后展示按钮
            this.showdownTutorial.active = false;
            this.buttonLayer.active = true;
            this.unschedule(this._countTimer);
            this.touchLayer.active = false;
        }
    },

    _initPreflopTutorial () {
        //计算preflop轮各蒙层坐标
        //获取玩家坐标
        let player0WorldPT = this.playerAnchors[this._maxPlayerStr][0].convertToWorldSpaceAR(cc.v2(0, 0));
        let player1WorldPT = this.playerAnchors[this._maxPlayerStr][1].convertToWorldSpaceAR(cc.v2(0, 0));
        let player2WorldPT = this.playerAnchors[this._maxPlayerStr][2].convertToWorldSpaceAR(cc.v2(0, 0));
        //console.log("player0WorldPT: " + player0WorldPT + ", player1WorldPT: " + player1WorldPT + ", player2WorldPT: " + player2WorldPT);
        //根据玩家坐标计算镂空层坐标
        let dealerMaskWorldPT = cc.v2(player0WorldPT.x, player0WorldPT.y + 45);//Dealer的Y坐标=玩家0的Y坐标+45
        let smallBlindMaskWorldPT = cc.v2(player1WorldPT.x + 170, player1WorldPT.y - 34);//小盲的Y坐标=玩家1的Y坐标-34
        let bigBlindMaskWorldPT = cc.v2(player2WorldPT.x + 170, player2WorldPT.y - 29);//大盲的Y坐标=玩家2的Y坐标-29
        //console.log("dealerMaskWorldPT: " + dealerMaskWorldPT + ", smallBlindMaskWorldPT: " + smallBlindMaskWorldPT + ", bigBlindMaskWorldPT: " + bigBlindMaskWorldPT);
        //计算各个蒙层的y坐标
        let bigBlindFocusWorldPT = cc.v2(cc.winSize.width / 2, smallBlindMaskWorldPT.y + (bigBlindMaskWorldPT.y - smallBlindMaskWorldPT.y) / 2);
        let smallBlindFocusWorldPT = cc.v2(cc.winSize.width / 2, dealerMaskWorldPT.y + (smallBlindMaskWorldPT.y - dealerMaskWorldPT.y) / 2);
        let dealerFocusWorldPT = cc.v2(cc.winSize.width / 2, 0);
        //console.log("dealerFocusWorldPT: " + dealerFocusWorldPT + ", smallBlindFocusWorldPT: " + smallBlindFocusWorldPT + ", bigBlindFocusWorldPT: " + bigBlindFocusWorldPT);
        //设置各蒙层的位置
        this.preflopBigBlindFocus.setPosition(this.preflopBigBlindFocus.parent.convertToNodeSpaceAR(bigBlindFocusWorldPT));
        this.preflopSmallBlindFocus.setPosition(this.preflopSmallBlindFocus.parent.convertToNodeSpaceAR(smallBlindFocusWorldPT));
        this.preflopDealerFocus.setPosition(this.preflopDealerFocus.parent.convertToNodeSpaceAR(dealerFocusWorldPT));
        //镂空与阴影的高度
        this.preflopDealerFocus.height = smallBlindFocusWorldPT.y;
        this.preflopSmallBlindFocus.height = bigBlindFocusWorldPT.y - smallBlindFocusWorldPT.y;
        this.preflopBigBlindFocus.height = cc.winSize.height - bigBlindFocusWorldPT.y;
        this.preflopDealerFocusShadow.height = smallBlindFocusWorldPT.y;
        this.preflopSmallBlindFocusShadow.height = bigBlindFocusWorldPT.y - smallBlindFocusWorldPT.y;
        this.preflopBigBlindFocusShadow.height = cc.winSize.height - bigBlindFocusWorldPT.y;
        //设置镂空层坐标
        this.preflopBigBlindFocusMask.setPosition(this.preflopBigBlindFocusMask.parent.convertToNodeSpaceAR(bigBlindMaskWorldPT));
        this.preflopSmallBlindFocusMask.setPosition(this.preflopSmallBlindFocusMask.parent.convertToNodeSpaceAR(smallBlindMaskWorldPT));
        this.preflopDealerFocusMask.setPosition(this.preflopDealerFocusMask.parent.convertToNodeSpaceAR(dealerMaskWorldPT));
        //设置阴影与提示的位置
        let preflopDealerFocusMaskPos = this.preflopDealerFocusMask.getPosition();
        let preflopSmallBlindFocusMaskPos = this.preflopSmallBlindFocusMask.getPosition();
        let preflopBigBlindFocusMaskPos = this.preflopBigBlindFocusMask.getPosition();
        preflopDealerFocusMaskPos.x = -preflopDealerFocusMaskPos.x;
        preflopDealerFocusMaskPos.y = -preflopDealerFocusMaskPos.y;
        preflopSmallBlindFocusMaskPos.x = -preflopSmallBlindFocusMaskPos.x;
        preflopSmallBlindFocusMaskPos.y = -preflopSmallBlindFocusMaskPos.y;
        preflopBigBlindFocusMaskPos.x = -preflopBigBlindFocusMaskPos.x;
        preflopBigBlindFocusMaskPos.y = -preflopBigBlindFocusMaskPos.y;
        this.preflopDealerFocusShadow.setPosition(preflopDealerFocusMaskPos);
        this.preflopSmallBlindFocusShadow.setPosition(preflopSmallBlindFocusMaskPos);
        this.preflopBigBlindFocusShadow.setPosition(preflopBigBlindFocusMaskPos);
        let dealerTextTipsPos = this.preflopDealerFocusMask.getPosition();
        let smallBlindTextTipsPos = this.preflopSmallBlindFocusMask.getPosition();
        let bigBlindTextTipsPos = this.preflopBigBlindFocusMask.getPosition();
        dealerTextTipsPos.x -= 70;
        dealerTextTipsPos.y += 107;
        smallBlindTextTipsPos.x += 40;
        smallBlindTextTipsPos.y += 30;
        bigBlindTextTipsPos.x += 30;
        bigBlindTextTipsPos.y += 30;
        this.preflopDealerTextTips.setPosition(dealerTextTipsPos);
        this.preflopSmallBlindTextTips.setPosition(smallBlindTextTipsPos);
        this.preflopBigBlindTextTips.setPosition(bigBlindTextTipsPos);
    },

    _initPotTutorial () {
        //计算Pot各蒙层坐标
        let potLayer = cc.find("Canvas/PotLayer");
        let potWorldPT = potLayer.convertToWorldSpaceAR(cc.v2(0, 0));
        let potTextTipsWorldPT = cc.v2(potWorldPT.x, potWorldPT.y + 75);
        let potFocusMaskWorldPT = cc.v2(potWorldPT.x, potWorldPT.y);
        //console.log("potWorldPT: " + potWorldPT + ", potTextTipsWorldPT: " + potTextTipsWorldPT + ", potFocusMaskWorldPT: " + potFocusMaskWorldPT);
        this.potTextTips.setPosition(this.potTextTips.parent.convertToNodeSpaceAR(potTextTipsWorldPT));
        this.potFocusMask.setPosition(this.potFocusMask.parent.convertToNodeSpaceAR(potFocusMaskWorldPT));
        let potFocusMaskPos = this.potFocusMask.getPosition();
        potFocusMaskPos.y = -potFocusMaskPos.y;
        this.potFocusShadow.setPosition(potFocusMaskPos);
        this.potFocusShadow.height = cc.winSize.height;
        this.potFocusShadow.width = cc.winSize.width;
    },

    _initHoleCardsTutorial () {
        let poker0 = this.selfHoleCards[0].getChildren()[0].getComponent('Poker');
        let poker1 = this.selfHoleCards[1].getChildren()[0].getComponent('Poker');
        poker0.setCardPoint(11);
        poker1.setCardPoint(12);
        poker0.setFaceUp(true);
        poker1.setFaceUp(true);

        //计算底牌各蒙层坐标
        let holeCardsLayer = cc.find("Canvas/HoldCardsLayer");
        let holeCardsWorldPT = holeCardsLayer.convertToWorldSpaceAR(cc.v2(0, 0));
        let holeCardsTextTipsWorldPT = cc.v2(holeCardsWorldPT.x, holeCardsWorldPT.y + 150);
        let holeCardsFocusMaskWorldPT = cc.v2(holeCardsWorldPT.x, holeCardsWorldPT.y + 60);
        //console.log("holeCardsWorldPT: " + holeCardsWorldPT + ", holeCardsTextTipsWorldPT: " + holeCardsTextTipsWorldPT + ", holeCardsFocusMaskWorldPT: " + holeCardsFocusMaskWorldPT);
        this.holeCardsTextTips.setPosition(this.holeCardsTextTips.parent.convertToNodeSpaceAR(holeCardsTextTipsWorldPT));
        this.holeCardsFocusMask.setPosition(this.holeCardsFocusMask.parent.convertToNodeSpaceAR(holeCardsFocusMaskWorldPT));
        let holeCardsMaskPos = this.holeCardsFocusMask.getPosition();
        holeCardsMaskPos.y = -holeCardsMaskPos.y;
        this.holeCardsFocusShadow.setPosition(holeCardsMaskPos);
        this.holeCardsFocusShadow.height = cc.winSize.height;
        this.holeCardsFocusShadow.width = cc.winSize.width;
    },

    _initFlopTutorial () {
        //计算Flop各蒙层坐标
        this.dealPublicCards[0].setPosition(PositionData.CommunityCardPositions[0].x, PositionData.CommunityCardPositions[0].y);
        this.dealPublicCards[1].setPosition(PositionData.CommunityCardPositions[1].x, PositionData.CommunityCardPositions[1].y);
        this.dealPublicCards[2].setPosition(PositionData.CommunityCardPositions[2].x, PositionData.CommunityCardPositions[2].y);
        // this.dealPublicCards[0].active = true;
        // this.dealPublicCards[1].active = true;
        // this.dealPublicCards[2].active = true;
        let fpoker0 = this.dealPublicCards[0].getChildren()[0].getComponent('Poker');
        let fpoker1 = this.dealPublicCards[1].getChildren()[0].getComponent('Poker');
        let fpoker2 = this.dealPublicCards[2].getChildren()[0].getComponent('Poker');
        fpoker0.setCardPoint(51);
        fpoker1.setCardPoint(38);
        fpoker2.setCardPoint(8);
        fpoker0.setFaceUp(true);
        fpoker1.setFaceUp(true);
        fpoker2.setFaceUp(true);
        let flop2Anchor = cc.find("Canvas/PublicCardsLayer/FlopCard_2");
        let flop2WorldPT = flop2Anchor.convertToWorldSpaceAR(cc.v2(0, 0));
        let flopTextTipsWorldPT = cc.v2(flop2WorldPT.x, flop2WorldPT.y + 140);
        let flopFocusMaskWorldPT = cc.v2(flop2WorldPT.x, flop2WorldPT.y + 50);
        //console.log("flop2WorldPT: " + flop2WorldPT + ", flopTextTipsWorldPT: " + flopTextTipsWorldPT + ", flopFocusMaskWorldPT: " + flopFocusMaskWorldPT);
        this.flopTextTips.setPosition(this.flopTextTips.parent.convertToNodeSpaceAR(flopTextTipsWorldPT));
        this.flopFocusMask.setPosition(this.flopFocusMask.parent.convertToNodeSpaceAR(flopFocusMaskWorldPT));
        let flopMaskPos = this.flopFocusMask.getPosition();
        flopMaskPos.x = -flopMaskPos.x;
        flopMaskPos.y = -flopMaskPos.y;
        this.flopFocusShadow.setPosition(flopMaskPos);
        this.flopFocusShadow.height = cc.winSize.height;
        this.flopFocusShadow.width = cc.winSize.width;
    },

    _initTurnTutorial () {
        //计算Turn各蒙层坐标
        this.dealPublicCards[3].setPosition(PositionData.CommunityCardPositions[3].x, PositionData.CommunityCardPositions[3].y);
        // this.dealPublicCards[3].active = true;
        let tpoker = this.dealPublicCards[3].getChildren()[0].getComponent('Poker');
        tpoker.setCardPoint(9);
        tpoker.setFaceUp(true);
        let turnAnchor = cc.find("Canvas/PublicCardsLayer/TurnCard");
        let turnWorldPT = turnAnchor.convertToWorldSpaceAR(cc.v2(0, 0));
        let turnTextTipsWorldPT = cc.v2(turnWorldPT.x, turnWorldPT.y + 140);
        let turnFocusMaskWorldPT = cc.v2(turnWorldPT.x, turnWorldPT.y + 50);
        //console.log("turnWorldPT: " + turnWorldPT + ", turnTextTipsWorldPT: " + turnTextTipsWorldPT + ", turnFocusMaskWorldPT: " + turnFocusMaskWorldPT);
        this.turnTextTips.setPosition(this.turnTextTips.parent.convertToNodeSpaceAR(turnTextTipsWorldPT));
        this.turnFocusMask.setPosition(this.turnFocusMask.parent.convertToNodeSpaceAR(turnFocusMaskWorldPT));
        let turnMaskPos = this.turnFocusMask.getPosition();
        turnMaskPos.x = -turnMaskPos.x;
        turnMaskPos.y = -turnMaskPos.y;
        this.turnFocusShadow.setPosition(turnMaskPos);
        this.turnFocusShadow.height = cc.winSize.height;
        this.turnFocusShadow.width = cc.winSize.width;
    },

    _initRiverTutorial () {
        //计算River各蒙层坐标
        this.dealPublicCards[4].setPosition(PositionData.CommunityCardPositions[4].x, PositionData.CommunityCardPositions[4].y);
        // this.dealPublicCards[4].active = true;
        let rpoker = this.dealPublicCards[4].getChildren()[0].getComponent('Poker');
        rpoker.setCardPoint(10);
        rpoker.setFaceUp(true);
        let riverAnchor = cc.find("Canvas/PublicCardsLayer/RiverCard");
        let riverWorldPT = riverAnchor.convertToWorldSpaceAR(cc.v2(0, 0));
        let riverTextTipsWorldPT = cc.v2(riverWorldPT.x, riverWorldPT.y + 140);
        let riverFocusMaskWorldPT = cc.v2(riverWorldPT.x, riverWorldPT.y + 50);
        //console.log("riverWorldPT: " + riverWorldPT + ", riverTextTipsWorldPT: " + riverTextTipsWorldPT + ", riverFocusMaskWorldPT: " + riverFocusMaskWorldPT);
        this.riverTextTips.setPosition(this.riverTextTips.parent.convertToNodeSpaceAR(riverTextTipsWorldPT));
        this.riverFocusMask.setPosition(this.riverFocusMask.parent.convertToNodeSpaceAR(riverFocusMaskWorldPT));
        let riverMaskPos = this.riverFocusMask.getPosition();
        riverMaskPos.x = -riverMaskPos.x;
        riverMaskPos.y = -riverMaskPos.y;
        this.riverFocusShadow.setPosition(riverMaskPos);
        this.riverFocusShadow.height = cc.winSize.height;
        this.riverFocusShadow.width = cc.winSize.width;
    },

    _initShowdownTutorial () {
        //计算摊牌轮各蒙层坐标
        let turnWorldPT = cc.find("Canvas/PublicCardsLayer/TurnCard").convertToWorldSpaceAR(cc.v2(0, 0));
        let holeCardsWorldPT = cc.find("Canvas/HoldCardsLayer").convertToWorldSpaceAR(cc.v2(0, 0));
        let ctWorldPT = this.cardType.node.convertToWorldSpaceAR(cc.v2(0, 0));
        console.log("turnWorldPT: " + turnWorldPT + ", holeCardsWorldPT: " + holeCardsWorldPT + ", ctWorldPT: " + ctWorldPT);
        //镂空层定位
        this.showdownCommunityFocusMask.setPosition(this.showdownCommunityFocusMask.parent.convertToNodeSpaceAR(turnWorldPT));
        this.showdownHoleCardsFocusMask.setPosition(this.showdownHoleCardsFocusMask.parent.convertToNodeSpaceAR(holeCardsWorldPT));
        let ctMaskWorldPT = this.cardType.node.convertToWorldSpaceAR(cc.v2(0, 0));
        ctMaskWorldPT.x += 170;
        this.showdownCardTypeFocusMask.setPosition(this.showdownCardTypeFocusMask.parent.convertToNodeSpaceAR(ctMaskWorldPT));
        let ctTipsWorldPT = this.cardType.node.convertToWorldSpaceAR(cc.v2(0, 0));
        ctTipsWorldPT.x += 253;
        this.showdownCardTypeTextTips.setPosition(this.showdownCardTypeTextTips.parent.convertToNodeSpaceAR(ctTipsWorldPT));
        //阴影的高度与位置
        let communityShadowWorldPT = cc.v2(cc.winSize.width / 2, holeCardsWorldPT.y + (turnWorldPT.y - holeCardsWorldPT.y) / 2);
        let holeCardsShadowWorldPT = cc.v2(cc.winSize.width / 2, ctWorldPT.y + (holeCardsWorldPT.y - ctWorldPT.y) / 2);
        let ctShadowWorldPT = cc.v2(cc.winSize.width / 2, 0);
        this.showdownCardTypeFocusShadow.height = holeCardsShadowWorldPT.y;
        this.showdownHoleCardsFocusShadow.height = communityShadowWorldPT.y - holeCardsShadowWorldPT.y;
        this.showdownCommunityFocusShadow.height = cc.winSize.height - communityShadowWorldPT.y;
        this.showdownCommunityFocusShadow.setPosition(this.showdownCommunityFocusShadow.parent.convertToNodeSpaceAR(communityShadowWorldPT));
        this.showdownHoleCardsFocusShadow.setPosition(this.showdownHoleCardsFocusShadow.parent.convertToNodeSpaceAR(holeCardsShadowWorldPT));
        this.showdownCardTypeFocusShadow.setPosition(this.showdownCardTypeFocusShadow.parent.convertToNodeSpaceAR(ctShadowWorldPT));
    },

    _initButtonLayer () {
        let pos = cc.find("Canvas/ButtonLayer/btnPlayNow").convertToWorldSpaceAR(cc.v2(0, 0));
        pos.y -= 102;
        pos.y -= cc.find("Canvas/ButtonLayer/btnPlayNow").height;
        let btnMoreRules = cc.find("Canvas/ButtonLayer/btnMoreRules");
        btnMoreRules.setPosition(btnMoreRules.parent.convertToNodeSpaceAR(pos));
    },
});
