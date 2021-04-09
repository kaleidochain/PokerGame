cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        prefabSecurityInfoItem: cc.Prefab,
    },

    // use this for initialization
    onLoad () {
        this.content = this.scrollView.content;
        //this.populateList();
    },

    addTips (tips) {
        var item = cc.instantiate(this.prefabSecurityInfoItem);
        item.getComponent("SecurityInfoItem").init(tips);
        this.content.addChild(item);
        this.scrollView.scrollToTop();
    },

    populateList (data) {
        this.content.removeAllChildren();
        for (let i in data) {
            var item = cc.instantiate(this.prefabSecurityInfoItem);
            item.getComponent("SecurityInfoItem").init(data[i]);
            this.content.addChild(item);
        }
        this.scrollView.scrollToTop();
    },

    clear () {
        this.content.removeAllChildren()
    },

    // called every frame
    update: function (dt) {

    },
});
