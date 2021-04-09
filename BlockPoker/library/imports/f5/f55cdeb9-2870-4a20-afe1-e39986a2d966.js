"use strict";
cc._RF.push(module, 'f55cd65KHBKIK/h45mGotlm', 'MnemonicLanguageItem');
// scripts/Wallet/MnemonicLanguageItem.js

"use strict";

cc.Class({
  "extends": cc.Component,
  properties: {
    languageName: cc.Label,
    selected: cc.Node // ...

  },
  // use this for initialization
  init: function init(languageInfo) {
    this.languageName.string = languageInfo.Name;
    this.language = languageInfo.Language;

    if (cc.sys.localStorage.getItem("mnemonicLanguage") == languageInfo.Language) {
      this.selected.active = true;
    } else {
      this.selected.active = false;
    }
  },
  // called every frame
  update: function update(dt) {},
  selectLanguage: function selectLanguage() {
    cc.sys.localStorage.setItem("mnemonicLanguage", this.language);
    var loginMnemonic = cc.find('LoginMnemonic').getComponent('LoginMnemonic');
    loginMnemonic.selectLanguage(this.language);
  }
});

cc._RF.pop();