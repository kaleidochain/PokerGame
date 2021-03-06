"use strict";
cc._RF.push(module, '8a6355g+6ZKVoN6iauy8c3g', 'GameReviewPopup');
// scripts/components/GameReviewPopup.js

"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var Log = require('Log');

cc.Class({
  "extends": cc.Component,
  properties: {
    _gameReviewPopup: cc.Node
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    if (!cc.dgame) {
      return;
    }

    this._gameReviewPopup = cc.find("Canvas/MenuLayer/GameReviewPopup");
    cc.dgame.utils.addClickEvent(cc.find("returnBackground", this._gameReviewPopup), this.node, "GameReviewPopup", "onBtnCloseGameReviewClicked");

    if (!!cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BtnGameReview")) {
      cc.dgame.utils.addClickEvent(cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BtnGameReview"), this.node, "GameReviewPopup", "onBtnGameReviewClicked");
    }

    cc.dgame.utils.addClickEvent(cc.find("sprite_splash/ReplayControlLayer/btnVerify", this._gameReviewPopup), this.node, "GameReviewPopup", "onBtnVerificateClicked");
    cc.dgame.utils.addClickEvent(cc.find("sprite_splash/ReplayControlLayer/btnReplay", this._gameReviewPopup), this.node, "GameReviewPopup", "onBtnReplayClicked");
    cc.dgame.utils.addClickEvent(cc.find("sprite_splash/ReplayControlLayer/ReplayControl/FirstGame", this._gameReviewPopup), this.node, "GameReviewPopup", "onBtnFirstGameClicked");
    cc.dgame.utils.addClickEvent(cc.find("sprite_splash/ReplayControlLayer/ReplayControl/PrevGame", this._gameReviewPopup), this.node, "GameReviewPopup", "onBtnPrevGameClicked");
    cc.dgame.utils.addClickEvent(cc.find("sprite_splash/ReplayControlLayer/ReplayControl/NextGame", this._gameReviewPopup), this.node, "GameReviewPopup", "onBtnNextGameClicked");
    cc.dgame.utils.addClickEvent(cc.find("sprite_splash/ReplayControlLayer/ReplayControl/LastGame", this._gameReviewPopup), this.node, "GameReviewPopup", "onBtnLastGameClicked");
    this.GameResults = new Array();
    this.Idx = 0;
    cc.dgame.gameReviewPopup = this;
  },
  start: function start() {},
  //?????????????????????????????????????????????????????????
  onBtnCloseGameReviewClicked: function onBtnCloseGameReviewClicked() {
    this._gameReviewPopup.active = false;
  },
  //?????????????????????????????????????????????cc.dgame.gameReviewPopup.Hand??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????cc.dgame.gameReviewPopup.Hand????????????????????????????????????
  onBtnGameReviewClicked: function onBtnGameReviewClicked() {
    var popup = cc.find('sprite_splash', this._gameReviewPopup);
    var dstv2 = popup.getPosition();
    popup.setPosition(cc.winSize.width / 2, 0);
    popup.runAction(cc.moveTo(0.2, dstv2));
    this._gameReviewPopup.active = true;
    var allGameList = JSON.parse(cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_gamelist"));
    allGameList = allGameList.reverse();
    this.GameResults = new Array();

    for (var i = 0; i < allGameList.length; i++) {
      Log.Trace("[" + (i + 1) + "/" + allGameList.length + "]: " + allGameList[i]);
      var tableid_hand = allGameList[i].split("_");

      if (!this.Hand) {
        //?????????????????????????????????TableId??????????????????
        if (tableid_hand[0] == this.TableId) {
          var gameResult = JSON.parse(cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_" + allGameList[i] + "_result")); // Log.Trace("[onBtnGameReviewClicked] " + "i:" + i + " ,gameResult:" + JSON.stringify(gameResult));

          this.GameResults.push(gameResult);
        }
      } else {
        var _gameResult = JSON.parse(cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_" + allGameList[i] + "_result")); // Log.Trace("[onBtnGameReviewClicked] " + "i:" + i + " ,gameResult:" + JSON.stringify(gameResult));


        this.GameResults.push(_gameResult); //?????????????????????????????????????????????

        if (tableid_hand[1] == this.Hand && this.TableId == tableid_hand[0]) {
          this.Idx = i;
        }
      }
    }

    if (!this.Hand) {
      //???????????????????????????????????????????????????
      this.Idx = this.GameResults.length - 1;
    }

    if (this.GameResults.length > 0) {
      //???????????????????????????????????????
      var slider = cc.find('sprite_splash/ReplayControlLayer/gameReviewSlider', this._gameReviewPopup).getComponent(cc.Slider);
      slider.node.on('slide', function (event) {
        if (this.GameResults.length == 1) {
          slider.progress = 1;
        } else {
          slider.progress = parseInt(slider.progress * this.GameResults.length) / this.GameResults.length;
        }

        var progressBar = cc.find('sprite_splash/ReplayControlLayer/gameReviewSlider', this._gameReviewPopup).getComponent(cc.ProgressBar);
        progressBar.progress = slider.progress;
        var newIdx = parseInt(slider.progress * this.GameResults.length);

        if (newIdx != this.Idx) {
          this._showGameResult(newIdx);
        }
      }, this);

      this._showGameResult(this.Idx);
    } else {
      var gameTime = cc.find('sprite_splash/HeaderLayer/gametime', this._gameReviewPopup).getComponent(cc.Label);
      gameTime.string = '';
    }
  },
  //???????????????idx???????????????
  _showGameResult: function _showGameResult(idx) {
    Log.Trace("[_showGameResult] " + "idx:" + idx);
    var pot = cc.find('sprite_splash/HeaderLayer/layout/pot', this._gameReviewPopup).getComponent(cc.RichText);
    var gameTime = cc.find('sprite_splash/HeaderLayer/gametime', this._gameReviewPopup).getComponent(cc.Label);
    var blindInfoNode = cc.find('sprite_splash/HeaderLayer/layout/blindinfo', this._gameReviewPopup);
    var blindInfo = null;

    if (!!blindInfoNode) {
      blindInfo.getComponent(cc.Label);
    }

    var roomIDNode = cc.find('sprite_splash/HeaderLayer/layout/tableid', this._gameReviewPopup);
    var roomID = null;

    if (!!roomIDNode) {
      roomID.getComponent(cc.Label);
    }

    var gameReviewPlayerList = cc.find('sprite_splash/scrollview', this._gameReviewPopup).getComponent('GameReviewPlayerList');
    var gameIndex = cc.find('sprite_splash/ReplayControlLayer/ReplayControl/gameIndex', this._gameReviewPopup).getComponent(cc.Label);
    var slider = cc.find('sprite_splash/ReplayControlLayer/gameReviewSlider', this._gameReviewPopup).getComponent(cc.Slider);
    var progressBar = cc.find('sprite_splash/ReplayControlLayer/gameReviewSlider', this._gameReviewPopup).getComponent(cc.ProgressBar);
    var gameResult = this.GameResults[idx]; // Log.Trace("[_showGameResult] " + "gameResult:" + JSON.stringify(gameResult));

    pot.string = cc.dgame.utils.formatRichText(cc.dgame.utils.formatValue(gameResult.Pot), "#FFAE44", true, false);

    if (!!roomID) {
      roomID.string = gameResult.FullTableId;
    }

    if (!!blindInfo) {
      blindInfo.string = gameResult.BlindInfo;
    }

    gameTime.string = gameResult.GameTime;
    gameIndex.string = idx + 1 + '/' + this.GameResults.length;
    var INSResultNode = cc.find("sprite_splash/ins_layer", this._gameReviewPopup);
    INSResultNode.active = false;
    var scrollViewWidget = cc.find("sprite_splash/scrollview", this._gameReviewPopup).getComponent(cc.Widget);
    var headerLayer = cc.find("sprite_splash/HeaderLayer", this._gameReviewPopup);

    if (gameResult.INSSelfWin != null) {
      Log.Trace("[gameResult.INSSelfWin] " + "gameResult.INSSelfWin:" + gameResult.INSSelfWin);
      var insuranceText = cc.find("value", INSResultNode).getComponent(cc.RichText);
      insuranceText.string = cc.dgame.utils.formatRichText(gameResult.INSSelfWin, "#FFBC1D", true, false);
      Log.Trace("[_showGameResult] " + "scrollViewWidget.top:" + scrollViewWidget.top);
      Log.Trace("[_showGameResult] " + "scrollViewWidget.y:" + scrollViewWidget.node.y);
      scrollViewWidget.top = headerLayer.height + INSResultNode.height + 5;
      INSResultNode.active = true;
      scrollViewWidget.updateAlignment();
      Log.Trace("[_showGameResult] " + "scrollViewWidget.top2:" + scrollViewWidget.top);
      Log.Trace("[_showGameResult] " + "scrollViewWidget.node.y2:" + scrollViewWidget.node.y);
    } else {
      Log.Trace("[_showGameResult] " + "scrollViewWidget.node.y3:" + scrollViewWidget.node.y);
      scrollViewWidget.top = headerLayer.height;
      scrollViewWidget.updateAlignment();
      Log.Trace("[_showGameResult] " + "scrollViewWidget.top3:" + scrollViewWidget.top);
      Log.Trace("[_showGameResult] " + "scrollViewWidget.node.y4:" + scrollViewWidget.node.y);
    }

    gameReviewPlayerList.populateList(gameResult.PlayerInfo);
    this.Idx = idx;

    if (this.GameResults.length > 1) {
      slider.progress = idx / (this.GameResults.length - 1);
      progressBar.progress = slider.progress;
    }
  },
  //???????????????????????????
  onBtnFirstGameClicked: function onBtnFirstGameClicked() {
    if (this.GameResults.length > 0) {
      this._showGameResult(0);
    }
  },
  //???????????????
  onBtnPrevGameClicked: function onBtnPrevGameClicked() {
    if (this.GameResults.length > 0 && this.Idx - 1 >= 0) {
      this._showGameResult(this.Idx - 1);
    }
  },
  //???????????????
  onBtnNextGameClicked: function onBtnNextGameClicked() {
    if (this.GameResults.length > 0 && this.Idx + 1 < this.GameResults.length) {
      this._showGameResult(this.Idx + 1);
    }
  },
  //??????????????????
  onBtnLastGameClicked: function onBtnLastGameClicked() {
    if (this.GameResults.length > 0) {
      this._showGameResult(this.GameResults.length - 1);
    }
  },
  _onVerify: function _onVerify(data) {
    Log.Trace('[_onVerify] ' + _typeof(data));

    if (_typeof(data) == "object") {
      Log.Trace('[_onVerify] ' + JSON.stringify(data));

      if (cc.sys.isNative) {
        if (cc.sys.isMobile) {
          if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod('NativeGengine', 'openURL:', data.result);
          } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity', 'openURL', '(Ljava/lang/String;)V', data.result);
          }
        } else if (cc.sys.os === cc.sys.OS_WINDOWS || cc.sys.os === cc.sys.OS_OSX) {
          openURL(data.result);
        }
      }
    }
  },
  onBtnVerificateClicked: function onBtnVerificateClicked() {
    var gameResult = this.GameResults[this.Idx];
    Log.Trace('[onBtnVerificateClicked] Verify TableId: ' + gameResult.TableId + ', Hand: ' + gameResult.Hand);
    var verify_cmd = {
      Tableid: gameResult.TableId,
      Hand: gameResult.Hand
    };
    cc.dgame.net.gameCall(['verify', JSON.stringify(verify_cmd)], this._onVerify.bind(this));
  },
  onBtnReplayClicked: function onBtnReplayClicked() {
    var gameResult = this.GameResults[this.Idx];
    Log.Trace('[onBtnReplayClicked] Play TableId: ' + gameResult.FullTableId + ', Hand: ' + gameResult.Hand);
    cc.dgame.gameReplayPopup.replay(gameResult.Hand);
  },
  onDestroy: function onDestroy() {
    if (!!cc.dgame) {
      cc.dgame.gameReviewPopup = null;
    }
  } // update (dt) {},

});

cc._RF.pop();