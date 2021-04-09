"use strict";
cc._RF.push(module, 'aab6dWEQMNCBoV3Fv9jcsdx', 'ClubItem');
// scripts/Game/ClubItem.js

"use strict";

cc.Class({
  "extends": cc.Component,
  properties: {
    background: cc.Node,
    clubName: cc.RichText,
    //addr: cc.Label,
    createClub: cc.Node,
    joinClub: cc.Node // ...

  },
  // use this for initialization
  init: function init(clubInfo) {
    //        this.indexNum.string = clubInfo.index.toString()
    if (clubInfo.Index % 2 == 0 || clubInfo.CreateClub || clubInfo.JoinClub) {
      this.background.opacity = 0;
    }

    if (clubInfo.CreateClub) {
      this.clubName.node.active = false;
      this.createClub.active = true;
      this.joinClub.active = false;
    } else if (clubInfo.JoinClub) {
      this.clubName.node.active = false;
      this.createClub.active = false;
      this.joinClub.active = true;
    } else {
      this.clubName.node.active = true;
      this.createClub.active = false;
      this.joinClub.active = false;
      var showClubID = cc.dgame.utils.formatClubID(clubInfo.ClubID);
      this.clubName.string = cc.dgame.utils.formatRichText(clubInfo.ClubName + " : " + showClubID, "#AFC6DD", true, false);
      this.clubID = clubInfo.ClubID;
      this.clubAddr = clubInfo.Addr;
      this.ownerAddr = clubInfo.Owner;
    }
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
  selectClub: function selectClub() {
    var clubHall = cc.find('ClubHall').getComponent('ClubHall');

    if (this.createClub.active) {
      clubHall.onBtnCreateClubClicked();
      clubHall.onBtnDropdownClubListClicked();
    } else if (this.joinClub.active) {
      clubHall.onBtnJoinClubClicked();
      clubHall.onBtnDropdownClubListClicked();
    } else {
      //wallet.updateCurrentAccount(this.accountAddr.string)
      clubHall.updateClubID(this.clubID);
    }
  }
});

cc._RF.pop();