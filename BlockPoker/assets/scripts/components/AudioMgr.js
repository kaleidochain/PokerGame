var Log = require("Log");

cc.Class({
    extends: cc.Component,

    properties: {
        dealCard: {
            default: null,
            type: cc.AudioClip,
        },

        foldCard: {
            default: null,
            type: cc.AudioClip,
        },

        chipsToPot: {
            default: null,
            type: cc.AudioClip,
        },

        chipsToTable: {
            default: null,
            type: cc.AudioClip,
        },

        checkSound: {
            default: null,
            type: cc.AudioClip,
        },

        slider: {
            default: null,
            type: cc.AudioClip,
        },

        sliderTop: {
            default: null,
            type: cc.AudioClip,
        },

        timeOverTip: {
            default: null,
            type: cc.AudioClip,
        },
    },

    onLoad () {
        if (!cc.dgame) {
            cc.dgame = {};
        }

        cc.dgame.audioMgr = this;
        Log.Trace("AudioMgr:onLoad");
    },

    start () {

    },

    playMusic () {
//        cc.audioEngine.playMusic( this.bgm, true );
    },

    pauseMusic () {
        cc.audioEngine.pauseMusic();
    },

    resumeMusic () {
        cc.audioEngine.resumeMusic();
    },

    _playSFX (clip) {
        if (cc.dgame.settings.setting.Sound) {
            cc.audioEngine.playEffect( clip, false );
        }
    },

    playDealCard () {
        this._playSFX(this.dealCard);
    },

    playFoldCard () {
        this._playSFX(this.foldCard);
    },

    playChipsToTable () {
        this._playSFX(this.chipsToTable);
    },

    playChipsToPot () {
        this._playSFX(this.chipsToPot);
    },

    playCheckSound () {
        this._playSFX(this.checkSound);
    },

    playSlider () {
        this._playSFX(this.slider);  
    },

    playSliderTop () {
        this._playSFX(this.sliderTop);
    },

    playTimeOverTip () {
        this._playSFX(this.timeOverTip);  
    },

    onDestroy () {
        if (!!cc.dgame) {
            cc.dgame.audioMgr = null;
        }
        Log.Trace("AudioMgr:onDestroy");
    },
});
