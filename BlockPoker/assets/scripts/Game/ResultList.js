var Log = require("Log");
cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        prefabResultItem: cc.Prefab,
        prefabResultDateItem: cc.Prefab,
    },

    // use this for initialization
    onLoad () {
        this.content = this.scrollView.content;
        this.content.removeAllChildren();
        this.totalNormalItem = 0;
        this.pageNum = 1;
        this.scrollView.node.on('scroll-to-bottom', function (scrollView) {
            Log.Trace("scroll-to-bottom this.totalNormalItem:" + this.totalNormalItem);
            if ( this.totalNormalItem > 0 && this.totalNormalItem%10 == 0 ) {
                this.pageNum += 1;
                var resultHall = cc.find('Result').getComponent('ResultHall');
                resultHall.freshPlayedTables(this.pageNum);
            }
        }, this);
    },

    populateList (data) {
        if (JSON.stringify(data) == "{}") {
            Log.Trace("data == {}");
            return
        }
        let pageNum = data.PageIndex;
        let tableMap = data.Tables;
        Log.Trace("ResultList populateList pageNum:" + pageNum + " ,"+ "tableMap:" + JSON.stringify(tableMap));
        if (pageNum != this.pageNum) {
            Log.Error("populateList error pageNum:" + pageNum + " ,this.pageNum:" + this.pageNum);
            return
        }
        for (let date in tableMap) {
            Log.Trace("xxxx date:" + date);
            Log.Trace("this.content.childrenCount1:" + this.content.childrenCount)
            var dateItem = cc.instantiate(this.prefabResultDateItem);
            dateItem.getComponent('ResultItem').initTime(date);
            this.content.addChild(dateItem);
            let tableList = tableMap[date];
            Log.Trace("xxxx tableList:" + tableList);
            for (let i in tableList) {
                var item = cc.instantiate(this.prefabResultItem);
                item.getComponent('ResultItem').init(tableList[i]);
                this.content.addChild(item);
                this.totalNormalItem += 1;
            }
            Log.Trace("this.content.childrenCount2:" + this.content.childrenCount);
        }
        // this.scrollView.scrollToTop();
    },

    // called every frame
    update (dt) {

    },
});
