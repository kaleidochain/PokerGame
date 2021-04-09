var Log = require("Log");

cc.Class({
    extends: cc.Component,

    properties: {
        gameRequestPrefab: cc.Prefab,
        _menuLayer: cc.Node,
        _waitingLayer: cc.Node,
        _applyMsgTipsLayer: cc.Node,
        _gameRequestMgrLayer: cc.Node,
        _clubLayer: cc.Node,
        _buyinRequests: cc.Node,
        _noBuyinRequests: cc.Node,
        _waitingSecs: cc.Label,
        _pendingChecked: cc.Node,
        _pendingUnchecked: cc.Node,
        _gameRequestContent: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (!cc.dgame) {
            return;
        }
        this._menuLayer = cc.find("Canvas/MenuLayer");
        this._rechargeLayer = cc.find("Canvas/RechargeLayer");
        this._clubLayer = cc.find("Canvas/ClubLayer");
        this._waitingLayer = cc.find("Canvas/GameRequestMgr/waiting_tips");
        this._applyMsgTipsLayer = cc.find("Canvas/GameRequestMgr/bg_play_apply_msg");
        this._gameRequestMgrLayer = cc.find("Canvas/GameRequestMgr/GameRequests");
        this._buyinRequests = cc.find("Canvas/GameRequestMgr/GameRequests/BuyinReqeusts");
        this._noBuyinRequests = cc.find("Canvas/GameRequestMgr/GameRequests/NoBuyinRequests");
        this._waitingSecs = cc.find("Canvas/GameRequestMgr/waiting_tips/waiting_tips/layout/secNum").getComponent(cc.Label);
        this._pendingChecked = cc.find("Canvas/GameRequestMgr/GameRequests/btnPending/bg_play_apply_checked");
        this._pendingUnchecked = cc.find("Canvas/GameRequestMgr/GameRequests/btnPending/bg_play_apply_unchecked");
        this._gameRequestContent = cc.find("Canvas/GameRequestMgr/GameRequests/BuyinReqeusts/scrollview/view/content");
        cc.dgame.utils.addClickEvent(cc.find("btnBack", this._gameRequestMgrLayer), this.node, "GameRequestMgr", "onBtnCloseGameRequestMgrClicked");
        cc.dgame.utils.addClickEvent(cc.find("btnPending", this._gameRequestMgrLayer), this.node, "GameRequestMgr", "onBtnGameRequestPendingClicked");
        cc.dgame.utils.addClickEvent(this._applyMsgTipsLayer, this.node, "GameRequestMgr", "onBtnApplyMsgTipsClicked");
        cc.dgame.gameRequestMgr = this;
        this.schedule(this.startCheckGameRequest, 60);
        cc.dgame.roomEventMgr.handleNewApprove = this._handleNewApprove.bind(this);
        this._clubRequestTipsActive = false;
        this._pendingRequests = {};
        this.handleCountDownTimeout = null;
        //this._pendingList = {}; //tableid_addr为key，处理时间戳为值，当前时间比记录时间超过5秒可以删除
    },

    _handleNewApprove (data) {
        Log.Trace("[_handleNewApprove] " + JSON.stringify(data));
        let masterClubIDs = new Array();
        masterClubIDs.push(data.ClubID);
        this._getGameRequest(masterClubIDs);
    },

    _onMyClubs (data) {
        Log.Trace("[GameRequestMgr:_onMyClubs] " + JSON.stringify(data));
        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
        let masterClubIDs = new Array();
        if (!data || !data.length) {
        } else {
            for (let i = 0; i < data.length; i++) {
                if (!data[i].Dissolved) {
                    //没解散的俱乐部显示在列表中
                    if (cc.dgame.settings.account.Addr == data[i].OwnerAddr) {
                        masterClubIDs.push(data[i].ClubID);
                    }
                }
            }
        }
        Log.Trace("[GameRequestMgr:_onMyClubs] masterClubID: " + JSON.stringify(masterClubIDs));
        //监听我是群主的俱乐部ID的买入申请
        cc.dgame.net.gameCall(["gameRequest", JSON.stringify(masterClubIDs)]);
        this._getGameRequest(masterClubIDs);
    },

    showWaitingTips () {
        this._waitingLayer.active = true;
        this._countDown = 180;
        this._waitingSecs.string = this._countDown;
        this.schedule(this._waitingCountDown, 1);
    },

    hideWaitingTips () {
        this.unschedule(this._waitingCountDown);
        this._waitingLayer.active = false;
    },

    _onSelfLeave (data) {
        Log.Trace("[_onSelfLeave] data: " + JSON.stringify(data));
    },

    _waitingCountDown () {
        this._countDown = this._countDown - 1;
        if (this._countDown < 0) {
            this.unschedule(this._waitingCountDown);
            this._waitingLayer.active = false;
            if (this.handleCountDownTimeout != null) {
                this.handleCountDownTimeout();
            }
            return;
        }
        this._waitingSecs.string = this._countDown;
    },

    startCheckGameRequest () {
        //不能放到onLoad，GameHall才初始化cc.dgame.net，在onLoad调用会没有响应
        cc.dgame.net.gameCall(["myClubs", ""], this._onMyClubs.bind(this));
    },

    _onGameRequest (data) {
        Log.Trace('[_onGameRequest] ' + JSON.stringify(data));
        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
        this._joinTableList = data;
        let count = 0;
        for (let tableId in this._joinTableList) {
            if (!!this._joinTableList[tableId]["JoinList"] && !!this._joinTableList[tableId]["JoinList"].length) {
                count += this._joinTableList[tableId]["JoinList"].length;
            }
        }
        if (count > 0) {
            if (this._applyMsgTipsLayer.active == false && this._gameRequestMgrLayer.active == false) {
                this._applyMsgTipsLayer.active = true;
            }
            if (this._gameRequestMgrLayer.active) {
                this._updateJoinList();
            }
        } else {
            this._applyMsgTipsLayer.active = false;
        }
    },

    _onApprovedList (data) {
        Log.Trace('[_onApprovedList] ' + JSON.stringify(data));
        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
        this._approvedList = data;
    },

    _getGameRequest (masterClubIDs) {
        Log.Trace("onGameRequestTimer");
        for (let i = 0; i < masterClubIDs.length; i++) {
            var jointablelist_cmd = {
                ClubID: masterClubIDs[i],
            }
            cc.dgame.net.gameCall(["joinTableList", JSON.stringify(jointablelist_cmd)], this._onGameRequest.bind(this));
            cc.dgame.net.gameCall(["approvedList", JSON.stringify(jointablelist_cmd)], this._onApprovedList.bind(this));
        }
    },

    onBtnApplyMsgTipsClicked () {
        this._clubRequestTipsActive = !!cc.dgame.clubRequestMgr && cc.dgame.clubRequestMgr.isTipsActive();
        if (this._clubRequestTipsActive) {
            cc.dgame.clubRequestMgr.hideTips();
        }
        this._applyMsgTipsLayer.active = false;
        this._gameRequestMgrLayer.active = true;
        this._everApproveOrDeny = false;
        if (!!this._menuLayer) {
            this._menuLayer.active = false;
        }
        if (!!this._rechargeLayer) {
            this._rechargeLayer.active = false;
        }
        if (!!this._clubLayer) {
            this._clubLayer.active = false;
        }
        this._updateJoinList();
    },

    _updateJoinList () {
        this._gameRequestContent.removeAllChildren();
        let now = Math.floor(new Date().getTime() / 1000);
        Log.Trace("_updateJoinList: " + JSON.stringify(this._joinTableList) + ", _pendingRequests: " + JSON.stringify(this._pendingRequests) + ", now: " + now);
        let deleteList = new Array();
        for (let addr in this._pendingRequests) {
            if (now - this._pendingRequests[addr] > 5) {
                deleteList.push(addr);
            } else {
                Log.Debug("_updateJoinList, pendingRequest: " + addr + " " + (now - this._pendingRequests[addr]) + "s ago");
            }
        }
        for (let i = 0; i < deleteList.length; i++) {
            delete this._pendingRequests[deleteList[i]];
        }
        Log.Trace("_pendingRequests: " + JSON.stringify(this._pendingRequests));
        for (let tableId in this._joinTableList) {
            for (var i = 0; i < this._joinTableList[tableId]["JoinList"].length; i++) {
                if (!!this._pendingRequests[this._joinTableList[tableId]["JoinList"][i].Addr]) {
                    this._joinTableList[tableId]["JoinList"].splice(i, 1); // 将使后面的元素依次前移，数组长度减1
                    i--; // 如果不减，将漏掉一个元素
                }
            }
            if (this._joinTableList[tableId]["JoinList"].length == 0) {
                delete this._joinTableList[tableId];
            }
        }
        Log.Trace("_updateJoinList: " + JSON.stringify(this._joinTableList));
        for (let tableId in this._joinTableList) {
            if (this._joinTableList[tableId]["JoinList"].length > 0) {
                let gameRequest = cc.instantiate(this.gameRequestPrefab);
                gameRequest.getComponent("GameRequestItem").init({"Type": "TableInfo", "TableId": tableId, "CreatorAddr": this._joinTableList[tableId]["CreatorAddr"]});
                this._gameRequestContent.addChild(gameRequest);
                for (let i = 0; i < this._joinTableList[tableId]["JoinList"].length; i++) {
                    let gameRequest = cc.instantiate(this.gameRequestPrefab);
                    gameRequest.getComponent("GameRequestItem").init({"Type": "Request", "Addr": this._joinTableList[tableId]["JoinList"][i].Addr, "BuyinNum": this._joinTableList[tableId]["JoinList"][i].BuyinNum});
                    this._gameRequestContent.addChild(gameRequest);
                }
            }
        }
        if (this._gameRequestContent.getChildren().length == 0) {
            this._buyinRequests.active = false;
            this._noBuyinRequests.active = true;
        } else {
            this._buyinRequests.active = true;
            this._noBuyinRequests.active = false;
        }
    },
    
    _updateApprovedList () {
        this._buyinRequests.active = true;
        this._noBuyinRequests.active = false;
        this._gameRequestContent.removeAllChildren();
        let approvedList = new Array();
        for (let tableId in this._approvedList) {
            approvedList.push({"TableId": tableId, "Index": this._approvedList[tableId]["Index"]});
        }
        approvedList.sort(function (a, b) {return a.Index - b.Index});
        Log.Trace("sorted approvedList: " + JSON.stringify(approvedList));
        for (let i = 0; i < approvedList.length; i++) {
            let tableId = approvedList[i].TableId;
            if (this._approvedList[tableId]["ApprovedList"].length > 0) {
                let gameResult = cc.instantiate(this.gameRequestPrefab);
                gameResult.getComponent("GameRequestItem").init({"Type": "TableInfo", "TableId": tableId, "CreatorAddr": this._approvedList[tableId]["CreatorAddr"]});
                this._gameRequestContent.addChild(gameResult);
                for (let i = 0; i < this._approvedList[tableId]["ApprovedList"].length; i++) {
                    let gameResult = cc.instantiate(this.gameRequestPrefab);
                    gameResult.getComponent("GameRequestItem").init({"Type": "Result", 
                        "Addr": this._approvedList[tableId]["ApprovedList"][i].Addr, 
                        "BuyinNum": this._approvedList[tableId]["ApprovedList"][i].BuyinNum,
                        "Sender": this._approvedList[tableId]["ApprovedList"][i].Sender,
                        "Result": this._approvedList[tableId]["ApprovedList"][i].Result,
                    });
                    this._gameRequestContent.addChild(gameResult);
                }
            }
        }
    },

    _onApprove (data) {
    },

    approve (addr) {
        this._everApproveOrDeny = true;
        this._pendingRequests[addr] = Math.floor(new Date().getTime() / 1000);
        var approve_cmd = {
            Addr: addr,
            Approved: 1,
        }
        cc.dgame.net.gameCall(["joinApprove", JSON.stringify(approve_cmd)], this._onApprove.bind(this));
        for (let tableId in this._joinTableList) {
            this._joinTableList[tableId]["JoinList"] = this._joinTableList[tableId]["JoinList"].filter(function (v) {
                return v.Addr != addr;
            });
            if (this._joinTableList[tableId]["JoinList"].length == 0) {
                delete this._joinTableList[tableId];
            }
        }
        this._updateJoinList();
    },

    _onDeny (data) {
    },

    deny (addr) {
        this._everApproveOrDeny = true;
        this._pendingRequests[addr] = Math.floor(new Date().getTime() / 1000);
        var deny_cmd = {
            Addr: addr,
            Approved: 0,
        }
        cc.dgame.net.gameCall(["joinApprove", JSON.stringify(deny_cmd)], this._onDeny.bind(this));
        for (let tableId in this._joinTableList) {
            this._joinTableList[tableId]["JoinList"] = this._joinTableList[tableId]["JoinList"].filter(function (v) {
                return v.Addr != addr;
            });
            if (this._joinTableList[tableId]["JoinList"].length == 0) {
                delete this._joinTableList[tableId];
            }
        }
        this._updateJoinList();
    },

    onBtnCloseGameRequestMgrClicked () {
        this._gameRequestMgrLayer.active = false;
        //GameTable的MenuLayer覆盖在GameRequestMgr之上所以进入时要隐藏，退出时恢复
        if (!!this._menuLayer) {
            this._menuLayer.active = true;
        }
        //GameHall、ClubHall的RechargeLayer覆盖在GameRequestMgr之上所以进入时要隐藏，退出时恢复
        if (!!this._rechargeLayer) {
            this._rechargeLayer.active = true;
        }
        //ClubHall的ClubLayer覆盖在GameRequestMgr之上所以进入时要隐藏，退出时恢复
        if (!!this._clubLayer) {
            this._clubLayer.active = true;
        }
        //返回时再查一遍，没有拒绝和批准的仍然留有Tips按钮
        if (this._everApproveOrDeny == false) {
            cc.dgame.net.gameCall(["myClubs", ""], this._onMyClubs.bind(this));
        }
        if (this._clubRequestTipsActive) {
            cc.dgame.clubRequestMgr.showTips();
        }
    },

    onBtnGameRequestPendingClicked () {
        if (this._pendingChecked.active) {
            this._pendingChecked.active = false;
            this._pendingUnchecked.active = true;
            this._updateApprovedList();
        } else {
            this._pendingChecked.active = true;
            this._pendingUnchecked.active = false;
            this._updateJoinList();
        }
    },

    start () {

    },

    onDestroy () {
        this.unschedule(this.startCheckGameRequest);
        if (!!cc.dgame) {
            cc.dgame.gameRequestMgr = null;
        }
    }
    // update (dt) {},
});
