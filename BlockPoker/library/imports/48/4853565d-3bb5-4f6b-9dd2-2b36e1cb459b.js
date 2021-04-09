"use strict";
cc._RF.push(module, '48535ZdO7VPa53SKzbhy0Wb', 'MainMenuPopup');
// scripts/components/MainMenuPopup.js

"use strict";

var Log = require("Log");

var Types = require('Types');

cc.Class({
  "extends": cc.Component,
  properties: {
    _mainMenuPopup: cc.Node,
    _buyinChipsDialog: cc.Node,
    //带入金币对话框
    _insurancePopup: cc.Node,
    //保险说明对话框
    _checkoutExitToast: cc.Node,
    //结算离桌提示框
    _buyinChipsMin: cc.Label,
    _buyinChipsMax: cc.Label,
    _buyinChipsNum: cc.Label,
    _walletChipsNum: cc.Label,
    _buyinChipsSlider: cc.Slider,
    _buyinChipsProgressbar: cc.ProgressBar
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    if (!cc.dgame) {
      return;
    }

    this._mainMenuPopup = cc.find("Canvas/MenuLayer/LeftTopMemuLayer/MainMenuPopup");
    this._buyinChipsDialog = cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BuyinChipsPopup");
    this._insurancePopup = cc.find("Canvas/MenuLayer/LeftTopMemuLayer/InsurancePopup");
    this._checkoutExitToast = cc.find("Canvas/MenuLayer/LeftTopMemuLayer/CheckoutExitToast");
    this._buyinChipsMin = cc.find('main_shaixuanbg/buyinChipsSlider/buyinChipsMin', this._buyinChipsDialog).getComponent(cc.Label);
    this._buyinChipsMax = cc.find('main_shaixuanbg/buyinChipsSlider/buyinChipsMax', this._buyinChipsDialog).getComponent(cc.Label);
    this._buyinChipsNum = cc.find('main_shaixuanbg/buyinChipsSlider/Handle/bg_buyin_tips/buyinChipsNum', this._buyinChipsDialog).getComponent(cc.Label);
    this._walletChipsNum = cc.find('main_shaixuanbg/layout/totalChipsNum', this._buyinChipsDialog).getComponent(cc.Label);
    this._buyinChipsSlider = cc.find('main_shaixuanbg/buyinChipsSlider', this._buyinChipsDialog).getComponent(cc.Slider);
    this._buyinChipsProgressbar = cc.find('main_shaixuanbg/buyinChipsSlider', this._buyinChipsDialog).getComponent(cc.ProgressBar);
    cc.dgame.utils.addClickEvent(cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BtnMainMenu"), this.node, "MainMenuPopup", "onBtnMainMenuClicked"); //弹出主菜单

    cc.dgame.utils.addClickEvent(cc.find("Canvas/MenuLayer/LeftTopMemuLayer/MainMenuPopup/sprite_splash"), this.node, "MainMenuPopup", "onBtnCloseMainMenuClicked"); //关闭主菜单

    cc.dgame.utils.addClickEvent(cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BuyinChipsPopup/sprite_splash"), this.node, "MainMenuPopup", "onBtnCloseBuyinChipsPopupClicked"); //关闭带入金币对话框

    cc.dgame.utils.addClickEvent(cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BuyinChipsPopup/main_shaixuanbg/bg_club_popup_close"), this.node, "MainMenuPopup", "onBtnCloseBuyinChipsPopupClicked"); //关闭带入金币对话框

    cc.dgame.utils.addClickEvent(cc.find("Canvas/MenuLayer/LeftTopMemuLayer/InsurancePopup/toast_bg/bg_club_popup_close"), this.node, "MainMenuPopup", "onBtnCloseInsurancePopupClicked"); //关闭保险说明对话框

    cc.dgame.utils.addClickEvent(cc.find("main_shaixuanbg/buydataButton", this._buyinChipsDialog), this.node, "MainMenuPopup", "onBtnBuyinChipsConfirmClicked"); //带入金币确认按钮

    cc.dgame.utils.addClickEvent(cc.find("bg_recharge/BuyinGold", this._mainMenuPopup), this.node, "MainMenuPopup", "onBtnBuyinChipsClicked"); //带入金币按钮

    cc.dgame.utils.addClickEvent(cc.find("bg_recharge/Insurance", this._mainMenuPopup), this.node, "MainMenuPopup", "onBtnInsuranceClicked"); //保险赔率与说明按钮

    cc.dgame.utils.addClickEvent(cc.find("bg_recharge/CheckoutExit", this._mainMenuPopup), this.node, "MainMenuPopup", "onBtnCheckoutExitClicked"); //站起按钮

    cc.dgame.utils.addClickEvent(cc.find("bg_recharge/Exit", this._mainMenuPopup), this.node, "MainMenuPopup", "onBtnExitClicked"); //退出按钮

    this._buyinChipsSlider.node.on('slide', function (event) {
      var buyinChipsMinVal = cc.dgame.utils.getOriginValue(this._buyinChipsMin);
      var buyinChipsMaxVal = cc.dgame.utils.getOriginValue(this._buyinChipsMax);

      if ((buyinChipsMaxVal - buyinChipsMinVal) % 3 == 0) {
        this._buyinChipsSlider.progress = parseInt(this._buyinChipsSlider.progress * 30) / 30;
      } else {
        this._buyinChipsSlider.progress = parseInt(this._buyinChipsSlider.progress * 20) / 20;
      }

      var buyNum = buyinChipsMinVal + Math.round(this._buyinChipsSlider.progress * (buyinChipsMaxVal - buyinChipsMinVal)); //系统创建token桌或俱乐部token桌

      if (cc.dgame.settings.account.Chips < cc.dgame.utils.getOriginValue(this._buyinChipsNum) && (cc.dgame.tableInfo.TableId < 0xF000000000000 && cc.dgame.tableInfo.TableId > 0xE000000000000 || cc.dgame.tableInfo.TableId < 0xE000000000000 && (cc.dgame.tableInfo.TableProps & 0x1) == 1)) {
        buyNum = cc.dgame.settings.account.Chips;
      }

      cc.dgame.utils.setOriginValue(this._buyinChipsNum, buyNum, "none");
      var buyinChipsNumVal = cc.dgame.utils.getOriginValue(this._buyinChipsNum);
      this._buyinChipsSlider.progress = (buyinChipsNumVal - buyinChipsMinVal) / (buyinChipsMaxVal - buyinChipsMinVal);
      cc.dgame.tableInfo.BuyinChips = buyinChipsNumVal;
      this._buyinChipsProgressbar.progress = this._buyinChipsSlider.progress;
    }, this);

    this._insuranceOdds = new Array();

    this._insuranceOdds.push(cc.find("toast_bg/scrollview/view/content/InsuranceOdds/layout/outs1-8/odds1/label", this._insurancePopup).getComponent(cc.Label));

    this._insuranceOdds.push(cc.find("toast_bg/scrollview/view/content/InsuranceOdds/layout/outs2-9/odds2/label", this._insurancePopup).getComponent(cc.Label));

    this._insuranceOdds.push(cc.find("toast_bg/scrollview/view/content/InsuranceOdds/layout/outs3-10/odds3/label", this._insurancePopup).getComponent(cc.Label));

    this._insuranceOdds.push(cc.find("toast_bg/scrollview/view/content/InsuranceOdds/layout/outs4-11/odds4/label", this._insurancePopup).getComponent(cc.Label));

    this._insuranceOdds.push(cc.find("toast_bg/scrollview/view/content/InsuranceOdds/layout/outs5-12/odds5/label", this._insurancePopup).getComponent(cc.Label));

    this._insuranceOdds.push(cc.find("toast_bg/scrollview/view/content/InsuranceOdds/layout/outs6-13/odds6/label", this._insurancePopup).getComponent(cc.Label));

    this._insuranceOdds.push(cc.find("toast_bg/scrollview/view/content/InsuranceOdds/layout/outs7-14/odds7/label", this._insurancePopup).getComponent(cc.Label));

    this._insuranceOdds.push(cc.find("toast_bg/scrollview/view/content/InsuranceOdds/layout/outs1-8/odds8/label", this._insurancePopup).getComponent(cc.Label));

    this._insuranceOdds.push(cc.find("toast_bg/scrollview/view/content/InsuranceOdds/layout/outs2-9/odds9/label", this._insurancePopup).getComponent(cc.Label));

    this._insuranceOdds.push(cc.find("toast_bg/scrollview/view/content/InsuranceOdds/layout/outs3-10/odds10/label", this._insurancePopup).getComponent(cc.Label));

    this._insuranceOdds.push(cc.find("toast_bg/scrollview/view/content/InsuranceOdds/layout/outs4-11/odds11/label", this._insurancePopup).getComponent(cc.Label));

    this._insuranceOdds.push(cc.find("toast_bg/scrollview/view/content/InsuranceOdds/layout/outs5-12/odds12/label", this._insurancePopup).getComponent(cc.Label));

    this._insuranceOdds.push(cc.find("toast_bg/scrollview/view/content/InsuranceOdds/layout/outs6-13/odds13/label", this._insurancePopup).getComponent(cc.Label));

    this._insuranceOdds.push(cc.find("toast_bg/scrollview/view/content/InsuranceOdds/layout/outs7-14/odds14/label", this._insurancePopup).getComponent(cc.Label));

    cc.dgame.mainMenuPopup = this;
  },
  start: function start() {},
  onDestroy: function onDestroy() {
    if (!!cc.dgame) {
      cc.dgame.mainMenuPopup = null;
    }
  },
  onBtnMainMenuClicked: function onBtnMainMenuClicked() {
    if (cc.dgame.tableInfo.TableProps & 1 << 2 || cc.dgame.tableInfo.TableProps & 1 << 3) {
      cc.find("bg_recharge/Insurance", this._mainMenuPopup).active = true;
      cc.find("bg_recharge/CheckoutExit/sprite_splash", this._mainMenuPopup).active = false;
      cc.find("bg_recharge/Exit/sprite_splash", this._mainMenuPopup).active = true;
    } else {
      cc.find("bg_recharge/Insurance", this._mainMenuPopup).active = false;
      cc.find("bg_recharge/CheckoutExit/sprite_splash", this._mainMenuPopup).active = true;
      cc.find("bg_recharge/Exit/sprite_splash", this._mainMenuPopup).active = false;
    }

    this._mainMenuPopup.active = true;
  },
  onBtnCloseMainMenuClicked: function onBtnCloseMainMenuClicked() {
    this._mainMenuPopup.active = false;
  },
  onBtnBuyinChipsClicked: function onBtnBuyinChipsClicked() {
    Log.Trace('[onBtnBuyinChipsClicked] ' + JSON.stringify(cc.dgame.tableInfo));
    this._mainMenuPopup.active = false;
    this._buyinChipsDialog.active = true;
    cc.dgame.utils.setOriginValue(this._buyinChipsMin, cc.dgame.tableInfo.BuyinMin, "none");
    cc.dgame.utils.setOriginValue(this._buyinChipsMax, cc.dgame.tableInfo.BuyinMax, "none");
    this._walletChipsNum.string = cc.dgame.utils.formatValue(cc.dgame.settings.account.Chips);

    if (cc.dgame.tableInfo.TableId < 0xE000000000000 && (cc.dgame.tableInfo.TableProps & 0x1) == 0) {
      //俱乐部积分桌不显示
      cc.find("main_shaixuanbg/layout", this._buyinChipsDialog).active = false;
    }

    var buyinChipsMinVal = cc.dgame.utils.getOriginValue(this._buyinChipsMin);
    var buyinChipsMaxVal = cc.dgame.utils.getOriginValue(this._buyinChipsMax);
    var buyNum = buyinChipsMaxVal / 2;

    if (parseInt(buyNum) < parseInt(cc.dgame.tableInfo.BuyinMin)) {
      buyNum = parseInt(cc.dgame.tableInfo.BuyinMin) + (parseInt(cc.dgame.tableInfo.BuyinMax) - parseInt(cc.dgame.tableInfo.BuyinMin)) / 2;
    }

    cc.dgame.utils.setOriginValue(this._buyinChipsNum, buyNum, "none"); //系统创建token桌或俱乐部token桌

    if (cc.dgame.settings.account.Chips < cc.dgame.utils.getOriginValue(this._buyinChipsNum) && (cc.dgame.tableInfo.TableId < 0xF000000000000 && cc.dgame.tableInfo.TableId > 0xE000000000000 || cc.dgame.tableInfo.TableId < 0xE000000000000 && (cc.dgame.tableInfo.TableProps & 0x1) == 1)) {
      buyNum = cc.dgame.settings.account.Chips;
    }

    cc.dgame.utils.setOriginValue(this._buyinChipsNum, buyNum, "none");
    var buyinChipsNumVal = cc.dgame.utils.getOriginValue(this._buyinChipsNum);
    this._buyinChipsSlider.progress = (buyinChipsNumVal - buyinChipsMinVal) / (buyinChipsMaxVal - buyinChipsMinVal);
    cc.dgame.tableInfo.BuyinChips = buyinChipsNumVal;
    this._buyinChipsProgressbar.progress = this._buyinChipsSlider.progress;
  },
  onBtnCloseBuyinChipsPopupClicked: function onBtnCloseBuyinChipsPopupClicked() {
    this._buyinChipsDialog.active = false;
  },
  onBtnBuyinChipsConfirmClicked: function onBtnBuyinChipsConfirmClicked() {
    this._buyinChipsDialog.active = false;
    cc.dgame.gametable.onBtnBuyinChipsConfirmClicked();
  },
  onBtnCloseInsurancePopupClicked: function onBtnCloseInsurancePopupClicked() {
    this._insurancePopup.active = false;
  },
  onBtnInsuranceClicked: function onBtnInsuranceClicked() {
    for (var i = 0; i < cc.dgame.tableInfo.InsuranceOdds.length && i < this._insuranceOdds.length; i++) {
      this._insuranceOdds[i].string = cc.dgame.tableInfo.InsuranceOdds[i];
    }

    this._insurancePopup.active = true;
  },
  onBtnCheckoutExitClicked: function onBtnCheckoutExitClicked() {
    this._mainMenuPopup.active = false;
    cc.dgame.gametable.onClickConfirmCheckoutExit();
  },
  onBtnExitClicked: function onBtnExitClicked() {
    this._mainMenuPopup.active = false;
    cc.dgame.gametable.onClickExitTableItem();
  },
  disableCheckoutExit: function disableCheckoutExit() {
    var checkoutExitTable = cc.find("bg_recharge/CheckoutExit", this._mainMenuPopup).getComponent(cc.Button);
    checkoutExitTable.interactable = false;
    cc.find("bg_recharge/CheckoutExit/checkout", this._mainMenuPopup).opacity = checkoutExitTable.interactable ? 255 : 100;
  },
  // update (dt) {},
  updateStatus: function updateStatus() {
    var buyinGold = cc.find("bg_recharge/BuyinGold", this._mainMenuPopup).getComponent(cc.Button);
    var checkoutExitTable = cc.find("bg_recharge/CheckoutExit", this._mainMenuPopup).getComponent(cc.Button);
    var exitTable = cc.find("bg_recharge/Exit", this._mainMenuPopup).getComponent(cc.Button);
    Log.Trace("[updateMenuStatus] cc.dgame.tableInfo.ContractStatus = " + cc.dgame.tableInfo.ContractStatus);

    if (cc.dgame.tableInfo.ContractStatus >= Types.ContractStatus.PLAYING) {
      buyinGold.interactable = true;
      exitTable.interactable = false;
      checkoutExitTable.interactable = true;

      if (!!this.playerMyself) {
        var player = this.playerMyself.getComponent('Player');

        if (player.getStack() < cc.dgame.tableInfo.buyinGoldMin) {//withDrawGold.interactable = false;
        }
      }
    } else {
      buyinGold.interactable = false;
      exitTable.interactable = true;
      checkoutExitTable.interactable = false;

      if (!!this.playerMyself) {
        var _player = this.playerMyself.getComponent('Player');

        if (_player.getStack() < 5 * cc.dgame.tableInfo.BlindInfo.SmallBlindBet + cc.dgame.tableInfo.BlindInfo.TotalAnteBet) {
          buyinGold.interactable = true;
          cc.dgame.tableInfo.SelfReady = false;
        }
      }
    }

    cc.find("bg_recharge/BuyinGold/buyinGold", this._mainMenuPopup).opacity = buyinGold.interactable ? 255 : 100;
    cc.find("bg_recharge/CheckoutExit/checkout", this._mainMenuPopup).opacity = checkoutExitTable.interactable ? 255 : 100;
    cc.find("bg_recharge/Exit/exit", this._mainMenuPopup).opacity = exitTable.interactable ? 255 : 100;
  },
  enable: function enable() {
    var btnMainMenu = cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BtnMainMenu");
    var btnGameReview = cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BtnGameReview");
    var btnClubResults = cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BtnClubResults");

    if (!!btnMainMenu) {
      btnMainMenu.getComponent(cc.Button).interactable = true;
    }

    if (!!btnGameReview) {
      btnGameReview.getComponent(cc.Button).interactable = true;
    }

    if (!!btnClubResults) {
      btnClubResults.getComponent(cc.Button).interactable = true;
    }
  },
  disable: function disable() {
    var btnMainMenu = cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BtnMainMenu");
    var btnGameReview = cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BtnGameReview");
    var btnClubResults = cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BtnClubResults");

    if (!!btnMainMenu) {
      btnMainMenu.getComponent(cc.Button).interactable = false;
    }

    if (!!btnGameReview) {
      btnGameReview.getComponent(cc.Button).interactable = false;
    }

    if (!!btnClubResults) {
      btnClubResults.getComponent(cc.Button).interactable = false;
    }
  }
});

cc._RF.pop();