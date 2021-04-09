pragma solidity ^0.5.0;
//一些底层调用的代码
import './Event.sol';
import './TokenAbi.sol';
import './ServerAbi.sol';
import './clubabi.sol';
import './Portal.sol';
import './RLP.sol';
import './SafeMath.sol';
contract dezSettle  is Event{
    using SafeMath for uint;
    using RLP for RLP.RLPItem;
    using RLP for RLP.Iterator;
    using RLP for bytes;
    string public version ="1.0.1";
    event noticyEX(address indexed a,bytes b,string c);
    function eventSettle(uint64 hand,uint64 playingNum,uint64 tableid)internal{
        emit gameEvent(uint8(eventTy.Settle),tableid,msg.sender,hand,playingNum.encodeUint());
    }
    function eventLeaveTable(uint64 tableid, address player, uint64 pos,string memory error)public {
        bytes[] memory eventReturn = new bytes[](2);
        eventReturn[0] = pos.encodeUint();
        eventReturn[1] = error.encodeString();
        emit gameEvent(uint8(eventTy.LeaveTable),tableid,player,0,eventReturn.encodeList());
    }
    function eventAddChips(uint64 tableid,address player,uint amount,string memory error)internal {
        bytes[] memory eventReturn = new bytes[](2);
        eventReturn[0] = amount.encodeUint();
        eventReturn[1] = error.encodeString();
        emit gameEvent(uint8(eventTy.AddChips),tableid,player,0,eventReturn.encodeList());
    }

    function eventStart(uint64 tableid, address player, uint64 pos, uint64 hand,string memory error)internal{
        bytes[] memory eventReturn = new bytes[](2);
        eventReturn[0] = pos.encodeUint();
        eventReturn[1] = error.encodeString();
        emit gameEvent(uint8(eventTy.Start),tableid,player,hand,eventReturn.encodeList());
    }
    function eventNotarySettle(uint64 tableid,address nrAddr, bytes memory data) internal {
        emit gameEvent(uint8(eventTy.NotarySettle),tableid,nrAddr,0,data);
    }
    
    function eventWithdrawChips(uint64 tableid,address player,uint amount,string memory error)private {
        bytes[] memory eventReturn = new bytes[](2);
        eventReturn[0] = amount.encodeUint();
        eventReturn[1] = error.encodeString();
        emit gameEvent(uint8(eventTy.WithdrawChips),tableid,player,0,eventReturn.encodeList());
    }






    function playerSettle(bytes memory data,bytes memory discardSigns) public returns(bool){
        if(!discardataDebug(Players[msg.sender].tbNum,discardSigns)){
            return false;
        }
        uint i;
        uint playingNum = 0;
        address[] storage players = Tables[Players[msg.sender].tbNum].players;
        for(i = 0; i < players.length; i++) {
            if (PlayerStatus.PLAYING == Players[players[i]].status) {
                playingNum++;
            }
        }
        uint sigLen = 65 * playingNum;
        if(Require(data.length > sigLen,"data length error")){
            return false;
        }

        bytes memory balData = new bytes(data.length - sigLen);
        bytes memory sigs = new bytes( sigLen);
        for(i = sigLen; i < data.length; i++) {
            balData[i - sigLen] = data[i];
        }
        for(i = 0; i < sigLen; i++) {
            sigs[i] = data[i];
        }

        return settle(0, sigs, balData);
    }
    //src:0 playersettle,1 notarysettle
    event test(address indexed a,address indexed b);
    function settle(uint8 src, bytes memory sigs, bytes memory data) public returns(bool) {
        RLP.RLPItem memory bal = data.toRLPItem();
        //require(bal.isList(),"rlp data error");
        RLP.RLPItem[] memory settledata = bal.toList();

        //require(settledata.length == 5,"rlp data length error");
        
        if(Require(settledata.length > 3,"rlp data length error")){
            return false;
        }
        //require(address(this) == rlpToAddress(settledata[0]),"game contract address error");
        emit test( address(src),rlpToAddress(settledata[0]));
        if(Require(address(this) == rlpToAddress(settledata[0]),"game contract address error")){
            return false;
        }
       
        uint64 tableid = uint64(settledata[1].toUint());
        //require(settledata[2].toUint() == Tables[tableid].currentHand,"table hand error");
        if(Require(settledata[2].toUint() == Tables[tableid].currentHand,"table hand error")){
            return false;
        }

        if(src == 0) {//玩家提交需要验证签名
            if(!verifySigs(sigs, keccak256(data), tableid)){
                emit noticy("play sign error");
                return false;
            }
        }

        if(Require(settledata[3].isList(),"rlp data input error")){
            return false;
        }

        RLP.RLPItem[] memory itemDatas = settledata[3].toList();

        address[] memory players = Tables[tableid].players;

        // 下面需要改为事务
        uint i;
        uint add;
        uint sub;
        uint fee;
        address agent;
        address playerAddr;
        //结算保险
        if (settledata.length>4){
            settleInsurance(tableid,settledata[4].toUint());
        }
        //emit gameEvent(0,0,address(0),0,data);
        //bool showdownoffline = false;
        //if (src == 1){
        //    eventNotarySettle(tableid,msg.sender,data);
        //}
        if (src==1){
            for(i=0;i< players.length;i++){
                if (Players[players[i]].showdownOffline){
                    src = 0;
                    break;
                }
            }
        }
        for(i = 0; i < itemDatas.length; i++) {
            //require(itemDatas[i].isList(),"item data error");
            if(Require(itemDatas[i].isList(),"item data error")){
                return false;
            }

            RLP.RLPItem[] memory item = itemDatas[i].toList();
            //require(item.length == 3,"item length error");
            if(Require(item.length == 3,"item length error")){
                return false;
            }
            playerAddr = players[item[0].toUint()];
            
            if(1 == item[1].toUint()) {
                //addStatus(tableid,playerAddr,int(item[2].toUint()));
                fee = item[2].toUint()*rakeRate/100;
                if(fee > 0 && tableid < 0xf000000000000 && !Tables[tableid].ispoint){
                    Players[playerAddr].amount = Players[playerAddr].amount.add(item[2].toUint()-fee);
                    agent = Portal(addrs['portal']).Inviter(playerAddr);
                    if(agent == address(0)){ //俱乐部分成
                        agent = clubabi(addrs['club']).clubOwner(tableid/0x10000000);
                    }
                    if(agent != address(0x0) && fee > 1){
                        Portal(addrs['portal']).divide(agent,fee/2);
                        //Agents[Inviter[playerAddr]].balance += fee/2;
                        fee -= fee/2;
                        agent = Portal(addrs['portal']).Inviter(agent);
                        if (agent != address(0x0) && fee > 9){
                            Portal(addrs['portal']).divide(agent,fee/10);
                            fee -= fee/10;
                        }
                    }
                    Portal(addrs['portal']).divide(owner,fee);
					addStatus(tableid,playerAddr,int(item[2].toUint()-fee));
                    //Agents[owner].balance += fee;
                } else {
                    Players[playerAddr].amount = Players[playerAddr].amount.add(item[2].toUint());
					addStatus(tableid,playerAddr,int(item[2].toUint()));
                }
                add = add.add(item[2].toUint());
            } else {
                addStatus(tableid,playerAddr,0-int(item[2].toUint()));
                Players[playerAddr].amount = Players[playerAddr].amount.sub(item[2].toUint());
                sub = sub.add(item[2].toUint());
                //if(src == 1){
                //    Players[playerAddr].leaveNext = 1;
                //}
            }

            //emit SettleItemData(tableid, Tables[tableid].currentHand, uint8(item[0].toUint()), uint8(item[1].toUint()), item[2].toUint());
        }

        //require(add == sub,"add != sub");
        if(Require(add == sub,"add != sub")){
                return false;
        }
        
        eventSettle(Tables[tableid].currentHand,Tables[tableid].playerNum,tableid);
        //emit SettleStart(1,tableid,Tables[tableid].currentHand,Tables[tableid].playerNum,0,address(0x0),0,0);
       
        //给inter付费
        payServer(addrs['inter'],tableid);
        reset(tableid);
        return true;
    }
    function toBytes(uint256 x) public view returns (bytes memory b) {
        b = new bytes(32);
        assembly { mstore(add(b, 32), x) }
        return b;
    }
    function discardataDebug(uint64 tableid,bytes memory discardSigns) internal returns(bool){
        if(discardSigns.length == 0||tableid ==0) return true;
        //uint256(32字节)=(合约地址(20字节,2**96 左移12字节)+tableid(8字节,2**32左移4字节)+hand(4字节))
        uint256 a = uint256(address(this))*(2**96)+uint256(tableid)*(2**32)+Tables[tableid].currentHand;
        //bytes32 datahash = keccak256(bytes32(a));
        bytes32  datahash = keccak256(toBytes(a));
        uint num = discardSigns.length/65;
        uint8 v;
        bytes32 r;
        bytes32 s;
        address addr;
        for (uint i = 0; i < num; i++) {
            assembly{
                r := mload(add(discardSigns, add(32, mul(i, 65))))
                s := mload(add(discardSigns, add(64, mul(i, 65))))
                v := mload(add(discardSigns, add(65, mul(i, 65))))
            }
            if (v < 27) {
                v += 27;
            }
            addr = ecrecover(datahash, v, r, s);
            //require(Players[addr].tbNum == tableid,"discard data error");
            Players[addr].status = PlayerStatus.DISCARD;
        }
        return true;
    }




 //保险结算 ret 5主,5边,4主,4边
    function settleInsurance(uint64 tableid,uint ret) public{
        //  emit gameEvent(0,uint64(tableid),address(0x33333),0,msg.data);
        //  return;
        if(Tables[tableid].insuranceOdds.length == 0){
            return;
        }

        uint index4 = tableid*10000+Tables[tableid].currentHand*10+4;
        uint index5 = tableid*10000+Tables[tableid].currentHand*10+5;
        address tplayer;
        
        //emit gameEvent(0,uint64(insurance[index4].amount.length+insurance[index5].amount.length),address(0x33333),0,'');
        //都没有压
        if (insurance[index4].amount.length == 0 && insurance[index5].amount.length == 0){
            return;
        }
        // emit gameEvent(0,uint64(insurance[index4].amount.length+insurance[index5].amount.length),address(0X444444),0,'');
        // return;
        address[] memory players = Tables[tableid].players;
        int value = 0;
        RLP.RLPItem[] memory rate = Tables[tableid].insuranceOdds.toRLPItem().toList();
 
        // if(insurance[index5].amount[1]>0 ){
        //     emit gameEvent(0,uint64(tableid),address(0x444444),0,msg.data);
        //     return;
        // } else {
        //    emit gameEvent(0,uint64(tableid),address(0x5555),0,msg.data);
        // }
        // return;
 
        if (insurance[index4].amount.length == 2){
            tplayer = players[insurance[index4].pos];
            if(insurance[index4].amount[0]>0){
                if(ret&2>0){
                    value += int(rate[insurance[index4].out[0]-1].toUint()*insurance[index4].amount[0]/100);
                }else{
                    value -= int(insurance[index4].amount[0]);
                }
            }
            if(insurance[index4].amount[1]>0){
                if(ret&1>0){
                    value += int(rate[insurance[index4].out[1]-1].toUint()*insurance[index4].amount[1]/100);
                }else{
                    value -= int(insurance[index4].amount[1]);
                }
            }
            addInsuranceStatus(tableid,tplayer,value);
        }

        // emit gameEvent(0,uint64(insurance[index4].amount.length+insurance[index5].amount.length),address(0X444444),0,'');
        // return;
        if (insurance[index5].amount.length == 2){
            tplayer = players[insurance[index5].pos];
            value = 0;

            if(insurance[index5].amount[0]>0){
                if(ret&8>0){
                    value += int(rate[insurance[index5].out[0]-1].toUint()*insurance[index5].amount[0]/100);
                }else{
                    value -= int(insurance[index5].amount[0]);
                }
            }



            if(insurance[index5].amount[1]>0){
                if(ret&4>0){
                    value += int(rate[insurance[index5].out[1]-1].toUint()*insurance[index5].amount[1]/100);
                }else{
                    value -= int(insurance[index5].amount[1]);
                }
            }

            addInsuranceStatus(tableid,tplayer,value);
        }
        
        //庄家赢,筹码转回token
        if(!Tables[tableid].ispoint){
            uint index = playerindex[tableid][address(0x1)];
            value = buyin[tableid][index];
            if (value>0){
                address clubowner = clubabi(addrs['club']).clubOwner(tableid/0x10000000);
                TokenAbi(addrs['token']).transferToken(address(this), clubowner, uint(value));
            }
        }
    }
    function verifySigs(bytes memory sigs, bytes32 msghash, uint64 tableid) internal view returns(bool) {
        address[] memory players = Tables[tableid].players;

        uint i;
        uint j;

        uint8[] memory mark = new uint8[](players.length);
        for(i = 0; i < players.length; i++) {
            mark[i] = 0;
        }

        uint playingNum = 0;
        for(i = 0; i < players.length; i++) {
            if(address(0) == players[i]) {
                continue;
            }

            if (PlayerStatus.PLAYING == Players[players[i]].status) {
                playingNum++;
                mark[i] = 1;
            }
        }

        uint sigLen = 65 * playingNum;
        if (sigs.length != sigLen){
            return false;
        }

        uint8 v;
        bytes32 r;
        bytes32 s;
        for (i = 0; i < playingNum; i++) {
            assembly {
                r := mload(add(sigs, add(32, mul(i, 65))))
                s := mload(add(sigs, add(64, mul(i, 65))))
                v := mload(add(sigs, add(65, mul(i, 65))))
            }

            if (v < 27) {
                v += 27;
            }

            address addr = ecrecover(msghash, v, r, s);
            // emit SettlePlayer(addr, currentHand);
            for (j = 0; j < players.length; j++) {
                if (players[j] == addr) {
                    mark[j] = 0;
                    break;
                }
            }
        }

        for(i = 0; i < mark.length; i++) {
            if(1 == mark[i]) {
                return false;
            }
        }
        return true;
    }

    function addInsuranceStatus(uint64 tableid,address player_,int mount)public{
        //用户赢的保险
        addStatus(tableid,player_,mount);
        if(mount > 0){
            Players[player_].amount += uint(mount);
        } else {
            //todo:
            if( Players[player_].amount < uint(0-mount)){
                emit noticy("addInsuranceStatus");
            } else {
                Players[player_].amount -= uint(0-mount);
            }
        }
        //庄家输的保险
        addStatus(tableid,address(0x1),0-mount);
        //如果是token筹码 要减去相应的
        if(!Tables[tableid].ispoint){
            uint index = playerindex[tableid][address(0x1)];
            buyin[tableid][index] -= mount;
        }
    }
    function addStatus(uint64 tableid,address player_,int mount) public {
        uint index = playerindex[tableid][player_];
        if(playedlist[tableid].length == 0 || playedlist[tableid][index] != player_){
            playerindex[tableid][player_] = playedlist[tableid].length;
            playedlist[tableid].push(player_);
            playerstatus[tableid].push(mount);
            buyin[tableid].push(0);
        } else {
            playerstatus[tableid][index] += mount;
        }
        return;
    }
    function leaveRoom(address addr)public returns(bool){
        PlayerInfo memory pInfo = Players[addr];
        Table storage tb = Tables[pInfo.tbNum];
        tb.players[pInfo.seatNum] = address(0x0);
        tb.playerNum--;
        if (tb.playerNum == 0){
            tb.currentStatus = TableStatus.NOTSTARTED;
            poolPush(pInfo.tbNum);
        }

        if(pInfo.tbNum < 0xf000000000000 && !Tables[pInfo.tbNum].ispoint){
            require(TokenAbi(addrs['token']).transferToken(address(this), addr, Players[addr].amount+Players[addr].addChips));
        }
        delete Players[addr];
        eventLeaveTable(pInfo.tbNum, addr, pInfo.seatNum,"");
        return true;
    }
    function tryStartGame(uint64 tableid,uint64 hand) public returns(bool){
        bytes4 funcid = bytes4(keccak256("tryStartGame(uint64,uint64)"));
        (bool succ,bytes memory ret) = addrs['common'].delegatecall(abi.encodeWithSelector(funcid,tableid,hand));
        return (succ&&abi.decode(ret, (bool)));
    }
    function poolPush(uint64 tableid) public returns(bool){
        bytes4 funcid = bytes4(keccak256("poolPush(uint64)"));
        (bool succ,bytes memory ret) = addrs['common'].delegatecall(abi.encodeWithSelector(funcid,tableid));
        return (succ&&abi.decode(ret, (bool)));
    }
    function resetNotray(uint64 tableid) internal {
        //delete Notarys[tableid];
        if(Notarys[tableid].length != 0){
            Notarys[tableid].length = 0;
        }
        ServerAbi(addrs['notary']).release(tableid);
    }
    //重置table的状态
    function reset(uint64 tableid) internal {
        address[] storage tbplayers = Tables[tableid].players;
        uint i;
        uint64 readyNum;
        Tables[tableid].preStarterPos = int64(Players[Tables[tableid].startPlayer].seatNum);

        for(i = 0; i < tbplayers.length; i++) {
            if(Players[tbplayers[i]].status >= PlayerStatus.PLAYING){
                //离开桌子
                
                if(Players[tbplayers[i]].leaveNext > 0){
                    leaveRoom(tbplayers[i]);
                    continue;
                }
                //增加筹码
                if(Players[tbplayers[i]].addChips > 0){
                    Players[tbplayers[i]].amount += Players[tbplayers[i]].addChips;
                    eventAddChips(tableid,tbplayers[i],Players[tbplayers[i]].amount,"");
                    Players[tbplayers[i]].addChips = 0;
                }
                //提取筹码
                if(Players[tbplayers[i]].subChips > 0){
                    if(Players[tbplayers[i]].amount <= Players[tbplayers[i]].subChips ||
                        Players[tbplayers[i]].amount-Players[tbplayers[i]].subChips < Tables[tableid].minimum){
                        eventWithdrawChips(Players[tbplayers[i]].tbNum,tbplayers[i],0,"insufficient amount");
                    } else if(tableid < 0xf000000000000 && !Tables[tableid].ispoint){
                        //todo:require
                        TokenAbi(addrs['token']).transferToken(address(this), tbplayers[i], Players[tbplayers[i]].subChips);
                        eventWithdrawChips(Players[tbplayers[i]].tbNum,tbplayers[i],Players[tbplayers[i]].subChips,"");
                    }
                    Players[tbplayers[i]].subChips = 0;
                }
                //emit noticyEX(tbplayers[i],uint(Players[tbplayers[i]].standby).encodeUint(),"ssssssss");
                //暂离用户
                if(Players[tbplayers[i]].standby != 0){
                    Players[tbplayers[i]].status = PlayerStatus.SEATED;
                    Players[tbplayers[i]].playedhand = 0;
                    if(Players[tbplayers[i]].showdownOffline){
                        Players[tbplayers[i]].showdownOffline=false;
                    }
                    continue;
                }
                //emit noticyEX(tbplayers[i],Players[tbplayers[i]].leaveNext.encodeUint(),"");
                //自动准备
                if(Players[tbplayers[i]].amount < Tables[tableid].smallBlind*5+Tables[tableid].ante &&
                    !(Tables[tableid].endtime>0 && Tables[tableid].endtime<now)
                ){
                    Players[tbplayers[i]].status = PlayerStatus.SEATED;
                    Players[tbplayers[i]].playedhand = Tables[tableid].currentHand;
                } else {
                    Players[tbplayers[i]].status = PlayerStatus.READY;
                    Players[tbplayers[i]].playedhand = Tables[tableid].currentHand;
                    readyNum++;
                }
                if(Tables[tableid].endtime>0 && Tables[tableid].endtime<now){
                    eventStart(tableid,tbplayers[i],uint64(i),uint64(Tables[tableid].currentHand),"table timeout");
                    leaveRoom(tbplayers[i]);
                }
            }
        }
        Tables[tableid].currentHand++;
        Tables[tableid].currentStatus = TableStatus.NOTSTARTED;

        Tables[tableid].startPlayer = address(0);
        Tables[tableid].readyNum = readyNum;
        resetNotray(tableid);
        tryStartGame(tableid,Tables[tableid].currentHand);
    }
    function rlpToAddress(RLP.RLPItem memory item) internal returns(address addr){
        if (item.rlpLen()==21) {
            return item.toAddress();
            //return bytesToAddress(item.toBytes());
        }

        // string memory strAddr = item.toAscii();
        // bytes memory bAddr = bytes(strAddr);
        
        bytes memory bAddr =item.toBytes();
        //emit noticyEX(address(item.rlpLen()),bAddr,"");
        if (bAddr.length<40){
            return address(0);
        }
        uint iAdd = 0;
        uint8 tmp = 0;
        for(uint i = bAddr.length-40; i < bAddr.length; i++) {
            tmp = 0;
            if (bAddr[i] >= byte('0') && bAddr[i] <= byte('9')) {
                tmp = uint8(bAddr[i]) - uint8(byte('0'));
            }

            if (bAddr[i] >= byte('a') && bAddr[i] <= byte('f')) {
                tmp = 10 + uint8(bAddr[i]) - uint8(byte('a'));
            }

            if (bAddr[i] >= byte('A') && bAddr[i] <= byte('F')) {
                tmp = 10 + uint8(bAddr[i]) - uint8(byte('A'));
            }

            iAdd = iAdd << 4 | uint(tmp);
        }

        return address(iAdd);
    }
    function bytesToAddress(bytes memory bys) private pure returns (address  addr) {
        assembly {
        addr := mload(add(bys,20))
        } 
    }
    function payServer(address serverAddr, uint64 tableId) internal {
        address[] memory servers;
        uint[] memory fees;
        (servers, fees) = ServerAbi(serverAddr).getTableNeedPayFee(address(this), tableId);
        if(0 == servers.length || servers.length != fees.length) {
            return;
        }
        uint totalFee = 0;
        for(uint i = 0; i < fees.length; i++) {
            totalFee = totalFee.add(fees[i]);
        }

        if(address(this).balance < totalFee){
            return;
        }
        ServerAbi(serverAddr).payFee.value(totalFee)(address(this), tableId, servers, fees);
    }
    function Require(bool _set ,string memory _data) internal returns(bool){
        if(!_set){
            emit noticy(_data);
            return true;
        }
        return false;
    }
}
