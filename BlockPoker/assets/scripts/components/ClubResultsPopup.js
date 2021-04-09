var Log = require('Log');

cc.Class({
    extends: cc.Component,

    properties: {
        _clubResultsPopup: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (!cc.dgame) {
            return;
        }
        Log.Trace("ClubResultsPopup onLoad (cc.dgame.tableInfo.TableProps & 0x1):" + ((cc.dgame.tableInfo.TableProps & 0x1)));
        if ( parseInt(cc.dgame.tableInfo.TableId) < 0xE000000000000 && ((cc.dgame.tableInfo.TableProps & 0x1) == 0) ){
            cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BtnClubResults").active = true;
        }
        if (!!cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BtnClubResults")) {
            this._clubResultsPopup = cc.find("Canvas/MenuLayer/ClubResultsPopup");
            cc.dgame.utils.addClickEvent(cc.find("returnBackground", this._clubResultsPopup), this.node, "ClubResultsPopup", "onBtnCloseClubResultsClicked");
            cc.dgame.utils.addClickEvent(cc.find("Canvas/MenuLayer/LeftTopMemuLayer/BtnClubResults"), this.node, "ClubResultsPopup", "onBtnClubResultsClicked");
        }
    },

    start () {

    },

    onBtnCloseClubResultsClicked () {
        this._clubResultsPopup.active = false;
    },
    
    onBtnClubResultsClicked () {
        let popup = cc.find('sprite_splash', this._clubResultsPopup);
        let dstv2 = popup.getPosition();
        popup.setPosition(- cc.winSize.width / 2, 0);
        popup.runAction(
            cc.moveTo(0.2, dstv2),
        );
        this._clubResultsPopup.active = true;
        cc.dgame.normalLoading.startInvokeWaiting();
        this.scheduleOnce(function () {
            var tableDetail_cmd = {
                TableId: cc.dgame.tableInfo.TableId,
            };
            cc.dgame.net.gameCall(['tableDetail', JSON.stringify(tableDetail_cmd)], this._onTableDetail.bind(this));
        }, 0.05);
    },

    _onTableDetail (tableInfo) {
        Log.Trace("ClubResultsPopup _onTableDetail tableInfo:" + JSON.stringify(tableInfo));
        if (tableInfo == "Network disconnected") {
            cc.dgame.normalLoading.showLoadTimeout();
            return;
        }
        cc.dgame.normalLoading.stopInvokeWaiting();
        let tableIdLabel = cc.find("sprite_splash/HeaderLayer/roomId", this._clubResultsPopup).getComponent(cc.Label);
        tableIdLabel.string = "Room:";
        let clubid = Math.floor(tableInfo.TableId / 0x10000000);
        let displayTableId = tableInfo.TableId - clubid * 0x10000000;
        if (displayTableId < 10) {
            tableIdLabel.string += '00' + displayTableId;
        } else if (displayTableId < 100) {
            tableIdLabel.string += '0' + displayTableId;
        } else {
            tableIdLabel.string += displayTableId;
        }
        if ( tableInfo.InsuranceWin != null ) {
            cc.find("sprite_splash/scrollview/view/content/ins_layer", this._clubResultsPopup).active = true;
            let winLabel = cc.find("sprite_splash/scrollview/view/content/ins_layer/label", this._clubResultsPopup).getComponent(cc.Label);
            winLabel.string = tableInfo.InsuranceWin;
        }
        let leftTimeLabel = cc.find("sprite_splash/HeaderLayer/time", this._clubResultsPopup).getComponent(cc.Label);
        Log.Trace("tableInfo.LeftTime:" + tableInfo.LeftTime);
        leftTimeLabel.string = cc.dgame.utils.timeToHMS(tableInfo.LeftTime);

        cc.find("sprite_splash/scrollview",this._clubResultsPopup).getComponent("TableResultPlayersList").populateList(tableInfo.Result);
    },

    onDestroy () {
    }
    // update (dt) {},
});
