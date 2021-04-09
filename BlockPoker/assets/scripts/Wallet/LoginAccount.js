var Log = require("Log");

cc.Class({
    extends: cc.Component,

    properties: {
        selectAccountPopup: cc.Node,
        currentNickname: cc.RichText,
        editPassword: cc.EditBox,
        loginPasswordErrorTips: cc.Label,
        normalLoadingLayer: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    onLoad () {
        this.currentNickname.string = cc.dgame.utils.formatRichText(cc.dgame.settings.account.Nickname, "#DAEDFF", true, true);
        cc.dgame.settings.account.LoginNickname = cc.dgame.settings.account.Nickname;
        cc.dgame.settings.account.LoginAddr = cc.dgame.settings.account.Addr;
    },

    start () {

    },

    onBtnChangeCurrentAccountClicked () {
        this.selectAccountPopup.active = true;
        this.loadLocalAccounts();
    },

    onBtnCloseSelectAccountPopupClicked () {
        this.selectAccountPopup.active = false;
    },

    onLinkLoginMnemonicClicked () {
        cc.dgame.sceneList.push(cc.director.getScene().name);
        cc.director.loadScene("LoginMnemonic");
    },

    loadLocalAccounts () {
        var accountList = cc.find("login_bg/scrollview", this.selectAccountPopup).getComponent("AccountList");
        var data = new Array();
        for (var i = 0; i < cc.dgame.settings.accountsInfo.length; i++) {
            var accountInfo = {};
            accountInfo.Nickname = cc.dgame.settings.accountsInfo[i].Nickname;
            accountInfo.Addr = cc.dgame.settings.accountsInfo[i].Addr;
            data.push(accountInfo);
        }
        accountList.populateList(data);
    },
    // update (dt) {},

    //点击下拉列表中的昵称会调用
    tryVerifyAccount (nickname, addr) {
        Log.Debug("clicked: " + nickname + ", " + addr);
        cc.dgame.settings.account.LoginNickname = nickname;
        cc.dgame.settings.account.LoginAddr = addr;
        var accountList = cc.find("login_bg/scrollview", this.selectAccountPopup).getComponent("AccountList");
        accountList.updateSelection();
    },

    //点击下拉列表中的New Account会调用
    tryNewAccount () {
        this.selectAccountPopup.active = false;
        cc.dgame.sceneList.push(cc.director.getScene().name);
        cc.director.loadScene("CreateAccount");
    },

    onBtnConfirmClicked () {
        this.currentNickname.string = cc.dgame.utils.formatRichText(cc.dgame.settings.account.LoginNickname, "#DAEDFF", true, true);;
        cc.dgame.settings.account.Nickname = cc.dgame.settings.account.LoginNickname;
        cc.dgame.settings.account.Addr = cc.dgame.settings.account.LoginAddr;
        cc.dgame.settings.account.Chips = 0;
        cc.dgame.settings.account.KAL = 0;
        this.selectAccountPopup.active = false;
    },

    onBtnLoginClicked () {
        let testAddrMap = this._getTestAddrMap();
        if (testAddrMap[cc.dgame.settings.account.Addr] == 1) {
            this.editPassword.string = "123456"; //test
        }
        this._startInvokeWaiting();
        this.scheduleOnce(function () {
            var ret = false;
            if (cc.sys.isNative) {
                if (cc.sys.isMobile) {
                    if (cc.sys.os === cc.sys.OS_IOS) {
                        ret = jsb.reflection.callStaticMethod("NativeGengine", "startGameEngineWithAccount:andPassword:", cc.dgame.settings.account.Addr, this.editPassword.string)
                    } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                        ret = jsb.reflection.callStaticMethod("io/kaleidochain/NativeGengine", "startGameEngineWithAccountAndPassword", "(Ljava/lang/String;Ljava/lang/String;)Z", cc.dgame.settings.account.Addr, this.editPassword.string)
                    }
                } else {
                    if (cc.sys.os === cc.sys.OS_WINDOWS||cc.sys.os === cc.sys.OS_OSX) {
                        ret = StartNode(cc.dgame.settings.account.Addr, this.editPassword.string);
                    }
                }
            }
            Log.Debug("ret = "+ret);
            cc.dgame.settings.onOpen = false;
            this._stopInvokeWaiting();
            if (ret) {
                if (cc.dgame.settings.account.LoginCount == null || cc.dgame.settings.account.LoginCount == undefined) {
                    cc.dgame.settings.account.LoginCount = 0;
                }
                cc.dgame.settings.account.LoginCount++;
                cc.sys.localStorage.setItem("currentAccount", JSON.stringify(cc.dgame.settings.account));
                cc.dgame.settings.account.Password = this.editPassword.string;
                cc.dgame.settings.account.Chips = 0;
                cc.dgame.settings.account.KAL = 0;
                let tutorial = JSON.parse(cc.sys.localStorage.getItem("tutorial"));
                if (!tutorial.TexasHoldem) {
                    cc.director.loadScene("TexasHoldemTutorial");
                } else {
                    cc.director.loadScene("GameHall");
                }
            } else {
                this.loginPasswordErrorTips.string = "Incorrect password";
                this.editPassword.string = "";
            }
        }, 1);
    },

    _getTestAddrMap() {
        let addrMap = {
            "0x34F0Be687F187e8F5eaDBb7D577EDaB74240Bcd1": 1,
            "0x8b272f232a2c7eA3BF1497E3C57F3bf216cA81dB": 1,
            "0x3B7B045890776aC15685483A55d121a74Dc95517": 1,
            "0xE6aD43fc087E91bD7c041658f06675fd8d2223A1": 1,
            "0x2E35770BF145d89271dee1F3b897b7807Bd36896": 1,
            "0xc49e8b9F4fAb77197A5A7383930061E7613F8eAf": 1,
        };
        return addrMap
    },

    onEditingPasswordBegan() {
        this.loginPasswordErrorTips.string = "";
    },

    _startInvokeWaiting () {
        this.normalLoadingLayer.active = true;
    },

    _stopInvokeWaiting () {
        this.normalLoadingLayer.active = false;
    },
});
