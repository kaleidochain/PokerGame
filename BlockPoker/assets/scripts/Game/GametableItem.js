var Log = require("Log");

cc.Class({
    extends: cc.Component,

    properties: {
        roomfree: cc.Node,
        roomsmall: cc.Node,
        roommedium: cc.Node,
        roomlarge: cc.Node,
        tableid: cc.Label,
        blindInfo: cc.Label,
        chipsInfo: cc.Label,
        playingnum: cc.Label,
        // ...
    },

    // use this for initialization
    // {'Ante':4,'BuyinMax':400,'BuyinMin':100,'CurrentStatu':0,'MaxNum':4,'MinNum':2,'PlayerNum':2,'SmallBlind':4,'Straddle':0,'TableId':1}
    init: function (tableInfo) {
        this.tableInfo = tableInfo;
        switch (tableInfo.Type) {
        case 0:
            this.tableid.string = 'Free';
            break;
        case 1:
            this.tableid.string = 'Small';
            break;
        case 2:
            this.tableid.string = 'Medium';
            break;
        case 3:
            this.tableid.string = 'Large';
            break;
        }
        this.roomfree.active = (tableInfo.Type == 0);
        this.roomsmall.active = (tableInfo.Type == 1);
        this.roommedium.active = (tableInfo.Type == 2);
        this.roomlarge.active = (tableInfo.Type == 3);
        if (tableInfo.DisplayTableId < 10) {
            this.tableid.string += '00' + tableInfo.DisplayTableId.toString();
        } else if (tableInfo.DisplayTableId < 100) {
            this.tableid.string += '0' + tableInfo.DisplayTableId.toString();
        } else {
            this.tableid.string += tableInfo.DisplayTableId.toString();
        }
        this.tableInfo.FullTableId = this.tableid.string;
/*        switch (tableInfo.Status) {
            case 0:
                this.status.string = 'Ready';
                break;
            case 2:
                this.status.string = 'Playing';
                break;
        }*/
        this.blindInfo.string = cc.dgame.utils.formatValue(tableInfo.SmallBlind) + "/" + cc.dgame.utils.formatValue(tableInfo.SmallBlind * 2).toString();
        if (tableInfo.Straddle !== 0) {
            this.blindInfo.string += "/" + cc.dgame.utils.formatValue(tableInfo.SmallBlind * 4).toString();
        }
        if (tableInfo.Ante > 0) {
            this.blindInfo.string += "(" + tableInfo.Ante + ")";
        }
        this.chipsInfo.string = cc.dgame.utils.formatValue(tableInfo.BuyinMin).toString() + "/" + cc.dgame.utils.formatValue(tableInfo.BuyinMax).toString();
        this.playingnum.string = tableInfo.PlayerNum + "/" + tableInfo.MaxNum;
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
