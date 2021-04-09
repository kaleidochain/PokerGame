pragma solidity ^0.5.0;
//一些底层调用的代码
import './Event.sol';
import './RLPEncode.sol';
import './TokenAbi.sol';
import './ServerAbi.sol';
contract dezInit  is Event{
    string public version ="1.0.1";
    function creatSysTable() public returns(bool) {
        for(uint i = 0;i < sysTables.length;i++){
        //for(uint i = 0;i < 3;i++){
            uint64 tableid = sysTables[i];
            if(tableid == 0 || Tables[tableid].currentStatus == TableStatus.STARTED){
                if(i==0){
                    tableid = testPop(100);
                    Tables[tableid].tbNum = tableid;
                    Tables[tableid].buyinMin = 4000;
                    Tables[tableid].buyinMax = 40000;
                    Tables[tableid].smallBlind = 100;
                }else if(i==1){
                    tableid = testPop(10000);
                    Tables[tableid].tbNum = tableid;

                    Tables[tableid].buyinMin = 400000;
                    Tables[tableid].buyinMax = 4000000;
                    Tables[tableid].smallBlind = 10000;
                }else if(i==2){
                    tableid = sysPop(5);
                    Tables[tableid].tbNum = tableid;

                    Tables[tableid].buyinMin = 200;
                    Tables[tableid].buyinMax = 2000;
                    Tables[tableid].smallBlind = 5;
                }else if(i==3){
                    tableid = sysPop(25);
                    Tables[tableid].tbNum = tableid;

                    Tables[tableid].buyinMin = 1000;
                    Tables[tableid].buyinMax = 10000;
                    Tables[tableid].smallBlind = 25;
                }else if(i==4){
                    tableid = sysPop(100);
                    Tables[tableid].tbNum = tableid;

                    Tables[tableid].buyinMin = 4000;
                    Tables[tableid].buyinMax = 40000;
                    Tables[tableid].smallBlind = 100;
                }else if(i==5){
                    tableid = sysPop(500);
                    Tables[tableid].tbNum = tableid;

                    Tables[tableid].buyinMin = 200000;
                    Tables[tableid].buyinMax = 2000000;
                    Tables[tableid].smallBlind = 500;
                }else if(i==6){
                    tableid = sysPop(2500);
                    Tables[tableid].tbNum = tableid;

                    Tables[tableid].buyinMin = 100000;
                    Tables[tableid].buyinMax = 1000000;
                    Tables[tableid].smallBlind = 2500;
                }else if(i==7){
                    tableid = sysPop(10000);
                    Tables[tableid].tbNum = tableid;

                    Tables[tableid].buyinMin = 400000;
                    Tables[tableid].buyinMax = 4000000;
                    Tables[tableid].smallBlind = 10000;
                }else if(i==8){
                    tableid = sysPop(50000);
                    Tables[tableid].tbNum = tableid;

                    Tables[tableid].buyinMin = 2000000;
                    Tables[tableid].buyinMax = 20000000;
                    Tables[tableid].smallBlind = 50000;
                }
                if(ServerAbi(addrs['inter']).select(tableid,1)==0){
                    return false;
                }
                sysTables[i] = tableid;
                Tables[tableid].tbNum = tableid;
                Tables[tableid].players = new address[](9);
                if(Tables[tableid].currentHand == 0){
                    Tables[tableid].currentHand = 1;
                }
                Tables[tableid].preStarterPos = -1;
                Tables[tableid].minimum = 2;
                Tables[tableid].maximum = 9;

            }
        }
        return true;
    }


        //取一个自由桌id,没有回收取新的
    function sysPop(uint smallBlind) public returns(uint64 tableid){
        uint64[] storage pool = sysPool[smallBlind];
        if(pool.length == 0){
            sysTableid++;
            return sysTableid;
        }
        tableid = pool[pool.length - 1];
        pool.length--;
    }
    function testPop(uint smallBlind) public returns(uint64 tableid){
        uint64[] storage pool = testPool[smallBlind];
        if(pool.length == 0){
            testTableid++;
            return testTableid;
        }
        tableid = pool[pool.length - 1];
        pool.length--;
        return tableid;
    }
}
