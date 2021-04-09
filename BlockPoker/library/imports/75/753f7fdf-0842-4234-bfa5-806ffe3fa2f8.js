"use strict";
cc._RF.push(module, '753f7/fCEJCNL+lgG/+P6L4', 'GameHall');
// scripts/Game/GameHall.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    loadinglayer: cc.Node,
    loadingTips: cc.Label,
    loadingIconLayer: cc.Node,
    btnRetryRunGame: cc.Button,
    btnRetryOpen: cc.Button,
    blockInputLayer: cc.Node
  },
  _onSelfAddress: function _onSelfAddress(data) {
    Log.Trace("[_onSelfAddress]" + data);

    if (typeof data === "string") {
      cc.dgame.gameplay.selfaddr = data.toLowerCase();
    }
  },
  _onLogin: function _onLogin(data) {
    Log.Trace("[_onLogin] data: " + data);
    cc.dgame.login = {};
    var loginData = JSON.parse(data);

    if (loginData.ReEnterTableId > 0) {
      cc.dgame.login.data = loginData;
      var clubFlag = parseInt(loginData.ReEnterTableId) < 0xE000000000000;
      Log.Trace("[_onLogin] clubFlag: " + clubFlag);

      if (clubFlag != true) {
        cc.dgame.login.enterRoom = true;
      } else {
        cc.dgame.login.enterClubRoom = true;
        this.scheduleOnce(function () {
          cc.director.loadScene('ClubHall');
        }, 0.05);
      }
    }

    cc.dgame.refresh.refreshList("roomType");
  },
  _onRunGame: function _onRunGame(data) {
    Log.Trace("load complete(" + data + ")");

    if (data.length > 25) {
      if (data.indexOf("msglist.txt: no such file or directory") !== -1) {
        Log.Error("_onRunGame msglist.txt: no such file or directory");
      }
    }

    Log.Trace(cc.dgame.utils.getNowFormatDate() + " before _onRunGame");

    if (parseInt(data) === 0) {
      cc.dgame.net.connected = true;
      this.loadinglayer.active = false;
      cc.dgame.net.gameCall(["Play_Login", ""], this._onLogin.bind(this));
      cc.dgame.refresh.refreshChips();
      cc.dgame.refresh.refreshKAL();

      var Promotion = require("Promotion");

      cc.dgame.promotion = new Promotion();
      cc.dgame.promotion.giveMeToken();
      cc.dgame.invitation.startCheck();
      cc.dgame.exchangeRate.startCheckExchangeRate();
      cc.dgame.roomEventMgr.startListen();
      cc.dgame.gameRequestMgr.startCheckGameRequest();
      cc.dgame.clubRequestMgr.startCheckClubRequest();
      cc.dgame.net.gameCall(["dismissExipredClubTable", ""]);
      delete cc.dgame.settings.account.Password;
    } else {
      if (cc.sys.isNative) {
        if (cc.sys.isMobile) {
          if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("NativeGengine", "clearCacheWithExcludeDirs:andFiles:", "keystore,logs", "deal.txt,exportlist.txt,jsb.sqlite,msglist.txt,portal.lua,key.txt");
          } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("io/kaleidochain/NativeGengine", "clearCacheWithExcludeDirsAndFiles", "(Ljava/lang/String;Ljava/lang/String;)V", "keystore,logs", "deal.txt,exportlist.txt,jsb.sqlite,msglist.txt,portal.lua,key.txt");
          }
        } else {}
      }

      this.loadingTips.node.active = true;
      this.loadingIconLayer.active = false;
      this.btnRetryRunGame.node.active = true;
    }

    Log.Trace(cc.dgame.utils.getNowFormatDate() + " after _onRunGame");
  },
  runGame: function runGame() {
    this.loadinglayer.active = true;
    this.loadingTips.node.active = false;
    this.loadingIconLayer.active = true;
    this.btnRetryRunGame.node.active = false;
    var self = this;
    this.scheduleOnce(function () {
      var rungame_cmd = {
        game_nodes: JSON.parse(cc.dgame.settings.game_nodes)
      };
      Log.Trace(cc.dgame.utils.getNowFormatDate() + " before rungame");
      cc.dgame.net.gameCall(["rungame", JSON.stringify(rungame_cmd)], self._onRunGame.bind(self));
      Log.Trace(cc.dgame.utils.getNowFormatDate() + " after rungame");
    }, 0.05);
  },
  onOpen: function onOpen() {
    Log.Debug("GameHall onOpen");
    cc.dgame.settings.onOpen = true;
    this.blockInputLayer.active = false;
    this.loadinglayer.active = true;
    this.loadingTips.node.active = false;
    this.loadingIconLayer.active = true;
    this.btnRetryOpen.node.active = false; //cc.dgame.net.sendMsg(["selfaddress", ""], this._onSelfAddress.bind(this));
    //cc.dgame.net.gameCall(["selfaddress", ""], 'cc.find("GameHall").getComponent("GameHall")._onSelfAddress');

    cc.dgame.net.gameCall(["selfaddress", ""], this._onSelfAddress.bind(this)); //cc.dgame.settings.game_contract_addr = "d70caa15134f0f282de490a3185f049c68b87760";
    //        cc.dgame.settings.game_contract_addr = "1bdcf5a17b71328ec92f6eb7f083691cfa8e095e";
    //cc.dgame.settings.game_nodes = JSON.stringify(["enode://9b93cf2e45d98d3c95c432ea0858bc41e3148bcb36226e9143c0780ba85e24b796a6e3c2401b7ff756ac7f1058310ca563f20700c3371930639feaa94505da1d"])
    //        cc.dgame.settings.game_nodes = JSON.stringify(["enode://d60ca04981d26562db7e090231b35137fbfa4eee5e2fefe4fad074db4c86abc228c4897578f2ea827b413fc3ddb85ba75f6c7b02e6c70e4daaa8642612214b36@192.168.0.212:38883"]);
    //合约选BB版
    // cc.dgame.settings.game_contract_addr = "9422fea536c5d50f538ba369382221b380f1be7c";
    // cc.dgame.settings.game_nodes = JSON.stringify(["enode://95f411dced5e748e2b88ea622fd9ac827e28829a17c87be072b954c99bd3759444f7b80732276417374114380d406fa4543abd147674d173cc66cddd5bedc2bf@192.168.0.211:38883"]);
    //cc.dgame.settings.game_contract_addr = "51cf507cace7279c5a59bd7f91c23842f205d20a";
    //cc.dgame.settings.game_contract_addr = "3598f25eb914d23be556069d73b6961f8dc80766";
    //cc.dgame.settings.game_contract_addr = "d178f5cac82018a52a811cb5e5778599cc276fca";
    //cc.dgame.settings.game_contract_addr = "51091b5420b9e678f5c7f3e66c56958dbdf8c72b";
    // cc.dgame.settings.game_contract_addr = "68441307fad8d6086f4e91740510750b353ef163";
    // cc.dgame.settings.game_nodes = JSON.stringify(["enode://d60ca04981d26562db7e090231b35137fbfa4eee5e2fefe4fad074db4c86abc228c4897578f2ea827b413fc3ddb85ba75f6c7b02e6c70e4daaa8642612214b36@192.168.0.212:38883"]);
    //cc.dgame.settings.game_nodes = JSON.stringify(["enode://78afd98ec657a7320cb984ffc7c701ef439f717e1267b43fee7c8101e08939cafb2d7518eef69d4a0b982b5f206416036397f513b7817186249064063f4ce8d2@192.168.0.213:38883"]);
    //cc.dgame.settings.game_nodes = JSON.stringify(["enode://3e256d081ca0bad611b3384058028f1640459f5d956f48644ccb37942ae7bbf9e06a15e6ed69a504a937d03e2be690c7e8e60372588bc3babc3caf4f663d4e95@106.75.184.214:38883"]);

    var self = this;

    var fn = function fn(ret, url) {
      Log.Debug("sendRequest ret: " + JSON.stringify(ret) + ", url: " + url + ", currentScene: " + cc.director.getScene().name);
      Log.Debug("sendRequest rettype: " + self._retType);

      if (cc.director.getScene().name == "GameHall" && !self._retType) {
        if (!ret) {
          self.loadingTips.node.active = true;
          self.loadingIconLayer.active = false;
          self.btnRetryOpen.node.active = true;
        } else if (ret.status == 0) {
          self._retType = url;
          self.loadinglayer.active = false;
          var nodelist = new Array();
          var port = ret.enodeid.indexOf("@", 6);

          if (port != -1) {
            var enode = ret.enodeid.substring(0, port + 1) + ret.rpc;
            nodelist.push(enode);
            cc.dgame.settings.game_nodes = JSON.stringify(nodelist);
            self.runGame();
          }
        }
      }
    }; // cc.dgame.http.sendRequest("/mainnet", null, fn);
    // cc.dgame.http.sendRequest("/mainnet", null, fn, "https://enode.kalscan.io");
    //cc.dgame.http.sendRequest("/testnet", null, fn);
    //cc.dgame.http.sendRequest("/testnet", null, fn, "https://enode.kalscan.io");
    // this.scheduleOnce(function () {
    //     fn({"status":0,"message":"OK","enodeid":"enode://252d1ff88dd0ea166042c12161df06e923f82367fe8281122b313859aa9182d0b72a2b85299dd7efbff4d5c789d724b84f27e7f410f9cd6d63393931c40a8b60@106.75.184.214:38885","rpc":"106.75.184.214:8548"});
    // }, 1);


    this.scheduleOnce(function () {
      fn({
        "status": 0,
        "message": "OK",
        "enodeid": "enode://d1ff6cd02c6babb3f43e0134116794e03049374e8f43e2624762288440221dc060c0e728b39bec59af8bf0c7eccdfa3798dc9bcf6617affd2b6b191233fcda31@45.249.245.3:38884",
        "rpc": "45.249.245.3:38548"
      });
    }, 1); //cc.dgame.settings.game_nodes = JSON.stringify(["enode://9a094a1f7b42b440368be84498de61111a322eb23d3c4490cbd6dc4340477aba84d7fcf4a6b433567fed502650e87029452fbc065990a330007b10f064f53166@106.75.184.214:8548"])
    //cc.dgame.settings.game_nodes = JSON.stringify(['enode://4f8a610c0fdff91859ab0e3eed18a73a445a88fc6025554ffc05edb9e8a3559856691b2f33e112d4d49ecd57a426893066c80cd5528c939df63413c17e35f076@192.168.0.214:8546'])
    //cc.dgame.settings.game_nodes = JSON.stringify(["enode://3e256d081ca0bad611b3384058028f1640459f5d956f48644ccb37942ae7bbf9e06a15e6ed69a504a937d03e2be690c7e8e60372588bc3babc3caf4f663d4e95","enode://5ec49e44aaa69e10e69c8cc90955f0172984bc876088acb0815c12cb87f346e20239f8e4efcdc5b3b44edd8c9af58049c46490243b76b1844bd266ec277a7ffd","enode://38074d24f5aa21c64acf87b4cd793b0be205280ee5d5dbb1a51c14be9e8097c46b2d4341b5cf5449e4fa073fa53341529bf60922adb13c25a3ee50442f346be7","enode://45d7a87c48d6c293473250fb9353ed77af83d278772b305e2934b014588f3746248b5b1a49054fa36b52e939624a08377fe04f7f87decc7b803e7d2ee6ec13d3"]);
    //this.runGame();
  },
  // use this for initialization
  onLoad: function onLoad() {
    Log.Trace("[GameHall:onLoad]"); //this.onListTable("");
    //return;
    //this.nickname.string = cc.dgame.settings.account.Nickname

    cc.sys.dump();
    Log.Info("cc.sys.isNative = " + cc.sys.isNative);
    var isRunning = false;

    if (cc.sys.isNative) {
      if (cc.sys.isMobile) {
        if (cc.sys.os === cc.sys.OS_IOS) {
          isRunning = jsb.reflection.callStaticMethod("NativeGengine", "isRunning");
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
          isRunning = jsb.reflection.callStaticMethod("io/kaleidochain/NativeGengine", "isRunning", "()Z");
        }
      } else {
        if (cc.sys.os === cc.sys.OS_WINDOWS || cc.sys.os === cc.sys.OS_OSX) {
          isRunning = IsRunning();
        }
      }
    }

    Log.Info("isRunning = " + isRunning);

    if (!isRunning) {
      this.scheduleOnce(this.startGengine, 0.1);
    } else {
      Log.Debug("cc.dgame.settings.onOpen: " + cc.dgame.settings.onOpen);

      if (cc.dgame.settings.onOpen == false) {
        this.onOpen();
      } else {
        cc.dgame.roomEventMgr.startListen();
        this.blockInputLayer.active = false;
        cc.dgame.refresh.refreshChips();
        cc.dgame.refresh.refreshKAL();
        cc.dgame.refresh.refreshList("roomType");
        cc.dgame.gameRequestMgr.startCheckGameRequest();
        cc.dgame.clubRequestMgr.startCheckClubRequest();
      }
    }

    cc.director.preloadScene("GameTable", function () {
      Log.Trace("Next scene preloaded");
    });
  },
  startGengine: function startGengine() {
    Log.Debug("startGengine start");
    var ret = false;

    if (cc.sys.isNative) {
      if (cc.sys.isMobile) {
        if (cc.sys.os === cc.sys.OS_IOS) {
          ret = jsb.reflection.callStaticMethod("NativeGengine", "startGameEngineWithAccount:andPassword:", cc.dgame.settings.account.Addr, cc.dgame.settings.account.Password);
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
          ret = jsb.reflection.callStaticMethod("io/kaleidochain/NativeGengine", "startGameEngineWithAccountAndPassword", "(Ljava/lang/String;Ljava/lang/String;)Z", cc.dgame.settings.account.Addr, cc.dgame.settings.account.Password);
        }
      } else {
        if (cc.sys.os === cc.sys.OS_WINDOWS || cc.sys.os === cc.sys.OS_OSX) {
          ret = StartNode(cc.dgame.settings.account.Addr, cc.dgame.settings.account.Password);
        }
      }
    }

    Log.Debug("startGengine ret=" + ret);

    if (ret === false) {
      if (cc.sys.isNative) {
        if (cc.sys.isMobile) {
          if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("NativeGengine", "callNativeUIWithTitle:andContent:", "Gengine启动失败", "启动失败");
          } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showAlertDialog", "(Ljava/lang/String;Ljava/lang/String;)V", "Gengine启动失败", "启动失败");
          }
        } else {
          if (cc.sys.os === cc.sys.OS_WINDOWS || cc.sys.os === cc.sys.OS_OSX) {
            Log.Error("Gengine启动失败");
          }
        }
      }
    } else {
      this.onOpen();
    }
  },
  // called every frame
  update: function update(dt) {},
  onBtnQuickStartClicked: function onBtnQuickStartClicked() {
    cc.dgame.refresh.onBtnQuickStartClicked();
  }
});

cc._RF.pop();