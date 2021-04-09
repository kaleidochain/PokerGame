package io.kaleidochain;

import android.util.Log;

import io.kaleidochain.gengine.Account;
import io.kaleidochain.gengine.Accounts;
import io.kaleidochain.gengine.Address;
import io.kaleidochain.gengine.EngineConfig;
import io.kaleidochain.gengine.Gengine;
import io.kaleidochain.gengine.GengineClient;
import io.kaleidochain.gengine.KeyStore;
import io.kaleidochain.gengine.MnemonicInfo;
import io.kaleidochain.gengine.Node;
import io.kaleidochain.gengine.NodeConfig;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import org.cocos2dx.lib.Cocos2dxHelper;

public class NativeGengine {
    public static Node g_node;
    public static GengineClient g_client;
    public static GoCallback g_gocb;
    private final static String TAG = "NativeGengine";
    public static boolean setDataDirectory(final String dataDir) {
        try {
            Gengine.setDataDirectory(dataDir);
            Log.e(TAG, "setDataDirectory");
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }

    public static void clearCacheWithExcludeDirsAndFiles(final String excludeDirs, final String excludeFiles) {
        try {
            Gengine.clearCache(excludeDirs, excludeFiles);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static String createAccount(final String passphase) {
        try {
            KeyStore keystore = Gengine.newKeyStore(Gengine.LightScryptN, Gengine.LightScryptP);
            MnemonicInfo info = keystore.createAccount(passphase, Gengine.English);
            JSONObject result = new JSONObject();
            try {
                result.put("pubKey", info.getPubKey());
                result.put("mnemonic", info.getMnemonic());
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return result.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    public static boolean unlockAccountWithPassword(final String accountAddr, final String password) {
        try {
            KeyStore keystore = Gengine.newKeyStore(Gengine.LightScryptN, Gengine.LightScryptP);
            Address accountaddr = Gengine.newAddressFromHex(accountAddr);
            if (!keystore.hasAddress(accountaddr)) {
                return false;
            }
            Accounts accounts = keystore.getAccounts();
            int i = 0;
            long count = accounts.size();
            for (; i < count; i++) {
                Account account = accounts.get(i);
                Address addr = account.getAddress();
                String addrHex = addr.getHex().toLowerCase();
                if (accountAddr.toLowerCase().equals(addrHex)) {
                    keystore.unlock(account, password);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public static String importAccountWithPasswordAndLanguage(final String mnemonic, final String password, final String language) {
        try {
            KeyStore keystore = Gengine.newKeyStore(Gengine.LightScryptN, Gengine.LightScryptP);
            switch (language) {
                case "English":
                    return keystore.importAccount(mnemonic, password, Gengine.English);
                case "French":
                    return keystore.importAccount(mnemonic, password, Gengine.French);
                case "Italian":
                    return keystore.importAccount(mnemonic, password, Gengine.Italian);
                case "Japanese":
                    return keystore.importAccount(mnemonic, password, Gengine.Japanese);
                case "Korean":
                    return keystore.importAccount(mnemonic, password, Gengine.Korean);
                case "Spanish":
                    return keystore.importAccount(mnemonic, password, Gengine.Spanish);
                case "ChineseSimplified":
                    return keystore.importAccount(mnemonic, password, Gengine.ChineseSimplified);
                case "ChineseTraditional":
                    return keystore.importAccount(mnemonic, password, Gengine.ChineseTraditional);
                    default:
                        return keystore.importAccount(mnemonic, password, Gengine.English);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    public static String getAccounts() {
        try {
            KeyStore keystore = Gengine.newKeyStore(Gengine.LightScryptN, Gengine.LightScryptP);
            Accounts accounts = keystore.getAccounts();
            int i = 0;
            long count = accounts.size();
            JSONArray arr = new JSONArray();
            for (; i < count; i++) {
                Account account = accounts.get(i);
                Address addr = account.getAddress();
                String addrHex = addr.getHex();
                if (keystore.hasAddress(addr)) {
                    arr.put(addrHex);
                }
            }
            return arr.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    public static boolean startGameEngineWithAccountAndPassword(final String account, final String password) {
        try {
            NodeConfig config = Gengine.newNodeConfig();
            EngineConfig engineconfig = Gengine.newEngineConfig();
            engineconfig.setUseAccountAddr(account);
            engineconfig.setUseAccountPassword(password);
            g_node = Gengine.newNode(config, engineconfig);
            g_node.start();
            g_gocb = new GoCallback();
            g_client = g_node.getGengineClient();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }

    public static boolean stopGameEngine() {
        try {
            if (g_node != null) {
                g_node.stop();
                g_node = null;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }

    public static boolean isRunning() {
        return g_node != null;
    }

    public static void Trace(String msg) {
        try {
            Gengine.trace(msg);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void Debug(String msg) {
        try {
            Gengine.debug(msg);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void Info(String msg) {
        try {
            Gengine.info(msg);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void Warn(String msg) {
        try {
            Gengine.warn(msg);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void Error(String msg) {
        try {
            Gengine.error(msg);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void AsyncGameCallAndCallBack(final String jsonrpc, final String callback) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    byte[] resp = g_client.gameCall(jsonrpc);
                    String respStr = new String(resp);
                    respStr = respStr.replace("\\", "\\\\");
                    respStr = respStr.replace("'", "\\'");
                    final String jscallStr = callback + "('" + respStr + "');";
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
        }).start();
    }

    public static void GameCallAndCallBack(final String jsonrpc, final String callback) {
        try {
            byte[] resp = g_client.gameCall(jsonrpc);
            String respStr = new String(resp);
            respStr = respStr.replace("\\", "\\\\");
            respStr = respStr.replace("'", "\\'");
            final String jscallStr = callback + "('" + respStr + "');";
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

    public static void GameSubscribeAndCallBack(String jsonrpc, String callback) {
        try {
            byte[] resp = g_client.gameJavaSubscribe(jsonrpc, g_gocb);
            String respStr = new String(resp);
            respStr = respStr.replace("\\", "\\\\");
            respStr = respStr.replace("'", "\\'");
            final String jscallStr = callback + "('" + respStr + "');";
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
