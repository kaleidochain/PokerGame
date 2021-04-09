//
//  MacHelpHeader.m
//  BlockPoker-desktop
//
//  Created by zw zhang on 2020/5/28.
//

#import <Foundation/Foundation.h>
#import "MacHelp.h"
//#include "MacHelpHeader.h"



const char* getDocumentDir(){
    return [[OCManager getDataPath] UTF8String];
}

void openurl(char* url){
    [OCManager openURL:[NSString stringWithUTF8String:url]];
}

void copytoclipboard(char* addr){
    [OCManager copyToClipboard:[NSString stringWithUTF8String:addr]];
}
