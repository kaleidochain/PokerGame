var Log = require("Log");
cc.Class({
    extends: cc.Component,

    properties: {
        _rechargePopup: cc.Node,
        _rechargeToggles: [cc.Toggle],
        _rechargeBackgrounds: [cc.Node],
        _rechargeContents: [cc.Node],
        _editboxKALNum: cc.EditBox,
        _exchangeChipsNum: cc.Label,
        _editboxChipsNum: cc.EditBox,
        _exchangeKALNum: cc.Label,
        _editboxWithdrawChipsAddr: cc.EditBox,
        _editboxWithdrawKALNum: cc.EditBox,
        _editboxWithdrawKALAddr: cc.EditBox,
        _editboxHandselChipsNum: cc.EditBox,
        _editboxHandselChipsAddr: cc.EditBox,
        _confirmPopup: cc.Node,
        _confirmTitle: cc.RichText,
        _confirmAddr: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (!cc.dgame) {
            return;
        }
        if (cc.dgame.rechargePopup) {
            Log.Trace("rechargePopup existed")
            return;
        }

        this._rechargePopup = cc.find("Canvas/RechargePopup");
        this._rechargeToggles.push(cc.find("bg_recharge/toggleContainer/ExchangeChips", this._rechargePopup).getComponent(cc.Toggle));
        this._rechargeToggles.push(cc.find("bg_recharge/toggleContainer/DepositKAL", this._rechargePopup).getComponent(cc.Toggle));
        this._rechargeToggles.push(cc.find("bg_recharge/toggleContainer/WithdrawChips", this._rechargePopup).getComponent(cc.Toggle));
        this._rechargeToggles.push(cc.find("bg_recharge/toggleContainer/WithdrawKAL", this._rechargePopup).getComponent(cc.Toggle));
        this._rechargeToggles.push(cc.find("bg_recharge/toggleContainer/HandselChips", this._rechargePopup).getComponent(cc.Toggle));
        cc.dgame.utils.addToggleClickEvent(this._rechargeToggles[0], this.node, "RechargePopup", "onRechargeTypeClicked");
        cc.dgame.utils.addToggleClickEvent(this._rechargeToggles[1], this.node, "RechargePopup", "onRechargeTypeClicked");
        cc.dgame.utils.addToggleClickEvent(this._rechargeToggles[2], this.node, "RechargePopup", "onRechargeTypeClicked");
        cc.dgame.utils.addToggleClickEvent(this._rechargeToggles[3], this.node, "RechargePopup", "onRechargeTypeClicked");
        cc.dgame.utils.addToggleClickEvent(this._rechargeToggles[4], this.node, "RechargePopup", "onRechargeTypeClicked");
        this._rechargeBackgrounds.push(cc.find("bg_recharge/toggleContainer/ExchangeChips/Background", this._rechargePopup));
        this._rechargeBackgrounds.push(cc.find("bg_recharge/toggleContainer/DepositKAL/Background", this._rechargePopup));
        this._rechargeBackgrounds.push(cc.find("bg_recharge/toggleContainer/WithdrawChips/Background", this._rechargePopup));
        this._rechargeBackgrounds.push(cc.find("bg_recharge/toggleContainer/WithdrawKAL/Background", this._rechargePopup));
        this._rechargeBackgrounds.push(cc.find("bg_recharge/toggleContainer/HandselChips/Background", this._rechargePopup));
        this._rechargeContents.push(cc.find("bg_recharge/RechargeContentLayer/ExchangeChips", this._rechargePopup));
        this._rechargeContents.push(cc.find("bg_recharge/RechargeContentLayer/DepositKAL", this._rechargePopup));
        this._rechargeContents.push(cc.find("bg_recharge/RechargeContentLayer/WithdrawChips", this._rechargePopup));
        this._rechargeContents.push(cc.find("bg_recharge/RechargeContentLayer/WithdrawKAL", this._rechargePopup));
        this._rechargeContents.push(cc.find("bg_recharge/RechargeContentLayer/HandselChips", this._rechargePopup));
        this._editboxKALNum = cc.find("bg_recharge/RechargeContentLayer/ExchangeChips/KALNum", this._rechargePopup).getComponent(cc.EditBox);   //KAL转筹码输入KAL个数
        this._exchangeChipsNum = cc.find("bg_recharge/RechargeContentLayer/ExchangeChips/layoutChips/ChipsNum", this._rechargePopup).getComponent(cc.Label);    //KAL转筹码KAL对应的筹码数
        this._editboxChipsNum = cc.find("bg_recharge/RechargeContentLayer/WithdrawChips/ChipsNum", this._rechargePopup).getComponent(cc.EditBox);   //提取筹码输入筹码数
        this._exchangeKALNum = cc.find("bg_recharge/RechargeContentLayer/WithdrawChips/layoutKAL/KALNum", this._rechargePopup).getComponent(cc.Label);  //提取筹码对应的KAL数
        this._editboxWithdrawChipsAddr = cc.find("bg_recharge/RechargeContentLayer/WithdrawChips/accountAddr", this._rechargePopup).getComponent(cc.EditBox);   //提取筹码的账号地址
        this._editboxWithdrawKALNum = cc.find("bg_recharge/RechargeContentLayer/WithdrawKAL/KALNum", this._rechargePopup).getComponent(cc.EditBox); //提取KAL输入KAL个数
        this._editboxWithdrawKALAddr = cc.find("bg_recharge/RechargeContentLayer/WithdrawKAL/accountAddr", this._rechargePopup).getComponent(cc.EditBox);   //提取KAL的账号地址
        this._editboxHandselChipsNum = cc.find("bg_recharge/RechargeContentLayer/HandselChips/ChipsNum", this._rechargePopup).getComponent(cc.EditBox); //筹码转账输入筹码个数
        this._editboxHandselChipsAddr = cc.find("bg_recharge/RechargeContentLayer/HandselChips/accountAddr", this._rechargePopup).getComponent(cc.EditBox);   //筹码转账对方的账号地址
        cc.dgame.utils.addClickEvent(cc.find("bg_recharge/btn_close", this._rechargePopup), this.node, "RechargePopup", "onBtnCloseClicked");   //关闭按钮
        cc.dgame.utils.addClickEvent(cc.find("Canvas/RechargeLayer/ExchangeChips/btn_charge"), this.node, "RechargePopup", "onBtnShowExchangeChipsClicked");    //筹码余额的加号按钮
        cc.dgame.utils.addClickEvent(cc.find("Canvas/RechargeLayer/DepositKAL/btn_charge"), this.node, "RechargePopup", "onBtnShowDepositKALClicked");  //KAL余额的加号按钮
        this._confirmPopup = cc.find("ConfirmLayer", this._rechargePopup);  //确认对话框
        this._confirmTitle = cc.find("bg_confirm/title", this._confirmPopup).getComponent(cc.RichText);
        this._confirmAddr = cc.find("bg_confirm/bg_tips_content/accountAddr", this._confirmPopup).getComponent(cc.Label);
        cc.dgame.utils.addClickEvent(cc.find("bg_confirm/btn_confirm", this._confirmPopup), this.node, "RechargePopup", "onBtnConfirm");    //确认按钮响应
        cc.dgame.utils.addClickEvent(cc.find("bg_confirm/btn_cancel", this._confirmPopup), this.node, "RechargePopup", "onBtnCancel");      //取消按钮响应
        //ExchangeChips
        cc.dgame.utils.addClickEvent(cc.find("bg_recharge/RechargeContentLayer/ExchangeChips/btnExchangeChips", this._rechargePopup), this.node, "RechargePopup", "onBtnExchangeChipsClicked"); //KAL转筹码Exchange按钮
        cc.dgame.utils.addClickEvent(cc.find("bg_recharge/RechargeContentLayer/ExchangeChips/btnDepositKAL", this._rechargePopup), this.node, "RechargePopup", "onBtnShowDepositKALClicked");   //KAL转筹码DepositKAL按钮
        cc.dgame.utils.addTextChangedEvent(this._editboxKALNum.node, this.node, "RechargePopup", "onKALNumTextChanged");
        cc.find("bg_recharge/RechargeContentLayer/ExchangeChips/layoutKALBalance/KALBalanceNum", this._rechargePopup).getComponent(cc.Label).string = cc.dgame.settings.account.KAL;    //KAL余额
        cc.find("bg_recharge/RechargeContentLayer/ExchangeChips/layout/exchangeChipsNum", this._rechargePopup).getComponent(cc.Label).string = Math.floor(10 * cc.dgame.settings.exchangeRate);
        cc.find("bg_recharge/RechargeContentLayer/ExchangeChips/layout/exchangeUSDTNum", this._rechargePopup).getComponent(cc.Label).string = cc.dgame.settings.exchangeRate / 10;
        //this._exchangeRate = 1.5;   //chips/KAL，15chips/10KAL
        //DepositKAL
        cc.find("bg_recharge/RechargeContentLayer/DepositKAL/bg_gameaddress/accountAddr", this._rechargePopup).getComponent(cc.Label).string = cc.dgame.settings.account.Addr;  //DepositKAL账号地址
        cc.dgame.utils.addClickEvent(cc.find("bg_recharge/RechargeContentLayer/DepositKAL/bg_copy", this._rechargePopup), this.node, "RechargePopup", "onBtnCopyAccountAddrClicked");   //拷贝账号地址
        cc.dgame.utils.addClickEvent(cc.find("bg_recharge/RechargeContentLayer/DepositKAL/step1url", this._rechargePopup), this.node, "RechargePopup", "onLinkDigifinexClicked");   //交易所链接
        cc.dgame.utils.addClickEvent(cc.find("bg_recharge/RechargeContentLayer/DepositKAL/step2url", this._rechargePopup), this.node, "RechargePopup", "onLinkDigifinexClicked");   //交易所链接
        //WithdrawChips
        cc.find("bg_recharge/RechargeContentLayer/WithdrawChips/layoutChipsBalance/ChipsBalanceNum", this._rechargePopup).getComponent(cc.Label).string = cc.dgame.settings.account.Chips;    //Chips余额
        cc.find("bg_recharge/RechargeContentLayer/WithdrawChips/layout/exchangeChipsNum", this._rechargePopup).getComponent(cc.Label).string = Math.floor(10 * cc.dgame.settings.exchangeRate);
        cc.find("bg_recharge/RechargeContentLayer/WithdrawChips/layout/exchangeUSDTNum", this._rechargePopup).getComponent(cc.Label).string = cc.dgame.settings.exchangeRate / 10;
        cc.dgame.utils.addClickEvent(cc.find("bg_recharge/RechargeContentLayer/WithdrawChips/btnWithdrawChips", this._rechargePopup), this.node, "RechargePopup", "onBtnWithdrawChipsClicked"); //提取筹码Withdraw按钮
        cc.dgame.utils.addTextChangedEvent(this._editboxChipsNum.node, this.node, "RechargePopup", "onChipsNumTextChanged");
        //WithdrawKAL
        cc.find("bg_recharge/RechargeContentLayer/WithdrawKAL/layout/KALBalanceNum", this._rechargePopup).getComponent(cc.Label).string = cc.dgame.settings.account.KAL;    //KAL余额
        cc.dgame.utils.addClickEvent(cc.find("bg_recharge/RechargeContentLayer/WithdrawKAL/btnWithdrawKAL", this._rechargePopup), this.node, "RechargePopup", "onBtnWithdrawKALClicked"); //提取KAL Withdraw按钮
        //HandselChips
        cc.find("bg_recharge/RechargeContentLayer/HandselChips/layout/ChipsBalanceNum", this._rechargePopup).getComponent(cc.Label).string = cc.dgame.settings.account.Chips;    //Chips余额
        cc.dgame.utils.addClickEvent(cc.find("bg_recharge/RechargeContentLayer/HandselChips/btnConfirm", this._rechargePopup), this.node, "RechargePopup", "onBtnHandselChipsClicked"); //筹码转账 Confirm按钮

        cc.dgame.utils.addClickEvent(cc.find("bg_recharge/History", this._rechargePopup), this.node, "RechargePopup", "onLinkHistoryClicked");   //历史链接

        cc.dgame.rechargePopup = this;
    },

    start () {

    },

    _updateData () {
        //ExchangeChips
        cc.find("bg_recharge/RechargeContentLayer/ExchangeChips/layoutKALBalance/KALBalanceNum", this._rechargePopup).getComponent(cc.Label).string = cc.dgame.settings.account.KAL;    //KAL余额
        cc.find("bg_recharge/RechargeContentLayer/ExchangeChips/layout/exchangeChipsNum", this._rechargePopup).getComponent(cc.Label).string = Math.floor(10 * cc.dgame.settings.exchangeRate);
        cc.find("bg_recharge/RechargeContentLayer/ExchangeChips/layout/exchangeUSDTNum", this._rechargePopup).getComponent(cc.Label).string = cc.dgame.settings.exchangeRate / 10;
        //DepositKAL
        cc.find("bg_recharge/RechargeContentLayer/DepositKAL/bg_gameaddress/accountAddr", this._rechargePopup).getComponent(cc.Label).string = cc.dgame.settings.account.Addr;  //DepositKAL账号地址
        //WithdrawChips
        cc.find("bg_recharge/RechargeContentLayer/WithdrawChips/layoutChipsBalance/ChipsBalanceNum", this._rechargePopup).getComponent(cc.Label).string = cc.dgame.settings.account.Chips;    //Chips余额
        cc.find("bg_recharge/RechargeContentLayer/WithdrawChips/layout/exchangeChipsNum", this._rechargePopup).getComponent(cc.Label).string = Math.floor(10 * cc.dgame.settings.exchangeRate);
        cc.find("bg_recharge/RechargeContentLayer/WithdrawChips/layout/exchangeUSDTNum", this._rechargePopup).getComponent(cc.Label).string = cc.dgame.settings.exchangeRate / 10;
        //WithdrawKAL
        cc.find("bg_recharge/RechargeContentLayer/WithdrawKAL/layout/KALBalanceNum", this._rechargePopup).getComponent(cc.Label).string = cc.dgame.settings.account.KAL;    //KAL余额
        Log.Trace("_updateData cc.dgame.settings.account.KAL: " + cc.dgame.settings.account.KAL);
        //HandselChips
        cc.find("bg_recharge/RechargeContentLayer/HandselChips/layout/ChipsBalanceNum", this._rechargePopup).getComponent(cc.Label).string = cc.dgame.settings.account.Chips;    //Chips余额
        Log.Trace("_updateData cc.dgame.settings.account.Chips: " + cc.dgame.settings.account.Chips);
    },

    RefreshData () {
       this._updateData()
    },

    _showRechargePopup (rechargeType) {
        if (rechargeType < 0 || rechargeType >= this._rechargeBackgrounds.length) {
            return;
        }

        this._updateData();
        this._rechargePopup.active = true;
        if (!this._rechargeToggles[rechargeType].isChecked) {
            this._rechargeToggles[rechargeType].check();
        } else {
            this._onSelectRecharge(rechargeType);
        }
    },

    _onSelectRecharge (index) {
        this._updateData();
        for (let i = 0; i < this._rechargeBackgrounds.length; i++) {
            if (index == i) {
                this._rechargeBackgrounds[i].active = false;
                this._rechargeContents[i].active = true;
            } else {
                this._rechargeBackgrounds[i].active = true;
                this._rechargeContents[i].active = false;
            }
        }
    },

    onRechargeTypeClicked (toggle) {
        var index = this._rechargeToggles.indexOf(toggle);
        this._onSelectRecharge(index);
    },

    onBtnCloseClicked () {
        this._rechargePopup.active = false;
    },

    onBtnShowExchangeChipsClicked () {
        this._showRechargePopup(0);
    },

    onBtnShowDepositKALClicked () {
        this._showRechargePopup(1);
    },

    onBtnShowHandselClicked () {
        this._showRechargePopup(4);
    },

    _onExchangeGoldcoin (data) {
        Log.Trace('[_onExchangeGoldcoin] ' + data);
        this._scheduleRefreshBalance();
    },

    onBtnExchangeChipsClicked () {
        if (parseFloat(this._editboxKALNum.string) > parseFloat(cc.dgame.settings.account.KAL)) {
            cc.dgame.tips.showTips("Insufficient<br/>KAL");
            return;
        }
        //框里填的10KAL的整数倍，需要*10
        let exchangeGold_cmd = {
            Value: cc.dgame.utils.numberToString(parseInt(this._editboxKALNum.string)* 10 * 1e18),
        }
        cc.dgame.net.gameCall(["exchangeGoldcoin", JSON.stringify(exchangeGold_cmd)],this._onExchangeGoldcoin.bind(this))
        cc.dgame.tips.showTips("Exchange<br/>Succeed");
    },

    onBtnCopyAccountAddrClicked () {
        cc.dgame.clipboard.copyToClipboard(cc.dgame.settings.account.Addr);
        cc.dgame.tips.showTips("Copy<br/>Succeed");
    },

    onKALNumTextChanged () {
        if (this._editboxKALNum.string == "") {
            this._editboxKALNum.string = "0";
        }
        if (!isNaN(parseInt(this._editboxKALNum.string))) {
            if (this._editboxKALNum.string * 10 > cc.dgame.settings.account.KAL) {
                this._editboxKALNum.string = Math.floor(cc.dgame.settings.account.KAL / 10);
            }
            this._editboxKALNum.string = parseInt(this._editboxKALNum.string) + "";
            this._exchangeChipsNum.string = this._editboxKALNum.string * Math.floor(10 * cc.dgame.settings.exchangeRate);
        }
    },

    onChipsNumTextChanged () {
        if (this._editboxChipsNum.string == "") {
            this._editboxChipsNum.string = "0";
        }
        if (!isNaN(parseInt(this._editboxChipsNum.string))) {
            if (parseInt(this._editboxChipsNum.string) > parseInt(cc.dgame.settings.account.Chips)) {
                this._editboxChipsNum.string = cc.dgame.settings.account.Chips;
            }
            this._editboxChipsNum.string = parseInt(this._editboxChipsNum.string) + "";
            this._exchangeKALNum.string = (this._editboxChipsNum.string / cc.dgame.settings.exchangeRate).toFixed(2) + "";
        }
    },

    onBtnWithdrawChipsClicked () {
        if (parseFloat(this._editboxChipsNum.string) > parseFloat(cc.dgame.settings.account.Chips)) {
            cc.dgame.tips.showTips("Insufficient<br/>Chips");
            return;
        }
        if (parseFloat(cc.dgame.settings.account.Chips) - parseFloat(this._editboxChipsNum.string) < 1) {
            cc.dgame.tips.showTips("1 chip<br/>must be retained");
            return;
        }
        if (this._editboxWithdrawChipsAddr.string.length < 40 || this._editboxWithdrawChipsAddr.string.length > 42) {
            cc.dgame.tips.showTips("Invalid<br/>Address");
            return;
        }
        this._confirmType = "WithdrawChips";
        this._confirmPopup.active = true;
        this._confirmTitle.string = cc.dgame.utils.formatRichText("Withdraw " + this._editboxChipsNum.string + " Chips to", "#AFC6DD", true, false);
        this._confirmAddr.string = this._editboxWithdrawChipsAddr.string;
    },

    onBtnWithdrawKALClicked () {
        if (parseFloat(this._editboxWithdrawKALNum.string) > parseFloat(cc.dgame.settings.account.KAL)) {
            cc.dgame.tips.showTips("Insufficient<br/>KAL");
            return;
        }
        if (this._editboxWithdrawKALAddr.string.length < 40 || this._editboxWithdrawKALAddr.string.length > 42) {
            cc.dgame.tips.showTips("Invalid<br/>Address");
            return;
        }
        this._confirmType = "WithdrawKAL";
        this._confirmPopup.active = true;
        this._confirmTitle.string = cc.dgame.utils.formatRichText("Withdraw " + this._editboxKALNum.string + " KAL to", "#AFC6DD", true, false);
        this._confirmAddr.string = this._editboxWithdrawKALAddr.string;
    },

    onBtnHandselChipsClicked () {
        if (parseFloat(this._editboxHandselChipsNum.string) > parseFloat(cc.dgame.settings.account.Chips)) {
            cc.dgame.tips.showTips("Insufficient<br/>Chips");
            return;
        }
        if (parseFloat(cc.dgame.settings.account.Chips) - parseFloat(this._editboxHandselChipsNum.string) < 1) {
            cc.dgame.tips.showTips("1 chip<br/>must be retained");
            return;
        }
        if (this._editboxHandselChipsAddr.string.length < 40 || this._editboxHandselChipsAddr.string.length > 42) {
            cc.dgame.tips.showTips("Invalid<br/>Address");
            return;
        }
        this._confirmType = "HandselChips";
        this._confirmPopup.active = true;
        this._confirmTitle.string = cc.dgame.utils.formatRichText("Send " + this._editboxChipsNum.string + " Chips to", "#AFC6DD", true, false);
        this._confirmAddr.string = this._editboxHandselChipsAddr.string;
    },

    onLinkHistoryClicked () {
        if (cc.sys.isNative) {
            if (cc.sys.isMobile) {
                if (cc.sys.os === cc.sys.OS_IOS) {
                    jsb.reflection.callStaticMethod('NativeGengine', 'openURL:', "http://kalscan.io/address/" + cc.dgame.settings.account.Addr);
                } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                    jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity', 'openURL', '(Ljava/lang/String;)V', "http://kalscan.io/address/" + cc.dgame.settings.account.Addr);
                }
            } else if (cc.sys.os === cc.sys.OS_WINDOWS||cc.sys.os === cc.sys.OS_OSX) {
                openURL("http://kalscan.io/address/" + cc.dgame.settings.account.Addr);
            }
        }
    },

    onLinkDigifinexClicked () {
        if (cc.sys.isNative) {
            if (cc.sys.isMobile) {
                if (cc.sys.os === cc.sys.OS_IOS) {
                    jsb.reflection.callStaticMethod('NativeGengine', 'openURL:', "https://www.digifinex.vip");
                } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                    jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity', 'openURL', '(Ljava/lang/String;)V', "https://www.digifinex.vip");
                }
            } else if (cc.sys.os === cc.sys.OS_WINDOWS||cc.sys.os === cc.sys.OS_OSX) {
                openURL("https://www.digifinex.vip");
            }
        }
    },

    onBtnConfirm () {
        if (this._confirmType == "WithdrawChips") {
            this._doWithdrawChips();
        } else if (this._confirmType == "WithdrawKAL") {
            this._doWithdrawKAL();
        } else if (this._confirmType == "HandselChips") {
            this._doHandselChips();
        }
    },

    onBtnCancel () {
        this._confirmPopup.active = false;
    },

    _onExchangeKal (data) {
        Log.Trace('[_onExchangeKal] ' + data);
        this._scheduleRefreshBalance();
    },

    _doWithdrawChips () {
        let exchangeKAL_cmd = {
            Value: this._editboxChipsNum.string,
        }
        cc.dgame.net.gameCall(["exchangeKal", JSON.stringify(exchangeKAL_cmd)],this._onExchangeKal.bind(this))
        if (this._editboxWithdrawChipsAddr.string.toLowerCase() != cc.dgame.settings.account.Addr.toLowerCase()) {
            let transfer_cmd = {
                Address: this._editboxWithdrawChipsAddr.string,
                Value: cc.dgame.utils.numberToString(parseFloat(this._exchangeKALNum.string) * 1e18),
            }
            cc.dgame.net.gameCall(["KalTransaction", JSON.stringify(transfer_cmd)]);
        }
        cc.dgame.tips.showTips("Withdraw<br/>Succeed");
        this._confirmPopup.active = false;
    },

    _onKalTransaction (data) {
        Log.Trace('[_onKalTransaction] ' + data);
        this._scheduleRefreshBalance();
    },

    _doWithdrawKAL () {
        let transfer_cmd = {
            Address: this._editboxWithdrawKALAddr.string,
            Value: cc.dgame.utils.numberToString(parseFloat(this._editboxWithdrawKALNum.string) * 1e18),
        }
        cc.dgame.net.gameCall(["KalTransaction", JSON.stringify(transfer_cmd)],this._onKalTransaction.bind(this));
        cc.dgame.tips.showTips("Transaction<br/>Has been sent");
        this._confirmPopup.active = false;
    },

    _onGoldTransaction (data) {
        Log.Trace('[_onGoldTransaction] ' + data);
        this._scheduleRefreshBalance();
    },

    _doHandselChips () {
        let transfer_cmd = {
            Address: this._editboxHandselChipsAddr.string,
            Value: cc.dgame.utils.numberToString(parseFloat(this._editboxHandselChipsNum.string)),
        }
        cc.dgame.net.gameCall(["GoldTransaction", JSON.stringify(transfer_cmd)],this._onGoldTransaction.bind(this));
        cc.dgame.tips.showTips("Transaction<br/>Has been sent");
        this._confirmPopup.active = false;
    },

    _scheduleRefreshBalance () {
        Log.Trace("_scheduleRefreshBalance")
        this.scheduleOnce(function () {
            cc.dgame.refresh.refreshChips();
            cc.dgame.refresh.refreshKAL();
        }, 5);
    },

    onDestroy () {
        if (!!cc.dgame) {
            cc.dgame.rechargePopup = null;
        }

    },
    // update (dt) {},
});
