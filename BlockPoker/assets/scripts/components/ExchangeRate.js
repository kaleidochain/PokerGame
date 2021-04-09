var Log = require("Log");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (!cc.dgame) {
            return;
        }
        cc.dgame.exchangeRate = this;
    },

    startCheckExchangeRate () {
        this._getExchangeRate();
        this.schedule(this._getExchangeRate, 60);
    },

    _onExchangeRate (data) {
        Log.Trace('[_onExchangeRate] ' + data);
        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
        cc.dgame.settings.exchangeRate = parseFloat(data) / 1e18;
    },

    _getExchangeRate () {
        Log.Trace("onExchangeRateTimer");
        cc.dgame.net.gameCall(["rate", ""], this._onExchangeRate.bind(this));
    },

    start () {

    },

    onDestroy () {
        this.unschedule(this._getExchangeRate);
        if (!!cc.dgame) {
            cc.dgame.exchangeRate = null;
        }
    }
    // update (dt) {},
});
