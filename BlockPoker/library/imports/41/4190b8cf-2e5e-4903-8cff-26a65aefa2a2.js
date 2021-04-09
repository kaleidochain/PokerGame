"use strict";
cc._RF.push(module, '4190bjPLl5JA4z/JqZa76Ki', 'RoomEventMgr');
// scripts/components/RoomEventMgr.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {},
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    if (!cc.dgame) {
      return;
    }

    cc.dgame.roomEventMgr = this;
  },
  onDestroy: function onDestroy() {
    if (!!cc.dgame) {
      cc.dgame.net.removeEventListener(["roomEvent"]);
      cc.dgame.roomEventMgr = null;
    }
  },
  start: function start() {},
  startListen: function startListen() {
    cc.dgame.net.addEventListener(["roomEvent", 0], this._onRoomEvent.bind(this));
  },
  _onRoomEvent: function _onRoomEvent(data) {
    Log.Trace("[_onRoomEvent] " + JSON.stringify(data));

    if (data.Event == "CreateTable") {
      if (!!this.handleCreateTable) {
        this.handleCreateTable(data.Params);
      } else {
        Log.Trace("ignore CreateTable event");
      }
    } else if (data.Event == "NewClub") {
      if (!!this.handleNewClub) {
        this.handleNewClub(data.Params);
      } else {
        Log.Trace("ignore NewClub event");
      }
    } else if (data.Event == "JoinClub") {
      if (!!this.handleJoinClub) {
        this.handleJoinClub(data.Params);
      } else {
        Log.Trace("ignore JoinClub event");
      }
    } else if (data.Event == "JoinClubApproved") {
      if (!!this.handleJoinClubApproved) {
        this.handleJoinClubApproved(data.Params);
      } else {
        Log.Trace("ignore JoinClubApproved event");
      }
    } else if (data.Event == "newApprove") {
      if (!!this.handleNewApprove) {
        this.handleNewApprove(data.Params);
      } else {
        Log.Trace("ignore newApprove event");
      }
    } else if (data.Event == "ConnectStatus") {
      this._handleConnectStatus(data.Params);
    }
  },
  _handleConnectStatus: function _handleConnectStatus(statusInfo) {
    Log.Trace("[_handleConnectStatus] " + JSON.stringify(statusInfo) + ", cc.dgame.tips: " + cc.dgame.tips + ", scene: " + cc.director.getScene().name);

    if (statusInfo.Status == false) {
      cc.dgame.tips.showReConnecttingTips();
    } else {
      if (cc.director.getScene().name == 'GameTable') {
        var subGameTable_cmd = {
          TableId: cc.dgame.tableInfo.TableId
        };
        cc.dgame.net.gameCall(["reSubscribeGameTable", JSON.stringify(subGameTable_cmd)]);
      }

      cc.dgame.net.gameCall(["reSubscribeClub", ""]);
      cc.dgame.tips.showReConnectSuccessTips();
    }
  } // update (dt) {},

});

cc._RF.pop();