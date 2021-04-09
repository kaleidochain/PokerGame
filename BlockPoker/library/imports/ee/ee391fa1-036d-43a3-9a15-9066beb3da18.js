"use strict";
cc._RF.push(module, 'ee391+hA21Do5oVkGa+s9oY', 'AudioMgr');
// scripts/components/AudioMgr.js

"use strict";

var Log = require("Log");

cc.Class({
  "extends": cc.Component,
  properties: {
    dealCard: {
      "default": null,
      type: cc.AudioClip
    },
    foldCard: {
      "default": null,
      type: cc.AudioClip
    },
    chipsToPot: {
      "default": null,
      type: cc.AudioClip
    },
    chipsToTable: {
      "default": null,
      type: cc.AudioClip
    },
    checkSound: {
      "default": null,
      type: cc.AudioClip
    },
    slider: {
      "default": null,
      type: cc.AudioClip
    },
    sliderTop: {
      "default": null,
      type: cc.AudioClip
    },
    timeOverTip: {
      "default": null,
      type: cc.AudioClip
    }
  },
  onLoad: function onLoad() {
    if (!cc.dgame) {
      cc.dgame = {};
    }

    cc.dgame.audioMgr = this;
    Log.Trace("AudioMgr:onLoad");
  },
  start: function start() {},
  playMusic: function playMusic() {//        cc.audioEngine.playMusic( this.bgm, true );
  },
  pauseMusic: function pauseMusic() {
    cc.audioEngine.pauseMusic();
  },
  resumeMusic: function resumeMusic() {
    cc.audioEngine.resumeMusic();
  },
  _playSFX: function _playSFX(clip) {
    if (cc.dgame.settings.setting.Sound) {
      cc.audioEngine.playEffect(clip, false);
    }
  },
  playDealCard: function playDealCard() {
    this._playSFX(this.dealCard);
  },
  playFoldCard: function playFoldCard() {
    this._playSFX(this.foldCard);
  },
  playChipsToTable: function playChipsToTable() {
    this._playSFX(this.chipsToTable);
  },
  playChipsToPot: function playChipsToPot() {
    this._playSFX(this.chipsToPot);
  },
  playCheckSound: function playCheckSound() {
    this._playSFX(this.checkSound);
  },
  playSlider: function playSlider() {
    this._playSFX(this.slider);
  },
  playSliderTop: function playSliderTop() {
    this._playSFX(this.sliderTop);
  },
  playTimeOverTip: function playTimeOverTip() {
    this._playSFX(this.timeOverTip);
  },
  onDestroy: function onDestroy() {
    if (!!cc.dgame) {
      cc.dgame.audioMgr = null;
    }

    Log.Trace("AudioMgr:onDestroy");
  }
});

cc._RF.pop();