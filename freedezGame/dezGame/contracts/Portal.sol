pragma solidity ^0.5.1;
contract Portal {
    function applyCode(string memory _code,address player)public returns(string memory);
    function setCode(string memory _code,address player)public returns(string memory);
    function getCode(address player)public view returns(string memory,uint,uint,uint);
    function withdraw(address player)public returns(uint);
    function divide(address player,uint chips)public returns(bool);
    function Inviter(address player)public view returns(address);

    function gameToken()public view returns(address);
    function clubToken()public view returns(address);
    function gameContract() public view returns(address);
    function promoToken() public view returns(address);
    function setgameContract(address addr) public returns(bool);
    function setClubContract(address addr) public returns(bool);
}

