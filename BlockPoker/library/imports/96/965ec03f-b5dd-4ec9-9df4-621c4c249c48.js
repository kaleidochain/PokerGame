"use strict";
cc._RF.push(module, '965ecA/td1OyZ30YhxMJJxI', 'Invitation');
// scripts/Game/Invitation.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    invitationRule: cc.Node,
    invitationProfits: cc.Node,
    enterInvitationCode: cc.Node,
    myInvitationCodeRule: cc.RichText,
    myInvitationCodeProfits: cc.RichText,
    inviterInvitationCode: cc.Node,
    richtextInviterInvitationCode: cc.RichText,
    editboxInvitationCode: cc.EditBox,
    btnConfirm: cc.Node,
    invitedNum: cc.RichText,
    cumulativeIncomeNum: cc.RichText,
    todayEarningNum: cc.RichText,
    normalLoadingLayer: cc.Node
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    if (cc.dgame.invitation.Scene == "invitationRule") {
      this.invitationRule.active = true;
      this.invitationProfits.active = false;
      this.enterInvitationCode.active = false;
      cc.dgame.invitation.startCheck();
    } else if (cc.dgame.invitation.Scene == "invitationProfits") {
      this.invitationRule.active = false;
      this.invitationProfits.active = true;
      this.enterInvitationCode.active = false;
    } else if (cc.dgame.invitation.Scene == "enterInvitationCode") {
      this.invitationRule.active = false;
      this.invitationProfits.active = false;
      this.enterInvitationCode.active = true;
    }

    var result = cc.dgame.invitation.InvitationCode[0];

    for (var i = 1; i < cc.dgame.invitation.InvitationCode.length; i++) {
      result += " " + cc.dgame.invitation.InvitationCode[i];
    } //result.replace(/\s*/g,'') //去掉字符串中所有空格


    this.myInvitationCodeRule.string = cc.dgame.utils.formatRichText(result, "#ffffff", true, false);
    this.myInvitationCodeProfits.string = cc.dgame.utils.formatRichText(result, "#ffffff", true, false);
    this.invitedNum.string = cc.dgame.utils.formatRichText(cc.dgame.invitation.InvitedNum, "#D1D1D1", true, true);
    this.cumulativeIncomeNum.string = cc.dgame.utils.formatRichText(cc.dgame.invitation.TotalReward, "#DA8B23", true, true);

    if (!!cc.dgame.invitation.InviterInvitationCode && cc.dgame.invitation.InviterInvitationCode != "") {
      this.richtextInviterInvitationCode.string = cc.dgame.utils.formatRichText(cc.dgame.invitation.InviterInvitationCode, "#16487C", true, false);
      this.inviterInvitationCode.active = true;
      this.editboxInvitationCode.node.active = false;
      this.btnConfirm.active = false;
    } else {
      this.inviterInvitationCode.active = false;
      this.editboxInvitationCode.node.active = true;
      this.btnConfirm.active = true;
    }
  },
  start: function start() {},
  onBtnBackClicked: function onBtnBackClicked() {
    cc.director.loadScene("MySettings");
  },
  onBtnCopyInvitationCodeClicked: function onBtnCopyInvitationCodeClicked() {
    cc.dgame.clipboard.copyToClipboard(cc.dgame.invitation.InvitationCode);
    cc.dgame.tips.showTips("Copy<br/>Succeed");
  },
  onBtnShareClicked: function onBtnShareClicked() {
    var shareContent = "Play Block Poker with me！The world's first blockchain Texas Holdem, the safest and fairest cash poker platform with permanent operation and assets.\nMy Invitation Code:" + cc.dgame.invitation.InvitationCode;
    cc.dgame.clipboard.copyToClipboard(shareContent);
    cc.dgame.tips.showTips("The invitation information <br/>has been copied, please paste it.", 2 / 3);

    if (cc.sys.isNative) {
      if (cc.sys.isMobile) {
        if (cc.sys.os === cc.sys.OS_IOS) {
          jsb.reflection.callStaticMethod('NativeGengine', 'Share:', shareContent);
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
          jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity', 'Share', '(Ljava/lang/String;Ljava/lang/String;)V', "Play Block Poker with me！", shareContent);
        }
      } else {}
    }
  },
  onBtnRuleClicked: function onBtnRuleClicked() {
    this.invitationRule.active = true;
    this.invitationProfits.active = false;
    this.enterInvitationCode.active = false;
  },
  onBtnProfitsClicked: function onBtnProfitsClicked() {
    this.invitationRule.active = false;
    this.invitationProfits.active = true;
    this.enterInvitationCode.active = false;
  },
  _onSetCode: function _onSetCode(result) {
    cc.dgame.normalLoading.stopInvokeWaiting();
    Log.Trace("[_onSetCode] setCode(" + this.editboxInvitationCode.string + ") return " + result);

    if (result == "Network disconnected") {
      cc.dgame.normalLoading.showLoadTimeout();
      return;
    }

    if (result == "") {
      cc.dgame.invitation.InviterInvitationCode = this.editboxInvitationCode.string;
      this.richtextInviterInvitationCode.string = cc.dgame.utils.formatRichText(cc.dgame.invitation.InviterInvitationCode, "#16487C", true, false);
      this.inviterInvitationCode.active = true;
      this.editboxInvitationCode.node.active = false;
      this.btnConfirm.active = false;
      cc.dgame.tips.showTips("Successfully bound inviter");
    } else {
      this.inviterInvitationCode.active = false;
      this.editboxInvitationCode.node.active = true;
      this.btnConfirm.active = true;
      cc.dgame.tips.showTips(result);
    }
  },
  onBtnConfirmClicked: function onBtnConfirmClicked() {
    cc.dgame.normalLoading.startInvokeWaiting();
    var setcode_cmd = {
      InvitationCode: this.editboxInvitationCode.string
    };
    cc.dgame.net.gameCall(["setCode", JSON.stringify(setcode_cmd)], this._onSetCode.bind(this));
  } // update (dt) {},

});

cc._RF.pop();