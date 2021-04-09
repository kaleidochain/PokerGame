pragma solidity ^0.5.0;
//一些底层调用的代码
import './Event.sol';
import './TokenAbi.sol';
import './ServerAbi.sol';
import './Portal.sol';
import './clubabi.sol';

contract dezCreate  is Event{
    string public version ="1.0.1";
    using RLPEncode for *;
    function eventSelectInter(uint64 tableid,uint64 number)public{
        emit gameEvent(uint8(eventTy.SelectInter),tableid,msg.sender,Tables[tableid].currentHand,number.encodeUint());
    }
    function eventAddChips(uint64 tableid,address player,uint amount,string memory error)internal {
        bytes[] memory eventReturn = new bytes[](2);
        eventReturn[0] = amount.encodeUint();
        eventReturn[1] = error.encodeString();
        emit gameEvent(uint8(eventTy.AddChips),tableid,player,0,eventReturn.encodeList());
    }
    function eventChangeSeat(uint64  tableid,address player, uint64 pos, uint amount,string memory error) public {
        bytes[] memory eventReturn = new bytes[](3);
        eventReturn[0] = pos.encodeUint();
        eventReturn[1] = amount.encodeUint();
        eventReturn[2] = error.encodeString();
        emit gameEvent(uint8(eventTy.ChangeSeat),tableid,player,0,eventReturn.encodeList());
    }
    function eventCreateTable(address  creator,uint64 tableid,uint64 minimum,uint64 maximum,uint buyinMin,uint buyinMax,uint smallBlind,uint64 straddle,uint ante,string memory error) public {
        bytes[] memory eventReturn = new bytes[](8);
        eventReturn[0] = minimum.encodeUint();
        eventReturn[1] = maximum.encodeUint();
        eventReturn[2] = buyinMin.encodeUint();
        eventReturn[3] = buyinMax.encodeUint();
        eventReturn[4] = smallBlind.encodeUint();
        eventReturn[5] = straddle.encodeUint();
        eventReturn[6] = ante.encodeUint();
        eventReturn[7] = error.encodeString();
        emit gameEvent(uint8(eventTy.CreateTable),tableid,creator,0,eventReturn.encodeList());
    }
    function eventJoin(uint64 tableid,address sender,uint64 pos,uint amount,string memory error) public {
        bytes[] memory eventReturn = new bytes[](3);
        eventReturn[0] = pos.encodeUint();
        eventReturn[1] = amount.encodeUint();
        eventReturn[2] = error.encodeString();
        emit gameEvent(uint8(eventTy.Join),tableid,sender,0,eventReturn.encodeList());
        //emit gameEventest(uint8(eventTy.Join),tableid,sender,0,eventReturn);
    }
    function createTable(uint64 clubid,uint64 minimum_,uint64 maximum_,
    uint buyinMin_,uint buyinMax_,uint smallBlind_,uint64 straddle_,uint ante_,uint ty,uint endtime,bytes memory insuranceOdds)public returns(bool){
      //只有owner能创建积分桌子
        if(ty&1==0){
            require(clubabi(addrs['club']).clubOwner(clubid) == msg.sender,"");
        } else {
            require(clubabi(addrs['club']).isClubMember(clubid,msg.sender),"");
        }
        if(minimum_ < 2){
            eventCreateTable(msg.sender,0,minimum_,maximum_,buyinMin_,buyinMax_,smallBlind_,straddle_,ante_,"minimum < 2");
            return false;
        }
        if(maximum_ < minimum_){
            eventCreateTable(msg.sender,0,minimum_,maximum_,buyinMin_,buyinMax_,smallBlind_,straddle_,ante_,"maximum < minimum");
            return false;
        }
        if (maximum_ != 4 && maximum_ != 6 && maximum_ != 9){
            eventCreateTable(msg.sender,0,minimum_,maximum_,buyinMin_,buyinMax_,smallBlind_,straddle_,ante_,"maximum in(4,6,9)");
            return false;
        }
        if(smallBlind_ == 0){
            eventCreateTable(msg.sender,0,minimum_,maximum_,buyinMin_,buyinMax_,smallBlind_,straddle_,ante_,"smallBlind is zero");
            return false;
        }
        if (buyinMin_ <= 2 * smallBlind_){
            eventCreateTable(msg.sender,0,minimum_,maximum_,buyinMin_,buyinMax_,smallBlind_,straddle_,ante_,"buyinMin < 2*smallBlind");
            return false;
        }

        uint64 tableid = 0;

        if(clubPool[clubid] == 0){
            clubPool[clubid] = clubid*0x10000000+1;
        } else {
            clubPool[clubid]++;
        }

        tableid = clubPool[clubid];
        Tables[tableid].tbNum = tableid;
        Tables[tableid].insuranceOdds = insuranceOdds;
        Tables[tableid].currentHand = 1;
        Tables[tableid].readyNum = 0;
     

        Tables[tableid].minimum = minimum_;
        Tables[tableid].maximum = maximum_;
        Tables[tableid].buyinMin = buyinMin_;
        Tables[tableid].buyinMax = buyinMax_;
        Tables[tableid].smallBlind = smallBlind_;
        Tables[tableid].straddle = straddle_>0?1:0;
        Tables[tableid].ante = ante_;
        Tables[tableid].ty = ty;
        Tables[tableid].creator = msg.sender;
        //Tables[tableid].currentStatus = TableStatus.NOTSTARTED;
        Tables[tableid].preStarterPos = -1;
        Tables[tableid].creatime = now;
        //Tables[tableid].startBlock = block.number;
        // address[] memory players = new address[](maximum_);
        Tables[tableid].players.length = maximum_;
        Tables[tableid].ispoint = (ty&1==0);
        Tables[tableid].endtime = now+endtime;

        applyInter(tableid);
        if (Tables[tableid].playerNum != 0){
            Tables[tableid].playerNum = 0;
        }
        playedtable(msg.sender,tableid);
        eventCreateTable(msg.sender,tableid,minimum_,maximum_,buyinMin_,buyinMax_,smallBlind_,straddle_,ante_,"");
        return true;
    }
    function dismiss(uint64 tableid) public returns(bool){
        bytes4 funcid = bytes4(keccak256("dismiss(uint64)"));
        (bool succ,bytes memory ret) = addrs['notarize'].delegatecall(abi.encodeWithSelector(funcid,tableid));
        return (succ&&abi.decode(ret, (bool)));
    }
    function joinTable(uint64 tableid,uint needChips_,uint64 pos)public returns(bool){
        if(pos >= Tables[tableid].maximum || Tables[tableid].players[pos] != address(0x0)){
            eventJoin(tableid,msg.sender, 0, 0,"error pos");//"error pos"
            return false;
        }
        
        if (Players[msg.sender].status != PlayerStatus.NOTJION && Tables[Players[msg.sender].tbNum].endtime>0 && Tables[Players[msg.sender].tbNum].endtime<now){
            if(!dismiss(Players[msg.sender].tbNum)){
                eventJoin(tableid,msg.sender, 0, 0,"dismiss failed");//"player joined table"
                return false;
            }
        }
        if (Players[msg.sender].status != PlayerStatus.NOTJION){
            eventJoin(tableid,msg.sender, 0, 0,"player joined table");//"player joined table"
            return false;
        }
        Players[msg.sender].standby = 4;
        uint64 clubid = tableid/0x10000000;
        //是俱乐部的桌子
        if(clubid > 0 && clubid < 0x100000){
            require(clubabi(addrs['club']).isClubMember(clubid,msg.sender));
            if(Tables[tableid].endtime < now){
                eventJoin(tableid,msg.sender,pos,needChips_,"table timeout");
                return false;
            }
            if(Tables[tableid].ispoint){
                return joinClubTable(tableid,needChips_, pos);
            }
        }
        return joinChipsTable(tableid,needChips_, pos);
    }
    function joinClubTable(uint64 tableid,uint needChips_,uint64 pos)internal returns(bool){
        uint64 clubid = tableid/0x10000000;
        //已经申请
        uint index = playerindex[tableid][msg.sender];
        //之前加入过桌子
        if(playedlist[tableid].length > 0 && playedlist[tableid][index] == msg.sender){
            //筹码等于上次退出筹码
            if(int(needChips_) == buyin[tableid][index]+playerstatus[tableid][index]){
                joinChipsTable(tableid,needChips_, pos);
                //申请inter
                if (Tables[tableid].playerNum == 1 && Tables[tableid].players[pos] == msg.sender){
                    applyInter(tableid);
                }
                return true;
            //筹码大于上次的要审批
            } else if(int(needChips_) > buyin[tableid][index]+int(playerstatus[tableid][index])){
                Tables[tableid].players[pos] = msg.sender;
                Players[msg.sender].tbNum = tableid;
                Players[msg.sender].amount = uint(buyin[tableid][index]+playerstatus[tableid][index]);
                Players[msg.sender].seatNum = pos;
                Players[msg.sender].status = PlayerStatus.NOTSEATED;
                addChipslist(msg.sender,needChips_ - uint(buyin[tableid][index]+playerstatus[tableid][index]));
                return true;
            }
            eventJoin(tableid,msg.sender,Players[msg.sender].seatNum, clubid,"error chips");
            return false;
        }
     
        
        //joinPush(clubid,msg.sender);
        Tables[tableid].players[pos] = msg.sender;
        Players[msg.sender].tbNum = tableid;
        Players[msg.sender].amount = 0;
        Players[msg.sender].seatNum = pos;
        Players[msg.sender].status = PlayerStatus.NOTSEATED;
        addChipslist(msg.sender,needChips_);

        return true;
    }
    function joinChipsTable(uint64 tableid,uint needChips_,uint64 pos)internal returns(bool){
        //是否有效位置
        if(pos >= Tables[tableid].maximum || Tables[tableid].players[pos] != address(0x0)){
            eventJoin(tableid,msg.sender, 0, 0,"error pos");//"error pos"
            return false;
        }
        //筹码是否正确  && playerindex[tableid][msg.sender] < playedlist[tableid].length && playedlist[tableid][playerindex[tableid][msg.sender]]==msg.sender
        if(needChips_ < Tables[tableid].buyinMin && !Tables[tableid].ispoint){
            eventJoin(tableid,msg.sender, 0, 0,"Min Chips");//"error Chips"
            return false;
        }
        

        if(needChips_ > Tables[tableid].buyinMax &&!(playedlist[tableid].length > 0 && playedlist[tableid][playerindex[tableid][msg.sender]] == msg.sender)){
            eventJoin(tableid,msg.sender, 0, 0,"Max Chips");//"error Chips"
            return false;
        }
        //用户未加入桌子
        // if(Players[msg.sender].status != PlayerStatus.NOTJION){
        //     eventJoin(tableid,msg.sender, 0, 0,"player joined table");//"player joined table"
        //     return false;
        // }
        //从TablePool取出table
        if(Tables[tableid].tbNum == 0){
            //体验桌
            if(!(tableid > 0xf000000000000 && tableid<=testTableid ||
            tableid > 0xe000000000000 && tableid<=sysTableid)
            ){
                eventJoin(tableid,msg.sender, 0, 0,"table not exist");//"player joined table"
                return false;
            }

            poolPop(tableid);
            //return true;
            //申请inter
            assert(ServerAbi(addrs['inter']).select(tableid,1)>0);
        }
        //扣相应筹码
        if(tableid < 0xf000000000000 && !Tables[tableid].ispoint){
            TokenAbi token = TokenAbi(addrs["token"]);
            if(!token.transferToken(msg.sender, address(this), needChips_)){
                eventJoin(tableid,msg.sender, 0, 0,"insufficient token");//"insufficient token"
                return false;
            }
        }
        PlayerInfo memory info = PlayerInfo(0, 0, needChips_, 0,0,PlayerStatus.SEATED,0,0,false,0x0,0);
        Players[msg.sender] = info;

        Tables[tableid].players[pos] = msg.sender;
        Tables[tableid].playerNum++;
        Players[msg.sender].tbNum = tableid;
        Players[msg.sender].seatNum = pos;
        
        //Players[playerAddr].status = PlayerStatus.SEATED;
        //Players[playerAddr].playedhand = 0;
        
        //系统桌子满员则创建一个
        
        eventJoin(tableid,msg.sender, pos, needChips_,"");
        return true;
    }
   function changeSeat(uint64 pos,uint chips) public returns(bool){
        uint64 tableid = Players[msg.sender].tbNum;
        if (Tables[tableid].ispoint){
           chips = Players[msg.sender].amount;
        }
        if (Tables[tableid].players[pos] != address(0x0) || chips < Tables[tableid].buyinMin || chips > Tables[tableid].buyinMax){
            eventChangeSeat(tableid,msg.sender, 0, 0,"error pos/chips");
            return false;
        }
        if (Players[msg.sender].status >= PlayerStatus.READY 
        || Players[msg.sender].status == PlayerStatus.NOTSEATED){
            eventChangeSeat(tableid,msg.sender, 0, 0,"player started or notseated");
            return false;
        }
        if (chips > Players[msg.sender].amount && tableid < 0xf000000000000) {
           if (!TokenAbi(addrs["token"]).transferToken(msg.sender,address(this), chips-Players[msg.sender].amount)){
                eventChangeSeat(tableid,msg.sender, 0, 0,"insufficient token");
                return false;
           }
        }
        if (chips < Players[msg.sender].amount && tableid < 0xf000000000000) {
           if (!TokenAbi(addrs["token"]).transferToken(address(this),msg.sender, Players[msg.sender].amount-chips)){
                eventChangeSeat(tableid,msg.sender, 0, 0,"insufficient token");
                return false;
           }
        }
        Players[msg.sender].amount = chips;
        Tables[tableid].players[Players[msg.sender].seatNum] = address(0x0);
        Players[msg.sender].seatNum = pos;
        Players[msg.sender].playedhand = 0;
        Tables[tableid].players[pos] = msg.sender;
        eventChangeSeat(tableid,msg.sender, pos, chips,"");
        return true;
    }

    function joinAprove(address player_,uint ok)public returns(bool){
        uint64[] memory myclubs = clubabi(addrs['club']).myClubs(msg.sender);
        address clubowner;
        if(myclubs.length > 0 ){
            clubowner = clubabi(addrs['club']).clubOwner(myclubs[0]);
        } else {
            return false;
        }
       
        uint64 clubid = myclubs[0];
        //俱乐部拥有者才能审批通过
        require(clubowner == msg.sender || ok == 0 && player_ == msg.sender);
        //eventJoin(0,player_,Players[player_].seatNum, Players[player_].amount,"");
        //return true;
        return addChipsAprove(player_,clubid,ok);

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
        uint index = playerindex[tableid][player_];
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





    function playedtable(address player,uint64 tableid)internal {
        uint index = playedIndex[player][tableid];
        if(playedTable[player].length > 0 && playedTable[player][index] == tableid){
            return;
        }
        playedIndex[player][tableid] = playedTable[player].length;
        playedTable[player].push(tableid);
        return;
    }
    //加入审批列表
    function addChipslist(address sender,uint value) internal returns(bool){
        uint64 clubid = Players[sender].tbNum/0x10000000;
        uint index = addchipsindex[sender];
        if(addchipslist[clubid].length>index && addchipslist[clubid][index]==sender){
            return false;
        }
        addchipsindex[sender]=addchipslist[clubid].length;
        addchipslist[clubid].push(sender);
        addchips[clubid].push(value);
        addchipsTable[clubid].push(Players[sender].tbNum);
        emit newApprove(clubid,msg.sender);
        return true;
    }
    function applyInter(uint64 tableid) public returns(bool) {
        ServerAbi(addrs['inter']).select(tableid,1);
        eventSelectInter(tableid, 1);
        return true;
    }
    //回收列表中取出指定tableid
    function poolPop(uint64 tableid) public{
        Table storage tb = Tables[tableid];

        //体验桌
        if(tableid > 0xf000000000000){
            uint64[] storage pool = testPool[tb.smallBlind];
            assert(tb.tbNum == 0);
            assert(pool[tb.poolIndex] == tableid);

            //取出最后一个回收tableid,替换到当前位置
            uint64 tmptableid = pool[pool.length - 1];
            Tables[tmptableid].poolIndex = tb.poolIndex;
            pool[tb.poolIndex] = tmptableid;
            pool.length--;
            tb.tbNum = tableid;
        //自由桌
        } else if(tableid > 0xe000000000000){
            uint64[] storage pool = sysPool[tb.smallBlind];
            assert(tb.tbNum == 0);
            assert(pool[tb.poolIndex] == tableid);

            //取出最后一个回收tableid,替换到当前位置
            uint64 tmptableid = pool[pool.length - 1];
            Tables[tmptableid].poolIndex = tb.poolIndex;
            pool[tb.poolIndex] = tmptableid;
            pool.length--;
            tb.tbNum = tableid;
        //密码桌,直接tbNum恢复,外部会重新申请inter
        } else {
            tb.tbNum = tableid;
            return;
        }
    }
}
