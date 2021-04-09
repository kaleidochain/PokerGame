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
        Log.Trace("ResultPlayersList populateList");
        this.content.removeAllChildren();
        let rank = 0;
        for (let i in result) {
            var item = cc.instantiate(this.prefabResultPlayerItem);
            rank = rank + 1;
            item.getComponent('ResultPlayerItem').init(rank,result[i]);
            this.content.addChild(item);
        }
        this.scrollView.scrollToTop();
    },

    // called every frame
    update (dt) {

    },
});
