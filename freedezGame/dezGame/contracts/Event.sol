pragma solidity ^0.5.0;
import './Dao.sol';
import './RLPEncode.sol';
contract Event is Dao{
    using RLPEncode for *;
    enum eventTy {empty,
    Join, AddChips,Start,Settle,NotarySettle,
    LeaveNext,CreateTable,ChangeSeat,LeaveTable,notaryDiscard,
    DismissTable,SelectInter,SubmitPoint,WithdrawChips,FinishNotary,
    SelectNotary,GameStart,newApprove,insure,notaryRmtins,standup}

    event gameEvent(uint8 indexed ty,uint64 indexed tableid,address indexed sender,uint64 hand,bytes data);
    event newApprove(uint64 indexed clubid,address player);
    event noticy(string data);
}
