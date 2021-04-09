package io.kaleidochain;

import android.util.Log;

import org.cocos2dx.lib.Cocos2dxHelper;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

import io.kaleidochain.gengine.JavaCallback;

public class GoCallback implements JavaCallback {
    private final static String TAG = "GoCallback";
    public void onEvent(String jsonrpc) {
        try {
            final String jscallStr = "cc.dgame.net.onMessage('" + jsonrpc + "')";
            Log.d(TAG, "jscallStr = " + jscallStr);
            Cocos2dxHelper.runOnGLThread(new Runnable(){
                @Override
                public void run() {
                    Cocos2dxJavascriptJavaBridge.evalString(jscallStr);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
