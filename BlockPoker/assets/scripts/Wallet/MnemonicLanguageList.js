cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        prefabLanguageItem: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        this.content = this.scrollView.content;
        //this.populateList();
    },

    populateList: function() {
        this.content.removeAllChildren()
        let data = new Array;
        data.push({"Language":"English", "Name":"English"});
        data.push({"Language":"French", "Name":"French"});
        data.push({"Language":"Italian", "Name":"Italian"});
        data.push({"Language":"Japanese", "Name":"Japanese"});
        data.push({"Language":"Korean", "Name":"Korean"});
        data.push({"Language":"Spanish", "Name":"Spanish"});
        data.push({"Language":"ChineseSimplified", "Name":"简体中文"});
        data.push({"Language":"ChineseTraditional", "Name":"繁体中文"});
        for (let i in data) {
            var languageInfo = {};
            languageInfo.Language = data[i].Language;
            languageInfo.Name = data[i].Name;
            var item = cc.instantiate(this.prefabLanguageItem);
            item.getComponent('MnemonicLanguageItem').init(languageInfo);
            this.content.addChild(item);
        }
    },

    // called every frame
    update: function (dt) {

    },
});
