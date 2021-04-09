cc.Class({
    extends: cc.Component,

    properties: {
        _bottomMenuToggles: [cc.Toggle],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (!cc.dgame) {
            return;
        }

        this._bottomMenuToggles.push(cc.find("Canvas/BottomMenu/sprite_splash/toggleContainer/sceneRooms").getComponent(cc.Toggle));
        this._bottomMenuToggles.push(cc.find("Canvas/BottomMenu/sprite_splash/toggleContainer/sceneClub").getComponent(cc.Toggle));
        this._bottomMenuToggles.push(cc.find("Canvas/BottomMenu/sprite_splash/toggleContainer/sceneMe").getComponent(cc.Toggle));
        this._bottomMenuToggles.push(cc.find("Canvas/BottomMenu/sprite_splash/toggleContainer/sceneResult").getComponent(cc.Toggle));
        cc.dgame.utils.addToggleClickEvent(this._bottomMenuToggles[0], this.node, "BottomMenu", "onBtnClicked");
        cc.dgame.utils.addToggleClickEvent(this._bottomMenuToggles[1], this.node, "BottomMenu", "onBtnClicked");
        cc.dgame.utils.addToggleClickEvent(this._bottomMenuToggles[2], this.node, "BottomMenu", "onBtnClicked");
        cc.dgame.utils.addToggleClickEvent(this._bottomMenuToggles[3], this.node, "BottomMenu", "onBtnClicked");
        cc.dgame.bottomMenu = this;
    },

    start () {

    },

    onBtnClicked (toggle) {
        var index = this._bottomMenuToggles.indexOf(toggle);
        switch (index) {
        case 0:
            cc.director.loadScene('GameHall');
            break;
        case 1:
            cc.director.loadScene('ClubHall');
            break;
        case 2:
            cc.director.loadScene('MySettings');
            break;
       case 3:
           cc.director.loadScene('Result');
           break;
        }
    },

    onDestroy () {
        if (!!cc.dgame) {
            cc.dgame.bottomMenu = null;
        }
    },
    // update (dt) {},
});
