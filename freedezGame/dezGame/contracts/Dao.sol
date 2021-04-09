pragma solidity ^0.5.1;
contract Dao{
    enum PlayerStatus {
        NOTJION,    //0 未加入房间
        NOTSEATED,  //1 已加入房间，但未坐在table中
        SITTING,    //2 等待入座table
        SEATED,     //3 已坐下table
        PREREADY,   //4 新用户准备 等待开始
        READY,      //5 准备游戏
        PLAYING,    //6 正在游戏中
        DISCARD,    //7 弃牌  (过渡状态,用户无法查询到该状态)
        LEAVENEXT,  //8 结算离桌(PlayerInfo.LeaveNext>0)
        OFFLINE,     //9 用户离线(弃牌+结算离桌)
        SHOWDOWNOFFLINE, //10 摊牌掉线(结算离桌)
        STANDBY     // 11standby 暂离()
    }

    enum TableStatus {NOTSTARTED, STARTING, STARTED}      // table的状态，NOTSTARTED:未开始游戏; STARTING:正在开始在中; STARTED:已开始游戏


    struct Table {
        uint64        tbNum;          // tableid
        uint64        currentHand;    // 当前正在局数，结算一次，局数加１
        TableStatus   currentStatus;  // 当前table的状态
        address[]     players;        // table中的玩家
        uint64        readyNum;       // 准备游戏玩家个数
        address       startPlayer;    // 随机选择开始游戏的玩家
        //address     preStarter;       // 上一局starter
        int64         preStarterPos;  // 上一局starter位置 初始值为-1
        uint64        smallbindpos;   // 小盲位置 初始值为0
        uint64        delerpos;       // deler位置 初始值为0
        uint64        playerNum;      // 当前用户个数
        uint64        minimum;        // 最小开始数
        uint64        maximum;        // 最大人数
        uint          buyinMin;       // 最小筹码
        uint          buyinMax;       // 最大筹码
        uint          smallBlind;     // 小盲注
        uint64        straddle;       // 是否有straddle
        uint          ante;           // 每轮开始发牌前每个人下的赌注0-30
        uint          poolIndex;      // 回收在TablePool中的位置
        uint          startBlock;     // 桌子开始游戏区块高度
        uint          ty;             // 桌子类型
        bool          ispoint;        // 是否为积分桌子
        uint          creatime;       // 桌子创建时间
        uint          endtime;        // 结束时间
        address       creator;        // 创建者
        bytes         insuranceOdds;            // 保险赔率信息
    }

    struct PlayerInfo {
        uint64    tbNum;          // table的号码, 格式：数字+日期，如 100020181015　表示20181015的第1000张Table
        uint64    seatNum;        // 座位号
        uint      amount;         // 剩余金额
        uint      addChips;       // 待增加筹码
        uint      subChips;       // 待提取筹码
        PlayerStatus status;      // 玩家状态
        uint64    playedhand;     // 玩家上一局是否参与
        uint64    leaveNext;      // 下一局结算离开
        bool      showdownOffline;
        bytes32   pointHash;      // 牌点验证hash
        int     standby;
    }

    struct NotaryInfo {
        address   nrAddr;
        bytes32   allocate;
    }

    struct ExceptionInfo {
        address     addr;       // 异常的Inter或者公证者，异常情况：1,对table的部分或者全部玩家异常; 2,对部分或者全部table异常
        address[]   players;    // 汇报异常的玩家
        uint8       status;     // 如果已经向Inter合约汇报异常，置为1
    }

    string public name;
    address public owner;
    mapping(string=>address)  addrs;
    // address public interManage;             // Inter合约地址
    // address public notaryManage;            // 公证者合约地址
    // address public tokenAddress;            // token合约地址
    // address public portalAddress;           // portal合约地址
    // address public funcAddress;             // room合约部分功能，解决room合约过大无法部署问题
    // address public func2Address;            // room合约部分功能，解决room合约过大无法部署问题
    // address public func3Address;            // room合约部分功能，解决room合约过大无法部署问题
    mapping (uint64 => Table)  Tables;      // table号码--table中玩家信息列表
    //mapping (address => uint64) public secTables;   // 密码房
    uint64[10] public sysTables;                    // 系统桌子
    uint64 public testTableid = 0xf000000000000;        // 体验桌子tableid
    uint64 public sysTableid =  0xe000000000000;        // 系统桌子tableid
    //uint64 public secTableid =  0xd000000000000;        // 密码桌子
    //uint64[]           public             TablePool;    // 已回收table
    mapping (address => PlayerInfo)     Players;        // 玩家地址--玩家信息
    mapping (uint64 => NotaryInfo[])      Notarys;      // tableid -- 公证信息列表

    //uint64 public currMaxTbNum;             // 当前最大的台号
    mapping(bytes32=>address[]) PointHashs;  // 牌点验证
    uint public blockout = 100;                // 游戏超时区块高度
    mapping(uint=>uint64[]) public sysPool;  //桌子回收    0xf000000000000>tableid>0xe000000000000
    mapping(uint=>uint64[]) public testPool; //体验桌子回收 tableid>0xf000000000000;
    mapping(uint64=>uint64) public clubPool; //

    mapping(uint64=>address[])  playedlist; //taleid => playerlist
    mapping(uint64=>int[]) playerstatus; //talbeid => 用户输赢状态
    mapping(uint64=>int[]) buyin; //talbeid => 用户筹码
    mapping(uint64=>mapping(address=>uint))  playerindex; //tableid =>address=>index索引

    mapping(uint64=>address[]) public joinList;
    mapping(address=>uint) public joinindex;

    mapping(address=>uint64[]) public playedTable; //address => tables
    mapping(address=>mapping(uint64=>uint)) playedIndex; //address => tableid => index
    
    uint public rakeRate = 3;               //佣金点数
    address public rakeRateAddress;         //可设置佣金的地址
    
    //审批记录
    struct approveInfo{
        address sender;
        address player;
        uint64 tableid;
        uint    chips;
        bool ok;
    }
    mapping(uint64=>uint) Maxapprove; //clubid => max_id
    //被审批过的用户
    mapping(uint=>approveInfo) approved;//id => info



    //积分添加筹码申请列表
    mapping(uint64 => address[]) addchipslist;//用户列表
    mapping(uint64 => uint[]) addchips; //筹码
    mapping(uint => uint64[]) addchipsTable; //tableid
    mapping(address => uint) addchipsindex;//序列
    struct insurer{
        uint pos; //s
        uint[] out; //
        uint[] amount; //
    }
    mapping(uint=> insurer) insurance;//tableid*100000+hand*10+5/4=>
}
