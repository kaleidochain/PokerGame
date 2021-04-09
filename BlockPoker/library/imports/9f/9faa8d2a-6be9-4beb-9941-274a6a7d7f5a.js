"use strict";
cc._RF.push(module, '9faa80qa+lL65lBJ0pqfX9a', 'LoginMnemonic');
// scripts/Wallet/LoginMnemonic.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    loginMnemonic: cc.Node,
    createPassoword: cc.Node,
    createNickname: cc.Node,
    editPassword: cc.EditBox,
    editNickname: cc.EditBox,
    nicknameErrorTips: cc.Label,
    passwordErrorTips: cc.Label,
    loginMnemonicErrorTips: cc.Label,
    editMnemonics: {
      "default": [],
      type: cc.EditBox
    }
  },
  // LIFE-CYCLE CALLBACKS:
  // onLoad () {},
  onBtnBackClicked: function onBtnBackClicked() {
    console.log("sceneList: " + cc.dgame.sceneList);

    if (this.loginMnemonic.active) {
      cc.director.loadScene(cc.dgame.sceneList.pop());
    } else if (this.createPassoword.active) {
      this.loginMnemonic.active = true;
      this.createPassoword.active = false;
      this.createNickname.active = false;
    } else if (this.createNickname.active) {
      this.loginMnemonic.active = false;
      this.createPassoword.active = true;
      this.createNickname.active = false;
    }
  },
  onLoad: function onLoad() {
    this.loginMnemonic.active = true;
    this.createPassoword.active = false;
    this.createNickname.active = false;
  },
  // update (dt) {},
  onBtnLoginMnemonicClicked: function onBtnLoginMnemonicClicked() {
    this.mnemonic = "";
    var hasError = false;

    for (var i = 0; i < this.editMnemonics.length; i++) {
      if (this.editMnemonics[i].string == "") {
        hasError = true;
        break;
      }

      if (i != this.editMnemonics.length - 1) {
        this.mnemonic = this.mnemonic + this.editMnemonics[i].string + " ";
      } else {
        this.mnemonic = this.mnemonic + this.editMnemonics[i].string;
      }
    }

    if (hasError) {
      this.loginMnemonicErrorTips.string = "The mnemonic is empty, please re-enter";
      this.scheduleOnce(function () {
        this.loginMnemonicErrorTips.string = "";
      }, 3);
    } else {
      Log.Debug("mnemonic: " + this.mnemonic);
      this.loginMnemonic.active = false;
      this.createPassoword.active = true;
      this.createNickname.active = false;
    }
  },
  onBtnCreatePasswordClicked: function onBtnCreatePasswordClicked() {
    if (!(this.editPassword.string.length >= 6 && this.editPassword.string.length <= 12)) {
      this.passwordErrorTips.string = "Invalid password length";
      this.scheduleOnce(function () {
        this.passwordErrorTips.string = "";
      }, 3);
      return;
    }

    var pubkey = "";

    if (cc.sys.os === cc.sys.OS_IOS) {
      pubkey = jsb.reflection.callStaticMethod("NativeGengine", "importAccount:withPassword:AndLanguage:", this.mnemonic, this.editPassword.string, cc.sys.localStorage.getItem("mnemonicLanguage"));
    } else if (cc.sys.os === cc.sys.OS_ANDROID) {
      pubkey = jsb.reflection.callStaticMethod("io/kaleidochain/NativeGengine", "importAccountWithPasswordAndLanguage", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;", this.mnemonic, this.editPassword.string, cc.sys.localStorage.getItem("mnemonicLanguage"));
    } else if (cc.sys.os === cc.sys.OS_WINDOWS || cc.sys.os === cc.sys.OS_OSX) {
      pubkey = ImportAccountWithPasswordAndLanguage(this.mnemonic, this.editPassword.string, cc.sys.localStorage.getItem("mnemonicLanguage"));
    }

    Log.Debug("pubkey: " + pubkey);

    if (pubkey !== null && pubkey !== undefined && pubkey.length > 0) {
      this.loginMnemonic.active = false;
      this.createPassoword.active = false;
      this.createNickname.active = true;
      this.accountAddr = pubkey;
    } else {
      this.loginMnemonic.active = true;
      this.createPassoword.active = false;
      this.createNickname.active = false;
      this.loginMnemonicErrorTips.string = "The mnemonic is incorrect, please re-enter";
      this.scheduleOnce(function () {
        this.loginMnemonicErrorTips.string = "";
      }, 3);
    }
  },
  onBtnCreateNicknameClicked: function onBtnCreateNicknameClicked() {
    if (this.editNickname.string == "") {
      this.nicknameErrorTips.string = "Empty nickname";
      this.scheduleOnce(function () {
        this.nicknameErrorTips.string = "";
      }, 3);
      return;
    }

    if (this._isNicknameExist(this.editNickname.string)) {
      this.nicknameErrorTips.string = "The nickname already exists on this device";
      this.scheduleOnce(function () {
        this.nicknameErrorTips.string = "";
      }, 3);
      return;
    }

    var accountInfo = {};
    accountInfo.Nickname = this.editNickname.string;
    accountInfo.Addr = this.accountAddr;
    accountInfo.LoginCount = 0;
    cc.dgame.settings.account = accountInfo;
    Log.Debug("cc.dgame.settings.account = " + JSON.stringify(cc.dgame.settings.account));

    this._updateAccountsInfo(accountInfo);

    cc.sys.localStorage.setItem("currentAccount", JSON.stringify(accountInfo));
    cc.dgame.settings.account.Password = this.editPassword.string;
    var tutorial = JSON.parse(cc.sys.localStorage.getItem("tutorial"));

    if (!tutorial.TexasHoldem) {
      cc.director.loadScene("TexasHoldemTutorial");
    } else {
      cc.director.loadScene("GameHall");
    }
  },
  _isNicknameExist: function _isNicknameExist(nickname) {
    for (var i = 0; i < cc.dgame.settings.accountsInfo.length; i++) {
      if (cc.dgame.settings.accountsInfo[i].Nickname == nickname) {
        return true;
      }
    }

    return false;
  },
  _updateAccountsInfo: function _updateAccountsInfo(accountInfo) {
    //同步accountsInfo的昵称
    var accountsInfo = new Array(); //先地址去重

    var accountsMap = {};

    for (var i = 0; i < cc.dgame.settings.accountsInfo.length; i++) {
      accountsMap[cc.dgame.settings.accountsInfo[i].Addr] = cc.dgame.settings.accountsInfo[i].Nickname;
    }

    accountsMap[accountInfo.Addr] = accountInfo.Nickname;

    for (var addr in accountsMap) {
      accountsInfo.push({
        "Nickname": accountsMap[addr],
        "Addr": addr
      });
    }

    cc.sys.localStorage.setItem("accountsInfo", JSON.stringify(accountsInfo));
    Log.Trace("accountsInfo: " + JSON.stringify(accountsInfo));
  }
});

cc._RF.pop();