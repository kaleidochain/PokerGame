cc.Class({
    extends: cc.Component,

    properties: {
        pokerPrefab: cc.Prefab,
        myselfMark: cc.Node,
        nickname: cc.Label,
        avator: cc.Sprite,
        RMTWinloss: [cc.RichText],
        RMTCardtype: [cc.Label],
        holecards: [cc.Node],
        RMTLayout: cc.Node,
        RMTLayer: [cc.Node],
        RMTCommunityCards1: [cc.Node],
        RMTCommunityCards2: [cc.Node],
        RMTCommunityCards3: [cc.Node],
        RMTCommunityCards4: [cc.Node],
        // ...
    },

    // use this for initialization
    init: function (playerInfo) {
// {
//     "Addr": "0xe2A04360345EeCE3d7e781B652A998cfaaD559A8",
//     "HoleCards": [23, 51],
//     "RMTCommunityCards": [
//         [2, 41, 46, 48, 4],
//         [28, 24, 42, 44, 17],
//         [14, 43, 9, 0, 21],
//         [45, 34, 5, 18, 37]
//     ],
//     "CardType": ["One pair", "High card", "High card", "One pair"],
//     "WinLoss": [-100, -100, -100, 100]
// }
        let assetMgr = cc.find("AssetMgr").getComponent("AssetMgr");
        var idx = parseInt(playerInfo.Addr.substr(2, 2), 16);
        if (isNaN(idx)) {
            idx = 0;
        }
        if (cc.dgame.settings.account.Addr.toLowerCase() == playerInfo.Addr.toLowerCase()) {
            this.myselfMark.active = true;
        }
        this.avator.spriteFrame = assetMgr.heads[idx % 200];
        this.nickname.string = playerInfo.Addr.substr(2, 8);
        for (let i = 0; i < 2; i++) {
            let cardNode = cc.instantiate(this.pokerPrefab);
            this.holecards[i].addChild(cardNode);
            let poker = cardNode.getComponent('Poker');
            poker.init(0, 0);
            if (playerInfo.HoleCards[i] != null && playerInfo.HoleCards[i] != undefined) {
                poker.setCardPoint(playerInfo.HoleCards[i]);
                poker.setFaceUp(true);
            } else {
                poker.setFaceUp(false);
            }
        }

        let RMTCommunityCards = new Array();
        RMTCommunityCards.push(this.RMTCommunityCards1);
        RMTCommunityCards.push(this.RMTCommunityCards2);
        RMTCommunityCards.push(this.RMTCommunityCards3);
        RMTCommunityCards.push(this.RMTCommunityCards4);
        for (let i = 0; i < playerInfo.WinLoss.length; i++) {
            this.RMTLayer[i].active = true;
            let val = cc.dgame.utils.formatValue(Math.abs(playerInfo.WinLoss[i]));
            if (playerInfo.WinLoss[i] > 0) {
                this.RMTWinloss[i].string = cc.dgame.utils.formatRichText('+' + val, "#67D067", true, false);
            } else if (playerInfo.WinLoss[i] == 0) {
                this.RMTWinloss[i].string = cc.dgame.utils.formatRichText(0, "#D6D6D6", true, false);
            } else {
                this.RMTWinloss[i].string = cc.dgame.utils.formatRichText('-' + val, "#FF6E6E", true, false);
            }
            this.RMTCardtype[i].string = playerInfo.CardType[i];
            for (let j = 0; j < playerInfo.RMTCommunityCards[i].length && j < RMTCommunityCards[i].length; j++) {
                if (playerInfo.RMTCommunityCards[i][j] != null && playerInfo.RMTCommunityCards[i][j] != undefined) {
                    let cardNode = cc.instantiate(this.pokerPrefab);
                    RMTCommunityCards[i][j].addChild(cardNode);
                    let poker = cardNode.getComponent('Poker');
                    poker.init(0, 0);
                    poker.setCardPoint(playerInfo.RMTCommunityCards[i][j]);
                    poker.setFaceUp(true);
                }
            }
        }
        this.node.height = this.RMTLayer[0].height * playerInfo.WinLoss.length + 14;
    },

    // called every frame
    update: function (dt) {

    },

});
