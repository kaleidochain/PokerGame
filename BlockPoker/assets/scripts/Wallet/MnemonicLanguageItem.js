cc.Class({
    extends: cc.Component,

    properties: {
        languageName: cc.Label,
        selected: cc.Node,
        // ...
    },

    // use this for initialization
    init: function (languageInfo) {
        this.languageName.string = languageInfo.Name;
        this.language = languageInfo.Language;
        if (cc.sys.localStorage.getItem("mnemonicLanguage") == languageInfo.Language) {
            this.selected.active = true;
        } else {
            this.selected.active = false;
        }
    },

    // called every frame
    update: function (dt) {

    },

    selectLanguage: function() {
        cc.sys.localStorage.setItem("mnemonicLanguage", this.language);
        var loginMnemonic = cc.find('LoginMnemonic').getComponent('LoginMnemonic');
        loginMnemonic.selectLanguage(this.language);
    },
});
