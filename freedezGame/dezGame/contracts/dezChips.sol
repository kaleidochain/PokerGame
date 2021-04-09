pragma solidity ^0.5.0;
//一些底层调用的代码
import './Event.sol';
import './RLPEncode.sol';
import './TokenAbi.sol';
import './ServerAbi.sol';
contract dezChips  is Event{
    string public version ="1.0.1";
    function eventAddChips(uint64 tableid,address player,uint amount,string memory error)internal {
        bytes[] memory eventReturn = new bytes[](2);
        eventReturn[0] = amount.encodeUint();
        eventReturn[1] = error.encodeString();
        emit gameEvent(uint8(eventTy.AddChips),tableid,player,0,eventReturn.encodeList());
    }


    function addChips(uint value) public returns(bool) {
        if(Players[msg.sender].status == PlayerStatus.NOTJION) {
            eventAddChips(Players[msg.sender].tbNum,msg.sender,0,"not joined");
            return false;
        }
        //积分桌需要审批
        if(Tables[Players[msg.sender].tbNum].ispoint){

            if(Players[msg.sender].status == PlayerStatus.NOTJION){
                eventAddChips(Players[msg.sender].tbNum,msg.sender,0,"error point status");
                return false;
            }
            addChipslist(msg.sender,value);
            return false;
        }
        TokenAbi token = TokenAbi(addrs['token']);
        if(Players[msg.sender].tbNum < 0xf000000000000 && !token.transferToken(msg.sender, address(this), value)) {
            eventAddChips(Players[msg.sender].tbNum,msg.sender,0,"insufficient token");
            return false;
        }
        if(Players[msg.sender].status >= PlayerStatus.PLAYING){
            Players[msg.sender].addChips += value;
        } else {
            Players[msg.sender].amount += value;
            eventAddChips(Players[msg.sender].tbNum,msg.sender,Players[msg.sender].amount,"");
        }
        return true;
    }


        //加入审批列表
    function addChipslist(address sender,uint value) public returns(bool){
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
    function standup(bool standby) public returns(bool){
        if(Players[msg.sender].status>=PlayerStatus.PLAYING){
            if(standby && Players[msg.sender].leaveNext == 0){  //没有结算离桌才能暂离
                Players[msg.sender].standby = 4;
            } else if(!standby){//随时可以取消暂离
                Players[msg.sender].standby = 0;
            } else {
                return false;
            }
            emit gameEvent(uint8(eventTy.standup), Players[msg.sender].tbNum,msg.sender,Tables[Players[msg.sender].tbNum].currentHand,standby.encodeBool());
            return true;
        }
        return false;
    }
}
