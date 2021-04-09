"use strict";
cc._RF.push(module, '73136A2HppOUaZZHVVyYWSq', 'ClubRequestMgr');
// scripts/components/ClubRequestMgr.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    clubApplicationItem: cc.Prefab,
    //俱乐部成员审批预制资源
    _clubApplicationLayout: cc.Layout,
    //俱乐部成员审批列表
    _applyMsgTipsLayer: cc.Node,
    _clubRequestMgrLayer: cc.Node,
    _rechargeLayer: cc.Node
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    if (!cc.dgame) {
      return;
    }

    this._rechargeLayer = cc.find("Canvas/RechargeLayer");
    this._applyMsgTipsLayer = cc.find("Canvas/ClubRequestMgr/bg_play_apply_msg");
    this._clubRequestMgrLayer = cc.find("Canvas/ClubRequestMgr/ClubApplicationsPopup");
    this._clubApplicationLayout = cc.find("toast_bg/scrollview/view/content", this._clubRequestMgrLayer).getComponent(cc.Layout);
    cc.dgame.utils.addClickEvent(cc.find("toast_bg/bg_club_popup_close", this._clubRequestMgrLayer), this.node, "ClubRequestMgr", "onBtnCloseClubRequestMgrClicked");
    cc.dgame.utils.addClickEvent(this._applyMsgTipsLayer, this.node, "ClubRequestMgr", "onBtnApplyMsgTipsClicked");
    cc.dgame.clubRequestMgr = this;
    this._applicationList = {};
    this.schedule(this.startCheckClubRequest, 60);
    cc.dgame.roomEventMgr.handleJoinClub = this._handleJoinClub.bind(this);
  },
  _handleJoinClub: function _handleJoinClub(data) {
    Log.Trace("[_handleJoinClub] " + JSON.stringify(data));
    cc.dgame.net.gameCall(["myClubs", ""], this._onMyClubs.bind(this));
  },
  _onMyClubs: function _onMyClubs(data) {
    Log.Trace("[ClubRequestMgr:_onMyClubs] " + JSON.stringify(data));

    if (data == "Network disconnected") {
      cc.dgame.normalLoading.showLoadTimeout();
      return;
    }

    var masterClubIDs = new Array();

    if (!data || !data.length) {} else {
      for (var i = 0; i < data.length; i++) {
        if (!data[i].Dissolved) {
          //没解散的俱乐部显示在列表中
          if (cc.dgame.settings.account.Addr == data[i].OwnerAddr) {
            masterClubIDs.push(data[i].ClubID);
          }
        }
      }
    }

    Log.Trace("[ClubRequestMgr:_onMyClubs] masterClubID: " + JSON.stringify(masterClubIDs)); //监听我是群主的俱乐部ID的加入申请

    cc.dgame.net.gameCall(["joinClubIDs", JSON.stringify(masterClubIDs)]);

    this._checkApplications(masterClubIDs);
  },
  _checkApplications: function _checkApplications(masterClubIDs) {
    Log.Trace("onClubRequestTimer");
    cc.dgame.net.gameCall(["getJoinClubApplications", JSON.stringify(masterClubIDs)], this._onGetJoinClubApplications.bind(this));
  },
  _onGetJoinClubApplications: function _onGetJoinClubApplications(data) {
    Log.Trace('[_onGetJoinClubApplications] currentScene: ' + cc.director.getScene().name + ', ' + JSON.stringify(data));

    if (data == "Network disconnected") {
      cc.dgame.normalLoading.showLoadTimeout();
      return;
    }

    this._applicationList = data;
    var count = 0;

    for (var clubid in this._applicationList) {
      if (!!this._applicationList[clubid] && !!this._applicationList[clubid].length) {
        count += this._applicationList[clubid].length;
      }
    }

    if (count > 0) {
      if (this._applyMsgTipsLayer.active == false && this._clubRequestMgrLayer.active == false) {
        this._applyMsgTipsLayer.active = true;
      }
    } else {
      this._applyMsgTipsLayer.active = false;
    }
  },
  _updateApplicationList: function _updateApplicationList() {
    this._clubApplicationLayout.node.removeAllChildren();

    for (var clubid in this._applicationList) {
      if (!!this._applicationList[clubid].length) {
        for (var i = 0; i < this._applicationList[clubid].length; i++) {
          var clubApplication = cc.instantiate(this.clubApplicationItem);
          clubApplication.getComponent("ClubApplicationItem").init(cc.director.getScene().name, parseInt(clubid), this._applicationList[clubid][i]);

          this._clubApplicationLayout.node.addChild(clubApplication);
        }
      }
    }
  },
  startCheckClubRequest: function startCheckClubRequest() {
    //不能放到onLoad，GameHall才初始化cc.dgame.net，在onLoad调用会没有响应
    cc.dgame.net.gameCall(["myClubs", ""], this._onMyClubs.bind(this));
  },
  onBtnApplyMsgTipsClicked: function onBtnApplyMsgTipsClicked() {
    this._applyMsgTipsLayer.active = false;
    this._clubRequestMgrLayer.active = true;
    this._everApproveOrDeny = false;

    if (!!cc.dgame.mainMenuPopup) {
      cc.dgame.mainMenuPopup.disable();
    }

    if (!!this._rechargeLayer) {
      this._rechargeLayer.active = false;
    }

    this._updateApplicationList();
  },
  approve: function approve(clubid, addr) {
    this.approveAddr = addr;
    this.approveClubID = clubid;
    this._everApproveOrDeny = true;
    var approve_cmd = {
      ClubID: clubid,
      Addr: addr
    };
    cc.dgame.net.gameCall(["approveJoinClub", JSON.stringify(approve_cmd)], this._onApprove.bind(this));
  },
  deny: function deny(clubid, addr) {
    this.approveAddr = addr;
    this.approveClubID = clubid;
    this._everApproveOrDeny = true;
    var deny_cmd = {
      ClubID: clubid,
      Addr: addr
    };
    cc.dgame.net.gameCall(["denyJoinClub", JSON.stringify(deny_cmd)], this._onApprove.bind(this));
  },
  _onApprove: function _onApprove(data) {
    Log.Trace("[_onApprove]");
    var applications = new Array();

    for (var i = 0; i < this._clubApplicationLayout.node.getChildren().length; i++) {
      var clubApplication = this._clubApplicationLayout.node.getChildren()[i].getComponent("ClubApplicationItem");

      if (clubApplication.addr != this.approveAddr || clubApplication.clubid != this.approveClubID) {
        applications.push(this._clubApplicationLayout.node.getChildren()[i]);
      }
    }

    this._clubApplicationLayout.node.removeAllChildren();

    for (var _i = 0; _i < applications.length; _i++) {
      this._clubApplicationLayout.node.addChild(applications[_i]);
    }

    if (applications.length == 0) {
      this._applyMsgTipsLayer.active = false;
    }
  },
  onBtnCloseClubRequestMgrClicked: function onBtnCloseClubRequestMgrClicked() {
    this._clubRequestMgrLayer.active = false; //GameTable的MenuLayer覆盖在GameRequestMgr之上所以进入时要隐藏，退出时恢复

    if (!!cc.dgame.mainMenuPopup) {
      cc.dgame.mainMenuPopup.enable();
    } //GameHall、ClubHall的RechargeLayer覆盖在GameRequestMgr之上所以进入时要隐藏，退出时恢复


    if (!!this._rechargeLayer) {
      this._rechargeLayer.active = true;
    } //返回时再查一遍，没有拒绝和批准的仍然留有Tips按钮


    if (this._everApproveOrDeny == false) {
      cc.dgame.net.gameCall(["myClubs", ""], this._onMyClubs.bind(this));
    }
  },
  //由于ClubRequestMgr覆盖在GameRequestMgr之上，提供这三个接口供GameRequesstMgr调用
  isTipsActive: function isTipsActive() {
    return this._applyMsgTipsLayer.active == true;
  },
  hideTips: function hideTips() {
    this._applyMsgTipsLayer.active = false;
  },
  showTips: function showTips() {
    this._applyMsgTipsLayer.active = true;
  },
  start: function start() {},
  onDestroy: function onDestroy() {
    this.unschedule(this.startCheckClubRequest);

    if (!!cc.dgame) {
      cc.dgame.clubRequestMgr = null;
    }
  } // update (dt) {},

});

cc._RF.pop();