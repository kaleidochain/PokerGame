var Log = require("Log");

cc.Class({
    extends: cc.Component,

    properties: {
        normalLoadingLayer: cc.Node,//等待界面
        btnBack : cc.Node,
        resultLayer:cc.Node,
        singleResultLayer:cc.Node,
    },



    // use this for initialization
    onLoad () {
        this.freshPlayedTables(1);
    },

    freshPlayedTables (pageNum) {
        cc.dgame.normalLoading.startInvokeWaiting();
        this.scheduleOnce(function () {
            var playedlist_cmd = {
                Address: cc.dgame.settings.account.Addr,
                Page:pageNum,
            };
            cc.dgame.net.gameCall(['playedTables', JSON.stringify(playedlist_cmd)], this._onPlayedTables.bind(this));
        }, 0.05)
    },

    _onPlayedTables (data) {
        cc.dgame.normalLoading.stopInvokeWaiting();
        Log.Trace("[_onPlayedTables] Scene: " + cc.director.getScene().name + ", " + JSON.stringify(data));
        if (data == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
        cc.find("Canvas/ResultsLayer/resultScrollView").getComponent("ResultList").populateList(data);
    },

    onBtnClickSingleResult (tableId) {
        this.resultLayer.active = false;
        cc.find("Canvas/BottomMenu").active = false;
        cc.dgame.normalLoading.startInvokeWaiting();
        this.scheduleOnce(function () {
            var tableDetail_cmd = {
                TableId: tableId,
            };
            cc.dgame.net.gameCall(['tableDetail', JSON.stringify(tableDetail_cmd)], this._onTableDetail.bind(this));
        }, 0.05);
    },

    _onTableDetail (tableInfo) {
        Log.Trace("ResultHall _onTableDetail tableInfo:" + JSON.stringify(tableInfo));
        cc.dgame.normalLoading.stopInvokeWaiting();
        if (tableInfo == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
        if (tableInfo.Result.length <= 0){
            Log.Error("_onTableDetail tableInfo.Result.length <= 0");
            return;
        }

        this.btnBack.active = true;
        this.singleResultLayer.active = true;

        let gameEndLabel = cc.find("bg/time", this.singleResultLayer).getComponent(cc.Label);
        gameEndLabel.string = cc.dgame.utils.timestampToDate(tableInfo.EndTime*1000);

        let clubIdLabel = cc.find("bg/clubId", this.singleResultLayer).getComponent(cc.Label);
        let clubid = Math.floor(tableInfo.TableId / 0x10000000);
        clubIdLabel.string = clubid;

        let tableIdLabel = cc.find("bg/roomId", this.singleResultLayer).getComponent(cc.Label);
        let displayTableId = tableInfo.TableId - clubid * 0x10000000;
        if (displayTableId < 10) {
            tableIdLabel.string = '00' + displayTableId;
        } else if (displayTableId < 100) {
            tableIdLabel.string = '0' + displayTableId;
        } else {
            tableIdLabel.string = displayTableId;
        }
        let playingNumLabel = cc.find("bg/playingNum", this.singleResultLayer).getComponent(cc.Label);
        playingNumLabel.string = tableInfo.Result.length + " players";
        let creatorNameLabel = cc.find("bg/creatorName", this.singleResultLayer).getComponent(cc.Label);
        creatorNameLabel.string = tableInfo.CreatorAddr.substr(2, 8);

        let avatorSprite = cc.find("bg/iconHead", this.singleResultLayer).getComponent(cc.Sprite);
        let assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");
        var idx = parseInt(tableInfo.CreatorAddr.substr(2, 2), 16);
        if (isNaN(idx)) {
            idx = 0;
        }
        avatorSprite.spriteFrame = assetMgr.heads[idx % 200];

        let gameLengthLabel = cc.find("bg/gameLengthValue", this.singleResultLayer).getComponent(cc.Label);
        let hours
        if (tableInfo.GameLength%3600 == 0) {
            hours = (tableInfo.GameLength/3600);
        } else {
            hours = (tableInfo.GameLength/3600).toFixed(1);
        }
        if (hours <= 1) {
            gameLengthLabel.string = hours + " hour";
        } else {
            gameLengthLabel.string = hours + " hours";
        }
        let blindsLabel = cc.find("bg/blindsValue", this.singleResultLayer).getComponent(cc.Label);
        blindsLabel.string = cc.dgame.utils.formatValue(tableInfo.SmallBlind) + "/" + cc.dgame.utils.formatValue(tableInfo.SmallBlind * 2).toString();
        if (tableInfo.Straddle !== 0) {
            blindsLabel.string += "/" + cc.dgame.utils.formatValue(tableInfo.SmallBlind * 4).toString();
        }
        if (tableInfo.Ante > 0) {
            blindsLabel.string += "(" + tableInfo.Ante + ")";
        }
        let totalHandsLabel = cc.find("bg/totalHandsValue", this.singleResultLayer).getComponent(cc.Label);
        totalHandsLabel.string = tableInfo.CurrentHand;


        let mvpPlayer = tableInfo.Result[0][0];
        let mvpHeadSprite = cc.find("bg/MVP1/mvpHead", this.singleResultLayer).getComponent(cc.Sprite);
        var idxMVP = parseInt(mvpPlayer.substr(2, 2), 16);
        if (isNaN(idxMVP)) {
            idxMVP = 0;
        }
        mvpHeadSprite.spriteFrame = assetMgr.heads[idxMVP % 200];
        let whalePlayer = tableInfo.Result[tableInfo.Result.length-1][0];
        let whaleHeadSprite = cc.find("bg/Whale1/whaleHead", this.singleResultLayer).getComponent(cc.Sprite);
        var idxWhale = parseInt(whalePlayer.substr(2, 2), 16);
        if (isNaN(idxWhale)) {
            idxWhale = 0;
        }
        whaleHeadSprite.spriteFrame = assetMgr.heads[idxWhale % 200];
        let tuhaoPlayer;
        let maxBuy = 0;
        let totalBuyInLabel = cc.find("bg/totalBuyInValue", this.singleResultLayer).getComponent(cc.Label);
        let totalBuyIn = 0;
        for (let i in tableInfo.Result) {
            let buyIn = tableInfo.Result[i][2];
            if (buyIn > maxBuy) {
                maxBuy = buyIn;
                tuhaoPlayer = tableInfo.Result[i][0]
            }
            totalBuyIn += buyIn;
        }
        totalBuyInLabel.string = totalBuyIn.toString();
        let tuhaoHeadSprite = cc.find("bg/Tuhao1/tuhaoHead", this.singleResultLayer).getComponent(cc.Sprite);
        var idxTUHAO = parseInt(tuhaoPlayer.substr(2, 2), 16);
        if (isNaN(idxTUHAO)) {
            idxTUHAO = 0;
        }
        tuhaoHeadSprite.spriteFrame = assetMgr.heads[idxTUHAO % 200];
        let INSResultNode = cc.find("bottom_view/ins_layer", this.singleResultLayer);
        INSResultNode.active = false;
        let bg2Widget = cc.find("bottom_view/bg2", this.singleResultLayer).getComponent(cc.Widget);
        if ( tableInfo.InsuranceWin != null ) {
            let INSResultNode = cc.find("bottom_view/ins_layer", this.singleResultLayer);
            let insuranceLabel = cc.find("value", INSResultNode).getComponent(cc.Label);
            insuranceLabel.string = tableInfo.InsuranceWin;
            bg2Widget.top = INSResultNode.height;
            bg2Widget.updateAlignment();
            INSResultNode.active = true;
        } else {
            bg2Widget.top = 0;
            bg2Widget.updateAlignment();
        }
        cc.find("bottom_view/bg2/playerScrollView",this.singleResultLayer).getComponent("ResultPlayersList").populateList(tableInfo.Result);
    },

    onBtnBackClicked () {
        this.btnBack.active = false;
        this.singleResultLayer.active = false;
        cc.find("Canvas/BottomMenu").active = true;
        this.resultLayer.active = true;
    },

    // called every frame
    update: function (dt) {

    },

});
