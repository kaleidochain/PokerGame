pragma solidity >=0.4.21 <0.6.0;

contract ServerAbi {
    function select(uint tableId, uint number) public returns(uint);
    function reSelect(uint tableId, uint number) public returns(uint);
    function reSelect2(uint tableId, uint number) public returns(uint);
    function getSelected(address roomAddr, uint tableId) public view returns(address[] memory);
    function getTableNeedPayFee(address roomAddr, uint tableId) public view returns(address[] memory, uint[] memory);
    function release(uint tableid) public;
    function payFee(address roomAddr, uint tableId, address[] memory serverAddrs, uint[] memory fees) public payable returns(bool);
    function payOne(address roomAddr, uint tableId, address serverAddr) public payable returns(bool);
    function getServerInfo(address addr) public view returns(address, string memory, uint, uint, uint);
    function numberOfServers() public view returns(uint);
}