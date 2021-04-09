"use strict";
cc._RF.push(module, 'd7a7bc7Q6FOaZqihhVnW3Xp', 'Log');
// scripts/modules/Log.js

"use strict";

var Log = cc.Class({
  "extends": cc.Component,
  statics: {
    Trace: function Trace(msg) {
      if (cc.sys.isNative) {
        if (cc.sys.isMobile) {
          if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod('NativeGengine', 'Trace:', msg);
          } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod('io/kaleidochain/NativeGengine', 'Trace', '(Ljava/lang/String;)V', msg);
          }
        } else {
          if (cc.sys.os == cc.sys.OS_WINDOWS || cc.sys.os === cc.sys.OS_OSX) {
            LogTrace(msg);
          }
        }
      } else {
        console.log(msg);
      }
    },
    Debug: function Debug(msg) {
      if (cc.sys.isNative) {
        if (cc.sys.isMobile) {
          if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod('NativeGengine', 'Debug:', msg);
          } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod('io/kaleidochain/NativeGengine', 'Debug', '(Ljava/lang/String;)V', msg);
          }
        } else {
          if (cc.sys.os == cc.sys.OS_WINDOWS || cc.sys.os === cc.sys.OS_OSX) {
            LogDebug(msg);
          }
        }
      } else {
        console.log(msg);
      }
    },
    Info: function Info(msg) {
      if (cc.sys.isNative) {
        if (cc.sys.isMobile) {
          if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod('NativeGengine', 'Info:', msg);
          } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod('io/kaleidochain/NativeGengine', 'Info', '(Ljava/lang/String;)V', msg);
          }
        } else {
          if (cc.sys.os == cc.sys.OS_WINDOWS || cc.sys.os === cc.sys.OS_OSX) {
            LogInfo(msg);
          }
        }
      } else {
        console.log(msg);
      }
    },
    Warn: function Warn(msg) {
      if (cc.sys.isNative) {
        if (cc.sys.isMobile) {
          if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod('NativeGengine', 'Warn:', msg);
          } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod('io/kaleidochain/NativeGengine', 'Warn', '(Ljava/lang/String;)V', msg);
          }
        } else {
          if (cc.sys.os == cc.sys.OS_WINDOWS || cc.sys.os === cc.sys.OS_OSX) {
            LogWarn(msg);
          }
        }
      } else {
        console.log(msg);
      }
    },
    Error: function Error(msg) {
      if (cc.sys.isNative) {
        if (cc.sys.isMobile) {
          if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod('NativeGengine', 'Error:', msg);
          } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod('io/kaleidochain/NativeGengine', 'Error', '(Ljava/lang/String;)V', msg);
          }
        } else {
          if (cc.sys.os == cc.sys.OS_WINDOWS || cc.sys.os === cc.sys.OS_OSX) {
            LogError(msg);
          }
        }
      } else {
        console.log(msg);
      }
    }
  }
});

cc._RF.pop();