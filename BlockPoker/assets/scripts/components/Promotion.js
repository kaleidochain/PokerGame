var Log = require("Log");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    _onGiveMeToken (data) {
        Log.Trace('[_onGiveMeToken] ' + JSON.stringify(data));
    },

    giveMeToken () {
        if (!cc.dgame) {
            return;
        }
        cc.dgame.net.gameCall(["givemetoken", ""], this._onGiveMeToken.bind(this));
    },

    start () {

    },

    // update (dt) {},
});
