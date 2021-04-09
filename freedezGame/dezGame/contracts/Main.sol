pragma solidity ^0.5.0;

import './Event.sol';
import './LibAuthority.sol';
import './Portal.sol';
import './clubabi.sol';
import './TokenAbi.sol';
import './ServerAbi.sol';
contract Main  is Event,LibAuthority{
    event noticy(string data);
    
    constructor() payable public {
        owner = msg.sender;
        rakeRateAddress = msg.sender;
        setMaxGasPrice(1e11);
        setGasLimit(1e7);
        addWhite(msg.sender);
    }

    // 检查必须是合约的所有者
    modifier onlyOwner {
        assert(msg.sender == owner);
        _;
    }
    //注册功能合约地址
    function set(string memory key,address addr)onlyOwner public returns(bool){
        addrs[key] = addr;
        if(keccak256(abi.encodePacked(key)) == keccak256(abi.encodePacked("init"))){
            bytes4 funcid = bytes4(keccak256("creatSysTable()"));
            (bool succ,bytes memory ret) = addrs['init'].delegatecall(abi.encodeWithSelector(funcid,1));
            require((succ&&abi.decode(ret, (bool))),"初始化失败");
            //require(succ,"初始化失败");
        }
        return true;
    }
    function get(string memory key) public view returns(address){
        return addrs[key];
    }
    function setblockout(uint h)onlyOwner public returns(bool){
        blockout = h;
        return true;
    }
    function setRakeRate(uint _rakeRate)public returns(bool){
        require(msg.sender == rakeRateAddress);
        require(_rakeRate < 100);
        rakeRate = _rakeRate;
        return true;
    }

    function setRakeRateAddress(address _rakeRateAddress)public returns(bool){
        require(msg.sender == owner);
        rakeRateAddress =_rakeRateAddress;
        return true;
    }

    //获取桌子游戏开始的区块高度
    function getTableStartBlock(uint64 tableid)public view returns(uint64){
        return uint64(Tables[tableid].startBlock);
    }
    function getMaxTableid(uint64 clubid) public view returns(uint64){
        if(clubPool[clubid]>0){
            return clubPool[clubid];
        }
        return clubid*0x10000000;
    }
    function check_leaveTable(address sender)public view returns(bool){
        return (Players[sender].status < PlayerStatus.PLAYING);
    }

    function getFreeTable()public view returns(uint64[10] memory){
        return sysTables;
    }
    function getTableInfo(uint64 tableid) public returns(uint64,uint64,uint64,address,uint64,uint64,uint64,uint64,uint,uint,uint,uint64,uint) {
        (bool succ,bytes memory ret) = addrs["view"].delegatecall(msg.data);
        return abi.decode(ret, (uint64,uint64,uint64,address,uint64,uint64,uint64,uint64,uint,uint,uint,uint64,uint));
    }
    function getTableSeatInfo(uint64 tableid, uint8 pos) public returns (address,uint64,uint64,uint,uint64,uint64) {
        return getPlayerInfo(Tables[tableid].players[pos]);
    }
    function getTablePlayingPlayers(uint64 tableid) public view returns(uint64 number, address[] memory players) {
        players = new address[](Tables[tableid].maximum);
        number = 0;
        address tmpAddr;
        for(uint i = 0; i < Tables[tableid].players.length; i++) {
            tmpAddr = Tables[tableid].players[i];
            if(Players[tmpAddr].status >= PlayerStatus.PLAYING && Players[tmpAddr].status != PlayerStatus.DISCARD && Players[tmpAddr].status != PlayerStatus.OFFLINE && Players[tmpAddr].status != PlayerStatus.SHOWDOWNOFFLINE && !Players[tmpAddr].showdownOffline) {
                players[i] = tmpAddr;
                number++;
            }
        }
        return (number,players);
    }
    function getTableInters(uint64 tableid)public view returns(address[] memory){
        return ServerAbi(addrs["inter"]).getSelected(address(this),tableid);
    }
    function getTableNotarys(uint64 tableid)public view returns(address[] memory){
        return ServerAbi(addrs["notary"]).getSelected(address(this),tableid);
    }
    //
    function getInterInfo(address interAddress)public view returns(address, string memory, uint, uint, uint){
        return ServerAbi(addrs["inter"]).getServerInfo(interAddress);
    }
    function getNotaryInfo(address notaryAddress)public view returns(address, string memory, uint, uint, uint){
        return ServerAbi(addrs["notary"]).getServerInfo(notaryAddress);
    }
    //根据牌点hash获取玩家
    function getPointPlayers(bytes memory pointHash)public view returns(address[] memory players){
        return PointHashs[sha256(pointHash)];
    }
    //申请邀请码
    function applyCode(string memory _code)public returns(string memory){
        return Portal(addrs["portal"]).applyCode(_code,msg.sender);
    }
    //填写邀请人的邀请码
    function setCode(string memory _code)public returns(string memory){
        return Portal(addrs["portal"]).setCode(_code,msg.sender);
    }
     //查看自己邀请码(返回邀请码,累计收益,已提取收益,邀请总数)
    function getCode(address player)public view returns(string memory,uint,uint,uint){
        return Portal(addrs["portal"]).getCode(player);
    }
        //提取收益(剩余全部提取)
    function withdraw()public returns(string memory){
        //uint value = Agents[msg.sender].balance-Agents[msg.sender].withdraw;
        uint value = Portal(addrs["portal"]).withdraw(msg.sender);
        if (value == 0){
            return "Insufficient funds";
        }
        require(TokenAbi(addrs["token"]).transferToken(address(this), msg.sender, value));
        return "";
    }
    function Inviter(address player)public view returns(address){
        return Portal(addrs["portal"]).Inviter(player);
    }
    function joinlist(uint64 clubid) public view returns(address[] memory,uint[] memory,uint64[] memory){
        return (addchipslist[clubid],addchips[clubid],addchipsTable[clubid]);
    }
    function PlayedList(uint64 tableid)public view returns(address[] memory,int[] memory,int[] memory){
        return (playedlist[tableid],playerstatus[tableid],buyin[tableid]);
    }
    function getSubNotorys(uint64 tableid) public view returns(address[] memory addres) {
        addres = new address[](Notarys[tableid].length);
        for(uint i = Notarys[tableid].length; i > 0; i--) {
            addres[i - 1] = Notarys[tableid][i - 1].nrAddr;
        }
        return addres;
    }
    /////////////////
    //以上逻辑部分放在当前合约
    ///////////////////

    /////////////////
    //以下查询函数实现放在dezView合约
    ///////////////////
    function getPlayerInfo(address playerAddr) public returns (address,uint64,uint64,uint,uint64,uint64) {
        (bool succ,bytes memory ret) = addrs["view"].delegatecall(msg.data);
        return (abi.decode(ret, (address,uint64,uint64,uint,uint64,uint64)));
    }
    function getTableInfoEx(uint64 tableid) public returns(bytes memory) {
        (bool succ,bytes memory ret) = addrs["view"].delegatecall(msg.data);
        return (abi.decode(ret, (bytes)));
    }
    function getTablePlayers(uint64 tableid) public returns(address[] memory) {
        (bool succ,bytes memory ret) = addrs["view"].delegatecall(msg.data);
        return (abi.decode(ret, (address[])));
    }
    function getPlayerInfos(uint64 tableid) public returns(bytes memory){
        (bool succ,bytes memory ret) = addrs["view"].delegatecall(msg.data);
        return (abi.decode(ret, (bytes)));
    }
    function getTableSeatInfos(uint64 tableid) public returns(bytes memory){
        (bool succ,bytes memory ret) = addrs["view"].delegatecall(msg.data);
        return (abi.decode(ret, (bytes)));

    }
    function getinsurance(uint64 tableid) public returns(uint[] memory){
        (bool succ,bytes memory ret) = addrs["view"].delegatecall(msg.data);
        return (abi.decode(ret, (uint[])));
    }
    function PlayedTables(address addr,uint page)public  returns(uint, bytes memory,uint){
        (bool succ,bytes memory ret) = addrs["view"].delegatecall(msg.data);
        return (abi.decode(ret, (uint,bytes,uint)));
    }
    function Approvedlist(uint64 clubid) public returns(uint,bytes memory){
        (bool succ,bytes memory ret) = addrs["view"].delegatecall(msg.data);
        return (abi.decode(ret, (uint,bytes)));
    }
    /////////////////
    //以上查询函数实现放在dezView合约 end
    ///////////////////

    function addChips(uint value) public returns(bool) {
        (bool succ,bytes memory ret) = addrs["chips"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
    // 暂时不实现
    // function withdrawChips(uint value) public returns(bool){
    //    return true;
    // }
    function createTable(uint64 clubid,uint64 minimum_,uint64 maximum_,uint buyinMin_,uint buyinMax_,uint smallBlind_,uint64 straddle_,uint ante_,uint ty,uint endtime,bytes memory insuranceOdds) public returns(bool){
        (bool succ,bytes memory ret) = addrs["create"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
    function joinTable(uint64 tableid,uint needChips_,uint64 pos)public returns(bool){
        (bool succ,bytes memory ret) = addrs["create"].delegatecall(msg.data);

        return (succ&&abi.decode(ret, (bool)));
    }
    function changeSeat(uint64 pos,uint chips) public returns(bool){
        (bool succ,bytes memory ret) = addrs["create"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
    function leaveTable(uint64 tableid) public returns(bool) {
        (bool succ,bytes memory ret) = addrs["common"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
    function dismissTable(uint64 tableid) public returns(bool){
        (bool succ,bytes memory ret) = addrs["flowcontrol"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
    function leaveNext() public returns(bool){
        (bool succ,bytes memory ret) = addrs["common"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
    function standup(bool stanby) public returns(bool){
        (bool succ,bytes memory ret) = addrs["chips"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
    function start(uint64 tableid, uint64 hand) public returns(bool){
        (bool succ,bytes memory ret) = addrs["start"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    } 
 
    function playerSettle(bytes memory data,bytes memory discardSigns) public returns(bool){
        (bool succ,bytes memory ret) = addrs["settle"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
  
    function insure(bytes memory data) public returns(bool){
        (bool succ,bytes memory ret) = addrs["flowcontrol"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
    //申请公证
    function applyNotarize(uint64 tableHand) public returns(bool) {
        (bool succ,bytes memory ret) = addrs["notarize"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
    //公证买保险 
    function notaryInsure(address player,bytes memory data) public returns(bool){
        (bool succ,bytes memory ret) = addrs["flowcontrol"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }

    //公证结算
    function submitNotary(uint64 tableid,bytes memory data) public returns(bool) {
        (bool succ,bytes memory ret) = addrs["flowcontrol"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
    //公证用户超时
    function playerTimeout(address player)public returns(bool){
        (bool succ,bytes memory ret) = addrs["flowcontrol"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
    //公证
    function rmtinsTimeout(address player,bytes memory rmtins)public returns(bool){
        (bool succ,bytes memory ret) = addrs["flowcontrol"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
    //公证不做任何操作直接结束
    function finishNotarize(uint64 tableid,bytes memory data) public returns(bool) {
        (bool succ,bytes memory ret) = addrs["notarize"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
    //公证解散桌子
    function notaryDismiss(uint64 tableid,uint64 hand)public returns(bool){
        (bool succ,bytes memory ret) = addrs["flowcontrol"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
    function submitPointHash(uint64 tableid,uint64 hand,bytes memory pointHash) public returns(bool){
        (bool succ,bytes memory ret) = addrs["notarize"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
    }
   function joinAprove(address player_,uint ok)public returns(bool){
        (bool succ,bytes memory ret) = addrs["create"].delegatecall(msg.data);
        return (succ&&abi.decode(ret, (bool)));
   }

}
