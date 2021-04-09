//run:truffle exec ./test/example.js --network product
var utils = require('ethereumjs-util');
var HDWalletProvider = require("truffle-hdwallet-provider");
var register = artifacts.require("registerInterface");
var authority = artifacts.require("AuthorityInterface");
var game = artifacts.require("Main");
var portal = artifacts.require("Portal");
var token = artifacts.require("TokenAbi");
var club = artifacts.require("clubabi");
var mainc = artifacts.require("Main");
var fcm = artifacts.require("ServerAbi");

var network = ""
for(var i=0;i<process.argv.length-1;i++){
    if(process.argv[i]=="--network"){
        network = process.argv[i+1];
        break;
    }
}


if(network== "product"){
    host="http://106.75.184.214:9547";
}else if(network == "mainnet"){
    host = "https://api.kalscan.io/mainnet";
}else if(network == "testnet"){
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

console.log("host:",host);
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
	
        console.log("game info:");

        var registerAddress="0x2ce224cad729c63c5cdf9ce8f2e8b5b8f81ec7b4";
        if(network=="mainet"){
            registerAddress="0xf81a5b3abdcdc59f943011e5b093bc2820b313e0";
        } else if(network=="product"){
            registerAddress="0xD390BCA8Fc4BD4597F879cB2E75E784D6F97eD54";
        }

        register = await register.at(registerAddress);
        portalAddr = await register.get("pointPortal");

        console.log("portalAddr:",portalAddr);

        var InterManager = await register.get("InterManager")
        var NotaryManager = await register.get("NotaryManager")

        console.log("InterManager:",InterManager);
        console.log("NotaryManager:",NotaryManager);

        fcm = await fcm.at(InterManager);
       
        

        portal = await portal.at(portalAddr);
        var mainAddr = await portal.gameContract();
        console.log("mainAddr",mainAddr)
       
        mainc = await mainc.at(mainAddr);
        //var clubAddr = await mainc.clubToken();
        console.log("mainc.address",mainc.address)

        var fcs1 = await fcm.getSelected(mainc.address,4222124650659841)
        var fcs2 = await fcm.getSelected(mainc.address,4222124650659842)
        var fcs3 = await fcm.getSelected(mainc.address,3940649673949186)
        var fcs4 = await fcm.getSelected(mainc.address,3940649673949192)
                 
        console.log("4222124650659841 fcs1",fcs1)
        console.log("4222124650659842 fcs2",fcs2)
        console.log("3940649673949186 fcs3",fcs3)
        console.log("3940649673949192 fcs4",fcs4)

        var tokenaddr = await mainc.get("token");

        console.log("tokenaddr",tokenaddr)

        var clubAddr = await portal.clubToken();
        console.log("clubAddr",clubAddr)

        var tokenAddr = await portal.gameToken()
        console.log("tokenAddr",tokenAddr)

        var promoTokenAddr = await portal.promoToken()
        console.log("promoTokenAddr",promoTokenAddr)

        //console.log("portal",portal)
        //var gametype="gameLua"
        //var filenum = await portal.length(gametype);
        //console.log("file num",filenum)

        console.log("game info  end:");

        



}
