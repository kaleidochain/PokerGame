var register       = artifacts.require("./registerInterface");
var authority      = artifacts.require("./AuthorityInterface");
var portal         = artifacts.require("./Portal");
var MAIN           = artifacts.require("./Main");
var CLUB           = artifacts.require("./club");
var DEZCHIPS       = artifacts.require("./dezChips");
var DEZCOMMON      = artifacts.require("./dezCommon");
var DEZCREATE      = artifacts.require("./dezCreate");
var DEZINIT        = artifacts.require("./dezInit");
var DEZNOTARIZE    = artifacts.require("./dezNotarize");
var DEZFLOWCONTROL = artifacts.require("./dezFlowControl");
var DEZSETTLE      = artifacts.require("./dezSettle");
var DEZSTART       = artifacts.require("./dezStart");
var DEZVIEW        = artifacts.require("./dezView");
var gameToken      = artifacts.require("./TokenAbi");
var v = false;
var MAINV=v,CLUBV=v,CHIPSV=v,COMMONV=v,CREATEV=v,INITV=v,NOTARIZEV=v,FLOWCONTROLV=v,SETTLEV=v,STARTV=v,VIEWV=v;
//需要更新哪个合约
//MAINV=1;
//COMMONV=1;
//SETTLEV=1;
//CHIPSV=1;
//CREATEV=1;
//VIEWV=1;
//NOTARIZEV=1;
//FLOWCONTROLV=1;
//STARTV=1;
//CLUBV=1;
//需要添加的白名单列表
var whitelist=[
    "0x28b8D733800Ffb64A41EaA59470917a96AAB51F0"
];
module.exports = function(deployer, network, accounts) {
    register.setProvider(deployer.provider);
    portal.setProvider(deployer.provider);
    authority.setProvider(deployer.provider);
    var main,club,dezchips,dezcommon,dezcreate,dezinit,deznotarize,dezflowcontrol,dezsettle,dezstart,dezview;
    deployer.then(function() {
        return deployer.deploy(MAIN);
    }).then(function(instance) {
        main = instance;
        return deployer.deploy(CLUB);
    }).then(function(instance) {
        club = instance;
        return deployer.deploy(DEZCHIPS);
    }).then(function(instance) {
        dezchips = instance;
        return deployer.deploy(DEZCOMMON);
    }).then(function(instance) {
        dezcommon = instance;
        return deployer.deploy(DEZCREATE);
    }).then(function(instance) {
        dezcreate = instance;
        return deployer.deploy(DEZINIT);
    }).then(function(instance) {
        dezinit = instance;
        return deployer.deploy(DEZFLOWCONTROL);
    }).then(function(instance) {
        dezflowcontrol = instance;
        return deployer.deploy(DEZNOTARIZE);
    }).then(function(instance) {
        deznotarize = instance;
        return deployer.deploy(DEZSETTLE);
    }).then(function(instance) {
        dezsettle = instance;
        return deployer.deploy(DEZSTART);
    }).then(function(instance) {
        dezstart = instance;
        return deployer.deploy(DEZVIEW);
    }).then(async function(instance) {
        dezview = instance;
        var registerAddress="0xD390BCA8Fc4BD4597F879cB2E75E784D6F97eD54";
        if(network=="mainet"){
            registerAddress="0x2d131543A52DC69252d298c186BbE1032E6784C7";
        } else if(network=="product"){
            registerAddress="0xD390BCA8Fc4BD4597F879cB2E75E784D6F97eD54";
        }
        register = await register.at(registerAddress);
        portalAddr = await register.get("pointPortal");

        if(emptyaddress(portalAddr)){
            console.log("empry portal");
            return
        }
        console.log("portalAddr", portalAddr);
        portal = await portal.at(portalAddr);
        var mainAddr = await portal.gameContract();
        console.log("mainAddr", mainAddr)

        if(MAINV || emptyaddress(mainAddr)){
            var tx = await portal.setgameContract(main.address)
            console.log("set gameContract", tx.tx);
        } else {
            MAIN.setProvider(deployer.provider);
            main = await MAIN.at(mainAddr);
        }
        var portalAddr2 = await main.get("portal");
        console.log("main.get(portal)", portalAddr2, "portal.address", portal.address);
        if(portalAddr2 != portal.address){
            var tx = await main.set("portal",portal.address);
            console.log("set portal:",tx.tx)
        }

        var InterManager = await register.get("InterManager");
        var NotaryManager = await register.get("NotaryManager");
        var interAddr = await main.get("inter"); 
        console.log("main.get(inter)",interAddr, "register.get(InterManager)", InterManager);
        //inter
        if(InterManager != interAddr){
            var tx = await main.set("inter", InterManager);
            console.log("inter",tx.tx)
        }
        //notary
        var notaryAddr = await main.get("notary");
        console.log("main.get(notary)",notaryAddr, "register.get(NotaryManager)", NotaryManager);
        if(NotaryManager != notaryAddr){
            var tx = await main.set("notary", NotaryManager);
            console.log("notary",tx.tx)
        }
        //俱乐部
        var clubAddr = await portal.clubToken();
        var clubAddr2 = await main.get("club");
        console.log("main.get(club)",clubAddr2, "portal.clubToken()", clubAddr);
        if(CLUBV || emptyaddress(clubAddr)){
            var tx = await main.set("club", club.address);
            console.log("main.set(club)", club.address, tx.tx)
            tx = await portal.setClubContract(club.address);
            console.log("portal.setClubContract", tx.tx)
            tx = await club.setportalAddress(portal.address);
            console.log("club.setportalAddress", portal.address, tx.tx)
        } else if(clubAddr != clubAddr2){
            var tx = await main.set("club", clubAddr);
            console.log("main.set(club)", clubAddr, tx.tx)
        }
        var tokenAddr = await portal.gameToken();
        var tokenAddr2 = await main.get("token");
        console.log("main.get(token)", tokenAddr2, "portal.gameToken()", tokenAddr);
        if(tokenAddr != tokenAddr2){
            var tx = await main.set("token",tokenAddr);
            console.log("main.set(token)",tx.tx)
            gameToken = await gameToken.at(tokenAddr);
            var owner = await gameToken.owner();
            console.log("gameToken owner", owner, "main.address", main.address);
            tx = await gameToken.setRoomMgr(main.address, {gas:1000000});
            console.log("gameToken.setRoomMgr", tx.tx);
        }

        var chipsAddr = await main.get("chips");
        console.log("chips",chipsAddr)
        if(CHIPSV || emptyaddress(chipsAddr)){
            var tx = await main.set("chips", dezchips.address);
            console.log("main.set(chips)", dezchips.address, tx.tx)
        }

        var Addr = await main.get("common");
        console.log("common",Addr)
        if(COMMONV || emptyaddress(Addr)){
            var tx =  await main.set("common", dezcommon.address);
            console.log("main.set(common)", dezcommon.address, tx.tx)
        }

        var Addr = await main.get("create");
        console.log("create",Addr)
        if(CREATEV || emptyaddress(Addr)){
            var tx = await main.set("create", dezcreate.address);
            console.log("main.set(create)", dezcreate.address, tx.tx)
        }
        var Addr = await main.get("init");
        console.log("init",Addr)
        if(INITV || emptyaddress(Addr)){
            console.log("init 2",dezinit.address)
            var tx = await main.set("init", dezinit.address);
            console.log("main.set(init)", dezinit.address, tx.tx)
        }
        var Addr = await main.get("notarize");
        console.log("notarize",Addr)
        if(NOTARIZEV || emptyaddress(Addr)){
            var tx = await main.set("notarize", deznotarize.address);
            console.log("main.set(notarize)", deznotarize.address, tx.tx)
        }
        var Addr = await main.get("flowcontrol");
        console.log("flowcontrol",Addr)
        if(FLOWCONTROLV || emptyaddress(Addr)){
            var tx = await main.set("flowcontrol", dezflowcontrol.address);
            console.log("main.set(flowcontrol)", dezflowcontrol.address, tx.tx)
        }
        var Addr = await main.get("settle");
        console.log("settle",Addr)
        if(SETTLEV || emptyaddress(Addr)){
            var tx = await main.set("settle", dezsettle.address);
            console.log("main.set(settle)", dezsettle.address, tx.tx)
        }
        var Addr = await main.get("start");
        console.log("start",Addr)
        if(STARTV || emptyaddress(Addr)){
            var tx = await main.set("start", dezstart.address);
            console.log("main.set(start)", dezstart.address, tx.tx)
        }
        
        var Addr = await main.get("view");
        console.log("view",Addr)
        if(VIEWV || emptyaddress(Addr)){
            var tx = await main.set("view", dezview.address);
            console.log("main.set(view)", dezview.address, tx.tx)
        }
        //console.log( await main.PlayedTables.call("0x1805b7ee5dd340981628b81d5d094c44a027bdc5",1));
        //console.log( await main.PlayedTables.call("0x55c92d88b837349478bC175B2c3A5FFDEa2056B0",1));
        //console.log(await main.PlayedTables.getData("0x1805b7ee5dd340981628b81d5d094c44a027bdc5",1));
        //dezchips,dezcommon,dezcreate,dezinit,deznotarize,dezsettle,dezstart,dezview
        //COMMONV=v,CREATEV=v,INITV=v,NOTARIZEV=v,SETTLEV=v,STARTV=v,VIEWV=v;
        authority = await authority.at("0x1000000000000000000000000000000000000003");
        var owner = deployer.provider.addresses[0];
        console.log("owner", owner);
        for (var i = 0; i < whitelist.length; i++) {
			var iswhite = await authority.isWhite(owner,whitelist[i]);
			console.log(whitelist[i], "before addwhite", iswhite)
			if(!iswhite){
				await authority.addWhite(whitelist[i]);
                var iswhite = await authority.isWhite(owner, whitelist[i]);
                console.log(whitelist[i], "after addwhite", iswhite)
            }
		}

    });
};

function emptyaddress(address){
    if(address.length != 42 || address == "" || address== "0x" || address=="0x0000000000000000000000000000000000000000"){
        return true;
    }
    return false;
}
