"use strict";
cc._RF.push(module, '72c61O8dRxOcbBqEGmm3Kh0', 'ClipboardHelper');
// scripts/components/ClipboardHelper.js

"use strict";

cc.Class({
  "extends": cc.Component,
  properties: {},
  // LIFE-CYCLE CALLBACKS:
  copyToClipboard: function (_copyToClipboard) {
    function copyToClipboard(_x) {
      return _copyToClipboard.apply(this, arguments);
    }

    copyToClipboard.toString = function () {
      return _copyToClipboard.toString();
    };

    return copyToClipboard;
  }(function (content) {
    if (cc.sys.isNative) {
      if (cc.sys.isMobile) {
        if (cc.sys.os === cc.sys.OS_IOS) {
          jsb.reflection.callStaticMethod('NativeGengine', 'copyToClipboard:', content);
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
          jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity', 'copyToClipboard', '(Ljava/lang/String;)V', content);
        }
      } else if (cc.sys.os === cc.sys.OS_WINDOWS || cc.sys.os === cc.sys.OS_OSX) {
        copyToClipboard(content);
      }
    }
  }),
  // onLoad () {},
  start: function start() {} // update (dt) {},

});

cc._RF.pop();