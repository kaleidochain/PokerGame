//
//  MacHelpHeader.h
//  BlockPoker-desktop
//
//  Created by zw zhang on 2020/5/28.
//

#ifndef MacHelpHeader_h
#define MacHelpHeader_h
extern "C"{
const char* getDocumentDir();
void openurl(char* url);
void copytoclipboard(char* addr);
}
#endif /* MacHelpHeader_h */
