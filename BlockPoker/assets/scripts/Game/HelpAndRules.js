var Log = require("Log");

cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        whatsTexasHoldemContent: cc.Node,
        fourRoundsOfBettingContent: cc.Node,
        handRulesContent: cc.Node,
        fairnessStatementContent: cc.Node,
        overviewOfSecurityContent: cc.Node,
        kaleidochainDescriptionContent: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    start () {

    },

    onBtnBackClicked () {
        Log.Trace("[onBtnBackClicked]" + cc.dgame.helpAndRulesScene);
        if (cc.dgame.helpAndRulesScene == "TexasHoldemTutorial") {
            cc.director.loadScene("GameHall");
        } else {
            cc.director.loadScene("MySettings");
        }
    },

    onBtnTutorialClicked () {
        if (cc.sys.isNative) {
            if (cc.sys.isMobile) {
                if (cc.sys.os === cc.sys.OS_IOS) {
                    jsb.reflection.callStaticMethod("NativeGengine", "openURL:", "https://youtu.be/Fbm1J9j2tIA");
                } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                    jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "openURL", "(Ljava/lang/String;)V", "https://youtu.be/Fbm1J9j2tIA");
                }
            } else if (cc.sys.os === cc.sys.OS_WINDOWS||cc.sys.os === cc.sys.OS_OSX) {
                openURL("https://youtu.be/Fbm1J9j2tIA");
            }
        }
    },

    onBtnWhatsTexasHoldemClicked () {
        this.whatsTexasHoldemContent.active = !this.whatsTexasHoldemContent.active;
        cc.find("Canvas/sprite_splash/Rules/view/content/WhatsTexasHoldem/btn_normal").active = !this.whatsTexasHoldemContent.active;
        cc.find("Canvas/sprite_splash/Rules/view/content/WhatsTexasHoldem/btn_clicked").active = this.whatsTexasHoldemContent.active;
        if (this.whatsTexasHoldemContent.active) {
            //this.whatsTexasHoldemContent.active = false;
            this.fourRoundsOfBettingContent.active = false;
            this.handRulesContent.active = false;
            this.fairnessStatementContent.active = false;
            this.overviewOfSecurityContent.active = false;
            this.kaleidochainDescriptionContent.active = false;
            //cc.find("Canvas/sprite_splash/Rules/view/content/WhatsTexasHoldem/btn_normal").active = !this.whatsTexasHoldemContent.active;
            //cc.find("Canvas/sprite_splash/Rules/view/content/WhatsTexasHoldem/btn_clicked").active = this.whatsTexasHoldemContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FourRoundsOfBetting/btn_normal").active = !this.fourRoundsOfBettingContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FourRoundsOfBetting/btn_clicked").active = this.fourRoundsOfBettingContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/HandRules/btn_normal").active = !this.handRulesContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/HandRules/btn_clicked").active = this.handRulesContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FairnessStatement/btn_normal").active = !this.fairnessStatementContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FairnessStatement/btn_clicked").active = this.fairnessStatementContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/OverviewOfSecurity/btn_normal").active = !this.overviewOfSecurityContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/OverviewOfSecurity/btn_clicked").active = this.overviewOfSecurityContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/KaleidochainDescription/btn_normal").active = !this.kaleidochainDescriptionContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/KaleidochainDescription/btn_clicked").active = this.kaleidochainDescriptionContent.active;
            this.scrollView.scrollToTop();
        }
    },

    onBtnFourRoundsOfBettingClicked () {
        this.fourRoundsOfBettingContent.active = !this.fourRoundsOfBettingContent.active;
        cc.find("Canvas/sprite_splash/Rules/view/content/FourRoundsOfBetting/btn_normal").active = !this.fourRoundsOfBettingContent.active;
        cc.find("Canvas/sprite_splash/Rules/view/content/FourRoundsOfBetting/btn_clicked").active = this.fourRoundsOfBettingContent.active;
        if (this.fourRoundsOfBettingContent.active) {
            this.whatsTexasHoldemContent.active = false;
            //this.fourRoundsOfBettingContent.active = false;
            this.handRulesContent.active = false;
            this.fairnessStatementContent.active = false;
            this.overviewOfSecurityContent.active = false;
            this.kaleidochainDescriptionContent.active = false;
            cc.find("Canvas/sprite_splash/Rules/view/content/WhatsTexasHoldem/btn_normal").active = !this.whatsTexasHoldemContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/WhatsTexasHoldem/btn_clicked").active = this.whatsTexasHoldemContent.active;
            //cc.find("Canvas/sprite_splash/Rules/view/content/FourRoundsOfBetting/btn_normal").active = !this.fourRoundsOfBettingContent.active;
            //cc.find("Canvas/sprite_splash/Rules/view/content/FourRoundsOfBetting/btn_clicked").active = this.fourRoundsOfBettingContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/HandRules/btn_normal").active = !this.handRulesContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/HandRules/btn_clicked").active = this.handRulesContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FairnessStatement/btn_normal").active = !this.fairnessStatementContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FairnessStatement/btn_clicked").active = this.fairnessStatementContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/OverviewOfSecurity/btn_normal").active = !this.overviewOfSecurityContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/OverviewOfSecurity/btn_clicked").active = this.overviewOfSecurityContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/KaleidochainDescription/btn_normal").active = !this.kaleidochainDescriptionContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/KaleidochainDescription/btn_clicked").active = this.kaleidochainDescriptionContent.active;
            this.scrollView.scrollToTop();
        }
    },

    onBtnHandRulesClicked () {
        this.handRulesContent.active = !this.handRulesContent.active;
        cc.find("Canvas/sprite_splash/Rules/view/content/HandRules/btn_normal").active = !this.handRulesContent.active;
        cc.find("Canvas/sprite_splash/Rules/view/content/HandRules/btn_clicked").active = this.handRulesContent.active;
        if (this.handRulesContent.active) {
            this.whatsTexasHoldemContent.active = false;
            this.fourRoundsOfBettingContent.active = false;
            //this.handRulesContent.active = false;
            this.fairnessStatementContent.active = false;
            this.overviewOfSecurityContent.active = false;
            this.kaleidochainDescriptionContent.active = false;
            cc.find("Canvas/sprite_splash/Rules/view/content/WhatsTexasHoldem/btn_normal").active = !this.whatsTexasHoldemContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/WhatsTexasHoldem/btn_clicked").active = this.whatsTexasHoldemContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FourRoundsOfBetting/btn_normal").active = !this.fourRoundsOfBettingContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FourRoundsOfBetting/btn_clicked").active = this.fourRoundsOfBettingContent.active;
            //cc.find("Canvas/sprite_splash/Rules/view/content/HandRules/btn_normal").active = !this.handRulesContent.active;
            //cc.find("Canvas/sprite_splash/Rules/view/content/HandRules/btn_clicked").active = this.handRulesContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FairnessStatement/btn_normal").active = !this.fairnessStatementContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FairnessStatement/btn_clicked").active = this.fairnessStatementContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/OverviewOfSecurity/btn_normal").active = !this.overviewOfSecurityContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/OverviewOfSecurity/btn_clicked").active = this.overviewOfSecurityContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/KaleidochainDescription/btn_normal").active = !this.kaleidochainDescriptionContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/KaleidochainDescription/btn_clicked").active = this.kaleidochainDescriptionContent.active;
            this.scrollView.scrollToTop();
        }
    },

    onBtnFairnessStatementClicked () {
        this.fairnessStatementContent.active = !this.fairnessStatementContent.active;
        cc.find("Canvas/sprite_splash/Rules/view/content/FairnessStatement/btn_normal").active = !this.fairnessStatementContent.active;
        cc.find("Canvas/sprite_splash/Rules/view/content/FairnessStatement/btn_clicked").active = this.fairnessStatementContent.active;
        if (this.fairnessStatementContent.active) {
            this.whatsTexasHoldemContent.active = false;
            this.fourRoundsOfBettingContent.active = false;
            this.handRulesContent.active = false;
            //this.fairnessStatementContent.active = false;
            this.overviewOfSecurityContent.active = false;
            this.kaleidochainDescriptionContent.active = false;
            cc.find("Canvas/sprite_splash/Rules/view/content/WhatsTexasHoldem/btn_normal").active = !this.whatsTexasHoldemContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/WhatsTexasHoldem/btn_clicked").active = this.whatsTexasHoldemContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FourRoundsOfBetting/btn_normal").active = !this.fourRoundsOfBettingContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FourRoundsOfBetting/btn_clicked").active = this.fourRoundsOfBettingContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/HandRules/btn_normal").active = !this.handRulesContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/HandRules/btn_clicked").active = this.handRulesContent.active;
            //cc.find("Canvas/sprite_splash/Rules/view/content/FairnessStatement/btn_normal").active = !this.fairnessStatementContent.active;
            //cc.find("Canvas/sprite_splash/Rules/view/content/FairnessStatement/btn_clicked").active = this.fairnessStatementContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/OverviewOfSecurity/btn_normal").active = !this.overviewOfSecurityContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/OverviewOfSecurity/btn_clicked").active = this.overviewOfSecurityContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/KaleidochainDescription/btn_normal").active = !this.kaleidochainDescriptionContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/KaleidochainDescription/btn_clicked").active = this.kaleidochainDescriptionContent.active;
            this.scrollView.scrollToTop();
        }
    },

    onBtnOverviewOfSecurityClicked () {
        this.overviewOfSecurityContent.active = !this.overviewOfSecurityContent.active;
        cc.find("Canvas/sprite_splash/Rules/view/content/OverviewOfSecurity/btn_normal").active = !this.overviewOfSecurityContent.active;
        cc.find("Canvas/sprite_splash/Rules/view/content/OverviewOfSecurity/btn_clicked").active = this.overviewOfSecurityContent.active;
        if (this.overviewOfSecurityContent.active) {
            this.whatsTexasHoldemContent.active = false;
            this.fourRoundsOfBettingContent.active = false;
            this.handRulesContent.active = false;
            this.fairnessStatementContent.active = false;
            //this.overviewOfSecurityContent.active = false;
            this.kaleidochainDescriptionContent.active = false;
            cc.find("Canvas/sprite_splash/Rules/view/content/WhatsTexasHoldem/btn_normal").active = !this.whatsTexasHoldemContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/WhatsTexasHoldem/btn_clicked").active = this.whatsTexasHoldemContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FourRoundsOfBetting/btn_normal").active = !this.fourRoundsOfBettingContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FourRoundsOfBetting/btn_clicked").active = this.fourRoundsOfBettingContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/HandRules/btn_normal").active = !this.handRulesContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/HandRules/btn_clicked").active = this.handRulesContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FairnessStatement/btn_normal").active = !this.fairnessStatementContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FairnessStatement/btn_clicked").active = this.fairnessStatementContent.active;
            //cc.find("Canvas/sprite_splash/Rules/view/content/OverviewOfSecurity/btn_normal").active = !this.overviewOfSecurityContent.active;
            //cc.find("Canvas/sprite_splash/Rules/view/content/OverviewOfSecurity/btn_clicked").active = this.overviewOfSecurityContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/KaleidochainDescription/btn_normal").active = !this.kaleidochainDescriptionContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/KaleidochainDescription/btn_clicked").active = this.kaleidochainDescriptionContent.active;
            this.scrollView.scrollToTop();
        }
    },

    onBtnKaleidochainDescriptionClicked () {
        this.kaleidochainDescriptionContent.active = !this.kaleidochainDescriptionContent.active;
        cc.find("Canvas/sprite_splash/Rules/view/content/KaleidochainDescription/btn_normal").active = !this.kaleidochainDescriptionContent.active;
        cc.find("Canvas/sprite_splash/Rules/view/content/KaleidochainDescription/btn_clicked").active = this.kaleidochainDescriptionContent.active;
        if (this.kaleidochainDescriptionContent.active) {
            this.whatsTexasHoldemContent.active = false;
            this.fourRoundsOfBettingContent.active = false;
            this.handRulesContent.active = false;
            this.fairnessStatementContent.active = false;
            this.overviewOfSecurityContent.active = false;
            //this.kaleidochainDescriptionContent.active = false;
            cc.find("Canvas/sprite_splash/Rules/view/content/WhatsTexasHoldem/btn_normal").active = !this.whatsTexasHoldemContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/WhatsTexasHoldem/btn_clicked").active = this.whatsTexasHoldemContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FourRoundsOfBetting/btn_normal").active = !this.fourRoundsOfBettingContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FourRoundsOfBetting/btn_clicked").active = this.fourRoundsOfBettingContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/HandRules/btn_normal").active = !this.handRulesContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/HandRules/btn_clicked").active = this.handRulesContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FairnessStatement/btn_normal").active = !this.fairnessStatementContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/FairnessStatement/btn_clicked").active = this.fairnessStatementContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/OverviewOfSecurity/btn_normal").active = !this.overviewOfSecurityContent.active;
            cc.find("Canvas/sprite_splash/Rules/view/content/OverviewOfSecurity/btn_clicked").active = this.overviewOfSecurityContent.active;
            //cc.find("Canvas/sprite_splash/Rules/view/content/KaleidochainDescription/btn_normal").active = !this.kaleidochainDescriptionContent.active;
            //cc.find("Canvas/sprite_splash/Rules/view/content/KaleidochainDescription/btn_clicked").active = this.kaleidochainDescriptionContent.active;
            this.scrollView.scrollToTop();
        }
    },
    // update (dt) {},
});
