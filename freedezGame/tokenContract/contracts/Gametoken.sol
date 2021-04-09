pragma solidity >=0.4.21 <0.6.0;
library  SafeMath {
    uint256 constant public MAX_UINT256 =
    0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

    function add(uint x, uint y) internal pure  returns (uint256 z) {
        if (x > MAX_UINT256 - y) revert("add error");
        return x + y;
    }

    function sub(uint x, uint y) internal pure  returns (uint256 z) {
        if (x < y) revert("sub error");
        return x - y;
    }

    function mul(uint x, uint y) internal pure  returns (uint256 z) {
        if (y == 0) return 0;
        if (x > MAX_UINT256 / y) revert("mul error");
        return x * y;
    }
}

contract ContractReceiver {
    function tokenFallback(address _from, uint _value, bytes memory _data)public;
}

import "./LibAuthority.sol";
contract Gametoken is LibAuthority{
    using SafeMath for uint;
    //erc223
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Test(uint to,uint value);
    mapping(address => uint) balances;

    string public name;
    string public symbol  = "GOLD";
    uint8  public decimals = 0;
    uint256 public totalSupply;
    address public owner;
    //erc223 end

    //game
    address public tokenAddress;            //游戏用的token地址
    mapping(address => bool) public games;   //游戏合约
    address public tableMgrAddr;
    address public authorityAddress;    //权限合约地址
    //mapping(address => bool) public transactor; //允许transfer交易的用户

    uint public rate = 2e18; //汇率1kal = rate/1e18 金币
    address public rateAddress;
    //game end
    constructor(string memory _name)public payable{
        name = _name;
        rateAddress = msg.sender;
        balances[msg.sender] = msg.value.mul(rate)/1e18/1e18;
        totalSupply = balances[msg.sender];
        owner = msg.sender;
        setMaxGasPrice(1e11);
        setGasLimit(1e7);
        addWhite(msg.sender);
        //transactor[msg.sender] = true;
    }

    //kaleido转金币
    function ()external payable{
        if(msg.value == 0){
            return;
        }

        balances[msg.sender] = balances[msg.sender].add(msg.value.mul(rate)/1e18/1e18);
        totalSupply += msg.value*rate/1e18/1e18;
        addWhite(msg.sender);
    }
    //用户金币转Kal
    function exchangeKal(uint value)public returns(bool){
        balances[msg.sender] = balances[msg.sender] .sub(value);
        msg.sender.transfer(value.mul(1e36)/rate);
        if(balances[msg.sender] == 0){
            removeWhite(msg.sender);
        }
        emit Test(value,value.mul(1e36)/rate);
        return true;
    }
    
    function setRate(uint _rate)public returns(bool){
        require(msg.sender == rateAddress);
        require(_rate*10>rate && _rate<rate*10);
        rate = _rate;
        return true;
    }

    function setRateAddress(address _rateAddress)public returns(bool){
        require(msg.sender == owner);
        rateAddress =_rateAddress;
        return true;
    }

    
    // function setTransactor(address addr)public returns(bool){
    //     require(msg.sender == owner);
    //     transactor[addr] = true;
    //     return true;
    // }
    //erc223转账
    function transfer(address _to, uint _value)public returns(bool) {
        //require(transactor[msg.sender],"error transactor");
        uint codeLength;
        bytes memory empty;
        assembly {
            codeLength := extcodesize(_to)
        }

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        if(codeLength>0) {
            ContractReceiver receiver = ContractReceiver(_to);
            receiver.tokenFallback(msg.sender, _value, empty);
        }
        emit Transfer(msg.sender, _to, _value);
        addWhite(_to);
        return true;
    }
    //代币向当前合约转账通知
    function tokenFallback(address _from, uint _value, bytes memory _data) internal{
        require(msg.sender == tokenAddress,"错误代币转入");
        _data.length;
        balances[_from] = balances[_from].add(_value);
        totalSupply += _value;
        addWhite(_from);
    }

    function balanceOf(address _owner) public view returns(uint){
        return balances[_owner];
    }
    //game相关方法
    function setRoomMgr(address roomAddress) public returns(bool) {
        assert(msg.sender == owner);
        games[roomAddress] = true;
        return true;
    }
    
    function setTableMgr(address tableAddress) public returns(bool) {
        assert(msg.sender == owner);
        games[tableAddress] = true;

        return true;
    }
    //游戏合约调用
    function transferToken(address from, address to, uint value) public returns(bool) {
        require(games[msg.sender]);
        if(balances[from] < value){
            return false;
        }
        balances[from] = balances[from].sub(value);
        balances[to] = balances[to].add(value);
        return true;
    }

}
