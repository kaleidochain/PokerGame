pragma solidity ^0.5.0;

contract clubabi {
    function clubOwner(uint64 _clubid) public view returns(address);
    function isClubMember(uint64 _clubid,address _player) public view returns(bool);
    function myClubs(address addr) public view returns(uint64[] memory);
}
