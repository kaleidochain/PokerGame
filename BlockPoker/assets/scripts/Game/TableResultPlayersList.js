var Log = require("Log");
cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        prefabResultPlayerItem: cc.Prefab,
    },

    // use this for initialization
    onLoad () {
        this.content = this.scrollView.content;
    },

    populateList (result) {
        // Log.Trace("TableResultPlayersList populateList result:"  + JSON.stringify(result));
        let INSNode = cc.instantiate(this.content.children[0]);
        this.content.removeAllChildren();
        this.content.addChild(INSNode);
        for (let i in result) {
            var item = cc.instantiate(this.prefabResultPlayerItem);
            item.getComponent('TableResultPlayerItem').init(result[i]);
            this.content.addChild(item);
        }
        this.scrollView.scrollToTop();
    },

    // called every frame
    update (dt) {

    },
});
