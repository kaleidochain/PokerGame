pragma solidity ^0.5.0;
//一些底层调用的代码
import './Event.sol';
import './TokenAbi.sol';
import './ServerAbi.sol';
import './clubabi.sol';
import './Portal.sol';
import './RLP.sol';
contract dezFlowControl  is Event{
    using RLP for RLP.RLPItem;
    using RLP for RLP.Iterator;
    using RLP for bytes;
    string public version ="1.0.1";
    event noticy(string data);
    function eventInsure(uint64 tableid,address sender,uint[] memory params,string memory err)internal{
        bytes[] memory eventReturn = new bytes[](6);
        eventReturn[0] = params[1].encodeUint(); //order
        eventReturn[1] = params[2].encodeUint(); //out1
        eventReturn[2] = params[3].encodeUint(); //out2
        eventReturn[3] = params[4].encodeUint(); //amount1
        eventReturn[4] = params[5].encodeUint(); //amount2
        eventReturn[5] = err.encodeString();
        emit gameEvent(uint8(eventTy.insure), tableid, sender, uint64(params[0]), eventReturn.encodeList());
    }
    function eventnotaryDiscard(uint64 tableid,address player,uint64 pos)public {
        bytes[] memory eventReturn = new bytes[](1);
        eventReturn[0] = pos.encodeUint();
        emit gameEvent(uint8(eventTy.notaryDiscard),tableid,player,0,eventReturn.encodeList());
    }
    function eventDismissTable(uint64 tableid,uint64 hand) public {
        string memory err = "";
        emit gameEvent(uint8(eventTy.DismissTable),tableid,msg.sender,hand,err.encodeString());
    }

    //公证结算
    function submitNotary(uint64 tableid,bytes memory data) public returns(bool) {
        if(!verifyInter(tableid,msg.sender)){
            return false;
        }
        return settle(data);
    }
    event noticyEX(address indexed a,bytes b,string c);
    //调用结算
    function settle(bytes memory data)public returns(bool){
        bytes4 funcid = bytes4(keccak256("settle(uint8,bytes,bytes)"));
        (bool succ,bytes memory ret) = addrs['settle'].delegatecall(abi.encodeWithSelector(funcid,1,hex"",data));
        return (succ&&abi.decode(ret, (bool)));
    }
    //公证买保险
    function notaryInsure(address player,bytes memory data) public returns(bool){
        if(!verifyInter(Players[player].tbNum,msg.sender)){
            return false;
        }
        return Insure( player,  data);
    }
    function insure(bytes memory data) public returns(bool){
        return Insure( msg.sender,  data);
    }
    function Insure(address player,bytes memory data) public returns(bool){
        uint64 tableid = Players[player].tbNum;
        uint[] memory params = new uint[](6);
        RLP.RLPItem[] memory items = data.toRLPItem().toList();
        params[0] = items[0].toUint(); //hand
        params[1] = items[1].toUint(); //order
        params[2] = items[2].toUint(); //out1
        params[3] = items[3].toUint(); //out2
        params[4] = items[4].toUint(); //amount1
        params[5] = items[5].toUint(); //amount2
        if(params[5]>0){
            require(params[3]>0);
        }
        if(params[4]>0){
            require(params[2]>0);
        }
        if(Tables[tableid].currentHand != params[0] || Tables[tableid].currentStatus != TableStatus.STARTED){
            eventInsure(tableid, player,params, "error hand");
            return false;
        }
        RLP.RLPItem[] memory rate = Tables[tableid].insuranceOdds.toRLPItem().toList();
        if(params[2]>rate.length){
            params[2]=rate.length;
        }
        if(params[3]>rate.length){
            params[3]=rate.length;
        }
        //token桌要预扣庄家token
        if(!Tables[tableid].ispoint){
            //RLP.RLPItem[] memory rate = Tables[tableid].insuranceOdds.toRLPItem().toList();
            address clubowner = clubabi(addrs['club']).clubOwner(tableid/0x10000000);
            uint value = rate[params[2]-1].toUint()*params[4]/100+rate[params[3]-1].toUint()*params[5]/100;

            if(value>0 && !TokenAbi(addrs['token']).transferToken(clubowner, address(this), value)){
                eventInsure(tableid, player,params, "club owner insufic token");
                return false;
            }
            addChipStatus(address(0x1),tableid,value);
        }
        uint index = tableid*10000+params[0]*10+params[1];
        insurance[index].pos = Players[player].seatNum;
        insurance[index].out.push(params[2]);
        insurance[index].out.push(params[3]);
        insurance[index].amount.push(params[4]);
        insurance[index].amount.push(params[5]);

        //todo:工作买保险不发事件
        //if(msg.sender==player){
        //    eventInsure(tableid, player,params, "");
        //}
        eventInsure(tableid, player,params, "");
        return true;
    }

    //公证用户超时
    function playerTimeout(address player)public returns(bool){
        if(!verifyInter(Players[player].tbNum,msg.sender)){
            return false;
        }
        uint64 tableid = Players[player].tbNum;
        Players[player].status = PlayerStatus.DISCARD;
        Players[player].standby = 4;
        // if(Players[player].leaveNext>0){
        //     Players[player].leaveNext=0;
        // }

        eventnotaryDiscard(tableid,player,Players[player].seatNum);
        return true;
    }
    //公证
    function rmtinsTimeout(address player,bytes memory rmtins)public returns(bool){
        if(!verifyInter(Players[player].tbNum,msg.sender)){
            return false;
        }
        uint64 tableid = Players[player].tbNum;
        Players[player].showdownOffline = true;
        Players[player].standby = 4;
        // if(Players[player].leaveNext>0){
        //     Players[player].leaveNext=0;
        // }
        emit gameEvent(uint8(eventTy.notaryRmtins),tableid,player,Tables[tableid].currentHand,rmtins);
        return true;
    }
    //公证解散桌子 所有用户坐下
    function notaryDismiss(uint64 tableid,uint64 hand)public returns(bool){
        if(!verifyInter(tableid,msg.sender)){
            return false;
        }
        //return dismiss(tableid);
        address[] storage tbplayers = Tables[tableid].players;
        for(uint i = 0; i < tbplayers.length; i++) {
            //Players[tbplayers[i]].status > PlayerStatus.PLAYING
            if(Players[tbplayers[i]].status > PlayerStatus.SEATED){
                //离开桌子
                if(Players[tbplayers[i]].leaveNext > 0){
                    leaveRoom(tbplayers[i]);
                    continue;
                }
                //增加筹码
                if(Players[tbplayers[i]].addChips > 0){
                    Players[tbplayers[i]].amount += Players[tbplayers[i]].addChips;
                    //eventAddChips(tableid,tbplayers[i],Players[tbplayers[i]].amount,"");
                    Players[tbplayers[i]].addChips = 0;
                }
                //提取筹码
                if(Players[tbplayers[i]].subChips > 0){
                    if(Players[tbplayers[i]].amount <= Players[tbplayers[i]].subChips ||
                        Players[tbplayers[i]].amount-Players[tbplayers[i]].subChips < Tables[tableid].minimum){
                        //eventWithdrawChips(Players[tbplayers[i]].tbNum,tbplayers[i],0,"insufficient amount");
                    } else if(tableid < 0xf000000000000 && !Tables[tableid].ispoint){
                        //todo:require
                        TokenAbi(addrs['token']).transferToken(address(this), tbplayers[i], Players[tbplayers[i]].subChips);
                        //eventWithdrawChips(Players[tbplayers[i]].tbNum,tbplayers[i],Players[tbplayers[i]].subChips,"");
                    }
                    Players[tbplayers[i]].subChips = 0;
                }
                Players[tbplayers[i]].status = PlayerStatus.SEATED;
                Players[tbplayers[i]].playedhand = Tables[tableid].currentHand;
            }
        }

        //Tables[tableid].readyNum = 0;
        if (Tables[tableid].playerNum == 0){
            poolPush(tableid);
        }
        Tables[tableid].currentStatus = TableStatus.NOTSTARTED;
        eventDismissTable(tableid,Tables[tableid].currentHand);
        //ServerAbi(addrs['inter']).release(tableid);
        Tables[tableid].currentHand++;
        Tables[tableid].preStarterPos = -1;
        return true;
    }
    //解散桌子,所有用户离开
    function dismissTable(uint64 tableid) public returns(bool){
        require(Tables[tableid].tbNum > 0,"tableid err");
        //require(msg.sender == owner || Players[msg.sender].tbNum == tableid && Tables[tableid].currentStatus == TableStatus.STARTED,"");
        //sender 为owner 或 用户 或 inter
        if(msg.sender != owner && !verifyInter(tableid,msg.sender)){
            return false;
        }
        //require(Tables[tableid].startBlock+blockout < block.number,"");
        return dismiss(tableid);
    }
    function dismiss(uint64 tableid) public returns(bool){
        address tmp;
        uint i;
        for(i = 0; i < Tables[tableid].players.length; i++) {
            tmp = Tables[tableid].players[i];
            if(tmp == address(0x0)){
                continue;
            }
            if(tableid < 0xf000000000000 && !Tables[tableid].ispoint){
                require(TokenAbi(addrs['token']).transferToken(address(this), tmp, Players[tmp].amount+Players[tmp].addChips));
            } else if(Tables[tableid].ispoint){
                //require(addChipsAprove(tmp,0));
            }
            delete Tables[tableid].players[i];
            delete Players[tmp];
            //return true;
        }
        //ServerAbi(addrs['inter']).release(tableid);
        poolPush(tableid);
        Tables[tableid].readyNum = 0;
        Tables[tableid].playerNum = 0;
        Tables[tableid].currentStatus = TableStatus.NOTSTARTED;
        eventDismissTable(tableid,Tables[tableid].currentHand);
        Tables[tableid].currentHand++;
        return true;
    }

    //校验公证者的合法性
    function verifyInter(uint64 tableid,address inter) internal returns(bool){
        address[] memory inters = ServerAbi(addrs["inter"]).getSelected(address(this), tableid);
        for(uint i = 0; i < inters.length; i++) {
            // 判断提交者是否在公证者列表中
            if(inter == inters[i]) {
                return true;
            }
        }
        return false;
    }
    //记录用户筹码
    function addChipStatus(address player_,uint64 tableid,uint chips) internal {
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
            Players[player_].amount += uint(buyin[tableid][index]+playerstatus[tableid][index]);
            buyin[tableid][index] = buyin[tableid][index]+int(chips);
        }
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
        // else {
        //     uint64 _clubid = tableid/0x10000000;
        //     if(tableid == clubPool[_clubid].maxid){
        //         clubPool[_clubid].maxid--;
        //     } else {
        //         clubPool[_clubid].tablePool.push(tableid);
        //         Tables[tableid].tbNum = 0;
        //     }
        // }
        //ServerAbi(addrs['inter']).release(tableid);
        ServerAbi(addrs['notary']).release(tableid);
        return true;
    }
    function leaveRoom(address addr)public returns(bool){
        bytes4 funcid = bytes4(keccak256("leaveRoom(address)"));
        (bool succ,bytes memory ret) = addrs['common'].delegatecall(abi.encodeWithSelector(funcid,addr));
        return (succ&&abi.decode(ret, (bool)));
    }
}
