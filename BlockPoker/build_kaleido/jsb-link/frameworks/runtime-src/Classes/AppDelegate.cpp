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

#include "AppDelegate.h"

#include "cocos2d.h"

#include "cocos/scripting/js-bindings/manual/jsb_module_register.hpp"
#include "cocos/scripting/js-bindings/manual/jsb_global.h"
#include "cocos/scripting/js-bindings/jswrapper/SeApi.h"
#include "cocos/scripting/js-bindings/event/EventDispatcher.h"
#include "cocos/scripting/js-bindings/manual/jsb_classtype.hpp"

#include "base/CCScheduler.h"
#include <thread>

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32 || CC_TARGET_PLATFORM == CC_PLATFORM_WINRT)

#include <shlwapi.h>
#include <shellapi.h>

#include <atlstr.h>
#include <atlconv.h>

#include "../proj.win32/windows_gengine.h"
#endif // _WIN32

#if CC_TARGET_PLATFORM == CC_PLATFORM_MAC
#include <boost/algorithm/string.hpp>

#include "../proj.ios_mac/mac/mac_gengine.h"
#include "../proj.ios_mac/mac/MacHelpHeader.h"
#include <mach-o/dyld.h>
#endif // _MAC

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_IOS) && PACKAGE_AS
#include "SDKManager.h"
#include "jsb_anysdk_protocols_auto.hpp"
#include "manualanysdkbindings.hpp"
using namespace anysdk::framework;
#endif

USING_NS_CC;

bool RunningFlag;

AppDelegate::AppDelegate(int width, int height) : Application("Block Poker", width, height)
{
}

AppDelegate::~AppDelegate()
{
}

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32 || CC_TARGET_PLATFORM == CC_PLATFORM_WINRT || CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
static bool LogTrace(se::State& s)
{
	const auto& args = s.args();
	int argc = (int)args.size();
	if (argc == 1)
	{
		std::string slog = args[0].toString();
		GoString goslog = { slog.c_str() , long(slog.length()) };
		LogTrace(goslog);
	}
	return true;
}
SE_BIND_FUNC(LogTrace)

static bool LogDebug(se::State& s)
{
	const auto& args = s.args();
	int argc = (int)args.size();
	if (argc == 1)
	{
		std::string slog = args[0].toString();
		GoString goslog = { slog.c_str() , long(slog.length()) };
		LogDebug(goslog);
	}
	return true;
}
SE_BIND_FUNC(LogDebug)

static bool LogInfo(se::State& s)
{
	const auto& args = s.args();
	int argc = (int)args.size();
	if (argc == 1)
	{
		std::string slog = args[0].toString();
		GoString goslog = { slog.c_str() , long(slog.length()) };
		LogInfo(goslog);
	}
	return true;
}
SE_BIND_FUNC(LogInfo)

static bool LogWarn(se::State& s)
{
	const auto& args = s.args();
	int argc = (int)args.size();
	if (argc == 1)
	{
		std::string slog = args[0].toString();
		GoString goslog = { slog.c_str() , long(slog.length()) };
		LogWarn(goslog);
	}
	return true;
}
SE_BIND_FUNC(LogWarn)

static bool LogError(se::State& s)
{
	const auto& args = s.args();
	int argc = (int)args.size();
	if (argc == 1)
	{
		std::string slog = args[0].toString();
		GoString goslog = { slog.c_str() , long(slog.length()) };
		LogError(goslog);
	}
	return true;
}
SE_BIND_FUNC(LogError)

void cppLogDebug(const std::string& s)
{
	GoString goslog = { s.c_str() , long(s.length()) };
	LogDebug(goslog);
}

static bool CreateAccount(se::State& s)
{
	const auto& args = s.args();
	int argc = (int)args.size();
	if (argc == 1)
	{
		std::string passphase = args[0].toString();

		GoString gosPassphase = { passphase.c_str(), long(passphase.length()) };
		//GoString json = CreateAccount(gosPassphase);
		char* json = CreateAccount(gosPassphase);
		cppLogDebug(json);
		std::string str(json);
		s.rval().setString(str);
		//free(json);//不能释放

		FreeString(json);
	}

	return true;
}
SE_BIND_FUNC(CreateAccount)

static bool UnlockAccountWithPassword(se::State& s)
{
	const auto& args = s.args();
	int argc = (int)args.size();
	if (argc == 2)
	{
		std::string addr = args[0].toString();
		std::string password = args[1].toString();

		GoString gosPassphase = { addr.c_str() , long(addr.length()) };
		GoString gosPassword = { password.c_str() , long(password.length()) };
		GoUint8 nRet = UnlockAccountWithPassword(gosPassphase, gosPassword);
		s.rval().setUint8(nRet);
	}

	return true;
}
SE_BIND_FUNC(UnlockAccountWithPassword)

static bool ImportAccountWithPasswordAndLanguage(se::State& s)
{
	const auto& args = s.args();
	int argc = (int)args.size();
	if (argc == 3)
	{
		std::string mnemonic = args[0].toString();
		std::string password = args[1].toString();
		std::string language = args[2].toString();

		GoString gosMnemonic = { mnemonic.c_str() , long(mnemonic.length()) };
		GoString gosPassword = { password.c_str() , long(password.length()) };
		GoString gosLanguage = { language.c_str() , long(language.length()) };
		char* json = ImportAccountWithPasswordAndLanguage(gosMnemonic, gosPassword, gosLanguage);
		std::string str(json);
		s.rval().setString(str);
		
		FreeString(json);
	}

	return true;
}
SE_BIND_FUNC(ImportAccountWithPasswordAndLanguage)

static bool GetAccounts(se::State& s)
{
	//log1.TraceDebug("GetAccounts");
	char* json = GetAccounts();
	std::string str(json);
	s.rval().setString(str);
// 	cppLogDebug("GetAccounts cpp 1");
	
	 //s.rval().setString("[]");
// 	cppLogDebug("GetAccounts cpp 2");
// 	free(json);
// 	cppLogDebug("GetAccounts cpp 3");

	FreeString(json);
	return true;
}
SE_BIND_FUNC(GetAccounts)

static bool StartNode(se::State& s)
{
	const auto& args = s.args();
	int argc = (int)args.size();
	if (argc == 2)
	{
		std::string strUser = args[0].toString();
		std::string strPwd = args[1].toString();
		GoString gos = { strUser.c_str(), long(strUser.length()) };
		GoString gopwd = { strPwd.c_str(), long(strPwd.length()) };
		GoUint8 nRet = StartNode(gos, gopwd);
		RunningFlag = (nRet != 0);
		s.rval().setBoolean(RunningFlag);
	}
	return true;
}
SE_BIND_FUNC(StartNode)


static bool StopNode(se::State& s)
{
	if (RunningFlag == true) {
		GoUint8 nRet = StopNode();
		s.rval().setBoolean(nRet != 0);
	}
	else {
		s.rval().setBoolean(false);
	}
	RunningFlag = false;
	return true;
}
SE_BIND_FUNC(StopNode)

void calljs(const char* callback, const char* message)
{
	cppLogDebug("calljs enter");

	cppLogDebug(message);

	se::ScriptEngine* se = se::ScriptEngine::getInstance();
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32 || CC_TARGET_PLATFORM == CC_PLATFORM_WINRT)
	CStringA strMessage = message;
	strMessage.Replace("'", "\\'");

    CStringA strScript = callback;
    strScript.Append("('");
	strScript.Append(strMessage);
	strScript.Append("');");

	//strScript.replace("\\", "\\\\");
	cppLogDebug((LPCSTR)strScript);
	strScript.Replace("\\", "\\\\");
	cppLogDebug((LPCSTR)strScript);
	se->evalString((LPCSTR)strScript);
#elif CC_TARGET_PLATFORM == CC_PLATFORM_MAC
	std::string strMessage = message;
	boost::algorithm::replace_all(strMessage, "'", "\\'");
    std::string strScript = callback;
    strScript.append("('");
	strScript.append(strMessage);
	strScript.append("');");
	cppLogDebug(strScript);
	boost::algorithm::replace_all(strScript, "\\", "\\\\");
	cppLogDebug(strScript);
	se->evalString(strScript.c_str());
#endif
}

void GameCallThread(const std::string& jsonRpc, const std::string& callBack)
{
    cppLogDebug(jsonRpc.c_str());
    cppLogDebug(callBack.c_str());
    GoString gos = { jsonRpc.c_str(), long(jsonRpc.length()) };
    char* json = GameCall(gos);
    cppLogDebug(json);
    //GameCall_return ret = GameCall(gos);
    std::string str(json);
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32 || CC_TARGET_PLATFORM == CC_PLATFORM_WINRT)	
	Application::_scheduler->performFunctionInCocosThread(
        [=]() {
        calljs(callBack.c_str(), str.c_str());
    });//
    //s.rval().setString(str);
#elif CC_TARGET_PLATFORM == CC_PLATFORM_MAC			
    Application::getInstance()->getScheduler()->performFunctionInCocosThread(
        [=]() {
        calljs(callBack.c_str(), str.c_str());
    });//
    //s.rval().setString(str);
#endif
    FreeString(json);
}

static bool AsyncGameCall(se::State& s)
{
    const auto& args = s.args();
    int argc = (int)args.size();
    if (argc == 2)
    {
        std::thread (GameCallThread, args[0].toString(), args[1].toString()).detach();
    }
    return true;
}
SE_BIND_FUNC(AsyncGameCall)

static bool GameCall(se::State& s)
{
	const auto& args = s.args();
	int argc = (int)args.size();
	if (argc == 1)
	{
		std::string strJson = args[0].toString();
		GoString gos = { strJson.c_str(), long(strJson.length()) };
		char* json = GameCall(gos);
		//GameCall_return ret = GameCall(gos);
		std::string str(json);
		s.rval().setString(str);

		FreeString(json);
	}
	return true;
}
SE_BIND_FUNC(GameCall)

static int onNotifyGame(char* message)
{
	cppLogDebug("onNotifyGame");
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32 || CC_TARGET_PLATFORM == CC_PLATFORM_WINRT)
	Application::_scheduler->performFunctionInCocosThread(
		[=]() {
		calljs("cc.dgame.net.onMessage", message);
	});//
#elif CC_TARGET_PLATFORM == CC_PLATFORM_MAC	
	Application::getInstance()->getScheduler()->performFunctionInCocosThread(
		[=]() {
		calljs("cc.dgame.net.onMessage", message);
	});//
#endif
	return 0;
}

static bool GameSubscribe(se::State& s)
{
	const auto& args = s.args();
	int argc = (int)args.size();
	if (argc == 1)
	{
		std::string strJson = args[0].toString();
		GoString gos = { strJson.c_str(), long(strJson.length()) };
		char* json = GameSubscribe(gos, (GoInt64)(onNotifyGame));
		std::string str(json);
		s.rval().setString(str);

		FreeString(json);
	}
	else {
		cppLogDebug("GameSubscribe argc error");
	}
	return true;
}
SE_BIND_FUNC(GameSubscribe)

static bool IsRunning(se::State& s)
{
	s.rval().setBoolean(RunningFlag);
	return true;
}
SE_BIND_FUNC(IsRunning)


static bool copyToClipboard(se::State& s)
{
	const auto& args = s.args();
	int argc = (int)args.size();
	if (argc == 1)
	{
		std::string strText = args[0].toString();

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32 || CC_TARGET_PLATFORM == CC_PLATFORM_WINRT)
		if (OpenClipboard(nullptr))
		{
			EmptyClipboard();
			HGLOBAL clipbuffer = GlobalAlloc(GMEM_DDESHARE, strText.length() + 1);
			char* buffer = (char*)GlobalLock(clipbuffer);//要用char，不能用wchar
			strcpy(buffer, strText.c_str());
			GlobalUnlock(clipbuffer);
			SetClipboardData(CF_TEXT, clipbuffer);
			CloseClipboard();
		}
		else {
			cppLogDebug("OpenClipboard fail");
		}
#elif CC_TARGET_PLATFORM == CC_PLATFORM_MAC
		copytoclipboard((char*)strText.c_str());
#endif
	}
	return true;
}
SE_BIND_FUNC(copyToClipboard)

static bool openURL(se::State& s)
{
	const auto& args = s.args();
	int argc = (int)args.size();
	if (argc == 1)
	{
		std::string strUrl = args[0].toString();
		cppLogDebug(strUrl);
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32 || CC_TARGET_PLATFORM == CC_PLATFORM_WINRT)
		ShellExecuteA(NULL, "open", strUrl.c_str(), NULL, NULL, SW_SHOW);
#elif CC_TARGET_PLATFORM == CC_PLATFORM_MAC
		openurl((char*)strUrl.c_str());
#endif
	}
	return true;
}
SE_BIND_FUNC(openURL)

#endif

bool AppDelegate::applicationDidFinishLaunching()
{
	se::ScriptEngine *se = se::ScriptEngine::getInstance();

	jsb_set_xxtea_key("6ceca469-fe10-45");
	jsb_init_file_operation_delegate();

#if defined(COCOS2D_DEBUG) && (COCOS2D_DEBUG > 0)
	// Enable debugger here
	jsb_enable_debugger("0.0.0.0", 6086, false);
#endif

	se->setExceptionCallback([](const char *location, const char *message, const char *stack) {
		// Send exception information to server like Tencent Bugly.
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32 || CC_TARGET_PLATFORM == CC_PLATFORM_WINRT || CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
		std::string str = location;
		std::string strMsg = message;
		std::string strStack = stack;
		GoString goslocatin = { str.c_str(), long(str.length()) };
		GoString gosmessage = { strMsg.c_str(), long(strMsg.length()) };
		GoString gosstack = { strStack.c_str(), long(strStack.length()) };
		LogError(goslocatin);
		LogError(gosmessage);
		LogError(gosstack);
#endif
	});

#if CC_TARGET_PLATFORM == CC_PLATFORM_MAC
	char* tmppath = (char*)getDocumentDir();
	char tmpPath[512] = {0};
	strcpy(tmpPath, tmppath);
	std::string strTmpPath = tmpPath;
	cocos2d::FileUtils::getInstance()->setWritablePath(strTmpPath);
#endif

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32 || CC_TARGET_PLATFORM == CC_PLATFORM_WINRT) 
    std::string strTmpPath = "";
	
#endif

	jsb_register_all_modules();

	se->start();

	se::AutoHandleScope hs;
	jsb_run_script("jsb-adapter/jsb-builtin.js");
	jsb_run_script("main.js");

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32 || CC_TARGET_PLATFORM == CC_PLATFORM_WINRT || CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
	std::string str = "*=5";
	GoString gos = { str.c_str(), long(str.length()) };
	
	//char path[512];
	//unsigned size = 512;
	//_NSGetExecutablePath(path, &size);
	//path[size] = '\0';
	//printf("The path is: %s\n", path);
	//printf("The tmppath is: %s\n", tmppath);

	GoString gosPath = { strTmpPath.c_str(), long(strTmpPath.length()) };
	Init(gos, gosPath);

	se::Object* globalObj = se::ScriptEngine::getInstance()->getGlobalObject(); // ����Ϊ����ʾ���㣬��ȡȫ�ֶ���
	if (globalObj == nullptr)
	{
		//runGengine();
	}
	else
	{
		globalObj->defineFunction("LogTrace", _SE(LogTrace));
		globalObj->defineFunction("LogDebug", _SE(LogDebug));
		globalObj->defineFunction("LogInfo", _SE(LogInfo));
		globalObj->defineFunction("LogWarn", _SE(LogWarn));
		globalObj->defineFunction("LogError", _SE(LogError));

		globalObj->defineFunction("CreateAccount", _SE(CreateAccount));
		globalObj->defineFunction("UnlockAccountWithPassword", _SE(UnlockAccountWithPassword));
		globalObj->defineFunction("ImportAccountWithPasswordAndLanguage", _SE(ImportAccountWithPasswordAndLanguage));
		globalObj->defineFunction("GetAccounts", _SE(GetAccounts));

		globalObj->defineFunction("GameCall", _SE(GameCall));
		globalObj->defineFunction("AsyncGameCall", _SE(AsyncGameCall));
		globalObj->defineFunction("StartNode", _SE(StartNode));
		globalObj->defineFunction("StopNode", _SE(StopNode));
		globalObj->defineFunction("GameSubscribe", _SE(GameSubscribe));
		globalObj->defineFunction("IsRunning", _SE(IsRunning));

		globalObj->defineFunction("copyToClipboard", _SE(copyToClipboard));
		globalObj->defineFunction("openURL", _SE(openURL));
	}

#endif
	se->addAfterCleanupHook([]() {
		JSBClassType::destroy();
	});

	return true;
}

// This function will be called when the app is inactive. When comes a phone call,it's be invoked too
void AppDelegate::onPause()
{
	EventDispatcher::dispatchOnPauseEvent();
}

// this function will be called when the app is active again
void AppDelegate::onResume()
{
	EventDispatcher::dispatchOnResumeEvent();
}
