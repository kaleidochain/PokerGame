/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

#include "main.h"
#include "AppDelegate.h"

#include <atlstr.h>

USING_NS_CC;

// uncomment below line, open debug console
#define USE_WIN32_CONSOLE

int APIENTRY _tWinMain(HINSTANCE hInstance,
                       HINSTANCE hPrevInstance,
                       LPTSTR    lpCmdLine,
                       int       nCmdShow)
{
    UNREFERENCED_PARAMETER(hPrevInstance);
    UNREFERENCED_PARAMETER(lpCmdLine);

#ifdef USE_WIN32_CONSOLE
    AllocConsole();
    freopen("CONIN$", "r", stdin);
    freopen("CONOUT$", "w", stdout);
    freopen("CONOUT$", "w", stderr);
#endif

	TCHAR szFileName[MAX_PATH + 1] = { 0 };
	GetModuleFileName(NULL, szFileName, MAX_PATH + 1);
	CString strFilename = PathFindFileName(szFileName);
	//CString strName = lpCmdLine;
	strFilename.Append(L"pmutex_{06C04CC5-2F8C-47C8-BCFE-9D9E68A65E8E}");
	HANDLE hMutex = CreateMutex(NULL, false, (LPCTSTR)strFilename);
	if (GetLastError() == ERROR_ALREADY_EXISTS)
	{
		CloseHandle(hMutex);

		//cout << "create mutex error " << GetLastError() << endl;
		return 0;
	}

    // create the application instance
    AppDelegate app(375, 667);
    app.start();

#ifdef USE_WIN32_CONSOLE
    FreeConsole();
#endif

    return 0;
}
