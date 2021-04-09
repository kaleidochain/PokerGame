cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        prefabClubItem: cc.Prefab,
    },

    // use this for initialization
    onLoad () {
        this.content = this.scrollView.content;
        //this.populateList();
    },

    populateList (data, isMaster) {
        this.content.removeAllChildren()
        for (let i in data) {
            var clubInfo = {};
            clubInfo.Index = i;
            clubInfo.Addr = data[i].Addr;
            clubInfo.Owner = data[i].Owner;
            clubInfo.ClubName = data[i].ClubName;
            clubInfo.ClubID = data[i].ClubID;
            var item = cc.instantiate(this.prefabClubItem);
            item.getComponent('ClubItem').init(clubInfo);
            this.content.addChild(item);
        }
        //俱乐部群主不显示创建俱乐部按钮
        if (!isMaster) {
            var clubInfo = {};
            clubInfo.Index = data.length;
            clubInfo.CreateClub = true;
            var item = cc.instantiate(this.prefabClubItem);
            item.getComponent('ClubItem').init(clubInfo);
            this.content.addChild(item);
        }
        var clubInfo = {};
        clubInfo.Index = data.length + 1;
        clubInfo.JoinClub = true;
        var item = cc.instantiate(this.prefabClubItem);
        item.getComponent('ClubItem').init(clubInfo);
        this.content.addChild(item);
        if (this.content.getChildren().length < 4) {
            this.scrollView.node.height = 130 * this.content.getChildren().length + 20;
        } else {
            this.scrollView.node.height = 130 * 4 + 20;
        }
    },

    updateSelection () {
        for (let i in this.content.getChildren()) {
            let item = this.content.getChildren()[i].getComponent("ClubItem");
            item.updateSelection();
        }
    },
    // called every frame
    update (dt) {

    },
});