//run:truffle exec ./test/gameTest.js --network testnet
var utils = require('ethereumjs-util');
var HDWalletProvider = require("truffle-hdwallet-provider");
var register = artifacts.require("registerInterface");
var authority = artifacts.require("AuthorityInterface");
var game = artifacts.require("Main");
var portal = artifacts.require("Portal");
var token = artifacts.require("TokenAbi");
var network = ""
for(var i=0;i<process.argv.length-1;i++){
    if(process.argv[i]=="--network"){
        network = process.argv[i+1];
        break;
    }
}


if(network== "product"){
    host="http://106.75.184.214:8547";
} else if(network == "testnet"){
    host = "http://106.75.184.214:8547";
} else if(network == "testnet2"){
    host = "http://192.168.0.212:8545";
} else if(network == "testnet3"){
    host = "http://192.168.0.213:8545";
}else if(network == "testnet4"){
    host = "http://192.168.0.214:8545";
}else {
    host = "http://127.0.0.1:8545";
}


var _prikeys=[
    "0ce9f0b80483fbae111ac7df48527d443594a902b00fc797856e35eb7b12b4be", //"0x7eff122b94897ea5b0e2a9abf47b86337fafebdc"
    "c66a89cba97914a11da0fe31a8dfaa13bb624efd8b7a59e03397cf3805a4931e", //"0x2063d0a0f15a03abd1a3d15601294e3dcb79518b":
    "f512940f1e67b82c92d3ff7413212a89a5fd7fab62339fea69f34f55a83fa6bd", //"0xf9e3a40adf8c6bdecc34dfee57eea62a0edd9d6d":
    "f1375feeb6aef1838f7e7ef448fe3308e17884fe334e92aa71a5e1642a394768", //"0x0557d37d996b123fc1799b17b417a6e5d6773038":
    "971dc4a4e2793bc1b094c0716d8507f9896c03b1f524e354f33aa8f9d2897347", //"0x1805b7ee5dd340981628b81d5d094c44a027bdc5":
    "f484275631f47849b769267c72d73e9fbb0fcc5445ac1052f5bc30a912b0fd8a", //"0x197383d00ccdfb0fbdeccc14006b3fc096578bb6":
    "067a1d264d142656d5a70c052f9cf90c35d01da9893d3af2ba49274717f9c340", //"0x28b8d733800ffb64a41eaa59470917a96aab51f0":
]
var accounts=[
    "0x1805b7ee5dd340981628b81d5d094c44a027bdc5",
    "0x28b8d733800ffb64a41eaa59470917a96aab51f0",
    "0x2063d0a0f15a03abd1a3d15601294e3dcb79518b",
    "0xf9e3a40adf8c6bdecc34dfee57eea62a0edd9d6d",
    "0x0557d37d996b123fc1799b17b417a6e5d6773038",
    "0x197383d00ccdfb0fbdeccc14006b3fc096578bb6",
    "0x7eff122b94897ea5b0e2a9abf47b86337fafebdc",
    "0x1c5fce68fb50f720f2790aefe7db402ed87dcb21",
    "0xe7fb28ea30bcef961ad6f8f89f58264b0acb9714",
    "0x109a31eed72d1623bb23ec9ea53b01d83ee13803",
    "0xf9062e77313a1a6ab67fafd697387a3430b4d881",
]
var wallets = {
    "0x7eff122b94897ea5b0e2a9abf47b86337fafebdc":new Buffer("0ce9f0b80483fbae111ac7df48527d443594a902b00fc797856e35eb7b12b4be","hex"), //eth.accounts[0]
    "0x2063d0a0f15a03abd1a3d15601294e3dcb79518b":new Buffer("c66a89cba97914a11da0fe31a8dfaa13bb624efd8b7a59e03397cf3805a4931e","hex"), //eth.accounts[1]
    "0xf9e3a40adf8c6bdecc34dfee57eea62a0edd9d6d":new Buffer("f512940f1e67b82c92d3ff7413212a89a5fd7fab62339fea69f34f55a83fa6bd","hex"), //eth.accounts[2]
    "0x0557d37d996b123fc1799b17b417a6e5d6773038":new Buffer("f1375feeb6aef1838f7e7ef448fe3308e17884fe334e92aa71a5e1642a394768","hex"), //eth.accounts[3]
    "0x1805b7ee5dd340981628b81d5d094c44a027bdc5":new Buffer("971dc4a4e2793bc1b094c0716d8507f9896c03b1f524e354f33aa8f9d2897347","hex"), //eth.accounts[4]
    "0x197383d00ccdfb0fbdeccc14006b3fc096578bb6":new Buffer("f484275631f47849b769267c72d73e9fbb0fcc5445ac1052f5bc30a912b0fd8a","hex"), //eth.accounts[5]
    "0x28b8d733800ffb64a41eaa59470917a96aab51f0":new Buffer("067a1d264d142656d5a70c052f9cf90c35d01da9893d3af2ba49274717f9c340","hex"), //eth.accounts[6]
}
var blacklist=[
	"0x75815ebcc39ce5321d24f7eaec378e6b15fccb56","0x1805b7ee5dd340981628b81d5d094c44a027bdc5", "0x28b8d733800ffb64a41eaa59470917a96aab51f0", "0x2063d0a0f15a03abd1a3d15601294e3dcb79518b","0xf9e3a40adf8c6bdecc34dfee57eea62a0edd9d6d", "0x0557d37d996b123fc1799b17b417a6e5d6773038", "0x197383d00ccdfb0fbdeccc14006b3fc096578bb6","0x7eff122b94897ea5b0e2a9abf47b86337fafebdc", "0xddd869c30cee2de33cbfdfe201b6dd6bdb45554d"
]
var provider = new HDWalletProvider(_prikeys, host,0,_prikeys.length);
var owner = null;
var A=4,B=1,C=2,D=3,E=4,F=5,G=6,H=7;
module.exports = async function(exit) {
	try{
        var ok = await init();
        if(!ok)exit(0);
        console.log("init success",portal.address,game.address);
//检查
        var tables = await game.getFreeTable();
        if(tables[0] == 0){
            console.log("gameContract 部署错误 自由桌创建失败");
            exit(0);
        }
        var tableid = tables[0]*1;
        var players = await game.getTablePlayers.call(tableid);
        if(players.length>0){
            console.log("桌子上有人");
            exit(0);
        }
        var tableinfo = await game.getTableInfo.call(tableid);
        var chips = tableinfo[8]*1;
        var hand = tableinfo[1]*1
//joinTable
        var receipt = await game.joinTable(tableid,chips,0,{from:accounts[A],gas:6000000});
        var pinfo = await game.getPlayerInfo.call(accounts[A]);
        if(pinfo[1]*1 == 0){console.log("A joinTable false",receipt.tx);exit(0);}

//joinTable
        var receipt = await game.joinTable(tableid,chips,2,{from:accounts[B],gas:6000000});
        var pinfo = await game.getPlayerInfo.call(accounts[B]);
        if(pinfo[1]*1 ==0){console.log("B joinTable false",receipt.tx);exit(0);}

//start
        var receipt = await game.start(tableid,hand,{from:accounts[A],gas:6000000});
        var pinfo = await game.getPlayerInfo.call(accounts[A]);
        if(pinfo[4]*1 != 5){console.log("A game.start false",receipt.tx);exit(0);}
//start 
        var receipt = await game.start(tableid,hand,{from:accounts[B],gas:6000000});
        var pinfo = await game.getPlayerInfo.call(accounts[B]);
        if(pinfo[4]*1 != 6){console.log("B game.start false",receipt.tx);exit(0);}

        console.log("tableid:",tableid);
//standup测试
        var receipt = await game.standup(true,{from:accounts[A],gas:6000000});
//结算离桌
        var settledata = await gen2(A,B);
        var receipt = await game.playerSettle("0x"+settledata[0].toString("hex")+settledata[1].toString("hex"),"0x00",{from:accounts[A],gas:6000000})
        var pinfo = await game.getPlayerInfo.call(accounts[A]);
        
        if(pinfo[4] == 3){
            console.log("standup success")
        } else {
            console.log("standup settle false",receipt.tx);
            exit(0);
        }

    //结尾
       // await game.leaveTable(1,{from:accounts[A],gas:6000000});
       // await game.leaveTable(1,{from:accounts[B],gas:6000000});
	} catch(e) {
		console.log(e)
	}
	exit(0);
  }

async function breakTableText(A,B){

}
async function gendiscard(B){
    var ainfo = await game.getPlayerInfo.call(accounts[B]);
    var tableid = ainfo[1]*1;
    var tbinfo = await game.getTableInfo.call(tableid);
    var hand = tbinfo[1]*1;

    // var tableid =await game.getPlayerInfo(accounts[B])[1].toString()*1
    // var hand =await game.getTableInfo(tableid)[1].toString()*1
    tableid = tableid.toString(16);
    hand = hand.toString(16);
    while(tableid.length<16){
        tableid ="0"+tableid;
    }
    while(hand.length<8){
        hand ="0"+hand;
    }
    data = game.address.substring(2)+tableid+hand
    //console.log(data)
    data = new Buffer(data,"hex")

    var hash = utils.keccak(data);
    //console.log(hash.toString("hex"))
    //console.log(accounts[B])
    var signB = utils.ecsign(hash,wallets[accounts[B]]);
    //console.log(signB )
    var signBbuf = Buffer.concat([signB["r"],signB["s"],utils.toBuffer(signB["v"])]);
    return "0x"+signBbuf.toString("hex");
}
async function gen1(A){
    var ainfo = await game.getPlayerInfo.call(accounts[A]);
    var tableid = ainfo[1]*1;
    var tbinfo = await game.getTableInfo.call(tableid);
    var hand = tbinfo[1]*1;
    var data = [game.address,tableid,hand,[ [0,1,100],[2,0,100]],0];
    console.log(data)
    var rlpdata = utils.rlp.encode(data);
    console.log(rlpdata)
    var hash = utils.keccak(rlpdata);

    var signA = utils.ecsign(hash,wallets[accounts[A]]);
    var signB = utils.ecsign(hash,wallets[accounts[B]]);
    
    var signAbuf = Buffer.concat([signA["r"],signA["s"],utils.toBuffer(signA["v"])]);
    //var signBbuf = Buffer.concat([signB["r"],signB["s"],utils.toBuffer(signB["v"])]);
    //var signCbuf = Buffer.concat([signC["r"],signC["s"],utils.toBuffer(signC["v"])]);
   
    var signs = signAbuf;
    var ret=[];
    ret[0]=signs;
    ret[1]=rlpdata;
    return "0x"+ret[0].toString("hex")+ret[1].toString("hex");
}
async function gen2(A,B){
    var ainfo = await game.getPlayerInfo.call(accounts[A]);
    var binfo = await game.getPlayerInfo.call(accounts[B])
    var tableid = ainfo[1]*1;
    var tbinfo = await game.getTableInfo.call(tableid);
    var hand = tbinfo[1]*1;
    var aseat = ainfo[2]*1; //a桌子位置
    var bseat = binfo[2]*1; //b桌子位置

    var data=[game.address,tableid,hand,[[aseat,1,2],[bseat,0,2]],0];
    var rlpdata=utils.rlp.encode(data);
    var hash = utils.keccak(rlpdata);

    var signA = utils.ecsign(hash,wallets[accounts[A]]);
    var signB = utils.ecsign(hash,wallets[accounts[B]]);
    
    var signAbuf = Buffer.concat([signA["r"],signA["s"],utils.toBuffer(signA["v"])]);
    var signBbuf = Buffer.concat([signB["r"],signB["s"],utils.toBuffer(signB["v"])]);
    
    var signs = Buffer.concat([signAbuf,signBbuf]);
    var ret=[];
    ret[0]=signs;
    ret[1]=rlpdata;
    return ret;
}
async function leaveTable(){
    for(var i=0;i<accounts.length;i++){
        var pinfo = await game.getPlayerInfo.call(accounts[i]);
        if(pinfo[1]!=0) {
            await game.leaveTable(1,{from:accounts[i]});
        }
        pinfo = await game.getPlayerInfo.call(accounts[i]);
        if(pinfo[1]!=0) {
            console.log("账户",accounts[i],"离桌失败");
            return false;
        }
    }
    return true;
}
async function init(){
    register.setProvider(provider);
    authority.setProvider(provider);
    portal.setProvider(provider);
    game.setProvider(provider);
    token.setProvider(provider);

    register = await register.at("0x2ce224cad729c63c5cdf9ce8f2e8b5b8f81ec7b4");
    authority = await authority.at("0x1000000000000000000000000000000000000003");

    var portalAddress = await register.get("pointPortal");
    if(emptyaddress(portalAddress)){
        console.log("dezPotal empty");
        return false;
    }
    portal = await portal.at(portalAddress);

    var gameAddress = await portal.gameContract();
    if(emptyaddress(gameAddress)){
        console.log("gameAddress empty");
        return false;
    }
    game = await game.at(gameAddress);

    var tokenAddress = await portal.gameToken();
    if(emptyaddress(tokenAddress)){
        console.log("tokenAddress empty");
        return false;
    }
    token = await token.at(tokenAddress);

    var promotAddress = await portal.promoToken();
    if(emptyaddress(promotAddress)){
        console.log("promotAddress empty");
        return false;
    }
    owner = await game.owner();
    //var owner =  web3.currentProvider.addresses[0];
    return true;
}

function emptyaddress(address){
    if(address == "" || address== "0x" || address=="0x0000000000000000000000000000000000000000"){
        return true;
    }
    return false;
}
