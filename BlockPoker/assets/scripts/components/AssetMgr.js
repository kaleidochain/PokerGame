var Log = require("Log");

cc.Class({
    extends: cc.Component,

    properties: {
        cards0: [cc.SpriteFrame],
        back0: cc.SpriteFrame,
        heads: [cc.SpriteFrame],
    },

    onLoad () {
        if (!cc.dgame) {
            cc.dgame = {};
            var Utils = require('Utils');
            cc.dgame.utils = new Utils();
        }

        cc.game.addPersistRootNode(this.node);
        Log.Trace("AssetMgr:onLoad");
    },

    onDestory () {
        if (!!cc.dgame) {
            cc.dgame.assetMgr = null;
        }
        Log.Trace("AssetMgr:onDestory");
    },
});
