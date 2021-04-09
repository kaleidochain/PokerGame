//truffle exec ./rate/rate.js --network test
var https = require("https");
//var utils = require('ethereumjs-util');
var HDWalletProvider = require("truffle-hdwallet-provider");
var register = artifacts.require("registerInterface");
var portal = artifacts.require("Portal")
var Token = artifacts.require("Gametoken")
var network = ""
for(var i=0;i<process.argv.length-1;i++){
    if(process.argv[i]=="--network"){
        network = process.argv[i+1];
        break;
    }
}
var host = ""
var registerAddress = "0x2ce224cad729c63c5cdf9ce8f2e8b5b8f81ec7b4"
if(network== "product"){
    host="http://106.75.184.214:8547";
} else if(network == "testnet"){
    host = "http://192.168.0.211:8545";
} else if(network == "testnet2"){
    host = "http://192.168.0.212:8545";
} else if(network == "testnet3"){
    host = "http://192.168.0.213:8545";
}else if(network == "testnet4"){
    host = "http://192.168.0.214:8545";
}else if(network == "mainnet"){
    host = "http://192.168.0.214:8545";
    registerAddress = "";
}else {
    host = "http://127.0.0.1:8545";
}

var wallets = {
    "0x7eff122b94897ea5b0e2a9abf47b86337fafebdc":new Buffer("0ce9f0b80483fbae111ac7df48527d443594a902b00fc797856e35eb7b12b4be","hex"), //eth.accounts[0]
    "0x2063d0a0f15a03abd1a3d15601294e3dcb79518b":new Buffer("c66a89cba97914a11da0fe31a8dfaa13bb624efd8b7a59e03397cf3805a4931e","hex"), //eth.accounts[1]
    "0xf9e3a40adf8c6bdecc34dfee57eea62a0edd9d6d":new Buffer("f512940f1e67b82c92d3ff7413212a89a5fd7fab62339fea69f34f55a83fa6bd","hex"), //eth.accounts[2]
    "0x0557d37d996b123fc1799b17b417a6e5d6773038":new Buffer("f1375feeb6aef1838f7e7ef448fe3308e17884fe334e92aa71a5e1642a394768","hex"), //eth.accounts[3]
    "0x1805b7ee5dd340981628b81d5d094c44a027bdc5":new Buffer("971dc4a4e2793bc1b094c0716d8507f9896c03b1f524e354f33aa8f9d2897347","hex"), //eth.accounts[4]
    "0x197383d00ccdfb0fbdeccc14006b3fc096578bb6":new Buffer("f484275631f47849b769267c72d73e9fbb0fcc5445ac1052f5bc30a912b0fd8a","hex"), //eth.accounts[5]
    "0x28b8d733800ffb64a41eaa59470917a96aab51f0":new Buffer("067a1d264d142656d5a70c052f9cf90c35d01da9893d3af2ba49274717f9c340","hex"), //eth.accounts[6]
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
var provider = new HDWalletProvider(_prikeys, host,0,_prikeys.length);

var rate = 0; //当前汇率
module.exports = async function(exit) {
    register.setProvider(provider);
    portal.setProvider(provider);
    Token.setProvider(provider);

    register = await register.at("0x2ce224cad729c63c5cdf9ce8f2e8b5b8f81ec7b4");
    var portalAddress = await register.get("pointPortal");
    if(emptyaddress(portalAddress)){
        console.log("dezPotal empty");
        exit(0);
    }
    portal = await portal.at(portalAddress);

    var tokenAddress = await portal.gameToken();
    if(emptyaddress(tokenAddress)){
        console.log("tokenAddress empty");
        exit(0);
    }
//    console.log(tokenAddress)
    token = await Token.at(tokenAddress);
    rate = await token.rate()
    console.log("now rate",rate.toString())
    
    updateRate()
    //console.log("end")
    //exit(0)
}
async function updateRate(){
    await sleep(10*1000) //休眠
    var tokenAddress = await portal.gameToken();
    if(emptyaddress(tokenAddress)){
        console.log("tokenAddress empty");
        updateRate();
        return;
    }
    token = await Token.at(tokenAddress);
    rate = await token.rate()
    
    try{
        //tokenAddress = await portal.gameToken();
        //token = await Token.at(tokenAddress);
        
        //rate = await token.rate()
        var req = https.get('https://openapi.digifinex.vip/v3/ticker?symbol=kal_usdt',  function(res) {
            var resData = "";
            res.on("data",function(data){
                resData += data;
            });
            res.on("error",function(data){
                console.log("error",data)
            });
            res.on("end", async function() {
                //console.log(resData)
                await callback(JSON.parse(resData));
            });
        })
        req.on('error', function (e) {
            console.log(e)
            updateRate()
        });
    
    } catch(e){
        console.log("catch",e)
        updateRate()
    }
  
}
async function callback(jsonData){
    try{
        if (jsonData.code != 0){
            console.log("code != 0\r")
            return
        }
        if (jsonData.ticker.length == 0){
            console.log("ticker error")
            return;
        }
        var last = jsonData.ticker[0].last;
        last = last*1e20;
        
        //console.log(getDate(jsonData.date ),"last:",last,"rate:",rate.toString())
        if(last == rate){
            updateRate()
            return;
        }
        var rateAddr = await token.rateAddress()
        var receipt = await token.setRate(last,{from:rateAddr})
        
        console.log("success",await token.rate()*1)
        rate = await token.rate()
        updateRate()
    } catch(e){
        console.log("catch",e)
        updateRate()
    }
}
function emptyaddress(address){
    if(address == "" || address== "0x" || address=="0x0000000000000000000000000000000000000000"){
        return true;
    }
    return false;
}
function getDate(t){
    var date = new Date(t * 1000);
    return date;

}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}