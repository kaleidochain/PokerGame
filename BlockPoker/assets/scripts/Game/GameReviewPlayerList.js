cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        prefabGameReviewPlayerItem: cc.Prefab,
        playerNum: 0
    },

    // use this for initialization
    onLoad: function () {
        this.content = this.scrollView.content;
        //this.populateList();
    },

    populateList: function(data) {
        this.content.removeAllChildren();
        for (let i in data) {
            var playerInfo = {};
            playerInfo.Nickname = data[i].Nickname;
            playerInfo.Addr = data[i].Addr;
            playerInfo.HoleCards = data[i].HoleCards;
            playerInfo.RMTCommunityCards = data[i].RMTCommunityCards;
            playerInfo.WinLoss = data[i].WinLoss;
            playerInfo.CardType = data[i].CardType;
            var item = cc.instantiate(this.prefabGameReviewPlayerItem);
            item.getComponent('GameReviewPlayerItem').init(playerInfo);
            this.content.addChild(item);
        }
    },

    // called every frame
    update: function (dt) {

    },
});
