var Log = require("Log");

cc.Class({
    extends: cc.Component,

    properties: {
        tableid: cc.Label,
        blindInfo: cc.Label,
        chipsInfo: cc.Label,
        playingnum: cc.Label,
        leftTime: cc.Label,
        tokenFlag: cc.Node,
        RMTFlag: cc.Node,
        INSFlag: cc.Node,
        CINSFlag: cc.Node,
        // ...
    },

    // use this for initialization
    // {'Ante':4,'BuyinMax':400,'BuyinMin':100,'CurrentStatu':0,'MaxNum':4,'MinNum':2,'PlayerNum':2,'SmallBlind':4,'Straddle':0,'TableId':1}
    init: function (tableInfo) {
        this.tableInfo = tableInfo;
        this.tableid.string = cc.dgame.utils.formatClubID(cc.dgame.settings.account.ClubID) + "-";
        if (tableInfo.DisplayTableId < 10) {
            this.tableid.string += '00' + tableInfo.DisplayTableId.toString();
        } else if (tableInfo.DisplayTableId < 100) {
            this.tableid.string += '0' + tableInfo.DisplayTableId.toString();
        } else {
            this.tableid.string += tableInfo.DisplayTableId.toString();
        }
        this.tableInfo.FullTableId = this.tableid.string;
        this.blindInfo.string = cc.dgame.utils.formatValue(tableInfo.SmallBlind) + "/" + cc.dgame.utils.formatValue(tableInfo.SmallBlind * 2).toString();
        if (tableInfo.Straddle !== 0) {
            this.blindInfo.string += "/" + cc.dgame.utils.formatValue(tableInfo.SmallBlind * 4).toString();
        }
        if (tableInfo.Ante > 0) {
            this.blindInfo.string += "(" + cc.dgame.utils.formatValue(tableInfo.Ante) + ")";
        }
        this.chipsInfo.string = cc.dgame.utils.formatValue(tableInfo.BuyinMin).toString() + "/" + cc.dgame.utils.formatValue(tableInfo.BuyinMax).toString();        this.playingnum.string = tableInfo.PlayerNum + "/" + tableInfo.MaxNum;
        if (tableInfo.LeftTime / 3600 < 1) {
            this.leftTime.string = (tableInfo.LeftTime / 60).toFixed(1) + "m / " + tableInfo.GameLength / 3600 + "h"
        } else {
            this.leftTime.string = (tableInfo.LeftTime / 3600).toFixed(1) + "h / " + tableInfo.GameLength / 3600 + "h"
        }
        if (tableInfo.TableProps & (1<<0)) {
            this.tokenFlag.active = true;
        }
        if (tableInfo.TableProps & (1<<1)) {
            this.RMTFlag.active = true;
        }
        if (tableInfo.TableProps & (1<<2)) {
            this.INSFlag.active = true;
        }
        if (tableInfo.TableProps & (1<<3)) {
            this.CINSFlag.active = true;
        }
    },

    // called every frame
    update: function (dt) {

    },

    selectGametable: function() {
        Log.Trace('selectGametable' + JSON.stringify(this.tableInfo));
        cc.dgame.tableInfo = this.tableInfo;
        cc.director.loadScene('GameTable');
    },
});
