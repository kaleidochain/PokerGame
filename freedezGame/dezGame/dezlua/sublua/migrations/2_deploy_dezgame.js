//var TableMgr = artifacts.require("./TableManager.sol");
var zlib = require('zlib');
var fs = require('fs');
var path = require('path');//解析需要遍历的文件夹

var register= artifacts.require("./registerInterface");
//var game = artifacts.require("./gameContract");
var portal = artifacts.require("./Portal")

var name = "luadezhou"; 
var version = "0.1.1";
var bootfile = "game.lua";
var filePath = path.resolve('../../');
module.exports = function(deployer, network, accounts) {
    if(network=="mainet"){
        registerAddress="0x2d131543A52DC69252d298c186BbE1032E6784C7";
    } else if(network=="testnet"){
        registerAddress="0xD390BCA8Fc4BD4597F879cB2E75E784D6F97eD54";
    } else if(network=="product"){
        registerAddress="0xD390BCA8Fc4BD4597F879cB2E75E784D6F97eD54";
    }
    register.setProvider(deployer.provider);
   

    deployer.then(async function(instance){
        register = await register.at(registerAddress);
        var portalAddress = await register.get("pointPortal");
        portal = await portal.at(portalAddress);
        await portal.setLua("gameLua",name,version,bootfile);
        
        var readDir = fs.readdirSync(filePath);
        var total = 0;
        for(var i=0;i<readDir.length;i++){
            filename = readDir[i];
            if (filename == ".DS_Store" || filename.substring(filename.length - 4) != ".lua") {
                continue;
            }

            var filedir = path.join(filePath, filename);
            //根据文件路径获取文件信息，返回一个fs.Stats对象
            stats = await fs.statSync(filedir)
            if(stats.isDirectory()){
                continue;
            }
            var content = fs.readFileSync(filedir, 'utf-8');

            buff = zlib.deflateSync(content);
    
            if (buff.length > 32000) {
                console.log("file ",filename,"too large",buff.length)
                exit(1)
            }
           
            portal.sendTransaction({data:"0x"+buff.toString("hex")}).then(function(filename){
                return function(receipt){
                    console.log(filename,receipt.tx);
                    portal.setfile("gameLua",filename,receipt.tx)
                }
            }(filename))
            total = total + 1;
        }

        var len = await portal.length("gameLua")
        while(len.toString()*1 != total){
            //console.log(len.toString()*1,readDir.length)
            len = await portal.length("gameLua")
        }
       // console.log(len.toString()*1)
    });
};

