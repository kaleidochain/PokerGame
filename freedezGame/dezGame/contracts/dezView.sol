pragma solidity ^0.5.0;

import './Dao.sol';
import './RLPEncode.sol';
import './Portal.sol';
import './clubabi.sol';
contract dezView  is Dao{
    using RLPEncode for *;
    function getTableInfo(uint64 tableid) public view returns(uint64 a, uint64 b , uint64 c ,address d  ,uint64 e ,uint64 f ,uint64 h, uint64 i ,  uint j ,uint k ,uint l ,uint64 m ,uint n )  {
        b = Tables[tableid].currentHand;
        c = uint64(Tables[tableid].currentStatus);
        d = Tables[tableid].startPlayer;
        e = Tables[tableid].smallbindpos;
        f = Tables[tableid].delerpos;
        h = Tables[tableid].minimum;
        i = Tables[tableid].maximum;
        j = Tables[tableid].buyinMin;
        k = Tables[tableid].buyinMax;
        l = Tables[tableid].smallBlind;
        m = Tables[tableid].straddle;
        n = Tables[tableid].ante;
        return (tableid,b,c,d,e,f,h,i,j,k,l,m,n);
    }
    function getTableInfoEx(uint64 tableid) public view returns(bytes memory)  {
        bytes[] memory Return = new bytes[](20);
        Return[0] = tableid.encodeUint();
        Return[1] = Tables[tableid].creator.encodeAddress();
        Return[2] = Tables[tableid].currentHand.encodeUint();
        Return[3] = uint64(Tables[tableid].currentStatus).encodeUint();
        Return[4] = Tables[tableid].startPlayer.encodeAddress();
        Return[5] = Tables[tableid].smallbindpos.encodeUint();
        Return[6] = Tables[tableid].delerpos.encodeUint();
        Return[7] = Tables[tableid].minimum.encodeUint();
        Return[8] = Tables[tableid].maximum.encodeUint();
        Return[9] = Tables[tableid].buyinMin.encodeUint();
        Return[10] = Tables[tableid].buyinMax.encodeUint();
        Return[11] = Tables[tableid].smallBlind.encodeUint();
        Return[12] = Tables[tableid].straddle.encodeUint();
        Return[13] = Tables[tableid].ante.encodeUint();
        Return[14] = Tables[tableid].playerNum.encodeUint();
        Return[15] = Tables[tableid].ty.encodeUint();
        Return[16] = (Tables[tableid].endtime-Tables[tableid].creatime).encodeUint();

        uint endtime = 0;
        if (Tables[tableid].endtime > now){
            endtime = Tables[tableid].endtime - now;
        }
        Return[17] = endtime.encodeUint();
        Return[18] = Tables[tableid].endtime.encodeUint();
        if(Tables[tableid].insuranceOdds.length == 0){
            Return[19] = hex"d48080808080808080808080808080808080808080";
        } else {
            Return[19] = Tables[tableid].insuranceOdds;
        }
        
        return Return.encodeList();
    }
    function getTablePlayers(uint64 tableid) public view returns(address[] memory players) {
        uint64 playernum = Tables[tableid].playerNum;
        if (playernum==0) {
            return players;
        }
        players = new address[](playernum);
        uint index = 0;
        for(uint i=0; i < Tables[tableid].maximum ; i++) {
            if (Tables[tableid].players[i] != address(0x0) && 
            Players[Tables[tableid].players[i]].status >= PlayerStatus.SEATED){
                players[index] = Tables[tableid].players[i];
                index++;
            }
        }
        return players;
    }
    function getPlayerInfos(uint64 tableid) public view returns(bytes memory){
        bytes[] memory plinfos = new bytes[](Tables[tableid].players.length);
        bytes[] memory plinfo = new bytes[](6);
        uint i;
        address tmpAddr;
        uint64 playerStatus;
        //uint hand = uint(Tables[tableid].currentHand);
        for(i = 0;i < plinfos.length; i++){
            tmpAddr = Tables[tableid].players[i];
            if(tmpAddr == address(0) ||
                Players[tmpAddr].status < PlayerStatus.SEATED){
                continue;
            }
            playerStatus = getPlayerStatus(tmpAddr);

            plinfo[0] = RLPEncode.encodeAddress(tmpAddr);
            plinfo[1] = RLPEncode.encodeUint(uint(tableid));
            plinfo[2] = RLPEncode.encodeUint(i);
            plinfo[3] = RLPEncode.encodeUint(Players[tmpAddr].amount);
            plinfo[4] = RLPEncode.encodeUint(playerStatus);
            plinfo[5] = RLPEncode.encodeUint(Players[tmpAddr].playedhand);
            plinfos[i] = RLPEncode.encodeList(plinfo);
        }
        return RLPEncode.encodeList(plinfos);
    }

    function getPlayerInfo(address playerAddr) public view returns (address,uint64,uint64,uint,uint64,uint64) {
        uint64 playerStatus = getPlayerStatus(playerAddr);
        return (playerAddr, Players[playerAddr].tbNum, Players[playerAddr].seatNum, Players[playerAddr].amount, playerStatus, Players[playerAddr].playedhand);
    }

    function getPlayerStatus(address playerAddr) internal view returns(uint64 playerstatus){
        playerstatus = uint64(Players[playerAddr].status);
        if(Players[playerAddr].status >= PlayerStatus.PLAYING && Players[playerAddr].standby != 0){
            playerstatus = uint64(PlayerStatus.STANDBY);
        }
        
        if (Players[playerAddr].leaveNext>0){
            playerstatus = uint64(PlayerStatus.LEAVENEXT);
        }
        if(Players[playerAddr].status >= PlayerStatus.PLAYING && Players[playerAddr].showdownOffline){
            playerstatus = uint64(PlayerStatus.SHOWDOWNOFFLINE);
        }
        if(Players[playerAddr].standby != 0 && Players[playerAddr].status == PlayerStatus.DISCARD){
            playerstatus = uint64(PlayerStatus.OFFLINE);
        }
        return playerstatus;
    }
    function getTableSeatInfos(uint64 tableid) public view returns(bytes memory){
        bytes[] memory plinfos = new bytes[](Tables[tableid].players.length);
        bytes[] memory plinfo = new bytes[](6);
        uint i;
        address tmpAddr;
        uint playerStatus;
            
        //bytes memory emptyPlinfo =  RLPEncode.encodeList(plinfo);
        //uint hand = uint(Tables[tableid].currentHand);
        for(i = 0;i< plinfos.length; i++){
            tmpAddr = Tables[tableid].players[i];
            if(tmpAddr == address(0)){
                plinfo[0] = RLPEncode.encodeAddress(address(0));
                plinfo[1] = RLPEncode.encodeUint(uint(tableid));
                plinfo[2] = RLPEncode.encodeUint(i);
                plinfo[3] = RLPEncode.encodeUint(0);
                plinfo[4] = RLPEncode.encodeUint(0);
                plinfo[5] = RLPEncode.encodeUint(0);
                plinfos[i] = RLPEncode.encodeList(plinfo);
                continue;
            }
            playerStatus = getPlayerStatus(tmpAddr);
            plinfo[0] = RLPEncode.encodeAddress(tmpAddr);
            plinfo[1] = RLPEncode.encodeUint(uint(tableid));
            plinfo[2] = RLPEncode.encodeUint(i);
            plinfo[3] = RLPEncode.encodeUint(Players[tmpAddr].amount);
            plinfo[4] = RLPEncode.encodeUint(playerStatus);
            plinfo[5] = RLPEncode.encodeUint(Players[tmpAddr].playedhand);
            plinfos[i] = RLPEncode.encodeList(plinfo);
        }
        return RLPEncode.encodeList(plinfos);
    }

    function getinsurance(uint64 tableid) public returns(uint[] memory data){
        uint index4 = tableid*10000+Tables[tableid].currentHand*10+4;
        uint index5 = tableid*10000+Tables[tableid].currentHand*10+5;
        data = new uint[](11);
        data[0]=Tables[tableid].currentHand;
        data[1]=insurance[index4].pos;
        if(insurance[index4].out.length==2){
            data[2]=insurance[index4].out[0];
            data[3]=insurance[index4].out[1];
        }
        if(insurance[index4].amount.length==2){
            data[4]=insurance[index4].amount[0];
            data[5]=insurance[index4].amount[1];
        }
        data[6]=insurance[index5].pos;
       if(insurance[index5].out.length==2){
            data[7]=insurance[index5].out[0];
            data[8]=insurance[index5].out[1];
        }
        if(insurance[index5].amount.length==2){
            data[9]=insurance[index5].amount[0];
            data[10]=insurance[index5].amount[1];
        }
        return data;
    }
    uint64[] tempTables;
    function PlayedTables(address addr,uint page)public returns(uint, bytes memory,uint){
        uint64[] memory myclubs = clubabi(addrs['club']).myClubs(addr);
        address clubowner;
        if(myclubs.length > 0 ){
            clubowner = clubabi(addrs['club']).clubOwner(myclubs[0]);
        }
        uint len = playedTable[addr].length;
        uint start = (page-1)*10;
        uint i;
        bytes[] memory Return = new bytes[](10);
        for(i = start;i < len && i < start+10;i++ ){
            Return[i] = getTableInfoEx(playedTable[addr][i]);
        }
        return (page,Return.encodeList(),i-start);
    }
    function Approvedlist(uint64 clubid) public  view returns(uint num,bytes memory ret){
        uint maxid = Maxapprove[clubid];
        if (maxid == 0){
            return (num,ret);
        }
        num = maxid-clubid*0x10000000;
        bytes[] memory Return = new bytes[](num);
        bytes[] memory item = new bytes[](5);
        uint i;
        for(i = maxid;i>clubid*0x10000000;i--){
            item[0] = approved[i].sender.encodeAddress();
            item[1] = approved[i].player.encodeAddress();
            item[2] = approved[i].tableid.encodeUint();
            item[3] = approved[i].chips.encodeUint();
            item[4] = approved[i].ok.encodeBool();
            Return[maxid-i] = item.encodeList();
        }
        return (num,Return.encodeList());
    }
    function getMaxTableid(uint64 clubid) public view returns(uint64){
        if(clubPool[clubid]>0){
            return clubPool[clubid];
        }
        return clubid*0x10000000;
    }
}
