cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        prefabGametableItem: cc.Prefab,
        gametableNum: 0
    },

    // use this for initialization
    onLoad () {
        this.content = this.scrollView.content;
        //this.populateList();
    },

    populateList (data) {
        this.content.removeAllChildren()
        for (let i in data) {
            var tableInfo = {};
            tableInfo.Index = i;
            tableInfo.TableId = data[i].TableId;
            tableInfo.DisplayTableId = data[i].DisplayTableId;
            tableInfo.Ante = data[i].Ante;
            tableInfo.PlayerNum = data[i].PlayerNum;
            tableInfo.MaxNum = data[i].MaxNum;
            tableInfo.Status = data[i].CurrentStatu;
            tableInfo.SmallBlind = data[i].SmallBlind;
            tableInfo.Straddle = data[i].Straddle;
            tableInfo.BuyinMin = data[i].BuyinMin;
            tableInfo.BuyinMax = data[i].BuyinMax;
            tableInfo.Type = data[i].Type;
            tableInfo.TableProps = data[i].TableProps;
            tableInfo.GameLength = data[i].GameLength;
            tableInfo.LeftTime = data[i].LeftTime;
            tableInfo.InsuranceOdds = data[i].InsuranceOdds;
            var item = cc.instantiate(this.prefabGametableItem);
            item.getComponent('ClubGameTableItem').init(tableInfo);
            this.content.addChild(item);
        }
        this.scrollView.scrollToTop();
    },

    selectGameTable (tableId) {
        for (let i in this.content.getChildren()) {
            let item = this.content.getChildren()[i].getComponent("ClubGameTableItem");
            if (tableId == item.tableInfo.TableId) {
                item.selectGametable();
                return;
            }
        }
    },

    // called every frame
    update: function (dt) {

    },
});
