"use strict";
cc._RF.push(module, 'f1bbfUIR3hCYZJCXcouF3no', 'AccountItem');
// scripts/Wallet/AccountItem.js

"use strict";

cc.Class({
  "extends": cc.Component,
  properties: {
    background: cc.Node,
    existAccount: cc.Node,
    nickname: cc.RichText,
    //addr: cc.Label,
    selected: cc.Node,
    newAccount: cc.Node // ...

  },
  // use this for initialization
  init: function init(accountInfo) {
    //        this.indexNum.string = accountInfo.index.toString()
    if (accountInfo.Index % 2 == 0) {
      this.background.opacity = 0;
    }

    if (accountInfo.Newaccount) {
      this.existAccount.active = false;
      this.newAccount.active = true;
    } else {
      this.existAccount.active = true;
      this.newAccount.active = false;
      this.nickname.string = cc.dgame.utils.formatRichText(accountInfo.Nickname, "#AFC6DD", true, false);
      this.accountAddr = accountInfo.Addr; //this.addr.string = accountInfo.Addr.substr(0, 18);

      if (cc.dgame.settings.account.Addr == accountInfo.Addr) {
        this.selected.active = true;
      } else {
        this.selected.active = false;
      }
    } //        this.labelGold.string = accountInfo.Gold.toString()

  },
  updateSelection: function updateSelection() {
    if (cc.dgame.settings.account.LoginAddr == this.accountAddr) {
      this.selected.active = true;
    } else {
      this.selected.active = false;
    }
  },
  // called every frame
  update: function update(dt) {},
  selectAccount: function selectAccount() {
    var loginAccount = cc.find('LoginAccount').getComponent('LoginAccount');

    if (this.newAccount.active) {
      loginAccount.tryNewAccount();
    } else {
      //wallet.updateCurrentAccount(this.accountAddr.string)
      loginAccount.tryVerifyAccount(this.nickname.string, this.accountAddr);
    }
  }
});

cc._RF.pop();