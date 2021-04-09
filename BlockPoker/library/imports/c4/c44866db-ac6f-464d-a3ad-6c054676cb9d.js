"use strict";
cc._RF.push(module, 'c4486bbrG9GTaOtbAVGdsud', 'Player');
// scripts/Game/Player.js

"use strict";

// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var Types = require("Types");

var PositionData = require("PositionData");

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    pokerPrefab: cc.Prefab,
    //牌预制资源
    winlight: cc.Node,
    //获胜后的光环
    allinHead: cc.Node,
    //Allin后的头像动画
    headLayer: cc.Node,
    //头像图层
    headMask: cc.Node,
    //头像蒙层
    headDisable: cc.Node,
    //禁用蒙层
    avator: cc.Sprite,
    //头像
    emptySeatLayer: cc.Node,
    //空位
    //countDownLayer: cc.Node,//操作倒计时图层
    countDownProgressBar: cc.ProgressBar,
    //倒计时进度条
    //countDown: cc.Label,    //倒计时秒数，15s
    autoCheckoutCountDownLayer: cc.Node,
    //自动结算离桌倒计时图层
    autoCheckoutCountDown: cc.Label,
    //倒计时秒数，180s
    nickName: cc.Label,
    //昵称
    RMTWinner: cc.Node,
    //多牌赢家提示
    stackNum: cc.RichText,
    //筹码数
    seatNo: cc.Label,
    //座位号，测试用
    winlossCardtype: [cc.Node],
    //输赢金币数牌型
    _winLoss: null,
    //输赢金币数
    _cardType: null,
    //牌型
    firstCard: cc.Node,
    //第一张底牌最终效果，定位用，永不显示
    secondCard: cc.Node,
    //第二张底牌最终效果，定位用，永不显示
    dealHoleCards: [cc.Node],
    //发的两张底牌最终位置效果，即firstCard、secondCard
    holeCards: [cc.Node],
    //摊牌阶段两张底牌最终位置效果，Allin或到摊牌阶段会翻转显示，即holeCard_1、holeCard_2
    cardAnchors: [cc.Node],
    //两张能发牌、翻转、弃牌的底牌，自身玩家发完牌后在SelfHoleCard位置出现底牌并翻转，这两张牌消失
    operateLayer: cc.Node,
    //操作层
    opNodes: [cc.Node],
    //所有操作节点（暂离、等待中、跟注、看牌、下注、加注、全下、弃牌）
    betLayer: cc.Node,
    //下注筹码
    betNum: cc.Label,
    //下注筹码数
    replayBetLayer: cc.Node,
    //牌局回放下注筹码
    replayBetNum: cc.Label,
    //牌局回放下注筹码数
    dealerMark: cc.Node,
    //庄家位置，各入座的玩家顺时针方向轮庄
    disconnectMark: cc.Node,
    //掉线图标
    actionTimeout: cc.Node,
    //玩家行动超时
    btnBackToPlay: cc.Node,
    //返回牌桌
    btnResitDown: cc.Node,
    //重新坐下
    betChips: [cc.Node],
    //下注动画的筹码
    InsuranceLayer: cc.Node //已买保险标志

  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    this._assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");

    for (var i = 0; i < this.cardAnchors.length; i++) {
      var cardNode = cc.instantiate(this.pokerPrefab);
      this.cardAnchors[i].addChild(cardNode);
      var poker = cardNode.getComponent("Poker");
      poker.init(0, 0);
      poker.setFaceUp(false);
    }

    this._haveWaiting = false; //曾经等待过

    this._revealHoleCard = false; //是否已摊过底牌

    this.betNum.value = "0";
    this.stackNum.value = "0";
    this._isTableStarted = false;
    Log.Trace("Player:onLoad");
  },
  onDestroy: function onDestroy() {
    Log.Trace("Player:onDestroy");
  },
  //根据牌桌上的位置调整一些组件的显示位置
  initPlayerByTablePos: function initPlayerByTablePos(maxplayer, pos) {
    this.operateLayer.setPosition(PositionData.PlayerComponentPositions[maxplayer][pos].OperateLayer.x, PositionData.PlayerComponentPositions[maxplayer][pos].OperateLayer.y);
    this.betLayer.setPosition(PositionData.PlayerComponentPositions[maxplayer][pos].BetLayer.x, PositionData.PlayerComponentPositions[maxplayer][pos].BetLayer.y);
    this.firstCard.setPosition(PositionData.PlayerComponentPositions[maxplayer][pos].FirstCard.x, PositionData.PlayerComponentPositions[maxplayer][pos].FirstCard.y);
    this.firstCard.angle = PositionData.PlayerComponentPositions[maxplayer][pos].FirstCard.degree;
    this.secondCard.setPosition(PositionData.PlayerComponentPositions[maxplayer][pos].SecondCard.x, PositionData.PlayerComponentPositions[maxplayer][pos].SecondCard.y);
    this.secondCard.angle = PositionData.PlayerComponentPositions[maxplayer][pos].SecondCard.degree;
    this.dealerMark.setPosition(PositionData.PlayerComponentPositions[maxplayer][pos].DealerMark.x, PositionData.PlayerComponentPositions[maxplayer][pos].DealerMark.y);
    this._winlossCardtype = PositionData.PlayerComponentPositions[maxplayer][pos].WinlossLayer;

    this.winlossCardtype[this._winlossCardtype].setPosition(PositionData.PlayerComponentPositions[maxplayer][pos].Winloss.x, PositionData.PlayerComponentPositions[maxplayer][pos].Winloss.y);
  },
  //根据牌局回放牌桌上的位置调整一些组件的显示位置
  initReplayPlayerByTablePos: function initReplayPlayerByTablePos(maxplayer, pos) {
    this.operateLayer.setPosition(PositionData.ReplayPlayerComponentPositions[maxplayer][pos].OperateLayer.x, PositionData.ReplayPlayerComponentPositions[maxplayer][pos].OperateLayer.y);
    this.betLayer.setPosition(PositionData.ReplayPlayerComponentPositions[maxplayer][pos].BetLayer.x, PositionData.ReplayPlayerComponentPositions[maxplayer][pos].BetLayer.y);
    this.firstCard.setPosition(PositionData.ReplayPlayerComponentPositions[maxplayer][pos].FirstCard.x, PositionData.ReplayPlayerComponentPositions[maxplayer][pos].FirstCard.y);
    this.firstCard.angle = PositionData.ReplayPlayerComponentPositions[maxplayer][pos].FirstCard.degree;
    this.secondCard.setPosition(PositionData.ReplayPlayerComponentPositions[maxplayer][pos].SecondCard.x, PositionData.ReplayPlayerComponentPositions[maxplayer][pos].SecondCard.y);
    this.secondCard.angle = PositionData.ReplayPlayerComponentPositions[maxplayer][pos].SecondCard.degree;
    this.dealerMark.setPosition(PositionData.ReplayPlayerComponentPositions[maxplayer][pos].DealerMark.x, PositionData.ReplayPlayerComponentPositions[maxplayer][pos].DealerMark.y);
    this._winlossCardtype = PositionData.ReplayPlayerComponentPositions[maxplayer][pos].WinlossLayer;

    this.winlossCardtype[this._winlossCardtype].setPosition(PositionData.ReplayPlayerComponentPositions[maxplayer][pos].Winloss.x, PositionData.ReplayPlayerComponentPositions[maxplayer][pos].Winloss.y);
  },
  start: function start() {},
  sitUp: function sitUp() {
    this.emptySeatLayer.active = true;
    this.operateLayer.active = false;
    this.headMask.active = false;
    this.nickName.node.active = false;
    this.stackNum.node.active = false;
  },
  isEmpty: function isEmpty() {
    return this.emptySeatLayer.active;
  },
  getPlayerAddr: function getPlayerAddr() {
    return this._Addr;
  },
  _onTabelDetail: function _onTabelDetail(data) {
    Log.Trace("_onTableDetail: " + JSON.stringify(data));

    if (data == "Network disconnected") {
      cc.dgame.normalLoading.showLoadTimeout();
      return;
    }

    if (!!data.Result.length) {
      for (var i = 0; i < data.Result.length; i++) {
        if (data.Result[i][0] == cc.dgame.settings.account.Addr) {
          //之前审批过了，但积分已打完，则重新买入并需要审批
          if (data.Result[i][1] + data.Result[i][2] < 5 * cc.dgame.tableInfo.SmallBlind + cc.dgame.tableInfo.Ante) {
            cc.dgame.tableInfo.WantSeatId = this._ContractPos;
            cc.dgame.tableInfo.BuyinGoldType = Types.BuyinGoldType.SITDOWN;
            cc.dgame.tableInfo.NeedApprove = true;
            cc.dgame.mainMenuPopup.onBtnBuyinChipsClicked();
          } else {
            //之前审批过了，牌桌上有剩余积分则直接坐下
            cc.dgame.tableInfo.WantSeatId = this._ContractPos;
            cc.dgame.tableInfo.BuyinGoldType = Types.BuyinGoldType.SITDOWN;
            cc.dgame.tableInfo.BuyinChips = data.Result[i][1] + data.Result[i][2];
            cc.dgame.tableInfo.NeedApprove = false;
            cc.dgame.mainMenuPopup.onBtnBuyinChipsConfirmClicked();
          }

          return;
        }
      }
    } //之前没审批过，需要买入并审批


    cc.dgame.tableInfo.WantSeatId = this._ContractPos;
    cc.dgame.tableInfo.BuyinGoldType = Types.BuyinGoldType.SITDOWN;
    cc.dgame.tableInfo.NeedApprove = true;
    cc.dgame.mainMenuPopup.onBtnBuyinChipsClicked();
  },
  onClickSitdown: function onClickSitdown() {
    Log.Trace("onClickSitdown: " + this._ContractPos);
    Log.Trace("chips: " + cc.dgame.settings.account.Chips + ", BuyinMin: " + cc.dgame.tableInfo.BuyinMin + ", tableId: " + cc.dgame.tableInfo.TableId); //token自由桌判断是否有足够的筹码带入

    if (parseInt(cc.dgame.tableInfo.TableId) > 0xE000000000000 && parseInt(cc.dgame.tableInfo.TableId) < 0xF000000000000 && parseInt(cc.dgame.settings.account.Chips) < parseInt(cc.dgame.tableInfo.BuyinMin)) {
      cc.dgame.tips.showTips("You have insufficient<br/>chips to sit down");
    } else {
      if (parseInt(cc.dgame.tableInfo.TableId) > 0xE000000000000) {
        cc.dgame.tableInfo.WantSeatId = this._ContractPos;
        cc.dgame.tableInfo.BuyinGoldType = Types.BuyinGoldType.SITDOWN;
        cc.dgame.mainMenuPopup.onBtnBuyinChipsClicked();
      } else {
        //俱乐部积分桌
        if ((cc.dgame.tableInfo.TableProps & 0x1) == 0) {
          var tabledetail_cmd = {
            TableId: cc.dgame.tableInfo.TableId
          };
          cc.dgame.net.gameCall(["tableDetail", JSON.stringify(tabledetail_cmd)], this._onTabelDetail.bind(this));
        } else {
          //俱乐部token桌
          if (parseInt(cc.dgame.settings.account.Chips) < parseInt(cc.dgame.tableInfo.BuyinMin)) {
            cc.dgame.tips.showTips("You have insufficient<br/>chips to sit down");
          } else {
            cc.dgame.tableInfo.WantSeatId = this._ContractPos;
            cc.dgame.tableInfo.BuyinGoldType = Types.BuyinGoldType.SITDOWN;
            cc.dgame.mainMenuPopup.onBtnBuyinChipsClicked();
          }
        }
      }
    }
  },
  onClickBackToPlay: function onClickBackToPlay() {
    Log.Trace("onClickBackToPlay: " + this._ContractPos);
    cc.dgame.tableInfo.WantSeatId = this._ContractPos;
    cc.dgame.tableInfo.BuyinGoldType = Types.BuyinGoldType.BACKTOPLAY;
    cc.dgame.mainMenuPopup.onBtnBuyinChipsClicked();
  },
  onBtnResitDownClicked: function onBtnResitDownClicked() {
    Log.Trace("[onBtnResitDownClicked]");
    cc.dgame.gametable.onBtnResitDownClicked();
  },
  startCountDown: function startCountDown(seconds, elapsedSecs) {
    this.emptySeatLayer.active = false; //this.countDownLayer.active = true;

    this.countDownProgressBar.node.active = true;
    this._countDownEnd = seconds;
    this._countDownTotal = (this._countDownEnd - elapsedSecs) * 10;
    this.schedule(this._countDownProc, 0.1);
  },
  stopCountDown: function stopCountDown() {
    this.unschedule(this._countDownProc); //this.countDownLayer.active = false;

    this.countDownProgressBar.node.active = false;

    this._stopActionTimeout();
  },
  _countDownProc: function _countDownProc() {
    this._countDownTotal -= 1;

    if (this._countDownTotal <= 0) {
      this.unschedule(this._countDownProc); //this.countDownLayer.active = false;

      this.countDownProgressBar.node.active = false;

      this._startActionTimeout();

      return;
    }

    this.countDownProgressBar.progress = this._countDownTotal * 0.1 / this._countDownEnd; //this.countDown.string = parseInt(this._countDownTotal * 0.1) + "s";
  },
  initPlayerInfo: function initPlayerInfo(pos, addr, nickname, stackNum, status) {
    Log.Trace("[initPlayerInfo] player " + pos + ", addr: " + addr + ", nick: " + nickname + ", stack: " + stackNum + ", status: " + status);
    this.seatNo.string = pos;
    this._Addr = addr;
    this._ContractPos = pos;
    this.disconnectMark.active = false;
    this.hideAllActions();
    this.hideDisconnectMark();
    this.hideWinloss();
    this.hideRMTWinner();
    this.hideWinlight();

    if (!this._isTableStarted) {
      this.hideDealCards();
    }

    if (addr == '') {
      this.nickName.node.opacity = 255;
      this.stackNum.node.opacity = 255;
      this.nickName.string = nickname;
      this.stackNum.value = stackNum.toString();
      this.stackNum.string = cc.dgame.utils.formatRichText(cc.dgame.utils.formatValue(stackNum), "#FFBC1D", true, false);
      this.emptySeatLayer.active = true;
      this.operateLayer.active = false;
      this.headMask.active = false;
      this.nickName.node.active = false;
      this.stackNum.node.active = false;
      this.headDisable.active = false;
      this.hideBtnBackToPlay();
      this.hideBtnResitDown();
    } else {
      //            if (this.emptySeatLayer.active) {
      var idx = parseInt(addr.substr(2, 2), 16);

      if (isNaN(idx)) {
        idx = 0;
      }

      this.avator.spriteFrame = this._assetMgr.heads[idx % 200];
      this.nickName.string = nickname;
      this.stackNum.value = stackNum.toString();
      this.stackNum.string = cc.dgame.utils.formatRichText(cc.dgame.utils.formatValue(stackNum), "#FFBC1D", true, false);
      this.emptySeatLayer.active = false;
      this.headMask.active = true;
      this.nickName.node.active = true;
      this.stackNum.node.active = true;

      if (status <= Types.ContractStatus.SEATED) {
        this.showAction(Types.PlayerOP.STANDBY);
      } else if (status > Types.ContractStatus.SEATED && status <= Types.ContractStatus.READY) {
        this.showAction(Types.PlayerOP.WAITING);
      } else if (status == Types.ContractStatus.OFFLINE || status == Types.ContractStatus.SHOWDOWNOFFLINE) {
        this.showAction(Types.PlayerOP.FOLD);
      } else {
        this.nickName.node.opacity = 255;
        this.stackNum.node.opacity = 255;
        this.headDisable.active = false;
      } // } else {
      //     Log.Trace("not an empty seat");
      // }

    }
  },
  //隐藏所有操作
  hideAllActions: function hideAllActions() {
    this.operateLayer.active = false;
    this.allinHead.active = false;
  },
  //隐藏Straddle、补Straddle、延时、看牌、下注、跟注、加注这7个操作
  hideActions: function hideActions() {
    for (var i = Types.PlayerOP.STRADDLE; i < Types.PlayerOP.ALLIN; i++) {
      this.opNodes[i].active = false;
    }
  },
  setTableStatus: function setTableStatus(status) {
    this._isTableStarted = status == 2;
  },
  //显示某个指定的操作
  showAction: function showAction(op) {
    Log.Trace("[showAction] this._ContractPos: " + this._ContractPos + ", op: " + op + ", _isTableStarted: " + this._isTableStarted);

    for (var i = 0; i < this.opNodes.length; i++) {
      this.opNodes[i].active = false;
    }

    this.opNodes[op].active = true;

    if (op == Types.PlayerOP.WAITING || op == Types.PlayerOP.STANDBY) {
      var noChips = false;

      if (!!cc.dgame.tableInfo.BlindInfo && this.getStack() < 5 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet + cc.dgame.tableInfo.BlindInfo.TotalAnteBet) {
        noChips = true;
      }

      if (this._isTableStarted || noChips) {
        this.nickName.node.opacity = 100;
        this.stackNum.node.opacity = 100;
        this.headDisable.active = true;
      } else {
        this.nickName.node.opacity = 255;
        this.stackNum.node.opacity = 255;
        this.headDisable.active = false;
      }
    }

    if (op != Types.PlayerOP.STANDBY) {
      this.hideBtnResitDown();
    }

    if (op == Types.PlayerOP.FOLD) {
      this.disable();
    }

    if (op == Types.PlayerOP.ALLIN) {
      this.setAllinHead();
    }

    this.operateLayer.active = true;
  },
  setStack: function setStack(stack) {
    this.stackNum.value = stack.toString();
    this.stackNum.node.active = true;
    this.stackNum.string = cc.dgame.utils.formatRichText(cc.dgame.utils.formatValue(stack), "#FFBC1D", true, false);
  },
  getStack: function getStack() {
    return parseFloat(this.stackNum.value);
  },
  hideStack: function hideStack() {
    this.stackNum.node.active = false;
  },
  _setBetBackground: function _setBetBackground() {
    // 计算宽
    this.betNum.overflow = cc.Label.Overflow.NONE;
    this.betNum.node.setContentSize(new cc.Size(0, 33));

    this.betNum._forceUpdateRenderData();

    var bgStack = cc.find("BetLayer/bg_stack", this.node);
    bgStack.active = true;

    if (this.betNum.node.width + 30 > 59) {
      bgStack.width = this.betNum.node.width + 20;
    } else {
      bgStack.width = 59;
    }
  },
  setBet: function setBet(bet, animate) {
    var _this = this;

    var curBet = parseFloat(this.betNum.value);
    this.betNum.value = bet.toString();
    this.betNum.string = cc.dgame.utils.formatValue(bet);

    this._setBetBackground();

    Log.Debug("player " + this._ContractPos + " curBet: " + curBet + ", setBet: " + bet);

    if (parseInt(bet) == 0) {
      this.betNum.value = "0";
      this.betNum.string = "0";

      this._setBetBackground();

      this.betLayer.active = false;
      Log.Trace("betLayer just hide");
      return;
    }

    if (!this.betLayer.active || this.betLayer.active && curBet != bet) {
      if (!animate) {
        this.betLayer.active = true;
        return;
      }

      var opacity = [80, 160, 255];

      var _loop = function _loop(i) {
        var chip = _this.betChips[i];
        chip.opacity = 0;
        chip.active = true;
        chip.scale = 1;
        chip.setPosition(0, 0);
        cc.dgame.audioMgr.playChipsToTable();
        var src = chip.getPosition();

        var dst = _this.betLayer.getPosition();

        if (i != _this.betChips.length - 1) {
          Log.Trace("player " + _this._ContractPos + " chip " + i + " move from (" + src.x + ", " + src.y + ") to (" + dst.x + ", " + dst.y + ")");
          chip.runAction(cc.sequence(cc.delayTime(0.05 * i), cc.spawn(cc.fadeTo(0.2, opacity[i]), cc.moveTo(0.2, _this.betLayer.getPosition())), cc.callFunc(function () {
            chip.active = false;
          }, _this)));
        } else {
          Log.Trace("player " + _this._ContractPos + " chip " + i + " move from (" + src.x + ", " + src.y + ") to (" + dst.x + ", " + dst.y + ") end");
          chip.runAction(cc.sequence(cc.delayTime(0.05 * i), cc.spawn(cc.fadeTo(0.2, opacity[i]), cc.moveTo(0.2, _this.betLayer.getPosition())), cc.callFunc(function () {
            chip.active = false;
            this.betLayer.active = true;
          }, _this)));
        }
      };

      for (var i = 0; i < this.betChips.length; i++) {
        _loop(i);
      }
    }
  },
  setReplayBet: function setReplayBet(bet) {
    var curBet = parseFloat(this.replayBetNum.string);
    this.replayBetNum.string = bet; //Log.Debug("player " + this._ContractPos + " curBet: " + curBet + ", setBet: " + bet);

    if (parseInt(bet) == 0) {
      this.replayBetNum.string = "0";
      this.replayBetLayer.active = false; //Log.Trace("betLayer just hide");

      return;
    }

    this.replayBetLayer.active = true;
  },
  getBet: function getBet() {
    return parseFloat(this.betNum.value);
  },
  //筹码推到底池
  chipsToPot: function chipsToPot() {
    Log.Trace("this.betLayer.active: " + this.betLayer.active + ", getBet: " + this.getBet());

    if (!this.betLayer.active) {
      return 0;
    }

    var lastBet = this.getBet();
    this.setBet(0);
    var potPos = cc.find("Canvas/PotLayer").convertToWorldSpaceAR(cc.v2(0, 0));

    this._chipPlayerToDest(potPos, 1);

    return parseFloat(lastBet);
  },
  //保险未击中，你付钱给保险
  playerPayToInsurance: function playerPayToInsurance(insurancePos, speed) {
    this._chipPlayerToDest(insurancePos, speed);
  },
  //播放筹码从玩家位置推到目标位置动画
  _chipPlayerToDest: function _chipPlayerToDest(destPos, speed) {
    var _this2 = this;

    var dstv2 = this.betChips[0].parent.convertToNodeSpaceAR(destPos);
    Log.Trace("[chipsToPot] destPos: (" + destPos.x + ", " + destPos.y + "), dstv2: (" + dstv2.x + ", " + dstv2.y + ")");
    var opacity = [80, 160, 255];

    var _loop2 = function _loop2(i) {
      var bchip = _this2.betChips[i];
      bchip.stopAllActions();
      bchip.active = true;
      bchip.scale = 1;
      bchip.opacity = 0;
      bchip.setPosition(_this2.betLayer.getPosition());
      bchip.scale = 0.6;
      bchip.runAction(cc.sequence(cc.delayTime(0.05 * i), cc.spawn(cc.fadeTo(0.2, opacity[i]), cc.scaleTo(0.2, 1, 1), cc.moveTo(0.2, dstv2)), cc.delayTime(0.05), cc.callFunc(function () {
        bchip.active = false;
        var endpos = bchip.getPosition();
        Log.Trace("[chipsToPot] chip " + i + " end pos: (" + endpos.x + ", " + endpos.y + ")");
      }, _this2)).speed(speed));
    };

    for (var i = 0; i < this.betChips.length; i++) {
      _loop2(i);
    }
  },
  //赢得底池筹码动画
  winPot: function winPot(potPos, speed) {
    this._chipSrcToPlayer(potPos, speed);
  },
  //保险击中，保险赔钱给你
  insurancePayToPlayer: function insurancePayToPlayer(insurancePos, speed) {
    this._chipSrcToPlayer(insurancePos, speed);
  },
  //播放筹码从源位置推到玩家位置动画
  _chipSrcToPlayer: function _chipSrcToPlayer(srcPos, speed) {
    var _this3 = this;

    var srcv2 = this.betChips[0].parent.convertToNodeSpaceAR(srcPos);
    Log.Trace("[winPot] player " + this._ContractPos + ", srcPos: (" + srcPos.x + ", " + srcPos.y + "), srcv2: (" + srcv2.x + ", " + srcv2.y + ")");
    var dstarr = new Array();

    while (true) {
      //随机生成出现的位置，x轴在左右10像素，y轴在上下75像素，且三个点至少两个点y轴坐标差大于100
      for (var i = 0; i < this.betChips.length; i++) {
        var x = parseInt(Math.random() * 20) - 10;
        var y = parseInt(Math.random() * 160) - 80;
        dstarr.push(cc.v2(srcv2.x + x, srcv2.y + y));
      } //Log.Trace("[winPot] " + JSON.stringify(dstarr));


      if (!(Math.abs(dstarr[0].y - dstarr[1].y) < 100 && Math.abs(dstarr[1].y - dstarr[2].y) < 100 && Math.abs(dstarr[0].y - dstarr[2].y) < 100)) {
        break;
      }

      dstarr = new Array();
    }

    Log.Trace("[winPot] " + JSON.stringify(dstarr));

    var _loop3 = function _loop3(_i) {
      var bchip = _this3.betChips[_i];
      bchip.stopAllActions();
      bchip.active = true;
      bchip.scale = 1;
      bchip.setPosition(srcv2);
      bchip.scale = 0.2;
      bchip.opacity = 0;

      if (_i % 2 == 0) {
        bchip.runAction(cc.sequence(cc.delayTime(0.05 * _i), cc.spawn(cc.fadeIn(0.3), cc.scaleTo(0.3, 1, 1), cc.moveTo(0.3, dstarr[_i])), cc.delayTime(0.05), cc.moveTo(0.3, cc.v2(0, 0)), cc.delayTime(0.05), cc.callFunc(function () {
          this.headLayer.runAction(cc.sequence(cc.scaleTo(0.025, 1.1, 1.1), cc.scaleTo(0.025, 1, 1))); //let endpos = bchip.getPosition();
          //Log.Trace("[winPot] chip " + i + " end pos: (" + endpos.x + ", " + endpos.y + ")");

          bchip.active = false;
        }, _this3)).speed(speed));
      } else {
        bchip.runAction(cc.sequence(cc.delayTime(0.05 * _i), cc.spawn(cc.fadeIn(0.3), cc.scaleTo(0.3, 1, 1), cc.moveTo(0.3, dstarr[_i])), cc.delayTime(0.05), cc.moveTo(0.3, cc.v2(0, 0)), cc.delayTime(0.05), cc.callFunc(function () {
          //let endpos = bchip.getPosition();
          //Log.Trace("[winPot] chip " + i + " end pos: (" + endpos.x + ", " + endpos.y + ")");
          bchip.active = false;
        }, _this3)).speed(speed));
      }
    };

    for (var _i = 0; _i < this.betChips.length; _i++) {
      _loop3(_i);
    }
  },
  hideBet: function hideBet() {
    Log.Trace("hideBet");
    this.betLayer.active = false;
  },
  getDealerMarkPos: function getDealerMarkPos() {
    return this.dealerMark.convertToWorldSpaceAR(cc.v2(0, 0));
  },
  setDealerMark: function setDealerMark() {
    this.dealerMark.active = true;
  },
  hideDealerMark: function hideDealerMark() {
    this.dealerMark.active = false;
  },
  setDisconnectMark: function setDisconnectMark() {
    this.disconnectMark.active = true;
  },
  hideDisconnectMark: function hideDisconnectMark() {
    this.disconnectMark.active = false;
  },
  setFreeRaise: function setFreeRaise() {
    this.headLayer.active = false;
  },
  hideFreeRaise: function hideFreeRaise() {
    this.headLayer.active = true;
  },
  setWinloss: function setWinloss(winloss) {
    var symbol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '+';
    // this.nickName.node.active = false;
    this._winLoss = winloss;
    var richtextWinloss = cc.find("winLoss", this.winlossCardtype[this._winlossCardtype]).getComponent(cc.RichText);
    richtextWinloss.string = cc.dgame.utils.formatRichText(symbol + cc.dgame.utils.formatValue(winloss), "#ffffff", true, false);

    this._showWinlossCardtype(); //this.winLoss.node.active = true;

  },
  hideWinloss: function hideWinloss() {
    //this.winLoss.node.active = false;
    //this.nickName.node.active = true;
    this._winloss = null;
    this.winlossCardtype[this._winlossCardtype].active = false;
  },
  setCardType: function setCardType(cardtype) {
    this._cardType = cardtype; //this.stackNum.node.active = false;
    //this.cardType.node.active = true;

    var bgCardtype = cc.find("bg_cardtype", this.winlossCardtype[this._winlossCardtype]);
    bgCardtype.active = true;
    var richtextCardtype = cc.find("bg_cardtype/richtext", this.winlossCardtype[this._winlossCardtype]).getComponent(cc.RichText);
    richtextCardtype.string = cc.dgame.utils.formatRichText(cardtype, "#553C00", true, false);
  },
  hideCardType: function hideCardType() {
    //this.cardType.node.active = false;
    //this.stackNum.node.active = true;
    this._cardType = null;
    var bgCardtype = cc.find("bg_cardtype", this.winlossCardtype[this._winlossCardtype]);
    bgCardtype.active = false;
  },
  _showWinlossCardtype: function _showWinlossCardtype() {
    this.winlossCardtype[this._winlossCardtype].active = true; //获取牌型文字宽度，调整牌型背景宽度

    var richtextCardtype = cc.find("bg_cardtype/richtext", this.winlossCardtype[this._winlossCardtype]).getComponent(cc.RichText);
    var bgCardtype = cc.find("bg_cardtype", this.winlossCardtype[this._winlossCardtype]);
    bgCardtype.width = richtextCardtype.node.width + 60;

    this.winlossCardtype[this._winlossCardtype].getComponent(cc.Layout).updateLayout();

    if (bgCardtype.active && this._winlossCardtype != 2) {
      //获取牌型文字与头像中心点的世界坐标，设置牌型文字中心与头像中心对齐
      var cardtypepos = richtextCardtype.node.convertToWorldSpaceAR(cc.v2(0, 0));
      var headpos = this.headLayer.convertToWorldSpaceAR(cc.v2(0, 0));

      var winlosspos = this.winlossCardtype[this._winlossCardtype].getPosition();

      winlosspos.x = -(cardtypepos.x - headpos.x);

      this.winlossCardtype[this._winlossCardtype].setPosition(winlosspos);
    }
  },
  //在昵称上显示winner字样
  showRMTWinner: function showRMTWinner() {
    this.RMTWinner.active = true;
  },
  hideRMTWinner: function hideRMTWinner() {
    this.RMTWinner.active = false;
  },
  highlightHoleCards: function highlightHoleCards(genCards) {
    var genCardsPTArr = new Array();

    for (var i = 0; i < genCards.length; i++) {
      genCardsPTArr.push(cc.dgame.utils.getCard(genCards[i]));
    }

    for (var _i2 = 0; _i2 < this.cardAnchors.length; _i2++) {
      var poker = this.cardAnchors[_i2].getChildren()[0].getComponent("Poker");

      if (genCardsPTArr.indexOf(poker.getCardPoint()) == -1) {
        poker.disable();
      } else {
        poker.enable();
      }
    }
  },
  restoreHoleCards: function restoreHoleCards() {
    for (var i = 0; i < this.cardAnchors.length; i++) {
      var poker = this.cardAnchors[i].getChildren()[0].getComponent("Poker");
      poker.enable();
    }
  },
  //需要在showAction之后调用
  setAllinHead: function setAllinHead() {
    Log.Trace("[setAllinHead] this.allinHead.active: " + this.allinHead.active);
    this.allinHead.active = true;
  },
  hideAllinHead: function hideAllinHead() {
    Log.Trace("[hideAllinHead] this.allinHead.active: " + this.allinHead.active);
    this.allinHead.active = false;
  },
  showINSFlag: function showINSFlag(amount, bReplay) {
    Log.Trace("[showINSFlag] this.InsuranceLayer.y " + this.InsuranceLayer.y + ", this.operateLayer.y " + this.operateLayer.y);
    this.InsuranceLayer.active = false;
    var insNum = cc.find("insurance_num", this.InsuranceLayer).getComponent(cc.RichText);
    insNum.string = cc.dgame.utils.formatRichText("Insurance " + amount, "#553c00", true, false);
    var bgINS = cc.find("InsuranceLayer/insurance_sprte", this.node);
    bgINS.width = insNum.node.width + 60;

    if (!bReplay && cc.dgame.tableInfo.SeatId == this._ContractPos) {
      this.InsuranceLayer.y = 307;
      Log.Trace("[showINSFlag] this.InsuranceLayer.y2 " + this.InsuranceLayer.y);
    }

    this.InsuranceLayer.active = true;
  },
  hideINSFlag: function hideINSFlag() {
    this.InsuranceLayer.active = false;
  },
  setWinlight: function setWinlight() {
    this.winlight.active = true;
    this.winlight.runAction(cc.repeatForever(cc.rotateBy(4, -360)));
  },
  hideWinlight: function hideWinlight() {
    this.winlight.stopAllActions();
    this.winlight.active = false;
  },
  //恢复发牌，两张牌
  recoverDealCards: function recoverDealCards() {
    for (var i = 0; i < this.cardAnchors.length; i++) {
      var poker = this.cardAnchors[i].getChildren()[0].getComponent("Poker");
      var dstv2 = this.dealHoleCards[i].convertToWorldSpaceAR(cc.v2(0, 0));
      this.cardAnchors[i].active = true;
      Log.Trace("[recoverDealCards] player " + this._ContractPos + ", dst: (" + dstv2.x + ", " + dstv2.y + ")");
      poker.recoverDealCard(dstv2, this.dealHoleCards[i].eulerAngles.z, this.dealHoleCards[i].scale, false);
    }
  },
  //发牌，两张牌的间隔时间，起始位置和scale
  dealCards: function dealCards(interval1, interval2, srcv2, scale) {
    var _this4 = this;

    var intervalarr = new Array();
    intervalarr.push(interval1);
    intervalarr.push(interval2);

    var _loop4 = function _loop4(i) {
      var poker = _this4.cardAnchors[i].getChildren()[0].getComponent("Poker");

      var dstv2 = _this4.dealHoleCards[i].convertToWorldSpaceAR(cc.v2(0, 0));

      _this4.scheduleOnce(function () {
        this.cardAnchors[i].active = true;
        Log.Trace("[dealCards] player " + this._ContractPos + ", src: (" + srcv2.x + ", " + srcv2.y + "), dst: (" + dstv2.x + ", " + dstv2.y + ")");
        poker.dealCard(srcv2, dstv2, this.dealHoleCards[i].eulerAngles.z, scale, this.dealHoleCards[i].scale);
      }, intervalarr[i]);
    };

    for (var i = 0; i < this.cardAnchors.length; i++) {
      _loop4(i);
    }
  },
  //玩家自身发牌，两张牌的间隔时间，起始位置、目标位置和scale
  dealCardsPlayerMyself: function dealCardsPlayerMyself(interval1, interval2, srcv2, dstv2_1, dstv2_2, srcScale, dstScale) {
    var _this5 = this;

    var intervalarr = new Array();
    intervalarr.push(interval1);
    intervalarr.push(interval2);
    var dstarr = new Array();
    dstarr.push(dstv2_1);
    dstarr.push(dstv2_2);

    var _loop5 = function _loop5(i) {
      var poker = _this5.cardAnchors[i].getChildren()[0].getComponent("Poker");

      _this5.scheduleOnce(function () {
        this.cardAnchors[i].active = true;
        Log.Trace("[dealCardsPlayerMyself] player " + this._ContractPos + ", src: (" + srcv2.x + ", " + srcv2.y + "), dst: (" + dstarr[i].x + ", " + dstarr[i].y + ")");
        poker.dealCard(srcv2, dstarr[i], 0, srcScale, dstScale);
      }, intervalarr[i]);
    };

    for (var i = 0; i < this.cardAnchors.length; i++) {
      _loop5(i);
    }
  },
  //摊牌，两张牌的牌点，
  revealHoleCards: function revealHoleCards(cardpoint1, cardpoint2) {
    if (this._revealHoleCard) {
      return;
    }

    this._revealHoleCard = true;
    var pointsArr = new Array();
    pointsArr.push(cardpoint1);
    pointsArr.push(cardpoint2);

    for (var i = 0; i < this.cardAnchors.length; i++) {
      var poker = this.cardAnchors[i].getChildren()[0].getComponent("Poker");
      var dstv2 = this.holeCards[i].convertToWorldSpaceAR(cc.v2(0, 0));
      poker.setCardPoint(pointsArr[i]);
      Log.Trace("[revealHoleCards] player " + this._ContractPos + ", dst: (" + dstv2.x + ", " + dstv2.y + "), scale: " + this.holeCards[i].scale);
      poker.flipCard(dstv2, this.holeCards[i].scale);
      this.cardAnchors[i].active = true;
    }
  },
  //弃牌，两张牌的终点位置，起始角度和起始scale
  foldCards: function foldCards(srcv2_1, srcv2_2, dstv2, srcAngle, scale) {
    var srcarr = new Array();
    srcarr.push(srcv2_1);
    srcarr.push(srcv2_2);
    cc.dgame.audioMgr.playFoldCard();

    for (var i = 0; i < this.cardAnchors.length; i++) {
      var poker = this.cardAnchors[i].getChildren()[0].getComponent("Poker");
      poker.foldCard(srcarr[i], dstv2, srcAngle, scale, 0.2);
      this.cardAnchors[i].active = true;
    }
  },
  //隐藏动画牌
  hideDealCards: function hideDealCards() {
    for (var i = 0; i < this.cardAnchors.length; i++) {
      var poker = this.cardAnchors[i].getChildren()[0].getComponent("Poker");
      poker.enable();
      poker.setFaceUp(false);
      this.cardAnchors[i].active = false;
    }

    this._revealHoleCard = false;
  },
  //弃牌时调用
  disable: function disable() {
    this.nickName.node.opacity = 100;
    this.stackNum.node.opacity = 100;
    this.headDisable.active = true;

    if (this.emptySeatLayer.active) {
      this.emptySeatLayer.getComponent(cc.Button).interactable = false;
    }
  },
  //牌局开始时调用
  enable: function enable() {
    this.nickName.node.opacity = 255;
    this.stackNum.node.opacity = 255;
    this.headDisable.active = false;
    this.disconnectMark.active = false;
    this.hideAllinHead();

    if (this.emptySeatLayer.active) {
      this.emptySeatLayer.getComponent(cc.Button).interactable = true;
    }
  },
  //显示返回牌桌按钮
  showBtnBackToPlay: function showBtnBackToPlay() {
    Log.Trace("[showBtnBackToPlay] this.btnBackToPlay.active: " + this.btnBackToPlay.active);
    this.btnBackToPlay.active = true;
  },
  //隐藏返回牌桌按钮
  hideBtnBackToPlay: function hideBtnBackToPlay() {
    Log.Trace("[hideBtnBackToPlay] this.btnBackToPlay.active: " + this.btnBackToPlay.active);
    this.btnBackToPlay.active = false;
  },
  //显示返回牌桌按钮
  showBtnResitDown: function showBtnResitDown() {
    Log.Trace("[showBtnResitDown] this.btnResitDown.active: " + this.btnResitDown.active);

    if (this.btnBackToPlay.active == true) {
      Log.Trace("[showBtnResitDown] this.btnBackToPlay.active == true,not show");
      return;
    }

    this.btnResitDown.active = true;
  },
  //隐藏返回牌桌按钮
  hideBtnResitDown: function hideBtnResitDown() {
    Log.Trace("[hideBtnResitDown] this.btnResitDown.active: " + this.btnResitDown.active);
    this.btnResitDown.active = false;
  },
  startAutoCheckoutCountDown: function startAutoCheckoutCountDown(seconds) {
    Log.Trace("[startAutoCheckoutCountDown] this.autoCheckoutCountDownLayer.active: " + this.autoCheckoutCountDownLayer.active);
    this.emptySeatLayer.active = false;
    this.autoCheckoutCountDownLayer.active = true;
    this._countDownEnd = seconds;
    this._countDownTotal = this._countDownEnd * 10;
    this.schedule(this._countAutoCheckoutDownProc, 0.1);
  },
  stopAutoCheckoutCountDown: function stopAutoCheckoutCountDown() {
    Log.Trace("[stopAutoCheckoutCountDown] this.autoCheckoutCountDownLayer.active: " + this.autoCheckoutCountDownLayer.active);
    this.unschedule(this._countAutoCheckoutDownProc);
    this.autoCheckoutCountDownLayer.active = false;
  },
  _countAutoCheckoutDownProc: function _countAutoCheckoutDownProc() {
    this._countDownTotal -= 1;

    if (this._countDownTotal <= 0) {
      this.stopAutoCheckoutCountDown();

      if (cc.dgame.tableInfo.SeatId == this._ContractPos) {
        cc.dgame.mainMenuPopup.onBtnExitClicked();
      }

      return;
    }

    this.autoCheckoutCountDown.string = parseInt(this._countDownTotal * 0.1) + "s";
  },
  _startActionTimeout: function _startActionTimeout() {
    this.actionTimeout.active = true;
    this.actionTimeout.runAction(cc.repeatForever(cc.blink(3, 3)));
  },
  _stopActionTimeout: function _stopActionTimeout() {
    this.actionTimeout.stopAllActions();
    this.actionTimeout.active = false;
  } // update (dt) {},

});

cc._RF.pop();