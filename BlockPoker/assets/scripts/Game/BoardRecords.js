var Log = require("Log");

cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        whatsTexasHoldemContent: cc.Node,
        fourRoundsOfBettingContent: cc.Node,
        handRulesContent: cc.Node,
        fairnessStatementContent: cc.Node,
        overviewOfSecurityContent: cc.Node,
        kaleidochainDescriptionContent: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (!cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_gamelist")) {
            cc.sys.localStorage.setItem(cc.dgame.settings.account.Addr + "_gamelist", "[]");
        }
        let gamelist = JSON.parse(cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_gamelist"));
        Log.Trace("gamelist: " + cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_gamelist"));
        let gameResultList = new Array;
        for (let i in gamelist) {
            let gameResultStr = cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_" + gamelist[i] + "_result");
            if (!!gameResultStr) {
                Log.Trace("gameResult" + i + ": " + gameResultStr);
                gameResultList.push(JSON.parse(gameResultStr));
            }
        }
        let gameReviewGameList = cc.find("Canvas/sprite_splash/scrollView").getComponent('GameReviewGameList');
        gameReviewGameList.populateList(gameResultList);
    },

    start () {

    },

    onBtnBackClicked () {
        cc.director.loadScene("MySettings");
    },

    onBtnClearAll () {
        let gamelist = JSON.parse(cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_gamelist"));
        Log.Trace("[onBtnClearAll] gamelist: " + cc.sys.localStorage.getItem(cc.dgame.settings.account.Addr + "_gamelist"));
        while (gamelist.length > 0) {
            let removeGameResult = gamelist.shift();
            cc.sys.localStorage.removeItem(cc.dgame.settings.account.Addr + "_" + removeGameResult + "_result");
            cc.sys.localStorage.removeItem(cc.dgame.settings.account.Addr + "_" + removeGameResult + "_replay");
            Log.Trace("[onBtnClearAll] delete " + cc.dgame.settings.account.Addr + "_" + removeGameResult + "_result");
            Log.Trace("[onBtnClearAll] delete " + cc.dgame.settings.account.Addr + "_" + removeGameResult + "_replay");
        }
        cc.sys.localStorage.setItem(cc.dgame.settings.account.Addr + "_gamelist", "[]");
        let gameReviewGameList = cc.find("Canvas/sprite_splash/scrollView").getComponent('GameReviewGameList');
        gameReviewGameList.populateList([]);
    },

    review (fulltableid, hand, tableid) {
        cc.dgame.gameReviewPopup.FullTableId = fulltableid;
        cc.dgame.gameReviewPopup.TableId = tableid;
        cc.dgame.gameReviewPopup.Hand = hand;
        Log.Trace("review " + fulltableid + "_" + hand + ", tableid: " + tableid);
        cc.dgame.gameReviewPopup.onBtnGameReviewClicked();
    },
    // update (dt) {},
});
