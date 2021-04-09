pragma solidity ^0.5.1;
import './LibAuthority.sol';
import './TokenAbi.sol';
import './Portal.sol';
contract club is LibAuthority{
    string public version ="1.0.1";
    event NewClub(address indexed sender,uint64 clubid,string message);
    event JoinClub(address indexed sender,uint64 indexed clubid,string message);
    event JoinClubApproved(address indexed player,uint64 indexed clubid,string message);
    address public portalAddress;           // portal合约地址
    address public owner;
    uint public needChips=0;
    mapping(address => palyerInfo) myclubs; //用户俱乐部列表

    struct palyerInfo{
        uint64[] clublist;
        mapping(uint64=>uint) c_idx;  //clubid=>clublist.index
    }
    mapping(uint64 => clubinfo) public clubs; //俱乐部详情
    struct clubinfo{
        uint64  clubid;
        address owner;
        string name;
        bool closed;
    }

    mapping(uint64 => memberInfo) clubPlayers;
    struct memberInfo{
        mapping(address => uint) Applyed;
        address[] Applylist;
        uint64[] Applytimes;
        address[] memberList;
        mapping(address=>uint)m_idx; //成员序列
    }

   
   constructor() payable public {
        owner = msg.sender;
        setMaxGasPrice(1e10);
        setGasLimit(1e7);
        addWhite(msg.sender);
    }
    // 检查必须是合约的所有者
    modifier onlyOwner {
        assert(msg.sender == owner);
        _;
    }
    function setNeedChips(uint chips)public onlyOwner returns(bool){
        needChips = chips;
        return true;
    }
    function setportalAddress(address addr) public onlyOwner returns(bool){
        portalAddress = addr;
        return true;
    }
    function clubOwner(uint64 _clubid) public view returns(address){
        return clubs[_clubid].owner;
    }
    //
    function isClubMember(uint64 _clubid,address _player) public view returns(bool){
        //club被关闭
        if(clubs[_clubid].closed){
            return false;
        }
        if(clubPlayers[_clubid].m_idx[_player]>0){
            return true;
        }
        if(clubPlayers[_clubid].memberList[0] == _player){
            return true;
        }
        return false;
    }
    function myClubs(address _player) public view returns(uint64[] memory){
        return myclubs[_player].clublist;
    }
    function newClub(string memory _name)public returns(bool){
        //拥有筹码限制
        require(TokenAbi(Portal(portalAddress).gameToken()).balanceOf(msg.sender) >= needChips);
        //require(msg.value >= 100 ether,"");
        uint64 _clubid = uint64(block.number)%1000000;
        require(_clubid>0 && clubs[_clubid].clubid == 0,"");
        if (_clubid==0 || clubs[_clubid].clubid != 0){
            emit NewClub(msg.sender,_clubid,"error clubid");
            return false;
        }
        //已经拥有一个俱乐部
        if(myclubs[msg.sender].clublist.length > 0 && !clubs[myclubs[msg.sender].clublist[0]].closed){
            if (clubs[myclubs[msg.sender].clublist[0]].owner == msg.sender){
                emit NewClub(msg.sender,_clubid,"existed club");
                return false;
            }
        }
        myclubs[msg.sender].clublist.push(_clubid);
        myclubs[msg.sender].c_idx[_clubid] = 0;
        //把创建的俱乐部放到第一个位置
        uint length = myclubs[msg.sender].clublist.length;
        if(length >= 2){
            uint64 first_cid = myclubs[msg.sender].clublist[0];
            myclubs[msg.sender].clublist[length-1] = first_cid;
            myclubs[msg.sender].clublist[0] = _clubid;
            myclubs[msg.sender].c_idx[first_cid] = length-1;
        }
        clubs[_clubid].owner = msg.sender;
        clubs[_clubid].clubid = _clubid;
        clubs[_clubid].name = _name;
        //memberpush(_clubid,msg.sender);
        if(clubPlayers[_clubid].memberList.length > 0){
            clubPlayers[_clubid].memberList[0] = msg.sender;
        } else {
            clubPlayers[_clubid].memberList.push(msg.sender);
        }
        emit NewClub(msg.sender,_clubid,"");

        return true;
    }
    //群主关闭俱乐部
    function closeClub(uint64 _clubid)public returns(bool){
        require(msg.sender == clubs[_clubid].owner && clubs[_clubid].closed == false);
        //clubs[_clubid].clubid = 0; //置为0可以复用clubid
        clubs[_clubid].closed = true;
        playerClubPop(_clubid,msg.sender);
        return true;
    }
    function joinClub(uint64 _clubid)public returns(bool){
         //已经申请过了
        uint applyidx = clubPlayers[_clubid].Applyed[msg.sender];
        if(clubPlayers[_clubid].Applylist.length>0 && clubPlayers[_clubid].Applylist[applyidx] == msg.sender){
            emit JoinClub(msg.sender,_clubid,"player applied");
            return false;
        }
        //已是会员
        if(clubPlayers[_clubid].m_idx[msg.sender] > 0){
            emit JoinClub(msg.sender,_clubid,"member exist");
            return false;
        }
        clubPlayers[_clubid].Applylist.push(msg.sender);
        clubPlayers[_clubid].Applytimes.push(uint64(now));
        clubPlayers[_clubid].Applyed[msg.sender] = clubPlayers[_clubid].Applylist.length-1;
        emit JoinClub(msg.sender,_clubid,"");
        return true;
    }
    function allAppled(uint64 _clubid)public view returns(address[] memory){
        // a = clubPlayers[_clubid].Applylist;
        // b = clubPlayers[_clubid].Applytimes;
        // return;
        return (clubPlayers[_clubid].Applylist);
    }
    function alltimes(uint64 _clubid)public view returns(uint64[] memory){
        // a = clubPlayers[_clubid].Applylist;
        // b = clubPlayers[_clubid].Applytimes;
        // return;
        return (clubPlayers[_clubid].Applytimes);
    }
     //审批用户加入申请
    function approve(uint64 _clubid,address _player,uint _ret) public returns(bool){
        require(msg.sender == clubs[_clubid].owner || _player == msg.sender && _ret == 0);
        uint applyidx = clubPlayers[_clubid].Applyed[_player];
        uint length = clubPlayers[_clubid].Applylist.length;
        if(_ret == 1){ //必须是申请的用户才能加入俱乐部
            if(!(length>0 && clubPlayers[_clubid].Applylist[applyidx] == _player)){
                emit JoinClubApproved( _player, _clubid,"error player");
                return false;
            }
        }
        //最后那个人弄到当前位置
        if(length>0 && clubPlayers[_clubid].Applylist[applyidx] == _player){
            address last_player = clubPlayers[_clubid].Applylist[length - 1];
            uint64 last_time = clubPlayers[_clubid].Applytimes[length - 1];
            clubPlayers[_clubid].Applylist[applyidx] = last_player;
            clubPlayers[_clubid].Applytimes[applyidx] = last_time;
            clubPlayers[_clubid].Applytimes.length--;
            clubPlayers[_clubid].Applylist.length--;
            clubPlayers[_clubid].Applyed[_player] = 0;
            clubPlayers[_clubid].Applyed[last_player] = applyidx;
        } 

        if(_ret > 0){
            memberpush(_clubid,_player);
            emit JoinClubApproved( _player, _clubid,"");
        } else {
            memberpop(_clubid,_player);
            emit JoinClubApproved( _player, _clubid,"");
        }

        return true;
    }
    function memberlist(uint64 _clubid)public view returns(address[] memory){
        return clubPlayers[_clubid].memberList;
    }
    function memberpush(uint64 _clubid,address m) internal returns(bool){
        uint idx = clubPlayers[_clubid].m_idx[m];
        if( clubPlayers[_clubid].memberList[idx] == m){
            return true;
        }
        clubPlayers[_clubid].m_idx[m] = clubPlayers[_clubid].memberList.length;
        clubPlayers[_clubid].memberList.push(m);
        playerClubPush(_clubid,m);
        return true;
    }
    //从俱乐部删除用户
    function memberpop(uint64 _clubid,address m) internal returns(bool){
        if(clubPlayers[_clubid].m_idx[m] == 0){
            return true;
        }
        address[] memory memberList = clubPlayers[_clubid].memberList;
        mapping(address=>uint) storage m_idx =clubPlayers[_clubid].m_idx;
        clubPlayers[_clubid].memberList[m_idx[m]] = clubPlayers[_clubid].memberList[memberList.length-1];
        clubPlayers[_clubid].m_idx[memberList[memberList.length-1]] = clubPlayers[_clubid].m_idx[m];
        clubPlayers[_clubid].m_idx[m] = 0;
        clubPlayers[_clubid].memberList.length--;
        playerClubPop(_clubid,m);
        return true;
    }
    //用户俱乐部列表删除俱乐部
    function playerClubPop(uint64 _clubid,address _player)internal returns(bool){
        uint idx = myclubs[_player].c_idx[_clubid];//
        if(idx >= myclubs[_player].clublist.length || myclubs[_player].clublist[idx] != _clubid){
            return true;
        }
        uint length = myclubs[_player].clublist.length;
        uint64 last_cid = myclubs[_player].clublist[length -1];

        myclubs[_player].clublist[idx] = last_cid;
        myclubs[_player].c_idx[_clubid] = 0;
        myclubs[_player].c_idx[last_cid] = idx;
        myclubs[_player].clublist.length--;
        return true;
    }

    function playerClubPush(uint64 _clubid,address _player)internal returns(bool){
        uint idx = myclubs[_player].c_idx[_clubid];
        uint length = myclubs[_player].clublist.length;
        if(length>0 && myclubs[_player].clublist[idx] == _clubid){
            return true;
        }

        
        myclubs[_player].clublist.push(_clubid);
        myclubs[_player].c_idx[_clubid] = length;
        return true;
    }
}