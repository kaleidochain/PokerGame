cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        prefabAccountItem: cc.Prefab,
        accountNum: 0
    },

    // use this for initialization
    onLoad () {
        this.content = this.scrollView.content;
        //this.populateList();
    },

    populateList (data) {
        this.content.removeAllChildren()
        for (let i in data) {
            var accountInfo = {};
            accountInfo.Index = i;
            accountInfo.Addr = data[i].Addr;
            accountInfo.Nickname = data[i].Nickname;
            var item = cc.instantiate(this.prefabAccountItem);
            item.getComponent('AccountItem').init(accountInfo);
            this.content.addChild(item);
        }
        var accountInfo = {};
        accountInfo.Index = data.length;
        accountInfo.Newaccount = true;
        var item = cc.instantiate(this.prefabAccountItem);
        item.getComponent('AccountItem').init(accountInfo);
        this.content.addChild(item);
    },

    updateSelection () {
        for (let i in this.content.getChildren()) {
            let item = this.content.getChildren()[i].getComponent("AccountItem");
            item.updateSelection();
        }
    },
    // called every frame
    update (dt) {

    },
});
