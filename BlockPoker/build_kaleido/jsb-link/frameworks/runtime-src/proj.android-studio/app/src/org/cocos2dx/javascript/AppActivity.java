/****************************************************************************
Copyright (c) 2015-2016 Chukong Technologies Inc.
Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
 
http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package org.cocos2dx.javascript;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;

import android.app.AlertDialog;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Bundle;
import org.cocos2dx.javascript.SDKWrapper;
import io.kaleidochain.gengine.Gengine;

import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.Environment;
import android.util.Log;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.FileOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.math.BigInteger;
import java.security.MessageDigest;

import io.kaleidochain.BlockPoker.R;

public class AppActivity extends Cocos2dxActivity {

    private static AppActivity app = null;
    private static final String SEPARATOR = File.separator;//???????????????
    private static final String TAG = "AppActivity";
    /**
     * ?????????????????????MD5
     * @param filePath ????????????
     * @return ????????????MD5
     */
    public static String getFileMD5(String filePath) {
        File file = new File(filePath);
        if (!file.isFile()) {
            return null;
        }
        MessageDigest digest = null;
        FileInputStream in = null;
        byte buffer[] = new byte[1024];
        int len;
        try {
            digest = MessageDigest.getInstance("MD5");
            in = new FileInputStream(file);
            while ((len = in.read(buffer, 0, 1024)) != -1) {
                digest.update(buffer, 0, len);
            }
            in.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        BigInteger bigInt = new BigInteger(1, digest.digest());
        return bigInt.toString(16);
    }
    /**
     * ??????????????????MD5
     * @param inputStream ?????????
     * @return ?????????MD5
     */
    public static String getStreamMD5(InputStream inputStream) {
        MessageDigest digest = null;
        byte buffer[] = new byte[1024];
        int len;
        try {
            digest = MessageDigest.getInstance("MD5");
            while ((len = inputStream.read(buffer)) != -1) {
                digest.update(buffer, 0, len);
            }
            inputStream.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        BigInteger bigInt = new BigInteger(1, digest.digest());
        return bigInt.toString(16);
    }
    /**
     * ??????res/raw???????????????????????????????????????
     * @param context ?????????
     * @param id ??????ID
     * @param fileName ?????????
     * @param storagePath ????????????????????????
     */
    public static boolean isSameFile(Context context, int id, String fileName, String storagePath) {
        String filePath = storagePath + SEPARATOR + fileName;
        InputStream inputStream = context.getResources().openRawResource(id);
        File file = new File(filePath);
        String srcMD5 = getStreamMD5(inputStream);
        String dstMD5 = getFileMD5(filePath);
        Log.d(TAG, "srcMD5: " + srcMD5);
        Log.d(TAG, "dstMD5: " + dstMD5 + ", dstPath: " + filePath);
        return srcMD5.equals(dstMD5);
    }
    /**
     * ??????res/raw???????????????????????????
     * @param context ?????????
     * @param id ??????ID
     * @param fileName ?????????
     * @param storagePath ????????????????????????
     */
    public static void copyFilesFromRaw(Context context, int id, String fileName, String storagePath) {
        InputStream inputStream = context.getResources().openRawResource(id);
        File file = new File(storagePath);
        if (!file.exists()) {//???????????????????????????????????????????????????
            file.mkdirs();
        }
        readInputStream(storagePath + SEPARATOR + fileName, inputStream);
    }
    /**
     * ??????????????????????????????????????????
     *
     * @param storagePath ??????????????????
     * @param inputStream ?????????
     */
    public static void readInputStream(String storagePath, InputStream inputStream) {
        File file = new File(storagePath);
        try {
            if (file.exists()) {
                boolean b = file.delete();
                if (b) {
                    Log.d(TAG, "delete " + storagePath + " success");
                }
            }
            // 1.??????????????????
            FileOutputStream fos = new FileOutputStream(file);
            // 2.??????????????????
            byte[] buffer = new byte[inputStream.available()];
            // 3.???????????????
            int lenght = 0;
            while ((lenght = inputStream.read(buffer)) != -1) {// ????????????????????????buffer??????
                // ???Buffer??????????????????outputStream?????????
                fos.write(buffer, 0, lenght);
            }
            fos.flush();// ???????????????
            // 4.?????????
            fos.close();
            inputStream.close();
            Log.d(TAG, "copy res/raw/portal.lua to " + storagePath + " success");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    /**
     *
     * @param context ???????????????
     * @param dir  ????????????
     * @return
     */
    public static String getFilePath(Context context,String dir) {
        String directoryPath = "";
        //??????SD???????????????
        if (Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState()) ) {
            directoryPath = context.getExternalFilesDir(dir).getAbsolutePath() ;
            // directoryPath =context.getExternalCacheDir().getAbsolutePath() ;
        } else {
            //??????????????????????????????
            directoryPath = context.getFilesDir() + File.separator + dir;
            // directoryPath=context.getCacheDir()+File.separator+dir;
        }
        File file = new File(directoryPath);
        if (!file.exists()) {//??????????????????????????????
            file.mkdirs();
        }
        return directoryPath;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Workaround in https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
        if (!isTaskRoot()) {
            // Android launched another instance of the root activity into an existing task
            //  so just quietly finish and go away, dropping the user back into the activity
            //  at the top of the stack (ie: the last state of this task)
            // Don't need to finish it again since it's finished in super.onCreate .
            return;
        }
        // DO OTHER INITIALIZATION BELOW

        app = this;
        //Gengine.setVerbosity(5);
        try {
            String rootPath = this.getFilePath(this, "");
            Gengine.setDataDirectory(rootPath);
            Gengine.setVModule("*=5");
            if (!isSameFile(this, R.raw.portal, "portal.lua", rootPath)) {
                copyFilesFromRaw(this, R.raw.portal, "portal.lua", rootPath);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        SDKWrapper.getInstance().init(this);

    }
    
    @Override
    public Cocos2dxGLSurfaceView onCreateView() {
        Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
        // TestCpp should create stencil buffer
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);
        SDKWrapper.getInstance().setGLSurfaceView(glSurfaceView, this);

        return glSurfaceView;
    }

    @Override
    protected void onResume() {
        super.onResume();
        SDKWrapper.getInstance().onResume();

    }

    @Override
    protected void onPause() {
        super.onPause();
        SDKWrapper.getInstance().onPause();

    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        SDKWrapper.getInstance().onDestroy();

    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        SDKWrapper.getInstance().onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        SDKWrapper.getInstance().onNewIntent(intent);
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        SDKWrapper.getInstance().onRestart();
    }

    @Override
    protected void onStop() {
        super.onStop();
        SDKWrapper.getInstance().onStop();
    }
        
    @Override
    public void onBackPressed() {
        SDKWrapper.getInstance().onBackPressed();
        super.onBackPressed();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        SDKWrapper.getInstance().onConfigurationChanged(newConfig);
        super.onConfigurationChanged(newConfig);
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        SDKWrapper.getInstance().onRestoreInstanceState(savedInstanceState);
        super.onRestoreInstanceState(savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        SDKWrapper.getInstance().onSaveInstanceState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onStart() {
        SDKWrapper.getInstance().onStart();
        super.onStart();
    }

    public static void showAlertDialog(final String title,final String message) {

        // ????????????????????? runOnUiThread
        app.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AlertDialog alertDialog = new AlertDialog.Builder(app).create();
                alertDialog.setTitle(title);
                alertDialog.setMessage(message);
                alertDialog.show();
            }
        });
    }

    public static void openURL(String url) {
        Uri uri = Uri.parse(url);
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        app.startActivity(intent);
    }

    public static void copyToClipboard(String addr) {
        ClipboardManager myClipboard;
        myClipboard = (ClipboardManager)app.getSystemService(CLIPBOARD_SERVICE);
        ClipData myClip;
        myClip = ClipData.newPlainText("text", addr);
        myClipboard.setPrimaryClip(myClip);
    }

    /**
     *  ??????????????????
     */
    public static int getBatteryPercentage() {
        int level = 0;
        Intent batteryInfoIntent = app.getApplicationContext().registerReceiver(null,
                new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
        level = batteryInfoIntent.getIntExtra("level",0);
        int batterySum = batteryInfoIntent.getIntExtra("scale", 100);
        int percentBattery= 100 *  level / batterySum;
        Log.i(TAG,"level = " + level);
        Log.i(TAG,"batterySum = " + batterySum);
        Log.i(TAG,"percent is " +  percentBattery+ "%");
        return percentBattery;
    }

    public static void Share(final String title, final String msg) {
        Intent shareIntent = new Intent();
        shareIntent.setAction(Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_TEXT, msg);
//??????????????????Intent.createChooser????????????????????????????????????????????????????????????
        shareIntent = Intent.createChooser(shareIntent, title);
        app.getApplicationContext().startActivity(shareIntent);
    }
}
