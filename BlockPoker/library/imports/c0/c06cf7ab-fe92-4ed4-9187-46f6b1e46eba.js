"use strict";
cc._RF.push(module, 'c06cfer/pJO1JGHRvax5G66', 'Refresh');
// scripts/components/Refresh.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    _normalLoadingLayer: cc.Node,
    roomsTypeToggles: [cc.Toggle],
    roomsTypeBackgrounds: [cc.Label],
    roomsListScrollViews: [cc.ScrollView],
    clubListScrollView: cc.ScrollView
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    if (!cc.dgame) {
      return;
    }

    this._tableTypeMap = {};
    this._clubTableTypeMap = {};
    this._normalLoadingLayer = cc.find("Canvas/NormalLoadingLayer");
    this._queryChipsBalanceDone = true;
    this._queryKALBalanceDone = true;
    this._queryListTableDone = true;
    this._queryListClubTableDone = true;
    this._scene = cc.director.getScene().name;

    for (var i = 0; i < this.roomsTypeToggles.length; i++) {
      cc.dgame.utils.addToggleClickEvent(this.roomsTypeToggles[i], this.node, "Refresh", "onRoomsTypeClicked");
    }

    cc.dgame.utils.addClickEvent(cc.find("Canvas/btn_refresh"), this.node, "Refresh", "onBtnRefreshClicked");
    cc.dgame.refresh = this;
  },
  start: function start() {},
  _onBalanceOf: function _onBalanceOf(data) {
    Log.Trace("[_onBalanceOf] Scene: " + cc.director.getScene().name + ", " + JSON.stringify(data));

    if (data == "Network disconnected") {
      cc.dgame.normalLoading.showLoadTimeout();
      return;
    }

    cc.dgame.settings.account.Chips = data.Balance; //这个消息回调的时候有可能已经到其他场景了

    if (this._scene == cc.director.getScene().name) {
      this._queryChipsBalanceDone = true;
      var currentChipsNum = cc.find("Canvas/RechargeLayer/ExchangeChips/richtext").getComponent(cc.RichText);
      currentChipsNum.string = "<b>" + cc.dgame.utils.formatValue(cc.dgame.settings.account.Chips) + "</b>";

      this._stopInvokeWaiting();
    }
  },
  _onKALBalance: function _onKALBalance(data) {
    Log.Trace("[_onKALBalance] Scene: " + cc.director.getScene().name + ", " + JSON.stringify(data));

    if (data == "Network disconnected") {
      cc.dgame.normalLoading.showLoadTimeout();
      return;
    }

    cc.dgame.settings.account.KAL = parseFloat(data.Balance) / 1e18; //这个消息回调的时候有可能已经到其他场景了

    if (this._scene == cc.director.getScene().name) {
      this._queryKALBalanceDone = true;
      var currentKALNum = cc.find("Canvas/RechargeLayer/DepositKAL/richtext").getComponent(cc.RichText);
      currentKALNum.string = "<b>" + cc.dgame.utils.formatValue(cc.dgame.settings.account.KAL) + "</b>";

      this._stopInvokeWaiting();
    }
  },
  _onListTable: function _onListTable(data) {
    Log.Trace("[_onListTable] Scene: " + cc.director.getScene().name + ", " + JSON.stringify(data));

    if (data == "Network disconnected") {
      cc.dgame.normalLoading.showLoadTimeout();
      return;
    } //这个消息回调的时候有可能已经到其他场景了


    if (this._scene == cc.director.getScene().name) {
      this._queryListTableDone = true;

      this._stopInvokeWaiting(); //data = JSON.parse('[{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":1,"TableId":1,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":2,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":3,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":4,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":5,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":6,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":7,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":8,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":9,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":10,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":1,"TableId":1,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":2,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":3,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":4,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":5,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":6,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":7,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":8,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":9,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":10,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":1,"TableId":1,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":2,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":3,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":4,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":5,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":6,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":7,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":8,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":9,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":10,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":1,"TableId":1,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":2,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":3,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":4,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":5,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":6,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":7,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":8,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":9,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":10,"Type":3}]');


      var tablelist = new Array(4);
      this._chipsTableList = new Array();

      for (var i = 0; i < tablelist.length; i++) {
        tablelist[i] = new Array();
      }

      for (var _i = 0; _i < data.length; _i++) {
        if (data[_i].TableId > 0xF000000000000) {
          data[_i].Type = 0;
          data[_i].DisplayTableId = data[_i].TableId - 0xF000000000000;
        } else {
          if (data[_i].SmallBlind * 2 < 200) {
            data[_i].Type = 1;
          } else if (data[_i].SmallBlind * 2 < 20000) {
            data[_i].Type = 2;
          } else {
            data[_i].Type = 3;
          }

          data[_i].DisplayTableId = data[_i].TableId - 0xE000000000000;
        }

        tablelist[data[_i].Type].push(data[_i]);

        this._tableTypeMap[data[_i].TableId] = data[_i].Type;
        Log.Trace("[_onListTable] this._tableTypeMap:" + JSON.stringify(this._tableTypeMap));

        if (data[_i].Type != 0) {
          this._chipsTableList.push(data[_i]);
        }
      }

      this._chipsTableList.sort(this._sortBuyinMax);

      Log.Trace("[_onListTable] sorted _chipsTableList: " + JSON.stringify(this._chipsTableList));

      for (var _i2 = 0; _i2 < this.roomsListScrollViews.length; _i2++) {
        var gametableList = this.roomsListScrollViews[_i2].getComponent('GametableList');

        gametableList.populateList(tablelist[_i2]);
      }

      if (!this.roomsTypeToggles[parseInt(cc.sys.localStorage.getItem(this._roomType))].isChecked) {
        this.roomsTypeToggles[parseInt(cc.sys.localStorage.getItem(this._roomType))].check();
      } else {
        this._onSelectRooms(parseInt(cc.sys.localStorage.getItem(this._roomType)));
      }
    }

    if (!!cc.dgame.login && cc.dgame.login.enterRoom == true) {
      Log.Trace("[_onListTable] onLogin cc.dgame.login.data:" + JSON.stringify(cc.dgame.login.data));
      cc.dgame.login.enterRoom = false;
      var loginData = cc.dgame.login.data;
      var tableType = this._tableTypeMap[loginData.ReEnterTableId];

      if (tableType != null) {
        Log.Trace("[_onListTable] onLogin tableType " + tableType);

        var _gametableList = this.roomsListScrollViews[tableType].getComponent("GametableList");

        _gametableList.selectGameTable(loginData.ReEnterTableId);
      }
    }
  },
  _onListClubTable: function _onListClubTable(data) {
    Log.Trace("[_onListClubTable] Scene: " + cc.director.getScene().name + ", " + JSON.stringify(data));

    if (data == "Network disconnected") {
      cc.dgame.normalLoading.showLoadTimeout();
      return;
    } //这个消息回调的时候有可能已经到其他场景了


    if (this._scene == cc.director.getScene().name) {
      this._queryListClubTableDone = true;

      this._stopInvokeWaiting();

      if (!!this.clubListScrollView) {
        //data = JSON.parse('[{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":1,"TableId":1,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":2,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":3,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":4,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":5,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":6,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":7,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":8,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":9,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":10,"Type":0},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":1,"TableId":1,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":2,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":3,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":4,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":5,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":6,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":7,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":8,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":9,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":10,"Type":1},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":1,"TableId":1,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":2,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":3,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":4,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":5,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":6,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":7,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":8,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":9,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":10,"Type":2},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":1,"TableId":1,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":2,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":3,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":4,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":5,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":6,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":7,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":8,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":9,"Type":3},{"Ante":5,"BuyinMax":800,"BuyinMin":200,"CurrentStatu":0,"MaxNum":8,"MinNum":2,"PlayerNum":1,"SmallBlind":5,"Straddle":0,"TableId":10,"Type":3}]');
        var tablelist = new Array();

        for (var i = 0; i < data.length; i++) {
          var clubid = Math.floor(data[i].TableId / 0x10000000);
          data[i].DisplayTableId = data[i].TableId - clubid * 0x10000000;
          tablelist.push(data[i]);
          this._clubTableTypeMap[data[i].TableId] = 1;
        }

        tablelist.sort(this._sortBuyinMax);
        Log.Trace("[_onListClubTable] tablelist: " + JSON.stringify(tablelist));
        var gametableList = this.clubListScrollView.getComponent('ClubGameTableList');
        gametableList.populateList(tablelist);
      }
    }

    if (!!cc.dgame.login && cc.dgame.login.enterClubRoom == true) {
      Log.Trace("[_onListClubTable] onLogin cc.dgame.login.data:" + JSON.stringify(cc.dgame.login.data));
      cc.dgame.login.enterClubRoom = false;
      var loginData = cc.dgame.login.data;
      var clubTableType = this._clubTableTypeMap[loginData.ReEnterTableId];

      if (clubTableType != null) {
        Log.Trace("[_onListClubTable] onLogin clubTableType " + clubTableType);

        var _gametableList2 = this.clubListScrollView.getComponent("ClubGameTableList");

        _gametableList2.selectGameTable(loginData.ReEnterTableId);
      }
    }
  },
  _onSelectRooms: function _onSelectRooms(index) {
    for (var i = 0; i < this.roomsTypeBackgrounds.length; i++) {
      if (index == i) {
        cc.sys.localStorage.setItem(this._roomType, index);
        this.roomsTypeBackgrounds[i].node.active = false;
        this.roomsListScrollViews[i].node.active = true;
      } else {
        this.roomsTypeBackgrounds[i].node.active = true;
        this.roomsListScrollViews[i].node.active = false;
      }
    }
  },
  onRoomsTypeClicked: function onRoomsTypeClicked(toggle) {
    var index = this.roomsTypeToggles.indexOf(toggle);

    this._onSelectRooms(index);
  },
  refreshChips: function refreshChips() {
    this._queryChipsBalanceDone = false;
    this._scene = cc.director.getScene().name;

    this._startInvokeWaiting();

    var self = this;
    this.scheduleOnce(function () {
      cc.dgame.net.gameCall(["balanceOf", ""], self._onBalanceOf.bind(self));
    }, 0.05);
  },
  refreshKAL: function refreshKAL() {
    this._queryKALBalanceDone = false;
    this._scene = cc.director.getScene().name;

    this._startInvokeWaiting();

    var self = this;
    this.scheduleOnce(function () {
      cc.dgame.net.gameCall(["KalBalance", ""], self._onKALBalance.bind(self));
    }, 0.05);
  },
  refreshList: function refreshList(roomType) {
    this._startInvokeWaiting();

    this._roomType = roomType;
    this._queryListTableDone = false;
    this._scene = cc.director.getScene().name;
    var self = this;
    this.scheduleOnce(function () {
      cc.dgame.net.gameCall(["listfreetable", ""], self._onListTable.bind(self));
    }, 0.05);
  },
  refreshClubList: function refreshClubList() {
    this._startInvokeWaiting();

    this._queryListClubTableDone = false;
    var self = this;
    this.scheduleOnce(function () {
      var listclubtable_cmd = {
        ClubID: cc.dgame.settings.account.ClubID
      };
      cc.dgame.net.gameCall(["listclubtable", JSON.stringify(listclubtable_cmd)], self._onListClubTable.bind(self));
    }, 0.05);
  },
  _startInvokeWaiting: function _startInvokeWaiting() {
    if (this._normalLoadingLayer.active) {
      return;
    }

    this._normalLoadingLayer.active = true;
  },
  _stopInvokeWaiting: function _stopInvokeWaiting() {
    if (this._queryChipsBalanceDone && this._queryKALBalanceDone) {
      if (this._queryListTableDone && this._queryListClubTableDone) {
        this._normalLoadingLayer.active = false;
      }

      this.addComponent("RechargePopup");
      cc.dgame.rechargePopup.RefreshData();
    }
  },
  onBtnRefreshClicked: function onBtnRefreshClicked() {
    this.refreshChips();
    this.refreshKAL();

    if (!!this._roomType) {
      this.refreshList(this._roomType);
    }

    if (!!cc.dgame.settings.account.ClubID) {
      this.refreshClubList();
    }
  },
  onDestroy: function onDestroy() {
    if (!!cc.dgame) {
      cc.dgame.refresh = null;
    }
  },
  //根据最大带入金额从大到小排序，相同金额人数多的优先，桌号小的优先
  _sortBuyinMax: function _sortBuyinMax(a, b) {
    if (parseInt(a.BuyinMax) == parseInt(b.BuyinMax)) {
      if (parseInt(a.PlayerNum) == parseInt(b.PlayerNum)) {
        return parseInt(b.TableId) - parseInt(a.TableId);
      }

      return parseInt(b.TableId) - parseInt(a.TableId);
    }

    return parseInt(a.BuyinMax) - parseInt(b.BuyinMax);
  },
  onBtnQuickStartClicked: function onBtnQuickStartClicked() {
    for (var i = 0; i < this._chipsTableList.length; i++) {
      var gametableList = this.roomsListScrollViews[this._chipsTableList[i].Type].getComponent("GametableList");

      Log.Trace("[onBtnQuickStartClicked] tableid: " + this._chipsTableList[i].TableId + ", chips: " + cc.dgame.settings.account.Chips + ", BuyinMax: " + this._chipsTableList[i].BuyinMax + ", 5 * BuyinMax / 2: " + 5 * parseInt(this._chipsTableList[i].BuyinMax) / 2);

      if (cc.dgame.settings.account.Chips > 5 * parseInt(this._chipsTableList[i].BuyinMax) / 2 && this._chipsTableList[i].PlayerNum < 9) {
        return gametableList.selectGameTable(this._chipsTableList[i].TableId);
      }
    }

    cc.dgame.rechargePopup.onBtnShowExchangeChipsClicked();
  } // update (dt) {},

});

cc._RF.pop();