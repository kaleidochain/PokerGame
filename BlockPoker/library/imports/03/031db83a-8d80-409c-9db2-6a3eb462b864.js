"use strict";
cc._RF.push(module, '031dbg6jYBAnJ2yaj60Yrhk', 'Splash');
// scripts/Game/Splash.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    background: cc.Node,
    logo: cc.Node
  },
  // LIFE-CYCLE CALLBACKS:
  // onLoad () {},
  _isValidAccount: function _isValidAccount(accounts, addr) {
    for (var i = 0; i < accounts.length; i++) {
      if (addr.toLowerCase() == accounts[i].toLowerCase()) {
        return true;
      }
    }

    return false;
  },
  onLoad: function onLoad() {
    this._showSplash = false;

    if (!cc.dgame) {
      Log.Info("======================================= Process Start =======================================");
      cc.dgame = {};
      cc.dgame.net = require('Net'); //网络模块，通过websocket连接负责与gengine通讯

      cc.dgame.net.init();
      cc.dgame.http = require("HTTP");
      cc.dgame.gameplay = {}; //牌局信息，保存每个玩家所在位置、玩家账号地址、牌点信息、地主信息等

      cc.dgame.settings = {}; //设置项，例如使用什么网络（外网、内网）、账号地址等

      var Utils = require('Utils');

      cc.dgame.utils = new Utils();

      var ClipboardHelper = require("ClipboardHelper");

      cc.dgame.clipboard = new ClipboardHelper();
      cc.dgame.sceneList = new Array();
      cc.dgame.sceneList.push(cc.director.getScene().name);
      this._showSplash = true;
    }

    if (!cc.sys.localStorage.getItem("setting")) {
      var setting = {};
      setting.Language = "English";
      setting.Sound = true;
      cc.sys.localStorage.setItem("setting", JSON.stringify(setting));
    }

    cc.dgame.settings.setting = JSON.parse(cc.sys.localStorage.getItem("setting"));

    if (!cc.dgame.settings.setting.CustomOdds) {
      cc.dgame.settings.setting.CustomOdds = [31, 16, 10, 8, 6, 5, 4, 3.5, 3, 2.5, 2.3, 2, 1.8, 1.6, 1.4, 1.3, 1.2, 1.1, 1.0, 0.8];
      cc.sys.localStorage.setItem("setting", JSON.stringify(cc.dgame.settings.setting));
    }

    if (!cc.sys.localStorage.getItem("tutorial")) {
      var _tutorial = {};
      _tutorial.Blockchain = false;
      _tutorial.TexasHoldem = false;
      cc.sys.localStorage.setItem("tutorial", JSON.stringify(_tutorial));
    }

    if (!cc.sys.localStorage.getItem("accountsInfo")) {
      cc.sys.localStorage.setItem("accountsInfo", "[]");
      cc.dgame.settings.accountsInfo = [];
    } else {
      cc.dgame.settings.accountsInfo = JSON.parse(cc.sys.localStorage.getItem("accountsInfo"));
    }

    if (!cc.sys.localStorage.getItem("mnemonicLanguage")) {
      cc.sys.localStorage.setItem("mnemonicLanguage", "English");
    }

    if (!cc.sys.localStorage.getItem("roomType")) {
      cc.sys.localStorage.setItem("roomType", 0);
    } //{"Addr":"0x019Dd28763B06CfC52A0a89efF7610d4FD5e1a6e","Nickname":"napster"}
    //校验当前账号是否在钱包当中


    var accounts = new Array(); //通过keystore接口获取实际存在于本地的账号地址

    if (cc.sys.isNative) {
      var accountsStr = "[]";

      if (cc.sys.isNative) {
        if (cc.sys.isMobile) {
          if (cc.sys.os == cc.sys.OS_IOS) {
            accountsStr = jsb.reflection.callStaticMethod("NativeGengine", "getAccounts"); //jsb.reflection.callStaticMethod("NativeGengine", "deleteAccount:withPassword:", "0x24cB4787939604AE5080F6D5C717Ed9C60a9B2E6", "qwerasdf");
          } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            accountsStr = jsb.reflection.callStaticMethod("io/kaleidochain/NativeGengine", "getAccounts", "()Ljava/lang/String;");
          }
        } else {
          if (cc.sys.os == cc.sys.OS_WINDOWS || cc.sys.os === cc.sys.OS_OSX) {
            accountsStr = GetAccounts();
          }
        }
      }

      accounts = JSON.parse(accountsStr); //同步accountsInfo的昵称

      var accountsInfo = new Array(); //先地址去重

      var accountsMap = {};

      for (var i = 0; i < cc.dgame.settings.accountsInfo.length; i++) {
        if (this._isValidAccount(accounts, cc.dgame.settings.accountsInfo[i].Addr)) {
          accountsMap[cc.dgame.settings.accountsInfo[i].Addr] = cc.dgame.settings.accountsInfo[i].Nickname;
        }
      }

      for (var addr in accountsMap) {
        accountsInfo.push({
          "Nickname": accountsMap[addr],
          "Addr": addr
        });
      }

      cc.sys.localStorage.setItem("accountsInfo", JSON.stringify(accountsInfo));
      cc.dgame.settings.accountsInfo = JSON.parse(cc.sys.localStorage.getItem("accountsInfo"));
      var currentAccountInfo = cc.sys.localStorage.getItem("currentAccount");

      if (!currentAccountInfo || currentAccountInfo == "") {
        cc.dgame.settings.account = null;
      } else {
        cc.dgame.settings.account = JSON.parse(currentAccountInfo);

        if (!this._isValidAccount(accounts, cc.dgame.settings.account.Addr)) {
          //当前账号不存在了
          if (accounts.length > 0) {
            //选本地第一个账号
            cc.dgame.settings.account = cc.dgame.settings.accountsInfo[0];
            cc.sys.localStorage.setItem("currentAccount", JSON.stringify(cc.dgame.settings.account));
          } else {
            cc.sys.localStorage.removeItem("currentAccount");
            cc.dgame.settings.account = null;
          }
        }
      } //iOS系统使用APP的启动页面


      if (cc.sys.os == cc.sys.OS_IOS) {
        this.background.active = false;
        this.logo.active = false;
      }
    }

    Log.Info("cur: " + JSON.stringify(cc.dgame.settings.account) + ", accounts: " + JSON.stringify(accounts) + ", accountsInfo: " + JSON.stringify(cc.dgame.settings.accountsInfo) + ", mnemonicLanguage: " + cc.sys.localStorage.getItem("mnemonicLanguage"));
    cc.director.preloadScene('GameHall', function () {
      Log.Trace('Next scene preloaded');
    });
    var tutorial = JSON.parse(cc.sys.localStorage.getItem("tutorial"));

    if (!tutorial.Blockchain) {
      cc.director.loadScene("BlockchainTutorial");
    } else {
      if (cc.sys.isNative) {
        if (cc.sys.isMobile) {
          if (cc.sys.os == cc.sys.OS_IOS) {
            if (!cc.dgame.settings.account) {
              cc.director.loadScene('CreateAccount');
            } else {
              cc.director.loadScene('LoginAccount');
            }
          } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            if (this._showSplash) {
              this.scheduleOnce(function () {
                if (!cc.dgame.settings.account) {
                  cc.director.loadScene('CreateAccount');
                } else {
                  cc.director.loadScene('LoginAccount');
                }
              }, 2);
            } else {
              if (!cc.dgame.settings.account) {
                cc.director.loadScene('CreateAccount');
              } else {
                cc.director.loadScene('LoginAccount');
              }
            }
          }
        } else {
          if (cc.sys.os == cc.sys.OS_WINDOWS || cc.sys.os === cc.sys.OS_OSX) {
            if (!cc.dgame.settings.account) {
              cc.director.loadScene('CreateAccount');
            } else {
              cc.director.loadScene('LoginAccount');
            }
          }
        }
      }
    }
  } // update (dt) {},

});

cc._RF.pop();