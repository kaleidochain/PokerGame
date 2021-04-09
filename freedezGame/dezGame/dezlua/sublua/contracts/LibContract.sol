pragma solidity >=0.4.21 <0.7.0;

contract registerInterface{
    //注册合约
    function set(string memory _name, address _contract) public;
    //获取合约
    function get(string memory _name)public view returns (address);
    
}
contract gameContract{
    function owner() public view returns(address);
    function setluaAddress(address addr) public returns(bool);
    function luaAddress() public returns(address);
}