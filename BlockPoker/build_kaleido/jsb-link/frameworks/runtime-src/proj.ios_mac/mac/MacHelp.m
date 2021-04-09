//
//  MacHelp.m
//  BlockPoker-desktop
//
//  Created by zw zhang on 2020/5/28.
//

#import "MacHelp.h"
#import <CommonCrypto/CommonDigest.h>


@implementation OCManager

+ (NSString*)fileMD5:(NSString*)path {
    NSFileHandle *handle = [NSFileHandle fileHandleForReadingAtPath:path];
    if( handle== nil ) return @"ERROR GETTING FILE MD5"; // file didnt exist

    CC_MD5_CTX md5;
    CC_MD5_Init(&md5);

    BOOL done = NO;
    while(!done) {
        NSData* fileData = [handle readDataOfLength: 4096 ];
        CC_MD5_Update(&md5, [fileData bytes], (CC_LONG)[fileData length]);
        if( [fileData length] == 0 ) done = YES;
    }
    unsigned char digest[CC_MD5_DIGEST_LENGTH];
    CC_MD5_Final(digest, &md5);
    NSString* s = [NSString stringWithFormat: @"%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x",
                   digest[0], digest[1],
                   digest[2], digest[3],
                   digest[4], digest[5],
                   digest[6], digest[7],
                   digest[8], digest[9],
                   digest[10], digest[11],
                   digest[12], digest[13],
                   digest[14], digest[15]];
    return s;
}

+ (NSString*)getAppName
{
    NSBundle *bundle = [NSBundle bundleForClass:[self class]];
    
    NSString *appName = [bundle objectForInfoDictionaryKey:@"CFBundleDisplayName"];
    
    if (!appName) {
        
        appName = [bundle objectForInfoDictionaryKey:@"CFBundleName"];
    }
    
    return appName;
}

+(NSString *) get_current_app_path
 
{
 
    NSString* path = @"";
 
    NSString* str_app_full_file_name = [[NSBundle mainBundle] bundlePath];
 
    NSRange range = [str_app_full_file_name rangeOfString:@"/" options:NSBackwardsSearch];
 
    if (range.location != NSNotFound)
    {
 
        path = [str_app_full_file_name substringToIndex:range.location];
 
        path = [path stringByAppendingFormat:@"%@",@"/"];
 
    }
 
    return path;
 
}

+ (NSString *)getDataPath{
    
   
 //   NSFileManager *fileManager = [NSFileManager defaultManager];
//    NSURL *applicationSupport = [fileManager URLForDirectory:NSApplicationSupportDirectory inDomain:NSUserDomainMask appropriateForURL:nil create:false error:&error];
//    NSString *identifier = [[NSBundle mainBundle] bundleIdentifier];
//    NSURL *folder = [applicationSupport URLByAppendingPathComponent:identifier];
//    //[fileManager createDirectoryAtURL:folder withIntermediateDirectories:true attributes:nil error:&error];
//    //NSURL *fileURL = [folder URLByAppendingPathComponent:@"TSPlogfile.txt"];
//     NSLog(@"folder:%@",folder);
    
//    NSString *docDir = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) firstObject];
//
//    NSString *folder = [OCManager get_current_app_path];
//    NSLog(@"folder:%@",folder);
//
    NSString* str_app_full_file_name = [[NSBundle mainBundle] bundlePath];
    NSLog(@"str_app_full_file_name:%@",str_app_full_file_name);

    NSString *appname = self.getAppName;
    NSLog(@"appname:%@",appname);
    
    NSString *dataDir = str_app_full_file_name;
    
    dataDir = [dataDir stringByAppendingString:@"/."];
    dataDir = [dataDir stringByAppendingString:appname];
    
    BOOL isDir = FALSE;
    NSFileManager *fileManager = [NSFileManager defaultManager];
    
    BOOL isDirExist = [fileManager fileExistsAtPath:dataDir isDirectory:&isDir];
    
    if(!(isDirExist && isDir))
    {
        BOOL bCreateDir = [fileManager createDirectoryAtPath:dataDir
                                 withIntermediateDirectories:YES
                                                  attributes:nil
                                                       error:nil];
        
        if(!bCreateDir){
            NSLog(@"Create data Directory Failed.");
        }
    }
    
    NSError *error = nil;
    NSString *portalBundlePath = [[NSBundle mainBundle] pathForResource:@"portal" ofType:@"lua"];
    BOOL bExist = [[NSFileManager defaultManager] fileExistsAtPath:portalBundlePath];
    NSLog(@"portalBundlePath: %@, exists: %i", portalBundlePath, bExist);
    NSString *portalPath = dataDir;
    portalPath = [portalPath stringByAppendingString:@"/portal.lua"];
    if (![[NSFileManager defaultManager] fileExistsAtPath:portalPath]) {
        BOOL retVal = [[NSFileManager defaultManager] copyItemAtPath:portalBundlePath toPath:portalPath error:&error];
        NSLog(@"copy return %i, error: %@", retVal, error);
    } else {
           NSString *srcMD5 = [OCManager fileMD5:portalBundlePath];
           NSString *dstMD5 = [OCManager fileMD5:portalPath];
           NSLog(@"MD5: %@, portalBundlePath: %@", srcMD5, portalBundlePath);
           NSLog(@"MD5: %@, portalPath: %@", dstMD5, portalPath);
           if (![srcMD5 isEqualToString:dstMD5]) {
               BOOL retVal = [[NSFileManager defaultManager] removeItemAtPath:portalPath error:&error];
               NSLog(@"delete return %i, error: %@", retVal, error);
               retVal = [[NSFileManager defaultManager] copyItemAtPath:portalBundlePath toPath:portalPath error:&error];
               NSLog(@"copy return %i, error: %@", retVal, error);
           }
       }
    
    return dataDir;
    
}

+(void)openURL:(NSString *) url {
    [[NSWorkspace sharedWorkspace] openURL:[NSURL URLWithString:url]];
}

+(void)copyToClipboard:(NSString *) addr {
    //NSPasteboard *pasteboard = [NSPasteboard generalPasteboard];
    //pasteboard.string = addr;
    [[NSPasteboard generalPasteboard] clearContents];
    [[NSPasteboard generalPasteboard] setString:addr forType:NSStringPboardType];
}


@end

