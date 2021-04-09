pragma solidity ^0.5.0;

import './Event.sol';
contract dezStart  is Event{
    using RLPEncode for *;
    //event noticyEX(address indexed a,bytes b,string c);
    function eventStart(uint64 tableid, address player, uint64 pos, uint64 hand,string memory error)internal{
        bytes[] memory eventReturn = new bytes[](2);
        eventReturn[0] = pos.encodeUint();
        eventReturn[1] = error.encodeString();
        emit gameEvent(uint8(eventTy.Start),tableid,player,hand,eventReturn.encodeList());
    }

    function start(uint64 tableid, uint64 hand) public returns(bool){
        PlayerInfo memory pInfo = Players[msg.sender];
        hand = Tables[tableid].currentHand;
        //
        if(pInfo.status >= PlayerStatus.PLAYING && pInfo.standby !=0){
            Players[msg.sender].standby=0;
            eventStart(tableid, msg.sender, pInfo.seatNum, hand,"");
            return true;
        }

        if(tableid != pInfo.tbNum || pInfo.status != PlayerStatus.SEATED){
            eventStart(tableid, msg.sender, pInfo.seatNum, hand,"error player status");
            return false;
        }
        if(Tables[tableid].endtime>0 && Tables[tableid].endtime<now){
            eventStart(tableid,msg.sender,pInfo.seatNum,hand,"table timeout");
        }
        if(pInfo.amount < Tables[tableid].smallBlind*5+Tables[tableid].ante){
            eventStart(tableid, msg.sender, pInfo.seatNum, hand,"insufficient chips");
            return false;
        }
        if (Players[msg.sender].standby != 0){
            Players[msg.sender].standby=0;
        }
        if (Tables[tableid].currentStatus != TableStatus.NOTSTARTED ){
            Players[msg.sender].status = PlayerStatus.PREREADY;
            return true;
        }
        //预准备
        if(Tables[tableid].preStarterPos >= 0 && pInfo.playedhand != Tables[tableid].currentHand-1){
            Players[msg.sender].status = PlayerStatus.PREREADY;
            eventStart(tableid, msg.sender, pInfo.seatNum, hand, "");
            tryStartGame(tableid,hand);
            return true;
        }

        Tables[tableid].readyNum++;
        Players[msg.sender].status = PlayerStatus.READY;
        Tables[tableid].startBlock = block.number;

        eventStart(tableid, msg.sender, pInfo.seatNum, hand, "");
        tryStartGame(tableid,hand);
        if(Tables[tableid].currentStatus == TableStatus.STARTED){
            creatSysTable();
        }
        return true;
    }


    function tryStartGame(uint64 tableid,uint64 hand) public returns(bool){
        bytes4 funcid = bytes4(keccak256("tryStartGame(uint64,uint64)"));
        (bool succ,bytes memory ret) = addrs['common'].delegatecall(abi.encodeWithSelector(funcid,tableid,hand));
        return (succ&&abi.decode(ret, (bool)));
    }
    function creatSysTable() public returns(bool){
        bytes4 funcid = bytes4(keccak256("creatSysTable()"));
        (bool succ,bytes memory ret) = addrs['init'].delegatecall(abi.encodeWithSelector(funcid));
        return (succ&&abi.decode(ret, (bool)));
    }
    function standup() public returns(bool){
        if(Players[msg.sender].status>=PlayerStatus.PLAYING){
            Players[msg.sender].standby=3;
            if(Players[msg.sender].leaveNext!=0){
                Players[msg.sender].leaveNext=0;
            }
            emit gameEvent(uint8(eventTy.standup),Players[msg.sender].tbNum,msg.sender,Tables[Players[msg.sender].tbNum].currentHand,'');
            return true;
        }
        return false;
    }
}