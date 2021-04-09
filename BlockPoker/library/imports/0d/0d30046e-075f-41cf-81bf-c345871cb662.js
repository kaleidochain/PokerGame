"use strict";
cc._RF.push(module, '0d300RuB19Bz4G/w0WHHLZi', 'MySettings');
// scripts/Game/MySettings.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    privacyPolicyLayer: cc.Node,
    nickname: cc.RichText,
    avator: cc.Sprite,
    selfAccountAddr: cc.Label,
    invitationCode: cc.Label,
    language: cc.Label
  },
  // use this for initialization
  onLoad: function onLoad() {
    Log.Trace("[MySettings:onLoad]");
    var assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");
    this.selfAccountAddr.string = cc.dgame.settings.account.Addr;
    this.invitationCode.string = cc.dgame.invitation.InvitationCode;
    this.nickname.string = "<b>" + cc.dgame.settings.account.Nickname + "</b>";
    var idx = parseInt(cc.dgame.settings.account.Addr.substr(2, 2), 16);

    if (isNaN(idx)) {
      idx = 0;
    }

    this.avator.spriteFrame = assetMgr.heads[idx % 200];
    cc.dgame.refresh.refreshChips();
    cc.dgame.refresh.refreshKAL();
    cc.dgame.exchangeRate.startCheckExchangeRate();
    this.language.string = cc.dgame.settings.setting.Language;
    cc.find("Canvas/SettingPopupLayer/bg_recharge/layoutSoundON/btn_checked").active = cc.dgame.settings.setting.Sound;
    cc.find("Canvas/SettingPopupLayer/bg_recharge/layoutSoundON/btn_unchecked").active = !cc.dgame.settings.setting.Sound;
    cc.find("Canvas/SettingPopupLayer/bg_recharge/layoutSoundOFF/btn_checked").active = !cc.dgame.settings.setting.Sound;
    cc.find("Canvas/SettingPopupLayer/bg_recharge/layoutSoundOFF/btn_unchecked").active = cc.dgame.settings.setting.Sound;
  },
  // called every frame
  update: function update(dt) {},
  //将自己的邀请码拷贝到剪贴板
  onBtnCopyInvitationCodeToClipboardClicked: function onBtnCopyInvitationCodeToClipboardClicked() {
    cc.dgame.clipboard.copyToClipboard(this.invitationCode.string);
    cc.dgame.tips.showTips("Copy<br/>Succeed");
  },
  //将自己的账号地址拷贝到剪贴板
  onBtnCopyAccountAddrToClipboardClicked: function onBtnCopyAccountAddrToClipboardClicked() {
    cc.dgame.clipboard.copyToClipboard(cc.dgame.settings.account.Addr);
    cc.dgame.tips.showTips("Copy<br/>Succeed");
  },
  onBtnRefreshBalanceClicked: function onBtnRefreshBalanceClicked() {
    cc.dgame.refresh.refreshChips();
    cc.dgame.refresh.refreshKAL();
  },
  onBtnEnterInvitationCodeClicked: function onBtnEnterInvitationCodeClicked() {
    cc.dgame.invitation.Scene = "enterInvitationCode";
    cc.director.loadScene("Invitation");
  },
  onBtnInvitationRewardClicked: function onBtnInvitationRewardClicked() {
    cc.dgame.invitation.Scene = "invitationRule";
    cc.director.loadScene("Invitation");
  },
  onBtnTransferClicked: function onBtnTransferClicked() {
    cc.dgame.rechargePopup.onBtnShowHandselClicked();
  },
  onBtnHandRecordClicked: function onBtnHandRecordClicked() {
    cc.director.loadScene("BoardRecords");
  },
  onBtnExchangeGroupClicked: function onBtnExchangeGroupClicked() {
    if (cc.sys.isNative) {
      if (cc.sys.isMobile) {
        if (cc.sys.os === cc.sys.OS_IOS) {
          jsb.reflection.callStaticMethod('NativeGengine', 'openURL:', "https://t.me/joinchat/IBgALxVICxduasCWRsKzig");
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
          jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity', 'openURL', '(Ljava/lang/String;)V', "https://t.me/joinchat/IBgALxVICxduasCWRsKzig");
        }
      } else if (cc.sys.os === cc.sys.OS_WINDOWS || cc.sys.os === cc.sys.OS_OSX) {
        openURL("https://t.me/joinchat/IBgALxVICxduasCWRsKzig");
      }
    }
  },
  onBtnHelpAndRulesClicked: function onBtnHelpAndRulesClicked() {
    cc.dgame.helpAndRulesScene = cc.director.getScene().name;
    cc.director.loadScene("HelpAndRules");
  },
  onBtnPrivacyPolicyClicked: function onBtnPrivacyPolicyClicked() {
    this.privacyPolicyLayer.active = true;
  },
  onBtnClosePrivacyPolicyClicked: function onBtnClosePrivacyPolicyClicked() {
    this.privacyPolicyLayer.active = false;
  },
  onBtnSettingClicked: function onBtnSettingClicked() {
    cc.find("Canvas/SettingPopupLayer").active = true;
  },
  onBtnCloseSettingClicked: function onBtnCloseSettingClicked() {
    cc.find("Canvas/SettingPopupLayer").active = false;
  },
  onBtnLogoutClicked: function onBtnLogoutClicked() {
    cc.find("Canvas/LogoutToastLayer").active = true;
  },
  onBtnLogoutToastOKClicked: function onBtnLogoutToastOKClicked() {
    if (cc.sys.isNative) {
      if (cc.sys.isMobile) {
        if (cc.sys.os === cc.sys.OS_IOS) {
          jsb.reflection.callStaticMethod("NativeGengine", "stopGameEngine");
          cc.audioEngine.stopAll();
          cc.game.restart();
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
          jsb.reflection.callStaticMethod("io/kaleidochain/NativeGengine", "stopGameEngine", "()Z");
          cc.audioEngine.stopAll();
          cc.game.restart();
        }
      } else {
        if (cc.sys.os === cc.sys.OS_WINDOWS || cc.sys.os === cc.sys.OS_OSX) {
          StopNode();
          cc.audioEngine.stopAll();
          cc.game.restart();
        }
      }
    }
  },
  onBtnLogoutToastCancelClicked: function onBtnLogoutToastCancelClicked() {
    cc.find("Canvas/LogoutToastLayer").active = false;
  },
  onBtnSoundOnClicked: function onBtnSoundOnClicked() {
    cc.dgame.settings.setting.Sound = true;
    cc.find("Canvas/SettingPopupLayer/bg_recharge/layoutSoundON/btn_checked").active = cc.dgame.settings.setting.Sound;
    cc.find("Canvas/SettingPopupLayer/bg_recharge/layoutSoundON/btn_unchecked").active = !cc.dgame.settings.setting.Sound;
    cc.find("Canvas/SettingPopupLayer/bg_recharge/layoutSoundOFF/btn_checked").active = !cc.dgame.settings.setting.Sound;
    cc.find("Canvas/SettingPopupLayer/bg_recharge/layoutSoundOFF/btn_unchecked").active = cc.dgame.settings.setting.Sound;
    cc.sys.localStorage.setItem("setting", JSON.stringify(cc.dgame.settings.setting));
  },
  onBtnSoundOffClicked: function onBtnSoundOffClicked() {
    cc.dgame.settings.setting.Sound = false;
    cc.find("Canvas/SettingPopupLayer/bg_recharge/layoutSoundON/btn_checked").active = cc.dgame.settings.setting.Sound;
    cc.find("Canvas/SettingPopupLayer/bg_recharge/layoutSoundON/btn_unchecked").active = !cc.dgame.settings.setting.Sound;
    cc.find("Canvas/SettingPopupLayer/bg_recharge/layoutSoundOFF/btn_checked").active = !cc.dgame.settings.setting.Sound;
    cc.find("Canvas/SettingPopupLayer/bg_recharge/layoutSoundOFF/btn_unchecked").active = cc.dgame.settings.setting.Sound;
    cc.sys.localStorage.setItem("setting", JSON.stringify(cc.dgame.settings.setting));
  },
  onBtnLanguageDropdownClicked: function onBtnLanguageDropdownClicked() {
    var dropdownMenu = cc.find("Canvas/SettingPopupLayer/bg_recharge/scrollview");
    dropdownMenu.active = !dropdownMenu.active;
  }
});

cc._RF.pop();