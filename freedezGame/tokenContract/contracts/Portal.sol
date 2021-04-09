pragma solidity >=0.4.21 <0.6.0;

contract Portal {
    address public gameContract; //游戏合约
    address public promoToken;  //活动合约
    address public gameToken;   //代币合约
    address public clubToken;
    address public owner;
    event NewGame(address gameAddress);
    event NewClub(address clubAddress);
    constructor()public{
      owner = msg.sender;
    }
    function()external{}
    modifier onlyOwner {
        assert(msg.sender == owner);
        _;
    }
    function setClubContract(address addr) public onlyOwner returns(bool){
        clubToken = addr;
        emit NewClub(addr);
        return true;
    }
    function setgameContract(address addr) public onlyOwner returns(bool){
        gameContract = addr;
        emit NewGame(addr);
        return true;
    }

    function setpromoToken(address addr) public onlyOwner returns(bool){
      promoToken = addr;
      return true;
    }

    function setgameToken(address addr) public onlyOwner returns(bool){
      gameToken = addr;
      return true;
    }

//保存游戏相关lua脚本
    struct lua {
      string name;
      string version;
      string bootfile;
      uint update;  //部署高度
      string[] filenames;   //filename列表;
      mapping(bytes32 => string) files; // hash(filename)=>txhash
    }
    mapping(string => lua) Luas; //所有lua脚本项目

    function setLua(string memory _type,string memory _name,string memory _version,string memory _bootfile) public onlyOwner returns(bool){
        Luas[_type].name = _name;
        Luas[_type].version = _version;
        Luas[_type].update = block.number;
        Luas[_type].bootfile = _bootfile;
        delete Luas[_type].filenames;
        return true;
    }

    function name(string memory _type)public view returns(string memory){
      return Luas[_type].name;
    }
    
    function version(string memory _type)public view returns(string memory){
      return Luas[_type].version;
    }
    function bootfile(string memory _type)public view returns(string memory){
      return Luas[_type].bootfile;
    }
    function vhash(string memory _type)public view returns(address){
      return address(Luas[_type].update);
    }
    function setfile(string memory _type, string memory _filename, string memory _txhash) public onlyOwner returns(bool){
        bytes32 _key = sha256(bytes(_filename));
        Luas[_type].files[_key] = _txhash;
        Luas[_type].filenames.push(_filename);
        return true;
    }

    function txhashs(string memory _type,string memory _filename) public view returns(string memory){
        bytes32 key = sha256(bytes(_filename));
        return Luas[_type].files[key];
    }

    function length(string memory _type)public view returns(uint64){
        return uint64(Luas[_type].filenames.length);
    }

    function filebyindex(string memory _type,uint _index)public view returns(string memory){
        if(_index >= Luas[_type].filenames.length) return "";
        return Luas[_type].filenames[_index];
    }

//代理相关存储
    mapping (address => address) public Inviter;   // 邀请人
    mapping (string => address) InviteCode;        // 邀请码>账户
    mapping (address => agent) public Agents;      // 代理人信息;
    struct agent {
        string  code;           // 邀请码
        uint    balance;        // 累计分成
        uint    withdraw;       // 已提取分成
        uint    num;            // 已邀请个数
    }
    modifier onlyGame {
        assert(msg.sender == gameContract);
        _;
    }
    //申请邀请码
    function applyCode(string memory _code,address player)public onlyGame returns(string memory){
        if(bytes(_code).length == 0){
            return "empty code";
        }
        if(InviteCode[_code] != address(0x0)){
            return "code already exist";
        }
        if(bytes(Agents[player].code).length != 0){
            return "agent already applied";
        }
        InviteCode[_code] = player;
        Agents[player].code = _code;
        return "";
    }

    //填写邀请人的邀请码
    function setCode(string memory _code,address player)public onlyGame returns(string memory){
        if(bytes(_code).length == 0){
            return "empty code";
        }

        if(InviteCode[_code] == address(0x0) || Inviter[player] != address(0x0)){
            return "agent not exist";
        }
        if(InviteCode[_code] == player){
            return "Unable to fill in your own invitation code";
        }
        if( Inviter[InviteCode[_code]] == player || Inviter[Inviter[InviteCode[_code]]] == player){
            return "The inviter has an invitation relationship with you";
        }

        Inviter[player] = InviteCode[_code];
        Agents[InviteCode[_code]].num++;
        return "";
    }

    //查看自己邀请码(返回邀请码,累计收益,已提取收益,邀请总数)
    function getCode(address player)public view returns(string memory,uint,uint,uint){
        return (Agents[player].code,Agents[player].balance,Agents[player].withdraw,Agents[player].num);
    }

    //提取收益(剩余全部提取)
    function withdraw(address player)public onlyGame returns(uint){
        uint value = Agents[player].balance-Agents[player].withdraw;
        if (value == 0){
            return 0;
        }
        Agents[player].withdraw = Agents[player].balance;
        return value;
    }
    //分成
    function divide(address player,uint chips)public onlyGame returns(bool){
        Agents[player].balance += chips;
        return true;
    }
}

