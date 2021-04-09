cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:
    copyToClipboard (content) {
        if (cc.sys.isNative) {
            if (cc.sys.isMobile) {
                if (cc.sys.os === cc.sys.OS_IOS) {
                    jsb.reflection.callStaticMethod('NativeGengine', 'copyToClipboard:', content)
                } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                    jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity', 'copyToClipboard', '(Ljava/lang/String;)V', content);
                }
            } else if (cc.sys.os === cc.sys.OS_WINDOWS||cc.sys.os === cc.sys.OS_OSX) {
                copyToClipboard(content);
            } 
        }
    },
    // onLoad () {},

    start () {

    },

    // update (dt) {},
});
