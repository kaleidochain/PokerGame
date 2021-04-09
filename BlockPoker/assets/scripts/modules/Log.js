var Log = cc.Class({
    extends: cc.Component,
    statics: {
        Trace:function(msg) {
            if (cc.sys.isNative) {
                if (cc.sys.isMobile) {
                    if (cc.sys.os == cc.sys.OS_IOS) {
                        jsb.reflection.callStaticMethod('NativeGengine', 'Trace:', msg);
                    } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                        jsb.reflection.callStaticMethod('io/kaleidochain/NativeGengine', 'Trace', '(Ljava/lang/String;)V', msg);
                    } 
                } else {
                    if (cc.sys.os == cc.sys.OS_WINDOWS||cc.sys.os === cc.sys.OS_OSX) {
                        LogTrace(msg);
                    }
                }
            } else {
                console.log(msg);
            }
        },

        Debug:function(msg) {
            if (cc.sys.isNative) {
                if (cc.sys.isMobile) {
                    if (cc.sys.os == cc.sys.OS_IOS) {
                        jsb.reflection.callStaticMethod('NativeGengine', 'Debug:', msg);
                    } else if (cc.sys.os == cc.sys.OS_ANDROID) {
                        jsb.reflection.callStaticMethod('io/kaleidochain/NativeGengine', 'Debug', '(Ljava/lang/String;)V', msg);
                    } 
                } else {
                    if (cc.sys.os == cc.sys.OS_WINDOWS||cc.sys.os === cc.sys.OS_OSX) {
                        LogDebug(msg);
                    }
                }
            } else {
                console.log(msg);
            }
        },

        Info:function(msg) {
            if (cc.sys.isNative) {
                if (cc.sys.isMobile) {
                    if (cc.sys.os == cc.sys.OS_IOS) {
                        jsb.reflection.callStaticMethod('NativeGengine', 'Info:', msg);
                    } else if (cc.sys.os == cc.sys.OS_ANDROID) {
                        jsb.reflection.callStaticMethod('io/kaleidochain/NativeGengine', 'Info', '(Ljava/lang/String;)V', msg);
                    }
                } else {
                    if (cc.sys.os == cc.sys.OS_WINDOWS||cc.sys.os === cc.sys.OS_OSX) {
                        LogInfo(msg);
                    }
                }
            } else {
                console.log(msg);
            }
        },

        Warn:function(msg) {
            if (cc.sys.isNative) {
                if (cc.sys.isMobile) {
                    if (cc.sys.os == cc.sys.OS_IOS) {
                        jsb.reflection.callStaticMethod('NativeGengine', 'Warn:', msg);
                    } else if (cc.sys.os == cc.sys.OS_ANDROID) {
                        jsb.reflection.callStaticMethod('io/kaleidochain/NativeGengine', 'Warn', '(Ljava/lang/String;)V', msg);
                    } 
                } else {
                    if (cc.sys.os == cc.sys.OS_WINDOWS||cc.sys.os === cc.sys.OS_OSX) {
                        LogWarn(msg);
                    }
                }
            } else {
                console.log(msg);
            }
        },

        Error:function(msg) {
            if (cc.sys.isNative) {
                if (cc.sys.isMobile) {
                    if (cc.sys.os == cc.sys.OS_IOS) {
                        jsb.reflection.callStaticMethod('NativeGengine', 'Error:', msg);
                    } else if (cc.sys.os == cc.sys.OS_ANDROID) {
                        jsb.reflection.callStaticMethod('io/kaleidochain/NativeGengine', 'Error', '(Ljava/lang/String;)V', msg);
                    }
                } else {
                    if (cc.sys.os == cc.sys.OS_WINDOWS||cc.sys.os === cc.sys.OS_OSX) {
                        LogError(msg);
                    }
                }
            } else {
                console.log(msg);
            }
        },
    },
});