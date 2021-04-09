**项目组成**

+  BlockPoker 为cocos 工程，请使用cocos creator 2.3.2 或以后版本，里面包含 iOS，Mac，android 和windows工程，可以使用ios和和andorid工程进行测试

  - android 可以参考https://docs.kaleidochain.io/dapp-developer/android-build/ 进行编译

  - ios 可以参考 https://docs.kaleidochain.io/dapp-developer/ios-build/ 进行编译

  - andorid使用的区块链库在BlockPoker/build_kaleido/jsb-link/frameworks/runtime-src/proj.android-studio/app/libs/gengine.aar

  - ios的区块链库 在 /Users/zwzhang/Desktop/code/PokerGame/BlockPoker/build_kaleido/jsb-link/frameworks/runtime-src/proj.ios_mac/Gengine.framework

  - 游戏启动的lua脚本/BlockPoker/build_kaleido/jsb-link/frameworks/runtime-src/proj.android-studio/res/raw/portal.lua

  - portal.lua 中local PortalAddr = "0xa3FaCDE54A3614b10D029762C47c194883902137"     为游戏进入合约地址，

    重新部署合约时需要使用freedezGame工程中dezGame合约部署得到的portal地址

+ freedezGame 为游戏合约truffle工程

  - 目前合约已经部署完成可以直接使用，新游戏需要参考这个框架写游戏合约和lua脚本

  - tokenContract 为游戏币的合约

  - dezGame 为游戏合约工程 包含三个字工程

    - dezGame 目录下面为游戏合约工程
    - dezlua 为游戏lua脚本合约工程
    - fclua 为fc 的lua脚本合约工程

  - 编译游戏合约均为在工程 truffle-config.js 所在目录 执行 `truffle migrate --network testnet` 即可

  - 目前testnet可以使用 

  - 部署合约

    - 脚本中统一使用  0x0557d37d996b123fc1799b17b417a6e5d6773038 进行部署 

    - 合约中 `Register: 0xD390BCA8Fc4BD4597F879cB2E75E784D6F97eD54

      fc: 0x85F0858A66D183f694baB4F1963Fa5a85D33cB43` 为固定的，

      register合约为方便游戏合约部署 对应关系的查询合约，可以直接使用

    - 部署顺序

      - token合约
      - game合约
      - 游戏lua合约
      - 游戏fc合约

    - 游戏合约均已支持数据和逻辑分开，只要main地址没有变，其他逻辑合约均可直接升级部署即可

*开发新游戏*

**原理**

- 该游戏框架为基于区块链的完全分布式游戏框架，不需要服务器，游戏控制逻辑在链合约和链上lua来控制

- 游戏框架使用基于以太坊的p2p通信框架

- kaleido区块链完全兼容以太坊，以太坊的合约框架等完全可以使用

- 整个游戏框架分为链上和客户端两部分

  - 部署在链上的又分为合约和lua脚本两部分

  - 合约为sol文件，负责链上状态维护和结算，lua负责游戏逻辑实现

  - lua脚本分为两块, 游戏lua脚本在客户端执行，fc lua脚本在fc端执行，fc为链的链下角色，负责根据fc lua脚本完成游戏逻辑和客户端直接消息的中转

  - 客户端采用cocos 框架，界面使用js实现，逻辑部分的lua是从链上下载下来加载到本地运行

  - 客户端的底层通信采用的是区块链的库封装实现的，这部分已经封装好了，windows，android，ios和mac都已经封装好了，各个平台可以分别调用即可，都在build_kaleido下面的对应工程中，如android，库在build_kaleido/jsb-link/frameworks/runtime-src/proj.android-studio/app/libs/gengine.aar，封装代码在build_kaleido/jsb-link/frameworks/runtime-src/proj.android-studio/app/src/io/kaleidochain 目录下，可以直接调用，接口比较简单

  - 客户端启动流程

    1. 先连接链的接入点，接入点在/BlockPoker/assets/scripts/Game/GameHall.js 中

    ``` 
    this.scheduleOnce(function () {            fn({"status":0,"message":"OK","enodeid":"enode://d1ff6cd02c6babb3f43e0134116794e03049374e8f43e2624762288440221dc060c0e728b39bec59af8bf0c7eccdfa3798dc9bcf6617affd2b6b191233fcda31@45.249.245.3:38884","rpc":"45.249.245.3:38548"});
    }, 1);
    ```

    中，目前是测试链的接入点，也可以自己建接入点，然后修改这里就可以

    2. 客户端加载本地portal.lua ,路径/BlockPoker/build_kaleido/jsb-link/frameworks/runtime-src/proj.android-studio/res/raw/portal.lua，portal.lua 中local PortalAddr = "0xa3FaCDE54A3614b10D029762C47c194883902137" 为链上合约地址，客户端通过portal.lua 和本地的区块链库进行交互拉取链上的lua脚本，然后执行游戏lua脚本
    3. 客户端通过步骤2 的lua游戏脚本通过本地的区块链库进行交互，完成游戏逻辑和链上合约逻辑
    4. 客户端的游戏逻辑一部分通过区块链库和fc进行交互，一部分直接上链操作
    5. 当客户端连接上fc时，fc会根据客户端的信息直接上链下载fc lua脚本并执行，完成和客户端的有次逻辑操作
    6. 整个游戏过程，客户端和fc侧的消息都有签名和验证，保证整个通信过程透明和公正

    

    ** LUA 接口**

    1. fc lua接口

       + 接口

         ```
         func (fc *FlowControl) Loader(L *lua.LState) int {
         	mod := L.SetFuncs(L.NewTable(), map[string]lua.LGFunction{
         		"GameAddress":       fc.luaGameAddress, // 获取游戏地址
         		"TableID":           fc.luaTableID,    //获取游戏桌子id
         		"SetCurrentHand":    fc.luaSetCurrentHand, //获取桌子局数
         		"SetCallback":       fc.luaSetCallback,   //设置回调函数
         		"SetPlayingSeats":   fc.luaSetPlayingSeats, //设置用户状态
         		"Send":              fc.luaSend,            // 发送消息
         		"SendBackupReq":     fc.luaSendBackupReq, //发送备份消息请求
         		"SendBackupKeyCard": fc.luaSendBackupKeyCard, //发送本分牌点
         		"PutStoreData":      fc.luaPutStoreData,  //存储本局消息
         		"GetStoreData":      fc.luaGetStoreData,  恢复本局消息
         	})
         
         	L.Push(mod)
         
         	return 1
         }
         ```

         

       + 回调函数

         ```
         type LCallBack struct {
         	cbInitialize               *lua.LFunction // Initialize(hasluadata bool) 调用DoFile后调用
         	cbUninitialize             *lua.LFunction // Uninitialize() 调用Close前调用
         	cbShuffleCardResult        *lua.LFunction // ShuffleCardResult(deskid DeskID,hand uint32, seat SeatID, success bool)
         	cbDecPartionDealCardResult *lua.LFunction // cbDecPartionDealCardResult(seat SeatID, seatto SeatID，index []uint,hand uint32,success bool) //seat 座位号 seatto index属于的座位号,index 牌游标
         	cbDealCardResult           *lua.LFunction // DealCardResult(seat SeatID, index []uint, card []Card,hand uint32) //seat 座位号 index 牌游标  example: [3, 5, 8] card  牌序号 example：[1, 2, 3]
         	cbHandleMsg                *lua.LFunction // HandleMsg(srcSeat SeatID, code MsgCodeType, data MsgData,hand uint32)
         	cbHandleAck                *lua.LFunction // HandleAck(msgcode, srcseat,hand uint32)
         	cbBackupDecyptCardResult   *lua.LFunction // cbBackupDecyptCardResult(backst SeatID, backtost SeatID,hand uint32，success bool)
         }
         
         ```

         

       + 例子

         + freedezGame/dezGame/fclua中为fc lua的例子
         + game.lua 为游戏逻辑代码
         + gameevent.lua 为回调处理函数，负责处理fc区块链库的回调函数处理
         + roomcontract.lua 为房间处理

    2. game客户端lua接口

       + 接口

         ```
         func (s *GameEngine) Loader(L *lua.LState) int {
         	mod := L.SetFuncs(L.NewTable(), map[string]lua.LGFunction{
         		"setCallback":        s.SetCallback,
         		"SelfAddr":           s.luaSelfAddr,
         		"Sit":                s.luaSit,
         		"Leave":              s.luaLeave,
         		"UpdateState":        s.luaUpdateState,
         		"SetNotaryDiscard":   s.luaSetNotaryDiscard,
         		"ShuffleCard":        s.luaShuffleCard,
         		"GameReset":          s.luaGameReset,
         		"DealCard":           s.luaDealCard,
         		"Send":               s.luaSend,
         		"DeskID":             s.luaDeskID,
         		"NotifyUI":           s.luaNotifyUI,
         		"NotifyRoom":         s.luaNotifyRoom,
         		"Recover":            s.luaRecover,
         		"ReConnectInter":     s.luaReConnectInter,
         		"Verify":             s.luaVerify,
         		"StateDir":           s.luaStateDir,
         		"Mkdir":              s.luaMkdir,
         		"DirExist":           s.luaDirExist,
         		"RemovePath":         s.luaRemovePath,
         		"FilePathJoint":      s.luaFilePathJoint,
         		"WriteFile":          s.luaWriteFile,
         		"ScriptVersion":      s.luaScriptVersion,
         		"ZlibUncompress":     s.luaZlibUnCompress,
         		"SetGameEnvironment": s.luaSetGameEnvironment,
         		"SetHand":            s.luaSetHand,
         		"HashData":           s.luaHashData,
         		"ExitGame":           s.luaExitGame,
         		"GetInterList":       s.luaGetInterList,
         	})
         
         	L.Push(mod)
         
         	luatype.RegisterType(L, &stateLock)
         
         	return 1
         }
         ```

         ```
         luaeth库接口
         var web3api = map[string]lua.LGFunction{
         	"setProvider":        setProvider,
         	"contract":           contract,
         	"SendTransaction":    EcSendTransaction,
         	"GetSeedByNumber":    EcGetSeedByNumber,
         	"BalanceAt":          EcBalanceAt,
         	"TransactionReceipt": EcGetTransactionReceipt,
         	"TransactionPayLoad": EcTransactionPayLoad,
         }
         
         ```

         

       + 回调

         ```
         type LCallBack struct {
         	cbShuffleCardResult *lua.LFunction // ShuffleCardResult(error)
         	cbDealCardResult    *lua.LFunction // DealCardResult(seat SeatID, index []uint, card []Card) //seat 座位号 index 牌游标  example: [3, 5, 8] card  牌序号 example：[1, 2, 3]
         	cbHandleMsg         *lua.LFunction // HandleMsg(srcSeat SeatID, code MsgCodeType, data MsgData)
         	cbHandleAck         *lua.LFunction // HandleAck(msgcode, srcseat, destseats, seqnum)
         	cbReSitDown         *lua.LFunction // ReSitDown(msgcode, srcseat, destseats, seqnum) 重新坐下，相当于重连上inter
         }
         
         ```

         ```
         
         ```

         

       + 例子

         + freedezGame/dezGame/dezlua 中为游戏代码
         + game.lua 为游戏逻辑代码
         + gameevent.lua 为回调处理函数，负责处理fc区块链库的回调函数处理r
         + oomcontract.lua 为房间处理

    3. js接口

       + js 通过区块链库封装代码于链和lua实体进行交互

       + android例子

         + build_kaleido/jsb-link/frameworks/runtime-src/proj.android-studio/app/src/io/kaleidochain 中NativeGengine.java 为调用接口，通过cocos的js可以直接调用

           ```
            public static String createAccount(final String passphase) 
            // 创建账号
            public static boolean unlockAccountWithPassword(final String accountAddr, final String password)
            //解锁账号
            public static String importAccountWithPasswordAndLanguage(final String mnemonic, final String password, final String language)
            //通过组记词恢复账号
             public static boolean startGameEngineWithAccountAndPassword()
             //start 区块链引擎
             public static boolean stopGameEngine()
             //关闭区块链引擎
              public static boolean isRunning()
              //判断区块链引擎是否还在运行中
              public static void AsyncGameCallAndCallBack(final String jsonrpc, final String callback)
              //异步调用，当jsonrpc调用完成之后 callback异步回调
              public static void GameCallAndCallBack(final String jsonrpc, final String callback)
              // 同步调用jsonrpc callback同步回调
               public static void GameSubscribeAndCallBack(String jsonrpc, String callback) // 订阅lua的事件回调
           ```

           + jsonrpc 采用以太坊标准的jsonrpc调用格式，区块链引擎使用的是进城间rpc调用，比http和ws调用要安全

         + lua和区块链引擎的回调在build_kaleido/jsb-link/frameworks/runtime-src/proj.android-studio/app/src/io/kaleidochain 中GoCallback.java

           ```
           public class GoCallback implements JavaCallback {
               private final static String TAG = "GoCallback";
               public void onEvent(String jsonrpc) {
                   try {
                       final String jscallStr = "cc.dgame.net.onMessage('" + jsonrpc + "')";
                       Log.d(TAG, "jscallStr = " + jscallStr);
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
           ```

           上面的callback直接调用到cocos 的js中

           

         

       

       

    

    