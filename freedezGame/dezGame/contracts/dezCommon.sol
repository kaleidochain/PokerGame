pragma solidity ^0.5.0;
//一些底层调用的代码
import './Event.sol';
import './RLPEncode.sol';
import './TokenAbi.sol';
import './ServerAbi.sol';
contract dezCommon  is Event{
    string public version ="1.0.1";
    using RLPEncode for *;

    function eventAddChips(uint64 tableid,address player,uint amount,string memory error)internal {
        bytes[] memory eventReturn = new bytes[](2);
        eventReturn[0] = amount.encodeUint();
        eventReturn[1] = error.encodeString();
        emit gameEvent(uint8(eventTy.AddChips),tableid,player,0,eventReturn.encodeList());
    }
    function eventJoin(uint64 tableid,address sender,uint64 pos,uint amount,string memory error) public {
        bytes[] memory eventReturn = new bytes[](3);
        eventReturn[0] = pos.encodeUint();
        eventReturn[1] = amount.encodeUint();
        eventReturn[2] = error.encodeString();
        emit gameEvent(uint8(eventTy.Join),tableid,sender,0,eventReturn.encodeList());
        //emit gameEventest(uint8(eventTy.Join),tableid,sender,0,eventReturn);
    }
    function eventSelectInter(uint64 tableid,uint64 number)public{
        emit gameEvent(uint8(eventTy.SelectInter),tableid,msg.sender,Tables[tableid].currentHand,number.encodeUint());
    }
    function eventGameStart(uint64 tableid, address starter, uint64 seatNum,uint64 smallpos,uint64 delerpos, uint64 hand)internal{
        bytes[] memory eventReturn = new bytes[](3);
        eventReturn[0] = seatNum.encodeUint();
        eventReturn[1] = smallpos.encodeUint();
        eventReturn[2] = delerpos.encodeUint();
        emit gameEvent(uint8(eventTy.GameStart),tableid,starter,hand,eventReturn.encodeList());
    }
    function eventStart(uint64 tableid, address player, uint64 pos, uint64 hand,string memory error)internal{
        bytes[] memory eventReturn = new bytes[](2);
        eventReturn[0] = pos.encodeUint();
        eventReturn[1] = error.encodeString();
        emit gameEvent(uint8(eventTy.Start),tableid,player,hand,eventReturn.encodeList());
    }
    function eventLeaveNext(uint64  tableid,uint64 hand,address player,uint64 pos,string memory error)public{
        bytes[] memory eventReturn = new bytes[](2);
        eventReturn[0] = pos.encodeUint();
        eventReturn[1] = error.encodeString();
        emit gameEvent(uint8(eventTy.LeaveNext),tableid,player,hand,eventReturn.encodeList());
    }
    function eventLeaveTable(uint64 tableid, address player, uint64 pos,string memory error)public {
        bytes[] memory eventReturn = new bytes[](2);
        eventReturn[0] = pos.encodeUint();
        eventReturn[1] = error.encodeString();
        emit gameEvent(uint8(eventTy.LeaveTable),tableid,player,0,eventReturn.encodeList());
    }

    // function eventDismissTable(uint64 tableid,uint64 hand) public {
    //     string memory err = "";
    //     emit gameEvent(uint8(eventTy.DismissTable),tableid,msg.sender,hand,err.encodeString());
    // }



    function leaveTable(uint64 tableid) public returns(bool) {
        PlayerInfo memory pInfo = Players[msg.sender];
        //require(pInfo.status > PlayerStatus.NOTJION,"player not join");
        //正在玩的用户不能退出
        if(pInfo.status == PlayerStatus.NOTJION){
            eventLeaveTable(tableid, msg.sender, pInfo.seatNum,"not_in_table");
            return true;
        }

        //require(pInfo.status < PlayerStatus.PLAYING,"player playing");
        if(pInfo.status >= PlayerStatus.PLAYING){
            eventLeaveTable(pInfo.tbNum, msg.sender, pInfo.seatNum,"playing");
            return false;
        }
        //申请加入状态 退出申请
        if(pInfo.status == PlayerStatus.NOTSEATED){
            //joinPop(pInfo.tbNum/0x10000000,msg.sender);
            Players[msg.sender].status = PlayerStatus.NOTJION;
            Tables[pInfo.tbNum].players[pInfo.seatNum] = address(0);
            Players[msg.sender].tbNum = 0;
            eventLeaveTable(pInfo.tbNum, msg.sender, pInfo.seatNum,"");
            return true;
        }
        //已在桌子
        if (pInfo.tbNum > 0){
            if (Tables[pInfo.tbNum].players[pInfo.seatNum] == msg.sender) {
                Tables[pInfo.tbNum].players[pInfo.seatNum] = address(0);
                Tables[pInfo.tbNum].playerNum--;
            }
            if (pInfo.status >= PlayerStatus.READY && Tables[pInfo.tbNum].readyNum > 0) {
                Tables[pInfo.tbNum].readyNum--;
            }
            //上一局用户退出尝试开始游戏
            if(pInfo.status == PlayerStatus.SEATED && pInfo.playedhand>0 && Tables[pInfo.tbNum].currentStatus != TableStatus.STARTED){
                tryStartGame(pInfo.tbNum,Tables[pInfo.tbNum].currentHand);
            }
            //桌上没用户了,回收tableid
            if (Tables[pInfo.tbNum].playerNum == 0){
                poolPush(pInfo.tbNum);
            }
        }
        if(pInfo.tbNum < 0xf000000000000 && !Tables[pInfo.tbNum].ispoint){
            require(TokenAbi(addrs['token']).transferToken(address(this), msg.sender, Players[msg.sender].amount+Players[msg.sender].addChips));
        }
        //PlayerInfo memory tempInfo;
        delete Players[msg.sender];
        eventLeaveTable(pInfo.tbNum, msg.sender, pInfo.seatNum,"");
        return true;
    }


    function leaveNext()public returns(bool){
        if(uint64(Players[msg.sender].status) == 0){
            eventLeaveNext(Players[msg.sender].tbNum,0,msg.sender,0,"not in table");
            return false;
        }
        uint64 tableid = Players[msg.sender].tbNum;
        uint64 seetNum = Players[msg.sender].seatNum;
        //游戏没开始直接离开
        if(Players[msg.sender].status < PlayerStatus.PLAYING){
            leaveTable(0);
            eventLeaveNext(tableid,Tables[tableid].currentHand,msg.sender,seetNum,"");
            return true;
        }
        //下局结算离开
        Players[msg.sender].leaveNext = 1;
        if(Players[msg.sender].standby!=0){
            Players[msg.sender].standby=0;
        }
        eventLeaveNext(tableid,Tables[tableid].currentHand,msg.sender,seetNum,"");
        return true;
    }















    function tryStartGame(uint64 tableid,uint64 hand) public returns(bool){
        bool succ = startgame(tableid,hand);
        address[] storage players = Tables[tableid].players;
        uint emptyPos=0;//除了暂离用户的位置个数
        for(uint i = 0; i < players.length; i++) {
            if(players[i] == address(0) || Players[players[i]].standby != 0){
                emptyPos++;
            }
        }
        for(uint i = 0; i < players.length; i++) {
            //暂离用户
            if(Players[players[i]].status == PlayerStatus.SEATED && Players[players[i]].standby != 0){
                Players[players[i]].standby--;
                if(emptyPos<Tables[tableid].minimum || Players[players[i]].standby==0){
                    leaveRoom(players[i]);
                }
            }
        }

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
    function startgame(uint64 tableid,uint64 hand)public returns(bool){
        if (Tables[tableid].currentStatus != TableStatus.NOTSTARTED ){
            return true;
        }
        //是第一局
        if(Tables[tableid].preStarterPos < 0){
            return startfirst(tableid,hand);
        }
        address[] storage players = Tables[tableid].players;
        uint64 i;
        uint64 prePlayerNum; //上一局玩家人数
        uint64 prePlayerReadyNum; //上一局玩家准备人数
        uint64 currentHand = Tables[tableid].currentHand;
        for(i = 0; i < players.length; i++) {
            if(Players[players[i]].playedhand == currentHand-1 && Players[players[i]].amount >= Tables[tableid].smallBlind*5+Tables[tableid].ante){
                prePlayerNum++;
                if(Players[players[i]].status == PlayerStatus.READY){
                    prePlayerReadyNum++;
                }
            }
        }
        //上局玩家人数不够最小开始人数
        if(prePlayerNum < Tables[tableid].minimum){
            return startfirst(tableid,hand);
        }
        //上局玩家都准备
        if(prePlayerNum == prePlayerReadyNum){
            return startNext(tableid,hand,prePlayerNum);
        }
        return false;
    }
    function startfirst(uint64 tableid,uint64 hand)internal returns(bool){
        address[] storage players = Tables[tableid].players;
        uint64 i;
        uint64 readNum;
        address starter;
        for(i = 0; i < players.length; i++) {
            if(Players[players[i]].status == PlayerStatus.PREREADY || Players[players[i]].status == PlayerStatus.READY){
                readNum++;
            }
        }
        if(readNum < Tables[tableid].minimum){
            return false;
        }
        int64 starterIndex = int64(block.number%Tables[tableid].minimum);
        for(i = 0; i < players.length; i++) {
            if(Players[players[i]].status == PlayerStatus.PREREADY || Players[players[i]].status == PlayerStatus.READY){
                if(Players[players[i]].status == PlayerStatus.PREREADY){
                    eventStart(tableid, players[i], i, hand, "");
                }
                Players[players[i]].status = PlayerStatus.PLAYING;
                Players[players[i]].playedhand = Tables[tableid].currentHand;
                if (starterIndex == 0){
                    starter = players[i];
                }
                starterIndex--;
            }
        }

        Tables[tableid].startPlayer = starter;
        //选小盲注位置
        uint64 smallpos;
        for(i=Tables[tableid].maximum+Players[starter].seatNum-1;i!=Players[starter].seatNum;i--){
            smallpos = i;
            if(i>=Tables[tableid].maximum){
                smallpos = i-Tables[tableid].maximum;
            }
            if(Players[players[smallpos]].status == PlayerStatus.PLAYING){
                break;
            }
        }
        uint64 dealerpos=smallpos;
        if(Tables[tableid].minimum>2){
            for(i=Tables[tableid].maximum+Players[players[smallpos]].seatNum-1;i!=Players[players[smallpos]].seatNum;i--){
                dealerpos = i;
                if(i>=Tables[tableid].maximum){
                    dealerpos = i-Tables[tableid].maximum;
                }
                if(Players[players[dealerpos]].status == PlayerStatus.PLAYING){
                    break;
                }
            }
        }
        Tables[tableid].smallbindpos = smallpos;
        Tables[tableid].delerpos = dealerpos;
        Tables[tableid].currentStatus = TableStatus.STARTED;
        Tables[tableid].startBlock = block.number;
        //emit SelectStarter(tableid, starter, Players[starter].seatNum,smallpos,smallpos, hand);
        //emit SettleStart(0,tableid,hand,Tables[tableid].playerNum,uint64(Tables[tableid].currentStatus),starter,smallpos,smallpos);
        eventGameStart(tableid, starter, Players[starter].seatNum,smallpos,smallpos, hand);
        return true;
    }

    function startNext(uint64 tableid,uint64 hand,uint64 readynum) public returns(bool){
        address[] storage players = Tables[tableid].players;
        uint64 i;
        address starter;
        //uint pos;
        //上一局大盲为这一局小盲
        uint64 blindpos = uint64(Tables[tableid].preStarterPos);
        uint64 delerpos = Tables[tableid].delerpos;
        // if(readynum == 2){
        //     delerpos = smallpos;
        // } else {
        //     delerpos = Tables[tableid].smallbindpos;
        // }

        //选starter 大盲(原大盲顺时针第一个位置)
        for(i = uint64(Tables[tableid].preStarterPos+1);i != uint64(Tables[tableid].preStarterPos); i++){
            if(i >= Tables[tableid].maximum ){
                i = i-Tables[tableid].maximum;
            }
            if(Players[players[i]].status == PlayerStatus.PREREADY || Players[players[i]].status == PlayerStatus.READY){
                //补大盲
                if(Players[players[i]].status == PlayerStatus.PREREADY){
                    //delerpos = Tables[tableid].smallbindpos;
                    readynum++; //用来表示补大盲
                    Players[players[i]].playedhand = Tables[tableid].currentHand;
                    eventStart(tableid, players[i], i, hand, "");
                }
                starter = players[i];
                Players[players[i]].status = PlayerStatus.PLAYING;
                Players[players[i]].playedhand = Tables[tableid].currentHand;
                break;
            }
        }
        for(i = 0; i < players.length; i++) {
            if(Players[players[i]].status == PlayerStatus.READY){
                Players[players[i]].playedhand = Tables[tableid].currentHand;
                Players[players[i]].status = PlayerStatus.PLAYING;
            //} else if(Tables[tableid].straddle > 0 && Players[players[i]].status == PlayerStatus.PREREADY){//是否支持补盲
            } else if(Players[players[i]].status == PlayerStatus.PREREADY){//是否支持补盲
                //大盲和diler之间不能补盲加入
                if( blindpos > delerpos &&
                  (Players[players[i]].seatNum > blindpos || Players[players[i]].seatNum < delerpos) ||
                  blindpos < delerpos &&
                  Players[players[i]].seatNum > blindpos &&
                  Players[players[i]].seatNum < delerpos
                  ){
                    readynum++;
                    //Players[players[i]].playedhand = 0;
                    Players[players[i]].status = PlayerStatus.PLAYING;
                    eventStart(tableid, players[i], i, hand, "");
                }
            }

        }
        Tables[tableid].startPlayer = starter;

        if(readynum == 2){
            delerpos = blindpos;
        } else {
            delerpos = Tables[tableid].smallbindpos;
        }
        Tables[tableid].delerpos = delerpos;
        Tables[tableid].smallbindpos = blindpos;
        Tables[tableid].currentStatus = TableStatus.STARTED;
        Tables[tableid].startBlock = block.number;
        //emit SelectStarter(tableid, starter, Players[starter].seatNum, smallpos,delerpos,hand);
        //emit SettleStart(0,tableid,hand,Tables[tableid].playerNum,uint64(Tables[tableid].currentStatus),starter,blindpos,delerpos);
        eventGameStart(tableid, starter, Players[starter].seatNum, blindpos,delerpos,hand);
        return true;
    }



    function playedtable(address player,uint64 tableid)public returns(bool){
        uint index = playedIndex[player][tableid];
        if(playedTable[player].length > 0 && playedTable[player][index] == tableid){
            return true;
        }
        playedIndex[player][tableid] = playedTable[player].length;
        playedTable[player].push(tableid);
        return true;
    }
    function applyInter(uint64 tableid) public returns(bool) {
        ServerAbi(addrs['inter']).select(tableid,1);
        eventSelectInter(tableid, 1);
        return true;
    }
    //增加筹码审批逻辑
    function addChipsAprove(address sender,uint64 clubid,uint ok)public returns(bool){
        uint index = addchipsindex[sender];
        //uint64 tableid = Players[sender].tbNum;
        //uint64 clubid = tableid/0x10000000;
        //用户不在审批列表中
        if(addchipslist[clubid].length <= index || addchipslist[clubid][index] != sender){
            return false;
       }

        //if(addchipslist[clubid].length > index && addchipslist[clubid][index] == sender){
        uint chips = addchips[clubid][index];
        uint64 tableid = addchipsTable[clubid][index];
        if (ok > 0){
            if( Players[sender].tbNum == tableid){
                if(Players[sender].status >= PlayerStatus.PLAYING ){
                    Players[sender].addChips += chips;
                } else if(Players[sender].status > PlayerStatus.NOTSEATED ) {
                    Players[sender].amount += chips;
                    eventAddChips(tableid,sender,Players[sender].amount,"");
                } else {//用户在等审批 状态置为加入桌子
                    Players[sender].amount += chips;
                    Players[sender].status = PlayerStatus.SEATED;
                    //用户玩过的table
                    playedtable(sender,tableid);
                    if (Tables[tableid].playerNum == 0){
                        applyInter(tableid);
                    }
                    Tables[tableid].playerNum++;
                    //Tables[tableid].players[Players[player_].seatNum] = player_;
                    eventJoin(tableid,sender,Players[sender].seatNum, Players[sender].amount,"");
                }
            }
            addChipStatusv2(sender,tableid,chips);
            //uint playedindex = playerindex[tableid][sender];
            //buyin[tableid][playedindex] += int(chips);
        } else {
            //用户在等待审批
            if( Players[sender].tbNum == tableid && Players[sender].status == PlayerStatus.NOTSEATED){
                Players[sender].status = PlayerStatus.NOTJION;
                Tables[tableid].players[Players[sender].seatNum] = address(0);
                eventJoin(tableid,sender,Players[sender].seatNum, Players[sender].amount,"Refuse to join");
            } else {
                eventAddChips(tableid,sender,Players[sender].amount,"refuse to addChips");
            }
        }
        //}

        uint len = addchipslist[clubid].length;
        //addchipslist[clubid][len-1]: 末尾用户
        addchipsindex[addchipslist[clubid][len-1]] = index;

        addchipslist[clubid][index] = addchipslist[clubid][len-1] ;
        addchips[clubid][index] = addchips[clubid][len-1];
        addchipsTable[clubid][index] = addchipsTable[clubid][len-1];
        addchipslist[clubid].length--;
        addchips[clubid].length--;
        addchipsTable[clubid].length--;
        return true;
    }
    function addChipStatusv2(address player_,uint64 tableid,uint chips) internal {
        if(chips == 0){
            return;
        }
        uint256 index = playerindex[tableid][player_];
        if(playedlist[tableid].length == 0 || playedlist[tableid][index] != player_){
            playerindex[tableid][player_] = playedlist[tableid].length;
            playedlist[tableid].push(player_);
            playerstatus[tableid].push(0);
            buyin[tableid].push(int(chips));
            //playedlist[tableid].length++;
        } else {
            buyin[tableid][index] = buyin[tableid][index]+int(chips);
        }
    }
    function subChipStatus(address player_,uint64 tableid,uint chips) internal {
        uint256 index = playerindex[tableid][player_];
        buyin[tableid][index] = buyin[tableid][index]-int(chips);
    }
    function addApprove(uint64 clubid,address player_,uint64 tableid,uint chips,uint ok) internal{
        if(Maxapprove[clubid] == 0){
            Maxapprove[clubid] = clubid*0x10000000+1;
        }else {
            Maxapprove[clubid] = Maxapprove[clubid]+1;
        }
        uint maxid = Maxapprove[clubid];
        approved[maxid].sender = msg.sender;
        approved[maxid].player = player_;
        approved[maxid].tableid = tableid;
        approved[maxid].chips = chips;
        approved[maxid].ok = ok>0;

    }

    //将一个tableid回收
    function poolPush(uint64 tableid) public returns(bool){
        if(Tables[tableid].tbNum == 0){
            return true;
        }
        //体验桌回收
        if (tableid == testTableid) {
            if(sysTables[0] == testTableid || sysTables[1] == testTableid){
                return true;
            } else {
                testTableid--;
                ServerAbi(addrs['inter']).release(tableid);
                ServerAbi(addrs['notary']).release(tableid);
                return true;
            }
        }
        //自由桌回收
        if (tableid == sysTableid) {
            for(uint i = 2;i<sysTables.length;i++){
                if(sysTables[i] == tableid){
                    return true;
                }
            }
            sysTableid--;
            ServerAbi(addrs['inter']).release(tableid);
            ServerAbi(addrs['notary']).release(tableid);
            return true;
        }
        //体验桌回收复用
        if(tableid > 0xf000000000000){
            Tables[tableid].tbNum = 0;
            Tables[tableid].poolIndex = testPool[Tables[tableid].smallBlind].length;
            testPool[Tables[tableid].smallBlind].push(tableid);
        //自由桌回收复用
        } else if(tableid > 0xe000000000000){
            Tables[tableid].tbNum = 0;
            Tables[tableid].poolIndex = sysPool[Tables[tableid].smallBlind].length;
            sysPool[Tables[tableid].smallBlind].push(tableid);
        //密码桌回收(不复用,只把tbNum置为0,并释放inter,notary)
        }

        //ServerAbi(addrs['inter']).release(tableid);
        ServerAbi(addrs['notary']).release(tableid);
        return true;
    }

    //取一个自由桌id,没有回收取新的
    function sysPop(uint smallBlind) public returns(uint64 tableid){
        uint64[] storage pool = sysPool[smallBlind];
        if(pool.length == 0){
            sysTableid++;
            return sysTableid;
        }
        tableid = pool[pool.length - 1];
        pool.length--;
    }
    //取一个体验桌id,没有回收取新的
    function testPop(uint smallBlind) public returns(uint64 tableid){
        uint64[] storage pool = testPool[smallBlind];
        if(pool.length == 0){
            testTableid++;
            return testTableid;
        }
        tableid = pool[pool.length - 1];
        pool.length--;
        return tableid;
    }
}
