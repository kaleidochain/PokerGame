"use strict";
cc._RF.push(module, '55793jCwThMrbYVFoDJ19wl', 'InvitationHelper');
// scripts/components/InvitationHelper.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {},
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    Log.Trace("InvitationHelper:onLoad");

    if (!cc.dgame) {
      return;
    }

    cc.dgame.invitation = this;
    cc.dgame.invitation.InvitationCode = "";
    cc.dgame.invitation.TotalReward = 0;
    cc.dgame.invitation.InvitedNum = 0;
    cc.dgame.invitation.FailCount = 0;
    cc.game.addPersistRootNode(this.node);
  },
  onDestroy: function onDestroy() {
    Log.Trace("InvitationHelper:onDestroy");
    this.unschedule(this._onCheckTimer);

    if (!!cc.dgame) {
      cc.dgame.invitation = null;
    }
  },
  startCheck: function startCheck() {
    Log.Trace("invitationHelper startCheck, cc.dgame.settings.account.LoginCount: " + cc.dgame.settings.account.LoginCount);

    if (cc.dgame.settings.account.LoginCount == 0) {
      this.scheduleOnce(this._onCheckTimer, 5);
    } else {
      this._onCheckTimer();
    }

    this.schedule(this._onCheckTimer, 60);
  },
  _onCheckTimer: function _onCheckTimer() {
    cc.dgame.net.gameCall(["getCode", ""], this._onGetInvitationCode.bind(this));
  },
  _onHashData: function _onHashData(hash) {
    Log.Trace("[_onHashData] hashData(" + cc.dgame.invitation.CandidateInvitationCodeSource + ") = " + hash);
    cc.dgame.invitation.CandidateInvitationCodeSource = hash;
    cc.dgame.invitation.CandidateInvitationCode = cc.dgame.invitation.CandidateInvitationCodeSource.substr(0, 6).toUpperCase();
    var applycode_cmd = {
      InvitationCode: cc.dgame.invitation.CandidateInvitationCode
    };
    cc.dgame.net.gameCall(["applyCode", JSON.stringify(applycode_cmd)], this._onApplyInvitationCode.bind(this));
  },
  _onApplyInvitationCode: function _onApplyInvitationCode(err) {
    Log.Trace("[_onApplyInvitationCode] err = " + err);

    if (err == "Network disconnected") {
      cc.dgame.normalLoading.showLoadTimeout();
      return;
    }

    if (err == "") {
      cc.dgame.invitation.InvitationCode = cc.dgame.invitation.CandidateInvitationCode;
      delete cc.dgame.invitation.CandidateInvitationCode;
      delete cc.dgame.invitation.CandidateInvitationCodeSource;
    } else {
      var hashdata_cmd = {
        Data: cc.dgame.invitation.CandidateInvitationCodeSource
      };
      cc.dgame.net.gameCall(["hashData", JSON.stringify(hashdata_cmd)], this._onHashData.bind(this));
    }
  },
  _onInviter: function _onInviter(invitationCode) {
    Log.Trace("[_onInviter] " + invitationCode);

    if (invitationCode == "Network disconnected") {
      cc.dgame.normalLoading.showLoadTimeout();
      return;
    }

    cc.dgame.invitation.InviterInvitationCode = invitationCode;
  },
  _onGetInvitationCode: function _onGetInvitationCode(obj) {
    Log.Trace("[_onGetInvitationCode] " + JSON.stringify(obj));

    if (obj == "Network disconnected") {
      cc.dgame.normalLoading.showLoadTimeout();
      return;
    }

    if (obj.InvitationCode == "") {
      //???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
      cc.dgame.invitation.FailCount++;
      Log.Trace("[_onGetInvitationCode] FailCount: " + cc.dgame.invitation.FailCount);

      if (cc.dgame.invitation.FailCount < 10) {
        cc.dgame.invitation.CandidateInvitationCodeSource = cc.dgame.settings.account.Addr.substr(2);
        cc.dgame.invitation.CandidateInvitationCode = cc.dgame.invitation.CandidateInvitationCodeSource.substr(0, 6).toUpperCase();
        var applycode_cmd = {
          InvitationCode: cc.dgame.invitation.CandidateInvitationCode
        };
        cc.dgame.net.gameCall(["applyCode", JSON.stringify(applycode_cmd)], this._onApplyInvitationCode.bind(this));
      }
    } else {
      cc.dgame.invitation.InvitationCode = obj.InvitationCode;
      cc.dgame.invitation.TotalReward = obj.TotalReward;
      cc.dgame.invitation.InvitedNum = obj.InvitedNum;
      cc.dgame.net.gameCall(["inviter", ""], this._onInviter.bind(this));
    }
  },
  start: function start() {} // update (dt) {},

});

cc._RF.pop();