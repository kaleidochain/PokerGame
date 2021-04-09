var Log = require("Log");

cc.Class({
    extends: cc.Component,

    properties: {
        btnBack: cc.Node,
        createNickname: cc.Node,
        createPassword: cc.Node,
        showMnemonic: cc.Node,
        toast: cc.Node,
        editNickname: cc.EditBox,
        editPassword: cc.EditBox,
        nicknameErrorTips: cc.Label,
        passwordErrorTips: cc.Label,
        countDown: cc.RichText,
        btnOK: cc.Button,
        labelMnemonics: {
            default: [],
            type: cc.RichText,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    onLoad () {
        console.log("sceneList: " + cc.dgame.sceneList);
        if (cc.dgame.sceneList[cc.dgame.sceneList.length - 1] == "Splash") {
            this.btnBack.active = false;
        } else {
            this.btnBack.active = true;
        }
    },

    onBtnCreateNicknameClicked () {
        if (this.editNickname.string == "") {
            this.nicknameErrorTips.string = "Empty nickname";
            this.scheduleOnce(function() {
                this.nicknameErrorTips.string = "";
            }, 3);
            return;
        }
        if (!this._isNicknameExist(this.editNickname.string)) {
            this.createNickname.active = false;
            this.createPassword.active = true;
            this.showMnemonic.active = false;
        } else {
            this.nicknameErrorTips.string = "The nickname already exists on this device";
            this.scheduleOnce(function() {
                this.nicknameErrorTips.string = "";
            }, 3);
        }
    },

    onLinkLoginMnemonicClicked () {
        cc.dgame.sceneList.push(cc.director.getScene().name);
        cc.director.loadScene("LoginMnemonic");
    },

    onBtnBackClicked () {
        console.log("sceneList: " + cc.dgame.sceneList);
        if (this.createNickname.active) {
            cc.director.loadScene(cc.dgame.sceneList.pop());
        } else if (this.createPassword.active) {
            this.createNickname.active = true;
            this.createPassword.active = false;
            this.showMnemonic.active = false;
            if (cc.dgame.sceneList[cc.dgame.sceneList.length - 1] == "Splash") {
                this.btnBack.active = false;
            } else {
                this.btnBack.active = true;
            }
        } else if (this.showMnemonic.active) {
            this.createNickname.active = false;
            this.createPassword.active = true;
            this.showMnemonic.active = false;
            this.btnBack.active = true;
        }
    },

    onBtnCreatePasswordClicked () {
        if (this.editPassword.string.length >= 6 && this.editPassword.string.length <= 12) {
            this.createNickname.active = false;
            this.createPassword.active = false;
            this.showMnemonic.active = true;
            if (cc.sys.isNative) {
                var ret = "[]";
                if (cc.sys.isMobile) {
                    if (cc.sys.os === cc.sys.OS_IOS) {
                        ret = jsb.reflection.callStaticMethod("NativeGengine", 
                        "createAccount:", 
                        this.editPassword.string);
                    } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                        ret = jsb.reflection.callStaticMethod("io/kaleidochain/NativeGengine", 
                        "createAccount", "(Ljava/lang/String;)Ljava/lang/String;",  
                        this.editPassword.string);
                    }
                } else {
                    if (cc.sys.os === cc.sys.OS_WINDOWS||cc.sys.os === cc.sys.OS_OSX) {
                        ret = CreateAccount(this.editPassword.string);
                    }
                }
                Log.Debug("createAccount return " + ret);
                var account = JSON.parse(ret);
                this.account = account;
                var mnemonics = account.mnemonic.split(" ");
                this._mnemonic = account.mnemonic;
                for (var i = 0; i < 12; i++) {
                    this.labelMnemonics[i].string = cc.dgame.utils.formatRichText(mnemonics[i], "#16487C", true, false);
                }
                this.time = 20;
                this.countDown.node.active = true;
                this.countDown.string = cc.dgame.utils.formatRichText("I have memorized(20s)", "#16487C", true, false);
                this.btnOK.interactable = false;
                this.schedule(this.timerUpdate, 1, this.time - 1);
            }
        } else {
            this.passwordErrorTips.string = "Invalid password length";
            this.scheduleOnce(function() {
                this.passwordErrorTips.string = "";
            }, 3);
        }
    },

    timerUpdate () {
        this.time = this.time - 1;
        if (this.time === 0) {
            this.countDown.string = cc.dgame.utils.formatRichText("I have memorized", "#16487C", true, false);
            this.btnOK.interactable = true;
            this.unschedule(this.timerUpdate);
        } else {
            this.countDown.string = cc.dgame.utils.formatRichText("I have memorized(" + this.time + "s)", "#16487C", true, false);
        }
    },

    onBtnCreateAccountByPasswordClicked () {
        this.toast.active = true;
    },

    onBtnMnemonicToastOKClicked () {
        this.toast.active = false;
        this.createAccountByPassword();
    },

    onBtnMnemonicToastCancelClicked () {
        this.toast.active = false;
    },

    createAccountByPassword () {
        if (cc.sys.isNative) {
            var accountInfo = {};
            accountInfo.Nickname = this.editNickname.string;
            accountInfo.Addr = this.account.pubKey;
            accountInfo.LoginCount = 0;
            cc.dgame.settings.accountsInfo.push(accountInfo);
            cc.sys.localStorage.setItem("accountsInfo", JSON.stringify(cc.dgame.settings.accountsInfo));
            cc.sys.localStorage.setItem("currentAccount", JSON.stringify(accountInfo));
            cc.dgame.settings.account = accountInfo;
            cc.dgame.settings.account.Password = this.editPassword.string;
        }
        let tutorial = JSON.parse(cc.sys.localStorage.getItem("tutorial"));
        if (!tutorial.TexasHoldem) {
            cc.director.loadScene("TexasHoldemTutorial");
        } else {
            cc.director.loadScene("GameHall");
        }
    },

    onBtnCopyMnemonicToClipboardClicked() {
        cc.dgame.clipboard.copyToClipboard(this._mnemonic);
        cc.dgame.tips.showTips("Copy<br/>Succeed");
    },

    _isNicknameExist (nickname) {
        for (let i = 0; i < cc.dgame.settings.accountsInfo.length; i++) {
            if (cc.dgame.settings.accountsInfo[i].Nickname == nickname) {
                return true;
            }
        }
        return false;
    }
    // update (dt) {},
});
