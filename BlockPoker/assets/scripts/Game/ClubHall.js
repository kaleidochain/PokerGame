var Log = require('Log');

cc.Class({
    extends: cc.Component,

    properties: {
        noClubLayer: cc.Node,       //没有加入俱乐部时的界面
        clubLayer: cc.Node,         //已加入俱乐部后的界面
        joinClubLayer: cc.Node,     //加入俱乐部界面
        joinClubToastLayer: cc.Node,//加入俱乐部确认对话框
        createClubLayer: cc.Node,   //创建俱乐部界面
        newClubName: cc.EditBox,    //创建俱乐部输入俱乐部名称
        currentClubID: cc.Label,    //当前俱乐部ID
        clubNums: [cc.RichText],    //房间密码
        clubMembersLayer: cc.Node,  //俱乐部成员界面
        clubMemberItem: cc.Prefab,  //俱乐部成员头像预制资源
        clubMembersLayout: cc.Layout,//俱乐部成员列表
        clubApplicationLayer: cc.Node,  //俱乐部成员审批界面
        clubApplicationItem: cc.Prefab,  //俱乐部成员审批预制资源
        clubApplicationLayout: cc.Layout,//俱乐部成员审批列表
        btnKickout: cc.Node,        //俱乐部成员弹窗踢出按钮（群主视角）
        btnDissolve: cc.Node,       //俱乐部成员弹窗解散按钮（群主视角）
        btnKickoutCancel: cc.Node,  //俱乐部成员弹窗取消踢出按钮（群主点击踢出按钮后）
        btnKickoutConfirm: cc.Node, //俱乐部成员弹窗确认解散按钮（群主点击踢出按钮后）
        btnQuitClub: cc.Node,       //俱乐部成员弹窗退出按钮（成员视角）
        kickoutMemberToastLayer: cc.Node,//俱乐部踢出成员确认对话框
        dissolveClubToastLayer: cc.Node,//解散俱乐部确认对话框
        quitClubToastLayer: cc.Node,//退出俱乐部确认对话框
        clubMemberNum: cc.Label,    //俱乐部成员个数
        normalLoadingLayer: cc.Node,//等待界面
        operationTipsBackground: cc.Node,//操作提示背景
        operationTips: cc.Label,    //操作提示
        btnCreateRoom: cc.Node,
    },

    // use this for initialization
    onLoad () {
        Log.Trace("[ClubHall:onLoad]");
        cc.dgame.refresh.refreshChips();
        cc.dgame.refresh.refreshKAL();
        cc.dgame.exchangeRate.startCheckExchangeRate();
        cc.dgame.roomEventMgr.startListen();
        cc.dgame.gameRequestMgr.startCheckGameRequest();
        cc.director.preloadScene('GameTable', function () {
            Log.Trace('Next scene preloaded');
        });
        this.btnKickout.active = false;
        this.btnDissolve.active = false;
        this.btnKickoutCancel.active = false;
        this.btnKickoutConfirm.active = false;
        this.btnQuitClub.active = false;
        this.roompassword = new Array();
        this.clubList = new Array();
        this._isClubMaster = false;
        this._isSelectedClubMaster = false;
        this._createClubThreshold = 100;
        cc.dgame.roomEventMgr.handleNewClub = this._handleNewClub.bind(this);
        cc.dgame.roomEventMgr.handleJoinClub = this._handleJoinClub.bind(this);
        cc.dgame.roomEventMgr.handleJoinClubApproved = this._handleJoinClubApproved.bind(this);
        cc.dgame.roomEventMgr.handleCreateTable = this._handleCreateTable.bind(this);
        //监听我加入俱乐部
        cc.dgame.net.gameCall(["listenMyJoinClub", ""]);
        if (!!cc.dgame.settings.account.ClubID) {
            this.currentClubID.string = cc.dgame.utils.formatClubID(cc.dgame.settings.account.ClubID);
        }

        cc.dgame.net.gameCall(["createClubThreshold", ""], this._onCreateClubThreshold.bind(this));
        cc.dgame.net.gameCall(["myClubs", ""], this._onMyClubs.bind(this));
        this.schedule(this._checkMyClubInfo, 60);
    },

    onDestroy () {
        cc.dgame.net.gameCall(["unsubscribeCreateTable", ""]);
        this.unschedule(this._checkMyClubInfo);
    },

    _checkMyClubInfo () {
        cc.dgame.net.gameCall(["myClubs", ""], this._onMyClubs.bind(this));
    },

    _onCreateClubThreshold (data) {
        Log.Trace("[_onCreateClubThreshold] " + data);
        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
        this._createClubThreshold = data;
    },

    // called every frame
    update: function (dt) {

    },

    onBtnNewGameClicked () {
        cc.director.loadScene('CreateTable');
    },

    onBtnCreateClubClicked () {
        this.createClubLayer.active = true;
    },

    onBtnCloseCreateClubClicked () {
        this.createClubLayer.active = false;
    },

    onBtnJoinClubClicked () {
        this.joinClubLayer.active = true;
    },

    onBtnCloseJoinClubClicked () {
        this.joinClubLayer.active = false;
    },

    onBtnNumpad0Clicked () {
        if (this.roompassword.length < 6) {
            this.roompassword.push('0');
            this._updateRoomPassword();
        }
    },

    onBtnNumpad1Clicked () {
        if (this.roompassword.length < 6) {
            this.roompassword.push('1');
            this._updateRoomPassword();
        }
    },

    onBtnNumpad2Clicked () {
        if (this.roompassword.length < 6) {
            this.roompassword.push('2');
            this._updateRoomPassword();
        }
    },

    onBtnNumpad3Clicked () {
        if (this.roompassword.length < 6) {
            this.roompassword.push('3');
            this._updateRoomPassword();
        }
    },

    onBtnNumpad4Clicked () {
        if (this.roompassword.length < 6) {
            this.roompassword.push('4');
            this._updateRoomPassword();
        }
    },

    onBtnNumpad5Clicked () {
        if (this.roompassword.length < 6) {
            this.roompassword.push('5');
            this._updateRoomPassword();
        }
    },

    onBtnNumpad6Clicked () {
        if (this.roompassword.length < 6) {
            this.roompassword.push('6');
            this._updateRoomPassword();
        }
    },

    onBtnNumpad7Clicked () {
        if (this.roompassword.length < 6) {
            this.roompassword.push('7');
            this._updateRoomPassword();
        }
    },

    onBtnNumpad8Clicked () {
        if (this.roompassword.length < 6) {
            this.roompassword.push('8');
            this._updateRoomPassword();
        }
    },

    onBtnNumpad9Clicked () {
        if (this.roompassword.length < 6) {
            this.roompassword.push('9');
            this._updateRoomPassword();
        }
    },

    onBtnNumpadDeleteClicked () {
        this.roompassword.pop();
        this._updateRoomPassword();
    },

    onBtnNumpadResetClicked () {
        this.roompassword = new Array();
        this._updateRoomPassword();
    },

    _foundInClubList (clubID) {
        for (let i = 0; i < this.clubList.length; i++) {
            if (parseInt(clubID) == parseInt(this.clubList[i].ClubID)) {
                return true;
            }
        }
        return false;
    },

    _updateRoomPassword () {
        this.joinClubID = 0;
        for (let i = 0; i < this.clubNums.length; i++) {
            if (i < this.roompassword.length) {
                this.clubNums[i].string = '<b>' + this.roompassword[i] + '</b>';
                this.joinClubID = this.joinClubID * 10 + parseInt(this.roompassword[i]);
            } else {
                this.clubNums[i].string = '';
            }
        }

        if (this.roompassword.length == 6) {
            if (!this._foundInClubList(this.joinClubID)) {  //不在已有的俱乐部列表中，则申请
                var clubinfo_cmd = {
                    ClubID: this.joinClubID,
                }
                cc.dgame.net.gameCall(["clubInfo", JSON.stringify(clubinfo_cmd)], this._onClubInfo.bind(this));
            } else {    //申请加入的俱乐部已在俱乐部列表中，则切换到该俱乐部
                this.updateClubID(this.joinClubID);
                this.onBtnCloseJoinClubClicked();
            }
        }
    },

    _onClubInfo (data) {
        Log.Trace("[_onClubInfo] " + JSON.stringify(data));
        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }

        if (parseInt(data.ClubID) != 0 && !data.Dissolved) {
            cc.find("Canvas/JoinClubToastLayer/bg_join_private_room/clubName").getComponent(cc.Label).string = data.ClubName;
            this.joinClubLayer.active = false;
            this.joinClubToastLayer.active = true;
        } else {
            this._showTips("The club does not exist");
        }
    },

    onBtnCreateClubConfirmClicked () {
        if (this.newClubName.string == "") {
            this._showTips("Please enter the club name");
            return;
        }
        if (cc.dgame.settings.account.Chips < this._createClubThreshold) {
            this._showTips("You need to have at least " + this._createClubThreshold + " chips to create a club");
            return;
        }
        cc.dgame.normalLoading.startInvokeWaiting();
        var newclub_cmd = {
            ClubName: this.newClubName.string,
        }
        cc.dgame.net.gameCall(["createClub", JSON.stringify(newclub_cmd)], this._onCreateClub.bind(this));
    },

    _onCreateClub (data) {
        Log.Trace("[_onCreateClub]");
        //this.schedule(this._checkMyClub, 5);
        //this._checkMyClubCount = 0;
    },

    _handleNewClub (clubInfo) {
        Log.Trace("[_handleNewClub] " + JSON.stringify(clubInfo))
        this.createClubLayer.active = false;
        if (clubInfo.Errstr != "") {
            cc.dgame.normalLoading.stopInvokeWaiting();
            this._showTips("Create club failed.(" + clubInfo.Errstr + ")");
            return;
        }
        this._showTips("You have created this club");
        this.updateClubID(clubInfo.ClubID);
    },

    onBtnCreateRoomClicked () {
        cc.director.loadScene("CreateTable");
    },

    onBtnJoinClubApplyClicked () {
        this.joinClubToastLayer.active = false;
        var joinclub_cmd = {
            ClubID: this.joinClubID,
        }
        cc.dgame.net.gameCall(["joinClub", JSON.stringify(joinclub_cmd)], this._onJoinClub.bind(this));
    },

    _onJoinClub (data) {
        this._showTips("You have applied to join and wait for the administrator to confirm");
    },

    _handleJoinClubApproved (clubInfo) {
        Log.Trace("[_handleJoinClubApproved] " + JSON.stringify(clubInfo))
        if (clubInfo.Errstr != "") {
            this._showTips(clubInfo.Errstr);
            return;
        }
        this.updateClubID(clubInfo.ClubID);
    },

    _handleJoinClub (clubInfo) {
        Log.Trace("[_handleJoinClub] " + JSON.stringify(clubInfo))
        if (clubInfo.Errstr != "") {
            this._showTips(clubInfo.Errstr);
            return;
        }
        cc.dgame.net.gameCall(["myClubs", ""], this._onMyClubs.bind(this));
    },

    onBtnJoinClubCanceClicked () {
        this.joinClubToastLayer.active = false;
    },

    onBtnShowClubMembersClicked () {
        if (this.ownerAddr == cc.dgame.settings.account.Addr) {
            this.btnKickout.active = true;
            this.btnDissolve.active = true;
            this.btnKickoutCancel.active = false;
            this.btnKickoutConfirm.active = false;
            this.btnQuitClub.active = false;
        } else {
            this.btnKickout.active = false;
            this.btnDissolve.active = false;
            this.btnKickoutCancel.active = false;
            this.btnKickoutConfirm.active = false;
            this.btnQuitClub.active = true;
        }
        this.clubMembersLayer.active = true;
    },

    onBtnCloseClubMembersClicked () {
        this.clubMembersLayer.active = false;
    },

    onBtnKickoutClicked () {
        for (let i = 0; i < this.clubMembersLayout.node.getChildren().length; i++) {
            let clubMember = this.clubMembersLayout.node.getChildren()[i].getComponent("ClubMemberItem");
            if (clubMember.accountAddr != this.ownerAddr) {
                clubMember.preSelect();
            }
        }
        this.btnKickout.active = false;
        this.btnDissolve.active = false;
        this.btnKickoutCancel.active = true;
        this.btnKickoutConfirm.active = false;
        this.btnQuitClub.active = false;
    },

    onBtnDissolveClicked () {
        this.onBtnCloseClubMembersClicked();
        this.dissolveClubToastLayer.active = true;
    },

    onBtnDissolveClubToastDissolveClicked () {
        this.dissolveClubToastLayer.active = false;
        cc.dgame.normalLoading.startInvokeWaiting();
        var dissolveclub_cmd = {
            ClubID: cc.dgame.settings.account.ClubID,
        }
        cc.dgame.net.gameCall(["dissolveClub", JSON.stringify(dissolveclub_cmd)], this._onDissolveClub.bind(this));
    },

    _onDissolveClub (data) {
        Log.Trace("[_onDissolveClub]");
        this.schedule(this._checkCloseClub, 5);
        this._checkCloseClubCount = 0;
    },

    _checkCloseClub () {
        this._checkCloseClubCount++;
        if (this._checkCloseClubCount > 3) {
            cc.dgame.normalLoading.stopInvokeWaiting();
            this._showTips("Dissolve club failed.");
            this.unschedule(this._checkCloseClub);
            return;
        }
        cc.dgame.net.gameCall(["myClubs", ""], this._onCheckCloseClub.bind(this));
    },

    _onCheckCloseClub (data) {
        Log.Trace("[_onCheckCloseClub] " + JSON.stringify(data));
        if (!data || !data.length) {
            cc.dgame.normalLoading.stopInvokeWaiting();
            this.unschedule(this._checkCloseClub);
            this._showTips("Successfully dismiss the club");
            this._onMyClubs(data);
        } else {
            let foundClub = false;
            for (let i = 0; i < data.length; i++) {
                if (data[i].OwnerAddr == cc.dgame.settings.account.Addr) {
                    foundClub = true;
                    break;
                }
            }
            if (!foundClub) {
                cc.dgame.normalLoading.stopInvokeWaiting();
                this.unschedule(this._checkCloseClub);
                this._showTips("Successfully dismiss the club");
                this._onMyClubs(data);
            }
        }
    },

    onBtnDissolveClubToastCancelClicked () {
        this.dissolveClubToastLayer.active = false;
    },

    onBtnKickoutToastConfirmClicked () {
        this.kickoutMemberToastLayer.active = false;
        var kickout_cmd = {
            ClubID: cc.dgame.settings.account.ClubID,
            Addr: this.kickoutAddr,
        }
        cc.dgame.net.gameCall(["denyJoinClub", JSON.stringify(kickout_cmd)], this._onKickout.bind(this));
    },

    _onKickout () {
        let clubMembers = new Array();
        for (let i = 0; i < this.clubMembersLayout.node.getChildren().length; i++) {
            let clubMember = this.clubMembersLayout.node.getChildren()[i].getComponent("ClubMemberItem");
            if (clubMember.accountAddr != this.kickoutAddr) {
                clubMembers.push(clubMember.accountAddr);
            }
        }

        this.clubMembersLayout.node.removeAllChildren();
        for (let i = 0; i < clubMembers.length; i++) {
            let clubMember = cc.instantiate(this.clubMemberItem);
            clubMember.getComponent("ClubMemberItem").init(clubMembers[i], this.ownerAddr);
            this.clubMembersLayout.node.addChild(clubMember);
            if (clubMembers[i] != this.ownerAddr) {
                clubMember.getComponent("ClubMemberItem").preSelect();
            }
        }
    },

    onBtnKickoutToastCancelClicked () {
        this.kickoutMemberToastLayer.active = false;
    },

    onBtnKickoutCancelClicked () {
        for (let i = 0; i < this.clubMembersLayout.node.getChildren().length; i++) {
            let clubMember = this.clubMembersLayout.node.getChildren()[i].getComponent("ClubMemberItem");
            clubMember.unpreSelect();
        }
        this.btnKickout.active = true;
        this.btnDissolve.active = true;
        this.btnKickoutCancel.active = false;
        this.btnKickoutConfirm.active = false;
        this.btnQuitClub.active = false;
    },

    onBtnQuitClubClicked () {
        this.quitClubToastLayer.active = true;
    },

    onBtnQuitClubConfirmClicked () {
        this.quitClubToastLayer.active = false;
        this.clubMembersLayer.active = false;
        cc.dgame.normalLoading.startInvokeWaiting();
        var quitclub_cmd = {
            ClubID: cc.dgame.settings.account.ClubID,
        }
        cc.dgame.net.gameCall(["quitClub", JSON.stringify(quitclub_cmd)], this._onQuitClub.bind(this));
    },

    _onQuitClub (data) {
        this.schedule(this._checkQuitClub, 5);
        this._checkQuitClubCount = 0;
    },

    _checkQuitClub () {
        this._checkQuitClubCount++;
        if (this._checkQuitClubCount > 3) {
            cc.dgame.normalLoading.stopInvokeWaiting();
            this._showTips("Quit club failed.");
            this.unschedule(this._checkQuitClub);
            return;
        }
        cc.dgame.net.gameCall(["myClubs", ""], this._onCheckQuitClub.bind(this));
    },

    _onCheckQuitClub (data) {
        Log.Trace("[_onCheckQuitClub] " + JSON.stringify(data));
        if (!data || !data.length) {
            cc.dgame.normalLoading.stopInvokeWaiting();
            this.unschedule(this._checkQuitClub);
            this._showTips("Successfully quit the club");
            this._onMyClubs(data);
        } else {
            let foundClub = false;
            for (let i = 0; i < data.length; i++) {
                if (data[i].ClubID == cc.dgame.settings.account.ClubID) {
                    foundClub = true;
                    break;
                }
            }
            if (!foundClub) {
                cc.dgame.normalLoading.stopInvokeWaiting();
                this.unschedule(this._checkQuitClub);
                this._showTips("Successfully quit the club");
                this._onMyClubs(data);
            }
        }
    },

    onBtnQuitClubCancelClicked () {
        this.quitClubToastLayer.active = false;
    },

    onBtnDropdownClubListClicked () {
        let dropdownMenu = cc.find("Canvas/ClubLayer/scrollview");
        let blockLayer = cc.find("Canvas/ClubLayer/sprite_splash");
        if (dropdownMenu.active) {
            dropdownMenu.active = false;
            blockLayer.active = false;
        } else {
            let clubMenu = cc.find("Canvas/ClubLayer/bg_club_menu");
            let menuPos = clubMenu.convertToWorldSpaceAR(cc.v2(0, 0));
            let dropdownPos = dropdownMenu.convertToWorldSpaceAR(cc.v2(0, 0));
            dropdownPos.y = menuPos.y - clubMenu.height / 2;    //菜单下边
            dropdownMenu.setPosition(dropdownMenu.parent.convertToNodeSpaceAR(dropdownPos));
            dropdownMenu.active = true;
            blockLayer.active = true;
        }
    },

    _onMyClubs (data) {
        //[{"ClubID":685038,"ClubName":"test","Dissolved":false,"OwnerAddr":"0xe2A04360345EeCE3d7e781B652A998cfaaD559A8"}]
        Log.Trace("[_onMyClubs] " + JSON.stringify(data));
        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
        cc.dgame.normalLoading.stopInvokeWaiting();
        this._masterClubIDs = new Array();
        if (!data || !data.length) {
        } else {
            for (let i = 0; i < data.length; i++) {
                if (!data[i].Dissolved) {
                    //没解散的俱乐部显示在列表中
                    if (cc.dgame.settings.account.Addr == data[i].OwnerAddr) {
                        this._masterClubIDs.push(data[i].ClubID);
                    }
                }
            }
        }
        Log.Trace("[ClubHall:_onMyClubs] masterClubID: " + JSON.stringify(this._masterClubIDs));
        //监听我是群主的俱乐部ID的加入申请
        cc.dgame.net.gameCall(["joinClubIDs", JSON.stringify(this._masterClubIDs)]);

        if (!data || !data.length) {
            this.noClubLayer.active = true;
            this.clubLayer.active = false;
            delete cc.dgame.settings.account.ClubID;
            this.currentClubID.string = "";
            cc.dgame.net.gameCall(["unsubscribeCreateTable", ""]);
            cc.sys.localStorage.setItem("currentAccount", JSON.stringify(cc.dgame.settings.account));
            this.unschedule(this._checkApplications);
            return;
        }

        this.clubList = new Array();
        for (let i = 0; i < data.length; i++) {
            //自行退出已解散的俱乐部
            if (data[i].Dissolved) {
                var quitclub_cmd = {
                    ClubID: data[i].ClubID,
                }
                cc.dgame.net.gameCall(["quitClub", JSON.stringify(quitclub_cmd)], this._onQuitClub.bind(this));
            } else {
                //没解散的俱乐部显示在列表中
                this.clubList.push(data[i]);
            }
        }
        if (this.clubList.length == 0) {
            this.noClubLayer.active = true;
            this.clubLayer.active = false;
            delete cc.dgame.settings.account.ClubID;
            this.currentClubID.string = "";
            cc.sys.localStorage.setItem("currentAccount", JSON.stringify(cc.dgame.settings.account));
            this.unschedule(this._checkApplications);
            return;
        }
        //已选ClubID合法性判断，在ClubList中则保留，否则置空
        if (!!cc.dgame.settings.account.ClubID && parseInt(cc.dgame.settings.account.ClubID) > 0) {
            let valid = false;
            for (let i = 0; i < data.length; i++) {
                if (parseInt(cc.dgame.settings.account.ClubID) == parseInt(data[i].ClubID)) {
                    valid = true;
                    break;
                }
            }
            if (!valid) {
                delete cc.dgame.settings.account.ClubID;
            }
        }
        //若已选ClubID置为空，则从ClubList中随机挑一个ClubID
        if (!cc.dgame.settings.account.ClubID) {
            cc.dgame.settings.account.ClubID = this.clubList[parseInt(Math.random() * this.clubList.length)].ClubID;
        }
        //判断是否为某个俱乐部的群主，是否为当前俱乐部群主
        for (let i = 0; i < this.clubList.length; i++) {
            if (cc.dgame.settings.account.Addr == this.clubList[i].OwnerAddr) {
                this._isClubMaster = true;
                if (cc.dgame.settings.account.ClubID == this.clubList[i].ClubID) {
                    this._isSelectedClubMaster = true;
                } else {
                    this._isSelectedClubMaster = false;
                }
            }
        }

        this.noClubLayer.active = false;
        this.clubLayer.active = true;
        this._updateClubMenu(this.clubList, this._isClubMaster);
        cc.dgame.refresh.refreshClubList();
        var clubmembers_cmd = {
            ClubID: cc.dgame.settings.account.ClubID,
        }
        cc.dgame.net.gameCall(["clubMembers", JSON.stringify(clubmembers_cmd)], this._onClubMembers.bind(this));
        if (this._isSelectedClubMaster) {
            this.btnCreateRoom.active = true;
        } else {
            this.btnCreateRoom.active = false;
        }
    },

    _onNewClub (data) {
        Log.Trace('[_onNewClub] currentScene: ' + cc.director.getScene().name + ', ' + JSON.stringify(data));
        cc.dgame.normalLoading.stopInvokeWaiting();
        this.createClubLayer.active = false;
        this._showTips("You have created this club");
        cc.dgame.net.gameCall(["myClubs", ""], this._onMyClubs.bind(this));
    },

    _updateClubMenu (clubList, isMaster) {
        Log.Trace("[_updateClubMenu] " + cc.dgame.settings.account.ClubID);
        this.onBtnDropdownClubListClicked();
        this.currentClubID.string = cc.dgame.utils.formatClubID(cc.dgame.settings.account.ClubID);
        this.ownerAddr = this.getMasterByClubID(cc.dgame.settings.account.ClubID);
        if (this.ownerAddr == "") {
            cc.dgame.net.gameCall(["unsubscribeCreateTable", ""]);
        } else if (this.ownerAddr != cc.dgame.settings.account.Addr) {
            let subCreateTable_cmd = {
                OwnerAddr: this.ownerAddr,
            }
            cc.dgame.net.gameCall(["subscribeCreateTable", JSON.stringify(subCreateTable_cmd)]);
        }
        cc.find("Canvas/ClubLayer/scrollview").getComponent("ClubList").populateList(clubList, isMaster);
        cc.sys.localStorage.setItem("currentAccount", JSON.stringify(cc.dgame.settings.account));
        this.onBtnDropdownClubListClicked();
        this._applicationIcon();
    },

    updateClubID (clubID) {
        cc.dgame.settings.account.ClubID = clubID;
        cc.sys.localStorage.setItem("currentAccount", JSON.stringify(cc.dgame.settings.account));
        Log.Trace("[updateClubID] " + cc.dgame.settings.account.ClubID);
        this.currentClubID.string = cc.dgame.utils.formatClubID(clubID);
        this.ownerAddr = this.getMasterByClubID(cc.dgame.settings.account.ClubID);
        if (this.ownerAddr == "") {
            cc.dgame.net.gameCall(["unsubscribeCreateTable", ""]);
        } else if (this.ownerAddr != cc.dgame.settings.account.Addr) {
            let subCreateTable_cmd = {
                OwnerAddr: this.ownerAddr,
            }
            cc.dgame.net.gameCall(["subscribeCreateTable", JSON.stringify(subCreateTable_cmd)]);
        }
        cc.find("Canvas/ClubLayer/scrollview").active = false;
        this._applicationIcon();
        cc.dgame.net.gameCall(["myClubs", ""], this._onMyClubs.bind(this));
    },

    _applicationIcon () {
        let notification = cc.find("Canvas/ClubLayer/layout/btn_club_notification");
        //本人为选中俱乐部的群主
        if (this.ownerAddr == cc.dgame.settings.account.Addr) {
            this._checkApplications();
            this.schedule(this._checkApplications, 60);
            notification.active = true;
        } else {
            notification.active = false;
            this.unschedule(this._checkApplications);
        }
    },

    _checkApplications () {
        cc.dgame.net.gameCall(["getJoinClubApplications", JSON.stringify(this._masterClubIDs)], this._onGetJoinClubApplications.bind(this));
    },

    _onGetJoinClubApplications (data) {
        Log.Trace('[_onGetJoinClubApplications] currentScene: ' + cc.director.getScene().name + ', ' + JSON.stringify(data));
        let newAppliers = cc.find("Canvas/ClubLayer/layout/btn_club_notification/bg_club_nofitication_number");
        let applierNum = cc.find("Canvas/ClubLayer/layout/btn_club_notification/bg_club_nofitication_number/richtext").getComponent(cc.RichText);
        this._applicationList = data;
        let count = 0;
        for (let clubid in this._applicationList) {
            if (!!this._applicationList[clubid] && !!this._applicationList[clubid].length) {
                count += this._applicationList[clubid].length;
            }
        }
        if (count > 0) {
            newAppliers.active = true;
            applierNum.string = cc.dgame.utils.formatRichText(count, "#ffffff", true, false);
        } else {
            newAppliers.active = false;
        }
    },

    _updateApplicationList () {
        this.clubApplicationLayout.node.removeAllChildren();
        for (let clubid in this._applicationList) {
            if (!!this._applicationList[clubid].length) {
                for (let i = 0; i < this._applicationList[clubid].length; i++) {
                    let clubApplication = cc.instantiate(this.clubApplicationItem);
                    clubApplication.getComponent("ClubApplicationItem").init(cc.director.getScene().name, parseInt(clubid), this._applicationList[clubid][i]);
                    this.clubApplicationLayout.node.addChild(clubApplication);
                }
            }
        }
    },

    getMasterByClubID (clubID) {
        for (let i = 0; i < this.clubList.length; i++) {
            if (this.clubList[i].ClubID == clubID) {
                return this.clubList[i].OwnerAddr;
            }
        }
        return "";
    },

    _onClubMembers (data) {
        Log.Trace('[_onClubMembers] currentScene: ' + cc.director.getScene().name + ', ' + JSON.stringify(data));
        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
        this.onBtnShowClubMembersClicked();
        this.clubMembersLayout.node.removeAllChildren();

        for (let i = 0; i < data.length; i++) {
            let clubMember = cc.instantiate(this.clubMemberItem);
            clubMember.getComponent("ClubMemberItem").init(data[i], this.ownerAddr);
            this.clubMembersLayout.node.addChild(clubMember);
        }
        this.clubMemberNum.string = data.length;
        this.onBtnCloseClubMembersClicked();
    },

    showKickoutMemberToast (memberAddr) {
        let assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");
        var idx = parseInt(memberAddr.substr(2, 2), 16);
        if (isNaN(idx)) {
            idx = 0;
        }
        cc.find("Canvas/KickoutMemberToastLayer/bg_tips/HeadMask/avatar").getComponent(cc.Sprite).spriteFrame = assetMgr.heads[idx % 200];
        cc.find("Canvas/KickoutMemberToastLayer/bg_tips/nickname").getComponent(cc.Label).string = memberAddr.substr(2, 8);
        this.kickoutAddr = memberAddr;
        this.kickoutMemberToastLayer.active = true;
    },

    _showTips (msg) {
        this.operationTips.string = msg;
        // 计算宽
        this.operationTips.overflow = cc.Label.Overflow.NONE;
        this.operationTips.node.setContentSize(new cc.Size(0, 57));
        this.operationTips._forceUpdateRenderData();
        let textWidth = Math.min(this.operationTips.node.width, 630);
        textWidth = Math.round(textWidth / 42) * 42;

        // 计算高
        this.operationTips.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        this.operationTips.node.setContentSize(new cc.Size(textWidth, 0));
        this.operationTips._forceUpdateRenderData();
        let textHeight = this.operationTips.node.height;

        this.operationTips.node.width = textWidth;
        this.operationTips.node.height = textHeight;

        this.operationTipsBackground.width = this.operationTips.node.width + 60;
        this.operationTipsBackground.height = this.operationTips.node.height + 15;
        this.operationTipsBackground.parent.opacity = 255;
        this.operationTipsBackground.parent.active = true;
        this.operationTipsBackground.parent.runAction(
            cc.sequence(
                cc.delayTime(1.5),
                cc.fadeOut(1.5),
            ),
        );
    },

    onBtnShowClubApplicationClicked () {
        this.clubApplicationLayer.active = true;
        this._updateApplicationList();
        //for test
        // let applications = [{"Addr":"0xe2A04360","Date":"2019-10-25"},{"Addr":"0x5806dc65","Date":"2019-10-25"},{"Addr":"0x54ABf71B","Date":"2019-10-25"},{"Addr":"0x2cD3A6D1","Date":"2019-10-25"},{"Addr":"0x9821Fcc8","Date":"2019-10-25"},{"Addr":"0x56725d4A","Date":"2019-10-25"},{"Addr":"0xD23FDeC7","Date":"2019-10-25"},{"Addr":"0xA4Fecb02","Date":"2019-10-25"},{"Addr":"0xd3A221a1","Date":"2019-10-25"}];
        // this.clubApplicationLayout.node.removeAllChildren();
        // for (let i = 0; i < applications.length; i++) {
        //     let clubApplication = cc.instantiate(this.clubApplicationItem);
        //     clubApplication.getComponent("ClubApplicationItem").init(applications[i]);
        //     this.clubApplicationLayout.node.addChild(clubApplication);
        // }
    },

    onBtnCloseClubApplicationClicked () {
        this.clubApplicationLayer.active = false;
    },

    approve (clubid, addr) {
        this.approveAddr = addr;
        this.approveClubID = clubid;
        var approve_cmd = {
            ClubID: clubid,
            Addr: addr,
        }
        cc.dgame.net.gameCall(["approveJoinClub", JSON.stringify(approve_cmd)], this._onApprove.bind(this));
    },

    deny (clubid, addr) {
        this.approveAddr = addr;
        this.approveClubID = clubid;
        var deny_cmd = {
            ClubID: clubid,
            Addr: addr,
        }
        cc.dgame.net.gameCall(["denyJoinClub", JSON.stringify(deny_cmd)], this._onApprove.bind(this));
    },

    _onApprove (data) {
        Log.Trace("[_onApprove]");
        let applications = new Array();
        for (let i = 0; i < this.clubApplicationLayout.node.getChildren().length; i++) {
            let clubApplication = this.clubApplicationLayout.node.getChildren()[i].getComponent("ClubApplicationItem");
            if (clubApplication.addr != this.approveAddr || clubApplication.clubid != this.approveClubID) {
                applications.push(this.clubApplicationLayout.node.getChildren()[i]);
            }
        }

        this.clubApplicationLayout.node.removeAllChildren();
        for (let i = 0; i < applications.length; i++) {
            this.clubApplicationLayout.node.addChild(applications[i]);
        }
        let newAppliers = cc.find("Canvas/ClubLayer/layout/btn_club_notification/bg_club_nofitication_number");
        let applierNum = cc.find("Canvas/ClubLayer/layout/btn_club_notification/bg_club_nofitication_number/richtext").getComponent(cc.RichText);
        if (applications.length == 0) {
            newAppliers.active = false;
        } else {
            newAppliers.active = true;
            applierNum.string = cc.dgame.utils.formatRichText(applications.length, "#ffffff", true, false);
        }
    },

    _handleCreateTable (createTableInfo) {
        Log.Trace("[_handleCreateTable] " + JSON.stringify(createTableInfo));
        cc.dgame.refresh.onBtnRefreshClicked();
    },
});
