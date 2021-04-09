//
//  MacHelp.h
//  BlockPoker-desktop
//
//  Created by zw zhang on 2020/5/28.
//

//#ifndef MacHelp_h
//#define MacHelp_h

#import <Foundation/Foundation.h>

@interface OCManager : NSObject

+ (NSString *)getDataPath;
+ (void)openURL:(NSString *) url;
+ (void)copyToClipboard:(NSString *) addr ;
@end


//#endif /* MacHelp_h */
