cc.Class({
    extends: cc.Component,

    properties: {
        masterMark: cc.Node,
        nickname: cc.Label,
        avator: cc.Sprite,
        kickoutMark: cc.Node,
        // ...
    },

    // use this for initialization
    // {'Ante':4,'BuyinMax':400,'BuyinMin':100,'CurrentStatu':0,'MaxNum':4,'MinNum':2,'PlayerNum':2,'SmallBlind':4,'Straddle':0,'TableId':1}
    init: function (addr, ownerAddr) {
        let assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");
        var idx = parseInt(addr.substr(2, 2), 16);
        if (isNaN(idx)) {
            idx = 0;
        }
        this.avator.spriteFrame = assetMgr.heads[idx % 200];
        this.nickname.string = addr.substr(2, 8);
        this.accountAddr = addr;
        if (addr == ownerAddr) {
            this.masterMark.active = true;
        }
    },

    // called every frame
    update: function (dt) {

    },

    preSelect () {
        this.kickoutMark.active = true;
    },

    unpreSelect () {
        this.kickoutMark.active = false;
    },
/*
    onBtnClicked () {
        if (!this.unselected.active && !this.unselected.active) {
            return;
        }
        if (!this.unselected.active) {
            this.unselected.active = !this.unselected.active;
            this.selected.active = false;
        } else if (!this.selected.active) {
            this.selected.active = !this.selected.active;
            this.unselected.active = false;
        }
    },
*/
    onBtnKickoutClicked () {
        var clubHall = cc.find('ClubHall').getComponent('ClubHall');
        clubHall.showKickoutMemberToast(this.accountAddr);
    },
});
