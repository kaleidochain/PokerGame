//
//  NativeGengine.m
//  KaleidoDoudizhuDemo-mobile
//
//  Created by on 2019/1/24.
//
#import "NativeGengine.h"
#import "cocos2d.h"
#include "cocos/scripting/js-bindings/jswrapper/SeApi.h"
#include "platform/CCApplication.h"
#include "base/CCScheduler.h"

using namespace cocos2d;

@interface NativeGengine ()

@property(nonatomic, strong)GengineNode *g_node;
@property(nonatomic, strong)GengineGengineClient *g_client;
@end

@implementation NativeGengine

+(instancetype)shareInstance {

    static NativeGengine* instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[self alloc]init];
    });
    return instance;

}

typedef int (*callbackFunc) (char *);

+(void)clearCacheWithExcludeDirs:(NSString *) dirs andFiles:(NSString *) files {
    NSError *error = nil;
    GengineClearCache(dirs, files, &error);
}

+(BOOL)callNativeUIWithTitle:(NSString *) title andContent:(NSString *)content{
    UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:title message:content delegate:self cancelButtonTitle:@"Cancel" otherButtonTitles:@"OK", nil];
    [alertView show];
    return true;
}

+(NSString*)createAccount:(NSString *)passphase{
    NSError *error = nil;
    GengineKeyStore *keystore = GengineNewKeyStore(GengineStandardScryptN, GengineStandardScryptP, &error);
    GengineMnemonicInfo *info = [keystore createAccount:passphase wordlistidx:GengineEnglish error:&error];
    NSDictionary * dict = [NSDictionary dictionaryWithObjectsAndKeys:[info pubKey],@"pubKey",[info mnemonic],@"mnemonic",nil];
    NSData *data = [NSJSONSerialization dataWithJSONObject:dict options:0 error:&error];
    NSString *string = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
    return string;
}

+(BOOL)deleteAccount:(NSString *) accountAddr withPassword:(NSString *) password {
    NSError *error = nil;
    GengineKeyStore *keystore = GengineNewKeyStore(GengineStandardScryptN, GengineStandardScryptP, &error);
    GengineAddress *addr = GengineNewAddressFromHex(accountAddr, &error);
    if (![keystore hasAddress:addr]) {
        return false;
    }
    GengineAccounts *accounts = [keystore getAccounts];
    int i;
    int count;
    for (i = 0, count = (int)[accounts size]; i < count; i = i + 1) {
        GengineAccount *account = [accounts get:i error:&error];
        GengineAddress *addr = [account getAddress];
        NSString *addrHex = [[addr getHex] lowercaseString];
        if ([[accountAddr lowercaseString] isEqualToString:addrHex]) {
            return [keystore deleteAccount:account passphrase:password error:&error];
        }
    }
    return false;
}

+(BOOL)unlockAccount:(NSString *) accountAddr withPassword:(NSString *)password {
    NSError *error = nil;
    GengineKeyStore *keystore = GengineNewKeyStore(GengineStandardScryptN, GengineStandardScryptP, &error);
    GengineAddress *addr = GengineNewAddressFromHex(accountAddr, &error);
    if (![keystore hasAddress:addr]) {
        return false;
    }
    GengineAccounts *accounts = [keystore getAccounts];
    int i;
    int count;
    for (i = 0, count = (int)[accounts size]; i < count; i = i + 1) {
        GengineAccount *account = [accounts get:i error:&error];
        GengineAddress *addr = [account getAddress];
        NSString *addrHex = [[addr getHex] lowercaseString];
        if ([[accountAddr lowercaseString] isEqualToString:addrHex]) {
            return [keystore unlock:account passphrase:password error:&error];
        }
    }
    return false;
}

+(NSString*)importAccount:(NSString *)mnemonic withPassword:(NSString *)password AndLanguage:(NSString *)language {
    NSError *error = nil;
    GengineKeyStore *keystore = GengineNewKeyStore(GengineStandardScryptN, GengineStandardScryptP, &error);
    NSString *pubkey = nil;
    if ([language isEqualToString:@"English"]) {
        pubkey = [keystore importAccount:mnemonic passphrase:password wordlistidx:GengineEnglish error:&error];
    } else if ([language isEqualToString:@"French"]) {
        pubkey = [keystore importAccount:mnemonic passphrase:password wordlistidx:GengineFrench error:&error];
    } else if ([language isEqualToString:@"Italian"]) {
        pubkey = [keystore importAccount:mnemonic passphrase:password wordlistidx:GengineItalian error:&error];
    } else if ([language isEqualToString:@"Japanese"]) {
        pubkey = [keystore importAccount:mnemonic passphrase:password wordlistidx:GengineJapanese error:&error];
    } else if ([language isEqualToString:@"Korean"]) {
        pubkey = [keystore importAccount:mnemonic passphrase:password wordlistidx:GengineKorean error:&error];
    } else if ([language isEqualToString:@"Spanish"]) {
        pubkey = [keystore importAccount:mnemonic passphrase:password wordlistidx:GengineSpanish error:&error];
    } else if ([language isEqualToString:@"ChineseSimplified"]) {
        pubkey = [keystore importAccount:mnemonic passphrase:password wordlistidx:GengineChineseSimplified error:&error];
    } else if ([language isEqualToString:@"ChineseTraditional"]) {
        pubkey = [keystore importAccount:mnemonic passphrase:password wordlistidx:GengineChineseTraditional error:&error];
    } else {
        pubkey = [keystore importAccount:mnemonic passphrase:password wordlistidx:GengineEnglish error:&error];
    }
    NSLog(@"importAccount return pubkey: %@, err: %@", pubkey, error);
    return pubkey;
}

+(NSString*)getAccounts {
    NSError *error = nil;
    GengineKeyStore *keystore = GengineNewKeyStore(GengineStandardScryptN, GengineStandardScryptP, &error);
    GengineAccounts *accounts = [keystore getAccounts];
    int i;
    int count;
    NSMutableArray *arr = [NSMutableArray array];
    for (i = 0, count = (int)[accounts size]; i < count; i = i + 1) {
        GengineAccount *account = [accounts get:i error:&error];
        GengineAddress *addr = [account getAddress];
        NSString *addrHex = [addr getHex];
        if ([keystore hasAddress:addr]) {
            [arr addObject:addrHex];
        }
    }
    NSData *data = [NSJSONSerialization dataWithJSONObject:arr options:0 error:&error];
    NSString *string = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
    return string;
}

+(BOOL)startGameEngineWithAccount:(NSString *) account andPassword:(NSString *) password {
    NSError *error = nil;
    //GengineSetVerbosity(5);
    GengineNodeConfig *config = GengineNewNodeConfig();
    GengineEngineConfig *engineconfig = GengineNewEngineConfig();
    [engineconfig setUseAccountAddr:account];
    [engineconfig setUseAccountPassword:password];
    [NativeGengine shareInstance].g_node = GengineNewNode(config, engineconfig, &error);
    BOOL ret = [[NativeGengine shareInstance].g_node start:&error];
    NSLog(@"start return %i, %@, error: %d, %@", ret, [NativeGengine shareInstance].g_node, (int)error.code, error.description);
    [NativeGengine shareInstance].g_client = [[NativeGengine shareInstance].g_node getGengineClient:&error];
//    ret = [g_node stop:&error];
//    NSLog(@"stop return %i, error: %d", ret, (int)error.code);
    return ret;
}

+(BOOL)stopGameEngine {
    BOOL ret = NO;
    NSError *error = nil;
    if ([NativeGengine shareInstance].g_node != nil) {
//        NSLog(@"g_node: %@", g_node);
        ret = [[NativeGengine shareInstance].g_node stop:&error];
        NSLog(@"stop return %i, %@, error: %d", ret, [NativeGengine shareInstance].g_node, (int)error.code);
        [NativeGengine shareInstance].g_node = nil;
    }
    return ret;
}

+(BOOL)isRunning {
    return [NativeGengine shareInstance].g_node != nil;
}

+(void)openURL:(NSString *) url {
    if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 10.0) {
        //设备系统为IOS 10.0或者以上的
        [[UIApplication sharedApplication] openURL:[NSURL URLWithString:url] options:@{} completionHandler:nil];
    } else {
        //设备系统为IOS 10.0以下的
        [[UIApplication sharedApplication] openURL:[NSURL URLWithString:url]];
    }
}

+(void)copyToClipboard:(NSString *) addr {
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    pasteboard.string = addr;
}

+(int)getBatteryPercentage {
    [UIDevice currentDevice].batteryMonitoringEnabled = YES;
    double deviceLevel = [UIDevice currentDevice].batteryLevel;
    return deviceLevel * 100;
}

+(void)keepScreenOn:(bool) on {
    [UIApplication sharedApplication].idleTimerDisabled = on;
}

+(void)Trace:(NSString *) msg {
    GengineTrace(msg);
}

+(void)Debug:(NSString *) msg {
    GengineDebug(msg);
}

+(void)Info:(NSString *) msg {
    GengineInfo(msg);
}

+(void)Warn:(NSString *) msg {
    GengineWarn(msg);
}

+(void)Error:(NSString *) msg {
    GengineError(msg);
}

+(void)Share:(NSString *) text {
    //NSString *shareTitle = @"Play Block Poker with me！The world's first blockchain Texas Holdem, the safest and fairest cash poker platform with permanent operation and assets.\nMy Invitation Code:";
    //shareTitle = [shareTitle stringByAppendingString:invitationCode];
    //UIImage *shareImage = [UIImage imageNamed:@"me"];
    //NSURL *shareUrl = [NSURL URLWithString:@"https://www.jianshu.com/u/acdcce712303"];
    NSArray *activityItems = @[text]; // 必须要提供url 才会显示分享标签否则只显示图片
    UIActivityViewController *activityVC = [[UIActivityViewController alloc] initWithActivityItems:activityItems applicationActivities:nil];
    activityVC.excludedActivityTypes = [self excludetypes];
    activityVC.completionWithItemsHandler = ^(UIActivityType  _Nullable activityType, BOOL completed, NSArray * _Nullable returnedItems, NSError * _Nullable activityError) {
        NSLog(@"activityType: %@,\ncompleted: %d,\nreturnedItems:%@,\nactivityError:%@",activityType,completed,returnedItems,activityError);
    };
    
    [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:activityVC animated:YES completion:nil];
}

+(NSArray *)excludetypes {
    NSMutableArray *excludeTypesM =  [NSMutableArray arrayWithArray:@[//UIActivityTypePostToFacebook,
                                                                      //UIActivityTypePostToTwitter,
                                                                      UIActivityTypePostToWeibo,
                                                                      UIActivityTypeMessage,
                                                                      UIActivityTypeMail,
                                                                      UIActivityTypePrint,
                                                                      UIActivityTypeCopyToPasteboard,
                                                                      UIActivityTypeAssignToContact,
                                                                      UIActivityTypeSaveToCameraRoll,
                                                                      UIActivityTypeAddToReadingList,
                                                                      UIActivityTypePostToFlickr,
                                                                      UIActivityTypePostToVimeo,
                                                                      UIActivityTypePostToTencentWeibo,
                                                                      UIActivityTypeAirDrop,
                                                                      UIActivityTypeOpenInIBooks]];
    if ([[UIDevice currentDevice].systemVersion floatValue] >= 11.0) {
        [excludeTypesM addObject:UIActivityTypeMarkupAsPDF];
    }
    return excludeTypesM;
}

+(void)GameCall:(NSString *) jsonrpc andCallBack:(NSString *) callbackfunc {
    NSData *data = [[NativeGengine shareInstance].g_client gameCall:jsonrpc];
    NSString *string = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
    NSString *result0 = [string stringByReplacingOccurrencesOfString:@"\\" withString:@"\\\\"];
    NSString *result = [result0 stringByReplacingOccurrencesOfString:@"'" withString:@"\\'"];   //lua崩溃有单引号
    //NSLog(@"jsonRpc = %@, ret = %@, result = %@", jsonrpc, string, result);
    se::Value *ret = new se::Value();
    std::string jsCallStr = cocos2d::StringUtils::format("%s('%s');", [callbackfunc UTF8String], [result UTF8String]);
    //NSLog(@"jsCallStr %s", jsCallStr.c_str());
    se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str(), -1, ret);
    //se::ScriptEngine::getInstance()->evalString([callbackfunc UTF8String], -1, ret);
    //NSLog(@"jsCallStr rtn = %s", ret->toString().c_str());
}

+(void)AsyncGameCall:(NSString *) jsonrpc andCallBack:(NSString *) callbackfunc {
/*
    std::string strRet = "haha";
    std::string jsCallStr = cocos2d::StringUtils::format("TestMethod(\"%s\");", strRet.c_str());
    se::Value *ret = new se::Value();
    se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str(), -1, ret);
    NSLog(@"jsCallStr rtn = %s", ret->toString().c_str());
 */
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSData *data = [NSData data];
        data = [[NativeGengine shareInstance].g_client gameCall:jsonrpc];
        dispatch_async(dispatch_get_main_queue(), ^{
            NSString *string = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
            NSString *result0 = [string stringByReplacingOccurrencesOfString:@"\\" withString:@"\\\\"];
            NSString *result = [result0 stringByReplacingOccurrencesOfString:@"'" withString:@"\\'"];   //lua崩溃有单引号
            //NSLog(@"jsonRpc = %@, ret = %@, result = %@", jsonrpc, string, result);
            se::Value *ret = new se::Value();
            std::string jsCallStr = cocos2d::StringUtils::format("%s('%s');", [callbackfunc UTF8String], [result UTF8String]);
            NSLog(@"jsCallStr %s", jsCallStr.c_str());
            se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str(), -1, ret);
            //se::ScriptEngine::getInstance()->evalString([callbackfunc UTF8String], -1, ret);
            //NSLog(@"jsCallStr rtn = %s", ret->toString().c_str());
        });
    });
}

int onMessageCallback(char* jsonrpc) {
    Application::getInstance()->getScheduler()->performFunctionInCocosThread([=] (){
        se::Value *ret = new se::Value();
        std::string jsCallStr = cocos2d::StringUtils::format("cc.dgame.net.onMessage('%s');", jsonrpc);
        NSLog(@"jsCallStr %s", jsCallStr.c_str());
        se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str(), -1, ret);
    });
    return 0;
}

+(void)GameSubscribe:(NSString*) jsonrpc andCallBack:(NSString *) callbackfunc {
    callbackFunc f = onMessageCallback;
    long long lf = (long long)(f);
    NSData *data = [[NativeGengine shareInstance].g_client gameSubscribe:jsonrpc f:lf];
    NSString *string = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
    NSString *result0 = [string stringByReplacingOccurrencesOfString:@"\\" withString:@"\\\\"];
    NSString *result = [result0 stringByReplacingOccurrencesOfString:@"'" withString:@"\\'"];   //lua崩溃有单引号
    //NSLog(@"jsonRpc = %@, ret = %@, result = %@", jsonrpc, string, result);
    se::Value *ret = new se::Value();
    std::string jsCallStr = cocos2d::StringUtils::format("%s('%s');", [callbackfunc UTF8String], [result UTF8String]);
    //NSLog(@"jsCallStr %s", jsCallStr.c_str());
    se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str(), -1, ret);
    //NSLog(@"%lld", GengineOcTest(lf));
}

@end

//void EvalJavaScriptString(char* jscode) {
//    se::Value *ret = new se::Value();
//    std::string jsCallStr = "cc.dgame.net.onMessage(" + std::string(jscode) + ")";
//    NSLog(@"jsCallStr %s", jsCallStr.c_str());
//    se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str(), -1, ret);
//}
