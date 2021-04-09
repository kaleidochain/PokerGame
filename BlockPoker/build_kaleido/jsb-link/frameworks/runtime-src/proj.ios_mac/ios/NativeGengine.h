//
//  NativeGengine.h
//  KaleidoDoudizhuDemo-mobile
//
//  Created by 苏伟杰 on 2019/1/24.
//

#ifndef NativeGengine_h
#define NativeGengine_h

#import <Foundation/Foundation.h>
#import <Gengine/Gengine.h>
@interface NativeGengine : NSObject
+(void)clearCacheWithExcludeDirs:(NSString *) dirs andFiles:(NSString *) files;
+(BOOL)callNativeUIWithTitle:(NSString *) title andContent:(NSString *)content;
+(NSString*)createAccount:(NSString *)passphase;
+(NSString*)importAccount:(NSString *)mnemonic withPassword:(NSString *)password AndLanguage:(NSString *)language;
+(NSString*)getAccounts;
+(BOOL)startGameEngineWithAccount:(NSString *) account andPassword:(NSString *) password;
+(BOOL)stopGameEngine;
+(BOOL)isRunning;
+(void)openURL:(NSString *) url;
+(void)copyToClipboard:(NSString *) addr;
+(int)getBatteryPercentage;
+(void)keepScreenOn:(bool) on;
+(void)Trace:(NSString *) msg;
+(void)Debug:(NSString *) msg;
+(void)Info:(NSString *) msg;
+(void)Warn:(NSString *) msg;
+(void)Error:(NSString *) msg;
+(void)Share:(NSString *) text;

@end

#endif /* NativeGengine_h */
